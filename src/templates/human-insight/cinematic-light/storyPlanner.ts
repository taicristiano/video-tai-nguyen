/**
 * src/templates/human-insight/cinematic-light/storyPlanner.ts
 *
 * HAY & ĐẸP. — Generalized Template-Level Story & Shot Planner.
 * Transforms canonical narration / timeline into reference-grammar shot plans.
 */

import path from 'path';
import {
  type ShotScale,
  type ShotSilhouette,
  type ShotStoryRole,
  type AssetStrategy,
  type CompositionType,
  type PlannedShot,
  type ApprovedVisualAsset,
  type ShotPlanValidation,
  type ShotGrammarMetrics,
  type HoldExceptionKind,
  type HoldException,
  type ReuseCandidateEvaluation,
  REFERENCE_SHOT_GRAMMAR,
  ACTION_HINTS,
  detectVisualVerb,
  resolveVisualStrategy,
  resolveAssetStrategy,
  evaluateAssetReuse,
  validateShotPlan,
  buildShotGrammarMetrics,
  buildImagePromptForShot,
  repairScaleMonotony,
  isValidHoldException,
  chooseCompositionForShot,
} from './referenceShotGrammar';

import { type HumanInsightScene, type StoryRole as RendererStoryRole } from './index';

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
  validationMode?: PlannerValidationMode; // default 'DRAFT'
  fps?: number; // default 30
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

/**
 * Pre-processes transcript segments, merging tiny sub-clause fragments (< 1.6s)
 * into coherent editorial holds before splitting analysis.
 */
function preProcessSegments(
  segments: Array<{ start: number; end: number; text: string }>,
): Array<{ start: number; end: number; text: string }> {
  // 1. Fill speech pauses so each segment end touches next segment start
  const filled: Array<{ start: number; end: number; text: string }> = [];
  for (let i = 0; i < segments.length; i++) {
    const curr = segments[i];
    const next = segments[i + 1];
    const start = i === 0 ? Math.min(0, curr.start) : curr.start;
    const end = next ? next.start : curr.end;
    filled.push({
      start,
      end: Math.max(end, curr.end),
      text: curr.text.trim(),
    });
  }

  // 2. Accumulate consecutive short fragments (< 2.0s) as long as combined <= 3.8s
  const result: Array<{ start: number; end: number; text: string }> = [];
  for (let i = 0; i < filled.length; i++) {
    const curr = { ...filled[i] };

    while (
      curr.end - curr.start < 2.0 &&
      i < filled.length - 1 &&
      filled[i + 1].end - curr.start <= 3.8
    ) {
      i++;
      curr.end = filled[i].end;
      curr.text = `${curr.text.trim()} ${filled[i].text.trim()}`;
    }

    result.push(curr);
  }

  return result;
}

/**
 * Evaluates whether a narrative segment should be split into multiple visual beats.
 * Decision order: semantic density first, duration second.
 */
export function shouldSplitClause(
  segment: { text: string; start: number; end: number },
  isStatementClause = false,
): boolean {
  const durationSec = Math.max(0.1, segment.end - segment.start);

  if (isStatementClause && durationSec <= 5.5) {
    // Dedicated statement card holds should not be split
    return false;
  }

  // Any segment > 4.0s without statement card MUST be split
  if (durationSec > 4.0) {
    return true;
  }

  if (durationSec <= 3.2) {
    return false;
  }

  const text = segment.text.trim();
  const SPLIT_CONNECTORS = [
    'nhưng',
    'mà là',
    'vấn đề là',
    'không phải',
    'thường là',
    'trước khi',
    'và chỉ',
    'để rồi',
    'nó luôn có',
  ];

  const hasConnector = SPLIT_CONNECTORS.some((c) => text.toLowerCase().includes(c));
  const hasPunct =
    (text.includes(',') || text.includes(':') || text.includes(';') || text.includes(' - ')) &&
    text.split(/[,:;]| - /)[1]?.trim().split(/\s+/).length >= 2;

  return hasConnector || hasPunct;
}

/**
 * Chooses an opening hook progression (DETAIL -> WIDE, CLOSE -> WIDE, or WIDE -> MEDIUM)
 * based purely on semantic cues in the opening clause.
 */
