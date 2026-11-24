import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Lamparina from '../../src/components/Lamparina';
import { Body, Button, Card, Title } from '../../src/components/ui';
import { getProfile, getStats, litToday, Profile, Stats } from '../../src/lib/storage';
import { C } from '../../src/lib/theme';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

export default function Home() {
  const [p, setP] = useState<Profile | null>(null);
  const [s, setS] = useState<Stats | null>(null);
  useFocusEffect(useCallback(() => { getProfile().then(setP); getStats().then(setS); }, []));
  const lit = !!s && litToday(s);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'stretch' }}>
        <Title>{greeting()}, {p?.name.split(' ')[0]}</Title>
        <Body muted>{lit ? 'Sua lamparina está acesa hoje. Que a luz te acompanhe!' : 'Sua lamparina aguarda o óleo de hoje.'}</Body>
        <View style={{ alignItems: 'center', marginVertical: 28 }}><Lamparina lit={lit} size={240} /></View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.gold, fontSize: 30, fontWeight: '800' }}>{s?.streak ?? 0}</Text>
            <Text style={{ color: C.muted }}>dias seguidos</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.text, fontSize: 30, fontWeight: '800' }}>{s?.best ?? 0}</Text>
            <Text style={{ color: C.muted }}>recorde</Text>
          </Card>
        </View>
        <Button title={lit ? 'Fazer outro devocional' : 'Começar devocional de hoje'} onPress={() => router.push('/devocional')} />
      </ScrollView>
    </SafeAreaView>
  );
}
