import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { json, send, norm } from '../../../src/lib/api';
import JDForm from '../../../src/components/JDForm';
import { Button, Loading, ErrorState, confirm } from '../../../src/components/ui';
import { useToast } from '../../../src/components/Toast';
export default function EditJD() {
  const { id } = useLocalSearchParams<{ id: string }>(); const r = useRouter(); const qc = useQueryClient(); const toast = useToast();
  const q = useQuery({ queryKey: ['jd', id], queryFn: () => json<any>(`/job-descriptions/${id}`).then(norm) });
  if (q.isLoading) return <Loading />; if (q.error) return <ErrorState error={q.error as Error} retry={() => q.refetch()} />;
  const d = q.data;
  const del = () => confirm('Delete job description?', 'This cannot be undone.', async () => {
    try { await json(`/job-descriptions/${id}`, { method: 'DELETE' }); await qc.invalidateQueries({ queryKey: ['jds'] }); toast('Deleted'); r.back(); } catch (e) { toast((e as Error).message, 'error'); } });
  return <><Stack.Screen options={{ title: 'Edit job' }} />
    <JDForm initial={{ title: d.title, company_name: d.company_name, jd_text: d.jd_text }} submitLabel="Save changes"
      onSubmit={async (v) => { try { await send('PATCH', `/job-descriptions/${id}`, v); await qc.invalidateQueries({ queryKey: ['jds'] }); await qc.invalidateQueries({ queryKey: ['jd', id] }); toast('Saved'); } catch (e) { toast((e as Error).message, 'error'); } }}
      extra={<Button title="Delete" variant="danger" onPress={del} />} /></>;
}
