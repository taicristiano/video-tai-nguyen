/**
 * scripts/test-hay-dep-video001-schnell-qa-retry.mjs
 *
 * HAY & ĐẸP. — V3.3B-S.6.2.1 / FINAL GATE 1 PRE-FLIGHT
 * Hardened Bounded Visual QA + Retry State Machine
 * Model: @cf/black-forest-labs/flux-1-schnell
 *
 * Guarantees:
 * - SHA-256 prompt verification on EVERY live generation call (FROZEN_PROMPT_MISMATCH)
 * - Strict transition guards for generation success and visual QA recording
 * - EXHAUSTED status strictly requires 3 real generated candidates that all failed QA
 * - Working --record-qa CLI with input validation
 * - Persisted operational API metrics in ledger with invariant enforcement
 * - Non-quota API errors maintain IN_PROGRESS run status
 * - Migration does not fabricate historical per-beat error events
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
export const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'video001-schnell-qa-retry');
export const S6_DIR = path.join(ROOT, 'scratch', 'v33', 'video001-schnell-safe-pilot');
export const S6_PROMPTS_PATH = path.join(S6_DIR, 'prompts.json');

export const MODEL_ID = '@cf/black-forest-labs/flux-1-schnell';
export const TARGET_BEATS = [
  'beat-02',
  'beat-04',
  'beat-06',
  'beat-07',
  'beat-08',
  'beat-09',
  'beat-10',
  'beat-12',
  'beat-15',
];

export function computeSha256(text) {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
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

export function loadS6Prompts(sourcePath = S6_PROMPTS_PATH) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`S.6 prompts file not found at: ${sourcePath}`);
  }
  const raw = fs.readFileSync(sourcePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Section 2: SHA-256 Prompt Integrity Verification
 */
export function verifyFrozenPrompts(frozen, s6Prompts) {
  let allMatch = true;
  const report = {};

  for (const beatId of TARGET_BEATS) {
    const s6Entry = s6Prompts[beatId];
    if (!s6Entry || !s6Entry.prompt) {
      throw new Error(`Missing prompt for ${beatId} in S.6 source!`);
    }

    const frozenEntry = frozen[beatId];
    if (!frozenEntry || !frozenEntry.prompt) {
      throw new Error(`Missing prompt for ${beatId} in frozen prompts!`);
    }

    const sourceSha256 = computeSha256(s6Entry.prompt);
    const frozenSha256 = computeSha256(frozenEntry.prompt);
    const match = sourceSha256 === frozenSha256;

    if (!match) allMatch = false;

    report[beatId] = {
      beatId,
      sourceSha256,
      frozenSha256,
      promptChangedFromS6: !match,
    };
  }

  return { allMatch, report };
}

export function initFrozenPrompts(baseDir = BASE_DIR, sourcePath = S6_PROMPTS_PATH) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const s6Prompts = loadS6Prompts(sourcePath);
  const frozen = {};

  for (const beatId of TARGET_BEATS) {
    const s6Entry = s6Prompts[beatId];
    if (!s6Entry || !s6Entry.prompt) {
      throw new Error(`Missing prompt for ${beatId} in S.6 prompts source!`);
    }

    const sourcePrompt = s6Entry.prompt;
    const sourceSha256 = computeSha256(sourcePrompt);

    frozen[beatId] = {
      beatId,
      fulfillment: s6Entry.fulfillment,
      sourceRoute: s6Entry.sourceRoute,
      selectedMember: s6Entry.selectedMember,
      charCount: sourcePrompt.length,
      sourceSha256,
      frozenSha256: sourceSha256,
      promptChangedFromS6: false,
      prompt: sourcePrompt,
    };
  }

  const frozenPath = path.join(baseDir, 'prompts-frozen.json');
  fs.writeFileSync(frozenPath, JSON.stringify(frozen, null, 2));

  // Reload and verify
  const reloaded = JSON.parse(fs.readFileSync(frozenPath, 'utf-8'));
  const verification = verifyFrozenPrompts(reloaded, s6Prompts);

  if (!verification.allMatch) {
    throw new Error('FROZEN_PROMPT_MISMATCH: Initial prompt verification failed');
  }

  return reloaded;
}

export function loadFrozenPrompts(baseDir = BASE_DIR) {
  const frozenPath = path.join(baseDir, 'prompts-frozen.json');
  if (!fs.existsSync(frozenPath)) {
    return initFrozenPrompts(baseDir);
  }
  return JSON.parse(fs.readFileSync(frozenPath, 'utf-8'));
}

