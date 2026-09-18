/**
 * index.ts — Entry point for human-insight/cinematic-light template.
 *
 * Provides the full Editorial Engine:
 *   - Layout: fixed frame with dynamic header modes ('full' | 'dimmed' | 'logo-only' | 'hidden')
 *   - ImageScene: tactile art card supporting 'standard' (1020x638) and 'focus' (1060x740) framing
 *   - SectionCard: chapter breakdown card (01, 02, 03)
 *   - InsightCard: statement / visual punctuation card
 *   - OutroCard: peaceful branding ending
 */

export { Layout } from './Layout';
export type { LayoutProps, SceneWindowInfo } from './Layout';

export { ImageScene } from './ImageScene';
export type { ImageSceneProps } from './ImageScene';

export { SectionCard } from './SectionCard';
export type { SectionCardProps } from './SectionCard';

export { InsightCard } from './InsightCard';
export type { InsightCardProps } from './InsightCard';

export { OutroCard } from './OutroCard';
export type { OutroCardProps } from './OutroCard';

export { COLORS, FONT_MAIN, LAYOUT, TYPOGRAPHY, FRAMING, TEMPLATE_META } from './tokens';
export type { KenBurnsConfig, KenBurnsDirection } from './tokens';

// ─── Editorial Spec Types for human-insight/cinematic-light ───────────────────

export interface HumanInsightImage {
  assetId: string;
  path: string;
  kenBurns?: import('./tokens').KenBurnsConfig;
}

export type SceneType = 'hook' | 'body' | 'stat' | 'ending';
export type LayoutType = 'standard' | 'focus' | 'statement' | 'chapter';
export type HeaderMode = 'full' | 'dimmed' | 'logo-only' | 'hidden';
export type CaptionMode = 'plain' | 'phrase' | 'statement';

export interface SectionCardConfig {
  number: string;
  title: string;
  subtitle?: string;
}

export interface HumanInsightScene {
  type: SceneType;
  layout?: LayoutType;
  headerMode?: HeaderMode;
  captionMode?: CaptionMode;
  startFrame: number;
  durationFrames: number;
  audioSegment: {
    start: number;
    end: number;
    text: string;
  };
  image: HumanInsightImage;
  sectionCard?: SectionCardConfig;
  insightText?: string;
  isOutro?: boolean;
}

export interface HumanInsightSpec {
  templateId: 'human-insight/cinematic-light';
  slug: string;
  totalFrames: number;
  video: {
    title: string;
    bgMusic?: string | null;
  };
  scenes: HumanInsightScene[];
}
