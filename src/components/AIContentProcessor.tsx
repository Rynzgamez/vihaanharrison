import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Check, ChevronRight } from "lucide-react";
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
  const [step, setStep] = useState<'input' | 'review' | 'complete'>('input');

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

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const project of processedProjects) {
        const { error } = await supabase.functions.invoke('manage-projects', {
          body: { 
            action: 'create', 
            projectData: {
              ...project,
              is_featured: false,
              image_urls: []
            }
          }
        });

        if (error) throw error;
      }

      toast.success(`Saved ${processedProjects.length} project(s) successfully`);
      setStep('complete');
      onSuccess();
      
      // Reset after delay
      setTimeout(() => {
        setRawContent("");
        setProcessedProjects([]);
        setStep('input');
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving projects:', error);
      toast.error("Failed to save projects");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProject = (index: number) => {
    setProcessedProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setRawContent("");
    setProcessedProjects([]);
    setStep('input');
    onOpenChange(false);
  };

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
                      {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {project.end_date && ` – ${new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    </span>
                    {project.impact && (
                      <span className="text-accent font-medium">{project.impact}</span>
                    )}
                  </div>

                  {project.writeup && (
                    <details className="mt-3">
                      <summary className="text-sm text-accent cursor-pointer hover:underline">
                        View full writeup
                      </summary>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {project.writeup}
                      </p>
                    </details>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={handleSaveAll} 
                disabled={saving || processedProjects.length === 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save All ({processedProjects.length})
                  </>
                )}
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

        {step === 'complete' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Projects Saved Successfully</h3>
            <p className="text-muted-foreground">
              {processedProjects.length} project(s) have been added to your work.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIContentProcessor;
