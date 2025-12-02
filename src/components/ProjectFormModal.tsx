import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultCategory?: string;
  editProject?: any;
}

const ProjectFormModal = ({ open, onOpenChange, onSuccess, defaultCategory, editProject }: ProjectFormModalProps) => {
  const [formData, setFormData] = useState({
    title: editProject?.title || "",
    category: editProject?.category || defaultCategory || "",
    description: editProject?.description || "",
    tags: editProject?.tags?.join(", ") || "",
    impact: editProject?.impact || "",
    github_url: editProject?.github_url || "",
    live_url: editProject?.live_url || "",
    writeup: editProject?.writeup || "",
    start_date: editProject?.start_date || new Date().toISOString().split('T')[0],
    end_date: editProject?.end_date || "",
    is_featured: editProject?.is_featured || false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(editProject?.image_urls || []);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isImage && !isPDF) {
        toast.error(`${file.name} is not an image or PDF`);
        return false;
      }
      if (!isUnder10MB) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeUploadedUrl = (index: number) => {
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
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
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }
    
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let allUrls = [...uploadedUrls];
      
      if (files.length > 0) {
        const newUrls = await uploadFiles();
        allUrls = [...allUrls, ...newUrls];
      }

      const projectData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        image_urls: allUrls,
      };

      const { error } = editProject
        ? await supabase.functions.invoke('manage-projects', {
            body: { 
              action: 'update', 
              projectId: editProject.id, 
              projectData 
            }
          })
        : await supabase.functions.invoke('manage-projects', {
            body: { 
              action: 'create', 
              projectData 
            }
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
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        is_featured: false,
      });
      setFiles([]);
      setUploadedUrls([]);
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
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border"
            >
              <option value="">Select a category</option>
              <option value="Academic & Scholarly Achievements">Academic & Scholarly Achievements</option>
              <option value="Technology, Coding & Innovation">Technology, Coding & Innovation</option>
              <option value="Leadership, Volunteering & Environmental Action">Leadership, Volunteering & Environmental Action</option>
              <option value="Model United Nations (MUN) & Public Speaking">Model United Nations (MUN) & Public Speaking</option>
              <option value="Arts, Athletics & Personal Passions">Arts, Athletics & Personal Passions</option>
              <option value="Recognition & Awards">Recognition & Awards</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="text-foreground">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="bg-background text-foreground border-border"
              />
            </div>
            <div>
              <Label htmlFor="end_date" className="text-foreground">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>
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

          <div>
            <Label htmlFor="is_featured" className="text-foreground">Mark as Featured</Label>
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
            />
          </div>

          {/* File Upload Section */}
          <div>
            <Label className="text-foreground mb-2 block">Images & PDFs</Label>
            <div className="border-2 border-dashed border-accent/30 rounded-lg p-4 hover:border-accent/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-accent mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload images or PDFs (max 10MB each)
                </span>
              </label>
            </div>

            {/* Display uploaded files from database */}
            {uploadedUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Uploaded files:</p>
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-accent/10 p-2 rounded">
                    <span className="text-sm text-foreground truncate flex-1">
                      {url.split('/').pop()}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadedUrl(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Display selected files to upload */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Selected files to upload:</p>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-background p-2 rounded border border-border">
                    <span className="text-sm text-foreground truncate flex-1">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
