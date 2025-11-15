import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";

const ALLOWED_EMAILS = [
  "vihaanharrison@gmail.com",
  "s12281.dpssharjah@gmail.com"
];

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

// Initialize auth state
export const useInitializeAuth = () => {
  const { setUser, setIsAdmin, setLoading } = useAdminAuth();

  // Helper: determine if a user is admin
  const updateAdminStatus = (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const email = user.email?.toLowerCase() ?? "";
    const isAllowed = ALLOWED_EMAILS.includes(email);
    setIsAdmin(isAllowed);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
      updateAdminStatus(user);
      setLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);
        updateAdminStatus(user);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);
};
