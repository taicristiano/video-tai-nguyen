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
import {
  buildImageSafetyRulesForShot,
  validateActionPromptContract,
  validateFinalImagePromptContract,
  validateObjectDetailContract,
} from '../src/templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs';
export { validateActionPromptContract, validateFinalImagePromptContract, validateObjectDetailContract };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'public/assets/human-insight/manifest.json');
const IMAGE_DIR = path.join(ROOT, 'public/assets/human-insight/images');

// Be deliberately conservative when reusing an existing illustration.
// A single mood/emotion overlap must never be enough to suppress generation.
const DEFAULT_THRESHOLD = 14;
export const CLOUDFLARE_MODEL = '@cf/black-forest-labs/flux-1-schnell';

// TODO: Audit remaining historical 394 assets into HAYDEP_CORE, HAYDEP_COMPATIBLE, LEGACY_NEP, REJECT_OFFSTYLE
export const ASSET_TIERS = {
  CORE: 'HAYDEP_CORE',
  CANDIDATE: 'HAYDEP_CANDIDATE',
  COMPATIBLE: 'HAYDEP_COMPATIBLE',
  LEGACY: 'LEGACY_NEP',
  REJECT: 'REJECT_OFFSTYLE',
};

export const STYLE_PROMPT = [
  'STYLE LOCK: HAY & ĐẸP.',
  'Clearly hand-drawn 2D editorial illustration with charcoal/sepia outlines around characters, hands, and objects.',
  'Simplified facial features; simplified grouped hair shapes, NOT individual realistic hair strands.',
  'Matte painted / flat gouache color fills, soft simplified illustrated shadows.',
  'Warm ivory/cream background, muted sage, warm wood, restrained terracotta accents.',
  'Calm editorial look, clean forms.',
  'Unmistakably DRAWN / ILLUSTRATED, not photographed.',
].join('\n');

export const STYLE_PROMPT_ZERO_PEOPLE = [
  'STYLE LOCK: HAY & ĐẸP.',
  'Clearly hand-drawn 2D editorial illustration with charcoal/sepia outlines around furniture, props, and domestic elements.',
  'Matte painted / flat gouache color fills, soft simplified illustrated shadows.',
  'Warm ivory/cream background, muted sage, warm wood, restrained terracotta accents.',
  'Calm editorial-cartoon atmosphere, clean architectural and domestic forms.',
  'Unmistakably DRAWN / ILLUSTRATED, not photographed.',
].join('\n');

const CASTS_PATH = path.join(
  ROOT,
  'src/templates/human-insight/cinematic-light/character-casts.json',
);

export const CHARACTER_CASTS = JSON.parse(
  fs.readFileSync(CASTS_PATH, 'utf-8'),
);


export function inferCastId(text, category) {
  const lower = (String(text || '') + ' ' + (category ?? '')).toLowerCase();
  if (
    lower.includes('bữa cơm') ||
    lower.includes('gia đình') ||
    lower.includes('con cái') ||
    lower.includes('nhà mình')
  ) {
    return 'family-young-01';
  }
  if (lower.includes('ông bà') || lower.includes('tuổi già') || lower.includes('dưỡng già')) {
    return 'elderly-couple-01';
  }
  if (
    lower.includes('vợ chồng') ||
    lower.includes('người yêu') ||
    lower.includes('kết hôn') ||
    lower.includes('hôn nhân')
  ) {
    return 'couple-young-01';
  }
  if (lower.includes('trung niên') || lower.includes('nuôi dạy')) {
    return 'parents-middleage-01';
  }
  if (lower.includes('cô gái') || lower.includes('phụ nữ')) {
    return 'solo-female-01';
  }
  if (lower.includes('chàng trai') || lower.includes('người trẻ')) {
    return 'solo-male-01';
  }
  return undefined;
}

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

const EMOTION_TAGS = new Set([
  'stress',
  'pressure',
  'fatigue',
  'overworked',
  'overwhelmed',
  'sadness',
  'disappointment',
]);

const EMOTION_KEYWORDS_VI = new Set([
  'mệt',
  'mệt mỏi',
  'cạn năng lượng',
  'kiệt sức',
  'áp lực',
  'căng thẳng',
  'quá tải',
  'khó chịu',
]);

const GENERIC_MOOD_TAGS = new Set([
  'reflective',
  'peaceful',
  'warm',
  'introspective',
  'contemplative',
  'melancholic',
  'determined',
  'hopeful',
  'stressed',
]);

const loadedEnvRoots = new Set();

/**
 * Idempotently loads project environment variables (.env.local and .env).
 * Precedence: existing process.env > .env.local > .env.
 * Does not overwrite existing environment variables and never logs secrets.
 *
 * @param {string} [rootDir=ROOT]
 */
export function ensureProjectEnvLoaded(rootDir = ROOT) {
  const resolved = path.resolve(rootDir || ROOT);
  if (loadedEnvRoots.has(resolved)) return;

  function loadFile(filename) {
    const envPath = path.join(resolved, filename);
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  }

  loadFile('.env.local');
  loadFile('.env');
  loadedEnvRoots.add(resolved);
}

function parseArgs(argv) {
  const args = {
    type: 'body',
    mood: '',
    character: 'neutral',
    cast: '',
    slug: '',
    video: '',
    sceneIndex: 0,
    seed: null,
    generate: false,
    threshold: DEFAULT_THRESHOLD,
    visual: '',
    exclude: '',
    shotScale: '',
    composition: '',
    storyRole: '',
    action: '',
    worldId: '',
    worldLock: '',
    strictHayDep: false,
    noPeople: false,
    peopleMin: null,
    peopleMax: null,
    presentMembers: [],
    scale: '',
    silhouette: '',
    visualVerb: '',
    semanticIntent: '',
    visualMode: '',
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--generate') {
      args.generate = true;
    } else if (arg === '--strict-hay-dep') {
      args.strictHayDep = true;
    } else if (arg === '--no-people') {
      args.noPeople = true;
    } else if (arg === '--people-min') {
      args.peopleMin = Number(argv[++i]);
    } else if (arg === '--people-max') {
      args.peopleMax = Number(argv[++i]);
    } else if (arg === '--present-members') {
      args.presentMembers = argv[++i]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (arg === '--text') {
      args.text = argv[++i];
    } else if (arg === '--type') {
      args.type = argv[++i];
    } else if (arg === '--mood') {
      args.mood = argv[++i];
    } else if (arg === '--character') {
      args.character = argv[++i];
    } else if (arg === '--cast') {
      args.cast = argv[++i];
    } else if (arg === '--slug') {
      args.slug = argv[++i];
    } else if (arg === '--video') {
      args.video = argv[++i];
    } else if (arg === '--scene-index') {
      args.sceneIndex = Number(argv[++i]);
    } else if (arg === '--seed') {
      args.seed = Number(argv[++i]);
    } else if (arg === '--visual') {
      args.visual = argv[++i];
    } else if (arg === '--shot-scale') {
      args.shotScale = String(argv[++i]).toLowerCase();
    } else if (arg === '--scale') {
      args.scale = argv[++i];
    } else if (arg === '--visual-mode') {
      args.visualMode = argv[++i];
    } else if (arg === '--silhouette') {
      args.silhouette = argv[++i];
    } else if (arg === '--visual-verb') {
      args.visualVerb = argv[++i];
    } else if (arg === '--semantic-intent') {
      args.semanticIntent = argv[++i];
    } else if (arg === '--composition') {
      args.composition = argv[++i];
    } else if (arg === '--story-role') {
      args.storyRole = argv[++i];
    } else if (arg === '--action') {
      args.action = argv[++i];
    } else if (arg === '--world-id') {
      args.worldId = argv[++i];
    } else if (arg === '--world-lock') {
      args.worldLock = argv[++i];
    } else if (arg === '--threshold') {
      args.threshold = Number(argv[++i]);
    } else if (arg === '--exclude') {
      args.exclude = argv[++i];
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
  --cast <castId>                  Cast ID (family-young-01, couple-young-01, etc.)
  --slug <slug>                    Video slug for deterministic seed calculation
  --scene-index <number>           Scene index in timeline (0, 1, ...)
  --seed <number>                  Explicit uint32 seed override
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

  if (mood) tags.add(mood);
  if (character !== 'neutral') tags.add(`character-${character}`);

  return [...tags].slice(0, 12);
}

function keywordMatchesScene(keyword, sceneText) {
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) return false;
  const normalizedScene = normalize(sceneText);
  if (hasNormalizedPhrase(normalizedScene, normalizedKeyword)) return true;
  const tokens = normalizedKeyword.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length >= 2 && tokens.every((t) => hasNormalizedPhrase(normalizedScene, t))) {
    return true;
  }
  return false;
}

