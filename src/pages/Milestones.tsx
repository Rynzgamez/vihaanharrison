import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import ActivityFormModal from "@/components/ActivityFormModal";
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
  const { isAdmin } = useAdminAuth();

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

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-activities', {
        body: { action: 'delete', activityId: id }
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Beyond <span className="text-accent">Code</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Key achievements, recognitions, and impactful moments that define my journey</p>
        </motion.div>

        <div className="flex justify-end items-center mb-12">
          {isAdmin && (
            <Button onClick={() => setShowActivityForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" />Add Activity
            </Button>
          )}
        </div>

        <ActivityFormModal open={showActivityForm} onOpenChange={handleFormClose} onSuccess={fetchActivities} activity={editingActivity} />

        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center">No activities yet.</p>
        ) : (
          <div className="space-y-12">
            {Object.entries(categorizedActivities).map(([category, categoryActivities]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-6 text-accent">{category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryActivities.map((activity, index) => (
                    <motion.div key={activity.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }} className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-accent font-semibold">{activity.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{activity.date}</span>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(activity)} className="h-8 w-8"><Edit className="h-4 w-4 text-accent" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(activity.id)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{activity.title}</h3>
                      <p className="text-muted-foreground">{activity.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;
