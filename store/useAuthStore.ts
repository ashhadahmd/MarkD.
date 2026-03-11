import { create } from 'zustand';
import { UserProfile } from '../services/portalService';

interface AuthState {
  isAuthenticated: boolean;
  regNo: string | null;
  password: string | null;
  profile: UserProfile | null;
  loginState: (regNo: string, password: string, profile: UserProfile) => void;
  setProfile: (profile: UserProfile) => void;
  logoutState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  regNo: null,
  password: null,
  profile: null,
  loginState: (regNo, password, profile) => set({ 
    isAuthenticated: true, 
    regNo, 
    password, 
    profile 
  }),
  setProfile: (profile) => set({ profile }),
  logoutState: () => set({ 
    isAuthenticated: false, 
    regNo: null, 
    password: null, 
    profile: null 
  }),
}));
