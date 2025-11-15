-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Create policy to allow public read access
CREATE POLICY "Public can view project files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Create policy to allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-files');