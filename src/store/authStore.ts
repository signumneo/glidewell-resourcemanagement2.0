import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth';
import { AuthService } from '../services/authService';

const ENV_CONFIG = {
  baseUrl: 'https://fmmmes-service.unsdev.glidewellengineering.com',
  clientId: '5o44pb3bp05kejsbd6lro327bl',
  mesType: 'FmmMES',
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
