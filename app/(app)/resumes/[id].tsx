import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { json, norm } from '../../../src/lib/api';
import { Badge, Button, Card, H, Muted, Loading, ErrorState, confirm, C, F } from '../../../src/components/ui';
import { DownloadButton } from '../../../src/components/Download';
import { useToast } from '../../../src/components/Toast';
export default function ResumeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const r = useRouter(); const qc = useQueryClient(); const toast = useToast();
  const q = useQuery({ queryKey: ['resume', id], queryFn: () => json<any>(`/resumes/${id}`).then(norm) });
  if (q.isLoading) return <Loading />; if (q.error) return <ErrorState error={q.error as Error} retry={() => q.refetch()} />;
  const d = q.data; const text: string | undefined = d.extracted_text_preview;
  const del = () => confirm('Delete resume?', 'This cannot be undone.', async () => {
    try { await json(`/resumes/${id}`, { method: 'DELETE' }); await qc.invalidateQueries({ queryKey: ['resumes'] }); toast('Resume deleted'); r.back(); } catch (e) { toast((e as Error).message, 'error'); } });
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <Stack.Screen options={{ title: 'Resume' }} />
    <H size={30}>{d.resume_name ?? d.original_filename}</H>
    <Badge>{(d.original_filename?.split('.').pop() ?? '').toString().toUpperCase()}</Badge>
    <Muted>{d.original_filename} · {d.created_at?.slice(0, 10)}{d.file_size_bytes ? ` · ${(d.file_size_bytes / 1024).toFixed(0)} KB` : ''}</Muted>
    {text ? <Card><Text style={{ fontFamily: F.bold, textTransform: 'uppercase', fontSize: 12 }}>Extracted text</Text><Text style={{ fontFamily: F.body }}>{text.slice(0, 1500)}</Text></Card> : null}
    <Button title="Customize this resume" onPress={() => r.push('/customize')} />
    <DownloadButton title="Download original" path={`/resumes/${id}/download`} filename={d.original_filename ?? 'resume'} />
    <Button title="Delete" variant="danger" onPress={del} /></ScrollView>;
}
