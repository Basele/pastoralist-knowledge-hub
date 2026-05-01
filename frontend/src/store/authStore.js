import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data;
      },

      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data;
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', { refreshToken: get().refreshToken });
        } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        const { data } = await api.post('/auth/refresh', { refreshToken: get().refreshToken });
        set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data.accessToken;
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'pikh-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated }) }
  )
);
