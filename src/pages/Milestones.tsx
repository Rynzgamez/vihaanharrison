import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

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
      <Navigation />
      <div className="container mx-auto px-6 py-24 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Beyond <span className="bg-gradient-accent bg-clip-text text-transparent">Code</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Leadership, sustainability, debate, and making a difference in the community
          </p>
        </motion.div>

        {Object.entries(categorizedActivities).map(([category, items], categoryIndex) => (
          <div key={category} className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="text-2xl font-bold mb-6 text-accent"
            >
              {category}
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6">
              {items.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar size={16} className="text-accent" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {activity.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No milestones to display yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;
