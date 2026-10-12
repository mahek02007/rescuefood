import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { api, setStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, preferredRole?: UserRole) => Promise<boolean> | boolean;
  demoLogin: (role: UserRole) => void;
  register: (userData: Partial<User> & { password?: string }) => Promise<boolean> | void;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void> | void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'foodrescue_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from backend or localStorage
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
          }
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Failed to parse user session:', e);
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

  const login = async (email: string, password?: string, preferredRole?: UserRole): Promise<boolean> => {
    // 1. Attempt backend login
    try {
      const res = await api.auth.login(email, password || 'FoodRescue2026!');
      if (res.success && res.data?.user && res.data?.token) {
        setStoredToken(res.data.token);
        saveUser(res.data.user);
        return true;
      }
    } catch {
      // Backend unavailable or database not yet connected, fallback gracefully
    }

    // 2. Fallback to demo credentials or standard session
    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (preferredRole && u.role === preferredRole)
    );

    if (matched) {
      saveUser(matched);
      return true;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      phone: '+1 (555) 012-3456',
      role: preferredRole || 'donor',
      organization: preferredRole === 'donor' ? 'Gourmet Bistro Co.' : preferredRole === 'ngo' ? 'Community Table Initiative' : undefined,
      address: '100 Metro Avenue, Suite 200',
      city: 'Metropolis',
      area: 'Downtown',
      pincode: '94103',
      latitude: 37.7749,
      longitude: -122.4194,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isVerified: true,
      verificationStatus: 'verified',
      joinedDate: new Date().toISOString().split('T')[0],
      totalMealsRescued: 0,
      totalDonations: 0,
    };
    saveUser(newUser);
    return true;
  };

  const demoLogin = (role: UserRole) => {
    const user = DEMO_USERS[role] || DEMO_USERS.donor;
    saveUser(user);
  };

  const register = async (userData: Partial<User> & { password?: string }): Promise<boolean> => {
    const role = userData.role || 'donor';

    // 1. Attempt backend registration
    try {
      if (userData.name && userData.email) {
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
      }
    } catch {
      // Backend not yet connected, fallback gracefully
    }

    // 2. Client-side fallback
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'User',
      email: userData.email || 'user@foodrescue.org',
      phone: userData.phone || '+1 (555) 000-1111',
      role: role,
      organization: userData.organization || (role === 'donor' ? 'Culinary Partner' : role === 'ngo' ? 'Local Shelter Pantry' : undefined),
      address: userData.address || '500 Community Blvd',
      city: userData.city || 'Metropolis',
      area: userData.area || 'Downtown Hub',
      pincode: userData.pincode || '94105',
      latitude: userData.latitude || 37.7749,
      longitude: userData.longitude || -122.4194,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'User')}`,
      isVerified: role !== 'ngo',
      verificationStatus: role === 'ngo' ? 'pending' : 'verified',
      joinedDate: new Date().toISOString().split('T')[0],
      totalMealsRescued: 0,
      totalDonations: 0,
      totalDeliveries: 0,
    };
    saveUser(newUser);
    return true;
  };

  const logout = () => {
    saveUser(null);
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await api.auth.updateProfile(updatedData);
      if (res.success && res.data?.user) {
        saveUser(res.data.user);
        return;
      }
    } catch {
      // Offline fallback
    }

    const updated: User = {
      ...currentUser,
      ...updatedData,
    };
    saveUser(updated);
  };

  const switchRole = (role: UserRole) => {
    if (DEMO_USERS[role]) {
      saveUser(DEMO_USERS[role]);
    } else if (currentUser) {
      saveUser({ ...currentUser, role });
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
