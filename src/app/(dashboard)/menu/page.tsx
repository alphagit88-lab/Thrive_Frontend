'use client';

import { useEffect, useState } from 'react';
import { menuService } from '@/services/menu.service';
import { MenuItem, MenuItemForm } from '@/types';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Plus, MoreVertical, Upload } from 'lucide-react';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<MenuItemForm>({
    location_id: '',
    name: '',
    food_category_id: '',
    food_type_id: '',
    quantity: '',
    specification_id: '',
    cook_type_id: '',
    description: '',
    price: 0,
    tags: '',
    prep_workout: '',
    status: 'draft',
    photos: [],
    ingredients: [],
  });

  useEffect(() => {
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      loadMenuItems(savedLocationId);
    }
  }, []);

  const loadMenuItems = async (locId: string) => {
    try {
      setLoading(true);
      const response = await menuService.getAll({ location_id: locId, search });
      if (response.success && response.data) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await menuService.create({ ...formData, location_id: locationId });
      setIsModalOpen(false);
      loadMenuItems(locationId);
    } catch (error) {
      console.error('Failed to create menu item:', error);
    }
  };

  if (!locationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a location first</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Menu</p>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search for tags"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadMenuItems(locationId);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add
        </Button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">ID #{item.display_id || item.id.substring(0, 8)}</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input
                  type="text"
                  value={item.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Price</label>
                <input
                  type="number"
                  value={item.price}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Photos</label>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Upload Photos
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Menu Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Menu Item"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

