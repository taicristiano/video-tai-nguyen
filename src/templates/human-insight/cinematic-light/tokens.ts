/**
 * tokens.ts — Design constants for human-insight/cinematic-light template.
 *
 * Light variant of cinematic-dark. Background: warm cream #FAECD2.
 * Title and subtitle colors adjusted for contrast on light background.
 */

import { loadFont } from '@remotion/google-fonts/BeVietnamPro';

export const { fontFamily: FONT_MAIN } = loadFont('normal', {
  weights: ['300', '400', '600', '700'],
  subsets: ['latin', 'vietnamese'],
});

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  /** Flat cream background — no gradient */
  bg: '#FAECD2',

  /** Primary text — deep warm brown */
  text: '#2C1A0E',

  /** Subtitle active word highlight — dark brown for contrast on cream */
  subtitleAccent: '#1A0A00',

  /** Thin accent line */
  accent: 'rgba(44, 26, 14, 0.3)',

  /** Image overlay — very subtle */
  imageOverlay: 'rgba(250, 236, 210, 0.08)',

  /** Vignette — warm cream edges */
  vignette: 'radial-gradient(ellipse at center, transparent 40%, rgba(250,236,210,0.5) 100%)',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  titleSize: 48,
  titleWeight: '700' as const,
  titleLetterSpacing: '0.02em',
  subtitleSize: 40,
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
  description: 'Video triet ly, nhan sinh. Nen kem am, chu dam, subtitle toi.',
  aspectRatio: '9:16' as const,
  fps: 30,
} as const;
