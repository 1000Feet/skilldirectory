-- Add is_active column to student_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'student_profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.student_profiles
        ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Update the handle_new_user function to set is_active
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
        INSERT INTO public.student_profiles (user_id, email, is_active)
        VALUES (NEW.id, NEW.email, true);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create an index on is_active for better query performance
CREATE INDEX IF NOT EXISTS student_profiles_is_active_idx ON public.student_profiles(is_active);

-- Update RLS policies to consider is_active status
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.student_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.student_profiles
    FOR SELECT
    USING (is_active IS NULL OR is_active = true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
CREATE POLICY "Users can update own profile"
    ON public.student_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.student_profiles;
CREATE POLICY "Users can delete own profile"
    ON public.student_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
