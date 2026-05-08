'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/users.service';
import { User } from '@/types';

interface SignupData {
  name: string;
  email: string;
  password: string;
  contact_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const syncLocationSelection = (user: User | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user?.location_id) {
    localStorage.removeItem('locationId');
    return;
  }

  if (user.role === 'admin') {
    const storedLocationId = localStorage.getItem('locationId');
    localStorage.setItem('locationId', storedLocationId || user.location_id);
    return;
  }

  localStorage.setItem('locationId', user.location_id);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token by getting current user
      const response = await usersService.getMe();
      
      if (response.success && response.data) {
        setUser(response.data);
        syncLocationSelection(response.data);
      } else {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('locationId');
        setUser(null);
      }
    } catch {
      // Token invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('locationId');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await usersService.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        syncLocationSelection(response.data.user);
        router.push('/dashboard');
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      // Create admin account (automatically activated)
      const signupResponse = await usersService.signup(data);
      
      if (!signupResponse.success || !signupResponse.data) {
        throw new Error(signupResponse.error || 'Signup failed');
      }

      // Auto-login after successful signup
      const loginResponse = await usersService.login(data.email, data.password);
      
      if (loginResponse.success && loginResponse.data) {
        setUser(loginResponse.data.user);
        syncLocationSelection(loginResponse.data.user);
        router.push('/dashboard');
      } else {
        throw new Error('Account created but login failed. Please try logging in.');
      }
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error('Signup failed');
    }
  };

  const logout = () => {
    usersService.logout();
    localStorage.removeItem('locationId');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

