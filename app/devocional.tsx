import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Lamparina from '../src/components/Lamparina';
import { Body, Button, Card, Chip, Input, Label, Title } from '../src/components/ui';
import { BOOKS, Book } from '../src/lib/books';
import { fetchChapter, Chapter, VERSIONS } from '../src/lib/bible';
import { generateReflection, respondToNote } from '../src/lib/ai';
import { completeDevotional, getEntries, getProfile, Profile, today } from '../src/lib/storage';
import { shareReflection, syncProfile } from '../src/lib/community';
import { hasSupabase } from '../src/lib/supabase';
import { C } from '../src/lib/theme';

type Step = 'book' | 'chapter' | 'verses' | 'reflection' | 'done';

export default function Devocional() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [version, setVersion] = useState('nvi');
  const [step, setStep] = useState<Step>('book');
  const [book, setBook] = useState<Book | null>(null);
  const [chapterNum, setChapterNum] = useState(1);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState('');
  const [note, setNote] = useState('');
  const [response, setResponse] = useState('');
  const [share, setShare] = useState(false);

  useEffect(() => { getProfile().then((p) => { setProfile(p); if (p) setVersion(p.version); }); }, []);

  const books = useMemo(() => BOOKS.filter((b) => b.name.toLowerCase().includes(filter.toLowerCase())), [filter]);
  const ref = useMemo(() => {
    if (!book || !selected.length) return '';
    const v = [...selected].sort((a, b) => a - b);
    const range = v.length > 1 && v[v.length - 1] - v[0] === v.length - 1 ? `${v[0]}-${v[v.length - 1]}` : v.join(',');
    return `${book.name} ${chapterNum}:${range} (${version.toUpperCase()})`;
  }, [book, chapterNum, selected, version]);
  const verseText = chapter?.verses.filter((v) => selected.includes(v.number)).map((v) => v.text).join(' ') ?? '';

  async function openChapter(n: number) {
    setChapterNum(n); setLoading(true); setSelected([]);
    try { setChapter(await fetchChapter(version, book!.abbrev, n)); setStep('verses'); }
    catch (e: any) { Alert.alert('Ops', e.message); }
    finally { setLoading(false); }
  }

  async function reflect() {
    setLoading(true);
    const recent = await getEntries();
    const text = await generateReflection({
      profile: profile!, ref, verseText,
      chapterText: chapter!.verses.map((v) => `${v.number} ${v.text}`).join(' '), recent,
    });
    setReflection(text); setStep('reflection'); setLoading(false);
  }

  async function finish() {
    if (!note.trim()) return Alert.alert('Registre seu momento', 'Escreva o que tocou seu coração.');
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {loading && <ActivityIndicator color={C.gold} style={{ marginVertical: 12 }} />}

        {step === 'book' && <>
          <Title>Escolha o livro</Title>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {VERSIONS.map((v) => <Chip key={v.id} label={v.id.toUpperCase()} active={version === v.id} onPress={() => setVersion(v.id)} />)}
          </View>
          <Input value={filter} onChangeText={setFilter} placeholder="Buscar livro..." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {books.map((b) => <Chip key={b.abbrev} label={b.name} onPress={() => { setBook(b); setStep('chapter'); }} />)}
          </View>
        </>}

        {step === 'chapter' && book && <>
          <Title>{book.name}</Title><Label>Capítulo</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) =>
              <Chip key={n} label={String(n)} onPress={() => openChapter(n)} />)}
          </View>
          <Button ghost title="Trocar livro" onPress={() => setStep('book')} />
        </>}

        {step === 'verses' && chapter && <>
          <Title>{book!.name} {chapterNum}</Title>
          <Body muted>Toque em um ou mais versículos para refletir.</Body>
          {chapter.verses.map((v) => {
            const on = selected.includes(v.number);
            return (
              <Pressable key={v.number} onPress={() => setSelected((s) => on ? s.filter((x) => x !== v.number) : [...s, v.number])}
                style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginTop: 4, backgroundColor: on ? C.cardAlt : 'transparent', borderLeftWidth: 3, borderLeftColor: on ? C.gold : 'transparent' }}>
                <Text style={{ color: C.text, fontSize: 16, lineHeight: 25 }}>
                  <Text style={{ color: C.gold, fontWeight: '700' }}>{v.number} </Text>{v.text}
                </Text>
              </Pressable>
            );
          })}
          <Button title={selected.length ? `Refletir sobre ${ref.split(' (')[0]}` : 'Selecione um versículo'} disabled={!selected.length || loading} onPress={reflect} />
          <Button ghost title="Outro capítulo" onPress={() => setStep('chapter')} />
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
