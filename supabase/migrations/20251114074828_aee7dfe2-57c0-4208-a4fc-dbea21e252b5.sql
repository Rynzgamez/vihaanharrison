-- Create app_role enum for role types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only service role can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Update projects RLS to allow admin users to modify
DROP POLICY IF EXISTS "Only service role can modify projects" ON public.projects;
CREATE POLICY "Admins can modify projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update activities RLS to allow admin users to modify
DROP POLICY IF EXISTS "Only service role can modify activities" ON public.activities;
CREATE POLICY "Admins can modify activities"
ON public.activities
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update project_images RLS to allow admin users to modify
DROP POLICY IF EXISTS "Only service role can modify project images" ON public.project_images;
CREATE POLICY "Admins can modify project images"
ON public.project_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop admin_credentials table as we're migrating to Supabase Auth
DROP TABLE IF EXISTS public.admin_credentials;