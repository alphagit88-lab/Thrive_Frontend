'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settings.service';
import { FoodCategory, FoodType, Specification, CookType } from '@/types';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Plus, MoreVertical } from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [types, setTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [cookTypeModalOpen, setCookTypeModalOpen] = useState(false);
  
  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0, show_specification: true, show_cook_type: true });
  const [typeForm, setTypeForm] = useState({ category_id: '', name: '' });
  const [specForm, setSpecForm] = useState({ food_type_id: '', name: '' });
  const [cookTypeForm, setCookTypeForm] = useState({ category_id: '', name: '' });

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

  const handleCreateCategory = async () => {
    try {
      await settingsService.categories.create(categoryForm);
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', display_order: 0, show_specification: true, show_cook_type: true });
      loadAll();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleCreateType = async () => {
    try {
      await settingsService.types.create(typeForm);
      setTypeModalOpen(false);
      setTypeForm({ category_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to create type:', error);
    }
  };

  const handleCreateSpec = async () => {
    try {
      await settingsService.specifications.create(specForm);
      setSpecModalOpen(false);
      setSpecForm({ food_type_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to create specification:', error);
    }
  };

  const handleCreateCookType = async () => {
    try {
      await settingsService.cookTypes.create(cookTypeForm);
      setCookTypeModalOpen(false);
      setCookTypeForm({ category_id: '', name: '' });
      loadAll();
    } catch (error) {
      console.error('Failed to create cook type:', error);
    }
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
          <Button onClick={() => setCategoryModalOpen(true)} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{cat.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Types */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Food Types</h2>
          <Button onClick={() => setTypeModalOpen(true)} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {types.map((type) => (
            <div key={type.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{type.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Specifications</h2>
          <Button onClick={() => setSpecModalOpen(true)} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {specifications.map((spec) => (
            <div key={spec.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{spec.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cook Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cook Types</h2>
          <Button onClick={() => setCookTypeModalOpen(true)} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            ADD
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cookTypes.map((cook) => (
            <div key={cook.id} className="border rounded-lg p-4 relative hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{cook.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Food Category"
        footer={
          <Button variant="primary" onClick={handleCreateCategory}>
            ADD
          </Button>
        }
      >
        <input
          type="text"
          placeholder="Enter Food Category"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </Modal>

      {/* Type Modal */}
      <Modal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        title="Food Type"
        footer={
          <Button variant="primary" onClick={handleCreateType}>
            ADD
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
        onClose={() => setSpecModalOpen(false)}
        title="Specification"
        footer={
          <Button variant="primary" onClick={handleCreateSpec}>
            ADD
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
        onClose={() => setCookTypeModalOpen(false)}
        title="Cook Type"
        footer={
          <Button variant="primary" onClick={handleCreateCookType}>
            ADD
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

