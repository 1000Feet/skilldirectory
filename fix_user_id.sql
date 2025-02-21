-- Drop existing constraints and index if they exist
ALTER TABLE student_profiles
DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;

DROP INDEX IF EXISTS student_profiles_user_id_idx;

-- Add foreign key constraint
ALTER TABLE student_profiles
ADD CONSTRAINT student_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id);

-- Create unique index
CREATE UNIQUE INDEX student_profiles_user_id_idx 
ON student_profiles(user_id);

-- Add not null constraint if not already present
ALTER TABLE student_profiles
ALTER COLUMN user_id SET NOT NULL;