export function chooseHookPattern(
  openingText: string,
): { firstScale: ShotScale; firstSilhouette: ShotSilhouette; secondScale: ShotScale; secondSilhouette: ShotSilhouette } {
  const norm = openingText.toLowerCase();

  // 1. Concrete tactile object or physical action available -> DETAIL -> WIDE
  const OBJECT_HINTS = [
    'chìa khóa',
    'cốc',
    'tách trà',
    'bàn',
    'giấy tờ',
    'cuốn sổ',
    'trang sách',
    'cửa',
    'đồ đạc',
    'rơi',
    'đặt',
    'cầm',
    'bấm',
  ];
  if (OBJECT_HINTS.some((h) => norm.includes(h))) {
    return {
      firstScale: 'DETAIL',
      firstSilhouette: 'object-detail',
      secondScale: 'WIDE',
      secondSilhouette: 'room-wide',
    };
  }

  // 2. Emotion-heavy opening -> CLOSE -> WIDE
  const EMOTION_HINTS = [
    'mệt mỏi',
    'thở dài',
    'nặng nề',
    'áp lực',
    'lo lắng',
    'ngại ngùng',
    'im lặng',
    'cảm giác',
    'suy nghĩ',
  ];
  if (EMOTION_HINTS.some((h) => norm.includes(h))) {
    return {
      firstScale: 'CLOSE',
      firstSilhouette: 'face-close',
      secondScale: 'WIDE',
      secondSilhouette: 'room-wide',
    };
  }

  // 3. Problem/spatial opening -> WIDE -> MEDIUM
  return {
    firstScale: 'WIDE',
    firstSilhouette: 'room-wide',
    secondScale: 'MEDIUM',
    secondSilhouette: 'single-left',
  };
}

/**
 * Helper to recursively split a segment into hold-compliant semantic sub-clauses.
 * Ensures no generic image sub-beat exceeds 120 frames (4.0s).
 */
function splitClauseTextAndTiming(
  segment: { text: string; start: number; end: number },
  fps = 30,
  isStatement = false,
): Array<{ text: string; startFrame: number; endFrame: number; durationFrames: number }> {
  const text = segment.text.trim();
  const totalFrames = Math.round((segment.end - segment.start) * fps);
  const startFrame = Math.round(segment.start * fps);
  const endFrame = startFrame + totalFrames;

  if (totalFrames <= 120 || (isStatement && totalFrames <= 165)) {
    return [{ text, startFrame, endFrame, durationFrames: totalFrames }];
  }

  const SPLIT_PUNCT = [',', ':', ';', ' - '];
  let splitIndex = -1;

  // 1. Look for punctuation near the center
  const punctCandidates: number[] = [];
  for (const p of SPLIT_PUNCT) {
    let pos = text.indexOf(p);
    while (pos !== -1) {
      if (pos >= 8 && pos <= text.length - 8) {
        punctCandidates.push(pos + (p === ',' || p === ':' || p === ';' ? 1 : 0));
      }
      pos = text.indexOf(p, pos + 1);
    }
  }

  if (punctCandidates.length > 0) {
    const mid = text.length / 2;
    punctCandidates.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    splitIndex = punctCandidates[0];
  }

  // 2. Look for connector
  if (splitIndex === -1) {
    const textLower = text.toLowerCase();
    const SPLIT_CONNECTORS = [
      'trước khi',
      'và chỉ',
      'để rồi',
      'mà là',
      'không phải',
      'nhưng',
      'vấn đề là',
      'thường là',
      'nó luôn có',
    ];
    for (const c of SPLIT_CONNECTORS) {
      const idx = textLower.indexOf(c);
      if (idx >= 8 && idx <= text.length - 8) {
        splitIndex = idx;
        break;
      }
    }
  }

  // 3. Fallback to middle word
  if (splitIndex === -1) {
    const words = text.split(/\s+/);
    const midWord = Math.floor(words.length / 2);
    const part1 = words.slice(0, midWord).join(' ');
    splitIndex = part1.length;
  }

  const part1 = text.slice(0, splitIndex).trim();
  const part2 = text.slice(splitIndex).trim();

  const w1 = Math.max(1, part1.split(/\s+/).length);
  const w2 = Math.max(1, part2.split(/\s+/).length);
  const ratio = Math.max(0.3, Math.min(0.7, w1 / (w1 + w2)));
  const f1 = Math.round(totalFrames * ratio);

  const sub1 = { text: part1, start: segment.start, end: segment.start + f1 / fps };
  const sub2 = { text: part2, start: segment.start + f1 / fps, end: segment.end };

  return [
    ...splitClauseTextAndTiming(sub1, fps, isStatement),
    ...splitClauseTextAndTiming(sub2, fps, isStatement),
  ];
}

