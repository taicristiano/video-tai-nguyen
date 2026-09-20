/**
 * src/v34-clean-asset-pilot.test.ts
 *
 * HAY & ĐẸP. — V3.4A VALIDATION
 * Offline-only unit tests for Clean Asset Pilot Harness Fix
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  MODEL_ID,
  STYLE_DEFAULT,
  HARD_EXCLUSIONS,
  PILOT_SHOTS,
  RUN_STATUSES,
  buildPrompt,
  ensureDirectories,
  loadState,
  saveState,
  saveManifest,
  generatePilotAssetsManifest,
  generateAttempt,
  recordQa,
  createContactSheet,
  generatePilotRootCode,
  finalizePilot,
} from '../scripts/generate-v34-clean-asset-pilot.mjs';

describe('V3.4A Clean Asset Pilot Harness (Offline)', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'v34-clean-pilot-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // 1. Style prompt contains 2D, illustrated/cartoon, explicit non-photoreal target
  it('Test 1: style prompt contains 2D, illustrated or cartoon, and explicit non-photoreal target', () => {
    const prompt = buildPrompt(PILOT_SHOTS[0]);

    expect(prompt).toMatch(/2D/i);
    expect(prompt).toMatch(/illustrated|cartoon/i);
    expect(prompt).toMatch(/never photorealistic|not aim for realistic skin/i);
  });

  // 2. Style prompt does NOT contain realistic / camera-oriented output requirements
  it('Test 2: style prompt does NOT contain realistic or camera-oriented output requirements', () => {
    // Check positive style prompt section
    expect(STYLE_DEFAULT).not.toMatch(/photorealistic skin/i);
    expect(STYLE_DEFAULT).not.toMatch(/lens effect/i);
    expect(STYLE_DEFAULT).not.toMatch(/bokeh/i);
    expect(STYLE_DEFAULT).not.toMatch(/camera realism/i);
    expect(STYLE_DEFAULT).not.toMatch(/cinematic camera/i);

    // Negative rules must explicitly forbid realism
    expect(HARD_EXCLUSIONS).toMatch(/No photorealism/i);
    expect(HARD_EXCLUSIONS).toMatch(/No realistic skin/i);
    expect(HARD_EXCLUSIONS).toMatch(/No 3D rendering/i);
    expect(HARD_EXCLUSIONS).toMatch(/No camera, lens, or photographic terms/i);
  });

  // 3. Shot 2 typo is fixed to "câu chuyện vụn"
  it('Test 3: Shot 2 typo is fixed to "câu chuyện vụn"', () => {
    const shot2 = PILOT_SHOTS.find((s) => s.pilotShotIndex === 2);
    expect(shot2).toBeDefined();
    expect(shot2!.voiceClause).toContain('nghe vài câu chuyện vụn');
    expect(shot2!.voiceClause).not.toContain('tô chuyện vụn');
  });

  // 4. Directories are auto-created on clean temp dir
  it('Test 4: directories are auto-created recursively on a clean temp dir', () => {
    const cleanDir = path.join(tempDir, 'nested', 'deep', 'pilot');
    expect(fs.existsSync(cleanDir)).toBe(false);

    const dirs = ensureDirectories(cleanDir);
    expect(fs.existsSync(dirs.baseDir)).toBe(true);
    expect(fs.existsSync(dirs.candidatesDir)).toBe(true);
    expect(fs.existsSync(dirs.assetsDir)).toBe(true);
  });

  // 5. HTTP 429 sets PAUSED_QUOTA, does not create attempt, does not advance nextAttempt, does not mark EXHAUSTED
  it('Test 5: HTTP 429 sets PAUSED_QUOTA without creating attempt or advancing nextAttempt', async () => {
    const mock429 = async () => {
      const err: any = new Error(
        'Cloudflare 429: you have used up your daily free allocation of 10,000 neurons'
      );
      err.httpStatus = 429;
      throw err;
    };

    // Attempt generation with mock 429
    await expect(generateAttempt(0, tempDir, mock429)).rejects.toThrow(/PAUSED_QUOTA/);

    const state = loadState(tempDir);
    expect(state.runStatus).toBe(RUN_STATUSES.PAUSED_QUOTA);

    const shot0 = state.shots.find((s: any) => s.pilotShotIndex === 0);
    expect(shot0.status).toBe('NEEDS_GENERATION');
    expect(shot0.nextAttempt).toBe(1); // Not incremented
    expect(shot0.attempts.length).toBe(0); // No attempt created
    expect(shot0.status).not.toBe('EXHAUSTED');
    expect(state.runStatus).not.toBe(RUN_STATUSES.BLOCKED_ASSET);
  });

  // 6. Selected PASS candidate copies into assets/shot-0N.jpg
  it('Test 6: selected PASS candidate copies into assets/shot-0N.jpg without altering pixels', () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    // Create a mock candidate file
    const mockContent = Buffer.from('MOCK_IMAGE_PIXELS_DATA_12345');
    const candName = 'shot-01-attempt-01.jpg';
    fs.writeFileSync(path.join(tempDir, 'candidates', candName), mockContent);

    // Simulate shot in AWAITING_QA
    state.shots[0].status = 'AWAITING_QA';
    state.shots[0].nextAttempt = null;
    state.shots[0].attempts.push({
      attempt: 1,
      file: candName,
      generationStatus: 'SUCCESS',
      qaStatus: 'PENDING',
    });
    saveState(state, tempDir);

    // Record PASS QA
    recordQa({
      shotIndex: 0,
      attemptNum: 1,
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'PASS',
      baseDir: tempDir,
    });

    const updatedState = loadState(tempDir);
    const shot0 = updatedState.shots[0];
    expect(shot0.status).toBe('SELECTED');
    expect(shot0.selectedAttempt).toBe(1);
    expect(shot0.selectedFile).toBe(candName);

    // Check copied asset in assets/
    const assetDest = path.join(tempDir, 'assets', 'shot-01.jpg');
    expect(fs.existsSync(assetDest)).toBe(true);
    const copiedContent = fs.readFileSync(assetDest);
    expect(copiedContent.equals(mockContent)).toBe(true);
  });

  // 7. pilot-assets.json is generated correctly
  it('Test 7: pilot-assets.json is generated correctly with expected schema', () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    // Mark shot 0 as selected
    state.shots[0].status = 'SELECTED';
    state.shots[0].selectedAttempt = 1;
    state.shots[0].attempts.push({
      attempt: 1,
      file: 'shot-01-attempt-01.jpg',
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'PASS',
    });

    const manifest = generatePilotAssetsManifest(state);
    saveManifest(state, tempDir);

    expect(manifest.model).toBe(MODEL_ID);
    expect(manifest.identityConsistencyRequired).toBe(false);
    expect(manifest.styleTarget).toBe('clean-2d-cartoon-illustration');
    expect(manifest.shots).toHaveLength(6);

    const shot0 = manifest.shots[0];
    expect(shot0.pilotShotIndex).toBe(0);
    expect(shot0.sourceSceneOrBeatId).toBe('scene-0');
    expect(shot0.storyRole).toBe('establish');
    expect(shot0.selectedAttempt).toBe(1);
    expect(shot0.file).toBe('assets/shot-01.jpg');
    expect(shot0.qa).toEqual({
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'PASS',
    });

    // Unselected shot has selectedAttempt: null
    const shot1 = manifest.shots[1];
    expect(shot1.selectedAttempt).toBeNull();
    expect(shot1.file).toBeNull();
    expect(shot1.qa).toBeNull();

    // Verify written file
    const diskManifest = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'pilot-assets.json'), 'utf-8')
    );
    expect(diskManifest).toEqual(manifest);
  });

  // 8. Final contact sheet requires all 6 selected
  it('Test 8: final contact sheet requires all 6 selected and refuses otherwise', async () => {
    const state = loadState(tempDir);
    // 0/6 selected
    const res0 = await createContactSheet(state, tempDir);
    expect(res0.generated).toBe(false);
    expect(res0.reason).toMatch(/Requires all 6 shots to be SELECTED/);

    // 5/6 selected
    for (let i = 0; i < 5; i++) {
      state.shots[i].status = 'SELECTED';
    }
    const res5 = await createContactSheet(state, tempDir);
    expect(res5.generated).toBe(false);
    expect(res5.reason).toMatch(/Requires all 6 shots to be SELECTED \(currently 5\/6\)/);
  });

  // 9. Finalize refuses render before 6/6 selected
  it('Test 9: finalize refuses render before 6/6 selected', async () => {
    const state = loadState(tempDir);
    const mockExec = () => {};

    // 0/6 selected
    await expect(finalizePilot(state, tempDir, mockExec as any)).rejects.toThrow(
      /Cannot finalize pilot: only 0\/6 shots are SELECTED/
    );

    // 5/6 selected
    for (let i = 0; i < 5; i++) {
      state.shots[i].status = 'SELECTED';
    }
    await expect(finalizePilot(state, tempDir, mockExec as any)).rejects.toThrow(
      /Cannot finalize pilot: only 5\/6 shots are SELECTED/
    );
  });

  // 10. No model other than @cf/black-forest-labs/flux-1-schnell appears in executable generation path
  it('Test 10: no model other than @cf/black-forest-labs/flux-1-schnell appears in executable generation path', () => {
    expect(MODEL_ID).toBe('@cf/black-forest-labs/flux-1-schnell');

    const scriptPath = path.resolve(__dirname, '../scripts/generate-v34-clean-asset-pilot.mjs');
    const scriptCode = fs.readFileSync(scriptPath, 'utf-8');

    // Must not reference flux-2, sdxl, dall-e, or midjourney
    expect(scriptCode).not.toMatch(/flux-2/i);
    expect(scriptCode).not.toMatch(/sdxl/i);
    expect(scriptCode).not.toMatch(/dall-e/i);
    expect(scriptCode).not.toMatch(/midjourney/i);
  });

  // 11. QA integrity - rejects if shot is not AWAITING_QA
  it('Test 11: recordQa strictly rejects when shot status is not AWAITING_QA', () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    // Shot 0 is in NEEDS_GENERATION
    expect(state.shots[0].status).toBe('NEEDS_GENERATION');

    expect(() =>
      recordQa({
        shotIndex: 0,
        attemptNum: 1,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        baseDir: tempDir,
      })
    ).toThrow(/Shot 0 is not AWAITING_QA/);
  });

  // 12. QA integrity - rejects older attempts and duplicate QA on completed attempts
  it('Test 12: recordQa strictly rejects older attempts and duplicate QA on completed attempts', () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    const cand1 = 'shot-01-attempt-01.jpg';
    const cand2 = 'shot-01-attempt-02.jpg';
    fs.writeFileSync(path.join(tempDir, 'candidates', cand1), 'cand1');
    fs.writeFileSync(path.join(tempDir, 'candidates', cand2), 'cand2');

    // Attempt 1 already failed, Attempt 2 is currently awaiting QA
    state.shots[0].status = 'AWAITING_QA';
    state.shots[0].attempts = [
      {
        attempt: 1,
        file: cand1,
        generationStatus: 'SUCCESS',
        qaStatus: 'COMPLETED',
        overall: 'FAIL',
      },
      {
        attempt: 2,
        file: cand2,
        generationStatus: 'SUCCESS',
        qaStatus: 'PENDING',
      },
    ];
    saveState(state, tempDir);

    // Attempting to judge older attempt 1 when attempt 2 is latest pending must throw
    expect(() =>
      recordQa({
        shotIndex: 0,
        attemptNum: 1,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        baseDir: tempDir,
      })
    ).toThrow(/latest pending attempt is 2/);

    // Now judge attempt 2 -> PASS
    recordQa({
      shotIndex: 0,
      attemptNum: 2,
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'PASS',
      baseDir: tempDir,
    });

    const updatedState = loadState(tempDir);
    expect(updatedState.shots[0].status).toBe('SELECTED');
    expect(updatedState.shots[0].selectedAttempt).toBe(2);

    // Duplicate call on attempt 2 (now status is SELECTED, not AWAITING_QA) must throw
    expect(() =>
      recordQa({
        shotIndex: 0,
        attemptNum: 2,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        baseDir: tempDir,
      })
    ).toThrow(/Shot 0 is not AWAITING_QA/);

    // If somehow forced into AWAITING_QA with attempt 2 already COMPLETED, must throw
    updatedState.shots[0].status = 'AWAITING_QA';
    saveState(updatedState, tempDir);

    expect(() =>
      recordQa({
        shotIndex: 0,
        attemptNum: 2,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        baseDir: tempDir,
      })
    ).toThrow(/QA already completed/);
  });

  // 13. QA integrity - rejects if candidate file is missing on disk
  it('Test 13: recordQa strictly rejects if candidate file is missing on disk', () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    const candName = 'shot-01-attempt-01.jpg';
    // Do not create the file on disk!

    state.shots[0].status = 'AWAITING_QA';
    state.shots[0].attempts = [
      {
        attempt: 1,
        file: candName,
        generationStatus: 'SUCCESS',
        qaStatus: 'PENDING',
      },
    ];
    saveState(state, tempDir);

    expect(() =>
      recordQa({
        shotIndex: 0,
        attemptNum: 1,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        baseDir: tempDir,
      })
    ).toThrow(/candidate file not found on disk/);
  });

  // 14. Finalization fidelity - generatePilotRootCode preserves scene-level clean assets, normalizes editorial compositions, resets focalPoint, and disables visualBeats
  it('Test 14: generatePilotRootCode normalizes editorial compositions, resets focalPoint, preserves motionProfile/shotScale, and disables visualBeats', () => {
    const code = generatePilotRootCode();

    // 1. Comparison pilot header documentation
    expect(code).toContain('scene-level clean-asset comparison pilot');
    expect(code).toContain('internal visual-beat image swapping intentionally disabled');

    // 2. Framing normalization: editorial-left/right -> portrait-focus
    expect(code).toContain('const comparisonComposition =');
    expect(code).toContain("scene.composition === 'editorial-left' || scene.composition === 'editorial-right'");
    expect(code).toContain("? 'portrait-focus'");
    expect(code).toContain('composition={comparisonComposition}');

    // 3. Focal point reset: not inherited from scene.focalPoint
    expect(code).toContain('focalPoint={undefined}');
    expect(code).not.toContain('focalPoint={scene.focalPoint}');

    // 4. Visual beats explicitly disabled to prevent old image leaking
    expect(code).toContain('visualBeats={undefined}');
    expect(code).not.toContain('visualBeats={resolvedVisualBeats}');

    // 5. Card preservation
    expect(code).toContain('<SectionCard');
    expect(code).toContain('<InsightCard');
    expect(code).toContain('hasSectionCard={Boolean(scene.sectionCard)}');
    expect(code).toContain('cardDuration={cardDuration}');

    // 6. KenBurns, shotScale, and motionProfile preservation
    expect(code).toContain('kenBurns={scene.image?.kenBurns}');
    expect(code).toContain('motionPreset={scene.motionPreset}');
    expect(code).toContain('motionProfile={scene.motionProfile}');
    expect(code).toContain('shotScale={scene.shotScale}');
  });

  // 15. Happy path offline finalization with 6/6 SELECTED
  it('Test 15: full happy-path offline finalization with 6/6 SELECTED copies assets and renders pilot root', async () => {
    ensureDirectories(tempDir);
    const state = loadState(tempDir);

    // Setup all 6 shots as SELECTED with mock files
    for (let i = 0; i < 6; i++) {
      const padNum = String(i + 1).padStart(2, '0');
      const candFile = `shot-${padNum}-attempt-01.jpg`;
      const candPath = path.join(tempDir, 'candidates', candFile);
      const assetPath = path.join(tempDir, 'assets', `shot-${padNum}.jpg`);
      fs.writeFileSync(candPath, `MOCK_IMAGE_DATA_FOR_SHOT_${padNum}`);
      fs.writeFileSync(assetPath, `MOCK_IMAGE_DATA_FOR_SHOT_${padNum}`);

      state.shots[i].status = 'SELECTED';
      state.shots[i].selectedAttempt = 1;
      state.shots[i].selectedFile = candFile;
      state.shots[i].attempts = [
        {
          attempt: 1,
          file: candFile,
          generationStatus: 'SUCCESS',
          qaStatus: 'COMPLETED',
          overall: 'PASS',
          style: 'PASS',
          peopleContract: 'PASS',
          semanticFidelity: 'PASS',
          anatomy: 'PASS',
          textPollution: 'PASS',
        },
      ];
    }
    state.runStatus = RUN_STATUSES.COMPLETE;
    saveState(state, tempDir);

    let executedCommand = '';
    const mockExec = (cmd: string) => {
      executedCommand = cmd;
    };

    let contactSheetInvoked = false;
    const mockRenderSheet = async () => {
      contactSheetInvoked = true;
    };

    const result = await finalizePilot(state, tempDir, mockExec as any, mockRenderSheet);

    expect(result.success).toBe(true);
    expect(executedCommand).toContain('npx remotion render');
    expect(executedCommand).toContain('PilotRoot.tsx');
    expect(executedCommand).toContain('video001-motion-clean-assets.mp4');
    expect(contactSheetInvoked).toBe(true);

    // Verify PilotRoot.tsx was written on disk in baseDir
    const writtenPilotRoot = path.join(tempDir, 'PilotRoot.tsx');
    expect(fs.existsSync(writtenPilotRoot)).toBe(true);
    const writtenCode = fs.readFileSync(writtenPilotRoot, 'utf-8');
    expect(writtenCode).toContain('scene-level clean-asset comparison pilot');
    expect(writtenCode).toContain('internal visual-beat image swapping intentionally disabled');
    expect(writtenCode).toContain('visualBeats={undefined}');
    expect(writtenCode).not.toContain('visualBeats={resolvedVisualBeats}');

    // Verify assets copied to public scratch folder
    const publicCleanDir = path.join(path.resolve(__dirname, '..'), 'public', 'scratch', 'v34', 'clean-assets');
    for (let i = 0; i < 6; i++) {
      const padNum = String(i + 1).padStart(2, '0');
      const publicFile = path.join(publicCleanDir, `shot-${padNum}.jpg`);
      expect(fs.existsSync(publicFile)).toBe(true);
    }
  });
});
