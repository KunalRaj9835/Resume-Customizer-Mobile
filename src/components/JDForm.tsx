import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Field, Muted, C } from './ui';
const MAX = 10000; // ASSUMPTION: match backend limit
export type JDValues = { title: string; company_name: string | null; jd_text: string };
export default function JDForm({ initial, onSubmit, submitLabel = 'Save', extra }: { initial?: Partial<JDValues>; onSubmit: (v: JDValues) => Promise<void>; submitLabel?: string; extra?: React.ReactNode }) {
  const [title, setT] = useState(initial?.title ?? ''); const [company, setC] = useState(initial?.company_name ?? ''); const [desc, setD] = useState(initial?.jd_text ?? ''); const [busy, setBusy] = useState(false);
  const valid = title.trim() && desc.trim() && desc.length <= MAX;
  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <Field label="Job title" value={title} onChangeText={setT} />
    <Field label="Company (optional)" value={company} onChangeText={setC} />
    <Field label="Description" multiline value={desc} onChangeText={setD} />
    <Muted>{desc.length}/{MAX}</Muted>
    <Button title={submitLabel} disabled={!valid} loading={busy} onPress={async () => { setBusy(true); try { await onSubmit({ title: title.trim(), company_name: company.trim() || null, jd_text: desc }); } finally { setBusy(false); } }} />
    {extra}</ScrollView>;
}
