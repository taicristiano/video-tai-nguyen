/**
 * src/templates/human-insight/cinematic-light/referenceShotGrammar.ts
 *
 * HAY & ĐẸP. — Reference-Derived Story & Shot Grammar Layer.
 * Reusable, template-level shot grammar and constraints.
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
  | 'two-person'
  | 'three-person'
  | 'tabletop-topdown'
  | 'object-detail'
  | 'room-wide'
  | 'empty-space'
  | 'hands-detail'
  | 'face-close';

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

export function isValidHoldException(shot: PlannedShot): boolean {
  const ex = shot.holdException;
  if (!ex) return false;

  if (ex.kind === 'INSIGHT_CARD') {
    return Boolean(shot.hasInsightCard);
  }

  if (ex.kind === 'OUTRO_COMPONENT') {
    return (
      shot.storyRole === 'outro' &&
      shot.assetStrategy === 'COMPONENT'
    );
  }

  if (ex.kind === 'AUTHORED_EMOTIONAL_PAUSE') {
    return (
      ex.reason.trim().length >= 12 &&
      shot.storyRole !== 'action'
    );
  }

  return false;
}

export interface PlannedShot {
  id: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  scale: ShotScale;
  silhouette: ShotSilhouette;
  storyRole: ShotStoryRole;
  visualVerb: string;
  semanticIntent: string;
  peopleContract: {
    min: number;
    max: number;
  };
  assetStrategy: AssetStrategy;
  sourceAsset?: string;
  cropIntent?: {
    kind: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'DETAIL';
    focalPoint?: { x: number; y: number };
    cropScale?: number;
  };
  composition: CompositionType;
  motionProfile: string;
  referenceReason: string;
  holdException?: HoldException;
  hasInsightCard?: boolean;
  exceptionReason?: string;
  audioText?: string;
  assetPrompt?: string;
}

export const REFERENCE_SHOT_GRAMMAR = {
  targetChangesPerMinute: {
    min: 18,
    max: 22,
  },
  holdSeconds: {
    detail: { min: 1.5, max: 2.8 },
    close: { min: 2.0, max: 3.2 },
    medium: { min: 2.2, max: 3.5 },
    wide: { min: 2.5, max: 4.0 },
    release: { min: 2.5, max: 4.0 },
  },
  maxConsecutiveSameScale: 2,
  maxConsecutiveSameSilhouette: 2,
  preferredProgressions: [
    ['WIDE', 'MEDIUM', 'DETAIL', 'MEDIUM', 'CLOSE', 'RELEASE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
    ['CLOSE', 'DETAIL', 'RELEASE'],
    ['MEDIUM', 'DETAIL', 'MEDIUM', 'CLOSE'],
  ],
  hookPatterns: [
    ['DETAIL', 'WIDE'],
    ['CLOSE', 'WIDE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
  ],
} as const;

export const ACTION_HINTS = [
  'đặt',
  'gấp',
  'gập',
  'lau',
  'rót',
  'mở',
  'đóng',
  'cất',
  'mang',
  'ngồi',
  'đứng',
  'nhìn',
  'chạm',
  'xếp',
  'dừng',
  'tựa',
  'dọn',
  'đưa',
  'thở',
  'rời',
  'vặn',
  'tắt',
  'bật',
  'khép',
  'uống',
  'quay lại',
  'thay đổi',
  'bắt đầu',
] as const;

export type VisualStrategy =
  | {
      kind: 'ACTION';
      visualVerb: string;
    }
  | {
      kind: 'SYMBOLIC_OR_EMOTIONAL';
      visualVerb: string;
    };

export function detectVisualVerb(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const verb of ACTION_HINTS) {
    if (normalized.includes(verb)) {
      return verb;
    }
  }
  return null;
}

export function resolveVisualStrategy(clause: string, role?: ShotStoryRole): VisualStrategy {
  const verb = detectVisualVerb(clause);
  if (verb) {
    return {
      kind: 'ACTION',
      visualVerb: verb,
    };
  }
  if (role === 'reflection' || role === 'memory') {
    return {
      kind: 'SYMBOLIC_OR_EMOTIONAL',
      visualVerb: 'suy ngẫm',
    };
  }
  if (role === 'release' || role === 'outro') {
    return {
      kind: 'SYMBOLIC_OR_EMOTIONAL',
      visualVerb: 'thư thái',
    };
  }
  return {
    kind: 'SYMBOLIC_OR_EMOTIONAL',
    visualVerb: 'symbolic-detail',
  };
}

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
    focalPoint?: {
      x: number;
      y: number;
    };
    cropScale?: number;
  }>;
  qaStatus: 'PASS';
}

/**
 * Reusable semantic evaluation of an approved asset against a shot's requirements.
 */
