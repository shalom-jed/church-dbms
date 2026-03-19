import apiClient from '../lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  member?: any;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return user;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};