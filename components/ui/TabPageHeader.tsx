/**
 * TabPageHeader — Unified top header for every Butler AI tab screen.
 *
 * VISUAL STRUCTURE (top → bottom):
 *   ① 3.5 px five-colour stripe
 *   ② Animated shimmer sweep (native driver)
 *   ③ Main row: icon-box | brand + subtitle | optional right slot
 *   ④ Status pill row: connection · security · optional extras
 *   ⑤ Optional sub-tab bar
 *   ⑥ 2 px decorative bottom accent trace
 *
 * All props are optional except safeTop; sensible defaults are provided.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */

import React, { memo, useEffect, useRef } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLOR, FONT, glow, SHADOW } from '@/constants/tokens';

const SW  = Math.max(320, Dimensions.get('window').width);
const PAD = 14;
const MONO: any = FONT.mono;

// ─── PULSE DOT ───────────────────────────────────────────────────
function PulseDot({ color, size = 5 }: { color: string; size?: number }) {
  const a = useRef(new Animated.Value(0.35)).current;
  const m = useRef(true);
  useEffect(() => {
    m.current = true;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1,    duration: 850, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.2,  duration: 850, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => { m.current = false; loop.stop(); };
  }, []);
  return (
    <Animated.View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: a,
      }}
    />
  );
}

// ─── HUD CORNER MARKS ────────────────────────────────────────────
function HUDCorners({ color, size = 6 }: { color: string; size?: number }) {
  const s = size;
  const b = 1.5;
  return (
    <>
      <View style={{ position: 'absolute', top: 0,  left: 0,  width: s, height: s, borderTopWidth: b,  borderLeftWidth: b,  borderColor: color }} />
      <View style={{ position: 'absolute', top: 0,  right: 0, width: s, height: s, borderTopWidth: b,  borderRightWidth: b, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0,  width: s, height: s, borderBottomWidth: b, borderLeftWidth: b,  borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, right: 0, width: s, height: s, borderBottomWidth: b, borderRightWidth: b, borderColor: color }} />
    </>
  );
}

// ─── SUB-TAB DEFINITION ──────────────────────────────────────────
export interface TabPageSubTab {
  id:    string;
  label: string;
  icon:  string;
  lib?:  'material' | 'community';
  color: string;
}

// ─── MAIN PROPS ──────────────────────────────────────────────────
export interface TabPageHeaderProps {
  /** Safe-area top inset from useSafeAreaInsets(). */
  safeTop:     number;
  /** Primary accent colour — tints icon-box, pills, bottom trace. */
  accent?:     string;
  /** MaterialCommunityIcons icon name (default: 'terminal'). */
  icon?:       string;
  /** Use 'material' for MaterialIcons; default 'community'. */
  iconLib?:    'material' | 'community';
  /** Icon size inside the icon-box (default 20). */
  iconSize?:   number;
  /** Small eyebrow text above the brand (e.g. 'SETTINGS · CONFIG'). */
  eyebrow?:    string;
  /** Main brand title — can include JSX for coloured spans. */
  title?:      React.ReactNode;
  /** Plain-string subtitle beneath the brand. */
  subtitle?:   string;
  /** Show connection status pill. */
  showConn?:   boolean;
  /** Whether the PC is connected. */
  isConn?:     boolean;
  /** Override CONNECTED label (default 'CONNECTED'). */
  connLabel?:  string;
  /** Override OFFLINE label (default 'OFFLINE'). */
  offLabel?:   string;
  /** Show the AES-256 security pill. */
  showSec?:    boolean;
  /** Any additional pills / badges to the right of the security pill. */
  extraPills?: React.ReactNode;
  /** Element placed in the top-right slot (e.g. clock or action button). */
  rightSlot?:  React.ReactNode;
  /** Optional sub-tab bar rendered below the main row. */
  subTabs?:    TabPageSubTab[];
  activeSubTab?: string;
  onSubTabChange?: (id: string) => void;
}

