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

const ALLOWED_EMAILS = [
  "vihaanharrison@gmail.com",
  "s12281.dpssharjah@gmail.com"
];

const ACCESS_CODE = "Harrison67Vihaan";

const Auth = () => {
  useInitializeAuth();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only redirect if user is logged in AND they're not on the auth page intentionally
    if (user && window.location.pathname !== "/auth") {
      navigate("/");
    }
  }, [user, navigate]);

  const ADMIN_PASSWORD = "0bby4l!3n";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email is in the allowed list
      const normalizedEmail = email.toLowerCase().trim();
      if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
        toast.error('Access denied. This email is not authorized for admin access.');
        setLoading(false);
        return;
      }

      // Try to sign in with provided password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (signInError) {
        // If sign in fails, check if it's because account doesn't exist
        if (signInError.message.includes('Invalid login credentials')) {
          // Try to create account with admin password
          const { error: signUpError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: ADMIN_PASSWORD,
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Now sign in with the admin password
          const { error: retrySignInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: ADMIN_PASSWORD
          });
          
          if (retrySignInError) throw retrySignInError;
        } else {
          throw signInError;
        }
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
      if (accessCode !== ACCESS_CODE) {
        toast.error('Invalid access code. Please try again.');
        setLoading(false);
        return;
      }

      // Sign in with the first allowed email using admin password
      const { error } = await supabase.auth.signInWithPassword({
        email: ALLOWED_EMAILS[0],
        password: ADMIN_PASSWORD
      });
      
      if (error) {
        // If account doesn't exist, create it
        const { error: signUpError } = await supabase.auth.signUp({
          email: ALLOWED_EMAILS[0],
          password: ADMIN_PASSWORD,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Sign in after creating account
        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: ALLOWED_EMAILS[0],
          password: ADMIN_PASSWORD
        });
        
        if (retrySignInError) throw retrySignInError;
      }
      
      toast.success('Welcome to Admin Hub!');
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
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
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="code">Access Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the secure admin access code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Access with Code'}
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
