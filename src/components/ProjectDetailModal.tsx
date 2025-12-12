import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Calendar, X } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  writeup?: string;
  tags?: string[];
  impact?: string;
  github_url?: string;
  live_url?: string;
  image_urls?: string[];
  start_date: string;
  end_date?: string;
}

interface ProjectDetailModalProps {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailModal = ({ project, open, onOpenChange }: ProjectDetailModalProps) => {
  if (!project) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden p-0 bg-card z-[200] top-[55%] [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col md:flex-row h-full max-h-[80vh]"
        >
          {/* Left Side - Text Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="secondary" className="mb-3">{project.category}</Badge>
                <h2 className="text-3xl font-bold text-foreground mb-2">{project.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>{formatDateRange(project.start_date, project.end_date)}</span>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)} className="shrink-0">
                <X size={20} />
              </Button>
            </div>

            {/* Short Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </div>

            {/* Long Description/Writeup */}
            {project.writeup && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Details</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.writeup}
                </p>
              </div>
            )}

            {/* Impact */}
            {project.impact && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Impact</h3>
                <p className="text-accent font-semibold">{project.impact}</p>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3">
              {project.github_url && (
                <Button variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github size={18} className="mr-2" />
                    View Code
                  </a>
                </Button>
              )}
              {project.live_url && (
                <Button variant="outline" asChild>
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={18} className="mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Right Side - Images/Media */}
          <div className="w-full md:w-2/5 bg-muted/30 p-6 overflow-y-auto">
            {project.image_urls && project.image_urls.length > 0 ? (
              <div className="space-y-4">
                {project.image_urls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg overflow-hidden shadow-elegant"
                  >
                    {url.endsWith('.pdf') ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-card hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-accent/20 rounded flex items-center justify-center">
                            <ExternalLink size={24} className="text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">PDF Document</p>
                            <p className="text-xs text-muted-foreground">Click to view</p>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <img
                        src={url}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No media available</p>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
