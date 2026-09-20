import type { HumanInsightSpec, CompositionPreset, ShotScale } from './index';

export interface FlatBeat {
  sceneIndex: number;
  beatIndex: number;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  composition: CompositionPreset;
  shotScale: ShotScale;
  imageSrc: string;
  isOutro?: boolean;
  isQuestion?: boolean;
  emotionalHold?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  metrics: {
    totalBeats: number;
    totalDurationFrames: number;
    maxNormalShotDurationFrames: number;
    compositionDistribution: Record<CompositionPreset, number>;
    compositionPercentage: Record<CompositionPreset, number>;
    shotScaleDistribution: Record<ShotScale, number>;
    paperRatio: number;
    uniqueCompositionCount: number;
  };
}

export function flattenBeats(spec: HumanInsightSpec): FlatBeat[] {
  const flat: FlatBeat[] = [];

  spec.scenes.forEach((scene, sceneIdx) => {
    if (scene.isOutro) {
      flat.push({
        sceneIndex: sceneIdx,
        beatIndex: 0,
        startFrame: scene.startFrame,
        endFrame: scene.startFrame + scene.durationFrames,
        durationFrames: scene.durationFrames,
        composition: 'full-bleed',
        shotScale: 'medium',
        imageSrc: scene.image?.path ?? '',
        isOutro: true,
      });
      return;
    }

    const resolvedComposition: CompositionPreset =
      scene.composition ?? (scene.visualContainer === 'paper' ? 'paper' : 'portrait-focus');
    const resolvedShotScale: ShotScale = scene.shotScale ?? 'medium';

    if (scene.visualBeats && scene.visualBeats.length > 0) {
      scene.visualBeats.forEach((b, beatIdx) => {
        const isAbsolute = b.startFrame >= scene.startFrame && b.endFrame > scene.startFrame;
        const start = isAbsolute ? b.startFrame : scene.startFrame + b.startFrame;
        const end = isAbsolute ? b.endFrame : scene.startFrame + b.endFrame;
        flat.push({
          sceneIndex: sceneIdx,
          beatIndex: beatIdx,
          startFrame: start,
          endFrame: end,
          durationFrames: end - start,
          composition: b.composition ?? resolvedComposition,
          shotScale: b.shotScale ?? resolvedShotScale,
          imageSrc: b.imageSrc,
          isQuestion: scene.type === 'ending',
          emotionalHold: b.emotionalHold,
        });
      });
    } else {
      flat.push({
        sceneIndex: sceneIdx,
        beatIndex: 0,
        startFrame: scene.startFrame,
        endFrame: scene.startFrame + scene.durationFrames,
        durationFrames: scene.durationFrames,
        composition: resolvedComposition,
        shotScale: resolvedShotScale,
        imageSrc: scene.image?.path ?? '',
        isQuestion: scene.type === 'ending',
        emotionalHold: scene.motionPreset === 'emotional-hold',
      });
    }
  });

  return flat;
}