function dedupeKeywordMatches(keywords) {
  const sorted = [...keywords].sort((a, b) => normalize(b).length - normalize(a).length);
  const kept = [];
  for (const keyword of sorted) {
    const normalizedKeyword = normalize(keyword);
    if (kept.some(existing => hasNormalizedPhrase(normalize(existing), normalizedKeyword))) {
      continue;
    }
    kept.push(keyword);
  }
  return kept;
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

export function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

export function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

export function scoreAsset(asset, scene) {
  if (asset.tier === ASSET_TIERS.REJECT) {
    return { asset, score: -9999, reasons: ['tier:REJECT_OFFSTYLE'] };
  }

  const sceneTags = deriveTags(scene.text, scene.mood, scene.character);
  const assetTags = new Set((asset.tags || []).map(normalize));
  const assetDesc = normalize(asset.desc || '');
  let score = 0;
  const reasons = [];

  if (asset.tier === ASSET_TIERS.CORE) {
    score += 25;
    reasons.push('tier:HAYDEP_CORE');
  } else if (asset.tier === ASSET_TIERS.COMPATIBLE) {
    score += 10;
    reasons.push('tier:HAYDEP_COMPATIBLE');
  } else if (asset.tier === ASSET_TIERS.LEGACY) {
    reasons.push('tier:LEGACY_NEP');
  }

  for (const tag of sceneTags) {
    const normalizedTag = normalize(tag);
    if (assetTags.has(normalizedTag)) {
      if (EMOTION_TAGS.has(normalizedTag)) {
        score += 2;
      } else if (GENERIC_MOOD_TAGS.has(normalizedTag)) {
        score += 1;
      } else {
        score += 6;
      }
      reasons.push(`tag:${tag}`);
    } else if (normalizedTag && hasNormalizedPhrase(assetDesc, normalizedTag)) {
      score += 2;
      reasons.push(`desc:${tag}`);
    }
  }

  const combinedSceneText = scene.visual ? `${scene.text} ${scene.visual}` : scene.text;
  const matchedKeywords = dedupeKeywordMatches(
    (asset.keywordsVi || []).filter(keyword => keywordMatchesScene(keyword, combinedSceneText)),
  );
  for (const keyword of matchedKeywords) {
    const normalizedKeyword = normalize(keyword);
    score += EMOTION_KEYWORDS_VI.has(normalizedKeyword) ? 4 : 14;
    reasons.push(`keyword:${keyword}`);
  }

  if (scene.mood && normalize(asset.mood) === normalize(scene.mood)) {
    score += 1;
    reasons.push(`mood:${scene.mood}`);
  }

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

  if (scene.castId) {
    if (!asset.castId) {
      score -= 30;
      reasons.push('cast:unknown');
    } else if (scene.castId === asset.castId) {
      score += 20;
      reasons.push(`cast:${scene.castId}`);
    } else {
      score -= 40;
      reasons.push(`cast-mismatch:${asset.castId}`);
    }
  }

  if (scene.worldId && asset.worldId) {
    if (scene.worldId === asset.worldId) {
      score += 8;
      reasons.push(`world:${scene.worldId}`);
    } else {
      score -= 8;
      reasons.push(`world-mismatch:${asset.worldId}`);
    }
  }

  if (scene.storyRole && asset.storyRole === scene.storyRole) {
    score += 6;
    reasons.push(`story-role:${scene.storyRole}`);
  }

  return {asset, score, reasons};
}

export function effectiveTier(asset) {
  return asset?.tier || ASSET_TIERS.LEGACY;
}

export function canReuseForHayDep(result, scene, threshold = DEFAULT_THRESHOLD) {
  if (!result) return false;

  const asset = result.asset;
  const tier = effectiveTier(asset);

  if (
    tier !== ASSET_TIERS.CORE &&
    tier !== ASSET_TIERS.COMPATIBLE
  ) {
    return false;
  }

  if (!isConfidentExistingMatch(result, threshold)) {
    return false;
  }

  if (scene.castId) {
    if (!asset.castId) return false;
    if (asset.castId !== scene.castId) return false;
  }

  if (scene.worldId && asset.worldId) {
    if (asset.worldId !== scene.worldId) return false;
  }

  if (
    scene.storyRole &&
    asset.storyRole &&
    asset.storyRole !== scene.storyRole
  ) {
    return false;
  }

  return true;
}

function isReusableAsset(asset) {
  // Cloudflare images are generated for one very specific narration scene.
  // Reusing them for another scene was a major source of visually-wrong matches.
  if (asset.reuse === false) return false;
  if (asset.tier === ASSET_TIERS.REJECT) return false;
  if (String(asset.id || '').startsWith('cf-')) return false;
  return true;
}

function isSpecificReason(reason) {
  if (reason.startsWith('keyword:')) {
    const keyword = normalize(reason.slice('keyword:'.length));
    return !EMOTION_KEYWORDS_VI.has(keyword);
  }

  if (reason.startsWith('tag:')) {
    const tag = normalize(reason.slice('tag:'.length));
    return !EMOTION_TAGS.has(tag) && !GENERIC_MOOD_TAGS.has(tag);
  }

  return false;
}

export function isConfidentExistingMatch(result, threshold = DEFAULT_THRESHOLD) {
  if (!result || result.score < threshold) return false;

  const specificReasons = result.reasons.filter(isSpecificReason);
  const hasSpecificKeyword = specificReasons.some((reason) => reason.startsWith('keyword:'));
  const specificTagCount = specificReasons.filter((reason) => reason.startsWith('tag:')).length;

  // One concrete Vietnamese keyword (object/action/place) is strong enough.
  // Otherwise require at least two non-emotional semantic tags.
  return hasSpecificKeyword || specificTagCount >= 2;
}

export function selectExistingAsset(manifest, scene, excludeIds = new Set()) {
  const ranked = (manifest.assets || [])
    .filter((asset) => !excludeIds.has(asset.id) && isReusableAsset(asset))
    .map((asset) => scoreAsset(asset, scene))
    .sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id));

  // Return the real best candidate, even when weak. The caller decides whether
  // confidence is high enough to reuse it or whether Cloudflare should generate.
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

