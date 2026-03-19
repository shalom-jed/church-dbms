import apiClient from '../lib/axios';

export const attendanceService = {
  // Sunday Service
  async createSundayService(data: any) {
    const response = await apiClient.post('/attendance/sunday', data);
    return response.data.data;
  },

  async recordSundayAttendance(serviceId: string, attendees: any[]) {
    const response = await apiClient.post(`/attendance/sunday/${serviceId}`, {
      attendees,
    });
    return response.data.data;
  },

  async getSundayServices(limit: number = 10) {
    const response = await apiClient.get('/attendance/sunday', {
      params: { limit },
    });
    return response.data.data;
  },

  // Small Group
  async recordSmallGroupAttendance(data: any) {
    const response = await apiClient.post('/attendance/small-group', data);
    return response.data.data;
  },

  async getSmallGroupAttendance(groupId: string, limit: number = 20) {
    const response = await apiClient.get(`/attendance/small-group/${groupId}`, {
      params: { limit },
    });
    return response.data.data;
  },

  // Department
  async recordDepartmentAttendance(data: any) {
    const response = await apiClient.post('/attendance/department', data);
    return response.data.data;
  },

  async getDepartmentAttendance(departmentId: string, limit: number = 20) {
    const response = await apiClient.get(`/attendance/department/${departmentId}`, {
      params: { limit },
    });
    return response.data.data;
  },
};