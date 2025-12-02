import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { ExternalLink, Github, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ProjectFormModal from "@/components/ProjectFormModal";
import CursorEffect from "@/components/CursorEffect";
import ProjectDetailModal from "@/components/ProjectDetailModal";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  impact: string;
  github_url?: string;
  live_url?: string;
  writeup?: string;
  is_featured: boolean;
  start_date: string;
  end_date?: string;
  image_urls?: string[];
}

const AllProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [viewingProject, setViewingProject] = useState<Project | undefined>();
  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-projects', {
        body: { action: 'delete', projectId: id }
      });

      if (error) throw error;
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleFormClose = () => {
    setShowProjectForm(false);
    setEditingProject(undefined);
  };


  const featuredProjects = projects.filter(p => p.is_featured).slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
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
            Project <span className="text-accent">Showcase</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Innovative solutions designed to inspire, create, and impact
          </p>
        </motion.div>

        <div className="flex justify-end items-center mb-12">
          <div className="flex gap-3">
            {isAdmin && (
              <Button 
                onClick={() => setShowProjectForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            )}
          </div>
        </div>

        <ProjectFormModal 
          open={showProjectForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchProjects}
          editProject={editingProject}
        />

        <ProjectDetailModal
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(undefined)}
        />

        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group"
                >
                  <div className="h-2 gradient-accent" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-accent font-semibold">{project.category}</span>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {project.impact && (
                      <div className="pt-4 border-t border-border">
                        <span className="text-sm font-semibold text-accent">{project.impact}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">All Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group"
              >
                <div className="h-2 gradient-primary" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm text-primary font-semibold">{project.category}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingProject(project)}>
                        <Eye size={18} />
                      </Button>
                      {project.github_url && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github size={18} />
                          </a>
                        </Button>
                      )}
                      {project.live_url && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={18} />
                          </a>
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(project)}>
                            <Edit size={18} className="text-accent" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(project.id)}>
                            <Trash2 size={18} className="text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.impact && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-sm font-semibold text-accent">{project.impact}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
