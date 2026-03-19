import apiClient from '../lib/axios';

export const reportService = {
  async getDashboardStats() {
    const response = await apiClient.get('/reports/dashboard');
    return response.data.data;
  },

  async getMembershipReport() {
    const response = await apiClient.get('/reports/membership');
    return response.data.data;
  },

  async getAttendanceReport(startDate?: string, endDate?: string) {
    const response = await apiClient.get('/reports/attendance', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getAbsenteeReport(startDate?: string, endDate?: string) {
    const response = await apiClient.get('/reports/absentees', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};