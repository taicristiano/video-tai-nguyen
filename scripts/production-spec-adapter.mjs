/**
 * scripts/production-spec-adapter.mjs
 *
 * Generic Production Spec Adapter & Validator.
 * Handles loading, normalizing, and validating ProductionRenderSpec objects
 * for any HAY & ĐẸP. video without hardcoded video assumptions.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  CINEMATIC_LIGHT_DEPENDENCIES,
  resolveEffectiveTemplateConfig,
  resolveTemplateDependencies,
} from '../src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export { resolveTemplateDependencies, resolveEffectiveTemplateConfig, CINEMATIC_LIGHT_DEPENDENCIES };

/**
 * Validates a ProductionRenderSpec against technical integrity criteria.
 *
 * @param {object} spec - Production render spec object
 * @param {object} [options] - Validation options
 * @param {boolean} [options.checkAssets=true] - Whether to verify file existence in public/
 * @param {string} [options.rootDir=ROOT] - Root directory for resolving paths
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProductionSpec(spec, options = {}) {
  const errors = [];
  const checkAssets = options.checkAssets ?? true;
  const rootDir = options.rootDir || ROOT;

  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: ['Spec must be a valid non-null object'] };
  }

  // Slug
  if (!spec.slug || typeof spec.slug !== 'string' || spec.slug.trim() === '') {
    errors.push('Missing or invalid "slug"');
  }

  // Title
  if (!spec.title || typeof spec.title !== 'string' || spec.title.trim() === '') {
    errors.push('Missing or invalid "title"');
  }

  // 30 fps contract
  if (spec.fps !== 30) {
    errors.push(`HAY & ĐẸP. production requires exactly 30 fps, got: ${spec.fps}`);
  }

  // Brand contract
  if (spec.brand && spec.brand !== CINEMATIC_LIGHT_DEPENDENCIES.brand) {
    errors.push(`Invalid brand: expected "${CINEMATIC_LIGHT_DEPENDENCIES.brand}", got: "${spec.brand}"`);
  }

  if (spec.watermarkSrc) {
    const cleanWatermark = spec.watermarkSrc.replace(/\\/g, '/').toLowerCase();
    if (cleanWatermark === 'watermark.png' || cleanWatermark.endsWith('/watermark.png') || cleanWatermark.includes('nep')) {
      errors.push(
        `Legacy NẾP watermark asset "${spec.watermarkSrc}" rejected for brand "${CINEMATIC_LIGHT_DEPENDENCIES.brand}". ` +
        `Use canonical HAY & ĐẸP. watermark ("${CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultWatermark}" or "${CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultOutroBrandMark}").`
      );
    }
  }

  if (!Array.isArray(spec.shots) || spec.shots.length === 0) {
    errors.push('Spec must contain at least one shot in "shots"');
    return { valid: false, errors };
  }

  // Static runtime assets validation via shared template dependency contract
  if (checkAssets) {
    const resolvedDeps = resolveTemplateDependencies(spec);
    for (const dep of resolvedDeps) {
      const depPath = path.isAbsolute(dep) ? dep : path.join(rootDir, 'public', dep);
      if (!fs.existsSync(depPath)) {
        const cleanDep = dep.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/');
        const cleanWatermark = spec.watermarkSrc ? spec.watermarkSrc.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/') : null;
        const cleanOutro = spec.outro?.artworkSrc ? spec.outro.artworkSrc.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/') : null;
        const cleanAudio = spec.audioSrc ? spec.audioSrc.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/') : null;
        const cleanTimeline = spec.timelineSrc ? spec.timelineSrc.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/') : null;

        if (cleanWatermark && cleanDep === cleanWatermark) {
          errors.push(`Watermark asset not found at: ${depPath} (Missing template static dependency: "${dep}")`);
        } else if (cleanOutro && cleanDep === cleanOutro) {
          errors.push(`Outro artwork asset not found at: ${depPath} (Missing template static dependency: "${dep}")`);
        } else if (cleanAudio && cleanDep === cleanAudio) {
          errors.push(`Audio asset not found at: ${depPath} (Missing template static dependency: "${dep}")`);
        } else if (cleanTimeline && cleanDep === cleanTimeline) {
          errors.push(`Timeline asset not found at: ${depPath} (Missing template static dependency: "${dep}")`);
        } else {
          errors.push(`Missing template static dependency: "${dep}" (expected at: ${depPath})`);
        }
      }
    }
  }

  // Shot boundaries and asset verification
  let expectedNextStart = 0;

  for (let i = 0; i < spec.shots.length; i++) {
    const shot = spec.shots[i];
    const shotPrefix = `Shot[${i}] (ID: ${shot.shotId || 'unknown'})`;

    if (!shot.shotId || typeof shot.shotId !== 'string') {
      errors.push(`${shotPrefix} is missing "shotId"`);
    }

    if (typeof shot.startFrame !== 'number' || shot.startFrame < 0) {
      errors.push(`${shotPrefix} invalid startFrame: ${shot.startFrame}`);
    }

    if (typeof shot.endFrame !== 'number' || shot.endFrame <= shot.startFrame) {
      errors.push(`${shotPrefix} invalid endFrame: ${shot.endFrame} (must be > startFrame ${shot.startFrame})`);
    }

    const calculatedDuration = shot.endFrame - shot.startFrame;
    if (shot.durationFrames !== undefined && shot.durationFrames !== calculatedDuration) {
      errors.push(`${shotPrefix} durationFrames (${shot.durationFrames}) does not match endFrame - startFrame (${calculatedDuration})`);
    }

    if (shot.startFrame !== expectedNextStart) {
      errors.push(`${shotPrefix} has frame gap/overlap: expected start ${expectedNextStart}, got ${shot.startFrame}`);
    }
    expectedNextStart = shot.endFrame;

    if (!shot.imageSrc || typeof shot.imageSrc !== 'string') {
      errors.push(`${shotPrefix} is missing "imageSrc"`);
    } else if (checkAssets) {
      const imgPath = path.isAbsolute(shot.imageSrc)
        ? shot.imageSrc
        : path.join(rootDir, 'public', shot.imageSrc);
      if (!fs.existsSync(imgPath)) {
        errors.push(`${shotPrefix} image asset not found at: ${imgPath}`);
      }
    }
  }

  // Total frames coverage check
  const outroEnabled = Boolean(spec.outro?.enabled);
  const outroDuration = outroEnabled ? (spec.outro.durationFrames ?? 60) : 0;
  const expectedTotalFrames = expectedNextStart + outroDuration;

  if (spec.totalFrames !== expectedTotalFrames) {
    errors.push(
      `Spec totalFrames (${spec.totalFrames}) does not match shot sequence coverage + outro (${expectedTotalFrames})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Loads and validates a ProductionRenderSpec from a slug or file path.
 *
 * @param {string} slugOrPath
 * @param {object} [options]
 * @returns {object} validated production render spec
 */
