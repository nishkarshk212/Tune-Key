import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tunekey_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tunekey_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('tunekey_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('tunekey_token', res.data.token);
      localStorage.setItem('tunekey_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    if (res.data.success) {
      localStorage.setItem('tunekey_token', res.data.token);
      localStorage.setItem('tunekey_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Google auth failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      localStorage.setItem('tunekey_token', res.data.token);
      localStorage.setItem('tunekey_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('tunekey_token');
    localStorage.removeItem('tunekey_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('tunekey_user', JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('tunekey_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
