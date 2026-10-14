import React from 'react';
import { useRouter } from 'expo-router';
import { ListScreen } from '../../../src/components/ListScreen';
import { Badge, Card, Muted, H } from '../../../src/components/ui';
import { DownloadButton } from '../../../src/components/Download';
export default function History() {
  const r = useRouter();
  return <ListScreen<any> keyName="customizations" path="/customizations" empty="No customizations yet. Run the wizard from the dashboard."
    render={(i) => <Card onPress={() => r.push(`/customizations/${i.id}`)}>
      <H size={22}>{i.job_title ?? 'Customization'}</H>
      <Muted>{[i.company, i.resume_name].filter(Boolean).join(' · ')} {i.created_at?.slice(0, 10)}</Muted>
      {typeof i.match_score === 'number' && <Badge>Match {Math.round(i.match_score)}</Badge>}
      <DownloadButton title="PDF" path={`/customizations/${i.id}/download?format=pdf`} filename={`resume-${i.id}.pdf`} />
      <DownloadButton title="DOCX" path={`/customizations/${i.id}/download?format=docx`} filename={`resume-${i.id}.docx`} /></Card>} />;
}
