/**
 * src/templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs
 *
 * HAY & ĐẸP. — Reference-Derived Story & Shot Grammar Layer.
 * Runtime source of truth for shot grammar, hold constraints, and metrics.
 */

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
};

export const VISUAL_MODES = [
  'ENVIRONMENT_WIDE',
  'INTERACTION_MEDIUM',
  'SOLO_MEDIUM',
  'REACTION_CLOSE',
  'ACTION_DETAIL',
  'OBJECT_DETAIL',
  'EMPTY_RELEASE',
  'GROUP_WIDE',
];

export const VISUAL_MODE_TO_SCALE = {
  ENVIRONMENT_WIDE: 'WIDE',
  GROUP_WIDE: 'WIDE',
  INTERACTION_MEDIUM: 'MEDIUM',
  SOLO_MEDIUM: 'MEDIUM',
  REACTION_CLOSE: 'CLOSE',
  ACTION_DETAIL: 'DETAIL',
  OBJECT_DETAIL: 'DETAIL',
  EMPTY_RELEASE: 'RELEASE',
};

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
];

export function isValidHoldException(shot) {
  if (!shot) return false;
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
      typeof ex.reason === 'string' &&
      ex.reason.trim().length >= 12 &&
      shot.storyRole !== 'action'
    );
  }

  return false;
}

export function detectVisualVerb(text) {
  if (!text) return null;
  const normalized = String(text).toLowerCase();
  for (const verb of ACTION_HINTS) {
    if (normalized.includes(verb)) {
      return verb;
    }
  }
  return null;
}

