-- Add favorites column to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS favorites uuid[] DEFAULT '{}';

-- Update database types
COMMENT ON COLUMN public.student_profiles.favorites IS 'Array of educator profile IDs that the student has favorited';

-- Update the student_profiles type definition
ALTER TYPE public.student_profiles_row ADD ATTRIBUTE favorites uuid[] DEFAULT '{}'; 