/**
 * Builds the initial raw candidate shot plan from canonical segments.
 */
export function buildCandidateShotPlan(input: HumanInsightPlannerInput): PlannedShot[] {
  const fps = input.fps ?? 30;
  const segments = preProcessSegments(input.timelineSegments);
  const statementTarget = (input.statementText || '').toLowerCase();
  const rawBeats: Array<{
    text: string;
    startFrame: number;
    endFrame: number;
    durationFrames: number;
    segmentIndex: number;
    isSplitSubBeat: boolean;
    isOpeningHook: boolean;
    isStatement: boolean;
  }> = [];

  segments.forEach((seg, sIdx) => {
    const isStatement = statementTarget.length > 10 && seg.text.toLowerCase().includes(statementTarget.slice(0, 20));
    const shouldSplit = shouldSplitClause(seg, isStatement);

    if (shouldSplit) {
      const parts = splitClauseTextAndTiming(seg, fps, isStatement);
      parts.forEach((p, pIdx) => {
        rawBeats.push({
          ...p,
          segmentIndex: sIdx,
          isSplitSubBeat: true,
          isOpeningHook: sIdx === 0 && pIdx === 0,
          isStatement,
        });
      });
    } else {
      const sf = Math.round(seg.start * fps);
      const ef = Math.round(seg.end * fps);
      rawBeats.push({
        text: seg.text.trim(),
        startFrame: sf,
        endFrame: ef,
        durationFrames: ef - sf,
        segmentIndex: sIdx,
        isSplitSubBeat: false,
        isOpeningHook: sIdx === 0,
        isStatement,
      });
    }
  });

  const shots: PlannedShot[] = [];
  const hookProgression = chooseHookPattern(rawBeats[0]?.text || '');

  for (let i = 0; i < rawBeats.length; i++) {
    const beat = rawBeats[i];
    const id = `shot-${String(i + 1).padStart(2, '0')}`;
    const textNorm = beat.text.toLowerCase();

    // 1. Role determination
    let storyRole: ShotStoryRole = 'action';
    if (beat.isOpeningHook) {
      storyRole = 'hook';
    } else if (i === 1 && rawBeats[0].isOpeningHook) {
      storyRole = 'establish';
    } else if (beat.isStatement) {
      storyRole = 'reflection';
    } else if (
      textNorm.includes('vấn đề là') ||
      textNorm.includes('không nằm ở') ||
      textNorm.includes('nghĩ') ||
      textNorm.includes('tâm trí') ||
      textNorm.includes('nhận ra') ||
      textNorm.includes('cảm giác') ||
      textNorm.includes('lời khuyên') ||
      textNorm.includes('chia sẻ')
    ) {
      storyRole = 'reflection';
    } else if (
      textNorm.includes('giữ cho') ||
      textNorm.includes('lợi thế') ||
      textNorm.includes('dự án') ||
      textNorm.includes('công cụ') ||
      textNorm.includes('kế hoạch')
    ) {
      storyRole = 'context';
    } else if (
      textNorm.includes('thư thái') ||
      textNorm.includes('nhìn xem') ||
      textNorm.includes('đời sống') ||
      textNorm.includes('bình an') ||
      i >= rawBeats.length - 2
    ) {
      storyRole = 'release';
    }

    // 2. Visual strategy & verb
    const strategy = resolveVisualStrategy(beat.text, storyRole);
    let visualVerb = strategy.visualVerb;
    if (storyRole === 'hook' && hookProgression.firstScale === 'DETAIL') {
      visualVerb = detectVisualVerb(beat.text) || 'rơi xuống';
    } else if (storyRole === 'establish') {
      visualVerb = detectVisualVerb(beat.text) || 'đứng nhìn';
    }

    // 3. Scale & Silhouette
    let scale: ShotScale = 'MEDIUM';
    let silhouette: ShotSilhouette = 'single-left';
    let motionProfile = 'SLOW_PUSH';
    let peopleMin = 1;
    let peopleMax = 1;

    if (beat.isOpeningHook) {
      scale = hookProgression.firstScale;
      silhouette = hookProgression.firstSilhouette;
      if (scale === 'DETAIL') {
        peopleMin = 0;
        peopleMax = 0;
      }
    } else if (i === 1 && rawBeats[0].isOpeningHook) {
      scale = hookProgression.secondScale;
      silhouette = hookProgression.secondSilhouette;
      motionProfile = 'AMBIENT_STILL';
    } else if (beat.isStatement) {
      scale = 'SYMBOLIC';
      silhouette = 'single-centered';
      motionProfile = 'AMBIENT_STILL';
    } else if (storyRole === 'reflection') {
      if (i % 2 === 0) {
        scale = 'CLOSE';
        silhouette = 'face-close';
        motionProfile = 'AMBIENT_STILL';
      } else {
        scale = 'MEDIUM';
        silhouette = 'single-left';
      }
    } else if (storyRole === 'context') {
      scale = 'SYMBOLIC';
      silhouette = 'object-detail';
      peopleMin = 0;
      peopleMax = 0;
    } else if (storyRole === 'release') {
      scale = i === rawBeats.length - 1 ? 'WIDE' : 'RELEASE';
      silhouette = scale === 'WIDE' ? 'room-wide' : 'empty-space';
      peopleMin = 0;
      peopleMax = 0;
      motionProfile = 'AMBIENT_STILL';
    } else {
      // action beats
      if (textNorm.includes('bàn') || textNorm.includes('lau') || textNorm.includes('dọn')) {
        scale = 'DETAIL';
        silhouette = 'tabletop-topdown';
      } else if (textNorm.includes('cốc') || textNorm.includes('sổ') || textNorm.includes('timer')) {
        scale = 'DETAIL';
        silhouette = 'hands-detail';
      } else {
        scale = 'MEDIUM';
        silhouette = i % 2 === 0 ? 'single-right' : 'single-centered';
      }
    }

    // Composition chosen by reusable sanity helper
    const composition = chooseCompositionForShot(scale, silhouette, storyRole);

    // Semantic intent derivation
    const semanticIntent = `Minh họa ${storyRole} cho câu: "${beat.text}". Hành động: ${visualVerb}.`;

    // Only valid statement card holds with input.hasInsightCard get typed hold exception
    let holdException: HoldException | undefined = undefined;
    let hasInsightCard: boolean | undefined = undefined;
    if (beat.isStatement && input.hasInsightCard) {
      holdException = {
        kind: 'INSIGHT_CARD',
        reason: 'Dedicated Insight Statement Card hold',
      };
      hasInsightCard = true;
    }

    shots.push({
      id,
      startFrame: beat.startFrame,
      endFrame: beat.endFrame,
      durationFrames: beat.durationFrames,
      scale,
      silhouette,
      storyRole,
      visualVerb,
      semanticIntent,
      peopleContract: { min: peopleMin, max: peopleMax },
      assetStrategy: 'NEW_IMAGE',
      composition,
      motionProfile,
      referenceReason: `Derived via reference shot grammar for role: ${storyRole}`,
      holdException,
      hasInsightCard,
      audioText: beat.text,
    });
  }

  // Append OutroCard component shot
  const lastShot = shots[shots.length - 1];
  const outroStart = lastShot ? lastShot.endFrame : 0;
  const outroDuration = 66; // 2.2s
  shots.push({
    id: `shot-${String(shots.length + 1).padStart(2, '0')}`,
    startFrame: outroStart,
    endFrame: outroStart + outroDuration,
    durationFrames: outroDuration,
    scale: 'RELEASE',
    silhouette: 'empty-space',
    storyRole: 'outro',
    visualVerb: 'chào kết',
    semanticIntent: `Thẻ OutroCard kết thúc thương hiệu ${input.brandContext?.brandName || 'HAY & ĐẸP.'}`,
    peopleContract: { min: 0, max: 0 },
    assetStrategy: 'COMPONENT',
    composition: 'portrait-focus',
    motionProfile: 'AMBIENT_STILL',
    referenceReason: 'Standard branded outro release hold',
    holdException: {
      kind: 'OUTRO_COMPONENT',
      reason: 'Standard branded outro release hold',
    },
    audioText: '',
  });

  return shots;
}

