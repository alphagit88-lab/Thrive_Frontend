/**
 * Users Service
 */

import apiClient from '@/lib/api';
import { User, UserForm, ApiResponse } from '@/types';

export const usersService = {
  // POST /api/users/login
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/users/login', { email, password });
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // GET /api/users/me
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  // GET /api/users
  getAll: async (params: { location_id: string; search?: string; role?: string; status?: string }): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  // GET /api/users/:id
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // POST /api/users
  create: async (data: UserForm): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  // PUT /api/users/:id
  update: async (id: string, data: Partial<UserForm>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  // DELETE /api/users/:id
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

