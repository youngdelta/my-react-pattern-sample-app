import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: (userData) =>
        set({
          user: userData,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
        }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
