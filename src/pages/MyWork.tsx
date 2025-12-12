import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Calendar, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import ProjectFormModal from "@/components/ProjectFormModal";
import ActivityFormModal from "@/components/ActivityFormModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import CursorEffect from "@/components/CursorEffect";

interface WorkItem {
  id: string;
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date?: string;
  date?: string;
  type: 'project' | 'activity';
  image_urls?: string[];
  tags?: string[];
  github_url?: string;
  live_url?: string;
  writeup?: string;
  impact?: string;
}

const categoryColors: Record<string, string> = {
  "Academic & Scholarly Achievements": "bg-emerald-500",
  "Technology, Coding & Innovation": "bg-accent",
  "Leadership, Volunteering & Environmental Action": "bg-green-500",
  "Model United Nations (MUN) & Public Speaking": "bg-purple-500",
  "Arts, Athletics & Personal Passions": "bg-pink-500",
  "Recognition & Awards": "bg-amber-500",
};

const MyWork = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | undefined>();
  const [viewingProject, setViewingProject] = useState<WorkItem | undefined>();
  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    fetchAllWork();
  }, []);

  const fetchAllWork = async () => {
    try {
      const [projectsRes, activitiesRes] = await Promise.all([
        supabase.from('projects').select('*').order('start_date', { ascending: false }),
        supabase.from('activities').select('*').order('start_date', { ascending: false })
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (activitiesRes.error) throw activitiesRes.error;

      const projects: WorkItem[] = (projectsRes.data || []).map(p => ({ ...p, type: 'project' as const }));
      const activities: WorkItem[] = (activitiesRes.data || []).map(a => ({ ...a, type: 'activity' as const }));

      const combined = [...projects, ...activities].sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );

      setWorkItems(combined);
    } catch (error) {
      console.error('Error fetching work items:', error);
      toast.error('Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: WorkItem) => {
    setEditingItem(item);
    if (item.type === 'project') {
      setShowProjectForm(true);
    } else {
      setShowActivityForm(true);
    }
  };

  const handleDelete = async (item: WorkItem) => {
    if (!confirm(`Are you sure you want to delete this ${item.type}?`)) return;

    try {
      const functionName = item.type === 'project' ? 'manage-projects' : 'manage-activities';
      const idField = item.type === 'project' ? 'projectId' : 'activityId';
      
      const { error } = await supabase.functions.invoke(functionName, {
        body: { action: 'delete', [idField]: item.id }
      });

      if (error) throw error;
      toast.success(`${item.type === 'project' ? 'Project' : 'Activity'} deleted successfully`);
      fetchAllWork();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (end) {
      const endDate = new Date(end);
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

  const getCategoryColor = (category: string, type: 'project' | 'activity') => {
    if (type === 'activity') return "bg-[hsl(280,70%,60%)]";
    return categoryColors[category] || "bg-accent";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading my work...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CursorEffect />
      <Navigation />
      <div className="container mx-auto px-6 py-24 mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-foreground"
        >
          My <span className="text-accent">Work</span>
        </motion.h1>

        <div className="flex gap-3 mb-12">
          {isAdmin && (
            <>
              <Button 
                onClick={() => {
                  setEditingItem(undefined);
                  setShowProjectForm(true);
                }}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
              <Button 
                onClick={() => {
                  setEditingItem(undefined);
                  setShowActivityForm(true);
                }}
                className="bg-[hsl(280,70%,60%)] hover:bg-[hsl(280,70%,50%)] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </>
          )}
        </div>

        <ProjectFormModal 
          open={showProjectForm}
          onOpenChange={(open) => {
            setShowProjectForm(open);
            if (!open) setEditingItem(undefined);
          }}
          onSuccess={fetchAllWork}
          editProject={editingItem?.type === 'project' ? editingItem : undefined}
        />

        <ActivityFormModal 
          open={showActivityForm}
          onOpenChange={(open) => {
            setShowActivityForm(open);
            if (!open) setEditingItem(undefined);
          }}
          onSuccess={fetchAllWork}
          activity={editingItem?.type === 'activity' ? editingItem : undefined}
        />

        <ProjectDetailModal
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(undefined)}
        />

        {/* Card Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workItems.map((item, index) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-smooth h-full flex flex-col relative overflow-hidden">
                {/* Category color indicator */}
                <div className={`absolute top-0 left-0 w-full h-1 ${getCategoryColor(item.category, item.type)}`} />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getCategoryColor(item.category, item.type)}`} />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.type === 'activity' ? 'Activity' : 'Project'}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.type === 'project' && (
                      <Button size="icon" variant="ghost" onClick={() => setViewingProject(item)} className="h-8 w-8">
                        <Eye size={14} />
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8">
                          <Edit size={14} className="text-accent" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item)} className="h-8 w-8">
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{formatDateRange(item.start_date, item.end_date)}</span>
                </div>

                <span className={`text-xs font-semibold uppercase tracking-wide ${item.type === 'activity' ? 'text-[hsl(280,70%,60%)]' : 'text-accent'}`}>
                  {item.category}
                </span>
                <h3 className="text-lg font-bold mt-2 mb-2 text-foreground line-clamp-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-xs rounded-full text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-muted-foreground">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyWork;