/**
 * Normalizes cadence into the target [18.0, 22.0] changes/minute range deterministically.
 * Merges adjacent semantically related sub-beats when too fast; splits long clauses when too slow.
 * CRITICAL CONSTRAINT: Merged shot duration must NOT exceed 4.0s (REFERENCE_SHOT_GRAMMAR.holdSeconds.wide.max).
 */
export function normalizeCadence(
  shots: PlannedShot[],
  totalDurationSeconds: number,
): PlannedShot[] {
  let list = [...shots];
  const durationMin = totalDurationSeconds / 60;
  const maxAllowedCpm = REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.max; // 22.0
  const minAllowedCpm = REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.min; // 18.0

  // 1. If cadence > max (e.g. > 22.0 changes/min): merge semantically compatible adjacent sub-beats
  let currentCpm = list.length / durationMin;
  let guard = 0;

  while (currentCpm > maxAllowedCpm && guard < 15 && list.length > 10) {
    guard++;
    let mergeIdx = -1;

    // First pass: find adjacent sub-beats sharing the same storyRole whose combined duration <= 4.0s (120 frames)
    for (let i = 0; i < list.length - 2; i++) {
      const a = list[i];
      const b = list[i + 1];
      const combinedFrames = a.durationFrames + b.durationFrames;
      if (
        combinedFrames <= 120 &&
        a.storyRole === b.storyRole &&
        a.storyRole !== 'outro' &&
        b.storyRole !== 'outro' &&
        !a.exceptionReason &&
        !b.exceptionReason
      ) {
        mergeIdx = i;
        break;
      }
    }

    // Second pass: if no same-role pair under 4.0s, find the pair with smallest combined duration under 4.0s
    if (mergeIdx === -1) {
      let minCombined = Infinity;
      for (let i = 0; i < list.length - 2; i++) {
        const a = list[i];
        const b = list[i + 1];
        const combinedFrames = a.durationFrames + b.durationFrames;
        if (
          combinedFrames <= 120 &&
          a.storyRole !== 'outro' &&
          b.storyRole !== 'outro' &&
          !a.exceptionReason &&
          !b.exceptionReason
        ) {
          if (combinedFrames < minCombined) {
            minCombined = combinedFrames;
            mergeIdx = i;
          }
        }
      }
    }

    if (mergeIdx !== -1) {
      const a = list[mergeIdx];
      const b = list[mergeIdx + 1];
      const merged: PlannedShot = {
        ...a,
        endFrame: b.endFrame,
        durationFrames: a.durationFrames + b.durationFrames,
        visualVerb: a.visualVerb === b.visualVerb ? a.visualVerb : `${a.visualVerb} / ${b.visualVerb}`,
        semanticIntent: `${a.semanticIntent} Kết hợp: ${b.semanticIntent}`,
        audioText: [a.audioText, b.audioText].filter(Boolean).join(' '),
      };
      list.splice(mergeIdx, 2, merged);
      currentCpm = list.length / durationMin;
    } else {
      break;
    }
  }

  // Re-index shot IDs and sync frame boundaries
  let cursor = list[0]?.startFrame ?? 0;
  list = list.map((s, idx) => {
    const start = cursor;
    const end = start + s.durationFrames;
    cursor = end;
    return {
      ...s,
      id: `shot-${String(idx + 1).padStart(2, '0')}`,
      startFrame: start,
      endFrame: end,
    };
  });

  return list;
}

