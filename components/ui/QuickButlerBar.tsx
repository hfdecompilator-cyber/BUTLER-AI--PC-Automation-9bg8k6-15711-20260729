/**
 * BUTLER AI — NEXUS BAR v4.0 · CLEAN REBUILD
 * Navy/blue palette. Zero green anywhere.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, Keyboard, Animated, Dimensions, Pressable, ScrollView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '@/services/haptics';
import { D, FONT, alpha } from '@/constants/design';

export const BUTLER_PREFILL_KEY = '@butler_prefill_prompt';
const SW = Math.max(320, Dimensions.get('window').width);

// ── CHIPS ────────────────────────────────────────────────────────
const CHIPS = [
  { icon: 'monitor-dashboard',    label: 'PC Stats',  msg: 'Show CPU, RAM, disk and top processes',           color: D.primary  },
  { icon: 'broom',                label: 'Clean',     msg: 'Clean all temp files and show freed space in MB', color: D.net      },
  { icon: 'code-braces',          label: 'Script',    msg: 'Write a Python script to: ',                      color: D.violet   },
  { icon: 'wifi',                 label: 'LAN Scan',  msg: 'Scan local network and list all devices',         color: D.primaryGlow },
  { icon: 'cpu-64-bit',           label: 'Processes', msg: 'List top 8 CPU-consuming processes now',          color: D.amber    },
  { icon: 'harddisk',             label: 'Disk',      msg: 'Show disk usage breakdown by folder',             color: D.primaryGlow },
] as const;

// ── INTENT ───────────────────────────────────────────────────────
type Intent = 'ACTION' | 'QUERY' | 'SCRIPT' | 'IDLE';
function classifyIntent(text: string): { type: Intent; score: number; color: string } {
  if (!text.trim()) return { type: 'IDLE', score: 0, color: D.textDim };
  const t = text.toLowerCase();
  const map: Record<Intent, string[]> = {
    ACTION: ['run','exec','start','stop','kill','clean','clear','delete','open','reboot'],
    SCRIPT: ['python','import','def ','for ','while ','psutil','os.','sys.'],
    QUERY:  ['what','how','why','show','list','help','explain','check','status'],
    IDLE:   [],
  };
  const counts: Record<string, number> = {};
  for (const [k, words] of Object.entries(map)) {
    counts[k] = (words as string[]).filter(w => t.includes(w)).length;
  }
  const max = Math.max(...Object.values(counts));
  if (max === 0) return { type: 'IDLE', score: 0, color: D.textDim };
  const winner = Object.entries(counts).find(([, v]) => v === max)![0] as Intent;
  const total  = Object.values(counts).reduce((s, v) => s + v, 0);
  const score  = Math.min(99, Math.round((max / total) * 100));
  const colors: Record<Intent, string> = { ACTION: D.amber, SCRIPT: D.violet, QUERY: D.net, IDLE: D.textDim };
  return { type: winner, score, color: colors[winner] };
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function QuickButlerBar() {
  const router = useRouter();
  const [text,     setText]     = useState('');
  const [focused,  setFocused]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sending,  setSending]  = useState(false);

  const mountedRef = useRef(true);
  const expandH    = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const sendScale  = useRef(new Animated.Value(1)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  const intent = useMemo(() => classifyIntent(text), [text]);
  const accentColor = focused ? (intent.type !== 'IDLE' ? intent.color : D.primary) : D.border;

  useEffect(() => {
    mountedRef.current = true;
    const blink = Animated.loop(Animated.sequence([
      Animated.timing(cursorAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(cursorAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]));
    blink.start();
    return () => { mountedRef.current = false; blink.stop(); };
  }, []);

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [D.border, accentColor] });

  const toggleExpanded = useCallback(() => {
    haptics.light?.();
    const next = !expanded;
    setExpanded(next);
    if (next) Keyboard.dismiss();
    Animated.spring(expandH, { toValue: next ? 1 : 0, tension: 80, friction: 12, useNativeDriver: false }).start();
  }, [expanded]);

  const handleSend = useCallback(async () => {
    const prompt = text.trim();
    if (!prompt) {
      haptics.medium?.();
      try { (global as any).__butlerSwitchTab?.('butler'); } catch {}
      return;
    }
    haptics.heavy?.();
    setSending(true);
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.75, useNativeDriver: true, speed: 50 }),
      Animated.spring(sendScale, { toValue: 1,    useNativeDriver: true, speed: 22, bounciness: 20 }),
    ]).start();
    try { await AsyncStorage.setItem(BUTLER_PREFILL_KEY, prompt); } catch {}
    try { (global as any).__butlerInjectMessage?.(prompt); } catch {}
    setText('');
    Keyboard.dismiss();
    try { (global as any).__butlerSwitchTab?.('butler'); } catch {
      try { router.push('/(tabs)/butler' as any); } catch {}
    }
    if (mountedRef.current) setSending(false);
  }, [text]);

  const handleChip = useCallback(async (msg: string) => {
    haptics.medium?.();
    setExpanded(false);
    Animated.spring(expandH, { toValue: 0, tension: 80, friction: 12, useNativeDriver: false }).start();
    try { await AsyncStorage.setItem(BUTLER_PREFILL_KEY, msg); } catch {}
    try { (global as any).__butlerInjectMessage?.(msg); } catch {}
    try { (global as any).__butlerSwitchTab?.('butler'); } catch {
      try { router.push('/(tabs)/butler' as any); } catch {}
    }
  }, []);

  const chipH = expandH.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });

  return (
    <View style={bar.container} pointerEvents="box-none">
      {/* CHIP DRAWER */}
      <Animated.View style={[bar.chipDrawer, { maxHeight: chipH, overflow: 'hidden' }]}>
        <View style={bar.chipInner}>
          <View style={bar.chipHeader}>
            <View style={[bar.chipDot, { backgroundColor: D.primary }]} />
            <Text style={bar.chipHeaderTxt}>QUICK COMMANDS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 10, paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled">
            {CHIPS.map((c, i) => (
              <Pressable key={i} onPress={() => handleChip(c.msg)}
                style={({ pressed }) => [
                  bar.chip,
                  { borderColor: alpha(c.color, 0.4), backgroundColor: alpha(c.color, pressed ? 0.15 : 0.07) },
                ]}>
                <MaterialCommunityIcons name={c.icon as any} size={12} color={c.color} />
                <Text style={[bar.chipTxt, { color: c.color }]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* MAIN CARD */}
      <Animated.View style={[bar.card, { borderColor }]}>
        {/* Top rail */}
        <View style={[bar.topRail, { backgroundColor: accentColor }]} />

        {/* Input row */}
        <View style={bar.inputRow}>
          {/* Grid toggle */}
          <TouchableOpacity onPress={toggleExpanded}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
            style={[bar.gridBtn, expanded && { backgroundColor: alpha(D.primary, 0.18) }]}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={expanded ? 'close-circle-outline' : 'apps'}
              size={18}
              color={expanded ? D.primary : D.textMid}
            />
          </TouchableOpacity>

          <View style={bar.divider} />

          {/* Text area */}
          <View style={bar.textArea}>
            <Text style={[bar.promptSym, { color: intent.type !== 'IDLE' ? intent.color : D.textDim }]}>{'›'}</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? '' : 'ask butler or run a command…'}
              placeholderTextColor={D.textDim}
              style={bar.textInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              maxLength={800}
              underlineColorAndroid="transparent"
              selectionColor={D.primary}
              keyboardAppearance="dark"
            />
            {!focused && !text && (
              <Animated.View style={[bar.cursor, { opacity: cursorAnim }]} />
            )}
          </View>

          {/* Right group */}
          <View style={bar.rightGroup}>
            {text.length > 2 && intent.type !== 'IDLE' && (
              <View style={[bar.intentChip, { borderColor: alpha(intent.color, 0.5), backgroundColor: alpha(intent.color, 0.12) }]}>
                <Text style={[bar.intentTxt, { color: intent.color }]}>{intent.type.slice(0, 3)} {intent.score}</Text>
              </View>
            )}
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <TouchableOpacity onPress={handleSend} activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                style={[
                  bar.sendBtn,
                  text.trim()
                    ? [bar.sendActive, {
                        backgroundColor: intent.type !== 'IDLE' ? intent.color : D.primary,
                        ...Platform.select({
                          ios: { shadowColor: D.primary, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
                          android: { elevation: 6 }, default: {},
                        }),
                      }]
                    : bar.sendIdle,
                ]}>
                {sending
                  ? <MaterialIcons name="more-horiz" size={14} color={D.textMid} />
                  : <MaterialIcons name={text.trim() ? 'send' : 'keyboard-arrow-right'} size={15}
                      color={text.trim() ? '#000' : D.textDim} />
                }
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Status strip */}
        <View style={bar.status}>
          <View style={[bar.statusDot, { backgroundColor: D.net }]} />
          <Text style={bar.statusTxt} numberOfLines={1}>BUTLER_AI · LOCAL_LLM · ZERO_CLOUD</Text>
          <TouchableOpacity onPress={() => { haptics.light?.(); try { (global as any).__butlerSwitchTab?.('butler'); } catch {} }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={bar.openLink}>OPEN AI ›</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const bar = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 8, paddingBottom: 4 },

  chipDrawer:  { overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  chipInner:   {
    backgroundColor: D.surface, borderWidth: 1, borderBottomWidth: 0,
    borderColor: D.border, borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingTop: 8,
  },
  chipHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingBottom: 8 },
  chipDot:     { width: 5, height: 5, borderRadius: 3 },
  chipHeaderTxt: { fontFamily: FONT.mono, fontSize: 8, fontWeight: '900', color: D.textDim, letterSpacing: 2 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  chipTxt:     { fontFamily: FONT.mono, fontSize: 9, fontWeight: '800' },

  card:        {
    borderRadius: 12, borderWidth: 1.5, backgroundColor: D.surface, overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.5, shadowRadius: 10 },
      android: { elevation: 12 }, default: {},
    }),
  },
  topRail:     { height: 2 },

  inputRow:    { flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 6, height: 44, gap: 0 },
  gridBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexShrink: 0 },
  divider:     { width: 1, height: 22, backgroundColor: D.border, marginHorizontal: 6, flexShrink: 0 },
  textArea:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, overflow: 'hidden' },
  promptSym:   { fontFamily: FONT.mono, fontSize: 14, fontWeight: '700', flexShrink: 0 },
  textInput:   {
    flex: 1, fontFamily: FONT.sans, fontSize: 13.5, fontWeight: '400',
    color: D.text, padding: 0, height: 36, backgroundColor: 'transparent',
  },
  cursor:      { width: 2, height: 16, borderRadius: 1, backgroundColor: D.primary, marginLeft: 2 },
  rightGroup:  { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  intentChip:  { borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  intentTxt:   { fontFamily: FONT.mono, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.5 },
  sendBtn:     { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendActive:  {},
  sendIdle:    { backgroundColor: D.surface2, borderWidth: 1, borderColor: D.border },

  status:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingBottom: 7, paddingTop: 2 },
  statusDot:   { width: 5, height: 5, borderRadius: 3 },
  statusTxt:   { fontFamily: FONT.mono, fontSize: 7, fontWeight: '700', color: D.textDim, letterSpacing: 1.2, flex: 1 },
  openLink:    { fontFamily: FONT.mono, fontSize: 7.5, fontWeight: '900', color: D.primaryGlow, letterSpacing: 0.8 },
});
