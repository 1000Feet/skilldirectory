/**
 * Environment utilities for handling different deployment environments
 */

declare global {
  interface Window {
    ENV?: Record<string, string>;
  }
}

/**
 * Get environment variable with fallback mechanism for Hostinger deployment
 * 
 * This function will:
 * 1. First check window.ENV (for Hostinger runtime config)
 * 2. Then try to get the value from Vite's import.meta.env (for local dev and Netlify)
 * 3. Finally fall back to a default value if specified
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // First check the runtime config (for Hostinger)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }

  // Then Vite's build-time variables. They are listed explicitly: a dynamic
  // `import.meta.env[key]` makes Vite embed EVERY VITE_ variable in the public bundle.
  const buildEnv: Record<string, string | undefined> = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    PUBLIC_URL: import.meta.env.PUBLIC_URL,
  };
  if (buildEnv[key]) {
    return buildEnv[key] as string;
  }
  
  // Fall back to default value
  return defaultValue;
}
