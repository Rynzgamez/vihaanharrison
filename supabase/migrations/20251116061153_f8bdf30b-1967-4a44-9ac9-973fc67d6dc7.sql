-- Update storage policies to require admin role for uploads/deletes

-- Drop existing policies for project-files bucket
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project files" ON storage.objects;

-- Create new admin-only policies for project-files bucket
CREATE POLICY "Admins can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Update project-images bucket policies as well
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;

CREATE POLICY "Admins can upload project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);