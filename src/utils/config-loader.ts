import { getEnv } from './environment';

interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string;
  baseUrl: string;
  apiUrl: string;
}

// Loads configuration from environment variables
export function loadConfig(): AppConfig {
  return {
    supabaseUrl: getEnv('VITE_SUPABASE_URL', ''),
    supabaseAnonKey: getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', ''),
    stripePublishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY', ''),
    baseUrl: getEnv('VITE_BASE_URL', 'http://localhost:8080'),
    apiUrl: getEnv('VITE_API_URL', 'http://localhost:8080'),
  };
}
