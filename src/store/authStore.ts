import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth';
import { AuthService } from '../services/authService';

const ENV_CONFIG = {
  baseUrl: 'https://burmes-service.unsdev.glidewellengineering.com',
  clientId: '6l2ch9ogih7g34dpdqn8h105t6',
  mesType: 'BurMES',
};

const authService = new AuthService();

const realLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const { cognitoToken, userInfo } = await authService.login(
    ENV_CONFIG.clientId,
    ENV_CONFIG.mesType,
    ENV_CONFIG.baseUrl,
    email,
    password
  );

  return {
    user: {
      id: userInfo.useremail,
      username: userInfo.useremail.split('@')[0],
      email: userInfo.useremail,
      role: userInfo.accesslevel,
      avatar: `https://ui-avatars.com/api/?name=${userInfo.useremail.split('@')[0]}&background=1890ff&color=fff`,
    },
    token: cognitoToken,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const { user, token } = await realLogin(username, password);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('cognitoToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userInfo');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
