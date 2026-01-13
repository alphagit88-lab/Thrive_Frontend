'use client';

import { useEffect, useState } from 'react';
import { ingredientsService } from '@/services/ingredients.service';
import { settingsService } from '@/services/settings.service';
import { Ingredient, IngredientForm, FoodCategory, FoodType, Specification, CookType } from '@/types';
import Tabs from '@/components/Tabs';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Plus, ShoppingBasket } from 'lucide-react';

const categoryTabs = [
  { id: 'meat', label: 'Meat' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'addons', label: 'Add Ons' },
];

export default function IngredientsPage() {
  const [activeCategory, setActiveCategory] = useState('meat');
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<IngredientForm>({
    food_type_id: '',
    specification_id: '',
    cook_type_id: '',
    name: '',
    description: '',
    quantities: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.food_type_id) {
      loadSpecifications(formData.food_type_id);
    }
  }, [formData.food_type_id]);

  useEffect(() => {
    const category = categories.find((c) => c.name.toLowerCase() === activeCategory);
    if (category) {
      loadFoodTypes(category.id);
      loadCookTypes(category.id);
    }
  }, [activeCategory, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, ingRes] = await Promise.all([
        settingsService.categories.getAll(),
        ingredientsService.getByCategory(),
      ]);

      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (ingRes.success && ingRes.data) {
        // Flatten ingredients from grouped data
        const allIngredients: Ingredient[] = [];
        ingRes.data.forEach((group: any) => {
          if (group.ingredients) {
            allIngredients.push(...group.ingredients);
          }
        });
        setIngredients(allIngredients);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodTypes = async (categoryId: string) => {
    try {
      const response = await settingsService.types.getAll(categoryId);
      if (response.success && response.data) {
        setFoodTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load food types:', error);
    }
  };

  const loadSpecifications = async (foodTypeId: string) => {
    try {
      const response = await settingsService.specifications.getAll(foodTypeId);
      if (response.success && response.data) {
        setSpecifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load specifications:', error);
    }
  };

  const loadCookTypes = async (categoryId: string) => {
    try {
      const response = await settingsService.cookTypes.getAll(categoryId);
      if (response.success && response.data) {
        setCookTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load cook types:', error);
    }
  };

  const handleAddQuantity = () => {
    setFormData({
      ...formData,
      quantities: [
        ...formData.quantities,
        { quantity_value: '', quantity_grams: 0, price: 0, is_available: true },
      ],
    });
  };

  const handleQuantityChange = (index: number, field: string, value: any) => {
    const newQuantities = [...formData.quantities];
    newQuantities[index] = { ...newQuantities[index], [field]: value };
    setFormData({ ...formData, quantities: newQuantities });
  };

  const handleSubmit = async () => {
    try {
      await ingredientsService.create(formData);
      setIsModalOpen(false);
      setFormData({
        food_type_id: '',
        specification_id: '',
        cook_type_id: '',
        name: '',
        description: '',
        quantities: [],
      });
      loadData();
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const currentCategory = categories.find((c) => c.name.toLowerCase() === activeCategory);
  const categoryIngredients = ingredients.filter(
    (ing) => ing.category_name?.toLowerCase() === activeCategory
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Ingredients</p>
      </div>

      {/* Category Tabs */}
      <Tabs tabs={categoryTabs} activeTab={activeCategory} onChange={setActiveCategory} />

      {/* Add Button */}
      <div className="flex justify-end mt-4 mb-6">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add
        </Button>
      </div>

      {/* Ingredients List or Empty State */}
      {categoryIngredients.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket className="w-16 h-16 text-gray-400" />}
          title="There are no ingredients Added"
          action={{
            label: 'Add Ingredient',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryIngredients.map((ing) => (
            <div key={ing.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">{ing.name || ing.food_type_name}</h3>
              <p className="text-sm text-gray-500">{ing.specification_name}</p>
              <p className="text-sm text-gray-500">{ing.cook_type_name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Ingredient"
        size="lg"
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
          {/* Food Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentCategory?.name} Type *
            </label>
            <select
              required
              value={formData.food_type_id}
              onChange={(e) => setFormData({ ...formData, food_type_id: e.target.value, specification_id: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              {foodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specification */}
          {currentCategory?.show_specification && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specification</label>
              <select
                value={formData.specification_id}
                onChange={(e) => setFormData({ ...formData, specification_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!formData.food_type_id}
              >
                <option value="">Select</option>
                {specifications.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cook Type */}
          {currentCategory?.show_cook_type && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type of cook</label>
              <select
                value={formData.cook_type_id}
                onChange={(e) => setFormData({ ...formData, cook_type_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select</option>
                {cookTypes.map((cook) => (
                  <option key={cook.id} value={cook.id}>
                    {cook.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Qty</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Price</span>
                <Button variant="outline" size="sm" onClick={handleAddQuantity}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.quantities.map((qty, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={qty.is_available}
                    onChange={(e) => handleQuantityChange(index, 'is_available', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    placeholder="100g"
                    value={qty.quantity_value}
                    onChange={(e) => handleQuantityChange(index, 'quantity_value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={qty.price}
                    onChange={(e) => handleQuantityChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              {formData.quantities.length === 0 && (
                <Button variant="outline" size="sm" onClick={handleAddQuantity}>
                  <Plus className="w-4 h-4 mr-1 inline" />
                  Add Quantity
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

