import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import ProjectFormModal from "@/components/ProjectFormModal";
import { Plus, ExternalLink, Github } from "lucide-react";
import CursorEffect from "@/components/CursorEffect";

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
  date: string;
}

const categories = {
  "academic-scholarly-achievements": "Academic & Scholarly Achievements",
  "technology-coding-innovation": "Technology, Coding & Innovation",
  "leadership-volunteering-environmental-action": "Leadership, Volunteering & Environmental Action",
  "model-united-nations-mun-public-speaking": "Model United Nations (MUN) & Public Speaking",
  "arts-athletics-personal-passions": "Arts, Athletics & Personal Passions",
  "recognition-awards": "Recognition & Awards"
};

const CategoryProjects = () => {
  const { categorySlug } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { isAdmin } = useAdminAuth();

  const categoryName = categories[categorySlug as keyof typeof categories] || "Projects";

  useEffect(() => {
    fetchProjects();
  }, [categoryName]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', categoryName)
        .order('date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-foreground"
          >
            <span className="text-accent">{categoryName}</span>
          </motion.h1>
          
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

        <ProjectFormModal 
          open={showProjectForm}
          onOpenChange={setShowProjectForm}
          onSuccess={fetchProjects}
          defaultCategory={categoryName}
        />

        {projects.length === 0 ? (
          <p className="text-muted-foreground text-center">No projects in this category yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group"
              >
                <div className="h-2 gradient-accent" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm text-accent font-semibold">{project.date}</span>
                    <div className="flex gap-2">
                      {project.github_url && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github size={18} className="text-foreground" />
                          </a>
                        </Button>
                      )}
                      {project.live_url && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={18} className="text-foreground" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.impact && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-sm font-semibold text-accent">{project.impact}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProjects;
