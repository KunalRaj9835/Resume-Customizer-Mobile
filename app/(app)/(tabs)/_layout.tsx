import { Tabs } from 'expo-router';
import { F } from '../../../src/components/ui';
export default function L() {
  return <Tabs screenOptions={{
    tabBarActiveTintColor: '#FF4A00', tabBarInactiveTintColor: '#fff',
    tabBarStyle: { backgroundColor: '#000', borderTopWidth: 0 },
    tabBarLabelStyle: { fontFamily: F.bold, textTransform: 'uppercase', fontSize: 11 },
    tabBarIconStyle: { display: 'none' },
    headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff',
    headerTitleStyle: { fontFamily: F.display, textTransform: 'uppercase', fontSize: 22 } }}>
    <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
    <Tabs.Screen name="resumes" options={{ title: 'Resumes' }} />
    <Tabs.Screen name="job-descriptions" options={{ title: 'Jobs' }} />
    <Tabs.Screen name="history" options={{ title: 'History' }} />
  </Tabs>;
}
