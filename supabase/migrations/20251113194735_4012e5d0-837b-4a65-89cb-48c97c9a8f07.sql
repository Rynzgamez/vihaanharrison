-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
);

-- Create storage policies for project-files bucket
CREATE POLICY "Anyone can view project files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

CREATE POLICY "Service role can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'service_role');

CREATE POLICY "Service role can update project files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete project files"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files' AND auth.role() = 'service_role');