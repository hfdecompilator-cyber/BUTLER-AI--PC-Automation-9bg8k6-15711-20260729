/**
 * CyberPanel — reusable animated cyberpunk container.
 * Provides: optional 5-stripe top bar, glow border, animated scanline,
 * and pulsing glow border — all driven from one accentColor prop.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */

import React, { memo, useEffect, useRef } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet, View, ViewStyle,
} from 'react-native';
import { COLOR } from '@/constants/tokens';

const SW = Math.max(320, Dimensions.get('window').width);

export interface CyberPanelProps {
  /** Primary accent colour for glow, stripe, and scanline tint. */
  accentColor?: string;
  /** Show the 5-colour rainbow stripe along the top edge. */
  stripe?: boolean;
  /** Override stripe colours (array of 5 strings). */
  stripeColors?: string[];
  /** Show the animated horizontal scanline sweep. */
  scanline?: boolean;
  /** Width of the screen — used to size the scanline sweep. */
  screenWidth?: number;
  /** Custom border pulse range [min, max] opacity values. */
  glowRange?: [number, number];
  /** Additional style applied to the outer container. */
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export const CyberPanel = memo(function CyberPanel({
  accentColor   = COLOR.cyan,
  stripe        = false,
  stripeColors,
  scanline      = false,
  screenWidth   = SW,
  glowRange     = [0.18, 0.55],
  style,
  children,
}: CyberPanelProps) {
  const scanA  = useRef(new Animated.Value(-screenWidth)).current;
  const glowA  = useRef(new Animated.Value(glowRange[0])).current;
  const mounted = useRef(true);

  // Scanline sweep (native driver — translateX only)
  useEffect(() => {
    if (!scanline) return;
    mounted.current = true;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanA, {
          toValue:  screenWidth * 1.6,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(scanA, {
          toValue:  -screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(6500),
      ]),
    );
    loop.start();
    return () => { mounted.current = false; loop.stop(); };
  }, [scanline, screenWidth]);

  // Border glow pulse (JS driver — colour value)
  useEffect(() => {
    mounted.current = true;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowA, {
          toValue:  glowRange[1],
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(glowA, {
          toValue:  glowRange[0],
          duration: 1600,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => { mounted.current = false; loop.stop(); };
  }, [glowRange[0], glowRange[1]]);

  const borderColor = glowA.interpolate({
    inputRange:  [glowRange[0], glowRange[1]],
    outputRange: [accentColor + '30', accentColor + '80'],
  });

  const stripes = stripeColors ?? COLOR.stripe5;

  return (
    <Animated.View
      style={[
        s.root,
        { borderColor },
        style,
      ]}
    >
      {/* Optional 5-stripe bar */}
      {stripe && (
        <View style={{ height: 3.5, flexDirection: 'row' }}>
          {stripes.map((c, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: c }} />
          ))}
        </View>
      )}

      {/* Optional scanline sweep */}
      {scanline && (
        <Animated.View
          pointerEvents="none"
          style={[
            s.scanline,
            { transform: [{ translateX: scanA }] },
          ]}
        />
      )}

      {children}
    </Animated.View>
  );
});

const s = StyleSheet.create({
  root: {
    overflow:    'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  scanline: {
    position:        'absolute',
    top:              0,
    bottom:           0,
    width:            100,
    backgroundColor: 'rgba(0,229,255,0.03)',
    zIndex:           0,
  },
});

export default CyberPanel;
