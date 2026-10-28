-- Add last_active timestamp to educator_profiles
ALTER TABLE educator_profiles
ADD COLUMN last_active timestamptz DEFAULT NULL;

-- Create an index for faster queries on last_active
CREATE INDEX idx_educator_profiles_last_active ON educator_profiles(last_active);

-- Enable Row Level Security
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for last_active column
CREATE POLICY "Enable read access for all users" ON educator_profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Enable update of last_active for authenticated users" ON educator_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
