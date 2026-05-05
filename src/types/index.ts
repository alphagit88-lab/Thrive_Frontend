/**
 * TypeScript Types - Converted from Backend Entities
 */

// Location
export interface Location {
  id: string;
  name: string;
  currency: string;
  location_type?: string;
  address?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Food Category
export interface FoodCategory {
  id: string;
  location_id?: string;
  name: string;
  display_order: number;
  show_specification: boolean;
  show_cook_type: boolean;
  created_at: string;
  updated_at: string;
}

// Food Type
export interface FoodType {
  id: string;
  location_id?: string;
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

// Specification
export interface Specification {
  id: string;
  location_id?: string;
  food_type_id: string;
  name: string;
  created_at: string;
  food_type_name?: string;
  category_name?: string;
}

// Cook Type
export interface CookType {
  id: string;
  location_id?: string;
  category_id: string;
  name: string;
  created_at: string;
  category_name?: string;
}

// Ingredient Quantity
export interface IngredientQuantity {
  id: string;
  ingredient_id: string;
  quantity_value: string;
  quantity_grams?: number;
  price: number;
  is_available: boolean;
  created_at: string;
}

// Ingredient Photo
export interface IngredientPhoto {
  id: string;
  ingredient_id: string;
  photo_url: string;
  display_order: number;
  created_at: string;
}

// Ingredient
export interface Ingredient {
  id: string;
  location_id?: string;
  food_type_id: string;
  specification_ids?: string[];
  cook_type_ids?: string[];
  name?: string;
  description?: string;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  kcal?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  food_type_name?: string;
  category_id?: string;
  category_name?: string;
  specification_names?: string[];
  cook_type_names?: string[];
  quantities?: IngredientQuantity[];
  photos?: IngredientPhoto[];
}

// Menu Item Photo
export interface MenuItemPhoto {
  id: string;
  menu_item_id: string;
  photo_url: string;
  display_order: number;
  created_at: string;
}

// Menu Item Ingredient
export interface MenuItemIngredient {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  ingredient_quantity_id?: string;
  custom_quantity?: string;
  created_at: string;
  food_type_name?: string;
  quantity_value?: string;
  quantity_price?: number;
}

// Menu Item
export interface MenuItem {
  id: string;
  location_id: string;
  display_id?: string;
  name: string;
  food_category_id?: string;
  food_type_id?: string;
  quantity?: string;
  specification_id?: string;
  cook_type_id?: string;
  description?: string;
  price: number;
  tags?: string;
  prep_workout?: string;
  status: 'draft' | 'active';
  created_at: string;
  updated_at: string;
  category_name?: string;
  food_type_name?: string;
  specification_ids?: string[];
  specification_names?: string[];
  cook_type_ids?: string[];
  cook_type_names?: string[];
  location_name?: string;
  photos?: MenuItemPhoto[];
  ingredients?: MenuItemIngredient[];
}

// Order Item
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  menu_item_name?: string;
  menu_item_description?: string;
}

// Order
export interface Order {
  id: string;
  location_id: string;
  customer_id?: string;
  order_number?: string;
  status: 'received' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_price: number;
  notes?: string;
  order_date: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  location_name?: string;
  items?: OrderItem[];
}

// Customer
export interface Customer {
  id: string;
  location_id: string;
  email: string;
  name: string;
  contact_number?: string;
  address?: string;
  account_status: 'active' | 'inactive' | 'suspended';
  total_preps: number;
  created_at: string;
  updated_at: string;
  location_name?: string;
  recent_orders?: Order[];
}

// User
export interface User {
  id: string;
  location_id: string;
  email: string;
  name: string;
  contact_number?: string;
  role: 'admin' | 'manager' | 'staff' | 'kitchen_staff';
  account_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  location_name?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

export interface OrderStats {
  preps_received: number;
  preps_delivered: number;
  total_earnings: number;
  date: string;
}

// Form Types
export interface LocationForm {
  name: string;
  currency?: string;
  location_type?: string;
  address?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface IngredientForm {
  location_id: string;
  food_type_id: string;
  specification_ids: string[];
  cook_type_ids: string[];
  name?: string;
  description?: string;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  kcal?: number | null;
  quantities: {
    quantity_value: string;
    quantity_grams?: number;
    price: number;
    is_available: boolean;
  }[];
  photos?: string[];
}

export interface MenuItemForm {
  location_id: string;
  name: string;
  food_category_id?: string;
  food_type_id?: string;
  quantity?: string;
  specification_ids?: string[];
  cook_type_ids?: string[];
  description?: string;
  price: number;
  tags?: string;
  prep_workout?: string;
  status?: 'draft' | 'active';
  photos?: string[];
  ingredients?: {
    ingredient_id: string;
    ingredient_quantity_id?: string;
    custom_quantity?: string;
  }[];
}

export interface OrderForm {
  location_id: string;
  customer_id?: string;
  notes?: string;
  items: {
    menu_item_id?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }[];
}

export interface CustomerForm {
  location_id: string;
  email: string;
  name: string;
  contact_number?: string;
  address?: string;
}

export interface UserForm {
  location_id: string;
  email: string;
  password?: string;
  name: string;
  contact_number?: string;
  role?: 'admin' | 'manager' | 'staff' | 'kitchen_staff';
}

