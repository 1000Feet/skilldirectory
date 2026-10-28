-- Create a table to store API keys securely
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    description TEXT
);

-- Add RLS policies to ensure only authenticated users can access the keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only allow access to the table for authenticated users
CREATE POLICY "Allow authenticated read access" 
ON public.api_keys 
FOR SELECT 
TO authenticated 
USING (true);

-- Insert the Gemini API key (you'll need to replace 'your-api-key-here' with the actual key)
INSERT INTO public.api_keys (key_name, key_value, description)
VALUES ('gemini_api_key', 'your-api-key-here', 'Google Gemini API key for AI chatbot')
ON CONFLICT (key_name) 
DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = now();

-- Grant permissions
GRANT SELECT ON public.api_keys TO authenticated;
GRANT SELECT ON public.api_keys TO service_role;
