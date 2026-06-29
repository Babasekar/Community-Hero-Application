/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { getAuthToken } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  notifications: Notification[];
  login: (email: string, pass: string) => Promise<User>;
  signup: (name: string, email: string, pass: string, role: 'citizen' | 'volunteer' | 'gov' | 'admin') => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  refreshNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshUser = async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await authService.me();
      setUser(data.user);
      return data.user;
    } catch (e) {
      console.error('Session expired or error fetching me', e);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  const login = async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password: pass });
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string, role: 'citizen' | 'volunteer' | 'gov' | 'admin', extra?: any): Promise<User> => {
    setLoading(true);
    try {
      const data = await authService.signup({ name, email, password: pass, role, ...extra });
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setNotifications([]);
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('Error marking read', e);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 15000); // Poll notifications every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      notifications,
      login,
      signup,
      logout,
      refreshUser,
      refreshNotifications,
      markNotificationsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
