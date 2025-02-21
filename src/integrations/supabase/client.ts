import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sheslhegcubntqohlgts.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZXNsaGVnY3VibnRxb2hsZ3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MjEyMTQsImV4cCI6MjA1NTI5NzIxNH0.dIUlq1-6v8aFVt5ypoVIqZXxn2bJV7PWpCrbESy00DU";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          try {
            const item = localStorage.getItem(key);
            const session = item ? JSON.parse(item) : null;
            if (session?.expires_at) {
              // Convert expiry to never expire
              session.expires_at = 2147483647; // Max safe timestamp
              localStorage.setItem(key, JSON.stringify(session));
            }
            return item;
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            // If it's a session, modify expiry before storing
            if (key.includes('auth.token')) {
              const session = JSON.parse(value);
              if (session?.expires_at) {
                session.expires_at = 2147483647; // Max safe timestamp
                value = JSON.stringify(session);
              }
            }
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        }
      }
    },
    global: {
      fetch: fetch,
      headers: {
        'Cache-Control': 'no-cache'
      }
    }
  }
);
