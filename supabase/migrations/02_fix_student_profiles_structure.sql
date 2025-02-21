-- First, backup existing data
CREATE TABLE IF NOT EXISTS student_profiles_backup AS 
SELECT * FROM student_profiles;

-- Drop the existing table
DROP TABLE IF EXISTS student_profiles;

-- Recreate the table with correct structure
CREATE TABLE public.student_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    avatar_url text,
    phone text,
    address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Copy data back from backup
INSERT INTO student_profiles (
    id, user_id, email, first_name, last_name, 
    avatar_url, phone, address, created_at, updated_at
)
SELECT 
    id, user_id, email, first_name, last_name,
    avatar_url, phone, address, created_at, updated_at
FROM student_profiles_backup;

-- Drop backup table
DROP TABLE IF EXISTS student_profiles_backup;

-- Create indexes
CREATE UNIQUE INDEX student_profiles_user_id_idx ON public.student_profiles(user_id);
CREATE INDEX student_profiles_email_idx ON public.student_profiles(email);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.student_profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.student_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Update or create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
        INSERT INTO public.student_profiles (
            user_id,
            email
        )
        VALUES (
            NEW.id,
            NEW.email
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT ALL ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
