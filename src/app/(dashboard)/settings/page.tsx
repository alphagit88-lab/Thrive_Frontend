'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settings.service';
import { FoodCategory, FoodType, Specification, CookType } from '@/types';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';

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
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Settings &gt; List</p>
      </div>

      {/* Food Categories */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Food category</h2>
          <Button onClick={() => {
            resetCategoryModal();
            setCategoryModalOpen(true);
          }} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{cat.name}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick('category', cat.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu?.type === 'category' && openMenu?.id === cat.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Types */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Food Types</h2>
          <Button onClick={() => {
            resetTypeModal();
            setTypeModalOpen(true);
          }} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {types.map((type) => (
            <div key={type.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{type.name}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick('type', type.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu?.type === 'type' && openMenu?.id === type.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleEditType(type)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteType(type.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Specifications</h2>
          <Button onClick={() => {
            resetSpecModal();
            setSpecModalOpen(true);
          }} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {specifications.map((spec) => (
            <div key={spec.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{spec.name}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick('spec', spec.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu?.type === 'spec' && openMenu?.id === spec.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleEditSpec(spec)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSpec(spec.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cook Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cook Types</h2>
          <Button onClick={() => {
            resetCookTypeModal();
            setCookTypeModalOpen(true);
          }} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cookTypes.map((cook) => (
            <div key={cook.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{cook.name}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick('cookType', cook.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu?.type === 'cookType' && openMenu?.id === cook.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleEditCookType(cook)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCookType(cook.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={resetCategoryModal}
        title={editingCategory ? 'Edit Food Category' : 'Food Category'}
        footer={
          <Button variant="primary" onClick={handleCreateCategory}>
            {editingCategory ? 'UPDATE' : 'ADD'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              placeholder="Enter Food Category"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={categoryForm.display_order}
              onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoryForm.show_specification}
                onChange={(e) => setCategoryForm({ ...categoryForm, show_specification: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show Specification</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoryForm.show_cook_type}
                onChange={(e) => setCategoryForm({ ...categoryForm, show_cook_type: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show Cook Type</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Type Modal */}
      <Modal
        isOpen={typeModalOpen}
        onClose={resetTypeModal}
        title={editingType ? 'Edit Food Type' : 'Food Type'}
        footer={
          <Button variant="primary" onClick={handleCreateType}>
            {editingType ? 'UPDATE' : 'ADD'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select food category</label>
            <select
              value={typeForm.category_id}
              onChange={(e) => setTypeForm({ ...typeForm, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Food Type</label>
            <input
              type="text"
              placeholder="Enter Food Type"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Modal>

      {/* Specification Modal */}
      <Modal
        isOpen={specModalOpen}
        onClose={resetSpecModal}
        title={editingSpec ? 'Edit Specification' : 'Specification'}
        footer={
          <Button variant="primary" onClick={handleCreateSpec}>
            {editingSpec ? 'UPDATE' : 'ADD'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select food type</label>
            <select
              value={specForm.food_type_id}
              onChange={(e) => setSpecForm({ ...specForm, food_type_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Specification</label>
            <input
              type="text"
              placeholder="Enter Specification"
              value={specForm.name}
              onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Modal>

      {/* Cook Type Modal */}
      <Modal
        isOpen={cookTypeModalOpen}
        onClose={resetCookTypeModal}
        title={editingCookType ? 'Edit Cook Type' : 'Cook Type'}
        footer={
          <Button variant="primary" onClick={handleCreateCookType}>
            {editingCookType ? 'UPDATE' : 'ADD'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select category</label>
            <select
              value={cookTypeForm.category_id}
              onChange={(e) => setCookTypeForm({ ...cookTypeForm, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Cook Type</label>
            <input
              type="text"
              placeholder="Enter Cook Type"
              value={cookTypeForm.name}
              onChange={(e) => setCookTypeForm({ ...cookTypeForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
