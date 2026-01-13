/**
 * Ingredients Service
 */

import apiClient from '@/lib/api';
import { Ingredient, IngredientForm, ApiResponse } from '@/types';

export const ingredientsService = {
  // GET /api/ingredients
  getAll: async (params?: { category_id?: string; food_type_id?: string; is_active?: boolean }): Promise<ApiResponse<Ingredient[]>> => {
    const response = await apiClient.get<ApiResponse<Ingredient[]>>('/ingredients', { params });
    return response.data;
  },

  // GET /api/ingredients/by-category
  getByCategory: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/ingredients/by-category');
    return response.data;
  },

  // GET /api/ingredients/:id
  getById: async (id: string): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
    return response.data;
  },

  // POST /api/ingredients
  create: async (data: IngredientForm): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.post<ApiResponse<Ingredient>>('/ingredients', data);
    return response.data;
  },

  // PUT /api/ingredients/:id
  update: async (id: string, data: Partial<IngredientForm>): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.put<ApiResponse<Ingredient>>(`/ingredients/${id}`, data);
    return response.data;
  },

  // DELETE /api/ingredients/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/ingredients/${id}`);
    return response.data;
  },
};

