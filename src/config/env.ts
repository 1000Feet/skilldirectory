import { getEnv } from '@/utils/environment';

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  baseUrl: string;
  stripePublishableKey: string;
  apiUrl: string;
}

const getBaseUrl = () => {
  const isProd = import.meta.env.PROD
  return isProd ? getEnv('VITE_BASE_URL', '/') : '/'
}

const getApiUrl = () => {
  const isProd = import.meta.env.PROD
  return isProd 
    ? getEnv('VITE_API_URL', 'https://api.skilldirectory.com')
    : 'http://localhost:3000'
}

export const env: EnvConfig = {
  supabaseUrl: getEnv('VITE_SUPABASE_URL', ''),
  supabaseAnonKey: getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', ''),
  stripePublishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  baseUrl: getBaseUrl(),
  apiUrl: getApiUrl()
}

export type Env = typeof env
