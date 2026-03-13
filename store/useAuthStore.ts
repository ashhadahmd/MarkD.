import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../services/portalService';

interface AuthState {
  isAuthenticated: boolean;
  rememberMe: boolean;
  regNo: string | null;
  password: string | null;
  profile: UserProfile | null;
  loginState: (regNo: string, password: string, profile: UserProfile, rememberMe: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  logoutState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      rememberMe: false,
      regNo: null,
      password: null,
      profile: null,
      loginState: (regNo, password, profile, rememberMe) => set({
        isAuthenticated: true,
        rememberMe,
        regNo,
        password,
        profile
      }),
      setProfile: (profile) => set({ profile }),
      logoutState: () => set({
        isAuthenticated: false,
        rememberMe: false,
        regNo: null,
        password: null,
        profile: null
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        if (!state.rememberMe) {
          return {
            isAuthenticated: false,
            rememberMe: false,
            regNo: null,
            password: null,
            profile: null
          };
        }
        return state;
      },
    }
  )
);
