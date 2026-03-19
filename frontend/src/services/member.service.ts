import apiClient from '../lib/axios';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phonePrimary?: string;
  gender: 'MALE' | 'FEMALE';
  membershipStatus: string;
  dateOfBirth?: string;
  address?: string;
  maritalStatus?: string;
  baptismStatus?: string;
  createdAt: string;
}

export const memberService = {
  async getAll(filters?: any) {
    const response = await apiClient.get('/members', { params: filters });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/members/${id}`);
    return response.data.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/members', data);
    return response.data.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/members/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/members/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/members/stats');
    return response.data.data;
  },
};