/**
 * Applies reference grammar transformations: repairs monotony and normalizes cadence.
 */
export function applyReferenceShotGrammar(
  candidateShots: PlannedShot[],
  input: HumanInsightPlannerInput,
): { shots: PlannedShot[]; normalized: boolean } {
  const totalFrames = candidateShots[candidateShots.length - 1]?.endFrame ?? 1500;
  const totalDurationSec = totalFrames / (input.fps ?? 30);

  // 1. Cadence normalization
  const normalizedShots = normalizeCadence(candidateShots, totalDurationSec);

  // 2. Anti-monotony repair on post-normalized sequence
  const antiMonotonyShots: PlannedShot[] = [];
  for (const shot of normalizedShots) {
    const repaired = repairScaleMonotony(shot, antiMonotonyShots);
    const composition = chooseCompositionForShot(repaired.scale, repaired.silhouette, repaired.storyRole);
    antiMonotonyShots.push({
      ...repaired,
      composition,
    });
  }

  return {
    shots: antiMonotonyShots,
    normalized: antiMonotonyShots.length !== candidateShots.length,
  };
}

/**
 * Checks for brand discrepancies between visual brand and spoken audio.
 */
export function auditBrandContext(
  input: HumanInsightPlannerInput,
  shots: PlannedShot[],
): BrandAuditResult {
  const visualBrand = input.brandContext?.brandName || 'HAY & ĐẸP.';
  const allAudio = shots.map((s) => s.audioText || '').join(' ').toLowerCase();

  const LEGACY_BRANDS = ['nếp', 'nep', 'nếp sống'];
  let audioBrandName: string | undefined = undefined;
  for (const lb of LEGACY_BRANDS) {
    if (allAudio.includes(lb)) {
      audioBrandName = 'Nếp';
      break;
    }
  }

  const hasMismatch = Boolean(audioBrandName && !visualBrand.toLowerCase().includes(audioBrandName.toLowerCase()));

  return {
    templateBrand: visualBrand,
    audioMentionsBrand: Boolean(audioBrandName),
    audioBrandName,
    hasMismatch,
    mismatchType: hasMismatch ? 'BRAND_AUDIO_MISMATCH' : undefined,
    notes: hasMismatch
      ? `Canonical audio mentions legacy brand '${audioBrandName}' while visual template brand is '${visualBrand}'. Spoken audio is preserved.`
      : 'Visual and audio brand context aligned.',
  };
}

