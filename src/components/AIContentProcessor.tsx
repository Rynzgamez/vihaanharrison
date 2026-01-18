import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Check, X, Upload, Calendar, SkipForward, Briefcase, Star } from "lucide-react";
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
  is_work?: boolean;
  is_featured?: boolean;
}

interface AIContentProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultIsWork?: boolean;
}

// All available categories
const allCategories = [
  "Academic & Scholarly Achievements",
  "Technology, Coding & Innovation",
  "Leadership, Volunteering & Environmental Action",
  "Model United Nations (MUN) & Public Speaking",
  "Arts, Athletics & Personal Passions",
  "Recognition & Awards",
];

const AIContentProcessor = ({ open, onOpenChange, onSuccess, defaultIsWork = false }: AIContentProcessorProps) => {
  const [rawContent, setRawContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processedProjects, setProcessedProjects] = useState<ProcessedProject[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'input' | 'review' | 'details' | 'complete'>('input');
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [projectDates, setProjectDates] = useState<Record<number, { start_date: string; end_date: string }>>({});
  const [projectFiles, setProjectFiles] = useState<Record<number, File[]>>({});
  const [projectSettings, setProjectSettings] = useState<Record<number, { is_work: boolean; is_featured: boolean; category: string }>>({});

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
        // Initialize dates and settings from AI response
        const initialDates: Record<number, { start_date: string; end_date: string }> = {};
        const initialSettings: Record<number, { is_work: boolean; is_featured: boolean; category: string }> = {};
        data.projects.forEach((p: ProcessedProject, i: number) => {
          initialDates[i] = {
            start_date: p.start_date || new Date().toISOString().split('T')[0],
            end_date: p.end_date || ""
          };
          initialSettings[i] = {
            is_work: defaultIsWork,
            is_featured: false,
            category: p.category || allCategories[0]
          };
        });
        setProjectDates(initialDates);
        setProjectSettings(initialSettings);
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
        const settings = projectSettings[i] || { is_work: defaultIsWork, is_featured: false, category: project.category };
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
              category: settings.category,
              start_date: finalStartDate,
              end_date: finalEndDate,
              is_featured: settings.is_featured,
              is_work: settings.is_work,
              image_urls: imageUrls
            }
          }
        });

        if (error) throw error;
      }

      const workCount = Object.values(projectSettings).filter(s => s.is_work).length;
      const foundationCount = processedProjects.length - workCount;
      
      let successMessage = `Saved ${processedProjects.length} project(s) successfully`;
      if (workCount > 0 && foundationCount > 0) {
        successMessage = `Saved ${workCount} to Work and ${foundationCount} to Foundations`;
      } else if (workCount > 0) {
        successMessage = `Saved ${workCount} project(s) to Work`;
      } else {
        successMessage = `Saved ${foundationCount} project(s) to Foundations`;
      }
      
      toast.success(successMessage);
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
    // Also remove associated dates, files, and settings
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
    setProjectSettings(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateProjectSetting = (index: number, key: 'is_work' | 'is_featured' | 'category', value: boolean | string) => {
    setProjectSettings(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [key]: value
      }
    }));
  };

  const resetState = () => {
    setRawContent("");
    setProcessedProjects([]);
    setStep('input');
    setCurrentDetailIndex(0);
    setProjectDates({});
    setProjectFiles({});
    setProjectSettings({});
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const currentProject = processedProjects[currentDetailIndex];
  const currentSettings = projectSettings[currentDetailIndex] || { is_work: defaultIsWork, is_featured: false, category: currentProject?.category || allCategories[0] };

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
                Review the extracted projects. Set category, dates, and destination for each.
              </p>
              <Badge variant="secondary">{processedProjects.length} project(s)</Badge>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {processedProjects.map((project, index) => {
                const settings = projectSettings[index] || { is_work: defaultIsWork, is_featured: false, category: project.category };
                const dates = projectDates[index] || { start_date: project.start_date || '', end_date: project.end_date || '' };
                
                return (
                  <div 
                    key={index}
                    className="bg-background rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{project.title}</h4>
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
                    
                    {/* Category Selection */}
                    <div className="mb-3">
                      <Label className="text-sm text-muted-foreground mb-1 block">Category</Label>
                      <Select
                        value={settings.category}
                        onValueChange={(value) => updateProjectSetting(index, 'category', value)}
                      >
                        <SelectTrigger className="w-full bg-card border-border">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-[300]">
                          {allCategories.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-foreground">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editable Date Fields - Auto-filled from AI */}
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`start-date-${index}`} className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Start Date
                          {project.start_date && <span className="text-xs text-accent">(AI detected)</span>}
                        </Label>
                        <Input
                          id={`start-date-${index}`}
                          type="date"
                          value={dates.start_date}
                          onChange={(e) => setProjectDates(prev => ({
                            ...prev,
                            [index]: { ...prev[index], start_date: e.target.value }
                          }))}
                          className="bg-card border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-date-${index}`} className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          End Date
                          {project.end_date && <span className="text-xs text-accent">(AI detected)</span>}
                        </Label>
                        <Input
                          id={`end-date-${index}`}
                          type="date"
                          value={dates.end_date}
                          onChange={(e) => setProjectDates(prev => ({
                            ...prev,
                            [index]: { ...prev[index], end_date: e.target.value }
                          }))}
                          className="bg-card border-border text-foreground"
                          placeholder="Leave empty if ongoing"
                        />
                      </div>
                    </div>

                    {/* Toggles for Is Work and Is Featured */}
                    <div className="flex flex-wrap gap-4 mb-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`is-work-${index}`}
                          checked={settings.is_work}
                          onCheckedChange={(checked) => updateProjectSetting(index, 'is_work', checked)}
                        />
                        <Label htmlFor={`is-work-${index}`} className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Briefcase className="h-4 w-4 text-accent" />
                          <span>Is Work</span>
                          <span className="text-xs text-muted-foreground">(→ Work page)</span>
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`is-featured-${index}`}
                          checked={settings.is_featured}
                          onCheckedChange={(checked) => updateProjectSetting(index, 'is_featured', checked)}
                        />
                        <Label htmlFor={`is-featured-${index}`} className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Featured</span>
                        </Label>
                      </div>
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
                      {project.impact && (
                        <span className="text-accent font-medium">{project.impact}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={handleStartDetails} 
                disabled={processedProjects.length === 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Continue to Add Photos
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{currentProject.title}</h3>
                  {currentSettings.is_work && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Work
                    </Badge>
                  )}
                  {currentSettings.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-accent">{currentSettings.category}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {projectDates[currentDetailIndex]?.start_date && (
                    <>
                      {new Date(projectDates[currentDetailIndex].start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {projectDates[currentDetailIndex]?.end_date && (
                        <> – {new Date(projectDates[currentDetailIndex].end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>
                      )}
                    </>
                  )}
                </div>
              </div>
              <Badge variant="secondary">
                {currentDetailIndex + 1} of {processedProjects.length}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{currentProject.description}</p>

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
                  {processedProjects.length} project(s) have been added.
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
