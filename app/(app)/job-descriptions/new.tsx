import React from 'react';
import { useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { send } from '../../../src/lib/api';
import JDForm from '../../../src/components/JDForm';
import { useToast } from '../../../src/components/Toast';
export default function NewJD() {
  const r = useRouter(); const qc = useQueryClient(); const toast = useToast();
  return <><Stack.Screen options={{ title: 'New job description' }} />
    <JDForm onSubmit={async (v) => { try { await send('POST', '/job-descriptions', v); await qc.invalidateQueries({ queryKey: ['jds'] }); toast('Job description saved'); r.back(); } catch (e) { toast((e as Error).message, 'error'); } }} /></>;
}
