/**
 * scripts/package-production.mjs
 *
 * Generic Production Packager for HAY & ĐẸP.
 * Packages everything required to render and validate a video into a self-contained,
 * portable ZIP archive with zero external repo dependencies.
 *
 * Key Principles:
 *   1. 100% generic: requires explicit --slug=<slug>, zero video-specific hardcodes.
 *   2. Template static dependency contract: discovers all runtime assets via
 *      resolveTemplateDependencies(spec). No ad-hoc asset discovering or guessing.
 *   3. Fail-fast validation: validates production spec and all assets BEFORE building ZIP.
 *      If any asset is missing, packaging aborts with non-zero exit and no ZIP created.
 *   4. Clean brand contract: legacy NẾP public/watermark.png is excluded by default.
 *   5. Cross-platform ZIP contract: entries use POSIX forward slashes ('/'), 0 backslashes ('\\').
 *   6. Clean-workspace portability: archive contains shared runtime (src/), pipeline scripts,
 *      config, and canonical assets, ready to extract and run anywhere.
 *
 * Usage:
 *   node scripts/package-production.mjs --slug=<slug>
 *   node scripts/package-production.mjs --slug=<slug> --output=<output-path.zip>
 *   node scripts/package-production.mjs --slug=<slug> --include-review-media
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveTemplateDependencies } from '../src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs';
import { validateProductionSpec } from './production-spec-adapter.mjs';
import { validateExternalHumanVideoApproval } from './pipeline-state.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    if (arg.startsWith('--slug=')) {
      options.slug = arg.slice('--slug='.length).trim();
    } else if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length).trim();
    } else if (arg === '--include-review-media') {
      options.includeReviewMedia = true;
    } else if (arg === '--include-history') {
      options.includeHistory = true;
    }
  }
  return options;
}

/**
 * Recursively collect files in a directory matching an optional filter.
 */
