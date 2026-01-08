import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Check, X, Upload, Calendar, SkipForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcessedProject {
  title: string;
  category: string;
  description: string;
  writeup: string;
  tags: string[];
  impact?: string;
  start_date: string;
  end_date?: string;
  image_urls?: string[];
}

interface AIContentProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AIContentProcessor = ({ open, onOpenChange, onSuccess }: AIContentProcessorProps) => {
  const [rawContent, setRawContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processedProjects, setProcessedProjects] = useState<ProcessedProject[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'input' | 'review' | 'details' | 'complete'>('input');
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [projectDates, setProjectDates] = useState<Record<number, { start_date: string; end_date: string }>>({});
  const [projectFiles, setProjectFiles] = useState<Record<number, File[]>>({});

  const handleProcess = async () => {
    if (!rawContent.trim()) {
      toast.error("Please enter content to process");
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-content', {
        body: { content: rawContent }
      });

      if (error) throw error;

      if (data?.projects && Array.isArray(data.projects)) {
        setProcessedProjects(data.projects);
        // Initialize dates from AI response
        const initialDates: Record<number, { start_date: string; end_date: string }> = {};
        data.projects.forEach((p: ProcessedProject, i: number) => {
          initialDates[i] = {
            start_date: p.start_date || new Date().toISOString().split('T')[0],
            end_date: p.end_date || ""
          };
        });
        setProjectDates(initialDates);
        setStep('review');
        toast.success(`Processed ${data.projects.length} project(s)`);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error('Error processing content:', error);
      toast.error("Failed to process content. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleStartDetails = () => {
    setCurrentDetailIndex(0);
    setStep('details');
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isImage) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (!isUnder10MB) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });
    
