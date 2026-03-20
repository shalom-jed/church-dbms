import apiClient from '../lib/axios';

export const attendanceService = {
  // Sunday Service
  async createSundayService(data: any) {
    const response = await apiClient.post('/attendance/sunday', data);
    return response.data.data;
  },

  async recordSundayAttendance(serviceId: string, attendees: any[]) {
    const response = await apiClient.post(`/attendance/sunday/${serviceId}/record`, { attendees });
    return response.data.data;
  },

  async getSundayServices(limit: number = 20) {
    const response = await apiClient.get('/attendance/sunday', { params: { limit } });
    return response.data.data;
  },

  async getSundayServiceById(id: string) {
    const response = await apiClient.get(`/attendance/sunday/${id}`);
    return response.data.data;
  },

  async updateSundayService(id: string, data: any) {
    const response = await apiClient.put(`/attendance/sunday/${id}`, data);
    return response.data.data;
  },

  async deleteSundayService(id: string) {
    const response = await apiClient.delete(`/attendance/sunday/${id}`);
    return response.data;
  },

  // Small Group
  async recordSmallGroupAttendance(data: any) {
    const response = await apiClient.post('/attendance/small-group', data);
    return response.data.data;
  },

  async getSmallGroupAttendance(groupId: string, limit: number = 20) {
    const response = await apiClient.get(`/attendance/small-group/${groupId}`, { params: { limit } });
    return response.data.data;
  },

  async deleteSmallGroupAttendance(id: string) {
    const response = await apiClient.delete(`/attendance/small-group/${id}`);
    return response.data;
  },

  // Department
  async recordDepartmentAttendance(data: any) {
    const response = await apiClient.post('/attendance/department', data);
    return response.data.data;
  },

  async getDepartmentAttendance(departmentId: string, limit: number = 20) {
    const response = await apiClient.get(`/attendance/department/${departmentId}`, { params: { limit } });
    return response.data.data;
  },

  async deleteDepartmentAttendance(id: string) {
    const response = await apiClient.delete(`/attendance/department/${id}`);
    return response.data;
  },
};