/**
 * src/types/production.ts — Generic Production Render Specification Interfaces.
 *
 * Applicable across all HAY & ĐẸP. video episodes (Video005, Video006, Video007...).
 * Decouples Remotion rendering from video-specific hardcoded constants.
 */

import type {
  CompositionPreset,
  MotionPreset,
  ShotScale,
  VisualContainer,
} from '../templates/human-insight/cinematic-light/tokens';

export interface OutroConfig {
  enabled: boolean;
  durationFrames?: number;
  artworkSrc?: string;
  brandName?: string;
  slogan?: string;
}

export interface ProductionShot {
  shotId: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  imageSrc: string; // Relative to staticFile root (public/)
  visualMode?: string;
  composition?: CompositionPreset;
  shotScale?: ShotScale;
  motionPreset?: MotionPreset;
  storyRole?: string;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  framing?: 'standard' | 'focus';
  container?: VisualContainer;
  hasInsightCard?: boolean;
  hasSectionCard?: boolean;
  cardDuration?: number;
  isOutro?: boolean;
  type?: 'hook' | 'body' | 'ending' | 'outro';
  layout?: 'standard' | 'focus' | 'statement' | 'chapter';
  headerMode?: 'full' | 'dimmed' | 'logo-only' | 'hidden';
  captionMode?: 'plain' | 'phrase' | 'statement';
  captionPlacement?: 'below-visual' | 'overlay-bottom' | 'overlay-top' | 'hidden';
  voiceClause?: string;
}

export interface ProductionRenderSpec {
  videoIndex?: number;
  slug: string;
  title: string;
  brand?: string;
  slogan?: string;
  fps: number;
  totalFrames: number;
  width?: number;
  height?: number;
  audioSrc?: string;
  bgMusic?: string | null;
  watermarkSrc?: string;
  timelineSrc?: string;
  shots: ProductionShot[];
  outro?: OutroConfig;
}
