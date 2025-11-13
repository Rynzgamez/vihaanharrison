import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import ActivityFormModal from "@/components/ActivityFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CursorEffect from "@/components/CursorEffect";

interface Activity {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
}

const Milestones = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const { isAuthenticated, login } = useAdminAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const success = await login(password);
    if (success) {
      toast.success('Authenticated successfully');
      setShowPasswordPrompt(false);
      setPassword("");
    } else {
      toast.error('Invalid password');
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-activities', {
        body: { action: 'delete', id }
      });

      if (error) throw error;
      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleFormClose = () => {
    setShowActivityForm(false);
    setEditingActivity(undefined);
  };

  // Group activities by category
  const categorizedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CursorEffect />
      <Navigation />
      <div className="container mx-auto px-6 py-24 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Beyond <span className="text-accent">Code</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Key achievements, recognitions, and impactful moments that define my journey
          </p>
        </motion.div>

        <div className="flex justify-end items-center mb-12">
          <div className="flex gap-3">
            {isAuthenticated && (
              <Button 
                onClick={() => setShowActivityForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          )}
          
          {!isAuthenticated && (
              <Dialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
                <DialogTrigger asChild>
                  <Button variant="outline">Admin Access</Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Admin Authentication</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                    <Button onClick={handleLogin} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  </div>

        <ActivityFormModal 
          open={showActivityForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchActivities}
          activity={editingActivity}
        />

        {Object.keys(categorizedActivities).length > 0 ? (
          Object.entries(categorizedActivities).map(([category, items], categoryIndex) => (
            <div key={category} className="mb-16">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold mb-6 text-accent"
              >
                {category}
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6">
                {items.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-accent font-semibold">{activity.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{activity.date}</span>
                        {isAuthenticated && (
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(activity)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4 text-accent" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(activity.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{activity.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No milestones to display yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;
