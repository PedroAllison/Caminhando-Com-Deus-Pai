import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Body, Card, Label, Title } from '../../src/components/ui';
import { Entry, getEntries, getProfile, getStats, Profile, Stats } from '../../src/lib/storage';
import { C } from '../../src/lib/theme';

export default function Perfil() {
  const [p, setP] = useState<Profile | null>(null);
  const [s, setS] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  useFocusEffect(useCallback(() => { getProfile().then(setP); getStats().then(setS); getEntries().then(setEntries); }, []));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Title>{p?.name}</Title>
      <Body muted>{s?.total ?? 0} devocionais · recorde de {s?.best ?? 0} dias</Body>
      <Label>Meu diário</Label>
      {entries.length === 0 && <Body muted>Seus registros aparecerão aqui.</Body>}
      {entries.map((e, i) => (
        <Card key={i}>
          <Text onPress={() => setOpen(open === i ? null : i)} style={{ color: C.gold, fontWeight: '700' }}>
            {e.date.split('-').reverse().join('/')} · {e.ref}
          </Text>
          <Body>{e.note}</Body>
          {open === i && <>
            <Label>Reflexão</Label><Body muted>{e.reflection}</Body>
            <Label>Resposta</Label><Body muted>{e.response}</Body>
          </>}
        </Card>
      ))}
    </ScrollView>
  );
}
