import apiClient from '../lib/axios';

export interface Department {
  id: string;
  departmentName: string;
  description?: string;
  meetingSchedule?: string;
  status: string;
  headId?: string;
  head?: any;
  members?: any[];
  _count?: { members: number };
}

export const departmentService = {
  async getAll() {
    const response = await apiClient.get('/departments');
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/departments', data);
    return response.data.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  async addMember(departmentId: string, memberId: string, role: string = 'MEMBER') {
    const response = await apiClient.post(`/departments/${departmentId}/members`, { memberId, role });
    return response.data.data;
  },

  async removeMember(departmentId: string, memberId: string) {
    const response = await apiClient.delete(`/departments/${departmentId}/members/${memberId}`);
    return response.data;
  },
};