import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editProject?: any;
}

const ProjectFormModal = ({ open, onOpenChange, onSuccess, editProject }: ProjectFormModalProps) => {
  const [formData, setFormData] = useState({
    title: editProject?.title || "",
    category: editProject?.category || "",
    description: editProject?.description || "",
    tags: editProject?.tags?.join(", ") || "",
    impact: editProject?.impact || "",
    github_url: editProject?.github_url || "",
    live_url: editProject?.live_url || "",
    writeup: editProject?.writeup || "",
    date: editProject?.date || new Date().toISOString().split('T')[0],
    is_featured: editProject?.is_featured || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      };

      const { error } = editProject
        ? await supabase.functions.invoke('manage-projects', {
            body: { action: 'update', id: editProject.id, ...projectData }
          })
        : await supabase.functions.invoke('manage-projects', {
            body: { action: 'create', ...projectData }
          });

      if (error) throw error;

      toast.success(editProject ? 'Project updated successfully' : 'Project created successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        title: "",
        category: "",
        description: "",
        tags: "",
        impact: "",
        github_url: "",
        live_url: "",
        writeup: "",
        date: new Date().toISOString().split('T')[0],
        is_featured: false,
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editProject ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="writeup" className="text-foreground">Full Writeup (Optional)</Label>
            <Textarea
              id="writeup"
              value={formData.writeup}
              onChange={(e) => setFormData({ ...formData, writeup: e.target.value })}
              rows={6}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="text-foreground">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="React, AI, Python"
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="impact" className="text-foreground">Impact Statement (Optional)</Label>
            <Input
              id="impact"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              placeholder="e.g., 700+ kg Recycled"
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="github_url" className="text-foreground">GitHub URL (Optional)</Label>
            <Input
              id="github_url"
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="live_url" className="text-foreground">Live URL (Optional)</Label>
            <Input
              id="live_url"
              type="url"
              value={formData.live_url}
              onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
            />
            <Label htmlFor="is_featured" className="text-foreground">Mark as Featured</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {loading ? 'Saving...' : editProject ? 'Update Project' : 'Add Project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormModal;
