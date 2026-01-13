/**
 * Orders Service
 */

import apiClient from '@/lib/api';
import { Order, OrderForm, OrderStats, ApiResponse } from '@/types';

export const ordersService = {
  // GET /api/orders
  getAll: async (params: { location_id: string; status?: string; customer_id?: string; date_from?: string; date_to?: string }): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders', { params });
    return response.data;
  },

  // GET /api/orders/stats
  getStats: async (params: { location_id: string; date?: string }): Promise<ApiResponse<OrderStats>> => {
    const response = await apiClient.get<ApiResponse<OrderStats>>('/orders/stats', { params });
    return response.data;
  },

  // GET /api/orders/:id
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  // POST /api/orders
  create: async (data: OrderForm): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  // PATCH /api/orders/:id/status
  updateStatus: async (id: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  // PUT /api/orders/:id
  update: async (id: string, data: Partial<OrderForm>): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  // DELETE /api/orders/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/orders/${id}`);
    return response.data;
  },
};

