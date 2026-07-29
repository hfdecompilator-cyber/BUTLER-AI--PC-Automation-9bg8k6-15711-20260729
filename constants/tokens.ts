/**
 * BUTLER AI — SHARED DESIGN TOKENS v1.0
 * Single import for COLOR, FONT, SHADOW, glow, hex, TYPE.
 * Used by all tab screens and shared components.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */

import { Platform } from 'react-native';

// ─── COLOUR PALETTE ──────────────────────────────────────────────
export const COLOR = {
  // Backgrounds
  bg:      '#010508',
  surf:    '#07111C',
  surf2:   '#0C1728',
  card:    '#0F1C2E',

  // Borders
  border:  'rgba(0,229,255,0.10)',
  borderHi:'rgba(0,229,255,0.22)',

  // Accents
  cyan:    '#00E5FF',
  green:   '#00FF88',
  amber:   '#FFB020',
  red:     '#FF3344',
  magenta: '#CC44FF',
  blue:    '#4A9EFF',
  teal:    '#00CCBB',
  yellow:  '#FFE000',
  pink:    '#FF6EB4',
  violet:  '#A78BFA',
  coral:   '#F87171',
  sky:     '#60A5FA',
  orange:  '#F07B3F',

  // Text
  text:    '#D4E8F6',
  textHi:  '#F4F6F9',
  mid:     '#5A8098',
  dim:     '#1B2A3A',

  // 5-stripe rainbow (top bar on every header)
  stripe5: ['#00E5FF', '#CC44FF', '#00FF88', '#FFB020', '#4A9EFF'] as string[],
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────
export const FONT = {
  mono:    (Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace') as any,
  sans:    (Platform.OS === 'ios' ? 'System'     : 'sans-serif') as any,
} as const;

// ─── GLOW HELPER ─────────────────────────────────────────────────
/**
 * Returns a hex+alpha background colour from a base hex colour and
 * an integer opacity percentage (0-100).
 * e.g.  glow('#CC44FF', 10)  →  '#CC44FF1A'
 */
export function glow(color: string, pct: number): string {
  const alpha = Math.round((pct / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return color + alpha;
}

// ─── HEX ALPHA SHORTHAND ─────────────────────────────────────────
/** Append a two-digit hex opacity to a colour string. */
export function hex(color: string, alpha: string): string {
  return color + alpha;
}

// ─── SHADOWS ─────────────────────────────────────────────────────
export const SHADOW = {
  dark: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
    },
    android: { elevation: 8 },
    default: {},
  }) as object,

  glow: (color: string) =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      default: {},
    }) as object,
} as const;

// ─── TYPOGRAPHY TYPES ─────────────────────────────────────────────
export const TYPE = {
  eyebrow: {
    fontFamily: FONT.mono,
    fontSize:   7.5,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  brand: {
    fontFamily: FONT.mono,
    fontSize:   16,
    fontWeight: '900' as const,
    letterSpacing: 0.4,
  },
  sub: {
    fontFamily: FONT.mono,
    fontSize:   9,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
  pill: {
    fontFamily: FONT.mono,
    fontSize:   8.5,
    fontWeight: '900' as const,
    letterSpacing: 0.3,
  },
  clock: {
    fontFamily: FONT.mono,
    fontSize:   24,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
} as const;
