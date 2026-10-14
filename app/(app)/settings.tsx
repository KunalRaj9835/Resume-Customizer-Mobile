import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { json, send } from '../../src/lib/api';
import { useAuth } from '../../src/providers/AuthProvider';
import { Button, Field, H, Muted, Loading, C } from '../../src/components/ui';
import { useToast } from '../../src/components/Toast';
export default function Settings() {
  const { signOut, session } = useAuth(); const qc = useQueryClient(); const toast = useToast();
  const p = useQuery({ queryKey: ['profile'], queryFn: () => json<any>('/profile') });
  const [name, setName] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (p.data) setName(p.data.full_name ?? p.data.name ?? ''); }, [p.data]);
  if (p.isLoading) return <Loading />;
  const save = async () => { setBusy(true); try { await send('PATCH', '/profile', { full_name: name.trim() }); await qc.invalidateQueries({ queryKey: ['profile'] }); toast('Profile updated'); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } };
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <H size={30}>Profile</H><Muted>{p.data?.email ?? session?.user.email}</Muted>
    <Field label="Full name" value={name} onChangeText={setName} />
    <Button title="Save profile" disabled={!name.trim()} loading={busy} onPress={save} />
    <Muted>Signing in on another device may end this app session.</Muted>
    <Button title="Sign out" variant="danger" onPress={() => signOut()} /></ScrollView>;
}
