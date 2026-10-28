-- Create profile_views table
CREATE TABLE profile_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    educator_profile_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    viewer_id UUID REFERENCES auth.users(id),
    ip_address TEXT
);

-- Create index for faster queries
CREATE INDEX idx_profile_views_educator ON profile_views(educator_profile_id);
CREATE INDEX idx_profile_views_date ON profile_views(viewed_at);

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Educators can view their own profile views"
    ON profile_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM educator_profiles
            WHERE educator_profiles.id = profile_views.educator_profile_id
            AND educator_profiles.user_id = auth.uid()
        )
    );

-- Create view count function
CREATE OR REPLACE FUNCTION get_profile_view_count(educator_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_views BIGINT,
    last_24h_views BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_views,
        COUNT(DISTINCT COALESCE(viewer_id, ip_address))::BIGINT as unique_views,
        COUNT(*) FILTER (WHERE viewed_at > NOW() - INTERVAL '24 hours')::BIGINT as last_24h_views
    FROM profile_views
    WHERE educator_profile_id = educator_id;
END;
$$;
