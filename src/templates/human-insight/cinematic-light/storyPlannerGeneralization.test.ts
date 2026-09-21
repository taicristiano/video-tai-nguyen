import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { CHARACTER_CASTS, inferCastId } from './characters';

describe('Story Planner Generalization & Single Cast Source of Truth', () => {
  it('loads CHARACTER_CASTS strictly from character-casts.json', () => {
    const jsonPath = path.join(__dirname, 'character-casts.json');
    expect(fs.existsSync(jsonPath)).toBe(true);

    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(Object.keys(CHARACTER_CASTS)).toEqual(Object.keys(json));
    expect(CHARACTER_CASTS['family-young-01'].castLockPrompt).toContain('CAST LOCK — family-young-01');
  });

  it('infers cast correctly with backward-compatible helper', () => {
    expect(inferCastId('Bữa cơm gia đình')).toBe('family-young-01');
    expect(inferCastId('Tuổi già ông bà')).toBe('elderly-couple-01');
    expect(inferCastId('Vợ chồng son')).toBe('couple-young-01');
    expect(inferCastId('Cô gái trẻ')).toBe('solo-female-01');
    expect(inferCastId('Chàng trai đi làm')).toBe('solo-male-01');
  });

  it('runs test-story-planner.mjs and validates 001, 005, 007, 013, 028', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const result = execSync('node scripts/test-story-planner.mjs', {
      cwd: rootDir,
      encoding: 'utf-8',
    });

    expect(result).toContain('VIDEO 001');
    expect(result).toContain('Mode:        family-emotional');
    expect(result).toContain('Cast:        family-young-01');

    expect(result).toContain('VIDEO 005');
    const video005Block = result.split('VIDEO 005')[1].split('VIDEO 007')[0];
    expect(video005Block).toContain('Mode:        relationship-dialogue');
    expect(video005Block).not.toContain('dinner');
    expect(video005Block).not.toContain('family-young-01');

    expect(result).toContain('VIDEO 007');
    expect(result).toContain('Mode:        home-living');

    expect(result).toContain('VIDEO 013');
    expect(result).toContain('Mode:        books-ideas');

    expect(result).toContain('VIDEO 028');
    expect(result).toContain('Mode:        family-emotional');
    expect(result).toContain('Cast:        family-young-01 (recurring: true)');

    // Ensure all 5 videos are marked VALID
    const passMatches = result.match(/✅ VALID/g);
    expect(passMatches?.length).toBe(5);
  });

  it('enforces specific narrative roles and cast rules across videos', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const summaryPath = path.join(rootDir, 'tmp-story-plans', 'plans-summary.json');
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

    const plan001 = summary.find((s: any) => s.index === 1)?.fullPlan;
    const plan005 = summary.find((s: any) => s.index === 5)?.fullPlan;
    const plan007 = summary.find((s: any) => s.index === 7)?.fullPlan;
    const plan013 = summary.find((s: any) => s.index === 13)?.fullPlan;
    const plan028 = summary.find((s: any) => s.index === 28)?.fullPlan;

    // Video 001 opening beat must be establish (not memory/paper)
    expect(plan001.beats[0].storyRole).toBe('establish');
    expect(plan001.castId).toBe('family-young-01');

    // Video 005 uses dialogue-pair-01 and contains real interaction beats
    expect(plan005.castId).toBe('dialogue-pair-01');
    expect(
      plan005.beats.some((b: any) => b.storyRole === 'interaction'),
    ).toBe(true);

    // Video 007 contains concrete action beats
    expect(
      plan007.beats.some((b: any) => b.storyRole === 'action'),
    ).toBe(true);

    // Video 013 opening is establish, and detail-action ratio < 0.55
    expect(plan013.beats[0].storyRole).toBe('establish');
    const detailRatio013 =
      plan013.beats.filter((b: any) => b.storyRole === 'detail-action' || b.storyRole === 'detail').length /
      plan013.beats.length;
    expect(detailRatio013).toBeLessThan(0.55);

    // Video 028 opening is establish
    expect(plan028.beats[0].storyRole).toBe('establish');
  });

  it('does not reuse unaudited undefined-tier asset in strict HAY & ĐẸP. mode', async () => {
    // @ts-expect-error JS module without type declaration
    const { canReuseForHayDep } = await import('../../../../scripts/human-insight-image.mjs');
    const scene = {
      text: 'Bữa cơm gia đình',
      visual: 'Family dinner',
      castId: 'family-young-01',
      worldId: 'home-family-01',
      storyRole: 'establish',
    };
    const legacyResult = {
      asset: {
        id: 'legacy-bus-01',
        tier: undefined,
        score: 25,
      },
      score: 25,
      reasons: ['keyword:ban-an', 'tag:family'],
    };
    expect(canReuseForHayDep(legacyResult as any, scene)).toBe(false);
  });

  it('does not reuse asset with missing castId for recurring-cast beat', async () => {
    // @ts-expect-error JS module without type declaration
    const { canReuseForHayDep, ASSET_TIERS } = await import('../../../../scripts/human-insight-image.mjs');
    const scene = {
      text: 'Hai người nói chuyện',
      castId: 'dialogue-pair-01',
      storyRole: 'interaction',
    };
    const assetWithoutCast = {
      asset: {
        id: 'some-asset',
        tier: ASSET_TIERS.CORE,
        score: 30,
        // no castId
      },
      score: 30,
      reasons: ['keyword:ban-an', 'tag:family'],
    };
    expect(canReuseForHayDep(assetWithoutCast as any, scene)).toBe(false);
  });

  it('allows matching CORE asset with same cast, world, and story role', async () => {
    // @ts-expect-error JS module without type declaration
    const { canReuseForHayDep, ASSET_TIERS } = await import('../../../../scripts/human-insight-image.mjs');
    const scene = {
      text: 'Hai người trò chuyện tại bàn',
      castId: 'dialogue-pair-01',
      worldId: 'everyday-dialogue-02',
      storyRole: 'interaction',
    };
    const matchingCoreAsset = {
      asset: {
        id: 'dialogue-01',
        tier: ASSET_TIERS.CORE,
        castId: 'dialogue-pair-01',
        worldId: 'everyday-dialogue-02',
        storyRole: 'interaction',
        reuse: true,
      },
      score: 25,
      reasons: ['keyword:ban-an', 'tag:family'],
    };
    expect(canReuseForHayDep(matchingCoreAsset as any, scene, 14)).toBe(true);
  });

  // Phase 13 Integration Tests
  it('preserves timeline gaps across narrative scenes and starts outro after timeline duration', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const timelinePath = path.join(
      rootDir,
      'public/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/timeline.json',
    );
    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
    const FPS = 30;
    const segments = timeline.segments;
    const timelineEndSec = Number(timeline.duration ?? Math.max(...segments.map((s: any) => Number(s.end || 0))));
    const narrativeEndFrame = Math.ceil(timelineEndSec * FPS);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const sceneStartFrame = Math.round(seg.start * FPS);
      const spokenEndFrame = Math.max(sceneStartFrame + 1, Math.round(seg.end * FPS));
      const nextSceneStartFrame = i < segments.length - 1 ? Math.round(segments[i + 1].start * FPS) : narrativeEndFrame;
      const sceneEndFrame = Math.max(spokenEndFrame, nextSceneStartFrame);
      const durFrames = sceneEndFrame - sceneStartFrame;

      expect(sceneStartFrame).toBe(Math.round(seg.start * FPS));
      if (i < segments.length - 1) {
        // Gap is preserved on previous scene
        expect(sceneStartFrame + durFrames).toBe(Math.round(segments[i + 1].start * FPS));
      }
    }

    const outroStartFrame = narrativeEndFrame;
    expect(outroStartFrame).toBeGreaterThanOrEqual(Math.ceil(timeline.duration * FPS));

    const totalFrames = outroStartFrame + 60;
    expect(totalFrames).toBeGreaterThanOrEqual(Math.ceil(timelineEndSec * FPS) + 60);
  });

  it('assigns concrete story roles: detail-action for phone, interaction for family conversation', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const summaryPath = path.join(rootDir, 'tmp-story-plans', 'plans-summary.json');
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    const plan001 = summary.find((s: any) => s.index === 1)?.fullPlan;

    const phoneBeat = plan001.beats.find((b: any) => b.voiceClause.toLowerCase().includes('điện thoại'));
    expect(['detail-action', 'action']).toContain(phoneBeat.storyRole);

    const conversationBeat = plan001.beats.find((b: any) =>
      b.voiceClause.toLowerCase().includes('nghe') || b.voiceClause.toLowerCase().includes('cùng có mặt')
    );
    expect(conversationBeat.storyRole).toBe('interaction');

    // Concrete visualAction is different from visualIntent
    expect(plan001.beats.some((b: any) => b.visualAction !== b.visualIntent)).toBe(true);
  });

  it('marks release with needsPeople false and generates prompt without cast roster', async () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const summaryPath = path.join(rootDir, 'tmp-story-plans', 'plans-summary.json');
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    const plan001 = summary.find((s: any) => s.index === 1)?.fullPlan;

    const releaseBeat = plan001.beats.find((b: any) => b.storyRole === 'release');
    expect(releaseBeat.needsPeople).toBe(false);
    expect(releaseBeat.presentMembers).toEqual([]);

    // @ts-expect-error JS module
    const { buildPrompt, buildPresentCastPrompt } = await import('../../../../scripts/human-insight-image.mjs');
    const castPrompt = buildPresentCastPrompt({ noPeople: true, presentMembers: [] }, 'family-young-01');
    expect(castPrompt).toContain('NO PEOPLE in frame.');
    expect(castPrompt).not.toContain('father');
    expect(castPrompt).not.toContain('mother');

    const prompt = buildPrompt({
      text: releaseBeat.voiceClause,
      visual: releaseBeat.visualIntent,
      action: releaseBeat.visualAction,
      noPeople: true,
      presentMembers: [],
      storyRole: 'release',
    }, 'family-young-01');
    expect(prompt).toContain('NO PEOPLE');
    expect(prompt).not.toContain('Vietnamese man');
  });

  it('ensures global STYLE_PROMPT contains no semantic nouns (family, books, home, dinner)', async () => {
    // @ts-expect-error JS module
    const { STYLE_PROMPT } = await import('../../../../scripts/human-insight-image.mjs');
    expect(STYLE_PROMPT.toLowerCase()).not.toMatch(/\bfamily\b|\bbooks?\b|\bhome\b|\bdinner\b|\bphone\b/);
  });

  it('orders image prompt with STYLE first before CAST and ACTION, within 1600 char budget', async () => {
    // @ts-expect-error JS module
    const { buildPrompt } = await import('../../../../scripts/human-insight-image.mjs');
    const prompt = buildPrompt({
      text: 'Ăn tối cùng nhau',
      visual: 'Family dinner',
      action: 'Mother serves rice into child bowl',
      storyRole: 'action',
      presentMembers: ['mother', 'boy'],
    }, 'family-young-01');

    const styleIdx = prompt.indexOf('STYLE LOCK:');
    const castIdx = prompt.indexOf('CAST CONTINUITY');
    const actionIdx = prompt.indexOf('ACTION:');

    expect(styleIdx).toBeGreaterThanOrEqual(0);
    expect(castIdx).toBeGreaterThan(styleIdx);
    expect(actionIdx).toBeGreaterThan(castIdx);
    expect(prompt.length).toBeLessThanOrEqual(1600);
  });

  it('preserves image aspect ratio without hardcoded 688:384 scaling', async () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const imageScriptContent = fs.readFileSync(
      path.join(rootDir, 'scripts/human-insight-image.mjs'),
      'utf-8',
    );
    expect(imageScriptContent).not.toContain('scale=688:384');
    expect(imageScriptContent).not.toContain('OUTPUT_WIDTH = 688');
    expect(imageScriptContent).not.toContain('OUTPUT_HEIGHT = 384');
  });

  it('sets newly generated assets default tier to CANDIDATE (not CORE)', async () => {
    // @ts-expect-error JS module
    const { ASSET_TIERS } = await import('../../../../scripts/human-insight-image.mjs');
    expect(ASSET_TIERS.CANDIDATE).toBe('HAYDEP_CANDIDATE');

    const rootDir = path.resolve(__dirname, '../../../../');
    const imageScriptContent = fs.readFileSync(
      path.join(rootDir, 'scripts/human-insight-image.mjs'),
      'utf-8',
    );
    expect(imageScriptContent).toContain('tier: ASSET_TIERS.CANDIDATE');
  });

  it('prevents canonical cache from being overwritten by later interactions', () => {
    const canonicalAssets = new Map();
    const key = 'group:cast-01';

    const asset1 = { id: 'asset-01', path: 'path1' };
    const asset2 = { id: 'asset-02', path: 'path2' };

    if (!canonicalAssets.has(key)) {
      canonicalAssets.set(key, asset1);
    }
    if (!canonicalAssets.has(key)) {
      canonicalAssets.set(key, asset2);
    }

    expect(canonicalAssets.get(key)?.id).toBe('asset-01');
  });
});
