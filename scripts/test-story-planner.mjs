import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';
import { deriveSlug } from '../src/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const wanted = [1, 5, 7, 13, 28];
const videos = parseHayDepVideos();

const results = [];

for (const index of wanted) {
  const video = videos.find((v) => v.index === index);
  if (!video) {
    console.error(`Video ${index} not found!`);
    continue;
  }

  // If real timeline.json exists, use it; otherwise fallback to synthetic timing
  let segments = null;
  try {
    const slug = deriveSlug(video.cleanContext);
    const timelinePath = path.join(ROOT, 'public', slug, 'timeline.json');
    if (fs.existsSync(timelinePath)) {
      const data = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
      if (Array.isArray(data.segments) && data.segments.length > 0) {
        segments = data.segments;
      }
    }
  } catch {}

  if (!segments) {
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

  const { plan, validation } = buildStoryPlan(video, segments);

  results.push({
    index,
    title: video.title,
    mode: plan.contentMode,
    cast: plan.castId ?? null,
    world: plan.worldId,
    recurringCast: plan.needsRecurringCast,
    beatCount: plan.beats.length,
    roles: plan.beats.map((b) => b.storyRole),
    first3Intents: plan.beats.slice(0, 3).map((b) => b.visualIntent),
    validation,
    fullPlan: plan,
  });
}

console.log('='.repeat(100));
console.log('STORY PLANNER GENERALIZATION RESULTS');
console.log('='.repeat(100));

for (const r of results) {
  console.log(`\n▶ VIDEO ${String(r.index).padStart(3, '0')}: "${r.title}"`);
  console.log(`  Mode:        ${r.mode}`);
  console.log(`  Cast:        ${r.cast || 'none'} (recurring: ${r.recurringCast})`);
  console.log(`  World:       ${r.world}`);
  console.log(`  Beats:       ${r.beatCount}`);
  console.log(`  Story roles: ${r.roles.join(' -> ')}`);
  console.log(`  Valid:       ${r.validation.valid ? '✅ VALID' : '❌ INVALID'}`);
  if (r.validation.errors.length > 0) {
    console.log(`  Errors:      ${r.validation.errors.join(', ')}`);
  }
  if (r.validation.warnings.length > 0) {
    console.log(`  Warnings:    ${r.validation.warnings.join(', ')}`);
  }
  console.log('  First 3 visual intents:');
  r.first3Intents.forEach((intent, idx) => {
    console.log(`    [${idx + 1}] (${r.roles[idx]}): ${intent}`);
  });
}

console.log('\n' + '='.repeat(100));
console.log('OUTPUT SUMMARY TABLE');
console.log('='.repeat(100));
console.table(
  results.map((r) => ({
    Video: String(r.index).padStart(3, '0'),
    Mode: r.mode,
    Cast: r.cast || 'none',
    World: r.world,
    'Beat count': r.beatCount,
    'Story roles': r.roles.slice(0, 4).join(', ') + (r.roles.length > 4 ? '...' : ''),
    Validation: r.validation.valid ? 'PASS' : 'FAIL',
  }))
);

// Write full plans for 005 and 013 to scratch directory or inspect
const outDir = path.join(ROOT, 'tmp-story-plans');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'plans-summary.json'),
  JSON.stringify(results, null, 2),
  'utf-8'
);
