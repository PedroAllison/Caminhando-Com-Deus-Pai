import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { C, font } from '../lib/theme';

export const Title = ({ children }: { children: React.ReactNode }) => <Text style={s.title}>{children}</Text>;
export const Label = ({ children }: { children: React.ReactNode }) => <Text style={s.label}>{children}</Text>;
export const Body = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) =>
  <Text style={[s.body, muted && { color: C.muted }]}>{children}</Text>;

export function Button({ title, onPress, disabled, ghost, style }:
  { title: string; onPress: () => void; disabled?: boolean; ghost?: boolean; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, ghost && s.ghost, (disabled || pressed) && { opacity: 0.6 }, style]}>
      <Text style={[s.btnText, ghost && { color: C.gold }]}>{title}</Text>
    </Pressable>
  );
}

export const Input = (p: TextInputProps) =>
  <TextInput placeholderTextColor={C.muted} {...p} style={[s.input, p.multiline && { minHeight: 120, textAlignVertical: 'top' }, p.style]} />;

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) =>
  <View style={[s.card, style]}>{children}</View>;

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: C.gold, borderColor: C.gold }]}>
      <Text style={{ color: active ? C.bg : C.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { color: C.text, fontSize: font.title, fontWeight: '700', marginBottom: 8 },
  label: { color: C.muted, fontSize: font.small, marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  body: { color: C.text, fontSize: font.body, lineHeight: 24 },
  btn: { backgroundColor: C.gold, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.gold },
  btnText: { color: C.bg, fontWeight: '700', fontSize: font.body },
  input: { backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 14, fontSize: font.body, borderWidth: 1, borderColor: C.line },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: C.line },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: C.line, marginRight: 8, marginBottom: 8 },
});
