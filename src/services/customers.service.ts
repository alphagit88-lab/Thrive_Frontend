/**
 * Customers Service
 */

import apiClient from '@/lib/api';
import { Customer, CustomerForm, ApiResponse } from '@/types';

export const customersService = {
  // GET /api/customers
  getAll: async (params: { location_id: string; search?: string; status?: string }): Promise<ApiResponse<Customer[]>> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });
    return response.data;
  },

  // GET /api/customers/:id
  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  // POST /api/customers
  create: async (data: CustomerForm): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  // PUT /api/customers/:id
  update: async (id: string, data: Partial<CustomerForm>): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  // DELETE /api/customers/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/customers/${id}`);
    return response.data;
  },
};