export function evaluateAssetReuse(
  shot: {
    scale: ShotScale;
    semanticIntent: string;
    visualVerb: string;
    peopleContract: { min: number; max: number };
  },
  asset: ApprovedVisualAsset,
): ReuseCandidateEvaluation {
  const intentLower = shot.semanticIntent.toLowerCase();
  const meaningLower = asset.sceneMeaning.toLowerCase();
  const verbLower = shot.visualVerb.toLowerCase();

  // 1. People count compatibility check
  if (
    asset.peopleCount < shot.peopleContract.min ||
    asset.peopleCount > shot.peopleContract.max
  ) {
    return {
      sourceAsset: asset.path,
      semanticMatch: 'MISMATCH',
      canUseFull: false,
      canUseCrop: false,
      reason: `People count mismatch: asset has ${asset.peopleCount}, shot requires ${shot.peopleContract.min}-${shot.peopleContract.max}`,
    };
  }

  // 2. Action or verb clash check
  const topdownRequested =
    intentLower.includes('top-down') ||
    intentLower.includes('topdown') ||
    intentLower.includes('từ trên xuống');
  const topdownSupported =
    meaningLower.includes('top-down') || meaningLower.includes('topdown');
  if (topdownRequested && !topdownSupported) {
    return {
      sourceAsset: asset.path,
      semanticMatch: 'MISMATCH',
      canUseFull: false,
      canUseCrop: false,
      reason: 'Shot demands top-down tabletop perspective but asset is not top-down',
    };
  }

  // 3. Keyword semantic overlap
  const shotWords = intentLower.split(/\s+/).filter((w) => w.length > 2);
  const matchingWords = shotWords.filter((w) => meaningLower.includes(w));
  const overlapRatio = shotWords.length > 0 ? matchingWords.length / shotWords.length : 0;

  // Check scale support
  const scaleSupported =
    asset.supportedScales?.includes(shot.scale) ??
    (shot.scale === 'MEDIUM' || shot.scale === 'WIDE');

  // Check crop support
  const cropTarget = asset.supportedCropTargets?.find(
    (c) =>
      c.kind === shot.scale ||
      (shot.scale === 'CLOSE' && c.kind === 'CLOSE') ||
      (shot.scale === 'MEDIUM' && c.kind === 'MEDIUM'),
  );

  if (overlapRatio >= 0.45 && scaleSupported) {
    return {
      sourceAsset: asset.path,
      semanticMatch: 'EXACT',
      canUseFull: true,
      canUseCrop: Boolean(cropTarget),
      reason: `High semantic alignment (${matchingWords.slice(0, 3).join(', ')})`,
    };
  }

  if (cropTarget && (overlapRatio >= 0.25 || meaningLower.includes(verbLower))) {
    return {
      sourceAsset: asset.path,
      semanticMatch: 'ACCEPTABLE',
      canUseFull: false,
      canUseCrop: true,
      reason: `Supported crop target: ${cropTarget.semanticMeaning}`,
    };
  }

  if (overlapRatio >= 0.25 && scaleSupported) {
    return {
      sourceAsset: asset.path,
      semanticMatch: 'ACCEPTABLE',
      canUseFull: true,
      canUseCrop: false,
      reason: `Moderate semantic alignment (${matchingWords.slice(0, 2).join(', ')})`,
    };
  }

  return {
    sourceAsset: asset.path,
    semanticMatch: 'MISMATCH',
    canUseFull: false,
    canUseCrop: false,
    reason: 'Semantic context or action diverges from approved asset content',
  };
}

