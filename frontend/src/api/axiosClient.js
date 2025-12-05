import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});
api.interceptors.request.use((config) => {
  const stored = window.localStorage.getItem('cms_auth');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }
  return config;
});
export default api;