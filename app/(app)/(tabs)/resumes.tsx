import React from 'react';
import { useRouter } from 'expo-router';
import { ListScreen } from '../../../src/components/ListScreen';
import { Badge, Button, Card, Muted, H } from '../../../src/components/ui';
import { DownloadButton } from '../../../src/components/Download';
export default function Resumes() {
  const r = useRouter();
  return <ListScreen<any> keyName="resumes" path="/resumes" empty="No resumes yet. Upload one to get started."
    header={<Button title="Upload resume" onPress={() => r.push('/resumes/upload')} />}
    render={(i) => <Card onPress={() => r.push(`/resumes/${i.id}`)}><H>{i.resume_name ?? i.original_filename}</H><Badge>{(i.original_filename ?? '').split('.').pop()}</Badge><Muted>{i.original_filename} · {i.created_at?.slice(0, 10)}</Muted>
      <DownloadButton title="Download original" path={`/resumes/${i.id}/download`} filename={i.original_filename ?? 'resume'} /></Card>} />;
}
