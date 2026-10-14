import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { json, norm } from '../../../src/lib/api';
import { Card, H, Muted, Loading, ErrorState, C, F } from '../../../src/components/ui';
import Gauge3D from '../../../src/components/Gauge3D';
import { DownloadButton } from '../../../src/components/Download';
// Plain <Text> only, so LLM output is rendered safely. Shape matches the web app's ResumeContent.
const str = (v: any) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const arr = (v: any): any[] => (Array.isArray(v) ? v : []);
const Sec = ({ title, children }: any) => <Card><Text style={{ fontFamily: F.display, fontSize: 18, textTransform: 'uppercase' }}>{title}</Text>{children}</Card>;
const T = ({ children, b }: any) => <Text style={{ fontFamily: b ? F.bold : F.body, color: '#000' }}>{children}</Text>;
const Bullets = ({ items }: { items: any }) => <>{arr(items).map((b, i) => <T key={i}>• {str(b)}</T>)}</>;
export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({ queryKey: ['customization', id], queryFn: () => json<any>(`/customizations/${id}`).then(norm) });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error as Error} retry={() => q.refetch()} />;
  const c = q.data?.content ?? {};
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <Stack.Screen options={{ title: 'Result' }} />
    {typeof q.data?.match_score === 'number' && <Gauge3D score={q.data.match_score} />}
    {c.name ? <H size={30}>{str(c.name)}</H> : null}
    {arr(c.contact).length > 0 && <Muted>{arr(c.contact).map(str).join(' · ')}</Muted>}
    {c.summary ? <Sec title="Summary"><T>{str(c.summary)}</T></Sec> : null}
    {arr(c.skills).length > 0 && <Sec title="Skills"><T>{arr(c.skills).map(str).join(' · ')}</T></Sec>}
    {arr(c.experience).length > 0 && <Sec title="Experience">{arr(c.experience).map((e, i) => <View key={i} style={{ marginBottom: 8 }}>
      <T b>{str(e.title)}{e.company ? ' – ' + str(e.company) : ''}</T>{e.dates ? <Muted>{str(e.dates)}</Muted> : null}<Bullets items={e.bullets} /></View>)}</Sec>}
    {arr(c.projects).length > 0 && <Sec title="Projects">{arr(c.projects).map((p, i) => <View key={i} style={{ marginBottom: 8 }}>
      <T b>{str(p.name)}</T>{p.description ? <T>{str(p.description)}</T> : null}<Bullets items={p.bullets} /></View>)}</Sec>}
    {arr(c.education).length > 0 && <Sec title="Education">{arr(c.education).map((e, i) => <View key={i}><T b>{str(e.degree)}</T><Muted>{[e.school, e.dates].filter(Boolean).map(str).join(' · ')}</Muted></View>)}</Sec>}
    {arr(c.certifications).length > 0 && <Sec title="Certifications"><Bullets items={c.certifications} /></Sec>}
    {arr(c.additional).map((a, i) => <Sec key={i} title={str(a.heading)}><Bullets items={a.items} /></Sec>)}
    <DownloadButton title="Download PDF" path={`/customizations/${id}/download?format=pdf`} filename={`resume-${id}.pdf`} />
    <DownloadButton title="Download DOCX" path={`/customizations/${id}/download?format=docx`} filename={`resume-${id}.docx`} />
  </ScrollView>;
}
