import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const { isAdmin } = useAdminAuth();
  const containerRef = useRef<HTMLDivElement>(null);

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
          <DialogContent className="bg-card">
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

        <div className="relative" style={{ scrollSnapType: 'y mandatory' }}>
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent/20" />

          {projects.map((project, index) => {
            const relevantPhotos = timelinePhotos.filter(
              p => p.position >= index && p.position < index + 1
            );

            return (
              <div key={project.id} style={{ scrollSnapAlign: 'start' }}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                  className="relative pl-20 pb-12 group"
                >
                  <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-accent shadow-glow group-hover:scale-125 transition-smooth" />

                  <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth">
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

                    {project.image_urls && project.image_urls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {project.image_urls.slice(0, 2).map((url, idx) => (
                          <motion.img
                            key={idx}
                            src={url}
                            alt={`${project.title} preview ${idx + 1}`}
                            className="rounded-lg shadow-md object-cover h-32 w-full"
                            whileHover={{ scale: 1.05 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Floating Timeline Photos */}
                {relevantPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative mb-8 flex justify-end pr-8"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