/**
 * Resolves whether a shot can reuse an approved asset or must be a NEW_IMAGE.
 */
export function resolveAssetStrategy(
  shot: {
    scale: ShotScale;
    semanticIntent: string;
    visualVerb: string;
    peopleContract: { min: number; max: number };
    storyRole?: ShotStoryRole;
  },
  approvedAssets?: ApprovedVisualAsset[],
): {
  assetStrategy: AssetStrategy;
  sourceAsset?: string;
  cropIntent?: {
    kind: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'DETAIL';
    focalPoint?: { x: number; y: number };
    cropScale?: number;
  };
  reason: string;
} {
  if (shot.storyRole === 'outro') {
    return {
      assetStrategy: 'COMPONENT',
      reason: 'Standard outro component',
    };
  }

  if (!approvedAssets || approvedAssets.length === 0) {
    return {
      assetStrategy: 'NEW_IMAGE',
      reason: 'No approved assets available for candidate evaluation',
    };
  }

  for (const asset of approvedAssets) {
    const evalResult = evaluateAssetReuse(shot, asset);
    if (evalResult.semanticMatch === 'EXACT' && evalResult.canUseFull) {
      return {
        assetStrategy: 'REUSE_FULL',
        sourceAsset: asset.path,
        reason: evalResult.reason,
      };
    }
    if (evalResult.semanticMatch === 'ACCEPTABLE' && evalResult.canUseCrop) {
      const cropTarget = asset.supportedCropTargets?.find(
        (c) => c.kind === shot.scale,
      );
      return {
        assetStrategy: 'REUSE_CROP',
        sourceAsset: asset.path,
        cropIntent: {
          kind: cropTarget?.kind ?? 'CLOSE',
          focalPoint: cropTarget?.focalPoint ?? { x: 50, y: 35 },
          cropScale: cropTarget?.cropScale ?? 1.25,
        },
        reason: evalResult.reason,
      };
    }
    if (evalResult.semanticMatch === 'ACCEPTABLE' && evalResult.canUseFull) {
      return {
        assetStrategy: 'REUSE_FULL',
        sourceAsset: asset.path,
        reason: evalResult.reason,
      };
    }
  }

  return {
    assetStrategy: 'NEW_IMAGE',
    reason: 'No semantically matching approved asset found; requiring new image generation',
  };
}

export interface ShotGrammarMetrics {
  shotCount: number;
  durationFrames: number;
  durationSeconds: number;
  durationMinutes: number;
  changesPerMinute: number;
  uniqueScales: number;
  uniqueSilhouettes: number;
  maxHoldSeconds: number;
  medianHoldSeconds: number;
  scaleDistribution: Record<ShotScale, number>;
  silhouetteDistribution: Record<ShotSilhouette, number>;
  reuseCount: number;
  newImageCount: number;
  componentCount: number;
}

export interface ShotPlanValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
  metrics: ShotGrammarMetrics;
}

