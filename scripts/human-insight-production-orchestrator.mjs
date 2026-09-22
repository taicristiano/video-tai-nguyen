/**
 * scripts/human-insight-production-orchestrator.mjs
 *
 * Canonical Executable Orchestrator for HAY & ĐẸP. (human-insight/cinematic-light).
 *
 * This orchestrator is the ONLY production lifecycle owner for:
 *   - START (new slug): lock preflight -> content parse -> story planning -> audio/timeline -> candidate generation -> review-manifest.json (HUMAN_QA_REVIEW_V1) -> transition PENDING_HUMAN_IMAGE_QA -> HALT
 *   - RESUME at PENDING_HUMAN_IMAGE_QA: validate review manifest -> promote -> materialize -> build official spec -> render -> transition PENDING_HUMAN_VIDEO_QA -> HALT
 *   - RESUME at PENDING_HUMAN_VIDEO_QA: verify explicit Human video approval -> package -> transition COMPLETE
 *   - RESUME at PAUSED_QUOTA: resume candidate generation without resetting
 *
 * Usage:
 *   node scripts/human-insight-production-orchestrator.mjs --slug=<slug> --context=<context-file> [--audio=<mode>]
 *   node scripts/human-insight-production-orchestrator.mjs --resume=<slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  PIPELINE_STATES,
  ROOT,
  loadPipelineState,
  savePipelineState,
  transitionPipelineState,
  validateEpisodeSlug,
  withEpisodeLock,
  assertCanStartNew,
  assertCanResume,
  validateHumanQaReviewManifest,
  validateExternalHumanVideoApproval,
  recordHumanVideoApproval,
  ALLOWED_HUMAN_QA_VERDICTS,
} from './pipeline-state.mjs';

import { validateProductionLock } from './validate-production-lock.mjs';
import { parseHumanInsightContent } from '../src/templates/human-insight/cinematic-light/contentParserRuntime.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';
import { promoteApprovedImages } from './promote-approved-images.mjs';
import { materializeProductionAssets } from './materialize-production-assets.mjs';
import { buildProductionRenderSpec } from './build-production-render-spec.mjs';
import { renderProductionVideo } from './render-production-video.mjs';
import { packageProduction } from './package-production.mjs';
import { generateHumanInsightShot, CLOUDFLARE_MODEL } from './human-insight-image.mjs';

import {
  CINEMATIC_LIGHT_DEPENDENCIES,
  CINEMATIC_LIGHT_DURATION_CONTRACT,
  resolveEffectiveTemplateConfig,
} from '../src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs';

import {
  calculatePlannedTotalDuration,
  calibrateAudioPacing,
  normalizeCanonicalVoice,
  probeMediaDuration,
} from './audio-pacing.mjs';

export const HUMAN_INSIGHT_TEMPLATE_ID = 'human-insight/cinematic-light';

/**
 * Shared Cloudflare 429 Quota Pause Handler for both initial generation and selective retry.
 * Invariant: HTTP 429 quota pause does NOT increment attempt counters!
 */
export function handleImageGenerationQuotaPause({
  slug,
  shotId,
  attemptsUsed = 0,
  pausedFromStage = 'INITIAL_GENERATION',
  nextAttemptNumber,
  lastCandidatePath = null,
  lastCandidateSha256 = null,
  candidateState = null,
  statePath = null,
  audioMode = 'full',
  error = null,
  rootDir = ROOT,
}) {
  const calculatedNextAttempt = nextAttemptNumber || (attemptsUsed + 1);

  if (candidateState && shotId && candidateState.shots?.[shotId]) {
    const record = candidateState.shots[shotId];
    record.generationStatus = 'PAUSED_QUOTA';
    candidateState.updatedAt = new Date().toISOString();
    if (statePath) {
      fs.writeFileSync(statePath, JSON.stringify(candidateState, null, 2), 'utf8');
    }
  }

  const metadata = {
    templateId: HUMAN_INSIGHT_TEMPLATE_ID,
    audioMode,
    pausedShotId: shotId,
    pausedFromStage,
    attemptsUsed,
    nextAttemptNumber: calculatedNextAttempt,
    lastCandidatePath,
    lastCandidateSha256,
    pausedAt: new Date().toISOString(),
    error: error?.message || 'Quota limit reached (HTTP 429)',
  };

  savePipelineState(slug, PIPELINE_STATES.PAUSED_QUOTA, metadata, rootDir);

  console.log(`\n⏸ [PAUSED_QUOTA] Cloudflare 429 quota reached on shot ${shotId} during ${pausedFromStage}.`);
  console.log(`Attempts used for ${shotId}: ${attemptsUsed} (counter not incremented; next attempt to retry: ${calculatedNextAttempt}).`);
  console.log(`To resume when quota resets: run node scripts/human-insight-production-orchestrator.mjs --resume=${slug}`);

  return {
    status: 'PAUSED_QUOTA',
    state: PIPELINE_STATES.PAUSED_QUOTA,
    slug,
    pausedShotId: shotId,
    pausedFromStage,
    attemptsUsed,
    nextAttemptNumber: calculatedNextAttempt,
  };
}

/**
 * Executes an Atomic Episode Reset when --force is specified for an existing slug.
 * Safely purges episode-specific directories only, leaving shared assets and other episodes untouched:
 *   - videos/<slug>/
 *   - public/<slug>/ (voice.mp3, timeline.json)
 *   - scratch/<slug>/ (candidate images)
 *   - public/assets/human-insight/final/<slug>/
 */
export function atomicResetEpisode(slug, { rootDir = ROOT, log = console.log } = {}) {
  validateEpisodeSlug(slug);

  const allowedParents = [
    path.resolve(rootDir, 'videos'),
    path.resolve(rootDir, 'public'),
    path.resolve(rootDir, 'scratch'),
    path.resolve(rootDir, 'public', 'assets', 'human-insight', 'final'),
  ];

  const pathsToClean = [
    path.resolve(rootDir, 'videos', slug),
    path.resolve(rootDir, 'public', slug),
    path.resolve(rootDir, 'scratch', slug),
    path.resolve(rootDir, 'public', 'assets', 'human-insight', 'final', slug),
  ];

  for (let i = 0; i < pathsToClean.length; i++) {
    const target = pathsToClean[i];
    const parent = allowedParents[i];
    const parentWithSep = parent.endsWith(path.sep) ? parent : parent + path.sep;
    if (!target.startsWith(parentWithSep) || target === parent) {
      throw new Error(`SECURITY_VIOLATION: Target "${target}" is not a strict child of allowed parent "${parent}".`);
    }
  }

  const currentState = loadPipelineState(slug, rootDir);
  if (currentState) {
    const st = currentState.state;
    if (
      st === PIPELINE_STATES.COMPLETE ||
      st === PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA ||
      currentState.metadata?.candidateCount > 0
    ) {
      log(`⚠️ [ORCHESTRATOR] --force enabled: Resetting approved/completed episode "${slug}" (prior state: ${st}). Purging all episode-specific artifacts.`);
    }
  }

  for (const p of pathsToClean) {
    if (fs.existsSync(p)) {
      try {
        if (p === path.resolve(rootDir, 'videos', slug)) {
          const lockFile = path.join(p, '.pipeline.lock');
          let lockContent = null;
          if (fs.existsSync(lockFile)) {
            try {
              const parsed = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
              if (parsed.pid === process.pid) {
                lockContent = fs.readFileSync(lockFile);
              }
            } catch {}
          }
          fs.rmSync(p, { recursive: true, force: true });
          if (lockContent) {
            fs.mkdirSync(p, { recursive: true });
            fs.writeFileSync(lockFile, lockContent);
          }
        } else {
          fs.rmSync(p, { recursive: true, force: true });
        }
        log(`   - Cleared: ${path.relative(rootDir, p).replace(/\\/g, '/')}`);
      } catch (err) {
        console.warn(`Warning: failed to remove ${p}: ${err.message}`);
      }
    }
  }

  log(`✅ [ORCHESTRATOR] Atomic episode reset complete for "${slug}". Starting fresh run with clean state.`);
}

