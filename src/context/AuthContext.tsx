import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import type { AuthResponse, ApiError } from '../types';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (googleToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  loading: boolean;
}

// Helper function to check if an email is admin
const checkIsAdmin = (email: string): boolean => {
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS;
  if (!adminEmails) return false;
  
  const adminList = adminEmails.split(',').map(e => e.trim().toLowerCase());
  return adminList.includes(email.toLowerCase());
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Function to decode JWT token (payload only, no validation)
  const decodeToken = (token: string): { email?: string; name?: string; sub?: string } | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Check if there's a saved token
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Try to restore user from token
      const decoded = decodeToken(savedToken);
      if (decoded && decoded.email) {
        const restoredUser: User = {
          id: decoded.sub || '',
          email: decoded.email,
          name: decoded.name,
          role: checkIsAdmin(decoded.email) ? 'admin' : 'user'
        };
        setUser(restoredUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (googleToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response: AuthResponse = await apiService.loginWithGoogle(googleToken);
      const { token: jwtToken, user: userData } = response;
      
      // Check if user is admin based on email
      const userWithRole = {
        ...userData,
        role: checkIsAdmin(userData.email) ? 'admin' : 'user' as const
      };
      
      setToken(jwtToken);
      setUser(userWithRole);
      localStorage.setItem('auth_token', jwtToken);
      
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      return { success: false, error: apiError.message };
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const isAuthenticated = (): boolean => {
    return !!token;
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.role === 'admin' || checkIsAdmin(user.email);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

