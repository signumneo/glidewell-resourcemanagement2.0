import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth';

// Mock authentication - replace with real API calls
const mockLogin = async (username: string, password: string): Promise<{ user: User; token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password) {
        resolve({
          user: {
            id: '1',
            username,
            email: `${username}@example.com`,
            role: 'admin',
            avatar: `https://ui-avatars.com/api/?name=${username}&background=1890ff&color=fff`,
          },
          token: 'mock-jwt-token-' + Date.now(),
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const { user, token } = await mockLogin(username, password);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