function buildShotPrompt(scene) {
  const rawScale =
    scene.scale ||
    scene.shotScale ||
    (scene.type === 'hook'
      ? 'wide'
      : scene.type === 'ending'
      ? 'close'
      : 'medium');
  const shotScale = String(rawScale).toLowerCase();
  const composition = scene.composition || 'portrait-focus';

  const scaleDescriptions = {
    wide: 'SCALE LOCK: WIDE ENVIRONMENTAL ILLUSTRATION. Substantial room context (~50%+ environment). People smaller, uncropped.',
    medium: 'SCALE LOCK: MEDIUM INTERACTION ILLUSTRATION. Torso and physical action with room context.',
    close: 'SCALE LOCK: CLOSE REACTION ILLUSTRATION. One primary face / shoulders / hands dominates frame. Minimal environment. No two-person sofa framing.',
    detail: 'SCALE LOCK: DETAIL INSERT. Object or hand action dominates ~60%+ attention. No full seated two-person composition. No both full faces.',
    release: 'SCALE LOCK: RELEASE / BREATHING FRAME. Quiet environmental visual. Zero people, zero hands or body parts when contract is 0..0.',
  };

  const compositionDescriptions = {
    'full-bleed': 'Vertical 9:16 framing.',
    'editorial-left': 'Subject left framing.',
    'editorial-right': 'Subject right framing.',
    'portrait-focus': 'Vertical portrait framing.',
    'detail-insert': 'Detail insert framing.',
    paper: 'Keepsake framing.',
  };

  const scaleText = scaleDescriptions[shotScale] || scaleDescriptions.medium;
  const compText = compositionDescriptions[composition] || compositionDescriptions['portrait-focus'];

  const lines = [
    scaleText,
    compText,
  ];

  if (scene.silhouette) {
    lines.push(`SILHOUETTE: ${scene.silhouette}.`);
  }
  if (scene.visualVerb && scene.visualVerb !== 'symbolic-detail') {
    lines.push(`ACTION VERB: ${scene.visualVerb}.`);
  }

  return lines.join('\n');
}

function buildGenericCastPrompt(scene) {
  if (scene.character === 'male') {
    return [
      'CAST:',
      'Use one natural Vietnamese male-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Exact facial likeness across different generated images is not required; maintain consistent styling.',
      'Do not use stick figures.',
    ].join('\n');
  }

  if (scene.character === 'female') {
    return [
      'CAST:',
      'Use one natural Vietnamese female-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Exact facial likeness across different generated images is not required; maintain consistent styling.',
      'Do not use stick figures.',
    ].join('\n');
  }

  return [
    'CAST:',
    'Use natural Vietnamese editorial human characters only when the scene needs people.',
    'Exact facial likeness across different generated images is not required; maintain consistent styling.',
    'Do not use stick figures, diagram people, icon people, mannequins, or infographic characters.',
    'Do not add random extra people.',
  ].join('\n');
}

function compactCastMember(desc) {
  return String(desc || '')
    .replace(/,\s*fixed\s+(?:oval|distinct|soft)?\s*facial\s+design/gi, '')
    .replace(/,\s*NO GLASSES unless explicitly requested/gi, '')
    .replace(/,\s*NO GLASSES/gi, '')
    .replace(/,\s*30–34/g, '')
    .replace(/,\s*34/g, '')
    .replace(/,\s*32/g, '')
    .replace(/,\s*50/g, '')
    .replace(/,\s*48/g, '')
    .replace(/,\s*68/g, '')
    .replace(/,\s*65/g, '')
    .replace(/,\s*28/g, '')
    .replace(/,\s*27/g, '')
    .replace(/,\s*26/g, '')
    .replace(/,\s*8/g, '')
    .replace(/,\s*7/g, '')
    .replace(/,\s*6/g, '')
    .replace(/,\s*5–6/g, '')
    .replace(/Vietnamese adult,\s*27–32,\s*distinct fixed soft facial design,\s*shoulder-length or tied black hair,\s*warm neutral clothing\.?/i, 'Vietnamese adult, soft face, tied black hair, neutral clothes.')
    .replace(/Vietnamese adult,\s*27–32,\s*fixed oval facial design,\s*short styled dark brown hair,\s*casual clothing\.?/i, 'Vietnamese adult, oval face, dark brown hair, casual clothes.')
    .replace(/distinct\s+fixed\s+/gi, '')
    .replace(/fixed\s+soft\s+facial\s+design/gi, 'soft face')
    .replace(/fixed\s+oval\s+facial\s+design/gi, 'oval face')
    .replace(/,\s*adult–32/g, '')
    .replace(/,\s*27–32/g, '')
    .replace(/,\s*24–28/g, '')
    .replace(/,\s*26–29/g, '')
    .replace(/shoulder-length or tied/gi, 'tied/shoulder')
    .replace(/casual\s+clothing/gi, 'clothes')
    .replace(/casual\s+attire/gi, 'clothes')
    .replace(/warm\s+neutral\s+clothing/gi, 'neutral clothes')
    .replace(/,\s*straight\s+brows/gi, '')
    .replace(/,\s*warm\s+almond\s+eyes/gi, '')
    .replace(/,\s*warm\s+eyes/gi, '')
    .replace(/,\s*clean-shaven/gi, '')
    .replace(/short straight black hair with a neat side part/gi, 'short neat black hair')
    .replace(/black hair in one fixed low bun with two subtle loose strands/gi, 'black hair in low bun')
    .replace(/short slightly spiky black fringe/gi, 'short black hair')
    .replace(/neat bob haircut with straight bangs/gi, 'bob haircut')
    .replace(/sage overshirt,\s*cream T-shirt,\s*charcoal trousers/gi, 'sage overshirt, charcoal pants')
    .replace(/warm beige cardigan,\s*cream dress/gi, 'beige cardigan, cream dress')
    .replace(/sage cotton T-shirt/gi, 'sage tee')
    .replace(/warm cream dress/gi, 'cream dress')
    .replace(/,\s*round-soft\s+face/gi, ', round face')
    .trim();
}

