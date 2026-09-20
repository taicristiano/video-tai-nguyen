/**
 * tokens.ts — Design constants for human-insight/cinematic-light template (V2).
 *
 * Light editorial lifestyle aesthetic for HAY & ĐẸP.
 * Background: soft ivory #F6F1E8 / warm cream #FAECD2.
 * Palette: Ivory, Deep Sage, Muted Sage, Warm Wood, and Charcoal.
 */

import { loadFont } from '@remotion/google-fonts/BeVietnamPro';

export const { fontFamily: FONT_MAIN } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
});

// ─── Colors (V2 Palette Contract) ─────────────────────────────────────────────
export const COLORS = {
  /** Soft ivory / warm cream background */
  bg: '#FAECD2',
  bgIvory: '#F6F1E8',
  bgWarmCream: '#F7F2EA',
  bgPaperCard: '#FFFCF7',

  /** Primary text — deep warm charcoal */
  text: '#302D28',
  textLegacy: '#2C1A0E',

  /** Secondary / inactive text */
  textMuted: 'rgba(48, 45, 40, 0.48)',

  /** Subtitle active phrase highlight */
  subtitleAccent: '#302D28',

  /** Accent terracotta / warm accent for numbers and progress */
  accentTerracotta: '#E07A5F',
  accentWarm: '#C79A72',

  /** Sage brand colors */
  deepSage: '#465B49',
  mutedSage: '#71806C',

  /** Thin accent line */
  accent: 'rgba(48, 45, 40, 0.22)',

  /** Image overlay — very subtle */
  imageOverlay: 'rgba(246, 241, 232, 0.06)',

  /** Vignette — warm cream edges */
  vignette: 'radial-gradient(ellipse at center, transparent 40%, rgba(246,241,232,0.45) 100%)',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  titleSize: 58,
  titleWeight: '700' as const,
  titleLetterSpacing: '-0.015em',
  sloganSize: 28,
  subtitleSize: 44,
} as const;

// ─── Macro Composition Presets (V2.1 Contract) ──────────────────────────────
export type CompositionPreset =
  | 'full-bleed'
  | 'editorial-left'
  | 'editorial-right'
  | 'portrait-focus'
  | 'detail-insert'
  | 'paper';

export type ShotScale = 'wide' | 'medium' | 'close' | 'detail';

export type BeatTransition = 'cut' | 'dissolve';

export type CaptionPlacement =
  | 'below-visual'
  | 'overlay-bottom'
  | 'overlay-top'
  | 'hidden';

export interface FocalPoint {
  /** percentage 0..100 */
  x: number;
  /** percentage 0..100 */
  y: number;
}

export type TitleMode = 'intro-only' | 'scene' | 'hidden';

export const COMPOSITIONS = {
  'full-bleed': {
    top: 0,
    left: 0,
    width: 1080,
    height: 1920,
    radius: 0,
  },
  'editorial-left': {
    top: 360,
    left: 90,
    width: 900,
    height: 1040,
    radius: 36,
  },
  'editorial-right': {
    top: 360,
    left: 90,
    width: 900,
    height: 1040,
    radius: 36,
  },
  'portrait-focus': {
    top: 360,
    left: 90,
    width: 900,
    height: 1040,
    radius: 36,
  },
  'detail-insert': {
    top: 360,
    left: 90,
    width: 900,
    height: 1040,
    radius: 36,
  },
  paper: {
    top: 400,
    left: 90,
    width: 900,
    height: 960,
    radius: 28,
  },
} as const;

export const SHOT_SCALE: Record<ShotScale, number> = {
  wide: 1.0,
  medium: 1.08,
  close: 1.18,
  detail: 1.32,
};

// ─── Framing Dimensions (Legacy V1/V2 fallback) ───────────────────────────────
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
  canvas: {
    width: 1040,
    height: 680,
    top: 620,
  },
} as const;

// ─── Layout (9:16 = 1080×1920) ────────────────────────────────────────────────
export const LAYOUT = {
  width: 1080,
  height: 1920,
  paddingH: 48,
} as const;

// ─── Motion Profiles (V3.4 Motion Grammar) ──────────────────────────────────
export type { MotionProfile } from './motionGrammar';

// ─── Motion Presets (Legacy V2/V3 compatibility) ──────────────────────────────
export type MotionPreset =
  | 'still-breathe'
  | 'slow-push'
  | 'slow-pull'
  | 'drift-left'
  | 'drift-right'
  | 'rise-soft'
  | 'foreground-parallax'
  | 'focus-shift'
  | 'emotional-hold'
  | 'STILL'
  | 'PUSH_IN_SOFT'
  | 'PULL_OUT_SOFT'
  | 'DRIFT_LEFT'
  | 'DRIFT_RIGHT'
  | 'DETAIL_PUSH';

export interface VisualBeat {
  startFrame: number;
  endFrame: number;
  imageSrc: string;

  storyRole?: string;
  composition?: CompositionPreset;
  shotScale?: ShotScale;
  focalPoint?: FocalPoint;
  cropScale?: number;
  transition?: BeatTransition;
  captionPlacement?: CaptionPlacement;

  motionPreset?: MotionPreset;
  motionProfile?: import('./motionGrammar').MotionProfile;
  cropVariant?: 'wide' | 'medium' | 'detail';
  emotionalHold?: boolean;
}

export type VisualContainer = 'canvas' | 'paper' | 'statement';

// ─── Ken Burns legacy presets ─────────────────────────────────────────────────
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
  description: 'Video triết lý, nhân sinh HAY & ĐẸP. Nền kem ấm, typography tối giản, micro-motion tinh tế.',
  aspectRatio: '9:16' as const,
  fps: 30,
} as const;
