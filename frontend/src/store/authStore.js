import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      // Initialize auth state
      initialize: async () => {
        const { token } = get();
        if (token) {
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.get('/auth/me');
            set({ user: response.data.user, isInitialized: true });
          } catch (error) {
            // Token is invalid, clear it
            get().logout();
          }
        } else {
          set({ isInitialized: true });
        }
      },

      // Login function
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { user, token } = response.data;
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
          toast.success(`Welcome back, ${user.name}!`);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Login failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Register function
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/register', userData);
          const { user, token } = response.data;
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
          toast.success(`Welcome to Pet Adoption, ${user.name}!`);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Registration failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Logout function
      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await axios.put('/auth/profile', profileData);
          const { user } = response.data;
          
          set({ user, isLoading: false });
          toast.success('Profile updated successfully');
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Profile update failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
          await axios.put('/auth/change-password', {
            currentPassword,
            newPassword
          });
          
          set({ isLoading: false });
          toast.success('Password changed successfully');
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Password change failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Check if user has required role
      hasRole: (requiredRole) => {
        const { user } = get();
        if (!user) return false;
        
        if (Array.isArray(requiredRole)) {
          return requiredRole.includes(user.role);
        }
        
        return user.role === requiredRole;
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      // Check if user is shelter
      isShelter: () => {
        const { user } = get();
        return user?.role === 'shelter';
      },

      // Check if user is regular user
      isUser: () => {
        const { user } = get();
        return user?.role === 'user';
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);

// Initialize auth on app start
useAuthStore.getState().initialize();

// Add axios interceptor for token refresh/logout on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export { useAuthStore };