export function buildPresentCastPrompt(scene, castId, { compact = false } = {}) {
  const min = typeof scene.peopleMin === 'number'
    ? scene.peopleMin
    : (typeof scene.peopleContract?.min === 'number' ? scene.peopleContract.min : (scene.noPeople ? 0 : null));
  const max = typeof scene.peopleMax === 'number'
    ? scene.peopleMax
    : (typeof scene.peopleContract?.max === 'number' ? scene.peopleContract.max : (scene.noPeople ? 0 : null));

  const isZeroPeople =
    scene.noPeople ||
    max === 0 ||
    (min === 0 && max === 0) ||
    scene.visualMode === 'EMPTY_RELEASE' ||
    scene.visualMode === 'OBJECT_DETAIL' ||
    (Array.isArray(scene.presentMembers) && scene.presentMembers.length === 0);

  if (isZeroPeople) {
    return [
      'PEOPLE LOCK: ZERO PEOPLE.',
      'NO PEOPLE in frame.',
      'ZERO visible people/body parts, zero extra/background faces, zero hands, zero arms, or reflections in frame.',
      'No framed portraits or wall art depicting human faces.',
      'Show only believable traces of the activity that just happened.',
    ].join('\n');
  }

  let countDirective = '';
  if (min === 0 && max === 0) {
    countDirective = compact
      ? 'PEOPLE LOCK: ZERO visible people.'
      : 'PEOPLE LOCK: ZERO visible people/body parts in frame.';
  } else if (min === 1 && max === 1) {
    countDirective = compact
      ? 'PEOPLE LOCK: EXACTLY one visible person.'
      : 'PEOPLE LOCK: EXACTLY one visible person. No second person, background people, extra/background faces, or portraits.';
  } else if (min === 2 && max === 2) {
    countDirective = compact
      ? 'PEOPLE LOCK: EXACTLY two visible people.'
      : 'PEOPLE LOCK: EXACTLY two visible people. No third person, background people, extra/background faces, or portraits.';
  } else if (min === 3 && max === 3) {
    countDirective = 'PEOPLE LOCK: EXACTLY three visible people.';
  } else if (typeof min === 'number' && typeof max === 'number') {
    countDirective = `PEOPLE LOCK: Between ${min} and ${max} visible people.`;
  }

  const cast = CHARACTER_CASTS[castId];
  if (!cast) {
    return [
      countDirective,
      buildGenericCastPrompt(scene),
      'Exact facial likeness across different generated images is NOT required.',
      'Coherent styling, no extra people.',
    ].filter(Boolean).join('\n');
  }

  const validMemberKeys = cast.members ? Object.keys(cast.members) : [];

  const targetMembers = scene.visibleMembers !== undefined ? scene.visibleMembers : scene.presentMembers;
  let requested;
  if (Array.isArray(targetMembers) && targetMembers.length > 0) {
    const invalid = targetMembers.filter((m) => !cast.members || !cast.members[m]);
    if (invalid.length > 0) {
      throw new Error(
        `Invalid cast member "${invalid[0]}" for cast "${castId}". Valid members: ${validMemberKeys.join(', ')}`
      );
    }
    requested = targetMembers;
  } else if (Array.isArray(targetMembers) && targetMembers.length === 0) {
    requested = [];
  } else if (max === 1 && validMemberKeys.length > 1) {
    requested = [validMemberKeys[0]];
  } else if (typeof max === 'number' && validMemberKeys.length > max) {
    requested = validMemberKeys.slice(0, max);
  } else {
    requested = validMemberKeys;
  }

  if (requested.length === 0) {
    return [
      'PEOPLE LOCK: ZERO PEOPLE.',
      'NO PEOPLE in frame.',
      'ZERO visible people/body parts, zero extra/background faces, zero hands, zero arms, or reflections in frame.',
      'No framed portraits or wall art depicting human faces.',
      'Show only believable traces of the activity that just happened.',
    ].join('\n');
  }

  const lines = requested
    .map((memberId) => `${memberId}: ${compact ? compactCastMember(cast.members[memberId]) : cast.members[memberId]}`);

  let outputLines;
  if (compact) {
    outputLines = [
      countDirective,
      'CAST CONTINUITY: ' + lines.join('; '),
    ];
  } else {
    outputLines = [
      countDirective,
      `CAST CONTINUITY — ${castId}:`,
      ...lines,
      'Exact facial likeness across different generated images is NOT required.',
      'Coherent styling, no extra people.',
    ];
  }

  return outputLines.filter(Boolean).join('\n');
}

