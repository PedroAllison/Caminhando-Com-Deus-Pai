import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getProfile } from '../src/lib/storage';
import { C } from '../src/lib/theme';

export default function Index() {
  const [state, setState] = useState<'loading' | 'new' | 'ok'>('loading');
  useEffect(() => { getProfile().then((p) => setState(p ? 'ok' : 'new')); }, []);
  if (state === 'loading')
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.gold} /></View>;
  return <Redirect href={state === 'ok' ? '/(tabs)' : '/onboarding'} />;
}
