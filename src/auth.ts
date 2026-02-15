import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gusdhnpsjmpueevnivsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1c2RobnBzam1wdWVldm5pdnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDkxODQsImV4cCI6MjA4NTg4NTE4NH0._Oc6LYw87DaQJx_Bu_ele8ZtMpiNEmEQEpEnvbaWSn4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