/**
 * Ensures voice audio is ready in public/<slug>/voice.mp3.
 * Follows audio reuse rule: if file exists and size > 0, reuses without regenerating.
 */
export async function ensureVoiceAudio({
  slug,
  voiceText,
  audioPath,
  options = {},
  rootDir = ROOT,
}) {
  const targetPath = audioPath || path.join(rootDir, 'public', slug, 'voice.mp3');
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Audio Reuse Rule: if valid voice.mp3 exists, reuse it!
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0 && !options.forceAudio) {
    const shouldEnforceDuration = options.enforceDurationContract ?? (options.allowSynthetic ? false : true);
    if (shouldEnforceDuration) {
      const dur = probeMediaDuration(targetPath, { rootDir });
      const outroSec = 2.0;
      if (
        dur > 0 &&
        (dur + outroSec < CINEMATIC_LIGHT_DURATION_CONTRACT.minDurationSec ||
          dur + outroSec > CINEMATIC_LIGHT_DURATION_CONTRACT.maxDurationSec)
      ) {
        console.log(
          `⚠️ [ORCHESTRATOR] Existing voice.mp3 duration (${dur.toFixed(2)}s) with outro is outside duration contract [70, 85]. Cannot silently reuse stale audio.`
        );
      } else {
        console.log(`♻️ [ORCHESTRATOR] Reusing existing voice.mp3 at: ${targetPath}`);
        return { audioPath: targetPath, reused: true };
      }
    } else {
      console.log(`♻️ [ORCHESTRATOR] Reusing existing voice.mp3 at: ${targetPath}`);
      return { audioPath: targetPath, reused: true };
    }
  }

  // 2. Direct binary data injection
  if (options.audioData) {
    fs.writeFileSync(targetPath, options.audioData);
    return { audioPath: targetPath, reused: false };
  }

  // 3. Injected TTS adapter (for testing / custom synthesizers)
  if (typeof options.ttsAdapter === 'function') {
    await options.ttsAdapter({ slug, voiceText, audioPath: targetPath, rootDir, options });
    return { audioPath: targetPath, reused: false };
  }

  // 4. Synthetic fallback
  if (options.allowSynthetic) {
    fs.writeFileSync(
      targetPath,
      Buffer.from('RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xAC\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00')
    );
    return { audioPath: targetPath, reused: false, synthetic: true };
  }

  // 5. Shared TTS Script Execution
  const scriptDir = path.join(rootDir, 'videos', slug, 'script');
  fs.mkdirSync(scriptDir, { recursive: true });
  const scriptJsonPath = path.join(scriptDir, 'script.json');
  fs.writeFileSync(
    scriptJsonPath,
    JSON.stringify({ script: [{ text: voiceText }] }, null, 2),
    'utf8'
  );

  const ttsScript = path.join(rootDir, 'scripts', 'tts.mjs');
  const { execFileSync } = await import('node:child_process');
  execFileSync(process.execPath, [ttsScript, scriptJsonPath, slug], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size === 0) {
    throw new Error(`TTS synthesis failed: voice.mp3 not found or empty at ${targetPath}`);
  }

  return { audioPath: targetPath, reused: false };
}

/**
 * Ensures transcription/timeline is ready in public/<slug>/timeline.json.
 * Follows timeline reuse rule: if valid timeline exists with segments, reuses without re-transcribing.
 */
