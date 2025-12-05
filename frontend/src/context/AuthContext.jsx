import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const stored = window.localStorage.getItem('cms_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (_) {}
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (token && user) {
      window.localStorage.setItem('cms_auth', JSON.stringify({ token, user }));
    } else {
      window.localStorage.removeItem('cms_auth');
    }
  }, [token, user]);
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
  };
  const value = { user, token, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  return useContext(AuthContext);
}