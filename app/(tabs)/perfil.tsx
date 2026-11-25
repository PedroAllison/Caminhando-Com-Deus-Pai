import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
      {entries.map((e, i) => {
        const isOpen = open === i;
        return (
          <Pressable key={i} onPress={() => setOpen(isOpen ? null : i)}>
            <Card style={isOpen ? { borderColor: C.gold } : undefined}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{e.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: C.gold, fontWeight: '700', fontSize: 16, marginTop: 2 }}>{e.ref}</Text>
                </View>
                <Text style={{ color: C.muted, fontSize: 16 }}>{isOpen ? '▲' : '▼'}</Text>
              </View>
              {isOpen && <>
                <Text style={{ color: C.text, fontStyle: 'italic', marginTop: 10, lineHeight: 22 }}>"{e.verseText}"</Text>
                <Label>Meu relato</Label><Body>{e.note}</Body>
                <Label>Reflexão</Label><Body muted>{e.reflection}</Body>
                <Label>Resposta</Label><Body muted>{e.response}</Body>
              </>}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
