/**
 * src/templates/human-insight/cinematic-light/storyPlannerRuntime.mjs
 *
 * HAY & ĐẸP. — Generalized Template-Level Story & Shot Planner.
 * Runtime source of truth for story planning transforms, cadence normalization,
 * brand auditing, and production readiness checks.
 */

import {
  REFERENCE_SHOT_GRAMMAR,
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
  isSilhouetteCompatibleWithPeopleContract,
  buildImageSafetyRulesForShot,
  mapPlannerScaleToRendererScale,
  choosePlannerScale,
  VISUAL_MODES,
  VISUAL_MODE_TO_SCALE,
  deriveVisualMode,
} from './referenceShotGrammarRuntime.mjs';

export const CHANNEL_BRAND_CONFIG = {
  brandName: 'HAY & ĐẸP.',
  slogan: 'Điều hay để biết. Điều đẹp để giữ.',
  outroComponentId: 'OutroCard',
};

/**
 * Pre-processes transcript segments, preserving 1-to-1 canonical segment identity.
 * Does not merge across segment boundaries to prevent segment drift and orphan segments.
 */
export function preProcessSegments(segments = []) {
  if (!segments || segments.length === 0) return [];
  const filled = [];
  for (let i = 0; i < segments.length; i++) {
    const curr = segments[i];
    const next = segments[i + 1];
    const start = i === 0 ? 0 : Number(curr.start || 0);
    const end = next ? Number(next.start || 0) : Number(curr.end || 0);
    filled.push({
      ...curr,
      start,
      end: Math.max(end, Number(curr.end || 0)),
      text: (curr.text || '').trim(),
      segmentIndex: curr.segmentIndex ?? i,
      sourceSegmentIndex: curr.segmentIndex ?? i,
      canonicalStart: Number(curr.start || 0),
      canonicalEnd: Number(curr.end || 0),
      canonicalStartFrame: Math.round(Number(curr.start || 0) * 30),
      canonicalEndFrame: Math.round(Number(curr.end || 0) * 30),
      visualWindowStartFrame: Math.round(start * 30),
      visualWindowEndFrame: Math.round(Math.max(end, Number(curr.end || 0)) * 30),
      sourceSegmentStartFrame: Math.round(Number(curr.start || 0) * 30),
      sourceSegmentEndFrame: Math.round(Number(curr.end || 0) * 30),
    });
  }
  return filled;
}

/**
 * Evaluates whether a narrative segment should be split into multiple visual beats.
 * Decision order: semantic density first, duration second.
 */
export function shouldSplitClause(
  segment,
  isStatementClause = false,
) {
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

  const text = (segment.text || '').trim();
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
 * Chooses an opening hook progression based purely on semantic cues in the opening clause.
 */
export function chooseHookPattern(openingText = '') {
  const norm = String(openingText).toLowerCase();

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
    'đồng hồ',
    'bát cơm',
    'đôi đũa',
    'bút',
    'đèn',
  ];
  if (OBJECT_HINTS.some((h) => norm.includes(h))) {
    return {
      firstScale: 'DETAIL',
      firstSilhouette: 'object-detail',
      secondScale: 'WIDE',
      secondSilhouette: 'room-wide',
    };
  }

  // 2. Emotional state or personal human presence -> CLOSE -> WIDE
  const EMOTION_HINTS = [
    'nghĩ',
    'nhớ',
    'buồn',
    'vui',
    'mệt',
    'lo',
    'thở dài',
    'nhìn lại',
    'băn khoăn',
    'tự hỏi',
    'cảm giác',
  ];
  if (EMOTION_HINTS.some((h) => norm.includes(h))) {
    return {
      firstScale: 'CLOSE',
      firstSilhouette: 'face-close',
      secondScale: 'WIDE',
      secondSilhouette: 'single-centered',
    };
  }

  // 3. Situational or environmental setting -> WIDE -> MEDIUM
  return {
    firstScale: 'WIDE',
    firstSilhouette: 'room-wide',
    secondScale: 'MEDIUM',
    secondSilhouette: 'single-left',
  };
}

