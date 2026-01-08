-- Add is_work column to distinguish Work items from Foundations items
ALTER TABLE public.projects ADD COLUMN is_work boolean DEFAULT false;

-- Create index for efficient filtering
CREATE INDEX idx_projects_is_work ON public.projects(is_work);