export function buildShotGrammarMetrics(shots: PlannedShot[]): ShotGrammarMetrics {
  if (!shots.length) {
    return {
      shotCount: 0,
      durationFrames: 0,
      durationSeconds: 0,
      durationMinutes: 0,
      changesPerMinute: 0,
      uniqueScales: 0,
      uniqueSilhouettes: 0,
      maxHoldSeconds: 0,
      medianHoldSeconds: 0,
      scaleDistribution: {} as Record<ShotScale, number>,
      silhouetteDistribution: {} as Record<ShotSilhouette, number>,
      reuseCount: 0,
      newImageCount: 0,
      componentCount: 0,
    };
  }

  const durationFrames = shots[shots.length - 1].endFrame - shots[0].startFrame;
  const durationSeconds = durationFrames / 30;
  const durationMinutes = durationFrames / 30 / 60;
  const changesPerMinute = shots.length / Math.max(durationMinutes, 0.001);

  const scales = new Set(shots.map((s) => s.scale));
  const silhouettes = new Set(shots.map((s) => s.silhouette));

  const holds = shots.map((s) => s.durationFrames / 30).sort((a, b) => a - b);
  const medianHoldSeconds =
    holds.length % 2 === 0
      ? (holds[holds.length / 2 - 1] + holds[holds.length / 2]) / 2
      : holds[Math.floor(holds.length / 2)];

  const scaleDistribution = {} as Record<ShotScale, number>;
  for (const s of shots) {
    scaleDistribution[s.scale] = (scaleDistribution[s.scale] || 0) + 1;
  }

  const silhouetteDistribution = {} as Record<ShotSilhouette, number>;
  for (const s of shots) {
    silhouetteDistribution[s.silhouette] = (silhouetteDistribution[s.silhouette] || 0) + 1;
  }

  const reuseCount = shots.filter(
    (s) => s.assetStrategy === 'REUSE_FULL' || s.assetStrategy === 'REUSE_CROP',
  ).length;
  const newImageCount = shots.filter((s) => s.assetStrategy === 'NEW_IMAGE').length;
  const componentCount = shots.filter((s) => s.assetStrategy === 'COMPONENT').length;

  return {
    shotCount: shots.length,
    durationFrames,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    durationMinutes: Number(durationMinutes.toFixed(3)),
    changesPerMinute: Number(changesPerMinute.toFixed(2)),
    uniqueScales: scales.size,
    uniqueSilhouettes: silhouettes.size,
    maxHoldSeconds: Number(Math.max(...holds).toFixed(2)),
    medianHoldSeconds: Number(medianHoldSeconds.toFixed(2)),
    scaleDistribution,
    silhouetteDistribution,
    reuseCount,
    newImageCount,
    componentCount,
  };
}

