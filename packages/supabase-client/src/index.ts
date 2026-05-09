// ============================================================
// Supabase client factory
//
// This module provides properly configured Supabase clients
// for every context: browser, Next.js server, and React Native.
//
// Usage:
//   import { createBrowserClient } from '@honeybee/supabase-client';
//   const supabase = createBrowserClient();
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Re-export the SupabaseClient type for convenience
export type { SupabaseClient } from '@supabase/supabase-js';

// ---- Environment variable helpers ----

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing SUPABASE_URL environment variable');
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  return key;
}

function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — this should only be used server-side');
  return key;
}


// ---- Client factories ----

/**
 * Browser client — used in Next.js client components and React Native.
 * Uses the anon key with RLS. Safe to use in client-side code.
 */
export function createBrowserClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Server client — used in Next.js API routes, Server Components,
 * and middleware. Uses the anon key but with server-side cookie handling.
 *
 * For Next.js App Router, use createServerComponentClient from
 * @supabase/ssr instead (configured in apps/web).
 */
export function createServerClient(cookieHeader?: string): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    },
  });
}

/**
 * Admin client — uses the service role key. BYPASSES RLS.
 * Use ONLY in:
 *   - Edge Functions
 *   - Server-side API routes for admin operations
 *   - Database migrations / seeding
 *
 * NEVER import this in client-side code.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


// ---- Singleton for client-side use ----

let browserClientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton browser client.
 * Use this in React components to avoid creating a new client on every render.
 */
export function getSupabase(): SupabaseClient {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient();
  }
  return browserClientInstance;
}
