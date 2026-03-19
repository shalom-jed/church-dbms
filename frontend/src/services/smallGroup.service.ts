import apiClient from '../lib/axios';

export interface SmallGroup {
  id: string;
  groupName: string;
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
  status: string;
  leaderId?: string;
  leaderMember?: any;
  members?: any[];
  _count?: {
    members: number;
  };
}

export const smallGroupService = {
  async getAll() {
    const response = await apiClient.get('/small-groups');
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/small-groups/${id}`);
    return response.data.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/small-groups', data);
    return response.data.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/small-groups/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/small-groups/${id}`);
    return response.data;
  },

  async addMember(groupId: string, memberId: string, role: string = 'MEMBER') {
    const response = await apiClient.post(`/small-groups/${groupId}/members`, {
      memberId,
      role,
    });
    return response.data.data;
  },

  async removeMember(groupId: string, memberId: string) {
    const response = await apiClient.delete(`/small-groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  async getAttendanceStats(groupId: string) {
    const response = await apiClient.get(`/small-groups/${groupId}/attendance-stats`);
    return response.data.data;
  },
};