import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../api/client';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  setUserData: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const userData = await api.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Если токен невалидный, удаляем его
      await AsyncStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const setUserData = async (userData: User): Promise<void> => {
    try {
      // Токен уже сохранен в api.register/api.login
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUserData, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = (): UserContextType => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