export function loadQaLedger(baseDir = BASE_DIR) {
  const qaPath = path.join(baseDir, 'qa.json');
  if (!fs.existsSync(qaPath)) {
    throw new Error(`QA ledger not found at ${qaPath}`);
  }
  return JSON.parse(fs.readFileSync(qaPath, 'utf-8'));
}

export function saveQaLedger(ledger, baseDir = BASE_DIR) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  ledger.updatedAt = new Date().toISOString();

  // Validate operational metrics invariant if present
  if (ledger.operationalMetrics) {
    const op = ledger.operationalMetrics;
    const expectedTotal = op.successfulGenerationCallsSinceMigration + op.failedApiRequestsSinceMigration;
    if (op.apiRequestsSinceMigration !== expectedTotal) {
      throw new Error(
        `Metric invariant violated: apiRequestsSinceMigration (${op.apiRequestsSinceMigration}) !== ` +
          `successful (${op.successfulGenerationCallsSinceMigration}) + failed (${op.failedApiRequestsSinceMigration})`
      );
    }
  }

  const qaPath = path.join(baseDir, 'qa.json');
  fs.writeFileSync(qaPath, JSON.stringify(ledger, null, 2));
}

/**
 * Section 3 & 7: API Error Handling and Quota Isolation
 */
export function handleApiError(beatId, requestedAttempt, error, ledger) {
  const is429 = error.httpStatus === 429 || (error.message && error.message.includes('429'));
  const isQuota = is429 || (error.message && (error.message.includes('neuron') || error.message.includes('quota')));

  const beat = ledger.beats.find((b) => b.beatId === beatId);
  if (!beat) throw new Error(`Beat ${beatId} not found in ledger!`);

  if (!beat.generationErrors) beat.generationErrors = [];

  beat.generationErrors.push({
    requestedAttempt,
    httpStatus: error.httpStatus || (is429 ? 429 : 500),
    kind: isQuota ? 'QUOTA' : 'NETWORK',
    message: error.message || String(error),
    timestamp: new Date().toISOString(),
  });

  // Track failed operational API request
  if (!ledger.operationalMetrics) {
    ledger.operationalMetrics = {
      baselineImagesReused: 9,
      apiRequestsSinceMigration: 0,
      successfulGenerationCallsSinceMigration: 0,
      failedApiRequestsSinceMigration: 0,
    };
  }
  ledger.operationalMetrics.failedApiRequestsSinceMigration += 1;
  ledger.operationalMetrics.apiRequestsSinceMigration += 1;

  if (isQuota) {
    // Quota exhaustion pauses the run
    ledger.runStatus = 'PAUSED_QUOTA';
    beat.status = 'NEEDS_GENERATION';
    beat.nextAttempt = requestedAttempt;
  } else {
    // Issue F: Non-quota API/network error remains IN_PROGRESS, beat still NEEDS_GENERATION
    ledger.runStatus = 'IN_PROGRESS';
    beat.status = 'NEEDS_GENERATION';
    beat.nextAttempt = requestedAttempt;
  }

  return ledger;
}

/**
 * Section 3: Generation Success Guard
 */
export function handleGenerationSuccess(beatId, attemptNum, imageBuffer, ledger, baseDir = BASE_DIR) {
  const beat = ledger.beats.find((b) => b.beatId === beatId);
  if (!beat) throw new Error(`Beat ${beatId} not found in ledger!`);

  // Guard 1: Beat must be in NEEDS_GENERATION
  if (beat.status !== 'NEEDS_GENERATION') {
    throw new Error(
      `Cannot record generation success: beat ${beatId} status is ${beat.status}, expected NEEDS_GENERATION`
    );
  }

  // Guard 2: Attempt number must equal beat.nextAttempt
  if (attemptNum !== beat.nextAttempt) {
    throw new Error(
      `Attempt number mismatch for ${beatId}: received attempt ${attemptNum}, expected ${beat.nextAttempt}`
    );
  }

  // Guard 3: No existing attempt with the same attempt number
  if (!beat.attempts) beat.attempts = [];
  const existingAttempt = beat.attempts.find((a) => a.attempt === attemptNum);
  if (existingAttempt) {
    throw new Error(`Duplicate attempt: attempt ${attemptNum} already exists for beat ${beatId}`);
  }

  const attemptPadded = String(attemptNum).padStart(2, '0');
  const filename = `${beatId}-attempt-${attemptPadded}.jpg`;
  const filePath = path.join(baseDir, filename);

  // 1. Save buffer to disk
  fs.writeFileSync(filePath, imageBuffer);

  // 2. Track operational metric
  if (!ledger.operationalMetrics) {
    ledger.operationalMetrics = {
      baselineImagesReused: 9,
      apiRequestsSinceMigration: 0,
      successfulGenerationCallsSinceMigration: 0,
      failedApiRequestsSinceMigration: 0,
    };
  }
  ledger.operationalMetrics.successfulGenerationCallsSinceMigration += 1;
  ledger.operationalMetrics.apiRequestsSinceMigration += 1;

  // 3. Append attempt to ledger
  beat.attempts.push({
    attempt: attemptNum,
    file: filename,
    generationStatus: 'SUCCESS',
    qaStatus: 'PENDING',
    timestamp: new Date().toISOString(),
  });

  // 4. State transition: AWAITING_QA
  beat.status = 'AWAITING_QA';
  beat.nextAttempt = null;

  return { filename, filePath, ledger };
}

