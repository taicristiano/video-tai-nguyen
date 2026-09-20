import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';
import {
  readManifest,
  selectExistingAsset,
  canReuseForHayDep,
  effectiveTier,
  ASSET_TIERS,
} from './human-insight-image.mjs';
import { deriveSlug } from '../src/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const videoIndexArg = parseInt(process.argv[2] || '1', 10);

const videos = parseHayDepVideos();
const video = videos.find((v) => v.index === videoIndexArg);

if (!video) {
  console.error(`Error: Video ${videoIndexArg} not found!`);
  process.exit(1);
}

const slug = deriveSlug(video.cleanContext);
const timelinePath = path.join(ROOT, 'public', slug, 'timeline.json');

let segments = [];
if (fs.existsSync(timelinePath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
    segments = raw.segments || [];
  } catch (e) {
    // fallback
  }
}

if (!segments.length) {
  const paras = video.voiceScriptText
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\r/g, '').trim())
    .filter(Boolean);

  let t = 0;
  segments = paras.map((text) => {
    const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
    const seg = { start: t, end: t + duration, text };
    t += duration;
    return seg;
  });
}

const { plan } = buildStoryPlan(video, segments);
const manifest = readManifest();

console.log('='.repeat(100));
console.log(`ASSET DECISION DRY RUN — Video ${String(video.index).padStart(3, '0')}: "${video.title}"`);
console.log(`Mode: ${plan.contentMode} | Cast: ${plan.castId || 'none'} | World: ${plan.worldId} | Beats: ${plan.beats.length}`);
console.log('='.repeat(100));

const rows = [];
let hasUnsafeReuse = false;

for (let i = 0; i < plan.beats.length; i++) {
  const beat = plan.beats[i];
  const sceneType = beat.segmentIndex === 0 ? 'hook' : beat.segmentIndex === segments.length - 1 ? 'ending' : 'body';
  const scene = {
    text: beat.voiceClause,
    type: sceneType,
    visual: beat.visualIntent,
    castId: beat.castId,
    worldId: beat.worldId,
    storyRole: beat.storyRole,
    shotScale: beat.shotScale,
    composition: beat.composition,
    character: 'neutral',
  };

  const best = selectExistingAsset(manifest, scene);
  const canReuse = canReuseForHayDep(best, scene);
  const tier = best ? effectiveTier(best.asset) : 'none';

  let decision = 'GENERATE';
  let reason = '';

  if (beat.assetStrategy === 'reuse-canonical') {
    decision = 'REUSE (CANONICAL)';
    reason = 'Beat requests reuse of canonical established character';
  } else if (canReuse) {
    decision = 'REUSE';
    reason = `Matched CORE/COMPATIBLE asset with score ${best.score}`;
  } else {
    decision = 'GENERATE';
    if (!best) {
      reason = 'No manifest assets found';
    } else if (tier === ASSET_TIERS.LEGACY || tier === ASSET_TIERS.REJECT) {
      reason = `Legacy/unclassified tier (${best.asset.tier || 'undefined'}) requires generation`;
    } else if (scene.castId && (!best.asset.castId || best.asset.castId !== scene.castId)) {
      reason = `Cast mismatch: desired "${scene.castId}", asset has "${best.asset.castId || 'none'}"`;
    } else if (scene.storyRole && best.asset.storyRole && best.asset.storyRole !== scene.storyRole) {
      reason = `Role mismatch: desired "${scene.storyRole}", asset has "${best.asset.storyRole}"`;
    } else {
      reason = `Score ${best.score} insufficient or unverified`;
    }
  }

  // Safety check: unclassified or legacy assets must NEVER be marked REUSE
  if (decision === 'REUSE' && (tier === ASSET_TIERS.LEGACY || tier === ASSET_TIERS.REJECT)) {
    hasUnsafeReuse = true;
  }

  rows.push({
    beat: beat.id,
    role: beat.storyRole,
    'desired cast': beat.castId || 'none',
    'best asset': best?.asset?.id || 'none',
    'best tier': best?.asset?.tier || 'undefined (LEGACY)',
    'best cast': best?.asset?.castId || 'none',
    decision,
    reason,
  });
}

console.table(rows);

const generateCount = rows.filter((r) => r.decision === 'GENERATE').length;
const canonicalReuseCount = rows.filter((r) => r.decision === 'REUSE (CANONICAL)').length;
const manifestReuseCount = rows.filter((r) => r.decision === 'REUSE').length;

console.log('\nSummary:');
console.log(`  Total beats:             ${rows.length}`);
console.log(`  GENERATE decisions:      ${generateCount}`);
console.log(`  CANONICAL REUSE:         ${canonicalReuseCount}`);
console.log(`  MANIFEST REUSE:          ${manifestReuseCount}`);
console.log(`  Unsafe legacy reuse:     ${hasUnsafeReuse ? '❌ YES (FAIL)' : '✅ NO (SAFE)'}`);

if (hasUnsafeReuse) {
  console.error('\n❌ FAIL: Unaudited legacy asset was accepted for reuse in strict mode!');
  process.exit(1);
}

if (video.index === 1 && manifestReuseCount > 0) {
  console.error('\n❌ FAIL: Video 001 manifest has 0 audited assets, so manifest reuse count must be 0!');
  process.exit(1);
}

console.log('\n✅ PASS: Asset decision gate correctly forces GENERATE on unaudited legacy assets.');
