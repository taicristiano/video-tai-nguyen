/**
 * scripts/generate-v34-clean-asset-pilot.mjs
 *
 * HAY & ĐẸP. — V3.4A VALIDATION
 * Clean Asset Pilot Script (Offline-Hardened Harness)
 * Model: @cf/black-forest-labs/flux-1-schnell ONLY
 *
 * Purpose:
 * Generates and validates a clean six-shot source-asset set for the
 * existing V3.4A pilot (frames 0-772) without identity consistency requirements.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const BASE_DIR = path.join(ROOT, 'scratch', 'v34', 'clean-asset-pilot');
export const CANDIDATES_DIR = path.join(BASE_DIR, 'candidates');
export const ASSETS_DIR = path.join(BASE_DIR, 'assets');
export const STATE_PATH = path.join(BASE_DIR, 'pilot-state.json');
export const MANIFEST_PATH = path.join(BASE_DIR, 'pilot-assets.json');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';

export const RUN_STATUSES = {
  READY: 'READY',
  PAUSED_QUOTA: 'PAUSED_QUOTA',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
  BLOCKED_ASSET: 'BLOCKED_ASSET',
};

/**
 * Section 2: Updated Clean 2D Illustrated / Cartoon Style
 */
export const STYLE_DEFAULT = `STYLE DEFAULT:
Clean 2D illustrated / cartoon style.
Hand-drawn editorial illustration.
Simple expressive faces and readable body shapes.
Clearly illustrated, never photorealistic.
Do not aim for realistic skin or lifelike photographic rendering.
Character likeness consistency between images is not required.
Each image should be visually clean, readable, and usable in a short-form video.

PALETTE:
Warm ivory and cream background.
Muted sage clothing or accents.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.`;

export const HARD_EXCLUSIONS = `HARD EXCLUSIONS:
No photorealism.
No realistic skin.
No 3D rendering.
No anime or chibi styling.
No camera, lens, or photographic terms.
No written words anywhere in the illustration.
No signs, labels, logos, signatures or watermark-like marks.
No random lettering on walls, clothing, books or objects.
No extra people.
No malformed or detached body parts.`;

/**
 * Section 3: Grounded Six Pilot Shots (with Typo Fixed)
 */
