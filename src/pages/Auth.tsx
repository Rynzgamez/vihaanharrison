import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAdminAuth, useInitializeAuth } from "@/hooks/useAdminAuth";
import CursorEffect from "@/components/CursorEffect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  useInitializeAuth();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && window.location.pathname !== "/auth") {
      navigate("/");
    }
  }, [user, navigate]);

  const [accessCode, setAccessCode] = useState("");
  const [activeTab, setActiveTab] = useState("email");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (signInError) {
        toast.error(signInError.message || 'Authentication failed');
        return;
      }

      // Ensure admin role for approved email on the backend, then refresh local admin state
      try {
        await supabase.functions.invoke('manage-roles', { body: { action: 'ensure_admin_for_email' } });
        const { data: { user: current } } = await supabase.auth.getUser();
        if (current) {
          const { data: hasRole } = await supabase.rpc('has_role', { _user_id: current.id, _role: 'admin' });
          const { setIsAdmin } = useAdminAuth.getState();
          setIsAdmin(hasRole === true);
        }
      } catch (roleErr) {
        console.warn('Role ensure failed:', roleErr);
      }
      
      toast.success('Welcome to Admin Hub!');
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use access code as password for the admin account
      const adminEmail = "vihaanharrison@gmail.com";
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: accessCode
      });
      
      if (signInError) {
        toast.error('Invalid access code');
        return;
      }

      // Ensure admin role for approved email on the backend, then refresh local admin state
      try {
        await supabase.functions.invoke('manage-roles', { body: { action: 'ensure_admin_for_email' } });
        const { data: { user: current } } = await supabase.auth.getUser();
        if (current) {
          const { data: hasRole } = await supabase.rpc('has_role', { _user_id: current.id, _role: 'admin' });
          const { setIsAdmin } = useAdminAuth.getState();
          setIsAdmin(hasRole === true);
        }
      } catch (roleErr) {
        console.warn('Role ensure failed:', roleErr);
      }
      
      toast.success('Welcome to Admin Hub!');
      navigate("/");
    } catch (error: any) {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <CursorEffect />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg border border-accent/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">
            Admin Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Authorized access only
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="code">Access Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@email.com"
                  className="border-accent/30 focus:border-accent"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="border-accent/30 focus:border-accent"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Admin Hub'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="code">
            <form onSubmit={handleAccessCodeLogin} className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Admin Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  placeholder="Enter access code"
                  className="border-accent/30 focus:border-accent"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Admin Hub'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
