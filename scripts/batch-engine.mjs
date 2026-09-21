import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { deriveSlug } from '../src/slug.js';
import {
  buildCanonicalTimeline,
  buildCanonicalApproximateTimeline,
  tokenizeCanonicalScript,
} from './subtitle-canonical-aligner.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';
import { CHANNEL_BRAND_CONFIG } from '../src/templates/human-insight/cinematic-light/storyPlannerRuntime.mjs';
import { mapPlannerScaleToRendererScale } from '../src/templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestVisualPriority(segText, visualPriorities, isHook, isEnding) {
  if (!visualPriorities || visualPriorities.length === 0) return '';
  if (isEnding) {
    const endingPrio = visualPriorities.find(p => /kết luận|khoảng thở|bình yên|kết thúc|outro/i.test(p));
    if (endingPrio) return endingPrio;
  }
  const normSeg = normalize(segText);
  let bestPrio = '';
  let bestScore = 0;
  for (const prio of visualPriorities) {
    const normPrio = normalize(prio);
    const words = normPrio.split(/\s+/).filter(w => w.length >= 2);
    let count = 0;
    for (const w of words) {
      if (normSeg.includes(w)) count++;
    }
    const score = count / words.length;
    if (score > 0.25 && score > bestScore) {
      bestScore = score;
      bestPrio = prio;
    }
  }
  return bestPrio;
}

/**
 * Format a long statement into balanced 2-3 lines with \n
 */
function formatStatement(statement) {
  if (!statement) return '';
  const words = statement.trim().split(/\s+/);
  if (words.length <= 4) return statement.toUpperCase();

  // Break into ~3-4 words per line
  const lines = [];
  let current = [];
  const wordsPerLine = Math.ceil(words.length / (words.length > 8 ? 3 : 2));

  for (let i = 0; i < words.length; i++) {
    current.push(words[i]);
    if (current.length >= wordsPerLine || i === words.length - 1) {
      lines.push(current.join(' '));
      current = [];
    }
  }
  return lines.join('\n').toUpperCase();
}

/**
 * Execute command with retry logic
 */
function execWithRetry(cmd, maxRetries = 3, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for command: ${cmd}`);
      if (attempt === maxRetries) throw err;
      const waitTime = delayMs * attempt;
      console.log(`Waiting ${waitTime}ms before retry...`);
      execSync(`node -e "setTimeout(() => {}, ${waitTime})"`);
    }
  }
}

function writeFileSyncWithRetry(filePath, content, maxRetries = 5, delayMs = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const waitTime = delayMs * attempt;
      console.warn(`⚠️ Write lock on ${path.basename(filePath)} (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      execSync(`node -e "setTimeout(() => {}, ${waitTime})"`);
    }
  }
}

export function canonicalKey(beat) {
  return `${beat.continuityGroup}:${beat.castId || 'none'}`;
}

export function resolveCanonicalAsset(beat, canonicalAssets) {
  if (beat.assetStrategy !== 'reuse-canonical') {
    return null;
  }
  const key = canonicalKey(beat);
  const canonical = canonicalAssets instanceof Map ? canonicalAssets.get(key) : canonicalAssets?.[key];
  if (canonical) {
    return canonical;
  }
  const roleLabel = beat.storyRole === 'question' ? 'Question' : 'Memory';
  throw new Error(
    `${roleLabel} beat ${beat.id} requires canonical reuse, but no canonical asset exists for ${beat.castId || 'no-cast'} / ${beat.worldId || 'no-world'}.`,
  );
}

export function chooseSemanticEntrySfx({
  storyRole,
  role,
  visualContainer,
  container,
  contentMode,
  voiceClause = '',
  narration = '',
  text = '',
  visualIntent = '',
  intent = '',
  isHook = false,
  isStatement = false,
  isEnding = false,
  previousSceneHadSfx = false,
} = {}) {
  const effectiveRole = storyRole || role;
  const effectiveContainer = visualContainer || container || 'canvas';
  const effectiveVoice = voiceClause || narration || text || '';
  const effectiveIntent = visualIntent || intent || '';

  // Always suppress on ending, question, release
  if (isEnding || effectiveRole === 'question' || effectiveRole === 'release') {
    return null;
  }

  // Rule 1: Memory / paper
  if (effectiveRole === 'memory' && effectiveContainer === 'paper') {
    return {
      name: 'pageTurn',
      volume: 0.12,
      reason: 'memory-paper semantic transition',
    };
  }

  // Rule 2: Book / page detail
  const bookVoiceKeywords = /(?:lật trang|trang sách|cuốn sách|ghi chép|notebook|\bpage\b|\bbook\b)/i;
  const voiceHasKeywords = bookVoiceKeywords.test(effectiveVoice);
  const intentHasTurningKeywords = /(?:lật trang|turning page|turn the page|flipping page|open book)/i.test(effectiveIntent);

  if (
    (voiceHasKeywords || intentHasTurningKeywords) &&
    (effectiveRole === 'detail-action' || effectiveRole === 'action' || effectiveRole === 'detail')
  ) {
    return {
      name: 'pageTurn',
      volume: 0.12,
      reason: 'book-page semantic action',
    };
  }

  // Rule 3: Major statement emphasis
  if (isStatement) {
    if (previousSceneHadSfx) {
      return null;
    }
    return {
      name: 'whoosh',
      volume: 0.10,
      reason: 'statement emphasis transition',
    };
  }

  // Rule 4: Optional opening reveal
  if (isHook) {
    if (previousSceneHadSfx) {
      return null;
    }
    return {
      name: 'whoosh',
      volume: 0.08,
      reason: 'opening reveal transition',
    };
  }

  // Rule 5: Everything else
  return null;
}

