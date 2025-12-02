-- Add date range support to projects and activities tables
ALTER TABLE public.projects
  ADD COLUMN start_date date,
  ADD COLUMN end_date date;

-- Set default values for existing records (copy from date field)
UPDATE public.projects 
SET start_date = date, 
    end_date = date 
WHERE start_date IS NULL;

-- Make start_date required
ALTER TABLE public.projects 
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;

-- Add similar fields to activities
ALTER TABLE public.activities
  ADD COLUMN start_date date,
  ADD COLUMN end_date date;

-- Set default values for existing activities
UPDATE public.activities 
SET start_date = date, 
    end_date = date 
WHERE start_date IS NULL;

-- Make start_date required for activities
ALTER TABLE public.activities 
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;