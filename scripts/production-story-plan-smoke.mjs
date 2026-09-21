#!/usr/bin/env node
/**
 * scripts/production-story-plan-smoke.mjs
 *
 * Dedicated production dry-run entrypoint that exercises the REAL batch engine
 * path up to story planning with ZERO network calls, ZERO Cloudflare calls,
 * and ZERO video renders.
 *
 * Usage:
 *   node scripts/production-story-plan-smoke.mjs <videoKeyOrIndex>
 * Examples:
 *   node scripts/production-story-plan-smoke.mjs video005
 *   node scripts/production-story-plan-smoke.mjs 005
 *   node scripts/production-story-plan-smoke.mjs 13
 */

import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { processVideo } from './batch-engine.mjs';
import { deriveSlug } from '../src/slug.js';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/production-story-plan-smoke.mjs <videoKeyOrIndex>');
    process.exit(1);
  }

  const vids = parseHayDepVideos();
  const rawArg = arg.trim();
  const num = parseInt(rawArg, 10);

  let targetVideo = null;
  if (!isNaN(num) && String(num) === rawArg) {
    targetVideo = vids.find((x) => x.index === num);
  } else {
    const cleaned = rawArg.toLowerCase().replace(/^video-?/i, '');
    const numFromCleaned = parseInt(cleaned, 10);
    if (!isNaN(numFromCleaned)) {
      targetVideo = vids.find((x) => x.index === numFromCleaned);
    } else {
      targetVideo = vids.find((x) => {
        const s = deriveSlug(x.cleanContext);
        return s.includes(rawArg.toLowerCase());
      });
    }
  }

  if (!targetVideo) {
    console.error(`❌ Video not found in catalog for identifier: "${arg}"`);
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`SMOKE RUN: Video ${targetVideo.index} ("${targetVideo.title}")`);
  console.log(`======================================================\n`);

  try {
    const result = await processVideo(targetVideo, { force: false, planOnly: true });
    console.log(`Smoke plan generated successfully for ${result.slug}.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Plan generation failed:`, err.message || err);
    process.exit(1);
  }
}

main();
