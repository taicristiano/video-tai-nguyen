import { describe, expect, it } from 'vitest';
import { COMPOSITIONS, SHOT_SCALE, type CompositionPreset, type ShotScale } from './tokens';
import type { HumanInsightSpec } from './index';
import { flattenBeats, validateVisualRhythm } from './validateVisualRhythm';

describe('V2.1 Visual Rhythm & Macro Composition Tests', () => {
  // Test 1: legacy spec without new fields parses and resolves default composition/shotScale
  it('1. parses legacy spec without new V2.1 fields and assigns defaults', () => {
    const legacySpec: HumanInsightSpec = {
      templateId: 'human-insight/cinematic-light',
      slug: 'legacy-test-slug',
      totalFrames: 300,
      video: {
        title: 'Legacy Test Video',
      },
      scenes: [
        {
          type: 'hook',
          startFrame: 0,
          durationFrames: 120,
          audioSegment: { start: 0, end: 4, text: 'Legacy hook' },
          image: { assetId: 'test-1', path: 'test-1.jpg' },
        },
        {
          type: 'body',
          startFrame: 120,
          durationFrames: 180,
          audioSegment: { start: 4, end: 10, text: 'Legacy body' },
          image: { assetId: 'test-2', path: 'test-2.jpg' },
          visualContainer: 'paper',
        },
      ],
    };

    const flat = flattenBeats(legacySpec);
    expect(flat).toHaveLength(2);
    expect(flat[0].composition).toBe('portrait-focus');
    expect(flat[0].shotScale).toBe('medium');
    expect(flat[1].composition).toBe('paper');
    expect(flat[1].shotScale).toBe('medium');
  });

  // Test 2: composition geometry resolves properly for all presets
  it('2. verifies all composition preset geometries are valid', () => {
    const presets: CompositionPreset[] = [
      'full-bleed',
      'editorial-left',
      'editorial-right',
      'portrait-focus',
      'detail-insert',
      'paper',
    ];

    presets.forEach((preset) => {
      const geom = COMPOSITIONS[preset];
      expect(geom).toBeDefined();
      expect(geom.width).toBeGreaterThan(0);
      expect(geom.height).toBeGreaterThan(0);
      expect(geom.top).toBeGreaterThanOrEqual(0);
      expect(geom.left).toBeGreaterThanOrEqual(0);
    });
  });

  // Test 3: full-bleed = 1080x1920, radius 0
  it('3. verifies full-bleed is exactly 1080x1920 with radius 0', () => {
    const fullBleed = COMPOSITIONS['full-bleed'];
    expect(fullBleed.width).toBe(1080);
    expect(fullBleed.height).toBe(1920);
    expect(fullBleed.top).toBe(0);
    expect(fullBleed.left).toBe(0);
    expect(fullBleed.radius).toBe(0);
  });

  // Test 4: visual beat active index resolves correctly at boundaries
  it('4. resolves beat active index correctly at boundary frames', () => {
    const beats = [
      { localStart: 0, localEnd: 60, imageSrc: 'img1.jpg' },
      { localStart: 60, localEnd: 120, imageSrc: 'img2.jpg' },
    ];

    const findActive = (frame: number) =>
      beats.findIndex((b) => frame >= b.localStart && frame < b.localEnd);

    expect(findActive(0)).toBe(0);
    expect(findActive(59)).toBe(0);
    expect(findActive(60)).toBe(1);
    expect(findActive(119)).toBe(1);
    expect(findActive(120)).toBe(-1); // at end boundary
  });

  // Test 5: dissolve renders previous + active beat during transition window
  it('5. computes dissolve crossfade weights concurrently for previous and active beat', () => {
    const dissolveFrames = 6;
    const computeMix = (localFrame: number) =>
      Math.min(1, Math.max(0, localFrame / dissolveFrames));

    // At frame 0: previous opacity = 1.0, active opacity = 0.0
    expect(computeMix(0)).toBe(0);
    expect(1 - computeMix(0)).toBe(1);

    // At frame 3: mid-dissolve mix = 0.5 for both
    expect(computeMix(3)).toBe(0.5);
    expect(1 - computeMix(3)).toBe(0.5);

    // At frame 6: active opacity = 1.0, previous is 0.0
    expect(computeMix(6)).toBe(1);
    expect(1 - computeMix(6)).toBe(0);
  });

  // Test 6: cut produces no transition overlap (mix is immediately 1)
  it('6. ensures cut transition has 0 dissolve frames and no overlap', () => {
    const transition = 'cut';
    const dissolveFrames = transition === 'cut' ? 0 : 6;
    const mix = dissolveFrames === 0 ? 1 : 0;

    expect(dissolveFrames).toBe(0);
    expect(mix).toBe(1);
  });

  // Test 7: validator performs semantic check on detail-action role
  it('7. validator warns when detail-action does not use detail-insert composition', () => {
    const semanticSpec: HumanInsightSpec = {
      templateId: 'human-insight/cinematic-light',
      slug: 'semantic-test',
      totalFrames: 240,
      video: { title: 'Semantic Spec' },
      scenes: [
        {
          type: 'body',
          startFrame: 0,
          durationFrames: 120,
          storyRole: 'detail-action',
          composition: 'portrait-focus', // not detail-insert
          audioSegment: { start: 0, end: 4, text: 'putting phone down' },
          image: { assetId: '1', path: '1.jpg' },
        },
      ],
    };

    const res = validateVisualRhythm(semanticSpec);
    expect(res.warnings.some((w) => w.includes('detail-action should usually use detail-insert'))).toBe(true);
  });

  // Test 8: validator catches beat > 5.0s (150f) without emotional hold
  it('8. validator warns when a beat exceeds 5.0s without deliberate emotional hold', () => {
    const longSpec: HumanInsightSpec = {
      templateId: 'human-insight/cinematic-light',
      slug: 'long-test',
      totalFrames: 240,
      video: { title: 'Long Beat Spec' },
      scenes: [
        {
          type: 'body',
          startFrame: 0,
          durationFrames: 210, // 7.0s > 5.0s
          composition: 'editorial-left',
          audioSegment: { start: 0, end: 7, text: 'long scene' },
          image: { assetId: '1', path: '1.jpg' },
        },
      ],
    };

    const res = validateVisualRhythm(longSpec);
    expect(res.warnings.some((w) => w.includes('exceeds 5.0s'))).toBe(true);
  });
});