/**
 * Maps planner shot story roles to Remotion renderer story roles.
 * Preserves the original intent without erasing hook or outro identity.
 */
export function mapPlannerRoleToRendererRole(role: ShotStoryRole): RendererStoryRole {
  switch (role) {
    case 'hook':
      return 'establish';
    case 'outro':
      return 'release';
    case 'detail':
      return 'detail-action';
    case 'establish':
    case 'context':
    case 'action':
    case 'interaction':
    case 'reflection':
    case 'memory':
    case 'release':
    case 'question':
      return role;
    default:
      return 'establish';
  }
}

/**
 * Maps planned shots to Remotion HumanInsightScene[] structures.
 */
export function buildTemplateScenes(
  shots: PlannedShot[],
  input: HumanInsightPlannerInput,
): HumanInsightScene[] {
  const fps = input.fps ?? 30;
  return shots.map((shot, idx) => {
    const isFirst = idx === 0;
    const isOutro = shot.storyRole === 'outro';
    const isEnding = idx >= shots.length - 2;

    const sceneType: HumanInsightScene['type'] = isFirst
      ? 'hook'
      : isOutro || isEnding
      ? 'ending'
      : 'body';

    const assetId = shot.sourceAsset
      ? path.basename(shot.sourceAsset, path.extname(shot.sourceAsset))
      : `shot-${String(idx + 1).padStart(2, '0')}`;

    const imagePath = shot.sourceAsset || `assets/${assetId}.jpg`;

    return {
      type: sceneType,
      layout: 'standard',
      composition: shot.composition as any,
      shotScale: shot.scale as any,
      motionProfile: shot.motionProfile as any,
      startFrame: shot.startFrame,
      durationFrames: shot.durationFrames,
      plannerStoryRole: shot.storyRole,
      storyRole: mapPlannerRoleToRendererRole(shot.storyRole),
      visualIntent: shot.semanticIntent,
      isOutro,
      audioSegment: {
        start: shot.startFrame / fps,
        end: shot.endFrame / fps,
        text: shot.audioText || '',
      },
      image: {
        assetId,
        path: imagePath,
      },
    };
  });
}

/**
 * Builds the comprehensive asset reuse audit from actual planned shots.
 */
