/**
 * Supabase Client — Singleton instance for database and auth operations
 *
 * Provides:
 * - Supabase client initialization with environment-based configuration
 * - Auth state management
 * - Current user tracking
 * - Session helpers
 *
 * Configuration priority:
 * 1. localStorage overrides (for config modal)
 * 2. Environment variables (import.meta.env)
 * 3. Hardcoded defaults (for backward compatibility)
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase URL from localStorage, env, or default
 */
function getSupabaseUrl() {
  // Priority 1: localStorage override (config modal)
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('sb_url');
    if (stored) return stored;
  }

  // Priority 2: Environment variable (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  // Priority 3: Hardcoded default (backward compatibility)
  return 'https://ivvkzforsgruhofpekir.supabase.co';
}

/**
 * Get Supabase anon key from localStorage, env, or default
 */
function getSupabaseAnonKey() {
  // Priority 1: localStorage override (config modal)
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('sb_key');
    if (stored) return stored;
  }

  // Priority 2: Environment variable (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  // Priority 3: Hardcoded default (backward compatibility)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dmt6Zm9yc2dydWhvZnBla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODg4NjMsImV4cCI6MjA4NzQ2NDg2M30.aKVXCPFsNIbN3dH2xbjJKntGG0bQu9HSywvTWEnGnhU';
}

/**
 * Supabase client singleton
 */
export const sb = createClient(getSupabaseUrl(), getSupabaseAnonKey());

/**
 * Current user email (set by auth state change handler)
 * @type {string}
 */
export let currentUserEmail = '';

/**
 * Set current user email (called by auth handlers)
 * @param {string} email
 */
export function setCurrentUserEmail(email) {
  currentUserEmail = email;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!currentUserEmail;
}

/**
 * Get current session
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await sb.auth.getSession();
    return { session: data?.session || null, error };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error };
  }
}

/**
 * Initialize auth state listener
 * @param {Function} onAuthChange - Callback(session) when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function initAuthListener(onAuthChange) {
  const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'session active' : 'no session');
    
    if (session) {
      currentUserEmail = session.user.email;
    } else {
      currentUserEmail = '';
    }
    
    if (onAuthChange) {
      onAuthChange(session, event);
    }
  });

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

/**
 * Sign out current user
 * @returns {Promise<{error: object|null}>}
 */
export async function signOut() {
  currentUserEmail = '';
  const { error } = await sb.auth.signOut();
  return { error };
}

/**
 * Expose client globally for backward compatibility
 * (Remove this once all code is migrated to imports)
 */
if (typeof window !== 'undefined') {
  window.supabase = sb;
  window.sb = sb;
}
