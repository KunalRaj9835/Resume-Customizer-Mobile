import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import { send, getAll, norm } from '../../../src/lib/api';
import ResumeScene3D from '../../../src/components/ResumeScene3D';
import { Button, Card, H, Muted, Loading, C } from '../../../src/components/ui';
export default function Customize() {
  const [step, setStep] = useState(1); const [rid, setRid] = useState<string>(); const [jid, setJid] = useState<string>(); const [busy, setBusy] = useState(false); const [tone, setTone] = useState('professional');
  const r = useRouter(); const qc = useQueryClient();
  const rs = useQuery({ queryKey: ['resumes-all'], queryFn: async () => getAll('/resumes') });
  const js = useQuery({ queryKey: ['jds-all'], queryFn: async () => getAll('/job-descriptions') });
  const generate = async () => {
    if (busy) return; setBusy(true);
    try { // ASSUMPTION: body field names; no automatic retry (non-idempotent)
      const res = await send<any>('POST', '/customizations', { resume_id: rid, jd_id: jid, preferences: { tone } }, 180000);
      await qc.invalidateQueries({ queryKey: ['customizations'] }); r.replace(`/customizations/${norm(res).id}`);
    } catch (e) { Alert.alert('Generation failed', (e as Error).message + '\nCheck History before trying again.'); } finally { setBusy(false); }
  };
  const list = step === 1 ? rs : js;
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <Stack.Screen options={{ title: `Customize (${step}/3)` }} />
    <ResumeScene3D style={{ height: step === 3 ? 240 : 140 }} speed={busy ? 3 : 1} />
    {step < 3 ? (list.isLoading ? <Loading /> : <>
      <H>{step === 1 ? 'Select a resume' : 'Select a job description'}</H>
      {(list.data ?? []).map((i: any) => { const sel = (step === 1 ? rid : jid) === i.id;
        return <Card key={i.id} onPress={() => (step === 1 ? setRid(i.id) : setJid(i.id))}><H>{(sel ? '✓ ' : '') + (i.resume_name ?? i.original_filename ?? i.title ?? 'Untitled')}</H><Muted>{i.company_name ?? i.created_at?.slice(0, 10) ?? ''}</Muted></Card>; })}
      <Button title="Next" disabled={step === 1 ? !rid : !jid} onPress={() => setStep(step + 1)} />
    </>) : <View style={{ gap: 12 }}>
      <H>Review</H><Muted>The AI should preserve your real experience and qualifications. Please review the result before use.</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['professional', 'concise', 'confident', 'technical'].map((t) => <Button key={t} title={(t === tone ? '✓ ' : '') + t} variant={t === tone ? 'primary' : 'ghost'} onPress={() => setTone(t)} />)}</View>
      <Button title="Generate tailored resume" loading={busy} onPress={generate} />
    </View>}
    {step > 1 && <Button title="Back" variant="ghost" disabled={busy} onPress={() => setStep(step - 1)} />}
  </ScrollView>;
}