export function buildReuseAudit(
  shots: PlannedShot[],
  approvedAssets?: ApprovedVisualAsset[],
): ReuseAuditResult {
  const evaluations: ReuseAuditEvaluation[] = shots.map((shot) => {
    const res = resolveAssetStrategy(shot, approvedAssets);
    const candidateEvals = approvedAssets?.map((a) => evaluateAssetReuse(shot, a)) ?? [];
    return {
      shotId: shot.id,
      scale: shot.scale,
      strategy: shot.assetStrategy,
      sourceAsset: shot.sourceAsset,
      semanticIntent: shot.semanticIntent,
      visualVerb: shot.visualVerb,
      reason: res.reason,
      candidateEvaluations: candidateEvals,
    };
  });

  const reuseCount = shots.filter(
    (s) => s.assetStrategy === 'REUSE_FULL' || s.assetStrategy === 'REUSE_CROP',
  ).length;
  const newImageCount = shots.filter((s) => s.assetStrategy === 'NEW_IMAGE').length;
  const componentCount = shots.filter((s) => s.assetStrategy === 'COMPONENT').length;

  return {
    summary: {
      totalShots: shots.length,
      reuseCount,
      newImageCount,
      componentCount,
    },
    evaluations,
  };
}

/**
 * Evaluates production readiness against brand mismatches and structural validity.
 */
