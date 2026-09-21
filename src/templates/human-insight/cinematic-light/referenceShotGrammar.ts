/**
 * src/templates/human-insight/cinematic-light/referenceShotGrammar.ts
 *
 * HAY & ĐẸP. — Reference-Derived Story & Shot Grammar Layer.
 * Single source of truth is referenceShotGrammarRuntime.mjs.
 * This TypeScript module defines static types/contracts and delegates runtime execution to the runtime module.
 */

export type ShotScale =
  | 'WIDE'
  | 'MEDIUM'
  | 'CLOSE'
  | 'DETAIL'
  | 'SYMBOLIC'
  | 'RELEASE';

export type ShotSilhouette =
  | 'single-centered'
  | 'single-left'
  | 'single-right'
  | 'face-close'
  | 'hands-detail'
  | 'two-person'
  | 'two-person-wide'
  | 'two-person-balanced'
  | 'two-person-offset'
  | 'two-person-over-shoulder'
  | 'three-person'
  | 'family-group'
  | 'group'
  | 'empty-space'
  | 'object-detail'
  | 'tabletop-topdown'
  | 'room-wide';

export type ShotStoryRole =
  | 'hook'
  | 'establish'
  | 'context'
  | 'action'
  | 'interaction'
  | 'detail'
  | 'reflection'
  | 'memory'
  | 'release'
  | 'question'
  | 'outro';

export type StoryRole = ShotStoryRole;

export type VisualMode =
  | 'ENVIRONMENT_WIDE'
  | 'INTERACTION_MEDIUM'
  | 'SOLO_MEDIUM'
  | 'REACTION_CLOSE'
  | 'ACTION_DETAIL'
  | 'OBJECT_DETAIL'
  | 'EMPTY_RELEASE'
  | 'GROUP_WIDE';

export type AssetStrategy =
  | 'REUSE_FULL'
  | 'REUSE_CROP'
  | 'NEW_IMAGE'
  | 'COMPONENT';

export type CompositionType =
  | 'portrait-focus'
  | 'editorial-left'
  | 'editorial-right'
  | 'detail-insert'
  | 'paper';

export type HoldExceptionKind =
  | 'INSIGHT_CARD'
  | 'OUTRO_COMPONENT'
  | 'AUTHORED_EMOTIONAL_PAUSE';

export interface HoldException {
  kind: HoldExceptionKind;
  reason: string;
}

export interface PeopleContract {
  min: number;
  max: number;
}

export interface PlannedShot {
  id: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  scale: ShotScale;
  shotScale?: string;
  silhouette: ShotSilhouette;
  storyRole: ShotStoryRole;
  plannerStoryRole?: string;
  visualMode?: VisualMode;
  storyParticipants?: string[];
  visibleMembers?: string[];
  visiblePeopleContract?: PeopleContract;
  visualVerb: string;
  semanticIntent: string;
  visualAction?: string;
  peopleContract: PeopleContract;
  presentMembers?: string[];
  assetStrategy: AssetStrategy;
  sourceAsset?: string;
  cropIntent?: {
    kind: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'DETAIL';
    focalPoint?: { x: number; y: number };
    cropScale?: number;
  };
  composition: CompositionType;
  motionProfile: string;
  motionPreset?: string;
  referenceReason: string;
  holdException?: HoldException;
  hasInsightCard?: boolean;
  exceptionReason?: string;
  audioText?: string;
  assetPrompt?: string;
  segmentIndex?: number;
  continuedInSegments?: number[];
  voiceClause?: string;
  narrativePurpose?: string;
  visualIntent?: string;
}

export type VisualStrategy =
  | {
      kind: 'ACTION';
      visualVerb: string;
    }
  | {
      kind: 'SYMBOLIC_OR_EMOTIONAL';
      visualVerb: string;
    };

export type ReuseSemanticMatch = 'EXACT' | 'ACCEPTABLE' | 'MISMATCH';

export interface ReuseCandidateEvaluation {
  sourceAsset: string;
  semanticMatch: ReuseSemanticMatch;
  canUseFull: boolean;
  canUseCrop: boolean;
  reason: string;
}

export interface ApprovedVisualAsset {
  path: string;
  peopleCount: number;
  sceneMeaning: string;
  visualAction?: string;
  supportedScales?: ShotScale[];
  supportedCropTargets?: Array<{
    kind: 'MEDIUM' | 'CLOSE' | 'DETAIL';
    semanticMeaning: string;
  }>;
}

export interface ShotGrammarMetrics {
  totalShots: number;
  changesPerMinute: number;
  medianHoldSeconds: number;
  maxHoldSeconds: number;
  uniqueScales: number;
  uniqueSilhouettes: number;
  scaleDistribution: Record<string, number>;
  silhouetteDistribution: Record<string, number>;
  assetReuseRatio: number;
  newImageCount: number;
  reuseCount: number;
  componentCount: number;
}

export interface ShotPlanValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Re-export runtime implementations from single source of truth ──────────

export {
  REFERENCE_SHOT_GRAMMAR,
  ACTION_HINTS,
  SHOT_SCALES,
  SHOT_SILHOUETTES,
  STORY_ROLES,
  ASSET_STRATEGIES,
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
  buildImageSafetyRulesForShot,
  mapPlannerScaleToRendererScale,
  choosePlannerScale,
  isSilhouetteCompatibleWithPeopleContract,
  VISUAL_MODES,
  VISUAL_MODE_TO_SCALE,
  deriveVisualMode,
  validateActionPromptContract,
  validateVisibleRoleContract,
  validateFinalImagePromptContract,
  validateObjectDetailContract,
} from './referenceShotGrammarRuntime.mjs';