export const PILOT_SHOTS = [
  {
    pilotShotIndex: 0,
    sourceSceneOrBeatId: 'scene-0',
    storyRole: 'establish',
    voiceClause: 'Khi còn nhỏ, một bữa cơm đủ người thường chỉ là chuyện rất bình thường.',
    visualIntent: 'The recurring family shares an ordinary simple dinner at home; people are eating and talking naturally, not posing for camera. Visual priority hint: một mâm cơm đơn giản có đủ người.',
    peopleContract: 'Exactly three visible people: Vietnamese father, mother, and child sharing dinner at table.',
    peopleCountText: 'Exactly three visible people: Vietnamese father, mother, and young child.\nNo extra person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese family of three (parents and a young child) sharing a simple home-cooked dinner at a wooden dining table. They are naturally eating with chopsticks and bowls, talking warmly together, not posing for the camera. Simple dishes and bowls of rice on the table.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood dining table and chairs, simple hanging lamp above the table. Understated domestic setting.',
    framingText: 'Wide drawn establishing composition. Balanced negative space.',
  },
  {
    pilotShotIndex: 1,
    sourceSceneOrBeatId: 'scene-1',
    storyRole: 'reflection',
    voiceClause: 'Giá trị của bữa cơm không nằm ở món ăn cầu kỳ,',
    visualIntent: 'The same recurring family performs one concrete dinner action: serving rice, passing a bowl, using chopsticks, listening to a child, or clearing the table.',
    peopleContract: 'Exactly one visible person: 1 adult performing dinner action at dining table.',
    peopleCountText: 'Exactly one visible person in the entire illustration.\nOnly one Vietnamese adult at the dining table.\nNo second person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese adult quietly serves rice from a ceramic bowl using wooden chopsticks at the dining table. Simple home-cooked food in everyday ceramic bowls. Calm, reflective domestic moment. Other family members are off-frame and must not be visible.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood dining table, soft evening light.',
    framingText: 'Medium drawn reflection composition. Balanced negative space.',
  },
  {
    pilotShotIndex: 2,
    sourceSceneOrBeatId: 'scene-2',
    storyRole: 'interaction',
    // Section 3: Fixed typo "nghe vài tô chuyện vụn" -> "nghe vài câu chuyện vụn"
    voiceClause: 'mà ở việc mọi người cùng có mặt, nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
    visualIntent: 'A parent has just returned home and places a work bag or keys near the chair while the child brings a school notebook; the family reconnects around the same dining table. Visual priority hint: câu chuyện nhỏ sau một ngày đi học, đi làm.',
    peopleContract: 'Exactly two visible people: 1 adult and 1 child reconnecting and talking at dining table.',
    peopleCountText: 'Exactly two visible people: one Vietnamese adult and one young Vietnamese child.\nNo third person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese parent and young school-age child reconnect at the wooden dining table after returning home. The child speaks with a small hand gesture showing a school notebook, while the parent listens warmly with a gentle smile. A work bag rests near the chair. Warm conversational interaction.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood furniture, simple hanging lamp.',
    framingText: 'Medium drawn interaction composition. Balanced negative space.',
  },
  {
    pilotShotIndex: 3,
    sourceSceneOrBeatId: 'scene-3',
    storyRole: 'detail-action',
    voiceClause: 'Có thể là một mâm cơm đơn giản có đủ người, hoặc chiếc điện thoại được đặt sang một bên.',
    visualIntent: 'A family remains the main subject while one hand deliberately places the phone away from the dining table on a side shelf; the phone is secondary, not the hero object. Visual priority hint: chiếc điện thoại được đặt sang một bên.',
    peopleContract: 'Exactly one visible person: 1 adult deliberately placing smartphone aside on wooden shelf.',
    peopleCountText: 'Exactly one visible person in the entire illustration.\nOnly one Vietnamese adult.\nNo second person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese adult deliberately places a smartphone face-down on a small wooden side shelf away from the dining table. Calm intentional gesture. The smartphone screen is turned off and dark, kept aside. Other family members are off-frame and must not be visible.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood side shelf and dining furniture.',
    framingText: 'Close drawn detail-action composition. Focused on the hands and wooden side shelf.',
  },
  {
    pilotShotIndex: 4,
    sourceSceneOrBeatId: 'scene-4',
    storyRole: 'action',
    voiceClause: 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.',
    visualIntent: 'A parent has just returned home and places a work bag or keys near the chair while the child brings a school notebook; the family reconnects around the same dining table.',
    peopleContract: 'Exactly two visible people: 1 adult and 1 child in everyday conversation after school/work.',
    peopleCountText: 'Exactly two visible people: one Vietnamese adult and one young school-age child.\nNo third person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese parent has just returned from work, placing a work bag and keys by the wooden chair, while the young child sits at the table with a school notebook. A calm, tender moment of returning home after a day of school and work.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood dining table and chairs, warm soft indoor lighting.',
    framingText: 'Medium drawn composition with slight horizontal depth.',
  },
  {
    pilotShotIndex: 5,
    sourceSceneOrBeatId: 'scene-5',
    storyRole: 'context',
    voiceClause: 'Những chi tiết như vậy không tạo cảm giác mình vừa thay đổi cả cuộc sống.',
    visualIntent: 'The recurring family performs a specific small domestic action in the same home; no posed family portrait.',
    peopleContract: 'Exactly one visible person: 1 adult quietly resting hands at dining table with calm reflective expression.',
    peopleCountText: 'Exactly one visible person in the entire illustration.\nOnly one Vietnamese adult.\nNo second person, no background person, no partial extra human body.',
    sceneText: 'A Vietnamese adult quietly pauses at the wooden dining table with a calm reflective expression, resting hands peacefully on the table. A quiet, grounded moment of daily domestic life. Other family members are implied off-frame and must not be visible.',
    worldText: 'Warm Vietnamese family home environment. Ivory walls, medium warm wood dining table, soft evening atmosphere.',
    framingText: 'Medium drawn portrait-focus composition. Balanced negative space.',
  },
];

/**
 * Section 4: Ensure Directories Exist Recursively
 */
export function ensureDirectories(baseDir = BASE_DIR) {
  const candidatesDir = path.join(baseDir, 'candidates');
  const assetsDir = path.join(baseDir, 'assets');
  fs.mkdirSync(baseDir, { recursive: true });
  fs.mkdirSync(candidatesDir, { recursive: true });
  fs.mkdirSync(assetsDir, { recursive: true });
  return { baseDir, candidatesDir, assetsDir };
}

export function buildPrompt(shot) {
  return [
    STYLE_DEFAULT,
    `VISIBLE PEOPLE:\n${shot.peopleCountText}`,
    `SCENE:\n${shot.sceneText}`,
    `WORLD:\n${shot.worldText}`,
    `FRAMING:\n${shot.framingText}`,
    HARD_EXCLUSIONS,
  ].join('\n\n');
}

