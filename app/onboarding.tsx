import { notify } from '../src/lib/alert';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Lamparina from '../src/components/Lamparina';
import { Body, Button, Chip, Input, Label, Title } from '../src/components/ui';
import { VERSIONS } from '../src/lib/bible';
import { getStats, saveProfile, Gender } from '../src/lib/storage';
import { scheduleReminders } from '../src/lib/notifications';
import { syncProfile } from '../src/lib/community';
import { C } from '../src/lib/theme';

const TIMES = ['06:00', '07:00', '08:00', '12:00', '15:00', '19:00', '21:00', '22:00'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [version, setVersion] = useState('nvi');
  const [reminders, setReminders] = useState<string[]>(['07:00', '21:00']);

  const toggle = (t: string) => setReminders((r) => r.includes(t) ? r.filter((x) => x !== t) : [...r, t].sort());

  async function finish() {
    const profile = { name: name.trim(), age: Number(age), gender: gender!, version, reminders };
    await saveProfile(profile);
    if (reminders.length) await scheduleReminders(reminders, profile.name);
    syncProfile(profile, await getStats()).catch(() => {});
    router.replace('/(tabs)');
  }

  function next() {
    if (!name.trim() || !age || !gender) return notify('Quase lá', 'Preencha nome, idade e sexo.');
    if (Number(age) < 5 || Number(age) > 120) return notify('Idade inválida');
    setStep(1);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginVertical: 16 }}><Lamparina lit={step === 1} size={150} /></View>
        {step === 0 ? (
          <>
            <Title>Caminhando com Deus Pai</Title>
            <Body muted>Um momento diário com a Palavra. Mantenha sua lamparina acesa.</Body>
            <Label>Seu nome</Label>
            <Input value={name} onChangeText={setName} placeholder="Como quer ser chamado(a)?" />
            <Label>Idade</Label>
            <Input value={age} onChangeText={(t) => setAge(t.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="Ex.: 28" maxLength={3} />
            <Label>Sexo</Label>
            <View style={{ flexDirection: 'row' }}>
              <Chip label="Homem" active={gender === 'M'} onPress={() => setGender('M')} />
              <Chip label="Mulher" active={gender === 'F'} onPress={() => setGender('F')} />
            </View>
            <Button title="Continuar" onPress={next} />
          </>
        ) : (
          <>
            <Title>Configure, {name.split(' ')[0]}</Title>
            <Label>Versão da Bíblia</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {VERSIONS.map((v) => <Chip key={v.id} label={v.id.toUpperCase()} active={version === v.id} onPress={() => setVersion(v.id)} />)}
            </View>
            <Label>Lembretes ao longo do dia</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {TIMES.map((t) => <Chip key={t} label={t} active={reminders.includes(t)} onPress={() => toggle(t)} />)}
            </View>
            <Button title="Acender minha lamparina" onPress={finish} />
            <Button ghost title="Voltar" onPress={() => setStep(0)} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
