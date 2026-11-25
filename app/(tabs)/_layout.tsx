import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C } from '../../src/lib/theme';

const icon = (e: string) => ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: C.bg }, headerTintColor: C.text,
      tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line },
      tabBarActiveTintColor: C.gold, tabBarInactiveTintColor: C.muted,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Hoje', headerShown: false, tabBarIcon: icon('🪔') }} />
      <Tabs.Screen name="comunidade" options={{ title: 'Comunidade', tabBarIcon: icon('🤝') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Diário', tabBarIcon: icon('📖') }} />
    </Tabs>
  );
}
