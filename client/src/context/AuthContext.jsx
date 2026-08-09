import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axios.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ledgerxUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const authUser = {
        ...(response.data?.user || { email: credentials.email }),
        token: response.data?.token,
      };
      setUser(authUser);
      localStorage.setItem('ledgerxUser', JSON.stringify(authUser));
      toast.success('Login successful');
      return authUser;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', payload);
      const authUser = {
        ...(response.data?.user || { email: payload.email, name: payload.name }),
        token: response.data?.token,
      };
      setUser(authUser);
      localStorage.setItem('ledgerxUser', JSON.stringify(authUser));
      toast.success('Registration successful');
      return authUser;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    } finally {
      setUser(null);
      localStorage.removeItem('ledgerxUser');
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, login, register, logout, loading, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