export function resolveVisualStrategy(clause, role) {
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

export function evaluateAssetReuse(shot, asset) {
  const intentLower = (shot.semanticIntent || '').toLowerCase();
  const meaningLower = (asset.sceneMeaning || '').toLowerCase();
  const verbLower = (shot.visualVerb || '').toLowerCase();

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

export function resolveAssetStrategy(shot, approvedAssets) {
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

export function buildShotGrammarMetrics(shots = []) {
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
      scaleDistribution: {},
      silhouetteDistribution: {},
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

  const scaleDistribution = {};
  for (const s of shots) {
    scaleDistribution[s.scale] = (scaleDistribution[s.scale] || 0) + 1;
  }

  const silhouetteDistribution = {};
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
  shots = [],
  options = { checkCadence: true },
) {
  const errors = [];
  const warnings = [];

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
      shot.peopleContract &&
      (shot.peopleContract.min < 0 ||
        shot.peopleContract.min > shot.peopleContract.max)
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
    if (
      shot.peopleContract &&
      !isSilhouetteCompatibleWithPeopleContract(shot.silhouette, shot.peopleContract)
    ) {
      errors.push(
        `${shot.id}: silhouette '${shot.silhouette}' is incompatible with people contract [min: ${shot.peopleContract.min}, max: ${shot.peopleContract.max}]`,
      );
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

  // 3. Consecutive scale and silhouette anti-monotony (hold exception only applies to duration > 4.0s)
  for (let i = 2; i < shots.length; i++) {
    if (
      shots[i - 2].scale === shots[i - 1].scale &&
      shots[i - 1].scale === shots[i].scale
    ) {
      errors.push(`${shots[i].id}: 3 consecutive ${shots[i].scale} shots`);
    }

    if (
      shots[i - 2].silhouette === shots[i - 1].silhouette &&
      shots[i - 1].silhouette === shots[i].silhouette
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

  // 5. Visual Mode Diversity and Semantic Integrity Gate
  const visualModes = shots.map((s) => s.visualMode).filter(Boolean);
  if (visualModes.length > 0) {
    const getFamily = (vm) => {
      if (vm === 'ENVIRONMENT_WIDE' || vm === 'GROUP_WIDE') return 'WIDE';
      if (vm === 'INTERACTION_MEDIUM' || vm === 'SOLO_MEDIUM') return 'MEDIUM';
      if (vm === 'REACTION_CLOSE') return 'CLOSE';
      if (vm === 'ACTION_DETAIL' || vm === 'OBJECT_DETAIL') return 'DETAIL';
      if (vm === 'EMPTY_RELEASE') return 'RELEASE';
      return vm;
    };
    const families = new Set(visualModes.map(getFamily));
    if (shots.length >= 10 && families.size < 4) {
      warnings.push(
        `Low visual mode diversity: only ${families.size} visual-mode families present (${Array.from(families).join(', ')}). Expected at least 4 for narrative video.`,
      );
    }

    // No > 3 consecutive INTERACTION_MEDIUM visual modes
    for (let i = 3; i < shots.length; i++) {
      if (
        shots[i - 3].visualMode === 'INTERACTION_MEDIUM' &&
        shots[i - 2].visualMode === 'INTERACTION_MEDIUM' &&
        shots[i - 1].visualMode === 'INTERACTION_MEDIUM' &&
        shots[i].visualMode === 'INTERACTION_MEDIUM'
      ) {
        errors.push(`${shots[i].id}: 4 consecutive INTERACTION_MEDIUM visual modes`);
      }
    }

    // Visual mode dominance warning (warn if one visual mode exceeds 50% of plan with >= 12 shots)
    if (shots.length >= 12) {
      const modeCounts = {};
      for (const s of shots) {
        if (s.visualMode) {
          modeCounts[s.visualMode] = (modeCounts[s.visualMode] || 0) + 1;
        }
      }
      for (const [mode, count] of Object.entries(modeCounts)) {
        if (count / shots.length > 0.5) {
          warnings.push(
            `Visual mode dominance warning: plan is dominated by single visual mode '${mode}' (${((count / shots.length) * 100).toFixed(1)}% of shots, exceeds 50% threshold for >=12 shots)`,
          );
        }
      }
    }

    // Strict visualMode ↔ scale invariant
    for (let i = 0; i < shots.length; i++) {
      const s = shots[i];
      if (s.visualMode) {
        const expectedScale = VISUAL_MODE_TO_SCALE[s.visualMode];
        if (expectedScale && s.scale !== expectedScale) {
          errors.push(
            `${s.id}: visualMode '${s.visualMode}' expects scale '${expectedScale}', but got '${s.scale}'`,
          );
        }
      }
    }
  }

  // Contract checks for specific modes / scales
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const contract = s.visiblePeopleContract || s.peopleContract;
    if (s.visualMode === 'EMPTY_RELEASE' || (s.scale === 'RELEASE' && s.storyRole === 'release')) {
      if (contract && contract.max > 0) {
        errors.push(`${s.id}: EMPTY_RELEASE must have visiblePeopleContract = 0..0, got max ${contract.max}`);
      }
    }
    if (s.visualMode === 'REACTION_CLOSE' || (s.scale === 'CLOSE' && s.storyRole === 'reflection')) {
      if (contract && contract.max > 1) {
        warnings.push(`${s.id}: REACTION_CLOSE should normally have <=1 primary visible person, got max ${contract.max}`);
      }
    }
    if (s.visualMode === 'ACTION_DETAIL' || s.visualMode === 'OBJECT_DETAIL' || s.scale === 'DETAIL') {
      if (s.silhouette && s.silhouette.startsWith('two-person')) {
        errors.push(`${s.id}: DETAIL cannot render as generic full two-person sofa conversation`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics,
  };
}

export function buildImagePromptForShot(
  shot,
  style = {},
  brandContext,
) {
  const baseStyle =
    style.baseStyle ||
    [
      'STYLE LOCK — HAY & ĐẸP.:',
      'Clearly hand-drawn 2D editorial illustration.',
      'Obvious charcoal/sepia outline around characters, hands, furniture and objects.',
      'Simplified facial features.',
      'Simplified grouped hair shapes, NOT individual realistic hair strands.',
      'Matte painted / flat gouache-like color fills.',
      'Soft simplified illustrated shadows.',
      'Warm ivory / cream background.',
      'Muted sage, warm wood and restrained terracotta accents.',
      'Calm contemporary editorial-cartoon look.',
      'Readable anatomy, simple clean forms.',
      'The result must unmistakably look DRAWN / ILLUSTRATED, not photographed.',
    ].join('\n');

  const palette =
    style.palette ||
    'PALETTE:\nWarm ivory and cream background.\nMuted sage clothing or accents.\nWarm medium wood.\nCharcoal / sepia linework.\nSmall restrained terracotta or amber accents.\nLow saturation.\nNo glossy surfaces.';

  const contract = shot.visiblePeopleContract || shot.peopleContract;
  const isZeroPeople =
    contract?.max === 0 ||
    (Array.isArray(shot.visibleMembers) && shot.visibleMembers.length === 0) ||
    shot.visualMode === 'EMPTY_RELEASE' ||
    shot.visualMode === 'OBJECT_DETAIL';

  const peopleContractPrompt = isZeroPeople
    ? 'VISIBLE PEOPLE:\nZero people in frame. NO human figures, NO hands, NO silhouettes, NO faces. Clean unpopulated scene.'
    : contract?.min === 1 && contract?.max === 1
    ? 'VISIBLE PEOPLE:\nExactly one visible person. One adult. Minimal secondary background presence.'
    : `VISIBLE PEOPLE:\n${contract?.min ?? 0} to ${contract?.max ?? 2} visible people.`;

  const rawScale = shot.scale || 'MEDIUM';
  let scaleContract = '';
  if (rawScale === 'WIDE' || shot.visualMode === 'ENVIRONMENT_WIDE' || shot.visualMode === 'GROUP_WIDE') {
    scaleContract = 'SCALE: WIDE ENVIRONMENTAL ILLUSTRATION.\nShow substantial room context.\nEnvironment occupies roughly half or more of the visual composition.\nPeople are smaller in frame.\nDo not crop tightly around faces.';
  } else if (rawScale === 'MEDIUM' || shot.visualMode === 'INTERACTION_MEDIUM') {
    scaleContract = 'SCALE: MEDIUM INTERACTION ILLUSTRATION.\nShow upper/lower torso as needed plus the physical action.\nEnough environment to understand the context.';
  } else if (rawScale === 'CLOSE' || shot.visualMode === 'REACTION_CLOSE') {
    scaleContract = 'SCALE: CLOSE REACTION ILLUSTRATION.\nOne primary face / shoulders / hands dominates the frame.\nMinimal environment.\nDo NOT fall back to a full two-person sofa composition.';
  } else if (rawScale === 'DETAIL' || shot.visualMode === 'ACTION_DETAIL' || shot.visualMode === 'OBJECT_DETAIL') {
    scaleContract = 'SCALE: DETAIL INSERT.\nThe object or hand action dominates at least ~60% of visual attention.\nNo full seated two-person composition.\nDo not show both full faces.';
  } else if (rawScale === 'RELEASE' || shot.visualMode === 'EMPTY_RELEASE') {
    scaleContract = 'SCALE: RELEASE / BREATHING FRAME.\nQuiet environmental visual.\nWhen peopleContract = 0..0: absolutely no people, hands or body parts.';
  }

  // Document text-safety rule
  const lowerIntent = (shot.semanticIntent || '').toLowerCase();
  const documentSafety =
    lowerIntent.includes('sổ') ||
    lowerIntent.includes('giấy') ||
    lowerIntent.includes('sách') ||
    lowerIntent.includes('notebook') ||
    lowerIntent.includes('paper')
      ? 'DOCUMENT TEXT-SAFETY:\nAlways render blank unprinted paper slips, plain unprinted notebook pages, or blank smooth cards. Strictly NO readable receipts, NO printed letters, NO forms, NO calendar numbers, NO text, NO pseudo-text writing marks.'
      : '';

  // Timer safety rule
  const timerSafety =
    lowerIntent.includes('timer') ||
    lowerIntent.includes('đồng hồ') ||
    lowerIntent.includes('clock') ||
    lowerIntent.includes('cát')
      ? 'TIMER SAFETY:\nMinimal mechanical timer with simple wedge indicator. Strictly NO readable numerals, NO numbers, NO digital digits, NO brand logos or letters.'
      : '';

  const hardExclusions = [
    'HARD EXCLUSIONS:',
    'NO photorealism.',
    'NO hyperrealism.',
    'NO realistic skin texture or pores.',
    'NO individual realistic hair strands.',
    'NO photographic rendering.',
    'NO cinematic photographic lighting.',
    'NO realistic lens blur.',
    'NO glossy 3D skin.',
    'NO CGI.',
    'NO photo-like human faces.',
    'NO camera, lens, or photographic terms.',
    'NO 3D render.',
    'NO anime or chibi.',
    'NO text, NO captions, NO watermarks, NO artist signatures, NO speech bubbles, NO UI elements.',
  ].join('\n');

  return [
    baseStyle,
    palette,
    scaleContract,
    peopleContractPrompt,
    `SCENE:\n${shot.semanticIntent}`,
    documentSafety,
    timerSafety,
    `FRAMING:\n${shot.composition} composition with balanced negative space.`,
    hardExclusions,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function deriveVisualMode({
  role = 'action',
  scale = 'MEDIUM',
  text = '',
  visualVerb = '',
  peopleContract = null,
  isHook = false,
  isEnding = false,
  contentMode = '',
} = {}) {
  const normText = String(text || '').toLowerCase();
  const normVerb = String(visualVerb || '').toLowerCase();

  if (role === 'release' || role === 'outro') {
    return 'EMPTY_RELEASE';
  }

  if (isEnding && role !== 'question') {
    return 'EMPTY_RELEASE';
  }

  const TACTILE_ITEMS = ['đặt', 'rót', 'lau', 'gấp', 'gập', 'cất', 'mở', 'đóng', 'chạm', 'viết', 'xếp', 'mâm cơm', 'bát cơm', 'đũa', 'điện thoại', 'phone', 'trang sách'];
  const isTactileItem = TACTILE_ITEMS.some((v) => normVerb.includes(v) || normText.includes(v));

  if (role === 'detail' || normVerb === 'detail-action' || isTactileItem) {
    if (peopleContract && peopleContract.max === 0) {
      return 'OBJECT_DETAIL';
    }
    return 'ACTION_DETAIL';
  }

  if (role === 'question') {
    if (scale === 'WIDE' || normText.includes('khi bạn mệt') || normText.includes('giải pháp') || isEnding) {
      return 'ENVIRONMENT_WIDE';
    }
    return 'REACTION_CLOSE';
  }

  if (role === 'reflection' || role === 'memory') {
    return 'REACTION_CLOSE';
  }

  if (isHook || role === 'establish') {
    if (contentMode === 'family-emotional' && peopleContract && peopleContract.min >= 3) {
      return 'GROUP_WIDE';
    }
    return 'ENVIRONMENT_WIDE';
  }

  if (scale === 'WIDE') {
    return (peopleContract && peopleContract.min >= 3) ? 'GROUP_WIDE' : 'ENVIRONMENT_WIDE';
  }

  if (scale === 'CLOSE') {
    return 'REACTION_CLOSE';
  }

  if (scale === 'DETAIL') {
    return (peopleContract && peopleContract.max === 0) ? 'OBJECT_DETAIL' : 'ACTION_DETAIL';
  }

  if (scale === 'RELEASE') {
    return 'EMPTY_RELEASE';
  }

  if (scale === 'MEDIUM') {
    if (peopleContract && peopleContract.max <= 1) {
      return 'SOLO_MEDIUM';
    }
    return 'INTERACTION_MEDIUM';
  }

  if (peopleContract && peopleContract.max <= 1) {
    return 'SOLO_MEDIUM';
  }

  return 'INTERACTION_MEDIUM';
}

export function validateVisibleRoleContract({ visibleMembers, visualAction, peopleContract } = {}) {
  const members = Array.isArray(visibleMembers) ? visibleMembers : [];
  const actionLower = String(visualAction || '').toLowerCase();
  let roleMismatch = false;
  let reason = null;

  const knownRoles = ['speaker', 'listener'];
  for (const role of knownRoles) {
    const roleRegex = new RegExp(`\\b${role}\\b`, 'i');
    if (roleRegex.test(actionLower)) {
      const isNegative =
        actionLower.includes(`no ${role}`) ||
        actionLower.includes(`without ${role}`) ||
        actionLower.includes(`${role} off-camera`) ||
        actionLower.includes(`${role} is absent`) ||
        actionLower.includes(`${role} not visible`) ||
        actionLower.includes(`other participant completely absent`) ||
        actionLower.includes(`no second`);
      if (!isNegative && !members.includes(role)) {
        roleMismatch = true;
        reason = `visualAction instructs role '${role}', but '${role}' is not in visibleMembers [${members.join(', ')}]`;
        break;
      }
    }
  }

  if (!roleMismatch && peopleContract) {
    if (typeof peopleContract.max === 'number' && members.length > peopleContract.max) {
      roleMismatch = true;
      reason = `visibleMembers count (${members.length}) exceeds peopleContract.max (${peopleContract.max})`;
    }
  }

  return {
    valid: !roleMismatch,
    roleMismatch,
    reason,
  };
}

export function validateFinalImagePromptContract({
  prompt,
  visualMode,
  peopleContract,
  visibleMembers,
  visualVerb,
} = {}) {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Empty or non-string prompt' };
  }

  const contract = peopleContract || { min: 0, max: 2 };
  const min = contract.min ?? 0;
  const max = contract.max ?? 2;
  const isZeroPeople = max === 0 || (min === 0 && max === 0) || visualMode === 'EMPTY_RELEASE' || visualMode === 'OBJECT_DETAIL';

  // Extract positive prompt part before NEGATIVE EXCLUSIONS / HARD EXCLUSIONS
  const negMatch = prompt.search(/NEGATIVE EXCLUSIONS:|NEGATIVE:|HARD EXCLUSIONS:/i);
  const positivePrompt = negMatch !== -1 ? prompt.slice(0, negMatch) : prompt;
  const posLower = positivePrompt.toLowerCase();

  // 1. Zero-people check
  if (isZeroPeople) {
    const forbidden = [
      'người khác', 'người thân', 'người nghe', 'người đang kể', 'speaker', 'listener',
      'person', 'people', 'human', 'face', 'hands', 'hand', 'arm', 'arms', 'body', 'woman', 'man',
      'two-person', 'two people', 'portrait'
    ];
    for (const term of forbidden) {
      if (term === 'face') {
        const withoutFaceDown = posLower.replace(/face-down|face down|screen down/g, '');
        if (!new RegExp(`\\b${term}\\b`, 'i').test(withoutFaceDown)) {
          continue;
        }
      }
      if (term === 'hand') {
        const withoutHandDrawn = posLower.replace(/hand-drawn|hand drawn/g, '');
        if (!new RegExp(`\\b${term}\\b`, 'i').test(withoutHandDrawn)) {
          continue;
        }
      }
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(posLower)) {
        const isNegated =
          posLower.includes(`no ${term}`) ||
          posLower.includes(`zero ${term}`) ||
          posLower.includes(`without ${term}`) ||
          posLower.includes(`no visible ${term}`) ||
          posLower.includes(`zero visible ${term}`) ||
          posLower.includes(`no framed portraits/photos containing people`) ||
          posLower.includes(`or ${term} parts`) ||
          posLower.includes(`or body parts`) ||
          posLower.includes(`people/body parts`);
        if (!isNegated) {
          return {
            valid: false,
            error: `PROMPT_CONTRACT_BLOCKED: Zero-people prompt positively contains '${term}'`,
          };
        }
      }
    }
  }

  // 2. Exact-one people check
  if (min === 1 && max === 1) {
    const multiTerms = [
      'two people', 'both people', 'two-person', 'speaker and listener',
      'the other person is visible', 'two faces', 'both full faces', 'two persons'
    ];
    for (const term of multiTerms) {
      if (posLower.includes(term)) {
        const isNegated =
          posLower.includes(`no ${term}`) ||
          posLower.includes(`no full ${term}`) ||
          posLower.includes(`without ${term}`) ||
          posLower.includes(`not ${term}`);
        if (!isNegated) {
          return {
            valid: false,
            error: `PROMPT_CONTRACT_BLOCKED: Exact-one prompt positively instructs multiple people: '${term}'`,
          };
        }
      }
    }

    if (Array.isArray(visibleMembers) && visibleMembers.length > 1) {
      return {
        valid: false,
        error: `PROMPT_CONTRACT_BLOCKED: Exact-one prompt has visibleMembers count ${visibleMembers.length} > 1`,
      };
    }
  }

  // 3. Phone put away check
  if (visualVerb === 'đặt' || posLower.includes('face-down') || posLower.includes('put away') || posLower.includes('đặt điện thoại')) {
    const forbiddenHold = ['visibly holding', 'holding the phone', 'gripping the phone', 'phone in hand', 'cầm điện thoại'];
    for (const holdTerm of forbiddenHold) {
      if (posLower.includes(holdTerm)) {
        const isNegated = posLower.includes(`not ${holdTerm}`) || posLower.includes(`no ${holdTerm}`);
        if (!isNegated) {
          return {
            valid: false,
            error: `PROMPT_CONTRACT_BLOCKED: Action instructs '${holdTerm}' when phone must be placed down`,
          };
        }
      }
    }
  }

  // 4. Text pollution check in positive instructions
  const forbiddenText = ['speech bubble', 'speech bubbles', 'dialogue balloon', 'dialogue balloons', 'thought bubble', 'quotation text'];
  for (const t of forbiddenText) {
    if (posLower.includes(t)) {
      const isNegated = posLower.includes(`no ${t}`) || posLower.includes(`without ${t}`) || posLower.includes(`zero ${t}`);
      if (!isNegated) {
        return {
          valid: false,
          error: `PROMPT_CONTRACT_BLOCKED: Positive prompt instructs '${t}'`,
        };
      }
    }
  }

  return { valid: true };
}

export function validateActionPromptContract({
  visualMode,
  visiblePeopleContract,
  visibleMembers,
  visualAction,
  semanticIntent,
  prompt,
  visualVerb,
}) {
  const contract = visiblePeopleContract || { min: 0, max: 2 };
  const min = contract.min ?? 0;
  const max = contract.max ?? 2;
  const isZeroPeople = max === 0 || (min === 0 && max === 0) || visualMode === 'EMPTY_RELEASE' || visualMode === 'OBJECT_DETAIL';

  let peopleContradiction = false;
  let actionContradiction = false;
  let contradictionReason = null;

  if (isZeroPeople) {
    const forbiddenTerms = ['speaker', 'listener', 'person', 'people', 'hands', 'face', 'two people', 'two-person', 'human'];
    const actionLower = String(visualAction || '').toLowerCase();
    const intentLower = String(semanticIntent || '').toLowerCase();

    for (const term of forbiddenTerms) {
      if (term === 'face' && (actionLower.includes('face-down') || actionLower.includes('face down') || actionLower.includes('screen down'))) {
        continue;
      }
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(actionLower)) {
        if (
          !actionLower.includes(`no ${term}`) &&
          !actionLower.includes(`without ${term}`) &&
          !actionLower.includes(`zero ${term}`) &&
          !actionLower.includes(`no visible ${term}`) &&
          !actionLower.includes(`zero visible ${term}`)
        ) {
          peopleContradiction = true;
          contradictionReason = `Zero-people beat visualAction instructs: "${term}"`;
          break;
        }
      }
      if (regex.test(intentLower)) {
        if (term === 'face' && (intentLower.includes('face-down') || intentLower.includes('face down') || intentLower.includes('screen down'))) {
          continue;
        }
        if (
          !intentLower.includes(`no ${term}`) &&
          !intentLower.includes(`without ${term}`) &&
          !intentLower.includes(`zero ${term}`) &&
          !intentLower.includes(`no visible ${term}`) &&
          !intentLower.includes(`zero visible ${term}`)
        ) {
          if (!peopleContradiction) {
            peopleContradiction = true;
            contradictionReason = `Zero-people beat semanticIntent instructs: "${term}"`;
            break;
          }
        }
      }
    }
  }

  // Exact-one people check on visualAction
  if (min === 1 && max === 1) {
    const actionLower = String(visualAction || '').toLowerCase();
    const multiTerms = ['two people', 'both people', 'two-person', 'speaker and listener', 'the other person is visible', 'two faces'];
    for (const term of multiTerms) {
      if (actionLower.includes(term)) {
        const isNegated =
          actionLower.includes(`no ${term}`) ||
          actionLower.includes(`without ${term}`) ||
          actionLower.includes(`not ${term}`);
        if (!isNegated) {
          peopleContradiction = true;
          contradictionReason = `Exact-one beat visualAction instructs: "${term}"`;
          break;
        }
      }
    }
  }

  // Visible role consistency check
  const roleCheck = validateVisibleRoleContract({ visibleMembers, visualAction, peopleContract: contract });
  if (!roleCheck.valid) {
    peopleContradiction = true;
    contradictionReason = roleCheck.reason;
  }

  // Check concrete verb evidence:
  // If verb is "đặt" or text mentions putting phone down, visualAction cannot instruct holding phone
  const actionLower = String(visualAction || '').toLowerCase();
  if (
    (visualVerb === 'đặt' || actionLower.includes('đặt') || actionLower.includes('phone down') || actionLower.includes('face-down')) &&
    (actionLower.includes('visibly holding') || actionLower.includes('holding the phone') || actionLower.includes('cầm điện thoại') || actionLower.includes('gripping the phone'))
  ) {
    actionContradiction = true;
    contradictionReason = 'Action instructs holding phone when verb requires putting phone down';
  }

  return {
    peopleContradiction,
    actionContradiction,
    roleMismatch: roleCheck.roleMismatch,
    contradictionReason,
  };
}

export function validateObjectDetailContract({
  visualMode,
  scale,
  shotScale,
  visibleMembers,
  peopleContract,
  visiblePeopleContract,
  silhouette,
  prompt,
} = {}) {
  const isObjDetail =
    visualMode === 'OBJECT_DETAIL' ||
    silhouette === 'object-detail';

  if (!isObjDetail) {
    return { valid: true };
  }

  const errors = [];

  const actualScale = (scale || shotScale || '').toUpperCase();
  if (actualScale && actualScale !== 'DETAIL') {
    errors.push(`OBJECT_DETAIL scale must be DETAIL, got '${scale || shotScale}'`);
  }

  const pContract = peopleContract || visiblePeopleContract;
  if (pContract) {
    if (pContract.min !== 0 || pContract.max !== 0) {
      errors.push(`OBJECT_DETAIL peopleContract must be { min: 0, max: 0 }, got min:${pContract.min}, max:${pContract.max}`);
    }
  }
  if (visiblePeopleContract) {
    if (visiblePeopleContract.min !== 0 || visiblePeopleContract.max !== 0) {
      errors.push(`OBJECT_DETAIL visiblePeopleContract must be { min: 0, max: 0 }, got min:${visiblePeopleContract.min}, max:${visiblePeopleContract.max}`);
    }
  }

  if (Array.isArray(visibleMembers) && visibleMembers.length > 0) {
    errors.push(`OBJECT_DETAIL visibleMembers must be empty, got [${visibleMembers.join(', ')}]`);
  }

  if (silhouette && silhouette !== 'object-detail') {
    errors.push(`OBJECT_DETAIL silhouette must be 'object-detail', got '${silhouette}'`);
  }

  if (prompt && typeof prompt === 'string') {
    const negMatch = prompt.search(/NEGATIVE EXCLUSIONS:|NEGATIVE:|HARD EXCLUSIONS:/i);
    const positivePrompt = negMatch !== -1 ? prompt.slice(0, negMatch) : prompt;
    const posLower = positivePrompt.toLowerCase();

    const forbidden = [
      'hand', 'hands', 'face', 'person', 'people', 'portrait', 'human reflection',
      'human', 'speaker', 'listener', 'man', 'woman', 'body'
    ];
    for (const term of forbidden) {
      if (term === 'face') {
        const withoutFaceDown = posLower.replace(/face-down|face down|screen down/g, '');
        if (!new RegExp(`\\b${term}\\b`, 'i').test(withoutFaceDown)) {
          continue;
        }
      }
      if (term === 'hand') {
        const withoutHandDrawn = posLower.replace(/hand-drawn|hand drawn/g, '');
        if (!new RegExp(`\\b${term}\\b`, 'i').test(withoutHandDrawn)) {
          continue;
        }
      }
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(posLower)) {
        const isNegated =
          posLower.includes(`no ${term}`) ||
          posLower.includes(`zero ${term}`) ||
          posLower.includes(`without ${term}`) ||
          posLower.includes(`no visible ${term}`) ||
          posLower.includes(`zero visible ${term}`) ||
          posLower.includes(`no framed portraits/photos containing people`) ||
          posLower.includes(`or ${term} parts`) ||
          posLower.includes(`or body parts`) ||
          posLower.includes(`people/body parts`);
        if (!isNegated) {
          errors.push(`OBJECT_DETAIL positive prompt contains '${term}'`);
          break;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    error: errors.length > 0 ? errors.join('; ') : null,
  };
}

export function isSilhouetteCompatibleWithPeopleContract(silhouette, peopleContract) {
  if (!peopleContract) return true;
  const { min = 0, max = 2 } = peopleContract;
  const s = String(silhouette || '').toLowerCase();

  const isZeroPerson =
    s === 'empty-space' ||
    s === 'object-detail' ||
    s === 'tabletop-topdown';

  const isSinglePerson =
    s.startsWith('single-') ||
    s === 'face-close' ||
    s === 'hands-detail' ||
    s === 'room-wide';

  const isMultiPerson2 =
    s === 'two-person' ||
    s === 'two-person-wide' ||
    s === 'two-person-balanced' ||
    s === 'two-person-offset' ||
    s === 'two-person-over-shoulder';

  const isMultiPerson3 =
    s === 'three-person' ||
    s === 'family-group';

  const isGroup4Plus =
    s === 'family-group' ||
    s === 'group';

  if (max === 0) {
    return isZeroPerson;
  }

  if (min === 1 && max === 1) {
    return isSinglePerson;
  }

  if (min === 2 && max === 2) {
    return isMultiPerson2;
  }

  if (min === 3 && max === 3) {
    return isMultiPerson3;
  }

  if (min >= 4) {
    return isGroup4Plus;
  }

  if (min <= 1 && max >= 2) {
    return isSinglePerson || isMultiPerson2 || isMultiPerson3 || isGroup4Plus;
  }

  return true;
}

export function buildImageSafetyRulesForShot(shot = {}) {
  const text = [
    shot.semanticIntent,
    shot.visualIntent,
    shot.action,
    shot.visual,
    shot.text,
    shot.voiceClause,
    shot.audioText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const rules = [];

  const hasDoc =
    text.includes('sổ') ||
    text.includes('giấy') ||
    text.includes('sách') ||
    text.includes('notebook') ||
    text.includes('paper') ||
    text.includes('trang sách') ||
    text.includes('cuốn sổ');

  if (hasDoc) {
    rules.push(
      'DOCUMENT TEXT-SAFETY:\nAlways render blank unprinted paper slips, plain unprinted notebook pages, or blank smooth cards. Strictly NO readable receipts, NO printed letters, NO forms, NO calendar numbers, NO text, NO pseudo-text writing marks.',
    );
  }

  const hasTimer =
    text.includes('timer') ||
    text.includes('đồng hồ') ||
    text.includes('clock') ||
    text.includes('cát') ||
    text.includes('phút') ||
    text.includes('thời gian');

  if (hasTimer) {
    rules.push(
      'TIMER / CLOCK SAFETY (TIMER SAFETY):\nMinimal mechanical timer with simple wedge indicator. Strictly NO readable numerals, NO numbers, NO digital digits, NO brand logos or letters.',
    );
  }

  return rules;
}

export function mapPlannerScaleToRendererScale(options = {}) {
  const scale = typeof options === 'string' ? options : options?.scale;
  const silhouette = typeof options === 'string' ? undefined : options?.silhouette;
  const role = typeof options === 'string' ? undefined : options?.role;
  const s = String(scale || '').toUpperCase();
  if (s === 'DETAIL') return 'detail';
  if (s === 'CLOSE') return 'close';
  if (s === 'WIDE') return 'wide';
  if (s === 'MEDIUM') return 'medium';
  if (s === 'RELEASE') return 'wide';
  if (s === 'SYMBOLIC') {
    const sil = String(silhouette || '').toLowerCase();
    if (
      sil === 'hands-detail' ||
      sil === 'object-detail' ||
      sil === 'tabletop-topdown'
    ) {
      return 'detail';
    }
    return 'medium';
  }
  return 'medium';
}

export function choosePlannerScale({
  role = 'action',
  text = '',
  visualVerb = '',
  peopleContract = null,
  isStatement = false,
  isHook = false,
  isEnding = false,
} = {}) {
  const normText = String(text || '').toLowerCase();
  const normVerb = String(visualVerb || '').toLowerCase();

  // 1. Ending, release, or outro -> RELEASE
  if (isEnding || role === 'release' || role === 'outro') {
    return 'RELEASE';
  }

  // 2. Statement card or introspective question -> CLOSE
  if (isStatement || role === 'question') {
    return 'CLOSE';
  }

  // 3. Memory -> SYMBOLIC
  if (role === 'memory') {
    return 'SYMBOLIC';
  }

  // 4. Physical tactile object or hand action -> DETAIL
  const TACTILE_KEYWORDS = [
    'chìa khóa', 'cốc trà', 'tách trà', 'trang sách', 'cuốn sổ', 'bút',
    'ngăn kéo', 'bàn', 'điện thoại', 'đồng hồ', 'đôi đũa', 'bát cơm',
    'gắp', 'xới', 'gấp chăn', 'rót nước', 'lau bàn', 'cất đồ', 'cất',
  ];
  const isTactileObject = TACTILE_KEYWORDS.some((kw) => normText.includes(kw));

  const TACTILE_VERBS = [
    'đặt', 'rót', 'lau', 'gấp', 'gập', 'cất', 'mở', 'đóng', 'chạm', 'viết', 'xếp', 'gắp', 'xới',
  ];
  const isTactileVerb = TACTILE_VERBS.some(
    (v) => normVerb.includes(v) || normText.includes(v),
  );

  if (role === 'detail' || normVerb === 'detail-action' || isTactileObject || isTactileVerb) {
    return 'DETAIL';
  }

  // 5. Emotional reflection / intimate reaction -> CLOSE
  const EMOTION_KEYWORDS = [
    'suy ngẫm', 'nhìn lại', 'tự hỏi', 'thở dài', 'thở phào', 'mỉm cười', 'lo lắng', 'buồn', 'băn khoăn', 'cảm giác',
  ];
  if (role === 'reflection' || EMOTION_KEYWORDS.some((kw) => normText.includes(kw))) {
    return 'CLOSE';
  }

  // 6. Environment, arrival, spatial orientation, opening hook -> WIDE
  const SPATIAL_KEYWORDS = [
    'căn nhà', 'căn phòng', 'bước vào', 'đi về', 'ngôi nhà', 'không gian',
  ];
  if (role === 'establish' || isHook || SPATIAL_KEYWORDS.some((kw) => normText.includes(kw))) {
    return 'WIDE';
  }

  // 7. Human exchange / interaction -> MEDIUM
  if (role === 'interaction' || (peopleContract && peopleContract.min >= 2)) {
    return 'MEDIUM';
  }

  // Default narrative baseline -> MEDIUM
  return 'MEDIUM';
}

export function repairScaleMonotony(
  candidate,
  previousShots,
) {
  if (Array.isArray(candidate) && !previousShots) {
    const shots = candidate;
    const result = [];
    for (let i = 0; i < shots.length; i++) {
      result.push(repairScaleMonotony(shots[i], result));
    }
    return result;
  }

  if (!previousShots || previousShots.length < 2) return candidate;

  const p1 = previousShots[previousShots.length - 1];
  const p2 = previousShots[previousShots.length - 2];

  let scale = candidate.scale;
  let silhouette = candidate.silhouette;

  // 3rd same scale repair (hold exception only applies to duration > 4.0s, never scale monotony)
  if (p1.scale === p2.scale && p1.scale === scale) {
    if (scale === 'MEDIUM') {
      scale = candidate.storyRole === 'action' ? 'DETAIL' : 'CLOSE';
    } else if (scale === 'DETAIL') {
      // Semantic-protected monotony: OBJECT_DETAIL and ACTION_DETAIL must NOT change scale
      // just to satisfy anti-monotony. Semantic meaning > scale diversity.
      // If 3 DETAILs occur consecutively, keep scale = 'DETAIL' and vary silhouette/composition.
      scale = 'DETAIL';
    } else if (scale === 'CLOSE') {
      scale = 'MEDIUM';
    } else if (scale === 'WIDE') {
      scale = 'MEDIUM';
    } else {
      scale = 'RELEASE';
    }
  }

  // 3rd same silhouette repair (hold exception only applies to duration > 4.0s, never silhouette monotony)
  if (p1.silhouette === p2.silhouette && p1.silhouette === silhouette) {
    if (scale === 'DETAIL') {
      if (candidate.visualMode === 'OBJECT_DETAIL' || candidate.silhouette === 'object-detail' || candidate.peopleContract?.max === 0) {
        silhouette = 'object-detail';
      } else {
        silhouette = silhouette === 'hands-detail' ? 'tabletop-topdown' : 'hands-detail';
      }
    } else if (candidate.peopleContract && candidate.peopleContract.min >= 2) {
      if (silhouette === 'two-person') silhouette = 'two-person-wide';
      else if (silhouette === 'two-person-wide') silhouette = 'two-person-balanced';
      else if (silhouette === 'two-person-balanced') silhouette = 'two-person-offset';
      else if (silhouette === 'two-person-offset') silhouette = 'two-person-over-shoulder';
      else silhouette = 'two-person';
    } else if (silhouette === 'single-left') {
      silhouette = 'single-right';
    } else if (silhouette === 'single-right') {
      silhouette = 'single-centered';
    } else if (silhouette === 'single-centered') {
      silhouette = 'single-left';
    } else if (silhouette === 'room-wide') {
      silhouette = 'empty-space';
    } else if (silhouette === 'empty-space') {
      silhouette = 'room-wide';
    } else if (silhouette === 'hands-detail') {
      silhouette = 'tabletop-topdown';
    } else if (silhouette === 'tabletop-topdown') {
      silhouette = 'hands-detail';
    } else if (silhouette === 'object-detail') {
      silhouette = 'object-detail';
    } else {
      silhouette =
        candidate.peopleContract?.max === 0 ? 'empty-space' : 'single-centered';
    }
  }

  let composition = candidate.composition;
  if (scale === 'DETAIL' && p1.scale === 'DETAIL' && p2.scale === 'DETAIL') {
    if (candidate.visualMode === 'OBJECT_DETAIL' || candidate.silhouette === 'object-detail' || candidate.peopleContract?.max === 0) {
      composition = (p1.composition === 'macro-detail' || p2.composition === 'macro-detail') ? 'detail-insert' : 'macro-detail';
    } else {
      composition = (p1.composition === 'tabletop-topdown' || p2.composition === 'tabletop-topdown') ? 'detail-insert' : 'tabletop-topdown';
    }
  }

  let peopleContract = candidate.peopleContract;
  let visiblePeopleContract = candidate.visiblePeopleContract;
  let visibleMembers = candidate.visibleMembers;

  let visualMode = candidate.visualMode;

  if (scale === 'DETAIL') {
    const isObjDetail =
      candidate.visualMode === 'OBJECT_DETAIL' ||
      candidate.peopleContract?.max === 0 ||
      candidate.visiblePeopleContract?.max === 0 ||
      candidate.silhouette === 'object-detail' ||
      (Array.isArray(candidate.visibleMembers) && candidate.visibleMembers.length === 0);

    if (isObjDetail) {
      visualMode = 'OBJECT_DETAIL';
      silhouette = 'object-detail';
      peopleContract = { min: 0, max: 0 };
      visiblePeopleContract = { min: 0, max: 0 };
      visibleMembers = [];
    } else {
      visualMode = 'ACTION_DETAIL';
      if (silhouette !== 'hands-detail' && silhouette !== 'tabletop-topdown') {
        silhouette = p1?.silhouette === 'hands-detail' ? 'tabletop-topdown' : 'hands-detail';
      } else if (p1?.silhouette === silhouette && p2?.silhouette === silhouette) {
        silhouette = silhouette === 'hands-detail' ? 'tabletop-topdown' : 'hands-detail';
      }
      peopleContract = candidate.peopleContract?.max === 1 ? candidate.peopleContract : { min: 0, max: 1 };
      visiblePeopleContract = candidate.visiblePeopleContract?.max === 1 ? candidate.visiblePeopleContract : { min: 0, max: 1 };
      if (visibleMembers && visibleMembers.length > 1) {
        visibleMembers = visibleMembers.slice(0, 1);
      }
    }
  } else if (scale === 'CLOSE') {
    if (silhouette && (silhouette.includes('two-person') || silhouette.includes('family'))) {
      silhouette = p1?.silhouette === 'single-centered' ? 'single-left' : 'single-centered';
    } else if (p1?.silhouette === silhouette && p2?.silhouette === silhouette) {
      silhouette = silhouette === 'single-centered' ? 'single-left' : 'face-close';
    }
    peopleContract = { min: 1, max: 1 };
    visiblePeopleContract = { min: 1, max: 1 };
    if (visibleMembers && visibleMembers.length > 1) {
      visibleMembers = visibleMembers.slice(0, 1);
    }
    visualMode = 'REACTION_CLOSE';
  } else if (scale === 'MEDIUM') {
    if (visiblePeopleContract?.max === 1 || (visibleMembers && visibleMembers.length === 1)) {
      visualMode = 'SOLO_MEDIUM';
    } else {
      visualMode = 'INTERACTION_MEDIUM';
    }
  } else if (scale === 'WIDE') {
    visualMode = (peopleContract?.min >= 3) ? 'GROUP_WIDE' : 'ENVIRONMENT_WIDE';
  } else if (scale === 'RELEASE') {
    visualMode = 'EMPTY_RELEASE';
    peopleContract = { min: 0, max: 0 };
    visiblePeopleContract = { min: 0, max: 0 };
    visibleMembers = [];
    silhouette = 'empty-space';
  }

  // Guarantee people contract compatibility
  if (
    !isSilhouetteCompatibleWithPeopleContract(
      silhouette,
      peopleContract,
    )
  ) {
    if (peopleContract?.min >= 4) {
      silhouette = 'family-group';
    } else if (peopleContract?.min === 3) {
      silhouette = 'three-person';
    } else if (peopleContract?.min >= 2) {
      silhouette = 'two-person-balanced';
    } else if (peopleContract?.max === 0) {
      silhouette = scale === 'DETAIL' ? 'object-detail' : 'empty-space';
    } else {
      silhouette = 'single-centered';
    }
  }

  return {
    ...candidate,
    scale,
    silhouette,
    composition: composition || candidate.composition,
    peopleContract,
    visiblePeopleContract,
    visibleMembers,
    visualMode,
  };
}

export function chooseCompositionForShot(
  scale,
  silhouette,
  role,
) {
  const s = String(scale || '').toUpperCase();
  const sil = String(silhouette || '').toLowerCase();

  if (s === 'DETAIL') {
    return 'detail-insert';
  }
  if (s === 'SYMBOLIC') {
    if (role === 'context' || sil === 'object-detail') {
      return 'paper';
    }
    return 'detail-insert';
  }
  if (s === 'CLOSE') {
    return 'portrait-focus';
  }
  if (s === 'WIDE' || s === 'RELEASE') {
    return 'portrait-focus';
  }
  // MEDIUM
  if (sil === 'single-left') {
    return 'editorial-left';
  }
  if (sil === 'single-right') {
    return 'editorial-right';
  }
  if (
    sil.startsWith('two-person') ||
    sil === 'three-person' ||
    sil === 'family-group'
  ) {
    return 'portrait-focus';
  }
  return 'portrait-focus';
}
