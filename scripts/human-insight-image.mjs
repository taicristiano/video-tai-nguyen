/**
 * scripts/human-insight-image.mjs
 *
 * Select or generate a human-insight image for one narration scene.
 *
 * Usage:
 *   node scripts/human-insight-image.mjs \
 *     --text "Bạn thức đêm học AI..." \
 *     --type body \
 *     --mood introspective \
 *     --character male \
 *     --generate
 *
 * Output: JSON asset object suitable for spec.json scene.image.
 *
 * Behavior:
 *   1. Score existing public/assets/human-insight/manifest.json assets.
 *   2. If a score passes the threshold, return the existing asset.
 *   3. Otherwise, when --generate is set and Cloudflare env is available,
 *      generate a 688x384 image with Workers AI, compress to JPEG q70,
 *      save it in public/assets/human-insight/images/, and append manifest.
 *      The API call tries Node fetch first, then curl if fetch is blocked.
 *   4. If generation is unavailable or fails, return the best existing asset.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'public/assets/human-insight/manifest.json');
const IMAGE_DIR = path.join(ROOT, 'public/assets/human-insight/images');

const OUTPUT_WIDTH = 688;
const OUTPUT_HEIGHT = 384;
const JPEG_QUALITY = 70;
const DEFAULT_THRESHOLD = 7;
const CLOUDFLARE_MODEL = '@cf/black-forest-labs/flux-1-schnell';

const STYLE_PROMPT = [
  'A 16:9 vintage beige paper cartoon illustration in the exact style of simple Vietnamese human-insight storyboards:',
  'thin graphite pencil outlines, low contrast sepia-gray ink, pale cream background, subtle cross-hatching only,',
  'rectangular hand-drawn border, simple round-head stick-figure characters with minimal facial features,',
  'clear metaphorical composition, calm emotional storytelling.',
  'Keep all lines light and delicate, no heavy black fills, no saturated colors, no anime, no photorealism, no 3D,',
  'no text, no labels, no logo, no watermark.',
].join(' ');

const VIETNAMESE_TAG_HINTS = [
  [['ai', 'trí tuệ nhân tạo', 'cong nghe', 'công nghệ', 'robot', 'tu dong hoa', 'tự động hóa'], ['ai-learning', 'technology', 'automation', 'ai-replacement']],
  [['thuc dem', 'thức đêm', 'mat ngu', 'mất ngủ', 'dem khuya', 'đêm khuya'], ['night', 'overtime', 'studying', 'fatigue']],
  [['ap luc', 'áp lực', 'stress', 'met moi', 'mệt mỏi', 'kiet suc', 'kiệt sức', 'qua tai', 'quá tải'], ['stress', 'pressure', 'fatigue', 'overworked']],
  [['cong viec', 'công việc', 'van phong', 'văn phòng', 'cap tren', 'cấp trên', 'sep', 'sếp'], ['office', 'workplace', 'corporate', 'conflict']],
  [['hoc', 'học', 'hoc hoi', 'học hỏi', 'lap trinh', 'lập trình', 'coding'], ['learning', 'studying', 'coding']],
  [['hanh trinh', 'hành trình', 'duong di', 'đường đi', 'cay cau', 'cây cầu'], ['journey', 'travel', 'bridge']],
  [['nghi ngoi', 'nghỉ ngơi', 'binh yen', 'bình yên', 'cham lai', 'chậm lại'], ['peaceful', 'relax', 'scenery']],
  [['gia dinh', 'gia đình', 'ket noi', 'kết nối', 'yeu thuong', 'yêu thương'], ['warm', 'friends', 'teamwork']],
  [['tien', 'tiền', 'tai chinh', 'tài chính', 'dau tu', 'đầu tư'], ['finance', 'investment', 'wealth']],
  [['he thong', 'hệ thống', 'rang buoc', 'ràng buộc', 'mac ket', 'mắc kẹt', 'giam cam', 'giam giữ'], ['trapped', 'system', 'control', 'struggle']],
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you',
  'ban', 'bạn', 'toi', 'tôi', 'mot', 'một', 'nhung', 'nhưng', 'khong', 'không',
  'la', 'là', 'cua', 'của', 'cho', 'khi', 'roi', 'rồi', 'nhan', 'nhận',
  'duoc', 'được', 'nhung', 'những', 'cac', 'các', 'co', 'có', 'de', 'để',
]);

const FALLBACK_ASSET_BY_MOOD = {
  contemplative: 'train-journey-04',
  introspective: 'train-journey-04',
  peaceful: 'train-journey-04',
  melancholic: 'night-study-01',
  determined: 'mountain-hiking-01',
  hopeful: 'travel-journey-03',
  warm: 'city-stroll-01',
  stressed: 'office-conflict-01',
};

function loadEnvFile(filename) {
  const envPath = path.join(ROOT, filename);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {
    type: 'body',
    mood: '',
    character: 'neutral',
    generate: false,
    threshold: DEFAULT_THRESHOLD,
    visual: '',
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--generate') {
      args.generate = true;
    } else if (arg === '--text') {
      args.text = argv[++i];
    } else if (arg === '--type') {
      args.type = argv[++i];
    } else if (arg === '--mood') {
      args.mood = argv[++i];
    } else if (arg === '--character') {
      args.character = argv[++i];
    } else if (arg === '--visual') {
      args.visual = argv[++i];
    } else if (arg === '--threshold') {
      args.threshold = Number(argv[++i]);
    } else if (arg === '--help') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.text || !args.text.trim()) {
    throw new Error('Missing required --text');
  }
  if (!['hook', 'body', 'stat', 'ending'].includes(args.type)) {
    throw new Error('--type must be one of: hook, body, stat, ending');
  }
  if (!['male', 'female', 'neutral'].includes(args.character)) {
    throw new Error('--character must be one of: male, female, neutral');
  }
  if (!Number.isFinite(args.threshold)) {
    throw new Error('--threshold must be a number');
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/human-insight-image.mjs --text "<scene narration>" [options]

Options:
  --type hook|body|stat|ending     Scene type. Default: body
  --mood <mood>                    Overall mood, e.g. introspective
  --character male|female|neutral  Character continuity hint. Default: neutral
  --visual "<description>"         Optional visual description for generation prompt
  --threshold <number>             Existing asset score threshold. Default: ${DEFAULT_THRESHOLD}
  --generate                       Allow Cloudflare generation when no asset matches
`);
}

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

function tokenize(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasNormalizedPhrase(haystack, phrase) {
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return false;

  const phraseTokens = normalizedPhrase.split(/\s+/);
  const pattern = phraseTokens.map(escapeRegex).join('\\s+');
  return new RegExp(`(?:^|\\s)${pattern}(?:$|\\s)`).test(haystack);
}

function deriveTags(text, mood, character) {
  const normalized = normalize(text);
  const tags = new Set();

  for (const [phrases, mappedTags] of VIETNAMESE_TAG_HINTS) {
    if (phrases.some((phrase) => hasNormalizedPhrase(normalized, phrase))) {
      mappedTags.forEach((tag) => tags.add(tag));
    }
  }

  for (const token of tokenize(text).slice(0, 8)) {
    tags.add(token);
  }

  if (mood) tags.add(mood);
  if (character !== 'neutral') tags.add(`character-${character}`);

  return [...tags].slice(0, 14);
}

function inferCharacterFromText(text, requested) {
  if (requested !== 'neutral') return requested;
  const normalized = normalize(text);
  if (/(?:^|\s)(anh|ong|cha|bo|chang\s+trai|nguoi\s+dan\s+ong)(?:$|\s)/.test(normalized)) {
    return 'male';
  }
  if (/(?:^|\s)(chi|me|nu|nguoi\s+phu\s+nu|co\s+gai)(?:$|\s)/.test(normalized)) {
    return 'female';
  }
  return 'neutral';
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

function scoreAsset(asset, scene) {
  const sceneTags = deriveTags(scene.text, scene.mood, scene.character);
  const haystack = [
    ...(asset.tags || []),
    asset.mood || '',
    asset.desc || '',
    asset.id || '',
  ].map(normalize).join(' ');
  const haystackTokens = new Set(tokenize(haystack));
  let score = 0;
  const reasons = [];

  for (const tag of sceneTags) {
    const normalizedTag = normalize(tag);
    const isPhrase = normalizedTag.includes(' ') || normalizedTag.includes('-');
    if ((isPhrase && haystack.includes(normalizedTag)) || haystackTokens.has(normalizedTag)) {
      score += 4;
      reasons.push(`tag:${tag}`);
    }
  }

  if (scene.mood && normalize(asset.mood) === normalize(scene.mood)) {
    score += 4;
    reasons.push(`mood:${scene.mood}`);
  }

  const assetTags = new Set(asset.tags || []);
  const assetCharacter = assetTags.has('character-male')
    ? 'male'
    : assetTags.has('character-female')
      ? 'female'
      : 'neutral';
  if (
    scene.character !== 'neutral'
    && assetCharacter !== 'neutral'
    && assetCharacter !== scene.character
  ) {
    score -= 8;
    reasons.push(`character-mismatch:${assetCharacter}`);
  }

  return {asset, score, reasons};
}

function selectExistingAsset(manifest, scene) {
  const ranked = (manifest.assets || [])
    .map((asset) => scoreAsset(asset, scene))
    .sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id));

  const fallbackId = FALLBACK_ASSET_BY_MOOD[normalize(scene.mood)];
  if (fallbackId && (!ranked[0] || ranked[0].score <= 0)) {
    const fallback = (manifest.assets || []).find((asset) => asset.id === fallbackId);
    if (fallback) {
      return {
        asset: fallback,
        score: 1,
        reasons: [`mood-fallback:${scene.mood}`],
      };
    }
  }

  return ranked[0] || null;
}

function slugifyForId(text) {
  const words = tokenize(text).slice(0, 5);
  const base = words.length > 0 ? words.join('-') : 'scene';
  return base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 48);
}

function shortHash(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 8);
}

function buildPrompt(scene) {
  const characterPhrase = {
    male: 'Keep the recurring main character male-presenting across scenes.',
    female: 'Keep the recurring main character female-presenting across scenes.',
    neutral: 'Use simple gender-neutral stick-figure characters unless the scene clearly requires otherwise.',
  }[scene.character];
  const visual = scene.visual || `Visual metaphor for this Vietnamese narration: "${scene.text}"`;

  return `${STYLE_PROMPT}\n\nScene: ${visual}\n${characterPhrase}`;
}

function parseCloudflareImage(body, transport) {
  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    throw new Error(`Cloudflare ${transport} returned invalid JSON: ${body.slice(0, 1000)}`);
  }

  const imageBase64 = data.result?.image;
  if (!imageBase64) {
    throw new Error(`Cloudflare ${transport} returned no result.image: ${body.slice(0, 1000)}`);
  }

  return Buffer.from(imageBase64, 'base64');
}

async function callCloudflareWithFetch(url, token, requestBody) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: requestBody,
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Cloudflare fetch ${response.status}: ${body.slice(0, 1000)}`);
  }

  return parseCloudflareImage(body, 'fetch');
}

function callCloudflareWithCurl(url, token, requestBody) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'human-insight-cloudflare-'));
  const bodyPath = path.join(tempDir, 'request.json');
  fs.writeFileSync(bodyPath, requestBody, 'utf-8');

  const result = spawnSync('curl', [
    '--silent',
    '--show-error',
    '--location',
    '--request',
    'POST',
    '--header',
    `Authorization: Bearer ${token}`,
    '--header',
    'Content-Type: application/json',
    '--data-binary',
    `@${bodyPath}`,
    '--write-out',
    '\n%{http_code}',
    url,
  ], {
    cwd: ROOT,
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`curl exited ${result.status}: ${(result.stderr || result.stdout).trim()}`);
  }

  const output = result.stdout || '';
  const newlineIndex = output.lastIndexOf('\n');
  const body = newlineIndex === -1 ? output : output.slice(0, newlineIndex);
  const status = newlineIndex === -1 ? '' : output.slice(newlineIndex + 1).trim();

  if (!/^2\d\d$/.test(status)) {
    throw new Error(`Cloudflare curl ${status || 'unknown status'}: ${body.slice(0, 1000)}`);
  }

  return parseCloudflareImage(body, 'curl');
}

async function generateWithCloudflare(prompt, seed) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_MODEL}`;
  const requestBody = JSON.stringify({
    prompt,
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    steps: 4,
    seed,
  });

  try {
    console.error('Calling Cloudflare with Node fetch...');
    return await callCloudflareWithFetch(url, token, requestBody);
  } catch (fetchErr) {
    console.error(`Node fetch failed: ${fetchErr.message}`);
    console.error('Retrying Cloudflare with curl...');
    try {
      return callCloudflareWithCurl(url, token, requestBody);
    } catch (curlErr) {
      throw new Error(`Cloudflare API failed via fetch and curl. fetch: ${fetchErr.message}; curl: ${curlErr.message}`);
    }
  }
}

function compressJpeg(inputPath, outputPath) {
  const result = spawnSync('sips', [
    '--resampleHeightWidth',
    String(OUTPUT_HEIGHT),
    String(OUTPUT_WIDTH),
    '--setProperty',
    'formatOptions',
    String(JPEG_QUALITY),
    inputPath,
    '--out',
    outputPath,
  ], {
    cwd: ROOT,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(`sips failed: ${(result.stderr || result.stdout).trim()}`);
  }
}

function reserveGeneratedAsset(manifest, scene) {
  const slug = slugifyForId(scene.text);
  const hash = shortHash(`${scene.text}|${scene.character}`);
  const idBase = `cf-${slug}-${hash}`;
  const fileBase = `${slug}-${hash}`;
  const existingIds = new Set((manifest.assets || []).map((asset) => asset.id));
  const existingPaths = new Set((manifest.assets || []).map((asset) => asset.path));

  for (let suffix = 1; suffix < 1000; suffix++) {
    const suffixText = suffix === 1 ? '' : `-${suffix}`;
    const id = `${idBase}${suffixText}`;
    const filename = `${fileBase}${suffixText}.jpg`;
    const outputPath = path.join(IMAGE_DIR, filename);
    const manifestPath = path.relative(path.join(ROOT, 'public'), outputPath).replace(/\\/g, '/');

    if (
      !existingIds.has(id)
      && !existingPaths.has(manifestPath)
      && !fs.existsSync(outputPath)
    ) {
      return {id, outputPath, manifestPath};
    }
  }

  throw new Error(`Could not reserve a unique generated asset name for "${scene.text.slice(0, 80)}"`);
}

function appendGeneratedAsset(manifest, scene, reservedAsset) {
  const asset = {
    id: reservedAsset.id,
    path: reservedAsset.manifestPath,
    desc: scene.visual || `AI-generated illustration for: ${scene.text.slice(0, 140)}`,
    tags: deriveTags(scene.text, scene.mood, scene.character),
    mood: scene.mood || 'reflective',
  };

  manifest.assets = [...(manifest.assets || []), asset];
  writeManifest(manifest);
  return asset;
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const args = parseArgs(process.argv);
  const character = inferCharacterFromText(args.text, args.character);
  const scene = {
    text: args.text,
    type: args.type,
    mood: args.mood,
    character,
    visual: args.visual,
  };

  const manifest = readManifest();
  const best = selectExistingAsset(manifest, scene);

  if (best && best.score >= args.threshold) {
    console.error(`Using existing asset "${best.asset.id}" (score ${best.score}).`);
    console.log(JSON.stringify({
      source: 'manifest',
      score: best.score,
      reasons: best.reasons,
      image: {
        assetId: best.asset.id,
        path: best.asset.path,
      },
    }, null, 2));
    return;
  }

  if (!args.generate) {
    if (!best) throw new Error('No manifest assets available');
    console.error(`No asset passed threshold ${args.threshold}; falling back to "${best.asset.id}" (score ${best.score}).`);
    console.log(JSON.stringify({
      source: 'fallback',
      score: best.score,
      reasons: best.reasons,
      image: {
        assetId: best.asset.id,
        path: best.asset.path,
      },
    }, null, 2));
    return;
  }

  const prompt = buildPrompt(scene);
  const seed = Number.parseInt(shortHash(`${scene.text}|${scene.character}`), 16);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'human-insight-image-'));
  const rawPath = path.join(tempDir, 'raw.jpg');
  const reservedAsset = reserveGeneratedAsset(manifest, scene);

  try {
    console.error('Generating with Cloudflare Workers AI...');
    const imageBuffer = await generateWithCloudflare(prompt, seed);
    fs.writeFileSync(rawPath, imageBuffer);
    compressJpeg(rawPath, reservedAsset.outputPath);
    const asset = appendGeneratedAsset(manifest, scene, reservedAsset);
    console.error(`Generated asset "${asset.id}" at ${asset.path}.`);
    console.log(JSON.stringify({
      source: 'generated',
      previousBest: best ? {
        assetId: best.asset.id,
        score: best.score,
        reasons: best.reasons,
      } : null,
      image: {
        assetId: asset.id,
        path: asset.path,
      },
      asset,
    }, null, 2));
  } catch (err) {
    if (!best) throw err;
    console.error(`Generation failed: ${err.message}`);
    console.error(`Falling back to "${best.asset.id}" (score ${best.score}).`);
    console.log(JSON.stringify({
      source: 'fallback-after-generate-failure',
      error: err.message,
      score: best.score,
      reasons: best.reasons,
      image: {
        assetId: best.asset.id,
        path: best.asset.path,
      },
    }, null, 2));
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
