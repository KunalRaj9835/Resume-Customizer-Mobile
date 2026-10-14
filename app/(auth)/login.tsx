import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import Scene3D from '../../src/components/Scene3D';
import { Button, Grid, H, Muted, Note, C, F } from '../../src/components/ui';
export default function Login() {
  const { signIn, error } = useAuth(); const [busy, setBusy] = useState(false);
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <Grid />
    <Scene3D variant="statue" style={{ position: 'absolute', left: 0, right: 0, top: '14%', height: '52%' }} />
    <View style={{ flex: 1, justifyContent: 'space-between', padding: 24 }}>
      <Note>Resume Customizer</Note>
      <View style={{ gap: 4 }}>
        <H size={64} color={C.brand}>Bold resume</H>
        <View style={{ alignSelf: 'flex-end' }}><H size={64} color={C.brand}>that</H></View>
        <H size={64} color={C.brand}>fits</H>
        <View style={{ marginTop: 16, gap: 6 }}>
          <Note underline>Generic is expensive</Note>
          <Muted>Upload your resume, add a job description, get a tailored version. Your resumes are processed by our backend and AI provider.</Muted>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        {error && <Text accessibilityRole="alert" style={{ color: C.danger, fontFamily: F.semi }}>{error}</Text>}
        <Button title="Continue with Google" loading={busy} onPress={async () => { setBusy(true); await signIn(); setBusy(false); }} />
      </View>
    </View>
  </SafeAreaView>;
}
