/**
 * Locations Service
 */

import apiClient from '@/lib/api';
import { Location, LocationForm, ApiResponse } from '@/types';

export const locationsService = {
  // GET /api/locations
  getAll: async (params?: { search?: string; status?: string }): Promise<ApiResponse<Location[]>> => {
    const response = await apiClient.get<ApiResponse<Location[]>>('/locations', { params });
    return response.data;
  },

  // GET /api/locations/:id
  getById: async (id: string): Promise<ApiResponse<Location>> => {
    const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
    return response.data;
  },

  // POST /api/locations
  create: async (data: LocationForm): Promise<ApiResponse<Location>> => {
    const response = await apiClient.post<ApiResponse<Location>>('/locations', data);
    return response.data;
  },

  // PUT /api/locations/:id
  update: async (id: string, data: Partial<LocationForm>): Promise<ApiResponse<Location>> => {
    const response = await apiClient.put<ApiResponse<Location>>(`/locations/${id}`, data);
    return response.data;
  },

  // DELETE /api/locations/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/locations/${id}`);
    return response.data;
  },
};

