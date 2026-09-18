/**
 * tokens.ts — Design constants for human-insight/cinematic-light template.
 *
 * Light variant of cinematic-dark. Background: warm cream #FAECD2.
 * Editorial tactile aesthetic with Paper Frames, Washi Tape, and 3-Beat Cinematography.
 */

import { loadFont } from '@remotion/google-fonts/BeVietnamPro';

export const { fontFamily: FONT_MAIN } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
});

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  /** Flat warm cream background — no gradient */
  bg: '#FAECD2',

  /** Primary text — deep warm charcoal brown */
  text: '#2C1A0E',

  /** Secondary / inactive text */
  textMuted: 'rgba(44, 26, 14, 0.45)',

  /** Subtitle active phrase highlight */
  subtitleAccent: '#2C1A0E',

  /** Accent terracotta for numbers and progress */
  accentTerracotta: '#E07A5F',

  /** Thin accent line */
  accent: 'rgba(44, 26, 14, 0.25)',

  /** Image overlay — very subtle */
  imageOverlay: 'rgba(250, 236, 210, 0.08)',

  /** Vignette — warm cream edges */
  vignette: 'radial-gradient(ellipse at center, transparent 40%, rgba(250,236,210,0.5) 100%)',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  titleSize: 56,
  titleWeight: '700' as const,
  titleLetterSpacing: '0.02em',
  sloganSize: 28,
  subtitleSize: 40,
} as const;

// ─── Framing Dimensions ───────────────────────────────────────────────────────
export const FRAMING = {
  standard: {
    width: 1020,
    height: 638,
    top: 640,
  },
  focus: {
    width: 1060,
    height: 740,
    top: 560,
  },
} as const;

// ─── Layout (9:16 = 1080×1920) ────────────────────────────────────────────────
export const LAYOUT = {
  width: 1080,
  height: 1920,
  paddingH: 48,
} as const;

// ─── Ken Burns presets ────────────────────────────────────────────────────────
export type KenBurnsDirection = 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left' | 'pan-up' | 'pan-down';

export interface KenBurnsConfig {
  direction: KenBurnsDirection;
  startScale?: number;
  endScale?: number;
  distance?: number;
}

// ─── Template metadata ────────────────────────────────────────────────────────
export const TEMPLATE_META = {
  id: 'human-insight/cinematic-light',
  name: 'Cinematic Light',
  category: 'human-insight',
  description: 'Video triet ly, nhan sinh. Nen kem am #FAECD2, khung giay nghe thuat, typography toi gian.',
  aspectRatio: '9:16' as const,
  fps: 30,
} as const;
