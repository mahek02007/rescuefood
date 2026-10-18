import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  demoLogin: (role: UserRole) => Promise<boolean>;
  register: (userData: Partial<User> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'foodrescue_current_user_v1';

// Seeded account emails in the real database
const REAL_ROLE_ACCOUNTS: Record<UserRole, string> = {
  donor: 'donor@foodrescue.org',
  ngo: 'ngo@foodrescue.org',
  volunteer: 'volunteer@foodrescue.org',
  admin: 'admin@foodrescue.org',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from backend using verified JWT session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          const res = await api.auth.me();
          if (res.success && res.data?.user) {
            saveUser(res.data.user);
            setIsLoading(false);
            return;
          } else {
            // Token expired or invalid
            setStoredToken(null);
            localStorage.removeItem(STORAGE_KEY);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Failed to authenticate session:', e);
        setStoredToken(null);
        localStorage.removeItem(STORAGE_KEY);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const saveUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setStoredToken(null);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const res = await api.auth.login(email, password || 'FoodRescue2026!');
    if (res.success && res.data?.user && res.data?.token) {
      setStoredToken(res.data.token);
      saveUser(res.data.user);
      return true;
    }
    throw new Error(res.error || 'Invalid email or password.');
  };

  const demoLogin = async (role: UserRole): Promise<boolean> => {
    const targetEmail = REAL_ROLE_ACCOUNTS[role] || 'donor@foodrescue.org';
    return await login(targetEmail, 'FoodRescue2026!');
  };

  const register = async (userData: Partial<User> & { password?: string }): Promise<boolean> => {
    const role = userData.role || 'donor';
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required.');
    }

    const res = await api.auth.register({
      name: userData.name,
      email: userData.email,
      password: userData.password || 'FoodRescue2026!',
      role,
      phone: userData.phone,
      organization: userData.organization,
    });

    if (res.success && res.data?.user && res.data?.token) {
      setStoredToken(res.data.token);
      saveUser(res.data.user);
      return true;
    }

    throw new Error(res.error || 'Failed to create account.');
  };

  const logout = () => {
    saveUser(null);
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const res = await api.auth.updateProfile(updatedData);
    if (res.success && res.data?.user) {
      saveUser(res.data.user);
    } else {
      throw new Error(res.error || 'Failed to update profile.');
    }
  };

  const switchRole = async (role: UserRole) => {
    // In development mode, log into the real database account for that role
    if (REAL_ROLE_ACCOUNTS[role]) {
      try {
        await login(REAL_ROLE_ACCOUNTS[role], 'FoodRescue2026!');
      } catch (err) {
        console.error('Failed to switch to real database role account:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        switchRole,
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
