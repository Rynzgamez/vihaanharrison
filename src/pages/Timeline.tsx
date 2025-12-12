import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Calendar, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import CursorEffect from "@/components/CursorEffect";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date?: string;
  image_urls?: string[];
}

interface TimelinePhoto {
  id: string;
  url: string;
  position: number;
}

const Timeline = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPosition, setPhotoPosition] = useState("0");
  const [timelinePhotos, setTimelinePhotos] = useState<TimelinePhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { isAdmin } = useAdminAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.floor(latest * projects.length);
    setActiveIndex(Math.min(index, projects.length - 1));
  });

  useEffect(() => {
    fetchProjects();
    loadTimelinePhotos();
  }, []);

  const loadTimelinePhotos = () => {
    const saved = localStorage.getItem('timeline-photos');
    if (saved) {
      setTimelinePhotos(JSON.parse(saved));
    }
  };

  const saveTimelinePhotos = (photos: TimelinePhoto[]) => {
    localStorage.setItem('timeline-photos', JSON.stringify(photos));
    setTimelinePhotos(photos);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, description, start_date, end_date, image_urls')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `timeline/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, photoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      const newPhoto: TimelinePhoto = {
        id: Math.random().toString(),
        url: data.publicUrl,
        position: parseFloat(photoPosition)
      };

      saveTimelinePhotos([...timelinePhotos, newPhoto]);
      toast.success('Photo added to timeline');
      setShowPhotoDialog(false);
      setPhotoFile(null);
      setPhotoPosition("0");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const removePhoto = (id: string) => {
    saveTimelinePhotos(timelinePhotos.filter(p => p.id !== id));
  };

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    const startStr = startDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
    
    if (end) {
      const endDate = new Date(end);
      const endStr = endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <CursorEffect />
      <Navigation />
      <div className="container mx-auto px-6 py-24 mt-20">
        <div className="flex justify-between items-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-foreground"
          >
            Project <span className="text-accent">Timeline</span>
          </motion.h1>
          
          {isAdmin && (
            <Button onClick={() => setShowPhotoDialog(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
          )}
        </div>

        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent className="bg-card z-[200]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Timeline Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="photo" className="text-foreground">Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="position" className="text-foreground">
                  Position (0 = top, higher numbers = lower on timeline)
                </Label>
                <Input
                  id="position"
                  type="number"
                  value={photoPosition}
                  onChange={(e) => setPhotoPosition(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePhotoUpload} disabled={!photoFile}>
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scroll fade overlays */}
        <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-40" />
        <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-40" />

        <div className="relative" ref={timelineRef}>
          {/* Curved Timeline Line */}
          <svg 
            className="absolute left-8 top-0 bottom-0 w-4 h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <motion.path
              d={`M 8 0 ${projects.map((_, i) => {
                const y = i * 280 + 100;
                const curve = i % 2 === 0 ? 20 : -20;
                return `Q ${8 + curve} ${y - 70} 8 ${y}`;
              }).join(' ')} L 8 ${projects.length * 280}`}
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              fill="none"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />
            <motion.path
              d={`M 8 0 ${projects.map((_, i) => {
                const y = i * 280 + 100;
                const curve = i % 2 === 0 ? 20 : -20;
                return `Q ${8 + curve} ${y - 70} 8 ${y}`;
              }).join(' ')} L 8 ${projects.length * 280}`}
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{
                pathLength: scrollYProgress
              }}
            />
          </svg>

          {projects.map((project, index) => {
            const relevantPhotos = timelinePhotos.filter(
              p => p.position >= index && p.position < index + 1
            );
            const isActive = activeIndex === index;

            return (
              <motion.div 
                key={project.id} 
                className="relative mb-16"
                initial={{ opacity: 0.4, scale: 0.95 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.5, 
                  scale: isActive ? 1 : 0.95,
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-8 items-stretch">
                  {/* Left: Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 pl-16"
                  >
                    {/* Timeline dot */}
                    <motion.div 
                      className={`absolute left-6 top-6 w-5 h-5 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-accent shadow-glow scale-125' : 'bg-accent/50'
                      }`}
                    />

                    <div className={`bg-card rounded-xl p-6 shadow-elegant transition-all duration-300 ${
                      isActive ? 'shadow-glow ring-1 ring-accent/30' : ''
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar size={16} className="text-accent" />
                        <span className="text-sm text-muted-foreground">
                          {formatDateRange(project.start_date, project.end_date)}
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

                  {/* Right: Project Image */}
                  <div className="w-72 shrink-0">
                    {project.image_urls && project.image_urls.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`rounded-xl overflow-hidden shadow-elegant h-full transition-all duration-300 ${
                          isActive ? 'shadow-glow' : ''
                        }`}
                      >
                        <img
                          src={project.image_urls[0]}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full bg-muted/20 rounded-xl flex items-center justify-center min-h-[200px]">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floating Timeline Photos */}
                {relevantPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative mt-8 flex justify-end pr-8"
                  >
                    <div className="relative max-w-md">
                      <img
                        src={photo.url}
                        alt="Timeline moment"
                        className="rounded-xl shadow-glow w-full"
                      />
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