/**
 * Section 3 & 4: Visual QA Transition Guard & EXHAUSTED Verification
 */
export function recordVisualQa({
  beatId,
  attempt,
  style,
  peopleContract,
  semanticFidelity,
  anatomy,
  textPollution,
  reasons = [],
  ledger,
  baseDir = BASE_DIR,
}) {
  const beat = ledger.beats.find((b) => b.beatId === beatId);
  if (!beat) throw new Error(`Beat ${beatId} not found in ledger!`);

  // Guard 1: Beat status must be AWAITING_QA
  if (beat.status !== 'AWAITING_QA') {
    throw new Error(
      `Cannot record visual QA: beat ${beatId} status is ${beat.status}, expected AWAITING_QA`
    );
  }

  // Guard 2: Requested attempt must be the latest attempt in beat.attempts
  if (!beat.attempts || beat.attempts.length === 0) {
    throw new Error(`Cannot record visual QA: beat ${beatId} has no generated attempts`);
  }
  const latestAttempt = beat.attempts[beat.attempts.length - 1];
  if (latestAttempt.attempt !== attempt) {
    throw new Error(
      `Cannot record visual QA: attempt ${attempt} is not the latest attempt (latest is ${latestAttempt.attempt})`
    );
  }

  // Guard 3: Attempt must be generationStatus === SUCCESS and qaStatus === PENDING
  if (latestAttempt.generationStatus !== 'SUCCESS') {
    throw new Error(
      `Cannot record visual QA: attempt ${attempt} generationStatus is ${latestAttempt.generationStatus}, expected SUCCESS`
    );
  }
  if (latestAttempt.qaStatus !== 'PENDING') {
    throw new Error(
      `Cannot record visual QA: attempt ${attempt} qaStatus is ${latestAttempt.qaStatus}, expected PENDING`
    );
  }

  // Guard 4: Image file must exist on disk
  const expectedPath = path.join(baseDir, latestAttempt.file);
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Cannot record visual QA: image file does not exist on disk at ${expectedPath}`);
  }

  // Guard 5: Validate 5 dimension values
  const validValues = ['PASS', 'FAIL'];
  if (!validValues.includes(style)) throw new Error(`Invalid QA value for style: ${style}`);
  if (!validValues.includes(peopleContract)) throw new Error(`Invalid QA value for peopleContract: ${peopleContract}`);
  if (!validValues.includes(semanticFidelity)) throw new Error(`Invalid QA value for semanticFidelity: ${semanticFidelity}`);
  if (!validValues.includes(anatomy)) throw new Error(`Invalid QA value for anatomy: ${anatomy}`);
  if (!validValues.includes(textPollution)) throw new Error(`Invalid QA value for textPollution: ${textPollution}`);
  if (!Array.isArray(reasons)) throw new Error('reasons must be an array');

  const overall =
    style === 'PASS' &&
    peopleContract === 'PASS' &&
    semanticFidelity === 'PASS' &&
    anatomy === 'PASS' &&
    textPollution === 'PASS'
      ? 'PASS'
      : 'FAIL';

  latestAttempt.qaStatus = 'COMPLETED';
  latestAttempt.style = style;
  latestAttempt.peopleContract = peopleContract;
  latestAttempt.semanticFidelity = semanticFidelity;
  latestAttempt.anatomy = anatomy;
  latestAttempt.textPollution = textPollution;
  latestAttempt.overall = overall;
  latestAttempt.reasons = reasons;

  if (overall === 'PASS') {
    beat.status = 'SELECTED';
    beat.selectedAttempt = attempt;
    beat.selectedFile = latestAttempt.file;
    beat.nextAttempt = null;
  } else {
    if (attempt < 3) {
      beat.status = 'NEEDS_GENERATION';
      beat.nextAttempt = attempt + 1;
    } else if (attempt === 3) {
      // Issue C: Explicitly validate all three attempts exist and failed visual QA
      const att1 = beat.attempts.find((a) => a.attempt === 1);
      const att2 = beat.attempts.find((a) => a.attempt === 2);
      const att3 = beat.attempts.find((a) => a.attempt === 3);

      const allThreeValid =
        att1 &&
        att2 &&
        att3 &&
        att1.generationStatus === 'SUCCESS' &&
        att1.qaStatus === 'COMPLETED' &&
        att1.overall === 'FAIL' &&
        att2.generationStatus === 'SUCCESS' &&
        att2.qaStatus === 'COMPLETED' &&
        att2.overall === 'FAIL' &&
        att3.generationStatus === 'SUCCESS' &&
        att3.qaStatus === 'COMPLETED' &&
        att3.overall === 'FAIL';

      if (!allThreeValid) {
        throw new Error(
          `State integrity error: cannot mark ${beatId} EXHAUSTED without 3 successfully generated and completed QA FAIL attempts.`
        );
      }

      beat.status = 'EXHAUSTED';
      beat.nextAttempt = null;
    }
  }

  return ledger;
}

/**
 * Section 8: Migration from S.6 Baseline without Fabricating Errors
 */
export function migrateFromS6Baseline(baseDir = BASE_DIR, s6Dir = S6_DIR) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const s6QaPath = path.join(s6Dir, 'qa.json');
  if (!fs.existsSync(s6QaPath)) {
    throw new Error(`S.6 QA file not found at ${s6QaPath}`);
  }

  const s6Qa = JSON.parse(fs.readFileSync(s6QaPath, 'utf-8'));
  const ledger = {
    runStatus: 'PAUSED_QUOTA', // Quota is currently known exhausted
    updatedAt: new Date().toISOString(),
    migrationNote: 'Previous run was reported quota-blocked; no exact historical per-beat API event imported.',
    operationalMetrics: {
      baselineImagesReused: 9,
      apiRequestsSinceMigration: 0,
      successfulGenerationCallsSinceMigration: 0,
      failedApiRequestsSinceMigration: 0,
    },
    beats: [],
  };

  for (const item of s6Qa) {
    const beatId = item.beatId;
    const attempt01File = `${beatId}-attempt-01.jpg`;
    const srcFile = path.join(s6Dir, `${beatId}.jpg`);
    const destFile = path.join(baseDir, attempt01File);

    if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
      fs.copyFileSync(srcFile, destFile);
    }

    const reasons = [];
    if (item.style === 'FAIL') reasons.push('style drift');
    if (item.peopleContract === 'FAIL') reasons.push('people contract violation');
    if (item.semanticFidelity === 'FAIL') reasons.push('semantic fidelity mismatch');
    if (item.anatomy === 'FAIL') reasons.push('anatomy failure');
    if (item.textPollution === 'FAIL') reasons.push('pseudo-writing / text pollution');

    const att1 = {
      attempt: 1,
      file: attempt01File,
      generationStatus: 'SUCCESS',
      qaStatus: 'COMPLETED',
      style: item.style,
      peopleContract: item.peopleContract,
      semanticFidelity: item.semanticFidelity,
      anatomy: item.anatomy,
      textPollution: item.textPollution,
      overall: item.overall,
      reasons,
    };

    const beatEntry = {
      beatId,
      status: 'NEEDS_GENERATION',
      nextAttempt: 2,
      selectedAttempt: null,
      selectedFile: null,
      attempts: [att1],
      generationErrors: [], // Issue G: Do not fabricate artificial per-beat 429 events
    };

    if (item.overall === 'PASS') {
      beatEntry.status = 'SELECTED';
      beatEntry.selectedAttempt = 1;
      beatEntry.selectedFile = attempt01File;
      beatEntry.nextAttempt = null;
    } else {
      beatEntry.status = 'NEEDS_GENERATION';
      beatEntry.nextAttempt = 2;
    }

    ledger.beats.push(beatEntry);
  }

  saveQaLedger(ledger, baseDir);
  return ledger;
}

/**
 * Section 6: Truthful Metrics Reading from Persistent Ledger
 */
export function getMetrics(ledger) {
  let baselineImagesReused = 0;
  let visuallyRejectedCandidates = 0;
  let successfulGeneratedCandidatesTotal = 0;
  let selectedBeats = 0;
  let exhaustedBeats = 0;
  let pendingBeats = 0;

  let firstAttemptPassCount = 0;
  let secondAttemptPassCount = 0;
  let thirdAttemptPassCount = 0;

  for (const b of ledger.beats) {
    if (b.status === 'SELECTED') {
      selectedBeats++;
      if (b.selectedAttempt === 1) firstAttemptPassCount++;
      else if (b.selectedAttempt === 2) secondAttemptPassCount++;
      else if (b.selectedAttempt === 3) thirdAttemptPassCount++;
    } else if (b.status === 'EXHAUSTED') {
      exhaustedBeats++;
    } else {
      pendingBeats++;
    }

    for (const a of b.attempts || []) {
      if (a.generationStatus === 'SUCCESS') {
        successfulGeneratedCandidatesTotal++;
        if (a.attempt === 1) baselineImagesReused++;
      }
      if (a.qaStatus === 'COMPLETED' && a.overall === 'FAIL') {
        visuallyRejectedCandidates++;
      }
    }
  }

  const op = ledger.operationalMetrics || {
    baselineImagesReused,
    apiRequestsSinceMigration: 0,
    successfulGenerationCallsSinceMigration: 0,
    failedApiRequestsSinceMigration: 0,
  };

  return {
    baselineImagesReused: op.baselineImagesReused || baselineImagesReused,
    apiRequestsSinceMigration: op.apiRequestsSinceMigration,
    successfulGenerationCallsSinceMigration: op.successfulGenerationCallsSinceMigration,
    failedApiRequestsSinceMigration: op.failedApiRequestsSinceMigration,
    apiRequestsThisRun: op.apiRequestsSinceMigration,
    successfulGenerationCallsThisRun: op.successfulGenerationCallsSinceMigration,
    failedApiRequestsThisRun: op.failedApiRequestsSinceMigration,
    successfulGeneratedCandidatesTotal,
    visuallyRejectedCandidates,
    selectedBeats,
    exhaustedBeats,
    pendingBeats,
    firstAttemptPassCount,
    secondAttemptPassCount,
    thirdAttemptPassCount,
    runStatus: ledger.runStatus,
  };
}

/**
 * Check Finalization Eligibility
 */
export function checkFinalizationEligibility(ledger) {
  if (ledger.runStatus === 'PAUSED_QUOTA') {
    return {
      eligible: false,
      reason: 'PAUSED_QUOTA',
      verdict: 'V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — PAUSED_QUOTA',
      message: 'EXPERIMENT INCOMPLETE (Infrastructure paused on quota)',
    };
  }

  const pending = ledger.beats.filter((b) => b.status === 'NEEDS_GENERATION' || b.status === 'AWAITING_QA');
  if (pending.length > 0) {
    return {
      eligible: false,
      reason: 'BEATS_PENDING',
      pendingBeats: pending.map((b) => b.beatId),
      message: 'EXPERIMENT INCOMPLETE (Beats remain pending generation or QA)',
    };
  }

  const allSelected = ledger.beats.every((b) => b.status === 'SELECTED');
  if (allSelected) {
    return {
      eligible: true,
      verdict: 'V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — PASS',
      message: 'All 9 beats selected',
    };
  }

  const hasExhausted = ledger.beats.some((b) => b.status === 'EXHAUSTED');
  if (hasExhausted) {
    return {
      eligible: true,
      verdict: 'V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — FAIL',
      message: 'One or more beats exhausted after 3 visual QA failures',
    };
  }

  return { eligible: false, message: 'EXPERIMENT INCOMPLETE' };
}

/**
 * Calls Cloudflare Workers AI FLUX.1 Schnell
 */
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
    const err = new Error(`No result.image in response: ${textBody.slice(0, 300)}`);
    err.httpStatus = 502;
    throw err;
  }

  return Buffer.from(imageBase64, 'base64');
}

/**
 * Section 2 & 10: Generate exactly ONE next candidate with preflight SHA verification
 */
export async function generateNextCandidate(baseDir = BASE_DIR, sourcePath = S6_PROMPTS_PATH) {
  // Issue A: Verify prompt hashes on EVERY generation preflight
  const s6Prompts = loadS6Prompts(sourcePath);
  const frozen = loadFrozenPrompts(baseDir);
  const verification = verifyFrozenPrompts(frozen, s6Prompts);

  if (!verification.allMatch) {
    throw new Error('FROZEN_PROMPT_MISMATCH: Frozen prompt hashes differ from S.6 source prompts!');
  }

  const ledger = loadQaLedger(baseDir);

  const nextBeat = ledger.beats.find((b) => b.status === 'NEEDS_GENERATION');
  if (!nextBeat) {
    console.log('No beats currently need generation.');
    return null;
  }

  const beatId = nextBeat.beatId;
  const attemptNum = nextBeat.nextAttempt;
  const prompt = frozen[beatId]?.prompt;

  if (!prompt) throw new Error(`Prompt missing for ${beatId}`);

  // Set run status to IN_PROGRESS when actively attempting generation
  ledger.runStatus = 'IN_PROGRESS';
  saveQaLedger(ledger, baseDir);

  console.log(`Generating single candidate for ${beatId} (Attempt ${attemptNum})...`);
  try {
    const buffer = await callCloudflareSchnell(prompt);
    handleGenerationSuccess(beatId, attemptNum, buffer, ledger, baseDir);
    saveQaLedger(ledger, baseDir);
    console.log(`✅ Saved ${beatId}-attempt-0${attemptNum}.jpg. Status is now AWAITING_QA.`);
    console.log('🛑 STOPPING: Visually inspect candidate before recording QA or generating next.');
    return { beatId, attemptNum, status: 'AWAITING_QA' };
  } catch (err) {
    console.log(`❌ Generation failed: ${err.message}`);
    handleApiError(beatId, attemptNum, err, ledger);
    saveQaLedger(ledger, baseDir);
    return { beatId, attemptNum, status: 'ERROR', error: err.message };
  }
}

/**
 * Section 5: CLI Helper for --record-qa
 */
export function executeRecordQaCli(beatId, attemptNum, qaJsonPath, baseDir = BASE_DIR) {
  if (!beatId || isNaN(attemptNum) || !qaJsonPath) {
    throw new Error('Usage: --record-qa <beatId> <attempt> <qa-json-file>');
  }

  const absQaPath = path.isAbsolute(qaJsonPath) ? qaJsonPath : path.resolve(process.cwd(), qaJsonPath);
  if (!fs.existsSync(absQaPath)) {
    throw new Error(`QA JSON file not found at: ${absQaPath}`);
  }

  const qaRaw = fs.readFileSync(absQaPath, 'utf-8');
  let qaData;
  try {
    qaData = JSON.parse(qaRaw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${qaJsonPath}: ${err.message}`);
  }

  const ledger = loadQaLedger(baseDir);

  recordVisualQa({
    beatId,
    attempt: attemptNum,
    style: qaData.style,
    peopleContract: qaData.peopleContract,
    semanticFidelity: qaData.semanticFidelity,
    anatomy: qaData.anatomy,
    textPollution: qaData.textPollution,
    reasons: qaData.reasons || [],
    ledger,
    baseDir,
  });

  saveQaLedger(ledger, baseDir);

  const beat = ledger.beats.find((b) => b.beatId === beatId);
  console.log(`✅ Recorded visual QA for ${beatId} Attempt ${attemptNum}.`);
  console.log(`  New Status: [${beat.status}] (nextAttempt: ${beat.nextAttempt}, selectedAttempt: ${beat.selectedAttempt})`);
  console.log('🛑 STOPPING: Ready for next step.');
  return beat;
}

