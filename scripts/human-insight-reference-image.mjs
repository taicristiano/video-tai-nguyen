/**
 * scripts/human-insight-reference-image.mjs
 *
 * Isolated reference-conditioned generator for HAY & ĐẸP. V3.3.
 * Supports multi-reference conditioning using Cloudflare FLUX.2 models.
 *
 * Models:
 * - quality: @cf/black-forest-labs/flux-2-dev
 * - fast:    @cf/black-forest-labs/flux-2-klein-9b
 *
 * Does NOT replace the existing text-only generator (human-insight-image.mjs).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export const REFERENCE_MODELS = {
  quality: '@cf/black-forest-labs/flux-2-dev',
  fast: '@cf/black-forest-labs/flux-2-klein-9b',
};

export function resolveModel(modelName) {
  if (!modelName) {
    return process.env.HAY_DEP_REFERENCE_MODEL || REFERENCE_MODELS.fast;
  }
  if (modelName === 'quality') return REFERENCE_MODELS.quality;
  if (modelName === 'fast') return REFERENCE_MODELS.fast;
  if (modelName.startsWith('@cf/')) return modelName;
  if (REFERENCE_MODELS[modelName]) return REFERENCE_MODELS[modelName];
  return modelName;
}

export function loadEnvFile(filename) {
  const fullPath = path.resolve(ROOT, filename);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

export function prepareReferenceImage(inputPath, outputPath) {
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i', inputPath,
      '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease",
      '-q:v', '3',
      outputPath,
    ],
    {
      cwd: ROOT,
      encoding: 'utf-8',
    },
  );

  if (result.status !== 0) {
    // Fallback to copy if ffmpeg fails
    fs.copyFileSync(inputPath, outputPath);
  }
}

export async function generateWithFlux2References({
  model,
  prompt,
  referencePaths = [],
  width = 1024,
  height = 1024,
  seed,
}) {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set');
  }

  const targetModel = resolveModel(model);
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${targetModel}`;

  if (referencePaths.length > 4) {
    throw new Error(
      `Maximum 4 reference images allowed by FLUX.2, got ${referencePaths.length}`,
    );
  }

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', String(width));
  form.append('height', String(height));

  if (Number.isFinite(seed) && seed !== null) {
    form.append('seed', String(seed >>> 0));
  }

  for (let i = 0; i < referencePaths.length; i++) {
    const filePath = referencePaths[i];
    if (!filePath) continue;

    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Reference image not found at: ${absPath}`);
    }

    const buffer = fs.readFileSync(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'image/jpeg';

    form.append(
      `input_image_${i}`,
      new Blob([buffer], { type }),
      path.basename(absPath),
    );
  }

  console.error(`Calling Cloudflare AI model "${targetModel}" with ${referencePaths.length} reference image(s)...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type manually: fetch will set multipart/form-data with boundary
    },
    body: form,
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Cloudflare ${response.status} for model "${targetModel}": ${body.slice(0, 2000)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    throw new Error(`Cloudflare returned invalid JSON: ${body.slice(0, 1000)}`);
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    throw new Error(
      `No result.image in Cloudflare response: ${body.slice(0, 2000)}`,
    );
  }

  return Buffer.from(imageBase64, 'base64');
}

export function parseArgs(argv) {
  const args = {
    prompt: '',
    model: 'fast',
    styleRef: '',
    castRef: '',
    worldRef: '',
    canonicalRef: '',
    references: [],
    width: 1024,
    height: 1024,
    seed: null,
    output: '',
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--prompt') {
      args.prompt = argv[++i];
    } else if (arg === '--model') {
      args.model = argv[++i];
    } else if (arg === '--style-ref') {
      args.styleRef = argv[++i];
    } else if (arg === '--cast-ref') {
      args.castRef = argv[++i];
    } else if (arg === '--world-ref') {
      args.worldRef = argv[++i];
    } else if (arg === '--canonical-ref') {
      args.canonicalRef = argv[++i];
    } else if (arg === '--reference') {
      args.references.push(argv[++i]);
    } else if (arg === '--width') {
      args.width = Number(argv[++i]);
    } else if (arg === '--height') {
      args.height = Number(argv[++i]);
    } else if (arg === '--seed') {
      args.seed = Number(argv[++i]);
    } else if (arg === '--output') {
      args.output = argv[++i];
    } else if (arg === '--help') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.prompt) {
    throw new Error('Missing required --prompt');
  }
  if (!args.output) {
    throw new Error('Missing required --output');
  }

  return args;
}

function printUsage() {
  console.log(`
Usage:
  node scripts/human-insight-reference-image.mjs --prompt "<prompt>" --output "<path>" [options]

Options:
  --model quality|fast|<model-id>  Default: fast (@cf/black-forest-labs/flux-2-klein-9b)
  --style-ref <path>               Input image 0 (style anchor)
  --cast-ref <path>                Input image 1 (character identities anchor)
  --world-ref <path>               Input image 2 (room/world anchor)
  --canonical-ref <path>           Input image 3 (canonical establish anchor)
  --reference <path>               Generic reference image path (ordered up to 4)
  --width <number>                 Default: 1024
  --height <number>                Default: 1024
  --seed <number>                  Deterministic seed
  --output <path>                  Target output image file (.jpg)
`);
}

async function main() {
  const args = parseArgs(process.argv);

  const referencePaths = [];
  if (args.styleRef) referencePaths.push(args.styleRef);
  if (args.castRef) referencePaths.push(args.castRef);
  if (args.worldRef) referencePaths.push(args.worldRef);
  if (args.canonicalRef) referencePaths.push(args.canonicalRef);

  // Append generic references if passed
  for (const ref of args.references) {
    if (!referencePaths.includes(ref) && referencePaths.length < 4) {
      referencePaths.push(ref);
    }
  }

  const outPath = path.isAbsolute(args.output)
    ? args.output
    : path.resolve(ROOT, args.output);

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const imageBuffer = await generateWithFlux2References({
    model: args.model,
    prompt: args.prompt,
    referencePaths,
    width: args.width,
    height: args.height,
    seed: args.seed,
  });

  fs.writeFileSync(outPath, imageBuffer);
  console.log(JSON.stringify({
    success: true,
    model: resolveModel(args.model),
    output: outPath,
    references: referencePaths,
    bytes: imageBuffer.length,
  }, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`❌ Reference Generation Error: ${err.message}`);
    process.exit(1);
  });
}
