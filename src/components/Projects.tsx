import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  impact: string;
  github_url?: string;
  live_url?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('date', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="projects" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="bg-gradient-accent bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Innovative solutions combining AI, sustainability, and social impact.{" "}
            <Link to="/projects" className="text-accent hover:underline">
              View all projects →
            </Link>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group"
            >
              <div className="h-2 gradient-primary" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm text-primary font-semibold">{project.category}</span>
                  <div className="flex gap-2">
                    {project.github_url && (
                      <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-smooth" asChild>
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github size={18} />
                        </a>
                      </Button>
                    )}
                    {project.live_url && (
                      <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-smooth" asChild>
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={18} />
                        </a>
                      </Button>
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
    </section>
  );
};

export default Projects;
