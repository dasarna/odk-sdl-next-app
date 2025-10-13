import { create } from 'zustand';

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('odk-token') : null,
  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') localStorage.setItem('odk-token', token);
  },
  logout: () => {
    set({ token: null });
    if (typeof window !== 'undefined') localStorage.removeItem('odk-token');
  },
}));
