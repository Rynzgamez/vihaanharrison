import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  activity?: {
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
  };
}

const ActivityFormModal = ({ open, onOpenChange, onSuccess, activity }: ActivityFormModalProps) => {
  const [title, setTitle] = useState(activity?.title || "");
  const [category, setCategory] = useState(activity?.category || "");
  const [description, setDescription] = useState(activity?.description || "");
  const [date, setDate] = useState(activity?.date || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activityData = {
        title,
        category,
        description,
        date
      };

      const { error } = activity
        ? await supabase.functions.invoke('manage-activities', {
            body: { 
              action: 'update', 
              activityId: activity.id, 
              activityData 
            }
          })
        : await supabase.functions.invoke('manage-activities', {
            body: { 
              action: 'create', 
              activityData 
            }
          });

      if (error) throw error;

      toast.success(activity ? 'Activity updated successfully' : 'Activity added successfully');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {activity ? 'Edit Activity' : 'Add New Activity'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading ? 'Saving...' : activity ? 'Update' : 'Add'} Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityFormModal;
