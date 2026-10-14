import { Stack } from 'expo-router';
import { F } from '../../src/components/ui';
export default function L() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#FF4A00', headerTitleStyle: { fontFamily: F.display, color: '#fff' } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} /></Stack>;
}
