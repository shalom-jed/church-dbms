import apiClient from '../lib/axios';

export const eventService = {
  async getAll(filters?: any) {
    const response = await apiClient.get('/events', { params: filters });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/events', data);
    return response.data.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  async addExpense(eventId: string, data: any) {
    const response = await apiClient.post(`/events/${eventId}/expenses`, data);
    return response.data.data;
  },

  async getExpenses(eventId: string) {
    const response = await apiClient.get(`/events/${eventId}/expenses`);
    return response.data.data;
  },
};