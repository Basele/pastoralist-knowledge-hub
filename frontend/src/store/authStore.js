import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data;
      },

      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data;
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', {});
        } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        // Refresh token is in HTTP-only cookie, sent automatically
        const { data } = await api.post('/auth/refresh', {});
        set({ accessToken: data.accessToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data.accessToken;
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'pikh-auth',
      // Only persist user and accessToken — NOT refresh token (now in HTTP-only cookie)
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
