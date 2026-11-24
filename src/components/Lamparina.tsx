import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { C } from '../lib/theme';

type Props = { lit: boolean; size?: number; igniteKey?: number };

/** Lamparina de óleo. Apagada: fumaça suave. Acesa: chama tremulando com brilho. */
export default function Lamparina({ lit, size = 220, igniteKey = 0 }: Props) {
  const ignite = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const smoke = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(ignite, {
      toValue: lit ? 1 : 0, duration: lit ? 1400 : 600,
      easing: lit ? Easing.out(Easing.back(2.2)) : Easing.in(Easing.quad), useNativeDriver: true,
    }).start();
  }, [lit, igniteKey]);

  useEffect(() => {
    const loop = (v: Animated.Value, d: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: d * 1.3, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
    const a = loop(flicker, 180), b = loop(sway, 900);
    const s = Animated.loop(Animated.timing(smoke, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true }));
    a.start(); b.start(); s.start();
    return () => { a.stop(); b.stop(); s.stop(); };
  }, []);

  const w = size, h = size;
  const flameW = w * 0.22, flameH = h * 0.36;
  const flameScaleY = Animated.multiply(ignite, flicker.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }));
  const flameScaleX = Animated.multiply(ignite, flicker.interpolate({ inputRange: [0, 1], outputRange: [1.04, 0.95] }));
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const glow = Animated.multiply(ignite, flicker.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }));

  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      {/* halo de luz */}
      <Animated.View pointerEvents="none" style={[styles.glow, {
        width: w * 1.1, height: w * 1.1, borderRadius: w, top: -w * 0.18, opacity: Animated.multiply(glow, 0.22),
        transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
      }]} />

      {/* fumaça quando apagada */}
      {!lit && (
        <Animated.View pointerEvents="none" style={{
          position: 'absolute', top: h * 0.08, width: 14, height: 40, borderRadius: 8, backgroundColor: '#8a7d70',
          opacity: smoke.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
          transform: [
            { translateY: smoke.interpolate({ inputRange: [0, 1], outputRange: [30, -30] }) },
            { translateX: smoke.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, -4] }) },
            { scale: smoke.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] }) },
          ],
        }} />
      )}

      {/* chama */}
      <Animated.View style={{
        position: 'absolute', top: h * 0.12, width: flameW, height: flameH,
        transform: [{ translateY: flameH / 2 }, { rotate }, { scaleX: flameScaleX }, { scaleY: flameScaleY }, { translateY: -flameH / 2 }],
      }}>
        <Svg width={flameW} height={flameH} viewBox="0 0 40 70">
          <Defs>
            <RadialGradient id="fo" cx="50%" cy="75%" r="60%">
              <Stop offset="0" stopColor="#fff6c2" /><Stop offset="0.45" stopColor={C.gold} /><Stop offset="1" stopColor={C.ember} />
            </RadialGradient>
            <RadialGradient id="fi" cx="50%" cy="80%" r="50%">
              <Stop offset="0" stopColor="#ffffff" /><Stop offset="1" stopColor="#ffe08a" />
            </RadialGradient>
          </Defs>
          <Path d="M20 2 C28 18 38 30 36 46 C34 60 26 68 20 68 C14 68 6 60 4 46 C2 30 12 18 20 2 Z" fill="url(#fo)" />
          <Path d="M20 30 C25 40 28 46 27 54 C26 61 23 64 20 64 C17 64 14 61 13 54 C12 46 15 40 20 30 Z" fill="url(#fi)" />
        </Svg>
      </Animated.View>

      {/* corpo da lamparina */}
      <Svg width={w} height={h} viewBox="0 0 200 200" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#d9a35b" /><Stop offset="0.5" stopColor="#a8692c" /><Stop offset="1" stopColor="#5e3a18" />
          </LinearGradient>
          <LinearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#7a4a1f" /><Stop offset="0.5" stopColor="#f0c27a" /><Stop offset="1" stopColor="#7a4a1f" />
          </LinearGradient>
        </Defs>
        {/* pavio */}
        <Path d="M98 92 L102 92 L101 104 L99 104 Z" fill="#2b1d12" />
        {/* bico */}
        <Path d="M60 128 C70 108 92 100 100 102 C108 100 130 108 140 128 Z" fill="url(#body)" />
        {/* corpo */}
        <Path d="M30 140 C30 120 60 116 100 116 C140 116 170 120 170 140 C170 165 140 176 100 176 C60 176 30 165 30 140 Z" fill="url(#body)" />
        <Ellipse cx="100" cy="122" rx="56" ry="8" fill="url(#rim)" opacity="0.9" />
        {/* alça */}
        <Path d="M166 136 C192 130 194 158 168 156" stroke="#8a5424" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* base */}
        <Ellipse cx="100" cy="182" rx="46" ry="7" fill="#3d2610" />
        <Ellipse cx="80" cy="146" rx="22" ry="6" fill="#fff" opacity="0.12" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', backgroundColor: C.flame, shadowColor: C.flame, shadowOpacity: 1, shadowRadius: 60, opacity: 0.25, elevation: 0 },
});