export async function ensureTimeline({
  slug,
  audioPath,
  timelinePath,
  voiceText,
  options = {},
  rootDir = ROOT,
}) {
  const targetPath = timelinePath || path.join(rootDir, 'public', slug, 'timeline.json');
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Timeline Reuse Rule
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0 && !options.forceTimeline) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      if (Array.isArray(existing.segments) && existing.segments.length > 0) {
        const currentAudioSha = fs.existsSync(audioPath)
          ? crypto.createHash('sha256').update(fs.readFileSync(audioPath)).digest('hex')
          : null;
        if (!existing.audioSha256 || !currentAudioSha || existing.audioSha256 === currentAudioSha) {
          console.log(`♻️ [ORCHESTRATOR] Reusing existing timeline.json at: ${targetPath}`);
          return { timelinePath: targetPath, timeline: existing, reused: true };
        } else {
          console.log(`⚠️ [ORCHESTRATOR] Audio bytes changed since timeline was generated. Invalidating stale timeline.`);
        }
      }
    } catch {}
  }

  // 2. Direct data injection
  if (options.timelineData) {
    const dataStr = typeof options.timelineData === 'string'
      ? options.timelineData
      : JSON.stringify(options.timelineData, null, 2);
    fs.writeFileSync(targetPath, dataStr, 'utf8');
    const parsed = JSON.parse(dataStr);
    return { timelinePath: targetPath, timeline: parsed, reused: false };
  }

  // 3. Injected Transcription adapter (for testing / deterministic mocks)
  if (typeof options.transcribeAdapter === 'function') {
    const result = await options.transcribeAdapter({
      slug,
      audioPath,
      timelinePath: targetPath,
      voiceText,
      rootDir,
      options,
    });
    const parsed = fs.existsSync(targetPath)
      ? JSON.parse(fs.readFileSync(targetPath, 'utf8'))
      : result;
    return { timelinePath: targetPath, timeline: parsed, reused: false };
  }

  // 4. Synthetic fallback
  if (options.allowSynthetic) {
    const clauses = voiceText
      ? voiceText.split(/(?<=[.?!])\s+/).filter(Boolean)
      : ['Phần mở đầu', 'Chi tiết quan sát', 'Câu hỏi suy ngẫm'];
    const targetDur = options.targetDuration;
    const baseDurations = clauses.map((text) => Math.max(3, text.split(/\s+/).length * 0.4));
    const baseSum = baseDurations.reduce((a, b) => a + b, 0);
    const scale = targetDur && baseSum > 0 ? targetDur / baseSum : 1.0;

    let cur = 0;
    const segments = clauses.map((text, i) => {
      const start = cur;
      const dur = baseDurations[i] * scale;
      cur += dur;
      return {
        id: i,
        start,
        end: cur,
        text,
        words: text.split(/\s+/).map((w, wi) => ({
          word: w,
          start: start + wi * (dur / Math.max(1, text.split(/\s+/).length)),
          end: start + (wi + 1) * (dur / Math.max(1, text.split(/\s+/).length)),
        })),
      };
    });
    const currentAudioSha = fs.existsSync(audioPath)
      ? crypto.createHash('sha256').update(fs.readFileSync(audioPath)).digest('hex')
      : null;
    const synthTimeline = { segments, duration: cur, audioSha256: currentAudioSha };
    fs.writeFileSync(targetPath, JSON.stringify(synthTimeline, null, 2), 'utf8');
    return { timelinePath: targetPath, timeline: synthTimeline, reused: false, synthetic: true };
  }

  // 5. Shared Transcription Script Execution
  const transcribeScript = path.join(rootDir, 'scripts', 'transcribe.mjs');
  const { execFileSync } = await import('node:child_process');
  execFileSync(process.execPath, [transcribeScript, slug], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Transcription failed: timeline not found at ${targetPath}`);
  }

  const timeline = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const currentAudioSha = fs.existsSync(audioPath)
    ? crypto.createHash('sha256').update(fs.readFileSync(audioPath)).digest('hex')
    : null;
  if (currentAudioSha && timeline) {
    timeline.audioSha256 = currentAudioSha;
    fs.writeFileSync(targetPath, JSON.stringify(timeline, null, 2), 'utf8');
  }
  return { timelinePath: targetPath, timeline, reused: false };
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (const arg of argv) {
    if (arg.startsWith('--slug=')) {
      options.slug = arg.slice('--slug='.length).trim();
    } else if (arg.startsWith('--resume=')) {
      options.resume = arg.slice('--resume='.length).trim();
    } else if (arg.startsWith('--resume')) {
      options.resume = true;
    } else if (arg.startsWith('--context=')) {
      options.context = arg.slice('--context='.length).trim();
    } else if (arg.startsWith('--audio=')) {
      options.audioMode = arg.slice('--audio='.length).trim();
    } else if (arg.startsWith('--audio-mode=')) {
      options.audioMode = arg.slice('--audio-mode='.length).trim();
    } else if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length).trim();
    } else if (arg === '--skip-render') {
      options.skipRender = true;
    } else if (arg === '--skip-playwright') {
      options.skipPlaywright = true;
    } else if (arg === '--plan-only') {
      options.planOnly = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--allow-synthetic') {
      options.allowSynthetic = true;
    }
  }
  return options;
}

/**
 * Starts a new production run from context.
 * Pauses cleanly at PENDING_HUMAN_IMAGE_QA after generating candidate review manifest.
 */
export async function startNewProduction(options = {}) {
  const rootDir = options.rootDir || ROOT;
  if (options.slug) {
    validateEpisodeSlug(options.slug);
  }

  let contextText = options.context || '';
  if (contextText && fs.existsSync(contextText) && fs.statSync(contextText).isFile()) {
    contextText = fs.readFileSync(contextText, 'utf8');
  }

  const audioMode = options.audioMode || 'full';
  const planOnly = Boolean(options.planOnly);
  const force = Boolean(options.force);
  const allowSynthetic = Boolean(options.allowSynthetic);

  // 1. Production Lock Preflight
  console.log('🔒 [ORCHESTRATOR] Step 1: Production lock preflight check...');
  const lockResult = validateProductionLock(null, { rootDir });
  if (!lockResult.valid) {
    throw new Error(
      `PRODUCTION_LOCK_PREFLIGHT_FAILED: Production lock validation failed:\n${lockResult.errors.join('\n')}`
    );
  }

  // 2. Canonical Content Parsing
  console.log('📝 [ORCHESTRATOR] Step 2: Canonical content parsing...');
  let parsed = null;
  if (contextText) {
    parsed = parseHumanInsightContent(contextText);
  }

  let slug = options.slug;
  if (slug !== undefined) {
    validateEpisodeSlug(slug);
  } else {
    if (parsed && parsed.title) {
      const slugTitle = parsed.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const partNum = parsed.part ? String(parsed.part).padStart(3, '0') : '001';
      slug = `video${partNum}-${slugTitle}`;
    } else {
      slug = `video-${Date.now()}`;
    }
    validateEpisodeSlug(slug);
  }

  return withEpisodeLock(slug, 'startNewProduction', async () => {
    // 3. State initialization & conflict check
    console.log(`🚦 [ORCHESTRATOR] Step 3: Checking pipeline state for "${slug}"...`);
    if (force) {
      atomicResetEpisode(slug, { rootDir });
    } else {
      assertCanStartNew(slug, rootDir);
    }

    savePipelineState(
      slug,
      PIPELINE_STATES.PLANNING,
      {
        templateId: HUMAN_INSIGHT_TEMPLATE_ID,
        audioMode,
        title: options.title || parsed?.title || slug,
        startedAt: new Date().toISOString(),
      },
      rootDir
    );

  // Directories setup
  const videosDir = path.join(rootDir, 'videos', slug);
  const publicDir = path.join(rootDir, 'public', slug);
  const scratchCandidatesDir = path.join(rootDir, 'scratch', slug, 'candidates');

  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(path.join(videosDir, 'script'), { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(scratchCandidatesDir, { recursive: true });

  if (contextText) {
    fs.writeFileSync(path.join(videosDir, 'context.txt'), contextText, 'utf8');
  }
  fs.writeFileSync(path.join(videosDir, 'audio.txt'), audioMode, 'utf8');
  fs.writeFileSync(path.join(videosDir, 'template.txt'), HUMAN_INSIGHT_TEMPLATE_ID, 'utf8');

  if (parsed) {
    fs.writeFileSync(path.join(videosDir, 'parsed-content.json'), JSON.stringify(parsed, null, 2), 'utf8');
  }

  const effectiveTitle = options.title || parsed?.title || slug;
  const effectiveVoice = parsed?.canonicalVoice || '';
  const effectiveStatement = parsed?.statementText || '';
  const effectiveQuestion = parsed?.finalQuestionText || '';

  // 4. Audio and Timeline assets
  console.log('🎙 [ORCHESTRATOR] Step 4: Audio & Timeline asset resolution...');
  const audioPath = path.join(publicDir, 'voice.mp3');
  const timelinePath = path.join(publicDir, 'timeline.json');

  const audioRes = await ensureVoiceAudio({
    slug,
    voiceText: effectiveVoice,
    audioPath,
    options,
    rootDir,
  });

  const timelineRes = await ensureTimeline({
    slug,
    audioPath,
    timelinePath,
    voiceText: effectiveVoice,
    options,
    rootDir,
  });

  const timeline = timelineRes.timeline;

  // Persist audio state in pipeline-state.json
  savePipelineState(
    slug,
    PIPELINE_STATES.PLANNING,
    {
      templateId: HUMAN_INSIGHT_TEMPLATE_ID,
      audioMode,
      title: effectiveTitle,
      voiceReady: true,
      voiceReused: Boolean(audioRes.reused),
      timelineReady: true,
      timelineReused: Boolean(timelineRes.reused),
      audioDuration: timeline.duration,
      updatedAt: new Date().toISOString(),
    },
    rootDir
  );

  // 5. Story Planning
  console.log('🧠 [ORCHESTRATOR] Step 5: Story planning...');
  let storyPlan = options.storyPlan;
  if (!storyPlan) {
    const segments = timeline.segments || [];
    const storyResult = buildStoryPlan(
      {
        part: parsed?.part || 1,
        title: effectiveTitle,
        series: parsed?.series || 'ĐẸP.',
        category: parsed?.category || 'lifestyle',
        cleanContext: contextText,
        voiceScriptText: effectiveVoice,
        statementText: effectiveStatement,
        finalQuestionText: effectiveQuestion,
        visualPriorities: parsed?.visualSemantics,
      },
      segments,
      {
        brandContext: { brandName: 'HAY & ĐẸP.' },
        validationMode: planOnly ? 'DRAFT' : 'PRODUCTION',
        rawTimelineText: JSON.stringify(timeline),
        spokenAudioTranscript: segments.map((s) => s.text).join(' '),
      }
    );
    storyPlan = storyResult.plan;
    fs.writeFileSync(
      path.join(videosDir, 'story-plan-validation.json'),
      JSON.stringify(storyResult.validation, null, 2),
      'utf8'
    );
  }

  // Ensure outro in storyPlan using template dependencies SSOT defaults
  if (!storyPlan.outro) {
    const defaults = CINEMATIC_LIGHT_DEPENDENCIES.defaults;
    storyPlan.outro = {
      enabled: true,
      durationFrames: 60,
      artworkSrc: defaults.defaultOutroArtwork,
      brandMarkSrc: defaults.defaultOutroBrandMark,
      brandName: CINEMATIC_LIGHT_DEPENDENCIES.brand,
      slogan: 'Điều hay để biết. Điều đẹp để giữ.',
    };
  }
  storyPlan.audioMode = audioMode;
  fs.writeFileSync(path.join(videosDir, 'story-plan.json'), JSON.stringify(storyPlan, null, 2), 'utf8');

  // 5b. Enforce 70–85s Duration Contract & Narration Pacing Calibration (Sections 19, 23, 26)
  const isSyntheticOrTest = options.allowSynthetic || options.ttsAdapter || options.generatorAdapter;
  const shouldEnforceDuration = options.enforceDurationContract ?? (!isSyntheticOrTest);
  if (shouldEnforceDuration) {
    const plannedDur = calculatePlannedTotalDuration(storyPlan);
    console.log(
      `⏱ [ORCHESTRATOR] Checking planned total duration: ${plannedDur.toFixed(2)}s (contract: ${CINEMATIC_LIGHT_DURATION_CONTRACT.minDurationSec}–${CINEMATIC_LIGHT_DURATION_CONTRACT.maxDurationSec}s)...`
    );

    if (
      plannedDur < CINEMATIC_LIGHT_DURATION_CONTRACT.minDurationSec ||
      plannedDur > CINEMATIC_LIGHT_DURATION_CONTRACT.maxDurationSec
    ) {
      console.log(
        `🔄 [ORCHESTRATOR] Planned duration ${plannedDur.toFixed(2)}s is outside allowed range. Calibrating narration pacing...`
      );

      const rebuildStoryPlanFn = async (newTimeline) => {
        const segments = newTimeline.segments || [];
        const storyResult = buildStoryPlan(
          {
            part: parsed?.part || 1,
            title: effectiveTitle,
            series: parsed?.series || 'ĐẸP.',
            category: parsed?.category || 'lifestyle',
            cleanContext: contextText,
            voiceScriptText: effectiveVoice,
            statementText: effectiveStatement,
            finalQuestionText: effectiveQuestion,
            visualPriorities: parsed?.visualSemantics,
          },
          segments,
          {
            brandContext: { brandName: 'HAY & ĐẸP.' },
            validationMode: planOnly ? 'DRAFT' : 'PRODUCTION',
            rawTimelineText: JSON.stringify(newTimeline),
            spokenAudioTranscript: segments.map((s) => s.text).join(' '),
          }
        );
        const plan = storyResult.plan;
        if (!plan.outro) plan.outro = storyPlan.outro;
        plan.audioMode = audioMode;
        fs.writeFileSync(path.join(videosDir, 'story-plan.json'), JSON.stringify(plan, null, 2), 'utf8');
        return plan;
      };

      const pacingRes = await calibrateAudioPacing({
        slug,
        audioPath,
        timelinePath,
        voiceText: effectiveVoice,
        storyPlan,
        rebuildStoryPlanFn,
        ensureTimelineFn: (params) => ensureTimeline({ ...params, rootDir }),
        options,
        rootDir,
      });

      if (!pacingRes.success) {
        transitionPipelineState({
          slug,
          expectedState: PIPELINE_STATES.PLANNING,
          nextState: PIPELINE_STATES.BLOCKED,
          metadata: {
            blockedReason: 'AUDIO_DURATION_OUT_OF_RANGE',
            measuredDurationSec: pacingRes.measuredDurationSec,
            targetMinSec: pacingRes.targetMinSec,
            targetMaxSec: pacingRes.targetMaxSec,
            preferredMinSec: pacingRes.preferredMinSec,
            preferredMaxSec: pacingRes.preferredMaxSec,
            effectivePacing: pacingRes.effectivePacing,
            canonicalVoiceHash: pacingRes.canonicalVoiceHash,
            blockedAt: new Date().toISOString(),
          },
          rootDir,
        });
        throw new Error(
          `AUDIO_DURATION_OUT_OF_RANGE: Planned duration (${pacingRes.measuredDurationSec?.toFixed(2)}s) cannot reach allowed ${CINEMATIC_LIGHT_DURATION_CONTRACT.minDurationSec}–${CINEMATIC_LIGHT_DURATION_CONTRACT.maxDurationSec}s range. Pipeline transitioned to BLOCKED.`
        );
      }

      storyPlan = pacingRes.storyPlan;
    }
  }

  if (planOnly) {
    console.log(`\n📋 [PLAN-ONLY] Plan generated successfully for ${slug}.\n`);
    return { slug, state: PIPELINE_STATES.PLANNING, storyPlan, planOnly: true };
  }

  return generateCandidatesForStoryPlan({
    slug,
    storyPlan,
    options: { ...options, audioMode, title: effectiveTitle },
    rootDir,
  });
  }, { rootDir });
}

/**
 * Generates candidate assets for a story plan, tracking attempts and handling 429 quota pauses cleanly.
 */
export async function generateCandidatesForStoryPlan({
  slug,
  storyPlan,
  options = {},
  rootDir = ROOT,
}) {
  console.log(`🖼 [ORCHESTRATOR] Generating candidates for "${slug}"...`);
  const videosDir = path.join(rootDir, 'videos', slug);
  const scratchCandidatesDir = path.join(rootDir, 'scratch', slug, 'candidates');
  fs.mkdirSync(scratchCandidatesDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });

  const statePath = path.join(videosDir, 'candidate-generation-state.json');
  let candidateState = { slug, updatedAt: new Date().toISOString(), shots: {} };
  if (fs.existsSync(statePath)) {
    try {
      candidateState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch {}
  }
  if (!candidateState.shots) candidateState.shots = {};

  const beats = storyPlan.beats || storyPlan.shots || [];
  const candidates = [];

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const shotId =
      beat.shotId ||
      (beat.id ? beat.id.replace('beat-', 'shot-') : `shot-${String(i + 1).padStart(2, '0')}`);

    let record = candidateState.shots[shotId];
    if (!record) {
      record = {
        shotId,
        attemptsUsed: 0,
        lastCandidatePath: null,
        lastCandidateSha256: null,
        generationStatus: 'PENDING',
      };
      candidateState.shots[shotId] = record;
    }

    // Check if already completed and file exists on disk
    let isAlreadyCompleted = false;
    if (record.generationStatus === 'COMPLETED' && record.lastCandidatePath) {
      const resolvedPath = path.isAbsolute(record.lastCandidatePath)
        ? record.lastCandidatePath
        : path.resolve(rootDir, record.lastCandidatePath);
      if (fs.existsSync(resolvedPath)) {
        const sha256 = crypto.createHash('sha256').update(fs.readFileSync(resolvedPath)).digest('hex');
        if (!record.lastCandidateSha256 || sha256 === record.lastCandidateSha256) {
          candidates.push({
            shotId,
            assetPath: resolvedPath,
            sha256,
            attempt: record.selectedAttempt || record.attemptsUsed || 1,
          });
          isAlreadyCompleted = true;
        }
      }
    }

    if (isAlreadyCompleted) {
      continue;
    }

    // 3-attempt limit check
    if (record.attemptsUsed >= 3) {
      throw new Error(
        `MAX_ATTEMPTS_REACHED: Shot ${shotId} has used 3 attempts without a valid candidate. Halting (no Attempt 4).`
      );
    }

    // Generation attempt loop
    while (record.attemptsUsed < 3 && record.generationStatus !== 'COMPLETED') {
      const nextAttempt = record.attemptsUsed + 1;
      const candidatePath = path.join(scratchCandidatesDir, `${shotId}.jpg`);

      try {
        let genResult = null;
        if (options.candidateImages && options.candidateImages[shotId]) {
          const directPath = options.candidateImages[shotId].path || options.candidateImages[shotId];
          const sha256 = crypto.createHash('sha256').update(fs.readFileSync(directPath)).digest('hex');
          genResult = { success: true, shotId, attempt: nextAttempt, outputPath: directPath, sha256 };
        } else {
          genResult = await generateHumanInsightShot({
            slug,
            shot: beat,
            shotId,
            attempt: nextAttempt,
            outputPath: candidatePath,
            generatorAdapter: options.generatorAdapter,
            allowSynthetic: Boolean(options.allowSynthetic),
            rootDir,
          });
        }

        let isValid = true;
        if (typeof options.candidateValidator === 'function') {
          isValid = await options.candidateValidator({
            shot: beat,
            shotId,
            attempt: nextAttempt,
            candidatePath: genResult.outputPath,
            sha256: genResult.sha256,
          });
        }

        if (isValid) {
          record.attemptsUsed = nextAttempt;
          record.selectedAttempt = nextAttempt;
          record.lastCandidatePath = path.relative(rootDir, genResult.outputPath).replace(/\\/g, '/');
          record.lastCandidateSha256 = genResult.sha256;
          record.generationStatus = 'COMPLETED';
          candidateState.updatedAt = new Date().toISOString();
          fs.writeFileSync(statePath, JSON.stringify(candidateState, null, 2), 'utf8');

          candidates.push({
            shotId,
            assetPath: genResult.outputPath,
            sha256: genResult.sha256,
            attempt: nextAttempt,
          });
          break;
        } else {
          record.attemptsUsed = nextAttempt;
          record.generationStatus = 'FAILED';
          candidateState.updatedAt = new Date().toISOString();
          fs.writeFileSync(statePath, JSON.stringify(candidateState, null, 2), 'utf8');

          if (record.attemptsUsed >= 3) {
            throw new Error(
              `MAX_ATTEMPTS_REACHED: Shot ${shotId} reached 3 attempts without valid candidate. Halting generation (no Attempt 4).`
            );
          }
        }
      } catch (err) {
        if (err.isQuota429 || err.message?.includes('429') || /rate limit|quota/i.test(err.message || '')) {
          return handleImageGenerationQuotaPause({
            slug,
            shotId,
            attemptsUsed: record.attemptsUsed,
            pausedFromStage: 'INITIAL_GENERATION',
            nextAttemptNumber: nextAttempt,
            lastCandidatePath: record.lastCandidatePath,
            lastCandidateSha256: record.lastCandidateSha256,
            candidateState,
            statePath,
            audioMode: options.audioMode || 'full',
            error: err,
            rootDir,
          });
        }
        throw err;
      }
    }

    if (record.generationStatus !== 'COMPLETED') {
      throw new Error(
        `Candidate generation failed for shot ${shotId}: reached max attempts (${record.attemptsUsed}) with no valid candidate.`
      );
    }
  }

  // 7. Assemble HUMAN_QA_REVIEW_V1 Review Manifest
  console.log('📋 [ORCHESTRATOR] Assembling HUMAN_QA_REVIEW_V1 review manifest...');
  const effectiveTitle = storyPlan.title || options.title || slug;
  const reviewManifest = {
    manifestType: 'HUMAN_QA_REVIEW_V1',
    slug,
    title: effectiveTitle,
    createdAt: new Date().toISOString(),
    shots: candidates.map((c) => ({
      shotId: c.shotId,
      reviewedAssetPath: path.relative(rootDir, c.assetPath).replace(/\\/g, '/'),
      reviewedAssetSha256: c.sha256,
      selectedAttempt: c.attempt || 1,
      humanQaVerdict: 'PENDING_HUMAN_QA',
    })),
  };

  const reviewManifestPath = path.join(videosDir, 'review-manifest.json');
  fs.writeFileSync(reviewManifestPath, JSON.stringify(reviewManifest, null, 2), 'utf8');

  // 8. Transition to PENDING_HUMAN_IMAGE_QA and HALT cleanly
  transitionPipelineState({
    slug,
    nextState: PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
    metadata: {
      templateId: HUMAN_INSIGHT_TEMPLATE_ID,
      audioMode: options.audioMode || 'full',
      candidateCount: candidates.length,
      reviewManifestPath: path.relative(rootDir, reviewManifestPath).replace(/\\/g, '/'),
    },
    rootDir,
  });

  console.log('\n======================================================================');
  console.log(`⏸ [HUMAN_IMAGE_QA_PAUSE] Video "${slug}" reached PENDING_HUMAN_IMAGE_QA.`);
  console.log(`Review manifest written to: videos/${slug}/review-manifest.json`);
  console.log(`All ${candidates.length} shot(s) require human review before rendering.`);
  console.log(`To resume: record PASS_HUMAN_QA verdicts in review-manifest.json and run:`);
  console.log(`  node scripts/human-insight-production-orchestrator.mjs --resume=${slug}`);
  console.log('======================================================================\n');

  return {
    status: 'PAUSED',
    state: PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
    slug,
    reviewManifestPath,
    candidateCount: candidates.length,
  };
}

/**
 * Resumes an existing production run from its current state.
 */
export async function resumeProduction(slug, options = {}) {
  validateEpisodeSlug(slug);
  const rootDir = options.rootDir || ROOT;

  return withEpisodeLock(slug, 'resumeProduction', async () => {
    const current = loadPipelineState(slug, rootDir);
    if (!current) {
      throw new Error(
        `RESUME_FAILED: No pipeline state found for slug "${slug}" at videos/${slug}/pipeline-state.json.`
      );
    }

    if (current.state === PIPELINE_STATES.BLOCKED) {
      throw new Error(
        `RESUME_BLOCKED: Video "${slug}" is marked BLOCKED (reason: ${current.metadata?.blockedReason || 'unknown'}). Manual intervention required.`
      );
    }

    // Check prerequisites via pipeline state manager
    const resumeCheck = assertCanResume(slug, rootDir);
    if (!resumeCheck.canResume) {
      return {
        status: current.state,
        state: current.state,
        slug,
        message: resumeCheck.message || 'Cannot resume.',
      };
    }

    const audioMode = options.audioMode || current.metadata?.audioMode || 'full';
    const skipRender = Boolean(options.skipRender);
    const skipPlaywright = Boolean(options.skipPlaywright);

    // STAGE A: Resume from PENDING_HUMAN_IMAGE_QA (or selective retry resumed from PAUSED_QUOTA)
    if (
      current.state === PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA ||
      (current.state === PIPELINE_STATES.PAUSED_QUOTA && current.metadata?.pausedFromStage === 'SELECTIVE_RETRY')
    ) {
    console.log(`\n▶ [ORCHESTRATOR] Resuming ${slug} from ${current.state}...`);

    const videosDir = path.join(rootDir, 'videos', slug);
    const reviewManifestPath = path.join(videosDir, 'review-manifest.json');
    if (!fs.existsSync(reviewManifestPath)) {
      throw new Error(`Review manifest missing at: ${reviewManifestPath}`);
    }
    const reviewManifest = JSON.parse(fs.readFileSync(reviewManifestPath, 'utf8'));

    // Resolve storyPlan beats
    const storyPlanPath = path.join(videosDir, 'story-plan.json');
    if (!fs.existsSync(storyPlanPath)) {
      throw new Error(`Story plan missing at: ${storyPlanPath}`);
    }
    const storyPlan = JSON.parse(fs.readFileSync(storyPlanPath, 'utf8'));
    const beats = storyPlan.beats || storyPlan.shots || [];
    const beatMap = new Map();
    beats.forEach((b, idx) => {
      const id = b.shotId || (b.id ? b.id.replace('beat-', 'shot-') : `shot-${String(idx + 1).padStart(2, '0')}`);
      beatMap.set(id, b);
    });

    // ORDER SSOT: Validate entire review manifest BEFORE deciding SELECTIVE_RETRY or PROMOTION!
    const validation = validateHumanQaReviewManifest(reviewManifest, {
      rootDir,
      requireAllPass: false,
      checkDisk: true,
      storyPlanBeats: beats,
    });

    if (!validation.valid) {
      throw new Error(`Human QA review manifest invalid for "${slug}":\n  ${validation.errors.join('\n  ')}`);
    }

    const failedShots = validation.failedShots;

    if (failedShots.length > 0) {
      console.log(`🔄 [SELECTIVE-RETRY] Detected ${failedShots.length} shot(s) with FAIL_HUMAN_QA verdict. Starting selective retry...`);

      const statePath = path.join(videosDir, 'candidate-generation-state.json');
      let candidateState = { slug, updatedAt: new Date().toISOString(), shots: {} };
      if (fs.existsSync(statePath)) {
        try {
          candidateState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        } catch {}
      }
      if (!candidateState.shots) candidateState.shots = {};

      const scratchCandidatesDir = path.join(rootDir, 'scratch', slug, 'candidates');
      fs.mkdirSync(scratchCandidatesDir, { recursive: true });

      const retriedShots = [];

      for (const failedShot of failedShots) {
        const shotId = failedShot.shotId;
        const beat = beatMap.get(shotId);
        if (!beat) {
          throw new Error(`MANIFEST_INVALID: Shot "${shotId}" does not exist in story plan (no dummy fallback allowed).`);
        }

        let record = candidateState.shots[shotId];
        if (!record) {
          record = {
            shotId,
            attemptsUsed: 1,
            lastCandidatePath: failedShot.reviewedAssetPath,
            lastCandidateSha256: failedShot.reviewedAssetSha256,
            generationStatus: 'FAILED',
          };
          candidateState.shots[shotId] = record;
        }

        // 3-Attempt Cap Check (no Attempt 4!)
        if (record.attemptsUsed >= 3) {
          transitionPipelineState({
            slug,
            expectedState: current.state,
            nextState: PIPELINE_STATES.BLOCKED,
            metadata: {
              blockedReason: 'MAX_IMAGE_ATTEMPTS_EXHAUSTED',
              shotId,
              attemptsUsed: record.attemptsUsed,
              lastCandidatePath: record.lastCandidatePath,
              lastCandidateSha256: record.lastCandidateSha256,
              blockedAt: new Date().toISOString(),
            },
            rootDir,
          });
          throw new Error(
            `MAX_ATTEMPTS_REACHED: Shot ${shotId} has used 3 attempts without approval. Pipeline transitioned to BLOCKED (no Attempt 4 permitted).`
          );
        }

        const nextAttempt = record.attemptsUsed + 1;
        console.log(`📸 [SELECTIVE-RETRY] Regenerating ${shotId} (Attempt ${nextAttempt}/3)...`);

        const candidatePath = path.join(scratchCandidatesDir, `${shotId}-attempt${nextAttempt}.jpg`);

        let genResult = null;
        try {
          if (options.candidateImages && options.candidateImages[shotId]) {
            const directPath = options.candidateImages[shotId].path || options.candidateImages[shotId];
            const sha256 = crypto.createHash('sha256').update(fs.readFileSync(directPath)).digest('hex');
            genResult = { success: true, shotId, attempt: nextAttempt, outputPath: directPath, sha256 };
          } else {
            genResult = await generateHumanInsightShot({
              slug,
              shot: beat,
              shotId,
              attempt: nextAttempt,
              outputPath: candidatePath,
              generatorAdapter: options.generatorAdapter,
              allowSynthetic: Boolean(options.allowSynthetic),
              rootDir,
            });
          }
        } catch (err) {
          if (err.isQuota429 || err.message?.includes('429') || /rate limit|quota/i.test(err.message || '')) {
            // Save state of any retries that already completed in this loop before pausing
            if (retriedShots.length > 0) {
              candidateState.updatedAt = new Date().toISOString();
              fs.writeFileSync(statePath, JSON.stringify(candidateState, null, 2), 'utf8');
              fs.writeFileSync(reviewManifestPath, JSON.stringify(reviewManifest, null, 2), 'utf8');
            }
            return handleImageGenerationQuotaPause({
              slug,
              shotId,
              attemptsUsed: record.attemptsUsed, // Invariant: HTTP 429 does NOT consume an attempt!
              pausedFromStage: 'SELECTIVE_RETRY',
              nextAttemptNumber: nextAttempt,
              lastCandidatePath: record.lastCandidatePath,
              lastCandidateSha256: record.lastCandidateSha256,
              candidateState,
              statePath,
              audioMode,
              error: err,
              rootDir,
            });
          }
          throw err;
        }

        // Successful candidate generation consumes one real attempt
        record.attemptsUsed = nextAttempt;
        record.selectedAttempt = nextAttempt;
        record.lastCandidatePath = path.relative(rootDir, genResult.outputPath).replace(/\\/g, '/');
        record.lastCandidateSha256 = genResult.sha256;
        record.lastHumanVerdict = 'FAIL_HUMAN_QA';
        record.generationStatus = 'COMPLETED';

        // Update the shot in review manifest and reset verdict to PENDING_HUMAN_QA
        failedShot.reviewedAssetPath = record.lastCandidatePath;
        failedShot.reviewedAssetSha256 = genResult.sha256;
        failedShot.selectedAttempt = nextAttempt;
        failedShot.humanQaVerdict = 'PENDING_HUMAN_QA';

        retriedShots.push(shotId);
      }

      candidateState.updatedAt = new Date().toISOString();
      fs.writeFileSync(statePath, JSON.stringify(candidateState, null, 2), 'utf8');

      fs.writeFileSync(reviewManifestPath, JSON.stringify(reviewManifest, null, 2), 'utf8');

      // Preserve pipeline state at PENDING_HUMAN_IMAGE_QA and HALT cleanly
      transitionPipelineState({
        slug,
        expectedState: current.state,
        nextState: PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
        metadata: {
          audioMode,
          lastSelectiveRetryAt: new Date().toISOString(),
          retriedShots,
        },
        rootDir,
      });

      console.log('\n======================================================================');
      console.log(`⏸ [SELECTIVE_RETRY_COMPLETE] Regenerated ${retriedShots.length} shot(s): ${retriedShots.join(', ')}.`);
      console.log(`Candidate identities updated and verdicts reset to PENDING_HUMAN_QA.`);
      console.log(`Remaining passed/pending shots preserved intact.`);
      console.log(`Paused at PENDING_HUMAN_IMAGE_QA.`);
      console.log(`To resume after review: record PASS_HUMAN_QA in review-manifest.json and run:`);
      console.log(`  node scripts/human-insight-production-orchestrator.mjs --resume=${slug}`);
      console.log('======================================================================\n');

      return {
        status: 'PAUSED',
        state: PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
        slug,
        retriedShots,
        reviewManifestPath,
      };
    }

    if (validation.counts.pending > 0) {
      throw new Error(`RESUME_BLOCKED: ${validation.counts.pending} shot(s) remain PENDING_HUMAN_QA with no actionable failures. Review all shots before resuming.`);
    }

    // 1. Promote approved images (Strict gate: requires PASS_HUMAN_QA and matching SHA)
    console.log(`[1/4] Promoting approved images for ${slug}...`);
    await promoteApprovedImages({ slug, rootDir, strictAttemptLineage: true });

    // 2. Materialize canonical production assets
    console.log(`[2/4] Materializing canonical assets into public/assets/human-insight/final/${slug}/...`);
    await materializeProductionAssets({ slug, rootDir });

    // 3. Build official production render spec (ONLY via buildProductionRenderSpec)
    console.log(`[3/4] Building official production render spec (audioMode: ${audioMode})...`);
    const { spec: productionSpec, outputPath: productionSpecPath } = await buildProductionRenderSpec({
      slug,
      audioMode,
      rootDir,
      allowSyntheticFallback: Boolean(options.allowSynthetic),
    });

    // Write props.json containing { spec: productionSpec }
    const propsJsonPath = path.join(rootDir, 'videos', slug, 'props.json');
    fs.writeFileSync(propsJsonPath, JSON.stringify({ spec: productionSpec }, null, 2), 'utf8');

    // 4. Transition to READY_TO_RENDER
    transitionPipelineState({
      slug,
      expectedState: PIPELINE_STATES.PENDING_HUMAN_IMAGE_QA,
      nextState: PIPELINE_STATES.READY_TO_RENDER,
      metadata: { audioMode, specPath: productionSpecPath },
      rootDir,
    });

    if (skipRender) {
      console.log(`🛑 [SKIP-RENDER] Production spec built and verified; pausing at READY_TO_RENDER.\n`);
      return {
        status: 'PAUSED',
        state: PIPELINE_STATES.READY_TO_RENDER,
        slug,
        productionSpec,
      };
    }

    // 5. Render production video
    console.log(`[4/4] Rendering production video for ${slug}...`);
    const currentState = loadPipelineState(slug, rootDir) || current;
    const isSyntheticOrTest = Boolean(options.allowSynthetic || options.dryRun || options.renderAdapter || currentState?.metadata?.allowSynthetic);
    const shouldEnforceDuration = options.enforceDurationContract ?? (!isSyntheticOrTest);
    let renderResult = null;
    try {
      renderResult = await renderProductionVideo({
        slug,
        spec: productionSpec,
        rootDir,
        skipPlaywright,
        dryRun: options.dryRun,
        renderAdapter: options.renderAdapter,
        enforceDurationContract: shouldEnforceDuration,
      });
    } catch (err) {
      if (err.message?.includes('RENDER_DURATION_OUT_OF_RANGE')) {
        transitionPipelineState({
          slug,
          expectedState: PIPELINE_STATES.READY_TO_RENDER,
          nextState: PIPELINE_STATES.BLOCKED,
          metadata: {
            blockedReason: 'RENDER_DURATION_OUT_OF_RANGE',
            error: err.message,
            blockedAt: new Date().toISOString(),
          },
          rootDir,
        });
      }
      throw err;
    }

    // 6. Transition to PENDING_HUMAN_VIDEO_QA and HALT cleanly
    transitionPipelineState({
      slug,
      expectedState: PIPELINE_STATES.READY_TO_RENDER,
      nextState: PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
      metadata: {
        audioMode,
        videoRenderedAt: new Date().toISOString(),
        videoMp4Path: renderResult.outputMp4 || renderResult.canonicalMp4,
      },
      rootDir,
    });

    console.log('\n======================================================================');
    console.log(`⏸ [HUMAN_VIDEO_QA_PAUSE] Video rendered for "${slug}".`);
    console.log(`Paused at PENDING_HUMAN_VIDEO_QA.`);
    console.log(`Inspect videos/${slug}/video.mp4 and review artifacts.`);
    console.log(`To finalize and package: record Human video approval and run:`);
    console.log(`  node scripts/human-insight-production-orchestrator.mjs --resume=${slug}`);
    console.log('======================================================================\n');

    return {
      status: 'PAUSED',
      state: PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
      slug,
      videoMp4Path: renderResult.canonicalMp4 || renderResult.outputMp4,
    };
  }

  // STAGE B: Resume from READY_TO_RENDER
  if (current.state === PIPELINE_STATES.READY_TO_RENDER) {
    if (skipRender) {
      return { status: 'PAUSED', state: PIPELINE_STATES.READY_TO_RENDER, slug };
    }

    console.log(`\n▶ [ORCHESTRATOR] Resuming ${slug} from READY_TO_RENDER...`);
    const shouldEnforceDuration = options.enforceDurationContract ?? (options.allowSynthetic ? false : true);
    let renderResult = null;
    try {
      renderResult = await renderProductionVideo({
        slug,
        rootDir,
        skipPlaywright,
        dryRun: options.dryRun,
        renderAdapter: options.renderAdapter,
        enforceDurationContract: shouldEnforceDuration,
      });
    } catch (err) {
      if (err.message?.includes('RENDER_DURATION_OUT_OF_RANGE')) {
        transitionPipelineState({
          slug,
          expectedState: PIPELINE_STATES.READY_TO_RENDER,
          nextState: PIPELINE_STATES.BLOCKED,
          metadata: {
            blockedReason: 'RENDER_DURATION_OUT_OF_RANGE',
            error: err.message,
            blockedAt: new Date().toISOString(),
          },
          rootDir,
        });
      }
      throw err;
    }

    transitionPipelineState({
      slug,
      expectedState: PIPELINE_STATES.READY_TO_RENDER,
      nextState: PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
      metadata: {
        audioMode,
        videoRenderedAt: new Date().toISOString(),
        videoMp4Path: renderResult.outputMp4 || renderResult.canonicalMp4,
      },
      rootDir,
    });

    return {
      status: 'PAUSED',
      state: PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
      slug,
      videoMp4Path: renderResult.canonicalMp4 || renderResult.outputMp4,
    };
  }

  // STAGE C: Resume from PENDING_HUMAN_VIDEO_QA
  if (current.state === PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA) {
    console.log(`\n▶ [ORCHESTRATOR] Resuming ${slug} from PENDING_HUMAN_VIDEO_QA (packaging production)...`);

    // assertCanResume has verified explicit Human video approval
    const pkgResult = await packageProduction({
      slug,
      output: options.output,
      rootDir,
    });

    // Defense-in-depth: Revalidate explicit external human video approval before COMPLETE
    const approvalValidation = validateExternalHumanVideoApproval(slug, {
      rootDir,
      expectedVerdict: 'PASS_HUMAN_VIDEO_QA',
      checkDisk: true,
    });
    if (!approvalValidation.valid) {
      throw new Error(
        `COMPLETE_BLOCKED: HUMAN_VIDEO_APPROVAL_REQUIRED: Cannot transition to COMPLETE without valid external human video approval:\n  - ${approvalValidation.errors.join('\n  - ')}`
      );
    }

    transitionPipelineState({
      slug,
      expectedState: PIPELINE_STATES.PENDING_HUMAN_VIDEO_QA,
      nextState: PIPELINE_STATES.COMPLETE,
      metadata: {
        audioMode,
        packagedAt: new Date().toISOString(),
        zipPath: pkgResult.zipPath,
      },
      rootDir,
    });

    console.log('\n======================================================================');
    console.log(`🎉 [PRODUCTION COMPLETE] Video "${slug}" is fully packaged!`);
    console.log(`Package: ${pkgResult.zipPath} (${(pkgResult.sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
    console.log('======================================================================\n');

    return {
      status: 'COMPLETE',
      state: PIPELINE_STATES.COMPLETE,
      slug,
      zipPath: pkgResult.zipPath,
    };
  }

  if (current.state === PIPELINE_STATES.PLANNING || current.state === PIPELINE_STATES.PAUSED_QUOTA) {
    console.log(`▶ [ORCHESTRATOR] Resuming ${slug} from ${current.state} (initial candidate generation)...`);
    const videosDir = path.join(rootDir, 'videos', slug);
    const storyPlanPath = path.join(videosDir, 'story-plan.json');
    if (!fs.existsSync(storyPlanPath)) {
      throw new Error(`Cannot resume from ${current.state}: story-plan.json missing at ${storyPlanPath}`);
    }
    const storyPlan = JSON.parse(fs.readFileSync(storyPlanPath, 'utf8'));
    return generateCandidatesForStoryPlan({
      slug,
      storyPlan,
      options: { ...options, audioMode },
      rootDir,
    });
  }

  throw new Error(`Unhandled resume state: "${current.state}" for slug "${slug}"`);
  }, { rootDir });
}

/**
 * Universal Production Orchestrator entry point.
 */
export async function runHumanInsightOrchestrator(options = {}) {
  const resumeSlug = typeof options.resume === 'string' ? options.resume : (options.resume ? options.slug : null);
  if (resumeSlug) {
    return resumeProduction(resumeSlug, options);
  }
  return startNewProduction(options);
}

// CLI Execution Support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cliOptions = parseCliArgs();
  runHumanInsightOrchestrator(cliOptions)
    .then((result) => {
      console.log(`Orchestrator finished with status: ${result.status || 'OK'}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`❌ [ORCHESTRATOR ERROR]:`, err.message || err);
      process.exit(1);
    });
}
