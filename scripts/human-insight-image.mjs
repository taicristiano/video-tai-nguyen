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

// Be deliberately conservative when reusing an existing illustration.
// A single mood/emotion overlap must never be enough to suppress generation.
const DEFAULT_THRESHOLD = 14;
const CLOUDFLARE_MODEL = '@cf/black-forest-labs/flux-1-schnell';

// TODO: Audit remaining historical 394 assets into HAYDEP_CORE, HAYDEP_COMPATIBLE, LEGACY_NEP, REJECT_OFFSTYLE
export const ASSET_TIERS = {
  CORE: 'HAYDEP_CORE',
  CANDIDATE: 'HAYDEP_CANDIDATE',
  COMPATIBLE: 'HAYDEP_COMPATIBLE',
  LEGACY: 'LEGACY_NEP',
  REJECT: 'REJECT_OFFSTYLE',
};

export const STYLE_PROMPT = [
  'STYLE LOCK:',
  'Premium warm editorial 2D illustration for HAY & ĐẸP.',
  'Soft ivory and warm cream palette, muted sage accents, warm wood, charcoal/sepia linework.',
  'Natural gentle light, tactile editorial texture, proportional expressive Vietnamese characters.',
  'Calm uncluttered composition, subtle depth, believable anatomy.',
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
    lower.includes('bố mẹ') ||
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
    presentMembers: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--generate') {
      args.generate = true;
    } else if (arg === '--strict-hay-dep') {
      args.strictHayDep = true;
    } else if (arg === '--no-people') {
      args.noPeople = true;
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
      args.shotScale = argv[++i];
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
  const shotScale = scene.shotScale || (scene.type === 'hook' ? 'wide' : scene.type === 'ending' ? 'close' : 'medium');
  const composition = scene.composition || 'portrait-focus';

  const scaleDescriptions = {
    wide: 'Wide environmental establishing shot.',
    medium: 'Medium editorial shot focusing on natural movement.',
    close: 'Close intimate framing focusing on faces, hands, emotions.',
    detail: 'Macro detail insert on tactile objects with shallow depth of field.',
  };

  const compositionDescriptions = {
    'full-bleed': 'Vertical 9:16 full-bleed composition.',
    'editorial-left': 'Editorial asymmetric composition: subject left, breathing space right.',
    'editorial-right': 'Editorial asymmetric composition: subject right, breathing space left.',
    'portrait-focus': 'Vertical portrait composition with clear visual hierarchy.',
    'detail-insert': 'Detail insert capturing a domestic action.',
    paper: 'Tactile keepsake memory framing with soft daylight.',
  };

  const scaleText = scaleDescriptions[shotScale] || scaleDescriptions.medium;
  const compText = compositionDescriptions[composition] || compositionDescriptions['portrait-focus'];

  return [
    'SHOT: Vertical 9:16 editorial framing, candid, unposed.',
    scaleText,
    compText,
  ].join('\n');
}

function buildGenericCastPrompt(scene) {
  if (scene.character === 'male') {
    return [
      'CAST:',
      'Use one natural Vietnamese male-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\n');
  }

  if (scene.character === 'female') {
    return [
      'CAST:',
      'Use one natural Vietnamese female-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\n');
  }

  return [
    'CAST:',
    'Use natural Vietnamese editorial human characters only when the scene needs people.',
    'Do not use stick figures, diagram people, icon people, mannequins, or infographic characters.',
    'Do not add random extra people.',
  ].join('\n');
}

export function buildPresentCastPrompt(scene, castId) {
  if (scene.noPeople || (Array.isArray(scene.presentMembers) && scene.presentMembers.length === 0)) {
    return [
      'PEOPLE:',
      'NO PEOPLE in frame.',
      'Show only believable traces of the activity that just happened.',
    ].join('\n');
  }

  const cast = CHARACTER_CASTS[castId];
  if (!cast) {
    return buildGenericCastPrompt(scene);
  }

  const validMemberKeys = cast.members ? Object.keys(cast.members) : [];

  let requested;
  if (Array.isArray(scene.presentMembers) && scene.presentMembers.length > 0) {
    const invalid = scene.presentMembers.filter((m) => !cast.members || !cast.members[m]);
    if (invalid.length > 0) {
      throw new Error(
        `Invalid cast member "${invalid[0]}" for cast "${castId}". Valid members: ${validMemberKeys.join(', ')}`
      );
    }
    requested = scene.presentMembers;
  } else {
    requested = validMemberKeys;
  }

  if (requested.length === 0) {
    return [
      'PEOPLE:',
      'NO PEOPLE in frame.',
      'Show only believable traces of the activity that just happened.',
    ].join('\n');
  }

  const lines = requested
    .map((memberId) => `${memberId}: ${cast.members[memberId]}`);

  return [
    `CAST CONTINUITY — ${castId}:`,
    ...lines,
    'Use same recurring identities, no random extra people.',
  ].join('\n');
}

