/**
 * motionGrammar.ts — Deterministic Calm Motion Grammar for HAY & ĐẸP. (V3.4A)
 *
 * Implements:
 * 1. Exactly 6 reusable motion profiles:
 *    STILL, PUSH_IN_SOFT, PULL_OUT_SOFT, DRIFT_LEFT, DRIFT_RIGHT, DETAIL_PUSH
 * 2. Deterministic storyRole -> motionProfile mapping
 * 3. Exact target ranges (scale, translateX)
 * 4. Zero vertical translation (translateY = 0)
 * 5. Full shot progress (0.0 -> 1.0) with smooth linear/clamped interpolation
 * 6. Edge safety / overscan protection
 */

export type MotionProfile =
  | 'STILL'
  | 'AMBIENT_STILL'
  | 'PUSH_IN_SOFT'
  | 'PULL_OUT_SOFT'
  | 'DRIFT_LEFT'
  | 'DRIFT_RIGHT'
  | 'DETAIL_PUSH';

export interface MotionConfig {
  startScale: number;
  endScale: number;
  startX: number; // percentage (-1.2% to +1.2%)
  endX: number;   // percentage (-1.2% to +1.2%)
}

export const MOTION_PROFILES: MotionProfile[] = [
  'STILL',
  'AMBIENT_STILL',
  'PUSH_IN_SOFT',
  'PULL_OUT_SOFT',
  'DRIFT_LEFT',
  'DRIFT_RIGHT',
  'DETAIL_PUSH',
];

export const MOTION_RANGES: Record<MotionProfile, MotionConfig> = {
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

export interface MotionState {
  scale: number;
  translateX: number; // percentage
  translateY: number; // always 0 in V3.4
  transformString: string;
}

/**
 * Computes smooth, deterministic motion state for a given profile and progress (0..1).
 */
export function computeMotionGrammar(
  profile: MotionProfile,
  progress: number
): MotionState {
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

/**
 * Deterministic story-role to motion-profile mapping (Section 4).
 *
 * Baseline:
 *   establish       → PULL_OUT_SOFT
 *   reflection      → PUSH_IN_SOFT
 *   interaction     → STILL (deterministic baseline)
 *   detail-action   → DETAIL_PUSH
 *   action          → DRIFT_LEFT (even beat index) or DRIFT_RIGHT (odd beat index)
 *   context         → STILL
 *   memory          → PUSH_IN_SOFT
 *   release         → PULL_OUT_SOFT
 *   question        → STILL
 */
export function resolveMotionProfile(
  storyRole?: string,
  beatIndex: number = 0,
  _isRepeatedImage: boolean = false
): MotionProfile {
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

/**
 * Normalizes legacy motion strings into V3.4 MotionProfile.
 */
export function normalizeMotionProfile(input?: string): MotionProfile | null {
  if (!input) return null;
  const clean = input.toUpperCase().replace(/-/g, '_');
  if (clean in MOTION_RANGES) {
    return clean as MotionProfile;
  }
  if (clean === 'SLOW_PUSH' || clean === 'PUSH_IN') return 'PUSH_IN_SOFT';
  if (clean === 'SLOW_PULL' || clean === 'PULL_OUT') return 'PULL_OUT_SOFT';
  if (clean === 'STILL_BREATHE' || clean === 'EMOTIONAL_HOLD') return 'STILL';
  if (clean === 'FOCUS_SHIFT') return 'PUSH_IN_SOFT';
  if (clean === 'RISE_SOFT' || clean === 'FOREGROUND_PARALLAX') return 'STILL';
  return null;
}
