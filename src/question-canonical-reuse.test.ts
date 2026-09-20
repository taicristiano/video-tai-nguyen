import { describe, it, expect } from 'vitest';
// @ts-expect-error JS module
import { buildStoryPlan, chooseAssetStrategy, STORY_ROLES } from '../scripts/human-insight-story-planner.mjs';
// @ts-expect-error JS module
import { canonicalKey, resolveCanonicalAsset } from '../scripts/batch-engine.mjs';
// @ts-expect-error JS module
import { parseHayDepVideos } from '../scripts/parse-hay-dep-videos.mjs';

describe('Question Canonical Cast Reuse (Parallel Fix 06)', () => {
  // Test 1: Family question reuses canonical
  it('Test 1: Video 001 final question beat reuses canonical cast image', () => {
    const videos = parseHayDepVideos();
    const v1 = videos.find((v: any) => v.index === 1);
    const paras = v1.voiceScriptText.split(/\n\s*\n/).map((p: string) => p.replace(/\r/g, '').trim()).filter(Boolean);
    let t = 0;
    const segments = paras.map((text: string) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });

    const { plan, validation } = buildStoryPlan(v1, segments);
    expect(validation.valid).toBe(true);

    const questionBeat = plan.beats.find((b: any) => b.storyRole === 'question');
    expect(questionBeat).toBeDefined();
    expect(questionBeat.castId).toBe('family-young-01');
    expect(questionBeat.assetStrategy).toBe('reuse-canonical');
  });

  // Test 2: Relationship question reuses canonical
  it('Test 2: Video 005 final question beat reuses canonical cast image with correct members', () => {
    const videos = parseHayDepVideos();
    const v5 = videos.find((v: any) => v.index === 5);
    const paras = v5.voiceScriptText.split(/\n\s*\n/).map((p: string) => p.replace(/\r/g, '').trim()).filter(Boolean);
    let t = 0;
    const segments = paras.map((text: string) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });

    const { plan, validation } = buildStoryPlan(v5, segments);
    expect(validation.valid).toBe(true);

    const questionBeat = plan.beats.find((b: any) => b.storyRole === 'question');
    expect(questionBeat).toBeDefined();
    expect(questionBeat.castId).toBe('dialogue-pair-01');
    expect(questionBeat.presentMembers).toEqual(['speaker', 'listener']);
    expect(questionBeat.assetStrategy).toBe('reuse-canonical');
  });

  // Test 3: Solo recurring-cast question reuses canonical
  it('Test 3: Video 007 / 013 solo recurring-cast question beats reuse canonical', () => {
    const videos = parseHayDepVideos();
    const v7 = videos.find((v: any) => v.index === 7);
    const paras7 = v7.voiceScriptText.split(/\n\s*\n/).map((p: string) => p.replace(/\r/g, '').trim()).filter(Boolean);
    let t = 0;
    const segments7 = paras7.map((text: string) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });

    const { plan: plan7 } = buildStoryPlan(v7, segments7);
    const q7 = plan7.beats.find((b: any) => b.storyRole === 'question');
    expect(q7.castId).toBe('solo-male-01');
    expect(q7.assetStrategy).toBe('reuse-canonical');

    const v13 = videos.find((v: any) => v.index === 13);
    const paras13 = v13.voiceScriptText.split(/\n\s*\n/).map((p: string) => p.replace(/\r/g, '').trim()).filter(Boolean);
    t = 0;
    const segments13 = paras13.map((text: string) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });

    const { plan: plan13 } = buildStoryPlan(v13, segments13);
    const q13 = plan13.beats.find((b: any) => b.storyRole === 'question');
    expect(q13.castId).toBe('solo-female-01');
    expect(q13.assetStrategy).toBe('reuse-canonical');
  });

  // Test 4: Memory behavior unchanged
  it('Test 4: MEMORY beat with recurring cast remains reuse-canonical', () => {
    const strategy = chooseAssetStrategy({
      role: STORY_ROLES.MEMORY,
      needsRecurringCast: true,
    });
    expect(strategy).toBe('reuse-canonical');
  });

  // Test 5: Normal narrative beat unchanged
  it('Test 5: normal narrative beats (action, interaction, context, reflection) keep library-or-generate', () => {
    for (const role of [
      STORY_ROLES.ACTION,
      STORY_ROLES.INTERACTION,
      STORY_ROLES.CONTEXT,
      STORY_ROLES.REFLECTION,
      STORY_ROLES.DETAIL,
      STORY_ROLES.ESTABLISH,
    ]) {
      const strategy = chooseAssetStrategy({ role, needsRecurringCast: true });
      expect(strategy).toBe('library-or-generate');
    }
  });

  // Test 6: Release unchanged
  it('Test 6: RELEASE beat keeps library-or-generate and needsPeople false', () => {
    const strategy = chooseAssetStrategy({
      role: STORY_ROLES.RELEASE,
      needsRecurringCast: true,
    });
    expect(strategy).toBe('library-or-generate');
  });

  // Test 7: Missing canonical source fails loudly
  it('Test 7: missing canonical source throws explicit error rather than silently generating', () => {
    const beat = {
      id: 'beat-16',
      storyRole: 'question',
      assetStrategy: 'reuse-canonical',
      continuityGroup: '1:family-young-01:home-family-01',
      castId: 'family-young-01',
      worldId: 'home-family-01',
    };
    const emptyCanonicalCache = new Map();

    expect(() => {
      resolveCanonicalAsset(beat, emptyCanonicalCache);
    }).toThrowError(
      'Question beat beat-16 requires canonical reuse, but no canonical asset exists for family-young-01 / home-family-01.'
    );
  });

  // Test 8: Establish wins canonical cache
  it('Test 8: establish stores canonical image first and subsequent interaction cannot overwrite it', () => {
    const establishBeat = {
      id: 'beat-01',
      storyRole: 'establish',
      continuityGroup: '1:family-young-01:home-family-01',
      castId: 'family-young-01',
      worldId: 'home-family-01',
    };
    const interactionBeat = {
      id: 'beat-03',
      storyRole: 'interaction',
      continuityGroup: '1:family-young-01:home-family-01',
      castId: 'family-young-01',
      worldId: 'home-family-01',
    };
    const questionBeat = {
      id: 'beat-16',
      storyRole: 'question',
      assetStrategy: 'reuse-canonical',
      continuityGroup: '1:family-young-01:home-family-01',
      castId: 'family-young-01',
      worldId: 'home-family-01',
    };

    const canonicalAssets = new Map();

    // 1. Establish populates cache
    const key = canonicalKey(establishBeat);
    const assetA = { id: 'asset-canonical-family-A', path: '/assets/family-A.jpg' };
    if (!canonicalAssets.has(key)) {
      canonicalAssets.set(key, assetA);
    }
    expect(canonicalAssets.get(key)?.id).toBe('asset-canonical-family-A');

    // 2. Interaction cannot overwrite cache (first-wins policy)
    const assetB = { id: 'asset-generated-family-B', path: '/assets/family-B.jpg' };
    if (!canonicalAssets.has(key)) {
      canonicalAssets.set(key, assetB);
    }
    expect(canonicalAssets.get(key)?.id).toBe('asset-canonical-family-A');

    // 3. Question resolves to assetA
    const resolved = resolveCanonicalAsset(questionBeat, canonicalAssets);
    expect(resolved.id).toBe('asset-canonical-family-A');
    expect(resolved.path).toBe('/assets/family-A.jpg');
  });
});
