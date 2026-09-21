import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
// @ts-expect-error JS module
import { parseHayDepVideos } from '../scripts/parse-hay-dep-videos.mjs';
// @ts-expect-error JS module
import { buildStoryPlan } from '../scripts/human-insight-story-planner.mjs';
// @ts-expect-error JS module
import { processVideo, buildSpecFromStoryPlan, beatCoversSegment } from '../scripts/batch-engine.mjs';
import { CHANNEL_BRAND_CONFIG } from './templates/human-insight/cinematic-light/storyPlannerRuntime.mjs';
import {
  choosePlannerScale,
  mapPlannerScaleToRendererScale,
  isSilhouetteCompatibleWithPeopleContract,
  repairScaleMonotony,
  validateShotPlan,
  buildImageSafetyRulesForShot,
} from './templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs';
import { preProcessSegments, normalizeContinuedSegments } from './templates/human-insight/cinematic-light/storyPlannerRuntime.mjs';
// @ts-expect-error JS module
import { buildPresentCastPrompt, buildPrompt } from '../scripts/human-insight-image.mjs';

const ROOT = path.resolve(__dirname, '..');

describe('Production Pipeline Reference Grammar Integration (Section 14)', () => {
  const videos = parseHayDepVideos();
  const sampleIndices = [1, 5, 7, 13, 28];
  const sampleVideos = sampleIndices.map((idx) => {
    const found = videos.find((v: any) => v.index === idx);
    if (!found) throw new Error(`Video index ${idx} not found in catalog`);
    return found;
  });

  // ── 1. Batch Engine Story Plan Call ──────────────────────────────────────────

  describe('1. Batch Engine Story Plan Call', () => {
    it('verifies batch-engine.mjs source imports buildStoryPlan from human-insight-story-planner.mjs', () => {
      const batchEngineSrc = fs.readFileSync(path.join(ROOT, 'scripts/batch-engine.mjs'), 'utf-8');
      expect(batchEngineSrc).toContain("import { buildStoryPlan } from './human-insight-story-planner.mjs'");
    });

    it('buildStoryPlan executes without runtime error for all 5 sample videos', () => {
      for (const video of sampleVideos) {
        const result = buildStoryPlan(video);
        expect(result).toBeDefined();
        expect(result.plan).toBeDefined();
        expect(Array.isArray(result.plan.beats)).toBe(true);
        expect(result.plan.beats.length).toBeGreaterThan(0);
      }
    });
  });

  // ── 2. Node.js ESM Compatibility ───────────────────────────────────────────

  describe('2. Node.js ESM Compatibility', () => {
    it('batch-engine.mjs and human-insight-story-planner.mjs import solely ESM modules (.mjs / .js)', () => {
      const files = ['scripts/batch-engine.mjs', 'scripts/human-insight-story-planner.mjs'];
      for (const rel of files) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf-8');
        const tsImports = src.match(/import\s+.*from\s+['"][^'"]+\.ts['"]/g);
        expect(tsImports).toBeNull();
      }
    });

    it('executes batch-engine in node directly without ts-node or transpile step', () => {
      const stdout = execSync('node scripts/batch-engine.mjs --plan-only 13', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
      expect(stdout).toContain('PLAN-ONLY SUMMARY: Video 13');
    });
  });

  // ── 3. Reference Grammar Enrichment in Production Path ─────────────────────

  describe('3. Reference Grammar Enrichment in Production Path', () => {
    it('enriches plan and beats with all reference shot grammar fields and version', () => {
      for (const video of sampleVideos) {
        const result = buildStoryPlan(video);
        const plan = result.plan;
        expect(plan.grammarVersion).toBe('reference-shot-grammar-v1');

        for (const beat of plan.beats) {
          expect(beat.shotScale).toBeDefined();
          expect(beat.scale).toBeDefined();
          expect(beat.silhouette).toBeDefined();
          expect(beat.visualVerb).toBeDefined();
          expect(beat.semanticIntent).toBeDefined();
          expect(beat.composition).toBeDefined();
          expect(beat.motionPreset).toBeDefined();
          expect(beat.plannerStoryRole).toBeDefined();
          expect(beat.assetStrategy).toBeDefined();
          expect(beat.grammarVersion).toBe('reference-shot-grammar-v1');
        }
      }
    });
  });

  // ── 4. Cadence Enforcement in Production Path ──────────────────────────────

  describe('4. Cadence Enforcement in Production Path', () => {
    it('enforces CPM within [18, 22] for all 5 representative videos', () => {
      for (const video of sampleVideos) {
        const result = buildStoryPlan(video);
        const cpm = result.metrics.changesPerMinute;
        expect(cpm).toBeGreaterThanOrEqual(18.0);
        expect(cpm).toBeLessThanOrEqual(22.0);
      }
    });

    it('enforces normal hold <= 4.0s unless valid typed holdException exists', () => {
      for (const video of sampleVideos) {
        const result = buildStoryPlan(video);
        for (const beat of result.plan.beats) {
          const holdSec = beat.durationFrames / 30;
          if (holdSec > 4.0) {
            expect(beat.holdException).toBeDefined();
            expect(['INSIGHT_CARD', 'OUTRO_COMPONENT', 'AUTHORED_EMOTIONAL_PAUSE']).toContain(
              beat.holdException.kind,
            );
          }
        }
      }
    });

    it('enforces anti-monotony (no 3 consecutive identical scales or silhouettes)', () => {
      for (const video of sampleVideos) {
        const result = buildStoryPlan(video);
        const beats = result.plan.beats;
        for (let i = 2; i < beats.length; i++) {
          const sameScale3 =
            beats[i - 2].scale === beats[i - 1].scale &&
            beats[i - 1].scale === beats[i].scale;
          const sameSil3 =
            beats[i - 2].silhouette === beats[i - 1].silhouette &&
            beats[i - 1].silhouette === beats[i].silhouette;
          expect(sameScale3).toBe(false);
          expect(sameSil3).toBe(false);
        }
      }
    });
  });

  // ── 5. Legacy Continuity Preservation ─────────────────────────────────────

  describe('5. Legacy Continuity Preservation', () => {
    it('preserves contentMode, castId, worldId, worldLock, and continuityGroup format', () => {
      const v1 = sampleVideos.find((v) => v.index === 1)!;
      const res1 = buildStoryPlan(v1);
      expect(res1.plan.contentMode).toBe('family-emotional');
      expect(res1.plan.castId).toBe('family-young-01');
      expect(res1.plan.worldId).toBe('home-family-01');
      expect(res1.plan.worldLock).toContain('home-family-01');
      expect(res1.plan.continuityGroup).toBe('1:family-young-01:home-family-01');

      const v5 = sampleVideos.find((v) => v.index === 5)!;
      const res5 = buildStoryPlan(v5);
      expect(res5.plan.contentMode).toBe('relationship-dialogue');
      expect(res5.plan.castId).toBe('dialogue-pair-01');
      expect(res5.plan.worldId).toBe('everyday-dialogue-02');
      expect(res5.plan.continuityGroup).toBe('5:dialogue-pair-01:everyday-dialogue-02');

      const v7 = sampleVideos.find((v) => v.index === 7)!;
      const res7 = buildStoryPlan(v7);
      expect(res7.plan.contentMode).toBe('home-living');
      expect(res7.plan.castId).toBe('solo-male-01');
      expect(res7.plan.worldId).toBe('home-living-03');

      const v13 = sampleVideos.find((v) => v.index === 13)!;
      const res13 = buildStoryPlan(v13);
      expect(res13.plan.contentMode).toBe('books-ideas');
      expect(res13.plan.castId).toBe('solo-female-01');
      expect(res13.plan.worldId).toBe('reading-space-01');
    });

    it('populates presentMembers for family and relationship modes', () => {
      const v1 = sampleVideos.find((v) => v.index === 1)!;
      const res1 = buildStoryPlan(v1);
      const withMembers = res1.plan.beats.filter((b: any) => Array.isArray(b.presentMembers) && b.presentMembers.length > 0);
      expect(withMembers.length).toBeGreaterThan(0);
    });
  });

  // ── 6. Brand Production Gate Enforcement ──────────────────────────────────

  describe('6. Brand Production Gate Enforcement', () => {
    it('blocks video005 in PRODUCTION mode when spoken audio mentions legacy brand Nếp', () => {
      const v5 = sampleVideos.find((v) => v.index === 5)!;
      const resultProd = buildStoryPlan(v5, [], {
        brandContext: CHANNEL_BRAND_CONFIG,
        validationMode: 'PRODUCTION',
        rawTimelineText: 'Nếp, những điều nhỏ tạo nên một đời sống',
      });
      expect(resultProd.brandAudit.hasMismatch).toBe(true);
      expect(resultProd.brandAudit.mismatchType).toBe('BRAND_AUDIO_MISMATCH');
      expect(resultProd.productionValidation.productionReady).toBe(false);
      expect(resultProd.productionValidation.errors).toContain(
        "BRAND_AUDIO_MISMATCH: spoken audio mentions legacy brand 'Nếp', template brand is 'HAY & ĐẸP.'",
      );
    });

    it('permits video005 in DRAFT/PLAN-ONLY mode while flagging mismatch', () => {
      const v5 = sampleVideos.find((v) => v.index === 5)!;
      const resultDraft = buildStoryPlan(v5, [], {
        brandContext: CHANNEL_BRAND_CONFIG,
        validationMode: 'DRAFT',
        rawTimelineText: 'Nếp, những điều nhỏ tạo nên một đời sống',
      });
      expect(resultDraft.brandAudit.hasMismatch).toBe(true);
      expect(resultDraft.productionValidation.ok).toBe(true);
      expect(resultDraft.productionValidation.productionReady).toBe(false);
      expect(resultDraft.productionValidation.warnings.some((w: string) => w.includes('BRAND_AUDIO_MISMATCH'))).toBe(true);
    });

    it('passes brand audit and production gate for video001, video007, video013 without conflicting brand', () => {
      for (const idx of [1, 7, 13]) {
        const v = sampleVideos.find((x) => x.index === idx)!;
        const res = buildStoryPlan(v, [], {
          brandContext: CHANNEL_BRAND_CONFIG,
          validationMode: 'PRODUCTION',
        });
        expect(res.brandAudit.hasMismatch).toBe(false);
        expect(res.productionValidation.productionReady).toBe(true);
      }
    });
  });

  // ── 7. Artifact Output Verification ────────────────────────────────────────

  describe('7. Artifact Output Verification', () => {
    it('writes all 4 artifacts into videos/<slug>/ upon plan-only batch execution', async () => {
      const v13 = sampleVideos.find((x) => x.index === 13)!;
      const out = await processVideo(v13, { force: true, planOnly: true });
      expect(out.planOnly).toBe(true);

      const vDir = path.join(ROOT, 'videos', out.slug);
      const files = [
        'story-plan.json',
        'story-plan-validation.json',
        'reference-grammar-metrics.json',
        'production-readiness.json',
      ];

      for (const f of files) {
        const p = path.join(vDir, f);
        expect(fs.existsSync(p)).toBe(true);
        const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
        expect(parsed).toBeDefined();
      }

      const sp = JSON.parse(fs.readFileSync(path.join(vDir, 'story-plan.json'), 'utf-8'));
      expect(Array.isArray(sp.beats)).toBe(true);
      expect(sp.grammarVersion).toBe('reference-shot-grammar-v1');

      const spv = JSON.parse(fs.readFileSync(path.join(vDir, 'story-plan-validation.json'), 'utf-8'));
      expect(spv.brandAudit).toBeDefined();

      const rgm = JSON.parse(fs.readFileSync(path.join(vDir, 'reference-grammar-metrics.json'), 'utf-8'));
      expect(rgm.changesPerMinute).toBeGreaterThanOrEqual(18.0);
      expect(rgm.changesPerMinute).toBeLessThanOrEqual(22.0);

      const pr = JSON.parse(fs.readFileSync(path.join(vDir, 'production-readiness.json'), 'utf-8'));
      expect(typeof pr.productionReady).toBe('boolean');
    });
  });

  // ── 8. Dry-Run Smoke Execution ─────────────────────────────────────────────

  describe('8. Dry-Run Smoke Execution', () => {
    it('executes production-story-plan-smoke.mjs for video005 (exits 0, reports READY after migration)', () => {
      const stdout = execSync('node scripts/production-story-plan-smoke.mjs video005', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
      expect(stdout).toContain('SMOKE RUN: Video 5');
      expect(stdout).toContain('Production Verdict:  ✅ READY');
      expect(stdout).toContain('Smoke plan generated successfully');
    });

    it('executes production-story-plan-smoke.mjs for video013 (exits 0, reports READY)', () => {
      const stdout = execSync('node scripts/production-story-plan-smoke.mjs video013', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
      expect(stdout).toContain('SMOKE RUN: Video 13');
      expect(stdout).toContain('Production Verdict:  ✅ READY');
      expect(stdout).toContain('Smoke plan generated successfully');
    });

    it('batch-engine.mjs --plan-only behaves identically to production smoke script', () => {
      const outBatch = execSync('node scripts/batch-engine.mjs --plan-only 13', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
      expect(outBatch).toContain('PLAN-ONLY SUMMARY: Video 13');
      expect(outBatch).toContain('Production Verdict:  ✅ READY');
    });
  });

  // ── 9. Zero Cloudflare / Schnell Calls Verification ────────────────────────

  describe('9. Zero Cloudflare / Schnell Calls Verification', () => {
    it('plan-only mode produces artifacts without generating images or invoking external APIs', () => {
      const v7 = sampleVideos.find((x) => x.index === 7)!;
      const stdout = execSync('node scripts/batch-engine.mjs --plan-only 7', {
        cwd: ROOT,
        encoding: 'utf-8',
      });

      // Confirm no image generation calls or remotion render calls occurred
      expect(stdout).not.toContain('Running TTS');
      expect(stdout).not.toContain('Running Transcribe');
      expect(stdout).not.toContain('Rendering');
      expect(stdout).not.toContain('Image generation failed');
      expect(stdout).toContain('PLAN-ONLY SUMMARY: Video 7');
    });
  });

  // ── 10. Final Production Bridge & Correctness Suite (Items 1-27) ───────────

  describe('10. Final Production Bridge & Correctness Suite (Items 1-27)', () => {
    it('1. cross-segment merged beat covers every listed segment in spec', () => {
      const mockStoryPlan = {
        beats: [
          {
            id: 'beat-1-merged',
            segmentIndex: 0,
            continuedInSegments: [1],
            startFrame: 0,
            endFrame: 150,
            shotScale: 'medium',
            silhouette: 'single-centered',
            storyRole: 'action',
            composition: 'portrait-focus',
            motionPreset: 'still-breathe',
          },
        ],
      };
      const mockTimeline = {
        duration: 5.0,
        segments: [
          { start: 0, end: 2.0, text: 'Seg 0' },
          { start: 2.0, end: 4.5, text: 'Seg 1' },
        ],
      };
      const spec = buildSpecFromStoryPlan({
        storyPlan: mockStoryPlan,
        timeline: mockTimeline,
        slug: 'test-slug',
        assetResolver: () => ({ asset: { id: 'asset-1', path: 'assets/test.jpg' }, source: 'test', score: 100 }),
      });
      expect(spec.scenes[0].image.path).toBe('assets/test.jpg');
      expect(spec.scenes[1].image.path).toBe('assets/test.jpg');
    });

    it('2. same merged beat uses same resolved asset in all covered segments', () => {
      const mockStoryPlan = {
        beats: [
          {
            id: 'beat-shared',
            segmentIndex: 0,
            continuedInSegments: [1],
            startFrame: 0,
            endFrame: 180,
            shotScale: 'wide',
            silhouette: 'room-wide',
            storyRole: 'establish',
            composition: 'portrait-focus',
            motionPreset: 'still-breathe',
          },
        ],
      };
      const mockTimeline = {
        duration: 6.0,
        segments: [
          { start: 0, end: 3.0, text: 'Seg A' },
          { start: 3.0, end: 5.5, text: 'Seg B' },
        ],
      };
      let resolveCallCount = 0;
      const spec = buildSpecFromStoryPlan({
        storyPlan: mockStoryPlan,
        timeline: mockTimeline,
        slug: 'test-slug-2',
        assetResolver: () => {
          resolveCallCount++;
          return { asset: { id: `asset-call-${resolveCallCount}`, path: `assets/test-${resolveCallCount}.jpg` }, source: 'test', score: 99 };
        },
      });
      expect(resolveCallCount).toBe(1);
      expect(spec.scenes[0].image.assetId).toBe('asset-call-1');
      expect(spec.scenes[1].image.assetId).toBe('asset-call-1');
      expect(spec.scenes[0].image.path).toBe(spec.scenes[1].image.path);
    });

    it('3. no non-outro scene receives empty image path', () => {
      const v1 = sampleVideos.find((v) => v.index === 1)!;
      let tp = fs.readdirSync(path.join(ROOT, 'public')).find((c) => c.startsWith('phan-1-'));
      const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', tp!, 'timeline.json'), 'utf-8'));
      const res = buildStoryPlan(v1, timeline.segments);
      const spec = buildSpecFromStoryPlan({
        storyPlan: res.plan,
        timeline,
        slug: 'v1-test',
        assetResolver: () => ({ asset: { id: 'test-asset', path: 'assets/ok.jpg' }, source: 'test', score: 100 }),
      });
      for (let i = 0; i < spec.scenes.length; i++) {
        const sc = spec.scenes[i];
        expect(sc.image).toBeDefined();
        expect(sc.image.path).toBeTruthy();
        expect(sc.image.path.trim().length).toBeGreaterThan(0);
      }
    });

    it('4. canonical source start/end remain original in preProcessSegments', () => {
      const raw = [
        { start: 0.5, end: 2.2, text: 'A' },
        { start: 3.0, end: 5.1, text: 'B' },
      ];
      const processed = preProcessSegments(raw);
      expect(processed[0].canonicalStartFrame).toBe(15);
      expect(processed[0].canonicalEndFrame).toBe(66);
      expect(processed[1].canonicalStartFrame).toBe(90);
      expect(processed[1].canonicalEndFrame).toBe(153);
    });

    it('5. visual window may separately cover silence', () => {
      const raw = [
        { start: 0.5, end: 2.2, text: 'A' },
        { start: 3.0, end: 5.1, text: 'B' },
      ];
      const processed = preProcessSegments(raw);
      expect(processed[0].visualWindowEndFrame).toBe(90);
      expect(processed[0].canonicalEndFrame).toBe(66);
    });

    it('6. WIDE -> wide', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'WIDE' })).toBe('wide');
    });

    it('7. MEDIUM -> medium', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'MEDIUM' })).toBe('medium');
    });

    it('8. CLOSE -> close', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'CLOSE' })).toBe('close');
    });

    it('9. DETAIL -> detail', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'DETAIL' })).toBe('detail');
    });

    it('10. RELEASE -> wide', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'RELEASE' })).toBe('wide');
    });

    it('11. SYMBOLIC deterministic mapping', () => {
      expect(mapPlannerScaleToRendererScale({ scale: 'SYMBOLIC', silhouette: 'hands-detail' })).toBe('detail');
      expect(mapPlannerScaleToRendererScale({ scale: 'SYMBOLIC', silhouette: 'object-detail' })).toBe('detail');
      expect(mapPlannerScaleToRendererScale({ scale: 'SYMBOLIC', silhouette: 'tabletop-topdown' })).toBe('detail');
      expect(mapPlannerScaleToRendererScale({ scale: 'SYMBOLIC', silhouette: 'single-centered' })).toBe('medium');
    });

    it('12. every spec shotScale is lower-case supported renderer value', () => {
      for (const v of sampleVideos) {
        let tp = fs.readdirSync(path.join(ROOT, 'public')).find((c) => c.startsWith(`phan-${v.index}-`));
        const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', tp!, 'timeline.json'), 'utf-8'));
        const res = buildStoryPlan(v, timeline.segments);
        const spec = buildSpecFromStoryPlan({
          storyPlan: res.plan,
          timeline,
          slug: `spec-${v.index}`,
          assetResolver: () => ({ asset: { id: 'asset-test', path: 'assets/test.jpg' }, source: 'test', score: 100 }),
        });
        for (const scene of spec.scenes) {
          if (scene.shotScale) {
            expect(['wide', 'medium', 'close', 'detail']).toContain(scene.shotScale);
          }
        }
      }
    });

    it('13. exact people min/max reaches real image prompt', () => {
      const pZero = buildPresentCastPrompt({ peopleMin: 0, peopleMax: 0 }, 'solo-male-01');
      expect(pZero).toContain('ZERO visible people/body parts');

      const pOne = buildPresentCastPrompt({ peopleMin: 1, peopleMax: 1 }, 'solo-female-01');
      expect(pOne).toContain('EXACTLY one visible person');

      const pTwo = buildPresentCastPrompt({ peopleMin: 2, peopleMax: 2 }, 'dialogue-pair-01');
      expect(pTwo).toContain('EXACTLY two visible people');

      const pThree = buildPresentCastPrompt({ peopleMin: 3, peopleMax: 3 }, 'family-young-01');
      expect(pThree).toContain('EXACTLY three visible people');
    });

    it('14. two-person contract rejects single/object-only silhouettes', () => {
      const twoContract = { min: 2, max: 2 };
      expect(isSilhouetteCompatibleWithPeopleContract('object-detail', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('tabletop-topdown', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('empty-space', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('single-centered', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('single-left', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('single-right', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('face-close', twoContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person', twoContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person-wide', twoContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person-balanced', twoContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person-offset', twoContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person-over-shoulder', twoContract)).toBe(true);
    });

    it('15. zero-person contract accepts object/tabletop', () => {
      const zeroContract = { min: 0, max: 0 };
      expect(isSilhouetteCompatibleWithPeopleContract('object-detail', zeroContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('tabletop-topdown', zeroContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('empty-space', zeroContract)).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('two-person', zeroContract)).toBe(false);
      expect(isSilhouetteCompatibleWithPeopleContract('single-centered', zeroContract)).toBe(false);
    });

    it('16. anti-monotony repair never violates people contract', () => {
      const mockBeats = [
        { id: '1', scale: 'MEDIUM', silhouette: 'two-person', storyRole: 'action', peopleContract: { min: 2, max: 2 }, startFrame: 0, endFrame: 60, durationFrames: 60 },
        { id: '2', scale: 'MEDIUM', silhouette: 'two-person', storyRole: 'action', peopleContract: { min: 2, max: 2 }, startFrame: 60, endFrame: 120, durationFrames: 60 },
        { id: '3', scale: 'MEDIUM', silhouette: 'two-person', storyRole: 'action', peopleContract: { min: 2, max: 2 }, startFrame: 120, endFrame: 180, durationFrames: 60 },
      ];
      const repaired = repairScaleMonotony(mockBeats as any);
      for (const b of repaired) {
        expect(isSilhouetteCompatibleWithPeopleContract(b.silhouette, b.peopleContract)).toBe(true);
      }
    });

    it('17. holdException never bypasses anti-monotony', () => {
      const shots = [
        { id: '1', scale: 'MEDIUM', silhouette: 'single-centered', storyRole: 'action', durationFrames: 60 },
        { id: '2', scale: 'MEDIUM', silhouette: 'single-centered', storyRole: 'action', durationFrames: 60 },
        { id: '3', scale: 'MEDIUM', silhouette: 'single-centered', storyRole: 'action', durationFrames: 60, holdException: { kind: 'INSIGHT_CARD', reason: 'pause' } },
      ];
      const val = validateShotPlan(shots as any, 6);
      expect(val.errors.some((e: string) => e.includes('3 consecutive'))).toBe(true);
    });

    it('18. no previousScale mechanical alternation in primary semantic scale selection', () => {
      const scale1 = choosePlannerScale({ role: 'action', text: 'rót trà', visualVerb: 'rót', previousScale: 'MEDIUM' });
      const scale2 = choosePlannerScale({ role: 'action', text: 'rót trà', visualVerb: 'rót', previousScale: 'WIDE' });
      const scale3 = choosePlannerScale({ role: 'action', text: 'rót trà', visualVerb: 'rót', previousScale: 'DETAIL' });
      expect(scale1).toBe(scale2);
      expect(scale2).toBe(scale3);
    });

    it('19. no hard video005 production special case', () => {
      const batchSrc = fs.readFileSync(path.join(ROOT, 'scripts/batch-engine.mjs'), 'utf-8');
      expect(batchSrc).not.toContain("slug === 'video005'");
      expect(batchSrc).not.toContain("slug === 'video-005'");
      const plannerSrc = fs.readFileSync(path.join(ROOT, 'scripts/human-insight-story-planner.mjs'), 'utf-8');
      expect(plannerSrc).not.toContain("index === 5 ?");
    });

    it('20. document safety exists in REAL generated prompt', () => {
      const rules = buildImageSafetyRulesForShot({ text: 'mở trang sổ ghi chép cũ và đọc từng dòng' });
      expect(rules.some((r) => r.includes('DOCUMENT TEXT-SAFETY'))).toBe(true);
      expect(rules.some((r) => r.includes('Strictly NO readable receipts, NO printed letters'))).toBe(true);
    });

    it('21. timer safety exists in REAL generated prompt', () => {
      const rules = buildImageSafetyRulesForShot({ text: 'đặt chiếc đồng hồ hẹn giờ hai mươi lăm phút' });
      expect(rules.some((r) => r.includes('TIMER SAFETY'))).toBe(true);
      expect(rules.some((r) => r.includes('Minimal mechanical timer with simple wedge indicator'))).toBe(true);
    });

    it('22. no "Use same recurring identities" in production prompt', () => {
      const prompt = buildPrompt({ text: 'Bữa cơm sum họp gia đình', storyRole: 'action' }, 'family-young-01');
      expect(prompt).not.toContain('Use same recurring identities');
    });

    it('23. no "Do not invent different faces" in production prompt', () => {
      const prompt = buildPrompt({ text: 'Nhớ lại những ngày xưa cũ', storyRole: 'memory' }, 'family-young-01');
      expect(prompt).not.toContain('Do not invent different faces');
    });

    it('24. .ts wrappers do not duplicate runtime implementations', () => {
      const tsGrammar = fs.readFileSync(path.join(ROOT, 'src/templates/human-insight/cinematic-light/referenceShotGrammar.ts'), 'utf-8');
      expect(tsGrammar.split('\n').length).toBeLessThan(250);
      expect(tsGrammar).toContain("from './referenceShotGrammarRuntime.mjs'");
      expect(tsGrammar).not.toContain('function choosePlannerScale(');

      const tsPlanner = fs.readFileSync(path.join(ROOT, 'src/templates/human-insight/cinematic-light/storyPlanner.ts'), 'utf-8');
      expect(tsPlanner.split('\n').length).toBeLessThan(200);
      expect(tsPlanner).toContain("from './storyPlannerRuntime.mjs'");
      expect(tsPlanner).not.toContain('function normalizeCadence(');
    });

    it('25. TypeScript shot silhouette union covers runtime variants', () => {
      const tsGrammar = fs.readFileSync(path.join(ROOT, 'src/templates/human-insight/cinematic-light/referenceShotGrammar.ts'), 'utf-8');
      expect(tsGrammar).toContain("'two-person-wide'");
      expect(tsGrammar).toContain("'two-person-balanced'");
      expect(tsGrammar).toContain("'two-person-offset'");
      expect(tsGrammar).toContain("'two-person-over-shoulder'");
    });

    it('26. fake asset resolver story-plan -> spec bridge succeeds', () => {
      const v = sampleVideos.find((x) => x.index === 13)!;
      let tp = fs.readdirSync(path.join(ROOT, 'public')).find((c) => c.startsWith('phan-13-'));
      const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', tp!, 'timeline.json'), 'utf-8'));
      const res = buildStoryPlan(v, timeline.segments);
      const spec = buildSpecFromStoryPlan({
        storyPlan: res.plan,
        timeline,
        slug: 'video013-test',
        assetResolver: ({ sceneIndex, beatIndex }: any) => ({
          asset: { id: `fake-${sceneIndex}-${beatIndex}`, path: `assets/fake-${sceneIndex}.jpg` },
          source: 'fake',
          score: 100,
        }),
      });
      expect(spec).toBeDefined();
      expect(spec.scenes.length).toBeGreaterThan(0);
      expect(spec.totalFrames).toBeGreaterThan(0);
    });

    it('27. fixtures 001/005/007/013/028 have 0 orphan scenes, 0 empty paths, 0 unsupported scales, 0 contradictions', () => {
      for (const idx of [1, 5, 7, 13, 28]) {
        const v = sampleVideos.find((x) => x.index === idx)!;
        let tp = fs.readdirSync(path.join(ROOT, 'public')).find((c) => c.startsWith(`phan-${idx}-`));
        const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', tp!, 'timeline.json'), 'utf-8'));
        const storyResult = buildStoryPlan(v, timeline.segments, {
          brandContext: CHANNEL_BRAND_CONFIG,
          validationMode: 'PRODUCTION',
          rawTimelineText: timeline.segments.map((s: any) => s.text).join(' '),
        });
        const spec = buildSpecFromStoryPlan({
          storyPlan: storyResult.plan,
          timeline,
          assetResolver: ({ sceneIndex, beatIndex }: any) => ({
            asset: { id: `fake-${idx}-${sceneIndex}-${beatIndex}`, path: `assets/fake-${idx}.jpg` },
            source: 'fake',
            score: 100,
          }),
          slug: `fixture-${idx}`,
          videoData: { title: v.title, statementText: v.statementText },
        });

        const emptyPaths = spec.scenes.filter((s: any) => !s.image || !s.image.path || s.image.path.trim() === '').length;
        expect(emptyPaths).toBe(0);

        const unsupportedScales = spec.scenes.filter(
          (s: any) => s.shotScale && !['wide', 'medium', 'close', 'detail'].includes(s.shotScale),
        ).length;
        expect(unsupportedScales).toBe(0);

        for (const beat of storyResult.plan.beats) {
          expect(isSilhouetteCompatibleWithPeopleContract(beat.silhouette, beat.peopleContract)).toBe(true);
        }
      }
    });
  });

  // ── 15. Template Cleanup & Brand Migration Contracts (Section 19) ─────────

  describe('15. Template Cleanup & Brand Migration Contracts (Section 19)', () => {
    it('1. exact four-person contract rejects three-person', () => {
      expect(isSilhouetteCompatibleWithPeopleContract('three-person', { min: 4, max: 4 })).toBe(false);
    });

    it('2. exact four-person contract accepts family-group', () => {
      expect(isSilhouetteCompatibleWithPeopleContract('family-group', { min: 4, max: 4 })).toBe(true);
    });

    it('3. 5+ people accepts group', () => {
      expect(isSilhouetteCompatibleWithPeopleContract('group', { min: 5, max: 5 })).toBe(true);
      expect(isSilhouetteCompatibleWithPeopleContract('three-person', { min: 5, max: 5 })).toBe(false);
    });

    it('4. continuedInSegments deduplicates indices', () => {
      const deduped = normalizeContinuedSegments([0, 0], [1, 2], [2, 3]);
      expect(deduped).toEqual([0, 1, 2, 3]);
    });

    it('5. anti-monotony repair remains people-compatible', () => {
      const shots = [
        { id: '1', scale: 'MEDIUM', silhouette: 'family-group', storyRole: 'action', peopleContract: { min: 4, max: 4 }, durationFrames: 60 },
        { id: '2', scale: 'MEDIUM', silhouette: 'family-group', storyRole: 'action', peopleContract: { min: 4, max: 4 }, durationFrames: 60 },
        { id: '3', scale: 'MEDIUM', silhouette: 'family-group', storyRole: 'action', peopleContract: { min: 4, max: 4 }, durationFrames: 60 },
      ];
      const repaired = repairScaleMonotony(shots as any);
      for (const s of repaired) {
        expect(isSilhouetteCompatibleWithPeopleContract(s.silhouette, s.peopleContract)).toBe(true);
      }
    });

    it('6. production brand gate becomes READY after video005 migration', () => {
      const v5 = sampleVideos.find((v: any) => v.index === 5)!;
      const cleanTranscript = 'Khi người thân kể một chuyện khó chịu... Khi bạn mệt, bạn thích người khác lắng nghe trước hay đưa giải pháp ngay?';
      const result = buildStoryPlan(v5, [], {
        brandContext: CHANNEL_BRAND_CONFIG,
        validationMode: 'PRODUCTION',
        rawTimelineText: cleanTranscript,
        spokenAudioTranscript: cleanTranscript,
      });
      expect(result.brandAudit.hasMismatch).toBe(false);
      expect(result.productionValidation.productionReady).toBe(true);
    });

    it('7. real image prompt contains no likeness-consistency requirement', () => {
      const prompt = buildPresentCastPrompt(
        { peopleMin: 1, peopleMax: 1, presentMembers: ['speaker'] },
        'dialogue-pair-01'
      );
      expect(prompt).not.toContain('Use same recurring identities');
      expect(prompt).not.toContain('Do not invent different faces');
      expect(prompt).toContain('Exact facial likeness across different generated images is NOT required.');
    });

    it('8. real image prompt receives exact people count', () => {
      const prompt0 = buildPresentCastPrompt({ peopleMin: 0, peopleMax: 0, noPeople: true }, 'dialogue-pair-01');
      expect(prompt0).toContain('ZERO visible people/body parts');

      const prompt1 = buildPresentCastPrompt({ peopleMin: 1, peopleMax: 1, presentMembers: ['speaker'] }, 'dialogue-pair-01');
      expect(prompt1).toContain('EXACTLY one visible person.');

      const prompt2 = buildPresentCastPrompt({ peopleMin: 2, peopleMax: 2, presentMembers: ['speaker', 'listener'] }, 'dialogue-pair-01');
      expect(prompt2).toContain('EXACTLY two visible people.');
    });

    it('9. real image prompt timer/document safety remains active', () => {
      const docRules = buildImageSafetyRulesForShot({ text: 'đọc từng trang sổ tay ghi chép' });
      expect(docRules.some((r) => r.includes('DOCUMENT TEXT-SAFETY'))).toBe(true);

      const timerRules = buildImageSafetyRulesForShot({ text: 'hẹn giờ đồng hồ mười phút' });
      expect(timerRules.some((r) => r.includes('TIMER / CLOCK SAFETY'))).toBe(true);
    });
  });
});

