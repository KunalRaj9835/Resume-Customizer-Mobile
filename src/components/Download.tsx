import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { download } from '../lib/api';
import { Button } from './ui';
export function DownloadButton({ title, path, filename }: { title: string; path: string; filename: string }) {
  const [busy, setBusy] = useState(false);
  return <Button title={title} variant="ghost" loading={busy} onPress={async () => {
    setBusy(true);
    try {
      const uri = await download(path, filename);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri); else Alert.alert('Saved', uri);
    } catch (e) { Alert.alert('Download failed', (e as Error).message); } finally { setBusy(false); }
  }} />;
}
