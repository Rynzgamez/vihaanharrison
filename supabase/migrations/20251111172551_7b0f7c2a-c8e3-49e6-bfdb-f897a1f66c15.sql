-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  impact TEXT,
  github_url TEXT,
  live_url TEXT,
  writeup TEXT,
  is_featured BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table for non-tech content
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_images table for multiple images per project
CREATE TABLE public.project_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_credentials table for password protection
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Anyone can view project images" ON public.project_images FOR SELECT USING (true);

-- Only allow inserts/updates/deletes through edge functions (will be authenticated there)
CREATE POLICY "Only service role can modify projects" ON public.projects FOR ALL USING (false);
CREATE POLICY "Only service role can modify activities" ON public.activities FOR ALL USING (false);
CREATE POLICY "Only service role can modify project images" ON public.project_images FOR ALL USING (false);
CREATE POLICY "Only service role can read admin credentials" ON public.admin_credentials FOR SELECT USING (false);

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

-- Storage policies for project images
CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Service role can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Service role can delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial admin password hash (for Harrison67Vihaan)
-- Using bcrypt-like hash format, will be validated in edge function
INSERT INTO public.admin_credentials (password_hash) VALUES ('Harrison67Vihaan');