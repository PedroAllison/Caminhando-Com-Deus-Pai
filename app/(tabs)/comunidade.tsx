import { notify } from '../../src/lib/alert';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import Lamparina from '../../src/components/Lamparina';
import { Body, Button, Card, Input, Label, Title } from '../../src/components/ui';
import { addFriend, amen, feed, Friend, listFriends, SharedPost, syncProfile } from '../../src/lib/community';
import { getProfile, getStats, today } from '../../src/lib/storage';
import { hasSupabase } from '../../src/lib/supabase';
import { C } from '../../src/lib/theme';

export default function Comunidade() {
  const [code, setCode] = useState<string | undefined>();
  const [friendCode, setFriendCode] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!hasSupabase) return;
    setLoading(true);
    try {
      const p = await getProfile();
      if (p) setCode(await syncProfile(p, await getStats()) ?? undefined);
      setFriends(await listFriends());
      setPosts(await feed());
    } catch (e: any) { console.warn(e.message); }
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!hasSupabase) return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Title>Comunidade</Title>
      <Body muted>Configure o Supabase no arquivo .env para ativar amigos e compartilhamentos (veja o README).</Body>
    </ScrollView>
  );

  async function onAdd() {
    try { await addFriend(friendCode); setFriendCode(''); load(); notify('Pronto!', 'Amigo adicionado.'); }
    catch (e: any) { notify('Ops', e.message); }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.gold} />}>
      <Card>
        <Label>Seu código de amizade</Label>
        <Text style={{ color: C.gold, fontSize: 28, fontWeight: '800', letterSpacing: 4 }}>{code ?? '...'}</Text>
        <Button ghost title="Convidar amigo" onPress={() => Share.share({
          message: `Vamos manter nossas lamparinas acesas juntos! Baixe o Caminhando com Deus Pai e me adicione com o código ${code}`,
        })} />
      </Card>
      <Label>Adicionar amigo</Label>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Input style={{ flex: 1 }} value={friendCode} onChangeText={setFriendCode} placeholder="Código" autoCapitalize="characters" />
        <Button title="Adicionar" onPress={onAdd} style={{ marginTop: 0, paddingHorizontal: 18 }} />
      </View>

      <Label>Lamparinas dos amigos</Label>
      {friends.length === 0 && <Body muted>Nenhum amigo ainda. Compartilhe seu código!</Body>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {friends.map((f) => {
          const lit = f.last_date === today();
          return (
            <View key={f.id} style={{ alignItems: 'center', marginRight: 14, width: 96 }}>
              <Lamparina lit={lit} size={90} />
              <Text style={{ color: C.text, fontWeight: '600' }} numberOfLines={1}>{f.name.split(' ')[0]}</Text>
              <Text style={{ color: lit ? C.gold : C.muted, fontSize: 12 }}>{lit ? `🔥 ${f.streak} dias` : 'apagada'}</Text>
            </View>
          );
        })}
      </ScrollView>

      <Label>Reflexões compartilhadas</Label>
      {posts.length === 0 && <Body muted>Quando seus amigos compartilharem, aparece aqui.</Body>}
      {posts.map((p) => (
        <Card key={p.id}>
          <Text style={{ color: C.gold, fontWeight: '700' }}>{p.name} · {p.ref}</Text>
          <Body>{p.note}</Body>
          <Pressable onPress={async () => { await amen(p.id); load(); }} style={{ marginTop: 10 }}>
            <Text style={{ color: C.muted }}>🙏 Amém {p.amens > 0 ? `(${p.amens})` : ''}</Text>
          </Pressable>
        </Card>
      ))}
    </ScrollView>
  );
}