/**
 * Splits text and timing recursively to guarantee holds <= 4.0s (120 frames).
 */
export function splitClauseTextAndTiming(
  segment,
  fps = 30,
  isStatement = false,
) {
  const text = (segment.text || '').trim();
  const totalFrames = Math.round((segment.end - segment.start) * fps);
  const startFrame = Math.round(segment.start * fps);
  const endFrame = startFrame + totalFrames;

  if (totalFrames <= 120 || (isStatement && totalFrames <= 165)) {
    return [{ text, startFrame, endFrame, durationFrames: totalFrames }];
  }

  const SPLIT_PUNCT = [',', ':', ';', ' - '];
  let splitIndex = -1;

  // 1. Look for punctuation near the center
  const punctCandidates = [];
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

export function normalizeContinuedSegments(...groups) {
  return [
    ...new Set(
      groups
        .flatMap((group) => group ?? [])
        .filter((v) => Number.isInteger(v))
    ),
  ].sort((a, b) => a - b);
}

/**
 * Normalizes cadence into the target [18.0, 22.0] changes/minute range deterministically.
 * Merges adjacent semantically related sub-beats when too fast.
 * Respects typed hold exceptions (never blindly merges shots with holdException).
 * Strictly removes all legacy exceptionReason checks.
 */
export function normalizeCadence(
  shots,
  totalDurationSeconds,
) {
  let list = [...shots];
  const durationMin = totalDurationSeconds / 60;
  const maxAllowedCpm = REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.max; // 22.0

  let currentCpm = list.length / Math.max(0.001, durationMin);
  let guard = 0;

  while (currentCpm > maxAllowedCpm && guard < 15 && list.length > 10) {
    guard++;
    let mergeIdx = -1;

    // First pass: find adjacent sub-beats sharing the same storyRole whose combined duration <= 4.0s (120 frames)
    // NEVER merge shots with authored emotional pauses or outro, and NEVER merge across different segmentIndex values
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      if (
        a.segmentIndex !== undefined &&
        b.segmentIndex !== undefined &&
        a.segmentIndex !== b.segmentIndex
      ) {
        continue;
      }
      const combinedFrames = a.durationFrames + b.durationFrames;
      if (
        combinedFrames <= 120 &&
        a.storyRole === b.storyRole &&
        a.storyRole !== 'outro' &&
        b.storyRole !== 'outro' &&
        a.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE' &&
        b.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE'
      ) {
        mergeIdx = i;
        break;
      }
    }

    // Second pass: if no same-role pair under 4.0s, find the pair with smallest combined duration under 4.0s within the same segment
    if (mergeIdx === -1) {
      let minCombined = Infinity;
      for (let i = 0; i < list.length - 1; i++) {
        const a = list[i];
        const b = list[i + 1];
        if (
          a.segmentIndex !== undefined &&
          b.segmentIndex !== undefined &&
          a.segmentIndex !== b.segmentIndex
        ) {
          continue;
        }
        const combinedFrames = a.durationFrames + b.durationFrames;
        if (
          combinedFrames <= 120 &&
          a.storyRole !== 'outro' &&
          b.storyRole !== 'outro' &&
          a.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE' &&
          b.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE'
        ) {
          if (combinedFrames < minCombined) {
            minCombined = combinedFrames;
            mergeIdx = i;
          }
        }
      }
    }

    // Third pass: explicit visual continuation across adjacent segments for short shots when same-segment merges are exhausted
    if (mergeIdx === -1) {
      let minCombined = Infinity;
      for (let i = 0; i < list.length - 1; i++) {
        const a = list[i];
        const b = list[i + 1];
        const combinedFrames = a.durationFrames + b.durationFrames;
        if (
          combinedFrames <= 120 &&
          a.storyRole !== 'outro' &&
          b.storyRole !== 'outro' &&
          a.storyRole !== 'hook' &&
          b.storyRole !== 'release' &&
          a.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE' &&
          b.holdException?.kind !== 'AUTHORED_EMOTIONAL_PAUSE' &&
          !a.hasInsightCard &&
          !b.hasInsightCard
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
      const isCard = Boolean(a.hasInsightCard || b.hasInsightCard);
      const continuedInSegments = normalizeContinuedSegments(
        a.continuedInSegments ?? (a.segmentIndex !== undefined ? [a.segmentIndex] : []),
        b.continuedInSegments ?? (b.segmentIndex !== undefined ? [b.segmentIndex] : []),
      );
      const merged = {
        ...a,
        segmentIndex: a.segmentIndex,
        continuedInSegments,
        startFrame: a.startFrame,
        endFrame: b.endFrame,
        durationFrames: b.endFrame - a.startFrame,
        voiceClause: [a.voiceClause, b.voiceClause].filter(Boolean).join(' '),
        audioText: [a.audioText, b.audioText].filter(Boolean).join(' '),
        narrativePurpose: `${a.narrativePurpose}; ${b.narrativePurpose}`,
        visualVerb: a.visualVerb === b.visualVerb ? a.visualVerb : `${a.visualVerb} / ${b.visualVerb}`,
        visualIntent: a.visualIntent === b.visualIntent ? a.visualIntent : `${a.visualIntent} — ${b.visualIntent}`,
        semanticIntent: `${a.semanticIntent} Kết hợp: ${b.semanticIntent}`,
        hasInsightCard: isCard,
        holdException: isCard
          ? { kind: 'INSIGHT_CARD', reason: 'Statement card hold' }
          : undefined,
      };
      list.splice(mergeIdx, 2, merged);
      currentCpm = list.length / durationMin;
    } else {
      break;
    }
  }

  // Re-index shot IDs and preserve frame boundaries
  list = list.map((s, idx) => ({
    ...s,
    id: `shot-${String(idx + 1).padStart(2, '0')}`,
    startFrame: s.startFrame,
    endFrame: s.endFrame,
    durationFrames: s.endFrame - s.startFrame,
  }));

  return list;
}

/**
 * Applies reference grammar transformations: normalizes cadence and repairs monotony.
 */
export function applyReferenceShotGrammar(
  candidateShots,
  input = {},
) {
  const totalFrames = candidateShots[candidateShots.length - 1]?.endFrame ?? 1500;
  const totalDurationSec = totalFrames / (input.fps ?? 30);

  // 1. Cadence normalization
  const normalizedShots = normalizeCadence(candidateShots, totalDurationSec);

  // 2. Anti-monotony repair on post-normalized sequence
  const antiMonotonyShots = [];
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
  input,
  shots,
) {
  const visualBrand = input.brandContext?.brandName || CHANNEL_BRAND_CONFIG.brandName;
  const allAudioSources = [
    shots.map((s) => s.audioText || '').join(' '),
    input.rawTimelineText || '',
    input.spokenAudioTranscript || '',
    input.timelineText || '',
    Array.isArray(input.timelineSegments) ? input.timelineSegments.map((s) => s.text || '').join(' ') : '',
  ];
  const allAudio = allAudioSources.join(' ').toLowerCase();

  const LEGACY_BRANDS = ['nếp', 'nep', 'nếp sống'];
  let audioBrandName = undefined;
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
      : 'Visual and spoken brand are aligned.',
  };
}

/**
 * Evaluates production readiness against brand mismatches and structural validity.
 */
export function evaluateProductionReadiness(
  structuralValidation,
  brandAudit,
  validationMode = 'PRODUCTION',
) {
  const errors = [...structuralValidation.errors];
  const warnings = [...structuralValidation.warnings];

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
 * Builds the comprehensive asset reuse audit from actual planned shots.
 */
export function buildReuseAudit(
  shots,
  approvedAssets,
) {
  const evaluations = shots.map((shot) => {
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
 * Maps planner story role to renderer story role.
 */
export function mapPlannerRoleToRendererRole(role) {
  switch (role) {
    case 'hook':
    case 'establish':
      return 'establish';
    case 'action':
      return 'action';
    case 'interaction':
      return 'interaction';
    case 'detail':
      return 'detail-action';
    case 'context':
      return 'context';
    case 'reflection':
      return 'reflection';
    case 'memory':
      return 'memory';
    case 'release':
    case 'outro':
      return 'release';
    case 'question':
      return 'question';
    default:
      return 'context';
  }
}

/**
 * Builds the initial raw candidate shot plan from canonical segments.
 */
export function buildCandidateShotPlan(input) {
  const fps = input.fps ?? 30;
  const segments = preProcessSegments(input.timelineSegments);
  const statementTarget = (input.statementText || '').toLowerCase();
  const rawBeats = [];

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

  const shots = [];
  const hookProgression = chooseHookPattern(rawBeats[0]?.text || '');

  for (let i = 0; i < rawBeats.length; i++) {
    const beat = rawBeats[i];
    const id = `shot-${String(i + 1).padStart(2, '0')}`;
    const textNorm = beat.text.toLowerCase();

    // 1. Role determination
    let storyRole = 'action';
    if (beat.isOpeningHook) {
      storyRole = 'hook';
    } else if (i === 1 && rawBeats[0].isOpeningHook) {
      storyRole = 'establish';
    } else if (beat.isStatement) {
      storyRole = 'reflection';
    } else if (
      textNorm.includes('vấn đề là') ||
      textNorm.includes('không nằm ở') ||
      textNorm.includes('thực ra') ||
      textNorm.includes('bởi vì') ||
      textNorm.includes('ngẫm lại')
    ) {
      storyRole = 'reflection';
    } else if (textNorm.includes('nhớ') || textNorm.includes('ngày xưa') || textNorm.includes('hồi đó')) {
      storyRole = 'memory';
    } else if (i >= rawBeats.length - 2 && (textNorm.includes('?') || textNorm.includes('liệu') || textNorm.includes('bạn có'))) {
      storyRole = 'question';
    } else if (i === rawBeats.length - 1) {
      storyRole = 'release';
    } else if (textNorm.includes('cùng') || textNorm.includes('nói') || textNorm.includes('kể') || textNorm.includes('lắng nghe')) {
      storyRole = 'interaction';
    } else if (
      detectVisualVerb(beat.text) &&
      (textNorm.includes('chìa khóa') || textNorm.includes('trang sách') || textNorm.includes('cốc trà') || textNorm.includes('bút') || textNorm.includes('ngăn kéo'))
    ) {
      storyRole = 'detail';
    }

    // 2. Visual verb & Semantic intent
    const visualStrategy = resolveVisualStrategy(beat.text, storyRole);
    const visualVerb = visualStrategy.visualVerb;
    const semanticIntent = `Cảnh ${storyRole}: ${beat.text}`;

    // 3. Scale & Silhouette progression
    let scale = 'MEDIUM';
    let silhouette = 'single-centered';

    if (beat.isOpeningHook) {
      scale = hookProgression.firstScale;
      silhouette = hookProgression.firstSilhouette;
    } else if (i === 1 && rawBeats[0].isOpeningHook) {
      scale = hookProgression.secondScale;
      silhouette = hookProgression.secondSilhouette;
    } else {
      scale = choosePlannerScale({
        role: storyRole,
        text: beat.text,
        visualVerb,
        peopleContract: input.peopleContract || { min: 1, max: 1 },
        isStatement: beat.isStatement,
        isHook: beat.isOpeningHook,
        isEnding: i === rawBeats.length - 1,
      });
    }

    // 4. Visual Mode & People Model Separation
    const storyParticipants = input.storyParticipants || (storyRole === 'interaction' ? ['speaker', 'listener'] : ['main']);
    const visualMode = deriveVisualMode({
      role: storyRole,
      scale,
      text: beat.text,
      visualVerb,
      peopleContract: { min: Math.min(2, storyParticipants.length), max: Math.max(1, storyParticipants.length) },
      isHook: beat.isOpeningHook,
      isEnding: i === rawBeats.length - 1,
      contentMode: input.contentMode || '',
    });

    let visibleMembers = storyParticipants;
    let visiblePeopleContract = { min: 1, max: 1 };

    if (visualMode === 'EMPTY_RELEASE') {
      visibleMembers = [];
      visiblePeopleContract = { min: 0, max: 0 };
    } else if (visualMode === 'OBJECT_DETAIL') {
      visibleMembers = [];
      visiblePeopleContract = { min: 0, max: 0 };
    } else if (visualMode === 'ACTION_DETAIL') {
      visibleMembers = storyParticipants.length > 1 ? [storyParticipants[1]] : storyParticipants.slice(0, 1);
      visiblePeopleContract = { min: 1, max: 1 };
    } else if (visualMode === 'REACTION_CLOSE') {
      visibleMembers = storyParticipants.length > 1 ? [storyParticipants[1]] : storyParticipants.slice(0, 1);
      visiblePeopleContract = { min: 1, max: 1 };
    } else if (visualMode === 'SOLO_MEDIUM') {
      visibleMembers = storyParticipants.length > 1 ? [storyParticipants[1]] : storyParticipants.slice(0, 1);
      visiblePeopleContract = { min: 1, max: 1 };
    } else if (visualMode === 'INTERACTION_MEDIUM') {
      visibleMembers = storyParticipants.slice(0, 2);
      visiblePeopleContract = { min: Math.min(2, storyParticipants.length), max: Math.max(2, storyParticipants.length) };
    } else if (visualMode === 'ENVIRONMENT_WIDE') {
      visibleMembers = storyParticipants.slice(0, 2);
      visiblePeopleContract = { min: Math.min(2, storyParticipants.length), max: Math.max(2, storyParticipants.length) };
    } else if (visualMode === 'GROUP_WIDE') {
      visibleMembers = storyParticipants;
      visiblePeopleContract = { min: 2, max: storyParticipants.length };
    }

    if (visualMode && VISUAL_MODE_TO_SCALE[visualMode]) {
      scale = VISUAL_MODE_TO_SCALE[visualMode];
    }

    let peopleContract = visiblePeopleContract;

    if (!beat.isOpeningHook && !(i === 1 && rawBeats[0].isOpeningHook)) {
      switch (visualMode) {
        case 'INTERACTION_MEDIUM': {
          silhouette = 'two-person';
          break;
        }
        case 'ENVIRONMENT_WIDE': {
          silhouette = peopleContract.min >= 2 ? 'two-person-wide' : 'room-wide';
          break;
        }
        case 'GROUP_WIDE': {
          silhouette = 'family-group';
          break;
        }
        case 'ACTION_DETAIL': {
          silhouette = 'hands-detail';
          break;
        }
        case 'OBJECT_DETAIL': {
          silhouette = textNorm.includes('bàn') ? 'tabletop-topdown' : 'object-detail';
          break;
        }
        case 'REACTION_CLOSE': {
          silhouette = beat.isStatement ? 'face-close' : 'single-centered';
          break;
        }
        case 'SOLO_MEDIUM': {
          silhouette = (shots[i - 1]?.silhouette === 'single-left') ? 'single-centered' : 'single-left';
          break;
        }
        case 'EMPTY_RELEASE': {
          silhouette = 'empty-space';
          break;
        }
        default: {
          if (scale === 'DETAIL') {
            silhouette = 'hands-detail';
          } else if (scale === 'CLOSE') {
            silhouette = 'face-close';
          } else if (scale === 'WIDE') {
            silhouette = peopleContract.min >= 2 ? 'two-person-wide' : 'room-wide';
          } else if (peopleContract.min >= 2) {
            silhouette = 'two-person';
          } else {
            silhouette = (shots[i - 1]?.silhouette === 'single-left') ? 'single-right' : 'single-left';
          }
          break;
        }
      }
    }

    if (!isSilhouetteCompatibleWithPeopleContract(silhouette, peopleContract)) {
      if (peopleContract.min >= 4) {
        silhouette = 'family-group';
      } else if (peopleContract.min === 3) {
        silhouette = 'three-person';
      } else if (peopleContract.min >= 2) {
        silhouette = 'two-person';
      } else if (peopleContract.max === 0) {
        silhouette = 'empty-space';
      } else {
        silhouette = 'single-centered';
      }
    }

    const shotScale = mapPlannerScaleToRendererScale({
      scale,
      silhouette,
      role: storyRole,
    });

    // 5. Composition & Motion
    const composition = chooseCompositionForShot(scale, silhouette, storyRole);
    const motionProfile =
      storyRole === 'detail'
        ? 'subtle-push'
        : storyRole === 'release'
        ? 'slow-pull'
        : storyRole === 'reflection'
        ? 'drift-down'
        : 'breathing';

    shots.push({
      id,
      segmentIndex: beat.segmentIndex,
      startFrame: beat.startFrame,
      endFrame: beat.endFrame,
      durationFrames: beat.durationFrames,
      scale,
      shotScale,
      silhouette,
      storyRole,
      visualMode,
      storyParticipants,
      visibleMembers,
      visiblePeopleContract,
      presentMembers: visibleMembers,
      visualVerb,
      semanticIntent,
      peopleContract,
      assetStrategy: 'NEW_IMAGE',
      composition,
      motionProfile,
      referenceReason: `Semantic assignment based on narrative role '${storyRole}' and mode '${visualMode}'`,
      audioText: beat.text,
      hasInsightCard: beat.isStatement,
    });
  }

  // Final Outro Card Component
  const lastShot = shots[shots.length - 1];
  const outroStart = lastShot ? lastShot.endFrame : 1500;
  const outroDuration = 60;
  shots.push({
    id: `shot-${String(shots.length + 1).padStart(2, '0')}`,
    startFrame: outroStart,
    endFrame: outroStart + outroDuration,
    durationFrames: outroDuration,
    scale: 'RELEASE',
    shotScale: 'wide',
    silhouette: 'empty-space',
    storyRole: 'outro',
    visualVerb: 'thư thái',
    semanticIntent: `Thẻ OutroCard kết thúc thương hiệu ${input.brandContext?.brandName || CHANNEL_BRAND_CONFIG.brandName}`,
    peopleContract: { min: 0, max: 0 },
    assetStrategy: 'COMPONENT',
    composition: 'portrait-focus',
    motionProfile: 'slow-pull',
    referenceReason: 'Outro component branding lock',
    holdException: {
      kind: 'OUTRO_COMPONENT',
      reason: 'Standard branded outro release hold',
    },
    audioText: '',
  });

  return shots;
}

/**
 * Transforms planned shots into Remotion template scenes.
 */
export function buildTemplateScenes(
  shots,
  input,
) {
  const fps = input.fps ?? 30;
  return shots.map((shot, idx) => {
    const isFirst = idx === 0;
    const isOutro = shot.storyRole === 'outro';
    const isEnding = idx >= shots.length - 2;

    const sceneType = isFirst
      ? 'hook'
      : isOutro || isEnding
      ? 'ending'
      : 'body';

    let assetId = `shot-${String(idx + 1).padStart(2, '0')}`;
    if (shot.sourceAsset) {
      const lastSlash = Math.max(shot.sourceAsset.lastIndexOf('/'), shot.sourceAsset.lastIndexOf('\\'));
      const filename = lastSlash !== -1 ? shot.sourceAsset.slice(lastSlash + 1) : shot.sourceAsset;
      const lastDot = filename.lastIndexOf('.');
      assetId = lastDot !== -1 ? filename.slice(0, lastDot) : filename;
    }

    const imagePath = shot.sourceAsset || `assets/${assetId}.jpg`;

    return {
      type: sceneType,
      layout: 'standard',
      composition: shot.composition,
      shotScale: mapPlannerScaleToRendererScale({
        scale: shot.scale,
        silhouette: shot.silhouette,
        role: shot.storyRole,
      }),
      motionProfile: shot.motionProfile,
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
 * Main generalized entry point: plans a Human Insight video using reference shot grammar.
 */
export function planHumanInsightVideo(input) {
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
    validation: structuralValidation,
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
export function buildPlannerRunResult(input) {
  const plannedStory = planHumanInsightVideo(input);
  const metrics = plannedStory.metrics;
  const headerText = `${metrics.shotCount} shots | ${metrics.changesPerMinute.toFixed(2)} changes/min | ${metrics.uniqueScales} scales | ${metrics.uniqueSilhouettes} silhouettes`;
  const headerModel = {
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
export function validatePlannerArtifacts(result) {
  const errors = [];

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
