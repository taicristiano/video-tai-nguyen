import { describe, it, expect } from 'vitest';
// @ts-expect-error JS module
import { buildStoryPlan, validateStoryPlan } from '../scripts/human-insight-story-planner.mjs';
// @ts-expect-error JS module
import { buildPresentCastPrompt } from '../scripts/human-insight-image.mjs';
// @ts-expect-error JS module
import { parseHayDepVideos } from '../scripts/parse-hay-dep-videos.mjs';

describe('Cast Member Key Contract (Parallel Fix 05)', () => {
  // Test 1: Video 005 uses real member IDs
  it('Test 1: Video 005 uses real member IDs (speaker, listener) and never man, woman', () => {
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
    expect(plan.castId).toBe('dialogue-pair-01');

    const nonReleaseBeats = plan.beats.filter((b: any) => b.storyRole !== 'release');
    for (const beat of nonReleaseBeats) {
      expect(beat.presentMembers).toEqual(['speaker', 'listener']);
      expect(beat.presentMembers).not.toContain('man');
      expect(beat.presentMembers).not.toContain('woman');
    }
  });

  // Test 2: Relationship release has no people
  it('Test 2: relationship release beat has empty presentMembers and triggers no people', () => {
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

    const { plan } = buildStoryPlan(v5, segments);
    const releaseBeat = plan.beats.find((b: any) => b.storyRole === 'release');
    expect(releaseBeat).toBeDefined();
    expect(releaseBeat.presentMembers).toEqual([]);

    const prompt = buildPresentCastPrompt(
      { noPeople: true, presentMembers: releaseBeat.presentMembers },
      releaseBeat.castId
    );
    expect(prompt).toContain('NO PEOPLE in frame.');
  });

  // Test 3: Prompt builder includes both cast descriptions
  it('Test 3: prompt builder includes both cast descriptions from character-casts.json', () => {
    const prompt = buildPresentCastPrompt(
      { noPeople: false, presentMembers: ['speaker', 'listener'] },
      'dialogue-pair-01'
    );

    expect(prompt).toContain('speaker:');
    expect(prompt).toContain('listener:');
    expect(prompt).toContain('Vietnamese adult, 27–32, fixed oval facial design');
    expect(prompt).toContain('Vietnamese adult, 27–32, distinct fixed soft facial design');
  });

  // Test 4: Invalid requested member throws
  it('Test 4: invalid requested member throws error with cast ID, invalid member, and valid member list', () => {
    expect(() => {
      buildPresentCastPrompt(
        { noPeople: false, presentMembers: ['man', 'woman'] },
        'dialogue-pair-01'
      );
    }).toThrowError(/Invalid cast member "man" for cast "dialogue-pair-01"\. Valid members: speaker, listener/);
  });

  // Test 5: Plan validation catches invalid key
  it('Test 5: plan validation fails when a beat contains invalid presentMembers for its cast', () => {
    const plan = {
      needsRecurringCast: true,
      castId: 'dialogue-pair-01',
      beats: [
        {
          id: 'beat-04',
          visualIntent: 'A sufficiently long and descriptive visual intent string for validation.',
          presentMembers: ['man', 'woman'],
        },
      ],
    };

    const validation = validateStoryPlan(plan);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'beat-04: invalid presentMembers [man, woman] for cast dialogue-pair-01; valid members: [speaker, listener].'
    );
  });

  // Test 6: Valid member keys pass validation
  it('Test 6: valid member keys pass plan validation without errors', () => {
    const plan = {
      needsRecurringCast: true,
      castId: 'dialogue-pair-01',
      beats: [
        {
          id: 'beat-04',
          visualIntent: 'A sufficiently long and descriptive visual intent string for validation.',
          presentMembers: ['speaker', 'listener'],
        },
      ],
    };

    const validation = validateStoryPlan(plan);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });
});
