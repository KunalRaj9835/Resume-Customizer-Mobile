import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useQueryClient } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { send, sessionStore, setSessionInvalidHandler } from '../lib/api';

type Ctx = { session: Session | null; loading: boolean; error: string | null; signIn: () => Promise<void>; signOut: (msg?: string) => Promise<void> };
const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);
WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  // True while a login is in progress and /auth/session has not been registered yet.
  const registering = useRef(false);

  const signOut = useCallback(async (msg?: string) => {
    try { await send('POST', '/auth/logout', {}); } catch {}
    await sessionStore.clear();
    await supabase.auth.signOut();
    qc.clear();
    setSession(null);
    if (msg) setError(msg);
  }, [qc]);

  useEffect(() => {
    let invalidating = false;
    setSessionInvalidHandler(() => {
      if (registering.current) return; // ignore 401s while the login is still registering
      if (invalidating) return; invalidating = true;
      signOut('Your session expired or was signed in elsewhere. Please sign in again.').finally(() => (invalidating = false));
    });
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Hold the new session back until the backend has registered it,
      // otherwise the dashboard fires requests too early and gets 401.
      if (registering.current && event === 'SIGNED_IN') return;
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [signOut]);

  const signIn = useCallback(async () => {
    setError(null);
    registering.current = true;
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error: e } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (e || !data?.url) throw e ?? new Error('No auth URL');

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type !== 'success') { setError('Sign-in was cancelled.'); return; }

      const code = new URL(res.url).searchParams.get('code');
      if (!code) throw new Error('Invalid callback: missing code.');

      const { data: ex, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) throw exErr;

      // Register this login as the active application session BEFORE the UI is let in.
      // 60s timeout so a cold-starting Render instance doesn't fail the login.
      const reg = await send<any>(
        'POST',
        '/auth/session',
        { device_name: `${Platform.OS} app`, device_type: Platform.OS === 'ios' ? 'ios' : 'android' },
        60000,
      );
      const sid = reg?.session_uuid ?? reg?.session_id ?? reg?.id;
      if (sid) await sessionStore.set(String(sid));

      // Now the Gate in app/_layout.tsx may navigate to the dashboard.
      setSession(ex.session);
    } catch (err) {
      await sessionStore.clear();
      await supabase.auth.signOut();
      setSession(null);
      setError((err as Error).message || 'Sign-in failed.');
    } finally {
      registering.current = false;
    }
  }, []);

  return <AuthCtx.Provider value={{ session, loading, error, signIn, signOut }}>{children}</AuthCtx.Provider>;
}