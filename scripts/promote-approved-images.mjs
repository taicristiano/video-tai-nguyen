/**
 * scripts/promote-approved-images.mjs
 *
 * Generic Human QA Promotion Pipeline for HAY & ĐẸP.
 * Enforces the core pipeline principle:
 *   "File exists != Human approved"
 *
 * Strictly requires actual Human QA review verdicts from a review manifest.
 * NEVER auto-invents PASS_HUMAN_QA just because a candidate image exists.
 *
 * Promotion BLOCKED if ANY shot is:
 *   - PENDING or PENDING_*
 *   - FAIL or FAIL_HUMAN_QA
 *   - REJECTED
 *   - qa === null / undefined
 *   - missing from review manifest
 *
 * Usage:
 *   node scripts/promote-approved-images.mjs --slug=<slug>
 *   node scripts/promote-approved-images.mjs --slug=<slug> --review-manifest=<path>
 *   node scripts/promote-approved-images.mjs --slug=<slug> --candidate-dir=<path> --story-plan=<path>
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
    } else if (arg.startsWith('--review-manifest=')) {
      options.reviewManifestPath = arg.slice('--review-manifest='.length).trim();
    } else if (arg.startsWith('--candidate-dir=')) {
      options.candidateDir = arg.slice('--candidate-dir='.length).trim();
    } else if (arg.startsWith('--story-plan=')) {
      options.storyPlanPath = arg.slice('--story-plan='.length).trim();
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.slice('--output='.length).trim();
    }
  }
  return options;
}

/**
 * Promotes Human-approved review candidates into canonical approved-image-manifest.json.
 *
 * @param {object} options
 * @param {string} options.slug
 * @param {string} [options.reviewManifestPath]
 * @param {string} [options.candidateDir]
 * @param {string} [options.storyPlanPath]
 * @param {string} [options.outputPath]
 * @param {string} [options.rootDir=ROOT]
 * @returns {Promise<{ manifest: object, outputPath: string }>}
 */