/**
 * Contact Sheet Rendering
 */
export async function renderContactSheet({
  cards,
  columns = 3,
  outputPath,
  title,
  subtitle,
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const cardsHtml = cards
    .map((card) => {
      let contentTag = '';
      if (card.cardType === 'EXHAUSTED') {
        contentTag = `
          <div style="width:100%;aspect-ratio:1/1;background:#2A1215;border:2px dashed #E06C75;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#E06C75;padding:16px;box-sizing:border-box;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">❌</div>
            <div style="font-size:15px;font-weight:700;">EXHAUSTED</div>
            <div style="font-size:11px;color:#A07075;margin-top:6px;">3/3 attempts failed visual QA</div>
          </div>`;
      } else if (card.cardType === 'NEEDS_GENERATION') {
        contentTag = `
          <div style="width:100%;aspect-ratio:1/1;background:#181E24;border:2px dashed #61AFEF;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#61AFEF;padding:16px;box-sizing:border-box;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">⏳</div>
            <div style="font-size:15px;font-weight:700;">NEEDS GENERATION</div>
            <div style="font-size:11px;color:#7A9BB8;margin-top:6px;">Next: Attempt ${card.attemptNum || 2}</div>
          </div>`;
      } else if (card.cardType === 'AWAITING_QA') {
        const absPath = path.isAbsolute(card.path) ? card.path : path.resolve(ROOT, card.path);
        let imgTag = '';
        if (fs.existsSync(absPath)) {
          const buf = fs.readFileSync(absPath);
          imgTag = `<img src="data:image/jpeg;base64,${buf.toString('base64')}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;" />`;
        }
        contentTag = `
          <div style="position:relative;width:100%;aspect-ratio:1/1;">
            ${imgTag}
            <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(229,192,123,0.85);color:#111;font-weight:700;font-size:11px;padding:4px;text-align:center;">
              AWAITING QA (Attempt ${card.attemptNum})
            </div>
          </div>`;
      } else {
        const absPath = path.isAbsolute(card.path) ? card.path : path.resolve(ROOT, card.path);
        if (fs.existsSync(absPath)) {
          const buf = fs.readFileSync(absPath);
          contentTag = `<img src="data:image/jpeg;base64,${buf.toString('base64')}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;" />`;
        } else {
          contentTag = `<div style="width:100%;aspect-ratio:1/1;background:#222;display:flex;align-items:center;justify-content:center;color:#888;">Image missing</div>`;
        }
      }

      return `
        <div style="background:#181818;border:1px solid #333;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:8px 10px;font-size:13px;font-weight:700;color:#F0F0F0;background:#111;text-align:center;border-bottom:1px solid #282828;">
            ${card.header}
          </div>
          ${contentTag}
          <div style="padding:8px 10px;font-size:11px;font-weight:500;color:#AAA;background:#141414;text-align:center;border-top:1px solid #282828;white-space:pre-line;">
            ${card.footer}
          </div>
        </div>
      `;
    })
    .join('');

  const gridHtml = `<div style="display:grid;grid-template-columns:repeat(${columns}, 1fr);gap:20px;">${cardsHtml}</div>`;

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
      font-size: 22px;
      font-weight: 700;
      color: #F5EFEB;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 13px;
      color: #8C827A;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div>
    ${gridHtml}
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'load' });
  const viewportWidth = columns * 340 + 48;
  const rowCount = Math.ceil(cards.length / columns);
  const viewportHeight = rowCount * 420 + 150;
  await page.setViewportSize({ width: viewportWidth, height: viewportHeight });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
}