export function loadEnvFile(filename) {
  const fullPath = path.resolve(ROOT, filename);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

export function auditAuth() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  return {
    hasAccountId: Boolean(accountId && accountId.trim().length > 0),
    hasToken: Boolean(token && token.trim().length > 0),
    accountId: accountId?.trim(),
    token: token?.trim(),
  };
}

export async function callCloudflareSchnell(prompt) {
  const auth = auditAuth();
  if (!auth.hasAccountId || !auth.hasToken) {
    const err = new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
    err.httpStatus = 401;
    throw err;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/ai/run/${MODEL_ID}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const textBody = await response.text();
  if (!response.ok) {
    const err = new Error(`Cloudflare ${response.status} [${MODEL_ID}]: ${textBody.slice(0, 500)}`);
    err.httpStatus = response.status;
    throw err;
  }

  let data;
  try {
    data = JSON.parse(textBody);
  } catch {
    const err = new Error(`Invalid JSON response: ${textBody.slice(0, 300)}`);
    err.httpStatus = 502;
    throw err;
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    const err = new Error(`Cloudflare response missing result.image: ${textBody.slice(0, 300)}`);
    err.httpStatus = 502;
    throw err;
  }

  return Buffer.from(imageBase64, 'base64');
}

/**
 * Section 5: State Loading and Quota Status Correctness
 */
export function loadState(baseDir = BASE_DIR) {
  ensureDirectories(baseDir);
  const statePath = path.join(baseDir, 'pilot-state.json');

  if (!fs.existsSync(statePath)) {
    const initialState = {
      model: MODEL_ID,
      runStatus: RUN_STATUSES.READY,
      identityConsistency: 'NOT_REQUIRED',
      updatedAt: new Date().toISOString(),
      shots: PILOT_SHOTS.map((s) => ({
        pilotShotIndex: s.pilotShotIndex,
        sourceSceneOrBeatId: s.sourceSceneOrBeatId,
        storyRole: s.storyRole,
        voiceClause: s.voiceClause,
        visualIntent: s.visualIntent,
        peopleContract: s.peopleContract,
        status: 'NEEDS_GENERATION', // NEEDS_GENERATION | AWAITING_QA | SELECTED | EXHAUSTED
        nextAttempt: 1,
        selectedAttempt: null,
        selectedFile: null,
        attempts: [],
      })),
    };
    saveState(initialState, baseDir);
    return initialState;
  }

  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));

  // Migration: Ensure runStatus is present and accurately reflects quota status
  if (!state.runStatus) {
    state.runStatus = RUN_STATUSES.READY;
  }

  // Ensure Shot 2 typo is migrated in memory if present in old state file
  const shot2 = state.shots?.find((s) => s.pilotShotIndex === 2);
  if (shot2 && shot2.voiceClause.includes('tô chuyện vụn')) {
    shot2.voiceClause = shot2.voiceClause.replace('tô chuyện vụn', 'câu chuyện vụn');
  }

  return state;
}

/**
 * Section 7: Generate pilot-assets.json
 */
export function generatePilotAssetsManifest(state) {
  return {
    model: state.model || MODEL_ID,
    identityConsistencyRequired: false,
    styleTarget: 'clean-2d-cartoon-illustration',
    shots: state.shots.map((s) => {
      const selectedAtt = s.selectedAttempt
        ? s.attempts.find((a) => a.attempt === s.selectedAttempt)
        : null;

      return {
        pilotShotIndex: s.pilotShotIndex,
        sourceSceneOrBeatId: s.sourceSceneOrBeatId,
        storyRole: s.storyRole,
        selectedAttempt: s.selectedAttempt ?? null,
        file: s.selectedAttempt ? `assets/shot-0${s.pilotShotIndex + 1}.jpg` : null,
        qa: selectedAtt
          ? {
              style: selectedAtt.style,
              peopleContract: selectedAtt.peopleContract,
              semanticFidelity: selectedAtt.semanticFidelity,
              anatomy: selectedAtt.anatomy,
              textPollution: selectedAtt.textPollution,
            }
          : null,
      };
    }),
  };
}

