import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface EditableContentProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
  className?: string;
  multiline?: boolean;
}

const EditableContent = ({ content, onSave, className = "", multiline = false }: EditableContentProps) => {
  const { isAdmin } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return <span className={className}>{content}</span>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`${className} bg-background border-accent`}
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`${className} bg-background border border-accent rounded px-2 py-1`}
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-accent hover:bg-accent/90"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <span className={`${className} group relative`}>
      {content}
      <Button
        size="sm"
        variant="ghost"
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="w-3 h-3" />
      </Button>
    </span>
  );
};

export default EditableContent;
