/**
 * scripts/pipeline-state.mjs
 *
 * Deterministic Pipeline State Machine & Resume Lifecycle Manager for HAY & ĐẸP.
 *
 * Valid lifecycle states:
 *   - PLANNING
 *   - PENDING_HUMAN_IMAGE_QA
 *   - READY_TO_RENDER
 *   - PENDING_HUMAN_VIDEO_QA
 *   - COMPLETE
 *   - PAUSED_QUOTA
 *   - BLOCKED
 *
 * Persistence:
 *   videos/<slug>/pipeline-state.json
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const PIPELINE_STATES = Object.freeze({
  PLANNING: 'PLANNING',
  PENDING_HUMAN_IMAGE_QA: 'PENDING_HUMAN_IMAGE_QA',
  READY_TO_RENDER: 'READY_TO_RENDER',
  PENDING_HUMAN_VIDEO_QA: 'PENDING_HUMAN_VIDEO_QA',
  COMPLETE: 'COMPLETE',
  PAUSED_QUOTA: 'PAUSED_QUOTA',
  BLOCKED: 'BLOCKED',
});

/**
 * Validates that an episode slug is safe and contains no directory traversal or invalid characters.
 * Allowed pattern: ^[a-zA-Z0-9][a-zA-Z0-9._-]*$
 * Explicitly rejects: '', '.', '..', containing '/', '\', control characters, NUL, etc.
 *
 * @param {string} slug
 * @returns {string} The validated slug
 * @throws {Error} If slug is invalid
 */
export function validateEpisodeSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('INVALID_SLUG: Slug must be a non-empty string.');
  }
  const trimmed = slug.trim();
  if (!trimmed) {
    throw new Error('INVALID_SLUG: Slug cannot be empty or whitespace.');
  }
  if (trimmed === '.' || trimmed === '..') {
    throw new Error(`INVALID_SLUG: Slug cannot be "." or "..". Received "${trimmed}".`);
  }
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(`INVALID_SLUG: Slug cannot contain path separators ("/" or "\\"). Received "${trimmed}".`);
  }
  if (/[\x00-\x1f\x7f]/.test(trimmed)) {
    throw new Error(`INVALID_SLUG: Slug cannot contain control characters. Received "${trimmed}".`);
  }
  if (trimmed.includes('..')) {
    throw new Error(`INVALID_SLUG: Slug cannot contain parent directory traversal (".."). Received "${trimmed}".`);
  }
  const SAFE_SLUG_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
  if (!SAFE_SLUG_REGEX.test(trimmed)) {
    throw new Error(
      `INVALID_SLUG: Slug "${trimmed}" contains invalid characters. Must start with alphanumeric and only contain [a-zA-Z0-9._-].`
    );
  }
  return trimmed;
}

export function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function getPipelineStatePath(slug, rootDir = ROOT) {
  validateEpisodeSlug(slug);
  return path.join(rootDir, 'videos', slug, 'pipeline-state.json');
}

/**
 * Loads the pipeline state for a slug.
 */
