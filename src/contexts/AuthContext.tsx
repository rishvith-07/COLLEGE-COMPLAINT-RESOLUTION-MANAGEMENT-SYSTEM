import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { SafeUser, UserRole } from '../types';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: SafeUser) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: loggedInUser, token: authToken } = res.data.data;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const statusMsg = err.response?.status ? `Error ${err.response.status}: ${err.response.statusText || 'Server Error'}` : null;
      return {
        success: false,
        message: serverMsg || statusMsg || err.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        const { user: registeredUser, token: authToken } = res.data.data;
        setUser(registeredUser);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const statusMsg = err.response?.status ? `Error ${err.response.status}: ${err.response.statusText || 'Server Error'}` : null;
      return {
        success: false,
        message: serverMsg || statusMsg || err.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => { });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: SafeUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
