import React from 'react';
import { useRouter } from 'expo-router';
import { ListScreen } from '../../../src/components/ListScreen';
import { Button, Card, Muted, H } from '../../../src/components/ui';
export default function JDs() {
  const r = useRouter();
  return <ListScreen<any> keyName="jds" path="/job-descriptions" empty="No job descriptions saved."
    header={<Button title="New job description" onPress={() => r.push('/job-descriptions/new')} />}
    render={(i) => <Card onPress={() => r.push(`/job-descriptions/${i.id}`)}><H>{i.title ?? 'Untitled role'}</H><Muted>{i.company_name}</Muted><Muted>{(i.jd_text ?? '').slice(0, 120)}</Muted></Card>} />;
}
