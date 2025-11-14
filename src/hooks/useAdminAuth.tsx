import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect } from 'react';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  }
}));

// Hook to initialize auth state
export const useInitializeAuth = () => {
  const { setUser, setIsAdmin, setLoading } = useAdminAuth();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
      
      if (user) {
        // Check if user has admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);
        
        if (user) {
          // Defer role check to avoid blocking
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();
            
            setIsAdmin(!!roleData);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);
};
