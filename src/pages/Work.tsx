import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { ExternalLink, Github, Plus, Edit, Trash2, Eye, Sparkles, BookOpen, Code, Users, Palette, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import ProjectFormModal from "@/components/ProjectFormModal";
import CursorEffect from "@/components/CursorEffect";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import AIContentProcessor from "@/components/AIContentProcessor";

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
  is_work: boolean;
  start_date: string;
  end_date?: string;
  image_urls?: string[];
}

// Category color mapping - matching Foundations
const categoryColors: Record<string, { bg: string; text: string; border: string; solid: string }> = {
  "Academic & Scholarly Achievements": { 
    bg: "bg-blue-500/10", 
    text: "text-blue-400", 
    border: "border-blue-500/30",
    solid: "bg-blue-500"
  },
  "Technology, Coding & Innovation": { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-400", 
    border: "border-emerald-500/30",
    solid: "bg-emerald-500"
  },
  "Leadership, Volunteering & Environmental Action": { 
    bg: "bg-amber-500/10", 
    text: "text-amber-400", 
    border: "border-amber-500/30",
    solid: "bg-amber-500"
  },
  "Model United Nations (MUN) & Public Speaking": { 
    bg: "bg-purple-500/10", 
    text: "text-purple-400", 
    border: "border-purple-500/30",
    solid: "bg-purple-500"
  },
  "Arts, Athletics & Personal Passions": { 
    bg: "bg-rose-500/10", 
    text: "text-rose-400", 
    border: "border-rose-500/30",
    solid: "bg-rose-500"
  },
  "Recognition & Awards": { 
    bg: "bg-yellow-500/10", 
    text: "text-yellow-400", 
    border: "border-yellow-500/30",
    solid: "bg-yellow-500"
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  "Academic & Scholarly Achievements": BookOpen,
  "Technology, Coding & Innovation": Code,
  "Leadership, Volunteering & Environmental Action": Users,
  "Model United Nations (MUN) & Public Speaking": Users,
  "Arts, Athletics & Personal Passions": Palette,
  "Recognition & Awards": Trophy,
};

const categoryShortLabels: Record<string, string> = {
  "Academic & Scholarly Achievements": "Academic",
  "Technology, Coding & Innovation": "Technology",
  "Leadership, Volunteering & Environmental Action": "Leadership",
  "Model United Nations (MUN) & Public Speaking": "MUN",
  "Arts, Athletics & Personal Passions": "Arts & Athletics",
  "Recognition & Awards": "Recognition",
};

const Work = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
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
        .eq('is_work', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load work');
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

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || { 
      bg: "bg-accent/10", 
      text: "text-accent", 
      border: "border-accent/30",
      solid: "bg-accent"
    };
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || Code;
  };

  const featuredProjects = projects.filter(p => p.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading work...</p>
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
            Selected <span className="text-accent">Work</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI systems, technical projects, and design work that demonstrate 
            systems thinking and professional execution.
          </p>
        </motion.div>

        {isAdmin && (
          <div className="flex justify-end items-center mb-12 gap-3">
            <Button 
              onClick={() => setShowAIProcessor(true)}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Process Content
            </Button>
            <Button 
              onClick={() => setShowProjectForm(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Work
            </Button>
          </div>
        )}

        <ProjectFormModal 
          open={showProjectForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchProjects}
          editProject={editingProject}
          isWorkPage={true}
        />

        <AIContentProcessor
          open={showAIProcessor}
          onOpenChange={setShowAIProcessor}
          onSuccess={fetchProjects}
          defaultIsWork={true}
        />

        <ProjectDetailModal
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(undefined)}
        />

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-muted-foreground text-lg mb-4">No work items yet.</p>
            {isAdmin && (
              <p className="text-muted-foreground">
                Click "Add Work" to create your first work item.
              </p>
            )}
          </motion.div>
        ) : (
          <>
            {featuredProjects.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Featured Work</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map((project, index) => {
                    const style = getCategoryStyle(project.category);
                    const Icon = getCategoryIcon(project.category);
                    
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className={`bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group border ${style.border}`}
                      >
                        <div className={`h-2 ${style.solid}`} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`flex items-center gap-2 ${style.text}`}>
                              <Icon size={16} />
                              <span className="text-sm font-semibold">{categoryShortLabels[project.category] || project.category}</span>
                            </div>
                            <Badge variant="secondary" className={`${style.bg} ${style.text}`}>Featured</Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags?.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className={`px-3 py-1 ${style.bg} text-xs rounded-full ${style.text}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setViewingProject(project)}>
                                <Eye size={16} className="mr-1" /> View
                              </Button>
                              {project.github_url && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github size={16} />
                                  </a>
                                </Button>
                              )}
                              {project.live_url && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={16} />
                                  </a>
                                </Button>
                              )}
                              {isAdmin && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(project)}>
                                    <Edit size={16} className="text-accent" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(project.id)}>
                                    <Trash2 size={16} className="text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6">All Work</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => {
                  const style = getCategoryStyle(project.category);
                  const Icon = getCategoryIcon(project.category);
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                      className={`bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group border ${style.border}`}
                    >
                      <div className={`h-2 ${style.solid}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`flex items-center gap-2 ${style.text}`}>
                            <Icon size={16} />
                            <span className="text-sm font-semibold">{categoryShortLabels[project.category] || project.category}</span>
                          </div>
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
                          {project.tags?.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className={`px-3 py-1 ${style.bg} text-xs rounded-full ${style.text}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {project.end_date && ` – ${new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                          </span>
                          {project.impact && (
                            <Badge variant="secondary" className={`${style.bg} ${style.text}`}>
                              {project.impact}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Work;