export function loadProductionSpec(slugOrPath, options = {}) {
  const rootDir = options.rootDir || ROOT;
  let specPath = null;

  if (fs.existsSync(slugOrPath)) {
    specPath = path.resolve(slugOrPath);
  } else {
    // Try videos/<slugOrPath>/production-render-spec.json
    const candidatePath = path.join(rootDir, 'videos', slugOrPath, 'production-render-spec.json');
    if (fs.existsSync(candidatePath)) {
      specPath = candidatePath;
    }
  }

  if (!specPath) {
    throw new Error(`Production render spec not found for: ${slugOrPath}`);
  }

  const raw = fs.readFileSync(specPath, 'utf8');
  const spec = JSON.parse(raw);

  if (!spec.watermarkSrc && (!spec.brand || spec.brand === CINEMATIC_LIGHT_DEPENDENCIES.brand)) {
    spec.watermarkSrc = CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultWatermark;
  }

  const validation = validateProductionSpec(spec, {
    ...options,
    rootDir,
  });

  if (!validation.valid) {
    throw new Error(`Invalid production render spec at ${specPath}:\n  - ${validation.errors.join('\n  - ')}`);
  }

  return spec;
}

/**
 * Cross-validates a production render spec against canonical story plan and human-approved image manifest.
 *
 * @param {object} spec
 * @param {object} context
 * @param {object} context.storyPlan
 * @param {object} [context.manifest]
 * @param {string} [context.rootDir=ROOT]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function crossValidateSpecAgainstSSOT(spec, { storyPlan, manifest, rootDir = ROOT } = {}) {
  const errors = [];

  if (!spec || !Array.isArray(spec.shots)) {
    return { valid: false, errors: ['Spec must have a shots array'] };
  }

  const beats = storyPlan?.beats || storyPlan?.shots || [];
  if (beats.length === 0) {
    errors.push('Canonical story plan contains no beats/shots for cross-validation');
    return { valid: false, errors };
  }

  if (spec.shots.length !== beats.length) {
    errors.push(`Shot count mismatch: spec has ${spec.shots.length} shots, canonical story plan has ${beats.length} beats`);
  }

  const manifestShots = manifest?.shots || [];
  const manifestMap = new Map();
  for (const ms of manifestShots) {
    manifestMap.set(ms.shotId, ms);
  }

  const minLen = Math.min(spec.shots.length, beats.length);
  for (let i = 0; i < minLen; i++) {
    const specShot = spec.shots[i];
    const canonBeat = beats[i];
    const expectedShotId =
      canonBeat.shotId ||
      (canonBeat.id ? canonBeat.id.replace('beat-', 'shot-') : `shot-${String(i + 1).padStart(2, '0')}`);

    if (specShot.shotId !== expectedShotId) {
      errors.push(`Shot[${i}] ID drift: spec has "${specShot.shotId}", canonical has "${expectedShotId}"`);
    }

    if (specShot.startFrame !== canonBeat.startFrame) {
      errors.push(`Shot[${i}] (${specShot.shotId}) startFrame drift: spec=${specShot.startFrame}, canonical=${canonBeat.startFrame}`);
    }

    if (specShot.endFrame !== canonBeat.endFrame) {
      errors.push(`Shot[${i}] (${specShot.shotId}) endFrame drift: spec=${specShot.endFrame}, canonical=${canonBeat.endFrame}`);
    }

    if (canonBeat.visualMode && specShot.visualMode !== canonBeat.visualMode) {
      errors.push(`Shot[${i}] (${specShot.shotId}) visualMode drift: spec="${specShot.visualMode}", canonical="${canonBeat.visualMode}"`);
    }

    const canonScale = (canonBeat.shotScale || canonBeat.scale?.toLowerCase() || '').toLowerCase();
    const specScale = (specShot.shotScale || '').toLowerCase();
    if (canonScale && specScale && specScale !== canonScale) {
      errors.push(`Shot[${i}] (${specShot.shotId}) shotScale drift: spec="${specShot.shotScale}", canonical="${canonScale}"`);
    }

    if (canonBeat.composition && specShot.composition && specShot.composition !== canonBeat.composition) {
      errors.push(`Shot[${i}] (${specShot.shotId}) composition drift: spec="${specShot.composition}", canonical="${canonBeat.composition}"`);
    }

    if (canonBeat.motionPreset && specShot.motionPreset && specShot.motionPreset !== canonBeat.motionPreset) {
      errors.push(`Shot[${i}] (${specShot.shotId}) motionPreset drift: spec="${specShot.motionPreset}", canonical="${canonBeat.motionPreset}"`);
    }

    // Card flags validation
    const canonCard = Boolean(canonBeat.hasInsightCard);
    const specCard = Boolean(specShot.hasInsightCard);
    if (specCard !== canonCard) {
      errors.push(`Shot[${i}] (${specShot.shotId}) hasInsightCard drift: spec=${specCard}, canonical=${canonCard}`);
    }

    // Manifest validation
    if (manifestMap.size > 0) {
      const mShot = manifestMap.get(specShot.shotId);
      if (!mShot) {
        errors.push(`Shot[${i}] (${specShot.shotId}) not found in Human-approved manifest`);
      } else {
        const qaState = mShot.candidateState || mShot.humanQaVerdict || mShot.qaStatus || mShot.qa;
        const isApproved = qaState === 'PASS_HUMAN_QA' || qaState === 'PASS' || qaState === 'APPROVED_PASS';
        if (!isApproved) {
          errors.push(`Shot[${i}] (${specShot.shotId}) unapproved QA state in manifest: "${qaState}"`);
        }

        // Reject scratch and internal candidate paths in production specs
        if (
          specShot.imageSrc &&
          (specShot.imageSrc.includes('scratch/') ||
           specShot.imageSrc.includes('final-image-candidate/'))
        ) {
          errors.push(`Shot[${i}] (${specShot.shotId}) contains forbidden scratch path in imageSrc: "${specShot.imageSrc}"`);
        }

        const expectedCanonical = mShot.canonicalImageSrc || (spec.slug ? `assets/human-insight/final/${spec.slug}/${specShot.shotId}.jpg` : mShot.imageSrc);

        // Strict exact canonical path matching — no loose basename or sourceAssetPath fallback
        if (specShot.imageSrc !== expectedCanonical) {
          errors.push(`Shot[${i}] (${specShot.shotId}) imageSrc "${specShot.imageSrc}" does not match approved canonical path (does not match approved manifest asset: "${expectedCanonical}")`);
        }

        // Exact SHA-256 verification (rejects same-basename files with wrong hash)
        if (mShot.sha256 && specShot.imageSrc) {
          const imgDiskPath = path.isAbsolute(specShot.imageSrc)
            ? specShot.imageSrc
            : path.join(rootDir, 'public', specShot.imageSrc);
          if (fs.existsSync(imgDiskPath)) {
            const buf = fs.readFileSync(imgDiskPath);
            const actualSha = crypto.createHash('sha256').update(buf).digest('hex');
            if (actualSha !== mShot.sha256) {
              errors.push(`Shot[${i}] (${specShot.shotId}) SHA-256 mismatch: disk asset has ${actualSha}, approved manifest requires ${mShot.sha256}`);
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
