import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
                onClick={() => setShowProjectForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
              <Button 
                onClick={() => setShowActivityForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent/20" />

          {workItems.map((item, index) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="relative pl-20 pb-12 group"
            >
              <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-accent shadow-glow group-hover:scale-125 transition-smooth" />

              <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-accent" />
                    <span className="text-sm text-muted-foreground">
                      {formatDateRange(item.start_date, item.end_date)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {item.type === 'project' && (
                      <Button size="icon" variant="ghost" onClick={() => setViewingProject(item)}>
                        <Eye size={16} />
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                          <Edit size={16} className="text-accent" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item)}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
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
