import { create } from 'zustand';
import type { User } from '../types';
import { authService, type LoginCredentials, type RegisterData } from '../services/authService';
import { getRolesFromToken } from '../utils/jwtUtils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  refreshUser: () => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    console.log('refreshUser - User from service:', user);
    console.log('refreshUser - Is authenticated:', isAuthenticated);
    
    // Check roles from JWT token and update user role if needed
    if (user && isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenRoles = getRolesFromToken(token);
        console.log('refreshUser - Token roles:', tokenRoles);
        
        // Update user role from token if different
        if (tokenRoles.length > 0 && user.role !== tokenRoles[0]) {
          const updatedUser = { ...user, role: tokenRoles[0] };
          console.log('refreshUser - Updating user role from token:', updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser, isAuthenticated });
          return;
        }
      }
    }
    
    set({ user, isAuthenticated });
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during login',
        isLoading: false,
      });
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during registration',
        isLoading: false,
      });
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  requestPasswordReset: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await authService.requestPasswordReset(email);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred while requesting password reset',
        isLoading: false,
      });
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      await authService.resetPassword(token, newPassword);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred while resetting password',
        isLoading: false,
      });
    }
  },
})); 