-- Create the environment variables table
CREATE TABLE public.environment_variables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment to the table
COMMENT ON TABLE public.environment_variables IS 'Stores environment variables and API keys';

-- Create an update trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_env_variables_updated_at
    BEFORE UPDATE ON public.environment_variables
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin users can read environment variables"
    ON public.environment_variables
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email 
            FROM public.admin_users
        )
    );

CREATE POLICY "Admin users can insert environment variables"
    ON public.environment_variables
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'email' IN (
            SELECT email 
            FROM public.admin_users
        )
    );

CREATE POLICY "Admin users can update environment variables"
    ON public.environment_variables
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email 
            FROM public.admin_users
        )
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN (
            SELECT email 
            FROM public.admin_users
        )
    );

-- Insert initial environment variables
INSERT INTO public.environment_variables (key, value, is_encrypted, description) VALUES
('SUPABASE_URL', 'https://sheslhegcubntqohlgts.supabase.co', false, 'Supabase project URL'),
('SUPABASE_ANON_KEY', current_setting('app.settings.anon_key', true), true, 'Supabase anonymous key'),
('SUPABASE_SERVICE_ROLE_KEY', current_setting('app.settings.service_role_key', true), true, 'Supabase service role key'),
('GEMINI_API_KEY', current_setting('app.settings.gemini_key', true), true, 'Google Gemini API key'),
('STRIPE_PUBLISHABLE_KEY', current_setting('app.settings.stripe_public_key', true), false, 'Stripe publishable key'),
('STRIPE_SECRET_KEY', current_setting('app.settings.stripe_secret_key', true), true, 'Stripe secret key'),
('PUBLIC_URL', 'https://skilldirectory.com', false, 'Public URL of the application'),
('BASE_URL', 'https://skilldirectory.com', false, 'Base URL of the application'),
('API_URL', 'https://api.skilldirectory.com', false, 'API URL of the application');

-- Create a secure view for non-sensitive variables
CREATE VIEW public.public_environment_variables AS
SELECT 
    id,
    key,
    CASE 
        WHEN is_encrypted THEN '**********'
        ELSE value 
    END as value,
    is_encrypted,
    description,
    created_at,
    updated_at
FROM public.environment_variables;

-- Grant access to the view
GRANT SELECT ON public.public_environment_variables TO anon, authenticated;