export function validateShotPlan(
  shots: PlannedShot[],
  options: { checkCadence?: boolean } = { checkCadence: true },
): ShotPlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!shots.length) {
    return {
      ok: false,
      errors: ['Shot plan has 0 shots.'],
      warnings: [],
      metrics: buildShotGrammarMetrics(shots),
    };
  }

  // 1. Structural and attribute validation
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];

    if (!shot.visualVerb?.trim()) {
      errors.push(`${shot.id}: missing visualVerb`);
    }

    if (!shot.semanticIntent?.trim()) {
      errors.push(`${shot.id}: missing semanticIntent`);
    }

    if (shot.durationFrames <= 0) {
      errors.push(`${shot.id}: invalid durationFrames (${shot.durationFrames})`);
    }

    if (
      shot.peopleContract.min < 0 ||
      shot.peopleContract.min > shot.peopleContract.max
    ) {
      errors.push(
        `${shot.id}: invalid people contract [min: ${shot.peopleContract.min}, max: ${shot.peopleContract.max}]`,
      );
    }

    const holdSeconds = shot.durationFrames / 30;

    // Hard constraint: Hold > 4.0s without valid exception is rejected
    if (holdSeconds > 4.0) {
      if (!isValidHoldException(shot)) {
        errors.push(`${shot.id}: hold too long (${holdSeconds.toFixed(2)}s)`);
      }
    }

    // Recommended hold ranges produce warnings only
    const recRange =
      shot.scale === 'DETAIL'
        ? REFERENCE_SHOT_GRAMMAR.holdSeconds.detail
        : shot.scale === 'CLOSE'
        ? REFERENCE_SHOT_GRAMMAR.holdSeconds.close
        : shot.scale === 'MEDIUM'
        ? REFERENCE_SHOT_GRAMMAR.holdSeconds.medium
        : shot.scale === 'WIDE'
        ? REFERENCE_SHOT_GRAMMAR.holdSeconds.wide
        : shot.scale === 'RELEASE'
        ? REFERENCE_SHOT_GRAMMAR.holdSeconds.release
        : null;

    if (recRange && !isValidHoldException(shot) && shot.storyRole !== 'outro') {
      if (holdSeconds < recRange.min || holdSeconds > recRange.max) {
        warnings.push(
          `${shot.id}: ${holdSeconds.toFixed(2)}s outside recommended ${shot.scale} range [${recRange.min}-${recRange.max}s]`,
        );
      }
    }
  }

  // 2. Timeline continuity (no gaps or overlaps)
  for (let i = 1; i < shots.length; i++) {
    const prev = shots[i - 1];
    const curr = shots[i];
    if (curr.startFrame !== prev.endFrame) {
      errors.push(
        `Timeline mismatch between ${prev.id} (end: ${prev.endFrame}) and ${curr.id} (start: ${curr.startFrame})`,
      );
    }
  }

  // 3. Consecutive scale and silhouette anti-monotony
  for (let i = 2; i < shots.length; i++) {
    if (
      shots[i - 2].scale === shots[i - 1].scale &&
      shots[i - 1].scale === shots[i].scale &&
      !shots[i].exceptionReason
    ) {
      errors.push(`${shots[i].id}: 3 consecutive ${shots[i].scale} shots`);
    }

    if (
      shots[i - 2].silhouette === shots[i - 1].silhouette &&
      shots[i - 1].silhouette === shots[i].silhouette &&
      !shots[i].exceptionReason
    ) {
      errors.push(`${shots[i].id}: 3 consecutive ${shots[i].silhouette} silhouettes`);
    }
  }

  const metrics = buildShotGrammarMetrics(shots);

  // 4. Cadence validation (18-22 changes/min)
  if (options.checkCadence && shots.length > 5) {
    if (metrics.changesPerMinute < REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.min) {
      errors.push(
        `cadence below min: ${metrics.changesPerMinute} changes/min (min: ${REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.min})`,
      );
    } else if (metrics.changesPerMinute > REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.max) {
      errors.push(
        `cadence above max: ${metrics.changesPerMinute} changes/min (max: ${REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.max})`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics,
  };
}

/**
 * Template-level image prompt builder with reusable document and timer safety rules.
 */
export function buildImagePromptForShot(
  shot: PlannedShot,
  style: {
    palette?: string;
    baseStyle?: string;
  } = {},
  brandContext?: { brandName?: string },
): string {
  const baseStyle =
    style.baseStyle ||
    'STYLE DEFAULT:\nClean 2D illustrated / cartoon style.\nHand-drawn editorial illustration.\nSimple expressive faces and readable body shapes.\nClearly illustrated, never photorealistic.';

  const palette =
    style.palette ||
    'PALETTE:\nWarm ivory and cream background.\nMuted sage clothing or accents.\nWarm medium wood.\nCharcoal / sepia linework.\nSmall restrained terracotta or amber accents.\nLow saturation.\nNo glossy surfaces.';

  const peopleContractPrompt =
    shot.peopleContract.max === 0
      ? 'VISIBLE PEOPLE:\nZero people in frame. NO human figures, NO hands, NO silhouettes. Clean unpopulated scene.'
      : shot.peopleContract.min === 1 && shot.peopleContract.max === 1
      ? 'VISIBLE PEOPLE:\nExactly one visible person. One adult. No other people.'
      : `VISIBLE PEOPLE:\n${shot.peopleContract.min} to ${shot.peopleContract.max} visible people.`;

  const scaleDetail =
    shot.scale === 'DETAIL'
      ? 'SCALE DETAIL:\nExtreme detail shot. Emphasize clean object geometry, tactile textures, clear focal object with balanced negative space.'
      : '';

  // Document text-safety rule (Section 19)
  const lowerIntent = shot.semanticIntent.toLowerCase();
  const documentSafety =
    lowerIntent.includes('sổ') ||
    lowerIntent.includes('giấy') ||
    lowerIntent.includes('sách') ||
    lowerIntent.includes('notebook') ||
    lowerIntent.includes('paper')
      ? 'DOCUMENT TEXT-SAFETY:\nAlways render blank unprinted paper slips, plain unprinted notebook pages, or blank smooth cards. Strictly NO readable receipts, NO printed letters, NO forms, NO calendar numbers, NO text, NO pseudo-text writing marks.'
      : '';

  // Timer safety rule (Section 18)
  const timerSafety =
    lowerIntent.includes('timer') ||
    lowerIntent.includes('đồng hồ') ||
    lowerIntent.includes('clock') ||
    lowerIntent.includes('cát')
      ? 'TIMER SAFETY:\nMinimal mechanical timer with simple wedge indicator. Strictly NO readable numerals, NO numbers, NO digital digits, NO brand logos or letters.'
      : '';

  const hardExclusions =
    'HARD EXCLUSIONS:\nNo photorealism, no photographic textures, no photographic lighting, no 3D render, no CGI, no camera, lens, or photographic terms, no anime or chibi, no text, no captions, no watermarks, no artist signatures, no speech bubbles, no UI elements.';

  return [
    baseStyle,
    palette,
    peopleContractPrompt,
    `SCENE:\n${shot.semanticIntent}`,
    scaleDetail,
    documentSafety,
    timerSafety,
    `FRAMING:\n${shot.composition} composition with balanced negative space.`,
    hardExclusions,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Reusable anti-monotony scale/silhouette repair.
 */
export function repairScaleMonotony(
  candidate: PlannedShot,
  previousShots: PlannedShot[],
): PlannedShot {
  if (previousShots.length < 2) return candidate;

  const p1 = previousShots[previousShots.length - 1];
  const p2 = previousShots[previousShots.length - 2];

  let scale = candidate.scale;
  let silhouette = candidate.silhouette;

  // 3rd same scale repair
  if (p1.scale === p2.scale && p1.scale === scale && !candidate.exceptionReason) {
    if (scale === 'MEDIUM') {
      scale = candidate.storyRole === 'action' ? 'DETAIL' : 'CLOSE';
    } else if (scale === 'DETAIL') {
      scale = 'MEDIUM';
    } else if (scale === 'CLOSE') {
      scale = 'MEDIUM';
    } else if (scale === 'WIDE') {
      scale = 'MEDIUM';
    } else {
      scale = 'RELEASE';
    }
  }

  // 3rd same silhouette repair
  if (
    p1.silhouette === p2.silhouette &&
    p1.silhouette === silhouette &&
    !candidate.exceptionReason
  ) {
    if (silhouette === 'single-left') silhouette = 'single-right';
    else if (silhouette === 'single-right') silhouette = 'single-centered';
    else if (silhouette === 'single-centered') silhouette = 'single-left';
    else if (silhouette === 'room-wide') silhouette = 'empty-space';
    else if (silhouette === 'empty-space') silhouette = 'room-wide';
    else if (silhouette === 'hands-detail') silhouette = 'tabletop-topdown';
    else if (silhouette === 'tabletop-topdown') silhouette = 'object-detail';
    else silhouette = 'single-centered';
  }

  return {
    ...candidate,
    scale,
    silhouette,
  };
}

/**
 * Reusable composition sanity helper (Prompt Section 10).
 * Maps scale, silhouette, and storyRole into appropriate composition preset.
 */
export function chooseCompositionForShot(
  scale: ShotScale,
  silhouette: ShotSilhouette,
  role: ShotStoryRole,
): CompositionType {
  if (scale === 'DETAIL') {
    return 'detail-insert';
  }
  if (scale === 'SYMBOLIC') {
    if (role === 'context' || silhouette === 'object-detail') {
      return 'paper';
    }
    return 'detail-insert';
  }
  if (scale === 'CLOSE') {
    return 'portrait-focus';
  }
  if (scale === 'WIDE' || scale === 'RELEASE') {
    return 'portrait-focus';
  }
  // MEDIUM
  if (silhouette === 'single-left') {
    return 'editorial-left';
  }
  if (silhouette === 'single-right') {
    return 'editorial-right';
  }
  return 'portrait-focus';
}
