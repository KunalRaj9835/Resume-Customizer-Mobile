import React from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { json } from '../../../src/lib/api';
import Scene3D from '../../../src/components/Scene3D';
import { Note, Button, Card, H, Muted, Loading, ErrorState, C } from '../../../src/components/ui';
export default function Dashboard() {
  const r = useRouter();
  const q = useQuery({ queryKey: ['dashboard'], queryFn: () => json<any>('/dashboard/summary') });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error as Error} retry={() => q.refetch()} />;
  const d = q.data ?? {}; 
  const stats: [string, any][] = [['Resumes', d.uploaded_resumes], ['Job descriptions', d.saved_job_descriptions], ['Customizations', d.retained_customizations]];
  const recent: any[] = d.recent_customizations ?? [];
  const fresh = stats.every(([, v]) => !v);
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <H size={34}>Welcome back</H>
    <Scene3D variant="curve" style={{ height: 220 }} speed={0.7} />
    {stats.map(([k, v]) => <Card key={k}><Note>{k}</Note><H size={44} color="#FF4A00">{v ?? "–"}</H></Card>)}
    {fresh && <Card><Note>Get started</Note><Muted>1. Upload a resume  2. Add a job description  3. Generate a tailored version.</Muted></Card>}
    {recent.slice(0, 3).map((c: any) => <Card key={c.customization_id} onPress={() => r.push(`/customizations/${c.customization_id}`)}><Note>Recent</Note><H size={20}>{c.job_title ?? 'Customization'}</H></Card>)}
    <View style={{ gap: 8 }}>
      <Button title="Upload a resume" onPress={() => r.push('/resumes/upload')} />
      <Button title="New job description" variant="ghost" onPress={() => r.push('/job-descriptions/new')} />
      <Button title="Customize a resume" variant="ghost" onPress={() => r.push('/customize')} />
      <Button title="Settings" variant="ghost" onPress={() => r.push('/settings')} />
    </View>
  </ScrollView>;
}
