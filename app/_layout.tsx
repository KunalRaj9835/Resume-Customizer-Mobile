import '../src/polyfills';
import React from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../src/providers/AuthProvider';
import { ToastProvider } from '../src/components/Toast';
import { Loading } from '../src/components/ui';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000, gcTime: 5 * 60000 } } });
function Gate() {
  const { session, loading } = useAuth(); const seg = useSegments(); const router = useRouter();
  React.useEffect(() => {
    if (loading) return;
    const inAuth = seg[0] === '(auth)';
    if (!session && !inAuth) router.replace('/login');
    if (session && inAuth) router.replace('/dashboard');
  }, [session, loading, seg]);
  return loading ? <Loading /> : <Slot />;
}
export default function Root() {
  const [fonts] = useFonts({ Anton_400Regular, Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold });
  if (!fonts) return <Loading />;
  return <SafeAreaProvider><StatusBar style="dark" /><QueryClientProvider client={qc}><ToastProvider><AuthProvider><Gate /></AuthProvider></ToastProvider></QueryClientProvider></SafeAreaProvider>;
}
