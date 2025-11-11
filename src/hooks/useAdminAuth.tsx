import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthState {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: async (password: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('admin-auth', {
            body: { password }
          });

          if (error) throw error;

          if (data.authenticated) {
            set({ isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Auth error:', error);
          return false;
        }
      },
      logout: () => set({ isAuthenticated: false })
    }),
    {
      name: 'admin-auth-storage'
    }
  )
);