    setProjectFiles(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), ...validFiles]
    }));
  };

  const removeFile = (projectIndex: number, fileIndex: number) => {
    setProjectFiles(prev => ({
      ...prev,
      [projectIndex]: prev[projectIndex]?.filter((_, i) => i !== fileIndex) || []
    }));
  };

  const handleNextProject = () => {
    if (currentDetailIndex < processedProjects.length - 1) {
      setCurrentDetailIndex(prev => prev + 1);
    } else {
      // All done, proceed to save
      handleSaveAll();
    }
  };

  const handleSkipPhoto = () => {
    handleNextProject();
  };

  const uploadFiles = async (files: File[]) => {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }
    
    return urls;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStep('complete');
    
    try {
      for (let i = 0; i < processedProjects.length; i++) {
        const project = processedProjects[i];
        const dates = projectDates[i] || { start_date: project.start_date, end_date: project.end_date };
        const files = projectFiles[i] || [];
        
        let imageUrls: string[] = [];
        if (files.length > 0) {
          imageUrls = await uploadFiles(files);
        }

        const finalStartDate = dates.start_date || project.start_date || new Date().toISOString().split('T')[0];
        const finalEndDate = dates.end_date || project.end_date || null;

        const { error } = await supabase.functions.invoke('manage-projects', {
          body: { 
            action: 'create', 
            projectData: {
              ...project,
              start_date: finalStartDate,
              end_date: finalEndDate,
              is_featured: false,
              is_work: true,
              image_urls: imageUrls
            }
          }
        });

        if (error) throw error;
      }

      toast.success(`Saved ${processedProjects.length} project(s) successfully`);
      onSuccess();
      
      // Reset after delay
      setTimeout(() => {
        resetState();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving projects:', error);
      toast.error("Failed to save projects");
      setStep('details');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProject = (index: number) => {
    setProcessedProjects(prev => prev.filter((_, i) => i !== index));
    // Also remove associated dates and files
    setProjectDates(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setProjectFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const resetState = () => {
    setRawContent("");
    setProcessedProjects([]);
    setStep('input');
    setCurrentDetailIndex(0);
    setProjectDates({});
    setProjectFiles({});
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const currentProject = processedProjects[currentDetailIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Content Processor
          </DialogTitle>
          <DialogDescription>
            Paste detailed information about projects, achievements, or work. 
            The AI will parse and format them into structured entries.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="raw-content" className="text-foreground">
                Raw Content
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Include details like: project names, dates, descriptions, technologies used, 
                outcomes, and any relevant context. The AI will extract and format this information.
              </p>
              <Textarea
                id="raw-content"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder={`Example:

In 2024, I developed EcoTrack, an AI-powered sustainability monitoring platform using Python and TensorFlow. The system analyzed energy consumption patterns for 50+ households, resulting in an average 23% reduction in energy usage. Built with React frontend and deployed on AWS.

Also completed the Google AI certification program in March 2024, focusing on machine learning fundamentals and neural network architectures...`}
                rows={12}
                className="bg-background text-foreground border-border font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleProcess} 
                disabled={processing || !rawContent.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Process with AI
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Review the extracted projects below. Remove any that are incorrect.
              </p>
              <Badge variant="secondary">{processedProjects.length} project(s)</Badge>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {processedProjects.map((project, index) => (
                <div 
                  key={index}
                  className="bg-background rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{project.title}</h4>
                      <span className="text-sm text-accent">{project.category}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveProject(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>

                  {project.writeup && (
                    <details className="mb-3">
                      <summary className="text-sm text-accent cursor-pointer hover:underline">
                        View full writeup
                      </summary>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap border-l-2 border-accent/30 pl-3">
                        {project.writeup}
                      </p>
                    </details>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags?.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Date TBD'}
                      {project.end_date && ` – ${new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    </span>
                    {project.impact && (
                      <span className="text-accent font-medium">{project.impact}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={handleStartDetails} 
                disabled={processedProjects.length === 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Continue to Dates & Photos
              </Button>
              <Button variant="outline" onClick={() => setStep('input')}>
                Back to Edit
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && currentProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentProject.title}</h3>
                <span className="text-sm text-accent">{currentProject.category}</span>
              </div>
              <Badge variant="secondary">
                {currentDetailIndex + 1} of {processedProjects.length}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{currentProject.description}</p>

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={projectDates[currentDetailIndex]?.start_date || currentProject.start_date || ""}
                  onChange={(e) => setProjectDates(prev => ({
                    ...prev,
                    [currentDetailIndex]: {
                      ...prev[currentDetailIndex],
                      start_date: e.target.value
                    }
                  }))}
                  className="bg-background text-foreground border-border mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date (Optional)
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={projectDates[currentDetailIndex]?.end_date || currentProject.end_date || ""}
                  onChange={(e) => setProjectDates(prev => ({
                    ...prev,
                    [currentDetailIndex]: {
                      ...prev[currentDetailIndex],
                      end_date: e.target.value
                    }
                  }))}
                  className="bg-background text-foreground border-border mt-1"
                />
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <Label className="text-foreground mb-2 block flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Project Photos (Optional)
              </Label>
              <div className="border-2 border-dashed border-accent/30 rounded-lg p-4 hover:border-accent/50 transition-colors">
                <input
                  type="file"
                  id={`file-upload-${currentDetailIndex}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange(currentDetailIndex, e)}
                  className="hidden"
                />
                <label
                  htmlFor={`file-upload-${currentDetailIndex}`}
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-accent mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images (max 10MB each)
                  </span>
                </label>
              </div>

              {projectFiles[currentDetailIndex]?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {projectFiles[currentDetailIndex].map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between bg-background p-2 rounded border border-border">
                      <span className="text-sm text-foreground truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(currentDetailIndex, fileIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={handleNextProject}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {currentDetailIndex < processedProjects.length - 1 ? (
                  <>Next Project</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save All ({processedProjects.length})
                  </>
                )}
              </Button>
              {currentDetailIndex < processedProjects.length - 1 && (
                <Button variant="outline" onClick={handleSkipPhoto}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip Photo
                </Button>
              )}
              <Button variant="ghost" onClick={() => setStep('review')}>
                Back to Review
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-12 text-center">
            {saving ? (
              <>
                <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Saving Projects...</h3>
                <p className="text-muted-foreground">
                  Uploading files and saving {processedProjects.length} project(s).
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Projects Saved Successfully</h3>
                <p className="text-muted-foreground">
                  {processedProjects.length} project(s) have been added to your work.
                </p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIContentProcessor;