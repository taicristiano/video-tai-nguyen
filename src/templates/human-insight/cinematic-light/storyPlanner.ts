/**
 * src/templates/human-insight/cinematic-light/storyPlanner.ts
 *
 * HAY & ĐẸP. — Generalized Template-Level Story & Shot Planner.
 * Single source of truth is storyPlannerRuntime.mjs.
 * This TypeScript module defines static types/contracts and delegates runtime execution to the runtime module.
 */

import {
  type ShotScale,
  type AssetStrategy,
  type PlannedShot,
  type ApprovedVisualAsset,
  type ShotPlanValidation,
  type ShotGrammarMetrics,
  type ReuseCandidateEvaluation,
} from './referenceShotGrammar';

import { type HumanInsightScene } from './index';

export type PlannerValidationMode = 'DRAFT' | 'PRODUCTION';

export interface ProductionValidationResult {
  ok: boolean;
  productionReady: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReuseAuditEvaluation {
  shotId: string;
  scale: ShotScale;
  strategy: AssetStrategy;
  sourceAsset?: string;
  semanticIntent: string;
  visualVerb: string;
  reason: string;
  candidateEvaluations?: ReuseCandidateEvaluation[];
}

export interface ReuseAuditResult {
  summary: {
    totalShots: number;
    reuseCount: number;
    newImageCount: number;
    componentCount: number;
  };
  evaluations: ReuseAuditEvaluation[];
}

export interface HeaderModel {
  shotCount: number;
  changesPerMinute: number;
  uniqueScales: number;
  uniqueSilhouettes: number;
  text: string;
}

export interface PlannerBrandContext {
  brandName: string;
  slogan?: string;
  outroComponentId?: string;
}

export interface HumanInsightPlannerInput {
  slug: string;
  title: string;
  category?: string;
  series?: string;
  voiceScriptText?: string;
  statementText?: string;
  hasInsightCard?: boolean;
  visualPriorities?: string[];
  timelineSegments: Array<{
    start: number;
    end: number;
    text: string;
    words?: Array<{ word: string; start: number; end: number }>;
  }>;
  approvedAssets?: ApprovedVisualAsset[];
  brandContext?: PlannerBrandContext;
  validationMode?: PlannerValidationMode;
  fps?: number;
}

export interface BrandAuditResult {
  templateBrand: string;
  audioMentionsBrand: boolean;
  audioBrandName?: string;
  hasMismatch: boolean;
  mismatchType?: 'BRAND_AUDIO_MISMATCH';
  notes: string;
}

export interface HumanInsightPlannedStory {
  grammarVersion: 'reference-shot-grammar-v1';
  plannerVersion: 'cinematic-light-story-planner-v2.1';
  generatedByTemplate: true;
  sourceSlug: string;
  title: string;
  shots: PlannedShot[];
  metrics: ShotGrammarMetrics;
  validation: ShotPlanValidation;
  structuralValidation: ShotPlanValidation;
  productionValidation: ProductionValidationResult;
  brandAudit: BrandAuditResult;
  reuseAudit: ReuseAuditResult;
  scenes: HumanInsightScene[];
}

export interface PlannerRunResult {
  plan: HumanInsightPlannedStory;
  metrics: ShotGrammarMetrics;
  validation: ShotPlanValidation;
  structuralValidation: ShotPlanValidation;
  productionValidation: ProductionValidationResult;
  brandAudit: BrandAuditResult;
  reuseAudit: ReuseAuditResult;
  storyboardHeaderModel: HeaderModel;
  transitionStripHeaderModel: HeaderModel;
}

export interface ArtifactConsistencyResult {
  ok: boolean;
  errors: string[];
}

// ─── Re-export runtime implementations from single source of truth ──────────

export {
  CHANNEL_BRAND_CONFIG,
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
  preProcessSegments,
  splitClauseTextAndTiming,
  normalizeContinuedSegments,
} from './storyPlannerRuntime.mjs';
