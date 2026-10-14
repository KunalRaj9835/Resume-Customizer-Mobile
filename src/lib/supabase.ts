import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore limits values to ~2KB, so we store the session in small chunks.
const CHUNK = 1500;

const adapter = {
  getItem: async (k: string) => {
    const n = await SecureStore.getItemAsync(`${k}.n`);
    if (!n) return SecureStore.getItemAsync(k); // fall back to an old unchunked value
    let out = '';
    for (let i = 0; i < Number(n); i++) {
      const part = await SecureStore.getItemAsync(`${k}.${i}`);
      if (part == null) return null;
      out += part;
    }
    return out;
  },
  setItem: async (k: string, v: string) => {
    await adapter.removeItem(k);
    const parts = Math.ceil(v.length / CHUNK);
    for (let i = 0; i < parts; i++) {
      await SecureStore.setItemAsync(`${k}.${i}`, v.slice(i * CHUNK, (i + 1) * CHUNK));
    }
    await SecureStore.setItemAsync(`${k}.n`, String(parts));
  },
  removeItem: async (k: string) => {
    const n = Number((await SecureStore.getItemAsync(`${k}.n`)) ?? 0);
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${k}.${i}`);
    await SecureStore.deleteItemAsync(`${k}.n`);
    await SecureStore.deleteItemAsync(k);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  { auth: { storage: adapter, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, flowType: 'pkce' } },
);