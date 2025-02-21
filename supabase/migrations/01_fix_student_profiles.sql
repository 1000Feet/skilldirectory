-- First, let's check and fix any existing constraints
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;

    -- Drop existing functions
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Drop existing constraints
    ALTER TABLE IF EXISTS public.student_profiles 
        DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;
END $$;

-- Recreate the student_profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL,
    email text,
    first_name text,
    last_name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
        INSERT INTO public.student_profiles (user_id, email)
        VALUES (NEW.id, NEW.email);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error (you can create an error_logs table for this)
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.student_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.student_profiles
    FOR SELECT
    USING (true);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS student_profiles_email_idx ON public.student_profiles(email);

-- Grant necessary permissions
GRANT ALL ON public.student_profiles TO postgres;
GRANT ALL ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
