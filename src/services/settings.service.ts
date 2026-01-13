/**
 * Settings Service
 */

import apiClient from '@/lib/api';
import { FoodCategory, FoodType, Specification, CookType, ApiResponse } from '@/types';

export const settingsService = {
  // Food Categories
  categories: {
    getAll: async (): Promise<ApiResponse<FoodCategory[]>> => {
      const response = await apiClient.get<ApiResponse<FoodCategory[]>>('/settings/categories');
      return response.data;
    },
    getById: async (id: string): Promise<ApiResponse<FoodCategory>> => {
      const response = await apiClient.get<ApiResponse<FoodCategory>>(`/settings/categories/${id}`);
      return response.data;
    },
    create: async (data: { name: string; display_order?: number; show_specification?: boolean; show_cook_type?: boolean }): Promise<ApiResponse<FoodCategory>> => {
      const response = await apiClient.post<ApiResponse<FoodCategory>>('/settings/categories', data);
      return response.data;
    },
    update: async (id: string, data: Partial<FoodCategory>): Promise<ApiResponse<FoodCategory>> => {
      const response = await apiClient.put<ApiResponse<FoodCategory>>(`/settings/categories/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/settings/categories/${id}`);
      return response.data;
    },
  },

  // Food Types
  types: {
    getAll: async (category_id?: string): Promise<ApiResponse<FoodType[]>> => {
      const response = await apiClient.get<ApiResponse<FoodType[]>>('/settings/types', { params: { category_id } });
      return response.data;
    },
    getById: async (id: string): Promise<ApiResponse<FoodType>> => {
      const response = await apiClient.get<ApiResponse<FoodType>>(`/settings/types/${id}`);
      return response.data;
    },
    create: async (data: { category_id: string; name: string }): Promise<ApiResponse<FoodType>> => {
      const response = await apiClient.post<ApiResponse<FoodType>>('/settings/types', data);
      return response.data;
    },
    update: async (id: string, data: Partial<FoodType>): Promise<ApiResponse<FoodType>> => {
      const response = await apiClient.put<ApiResponse<FoodType>>(`/settings/types/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/settings/types/${id}`);
      return response.data;
    },
  },

  // Specifications
  specifications: {
    getAll: async (food_type_id?: string): Promise<ApiResponse<Specification[]>> => {
      const response = await apiClient.get<ApiResponse<Specification[]>>('/settings/specifications', { params: { food_type_id } });
      return response.data;
    },
    create: async (data: { food_type_id: string; name: string }): Promise<ApiResponse<Specification>> => {
      const response = await apiClient.post<ApiResponse<Specification>>('/settings/specifications', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Specification>): Promise<ApiResponse<Specification>> => {
      const response = await apiClient.put<ApiResponse<Specification>>(`/settings/specifications/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/settings/specifications/${id}`);
      return response.data;
    },
  },

  // Cook Types
  cookTypes: {
    getAll: async (category_id?: string): Promise<ApiResponse<CookType[]>> => {
      const response = await apiClient.get<ApiResponse<CookType[]>>('/settings/cook-types', { params: { category_id } });
      return response.data;
    },
    create: async (data: { category_id: string; name: string }): Promise<ApiResponse<CookType>> => {
      const response = await apiClient.post<ApiResponse<CookType>>('/settings/cook-types', data);
      return response.data;
    },
    update: async (id: string, data: Partial<CookType>): Promise<ApiResponse<CookType>> => {
      const response = await apiClient.put<ApiResponse<CookType>>(`/settings/cook-types/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/settings/cook-types/${id}`);
      return response.data;
    },
  },
};