function buildWorldPrompt(scene) {
  if (scene.worldLock) {
    const cleaned = scene.worldLock
      .replace(/^WORLD LOCK:\s*[\w-]+(?:\s*—|\n)?\s*/i, '')
      .replace(/Keep these dialogue anchors strictly consistent across all dialogue scenes\.?\s*/i, '')
      .replace(/Keep these living-room anchors strictly consistent across all scenes\.?\s*/i, '')
      .replace(/Keep these stable anchors across all connected scenes\.?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    return `WORLD: ${cleaned}`;
  }
  return 'WORLD: Believable Vietnamese everyday-life setting.';
}

function buildNegativeRules(scene) {
  const rules = [
    'NEGATIVE EXCLUSIONS: NO WORDS, LETTERS, NUMBERS, LABELS, MARKS, WATERMARKS, TEXT POLLUTION, SIGNATURES, PSEUDO-TEXT.',
    'STRICTLY BAN: NO speech bubbles, dialogue balloons, comic bubbles, thought bubbles, quotation text, captions, subtitles, signatures, pseudo-writing, handwriting, calligraphy, fake characters.',
    'NO ARTIST SIGNATURE: STRICTLY PROHIBIT artist signature, corner initials, creator mark, stamp, seal, watermark, copyright symbol, especially in bottom-right, bottom-left, poster corners, or picture-frame corners.',
    'NO TEXT POLLUTION: ZERO readable poster text, signage text, book-cover text, package labels, clothing text, wall-art lettering, decorative typography, random glyphs, or fake Asian/Latin characters.',
    'HARD EXCLUSIONS: NO photorealism, photographic interior, photographic lighting, lens blur, shallow DOF, skin pores, hair strands, CGI, 3D render, DSLR.',
  ];

  if (scene.storyRole === 'detail-action' || scene.scale === 'detail' || scene.scale === 'DETAIL') {
    rules.push('Object actively used by hand, no product shot.');
  }

  return rules.join('\n');
}

export function buildPrompt(scene, castId) {
  const rawAction = scene.action || scene.visual || scene.text || '';
  const rawMeaning = scene.text || scene.visual || '';
  let sceneMeaning = rawMeaning
    .replace(/Show a concrete everyday relationship behavior with two people doing something, not a generic emotional portrait\.?\s*/i, '')
    .replace(/\.?\s*Visual priority hint:\s*/i, '')
    .replace(/\.\s*Convert this priority.*$/i, '.')
    .trim();

  const min = typeof scene.peopleMin === 'number'
    ? scene.peopleMin
    : (typeof scene.peopleContract?.min === 'number' ? scene.peopleContract.min : (scene.noPeople ? 0 : null));
  const max = typeof scene.peopleMax === 'number'
    ? scene.peopleMax
    : (typeof scene.peopleContract?.max === 'number' ? scene.peopleContract.max : (scene.noPeople ? 0 : null));

  const isZeroPeople =
    scene.noPeople ||
    max === 0 ||
    (min === 0 && max === 0) ||
    scene.visualMode === 'EMPTY_RELEASE' ||
    scene.visualMode === 'OBJECT_DETAIL' ||
    (Array.isArray(scene.presentMembers) && scene.presentMembers.length === 0);

  let action = rawAction;
  const actionLower = String(rawAction || '').toLowerCase();

  if (isZeroPeople) {
    sceneMeaning = 'Still atmosphere in the quiet everyday domestic living space after conversation.';

    const forbidden = ['two people', 'two-person', 'speaker', 'listener', 'hands', 'person', 'people', 'human', 'face'];
    for (const term of forbidden) {
      if (term === 'face' && (actionLower.includes('face-down') || actionLower.includes('face down') || actionLower.includes('screen down'))) {
        continue;
      }
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(actionLower)) {
        if (
          !actionLower.includes(`no ${term}`) &&
          !actionLower.includes(`without ${term}`) &&
          !actionLower.includes(`zero ${term}`) &&
          !actionLower.includes(`no visible ${term}`) &&
          !actionLower.includes(`zero visible ${term}`)
        ) {
          throw new Error(`PROMPT_PEOPLE_CONTRADICTION: Zero-people beat action instructs "${term}" in: "${action}"`);
        }
      }
    }

    if (scene.visualMode === 'OBJECT_DETAIL') {
      action = 'Two ceramic cups rest quietly on low wooden coffee table with steam rising, phone resting face-down and unused.';
    } else {
      action = 'Still atmosphere in the quiet everyday domestic living space after conversation. Two cups on table, empty sofa, ZERO people.';
    }
  } else if (scene.visualVerb === 'đặt' || String(scene.text || '').includes('đặt điện thoại') || actionLower.includes('đặt') || actionLower.includes('face-down') || actionLower.includes('put away')) {
    if (actionLower.includes('holding the phone') || actionLower.includes('visibly holding') || actionLower.includes('cầm điện thoại') || actionLower.includes('phone in hand') || actionLower.includes('gripping')) {
      throw new Error(`PROMPT_ACTION_CONTRADICTION: Beat action instructs holding phone when verb requires placing phone down`);
    }
    action = 'Phone resting FACE-DOWN and FLAT on wooden table. Hand released and away from phone. Phone is NOT held.';
  } else {
    action = action
      .replace(/^Close reaction framing of /i, '')
      .replace(/, sole human in frame, no second person\.?$/i, '.')
      .replace(/, exactly one person in entire frame, no second body\.?$/i, '.');
  }

  const rawPayload = (
    scene.semanticAnchor?.rawSemantic ||
    (Array.isArray(scene.mustShow) && scene.mustShow[0]) ||
    scene.priorityVisualSource ||
    ''
  ).trim();

  const shouldAvoidPortrait = Boolean(
    scene.semanticAnchor?.avoidGenericFallback ||
    scene.avoidGenericFallback ||
    scene.priorityVisualSource
  );

  if (rawPayload && shouldAvoidPortrait && !isZeroPeople) {
    if (!actionLower.includes('face-down') && !actionLower.includes('phone') && !actionLower.includes('đặt điện thoại')) {
      action = `A concrete domestic scene illustrating: "${rawPayload}". Visibly carry out this tangible action and object interaction; avoid generic family portrait fallback.`;
    }
  }

  // 1. ACTION / PHYSICAL END-STATE (SEMANTIC-FIRST: lead with concrete visible action & object)
  const leadSemantic = (rawPayload && !isZeroPeople)
    ? `SCENE SEMANTIC PAYLOAD: "${rawPayload}". Focus directly on this tangible action, physical setting, and domestic objects.`
    : (scene.semanticAnchor?.action && !isZeroPeople
      ? `${scene.semanticAnchor.action}. Focus on ${scene.semanticAnchor.object || 'the central subject'}.`
      : (sceneMeaning && sceneMeaning !== action ? `${sceneMeaning}.` : ''));

  const sectionAction = [
    'ACTION / PHYSICAL END-STATE:',
    `ACTION: ${action}`,
    leadSemantic ? `SCENE FOCUS: ${leadSemantic}` : null,
  ].filter(Boolean).join('\n');

  // 2. WORLD / OBJECTS & SETTING
  let worldText = '';
  if (scene.worldLock) {
    worldText = scene.worldLock
      .replace(/^WORLD LOCK:\s*[\w-]+(?:\s*—|\n)?\s*/i, '')
      .replace(/Keep these dialogue anchors strictly consistent across all dialogue scenes\.?\s*/i, '')
      .replace(/Keep these living-room anchors strictly consistent across all scenes\.?\s*/i, '')
      .replace(/Keep these stable anchors across all connected scenes\.?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    worldText = 'Vietnamese everyday domestic living room setting.';
  }
  if (worldText.length > 50 && worldText.includes('.')) {
    worldText = worldText.split('.')[0].trim() + '.';
  } else if (worldText.length > 50) {
    worldText = worldText.slice(0, 45).replace(/,[^,]*$/, '') + '.';
  }
  worldText = worldText.replace(/conversation area/i, 'space');
  const timeSetting = scene.semanticAnchor?.timeCue ? ` Time: ${scene.semanticAnchor.timeCue}.` : '';
  const sectionWorld = `WORLD / OBJECTS: ${worldText}${timeSetting}`;

  // 3. PEOPLE CONTRACT
  let sectionPeople = '';
  if (isZeroPeople) {
    sectionPeople = 'PEOPLE LOCK: ZERO PEOPLE. Zero visible people.';
  } else {
    sectionPeople = buildPresentCastPrompt(scene, castId, { compact: true });
  }

  // 4. MEDIUM + STYLE LOCK
  const styleHeader = 'MEDIUM / STYLE LOCK: HAY & ĐẸP.';
  const styleBody = isZeroPeople
    ? 'Clean 2D hand-drawn editorial illustration, charcoal/sepia lines, matte gouache fills, non-photorealistic.'
    : 'Clean 2D hand-drawn editorial illustration, charcoal/sepia lines, simplified features, non-photorealistic.';
  const sectionStyle = [
    `${styleHeader}\n${styleBody}`,
    'RENDERING RECIPE: Matte gouache fills. Clearly DRAWN, not photographed.',
    'PALETTE: Ivory/cream, muted sage, warm wood, terracotta/amber accents.',
  ].join('\n');

  // 5. VISUAL MODE & SCALE LOCK
  const rawScale =
    scene.scale ||
    scene.shotScale ||
    (scene.type === 'hook'
      ? 'wide'
      : scene.type === 'ending'
      ? 'close'
      : 'medium');
  const shotScale = String(rawScale).toLowerCase();
  const scaleDescriptions = {
    wide: 'SCALE LOCK: WIDE. Room context (~50%+ environment).',
    medium: 'SCALE LOCK: MEDIUM. Torso and physical interaction with room context.',
    close: 'SCALE LOCK: CLOSE. One face and shoulders dominate frame.',
    detail: isZeroPeople
      ? 'SCALE LOCK: DETAIL. Quiet tabletop object detail dominates frame.'
      : 'SCALE LOCK: DETAIL. Object or hand action dominates frame.',
    release: 'SCALE LOCK: RELEASE. Quiet environmental breathing room. Zero people, zero hands.',
  };
  const scaleText = scaleDescriptions[shotScale] || scaleDescriptions.medium;
  const sil = scene.silhouette ? ` Silhouette: ${scene.silhouette}.` : '';
  const sectionScale = [
    'VISUAL MODE & SCALE LOCK:',
    `VISUAL MODE: ${scene.visualMode || 'SOLO_MEDIUM'}. ${scaleText}`,
    `FRAMING: Vertical 9:16.${sil}`,
  ].join('\n');

  // 6. TEXT-BEARING OBJECT SUBSTITUTIONS (HARDENING)
  const objectRules = [];
  const textHaystack = `${actionLower} ${rawMeaning.toLowerCase()} ${String(scene.worldLock || '').toLowerCase()}`;
  if (textHaystack.includes('phone') || textHaystack.includes('điện thoại') || textHaystack.includes('screen') || textHaystack.includes('màn hình')) {
    objectRules.push('OBJECT SUBSTITUTION (PHONE/SCREEN): Physical device with blank screen; screen OFF or face-down; zero readable text, digits, or logos.');
  }
  if (textHaystack.includes('book') || textHaystack.includes('sách') || textHaystack.includes('notebook') || textHaystack.includes('sổ') || textHaystack.includes('paper') || textHaystack.includes('trang')) {
    objectRules.push('OBJECT SUBSTITUTION (BOOK/PAPER): Plain blank covers, blank pages or soft abstract marks only; zero readable words, letters, or handwriting.');
  }
  if (textHaystack.includes('poster') || textHaystack.includes('wall art') || textHaystack.includes('tranh') || textHaystack.includes('decor') || textHaystack.includes('print')) {
    objectRules.push('OBJECT SUBSTITUTION (WALL ART): Simple botanical shapes or plain empty frames; zero quotes, letters, typographic posters, or calligraphy.');
  }
  if (textHaystack.includes('package') || textHaystack.includes('packaging') || textHaystack.includes('hộp') || textHaystack.includes('gói') || textHaystack.includes('chai') || textHaystack.includes('lọ') || textHaystack.includes('label')) {
    objectRules.push('OBJECT SUBSTITUTION (PACKAGING): Completely unlabeled packaging, plain container, zero brand labels or barcodes.');
  }
  const sectionObjects = objectRules.length > 0 ? objectRules.join('\n') : null;

  // 7. EXCLUSIONS & NEGATIVE CONTRACT
  const exclusions = [
    'NEGATIVE EXCLUSIONS: NO WORDS, LETTERS, NUMBERS, LABELS, MARKS, WATERMARKS, TEXT POLLUTION.',
    'STRICTLY BAN: NO speech bubbles, dialogue balloons, comic bubbles, thought bubbles, quotation text, captions, subtitles, signatures, pseudo-writing.',
    'NO ARTIST SIGNATURE: STRICTLY PROHIBIT artist signature, corner initials, creator mark, stamp, seal, watermark in corners.',
    'NO TEXT POLLUTION: ZERO readable poster text, signage text, book-cover text, package labels, clothing text, wall lettering, random glyphs, fake characters.',
    'HARD EXCLUSIONS: NO photorealism, photographic interior, photographic lighting, lens blur, shallow depth of field, skin pores, hair strands, CGI, 3D render.',
  ];
  if (min === 0 && max === 0) {
    exclusions.push('PEOPLE NEGATIVES: NO PEOPLE, background people, extra/background faces, portraits, framed photos, human reflections.');
  } else if (max === 1) {
    exclusions.push('PEOPLE NEGATIVES: NO second person, background people, extra/background faces, human portraits, framed photos, reflections.');
  } else if (max === 2) {
    exclusions.push('PEOPLE NEGATIVES: NO third person, background people, extra/background faces, human portraits, framed photos, reflections.');
  }
  const safetyRules = buildImageSafetyRulesForShot(scene);
  if (safetyRules.length > 0) {
    exclusions.push(...safetyRules);
  }
  const sectionExclusions = exclusions.join('\n');

  let sections = scene.legacyOrder
    ? [sectionStyle, sectionScale, sectionPeople, sectionAction, sectionWorld, sectionExclusions].filter(Boolean)
    : [sectionAction, sectionWorld, sectionPeople, sectionStyle, sectionScale, sectionObjects, sectionExclusions].filter(Boolean);

  let full = sections.join('\n\n');

  if (full.length > 1380) {
    let compactWorld = sectionWorld;
    if (compactWorld.length > 35) {
      const match = compactWorld.match(/WORLD \/ OBJECTS:\s*([^.]+)/i);
      if (match) {
        compactWorld = `WORLD / OBJECTS: ${match[1].slice(0, 30)}.`;
      }
    }
    let compactScale = `SCALE LOCK: ${shotScale.toUpperCase()}. Vertical 9:16.${sil}`;
    let compactAction = sectionAction;
    if (compactAction.length > 180) {
      compactAction = `ACTION / PHYSICAL END-STATE:\nACTION: ${action || leadSemantic}`;
    }
    const compactStyle = [
      `${styleHeader}\n${styleBody}`,
      'RENDERING: Matte gouache. Clearly DRAWN.',
    ].join('\n');

    sections = scene.legacyOrder
      ? [compactStyle, compactScale, sectionPeople, compactAction, compactWorld, sectionExclusions].filter(Boolean)
      : [compactAction, compactWorld, sectionPeople, compactStyle, compactScale, sectionObjects, sectionExclusions].filter(Boolean);
    full = sections.join('\n\n');

    if (full.length > 1400) {
      let compactObj = sectionObjects;
      if (compactObj && compactObj.length > 140) {
        const compactRules = [];
        if (textHaystack.includes('phone') || textHaystack.includes('điện thoại') || textHaystack.includes('screen') || textHaystack.includes('màn hình')) {
          compactRules.push('OBJECT SUBSTITUTION: Blank phone/device screen face-down, zero text/digits/UI.');
        }
        if (textHaystack.includes('book') || textHaystack.includes('sách') || textHaystack.includes('notebook') || textHaystack.includes('sổ') || textHaystack.includes('paper') || textHaystack.includes('trang')) {
          compactRules.push('OBJECT SUBSTITUTION: Plain blank book/pages, zero text/letters.');
        }
        if (textHaystack.includes('poster') || textHaystack.includes('wall art') || textHaystack.includes('tranh') || textHaystack.includes('decor') || textHaystack.includes('print')) {
          compactRules.push('OBJECT SUBSTITUTION: Simple botanical shapes or empty frame, zero text/quotes.');
        }
        if (textHaystack.includes('package') || textHaystack.includes('packaging') || textHaystack.includes('hộp') || textHaystack.includes('gói') || textHaystack.includes('chai') || textHaystack.includes('lọ') || textHaystack.includes('label')) {
          compactRules.push('OBJECT SUBSTITUTION: Plain unlabeled containers, zero logos/barcodes.');
        }
        compactObj = compactRules.join('\n');
      }

      const compactExclusionsList = [
        'NEGATIVE EXCLUSIONS: NO WORDS, LETTERS, NUMBERS, LABELS, MARKS, WATERMARKS, TEXT POLLUTION.',
        'STRICTLY BAN: NO speech bubbles, dialogue balloons, comic bubbles, thought bubbles, quotation text, captions, subtitles, signatures, pseudo-writing.',
        'NO ARTIST SIGNATURE: STRICTLY PROHIBIT artist signature, corner initials, watermark in corners.',
        'NO TEXT POLLUTION: ZERO readable text, signage, labels, wall lettering, fake characters.',
        'HARD EXCLUSIONS: NO photorealism, photographic interior, photographic lighting, lens blur, shallow depth of field, skin pores, CGI, 3D render.',
      ];
      if (min === 0 && max === 0) {
        compactExclusionsList.push('PEOPLE NEGATIVES: NO PEOPLE, background people, extra/background faces, portraits, framed photos.');
      } else if (max === 1) {
        compactExclusionsList.push('PEOPLE NEGATIVES: NO second person, background people, extra/background faces, human portraits, framed photos.');
      } else if (max === 2) {
        compactExclusionsList.push('PEOPLE NEGATIVES: NO third person, background people, extra/background faces, human portraits, framed photos.');
      }
      let compactExcl = compactExclusionsList.join('\n');

      if (compactWorld.length > 20) {
        const match = compactWorld.match(/WORLD \/ OBJECTS:\s*([^.]+)/i);
        if (match) {
          compactWorld = `WORLD / OBJECTS: ${match[1].slice(0, 15)}.`;
        }
      }
      sections = scene.legacyOrder
        ? [compactStyle, compactScale, sectionPeople, compactAction, compactWorld, compactExcl].filter(Boolean)
        : [compactAction, compactWorld, sectionPeople, compactStyle, compactScale, compactObj, compactExcl].filter(Boolean);
      full = sections.join('\n\n');

      if (full.length > 1520) {
        const tighterExcl = [
          'NEGATIVE EXCLUSIONS: NO WORDS, LETTERS, NUMBERS, LABELS, MARKS, WATERMARKS, SIGNATURES, TEXT POLLUTION.',
          'STRICTLY BAN: NO speech/thought bubbles, captions, subtitles, signatures, pseudo-writing, fake characters.',
          'NO ARTIST SIGNATURE: STRICTLY PROHIBIT artist signature, corner initials, watermark in corners.',
          'NO TEXT POLLUTION: ZERO readable text, signage, labels, wall lettering.',
          'HARD EXCLUSIONS: NO photorealism, photographic interior, lens blur, shallow depth of field, skin pores, CGI, 3D render.',
        ];
        if (min === 0 && max === 0) {
          tighterExcl.push('PEOPLE NEGATIVES: NO PEOPLE, background people, extra/background faces, portraits, framed photos.');
        } else if (max === 1) {
          tighterExcl.push('PEOPLE NEGATIVES: NO second person, background people, extra/background faces, portraits, framed photos.');
        } else if (max === 2) {
          tighterExcl.push('PEOPLE NEGATIVES: NO third person, background people, extra/background faces, portraits, framed photos.');
        }
        compactExcl = tighterExcl.join('\n');

        let tightAction = compactAction
          .replace(/; avoid generic family portrait fallback/gi, '')
          .replace(/\. Visibly carry out this tangible action and object interaction/gi, '')
          .replace(/\s*Focus directly on this tangible action, physical setting, and domestic objects\.?/gi, '');

        sections = scene.legacyOrder
          ? [compactStyle, compactScale, sectionPeople, tightAction, compactWorld, compactExcl].filter(Boolean)
          : [tightAction, compactWorld, sectionPeople, compactStyle, compactScale, compactObj, compactExcl].filter(Boolean);
        full = sections.join('\n\n');
      }
    }
  }

  // Full Prompt Preflight Contract Validation:
  const contractRes = validateFinalImagePromptContract({
    prompt: full,
    visualMode: scene.visualMode,
    peopleContract: { min, max },
    visibleMembers: scene.visibleMembers || scene.presentMembers,
    visualVerb: scene.visualVerb,
  });
  if (!contractRes.valid) {
    throw new Error(`PROMPT_CONTRACT_VALIDATION_FAILED: ${contractRes.error}`);
  }

  // ObjectDetailContract Validation
  const objDetailRes = validateObjectDetailContract({
    visualMode: scene.visualMode,
    scale: scene.scale,
    shotScale: scene.shotScale,
    visibleMembers: scene.visibleMembers,
    peopleContract: { min, max },
    visiblePeopleContract: scene.peopleContract,
    silhouette: scene.silhouette,
    prompt: full,
  });
  if (!objDetailRes.valid) {
    throw new Error(`OBJECT_DETAIL_VALIDATION_FAILED: ${objDetailRes.error}`);
  }

  if (full.length > 1600) {
    throw new Error(
      `Image prompt too long: ${full.length} chars (hard max 1600). ` +
      `Compact individual sections; do not blind-slice.`,
    );
  }

  return full;
}

export function computeSeeds({ slug, video, text, castId, sceneIndex = 0, explicitSeed }) {
  if (Number.isFinite(explicitSeed) && explicitSeed !== null) {
    const s = explicitSeed >>> 0;
    return { videoSeed: s, castSeed: s, sceneSeed: s };
  }
  const identityText = slug || video || String(text || '').slice(0, 48);
  const videoSeed = parseInt(crypto.createHash('sha256').update(String(identityText)).digest('hex').slice(0, 8), 16) >>> 0;
  const castKey = `${videoSeed}|${castId || 'neutral'}`;
  const castSeed = parseInt(crypto.createHash('sha256').update(castKey).digest('hex').slice(0, 8), 16) >>> 0;
  const sceneSeed = (castSeed + ((Number(sceneIndex) || 0) * 7919)) >>> 0;
  return { videoSeed, castSeed, sceneSeed };
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
    const err = new Error(`Cloudflare fetch ${response.status}: ${body.slice(0, 1000)}`);
    if (response.status === 429 || body.includes('429') || /rate limit|quota/i.test(body)) {
      err.isQuota429 = true;
    }
    throw err;
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
    const err = new Error(`Cloudflare curl ${status || 'unknown status'}: ${body.slice(0, 1000)}`);
    if (status === '429' || /rate limit|quota/i.test(body)) {
      err.isQuota429 = true;
    }
    throw err;
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
  const requestBody = JSON.stringify({ prompt });

  try {
    return await callCloudflareWithFetch(url, token, requestBody);
  } catch (fetchErr) {
    if (fetchErr.isQuota429) {
      throw fetchErr;
    }
    console.error('Retrying Cloudflare with curl...');
    try {
      return callCloudflareWithCurl(url, token, requestBody);
    } catch (curlErr) {
      if (curlErr.isQuota429) {
        throw curlErr;
      }
      throw new Error(`Cloudflare API failed via fetch and curl. fetch: ${fetchErr.message}; curl: ${curlErr.message}`);
    }
  }
}

function compressJpeg(inputPath, outputPath) {
  const result = spawnSync('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-q:v', '3',
    outputPath,
  ], {
    cwd: ROOT,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    fs.copyFileSync(inputPath, outputPath);
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

function appendGeneratedAsset(manifest, scene, reservedAsset, attempt = 1) {
  const asset = {
    id: reservedAsset.id,
    path: reservedAsset.manifestPath,
    desc: scene.visual || `AI-generated illustration for: ${scene.text.slice(0, 140)}`,
    tags: deriveTags(scene.text, scene.mood, scene.character),
    mood: scene.mood || 'reflective',
    source: 'cloudflare',
    tier: ASSET_TIERS.CANDIDATE,
    castId: scene.castId || undefined,
    storyRole: scene.storyRole || undefined,
    worldId: scene.worldId || undefined,
    continuityGroup: scene.continuityGroup || undefined,
    scale: scene.scale || undefined,
    silhouette: scene.silhouette || undefined,
    visualVerb: scene.visualVerb || undefined,
    attempt,
    reuse: false,
  };

  manifest.assets = [...(manifest.assets || []), asset];
  writeManifest(manifest);
  return asset;
}

async function main() {
  ensureProjectEnvLoaded(ROOT);

  const args = parseArgs(process.argv);
  const character = inferCharacterFromText(args.text, args.character);
  const castId = args.cast || inferCastId(args.text);
  const scene = {
    text: args.text,
    type: args.type,
    mood: args.mood,
    character,
    castId,
    noPeople: args.noPeople,
    peopleMin: args.peopleMin,
    peopleMax: args.peopleMax,
    presentMembers: args.presentMembers,
    visual: args.visual,
    storyRole: args.storyRole || undefined,
    action: args.action || undefined,
    worldId: args.worldId || undefined,
    worldLock: args.worldLock || undefined,
    shotScale: args.shotScale || undefined,
    scale: args.scale || undefined,
    silhouette: args.silhouette || undefined,
    visualVerb: args.visualVerb || undefined,
    semanticIntent: args.semanticIntent || undefined,
    composition: args.composition || undefined,
  };

  const manifest = readManifest();
  const excludeSet = new Set((args.exclude || '').split(',').map((s) => s.trim()).filter(Boolean));
  const best = selectExistingAsset(manifest, scene, excludeSet);

  const isHighTier = best && (effectiveTier(best.asset) === ASSET_TIERS.CORE || effectiveTier(best.asset) === ASSET_TIERS.COMPATIBLE);
  const passesConfidence = args.strictHayDep
    ? canReuseForHayDep(best, scene, args.threshold)
    : (best && isConfidentExistingMatch(best, args.threshold));

  if (passesConfidence && (isHighTier || !args.generate)) {
    console.error(`Using existing asset "${best.asset.id}" (score ${best.score}, tier: ${best.asset.tier || 'unspecified'}).`);
    console.log(JSON.stringify({
      source: 'manifest',
      confidence: 'high',
      score: best.score,
      reasons: best.reasons,
      image: {
        assetId: best.asset.id,
        path: best.asset.path,
      },
      asset: best.asset,
    }, null, 2));
    return;
  }

  if (!args.generate) {
    if (args.strictHayDep) {
      throw new Error(`No safe compatible asset found in strict HAY & ĐẸP. mode for: "${scene.text}"`);
    }
    if (!best) throw new Error('No manifest assets available');
    console.error(`No asset passed the semantic confidence gate; falling back to "${best.asset.id}" (score ${best.score}).`);
    console.log(JSON.stringify({
      source: 'fallback',
      score: best.score,
      reasons: best.reasons,
      image: {
        assetId: best.asset.id,
        path: best.asset.path,
      },
      asset: best.asset,
    }, null, 2));
    return;
  }

  const prompt = buildPrompt(scene, castId);
  const seeds = computeSeeds({
    slug: args.slug,
    video: args.video,
    text: scene.text,
    castId,
    sceneIndex: args.sceneIndex,
    explicitSeed: args.seed,
  });
  const seed = seeds.sceneSeed;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'human-insight-image-'));
  const rawPath = path.join(tempDir, 'raw.jpg');
  const reservedAsset = reserveGeneratedAsset(manifest, scene);

  const maxAttempts = 3;
  let lastErr = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.error(`Generating with Cloudflare Workers AI [attempt ${attempt}/${maxAttempts}] (seed: ${seed}, cast: ${castId || 'none'})...`);
      const imageBuffer = await generateWithCloudflare(prompt, seed);
      fs.writeFileSync(rawPath, imageBuffer);
      compressJpeg(rawPath, reservedAsset.outputPath);
      const asset = appendGeneratedAsset(manifest, scene, reservedAsset, attempt);
      console.error(`Generated asset "${asset.id}" at ${asset.path} on attempt ${attempt}.`);
      console.log(JSON.stringify({
        source: 'generated',
        castId: castId || null,
        attempt,
        seeds,
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
      return;
    } catch (err) {
      if (err.isQuota429 || err.message?.includes('429') || /rate limit|quota/i.test(err.message || '')) {
        console.error(`🛑 HTTP 429 QUOTA HIT on Cloudflare: ${err.message}`);
        const quotaErr = new Error(`PAUSED_QUOTA: Cloudflare HTTP 429 quota reached: ${err.message}`);
        quotaErr.isQuota429 = true;
        throw quotaErr;
      }
      lastErr = err;
      console.error(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        console.error(`Waiting 2000ms before attempt ${attempt + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  if (args.strictHayDep) {
    throw new Error(
      `HAY & ĐẸP. image generation failed after ${maxAttempts} attempts: ${lastErr?.message}`,
    );
  }
  if (!best) throw lastErr;
  console.error(`Generation failed: ${lastErr?.message}`);
  console.error(`Falling back to "${best.asset.id}" (score ${best.score}).`);
  console.log(JSON.stringify({
    source: 'fallback-after-generate-failure',
    error: lastErr?.message,
    score: best.score,
    reasons: best.reasons,
    image: {
      assetId: best.asset.id,
      path: best.asset.path,
    },
    asset: best.asset,
  }, null, 2));
}

/**
 * Generates one candidate image for a human-insight shot using Cloudflare FLUX Schnell.
 *
 * @param {object} options
 * @param {string} options.slug
 * @param {object} options.shot - Shot or beat object from storyPlan
 * @param {string} [options.shotId] - Shot identifier (e.g. shot-01)
 * @param {number} [options.attempt=1] - 1-based attempt count (max 3)
 * @param {string} [options.outputPath] - Output destination path for the candidate jpg
 * @param {string} [options.rootDir=ROOT]
 * @param {Function} [options.generatorAdapter] - Optional custom generator for tests/offline
 * @param {string} [options.promptOverride]
 * @returns {Promise<{
 *   success: boolean,
 *   shotId: string,
 *   attempt: number,
 *   outputPath: string,
 *   sha256: string,
 *   isQuota429?: boolean,
 *   error?: string
 * }>}
 */
export async function generateHumanInsightShot(options = {}) {
  const rootDir = options.rootDir || ROOT;
  ensureProjectEnvLoaded(rootDir);

  const slug = options.slug || 'unknown-slug';
  const shot = options.shot || {};
  const shotId = options.shotId || shot.shotId || (shot.id ? shot.id.replace('beat-', 'shot-') : 'shot-01');
  const attempt = options.attempt || 1;
  const outputPath = options.outputPath || path.join(rootDir, 'videos', slug, 'candidates', `${shotId}.jpg`);

  const destDir = path.dirname(outputPath);
  fs.mkdirSync(destDir, { recursive: true });

  const castId = shot.castId || inferCastId(shot.voiceClause || shot.audioText || shot.text, shot.category);
  const prompt = options.promptOverride || buildPrompt({
    ...shot,
    text: shot.voiceClause || shot.audioText || shot.text || '',
    action: shot.visualAction || shot.action || '',
    visual: shot.visualIntent || shot.visual || '',
    scale: shot.scale || shot.shotScale || 'medium',
    silhouette: shot.silhouette || 'single-centered',
    visualVerb: shot.visualVerb,
    worldLock: shot.worldLock,
    peopleContract: shot.peopleContract,
    visiblePeopleContract: shot.visiblePeopleContract,
    visibleMembers: shot.visibleMembers,
    presentMembers: shot.presentMembers,
    noPeople: shot.noPeople,
    visualMode: shot.visualMode,
  }, castId);

  const seeds = computeSeeds({
    slug,
    text: shot.voiceClause || shot.audioText || shot.text || '',
    castId,
    sceneIndex: options.sceneIndex || 0,
    explicitSeed: options.seed,
  });
  const seed = seeds.sceneSeed;

  if (typeof options.generatorAdapter === 'function') {
    const res = await options.generatorAdapter({
      prompt,
      seed,
      shot,
      shotId,
      attempt,
      slug,
      outputPath,
      rootDir,
    });
    if (res && res.isQuota429) {
      const err = new Error(`PAUSED_QUOTA: HTTP 429 quota reached on shot ${shotId}`);
      err.isQuota429 = true;
      err.shotId = shotId;
      throw err;
    }
    if (!fs.existsSync(outputPath)) {
      if (res && res.imageBuffer) {
        fs.writeFileSync(outputPath, res.imageBuffer);
      } else {
        throw new Error(`generatorAdapter did not produce output at ${outputPath}`);
      }
    }
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex');
    return {
      success: true,
      shotId,
      attempt,
      outputPath,
      sha256,
    };
  }

  if (options.allowSynthetic) {
    const dummyJpeg = Buffer.from(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
      'base64'
    );
    fs.writeFileSync(outputPath, dummyJpeg);
    const sha256 = crypto.createHash('sha256').update(dummyJpeg).digest('hex');
    return {
      success: true,
      shotId,
      attempt,
      outputPath,
      sha256,
    };
  }

  // Real Cloudflare Workers AI generation
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'human-insight-shot-'));
  const rawPath = path.join(tempDir, 'raw.jpg');
  try {
    const imageBuffer = await generateWithCloudflare(prompt, seed);
    fs.writeFileSync(rawPath, imageBuffer);
    compressJpeg(rawPath, outputPath);
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex');
    return {
      success: true,
      shotId,
      attempt,
      outputPath,
      sha256,
    };
  } catch (err) {
    if (err.isQuota429 || err.message?.includes('429') || /rate limit|quota/i.test(err.message || '')) {
      const quotaErr = new Error(`PAUSED_QUOTA: Cloudflare HTTP 429 quota reached on shot ${shotId}: ${err.message}`);
      quotaErr.isQuota429 = true;
      quotaErr.shotId = shotId;
      throw quotaErr;
    }
    throw err;
  } finally {
    try {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

export { generateWithCloudflare };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
