/**
 * index.ts — Entry point for human-insight/cinematic-light template (V2).
 *
 * Provides the full Editorial Engine V2:
 *   - Layout: fixed frame with dynamic header modes ('full' | 'dimmed' | 'logo-only' | 'hidden')
 *   - ImageScene: micro-motion presets, visual beats, and container mix ('canvas' | 'paper' | 'statement')
 *   - SectionCard: chapter breakdown card (01, 02, 03 or custom)
 *   - InsightCard: statement / visual punctuation card
 *   - OutroCard: 9:16 branded artwork outro
 *   - Character Universe: cast definitions and continuity locks
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

export {
  COLORS,
  FONT_MAIN,
  LAYOUT,
  TYPOGRAPHY,
  FRAMING,
  COMPOSITIONS,
  SHOT_SCALE,
  TEMPLATE_META,
} from './tokens';
export {
  BRAND_WATERMARK,
  TITLE_TYPOGRAPHY,
  SUBTITLE_TYPOGRAPHY,
  SAFE_ZONES,
} from './brandTypographyTokens';
export type {
  CompositionPreset,
  ShotScale,
  BeatTransition,
  CaptionPlacement,
  FocalPoint,
  TitleMode,
  KenBurnsConfig,
  KenBurnsDirection,
  MotionPreset,
  VisualBeat,
  VisualContainer,
} from './tokens';

export {
  MOTION_PROFILES,
  MOTION_RANGES,
  computeMotionGrammar,
  resolveMotionProfile,
  normalizeMotionProfile,
} from './motionGrammar';
export type {
  MotionProfile,
  MotionConfig,
  MotionState,
} from './motionGrammar';

export { CHARACTER_CASTS, inferCastId } from './characters';
export type { CharacterCast } from './characters';

export {
  REFERENCE_SHOT_GRAMMAR,
  ACTION_HINTS,
  detectVisualVerb,
  resolveVisualStrategy,
  validateShotPlan,
  buildShotGrammarMetrics,
  evaluateAssetReuse,
  resolveAssetStrategy,
  buildImagePromptForShot,
  repairScaleMonotony,
  isValidHoldException,
  chooseCompositionForShot,
} from './referenceShotGrammar';
export type {
  ShotScale as ReferenceShotScale,
  ShotSilhouette,
  ShotStoryRole,
  AssetStrategy,
  CompositionType,
  PlannedShot,
  VisualStrategy,
  ReuseSemanticMatch,
  ReuseCandidateEvaluation,
  ApprovedVisualAsset,
  ShotGrammarMetrics,
  ShotPlanValidation,
  HoldExceptionKind,
  HoldException,
} from './referenceShotGrammar';

export {
  planHumanInsightVideo,
  buildCandidateShotPlan,
  applyReferenceShotGrammar,
  normalizeCadence,
  chooseHookPattern,
  shouldSplitClause,
  auditBrandContext,
  buildTemplateScenes,
  evaluateProductionReadiness,
  buildReuseAudit,
  validatePlannerArtifacts,
  buildPlannerRunResult,
  mapPlannerRoleToRendererRole,
} from './storyPlanner';
export type {
  HumanInsightPlannerInput,
  PlannerBrandContext,
  BrandAuditResult,
  HumanInsightPlannedStory,
  PlannerValidationMode,
  ProductionValidationResult,
  ReuseAuditEvaluation,
  ReuseAuditResult,
  HeaderModel,
  PlannerRunResult,
  ArtifactConsistencyResult,
} from './storyPlanner';


// ─── Editorial Spec Types for human-insight/cinematic-light V2.1 ──────────────

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

export type StoryRole =
  | 'establish'
  | 'action'
  | 'interaction'
  | 'detail-action'
  | 'context'
  | 'reflection'
  | 'memory'
  | 'release'
  | 'question';

export interface HumanInsightScene {
  type: SceneType;
  layout?: LayoutType;
  composition?: import('./tokens').CompositionPreset;
  shotScale?: import('./tokens').ShotScale;
  focalPoint?: import('./tokens').FocalPoint;
  titleMode?: import('./tokens').TitleMode;
  captionPlacement?: import('./tokens').CaptionPlacement;
  visualContainer?: import('./tokens').VisualContainer;
  motionPreset?: import('./tokens').MotionPreset;
  motionProfile?: import('./motionGrammar').MotionProfile;
  visualBeats?: import('./tokens').VisualBeat[];
  castId?: string;
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
  insightVariant?: 'overlay' | 'card';
  plannerStoryRole?: import('./referenceShotGrammar').ShotStoryRole;
  storyRole?: StoryRole;
  narrativePurpose?: string;
  visualIntent?: string;
  worldId?: string;
  continuityGroup?: string;
  isOutro?: boolean;
}

export interface HumanInsightSpec {
  templateId: 'human-insight/cinematic-light';
  slug: string;
  totalFrames: number;
  castId?: string;
  video: {
    title: string;
    bgMusic?: string | null;
  };
  scenes: HumanInsightScene[];
}
