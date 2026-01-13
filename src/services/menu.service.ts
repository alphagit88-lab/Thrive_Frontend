/**
 * Menu Service
 */

import apiClient from '@/lib/api';
import { MenuItem, MenuItemForm, ApiResponse } from '@/types';

export const menuService = {
  // GET /api/menu
  getAll: async (params: { location_id: string; status?: string; search?: string; category_id?: string }): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu', { params });
    return response.data;
  },

  // GET /api/menu/:id
  getById: async (id: string): Promise<ApiResponse<MenuItem>> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    return response.data;
  },

  // POST /api/menu
  create: async (data: MenuItemForm): Promise<ApiResponse<MenuItem>> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/menu', data);
    return response.data;
  },

  // PUT /api/menu/:id
  update: async (id: string, data: Partial<MenuItemForm>): Promise<ApiResponse<MenuItem>> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu/${id}`, data);
    return response.data;
  },

  // PATCH /api/menu/:id/toggle-status
  toggleStatus: async (id: string): Promise<ApiResponse<MenuItem>> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(`/menu/${id}/toggle-status`);
    return response.data;
  },

  // DELETE /api/menu/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/menu/${id}`);
    return response.data;
  },
};

