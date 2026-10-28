import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserProfile, UserPreferences } from '../types';
import {
  api,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getStoredUser,
  setStoredUser,
} from '../services/api';

interface AuthContextType {
  token: string;
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  toastMessage: { text: string; isError?: boolean } | null;
  showToast: (message: string, isError?: boolean) => void;
  loginSession: (token: string, user: User) => void;
  logoutSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>(getStoredToken());
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshUserData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setStoredUser(data.user);
      setProfile(data.profile);
      setPreferences(data.preferences);
    } catch (err) {
      console.warn('Failed to fetch user session:', err);
      clearStoredToken();
      setToken('');
      setUser(null);
      setProfile(null);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [token]);

  const loginSession = (newToken: string, newUser: User) => {
    setStoredToken(newToken);
    setStoredUser(newUser);
    setToken(newToken);
    setUser(newUser);
    refreshUserData();
  };

  const logoutSession = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // Ignore logout API failures
    } finally {
      clearStoredToken();
      setToken('');
      setUser(null);
      setProfile(null);
      setPreferences(null);
      showToast('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        preferences,
        loading,
        toastMessage,
        showToast,
        loginSession,
        logoutSession,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