function resolveBeatAsset({
  beat,
  slug,
  sceneIndex,
  beatIndex,
  sceneType,
  mood,
  excludeSet,
}) {
  const args = [
    'scripts/human-insight-image.mjs',
    '--text', beat.voiceClause,
    '--type', sceneType,
    '--mood', mood,
    '--visual', beat.visualIntent,
    '--story-role', beat.storyRole,
    '--action', beat.visualAction || beat.visualIntent,
    '--world-id', beat.worldId || '',
    '--world-lock', beat.worldLock || '',
    '--slug', slug,
    '--scene-index', String(sceneIndex * 10 + beatIndex),
    '--shot-scale', beat.shotScale,
    '--composition', beat.composition,
    '--exclude', Array.from(excludeSet).join(','),
    '--generate',
    '--strict-hay-dep',
  ];

  if (beat.castId) {
    args.push('--cast', beat.castId);
  }

  if (beat.needsPeople === false) {
    args.push('--no-people');
  }

  if (beat.peopleContract) {
    if (typeof beat.peopleContract.min === 'number') {
      args.push('--people-min', String(beat.peopleContract.min));
    }
    if (typeof beat.peopleContract.max === 'number') {
      args.push('--people-max', String(beat.peopleContract.max));
    }
  }

  if (Array.isArray(beat.presentMembers) && beat.presentMembers.length > 0) {
    args.push('--present-members', beat.presentMembers.join(','));
  }

  if (beat.scale) {
    args.push('--scale', beat.scale);
  }
  if (beat.silhouette) {
    args.push('--silhouette', beat.silhouette);
  }
  if (beat.visualVerb) {
    args.push('--visual-verb', beat.visualVerb);
  }
  if (beat.semanticIntent) {
    args.push('--semantic-intent', beat.semanticIntent);
  }
  if (beat.visualMode) {
    args.push('--visual-mode', beat.visualMode);
  }

  const result = spawnSync(
    'node',
    args,
    { cwd: ROOT, encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    throw new Error(
      `Image generation failed for ${beat.id}: ${result.stderr || result.stdout}`,
    );
  }

  const parsed = JSON.parse(result.stdout);

  return {
    asset: {
      id: parsed.image.assetId,
      path: parsed.image.path,
      castId: parsed.asset?.castId,
      worldId: parsed.asset?.worldId,
      storyRole: parsed.asset?.storyRole,
    },
    source: parsed.source,
    score: parsed.score ?? parsed.previousBest?.score ?? 0,
  };
}

export function beatCoversSegment(beat, segmentIndex) {
  return (
    beat.segmentIndex === segmentIndex ||
    (Array.isArray(beat.continuedInSegments) && beat.continuedInSegments.includes(segmentIndex))
  );
}

export function buildSpecFromStoryPlan({
  storyPlan,
  timeline,
  assetResolver,
  slug = 'video',
  totalFrames: explicitTotalFrames,
  videoData = {},
}) {
  const segments = timeline.segments || [];
  if (segments.length === 0) {
    throw new Error('timeline has 0 segments!');
  }

  const { title = '', statementText = '' } = videoData;
  const usedAssetIds = new Set();
  let lastAssetId = null;
  const canonicalAssets = new Map();
  const resolvedBeatAssetCache = new Map();
  const scenes = [];
  let previousSceneHadSfx = false;
  const FPS = 30;

  const timelineEndSec = Number(
    timeline.duration ??
    Math.max(...segments.map((s) => Number(s.end || 0))),
  );

  const narrativeEndFrame = Math.ceil(
    timelineEndSec * FPS,
  );

  // Clean statement target text for matching
  const targetStatementNorm = (statementText || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();

  let statementSegIdx = -1;
  if (targetStatementNorm) {
    let bestMatchScore = 0;
    segments.forEach((seg, idx) => {
      if (idx === 0) return;
      const segNorm = (seg.text || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .trim();

      const words = targetStatementNorm.split(/\s+/).filter(Boolean);
      let matchCount = 0;
      for (const w of words) {
        if (segNorm.includes(w)) matchCount++;
      }
      const score = matchCount / words.length;
      if (score > 0.35 && score > bestMatchScore) {
        bestMatchScore = score;
        statementSegIdx = idx;
      }
    });
  }

  // If no match found, place statement around 75% through the video
  if (statementSegIdx === -1 && segments.length > 3) {
    statementSegIdx = Math.max(1, segments.length - 3);
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isHook = i === 0;
    const isEnding = i === segments.length - 1;
    const isStatement = i === statementSegIdx;

    const sceneStartFrame = Math.round(
      seg.start * FPS,
    );

    const spokenEndFrame = Math.max(
      sceneStartFrame + 1,
      Math.round(seg.end * FPS),
    );

    const nextSceneStartFrame =
      i < segments.length - 1
        ? Math.round(
            segments[i + 1].start * FPS,
          )
        : narrativeEndFrame;

    const sceneEndFrame = Math.max(
      spokenEndFrame,
      nextSceneStartFrame,
    );

    const durFrames =
      sceneEndFrame - sceneStartFrame;

    const sceneType = isHook ? 'hook' : isEnding ? 'ending' : 'body';
    const mood = isHook || isEnding ? 'peaceful' : (isStatement ? 'contemplative' : 'reflective');

    const plannedBeats = (storyPlan.beats || []).filter(
      (beat) => beatCoversSegment(beat, i),
    );

    if (plannedBeats.length === 0) {
      throw new Error(`SPEC_BRIDGE_ORPHAN_SEGMENT: Narrative segment ${i} ("${seg.text}") has no covering planned beat`);
    }

    const primaryBeat =
      plannedBeats[0] ?? {
        storyRole: isHook ? 'establish' : isEnding ? 'question' : 'context',
        visualIntent: seg.text,
        shotScale: isHook ? 'wide' : 'medium',
        composition: 'portrait-focus',
        motionPreset: isEnding ? 'emotional-hold' : 'still-breathe',
        visualContainer: 'canvas',
        castId: storyPlan.castId,
        worldId: storyPlan.worldId,
        worldLock: storyPlan.worldLock,
      };

    const resolvedVisualBeats = [];
    let primaryAsset = null;

    for (let beatIndex = 0; beatIndex < plannedBeats.length; beatIndex++) {
      const beat = plannedBeats[beatIndex];

      const overlapStart = Math.max(
        beat.startFrame,
        sceneStartFrame,
      );

      const overlapEnd = Math.min(
        beat.endFrame,
        sceneEndFrame,
      );

      if (overlapEnd <= overlapStart) continue;

      const localStart =
        overlapStart - sceneStartFrame;

      const localEnd =
        overlapEnd - sceneStartFrame;

      const beatShotScale = mapPlannerScaleToRendererScale({
        scale: beat.scale || beat.shotScale,
        silhouette: beat.silhouette,
        role: beat.storyRole,
      });

      if (beat.assetStrategy === 'reuse-canonical') {
        const canonical = resolveCanonicalAsset(beat, canonicalAssets);
        if (!primaryAsset) primaryAsset = canonical;
        resolvedVisualBeats.push({
          startFrame: localStart,
          endFrame: localEnd,
          imageSrc: canonical.path,
          composition: beat.composition,
          shotScale: beatShotScale,
          motionPreset: beat.motionPreset,
          transition: 'cut',
        });
        continue;
      }

      const beatCacheKey = beat.id || `beat-${beat.segmentIndex}-${beatIndex}`;
      let resolved;
      if (resolvedBeatAssetCache.has(beatCacheKey)) {
        resolved = resolvedBeatAssetCache.get(beatCacheKey);
      } else {
        const excludeSet = new Set(usedAssetIds);
        if (lastAssetId) excludeSet.add(lastAssetId);

        resolved = assetResolver
          ? assetResolver({
              beat,
              slug,
              sceneIndex: i,
              beatIndex,
              sceneType,
              mood,
              excludeSet,
            })
          : {
              asset: {
                id: `asset-${i}-${beatIndex}`,
                path: `assets/human-insight/images/asset-${i}-${beatIndex}.jpg`,
              },
              source: 'fallback',
              score: 0,
            };

        resolvedBeatAssetCache.set(beatCacheKey, resolved);
      }

      const key = canonicalKey(beat);
      if (
        beat.castId &&
        (
          beat.storyRole === 'establish' ||
          beat.storyRole === 'interaction'
        ) &&
        !canonicalAssets.has(key)
      ) {
        canonicalAssets.set(
          key,
          resolved.asset,
        );
      }

      usedAssetIds.add(resolved.asset.id);
      lastAssetId = resolved.asset.id;

      if (!primaryAsset) primaryAsset = resolved.asset;

      resolvedVisualBeats.push({
        startFrame: localStart,
        endFrame: localEnd,
        imageSrc: resolved.asset.path,
        composition: beat.composition,
        shotScale: beatShotScale,
        motionPreset: beat.motionPreset,
        transition: 'cut',
      });
    }

    if (!primaryAsset) {
      throw new Error(`SPEC_BRIDGE_ORPHAN_SEGMENT: Narrative segment ${i} ("${seg.text}") resolved to no visual asset`);
    }

    const fallbackAsset = primaryAsset;

    if (!fallbackAsset.path) {
      throw new Error(`SPEC_BRIDGE_ORPHAN_SEGMENT: Narrative segment ${i} ("${seg.text}") has empty asset path`);
    }

    const entrySfx = chooseSemanticEntrySfx({
      storyRole: primaryBeat.storyRole,
      visualContainer: primaryBeat.visualContainer || 'canvas',
      contentMode: primaryBeat.contentMode,
      voiceClause: seg.text || primaryBeat.voiceClause || '',
      visualIntent: primaryBeat.visualIntent || '',
      isHook,
      isStatement,
      isEnding,
      previousSceneHadSfx,
    });
    previousSceneHadSfx = Boolean(entrySfx);

    const primaryShotScale = mapPlannerScaleToRendererScale({
      scale: primaryBeat.scale || primaryBeat.shotScale || (isHook ? 'wide' : 'medium'),
      silhouette: primaryBeat.silhouette,
      role: primaryBeat.storyRole,
    });

    const sceneObj = {
      type: isHook ? 'hook' : isEnding ? 'ending' : 'body',
      layout: 'standard',
      headerMode: isHook ? 'full' : 'dimmed',
      captionMode: isEnding ? 'statement' : 'phrase',

      storyRole: primaryBeat.storyRole,
      narrativePurpose: primaryBeat.narrativePurpose,
      visualIntent: primaryBeat.visualIntent,
      castId: primaryBeat.castId,
      worldId: primaryBeat.worldId,
      continuityGroup: primaryBeat.continuityGroup,

      composition: primaryBeat.composition,
      shotScale: primaryShotScale,
      visualContainer: primaryBeat.visualContainer,
      motionPreset: primaryBeat.motionPreset,

      startFrame: sceneStartFrame,
      durationFrames: durFrames,

      audioSegment: {
        start: seg.start,
        end: seg.end,
        text: seg.text || '',
      },

      image: {
        assetId: fallbackAsset.id,
        path: fallbackAsset.path,
      },

      ...(entrySfx ? { entrySfx } : {}),

      visualBeats:
        resolvedVisualBeats.length > 1
          ? resolvedVisualBeats
          : undefined,
    };

    if (isStatement) {
      sceneObj.insightText =
        formatStatement(statementText || seg.text);
      sceneObj.insightVariant = 'overlay';
    }

    if (isEnding) {
      sceneObj.insightText = seg.text;
      sceneObj.insightVariant = 'overlay';
      sceneObj.captionPlacement = 'hidden';
      sceneObj.motionPreset = 'emotional-hold';
    }

    scenes.push(sceneObj);
  }

  // Final Outro Card
  const outroStartFrame = narrativeEndFrame;
  const outroDurationFrames = 60;
  scenes.push({
    type: 'ending',
    isOutro: true,
    layout: 'standard',
    headerMode: 'hidden',
    captionMode: 'statement',
    startFrame: outroStartFrame,
    durationFrames: outroDurationFrames,
    audioSegment: {
      start: timelineEndSec,
      end: timelineEndSec + 2.0,
      text: '',
    },
    image: {
      assetId: lastAssetId || 'gratitude-simple-life-01',
      path: scenes[scenes.length - 1]?.image?.path || 'assets/human-insight/images/gratitude-simple-life-01.png',
    },
  });

  const totalFrames = explicitTotalFrames ?? (outroStartFrame + outroDurationFrames);

  return {
    templateId: 'human-insight/cinematic-light',
    slug,
    totalFrames,
    video: {
      title,
      bgMusic: 'assets/human-insight/music/music-bg-2.mp3',
    },
    scenes,
  };
}

export async function processVideo(videoData, options = {}) {
  const { force = false, planOnly = false, skipRender = false, plannerOverrides } = options;
  const {
    index,
    part,
    title,
    series,
    category,
    cleanContext,
    voiceScriptText,
    statementText,
    visualPriorities,
  } = videoData;
  console.log(`\n======================================================`);
  console.log(`▶ [Video ${index}/100] (Part ${part}): ${title}`);
  console.log(`======================================================`);

  const slug = deriveSlug(cleanContext);
  console.log(`Slug: ${slug}`);

  const videosDir = path.join(ROOT, 'videos', slug);
  const videoMp4Path = path.join(videosDir, 'video.mp4');

  if (!force && !planOnly && fs.existsSync(videoMp4Path)) {
    const stat = fs.statSync(videoMp4Path);
    if (stat.size > 1000000) {
      console.log(`✅ video.mp4 already exists (${(stat.size / 1024 / 1024).toFixed(1)} MB). Skipping to next video.`);
      return { slug, videoMp4Path, skipped: true };
    }
  }

  const publicDir = path.join(ROOT, 'public', slug);
  const scriptDir = path.join(videosDir, 'script');
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  // Step 1: Setup artifacts
  fs.writeFileSync(path.join(videosDir, 'context.txt'), cleanContext, 'utf-8');
  fs.writeFileSync(path.join(videosDir, 'template.txt'), 'human-insight/cinematic-light', 'utf-8');
  fs.writeFileSync(path.join(videosDir, 'audio.txt'), 'full', 'utf-8');

  // Step 2 & 3: Planner & Teller
  const rawParas = voiceScriptText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\r/g, '').trim())
    .filter(Boolean);

  const scriptItems = [];
  rawParas.forEach((p, idx) => {
    if (idx === 0) {
      scriptItems.push({ text: p, type: 'hook' });
    } else if (idx === rawParas.length - 1) {
      // Keep voice script intact from prompt; interactive question remains the last sentence
      // Branding appears visually only on OutroCard
      scriptItems.push({ text: p, type: 'ending' });
    } else {
      scriptItems.push({ text: p, type: 'body' });
    }
  });

  const scriptPath = path.join(scriptDir, 'script.json');
  fs.writeFileSync(scriptPath, JSON.stringify({ script: scriptItems }, null, 2), 'utf-8');

  const planData = {
    title,
    hook: rawParas[0] || '',
    segments: rawParas.slice(1, -1).map((text, i) => ({
      title: `Ý ${i + 1}`,
      content_summary: text
    })),
    ending: rawParas[rawParas.length - 1] || '',
    estimated_duration: 75
  };
  fs.writeFileSync(path.join(videosDir, 'plan.json'), JSON.stringify(planData, null, 2), 'utf-8');

  // Step 4: TTS
  const voiceMp3Path = path.join(publicDir, 'voice.mp3');
  if (!fs.existsSync(voiceMp3Path)) {
    if (!planOnly) {
      console.log(`🎙 Running TTS for ${slug}...`);
      execWithRetry(`node scripts/tts.mjs "videos/${slug}/script/script.json" "${slug}"`);
    } else {
      console.log(`🎙 [PLAN-ONLY] Skipping TTS for ${slug}`);
    }
  } else {
    console.log(`🎙 Reusing existing voice.mp3`);
  }

  // Step 5: Transcribe
  const timelineJsonPath = path.join(publicDir, 'timeline.json');
  const rawTimelineJsonPath = path.join(publicDir, 'timeline-stt-raw.json');
  if (!fs.existsSync(timelineJsonPath)) {
    if (
      options.plannerOverrides?.timelinePath &&
      fs.existsSync(options.plannerOverrides.timelinePath)
    ) {
      console.log(
        `🎧 Using timeline override from ${options.plannerOverrides.timelinePath}...`,
      );
      fs.copyFileSync(options.plannerOverrides.timelinePath, timelineJsonPath);
    } else {
      // Check if an existing timeline with matching topic slug exists
      try {
        const topicWords = slug.split('-').slice(4).join('-');
        if (topicWords && topicWords.length > 5) {
          const candidateDirs = fs
            .readdirSync(path.join(ROOT, 'public'))
            .filter((d) => d !== slug && d.includes(topicWords));
          for (const cand of candidateDirs) {
            const candTl = path.join(ROOT, 'public', cand, 'timeline.json');
            if (fs.existsSync(candTl)) {
              console.log(
                `🎧 Found existing matching timeline.json in public/${cand}, reusing...`,
              );
              fs.copyFileSync(candTl, timelineJsonPath);
              break;
            }
          }
        }
      } catch {}
    }
  }

  if (!fs.existsSync(timelineJsonPath)) {
    if (!planOnly) {
      console.log(`🎧 Running Transcribe for ${slug}...`);
      execWithRetry(`node scripts/transcribe.mjs "${slug}"`);
    } else {
      console.log(`🎧 [PLAN-ONLY] Skipping live Transcribe for ${slug}`);
    }
  } else {
    console.log(`🎧 Reusing existing timeline.json`);
  }

  // Step 5b: Canonical Subtitle Alignment (Source A: voiceScriptText, Source B: STT timing)
  let alignedTimeline;
  let alignmentDiffs = [];
  let alignmentMetrics;

  if (fs.existsSync(timelineJsonPath)) {
    if (!fs.existsSync(rawTimelineJsonPath)) {
      fs.copyFileSync(timelineJsonPath, rawTimelineJsonPath);
    }
    const rawTimeline = JSON.parse(fs.readFileSync(rawTimelineJsonPath, 'utf-8'));
    try {
      const res = buildCanonicalTimeline({
        canonicalText: voiceScriptText,
        sttTimeline: rawTimeline,
      });
      alignedTimeline = res.timeline;
      alignmentDiffs = res.diffs;
      alignmentMetrics = res.metrics;
    } catch (alignErr) {
      console.warn(`   ⚠️ Canonical alignment error: ${alignErr.message}. Falling back to CANONICAL_APPROXIMATE.`);
      alignedTimeline = buildCanonicalApproximateTimeline({
        canonicalText: voiceScriptText,
        sttTimeline: rawTimeline,
      });
      const canonicalTokens = tokenizeCanonicalScript(voiceScriptText);
      alignmentMetrics = {
        canonicalTokenCount: canonicalTokens.length,
        sttTokenCount: Array.isArray(rawTimeline?.words) ? rawTimeline.words.length : 0,
        exactMatches: 0,
        fuzzyMatches: 0,
        contextSubstitutions: 0,
        interpolatedTokens: 0,
        ignoredSttTokens: 0,
        evidenceRatio: 0,
        substitutionRatio: 0,
        interpolationRatio: 0,
        ignoredSttRatio: 0,
        canonicalTextIntegrity: true,
        alignmentStatus: 'DEGRADED',
        timingMode: 'CANONICAL_APPROXIMATE',
        validationErrors: [`Alignment exception: ${alignErr.message}`],
        canonicalIntegrity: true,
      };
    }
    fs.writeFileSync(timelineJsonPath, JSON.stringify(alignedTimeline, null, 2), 'utf-8');
  } else {
    // Zero-network fallback for plan-only when timeline.json does not exist yet
    let t = 0;
    const approxSegments = rawParas.map((text) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });
    alignedTimeline = {
      duration: t,
      segments: approxSegments,
      words: [],
    };
    alignmentMetrics = {
      canonicalTokenCount: tokenizeCanonicalScript(voiceScriptText).length,
      sttTokenCount: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      contextSubstitutions: 0,
      interpolatedTokens: 0,
      ignoredSttTokens: 0,
      evidenceRatio: 0,
      substitutionRatio: 0,
      interpolationRatio: 0,
      ignoredSttRatio: 0,
      canonicalTextIntegrity: true,
      alignmentStatus: 'APPROXIMATE',
      timingMode: 'CANONICAL_APPROXIMATE',
      validationErrors: [],
      canonicalIntegrity: true,
    };
  }

  // QA Artifacts: Report and Diff
  fs.writeFileSync(
    path.join(videosDir, 'subtitle-alignment-report.json'),
    JSON.stringify(alignmentMetrics, null, 2),
    'utf-8',
  );

  const diffMdLines = [
    '# Subtitle Alignment Diff',
    '',
    `- **Video Slug**: \`${slug}\``,
    `- **Canonical Tokens**: ${alignmentMetrics.canonicalTokenCount}`,
    `- **STT Tokens**: ${alignmentMetrics.sttTokenCount}`,
    `- **Exact Matches**: ${alignmentMetrics.exactMatches}`,
    `- **Fuzzy Matches**: ${alignmentMetrics.fuzzyMatches}`,
    `- **Context Substitutions**: ${alignmentMetrics.contextSubstitutions}`,
    `- **Interpolated Tokens**: ${alignmentMetrics.interpolatedTokens}`,
    `- **Ignored STT Tokens**: ${alignmentMetrics.ignoredSttTokens}`,
    `- **Evidence Ratio**: ${alignmentMetrics.evidenceRatio}`,
    `- **Substitution Ratio**: ${alignmentMetrics.substitutionRatio}`,
    `- **Interpolation Ratio**: ${alignmentMetrics.interpolationRatio}`,
    `- **Ignored STT Ratio**: ${alignmentMetrics.ignoredSttRatio}`,
    `- **Canonical Text Integrity**: ${alignmentMetrics.canonicalTextIntegrity ? 'PASS' : 'FAIL'}`,
    `- **Alignment Status**: \`${alignmentMetrics.alignmentStatus}\``,
    `- **Timing Mode**: \`${alignmentMetrics.timingMode}\``,
    '',
    '## Differences',
    '',
  ];

  if (alignmentDiffs.length === 0) {
    diffMdLines.push('No differences found. STT text perfectly matches canonical voice script.');
  } else {
    alignmentDiffs.forEach((d, idx) => {
      diffMdLines.push(`### Diff ${idx + 1} (${d.type})`);
      diffMdLines.push(`- **STT**: \`${d.stt}\``);
      diffMdLines.push(`- **CANONICAL**: \`${d.canonical}\``);
      if (d.start !== undefined && d.end !== undefined) {
        diffMdLines.push(`- **TIMING**: \`${d.start}s – ${d.end}s\``);
      }
      diffMdLines.push(`- **ACTION**: ${d.action}`);
      diffMdLines.push('');
    });
  }

  fs.writeFileSync(
    path.join(videosDir, 'subtitle-alignment-diff.md'),
    diffMdLines.join('\n'),
    'utf-8',
  );

  console.log(
    `📝 Subtitle Aligned: ${alignmentMetrics.canonicalTokenCount} tokens ` +
    `(${alignmentMetrics.exactMatches} exact, ${alignmentMetrics.contextSubstitutions} subst, ` +
    `${alignmentMetrics.interpolatedTokens} interp). Integrity: ${alignmentMetrics.canonicalIntegrity ? 'PASS' : 'FAIL'}`
  );

  const timeline = alignedTimeline;
  const segments = timeline.segments || [];
  if (segments.length === 0) {
    throw new Error(`timeline.json has 0 segments!`);
  }

  const rawTimelineContent = fs.existsSync(rawTimelineJsonPath)
    ? fs.readFileSync(rawTimelineJsonPath, 'utf-8')
    : '';

  const spokenAudioTranscript =
    plannerOverrides?.spokenAudioTranscript ?? rawTimelineContent;

  const storyResult = buildStoryPlan(
    {
      index,
      part,
      title,
      series,
      category,
      cleanContext,
      voiceScriptText,
      statementText,
      visualPriorities,
    },
    segments,
    {
      brandContext: CHANNEL_BRAND_CONFIG,
      validationMode: planOnly ? 'DRAFT' : 'PRODUCTION',
      rawTimelineText: rawTimelineContent,
      spokenAudioTranscript,
      ...plannerOverrides,
    },
  );

  const storyPlan = storyResult.plan;
  const storyValidation = storyResult.validation;
  const storyMetrics = storyResult.metrics;
  const productionReadiness = storyResult.productionValidation;

  fs.writeFileSync(
    path.join(videosDir, 'story-plan.json'),
    JSON.stringify(storyPlan, null, 2),
    'utf-8',
  );

  fs.writeFileSync(
    path.join(videosDir, 'story-plan-validation.json'),
    JSON.stringify(
      {
        ...storyValidation,
        brandAudit: storyResult.brandAudit,
        reuseAudit: storyResult.reuseAudit,
      },
      null,
      2,
    ),
    'utf-8',
  );

  fs.writeFileSync(
    path.join(videosDir, 'reference-grammar-metrics.json'),
    JSON.stringify(storyMetrics, null, 2),
    'utf-8',
  );

  fs.writeFileSync(
    path.join(videosDir, 'production-readiness.json'),
    JSON.stringify(productionReadiness, null, 2),
    'utf-8',
  );

  console.log(
    `🧠 Story mode=${storyPlan.contentMode}, ` +
    `cast=${storyPlan.castId || 'none'}, ` +
    `world=${storyPlan.worldId}, ` +
    `beats=${storyPlan.beats.length}, ` +
    `cpm=${storyMetrics.changesPerMinute}`,
  );

  // Production gate check: in production mode, block before image generation if productionReady is false
  if (!planOnly && productionReadiness && !productionReadiness.productionReady) {
    const mismatchReason =
      productionReadiness.errors.join('; ') || 'Production gate validation failed';
    const errorMsg = `[PRODUCTION GATE BLOCKED] ${mismatchReason}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (planOnly) {
    console.log(`\n======================================================`);
    console.log(`PLAN-ONLY SUMMARY: Video ${index} - "${title}"`);
    console.log(`======================================================`);
    console.log(`  Mode:                ${storyPlan.contentMode}`);
    console.log(`  Cast / World:        ${storyPlan.castId || 'none'} / ${storyPlan.worldId}`);
    console.log(`  Beats:               ${storyPlan.beats.length}`);
    console.log(`  Changes / Min (CPM): ${storyMetrics.changesPerMinute} (target: 18 - 22)`);
    console.log(`  Hold Distribution:   median: ${storyMetrics.medianHoldSeconds}s, max: ${storyMetrics.maxHoldSeconds}s`);
    console.log(`  Scales:              ${storyMetrics.uniqueScales} unique (${Object.entries(storyMetrics.scaleDistribution || {}).map(([k, v]) => `${k}:${v}`).join(', ')})`);
    console.log(`  Silhouettes:         ${storyMetrics.uniqueSilhouettes} unique`);
    console.log(`  Brand Audit:         ${storyResult.brandAudit.hasMismatch ? `MISMATCH (${storyResult.brandAudit.mismatchType || 'BRAND_AUDIO_MISMATCH'})` : 'ALIGNED'} [template: "${storyResult.brandAudit.templateBrand}", spoken: "${storyResult.brandAudit.audioBrandName || 'none'}"]`);
    console.log(`  Production Verdict:  ${productionReadiness.productionReady ? '✅ READY' : '🚫 BLOCKED'} ${productionReadiness.errors.length > 0 ? `(${productionReadiness.errors.join('; ')})` : ''}`);
    const assetSummary =
      storyPlan.assetResolutionMode === 'UNRESOLVED' ||
      (storyMetrics.newImageCount === 0 && storyMetrics.reuseCount === 0 && storyMetrics.componentCount === 0)
        ? 'UNRESOLVED (dry run; resolution runs during asset selection)'
        : `${storyMetrics.newImageCount} new, ${storyMetrics.reuseCount} reused, ${storyMetrics.componentCount} component`;
    console.log(`  Asset Reuse:         ${assetSummary}`);
    console.log(`======================================================\n`);
    return {
      slug,
      storyPlan,
      storyValidation,
      storyMetrics,
      productionReadiness,
      brandAudit: storyResult.brandAudit,
      reuseAudit: storyResult.reuseAudit,
      planOnly: true,
    };
  }

  if (!storyValidation.valid) {
    throw new Error(
      `Story plan invalid:\n${storyValidation.errors.join('\n')}`,
    );
  }

  // Step 6: Build Spec
  console.log(`📋 Generating spec.json with story engine beats...`);
  const specData = buildSpecFromStoryPlan({
    storyPlan,
    timeline,
    assetResolver: ({ beat, slug: s, sceneIndex, beatIndex, sceneType, mood, excludeSet }) =>
      resolveBeatAsset({
        beat,
        slug: s,
        sceneIndex,
        beatIndex,
        sceneType,
        mood,
        excludeSet,
      }),
    slug,
    videoData: { title, statementText },
  });
  const scenes = specData.scenes;
  const totalFrames = specData.totalFrames;

  fs.writeFileSync(path.join(videosDir, 'spec.json'), JSON.stringify(specData, null, 2), 'utf-8');
  fs.writeFileSync(path.join(videosDir, 'props.json'), JSON.stringify({ slug }, null, 2), 'utf-8');
  console.log(`Wrote spec.json (${scenes.length} scenes, ${totalFrames} frames / ${(totalFrames / 30).toFixed(1)}s)`);

  if (skipRender) {
    console.log(`\n🛑 [SKIP-RENDER] Assets and spec.json generated; skipping Remotion render.\n`);
    return {
      slug,
      specData,
      totalFrames,
      skipRender: true,
    };
  }

  // Step 7: Update Remotion source files
  console.log(`⚙ Updating Remotion config files for ${slug}...`);
  const videoContentPath = path.join(ROOT, 'src', 'VideoContent.tsx');
  let vcContent = fs.readFileSync(videoContentPath, 'utf-8');
  vcContent = vcContent.replace(/import specData from '\.\.\/videos\/[^']+\/spec\.json';/, `import specData from '../videos/${slug}/spec.json';`);
  writeFileSyncWithRetry(videoContentPath, vcContent);

  const rootPath = path.join(ROOT, 'src', 'Root.tsx');
  let rootContent = fs.readFileSync(rootPath, 'utf-8');
  rootContent = rootContent
    .replace(/const defaultSlug = '[^']+';/, `const defaultSlug = '${slug}';`)
    .replace(/const defaultDuration = \d+;/, `const defaultDuration = ${totalFrames};`);
  writeFileSyncWithRetry(rootPath, rootContent);

  // Step 8: Render
  console.log(`🎬 Rendering ${slug} via Remotion...`);
  execWithRetry(`npx remotion render src/Root.tsx Video --output "videos/${slug}/video.mp4" --codec h264 --props "videos/${slug}/props.json"`);

  const stat = fs.statSync(videoMp4Path);
  console.log(`🎉 SUCCESS: Rendered Video ${index} (${(stat.size / 1024 / 1024).toFixed(1)} MB) to:`);
  console.log(`   ${videoMp4Path}\n`);

  return { slug, videoMp4Path, totalFrames, size: stat.size };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const planOnly = args.includes('--plan-only');
  const skipRender = args.includes('--skip-render');
  const nonFlagArgs = args.filter((a) => !a.startsWith('--'));

  const vids = parseHayDepVideos();

  let targetVideos = [];
  if (nonFlagArgs.length === 0) {
    targetVideos = vids;
  } else if (nonFlagArgs.length === 1) {
    const rawArg = nonFlagArgs[0].trim();
    const num = parseInt(rawArg, 10);
    if (!isNaN(num) && String(num) === rawArg) {
      const found = vids.find((x) => x.index === num);
      if (found) targetVideos = [found];
    } else {
      const cleaned = rawArg.toLowerCase().replace(/^video-?/i, '');
      const numFromCleaned = parseInt(cleaned, 10);
      let found = !isNaN(numFromCleaned) ? vids.find((x) => x.index === numFromCleaned) : null;
      if (!found) {
        found = vids.find((x) => {
          const s = deriveSlug(x.cleanContext);
          return s.includes(rawArg.toLowerCase());
        });
      }
      if (found) targetVideos = [found];
    }
  } else if (nonFlagArgs.length >= 2) {
    const fromIndex = parseInt(nonFlagArgs[0], 10);
    const toIndex = parseInt(nonFlagArgs[1], 10);
    targetVideos = vids.filter((x) => x.index >= fromIndex && x.index <= toIndex);
  }

  if (targetVideos.length === 0) {
    console.error(`No matching videos found for arguments: ${args.join(' ')}`);
    process.exit(1);
  }

  console.log(
    `Starting Batch Engine (${planOnly ? 'PLAN-ONLY' : (skipRender ? 'ASSETS & SPEC ONLY (SKIP RENDER)' : 'FULL PRODUCTION')}${force ? ', FORCE OVERWRITE' : ''}) for ${targetVideos.length} video(s)...`,
  );

  (async () => {
    for (const v of targetVideos) {
      try {
        await processVideo(v, { force, planOnly, skipRender });
      } catch (err) {
        console.error(`❌ Error processing Video ${v.index}:`, err.message || err);
        if (!planOnly) {
          throw err;
        }
      }
    }
    console.log(`\n🏆 ALL REQUESTED VIDEOS PROCESSED!`);
  })();
}
