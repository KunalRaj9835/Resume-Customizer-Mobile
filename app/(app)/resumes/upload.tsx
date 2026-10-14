import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { upload } from '../../../src/lib/api';
import ResumeScene3D from '../../../src/components/ResumeScene3D';
import { Button, Muted, C } from '../../../src/components/ui';
const MAX = 10 * 1024 * 1024; // ASSUMPTION: match backend limit
const OK = /\.(pdf|docx)$/i;
export default function Upload() {
  const [f, setF] = useState<DocumentPicker.DocumentPickerAsset | null>(null); const [busy, setBusy] = useState(false);
  const r = useRouter(); const qc = useQueryClient();
  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], copyToCacheDirectory: true });
    if (res.canceled) return; const a = res.assets[0];
    if (!OK.test(a.name)) return Alert.alert('Unsupported file', 'Choose a PDF or DOCX.');
    if (a.size && a.size > MAX) return Alert.alert('File too large', 'Maximum size is 10 MB.');
    setF(a);
  };
  const go = async () => {
    if (!f || busy) return; setBusy(true);
    try { await upload({ uri: f.uri, name: f.name, mimeType: f.mimeType }); await qc.invalidateQueries({ queryKey: ['resumes'] }); r.replace('/resumes'); }
    catch (e) { Alert.alert('Upload failed', (e as Error).message); } finally { setBusy(false); }
  };
  return <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: C.bg }}><Stack.Screen options={{ title: 'Upload resume' }} />
    <ResumeScene3D style={{ height: 220 }} speed={busy ? 3 : 1} />
    <Button title={f ? 'Replace file' : 'Choose PDF or DOCX'} variant="ghost" onPress={pick} />
    {f && <Muted>{f.name} · {f.size ? (f.size / 1024).toFixed(0) + ' KB' : ''}</Muted>}
    <Button title="Upload" disabled={!f} loading={busy} onPress={go} /></View>;
}
