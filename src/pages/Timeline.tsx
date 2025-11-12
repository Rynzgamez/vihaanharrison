import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
}

const Timeline = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, description, date')
        .order('date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-foreground"
        >
          Project <span className="text-accent">Timeline</span>
        </motion.h1>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent/20" />

          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative pl-20 pb-12 group"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-accent shadow-glow group-hover:scale-125 transition-smooth" />

              {/* Content */}
              <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={16} className="text-accent" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(project.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                  {project.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-2 text-foreground">{project.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
