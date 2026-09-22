/**
 * motionGrammarRuntime.mjs
 *
 * Runtime JavaScript module for deterministic calm motion grammar (V3.4A).
 */

export const MOTION_PROFILES = [
  'STILL',
  'AMBIENT_STILL',
  'PUSH_IN_SOFT',
  'PULL_OUT_SOFT',
  'DRIFT_LEFT',
  'DRIFT_RIGHT',
  'DETAIL_PUSH',
];

export const MOTION_RANGES = {
  STILL: {
    startScale: 1.00,
    endScale: 1.00,
    startX: 0,
    endX: 0,
  },
  AMBIENT_STILL: {
    startScale: 1.00,
    endScale: 1.020,
    startX: 0.5,
    endX: -0.5,
  },
  PUSH_IN_SOFT: {
    startScale: 1.00,
    endScale: 1.035,
    startX: 0,
    endX: 0,
  },
  PULL_OUT_SOFT: {
    startScale: 1.035,
    endScale: 1.00,
    startX: 0,
    endX: 0,
  },
  DRIFT_LEFT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: 1.2,
    endX: -1.2,
  },
  DRIFT_RIGHT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: -1.2,
    endX: 1.2,
  },
  DETAIL_PUSH: {
    startScale: 1.015,
    endScale: 1.05,
    startX: 0,
    endX: 0,
  },
};

export function computeMotionGrammar(profile, progress) {
  const cfg = MOTION_RANGES[profile] ?? MOTION_RANGES.STILL;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  const scale = cfg.startScale + (cfg.endScale - cfg.startScale) * clampedProgress;
  const translateX = cfg.startX + (cfg.endX - cfg.startX) * clampedProgress;
  const translateY = 0;

  return {
    scale,
    translateX,
    translateY,
    transformString: `scale(${scale.toFixed(5)}) translateX(${translateX.toFixed(3)}%)`,
  };
}

export function resolveMotionProfile(storyRole, beatIndex = 0, _isRepeatedImage = false) {
  if (!storyRole) return 'STILL';

  const role = storyRole.toLowerCase().trim();

  switch (role) {
    case 'establish':
      return 'PULL_OUT_SOFT';
    case 'reflection':
      return 'PUSH_IN_SOFT';
    case 'interaction':
      return 'STILL';
    case 'detail-action':
      return 'DETAIL_PUSH';
    case 'action':
      return beatIndex % 2 === 0 ? 'DRIFT_LEFT' : 'DRIFT_RIGHT';
    case 'context':
      return 'STILL';
    case 'memory':
      return 'PUSH_IN_SOFT';
    case 'release':
      return 'PULL_OUT_SOFT';
    case 'question':
      return 'STILL';
    default:
      return 'STILL';
  }
}

export function normalizeMotionProfile(input) {
  if (!input) return null;
  const clean = input.toUpperCase().replace(/-/g, '_');
  if (clean in MOTION_RANGES) {
    return clean;
  }
  if (clean === 'SLOW_PUSH' || clean === 'PUSH_IN') return 'PUSH_IN_SOFT';
  if (clean === 'SLOW_PULL' || clean === 'PULL_OUT') return 'PULL_OUT_SOFT';
  if (clean === 'STILL_BREATHE' || clean === 'EMOTIONAL_HOLD') return 'STILL';
  if (clean === 'FOCUS_SHIFT') return 'PUSH_IN_SOFT';
  if (clean === 'RISE_SOFT' || clean === 'FOREGROUND_PARALLAX') return 'STILL';
  return null;
}