export function saveManifest(state, baseDir = BASE_DIR) {
  ensureDirectories(baseDir);
  const manifest = generatePilotAssetsManifest(state);
  const manifestPath = path.join(baseDir, 'pilot-assets.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

export function saveState(state, baseDir = BASE_DIR) {
  ensureDirectories(baseDir);
  state.updatedAt = new Date().toISOString();
  const statePath = path.join(baseDir, 'pilot-state.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  saveManifest(state, baseDir);
}

/**
 * Section 6: Selected Asset Finalization
 */
export function finalizeSelectedAsset(shotIndex, sourceFilename, baseDir = BASE_DIR) {
  const candidatesDir = path.join(baseDir, 'candidates');
  const assetsDir = path.join(baseDir, 'assets');
  ensureDirectories(baseDir);

  const srcPath = path.join(candidatesDir, sourceFilename);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Candidate file not found: ${srcPath}`);
  }

  const destName = `shot-0${shotIndex + 1}.jpg`;
  const destPath = path.join(assetsDir, destName);
  fs.copyFileSync(srcPath, destPath);
  return destName;
}

/**
 * Section 5: Quota-Safe Generation Attempt
 */
export async function generateAttempt(shotIndex, baseDir = BASE_DIR, callApi = callCloudflareSchnell) {
  ensureDirectories(baseDir);
  const state = loadState(baseDir);
  const shot = state.shots.find((s) => s.pilotShotIndex === shotIndex);
  if (!shot) throw new Error(`Shot index ${shotIndex} not found`);

  if (shot.status === 'SELECTED') {
    console.log(`Shot ${shotIndex} is already SELECTED with attempt ${shot.selectedAttempt}.`);
    return shot;
  }

  if (shot.status === 'EXHAUSTED') {
    throw new Error(`Shot ${shotIndex} is already EXHAUSTED (3 failed attempts).`);
  }

  if (shot.status === 'AWAITING_QA') {
    throw new Error(
      `Shot ${shotIndex} is already AWAITING_QA for attempt ${
        shot.attempts[shot.attempts.length - 1].attempt
      }`
    );
  }

  const attemptNum = shot.nextAttempt;
  if (attemptNum > 3) {
    shot.status = 'EXHAUSTED';
    state.runStatus = RUN_STATUSES.BLOCKED_ASSET;
    saveState(state, baseDir);
    throw new Error(`Shot ${shotIndex} has exceeded max attempts (3).`);
  }

  const shotDef = PILOT_SHOTS[shotIndex];
  const prompt = buildPrompt(shotDef);

  console.log(`Calling Cloudflare FLUX.1 Schnell for Shot ${shotIndex} (Attempt ${attemptNum})...`);

  let imageBuffer;
  try {
    imageBuffer = await callApi(prompt);
  } catch (err) {
    const is429 =
      err.httpStatus === 429 ||
      (err.message && err.message.includes('429')) ||
      (err.message && (err.message.includes('neuron') || err.message.includes('quota')));

    if (is429) {
      // Section 5: Explicit PAUSED_QUOTA. Does not create attempt, does not increment nextAttempt, does not mark EXHAUSTED.
      state.runStatus = RUN_STATUSES.PAUSED_QUOTA;
      shot.status = 'NEEDS_GENERATION';
      saveState(state, baseDir);
      console.log(`[PAUSED_QUOTA] Cloudflare quota exhausted for Shot ${shotIndex}. Attempt ${attemptNum} preserved for retry.`);
      const quotaErr = new Error(`PAUSED_QUOTA: Cloudflare quota exhausted for Shot ${shotIndex}: ${err.message}`);
      quotaErr.isQuota = true;
      quotaErr.httpStatus = 429;
      throw quotaErr;
    }

    state.runStatus = RUN_STATUSES.IN_PROGRESS;
    saveState(state, baseDir);
    throw err;
  }

  const candidatesDir = path.join(baseDir, 'candidates');
  const filename = `shot-0${shotIndex + 1}-attempt-0${attemptNum}.jpg`;
  const filePath = path.join(candidatesDir, filename);
  fs.writeFileSync(filePath, imageBuffer);
  console.log(`Saved candidate to: ${filePath} (${imageBuffer.length} bytes)`);

  shot.attempts.push({
    attempt: attemptNum,
    file: filename,
    path: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    generationStatus: 'SUCCESS',
    qaStatus: 'PENDING',
    timestamp: new Date().toISOString(),
  });

  shot.status = 'AWAITING_QA';
  shot.nextAttempt = null;
  state.runStatus = RUN_STATUSES.IN_PROGRESS;
  saveState(state, baseDir);

  return shot;
}

/**
 * Section 6: Record QA & Deterministic Asset Selection
 */
export function recordQa({
  shotIndex,
  attemptNum,
  style,
  peopleContract,
  semanticFidelity,
  anatomy,
  textPollution,
  reasons = [],
  baseDir = BASE_DIR,
}) {
  ensureDirectories(baseDir);
  const state = loadState(baseDir);
  const shot = state.shots.find((s) => s.pilotShotIndex === shotIndex);
  if (!shot) throw new Error(`Shot ${shotIndex} not found`);

  // Guard 1: Must be AWAITING_QA
  if (shot.status !== 'AWAITING_QA') {
    throw new Error(`Shot ${shotIndex} is not AWAITING_QA (current status: ${shot.status})`);
  }

  // Guard 2: Must have at least one attempt
  const latestAttempt = shot.attempts.length > 0 ? shot.attempts[shot.attempts.length - 1] : null;
  if (!latestAttempt) {
    throw new Error(`Shot ${shotIndex} has no attempts recorded for QA`);
  }

  // Guard 3: Attempt number must match the CURRENT latest attempt
  if (latestAttempt.attempt !== attemptNum) {
    throw new Error(
      `Cannot record QA for attempt ${attemptNum} on Shot ${shotIndex}: latest pending attempt is ${latestAttempt.attempt}`
    );
  }

  // Guard 4: Generation status must be SUCCESS
  if (latestAttempt.generationStatus !== 'SUCCESS') {
    throw new Error(
      `Cannot record QA for attempt ${attemptNum} on Shot ${shotIndex}: generationStatus is ${latestAttempt.generationStatus}`
    );
  }

  // Guard 5: QA status must be PENDING (reject duplicate QA on already judged attempt)
  if (latestAttempt.qaStatus !== 'PENDING') {
    throw new Error(
      `Cannot record QA for attempt ${attemptNum} on Shot ${shotIndex}: QA already completed with status ${latestAttempt.qaStatus}`
    );
  }

  // Guard 6: Candidate file must exist on disk
  const candidatesDir = path.join(baseDir, 'candidates');
  const candidateFilePath = path.join(candidatesDir, latestAttempt.file);
  if (!fs.existsSync(candidateFilePath)) {
    throw new Error(
      `Cannot record QA for attempt ${attemptNum} on Shot ${shotIndex}: candidate file not found on disk: ${candidateFilePath}`
    );
  }

  // Mutate only latestAttempt
  latestAttempt.style = style;
  latestAttempt.peopleContract = peopleContract;
  latestAttempt.semanticFidelity = semanticFidelity;
  latestAttempt.anatomy = anatomy;
  latestAttempt.textPollution = textPollution;
  latestAttempt.reasons = reasons;
  latestAttempt.qaStatus = 'COMPLETED';

  const isPass =
    style === 'PASS' &&
    peopleContract === 'PASS' &&
    semanticFidelity === 'PASS' &&
    anatomy === 'PASS' &&
    textPollution === 'PASS';

  latestAttempt.overall = isPass ? 'PASS' : 'FAIL';

  if (isPass) {
    shot.status = 'SELECTED';
    shot.selectedAttempt = attemptNum;
    shot.selectedFile = latestAttempt.file;
    shot.nextAttempt = null;

    // Finalize asset copy into assets/shot-0N.jpg
    finalizeSelectedAsset(shotIndex, latestAttempt.file, baseDir);
    console.log(`✅ Shot ${shotIndex} Attempt ${attemptNum} PASSED all QA criteria! Copied to assets/shot-0${shotIndex + 1}.jpg`);

    const allSelected = state.shots.every((s) => s.status === 'SELECTED');
    const anyExhausted = state.shots.some((s) => s.status === 'EXHAUSTED');
    if (allSelected) {
      state.runStatus = RUN_STATUSES.COMPLETE;
    } else if (anyExhausted) {
      state.runStatus = RUN_STATUSES.BLOCKED_ASSET;
    } else {
      state.runStatus = RUN_STATUSES.IN_PROGRESS;
    }
  } else {
    console.log(`❌ Shot ${shotIndex} Attempt ${attemptNum} FAILED QA (${reasons.join(', ') || 'failed criteria'}).`);
    if (attemptNum >= 3) {
      shot.status = 'EXHAUSTED';
      shot.nextAttempt = null;
      state.runStatus = RUN_STATUSES.BLOCKED_ASSET;
      console.log(`🛑 Shot ${shotIndex} has EXHAUSTED all 3 attempts! Global status: BLOCKED_ASSET`);
    } else {
      shot.status = 'NEEDS_GENERATION';
      shot.nextAttempt = attemptNum + 1;
      state.runStatus = RUN_STATUSES.IN_PROGRESS;
      console.log(`Shot ${shotIndex} advanced to nextAttempt: ${shot.nextAttempt}.`);
    }
  }

  saveState(state, baseDir);
  return shot;
}

/**
 * Section 8: Implement Contact Sheet (2 columns × 3 rows)
 */
export async function createContactSheet(state, baseDir = BASE_DIR, outputPath = null, renderFn = null) {
  ensureDirectories(baseDir);
  const selectedShots = state.shots.filter((s) => s.status === 'SELECTED');

  if (selectedShots.length < 6) {
    console.log(`Refusing contact sheet: only ${selectedShots.length}/6 shots are SELECTED.`);
    return {
      generated: false,
      reason: `Requires all 6 shots to be SELECTED (currently ${selectedShots.length}/6).`,
    };
  }

  const targetOut = outputPath || path.join(baseDir, 'contact-sheet-clean-assets.jpg');
  const cardsHtml = state.shots
    .map((shot) => {
      const padNum = String(shot.pilotShotIndex + 1).padStart(2, '0');
      const filename = `shot-${padNum}.jpg`;
      const absPath = path.join(baseDir, 'assets', filename);
      let imgTag = '';
      if (fs.existsSync(absPath)) {
        const buf = fs.readFileSync(absPath);
        imgTag = `<img src="data:image/jpeg;base64,${buf.toString('base64')}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;" />`;
      } else {
        imgTag = `<div style="width:100%;aspect-ratio:1/1;background:#222;display:flex;align-items:center;justify-content:center;color:#888;">Missing ${filename}</div>`;
      }

      return `
        <div style="background:#181818;border:1px solid #333;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:8px 10px;font-size:13px;font-weight:700;color:#F0F0F0;background:#111;text-align:center;border-bottom:1px solid #282828;">
            Shot ${padNum}
          </div>
          ${imgTag}
          <div style="padding:8px 10px;font-size:11px;font-weight:500;color:#AAA;background:#141414;text-align:center;border-top:1px solid #282828;line-height:1.4;">
            ${shot.sourceSceneOrBeatId}<br />
            <span style="color:#D4A373;">${shot.storyRole}</span>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #0D0D0D;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #FFF;
      box-sizing: border-box;
    }
    .header {
      margin-bottom: 20px;
      border-bottom: 1px solid #222;
      padding-bottom: 14px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #F5EFEB;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13px;
      color: #8C827A;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">HAY & ĐẸP. V3.4A — Clean Asset Pilot (2 × 3 Grid)</div>
    <div class="subtitle">Model: @cf/black-forest-labs/flux-1-schnell • Clean 2D Cartoon / Editorial</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:20px;max-width:720px;margin:0 auto;">
    ${cardsHtml}
  </div>
</body>
</html>`;

  if (renderFn) {
    await renderFn({ html, targetOut, baseDir, state });
    console.log(`✅ Saved contact sheet via custom renderer to: ${targetOut}`);
    return { generated: true, path: targetOut };
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.setViewportSize({ width: 780, height: 1350 });
  await page.screenshot({ path: targetOut, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();

  console.log(`✅ Saved contact sheet to: ${targetOut}`);
  return { generated: true, path: targetOut };
}

/**
 * Section 9: Implement Pilot Rerender Path (--finalize)
 */
export function generatePilotRootCode(cleanAssets = [
  'scratch/v34/clean-assets/shot-01.jpg',
  'scratch/v34/clean-assets/shot-02.jpg',
  'scratch/v34/clean-assets/shot-03.jpg',
  'scratch/v34/clean-assets/shot-04.jpg',
  'scratch/v34/clean-assets/shot-05.jpg',
  'scratch/v34/clean-assets/shot-06.jpg',
]) {
  const assetsJson = JSON.stringify(cleanAssets, null, 2);
  return `import React from 'react';
import { Composition, registerRoot, AbsoluteFill, Sequence, staticFile, Audio } from 'remotion';
import {
  Layout,
  ImageScene,
  SectionCard,
  InsightCard,
  OutroCard,
  type HumanInsightSpec,
  type SceneWindowInfo,
} from '../../../src/templates/human-insight/cinematic-light';
import { TRANSITION_SFX, type TransitionSfxName } from '../../../src/templates/creative/free-style-sfx';
import specData from '../../../videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json';

/**
 * HAY & ĐẸP. V3.4A — scene-level clean-asset comparison pilot (frames 0-772).
 * Note: This is an isolated comparison pilot, NOT the exact production visual-beat render.
 * internal visual-beat image swapping intentionally disabled
 * Keeps one clean asset for the full duration of each of the six scenes while preserving
 * scene timing, V3.4A motion profile, composition, shotScale, container, title/subtitle,
 * SectionCard, InsightCard, hard cuts, and audio/SFX.
 */

interface SpecWithSfx extends HumanInsightSpec {
  scenes: (HumanInsightSpec['scenes'][number] & {
    entrySfx?: {
      name: TransitionSfxName;
      volume?: number;
      reason: string;
    };
  })[];
}

const spec = specData as SpecWithSfx;
const slug = 'phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu';

// Replaced clean asset references
const cleanAssets: string[] = ${assetsJson};

const sceneWindows: SceneWindowInfo[] = spec.scenes.map((scene) => ({
  startFrame: scene.startFrame,
  durationFrames: scene.durationFrames,
  type: scene.type,
  layout: scene.layout ?? 'standard',
  headerMode: scene.headerMode,
  captionMode: scene.captionMode,
  titleMode: scene.titleMode,
  captionPlacement: scene.captionPlacement,
  hasSectionCard: Boolean(scene.sectionCard),
  hasInsightCard: Boolean(scene.insightText) && scene.insightVariant === 'card',
  cardDuration: scene.sectionCard
    ? (scene.sectionCard.number === '03' ? 86 : 76)
    : scene.insightText
      ? 66
      : undefined,
  isOutro: scene.isOutro,
}));

export const PilotCleanContent: React.FC = () => (
  <Layout slug={slug} title={spec.video.title} bgMusic={spec.video.bgMusic ?? null} scenes={sceneWindows}>
    <Audio src={staticFile(\`\${slug}/voice.mp3\`)} />
    {spec.scenes.slice(0, 6).map((scene, i) => {
      const sfxSrc = scene.entrySfx ? TRANSITION_SFX[scene.entrySfx.name as keyof typeof TRANSITION_SFX] : undefined;
      return sfxSrc ? (
        <Sequence key={\`sfx-\${i}\`} from={scene.startFrame} durationInFrames={90}>
          <Audio src={sfxSrc} volume={Math.min(scene.entrySfx?.volume ?? 0.2, 0.25)} />
        </Sequence>
      ) : null;
    })}
    <AbsoluteFill>
      {spec.scenes.slice(0, 6).map((scene, i) => {
        const extraFrames = 0;
        const isQuestionScene = scene.type === 'ending' && Boolean(scene.insightText) && !scene.isOutro;
        const cardDuration = scene.sectionCard
          ? (scene.sectionCard.number === '03' ? 86 : 76)
          : scene.insightText
            ? (isQuestionScene ? scene.durationFrames : 66)
            : undefined;

        const insightVariant = scene.insightVariant ?? 'overlay';
        const isFullInsightCard = Boolean(scene.insightText) && insightVariant === 'card';

        // Normalize asymmetric legacy compositions for clean square illustrations
        const comparisonComposition =
          scene.composition === 'editorial-left' || scene.composition === 'editorial-right'
            ? 'portrait-focus'
            : (scene.composition ?? 'portrait-focus');

        return (
          <Sequence
            key={i}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames + extraFrames}
          >
            {scene.isOutro ? (
              <OutroCard durationFrames={scene.durationFrames} />
            ) : (
              <>
                <ImageScene
                  src={cleanAssets[i] || scene.image.path}
                  durationFrames={scene.durationFrames + extraFrames}
                  kenBurns={scene.image?.kenBurns}
                  sceneIndex={i}
                  storyRole={scene.storyRole}
                  framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                  composition={comparisonComposition}
                  shotScale={scene.shotScale}
                  focalPoint={undefined}
                  hasSectionCard={Boolean(scene.sectionCard)}
                  hasInsightCard={isFullInsightCard}
                  cardDuration={cardDuration}
                  fadeInFrames={0}
                  fadeOutFrames={0}
                  container={scene.visualContainer}
                  motionPreset={scene.motionPreset}
                  motionProfile={scene.motionProfile}
                  visualBeats={undefined}
                  sceneStartFrame={scene.startFrame}
                />
                {scene.sectionCard ? (
                  <SectionCard
                    number={scene.sectionCard.number}
                    title={scene.sectionCard.title}
                    subtitle={scene.sectionCard.subtitle}
                    durationFrames={cardDuration}
                  />
                ) : null}
                {scene.insightText ? (
                  <InsightCard
                    statement={scene.insightText}
                    durationFrames={cardDuration}
                    framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                    variant={insightVariant}
                  />
                ) : null}
              </>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  </Layout>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Video"
    component={PilotCleanContent}
    durationInFrames={773}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(RemotionRoot);
`;
}

export async function finalizePilot(state, baseDir = BASE_DIR, execFn = execSync, renderSheetFn = null) {
  const selectedShots = state.shots.filter((s) => s.status === 'SELECTED');

  if (selectedShots.length < 6) {
    throw new Error(
      `Cannot finalize pilot: only ${selectedShots.length}/6 shots are SELECTED. All 6 shots must be SELECTED.`
    );
  }

  ensureDirectories(baseDir);
  const outMp4 = path.join(baseDir, 'video001-motion-clean-assets.mp4');

  // Copy selected assets to public scratch folder so staticFile can locate them cleanly
  if (baseDir === BASE_DIR) {
    const publicCleanDir = path.join(ROOT, 'public', 'scratch', 'v34', 'clean-assets');
    fs.mkdirSync(publicCleanDir, { recursive: true });
    for (let i = 0; i < 6; i++) {
      const padNum = String(i + 1).padStart(2, '0');
      const assetFile = path.join(baseDir, 'assets', `shot-${padNum}.jpg`);
      const publicDest = path.join(publicCleanDir, `shot-${padNum}.jpg`);
      fs.copyFileSync(assetFile, publicDest);
    }
  }

  // Create isolated PilotRoot.tsx that swaps only the 6 asset references
  const pilotRootPath = path.join(baseDir, 'PilotRoot.tsx');
  const pilotRootCode = generatePilotRootCode();
  fs.writeFileSync(pilotRootPath, pilotRootCode);

  console.log(`Rendering clean-asset pilot MP4 to: ${outMp4}...`);
  const cmd = `npx remotion render "${pilotRootPath}" Video "${outMp4}" --frames=0-772 --codec=h264`;
  execFn(cmd, { stdio: 'inherit', cwd: ROOT });

  // Generate Contact Sheet
  if (renderSheetFn) {
    await renderSheetFn(state, baseDir);
  } else {
    await createContactSheet(state, baseDir);
  }

  return { success: true, mp4: outMp4, pilotRootPath };
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    const state = loadState();
    console.log('\n=== V3.4A CLEAN ASSET PILOT STATUS ===');
    console.log(`Model: ${state.model}`);
    console.log(`Global Status: ${state.runStatus}`);
    console.log(`Identity Consistency: ${state.identityConsistency}`);
    console.log(`Updated: ${state.updatedAt}\n`);
    for (const s of state.shots) {
      console.log(
        `Shot ${s.pilotShotIndex} [${s.sourceSceneOrBeatId} - ${s.storyRole}]: ${s.status} ` +
          `(selected: ${s.selectedAttempt ?? 'none'}, next: ${s.nextAttempt ?? 'none'}, attempts: ${s.attempts.length})`
      );
      for (const a of s.attempts) {
        console.log(
          `  - Att ${a.attempt} (${a.file}): [${a.overall ?? a.qaStatus}] ` +
            `Style:${a.style ?? '?'} People:${a.peopleContract ?? '?'} Sem:${a.semanticFidelity ?? '?'} Anat:${a.anatomy ?? '?'} Text:${a.textPollution ?? '?'}` +
            (a.reasons?.length ? ` Reasons: ${a.reasons.join('; ')}` : '')
        );
      }
    }
    return;
  }

  if (args.includes('--generate')) {
    const shotArgIdx = args.indexOf('--shot');
    if (shotArgIdx === -1 || !args[shotArgIdx + 1]) {
      console.error('Usage: --generate --shot <0-5>');
      process.exit(1);
    }
    const shotIndex = parseInt(args[shotArgIdx + 1], 10);
    await generateAttempt(shotIndex);
    return;
  }

  if (args.includes('--record-qa')) {
    const getArg = (name) => {
      const idx = args.indexOf(name);
      return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
    };
    const shotIndex = parseInt(getArg('--shot'), 10);
    const attemptNum = parseInt(getArg('--attempt'), 10);
    const style = getArg('--style');
    const peopleContract = getArg('--people');
    const semanticFidelity = getArg('--semantic');
    const anatomy = getArg('--anatomy');
    const textPollution = getArg('--text');
    const reason = getArg('--reason');

    if (
      isNaN(shotIndex) ||
      isNaN(attemptNum) ||
      !style ||
      !peopleContract ||
      !semanticFidelity ||
      !anatomy ||
      !textPollution
    ) {
      console.error('Missing required arguments for --record-qa');
      process.exit(1);
    }

    recordQa({
      shotIndex,
      attemptNum,
      style,
      peopleContract,
      semanticFidelity,
      anatomy,
      textPollution,
      reasons: reason ? [reason] : [],
    });
    return;
  }

  if (args.includes('--finalize')) {
    const state = loadState();
    await finalizePilot(state);
    return;
  }

  console.log('Valid flags: --status, --generate --shot <idx>, --record-qa ..., --finalize');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
