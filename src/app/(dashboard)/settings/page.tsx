'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settings.service';
import { FoodCategory, FoodType, Specification, CookType } from '@/types';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Plus, MoreVertical, Pencil, Trash2, Settings, UtensilsCrossed, Tag, ChefHat, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [types, setTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown menu states
  const [openMenu, setOpenMenu] = useState<{ type: string; id: string } | null>(null);

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [cookTypeModalOpen, setCookTypeModalOpen] = useState(false);

  // Edit states
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(null);
  const [editingType, setEditingType] = useState<FoodType | null>(null);
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [editingCookType, setEditingCookType] = useState<CookType | null>(null);

  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0, show_specification: true, show_cook_type: true });
  const [typeForm, setTypeForm] = useState({ category_id: '', name: '' });
  const [specForm, setSpecForm] = useState({ food_type_id: '', name: '' });
  const [cookTypeForm, setCookTypeForm] = useState({ category_id: '', name: '' });

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

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [catRes, typeRes, specRes, cookRes] = await Promise.all([
        settingsService.categories.getAll(),
        settingsService.types.getAll(),
        settingsService.specifications.getAll(),
        settingsService.cookTypes.getAll(),
      ]);

      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (typeRes.success && typeRes.data) setTypes(typeRes.data);
      if (specRes.success && specRes.data) setSpecifications(specRes.data);
      if (cookRes.success && cookRes.data) setCookTypes(cookRes.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (type: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(openMenu?.type === type && openMenu?.id === id ? null : { type, id });
  };

  const handleEditCategory = (category: FoodCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      display_order: category.display_order || 0,
      show_specification: category.show_specification ?? true,
      show_cook_type: category.show_cook_type ?? true,
    });
    setCategoryModalOpen(true);
    setOpenMenu(null);
  };

  const handleEditType = (type: FoodType) => {
    setEditingType(type);
    setTypeForm({
      category_id: type.category_id || '',
      name: type.name,
    });
    setTypeModalOpen(true);
    setOpenMenu(null);
  };

  const handleEditSpec = (spec: Specification) => {
    setEditingSpec(spec);
    setSpecForm({
      food_type_id: spec.food_type_id || '',
      name: spec.name,
    });
    setSpecModalOpen(true);
    setOpenMenu(null);
  };

  const handleEditCookType = (cookType: CookType) => {
    setEditingCookType(cookType);
    setCookTypeForm({
      category_id: cookType.category_id || '',
      name: cookType.name,
    });
    setCookTypeModalOpen(true);
    setOpenMenu(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    try {
      await settingsService.categories.delete(id);
      loadAll();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. It may be in use by other items.');
    }
    setOpenMenu(null);
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food type? This action cannot be undone.')) {
      return;
    }
    try {
      await settingsService.types.delete(id);
      loadAll();
    } catch (error) {
      console.error('Failed to delete food type:', error);
      alert('Failed to delete food type. It may be in use by other items.');
    }
    setOpenMenu(null);
  };

  const handleDeleteSpec = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specification? This action cannot be undone.')) {
      return;
    }
    try {
      await settingsService.specifications.delete(id);
      loadAll();
    } catch (error) {
      console.error('Failed to delete specification:', error);
      alert('Failed to delete specification. It may be in use by other items.');
    }
    setOpenMenu(null);
  };

  const handleDeleteCookType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cook type? This action cannot be undone.')) {
      return;
    }
    try {
      await settingsService.cookTypes.delete(id);
      loadAll();
    } catch (error) {
      console.error('Failed to delete cook type:', error);
      alert('Failed to delete cook type. It may be in use by other items.');
    }
    setOpenMenu(null);
  };

  const handleCreateCategory = async () => {
    try {
      if (editingCategory) {
        await settingsService.categories.update(editingCategory.id, categoryForm);
      } else {
        await settingsService.categories.create(categoryForm);
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', display_order: 0, show_specification: true, show_cook_type: true });
      loadAll();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleCreateType = async () => {
    try {
      if (editingType) {
        await settingsService.types.update(editingType.id, typeForm);
      } else {
        await settingsService.types.create(typeForm);
      }
      setTypeModalOpen(false);
      setEditingType(null);
      setTypeForm({ category_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to save food type:', error);
      alert('Failed to save food type');
    }
  };

  const handleCreateSpec = async () => {
    try {
      if (editingSpec) {
        await settingsService.specifications.update(editingSpec.id, specForm);
      } else {
        await settingsService.specifications.create(specForm);
      }
      setSpecModalOpen(false);
      setEditingSpec(null);
      setSpecForm({ food_type_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to save specification:', error);
      alert('Failed to save specification');
    }
  };

  const handleCreateCookType = async () => {
    try {
      if (editingCookType) {
        await settingsService.cookTypes.update(editingCookType.id, cookTypeForm);
      } else {
        await settingsService.cookTypes.create(cookTypeForm);
      }
      setCookTypeModalOpen(false);
      setEditingCookType(null);
      setCookTypeForm({ category_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to save cook type:', error);
      alert('Failed to save cook type');
    }
  };

  const resetCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', display_order: 0, show_specification: true, show_cook_type: true });
  };

  const resetTypeModal = () => {
    setTypeModalOpen(false);
    setEditingType(null);
    setTypeForm({ category_id: '', name: '' });
  };

  const resetSpecModal = () => {
    setSpecModalOpen(false);
    setEditingSpec(null);
    setSpecForm({ food_type_id: '', name: '' });
  };

  const resetCookTypeModal = () => {
    setCookTypeModalOpen(false);
    setEditingCookType(null);
    setCookTypeForm({ category_id: '', name: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-linear-to-br from-black to-black rounded-xl shadow-lg shadow-black/10">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>

          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            Dashboard &gt; Settings &gt; List
          </p>
        </div>
      </div>

      {/* Food Categories */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Food Categories</h2>
                <p className="text-xs text-gray-500 mt-0.5">{categories.length} categories</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetCategoryModal();
                setCategoryModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No categories yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first category to get started</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`group relative border-2 border-gray-200 rounded-xl p-4 bg-linear-to-br from-white to-gray-50 hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${openMenu?.type === 'category' && openMenu?.id === cat.id ? 'z-30' : 'z-0'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{cat.name}</h3>

                    </div>
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => handleMenuClick('category', cat.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu?.type === 'category' && openMenu?.id === cat.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Food Types */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Food Types</h2>
                <p className="text-xs text-gray-500 mt-0.5">{types.length} types</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetTypeModal();
                setTypeModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Type</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {types.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No food types yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first food type to get started</p>
              </div>
            ) : (
              types.map((type) => (
                <div
                  key={type.id}
                  className={`group relative border-2 border-gray-200 rounded-xl p-4 bg-linear-to-br from-white to-gray-50 hover:border-green-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${openMenu?.type === 'type' && openMenu?.id === type.id ? 'z-30' : 'z-0'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{type.name}</h3>
                    </div>
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => handleMenuClick('type', type.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu?.type === 'type' && openMenu?.id === type.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                          <button
                            onClick={() => handleEditType(type)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteType(type.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Specifications</h2>
                <p className="text-xs text-gray-500 mt-0.5">{specifications.length} specifications</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetSpecModal();
                setSpecModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specification</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {specifications.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No specifications yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first specification to get started</p>
              </div>
            ) : (
              specifications.map((spec) => (
                <div
                  key={spec.id}
                  className={`group relative border-2 border-gray-200 rounded-xl p-4 bg-linear-to-br from-white to-gray-50 hover:border-orange-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${openMenu?.type === 'spec' && openMenu?.id === spec.id ? 'z-30' : 'z-0'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{spec.name}</h3>
                    </div>
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => handleMenuClick('spec', spec.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu?.type === 'spec' && openMenu?.id === spec.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                          <button
                            onClick={() => handleEditSpec(spec)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSpec(spec.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cook Types */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 bg-linear-to-r from-red-50 to-rose-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Cook Types</h2>
                <p className="text-xs text-gray-500 mt-0.5">{cookTypes.length} cook types</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetCookTypeModal();
                setCookTypeModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 active:scale-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cook Type</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cookTypes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No cook types yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first cook type to get started</p>
              </div>
            ) : (
              cookTypes.map((cook) => (
                <div
                  key={cook.id}
                  className={`group relative border-2 border-gray-200 rounded-xl p-4 bg-linear-to-br from-white to-gray-50 hover:border-red-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${openMenu?.type === 'cookType' && openMenu?.id === cook.id ? 'z-30' : 'z-0'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{cook.name}</h3>
                    </div>
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => handleMenuClick('cookType', cook.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu?.type === 'cookType' && openMenu?.id === cook.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                          <button
                            onClick={() => handleEditCookType(cook)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCookType(cook.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={resetCategoryModal}
        title={editingCategory ? 'Edit Food Category' : 'Food Category'}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetCategoryModal}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCategory}
              className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/30"
            >
              {editingCategory ? 'Update' : 'Add Category'}
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Enter Food Category"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categoryForm.show_specification}
                onChange={(e) => setCategoryForm({ ...categoryForm, show_specification: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Show Specification</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categoryForm.show_cook_type}
                onChange={(e) => setCategoryForm({ ...categoryForm, show_cook_type: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Show Cook Type</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Type Modal */}
      <Modal
        isOpen={typeModalOpen}
        onClose={resetTypeModal}
        title={editingType ? 'Edit Food Type' : 'Food Type'}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetTypeModal}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateType}
              className="px-6 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md shadow-green-500/30"
            >
              {editingType ? 'Update' : 'Add Type'}
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateType(); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Food Category <span className="text-red-500">*</span></label>
            <select
              required
              value={typeForm.category_id}
              onChange={(e) => setTypeForm({ ...typeForm, category_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Food Type <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Enter Food Type"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </form>
      </Modal>

      {/* Specification Modal */}
      <Modal
        isOpen={specModalOpen}
        onClose={resetSpecModal}
        title={editingSpec ? 'Edit Specification' : 'Specification'}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetSpecModal}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSpec}
              className="px-6 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30"
            >
              {editingSpec ? 'Update' : 'Add Specification'}
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateSpec(); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Food Type <span className="text-red-500">*</span></label>
            <select
              required
              value={specForm.food_type_id}
              onChange={(e) => setSpecForm({ ...specForm, food_type_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="">Select food type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Specification <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Enter Specification"
              value={specForm.name}
              onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </form>
      </Modal>

      {/* Cook Type Modal */}
      <Modal
        isOpen={cookTypeModalOpen}
        onClose={resetCookTypeModal}
        title={editingCookType ? 'Edit Cook Type' : 'Cook Type'}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetCookTypeModal}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCookType}
              className="px-6 py-2.5 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/30"
            >
              {editingCookType ? 'Update' : 'Add Cook Type'}
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateCookType(); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category <span className="text-red-500">*</span></label>
            <select
              required
              value={cookTypeForm.category_id}
              onChange={(e) => setCookTypeForm({ ...cookTypeForm, category_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Cook Type <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Enter Cook Type"
              value={cookTypeForm.name}
              onChange={(e) => setCookTypeForm({ ...cookTypeForm, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </form>
      </Modal>
    </div >
  );
}
