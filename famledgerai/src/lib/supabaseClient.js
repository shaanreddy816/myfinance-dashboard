// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Vite replaces import.meta.env at build time — this is the correct way
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

// Create the Supabase client
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Expose globals so app.legacy.js inline code can access them ──────────────
// app.legacy.js uses SUPABASE_URL as a plain global in checkSession() —
// setting window.SUPABASE_URL here fixes the ReferenceError crash
window.SUPABASE_URL      = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.sb                = sb;
window.supabase          = sb;

// ── Auth helpers ─────────────────────────────────────────────────────────────
let _currentUserEmail = null;

export function setCurrentUserEmail(email) {
  _currentUserEmail = email;
  if (email) localStorage.setItem('currentUserEmail', email);
  else localStorage.removeItem('currentUserEmail');
}

export function isAuthenticated() {
  return !!_currentUserEmail;
}

export async function getCurrentSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