export function validateVisualRhythm(spec: HumanInsightSpec): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const beats = flattenBeats(spec);

  const normalBeats = beats.filter((b) => !b.isOutro);
  const totalNormalDuration = normalBeats.reduce((sum, b) => sum + b.durationFrames, 0);

  const compCounts: Record<CompositionPreset, number> = {
    'full-bleed': 0,
    'editorial-left': 0,
    'editorial-right': 0,
    'portrait-focus': 0,
    'detail-insert': 0,
    paper: 0,
  };
  const compDuration: Record<CompositionPreset, number> = {
    'full-bleed': 0,
    'editorial-left': 0,
    'editorial-right': 0,
    'portrait-focus': 0,
    'detail-insert': 0,
    paper: 0,
  };
  const scaleCounts: Record<ShotScale, number> = {
    wide: 0,
    medium: 0,
    close: 0,
    detail: 0,
  };

  let maxNormalShotDurationFrames = 0;

  for (let i = 0; i < normalBeats.length; i++) {
    const b = normalBeats[i];
    compCounts[b.composition] = (compCounts[b.composition] || 0) + 1;
    compDuration[b.composition] = (compDuration[b.composition] || 0) + b.durationFrames;
    scaleCounts[b.shotScale] = (scaleCounts[b.shotScale] || 0) + 1;

    if (!b.isQuestion && b.durationFrames > maxNormalShotDurationFrames) {
      maxNormalShotDurationFrames = b.durationFrames;
    }

    // Criterion A: > 5.0s (150f) without visual state change (except deliberate emotional hold or question)
    if (b.durationFrames > 150 && !b.emotionalHold && !b.isQuestion) {
      warnings.push(
        `Beat ${i} (scene ${b.sceneIndex}) exceeds 5.0s (${(b.durationFrames / 30).toFixed(1)}s) without deliberate emotional hold.`,
      );
    }
  }

  // Story role semantic validation
  for (const scene of spec.scenes) {
    if (scene.isOutro) continue;

    if (
      scene.storyRole === 'detail-action' &&
      scene.composition &&
      scene.composition !== 'detail-insert'
    ) {
      warnings.push(
        `Scene ${scene.startFrame}: detail-action should usually use detail-insert.`,
      );
    }

    if (
      scene.storyRole === 'memory' &&
      scene.visualContainer &&
      scene.visualContainer !== 'paper'
    ) {
      warnings.push(
        `Scene ${scene.startFrame}: memory beat should consider paper treatment.`,
      );
    }
  }

  const usedCompositions = Object.keys(compCounts).filter((k) => compCounts[k as CompositionPreset] > 0);

  // Criterion D: paper > 20% normal visual duration
  const paperRatio = totalNormalDuration > 0 ? compDuration.paper / totalNormalDuration : 0;
  if (paperRatio > 0.20) {
    warnings.push(`Paper container occupies ${(paperRatio * 100).toFixed(1)}% of normal visual duration (maximum allowed: 20%).`);
  }

  // Criterion E: Check if scene > 5.5s (165f) with only 1 beat and no emotional hold
  for (const scene of spec.scenes) {
    if (scene.isOutro || scene.type === 'ending') continue;
    if (scene.durationFrames > 165 && (!scene.visualBeats || scene.visualBeats.length <= 1)) {
      if (scene.motionPreset !== 'emotional-hold') {
        warnings.push(
          `Scene at frame ${scene.startFrame} is long (${(scene.durationFrames / 30).toFixed(1)}s) with only 1 beat and no emotional hold.`,
        );
      }
    }
  }

  const compPercentages: Record<CompositionPreset, number> = {
    'full-bleed': totalNormalDuration > 0 ? (compDuration['full-bleed'] / totalNormalDuration) * 100 : 0,
    'editorial-left': totalNormalDuration > 0 ? (compDuration['editorial-left'] / totalNormalDuration) * 100 : 0,
    'editorial-right': totalNormalDuration > 0 ? (compDuration['editorial-right'] / totalNormalDuration) * 100 : 0,
    'portrait-focus': totalNormalDuration > 0 ? (compDuration['portrait-focus'] / totalNormalDuration) * 100 : 0,
    'detail-insert': totalNormalDuration > 0 ? (compDuration['detail-insert'] / totalNormalDuration) * 100 : 0,
    paper: totalNormalDuration > 0 ? (compDuration.paper / totalNormalDuration) * 100 : 0,
  };

  return {
    valid: warnings.length === 0 && errors.length === 0,
    warnings,
    errors,
    metrics: {
      totalBeats: normalBeats.length,
      totalDurationFrames: totalNormalDuration,
      maxNormalShotDurationFrames,
      compositionDistribution: compCounts,
      compositionPercentage: compPercentages,
      shotScaleDistribution: scaleCounts,
      paperRatio,
      uniqueCompositionCount: usedCompositions.length,
    },
  };
}