function walkDir(dir, filterFn = null) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, filterFn));
    } else if (!filterFn || filterFn(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Packages a production video and all its dependencies into a self-contained ZIP archive.
 *
 * @param {object} options
 * @param {string} options.slug - The video slug to package (REQUIRED)
 * @param {string} [options.output] - Destination path for the ZIP archive
 * @param {string} [options.rootDir=ROOT] - Root directory of the repository
 * @param {boolean} [options.includeReviewMedia=false] - Whether to include review media
 * @param {boolean} [options.includeHistory=false] - Whether to include historical scratch files
 * @returns {Promise<{ zipPath: string, totalFiles: number, entryCount: number, sizeBytes: number }>}
 */
export async function packageProduction(options = {}) {
  const rootDir = options.rootDir || ROOT;
  const slug = options.slug;
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    throw new Error('Missing required argument: --slug=<slug>. Explicit --slug is mandatory for production packaging.');
  }

  // Defense-in-depth: Revalidate external human video approval before packaging
  const statePath = path.join(rootDir, 'videos', slug, 'pipeline-state.json');
  const verdictPath = path.join(rootDir, 'videos', slug, 'video-qa-verdict.json');
  const hasPipelineState = fs.existsSync(statePath);
  const hasVerdict = fs.existsSync(verdictPath);
  const enforceApproval = options.enforceApproval ?? (options.requireVideoApproval || (hasPipelineState && !options.skipApprovalValidation) || hasVerdict);

  if (enforceApproval && !options.skipApprovalValidation) {
    const approvalValidation = validateExternalHumanVideoApproval(slug, {
      rootDir,
      expectedVerdict: 'PASS_HUMAN_VIDEO_QA',
      checkDisk: !options.skipMp4Check,
    });
    if (!approvalValidation.valid) {
      throw new Error(
        `PACKAGE_BLOCKED: HUMAN_VIDEO_APPROVAL_REQUIRED: Cannot package production without valid external human video approval:\n  - ${approvalValidation.errors.join('\n  - ')}`
      );
    }
  }

  // 1. Locate production-render-spec.json
  const specPath = path.join(rootDir, 'videos', slug, 'production-render-spec.json');
  if (!fs.existsSync(specPath)) {
    throw new Error(`Production render spec not found for slug "${slug}" at: ${specPath}`);
  }

  const specRaw = fs.readFileSync(specPath, 'utf8');
  const spec = JSON.parse(specRaw);

  // 2. Fail-fast validation: validate production spec and verify all runtime assets exist
  const validation = validateProductionSpec(spec, { checkAssets: true, rootDir });
  if (!validation.valid) {
    throw new Error(
      `Cannot package production for slug "${slug}": Production spec validation failed with ${validation.errors.length} errors:\n  - ${validation.errors.join('\n  - ')}`
    );
  }

  const fileMap = new Map(); // arcname (normalized POSIX) -> diskPath

  function addFile(diskPath, arcPath) {
    if (!fs.existsSync(diskPath)) {
      throw new Error(`Packager failed: file not found on disk: ${diskPath}`);
    }
    const normArc = arcPath.replace(/\\/g, '/');
    fileMap.set(normArc, diskPath);
    return true;
  }

  // 3. Add video metadata artifacts
  addFile(specPath, `videos/${slug}/production-render-spec.json`);

  const manifestPath = path.join(rootDir, 'videos', slug, 'approved-image-manifest.json');
  if (fs.existsSync(manifestPath)) {
    addFile(manifestPath, `videos/${slug}/approved-image-manifest.json`);
  }

  const reviewPath = path.join(rootDir, 'videos', slug, 'review-manifest.json');
  if (fs.existsSync(reviewPath)) {
    addFile(reviewPath, `videos/${slug}/review-manifest.json`);
  }

  const storyPlanPath = path.join(rootDir, 'videos', slug, 'story-plan.json');
  if (fs.existsSync(storyPlanPath)) {
    addFile(storyPlanPath, `videos/${slug}/story-plan.json`);
  }

  // 4. Resolve and include all template runtime static dependencies
  const resolvedDeps = resolveTemplateDependencies(spec);
  for (const dep of resolvedDeps) {
    const cleanDep = dep.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/');
    const diskPath = path.join(rootDir, 'public', cleanDep);
    if (!fs.existsSync(diskPath)) {
      throw new Error(`Packager failed: required static dependency "${dep}" not found on disk at: ${diskPath}`);
    }
    addFile(diskPath, `public/${cleanDep}`);
  }

  // 5. Add shared runtime code (src/) - excluding test files
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    for (const file of walkDir(srcDir, (f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))) {
      const rel = path.relative(rootDir, file).replace(/\\/g, '/');
      addFile(file, rel);
    }
  }

  // 6. Add shared production pipeline scripts
  const sharedScriptNames = [
    'scripts/production-spec-adapter.mjs',
    'scripts/build-production-render-spec.mjs',
    'scripts/render-production-video.mjs',
    'scripts/materialize-production-assets.mjs',
    'scripts/promote-approved-images.mjs',
    'scripts/package-production.mjs',
  ];
  for (const s of sharedScriptNames) {
    const full = path.join(rootDir, s);
    if (fs.existsSync(full)) {
      addFile(full, s);
    }
  }

  // 7. Add root configuration files
  const rootConfigFiles = ['package.json', 'tsconfig.json', 'remotion.config.ts'];
  for (const c of rootConfigFiles) {
    const full = path.join(rootDir, c);
    if (fs.existsSync(full)) {
      addFile(full, c);
    }
  }

  // 8. Optional review media
  if (options.includeReviewMedia) {
    const reviewDirs = [
      path.join(rootDir, 'videos', slug, 'review'),
      path.join(rootDir, 'scratch', slug),
    ];
    for (const rDir of reviewDirs) {
      if (fs.existsSync(rDir)) {
        for (const file of walkDir(rDir, (f) => /\.(jpg|png|webp|json|md)$/i.test(f))) {
          const rel = path.relative(rootDir, file).replace(/\\/g, '/');
          addFile(file, rel);
        }
      }
    }
  }

  // 9. Prepare output destination
  const defaultZipDir = path.join(rootDir, 'videos', slug);
  fs.mkdirSync(defaultZipDir, { recursive: true });
  const outputZipPath = options.output
    ? path.resolve(rootDir, options.output)
    : path.join(defaultZipDir, `${slug}-production-package.zip`);

  fs.mkdirSync(path.dirname(outputZipPath), { recursive: true });
  if (fs.existsSync(outputZipPath)) {
    fs.unlinkSync(outputZipPath);
  }

  // 10. Archive creation using Python zipfile (guarantees cross-platform POSIX forward slashes)
  const manifestData = Array.from(fileMap.entries()).map(([arc, src]) => [src, arc]);
  const tempManifestJson = path.join(
    rootDir,
    'scratch',
    `temp-package-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );
  fs.mkdirSync(path.dirname(tempManifestJson), { recursive: true });
  fs.writeFileSync(tempManifestJson, JSON.stringify(manifestData), 'utf8');

  const pythonScript = `
import zipfile, json, sys, os

manifest_path = sys.argv[1]
out_zip = sys.argv[2]

with open(manifest_path, 'r', encoding='utf-8') as f:
    files = json.load(f)

os.makedirs(os.path.dirname(os.path.abspath(out_zip)), exist_ok=True)

with zipfile.ZipFile(out_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for src, arc in files:
        if os.path.exists(src):
            norm_arc = arc.replace('\\\\', '/')
            zf.write(src, norm_arc)
`;

  try {
    execFileSync('python', ['-c', pythonScript, tempManifestJson, outputZipPath], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } finally {
    if (fs.existsSync(tempManifestJson)) {
      fs.unlinkSync(tempManifestJson);
    }
  }

  // 11. Verify archive integrity and path separators
  const verifyScript = `
import zipfile, sys, json
out_zip = sys.argv[1]
with zipfile.ZipFile(out_zip, 'r') as zf:
    names = zf.namelist()
    backslash_count = sum(1 for n in names if '\\\\' in n)
    print(json.dumps({'count': len(names), 'backslash_count': backslash_count}))
`;

  const verifyOut = execFileSync('python', ['-c', verifyScript, outputZipPath], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  const verifyResult = JSON.parse(verifyOut.trim());

  if (verifyResult.backslash_count > 0) {
    throw new Error(
      `Cross-platform ZIP violation: archive contains ${verifyResult.backslash_count} backslash entries!`
    );
  }

  const stat = fs.statSync(outputZipPath);
  const sizeMb = (stat.size / 1024 / 1024).toFixed(2);
  const shotsCount = (spec.shots || []).length;

  console.log(`✅ Production package created: ${outputZipPath}`);
  console.log(`   Entries: ${verifyResult.count} (0 backslashes) | Size: ${sizeMb} MB | Shots: ${shotsCount}`);

  return {
    zipPath: outputZipPath,
    totalFiles: fileMap.size,
    entryCount: verifyResult.count,
    sizeBytes: stat.size,
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseCliArgs();
  if (!options.slug) {
    console.error('❌ Error: Missing required argument --slug=<slug>');
    console.error('Usage: node scripts/package-production.mjs --slug=<slug> [--output=<output.zip>] [--include-review-media]');
    process.exit(1);
  }
  packageProduction(options).catch((err) => {
    console.error('❌ Packaging failed:', err.message);
    process.exit(1);
  });
}