export async function promoteApprovedImages(options = {}) {
  const rootDir = options.rootDir || ROOT;
  const slug = options.slug;
  if (!slug) {
    throw new Error('Missing required argument: --slug=<slug>');
  }

  // 1. Resolve Story Plan (determines required beats/shots)
  const storyPlanPath = options.storyPlanPath || path.join(rootDir, 'videos', slug, 'story-plan.json');
  let beats = [];
  let title = 'HAY & ĐẸP.';
  if (fs.existsSync(storyPlanPath)) {
    const sp = JSON.parse(fs.readFileSync(storyPlanPath, 'utf8'));
    beats = sp.beats || sp.shots || [];
    title = sp.title || title;
  }

  // 2. Resolve Human QA Review Manifest
  let reviewManifestPath = options.reviewManifestPath ? path.resolve(options.reviewManifestPath) : null;
  if (reviewManifestPath) {
    const basename = path.basename(reviewManifestPath);
    if (basename === 'approved-image-manifest.json') {
      throw new Error(`Circular SSOT error: "approved-image-manifest.json" cannot be used as Human review manifest input. A verified review manifest is required.`);
    }
  } else {
    const reviewCandidates = [
      path.join(rootDir, 'videos', slug, 'review-manifest.json'),
      path.join(rootDir, 'scratch', slug, 'review-manifest.json'),
    ];
    for (const c of reviewCandidates) {
      if (fs.existsSync(c)) {
        reviewManifestPath = c;
        break;
      }
    }
  }

  if (!reviewManifestPath || !fs.existsSync(reviewManifestPath)) {
    throw new Error(`Human QA Review Manifest not found for slug "${slug}". A verified review manifest is required for promotion.`);
  }

  const reviewRaw = fs.readFileSync(reviewManifestPath, 'utf8');
  const reviewManifest = JSON.parse(reviewRaw);

  // Enforce manifestType discriminator to prevent circular SSOT even if files are renamed
  if (reviewManifest.manifestType !== 'HUMAN_QA_REVIEW_V1') {
    throw new Error(
      `Invalid review manifest type in "${reviewManifestPath}": expected "HUMAN_QA_REVIEW_V1", got "${reviewManifest.manifestType}". ` +
      `Promotion accepts ONLY verified Human QA review manifests with manifestType="HUMAN_QA_REVIEW_V1".`
    );
  }

  const reviewShots = reviewManifest.shots || [];
  const reviewMap = new Map();
  for (const rs of reviewShots) {
    reviewMap.set(rs.shotId, rs);
  }

  const totalShots = beats.length > 0 ? beats.length : reviewShots.length;
  if (totalShots === 0) {
    throw new Error(`Cannot promote images: 0 shots found in story plan or review manifest for slug "${slug}"`);
  }

  // 3. Strict Human QA Gate: Validate every required shot has actual PASS_HUMAN_QA verdict
  // AND exact reviewedAssetPath + reviewedAssetSha256 matching the file on disk.
  const unapprovedShots = [];
  const candidateFilesToPromote = [];

  for (let i = 0; i < totalShots; i++) {
    const beat = beats[i] || {};
    const shotId =
      beat.shotId ||
      (beat.id ? beat.id.replace('beat-', 'shot-') : `shot-${String(i + 1).padStart(2, '0')}`);

    const rShot = reviewMap.get(shotId);
    if (!rShot) {
      unapprovedShots.push({ shotId, reason: 'Missing in Human QA review manifest' });
      continue;
    }

    // Inspect actual Human QA verdict - strictly require humanQaVerdict === 'PASS_HUMAN_QA'
    if (!rShot.humanQaVerdict) {
      unapprovedShots.push({ shotId, reason: 'Missing or null humanQaVerdict in Human QA review manifest' });
      continue;
    }

    if (rShot.humanQaVerdict !== 'PASS_HUMAN_QA') {
      unapprovedShots.push({ shotId, reason: `Unapproved humanQaVerdict: "${rShot.humanQaVerdict}"` });
      continue;
    }

    // Enforce exact reviewedAssetPath binding (no fallback guessing)
    if (!rShot.reviewedAssetPath || typeof rShot.reviewedAssetPath !== 'string' || !rShot.reviewedAssetPath.trim()) {
      unapprovedShots.push({ shotId, reason: 'Missing or empty reviewedAssetPath in Human QA review manifest' });
      continue;
    }
    const reviewedAssetPath = rShot.reviewedAssetPath.trim();

    // Enforce exact reviewedAssetSha256 binding (no unhashed approvals, no sha256 fallback)
    if (!rShot.reviewedAssetSha256 || typeof rShot.reviewedAssetSha256 !== 'string' || !rShot.reviewedAssetSha256.trim()) {
      unapprovedShots.push({ shotId, reason: 'Missing or empty reviewedAssetSha256 in Human QA review manifest' });
      continue;
    }
    const reviewedAssetSha256 = rShot.reviewedAssetSha256.trim();

    // Locate the EXACT reviewed image on disk
    const candidateFile = path.isAbsolute(reviewedAssetPath)
      ? reviewedAssetPath
      : path.resolve(rootDir, reviewedAssetPath);

    if (!fs.existsSync(candidateFile)) {
      unapprovedShots.push({ shotId, reason: `Reviewed asset file not found on disk at exact path: "${reviewedAssetPath}"` });
      continue;
    }

    // Verify SHA-256 matches exact approved hash
    const actualSha256 = computeSha256(candidateFile);
    if (actualSha256 !== reviewedAssetSha256) {
      unapprovedShots.push({
        shotId,
        reason: `SHA-256 mismatch for ${shotId}: review recorded ${reviewedAssetSha256}, actual file has ${actualSha256}`,
      });
      continue;
    }

    candidateFilesToPromote.push({
      shotId,
      beat,
      rShot,
      candidateFile,
      reviewedAssetPath,
      reviewedAssetSha256: actualSha256,
    });
  }

  // If any shot is unapproved, missing, or mismatched, HALT PROMOTION IMMEDIATELY
  if (unapprovedShots.length > 0) {
    const details = unapprovedShots.map((u) => `${u.shotId} (${u.reason})`).join('; ');
    throw new Error(`Human QA Promotion BLOCKED for "${slug}":\n  ${details}`);
  }

  // 4. Assemble canonical approved manifest
  const approvedShots = [];
  for (const item of candidateFilesToPromote) {
    const { shotId, beat, rShot, candidateFile, reviewedAssetSha256 } = item;
    const ext = path.extname(candidateFile) || '.jpg';
    const canonicalImageSrc = `assets/human-insight/final/${slug}/${shotId}${ext}`;
    const relSourcePath = path.relative(path.join(rootDir, 'public'), candidateFile).replace(/\\/g, '/');

    approvedShots.push({
      shotId,
      qa: 'PASS_HUMAN_QA',
      candidateState: 'PASS_HUMAN_QA',
      humanQaVerdict: 'PASS_HUMAN_QA',
      reviewedAssetPath: path.relative(rootDir, candidateFile).replace(/\\/g, '/'),
      reviewedAssetSha256,
      sourceAssetPath: relSourcePath.startsWith('..')
        ? path.relative(rootDir, candidateFile).replace(/\\/g, '/')
        : relSourcePath,
      canonicalImageSrc,
      canonicalSha256: reviewedAssetSha256,
      sha256: reviewedAssetSha256,
      selectedAttempt: rShot.selectedAttempt || rShot.attempt || 1,
      humanQaSource: path.relative(rootDir, reviewManifestPath).replace(/\\/g, '/'),
      voiceClause: beat.voiceClause || beat.audioText || rShot.voiceClause || '',
      visualMode: beat.visualMode || rShot.visualMode || 'INTERACTION_MEDIUM',
      composition: beat.composition || rShot.composition || 'portrait-focus',
      shotScale: beat.shotScale || beat.scale || rShot.shotScale || 'medium',
      motionPreset: beat.motionPreset || rShot.motionPreset || 'still-breathe',
      hasInsightCard: Boolean(beat.hasInsightCard),
    });
  }

  const approvedManifest = {
    manifestType: 'APPROVED_IMAGE_MANIFEST_V1',
    title,
    slug,
    totalShots: approvedShots.length,
    qaSummary: {
      PASS_HUMAN_QA: approvedShots.length,
      FAIL_HUMAN_QA: 0,
      PENDING: 0,
    },
    shots: approvedShots,
  };

  const outputPath = options.outputPath || path.join(rootDir, 'videos', slug, 'approved-image-manifest.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(approvedManifest, null, 2), 'utf8');

  console.log(`✅ Promoted ${approvedShots.length} Human-approved assets to: ${outputPath}`);
  return { manifest: approvedManifest, outputPath };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseCliArgs();
  promoteApprovedImages(options).catch((err) => {
    console.error('❌ Promotion failed:', err.message);
    process.exit(1);
  });
}
