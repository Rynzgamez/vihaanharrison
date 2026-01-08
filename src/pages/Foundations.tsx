import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { BookOpen, Users, Code, Palette, Trophy, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
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

// All available categories with their colors
const allCategories = [
  "Academic & Scholarly Achievements",
  "Technology, Coding & Innovation",
  "Leadership, Volunteering & Environmental Action",
  "Model United Nations (MUN) & Public Speaking",
  "Arts, Athletics & Personal Passions",
  "Recognition & Awards",
];

// Category color mapping
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

// Short labels for category buttons
const categoryShortLabels: Record<string, string> = {
  "Academic & Scholarly Achievements": "Academic",
  "Technology, Coding & Innovation": "Technology",
  "Leadership, Volunteering & Environmental Action": "Leadership",
  "Model United Nations (MUN) & Public Speaking": "MUN",
  "Arts, Athletics & Personal Passions": "Arts & Athletics",
  "Recognition & Awards": "Recognition",
};

const Foundations = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
        .or('is_work.eq.false,is_work.is.null')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load foundations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-projects', {
        body: { action: 'delete', projectId: id }
      });

      if (error) throw error;
      toast.success('Item deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete item');
    }
  };

  // Filter projects by selected category
  const filteredProjects = selectedCategory 
    ? projects.filter(p => p.category === selectedCategory)
    : projects;

  // Get count of projects per category
  const getCategoryCount = (category: string) => {
    return projects.filter(p => p.category === category).length;
  };

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || { 
      bg: "bg-muted", 
      text: "text-muted-foreground", 
      border: "border-border",
      solid: "bg-muted"
    };
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || BookOpen;
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

        <ProjectDetailModal
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(undefined)}
        />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "bg-accent text-accent-foreground" : ""}
          >
            All Categories
          </Button>
          {allCategories.map((category) => {
            const style = getCategoryStyle(category);
            const Icon = getCategoryIcon(category);
            const count = getCategoryCount(category);
            const shortLabel = categoryShortLabels[category] || category.split(' ')[0];
            
            return (
              <Button
                key={category}
                variant="outline"
                onClick={() => setSelectedCategory(category)}
                className={`${selectedCategory === category ? style.bg + " " + style.border : ""} ${style.text} border ${style.border} hover:${style.bg}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {shortLabel}
                <span className="ml-2 text-xs opacity-60">({count})</span>
              </Button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-muted-foreground text-lg">
              {selectedCategory ? `No items in "${categoryShortLabels[selectedCategory] || selectedCategory}" yet.` : "No foundation items found."}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredProjects.map((project, index) => {
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
                        {isAdmin && (
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(project.id)}>
                            <Trash2 size={18} className="text-destructive" />
                          </Button>
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
                        <Badge variant="secondary" className={style.bg + " " + style.text}>
                          {project.impact}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Foundations;