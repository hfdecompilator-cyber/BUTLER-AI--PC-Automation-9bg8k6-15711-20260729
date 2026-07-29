/**
 * BUTLER AI — ONBOARDING SCREEN v1.0
 * New-user welcome and setup walkthrough.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { notifyOnboardingComplete } from './_layout';
import { COLOR, FONT } from '@/constants/tokens';

const MONO: any = FONT.mono;

const STEPS = [
  { icon: 'server-network',   title: 'PAIR YOUR PC',     body: 'Download the Butler AI server on your PC and enter its IP address in the PAIR tab.',       color: COLOR.cyan    },
  { icon: 'robot-happy-outline', title: 'START LOCAL AI', body: 'Install Ollama on your PC, pull a model (e.g. llama3.2), and chat from the BUTLR tab.', color: COLOR.green   },
  { icon: 'code-braces',      title: 'RUN SCRIPTS',       body: '250+ Python scripts ready to execute on your PC from the FORGE tab.',                    color: COLOR.magenta },
  { icon: 'brain',            title: 'BUILD YOUR KB',     body: 'Let the AI crawler research topics and store knowledge for you in the KB tab.',           color: COLOR.amber   },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.logoBox}>
          <MaterialCommunityIcons name="robot-happy-outline" size={56} color={COLOR.cyan} />
        </View>
        <Text style={s.title}>
          <Text style={{ color: COLOR.cyan }}>BUTLER</Text>
          <Text style={{ color: '#FFF' }}> AI</Text>
        </Text>
        <Text style={s.sub}>PC Automation · Local AI · Zero Cloud</Text>
      </View>

      {/* Steps */}
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {STEPS.map((step, i) => (
          <View key={i} style={[s.stepCard, { borderTopColor: step.color }]}>
            <View style={[s.stepIcon, { borderColor: step.color + '55', backgroundColor: step.color + '10' }]}>
              <MaterialCommunityIcons name={step.icon as any} size={22} color={step.color} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[s.stepTitle, { color: step.color }]}>{step.title}</Text>
              <Text style={s.stepBody}>{step.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* CTA */}
      <View style={[s.cta, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: COLOR.cyan }]}
          activeOpacity={0.85}
          onPress={() => { notifyOnboardingComplete(); }}
        >
          <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
          <Text style={s.ctaTxt}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#010508' },
  hero:       { alignItems: 'center', paddingTop: 30, paddingBottom: 20, gap: 8 },
  logoBox:    { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: COLOR.cyan + '40', backgroundColor: COLOR.cyan + '0D' },
  title:      { fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  sub:        { fontFamily: MONO, fontSize: 11, color: COLOR.mid, letterSpacing: 1 },
  stepCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#08121E',
                borderRadius: 12, borderTopWidth: 3, borderWidth: 1, borderColor: 'rgba(0,229,255,0.10)', padding: 14 },
  stepIcon:   { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepTitle:  { fontFamily: MONO, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  stepBody:   { fontFamily: MONO, fontSize: 11, color: COLOR.mid, lineHeight: 17 },
  cta:        { paddingHorizontal: 20, paddingTop: 10, backgroundColor: '#010508' },
  ctaBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 14 },
  ctaTxt:     { fontFamily: MONO, fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 },
});
