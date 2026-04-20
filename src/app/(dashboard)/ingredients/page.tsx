'use client';

import { useEffect, useState } from 'react';
import { ingredientsService } from '@/services/ingredients.service';
import { settingsService } from '@/services/settings.service';
import { Ingredient, FoodCategory, FoodType, Specification, CookType } from '@/types';
import Tabs from '@/components/Tabs';
import { Plus, MoreVertical, Pencil, Trash2, Save, Apple, Package } from 'lucide-react';

interface IngredientFormLocal {
  location_id: string;
  food_type_id: string;
  specification_ids: string[];
  cook_type_ids: string[];
  name: string;
  description: string;
  quantities: {
    quantity_value: string;
    quantity_grams?: number;
    price: number;
    is_available: boolean;
  }[];
}

export default function IngredientsPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const [locationId, setLocationId] = useState<string>('');

  const [formData, setFormData] = useState<IngredientFormLocal>({
    location_id: '',
    food_type_id: '',
    specification_ids: [],
    cook_type_ids: [],
    name: '',
    description: '',
    quantities: [
      { quantity_value: '100g', quantity_grams: 100, price: 0, is_available: true },
      { quantity_value: '200g', quantity_grams: 200, price: 0, is_available: true },
      { quantity_value: '300g', quantity_grams: 300, price: 0, is_available: true },
      { quantity_value: '400g', quantity_grams: 400, price: 0, is_available: true },
    ],
  });

  useEffect(() => {
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      setFormData(prev => ({ ...prev, location_id: savedLocationId }));
    }
  }, []);

  useEffect(() => {
    if (locationId) {
      loadData();
    }
  }, [locationId]);

  // Reload categories when page becomes visible (user navigates back from Settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        settingsService.categories.getAll().then((catRes) => {
          if (catRes.success && catRes.data) {
            setCategories(catRes.data);
            if (activeCategory && !catRes.data.find(c => c.id === activeCategory)) {
              if (catRes.data.length > 0) {
                setActiveCategory(catRes.data[0].id);
              }
            }
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeCategory]);

  useEffect(() => {
    if (formData.food_type_id) {
      loadSpecifications(formData.food_type_id);
    } else {
      setSpecifications([]);
    }
  }, [formData.food_type_id]);

  useEffect(() => {
    const category = categories.find((c) => c.id === activeCategory);
    if (category && locationId) {
      loadFoodTypes(category.id);
      loadCookTypes(category.id);
      ingredientsService.getAll({ category_id: category.id, location_id: locationId }).then((res) => {
        if (res.success && res.data) {
          setIngredients(res.data);
        }
      }).catch((error) => {
        console.error('Failed to load ingredients:', error);
      });
    }
  }, [activeCategory, categories, locationId]);

  const loadData = async () => {
    if (!locationId) return;
    try {
      const catRes = await settingsService.categories.getAll(locationId);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          const firstCategoryId = catRes.data[0].id;
          if (!activeCategory || !catRes.data.find(c => c.id === activeCategory)) {
            setActiveCategory(firstCategoryId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadFoodTypes = async (categoryId: string) => {
    try {
      const response = await settingsService.types.getAll(categoryId, locationId);
      if (response.success && response.data) {
        setFoodTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load food types:', error);
    }
  };

  const loadSpecifications = async (foodTypeId: string) => {
    try {
      const response = await settingsService.specifications.getAll(foodTypeId, locationId);
      if (response.success && response.data) {
        setSpecifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load specifications:', error);
    }
  };

  const loadCookTypes = async (categoryId: string) => {
    try {
      const response = await settingsService.cookTypes.getAll(categoryId, locationId);
      if (response.success && response.data) {
        setCookTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load cook types:', error);
    }
  };

  const handleToggleId = (field: 'specification_ids' | 'cook_type_ids', id: string) => {
    const current = [...formData[field]];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    setFormData({ ...formData, [field]: current });
  };

  const handleQuantityChange = (index: number, field: string, value: string | number | boolean) => {
    const newQuantities = [...formData.quantities];
    newQuantities[index] = { ...newQuantities[index], [field]: value };
    setFormData({ ...formData, quantities: newQuantities });
  };

  const handleMenuClick = (ingredientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(openMenu === ingredientId ? null : ingredientId);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      location_id: ingredient.location_id || locationId,
      food_type_id: ingredient.food_type_id,
      specification_ids: ingredient.specification_ids || [],
      cook_type_ids: ingredient.cook_type_ids || [],
      name: ingredient.name || '',
      description: ingredient.description || '',
      quantities: ingredient.quantities && ingredient.quantities.length > 0
        ? ingredient.quantities.map(qty => ({
            quantity_value: qty.quantity_value,
            quantity_grams: qty.quantity_grams || 0,
            price: qty.price,
            is_available: qty.is_available,
          }))
        : [
            { quantity_value: '100g', quantity_grams: 100, price: 0, is_available: true },
            { quantity_value: '200g', quantity_grams: 200, price: 0, is_available: true },
            { quantity_value: '300g', quantity_grams: 300, price: 0, is_available: true },
            { quantity_value: '400g', quantity_grams: 400, price: 0, is_available: true },
          ],
    });
    setOpenMenu(null);
  };

  const handleDelete = async (ingredientId: string) => {
    setOpenMenu(null);
    if (window.confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
      try {
        await ingredientsService.delete(ingredientId);
        loadData();
      } catch (error) {
        console.error('Failed to delete ingredient:', error);
        alert('Failed to delete ingredient. It might be in use by menu items.');
      }
    }
  };

  const handleAddNew = () => {
    setEditingIngredient(null);
    setFormData({
      location_id: locationId,
      food_type_id: '',
      specification_ids: [],
      cook_type_ids: [],
      name: '',
      description: '',
      quantities: [
        { quantity_value: '100g', quantity_grams: 100, price: 0, is_available: true },
        { quantity_value: '200g', quantity_grams: 200, price: 0, is_available: true },
        { quantity_value: '300g', quantity_grams: 300, price: 0, is_available: true },
        { quantity_value: '400g', quantity_grams: 400, price: 0, is_available: true },
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.food_type_id) {
        alert('Please select a food type');
        return;
      }

      const validQuantities = formData.quantities.filter(qty => qty.is_available && qty.quantity_value);

      if (editingIngredient) {
        await ingredientsService.update(editingIngredient.id, {
          ...formData,
          quantities: validQuantities,
        });
      } else {
        await ingredientsService.create({
          ...formData,
          quantities: validQuantities,
        });
      }

      handleAddNew();
      loadData();
    } catch (error) {
      console.error('Failed to save ingredient:', error);
      alert('Failed to save ingredient. Please check your input.');
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

  const currentCategory = categories.find((c) => c.id === activeCategory);
  const categoryIngredients = ingredients.filter(
    (ing) => {
      if (!currentCategory) return false;
      if (ing.food_type_id && foodTypes.length > 0) {
        return foodTypes.some(ft => 
          ft.id === ing.food_type_id && ft.category_id === currentCategory.id
        );
      }
      if (ing.category_name) {
        return ing.category_name.toLowerCase() === currentCategory.name.toLowerCase();
      }
      if (ing.category_id) {
        return ing.category_id === currentCategory.id;
      }
      return false;
    }
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-black to-black rounded-xl shadow-lg shadow-black/10">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <span>Dashboard</span>
              <span>&gt;</span>
              <span>Ingredients</span>
              <span>&gt;</span>
              <span>List</span>
              {currentCategory?.name && (
                <>
                  <span>&gt;</span>
                  <span className="text-black font-medium">{currentCategory.name}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 hover:from-black hover:to-black transition-all duration-300 transform hover:scale-105 active:scale-100 min-w-[140px] h-[48px]"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Category Tabs - Dynamic from API */}
      {categories.length > 0 && (
        <Tabs 
          tabs={categories
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map(cat => ({ id: cat.id, label: cat.name }))} 
          activeTab={activeCategory} 
          onChange={setActiveCategory} 
        />
      )}

      {/* Ingredients Form Card */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">

        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {editingIngredient ? 'Edit Ingredient' : 'New Ingredient'}
            </p>
            {editingIngredient && (
              <p className="text-xs text-gray-400 mt-0.5">{editingIngredient.name || editingIngredient.food_type_name}</p>
            )}
          </div>
          {editingIngredient && (
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(editingIngredient.id, e)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {openMenu === editingIngredient.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => handleEdit(editingIngredient)}
                    className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 mr-3 text-gray-500" /> Edit
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={() => handleDelete(editingIngredient.id)}
                    className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Category Type Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              {currentCategory?.name} Type
            </label>
            <select
              value={formData.food_type_id}
              onChange={(e) => {
                setFormData({ ...formData, food_type_id: e.target.value, specification_ids: [] });
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">Select</option>
              {foodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Price Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-700">Quantity &amp; Price</label>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    quantities: [
                      ...formData.quantities,
                      { quantity_value: '', quantity_grams: 0, price: 0, is_available: true },
                    ],
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black hover:text-white hover:bg-black rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Quantity</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.quantities.map((qty, index) => (
                <div key={`qty-${index}-${qty.quantity_value || 'empty'}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={qty.is_available}
                    onChange={(e) => handleQuantityChange(index, 'is_available', e.target.checked)}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qty.quantity_value}
                    onChange={(e) => handleQuantityChange(index, 'quantity_value', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200 bg-white text-sm"
                    placeholder="100g"
                  />
                  <input
                    type="number"
                    value={qty.price || ''}
                    onChange={(e) => handleQuantityChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-28 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200 bg-white text-sm"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Specification — checkbox group */}
          {currentCategory?.show_specification && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Specification</label>
              {!formData.food_type_id ? (
                <p className="text-xs text-gray-400 italic">Select a type first</p>
              ) : specifications.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No specifications for this type</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {specifications.map((spec) => {
                    const selected = formData.specification_ids.includes(spec.id);
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => handleToggleId('specification_ids', spec.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          selected
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'bg-white border-white' : 'bg-white border-gray-300'
                        }`}>
                          {selected && <span className="w-2 h-2 bg-black rounded-sm block" />}
                        </span>
                        {spec.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Type of cook — checkbox group */}
          {currentCategory?.show_cook_type && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Type of cook</label>
              {cookTypes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No cook types found</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cookTypes.map((cook) => {
                    const selected = formData.cook_type_ids.includes(cook.id);
                    return (
                      <button
                        key={cook.id}
                        type="button"
                        onClick={() => handleToggleId('cook_type_ids', cook.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          selected
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'bg-white border-white' : 'bg-white border-gray-300'
                        }`}>
                          {selected && <span className="w-2 h-2 bg-purple-600 rounded-sm block" />}
                        </span>
                        {cook.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SAVE Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg  hover:shadow-xl hover:shadow-black hover:from-black hover:to-black transition-all duration-300 transform hover:scale-105 active:scale-100"
            >
              <Save className="w-5 h-5" />
              <span>Save Ingredient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Ingredients List */}
      {categoryIngredients.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-black" />
            <h2 className="text-xl font-bold text-gray-900">Existing Ingredients</h2>
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
              {categoryIngredients.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryIngredients.map((ing) => (
              <div key={ing.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 relative hover:shadow-xl transition-all duration-300">
                {/* 3-dots Menu */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => handleMenuClick(ing.id, e)}
                    className="text-gray-400 hover:text-gray-600 relative z-10 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === ing.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => handleEdit(ing)}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4 mr-3 text-gray-500" /> Edit
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={() => handleDelete(ing.id)}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">{ing.name || ing.food_type_name}</h3>
                  </div>
                  {/* Multiple specifications */}
                  {ing.specification_names && ing.specification_names.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {ing.specification_names.map((name, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Multiple cook types */}
                  {ing.cook_type_names && ing.cook_type_names.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {ing.cook_type_names.map((name, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {ing.quantities && ing.quantities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Quantities &amp; Prices:</p>
                      <div className="space-y-2">
                        {ing.quantities.filter(q => q.is_available).map((qty, idx) => (
                          <div key={`${ing.id}-qty-${idx}-${qty.id || qty.quantity_value}`} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{qty.quantity_value}</span>
                            <span className="text-sm font-semibold text-purple-600">LKR {qty.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