export function loadPipelineState(slug, rootDir = ROOT) {
  validateEpisodeSlug(slug);
  const statePath = getPipelineStatePath(slug, rootDir);
  if (!fs.existsSync(statePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(statePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse pipeline state at ${statePath}: ${err.message}`);
  }
}

/**
 * Persists the pipeline state for a slug atomically using temp file + fsync + rename.
 */
export function savePipelineState(slug, state, metadata = {}, rootDir = ROOT) {
  validateEpisodeSlug(slug);
  if (!PIPELINE_STATES[state]) {
    throw new Error(`Invalid pipeline state: "${state}". Allowed states: ${Object.keys(PIPELINE_STATES).join(', ')}`);
  }

  const dir = path.join(rootDir, 'videos', slug);
  fs.mkdirSync(dir, { recursive: true });

  const statePath = getPipelineStatePath(slug, rootDir);
  const existing = loadPipelineState(slug, rootDir) || {};

  const record = {
    slug,
    state,
    templateId: metadata.templateId || existing.templateId || 'human-insight/cinematic-light',
    updatedAt: new Date().toISOString(),
    metadata: {
      ...existing.metadata,
      ...metadata,
    },
  };

  const payload = JSON.stringify(record, null, 2);
  const tempPath = path.join(dir, `.pipeline-state.json.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`);

  try {
    const fd = fs.openSync(tempPath, 'w', 0o666);
    fs.writeFileSync(fd, payload, 'utf8');
    try {
      fs.fsyncSync(fd);
    } catch {}
    fs.closeSync(fd);

    fs.renameSync(tempPath, statePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    throw new Error(`Failed to atomically save pipeline state for "${slug}": ${err.message}`);
  }

  return record;
}

export const LEGAL_PIPELINE_TRANSITIONS = Object.freeze({
  [PIPELINE_STATES.PLANNING]: Object.freeze([
    PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
    PIPELINE_STATES.PAUSED_QUOTA,
    PIPELINE_STATES.BLOCKED,
  ]),
  [PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA]: Object.freeze([
    PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA, // selective retry
    PIPELINE_STATES.PAUSED_QUOTA,
    PIPELINE_STATES.READY_TO_RENDER,
    PIPELINE_STATES.BLOCKED,
  ]),
  [PIPELINE_STATES.PAUSED_QUOTA]: Object.freeze([
    PIPELINE_STATES.PLANNING,
    PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
    PIPELINE_STATES.BLOCKED,
  ]),
  [PIPELINE_STATES.READY_TO_RENDER]: Object.freeze([
    PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
    PIPELINE_STATES.BLOCKED,
  ]),
  [PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA]: Object.freeze([
    PIPELINE_STATES.COMPLETE,
    PIPELINE_STATES.BLOCKED,
  ]),
  [PIPELINE_STATES.COMPLETE]: Object.freeze([
    // terminal: no automatic transition except explicit atomic --force reset
  ]),
  [PIPELINE_STATES.BLOCKED]: Object.freeze([
    // terminal: no automatic transition
  ]),
});

/**
 * Transitions the pipeline state with CAS (Compare-And-Swap) check and legal transition enforcement.
 *
 * @param {object} params
 * @param {string} params.slug
 * @param {string} [params.expectedState] - Expected current state (throws STATE_CONFLICT if mismatch)
 * @param {string} params.nextState - Next target state
 * @param {object} [params.metadata={}]
 * @param {string} [params.rootDir=ROOT]
 * @returns {object} The updated state record
 */
export function transitionPipelineState({
  slug,
  expectedState,
  nextState,
  metadata = {},
  rootDir = ROOT,
}) {
  validateEpisodeSlug(slug);
  const currentRecord = loadPipelineState(slug, rootDir);
  const currentState = currentRecord?.state;

  if (expectedState && currentState !== expectedState) {
    throw new Error(
      `STATE_CONFLICT: Cannot transition "${slug}" to "${nextState}". ` +
      `Current state is "${currentState || 'UNINITIALIZED'}", expected "${expectedState}".`
    );
  }

  if (currentState) {
    const allowedNext = LEGAL_PIPELINE_TRANSITIONS[currentState] || [];
    if (!allowedNext.includes(nextState)) {
      throw new Error(
        `ILLEGAL_STATE_TRANSITION: Illegal transition for "${slug}" from "${currentState}" to "${nextState}". ` +
        `Allowed transitions: [${allowedNext.join(', ')}].`
      );
    }
  }

  return savePipelineState(slug, nextState, metadata, rootDir);
}

export function getEpisodeLockPath(slug, rootDir = ROOT) {
  validateEpisodeSlug(slug);
  return path.join(rootDir, 'videos', slug, '.pipeline.lock');
}

/**
 * Lightweight per-episode execution lock.
 * Uses atomic exclusive file creation ('wx').
 *
 * @param {string} slug
 * @param {object} [options={}]
 * @param {string} [options.operation='generic']
 * @param {number} [options.staleThresholdMs=60000]
 * @param {string} [options.rootDir=ROOT]
 * @returns {{ release: () => void, lockPath: string, info: object }}
 */
export function acquireEpisodeLock(slug, options = {}) {
  validateEpisodeSlug(slug);
  const rootDir = options.rootDir || ROOT;
  const operation = options.operation || 'generic';
  const staleThresholdMs = options.staleThresholdMs || 60000;

  const episodeDir = path.join(rootDir, 'videos', slug);
  fs.mkdirSync(episodeDir, { recursive: true });

  const lockPath = getEpisodeLockPath(slug, rootDir);
  const now = Date.now();
  const info = {
    slug,
    pid: process.pid,
    operation,
    timestamp: new Date(now).toISOString(),
    createdAt: now,
  };

  function tryCreate() {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, JSON.stringify(info, null, 2), 'utf8');
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') {
        return false;
      }
      throw err;
    }
  }

  if (!tryCreate()) {
    let existingInfo = null;
    try {
      existingInfo = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    } catch {}

    const lockAge = existingInfo?.createdAt ? (now - existingInfo.createdAt) : Infinity;
    let isOwnerAlive = true;

    if (existingInfo?.pid) {
      try {
        process.kill(existingInfo.pid, 0);
        isOwnerAlive = true;
      } catch (e) {
        if (e.code === 'ESRCH') {
          isOwnerAlive = false;
        }
      }
    }

    if (lockAge > staleThresholdMs && !isOwnerAlive) {
      console.warn(`⚠️ [EPISODE_LOCK] Overriding stale lock for "${slug}" (pid ${existingInfo?.pid} no longer active, age ${Math.round(lockAge/1000)}s)`);
      try { fs.unlinkSync(lockPath); } catch {}
      if (!tryCreate()) {
        throw new Error(`PIPELINE_LOCKED: Episode "${slug}" is locked by another process.`);
      }
    } else {
      throw new Error(
        `PIPELINE_LOCKED: Episode "${slug}" is currently locked by PID ${existingInfo?.pid || 'unknown'} ` +
        `for operation "${existingInfo?.operation || 'unknown'}" since ${existingInfo?.timestamp || 'unknown'}.`
      );
    }
  }

  let released = false;
  return {
    lockPath,
    info,
    release: () => {
      if (released) return;
      released = true;
      try {
        if (fs.existsSync(lockPath)) {
          try {
            const current = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
            if (current.pid === process.pid) {
              fs.unlinkSync(lockPath);
            }
          } catch {
            fs.unlinkSync(lockPath);
          }
        }
      } catch {}
    },
  };
}

/**
 * Runs an asynchronous operation within an episode execution lock.
 */
export async function withEpisodeLock(slug, operation, fn, options = {}) {
  validateEpisodeSlug(slug);
  const lock = acquireEpisodeLock(slug, { operation, ...options });
  try {
    return await fn();
  } finally {
    lock.release();
  }
}

/**
 * Asserts that a new video generation can safely start.
 * If directory exists without resume, halts on collision.
 */
export function assertCanStartNew(slug, rootDir = ROOT) {
  validateEpisodeSlug(slug);
  const dir = path.join(rootDir, 'videos', slug);
  const statePath = getPipelineStatePath(slug, rootDir);

  if (fs.existsSync(statePath)) {
    const current = loadPipelineState(slug, rootDir);
    throw new Error(
      `SLUG_COLLISION: Video "${slug}" already exists in state "${current?.state || 'UNKNOWN'}". ` +
      `Use --resume=${slug} to continue the in-progress pipeline, or use a new slug.`
    );
  }

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => f !== '.pipeline.lock');
    if (files.length > 0) {
      throw new Error(
        `SLUG_COLLISION: Directory "videos/${slug}" exists and contains ${files.length} files. ` +
        `Use --resume=${slug} to resume or specify a different slug.`
      );
    }
  }

  return true;
}

export const ALLOWED_HUMAN_QA_VERDICTS = Object.freeze([
  'PENDING_HUMAN_QA',
  'PASS_HUMAN_QA',
  'FAIL_HUMAN_QA',
]);

/**
 * Canonical validator for HUMAN_QA_REVIEW_V1 review manifests.
 * Enforces:
 *   1. manifestType === 'HUMAN_QA_REVIEW_V1'
 *   2. Non-empty shots array
 *   3. No duplicate shot IDs
 *   4. If storyPlanBeats or expectedShotIds provided:
 *      - all required beats have matching shotId in manifest
 *      - no unknown/extra shot IDs permitted in review manifest (MANIFEST_INVALID)
 *   5. For each shot:
 *      - shotId: non-empty string
 *      - humanQaVerdict: strictly in ALLOWED_HUMAN_QA_VERDICTS (no aliases like 'PASS', 'FAIL', 'REJECT', 'APPROVED')
 *      - humanQaVerdict === 'PASS_HUMAN_QA' (when requireAllPass=true)
 *      - reviewedAssetPath: non-empty string
 *      - reviewedAssetSha256: 64-char hex string
 *   6. If checkDisk=true:
 *      - candidate file must exist on disk at reviewedAssetPath (for FAIL as well as PASS)
 *      - SHA-256 on disk must match reviewedAssetSha256 exactly (for FAIL as well as PASS)
 *
 * @param {object} reviewManifest
 * @param {object} [options={}]
 * @param {string} [options.rootDir=ROOT]
 * @param {boolean} [options.requireAllPass=true]
 * @param {boolean} [options.checkDisk=true]
 * @param {Array} [options.storyPlanBeats]
 * @param {Array<string>} [options.expectedShotIds]
 * @returns {{ valid: boolean, errors: string[], shots: Array, unapproved: Array, counts: { total: number, pass: number, fail: number, pending: number }, failedShots: Array, pendingShots: Array, passedShots: Array }}
 */
export function validateHumanQaReviewManifest(reviewManifest, options = {}) {
  const rootDir = options.rootDir || ROOT;
  const requireAllPass = options.requireAllPass !== false;
  const checkDisk = options.checkDisk !== false;
  const errors = [];
  const unapproved = [];
  const passedShots = [];
  const failedShots = [];
  const pendingShots = [];

  if (!reviewManifest || typeof reviewManifest !== 'object') {
    return {
      valid: false,
      errors: ['Review manifest must be a non-null object'],
      shots: [],
      unapproved: [],
      counts: { total: 0, pass: 0, fail: 0, pending: 0 },
      failedShots: [],
      pendingShots: [],
      passedShots: [],
    };
  }

  if (reviewManifest.manifestType !== 'HUMAN_QA_REVIEW_V1') {
    errors.push(
      `Invalid review manifest type: expected "HUMAN_QA_REVIEW_V1", got "${reviewManifest.manifestType}".`
    );
  }

  const shots = reviewManifest.shots;
  if (!Array.isArray(shots) || shots.length === 0) {
    errors.push('Review manifest has 0 shots.');
    return {
      valid: false,
      errors,
      shots: [],
      unapproved: [],
      counts: { total: 0, pass: 0, fail: 0, pending: 0 },
      failedShots: [],
      pendingShots: [],
      passedShots: [],
    };
  }

  const seenShots = new Set();
  for (const s of shots) {
    if (!s.shotId || typeof s.shotId !== 'string' || !s.shotId.trim()) {
      errors.push('Every shot in review manifest must have a non-empty string "shotId"');
      continue;
    }
    if (seenShots.has(s.shotId)) {
      errors.push(`Duplicate shotId "${s.shotId}" in review manifest.`);
    }
    seenShots.add(s.shotId);
  }

  // Resolve expected shot IDs from options
  let expectedIds = null;
  if (Array.isArray(options.expectedShotIds) && options.expectedShotIds.length > 0) {
    expectedIds = new Set(options.expectedShotIds);
  } else if (Array.isArray(options.storyPlanBeats) && options.storyPlanBeats.length > 0) {
    expectedIds = new Set();
    for (let i = 0; i < options.storyPlanBeats.length; i++) {
      const beat = options.storyPlanBeats[i];
      const id = beat.shotId || (beat.id ? beat.id.replace('beat-', 'shot-') : `shot-${String(i + 1).padStart(2, '0')}`);
      expectedIds.add(id);
    }
  }

  if (expectedIds) {
    // 1. All expected shots must exist in review manifest
    for (const expId of expectedIds) {
      if (!seenShots.has(expId)) {
        errors.push(`Required story plan shot "${expId}" is Missing in Human QA review manifest.`);
        unapproved.push({ shotId: expId, reason: 'Missing in Human QA review manifest' });
      }
    }
    // 2. Reject unknown/extra shots not in expected story plan (MANIFEST_INVALID)
    for (const actId of seenShots) {
      if (!expectedIds.has(actId)) {
        errors.push(`MANIFEST_INVALID: Unknown shotId "${actId}" in review manifest does not belong to story plan.`);
      }
    }
  }

  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const shotId = s.shotId || `shot-${String(i + 1).padStart(2, '0')}`;

    const verdict = s.humanQaVerdict;
    const assetPath = s.reviewedAssetPath;
    const assetSha = s.reviewedAssetSha256;

    if (!verdict || verdict === 'null' || verdict === 'undefined') {
      const reason = `Missing or null humanQaVerdict for ${shotId}`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    // Strict Canonical Verdict Validation: only PENDING_HUMAN_QA, PASS_HUMAN_QA, FAIL_HUMAN_QA
    if (!ALLOWED_HUMAN_QA_VERDICTS.includes(verdict)) {
      const reason = `Invalid humanQaVerdict: "${verdict}" for ${shotId}. Allowed: ${ALLOWED_HUMAN_QA_VERDICTS.join(', ')}`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    // Fail-Closed Human Gate: PASS and FAIL verdicts MUST be authored by EXTERNAL_HUMAN with timestamps
    if (verdict === 'PASS_HUMAN_QA' || verdict === 'FAIL_HUMAN_QA') {
      if (s.reviewSource !== 'EXTERNAL_HUMAN') {
        const reason = `Automated or unauthenticated QA cannot author human approvals. Shot "${shotId}" has verdict "${verdict}" but reviewSource is "${s.reviewSource || 'MISSING'}" (must be "EXTERNAL_HUMAN").`;
        errors.push(reason);
        unapproved.push({ shotId, reason });
      }

      if (!s.reviewedAt || typeof s.reviewedAt !== 'string' || !s.reviewedAt.trim()) {
        const reason = `Shot "${shotId}" has verdict "${verdict}" but lacks required reviewedAt timestamp.`;
        errors.push(reason);
        unapproved.push({ shotId, reason });
      }

      if (s.selectedAttempt !== undefined) {
        if (
          typeof s.selectedAttempt !== 'number' ||
          !Number.isInteger(s.selectedAttempt) ||
          s.selectedAttempt < 1 ||
          s.selectedAttempt > 3
        ) {
          const reason = `Shot "${shotId}" has invalid selectedAttempt "${s.selectedAttempt}" (must be integer 1..3).`;
          errors.push(reason);
          unapproved.push({ shotId, reason });
        }
      }
    }

    if (requireAllPass && verdict !== 'PASS_HUMAN_QA') {
      const reason = `Unapproved humanQaVerdict: "${verdict}" for ${shotId} (requires PASS_HUMAN_QA)`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    if (!assetPath || typeof assetPath !== 'string' || !assetPath.trim()) {
      const reason = `Missing or empty reviewedAssetPath for ${shotId}`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    if (!assetSha || typeof assetSha !== 'string' || !assetSha.trim()) {
      const reason = `Missing or empty reviewedAssetSha256 for ${shotId}`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    if (!/^[a-f0-9]{64}$/i.test(assetSha.trim())) {
      const reason = `Invalid reviewedAssetSha256 "${assetSha}" for ${shotId}. Must be a 64-character SHA-256 hex string.`;
      errors.push(reason);
      unapproved.push({ shotId, reason });
      continue;
    }

    if (checkDisk) {
      const fullPath = path.isAbsolute(assetPath.trim())
        ? assetPath.trim()
        : path.resolve(rootDir, assetPath.trim());

      if (!fs.existsSync(fullPath)) {
        const reason = `Reviewed asset file not found on disk at exact path for ${shotId}: "${assetPath}"`;
        errors.push(reason);
        unapproved.push({ shotId, reason });
        continue;
      }

      const diskSha = getSha256(fullPath);
      if (diskSha !== assetSha.trim()) {
        const reason = `SHA-256 mismatch for ${shotId}: review recorded ${assetSha}, actual file has ${diskSha}`;
        errors.push(reason);
        unapproved.push({ shotId, reason });
        continue;
      }
    }

    if (verdict === 'PASS_HUMAN_QA') {
      passedShots.push(s);
    } else if (verdict === 'FAIL_HUMAN_QA') {
      failedShots.push(s);
    } else if (verdict === 'PENDING_HUMAN_QA') {
      pendingShots.push(s);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    shots,
    unapproved,
    counts: {
      total: shots.length,
      pass: passedShots.length,
      fail: failedShots.length,
      pending: pendingShots.length,
    },
    failedShots,
    pendingShots,
    passedShots,
  };
}

/**
 * Asserts that an existing video generation can be resumed.
 * Validates state prerequisites before allowing transition to next stage.
 */
export function assertCanResume(slug, rootDir = ROOT) {
  const current = loadPipelineState(slug, rootDir);
  if (!current) {
    throw new Error(
      `RESUME_FAILED: No pipeline state found for slug "${slug}" at videos/${slug}/pipeline-state.json. ` +
      `Cannot resume a non-existent or un-initialized pipeline.`
    );
  }

  const { state } = current;

  if (state === PIPELINE_STATES.COMPLETE) {
    return {
      canResume: false,
      state,
      reason: 'ALREADY_COMPLETE',
      message: `Video "${slug}" is already COMPLETE. Destructive stages will not be re-run.`,
    };
  }

  if (state === PIPELINE_STATES.BLOCKED) {
    throw new Error(`RESUME_BLOCKED: Video "${slug}" is marked BLOCKED. Manual intervention required.`);
  }

  if (state === PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA) {
    // Validate that review-manifest exists
    const reviewManifestPath = path.join(rootDir, 'videos', slug, 'review-manifest.json');
    const scratchManifestPath = path.join(rootDir, 'scratch', slug, 'review-manifest.json');
    const manifestPath = fs.existsSync(reviewManifestPath) ? reviewManifestPath : scratchManifestPath;

    if (!fs.existsSync(manifestPath)) {
      throw new Error(
        `RESUME_BLOCKED: HUMAN_IMAGE_APPROVAL_REQUIRED: Pipeline is at PENDING_HUMAN_IMAGE_QA, but review manifest not found at ${manifestPath}.`
      );
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Resolve storyPlanBeats from story-plan.json if available
    let storyPlanBeats = undefined;
    const storyPlanPath = path.join(rootDir, 'videos', slug, 'story-plan.json');
    if (fs.existsSync(storyPlanPath)) {
      try {
        const sp = JSON.parse(fs.readFileSync(storyPlanPath, 'utf8'));
        storyPlanBeats = sp.beats || sp.shots;
      } catch {}
    }

    // Order SSOT: Schema and structural validation MUST happen BEFORE inspecting failure verdicts
    const validation = validateHumanQaReviewManifest(manifest, {
      rootDir,
      requireAllPass: false,
      checkDisk: true,
      storyPlanBeats,
    });

    if (!validation.valid) {
      const details = validation.errors.join('; ');
      throw new Error(`RESUME_BLOCKED: HUMAN_IMAGE_APPROVAL_REQUIRED - RESUME_BLOCKED: Human image QA review is still pending or invalid: ${details}`);
    }

    // Check if any shots failed Human QA, triggering selective retry
    if (validation.counts.fail > 0) {
      return {
        canResume: true,
        currentState: state,
        nextStage: 'SELECTIVE_RETRY',
        manifestPath,
        failedShots: validation.failedShots,
      };
    }

    // If any shots are still PENDING and there are no actionable FAILs, remain blocked/waiting
    if (validation.counts.pending > 0) {
      throw new Error(
        `RESUME_BLOCKED: HUMAN_IMAGE_APPROVAL_REQUIRED - RESUME_BLOCKED: Human image QA review is still pending or invalid: ${validation.counts.pending} shot(s) remain PENDING_HUMAN_QA. All shots must be reviewed.`
      );
    }

    // Check that NO shots were authored by machine QA
    const machineReviewed = (manifest.shots || []).filter(
      (s) => s.humanQaVerdict === 'PASS_HUMAN_QA' && s.reviewSource && s.reviewSource !== 'EXTERNAL_HUMAN'
    );
    if (machineReviewed.length > 0) {
      throw new Error(
        `RESUME_BLOCKED: HUMAN_IMAGE_APPROVAL_REQUIRED - RESUME_BLOCKED: Automated or unauthenticated QA cannot author human approvals. ${machineReviewed.length} shot(s) have invalid review source.`
      );
    }

    return {
      canResume: true,
      currentState: state,
      nextStage: 'PROMOTE_AND_RENDER',
      manifestPath,
    };
  }

  if (state === PIPELINE_STATES.READY_TO_RENDER) {
    return {
      canResume: true,
      currentState: state,
      nextStage: 'RENDER',
    };
  }

  if (state === PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA) {
    // Validate explicit Human video approval via shared fail-closed validator
    const approvalValidation = validateExternalHumanVideoApproval(slug, {
      rootDir,
      expectedVerdict: 'PASS_HUMAN_VIDEO_QA',
      checkDisk: true,
      throwOnError: true,
    });

    return {
      canResume: true,
      currentState: state,
      nextStage: 'PACKAGE_PRODUCTION',
      approvalRecord: approvalValidation.record,
    };
  }

  if (state === PIPELINE_STATES.PAUSED_QUOTA) {
    const isSelectiveRetry = current.metadata?.pausedFromStage === 'SELECTIVE_RETRY';
    return {
      canResume: true,
      currentState: state,
      nextStage: isSelectiveRetry ? 'RESUME_SELECTIVE_RETRY' : 'RESUME_CANDIDATE_GENERATION',
    };
  }

  return {
    canResume: true,
    currentState: state,
    nextStage: 'CONTINUE',
  };
}

export const ALLOWED_HUMAN_VIDEO_QA_VERDICTS = Object.freeze([
  'PASS_HUMAN_VIDEO_QA',
  'FAIL_HUMAN_VIDEO_QA',
]);

/**
 * Shared alias for external human image review manifest validation.
 */
export const validateExternalHumanImageReviewManifest = validateHumanQaReviewManifest;
export const validateExternalHumanImageReview = validateHumanQaReviewManifest;

/**
 * Shared validator for External Human Video Approval.
 * Enforces fail-closed rules:
 *   - verdict MUST be explicit and valid ('PASS_HUMAN_VIDEO_QA' or 'FAIL_HUMAN_VIDEO_QA')
 *   - reviewSource MUST equal 'EXTERNAL_HUMAN'
 *   - videoSha256 MUST be valid 64-char hex SHA-256
 *   - reviewedAt MUST be present
 *   - actual video.mp4 on disk MUST match videoSha256
 *
 * @param {string|object} slugOrRecord - Episode slug string or verdict record object
 * @param {object} [options={}]
 * @param {string} [options.expectedVerdict='PASS_HUMAN_VIDEO_QA']
 * @param {boolean} [options.checkDisk=true]
 * @param {boolean} [options.throwOnError=false]
 * @param {string} [options.rootDir=ROOT]
 * @returns {{ valid: boolean, errors: string[], record: object|null }}
 */
export function validateExternalHumanVideoApproval(slugOrRecord, options = {}) {
  const rootDir = options.rootDir || ROOT;
  const expectedVerdict = options.expectedVerdict !== undefined ? options.expectedVerdict : 'PASS_HUMAN_VIDEO_QA';
  const checkDisk = options.checkDisk !== false;
  const errors = [];

  let slug = null;
  let record = null;

  if (typeof slugOrRecord === 'string') {
    slug = slugOrRecord;
    validateEpisodeSlug(slug);

    const verdictPath = path.join(rootDir, 'videos', slug, 'video-qa-verdict.json');
    if (fs.existsSync(verdictPath)) {
      try {
        record = JSON.parse(fs.readFileSync(verdictPath, 'utf8'));
      } catch (err) {
        errors.push(`Failed to parse video QA verdict at ${verdictPath}: ${err.message}`);
      }
    } else {
      // Fallback: check pipeline-state metadata
      const current = loadPipelineState(slug, rootDir);
      if (current?.metadata?.videoQaVerdict) {
        record = {
          slug,
          verdict: current.metadata.videoQaVerdict,
          videoSha256: current.metadata.videoSha256,
          reviewSource: current.metadata.videoReviewSource,
          reviewedAt: current.metadata.videoApprovedAt,
          reviewer: current.metadata.videoReviewer,
          videoPath: current.metadata.videoMp4Path,
        };
      }
    }
  } else if (slugOrRecord && typeof slugOrRecord === 'object') {
    record = slugOrRecord;
    slug = record.slug || options.slug;
  }

  if (!record || typeof record !== 'object') {
    errors.push(`Missing video approval record. Explicit human video QA approval has not been recorded in video-qa-verdict.json.`);
    if (options.throwOnError && errors.length > 0) {
      throw new Error(`RESUME_BLOCKED: HUMAN_VIDEO_APPROVAL_REQUIRED - ${errors.join('; ')}`);
    }
    return { valid: false, errors, record: null };
  }

  const verdict = record.verdict || record.humanVideoQaVerdict;
  if (!verdict || typeof verdict !== 'string') {
    errors.push(`Missing verdict in video approval record.`);
  } else if (!ALLOWED_HUMAN_VIDEO_QA_VERDICTS.includes(verdict)) {
    errors.push(`INVALID_HUMAN_VIDEO_VERDICT: "${verdict}" is not a valid video QA verdict. Allowed: ${ALLOWED_HUMAN_VIDEO_QA_VERDICTS.join(', ')}`);
  } else if (expectedVerdict && verdict !== expectedVerdict) {
    errors.push(`Unapproved video verdict "${verdict}" (expected "${expectedVerdict}").`);
  }

  if (!record.reviewSource || record.reviewSource !== 'EXTERNAL_HUMAN') {
    errors.push(
      `Automated or unauthenticated QA cannot author human video approvals. Video approval lacks required EXTERNAL_HUMAN review source (reviewSource is "${record.reviewSource || 'MISSING'}", must be "EXTERNAL_HUMAN").`
    );
  }

  if (!record.videoSha256 || typeof record.videoSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(record.videoSha256.trim())) {
    errors.push(`Missing or invalid videoSha256 "${record.videoSha256}". Must be a valid 64-character SHA-256 hex string.`);
  }

  if (!record.reviewedAt && !record.approvedAt) {
    errors.push(`Missing reviewedAt timestamp in video approval record.`);
  }

  if (checkDisk && slug) {
    const videoMp4Path = record.videoPath
      ? (path.isAbsolute(record.videoPath) ? record.videoPath : path.resolve(rootDir, record.videoPath))
      : path.join(rootDir, 'videos', slug, 'video.mp4');

    if (!fs.existsSync(videoMp4Path)) {
      errors.push(`Rendered video file not found on disk at: ${videoMp4Path}`);
    } else if (record.videoSha256 && /^[a-f0-9]{64}$/i.test(record.videoSha256.trim())) {
      const currentVideoSha256 = getSha256(videoMp4Path);
      if (record.videoSha256.trim().toLowerCase() !== currentVideoSha256.toLowerCase()) {
        errors.push(
          `SHA-256 mismatch: Video has been modified or re-rendered since approval (recorded SHA: ${record.videoSha256.slice(0, 16)}..., current SHA: ${currentVideoSha256.slice(0, 16)}...). Previous approval is invalidated. Explicit Human Video QA approval required.`
        );
      }
    }
  }

  const valid = errors.length === 0;
  if (options.throwOnError && !valid) {
    throw new Error(`RESUME_BLOCKED: HUMAN_VIDEO_APPROVAL_REQUIRED - ${errors.join('; ')}`);
  }

  return { valid, errors, record };
}

/**
 * Records explicit human image review.
 */
export function recordHumanImageReview(slugOrOptions, maybeOptions = {}, maybeRootDir = ROOT) {
  let slug, reviews, defaultVerdict, reviewer, notes, rootDir;
  if (typeof slugOrOptions === 'string') {
    slug = slugOrOptions;
    const opts = maybeOptions || {};
    reviews = opts.reviews || [];
    defaultVerdict = opts.defaultVerdict || (opts.action === 'pass_all' ? 'PASS_HUMAN_QA' : null);
    reviewer = opts.reviewer || 'human_qa';
    notes = opts.notes || '';
    rootDir = maybeRootDir;
  } else {
    const opts = slugOrOptions || {};
    slug = opts.slug;
    reviews = opts.reviews || [];
    defaultVerdict = opts.defaultVerdict || (opts.action === 'pass_all' ? 'PASS_HUMAN_QA' : null);
    reviewer = opts.reviewer || 'human_qa';
    notes = opts.notes || '';
    rootDir = opts.rootDir || ROOT;
  }

  validateEpisodeSlug(slug);
  const reviewManifestPath = path.join(rootDir, 'videos', slug, 'review-manifest.json');
  const scratchManifestPath = path.join(rootDir, 'scratch', slug, 'review-manifest.json');
  const manifestPath = fs.existsSync(reviewManifestPath) ? reviewManifestPath : scratchManifestPath;

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`REVIEW_MANIFEST_NOT_FOUND: Review manifest not found for "${slug}" at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const reviewedAt = new Date().toISOString();

  const reviewMap = new Map();
  if (Array.isArray(reviews)) {
    for (const r of reviews) {
      if (r?.shotId) reviewMap.set(r.shotId, r);
    }
  }

  let updatedCount = 0;
  for (const shot of manifest.shots || []) {
    const explicit = reviewMap.get(shot.shotId);
    const targetVerdict = explicit?.verdict || defaultVerdict;
    if (!targetVerdict) continue;

    if (!ALLOWED_HUMAN_QA_VERDICTS.includes(targetVerdict)) {
      throw new Error(
        `INVALID_HUMAN_QA_VERDICT: "${targetVerdict}" for shot "${shot.shotId}" is invalid. Allowed: ${ALLOWED_HUMAN_QA_VERDICTS.join(', ')}`
      );
    }

    const fullPath = path.isAbsolute(shot.reviewedAssetPath)
      ? shot.reviewedAssetPath
      : path.resolve(rootDir, shot.reviewedAssetPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`ASSET_NOT_FOUND: Cannot review missing asset for ${shot.shotId} at ${fullPath}`);
    }

    const currentDiskSha = getSha256(fullPath);
    shot.reviewedAssetSha256 = currentDiskSha;
    shot.humanQaVerdict = targetVerdict;
    shot.reviewedAt = reviewedAt;
    shot.reviewer = reviewer;
    shot.reviewSource = 'EXTERNAL_HUMAN';
    if (notes) shot.reviewNotes = notes;
    updatedCount++;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  if (manifestPath !== reviewManifestPath && fs.existsSync(path.dirname(reviewManifestPath))) {
    fs.writeFileSync(reviewManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  }

  return {
    slug,
    manifestPath,
    updatedCount,
    counts: {
      total: manifest.shots.length,
      pass: manifest.shots.filter((s) => s.humanQaVerdict === 'PASS_HUMAN_QA').length,
      fail: manifest.shots.filter((s) => s.humanQaVerdict === 'FAIL_HUMAN_QA').length,
      pending: manifest.shots.filter((s) => s.humanQaVerdict === 'PENDING_HUMAN_QA').length,
    },
  };
}

/**
 * Records explicit human video approval.
 * MUST NOT default to PASS: requires explicit verdict ('PASS_HUMAN_VIDEO_QA' or 'FAIL_HUMAN_VIDEO_QA').
 */
export function recordHumanVideoApproval(slugOrOptions, maybeApprovalInfo = {}, maybeRootDir = ROOT) {
  let slug, approvalInfo, rootDir;
  if (typeof slugOrOptions === 'string') {
    slug = slugOrOptions;
    approvalInfo = maybeApprovalInfo || {};
    rootDir = maybeRootDir || ROOT;
  } else {
    approvalInfo = slugOrOptions || {};
    slug = approvalInfo.slug;
    rootDir = approvalInfo.rootDir || ROOT;
  }

  if (!slug) {
    throw new Error('Missing required argument: slug');
  }
  validateEpisodeSlug(slug);

  const verdict = approvalInfo.humanVideoQaVerdict || approvalInfo.verdict;
  if (!verdict || typeof verdict !== 'string') {
    throw new Error(
      `INVALID_HUMAN_VIDEO_VERDICT: Explicit verdict is required ("PASS_HUMAN_VIDEO_QA" or "FAIL_HUMAN_VIDEO_QA"). No default verdict permitted.`
    );
  }

  if (!ALLOWED_HUMAN_VIDEO_QA_VERDICTS.includes(verdict)) {
    throw new Error(
      `INVALID_HUMAN_VIDEO_VERDICT: "${verdict}" is not a valid video QA verdict. Allowed: ${ALLOWED_HUMAN_VIDEO_QA_VERDICTS.join(', ')}`
    );
  }

  const videoMp4Path = approvalInfo.videoPath
    ? (path.isAbsolute(approvalInfo.videoPath) ? approvalInfo.videoPath : path.resolve(rootDir, approvalInfo.videoPath))
    : path.join(rootDir, 'videos', slug, 'video.mp4');

  const videoExists = fs.existsSync(videoMp4Path);
  const videoSha256 = videoExists ? getSha256(videoMp4Path) : (approvalInfo.videoSha256 || null);
  const reviewedAt = approvalInfo.reviewedAt || new Date().toISOString();
  const reviewer = approvalInfo.reviewer || 'human_qa';
  const reviewSource = 'EXTERNAL_HUMAN';

  const verdictPath = path.join(rootDir, 'videos', slug, 'video-qa-verdict.json');
  const record = {
    slug,
    videoPath: path.relative(rootDir, videoMp4Path).replace(/\\/g, '/'),
    videoSha256,
    verdict,
    humanVideoQaVerdict: verdict,
    reviewedAt,
    reviewer,
    reviewSource,
    notes: approvalInfo.notes || (verdict === 'PASS_HUMAN_VIDEO_QA' ? 'Video approved for production packaging.' : 'Video rejected during Human QA.'),
  };
  fs.writeFileSync(verdictPath, JSON.stringify(record, null, 2), 'utf8');

  const stateRecord = savePipelineState(
    slug,
    PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
    {
      videoQaVerdict: verdict,
      videoApprovedAt: reviewedAt,
      videoSha256,
      videoReviewSource: reviewSource,
      videoPath: record.videoPath,
    },
    rootDir
  );

  return {
    ...record,
    ...stateRecord,
    verdict,
    reviewSource,
    videoSha256,
  };
}
