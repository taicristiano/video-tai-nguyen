import { describe, expect, it } from 'vitest';
// @ts-expect-error JS module
import { chooseSemanticEntrySfx } from '../scripts/batch-engine.mjs';

describe('Semantic SFX Selection (Parallel Fix 07)', () => {
  // Test 1: ordinary interaction has no SFX
  it('Test 1: ordinary interaction has no SFX', () => {
    const result = chooseSemanticEntrySfx({
      storyRole: 'interaction',
      visualContainer: 'canvas',
      isStatement: false,
      isHook: false,
    });
    expect(result).toBeNull();
  });

  // Test 2: ordinary context has no SFX
  it('Test 2: ordinary context has no SFX', () => {
    const result = chooseSemanticEntrySfx({
      storyRole: 'context',
      visualContainer: 'canvas',
      isStatement: false,
      isHook: false,
    });
    expect(result).toBeNull();
  });

  // Test 3: memory paper gets pageTurn
  it('Test 3: memory paper gets pageTurn', () => {
    const result = chooseSemanticEntrySfx({
      storyRole: 'memory',
      visualContainer: 'paper',
    });
    expect(result).not.toBeNull();
    expect(result?.name).toBe('pageTurn');
    expect(result?.volume).toBeLessThanOrEqual(0.14);
  });

  // Test 4: book page detail may get pageTurn
  it('Test 4: book page detail may get pageTurn', () => {
    const result = chooseSemanticEntrySfx({
      narration: 'lật một trang sách và đánh dấu một ý',
      storyRole: 'detail-action',
    });
    expect(result).not.toBeNull();
    expect(result?.name).toBe('pageTurn');
    expect(result?.volume).toBeLessThanOrEqual(0.14);
  });

  // Test 5: question has no SFX
  it('Test 5: question has no SFX', () => {
    const result1 = chooseSemanticEntrySfx({
      storyRole: 'question',
      isEnding: true,
    });
    expect(result1).toBeNull();

    const result2 = chooseSemanticEntrySfx({
      storyRole: 'question',
      isEnding: false,
    });
    expect(result2).toBeNull();
  });

  // Test 6: release has no SFX
  it('Test 6: release has no SFX', () => {
    const result = chooseSemanticEntrySfx({
      storyRole: 'release',
    });
    expect(result).toBeNull();
  });

  // Test 7: statement can get soft whoosh
  it('Test 7: statement can get soft whoosh', () => {
    const result = chooseSemanticEntrySfx({
      isStatement: true,
      storyRole: 'reflection',
      previousSceneHadSfx: false,
    });
    expect(result).not.toBeNull();
    expect(result?.name).toBe('whoosh');
    expect(result?.volume).toBeLessThanOrEqual(0.12);
  });

  // Test 8: no consecutive optional whoosh
  it('Test 8: no consecutive optional whoosh if previous scene had SFX', () => {
    const result = chooseSemanticEntrySfx({
      isStatement: true,
      storyRole: 'reflection',
      previousSceneHadSfx: true,
    });
    expect(result).toBeNull();
  });

  // Test 9: whip is never selected
  it('Test 9: whip is never selected across narrative roles matrix', () => {
    const roles = [
      'establish',
      'interaction',
      'detail',
      'detail-action',
      'action',
      'context',
      'reflection',
      'memory',
      'release',
      'question',
    ];

    const containers = ['canvas', 'paper', 'full-bleed'];
    const booleanFlags = [false, true];

    for (const storyRole of roles) {
      for (const visualContainer of containers) {
        for (const isStatement of booleanFlags) {
          for (const isHook of booleanFlags) {
            for (const previousSceneHadSfx of booleanFlags) {
              const res = chooseSemanticEntrySfx({
                storyRole,
                visualContainer,
                isStatement,
                isHook,
                previousSceneHadSfx,
              });
              expect(res?.name).not.toBe('whip');
            }
          }
        }
      }
    }
  });

  // Test 10: selector does not depend on scene index
  it('Test 10: selector does not depend on scene index', () => {
    const input = {
      storyRole: 'memory',
      visualContainer: 'paper',
      voiceClause: 'Một kỷ niệm đẹp còn đọng lại',
    };

    const initialResult = chooseSemanticEntrySfx(input);

    for (let sceneIndex = 0; sceneIndex <= 20; sceneIndex++) {
      const res = chooseSemanticEntrySfx({
        ...input,
        sceneIndex,
      });
      expect(res).toEqual(initialResult);
    }
  });
});
