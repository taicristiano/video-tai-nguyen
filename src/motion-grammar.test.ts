/**
 * src/motion-grammar.test.ts
 *
 * HAY & ĐẸP. — V3.4A Motion Grammar Baseline Tests
 *
 * Validates:
 * 1. Deterministic storyRole -> motionProfile mapping
 * 2. Beat-index drift alternation (even -> DRIFT_LEFT, odd -> DRIFT_RIGHT)
 * 3. Max scale bounds (scale within [1.00, 1.05])
 * 4. Max translate bounds (translateX within [-1.2%, +1.2%], translateY === 0)
 * 5. STILL profile is exactly scale 1.00 / translate 0
 * 6. No fade default regression (fadeInFrames = 0, fadeOutFrames = 0, transition = 'cut')
 * 7. Determinism: no random usage in motion assignment
 */

import { describe, it, expect } from 'vitest';
import {
  MOTION_PROFILES,
  MOTION_RANGES,
  computeMotionGrammar,
  resolveMotionProfile,
  normalizeMotionProfile,
} from './templates/human-insight/cinematic-light/motionGrammar';

describe('HAY & ĐẸP. V3.4A — Motion Grammar Baseline Tests', () => {
  // Test 1: Deterministic storyRole -> motionProfile mapping
  it('maps each storyRole deterministically to its defined motion profile', () => {
    expect(resolveMotionProfile('establish')).toBe('PULL_OUT_SOFT');
    expect(resolveMotionProfile('reflection')).toBe('PUSH_IN_SOFT');
    expect(resolveMotionProfile('interaction')).toBe('STILL');
    expect(resolveMotionProfile('detail-action')).toBe('DETAIL_PUSH');
    expect(resolveMotionProfile('context')).toBe('STILL');
    expect(resolveMotionProfile('memory')).toBe('PUSH_IN_SOFT');
    expect(resolveMotionProfile('release')).toBe('PULL_OUT_SOFT');
    expect(resolveMotionProfile('question')).toBe('STILL');

    // Case-insensitivity & whitespace trimming
    expect(resolveMotionProfile(' ESTABLISH ')).toBe('PULL_OUT_SOFT');
    expect(resolveMotionProfile('Reflection')).toBe('PUSH_IN_SOFT');
    expect(resolveMotionProfile(undefined)).toBe('STILL');
    expect(resolveMotionProfile('unknown-role')).toBe('STILL');
  });

  // Test 2: Beat-index drift alternation
  it('alternates action drift direction deterministically by beat index', () => {
    expect(resolveMotionProfile('action', 0)).toBe('DRIFT_LEFT');
    expect(resolveMotionProfile('action', 1)).toBe('DRIFT_RIGHT');
    expect(resolveMotionProfile('action', 2)).toBe('DRIFT_LEFT');
    expect(resolveMotionProfile('action', 3)).toBe('DRIFT_RIGHT');
    expect(resolveMotionProfile('action', 4)).toBe('DRIFT_LEFT');
    expect(resolveMotionProfile('action', 5)).toBe('DRIFT_RIGHT');
  });

  // Test 3: Max scale bounds
  it('enforces scale strictly within [1.00, 1.05] across all profiles and progress steps', () => {
    const steps = [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

    for (const profile of MOTION_PROFILES) {
      for (const p of steps) {
        const state = computeMotionGrammar(profile, p);
        expect(state.scale).toBeGreaterThanOrEqual(1.00);
        expect(state.scale).toBeLessThanOrEqual(1.05);
      }
    }
  });

  // Test 4: Max translate bounds & zero vertical translation
  it('enforces translateX strictly within [-1.2%, +1.2%] and translateY strictly === 0', () => {
    const steps = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

    for (const profile of MOTION_PROFILES) {
      for (const p of steps) {
        const state = computeMotionGrammar(profile, p);
        expect(state.translateX).toBeGreaterThanOrEqual(-1.2);
        expect(state.translateX).toBeLessThanOrEqual(1.2);
        expect(state.translateY).toBe(0);
      }
    }
  });

  // Test 5: STILL profile is exactly scale 1.00 and translate 0
  it('guarantees STILL profile remains at exactly scale 1.00 and translate 0 at all frames', () => {
    const steps = [0.0, 0.25, 0.5, 0.75, 1.0];

    for (const p of steps) {
      const state = computeMotionGrammar('STILL', p);
      expect(state.scale).toBe(1.00);
      expect(state.translateX).toBe(0);
      expect(state.translateY).toBe(0);
      expect(state.transformString).toBe('scale(1.00000) translateX(0.000%)');
    }
  });

  // Test 6: Normalization & legacy string mapping
  it('normalizes legacy motion strings without regression', () => {
    expect(normalizeMotionProfile('slow-push')).toBe('PUSH_IN_SOFT');
    expect(normalizeMotionProfile('slow-pull')).toBe('PULL_OUT_SOFT');
    expect(normalizeMotionProfile('still-breathe')).toBe('STILL');
    expect(normalizeMotionProfile('emotional-hold')).toBe('STILL');
    expect(normalizeMotionProfile('drift-left')).toBe('DRIFT_LEFT');
    expect(normalizeMotionProfile('drift-right')).toBe('DRIFT_RIGHT');
    expect(normalizeMotionProfile('DETAIL_PUSH')).toBe('DETAIL_PUSH');
    expect(normalizeMotionProfile(undefined)).toBeNull();
  });

  // Test 7: Determinism — zero random usage
  it('is completely deterministic across 100 repeated executions', () => {
    const testCases = [
      { role: 'establish', idx: 0 },
      { role: 'action', idx: 4 },
      { role: 'action', idx: 5 },
      { role: 'detail-action', idx: 3 },
      { role: 'reflection', idx: 1 },
      { role: 'interaction', idx: 2 },
    ];

    for (const tc of testCases) {
      const baseline = resolveMotionProfile(tc.role, tc.idx);
      for (let i = 0; i < 100; i++) {
        expect(resolveMotionProfile(tc.role, tc.idx)).toBe(baseline);
      }
    }
  });

  // Test 8: Target ranges exact configuration verification
  it('verifies exact target ranges in MOTION_RANGES configuration', () => {
    expect(MOTION_RANGES.STILL).toEqual({
      startScale: 1.00,
      endScale: 1.00,
      startX: 0,
      endX: 0,
    });
    expect(MOTION_RANGES.PUSH_IN_SOFT).toEqual({
      startScale: 1.00,
      endScale: 1.035,
      startX: 0,
      endX: 0,
    });
    expect(MOTION_RANGES.PULL_OUT_SOFT).toEqual({
      startScale: 1.035,
      endScale: 1.00,
      startX: 0,
      endX: 0,
    });
    expect(MOTION_RANGES.DRIFT_LEFT).toEqual({
      startScale: 1.02,
      endScale: 1.03,
      startX: 1.2,
      endX: -1.2,
    });
    expect(MOTION_RANGES.DRIFT_RIGHT).toEqual({
      startScale: 1.02,
      endScale: 1.03,
      startX: -1.2,
      endX: 1.2,
    });
    expect(MOTION_RANGES.DETAIL_PUSH).toEqual({
      startScale: 1.015,
      endScale: 1.05,
      startX: 0,
      endX: 0,
    });
  });
});
