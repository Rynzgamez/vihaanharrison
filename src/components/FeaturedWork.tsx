import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const FeaturedWork = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<Project | undefined>();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('start_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <section id="work" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Featured <span className="text-accent">Work</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI systems, technical projects, and design work demonstrating 
            systems thinking and professional execution.
          </p>
        </motion.div>

        <ProjectDetailModal
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(undefined)}
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group cursor-pointer"
              onClick={() => setViewingProject(project)}
            >
              <div className="h-2 gradient-accent" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm text-accent font-semibold">{project.category}</span>
                  <Badge variant="secondary">Featured</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-smooth text-foreground">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags?.slice(0, 3).map((tag) => (
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

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No featured projects yet.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/work">
              View All Work <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedWork;
