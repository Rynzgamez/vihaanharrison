import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { BookOpen, Users, Code, Palette, Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import ActivityFormModal from "@/components/ActivityFormModal";

interface Activity {
  id: string;
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date?: string;
}

const foundationSections = [
  {
    id: "academic",
    title: "Academic Foundations",
    icon: BookOpen,
    description: "Rigorous coursework, competitions, and consistent performance over time that built analytical thinking and intellectual discipline.",
    categories: ["Academic & Scholarly Achievements"]
  },
  {
    id: "leadership",
    title: "Early Leadership & Communication",
    icon: Users,
    description: "MUN participation, student leadership roles, and initiative ownership that developed negotiation, public speaking, and systems-level thinking.",
    categories: ["Model United Nations (MUN) & Public Speaking", "Leadership, Volunteering & Environmental Action"]
  },
  {
    id: "technical",
    title: "Early Technical Exposure",
    icon: Code,
    description: "First encounters with AI systems, coding competitions, robotics, and experimentation that sparked a trajectory in technology.",
    categories: ["Technology, Coding & Innovation"]
  },
  {
    id: "creative",
    title: "Creative & Athletic Discipline",
    icon: Palette,
    description: "Arts, sports, and photography—framed as discipline, resilience, and performance under pressure.",
    categories: ["Arts, Athletics & Personal Passions"]
  },
  {
    id: "recognition",
    title: "Recognition & Milestones",
    icon: Trophy,
    description: "Key honors and certifications that reflect commitment to excellence across multiple domains.",
    categories: ["Recognition & Awards"]
  }
];

const Foundations = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
        .order('start_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load foundations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-activities', {
        body: { action: 'delete', activityId: id }
      });

      if (error) throw error;
      toast.success('Item deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleFormClose = () => {
    setShowActivityForm(false);
    setEditingActivity(undefined);
  };

  const getActivitiesForSection = (section: typeof foundationSections[0]) => {
    return activities.filter(activity => 
      section.categories.some(cat => 
        activity.category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(activity.category.toLowerCase())
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading foundations...</p>
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
            <span className="text-accent">Foundations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The academic, leadership, and experiential foundations that shaped my approach 
            to technology, design, and responsibility. These early experiences built the 
            analytical rigor, discipline, and systems thinking that inform my current work.
          </p>
        </motion.div>

        {isAdmin && (
          <div className="flex justify-end mb-8">
            <Button 
              onClick={() => setShowActivityForm(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Foundation Item
            </Button>
          </div>
        )}

        <ActivityFormModal 
          open={showActivityForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchActivities}
          activity={editingActivity}
        />

        <div className="max-w-4xl mx-auto space-y-6">
          {foundationSections.map((section, index) => {
            const sectionActivities = getActivitiesForSection(section);
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-elegant overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full p-6 flex items-start gap-4 text-left hover:bg-muted/20 transition-smooth"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-accent" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  <ChevronDown 
                    className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    size={24} 
                  />
                </button>

                {isExpanded && sectionActivities.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-6 space-y-4">
                      {sectionActivities.map((activity) => (
                        <div 
                          key={activity.id}
                          className="bg-background rounded-lg p-4 border border-border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{activity.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  {activity.end_date && ` – ${new Date(activity.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1 ml-4">
                                <Button size="icon" variant="ghost" onClick={() => handleEdit(activity)} className="h-8 w-8">
                                  <Edit className="h-4 w-4 text-accent" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(activity.id)} className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {isExpanded && sectionActivities.length === 0 && (
                  <div className="border-t border-border p-6">
                    <p className="text-muted-foreground text-center text-sm">
                      No items in this section yet.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Foundations;