/**
 * Finalize Outputs
 */
export async function finalizeOutputs(baseDir = BASE_DIR) {
  const ledger = loadQaLedger(baseDir);
  const eligibility = checkFinalizationEligibility(ledger);

  const selectedDir = path.join(baseDir, 'selected');
  if (!fs.existsSync(selectedDir)) fs.mkdirSync(selectedDir, { recursive: true });

  const selectedCards = [];
  const rejectedCards = [];

  for (const beat of ledger.beats) {
    if (beat.status === 'SELECTED' && beat.selectedFile) {
      const src = path.join(baseDir, beat.selectedFile);
      const dest = path.join(selectedDir, `${beat.beatId}.jpg`);
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
      selectedCards.push({
        path: dest,
        header: beat.beatId.toUpperCase(),
        footer: `SELECTED attempt ${beat.selectedAttempt}`,
        cardType: 'SELECTED',
      });
    } else if (beat.status === 'EXHAUSTED') {
      selectedCards.push({
        path: '',
        header: beat.beatId.toUpperCase(),
        footer: 'EXHAUSTED 3/3 QA FAIL',
        cardType: 'EXHAUSTED',
      });
    } else if (beat.status === 'AWAITING_QA') {
      const lastAtt = beat.attempts[beat.attempts.length - 1];
      selectedCards.push({
        path: path.join(baseDir, lastAtt.file),
        header: beat.beatId.toUpperCase(),
        footer: `AWAITING QA attempt ${lastAtt.attempt}`,
        cardType: 'AWAITING_QA',
        attemptNum: lastAtt.attempt,
      });
    } else {
      selectedCards.push({
        path: '',
        header: beat.beatId.toUpperCase(),
        footer: `NEEDS GENERATION attempt ${beat.nextAttempt || 2}`,
        cardType: 'NEEDS_GENERATION',
        attemptNum: beat.nextAttempt || 2,
      });
    }

    for (const att of beat.attempts || []) {
      if (att.qaStatus === 'COMPLETED' && att.overall === 'FAIL') {
        rejectedCards.push({
          path: path.join(baseDir, att.file),
          header: `${beat.beatId.toUpperCase()} ATTEMPT-0${att.attempt}`,
          footer: `FAIL: ${(att.reasons || []).join(', ') || 'visual QA failure'}`,
          cardType: 'REJECTED',
        });
      }
    }
  }

  // Render contact-sheet-selected.jpg
  const contactSheetSelectedPath = path.join(baseDir, 'contact-sheet-selected.jpg');
  await renderContactSheet({
    cards: selectedCards,
    columns: 3,
    outputPath: contactSheetSelectedPath,
    title: 'HAY & ĐẸP. V3.3B-S.6.2 — Current State (3 × 3 Grid)',
    subtitle: `Video 001 Schnell-Safe Fulfillment • Status: ${ledger.runStatus}`,
  });

  // Render contact-sheet-rejected.jpg if rejections exist
  if (rejectedCards.length > 0) {
    const contactSheetRejectedPath = path.join(baseDir, 'contact-sheet-rejected.jpg');
    const cols = rejectedCards.length <= 4 ? rejectedCards.length : 4;
    await renderContactSheet({
      cards: rejectedCards,
      columns: cols,
      outputPath: contactSheetRejectedPath,
      title: 'HAY & ĐẸP. V3.3B-S.6.2 — Rejected Visual Candidates',
      subtitle: `Total Rejected Candidates: ${rejectedCards.length}`,
    });
  }

  // Update run-report.json
  const metrics = getMetrics(ledger);
  const reportPath = path.join(baseDir, 'run-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));

  // Update evaluation.md
  const evalPath = path.join(baseDir, 'evaluation.md');
  const evalMd = `# HAY & ĐẸP. — V3.3B-S.6.2 STATUS REPORT

## State Summary
- **Run Status**: \`${ledger.runStatus}\`
- **Selected Beats**: ${metrics.selectedBeats} / 9
- **Needs Generation**: ${ledger.beats.filter((b) => b.status === 'NEEDS_GENERATION').length} / 9
- **Awaiting QA**: ${ledger.beats.filter((b) => b.status === 'AWAITING_QA').length} / 9
- **Genuinely Exhausted (3/3 visual fails)**: ${metrics.exhaustedBeats} / 9
- **Baseline Images Reused**: ${metrics.baselineImagesReused}
- **Live API Requests Since Migration**: ${metrics.apiRequestsSinceMigration}
- **Successful Live Generation Calls**: ${metrics.successfulGenerationCallsSinceMigration}
- **Failed Live API Requests**: ${metrics.failedApiRequestsSinceMigration}
- **Visually Rejected Candidates**: ${metrics.visuallyRejectedCandidates}

## Eligibility Check
\`${eligibility.message}\`
${eligibility.verdict ? `**Verdict**: \`${eligibility.verdict}\`` : '**Verdict**: None (Experiment Incomplete)'}
`;
  fs.writeFileSync(evalPath, evalMd);

  return { eligibility, metrics };
}

export function printStatus(baseDir = BASE_DIR) {
  const ledger = loadQaLedger(baseDir);
  const metrics = getMetrics(ledger);

  console.log('=== HAY & ĐẸP. V3.3B-S.6.2 Retry Ledger Status ===');
  console.log(`Global Run Status: ${ledger.runStatus}`);
  console.log(`Updated At: ${ledger.updatedAt}\n`);

  console.log('Beat States:');
  for (const b of ledger.beats) {
    const errCount = (b.generationErrors || []).length;
    const attCount = (b.attempts || []).length;
    const errStr = errCount > 0 ? ` (errors: ${errCount})` : '';
    console.log(
      `  ${b.beatId}: [${b.status}] selectedAttempt=${b.selectedAttempt} nextAttempt=${b.nextAttempt} attempts=${attCount}${errStr}`
    );
  }

  console.log('\nTruthful Metrics:');
  console.log(`  Selected Beats:                          ${metrics.selectedBeats} / 9`);
  console.log(`  Needs Generation / Awaiting QA:          ${metrics.pendingBeats} / 9`);
  console.log(`  Exhausted Beats (3/3 visual fails):      ${metrics.exhaustedBeats} / 9`);
  console.log(`  Baseline Images Reused:                  ${metrics.baselineImagesReused}`);
  console.log(`  Total Successful Image Candidates:       ${metrics.successfulGeneratedCandidatesTotal}`);
  console.log(`  Visually Rejected Candidates:            ${metrics.visuallyRejectedCandidates}`);
  console.log(`  Live API Requests Since Migration:       ${metrics.apiRequestsSinceMigration}`);
  console.log(`  Live Successful Generation Calls:        ${metrics.successfulGenerationCallsSinceMigration}`);
  console.log(`  Live Failed API Requests:                ${metrics.failedApiRequestsSinceMigration}`);
}

// --- CLI Runner ---
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === '--init') {
    initFrozenPrompts();
    console.log('✅ Frozen prompts initialized with SHA-256 verification.');
  } else if (cmd === '--migrate') {
    migrateFromS6Baseline();
    console.log('✅ Migrated S.6 baseline into truthful retry ledger.');
    printStatus();
    await finalizeOutputs();
  } else if (cmd === '--status') {
    printStatus();
  } else if (cmd === '--generate-next') {
    await generateNextCandidate();
  } else if (cmd === '--record-qa') {
    const beatId = args[1];
    const attempt = parseInt(args[2], 10);
    const qaJsonPath = args[3];
    executeRecordQaCli(beatId, attempt, qaJsonPath);
  } else if (cmd === '--finalize') {
    const res = await finalizeOutputs();
    console.log('Finalization result:', res.eligibility);
  } else {
    console.log('Available commands:');
    console.log('  --init');
    console.log('  --migrate');
    console.log('  --status');
    console.log('  --generate-next');
    console.log('  --record-qa <beatId> <attempt> <qa-json-file>');
    console.log('  --finalize');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