// ─── COMPONENT ───────────────────────────────────────────────────
export const TabPageHeader = memo(function TabPageHeader({
  safeTop,
  accent         = COLOR.cyan,
  icon           = 'terminal',
  iconLib        = 'community',
  iconSize       = 20,
  eyebrow,
  title,
  subtitle,
  showConn       = true,
  isConn         = false,
  connLabel      = 'CONNECTED',
  offLabel       = 'OFFLINE',
  showSec        = true,
  extraPills,
  rightSlot,
  subTabs,
  activeSubTab,
  onSubTabChange,
}: TabPageHeaderProps) {
  // Shimmer
  const shimA = useRef(new Animated.Value(-SW)).current;
  const m     = useRef(true);

  useEffect(() => {
    m.current = true;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimA, { toValue: SW * 1.6, duration: 2500, useNativeDriver: true }),
        Animated.timing(shimA, { toValue: -SW,       duration: 0,    useNativeDriver: true }),
        Animated.delay(7500),
      ]),
    );
    loop.start();
    return () => { m.current = false; loop.stop(); };
  }, []);

  const cc = isConn ? COLOR.green : COLOR.amber;
  const IconComp: any = iconLib === 'material' ? MaterialIcons : MaterialCommunityIcons;

  return (
    <View style={[s.root, { paddingTop: safeTop }]}>
      {/* ① Five-colour stripe */}
      <View style={{ height: 3.5, flexDirection: 'row' }}>
        {COLOR.stripe5.map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>

      {/* ② Shimmer sweep */}
      <Animated.View
        pointerEvents="none"
        style={[s.shimmer, { transform: [{ translateX: shimA }] }]}
      />

      {/* ③ Main row */}
      <View style={s.row}>
        {/* Icon box */}
        <View style={[s.iconBox, { borderColor: accent + '55', backgroundColor: glow(accent, 9) }]}>
          <HUDCorners color={accent + '60'} size={6} />
          <IconComp name={icon} size={iconSize} color={accent} />
        </View>

        {/* Text block */}
        <View style={{ flex: 1, gap: 3 }}>
          {!!eyebrow && (
            <Text style={[s.eyebrow, { color: accent + '66' }]} numberOfLines={1}>
              {eyebrow}
            </Text>
          )}
          {title != null ? (
            typeof title === 'string'
              ? <Text style={s.brand} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}>{title}</Text>
              : <View><Text style={s.brand} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}>{title}</Text></View>
          ) : null}
          {!!subtitle && (
            <Text style={s.sub} numberOfLines={1}>{subtitle}</Text>
          )}
          {/* Status pills */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            {showConn && (
              <View style={[s.pill, { borderColor: cc + '60', backgroundColor: glow(cc, 7) }]}>
                <PulseDot color={cc} size={5} />
                <Text style={[s.pillTxt, { color: cc }]}>
                  {isConn ? connLabel : offLabel}
                </Text>
              </View>
            )}
            {showSec && (
              <View style={[s.pill, { borderColor: COLOR.green + '40', backgroundColor: glow(COLOR.green, 6) }]}>
                <MaterialCommunityIcons name="shield-check" size={9} color={COLOR.green} />
                <Text style={[s.pillTxt, { color: COLOR.green }]}>AES-256</Text>
              </View>
            )}
            {extraPills}
          </View>
        </View>

        {/* Right slot */}
        {rightSlot != null && (
          <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
            {rightSlot}
          </View>
        )}
      </View>

      {/* ⑤ Optional sub-tab bar */}
      {subTabs && subTabs.length > 0 && (
        <View style={[s.subTabRow, { borderTopColor: accent + '18' }]}>
          {subTabs.map(tab => {
            const active = tab.id === activeSubTab;
            const TabIcon: any = tab.lib === 'material' ? MaterialIcons : MaterialCommunityIcons;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onSubTabChange?.(tab.id)}
                activeOpacity={0.8}
                style={[
                  s.subTab,
                  active && {
                    backgroundColor: glow(tab.color, 9),
                    borderBottomColor: tab.color,
                    borderBottomWidth: 3,
                  },
                ]}
              >
                <TabIcon
                  name={tab.icon}
                  size={12}
                  color={active ? tab.color : COLOR.dim}
                />
                <Text style={[s.subTabTxt, { color: active ? tab.color : COLOR.mid }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ⑥ Decorative bottom trace */}
      <View style={{ height: 2, flexDirection: 'row' }}>
        <View style={{ flex: 3, backgroundColor: accent + '25' }} />
        <View style={{ width: 14, backgroundColor: accent }} />
        <View style={{ flex: 2, backgroundColor: COLOR.green + '12' }} />
        <View style={{ width: 8, backgroundColor: COLOR.green }} />
        <View style={{ flex: 6, backgroundColor: accent + '08' }} />
      </View>
    </View>
  );
});

// ─── CLOCK SLOT HELPER ───────────────────────────────────────────
/** Drop-in rightSlot child: live HH:MM clock + optional sub-label. */
import { useState } from 'react';
export function ClockSlot({
  accent = COLOR.cyan,
  subLabel = 'LOCAL',
}: {
  accent?: string;
  subLabel?: string;
}) {
  const [time, setTime] = useState('');
  const [secs, setSecs] = useState('');
  useEffect(() => {
    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
      setSecs(String(n.getSeconds()).padStart(2, '0'));
    };
    upd();
    const t = setInterval(upd, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ alignItems: 'flex-end', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text style={{ fontFamily: MONO, fontSize: 24, fontWeight: '900', color: '#C8E4F0', letterSpacing: 1 }}>
          {time}
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 12, fontWeight: '900', color: accent, letterSpacing: 0.5 }}>
          {secs}
        </Text>
      </View>
      <Text style={{ fontFamily: MONO, fontSize: 8, color: COLOR.mid, letterSpacing: 1, fontWeight: '700' }}>
        {subLabel}
      </Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    backgroundColor: '#020609',
    overflow: 'hidden',
    ...SHADOW.dark,
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 120,
    backgroundColor: 'rgba(0,229,255,0.025)',
    zIndex: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: PAD,
    paddingTop: 12,
    paddingBottom: 10,
    zIndex: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  eyebrow: {
    fontFamily: MONO,
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brand: {
    fontFamily: MONO,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  sub: {
    fontFamily: MONO,
    fontSize: 9,
    color: COLOR.mid,
    letterSpacing: 0.2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillTxt: {
    fontFamily: MONO,
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subTabRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  subTabTxt: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default TabPageHeader;
