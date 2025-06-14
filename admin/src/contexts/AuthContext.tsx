'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { adminAPI, userAPI } from '@/lib/api';
import {adminEndpoint} from '@/lib/adminapi';
import {userEndpoint} from '@/lib/frontapis';
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  adminLevel: string;
  isActive: boolean;
}

type AuthUser = User | Admin | null;

interface AuthContextType {
  user: AuthUser;
  userType: 'user' | 'admin' | null;
  login: (email: string, password: string, type: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<AuthUser>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

 const checkAuth = async () => {
    try {
      // Check for admin token first
      const adminToken = localStorage.getItem('admin_token');
      const userToken = localStorage.getItem('user_token');
      if (adminToken) {
        // alert('Admin token found');
        try {
          const adminData = await adminEndpoint.getProfile();
          if (adminData.role === 'admin') {
            setUser(adminData);
            setUserType('admin');
            return;
          } else {
            localStorage.removeItem('admin_token');
          }
        } catch (error) {
          localStorage.removeItem('admin_token');
        }
      }
      
      if (userToken) {
        try {
          const userData = await userEndpoint.getProfile();
          setUser(userData);
          setUserType('user');
          return;
        } catch (error) {
          localStorage.removeItem('user_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear all tokens on error
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_token');
    } finally {
      setLoading(false);
    }
  };

   const login = async (email: string, password: string, type: 'user' | 'admin'): Promise<boolean> => {

    try {
      let data;
      
      if (type === 'admin') {
        data = await adminEndpoint.login(email, password);
        console.log('Admin login data:', data);
        if (data.type === 'admin') {
          localStorage.setItem('admin_token', data.access_token);
          localStorage.removeItem('user_token'); // Clear user token if exists
          setUser(data.user);
          setUserType('admin');
          router.push('/admin');
          return true;
        }
      } else {
        data = await userEndpoint.login(email, password);
        // console.log('User login data:', data);
        if (data.type === 'user') {
          localStorage.setItem('user_token', data.access_token);
          localStorage.removeItem('admin_token'); // Clear admin token if exists
          setUser(data.user);
          setUserType('user');
          router.push('/dashboard'); // User dashboard
          return true;
        }
      }
      
      throw new Error(`${type} access required`);
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_token');
    setUser(null);
    setUserType(null);
    router.push('/login');
  };
  const isAdmin = userType === 'admin';
  const isUser = userType === 'user';

  return (
     <AuthContext.Provider value={{ 
      user, 
      userType, 
      login, 
      logout, 
      loading, 
      isAdmin, 
      isUser 
    }}>
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