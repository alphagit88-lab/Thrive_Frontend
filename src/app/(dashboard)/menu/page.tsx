'use client';

import { useEffect, useState, useRef, startTransition, useCallback } from 'react';
import Image from 'next/image';
import { menuService } from '@/services/menu.service';
import { settingsService } from '@/services/settings.service';
import { MenuItem, MenuItemForm, FoodCategory, FoodType, Specification, CookType } from '@/types';
import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import { Plus, MoreVertical, Upload, X, Pencil, Trash2, Save } from 'lucide-react';

export default function MenuPage() {
  const [locationId, setLocationId] = useState<string>('');
  const hasInitialized = useRef(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [editingItems, setEditingItems] = useState<Record<string, MenuItemForm>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const subTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'menu', label: 'Menu' },
    { id: 'list', label: 'List' },
    { id: 'add', label: 'Add' },
  ];

  // Load locationId from localStorage on client-side only (prevents hydration error)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const savedLocationId = localStorage.getItem('locationId');
      if (savedLocationId) {
        startTransition(() => {
          setLocationId(savedLocationId);
        });
      }
    }
  }, []);

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await menuService.getAll({ location_id: locationId, search });
      if (response.success && response.data) {
        // Deduplicate menu items by ID to prevent duplicate key errors
        // Use a Map to ensure true uniqueness
        const itemsMap = new Map<string, MenuItem>();
        response.data.forEach((item: MenuItem) => {
          if (!itemsMap.has(item.id)) {
            itemsMap.set(item.id, item);
          }
        });
        const uniqueItems = Array.from(itemsMap.values());
        setMenuItems(uniqueItems);
        // Initialize editing state for each item
        const editing: Record<string, MenuItemForm> = {};
        uniqueItems.forEach((item: MenuItem) => {
          editing[item.id] = {
            location_id: item.location_id,
            name: item.name,
            food_category_id: item.food_category_id || '',
            food_type_id: item.food_type_id || '',
            quantity: item.quantity || '',
            specification_id: item.specification_id || '',
            cook_type_id: item.cook_type_id || '',
            description: item.description || '',
            price: item.price,
            tags: item.tags || '',
            prep_workout: item.prep_workout || '',
            status: item.status,
            photos: item.photos?.map((p: { photo_url: string }) => p.photo_url) || [],
            ingredients: item.ingredients?.map((ing: { ingredient_id: string; ingredient_quantity_id?: string; custom_quantity?: string }) => ({
              ingredient_id: ing.ingredient_id,
              ingredient_quantity_id: ing.ingredient_quantity_id || undefined,
              custom_quantity: ing.custom_quantity || undefined,
            })) || [],
          };
        });
        setEditingItems(editing);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  }, [locationId, search]);

  useEffect(() => {
    if (locationId) {
      loadMenuItems();
      loadSettings();
    }
  }, [locationId, search, loadMenuItems]);

  const loadSettings = async () => {
    try {
      const [catRes] = await Promise.all([
        settingsService.categories.getAll(),
      ]);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useEffect(() => {
    // Load food types and cook types when category changes for any item
    const categoryIds = new Set(
      Object.values(editingItems)
        .map((item) => item.food_category_id)
        .filter(Boolean) as string[]
    );

    categoryIds.forEach((categoryId) => {
      Promise.all([
        settingsService.types.getAll(categoryId),
        settingsService.cookTypes.getAll(categoryId),
      ]).then(([typesRes, cookTypesRes]) => {
        if (typesRes.success && typesRes.data) {
          setFoodTypes((prev) => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map((ft) => ft.id));
            const newTypes = (typesRes.data || []).filter((ft) => !existingIds.has(ft.id));
            return [...prev, ...newTypes];
          });
        }
        if (cookTypesRes.success && cookTypesRes.data) {
          setCookTypes((prev) => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map((ct) => ct.id));
            const newCookTypes = (cookTypesRes.data || []).filter((ct) => !existingIds.has(ct.id));
            return [...prev, ...newCookTypes];
          });
        }
      });
    });
  }, [editingItems]);

  useEffect(() => {
    // Load specifications when food type changes
    const foodTypeIds = new Set(
      Object.values(editingItems)
        .map((item) => item.food_type_id)
        .filter(Boolean) as string[]
    );

    foodTypeIds.forEach((foodTypeId) => {
      settingsService.specifications.getAll(foodTypeId).then((response) => {
        if (response.success && response.data) {
          setSpecifications((prev) => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map((s) => s.id));
            const newSpecs = (response.data || []).filter((s) => !existingIds.has(s.id));
            return [...prev, ...newSpecs];
          });
        }
      });
    });
  }, [editingItems]);

  const handleItemChange = (itemId: string, field: keyof MenuItemForm, value: string | number | string[] | undefined) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        ...(field === 'food_type_id' && { specification_id: '' }), // Reset specification when food type changes
      },
    }));
  };

  const handleSave = async (itemId: string) => {
    try {
      const itemData = editingItems[itemId];
      if (!itemData.name?.trim()) {
        alert('Please enter a menu item name');
        return;
      }

      // Convert empty strings to null for foreign key fields to avoid validation errors
      const updateData: Partial<MenuItemForm> = {
        ...itemData,
        name: itemData.name.trim(),
        food_category_id: itemData.food_category_id || undefined,
        food_type_id: itemData.food_type_id || undefined,
        specification_id: itemData.specification_id || undefined,
        cook_type_id: itemData.cook_type_id || undefined,
        quantity: itemData.quantity || undefined,
        description: itemData.description || undefined,
        tags: itemData.tags || undefined,
        prep_workout: itemData.prep_workout || undefined,
        photos: itemData.photos || undefined,
      };

      await menuService.update(itemId, updateData);
      loadMenuItems();
    } catch (error) {
      console.error('Failed to update menu item:', error);
      alert('Failed to update menu item. Please check that all selected options are valid.');
    }
  };

  const handleAddNew = async () => {
    try {
      // Create with a default name to satisfy backend validation
      // Use undefined instead of empty strings for optional foreign key fields
      const newItem: MenuItemForm = {
        location_id: locationId,
        name: 'New Menu Item', // Default name that user can edit
        food_category_id: undefined,
        food_type_id: undefined,
        quantity: undefined,
        specification_id: undefined,
        cook_type_id: undefined,
        description: undefined,
        price: 0,
        tags: undefined,
        prep_workout: undefined,
        status: 'draft',
        photos: [],
        ingredients: [],
      };

      const response = await menuService.create(newItem);
      if (response.success && response.data) {
        loadMenuItems();
      }
    } catch (error) {
      console.error('Failed to create menu item:', error);
      alert('Failed to create menu item. Please try again.');
    }
  };

  const handleDeleteTag = (itemId: string, tagIndex: number) => {
    const item = editingItems[itemId];
    const tags = item.tags?.split(',').filter(Boolean) || [];
    tags.splice(tagIndex, 1);
    handleItemChange(itemId, 'tags', tags.join(','));
  };

  const handleAddTag = (itemId: string, tag: string) => {
    const item = editingItems[itemId];
    const tags = item.tags?.split(',').filter(Boolean) || [];
    if (tag.trim() && !tags.includes(tag.trim())) {
      tags.push(tag.trim());
      handleItemChange(itemId, 'tags', tags.join(','));
    }
  };

  const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const item = editingItems[itemId];
    const currentPhotos = item.photos || [];

    // Filter only image files
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files only.');
      e.target.value = '';
      return;
    }

    // Convert files to base64 data URLs
    const newPhotos: string[] = [];
    let processedCount = 0;
    const totalFiles = imageFiles.length;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
          processedCount++;

          // When all files are processed, update state
          if (processedCount === totalFiles) {
            handleItemChange(itemId, 'photos', [...currentPhotos, ...newPhotos]);
          }
        }
      };
      reader.onerror = () => {
        console.error('Failed to read file:', file.name);
        alert(`Failed to read file: ${file.name}`);
        processedCount++;
        if (processedCount === totalFiles && newPhotos.length > 0) {
          handleItemChange(itemId, 'photos', [...currentPhotos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (itemId: string, photoIndex: number) => {
    const item = editingItems[itemId];
    const photos = item.photos || [];
    photos.splice(photoIndex, 1);
    handleItemChange(itemId, 'photos', photos);
  };

  // Handle 3-dots menu click
  const handleMenuClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(openMenu === itemId ? null : itemId);
  };

  // Handle Edit - focus on the first input field
  const handleEdit = (itemId: string) => {
    setOpenMenu(null);
    // Focus on the name input field
    const nameInput = document.querySelector(`input[data-item-id="${itemId}"][data-field="name"]`) as HTMLInputElement;
    if (nameInput) {
      nameInput.focus();
    }
  };

  // Handle Update - save the current changes
  const handleUpdate = async (itemId: string) => {
    setOpenMenu(null);
    await handleSave(itemId);
  };

  // Handle Delete - remove the menu item
  const handleDelete = async (itemId: string) => {
    setOpenMenu(null);
    if (window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      try {
        await menuService.delete(itemId);
        loadMenuItems();
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item. It might be in use by orders.');
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenu(null);
    };

    if (openMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenu]);

  if (!locationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a location first</p>
      </div>
    );
  }

  const getItemCategory = (item: MenuItem) => {
    return categories.find((c) => c.id === item.food_category_id);
  };

  const getItemFoodTypes = (categoryId?: string) => {
    if (!categoryId) return [];
    return foodTypes.filter((ft) => ft.category_id === categoryId);
  };

  const getItemSpecifications = (foodTypeId?: string) => {
    if (!foodTypeId) return [];
    return specifications.filter((s) => s.food_type_id === foodTypeId);
  };

  const getItemCookTypes = (categoryId?: string) => {
    if (!categoryId) return [];
    return cookTypes.filter((ct) => ct.category_id === categoryId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menue</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Menu</p>
      </div>

      {/* Sub-navigation Tabs */}
      <Tabs tabs={subTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search and Add */}
      <div className="flex items-center gap-4 my-6">
        <input
          type="text"
          placeholder="Search for tags"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button onClick={handleAddNew} variant="primary">
          <Plus className="w-4 h-4 mr-2 inline" />
          ADD
        </Button>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading menu items...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems
            .filter((item, index, self) => self.findIndex((t) => t.id === item.id) === index) // Additional deduplication safeguard
            .map((item) => {
            const itemData = editingItems[item.id];
            if (!itemData) return null;

            const category = getItemCategory(item);
            const itemFoodTypes = getItemFoodTypes(item.food_category_id || undefined);
            const itemSpecifications = getItemSpecifications(itemData.food_type_id);
            const itemCookTypes = getItemCookTypes(item.food_category_id || undefined);
            const tags = itemData.tags?.split(',').filter(Boolean) || [];
            const prepWorkoutTags = itemData.prep_workout?.split(',').filter(Boolean) || [];

            return (
              <div key={`menu-item-${item.id}`} className="bg-white rounded-lg shadow p-6 relative">
                {/* Options Menu - 3 Dots */}
                <div className="absolute top-6 right-6">
                  <button
                    onClick={(e) => handleMenuClick(item.id, e)}
                    className="text-gray-400 hover:text-gray-600 relative z-10"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {/* Dropdown Menu */}
                  {openMenu === item.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Save className="w-4 h-4 mr-2" /> Update
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* ID Header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">
                    {(() => {
                      // Format display ID: display_id from DB is like "#001", we want "ID ##001"
                      if (item.display_id) {
                        // Remove any leading # characters and pad to 3 digits
                        const num = item.display_id.replace(/^#+/, '');
                        return `ID ##${num.padStart(3, '0')}`;
                      }
                      // Fallback: use index + 1 (temporary until display_id is set by trigger)
                      // Sort by created_at to get consistent ordering
                      const sortedItems = [...menuItems].sort((a, b) => 
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                      );
                      const index = sortedItems.findIndex((m) => m.id === item.id);
                      return `ID ##${String((index >= 0 ? index : sortedItems.length) + 1).padStart(3, '0')}`;
                    })()}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Name</label>
                    <input
                      type="text"
                      data-item-id={item.id}
                      data-field="name"
                      value={itemData.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Food Category */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Food Category</label>
                    <select
                      value={itemData.food_category_id || ''}
                      onChange={(e) => {
                        handleItemChange(item.id, 'food_category_id', e.target.value);
                        handleItemChange(item.id, 'food_type_id', '');
                        handleItemChange(item.id, 'specification_id', '');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Food Type */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Food type</label>
                    <select
                      value={itemData.food_type_id || ''}
                      onChange={(e) => {
                        handleItemChange(item.id, 'food_type_id', e.target.value);
                        handleItemChange(item.id, 'specification_id', '');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={!itemData.food_category_id}
                    >
                      <option value="">Select</option>
                      {itemFoodTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qty */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Qty</label>
                    <select
                      value={itemData.quantity || ''}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select</option>
                      <option value="100g">100g</option>
                      <option value="200g">200g</option>
                      <option value="300g">300g</option>
                      <option value="400g">400g</option>
                    </select>
                  </div>

                  {/* Specification */}
                  {category?.show_specification && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Specification</label>
                      <select
                        value={itemData.specification_id || ''}
                        onChange={(e) => handleItemChange(item.id, 'specification_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!itemData.food_type_id}
                      >
                        <option value="">Select</option>
                        {itemSpecifications.map((spec) => (
                          <option key={spec.id} value={spec.id}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Type of cook */}
                  {category?.show_cook_type && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Type of cook</label>
                      <select
                        value={itemData.cook_type_id || ''}
                        onChange={(e) => handleItemChange(item.id, 'cook_type_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select</option>
                        {itemCookTypes.map((cook) => (
                          <option key={cook.id} value={cook.id}>
                            {cook.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <textarea
                      value={itemData.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id={`photo-upload-${item.id}`}
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(item.id, e)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById(`photo-upload-${item.id}`)?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2 inline" />
                      UPLOAD PHOTOS
                    </Button>
                    {itemData.photos && itemData.photos.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {itemData.photos.map((photo, photoIdx) => (
                          <div key={photoIdx} className="relative group w-full h-20">
                            <Image
                              src={photo}
                              alt={`Photo ${photoIdx + 1}`}
                              fill
                              className="object-cover rounded border border-gray-300"
                              unoptimized={photo.startsWith('data:')}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(item.id, photoIdx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Price</label>
                    <input
                      type="number"
                      value={itemData.price || 0}
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={`${item.id}-tag-${idx}-${tag}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => handleDeleteTag(item.id, idx)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(item.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Menu Item Tags (Prep Workout) */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Menu Item</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {prepWorkoutTags.map((tag, idx) => (
                        <span
                          key={`${item.id}-prep-${idx}-${tag}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => {
                              const newTags = [...prepWorkoutTags];
                              newTags.splice(idx, 1);
                              handleItemChange(item.id, 'prep_workout', newTags.join(','));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add menu item tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const tag = e.currentTarget.value.trim();
                          if (tag && !prepWorkoutTags.includes(tag)) {
                            const newTags = [...prepWorkoutTags, tag];
                            handleItemChange(item.id, 'prep_workout', newTags.join(','));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      {menuItems.length > 0 && (
        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={() => {
              // Save all items
              Promise.all(menuItems.map((item) => handleSave(item.id)));
            }}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