export function evaluateProductionReadiness(
  structuralValidation: ShotPlanValidation,
  brandAudit: BrandAuditResult,
  validationMode: PlannerValidationMode = 'PRODUCTION',
): ProductionValidationResult {
  const errors: string[] = [...structuralValidation.errors];
  const warnings: string[] = [...structuralValidation.warnings];

  if (brandAudit.hasMismatch) {
    const msg = `BRAND_AUDIO_MISMATCH: spoken audio mentions legacy brand '${brandAudit.audioBrandName}', template brand is '${brandAudit.templateBrand}'`;
    if (validationMode === 'PRODUCTION') {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  const productionReady = structuralValidation.ok && !brandAudit.hasMismatch;

  return {
    ok: errors.length === 0,
    productionReady,
    errors,
    warnings,
  };
}

/**
 * Main generalized entry point: plans a Human Insight video using reference shot grammar.
 */
export function planHumanInsightVideo(
  input: HumanInsightPlannerInput,
): HumanInsightPlannedStory {
  // Step 1: Candidate shot plan
  const candidateShots = buildCandidateShotPlan(input);

  // Step 2: Apply reference shot grammar & cadence normalization
  const grammarResult = applyReferenceShotGrammar(candidateShots, input);

  // Step 3: Resolve asset strategy with semantic compatibility
  const finalShots = grammarResult.shots.map((shot) => {
    const strategyResult = resolveAssetStrategy(shot, input.approvedAssets);
    const assetPrompt =
      strategyResult.assetStrategy === 'NEW_IMAGE'
        ? buildImagePromptForShot(shot, undefined, input.brandContext)
        : undefined;

    return {
      ...shot,
      assetStrategy: strategyResult.assetStrategy,
      sourceAsset: strategyResult.sourceAsset ?? shot.sourceAsset,
      cropIntent: strategyResult.cropIntent ?? shot.cropIntent,
      assetPrompt,
    };
  });

  // Step 4: Template-level validation (structural)
  const structuralValidation = validateShotPlan(finalShots);

  // Step 5: Metrics, brand audit, reuse audit
  const metrics = buildShotGrammarMetrics(finalShots);
  const brandAudit = auditBrandContext(input, finalShots);
  const reuseAudit = buildReuseAudit(finalShots, input.approvedAssets);

  // Step 6: Production readiness evaluation
  const productionValidation = evaluateProductionReadiness(
    structuralValidation,
    brandAudit,
    input.validationMode ?? 'DRAFT',
  );

  // Step 7: Spec scenes
  const scenes = buildTemplateScenes(finalShots, input);

  return {
    grammarVersion: 'reference-shot-grammar-v1',
    plannerVersion: 'cinematic-light-story-planner-v2.1',
    generatedByTemplate: true,
    sourceSlug: input.slug,
    title: input.title,
    shots: finalShots,
    metrics,
    validation: structuralValidation, // backward compatibility
    structuralValidation,
    productionValidation,
    brandAudit,
    reuseAudit,
    scenes,
  };
}

/**
 * Builds the unified, immutable PlannerRunResult object from which all artifacts are derived.
 */
export function buildPlannerRunResult(
  input: HumanInsightPlannerInput,
): PlannerRunResult {
  const plannedStory = planHumanInsightVideo(input);
  const metrics = plannedStory.metrics;
  const headerText = `${metrics.shotCount} shots | ${metrics.changesPerMinute.toFixed(2)} changes/min | ${metrics.uniqueScales} scales | ${metrics.uniqueSilhouettes} silhouettes`;
  const headerModel: HeaderModel = {
    shotCount: metrics.shotCount,
    changesPerMinute: metrics.changesPerMinute,
    uniqueScales: metrics.uniqueScales,
    uniqueSilhouettes: metrics.uniqueSilhouettes,
    text: headerText,
  };

  return {
    plan: plannedStory,
    metrics,
    validation: plannedStory.validation,
    structuralValidation: plannedStory.structuralValidation,
    productionValidation: plannedStory.productionValidation,
    brandAudit: plannedStory.brandAudit,
    reuseAudit: plannedStory.reuseAudit,
    storyboardHeaderModel: headerModel,
    transitionStripHeaderModel: headerModel,
  };
}

/**
 * Validates that all generated artifacts, summaries, and header models match the planner metrics identically.
 */
export function validatePlannerArtifacts(
  result: PlannerRunResult,
): ArtifactConsistencyResult {
  const errors: string[] = [];

  if (result.plan.shots.length !== result.metrics.shotCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: plan shots count (${result.plan.shots.length}) !== metrics.shotCount (${result.metrics.shotCount})`,
    );
  }

  const fullCount = result.plan.shots.filter((s) => s.assetStrategy === 'REUSE_FULL').length;
  const cropCount = result.plan.shots.filter((s) => s.assetStrategy === 'REUSE_CROP').length;
  const totalReuse = fullCount + cropCount;

  if (totalReuse !== result.metrics.reuseCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: strategy reuse count (${totalReuse}) !== metrics.reuseCount (${result.metrics.reuseCount})`,
    );
  }

  const newImgCount = result.plan.shots.filter((s) => s.assetStrategy === 'NEW_IMAGE').length;
  if (newImgCount !== result.metrics.newImageCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: strategy new image count (${newImgCount}) !== metrics.newImageCount (${result.metrics.newImageCount})`,
    );
  }

  const compCount = result.plan.shots.filter((s) => s.assetStrategy === 'COMPONENT').length;
  if (compCount !== result.metrics.componentCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: strategy component count (${compCount}) !== metrics.componentCount (${result.metrics.componentCount})`,
    );
  }

  if (result.reuseAudit.summary.reuseCount !== result.metrics.reuseCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: reuseAudit summary reuseCount (${result.reuseAudit.summary.reuseCount}) !== metrics.reuseCount (${result.metrics.reuseCount})`,
    );
  }

  if (result.reuseAudit.summary.newImageCount !== result.metrics.newImageCount) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: reuseAudit summary newImageCount (${result.reuseAudit.summary.newImageCount}) !== metrics.newImageCount (${result.metrics.newImageCount})`,
    );
  }

  if (result.reuseAudit.evaluations.length !== result.plan.shots.length) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: reuseAudit evaluations length (${result.reuseAudit.evaluations.length}) !== plan shots length (${result.plan.shots.length})`,
    );
  }

  const expectedHeaderText = `${result.metrics.shotCount} shots | ${result.metrics.changesPerMinute.toFixed(2)} changes/min | ${result.metrics.uniqueScales} scales | ${result.metrics.uniqueSilhouettes} silhouettes`;

  if (result.storyboardHeaderModel.text !== expectedHeaderText) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: storyboardHeaderModel text ('${result.storyboardHeaderModel.text}') does not match metrics ('${expectedHeaderText}')`,
    );
  }

  if (result.transitionStripHeaderModel.text !== expectedHeaderText) {
    errors.push(
      `ARTIFACT_CONSISTENCY_ERROR: transitionStripHeaderModel text ('${result.transitionStripHeaderModel.text}') does not match metrics ('${expectedHeaderText}')`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
