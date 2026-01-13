'use client';

import { useEffect, useState } from 'react';
import { ingredientsService } from '@/services/ingredients.service';
import { settingsService } from '@/services/settings.service';
import { Ingredient, IngredientForm, FoodCategory, FoodType, Specification, CookType } from '@/types';
import Tabs from '@/components/Tabs';
import Button from '@/components/Button';
import { Plus, MoreVertical, Pencil, Trash2, Save } from 'lucide-react';

export default function IngredientsPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [cookTypes, setCookTypes] = useState<CookType[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const [formData, setFormData] = useState<IngredientForm>({
    food_type_id: '',
    specification_id: '',
    cook_type_id: '',
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
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (category) {
      loadFoodTypes(category.id);
      loadCookTypes(category.id);
      // Load ingredients for the active category with quantities
      ingredientsService.getAll({ category_id: category.id }).then((res) => {
        if (res.success && res.data) {
          setIngredients(res.data);
        }
      }).catch((error) => {
        console.error('Failed to load ingredients:', error);
      });
    }
  }, [activeCategory, categories]);

  const loadData = async () => {
    try {
      const catRes = await settingsService.categories.getAll();

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
      food_type_id: ingredient.food_type_id,
      specification_id: ingredient.specification_id || '',
      cook_type_id: ingredient.cook_type_id || '',
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
      food_type_id: '',
      specification_id: '',
      cook_type_id: '',
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

      // Filter out quantities that are not available or have no price
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Ingredients &gt; List &gt; {currentCategory?.name || ''}</p>
        </div>
        <Button onClick={handleAddNew} variant="primary">
          <Plus className="w-4 h-4 mr-2 inline" />
          ADD
        </Button>
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
      <div className="mt-6 bg-white rounded-lg shadow p-6 relative">
        {/* 3-dots Menu */}
        {editingIngredient && (
          <div className="absolute top-6 right-6">
            <button
              onClick={(e) => handleMenuClick(editingIngredient.id, e)}
              className="text-gray-400 hover:text-gray-600 relative z-10"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === editingIngredient.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                <button
                  onClick={() => handleEdit(editingIngredient)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(editingIngredient.id)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Category Type Dropdown */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              {currentCategory?.name} Type
            </label>
            <select
              value={formData.food_type_id}
              onChange={(e) => {
                setFormData({ ...formData, food_type_id: e.target.value, specification_id: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Qty</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Price</span>
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.quantities.map((qty, index) => (
                <div key={`qty-${index}-${qty.quantity_value || 'empty'}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={qty.is_available}
                    onChange={(e) => handleQuantityChange(index, 'is_available', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={qty.quantity_value}
                    onChange={(e) => handleQuantityChange(index, 'quantity_value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="100g"
                  />
                  <input
                    type="number"
                    value={qty.price || ''}
                    onChange={(e) => handleQuantityChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Specification */}
          {currentCategory?.show_specification && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Specification</label>
              <select
                value={formData.specification_id}
                onChange={(e) => setFormData({ ...formData, specification_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {/* Type of cook */}
          {currentCategory?.show_cook_type && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type of cook</label>
              <select
                value={formData.cook_type_id}
                onChange={(e) => setFormData({ ...formData, cook_type_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
        </div>

        {/* SAVE Button */}
        <div className="flex justify-end mt-6">
          <Button variant="primary" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2 inline" />
            SAVE
          </Button>
        </div>
      </div>

      {/* Existing Ingredients List */}
      {categoryIngredients.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Existing Ingredients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryIngredients.map((ing) => (
              <div key={ing.id} className="bg-white rounded-lg shadow p-4 relative">
                {/* 3-dots Menu */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => handleMenuClick(ing.id, e)}
                    className="text-gray-400 hover:text-gray-600 relative z-10"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === ing.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <button
                        onClick={() => handleEdit(ing)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ing.id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{ing.name || ing.food_type_name}</h3>
                {ing.specification_name && (
                  <p className="text-xs text-gray-500 mb-1">Spec: {ing.specification_name}</p>
                )}
                {ing.cook_type_name && (
                  <p className="text-xs text-gray-500 mb-1">Cook: {ing.cook_type_name}</p>
                )}
                {ing.quantities && ing.quantities.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Quantities:</p>
                    <div className="space-y-1">
                      {ing.quantities.filter(q => q.is_available).map((qty, idx) => (
                        <div key={`${ing.id}-qty-${idx}-${qty.id || qty.quantity_value}`} className="text-xs text-gray-600">
                          {qty.quantity_value}: LKR {qty.price.toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
