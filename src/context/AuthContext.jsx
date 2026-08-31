import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // 1. Intercept URL search params if redirected from Google OAuth
      if (typeof window !== 'undefined' && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlUser = urlParams.get('user');

        if (urlToken && urlUser) {
          const parsedUser = JSON.parse(decodeURIComponent(urlUser));
          localStorage.setItem('tunekey_token', urlToken);
          localStorage.setItem('tunekey_user', JSON.stringify(parsedUser));
          // Clean the query parameters from URL bar without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
          return parsedUser;
        }
      }

      // 2. Otherwise load from local storage
      const stored = localStorage.getItem('tunekey_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error initializing user from storage / URL:', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

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
          // Keep current state if offline or token still active
        });
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
