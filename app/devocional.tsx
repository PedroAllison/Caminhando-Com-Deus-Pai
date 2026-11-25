import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { notify } from '../src/lib/alert';
import Lamparina from '../src/components/Lamparina';
import { Body, Button, Card, Input, Label, Title } from '../src/components/ui';
import { fetchChapter, Chapter } from '../src/lib/bible';
import { generateReflection, respondToNote } from '../src/lib/ai';
import { completeDevotional, Entry, getEntries, getProfile, Profile, today } from '../src/lib/storage';
import { shareReflection, syncProfile } from '../src/lib/community';
import { MOODS, suggest, Suggestion } from '../src/lib/recommend';
import { hasSupabase } from '../src/lib/supabase';
import { C } from '../src/lib/theme';

type Step = 'mood' | 'passage' | 'reflection' | 'done';

export default function Devocional() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recent, setRecent] = useState<Entry[]>([]);
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState('');
  const [skip, setSkip] = useState(0);
  const [sug, setSug] = useState<Suggestion | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [showChapter, setShowChapter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState('');
  const [note, setNote] = useState('');
  const [response, setResponse] = useState('');
  const [share, setShare] = useState(false);

  useEffect(() => { getProfile().then(setProfile); getEntries().then(setRecent); }, []);

  async function pick(m: string, s = 0) {
    if (!profile) return;
    setMood(m); setSkip(s); setLoading(true); setShowChapter(false);
    const sg = suggest(profile, m, recent, s);
    setSug(sg);
    try { setChapter(await fetchChapter('nvi', sg.abbrev, sg.chapter)); setStep('passage'); }
    catch (e: any) { notify('Ops', e.message); }
    setLoading(false);
  }

  const verses = chapter?.verses.filter((v) => sug && v.number >= sug.from && v.number <= sug.to) ?? [];
  const verseText = verses.map((v) => v.text).join(' ');
  const ref = sug ? `${sug.ref} (NVI)` : '';

  async function reflect() {
    setLoading(true);
    const text = await generateReflection({
      profile: profile!, ref, verseText,
      chapterText: chapter!.verses.map((v) => `${v.number} ${v.text}`).join(' '), recent,
    });
    setReflection(text); setStep('reflection'); setLoading(false);
  }

  async function finish() {
    if (!note.trim()) return notify('Registre seu momento', 'Escreva o que tocou seu coração.');
    setLoading(true);
    const resp = await respondToNote(profile!, ref, reflection, note);
    setResponse(resp);
    const stats = await completeDevotional({ date: today(), ref, verseText, reflection, note, response: resp });
    if (hasSupabase) {
      syncProfile(profile!, stats).catch(() => {});
      if (share) shareReflection(ref, note).catch(() => {});
    }
    setLoading(false); setStep('done');
  }

  if (!profile) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {loading && <ActivityIndicator color={C.gold} style={{ marginVertical: 12 }} />}

        {step === 'mood' && <>
          <Title>Como está seu coração hoje, {profile.name.split(' ')[0]}?</Title>
          <Body muted>Vou escolher uma palavra das Escrituras para este momento.</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {MOODS.map((m) => (
              <Pressable key={m.id} onPress={() => pick(m.id)} disabled={loading}
                style={({ pressed }) => ({ width: '47%', backgroundColor: pressed ? C.cardAlt : C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.line, alignItems: 'center' })}>
                <Text style={{ fontSize: 30 }}>{m.emoji}</Text>
                <Text style={{ color: C.text, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </>}

        {step === 'passage' && sug && chapter && <>
          <Label>Palavra de hoje para você</Label>
          <Card style={{ borderColor: C.gold }}>
            <Text style={{ color: C.gold, fontWeight: '700', fontSize: 18, marginBottom: 8 }}>{sug.ref}</Text>
            {verses.map((v) => (
              <Text key={v.number} style={{ color: C.text, fontSize: 17, lineHeight: 27 }}>
                <Text style={{ color: C.gold, fontWeight: '700' }}>{v.number} </Text>{v.text}
              </Text>
            ))}
          </Card>
          <Pressable onPress={() => setShowChapter((s) => !s)} style={{ marginTop: 12 }}>
            <Text style={{ color: C.gold }}>{showChapter ? '▲ Ocultar capítulo' : `▼ Ler ${sug.bookName} ${sug.chapter} completo`}</Text>
          </Pressable>
          {showChapter && chapter.verses.map((v) => {
            const on = v.number >= sug.from && v.number <= sug.to;
            return (
              <Text key={v.number} style={{ color: on ? C.text : C.muted, fontSize: 15, lineHeight: 23, marginTop: 4, fontWeight: on ? '600' : '400' }}>
                <Text style={{ color: C.gold }}>{v.number} </Text>{v.text}
              </Text>
            );
          })}
          <Button title="Refletir sobre esta palavra" disabled={loading} onPress={reflect} />
          <Button ghost title="Outra sugestão" disabled={loading} onPress={() => pick(mood, skip + 1)} />
          <Button ghost title="Mudar como estou me sentindo" onPress={() => setStep('mood')} />
        </>}

        {step === 'reflection' && <>
          <Card style={{ borderColor: C.gold }}>
            <Text style={{ color: C.gold, fontWeight: '700', marginBottom: 6 }}>{ref}</Text>
            <Text style={{ color: C.text, fontStyle: 'italic', fontSize: 16, lineHeight: 24 }}>"{verseText}"</Text>
          </Card>
          <Label>Reflexão para você</Label>
          <Body>{reflection}</Body>
          <Label>Seu registro</Label>
          <Input multiline value={note} onChangeText={setNote} placeholder="O que Deus falou com você? O que achou interessante?" />
          {hasSupabase && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}>
              <Body muted>Compartilhar com meus amigos</Body>
              <Switch value={share} onValueChange={setShare} trackColor={{ true: C.gold }} />
            </View>
          )}
          <Button title="Concluir e acender a lamparina" disabled={loading} onPress={finish} />
        </>}

        {step === 'done' && <>
          <View style={{ alignItems: 'center', marginVertical: 12 }}><Lamparina lit size={200} /></View>
          <Title>Lamparina acesa! 🔥</Title>
          <Card><Body>{response}</Body></Card>
          <Button title="Voltar ao início" onPress={() => router.back()} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
