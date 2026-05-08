/**
 * Franchises Service
 */

import apiClient from '@/lib/api';
import { ApiResponse, Franchise, FranchiseForm } from '@/types';

export const franchisesService = {
  getAll: async (params?: { search?: string; status?: string; location_id?: string }): Promise<ApiResponse<Franchise[]>> => {
    const response = await apiClient.get<ApiResponse<Franchise[]>>('/franchises', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Franchise>> => {
    const response = await apiClient.get<ApiResponse<Franchise>>(`/franchises/${id}`);
    return response.data;
  },

  create: async (data: FranchiseForm): Promise<ApiResponse<Franchise>> => {
    const response = await apiClient.post<ApiResponse<Franchise>>('/franchises', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FranchiseForm>): Promise<ApiResponse<Franchise>> => {
    const response = await apiClient.put<ApiResponse<Franchise>>(`/franchises/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/franchises/${id}`);
    return response.data;
  },
};
