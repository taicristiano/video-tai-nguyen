/**
 * scripts/materialize-production-assets.mjs
 *
 * Generic Production Asset Materializer for HAY & ĐẸP.
 * Copies Human-approved image assets byte-for-byte into the canonical public path:
 *   public/assets/human-insight/final/<slug>/shot-XX.jpg
 *
 * Enforces:
 *   1. Strict Human QA Gate (all shots must be PASS_HUMAN_QA)
 *   2. Source asset existence & SHA-256 validation
 *   3. Zero recompression / zero pixel editing (exact byte copy)
 *   4. Post-copy SHA-256 integrity verification
 *
 * Usage:
 *   node scripts/materialize-production-assets.mjs --slug=<slug>
 *   node scripts/materialize-production-assets.mjs --slug=<slug> --manifest=<path>
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export function computeSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    if (arg.startsWith('--slug=')) {
      options.slug = arg.slice('--slug='.length).trim();
    } else if (arg.startsWith('--manifest=')) {
      options.manifestPath = arg.slice('--manifest='.length).trim();
    } else if (arg.startsWith('--root-dir=')) {
      options.rootDir = arg.slice('--root-dir='.length).trim();
    }
  }
  return options;
}

/**
 * Materializes approved image assets for a given slug.
 *
 * @param {object} options
 * @param {string} options.slug
 * @param {string} [options.manifestPath]
 * @param {string} [options.rootDir=ROOT]
 * @returns {Promise<{ slug: string, count: number, assets: Array }>}
 */
export async function materializeProductionAssets(options = {}) {
  const rootDir = options.rootDir || ROOT;
  const slug = options.slug;
  if (!slug && !options.manifestPath) {
    throw new Error('Missing required input: specify --slug=<slug> or --manifest=<path>');
  }

  const manifestPath = options.manifestPath
    ? path.resolve(options.manifestPath)
    : path.join(rootDir, 'videos', slug, 'approved-image-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Canonical approved manifest not found at: ${manifestPath}`);
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const resolvedSlug = slug || manifest.slug;
  if (!resolvedSlug) {
    throw new Error(`Unable to resolve slug from manifest at: ${manifestPath}`);
  }

  const shots = manifest.shots || [];
  if (!Array.isArray(shots) || shots.length === 0) {
    throw new Error(`Manifest has 0 shots: ${manifestPath}`);
  }

  // 1. Strict Human QA Gate: Inspect all shots
  const unapproved = [];
  const seenIds = new Set();

  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const shotId = s.shotId || `shot-${String(i + 1).padStart(2, '0')}`;

    if (seenIds.has(shotId)) {
      throw new Error(`Duplicate shotId detected in approved manifest: "${shotId}"`);
    }
    seenIds.add(shotId);

    const state = s.qa || s.candidateState || s.humanQaVerdict || s.qaStatus;
    const isApproved = state === 'PASS_HUMAN_QA' || state === 'PASS' || state === 'APPROVED_PASS';
    if (!isApproved) {
      unapproved.push({ shotId, state: state || 'MISSING_QA' });
    }
  }

  if (unapproved.length > 0) {
    const details = unapproved.map((u) => `${u.shotId} (${u.state})`).join(', ');
    throw new Error(`Materialization BLOCKED by Human QA Gate. Non-PASS assets: ${details}`);
  }

  // 2. Prepare canonical destination directory: public/assets/human-insight/final/<slug>/
  const canonicalDestDir = path.join(rootDir, 'public', 'assets', 'human-insight', 'final', resolvedSlug);
  fs.mkdirSync(canonicalDestDir, { recursive: true });

  const materializedAssets = [];
  let manifestUpdated = false;

  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const shotId = s.shotId || `shot-${String(i + 1).padStart(2, '0')}`;

    // Locate source file
    let sourceFilePath = null;
    if (s.sourceAssetPath) {
      const p1 = path.isAbsolute(s.sourceAssetPath)
        ? s.sourceAssetPath
        : path.join(rootDir, 'public', s.sourceAssetPath);
      const p2 = path.isAbsolute(s.sourceAssetPath)
        ? s.sourceAssetPath
        : path.join(rootDir, s.sourceAssetPath);
      if (fs.existsSync(p1)) {
        sourceFilePath = p1;
      } else if (fs.existsSync(p2)) {
        sourceFilePath = p2;
      }
    }

    if (!sourceFilePath && s.reviewAssetPath) {
      const pReview = path.isAbsolute(s.reviewAssetPath)
        ? s.reviewAssetPath
        : path.join(rootDir, s.reviewAssetPath);
      if (fs.existsSync(pReview)) {
        sourceFilePath = pReview;
      }
    }

    if (!sourceFilePath) {
      throw new Error(`Source asset for ${shotId} not found on disk: "${s.sourceAssetPath || s.reviewAssetPath}"`);
    }

    // Verify source SHA-256
    const sourceSha256 = computeSha256(sourceFilePath);
    if (s.sha256 && s.sha256 !== sourceSha256) {
      throw new Error(`SHA-256 mismatch for source asset ${shotId}: expected ${s.sha256}, calculated ${sourceSha256}`);
    }

    // Target file path
    const ext = path.extname(sourceFilePath) || '.jpg';
    const destFileName = `${shotId}${ext}`;
    const destFilePath = path.join(canonicalDestDir, destFileName);

    // If destination already exists with exact matching SHA-256, skip redundant copy
    let destSha256 = null;
    if (fs.existsSync(destFilePath)) {
      try {
        destSha256 = computeSha256(destFilePath);
      } catch (_) {
        destSha256 = null;
      }
    }

    if (destSha256 !== sourceSha256) {
      // Exact raw byte copy (no recompression, no resize, no edit)
      fs.copyFileSync(sourceFilePath, destFilePath);
      destSha256 = computeSha256(destFilePath);
      if (destSha256 !== sourceSha256) {
        throw new Error(`Byte copy integrity failure for ${shotId}: dest SHA-256 (${destSha256}) !== source SHA-256 (${sourceSha256})`);
      }
    }

    const canonicalImageSrc = `assets/human-insight/final/${resolvedSlug}/${destFileName}`;

    materializedAssets.push({
      shotId,
      sourceFilePath: path.relative(rootDir, sourceFilePath).replace(/\\/g, '/'),
      canonicalFilePath: path.relative(rootDir, destFilePath).replace(/\\/g, '/'),
      canonicalImageSrc,
      sha256: destSha256,
    });

    // Update manifest entry if needed
    if (!s.sha256 || s.sha256 !== destSha256 || s.canonicalImageSrc !== canonicalImageSrc) {
      s.sha256 = destSha256;
      s.canonicalImageSrc = canonicalImageSrc;
      manifestUpdated = true;
    }
  }

  // If manifest updated with sha256 or canonicalImageSrc, persist updates
  if (manifestUpdated) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  }

  console.log(`✅ Materialized ${materializedAssets.length} canonical production assets for slug: ${resolvedSlug}`);
  console.log(`   Destination: public/assets/human-insight/final/${resolvedSlug}/`);

  return {
    slug: resolvedSlug,
    canonicalDestDir,
    count: materializedAssets.length,
    assets: materializedAssets,
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseCliArgs();
  materializeProductionAssets(options).catch((err) => {
    console.error('❌ Asset materialization failed:', err.message);
    process.exit(1);
  });
}
