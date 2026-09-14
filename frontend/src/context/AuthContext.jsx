import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current authenticated user on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/user');
        setUser(response.data.user || response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/register', data);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send password reset link.';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  };

  const resetPassword = async (data) => {
    try {
      const response = await api.post('/reset-password', data);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password.';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
