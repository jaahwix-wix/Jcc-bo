/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://jcc-child-care.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZlcmVuY2UiOiJqb25hdGhhbnMtY2hpbGQtY2FyZS1taXMifQ.pre-generated-key';

export function getStoredSupabaseConfig() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sma_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('sma_supabase_anon_key') : null;

  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL as string)) ||
    (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
    '';

  const envKey = 
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY as string)) ||
    (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY)) ||
    '';

  const activeUrl = (localUrl || envUrl || DEFAULT_URL).trim();
  const activeKey = (localKey || envKey || DEFAULT_ANON_KEY).trim();

  return {
    url: activeUrl,
    key: activeKey,
    isCustom: Boolean(localUrl || envUrl),
  };
}

let activeClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();

  if (activeClient && lastUrl === url && lastKey === key) {
    return activeClient;
  }

  try {
    activeClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'sma_supabase_auth_session'
      }
    });
    lastUrl = url;
    lastKey = key;
  } catch (err) {
    console.warn('[Supabase] Failed initializing client:', err);
    activeClient = null;
  }

  return activeClient;
}

export const supabase: SupabaseClient | null = getSupabaseClient();
export const isSupabaseConfigured = true;

/**
 * Updates the user's custom Supabase URL and Anon key in localStorage
 * and resets the active client.
 */
export function setCustomSupabaseCredentials(url: string, anonKey: string): boolean {
  try {
    if (typeof window !== 'undefined') {
      if (url && anonKey) {
        localStorage.setItem('sma_supabase_url', url.trim());
        localStorage.setItem('sma_supabase_anon_key', anonKey.trim());
      } else {
        localStorage.removeItem('sma_supabase_url');
        localStorage.removeItem('sma_supabase_anon_key');
      }
    }
    activeClient = null; // Forces recreate
    getSupabaseClient();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sma_supabase_config_changed'));
    }
    return true;
  } catch (e) {
    console.error('Failed saving Supabase credentials:', e);
    return false;
  }
}

/**
 * Tests connection to Supabase and verifies response.
 */
export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  latencyMs?: number;
  data?: any; 
  error?: any 
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client could not be initialized with current credentials.'
    };
  }

  const start = Date.now();
  try {
    // Attempt to query students table or check auth health
    const { data, error } = await client
      .from('students')
      .select('id')
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      // If error is 42P01 (relation does not exist), Supabase is reachable and authenticated!
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase endpoint! (Table schema ready to initialize)',
          latencyMs: latency,
          data: { code: error.code }
        };
      }
      return {
        success: false,
        message: `Supabase status: ${error.message} (${error.code || 'unknown'})`,
        latencyMs: latency,
        error
      };
    }

    return {
      success: true,
      message: `Supabase connected successfully in ${latency}ms!`,
      latencyMs: latency,
      data
    };
  } catch (err: any) {
    const latency = Date.now() - start;
    return {
      success: false,
      message: `Network/CORS error reaching Supabase: ${err.message || 'Check project URL'}`,
      latencyMs: latency,
      error: err
    };
  }
}
