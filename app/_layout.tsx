import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { C } from '../src/lib/theme';

export default function Root() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: C.bg }, headerTintColor: C.text, contentStyle: { backgroundColor: C.bg },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="devocional" options={{ title: 'Devocional' }} />
      </Stack>
    </>
  );
}
