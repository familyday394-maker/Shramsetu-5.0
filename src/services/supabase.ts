/**
 * Shram Setu 2.0 — Supabase Client & Backend Connectivity Module
 * Safely inspects environment variables without exposing secrets or fabricating connections.
 * Operates in explicitly labeled Local Demo Mode when backend credentials are not provisioned.
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  mode: 'connected' | 'local_demo_offline';
  statusMessage: string;
}

const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const supabaseKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined;

export function getSupabaseStatus(): SupabaseConfigStatus {
  const hasUrl = Boolean(supabaseUrl && supabaseUrl.trim().startsWith('http'));
  const hasKey = Boolean(supabaseKey && supabaseKey.trim().length > 10);

  if (hasUrl && hasKey) {
    return {
      isConfigured: true,
      url: supabaseUrl || null,
      mode: 'connected',
      statusMessage: 'Supabase Cloud Backend Active (PostgreSQL + RLS)',
    };
  }

  return {
    isConfigured: false,
    url: null,
    mode: 'local_demo_offline',
    statusMessage: 'Local Demo Mode (IndexedDB Active · Supabase Cloud Not Yet Configured)',
  };
}
