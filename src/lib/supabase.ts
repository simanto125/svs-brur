import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected response from the server');
  }
  return data as T;
}

export const publicCall = <T>(action: string, payload: Record<string, unknown> = {}) =>
  callFunction<T>('submit', { action, payload });

export const adminCall = <T>(passkey: string, action: string, payload: Record<string, unknown> = {}) =>
  callFunction<T>('admin', { passkey, action, payload });
