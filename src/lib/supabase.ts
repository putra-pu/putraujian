import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// @ts-ignore
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-key';

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = () => {
  return isValidUrl(rawUrl) && !!rawKey;
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    try {
      // Only attempt real initialization if it looks valid
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      // Fallback to a guaranteed "safe" but non-functional client to avoid crashes
      supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
  }
  return supabaseInstance;
};

// For backward compatibility with existing code while transitioning or for simple use-cases
// We use a Proxy to catch errors and prevent top-level crashes
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    // @ts-ignore
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export type UserRole = 'admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}