function buildWorldPrompt(scene) {
  if (scene.worldLock) {
    return scene.worldLock;
  }
  return [
    'WORLD:',
    'Warm believable Vietnamese everyday-life environment.',
    'Ivory / warm cream, muted sage, warm wood, charcoal details.',
  ].join('\n');
}

function buildNegativeRules(scene) {
  const rules = [
    'NEGATIVE: NO TEXT, NO LOGO, NO WATERMARK.',
    'No posed camera-facing portrait, no random extra people, no luxury showroom look.',
  ];

  if (scene.storyRole === 'detail-action') {
    rules.push('Object must be actively used by hand, no product photography.');
  } else if (scene.storyRole === 'interaction') {
    rules.push('Show visible reactive exchange between people, no isolated portrait faces.');
  } else if (scene.storyRole === 'memory') {
    rules.push('Do not invent different faces or family.');
  }

  return rules.join('\n');
}

export function buildPrompt(scene, castId) {
  const action = scene.action || scene.visual || scene.text;
  const rawMeaning = scene.visual || scene.text;
  const sceneMeaning = rawMeaning.replace(/\.\s*Convert this priority.*$/i, '.');

  const sections = [
    `ACTION:\n${action}`,
    `SCENE MEANING:\n${sceneMeaning}`,
    buildPresentCastPrompt(scene, castId),
    buildWorldPrompt(scene),
    STYLE_PROMPT,
    buildShotPrompt(scene),
    buildNegativeRules(scene),
  ].filter(Boolean);

  const full = sections.join('\n\n');

  if (full.length > 1950) {
    throw new Error(
      `Image prompt too long: ${full.length}. ` +
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
  const payloadWithSeed = {
    prompt,
    seed: seed >>> 0,
    steps: 4,
  };
  let requestBody = JSON.stringify(payloadWithSeed);

  try {
    console.error('Calling Cloudflare with Node fetch (with seed/steps)...');
    return await callCloudflareWithFetch(url, token, requestBody);
  } catch (fetchErr) {
    console.error(`Cloudflare rejected seed/steps payload: ${fetchErr.message}`);
    if (fetchErr.message.includes('/seed') || fetchErr.message.includes('/steps') || fetchErr.message.includes('Additional or unevaluated properties')) {
      console.error('⚠️ Cloudflare schema rejected seed/steps. Retrying with prompt-only payload...');
      requestBody = JSON.stringify({ prompt });
      try {
        return await callCloudflareWithFetch(url, token, requestBody);
      } catch (fallbackErr) {
        console.error(`Prompt-only fetch failed: ${fallbackErr.message}`);
      }
    }

    console.error('Retrying Cloudflare with curl...');
    try {
      return callCloudflareWithCurl(url, token, requestBody);
    } catch (curlErr) {
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

function appendGeneratedAsset(manifest, scene, reservedAsset) {
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
    reuse: false,
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
  const castId = args.cast || inferCastId(args.text);
  const scene = {
    text: args.text,
    type: args.type,
    mood: args.mood,
    character,
    castId,
    noPeople: args.noPeople,
    presentMembers: args.presentMembers,
    visual: args.visual,
    storyRole: args.storyRole || undefined,
    action: args.action || undefined,
    worldId: args.worldId || undefined,
    worldLock: args.worldLock || undefined,
    shotScale: args.shotScale || undefined,
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

  try {
    console.error(`Generating with Cloudflare Workers AI (seed: ${seed}, cast: ${castId || 'none'})...`);
    const imageBuffer = await generateWithCloudflare(prompt, seed);
    fs.writeFileSync(rawPath, imageBuffer);
    compressJpeg(rawPath, reservedAsset.outputPath);
    const asset = appendGeneratedAsset(manifest, scene, reservedAsset);
    console.error(`Generated asset "${asset.id}" at ${asset.path}.`);
    console.log(JSON.stringify({
      source: 'generated',
      castId: castId || null,
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
  } catch (err) {
    if (args.strictHayDep) {
      const safeFallback = best && canReuseForHayDep(best, scene, args.threshold);
      if (!safeFallback) {
        throw new Error(
          `HAY & ĐẸP. image generation failed and no safe compatible asset exists: ${err.message}`,
        );
      }
    }
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
      asset: best.asset,
    }, null, 2));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
