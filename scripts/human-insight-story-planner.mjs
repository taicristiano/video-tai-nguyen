/**
 * scripts/human-insight-story-planner.mjs
 *
 * Reusable story-planning layer for human-insight/cinematic-light.
 *
 * Goals:
 * - infer a content mode from title/category/series/voice;
 * - split transcript segments into semantic visual beats;
 * - prefer specific actions over mood/decor filler;
 * - choose composition from story role, never round-robin layout;
 * - define per-video cast/world continuity metadata;
 * - validate filler/repetition before asset generation.
 *
 * No external dependencies.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REFERENCE_SHOT_GRAMMAR,
  detectVisualVerb,
  resolveVisualStrategy,
  validateShotPlan,
  buildShotGrammarMetrics,
  repairScaleMonotony,
  isValidHoldException,
  chooseCompositionForShot,
  isSilhouetteCompatibleWithPeopleContract,
  buildImageSafetyRulesForShot,
  mapPlannerScaleToRendererScale,
  choosePlannerScale,
  VISUAL_MODES,
  VISUAL_MODE_TO_SCALE,
  deriveVisualMode,
  validateActionPromptContract,
  validateObjectDetailContract,
} from '../src/templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs';
export { validateObjectDetailContract };

import {
  CHANNEL_BRAND_CONFIG,
  preProcessSegments,
  shouldSplitClause,
  chooseHookPattern,
  splitClauseTextAndTiming,
  normalizeCadence,
  auditBrandContext,
  evaluateProductionReadiness,
  buildReuseAudit,
  mapPlannerRoleToRendererRole,
} from '../src/templates/human-insight/cinematic-light/storyPlannerRuntime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CASTS_PATH = path.join(
  ROOT,
  'src/templates/human-insight/cinematic-light/character-casts.json',
);
export const CHARACTER_CASTS = fs.existsSync(CASTS_PATH)
  ? JSON.parse(fs.readFileSync(CASTS_PATH, 'utf-8'))
  : {};

export const CONTENT_MODES = {
  FAMILY: 'family-emotional',
  RELATIONSHIP: 'relationship-dialogue',
  HABIT: 'practical-habit',
  HOME: 'home-living',
  BOOKS: 'books-ideas',
  REFLECTIVE: 'reflective-everyday',
};

export const STORY_ROLES = {
  ESTABLISH: 'establish',
  ACTION: 'action',
  INTERACTION: 'interaction',
  DETAIL: 'detail-action',
  CONTEXT: 'context',
  REFLECTION: 'reflection',
  MEMORY: 'memory',
  RELEASE: 'release',
  QUESTION: 'question',
};

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (text, terms) => {
  const n = normalize(text);
  return terms.some((term) => n.includes(normalize(term)));
};

const wordCount = (text) => normalize(text).split(/\s+/).filter(Boolean).length;

function stableInt(text) {
  return parseInt(
    crypto.createHash('sha256').update(String(text)).digest('hex').slice(0, 8),
    16,
  ) >>> 0;
}

export function inferContentMode(video) {
  const cat = normalize(video.category || '');
  if (includesAny(cat, ['gia dinh', 'tinh than', 'doi xu'])) {
    return CONTENT_MODES.FAMILY;
  }
  if (includesAny(cat, ['quan he', 'giao tiep'])) {
    return CONTENT_MODES.RELATIONSHIP;
  }
  if (includesAny(cat, ['sach', 'hoc'])) {
    return CONTENT_MODES.BOOKS;
  }
  if (includesAny(cat, ['nha', 'goc song'])) {
    return CONTENT_MODES.HOME;
  }
  if (includesAny(cat, ['thoi quen', 'ky luat'])) {
    return CONTENT_MODES.HABIT;
  }

  const title = normalize(video.title || '');
  if (includesAny(title, [
    'bua com', 'gia dinh', 'con cai', 'anh chi em',
    'to am', 'cho com', 'tre con', 'ky niem gia dinh',
  ])) {
    return CONTENT_MODES.FAMILY;
  }

  if (includesAny(title, [
    'cuon sach', 'trang sach', 'doc sach', 'doc cham', 'hoc tap',
  ])) {
    return CONTENT_MODES.BOOKS;
  }

  if (includesAny(title, [
    'can nha', 'can phong', 'goc song', 'don nha', 'do dung',
  ])) {
    return CONTENT_MODES.HOME;
  }

  if (includesAny(title, [
    'nguoi than ke chuyen', 'lang nghe', 'xin loi', 'loi khuyen',
    'giao tiep', 'ban be', 'nguoi ban', 'cuoc tro chuyen', 'tro chuyen',
  ])) {
    return CONTENT_MODES.RELATIONSHIP;
  }

  if (includesAny(title, [
    'thoi quen', 'buoi sang', 'dien thoai', 'lich', 'tap trung',
  ])) {
    return CONTENT_MODES.HABIT;
  }

  const haystack = [
    video.title,
    video.series,
    video.voiceScriptText,
  ].filter(Boolean).join(' ');

  if (includesAny(haystack, [
    'đọc sách', 'cuốn sách', 'trang sách', 'ghi chép', 'cuốn sổ',
    'học tập', 'đọc chậm', 'ý hay sau khi đọc',
  ])) {
    return CONTENT_MODES.BOOKS;
  }

  if (includesAny(haystack, [
    'căn nhà', 'căn phòng', 'góc đọc', 'bàn', 'ngăn kéo', 'dọn nhà',
    'đồ dùng', 'cất', 'lối đi', 'góc sống', 'nhà cửa',
  ])) {
    return CONTENT_MODES.HOME;
  }

  if (includesAny(haystack, [
    'gia đình', 'con cái', 'anh chị em', 'bữa cơm',
    'tổ ấm', 'người thân', 'chờ cơm', 'trẻ con', 'kỷ niệm gia đình',
  ])) {
    return CONTENT_MODES.FAMILY;
  }

  if (includesAny(haystack, [
    'lắng nghe', 'xin lỗi', 'lời khuyên', 'giao tiếp', 'bạn bè',
    'người bạn', 'cuộc trò chuyện', 'hỏi', 'nói nhẹ', 'quan hệ',
  ])) {
    return CONTENT_MODES.RELATIONSHIP;
  }

  if (includesAny(haystack, [
    'thói quen', 'chuẩn bị', 'lịch', 'động lực', 'bỏ lỡ', 'buổi sáng',
    'điện thoại', 'ngày bận', 'tập trung', '20 phút', '10 phút',
  ])) {
    return CONTENT_MODES.HABIT;
  }

  return CONTENT_MODES.REFLECTIVE;
}

function deterministicSoloCast(video) {
  const seed = stableInt(`${video.index}|${video.title}|solo-cast`);
  return seed % 2 === 0 ? 'solo-female-01' : 'solo-male-01';
}

export function inferRecurringCast(video, mode) {
  const text = `${video.title || ''} ${video.category || ''} ${video.voiceScriptText || ''}`;

  if (mode === CONTENT_MODES.FAMILY) {
    if (includesAny(text, ['ông bà'])) return { needsRecurringCast: true, castId: 'elderly-couple-01' };
    if (includesAny(text, ['vợ chồng'])) return { needsRecurringCast: true, castId: 'couple-young-01' };
    return { needsRecurringCast: true, castId: 'family-young-01' };
  }

  if (mode === CONTENT_MODES.RELATIONSHIP) {
    if (includesAny(text, ['vợ chồng', 'người yêu'])) {
      return { needsRecurringCast: true, castId: 'couple-young-01' };
    }
    return { needsRecurringCast: true, castId: 'dialogue-pair-01' };
  }

  if (mode === CONTENT_MODES.BOOKS || mode === CONTENT_MODES.HABIT || mode === CONTENT_MODES.HOME) {
    const castId = deterministicSoloCast(video);
    return { needsRecurringCast: true, castId };
  }

  return { needsRecurringCast: false, castId: undefined };
}

const WORLD_PRESETS = {
  'home-family-01': [
    'WORLD LOCK: home-family-01',
    'Same modest Vietnamese apartment dining room.',
    'Rectangular medium-oak dining table, cream walls, warm pendant lamp centered above table.',
    'Window on camera-left with soft evening light, low sage ceramic vase on a narrow sideboard.',
    'Keep these stable anchors across all connected scenes.',
  ].join('\n'),
  'home-family-02': [
    'WORLD LOCK: home-family-02',
    'Same compact Vietnamese townhouse dining area.',
    'Round warm-wood table, ivory wall with small framed print, warm ceiling lamp, dark wooden cabinet at camera-right.',
    'Keep these stable anchors across all connected scenes.',
  ].join('\n'),
  'home-family-03': [
    'WORLD LOCK: home-family-03',
    'Same cozy Vietnamese ground-floor family living-dining room.',
    'Low warm teak dining table, pale beige walls, open kitchen doorway visible in soft background blur.',
    'Keep these stable anchors across all connected scenes.',
  ].join('\n'),

  'everyday-dialogue-01': [
    'WORLD LOCK: everyday-dialogue-01',
    'Quiet airy Vietnamese neighborhood cafe corner.',
    'Small wooden round table, warm cream stucco wall, diffused daylight from nearby courtyard.',
    'Keep these dialogue anchors strictly consistent across all dialogue scenes.',
  ].join('\n'),
  'everyday-dialogue-02': [
    'WORLD LOCK: everyday-dialogue-02',
    'Calm home living room conversation area.',
    'Comfortable neutral sofa, small wood coffee table with ceramic mugs, soft afternoon window light.',
    'Keep these dialogue anchors strictly consistent across all dialogue scenes.',
  ].join('\n'),
  'everyday-dialogue-03': [
    'WORLD LOCK: everyday-dialogue-03',
    'Quiet shaded residential street or park path with calm green trees.',
    'Soft daylight, natural walking dialogue setting, believable Vietnamese urban greenery.',
    'Keep these dialogue anchors strictly consistent across all dialogue scenes.',
  ].join('\n'),

  'reading-space-01': [
    'WORLD LOCK: reading-space-01',
    'Same quiet Vietnamese home study corner.',
    'Solid warm-oak writing desk near window, soft daylight, low wooden bookshelf on right with real books.',
    'Keep desk finish, wall tone, and window angle identical across scenes.',
  ].join('\n'),
  'reading-space-02': [
    'WORLD LOCK: reading-space-02',
    'Same cozy reading armchair in a sunlit corner.',
    'Fabric armchair, small side table with single ceramic mug, linen curtains filtering soft daylight.',
    'Keep armchair color, wall tone, and lighting angle identical across scenes.',
  ].join('\n'),
  'reading-space-03': [
    'WORLD LOCK: reading-space-03',
    'Same small tea-and-reading table in a calm living space.',
    'Low wooden table with open notebook and pen, warm cream walls, gentle morning light.',
    'Keep table finish and lighting angle identical across scenes.',
  ].join('\n'),

  'home-living-01': [
    'WORLD LOCK: home-living-01',
    'Same lived-in Vietnamese apartment entryway and hallway.',
    'Shoe rack, wooden key tray on small console, pale cream walls, soft ceiling light.',
    'Keep hallway proportions and furniture identical across scenes.',
  ].join('\n'),
  'home-living-02': [
    'WORLD LOCK: home-living-02',
    'Same compact Vietnamese kitchen-living space.',
    'Clean countertops, wooden dish rack, warm daylight from small balcony door.',
    'Keep layout and cabinetry colors identical across scenes.',
  ].join('\n'),
  'home-living-03': [
    'WORLD LOCK: home-living-03',
    'Same airy uncluttered Vietnamese living room.',
    'Low wood coffee table, linen sofa, warm ivory walls, soft natural diffused daylight.',
    'Keep room layout and daylight direction identical across scenes.',
  ].join('\n'),

  'daily-routine-01': [
    'WORLD LOCK: daily-routine-01',
    'Same morning routine entryway and work surface.',
    'Small wooden organizer, canvas tote bag on hook, warm morning daylight.',
    'Keep routine anchors stable across scenes.',
  ].join('\n'),
  'daily-routine-02': [
    'WORLD LOCK: daily-routine-02',
    'Same clean bedroom bedside table with no clutter.',
    'Small alarm clock, phone charging stand placed across the room, soft morning light.',
    'Keep bedside anchors stable across scenes.',
  ].join('\n'),
  'daily-routine-03': [
    'WORLD LOCK: daily-routine-03',
    'Same focused daytime desk setup.',
    'Single notebook, pencil, timer, clear desk surface, calm natural light.',
    'Keep desk setup identical across scenes.',
  ].join('\n'),

  'everyday-reflection-01': [
    'WORLD LOCK: everyday-reflection-01',
    'Warm quiet Vietnamese living room corner at dusk.',
    'Soft table lamp, muted sage cushion, deep charcoal linework in background.',
    'Keep reflective mood and anchors coherent.',
  ].join('\n'),
  'everyday-reflection-02': [
    'WORLD LOCK: everyday-reflection-02',
    'Calm balcony doorway overlooking gentle Vietnamese street trees.',
    'Potted greenery, warm terracotta tile, soft evening ambient light.',
    'Keep balcony anchors coherent.',
  ].join('\n'),
  'everyday-reflection-03': [
    'WORLD LOCK: everyday-reflection-03',
    'Quiet kitchen counter after tea has been prepared.',
    'Single warm ceramic cup, wooden cutting board, soft natural light.',
    'Keep kitchen corner anchors coherent.',
  ].join('\n'),
};

export function inferWorld(video, mode) {
  const seed = stableInt(`${video.index}|${video.title}|${mode}`);
  const idNum = String((seed % 3) + 1).padStart(2, '0');

  let worldId = `everyday-reflection-${idNum}`;
  switch (mode) {
    case CONTENT_MODES.FAMILY:
      worldId = `home-family-${idNum}`;
      break;
    case CONTENT_MODES.RELATIONSHIP:
      worldId = `everyday-dialogue-${idNum}`;
      break;
    case CONTENT_MODES.BOOKS:
      worldId = `reading-space-${idNum}`;
      break;
    case CONTENT_MODES.HOME:
      worldId = `home-living-${idNum}`;
      break;
    case CONTENT_MODES.HABIT:
      worldId = `daily-routine-${idNum}`;
      break;
  }

  const worldLock = WORLD_PRESETS[worldId] || [
    `WORLD LOCK: ${worldId}`,
    'Keep a coherent warm everyday-life visual universe.',
    'Ivory, warm wood, muted sage, charcoal linework, natural light.',
  ].join('\n');

  return { worldId, worldLock };
}

export const TARGET_VISUAL_BEAT_SEC = 3.2;
export const SOFT_MAX_VISUAL_BEAT_SEC = 4.5;

const STRONG_CONNECTORS = ['hoặc', 'nhưng', 'còn', 'trong khi', 'thay vì', 'để rồi'];
const VISUAL_ACTION_CUES = [
  'nghe', 'nói', 'kể', 'nhìn', 'đặt', 'cất', 'gắp', 'xới',
  'ngồi', 'đứng', 'đi', 'về', 'mở', 'đóng', 'viết', 'ghi',
  'dọn', 'xếp', 'cầm', 'đưa', 'nhận',
];

export function normalizeSplitText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.,!?;:…"'“”‘’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestSemanticSplit(clause, durationSec) {
  const candidates = [];
  const text = clause.trim();

  // 1. Independent Phone / Focal Object with "và" or comma
  const phoneMatch = text.match(/(?:,\s*|\s+)và\s+(?:chiếc\s+|cái\s+)?(?:điện thoại)\b/i);
  if (phoneMatch) {
    const splitIdx = phoneMatch.index;
    const left = text.slice(0, splitIdx).trim().replace(/[,;]+$/, '').trim();
    const right = text.slice(splitIdx).trim().replace(/^[,;\s]+/, '').trim();
    if (wordCount(left) >= 3 && wordCount(right) >= 3) {
      candidates.push({
        type: 'strong',
        left,
        right,
        score: 100,
      });
    }
  }

  // 2. Strong Conjunctions
  for (const conn of STRONG_CONNECTORS) {
    const re = new RegExp(`(?:,\\s*|\\s+)(${conn})\\s+`, 'i');
    const match = text.match(re);
    if (match) {
      const splitIdx = match.index;
      const left = text.slice(0, splitIdx).trim().replace(/[,;]+$/, '').trim();
      const right = text.slice(splitIdx).trim().replace(/^[,;\s]+/, '').trim();
      if (wordCount(left) >= 3 && wordCount(right) >= 3) {
        candidates.push({
          type: 'strong',
          left,
          right,
          score: 90,
        });
      }
    }
  }

  // 3. Subordinating "mà" clause (when duration is long)
  const maMatch = text.match(/(?:,\s*|\s+)(mà)\s+/i);
  if (maMatch && durationSec >= 4.0) {
    const splitIdx = maMatch.index;
    const left = text.slice(0, splitIdx).trim().replace(/[,;]+$/, '').trim();
    const right = text.slice(splitIdx).trim().replace(/^[,;\s]+/, '').trim();
    if (wordCount(left) >= 4 && wordCount(right) >= 4) {
      candidates.push({
        type: 'subordinate',
        left,
        right,
        score: 70,
      });
    }
  }

  // 4. Comma + Visual Action Cue
  const commaRegex = /,\s+/g;
  let m;
  while ((m = commaRegex.exec(text)) !== null) {
    const splitIdx = m.index;
    const left = text.slice(0, splitIdx).trim().replace(/[,;]+$/, '').trim();
    const right = text.slice(splitIdx + m[0].length).trim();
    if (wordCount(left) >= 4 && wordCount(right) >= 4) {
      const firstTwoWords = right.split(/\s+/).slice(0, 2).map((w) => normalize(w));
      const hasActionCue = firstTwoWords.some((w) => VISUAL_ACTION_CUES.includes(w));
      if (hasActionCue && (durationSec >= 4.0 || durationSec > SOFT_MAX_VISUAL_BEAT_SEC)) {
        candidates.push({
          type: 'comma-action',
          left,
          right,
          score: 80,
        });
      } else if (durationSec > SOFT_MAX_VISUAL_BEAT_SEC) {
        candidates.push({
          type: 'soft',
          left,
          right,
          score: 50,
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.forEach((c) => {
    const balancePenalty = Math.abs(wordCount(c.left) - wordCount(c.right)) * 0.4;
    c.finalScore = c.score - balancePenalty;
  });

  candidates.sort((a, b) => b.finalScore - a.finalScore);
  return candidates[0];
}

export function splitByPunctuation(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+|;\s+|:\s+(?=[A-ZÀ-Ỹ])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function splitVisualClauses(text, durationSec = 3) {
  const initialSentences = splitByPunctuation(text);
  if (!initialSentences.length) return [text];

  const totalWords = Math.max(1, wordCount(text));
  let items = initialSentences.map((s) => {
    const sWords = Math.max(1, wordCount(s));
    return {
      text: s,
      durationSec: Math.max(0.5, (sWords / totalWords) * durationSec),
      boundaryBefore: 'none',
    };
  });

  // Iteratively split items while total beats < 3
  while (items.length < 3) {
    let bestSplitIdx = -1;
    let bestCandidate = null;
    let bestPriority = -1;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const cand = findBestSemanticSplit(item.text, item.durationSec);
      if (!cand) continue;

      let priority = 0;
      if (cand.type === 'strong') {
        priority = 100;
      } else if (item.durationSec > SOFT_MAX_VISUAL_BEAT_SEC) {
        priority = 80 + (item.durationSec - SOFT_MAX_VISUAL_BEAT_SEC) * 10;
      } else if (cand.type === 'comma-action' && item.durationSec >= 4.0) {
        priority = 70;
      } else if (cand.type === 'subordinate' && item.durationSec >= 4.0) {
        priority = 60;
      }

      if (priority > bestPriority) {
        bestPriority = priority;
        bestSplitIdx = i;
        bestCandidate = cand;
      }
    }

    if (bestSplitIdx === -1 || bestPriority <= 0) {
      break;
    }

    const item = items[bestSplitIdx];
    const leftW = Math.max(1, wordCount(bestCandidate.left));
    const rightW = Math.max(1, wordCount(bestCandidate.right));
    const totW = leftW + rightW;
    const leftDur = item.durationSec * (leftW / totW);
    const rightDur = item.durationSec * (rightW / totW);

    const leftItem = {
      text: bestCandidate.left,
      durationSec: leftDur,
      boundaryBefore: item.boundaryBefore,
    };
    const rightItem = {
      text: bestCandidate.right,
      durationSec: rightDur,
      boundaryBefore: bestCandidate.type === 'strong' ? 'strong' : 'soft',
    };

    items.splice(bestSplitIdx, 1, leftItem, rightItem);
  }

  // Ensure we do not exceed 3 beats per transcript segment
  while (items.length > 3) {
    let mergeIdx = -1;
    for (let i = items.length - 1; i >= 1; i--) {
      if (items[i].boundaryBefore !== 'strong') {
        mergeIdx = i;
        break;
      }
    }
    if (mergeIdx === -1) mergeIdx = items.length - 1;
    const left = items[mergeIdx - 1];
    const right = items[mergeIdx];
    items.splice(mergeIdx - 1, 2, {
      text: `${left.text} ${right.text}`.trim(),
      durationSec: left.durationSec + right.durationSec,
      boundaryBefore: left.boundaryBefore,
    });
  }

  return items.map((it) => it.text);
}

function roleFromText(text, index, count, mode) {
  const clean = String(text).trim();

  if (index === count - 1 && /\?$/.test(clean)) {
    return STORY_ROLES.QUESTION;
  }

  // Opening first establishes the visual world.
  if (index === 0) {
    return STORY_ROLES.ESTABLISH;
  }

  if (includesAny(text, ['de nguoi khac noi het', 'dieu dep'])) {
    return STORY_ROLES.RELEASE;
  }

  // Final narrative beat should normally release/reflect.
  if (index === count - 2) {
    return STORY_ROLES.RELEASE;
  }

  // MEMORY must be mode-aware, not every occurrence of "nhớ".
  if (
    mode === CONTENT_MODES.FAMILY &&
    index > Math.floor(count * 0.55) &&
    includesAny(text, [
      'sau này',
      'kỷ niệm',
      'tuổi thơ',
      'ngày trước',
      'lúc đang có',
      'từng đẹp',
    ])
  ) {
    return STORY_ROLES.MEMORY;
  }

  if (mode === CONTENT_MODES.FAMILY) {
    if (
      includesAny(text, [
        'điện thoại',
        'gắp',
        'xới',
        'đặt sang một bên',
        'mâm cơm',
        'bát',
        'đũa',
      ])
    ) {
      return STORY_ROLES.DETAIL;
    }

    if (
      includesAny(text, [
        'kể chuyện',
        'nghe',
        'cùng có mặt',
        'ngồi cùng',
        'nhìn thấy nhau',
        'cùng nhau',
      ])
    ) {
      return STORY_ROLES.INTERACTION;
    }

    if (
      includesAny(text, [
        'đi học',
        'đi làm',
        'về nhà',
        'chuẩn bị bữa',
      ])
    ) {
      return STORY_ROLES.ACTION;
    }
  }

  if (
    mode === CONTENT_MODES.RELATIONSHIP &&
    includesAny(text, [
      'kể chuyện',
      'lắng nghe',
      'xin lỗi',
      'cảm ơn',
      'nói',
      'hỏi',
      'trò chuyện',
      'im lặng',
      'chen lời',
    ])
  ) {
    return STORY_ROLES.INTERACTION;
  }

  if (
    mode === CONTENT_MODES.BOOKS &&
    includesAny(text, [
      'viết',
      'ghi lại',
      'đánh dấu',
      'gạch',
      'lật trang',
      'tóm tắt',
    ])
  ) {
    return STORY_ROLES.DETAIL;
  }

  if (
    mode === CONTENT_MODES.HOME &&
    includesAny(text, [
      'cất',
      'dọn',
      'đặt',
      'di chuyển',
      'bỏ',
      'xếp',
    ])
  ) {
    return STORY_ROLES.ACTION;
  }

  if (
    mode === CONTENT_MODES.HABIT &&
    includesAny(text, [
      'chuẩn bị',
      'đặt',
      'viết',
      'bắt đầu',
      'tắt',
      'để xa',
    ])
  ) {
    return STORY_ROLES.ACTION;
  }

  if (
    includesAny(text, [
      'vì',
      'thực ra',
      'đôi khi',
      'giá trị',
      'nhận ra',
      'hiểu ra',
      'đáng quý',
      'không nhất thiết',
    ])
  ) {
    return STORY_ROLES.REFLECTION;
  }

  return STORY_ROLES.CONTEXT;
}

export function hasExplicitFamilyReturnContext(text) {
  return includesAny(text, [
    'đi học',
    'đi làm',
    'về nhà',
    'tan học',
    'tan làm',
  ]);
}

export function isFamilyPriorityCompatible({ text, role, priority }) {
  if (!priority) return false;
  const pHasReturn = hasExplicitFamilyReturnContext(priority);
  const tHasReturn = hasExplicitFamilyReturnContext(text);
  if (pHasReturn && !tHasReturn) {
    return false;
  }
  return true;
}

export function extractTimeCue(source = '') {
  if (/đêm|tối|khuya|nửa đêm|muộn|night|evening|late/i.test(source)) return 'night';
  if (/chiều|hoàng hôn|chập tối|afternoon/i.test(source)) return 'afternoon';
  if (/buổi sáng|buổi sớm|ban mai|bình minh|sáng sớm/i.test(source) || (/sáng/i.test(source) && !/đèn/i.test(source))) return 'morning';
  if (/trưa|buổi trưa|noon/i.test(source)) return 'daytime';
  return 'daytime';
}

export function extractSetting(source = '', timeCue = 'daytime') {
  if (/bếp|nấu|đun|pha/i.test(source)) return 'warm domestic kitchen';
  if (/bàn ăn|mâm cơm|bữa cơm|bát đũa|dọn sẵn/i.test(source)) return 'lived-in home dining area with wooden table';
  if (/phòng ngủ|gối|đệm|ngăn tủ|kệ/i.test(source)) return 'quiet domestic bedroom or lived-in room corner';
  if (/cửa sổ|bên cửa/i.test(source)) return 'room beside window with soft natural light';
  if (/vườn|hiên|ban công|cây xanh/i.test(source)) return 'veranda, home garden, or balcony with natural daylight';
  if (/cửa|về nhà|entryway|doorway/i.test(source)) {
    return timeCue === 'night'
      ? 'nighttime home entryway, doorway or quiet living room with warm lamp'
      : 'home entryway or doorway';
  }
  if (/bàn làm việc|bàn học|sách|vở|đọc|viết/i.test(source)) return 'quiet wooden study desk or reading area';
  return timeCue === 'night'
    ? 'quiet domestic room at night'
    : 'lived-in domestic room environment';
}

export function deriveVisualSemanticAnchor({
  text = '',
  priority = '',
  role = '',
  mode = '',
} = {}) {
  const p = (priority || '').trim();
  const t = (text || '').trim();
  const source = p || t;

  // 1. Concluding Breathing Space / Quiet Aftermath / Reflection (when no priority visual forces an action)
  const isEndingOrReflection =
    role === STORY_ROLES.RELEASE ||
    role === STORY_ROLES.REFLECTION ||
    /kết luận|khoảng thở|bình yên|khoảng lặng|yên lặng|lặng lẽ|kết thúc|outro|breathing room|peaceful conclusion|chiêm nghiệm/i.test(source);

  if (isEndingOrReflection && !p) {
    const timeCue = extractTimeCue(t) || 'peaceful afternoon or evening';
    return {
      rawSemantic: t || 'khoảng lặng chiêm nghiệm bình yên',
      source: 'SPOKEN_VOICE',
      mustShow: [t || 'contemplative pause or quiet everyday domestic scene'],
      avoidGenericFallback: false,
      voiceSpan: t,
      subject: 'quiet domestic environment or thoughtful person',
      action: 'contemplative pause or quiet everyday domestic scene',
      object: 'lived-in home elements',
      setting: 'warm lived-in everyday domestic space',
      timeCue,
      relationshipCue: 'contemplation and quiet reflection',
    };
  }

  // 2. Primary Generic Semantic Payload (No action dictionaries or keyword branches)
  const rawSemantic = source;
  const isPriority = Boolean(p);
  const semanticSource = isPriority ? 'PRIORITY_VISUAL' : 'SPOKEN_VOICE';
  const timeCue = extractTimeCue(rawSemantic);
  const setting = extractSetting(rawSemantic, timeCue);

  return {
    rawSemantic,
    source: semanticSource,
    mustShow: [rawSemantic],
    avoidGenericFallback: true,
    voiceSpan: t,
    timeCue,
    setting,
    subject: 'person performing everyday action',
    action: rawSemantic,
    object: 'concrete focal elements from scene',
    relationshipCue: 'everyday domestic interaction',
  };
}

export function allocatePriorityVisuals(beatSeeds = [], rawPriorities = []) {
  if (!Array.isArray(rawPriorities) || rawPriorities.length === 0) {
    return {
      beatPriorityMap: new Map(),
      coverageReport: [],
    };
  }

  const priorities = rawPriorities
    .map((p) => String(p || '').replace(/^[-*•\d.]+\s*/, '').replace(/[.;,]+$/, '').trim())
    .filter(Boolean);

  const coverageReport = [];
  const beatPriorityMap = new Map();
  const assignedPriorities = new Set();

  function scoreMatch(prio, beatText, beatIndex, totalBeats) {
    const normPrio = normalize(prio);
    const normBeat = normalize(beatText);

    const isEndingPrio = /kết luận|khoảng thở|bình yên|khoảng lặng|yên lặng|lặng lẽ|kết thúc|outro|lặng/i.test(prio);
    const isLateBeat = beatIndex >= Math.max(0, totalBeats - 4);
    if (isEndingPrio) {
      if (isLateBeat) {
        return /khoảng thở|bình yên|yên|lặng|hành động mới|ở đó rất lâu/i.test(normBeat) ? 0.95 : 0.75;
      }
      return 0.05;
    }

    const prioTokens = normPrio.split(/\s+/).filter((w) => w.length >= 2);
    if (!prioTokens.length) return 0;

    let hits = 0;
    for (const t of prioTokens) {
      if (normBeat.includes(t)) hits++;
    }
    let tokenScore = hits / prioTokens.length;

    // Generic bigram boost for exact phrases
    for (let j = 0; j < prioTokens.length - 1; j++) {
      const bigram = `${prioTokens[j]} ${prioTokens[j + 1]}`;
      if (normBeat.includes(bigram)) {
        tokenScore = Math.min(1.0, tokenScore + 0.25);
      }
    }

    return tokenScore;
  }

  // 1. Direct and high-scoring match pass
  for (const prio of priorities) {
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < beatSeeds.length; i++) {
      if (beatPriorityMap.has(i)) continue;
      const score = scoreMatch(prio, beatSeeds[i].text, i, beatSeeds.length);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1 && bestScore >= 0.25) {
      beatPriorityMap.set(bestIdx, prio);
      assignedPriorities.add(prio);
      coverageReport.push({
        source: prio,
        matchedShotId: `beat-${String(bestIdx + 1).padStart(2, '0')}`,
        matchedVoiceText: beatSeeds[bestIdx].text,
        coverage: bestScore >= 0.4 ? 'DIRECT' : 'PARTIAL',
      });
    }
  }

  // 2. Replanning pass: Allocate any remaining unmatched priorities to feasible narrative beats
  for (const prio of priorities) {
    if (assignedPriorities.has(prio)) continue;

    let candidateIdx = -1;
    const isEndingPrio = /kết luận|khoảng thở|bình yên|kết thúc|outro|lặng/i.test(prio);

    if (isEndingPrio) {
      for (let i = beatSeeds.length - 1; i >= 0; i--) {
        if (!beatPriorityMap.has(i) && !beatSeeds[i].isStatement) {
          candidateIdx = i;
          break;
        }
      }
    } else {
      // Find unassigned narrative beat that is not hook or statement
      for (let i = 1; i < beatSeeds.length - 1; i++) {
        if (!beatPriorityMap.has(i) && !beatSeeds[i].isStatement) {
          candidateIdx = i;
          break;
        }
      }
      if (candidateIdx === -1) {
        for (let i = 0; i < beatSeeds.length; i++) {
          if (!beatPriorityMap.has(i)) {
            candidateIdx = i;
            break;
          }
        }
      }
    }

    if (candidateIdx !== -1) {
      beatPriorityMap.set(candidateIdx, prio);
      assignedPriorities.add(prio);
      coverageReport.push({
        source: prio,
        matchedShotId: `beat-${String(candidateIdx + 1).padStart(2, '0')}`,
        matchedVoiceText: beatSeeds[candidateIdx].text,
        coverage: 'PARTIAL',
        reason: 'Assigned to nearest feasible narrative beat during planner replenishment',
      });
    } else {
      coverageReport.push({
        source: prio,
        matchedShotId: null,
        matchedVoiceText: null,
        coverage: 'UNMATCHED',
        reason: 'Insufficient narrative shot capacity to allocate priority visual',
      });
    }
  }

  return {
    beatPriorityMap,
    coverageReport,
  };
}

export function matchedPriority(
  text,
  priorities = [],
  usedPriorities = new Set(),
  isCompatible = null,
) {
  const n = normalize(text);

  let best = '';
  let bestScore = 0;
  const usedSet = usedPriorities instanceof Set ? usedPriorities : new Set();

  for (const p of priorities || []) {
    const key = normalize(p);
    if (usedSet.has(key)) continue;
    if (typeof isCompatible === 'function' && !isCompatible(p)) continue;

    const words = key.split(/\s+/).filter((w) => w.length >= 2);
    if (!words.length) continue;

    const hits = words.filter((w) => n.includes(w)).length;
    let score = hits / words.length;

    // Generic bigram boost for exact phrases
    for (let j = 0; j < words.length - 1; j++) {
      const bigram = `${words[j]} ${words[j + 1]}`;
      if (n.includes(bigram)) {
        score = Math.min(1.0, score + 0.25);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return bestScore >= 0.25 ? best : '';
}

function familyIntent(text, role, semanticAnchor, priority) {
  const raw = priority || semanticAnchor?.rawSemantic;
  if (raw) {
    return `Concrete family moment illustrating: "${raw}"; avoid generic family portrait fallback.`;
  }
  if (semanticAnchor?.avoidGenericFallback && semanticAnchor?.action) {
    const objPart = semanticAnchor.object ? `, focusing on ${semanticAnchor.object}` : '';
    return `Concrete domestic scene showing ${semanticAnchor.action}${objPart}; avoid generic family portrait fallback.`;
  }

  // 1. Explicit focal object/detail
  if (includesAny(text, ['điện thoại'])) {
    return 'A family remains the main subject while one hand deliberately places the phone away from the dining table on a side shelf; the phone is secondary, not the hero object.';
  }

  // 2. Explicit interaction/dialogue meaning
  if (role === STORY_ROLES.INTERACTION) {
    return 'One family member actively speaks or tells a small story while the other recurring family members listen, make eye contact and react naturally around the same dining table.';
  }

  // 3. Explicit school/work/return-home context
  if (hasExplicitFamilyReturnContext(text)) {
    return 'A parent has just returned home and places a work bag or keys near the chair while the child brings a school notebook; the family reconnects around the same dining table.';
  }

  // 4. Dinner/domestic action
  if (includesAny(text, ['bữa cơm', 'ăn cơm', 'ăn tối'])) {
    if (role === STORY_ROLES.ESTABLISH) {
      return 'The recurring family shares an ordinary simple dinner at home; people are eating and talking naturally, not posing for camera.';
    }
    return 'The same recurring family performs one concrete dinner action: serving rice, passing a bowl, using chopsticks, listening to a child, or clearing the table.';
  }

  // 5. Role fallbacks
  if (role === STORY_ROLES.MEMORY) {
    return 'Reuse or visually echo an earlier canonical family dinner moment as a warm remembered scene; do not invent new faces.';
  }
  if (role === STORY_ROLES.RELEASE) {
    return 'A quiet after-moment in the same family home with clear human traces from the shared activity; calm, lived-in, not showroom-clean.';
  }
  return 'The recurring family performs a specific small domestic action in the same home; no posed family portrait.';
}

function relationshipIntent(text, role) {
  if (role === STORY_ROLES.RELEASE || includesAny(text, ['de nguoi khac noi het', 'dieu dep'])) {
    return 'Quiet living-room aftermath: two ceramic cups remain on the table, soft evening light, empty sofa, absolutely no people.';
  }
  if (includesAny(text, ['nhung dieu nho', 'lo gia tri', 'gap lai chung', 'khoang im lang du lau', 'im lang du lau'])) {
    return 'Two ceramic cups rest quietly on the low wooden coffee table with soft steam rising, phone resting face-down and unused, quiet room traces, absolutely no humans.';
  }
  if (includesAny(text, ['dat', 'dien thoai', 'phone'])) {
    return 'A close detail insert of hands placing a simple smartphone face down onto the wooden coffee table, screen off, phone put away.';
  }
  if (includesAny(text, ['im lang', 'khong voi chen loi', 'khoang im lang'])) {
    return 'The listener sits still with relaxed hands, phone absent, maintains attentive eye contact, allowing the speaker to finish.';
  }
  if (includesAny(text, ['hoi', 'cau rat ngan', 'nghi cach', 'cho loi khuyen'])) {
    return 'The listener leans slightly forward with an open palm, pauses before speaking, inviting the other person to continue.';
  }
  if (includesAny(text, ['lắng nghe', 'nghe'])) {
    return 'Two recurring people in conversation; one speaks naturally while the other listens with full attention, phone put away, visible reaction and eye contact.';
  }
  if (includesAny(text, ['xin lỗi'])) {
    return 'A grounded apology moment between the same two people: calm body language, one person owns the mistake, the other listens; no melodramatic pose.';
  }
  if (includesAny(text, ['lời khuyên', 'góp ý'])) {
    return 'A conversation where one person pauses before advising and first asks/listens; show reaction and interpersonal distance naturally.';
  }
  if (role === STORY_ROLES.INTERACTION) {
    return 'A specific dialogue action and visible reaction between the recurring people; do not use isolated portrait faces.';
  }
  return 'Show a concrete everyday relationship behavior with two people doing something, not a generic emotional portrait.';
}

function bookIntent(text, role) {
  if (includesAny(text, ['ghi', 'viết', 'một ý', 'tóm tắt'])) {
    return 'The recurring reader actively writes one short note beside an open book, connecting the idea to real life; hands, pen, page and reader all in context.';
  }
  if (includesAny(text, ['đọc chậm', 'dừng', 'ngẫm'])) {
    return 'The recurring reader pauses on one page, finger or pencil marking a passage, then looks away briefly to think; not a book-stack still life.';
  }
  if (role === STORY_ROLES.ACTION || role === STORY_ROLES.DETAIL) {
    return 'The recurring reader actively reads, annotates, turns a page or applies one idea; show use, not display.';
  }
  return 'A believable reading moment with the recurring reader and an actively used book in a warm reading space.';
}

function homeIntent(text, role) {
  if (includesAny(text, ['bàn', 'mặt bàn'])) {
    return 'A person actively removes, relocates or uses one specific item on a lived-in table, creating practical working space; no decor catalog shot.';
  }
  if (includesAny(text, ['cất', 'để sai chỗ', 'đúng chỗ', 'ngăn', 'hộp'])) {
    return 'A person puts one everyday object into an easier-to-use home location; show the hand/action and the before/after logic in context.';
  }
  if (includesAny(text, ['dọn', 'gọn', 'bừa'])) {
    return 'A person performs one concrete tidying action in a lived-in room; the room still feels inhabited, not showroom-perfect.';
  }
  if (role === STORY_ROLES.ESTABLISH) {
    return 'Establish a believable lived-in Vietnamese home with a person naturally using the space; no empty interior showcase.';
  }
  return 'Show one specific human use of the home that directly demonstrates the narration.';
}

function habitIntent(text, role) {
  if (includesAny(text, ['điện thoại'])) {
    return 'The recurring person performs a concrete phone-boundary action: placing it out of reach, turning notifications off, or leaving it away from the activity.';
  }
  if (includesAny(text, ['chuẩn bị', 'tối hôm trước', 'buổi sáng'])) {
    return 'The recurring person prepares one or two practical items in advance for the next morning; show hands and objects in use.';
  }
  if (includesAny(text, ['lịch', 'calendar', 'thời gian'])) {
    return 'The recurring person places one meaningful task into a real calendar and then starts that task; do not show a generic planner still life.';
  }
  if (role === STORY_ROLES.ACTION || role === STORY_ROLES.DETAIL) {
    return 'The recurring person performs one small repeatable behavior with a clear before/after or friction-reduction effect.';
  }
  return 'Show a concrete everyday routine with the recurring person acting, not generic motivational imagery.';
}

export function buildVisualIntent({
  text,
  role,
  mode,
  visualPriorities,
  priority: explicitPriority,
  semanticAnchor,
  previousIntent = '',
}) {
  let priority = explicitPriority;
  if (!priority && visualPriorities) {
    const compatibilityCheck = mode === CONTENT_MODES.FAMILY
      ? (p) => isFamilyPriorityCompatible({ text, role, priority: p })
      : null;
    priority = matchedPriority(text, visualPriorities, undefined, compatibilityCheck);
  }

  const anchor = semanticAnchor || deriveVisualSemanticAnchor({ text, priority, role, mode });

  let modeIntent = '';
  switch (mode) {
    case CONTENT_MODES.FAMILY:
      modeIntent = familyIntent(text, role, anchor, priority);
      break;
    case CONTENT_MODES.RELATIONSHIP:
      modeIntent = relationshipIntent(text, role);
      break;
    case CONTENT_MODES.BOOKS:
      modeIntent = bookIntent(text, role);
      break;
    case CONTENT_MODES.HOME:
      modeIntent = homeIntent(text, role);
      break;
    case CONTENT_MODES.HABIT:
      modeIntent = habitIntent(text, role);
      break;
    default:
      modeIntent = role === STORY_ROLES.REFLECTION || role === STORY_ROLES.RELEASE
        ? 'Show a quiet everyday human aftermath or reflection with visible traces of a real activity; avoid generic scenery.'
        : 'Show one concrete everyday human action that directly demonstrates the narration; avoid generic mood or decor imagery.';
      break;
  }

  let baseIntent = modeIntent;
  const rawPayload = anchor?.rawSemantic || priority;
  if (anchor?.avoidGenericFallback && rawPayload) {
    baseIntent = `${modeIntent} Concrete visual focus: "${rawPayload}". Avoid generic family portrait fallback.`;
  } else if (anchor?.avoidGenericFallback && anchor?.action) {
    baseIntent = `${modeIntent} Concrete visual focus: ${anchor.action}. Avoid generic family portrait fallback.`;
  } else if (priority) {
    baseIntent = `${modeIntent} Visual priority hint: ${priority}. Convert this priority into a specific visible human action whenever possible; avoid posed or decorative imagery.`;
  }

  if (previousIntent && normalize(baseIntent) === normalize(previousIntent)) {
    const cleanClause = text.replace(/[\r\n]+/g, ' ').trim();
    if (role === STORY_ROLES.DETAIL) {
      return `${baseIntent.replace(/\.\s*Convert.*$/, '')} — Detail focus on hand interaction with ${cleanClause.slice(0, 45)}. Avoid posed or decorative imagery.`;
    }
    if (role === STORY_ROLES.INTERACTION) {
      return `${baseIntent.replace(/\.\s*Convert.*$/, '')} — Reactive exchange between people during: "${cleanClause.slice(0, 45)}".`;
    }
    if (role === STORY_ROLES.ACTION) {
      return `${baseIntent.replace(/\.\s*Convert.*$/, '')} — Active continuation of the action: "${cleanClause.slice(0, 45)}".`;
    }
    if (role === STORY_ROLES.CONTEXT) {
      return `${baseIntent.replace(/\.\s*Convert.*$/, '')} — Contextual angle showing the environment during: "${cleanClause.slice(0, 45)}".`;
    }
    return `${baseIntent} (Specific moment: "${cleanClause.slice(0, 45)}").`;
  }

  return baseIntent;
}

function familyAction(text, role, semanticAnchor, priority) {
  if (priority) {
    return `A concrete domestic scene illustrating: ${priority}.`;
  }
  if (semanticAnchor?.avoidGenericFallback && semanticAnchor?.action) {
    const objPart = semanticAnchor.object ? ` focusing directly on ${semanticAnchor.object}` : '';
    return `A concrete domestic action showing ${semanticAnchor.action}${objPart}.`;
  }

  // 1. Explicit focal object/detail
  if (includesAny(text, ['điện thoại'])) {
    return 'A parent places the phone face-down on a side shelf while the family keeps eating in the background.';
  }

  // 2. Explicit interaction
  if (role === STORY_ROLES.INTERACTION) {
    if (includesAny(text, ['bố', 'cha']) && includesAny(text, ['con'])) {
      return 'Father sits at the dining table, father listening to child speak and tell stories with warm eye contact and natural reactions.';
    }
    if (includesAny(text, ['nghe', 'kể', 'nói', 'trò chuyện'])) {
      return 'The boy speaks with a small hand gesture while father and mother listen, react warmly and make eye contact at the dining table.';
    }
    if (includesAny(text, ['ngồi cùng', 'cùng nhau', 'cùng có mặt'])) {
      return 'All four recurring family members sit around the same dining table, talking and eating; no phone is on the table.';
    }
    return 'The boy speaks with a small hand gesture while father and mother listen, react warmly and make eye contact at the dining table.';
  }

  // 3. Explicit school/work/return-home context
  if (hasExplicitFamilyReturnContext(text)) {
    return 'Father puts his work bag beside the dining chair and sits down while the child brings a school notebook.';
  }

  // 4. Dinner/domestic action
  if (
    includesAny(
      text,
      ['bữa cơm', 'mâm cơm'],
    )
  ) {
    if (role === STORY_ROLES.ESTABLISH) {
      return 'All four recurring family members eat a simple Vietnamese dinner at the same wooden dining table.';
    }

    return 'Mother serves rice into a child’s bowl while another family member passes a simple dish across the table.';
  }

  // 5. Role fallbacks
  if (role === STORY_ROLES.RELEASE) {
    return 'No people. The same dining room after dinner: four used place settings, bowls and chopsticks remain under the warm pendant light.';
  }

  return 'Show one specific domestic action that directly demonstrates the spoken clause.';
}

export function buildVisualAction({
  text,
  role,
  mode,
  semanticAnchor,
  priority,
}) {
  const raw = priority || semanticAnchor?.rawSemantic;
  if (raw) {
    return `A concrete domestic action scene illustrating: "${raw}".`;
  }
  if (semanticAnchor?.avoidGenericFallback && semanticAnchor?.action) {
    const objPart = semanticAnchor.object ? ` focusing directly on ${semanticAnchor.object}` : '';
    return `A concrete domestic action showing ${semanticAnchor.action}${objPart}.`;
  }

  switch (mode) {
    case CONTENT_MODES.FAMILY:
      return familyAction(text, role, semanticAnchor, priority);

    case CONTENT_MODES.RELATIONSHIP:
      if (role === STORY_ROLES.QUESTION || includesAny(text, ['khi ban met', 'thich nguoi khac', 'khong phai la mot giai phap'])) {
        return 'Two people seated in comfortable distance in the warm living room, sharing a calm reflective moment across the low table.';
      }
      if (role === STORY_ROLES.RELEASE || includesAny(text, ['de nguoi khac noi het', 'dieu dep'])) {
        return 'Quiet living-room aftermath: two ceramic cups remain on the table, soft evening window light, completely empty sofa, ZERO visible people, ZERO hands, ZERO body parts, no reflections.';
      }
      if (includesAny(text, ['dat', 'dien thoai', 'phone'])) {
        return 'The smartphone is already resting FACE-DOWN and FLAT on the wooden table. One hand has just released it and is moving away. No fingers are wrapping around the phone. Phone is NOT held. Screen is NOT visible.';
      }
      if (includesAny(text, ['khoang im lang du lau', 'im lang du lau', 'thuc su lang nghe', 'nhung dieu nho', 'lo gia tri'])) {
        return 'Two ceramic cups rest quietly on the low wooden coffee table with soft steam rising, phone resting face-down and unused, warm quiet room traces, absolutely no humans.';
      }
      if (includesAny(text, ['sua ho', 'tim cach sua'])) {
        return 'Close reaction framing of exactly one listener from chest up, mouth closed, hands resting quietly, looking attentively forward, other participant completely absent from frame.';
      }
      if (includesAny(text, ['dieu ho can', 'nhung dieu ho can'])) {
        return 'Two people in medium interaction across the coffee table, speaking with natural gentle gestures and mutual eye contact, body language only, no visible text or speech bubbles.';
      }
      if (includesAny(text, ['loi khuyen dung van co the xuat hien', 'loi khuyen dung', 'sai thoi diem'])) {
        return 'Close reaction framing of exactly one listener pausing attentively with a thoughtful expression, head and shoulders dominant, completely solo, no second person or body part visible.';
      }
      if (includesAny(text, ['chua kip tho', 'tho ra het', 'nang nhoc'])) {
        return 'Close reaction framing of exactly one listener sitting in quiet patient stillness, shoulders relaxed, sole human in frame, no second person or extra body, no text or writing.';
      }
      if (includesAny(text, ['muon minh nghe hay', 'cung nghi cach'])) {
        return 'Close reaction framing of exactly one person with gentle questioning expression, head and shoulders dominant, exactly one person in entire frame, no second body.';
      }
      if (includesAny(text, ['im lang', 'khong voi chen loi'])) {
        return 'The listener sits still with relaxed hands, phone absent, maintains attentive eye contact, allowing the speaker off-camera to finish.';
      }
      if (includesAny(text, ['cau chuyen cua minh', 'don nhan'])) {
        return 'The listener leans slightly forward with an open palm, pauses before speaking, inviting the other person to continue.';
      }
      if (includesAny(text, ['thu hoi', 'cau rat ngan'])) {
        return 'The listener leans slightly forward with an open palm, pauses before speaking, inviting the other person to continue.';
      }
      if (includesAny(text, ['khong don doc', 'nhac nguoi dang ke'])) {
        return 'The listener pauses attentively, mouth closed, hands resting quietly on the knees, waiting for the speaker off-camera to finish.';
      }
      if (includesAny(text, ['ke chuyen', 'kho chiu', 'sau ngay dai'])) {
        return 'Two people seated smaller in the spacious living room across a low coffee table; one speaks candidly after a long day while the other listens calmly.';
      }
      if (includesAny(text, ['phan xa', 'giai phap'])) {
        return 'Two people seated across a low table; the speaker describes an issue with natural hand gestures while the listener listens patiently.';
      }
      if (includesAny(text, ['khong lam mat thoi gian', 'mat thoi gian', 'vai ngay'])) {
        return 'Two people seated peacefully in the warm living room, sharing a quiet, comfortable moment of reflection.';
      }
      if (includesAny(text, ['chua can', 'khong bi ngat', 'ke het', 'duoc ke'])) {
        return 'The listener listens attentively with calm posture, nodding slightly, allowing the speaker to share without interruption.';
      }
      if (includesAny(text, ['dieu hay', 'doi song that', 'nam o', 'biet khi nao', 'nen noi'])) {
        return 'Close reaction framing of exactly one listener pausing thoughtfully in quiet reflection, sole human in frame, no second person.';
      }
      if (includesAny(text, ['khoanh khac', 'nhin lai'])) {
        return 'Two people seated peacefully in the warm living room, sharing a quiet, comfortable moment of reflection.';
      }
      return 'Two recurring people engage in direct conversation with responsive posture and eye contact.';

    case CONTENT_MODES.BOOKS:
      if (includesAny(text, ['ghi', 'viết', 'sổ', 'tóm tắt'])) {
        return 'The reader holds a pencil and writes a brief note in an open notebook beside the book.';
      }
      if (includesAny(text, ['đọc chậm', 'dừng', 'ngẫm'])) {
        return 'The reader rests a finger under a sentence and pauses, looking up thoughtfully.';
      }
      return 'The reader actively turns a page or traces text with a finger while reading at the desk.';

    case CONTENT_MODES.HOME:
      if (includesAny(text, ['bàn', 'mặt bàn'])) {
        return 'A person clears unnecessary items from the wooden tabletop into a designated storage box.';
      }
      if (includesAny(text, ['cất', 'đúng chỗ', 'ngăn kéo', 'hộp'])) {
        return 'A person places an everyday item carefully into an organized wooden drawer.';
      }
      return 'A person performs one practical tidying movement, arranging objects neatly in the room.';

    case CONTENT_MODES.HABIT:
      if (includesAny(text, ['điện thoại'])) {
        return 'A person places the smartphone face down inside a drawer across the room.';
      }
      if (includesAny(text, ['chuẩn bị', 'tối hôm trước', 'buổi sáng'])) {
        return 'A person neatly sets out tomorrow’s clothes and work bag on a chair.';
      }
      return 'A person actively carries out a concrete morning or evening routine step.';

    default:
      return 'Show one concrete visible human action that directly demonstrates the spoken clause.';
  }
}

export function familyPresentMembers(
  text,
  role,
) {
  if (role === STORY_ROLES.RELEASE) {
    return [];
  }

  if (role === STORY_ROLES.ESTABLISH) {
    return [
      'father',
      'mother',
      'boy',
      'girl',
    ];
  }

  if (includesAny(text, ['điện thoại'])) {
    return ['father'];
  }

  if (
    includesAny(
      text,
      ['đi học', 'đi làm'],
    )
  ) {
    return ['father', 'boy'];
  }

  if (
    includesAny(
      text,
      ['kể chuyện', 'nghe'],
    )
  ) {
    return ['boy', 'father', 'mother'];
  }

  if (role === STORY_ROLES.QUESTION) {
    return [
      'father',
      'mother',
      'boy',
      'girl',
    ];
  }

  return ['mother', 'boy'];
}

export function relationshipPresentMembers({ castId, role, text, visualMode, scale }) {
  if (
    role === STORY_ROLES.RELEASE ||
    visualMode === 'EMPTY_RELEASE' ||
    visualMode === 'OBJECT_DETAIL' ||
    includesAny(text, ['de nguoi khac noi het', 'dieu dep'])
  ) {
    return [];
  }

  if (
    visualMode === 'ACTION_DETAIL' ||
    visualMode === 'REACTION_CLOSE' ||
    scale === 'CLOSE' ||
    (scale === 'DETAIL' && !String(text || '').includes('bàn'))
  ) {
    if (castId === 'dialogue-pair-01') {
      return ['listener'];
    }
    if (castId === 'couple-young-01') {
      return ['woman'];
    }
    return ['main'];
  }

  if (castId === 'dialogue-pair-01') {
    return ['speaker', 'listener'];
  }

  if (castId === 'couple-young-01') {
    return ['man', 'woman'];
  }

  return undefined;
}

function chooseShotScale(role) {
  switch (role) {
    case STORY_ROLES.ESTABLISH:
    case STORY_ROLES.RELEASE:
      return 'wide';
    case STORY_ROLES.DETAIL:
      return 'detail';
    case STORY_ROLES.INTERACTION:
      return 'medium';
    case STORY_ROLES.MEMORY:
      return 'wide';
    case STORY_ROLES.QUESTION:
      return 'wide';
    default:
      return 'medium';
  }
}

function chooseComposition(role, mode, intent) {
  if (role === STORY_ROLES.DETAIL) return 'detail-insert';
  if (role === STORY_ROLES.MEMORY) return 'paper';
  if (role === STORY_ROLES.QUESTION) return 'portrait-focus';

  // Editorial asymmetry is only chosen when the story benefits from a secondary
  // object/context area; it is NOT used as round-robin variety.
  if (includesAny(intent, ['side shelf', 'work bag', 'keys', 'notebook', 'calendar'])) {
    return 'editorial-left';
  }

  if (mode === CONTENT_MODES.HOME && role === STORY_ROLES.ACTION) {
    return 'editorial-right';
  }

  return 'portrait-focus';
}

function chooseMotion(role) {
  switch (role) {
    case STORY_ROLES.DETAIL:
      return 'slow-push';
    case STORY_ROLES.MEMORY:
    case STORY_ROLES.RELEASE:
    case STORY_ROLES.QUESTION:
      return 'emotional-hold';
    case STORY_ROLES.INTERACTION:
      return 'focus-shift';
    case STORY_ROLES.ESTABLISH:
      return 'slow-push';
    default:
      return 'still-breathe';
  }
}

function peoplePolicy(mode, role) {
  if (role === STORY_ROLES.RELEASE) return false;
  if (role === STORY_ROLES.DETAIL) return mode !== CONTENT_MODES.HOME;
  return [
    CONTENT_MODES.FAMILY,
    CONTENT_MODES.RELATIONSHIP,
    CONTENT_MODES.BOOKS,
    CONTENT_MODES.HABIT,
    CONTENT_MODES.HOME,
  ].includes(mode);
}

export function chooseAssetStrategy({ role, needsRecurringCast }) {
  if (
    needsRecurringCast &&
    (role === STORY_ROLES.MEMORY || role === STORY_ROLES.QUESTION)
  ) {
    return 'reuse-canonical';
  }

  return 'library-or-generate';
}

export function allocateBeatFrames(segment, clauses = []) {
  const startFrame = Math.max(0, Math.round(Number(segment.start || 0) * 30));
  const minEnd = startFrame + Math.max(1, clauses.length);
  const endFrame = Math.max(minEnd, Math.round(Number(segment.end || 0) * 30));
  const totalFrames = endFrame - startFrame;
  const getClauseText = (c) => (typeof c === 'string' ? c : (c && c.text) ? c.text : String(c || ''));
  const weights = clauses.map((c) => Math.max(1, wordCount(getClauseText(c))));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = startFrame;
  return clauses.map((clause, idx) => {
    const isLast = idx === clauses.length - 1;
    const remainingBeats = clauses.length - 1 - idx;
    let proportional = Math.round(totalFrames * (weights[idx] / totalWeight));
    if (totalFrames <= clauses.length * 120 && proportional > 118) {
      proportional = 118;
    }
    let beatEnd;
    if (isLast) {
      beatEnd = endFrame;
    } else {
      beatEnd = cursor + proportional;
      if (beatEnd <= cursor) beatEnd = cursor + 1;
      if (beatEnd > endFrame - remainingBeats) beatEnd = endFrame - remainingBeats;
    }
    const result = { clause: getClauseText(clause), startFrame: cursor, endFrame: beatEnd };
    cursor = beatEnd;
    return result;
  });
}

export function buildStoryPlan(video, timelineSegments = [], options = {}) {
  const mode = inferContentMode(video);
  const cast = inferRecurringCast(video, mode);
  const world = inferWorld(video, mode);
  const continuityGroup = `${video.index || 'video'}:${cast.castId || 'no-cast'}:${world.worldId}`;

  const fps = options.fps ?? 30;
  const brandContext = options.brandContext || CHANNEL_BRAND_CONFIG;
  const validationMode = options.validationMode || 'DRAFT';

  // Fallback to voice script / clean context segmentation if timelineSegments is empty
  let actualSegments = Array.isArray(timelineSegments) && timelineSegments.length > 0 ? timelineSegments : null;
  if (!actualSegments) {
    const textSource = video.voiceScriptText || video.cleanContext || '';
    const paras = textSource
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\r/g, '').trim())
      .filter(Boolean);
    let t = 0;
    actualSegments = paras.map((text) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });
  }

  // 1. Pre-process segments
  const processedSegments = preProcessSegments(actualSegments);

  // 2. Initial clause splitting
  const allBeatSeeds = [];
  processedSegments.forEach((segment, segmentIndex) => {
    const durationSec = Math.max(0.1, Number(segment.end || 0) - Number(segment.start || 0));
    const isStatement = Boolean(
      video.statementText &&
      segment.text.toLowerCase().includes(video.statementText.toLowerCase().slice(0, 15))
    );

    let clauses = splitVisualClauses(segment.text || '', durationSec);
    let timed = allocateBeatFrames(segment, clauses);

    // Recursively split any sub-beat > 4.0s (120 frames) unless dedicated statement hold
    const subTimed = [];
    timed.forEach((item) => {
      const beatDurFrames = item.endFrame - item.startFrame;
      if (beatDurFrames > 120 && !(isStatement && beatDurFrames <= 165)) {
        const parts = splitClauseTextAndTiming(
          {
            text: item.clause,
            start: item.startFrame / fps,
            end: item.endFrame / fps,
          },
          fps,
          isStatement,
        );
        parts.forEach((p) => {
          subTimed.push({
            clause: p.text,
            startFrame: p.startFrame,
            endFrame: p.endFrame,
          });
        });
      } else {
        subTimed.push(item);
      }
    });

    subTimed.forEach((item, clauseIndex) => {
      allBeatSeeds.push({
        ...item,
        segmentIndex,
        clauseIndex,
        text: item.clause,
        isStatement,
      });
    });
  });

  // 3. Cadence support: if too slow (< 18.0 cpm), semantically split longest clauses with punctuation or connectors
  const totalDurationSec =
    allBeatSeeds.length > 0
      ? (allBeatSeeds[allBeatSeeds.length - 1].endFrame - allBeatSeeds[0].startFrame) / fps
      : 60;
  const durationMin = totalDurationSec / 60;
  let targetMinBeats = Math.ceil(18.0 * durationMin);

  let splitGuard = 0;
  while (allBeatSeeds.length < targetMinBeats && splitGuard < 15) {
    splitGuard++;
    let longestIdx = -1;
    let longestDur = 0;

    for (let i = 0; i < allBeatSeeds.length; i++) {
      const dur = allBeatSeeds[i].endFrame - allBeatSeeds[i].startFrame;
      if (dur >= 75 && dur > longestDur && !allBeatSeeds[i].isStatement) { // >= 2.5s
        const text = allBeatSeeds[i].text;
        if (
          text.includes(',') ||
          text.includes(';') ||
          text.includes(':') ||
          text.includes(' - ') ||
          text.includes('nhưng') ||
          text.includes('mà là') ||
          text.includes('thực ra') ||
          text.includes('đôi khi') ||
          text.includes('khi') ||
          text.includes('để')
        ) {
          longestDur = dur;
          longestIdx = i;
        }
      }
    }

    if (longestIdx === -1) break;

    const target = allBeatSeeds[longestIdx];
    const parts = splitClauseTextAndTiming(
      {
        text: target.text,
        start: target.startFrame / fps,
        end: target.endFrame / fps,
      },
      fps,
      target.isStatement,
    );

    if (parts.length > 1) {
      const replacements = parts.map((p, pIdx) => ({
        segmentIndex: target.segmentIndex,
        clauseIndex: pIdx,
        text: p.text,
        startFrame: p.startFrame,
        endFrame: p.endFrame,
        isStatement: target.isStatement,
      }));
      allBeatSeeds.splice(longestIdx, 1, ...replacements);
    } else {
      break;
    }
  }

  // Hook pattern based on opening text
  const hookProgression = chooseHookPattern(allBeatSeeds[0]?.text || '');

  const { beatPriorityMap, coverageReport } = allocatePriorityVisuals(
    allBeatSeeds,
    video.visualPriorities,
  );

  let previousIntent = '';
  const candidateBeats = allBeatSeeds.map((item, idx) => {
    const role = roleFromText(item.text, idx, allBeatSeeds.length, mode);
    const matched = beatPriorityMap.get(idx) || null;
    const semanticAnchor = deriveVisualSemanticAnchor({
      text: item.text,
      priority: matched,
      role,
      mode,
    });
    const visualIntent = buildVisualIntent({
      text: item.text,
      role,
      mode,
      priority: matched,
      semanticAnchor,
      previousIntent,
    });
    previousIntent = visualIntent;

    const visualAction = buildVisualAction({
      text: item.text,
      role,
      mode,
      semanticAnchor,
      priority: matched,
    });

    // Story Participants
    let storyParticipants = cast && cast.members ? Object.keys(cast.members) : ['person'];
    if (mode === CONTENT_MODES.FAMILY) {
      storyParticipants = ['father', 'mother', 'boy', 'girl'];
    } else if (mode === CONTENT_MODES.RELATIONSHIP) {
      storyParticipants = cast.castId === 'couple-young-01' ? ['man', 'woman'] : ['speaker', 'listener'];
    }

    // Role mapping
    let plannerStoryRole = 'action';
    if (idx === 0) plannerStoryRole = 'hook';
    else if (idx === 1 && allBeatSeeds[0]) plannerStoryRole = 'establish';
    else if (role === STORY_ROLES.ESTABLISH) plannerStoryRole = 'establish';
    else if (role === STORY_ROLES.ACTION) plannerStoryRole = 'action';
    else if (role === STORY_ROLES.INTERACTION) plannerStoryRole = 'interaction';
    else if (role === STORY_ROLES.DETAIL) plannerStoryRole = 'detail';
    else if (role === STORY_ROLES.REFLECTION) plannerStoryRole = 'reflection';
    else if (role === STORY_ROLES.MEMORY) plannerStoryRole = 'memory';
    else if (role === STORY_ROLES.RELEASE) plannerStoryRole = 'release';
    else if (role === STORY_ROLES.QUESTION) plannerStoryRole = 'question';
    else plannerStoryRole = 'context';

    // Visual verb
    const visualVerb =
      detectVisualVerb(item.text) ||
      resolveVisualStrategy(item.text, plannerStoryRole).visualVerb;

    // Scale selection
    let scale = 'MEDIUM';

    if (idx === 0 && hookProgression) {
      scale = hookProgression.firstScale;
    } else if (idx === 1 && hookProgression) {
      scale = hookProgression.secondScale;
    } else {
      scale = choosePlannerScale({
        role: plannerStoryRole,
        text: item.text,
        visualVerb,
        peopleContract: { min: 1, max: Math.max(1, storyParticipants.length) },
        isStatement: item.isStatement,
        isHook: idx === 0,
        isEnding: idx === allBeatSeeds.length - 1,
      });
    }

    // Visual Mode
    let visualMode = deriveVisualMode({
      role: plannerStoryRole,
      scale,
      text: item.text,
      visualVerb,
      peopleContract: { min: Math.min(2, storyParticipants.length), max: Math.max(1, storyParticipants.length) },
      isHook: idx === 0,
      isEnding: idx === allBeatSeeds.length - 1,
      contentMode: mode,
    });

    if (mode === CONTENT_MODES.RELATIONSHIP) {
      if (plannerStoryRole === 'release' || includesAny(item.text, ['de nguoi khac noi het', 'dieu dep'])) {
        visualMode = 'EMPTY_RELEASE';
      } else if (plannerStoryRole === 'question') {
        visualMode = 'ENVIRONMENT_WIDE';
      } else if (includesAny(item.text, ['dat', 'dien thoai', 'phone'])) {
        visualMode = 'ACTION_DETAIL';
      } else if (includesAny(item.text, ['khoang im lang du lau', 'im lang du lau', 'thuc su lang nghe', 'nhung dieu nho', 'lo gia tri', 'gap lai chung'])) {
        visualMode = 'OBJECT_DETAIL';
      } else if (includesAny(item.text, ['sua ho', 'tim cach sua'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['dieu ho can', 'nhung dieu ho can'])) {
        visualMode = 'INTERACTION_MEDIUM';
      } else if (includesAny(item.text, ['loi khuyen dung van co the xuat hien', 'loi khuyen dung', 'sai thoi diem'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['chua kip tho', 'tho ra het', 'nang nhoc'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['muon minh nghe hay', 'cung nghi cach'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['khong don doc', 'nhac nguoi dang ke'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['dieu hay', 'biet khi nao', 'nen noi'])) {
        visualMode = 'REACTION_CLOSE';
      } else if (includesAny(item.text, ['im lang', 'khong voi chen loi'])) {
        visualMode = 'SOLO_MEDIUM';
      } else if (includesAny(item.text, ['cau chuyen cua minh', 'don nhan'])) {
        visualMode = 'SOLO_MEDIUM';
      } else if (includesAny(item.text, ['thu hoi', 'cau rat ngan'])) {
        visualMode = 'SOLO_MEDIUM';
      } else if (includesAny(item.text, ['phan xa', 'giai phap'])) {
        visualMode = 'INTERACTION_MEDIUM';
      } else if (includesAny(item.text, ['khong lam mat thoi gian', 'mat thoi gian', 'vai ngay'])) {
        visualMode = 'INTERACTION_MEDIUM';
      } else if (idx === 0) {
        visualMode = 'ENVIRONMENT_WIDE';
      }
    }

    if (visualMode && VISUAL_MODE_TO_SCALE[visualMode]) {
      scale = VISUAL_MODE_TO_SCALE[visualMode];
    }

    // Visible Members & Contract
    let visibleMembers = [];
    let visiblePeopleContract = { min: 0, max: 0 };

    if (visualMode === 'EMPTY_RELEASE' || visualMode === 'OBJECT_DETAIL') {
      visibleMembers = [];
      visiblePeopleContract = { min: 0, max: 0 };
    } else if (visualMode === 'ACTION_DETAIL') {
      visibleMembers = mode === CONTENT_MODES.RELATIONSHIP ? ['listener'] : storyParticipants.slice(0, 1);
      visiblePeopleContract = { min: 0, max: 1 };
    } else if (visualMode === 'REACTION_CLOSE' || visualMode === 'SOLO_MEDIUM') {
      visibleMembers = mode === CONTENT_MODES.RELATIONSHIP ? ['listener'] : storyParticipants.slice(0, 1);
      visiblePeopleContract = { min: 1, max: 1 };
    } else if (visualMode === 'INTERACTION_MEDIUM') {
      visibleMembers = storyParticipants.slice(0, 2);
      visiblePeopleContract = { min: 2, max: 2 };
    } else if (visualMode === 'ENVIRONMENT_WIDE') {
      visibleMembers = storyParticipants.slice(0, Math.min(storyParticipants.length, 4));
      visiblePeopleContract = { min: Math.min(2, storyParticipants.length), max: Math.min(storyParticipants.length, 4) };
    } else if (visualMode === 'GROUP_WIDE') {
      visibleMembers = storyParticipants;
      visiblePeopleContract = { min: 2, max: storyParticipants.length };
    } else {
      visibleMembers = storyParticipants.slice(0, 2);
      visiblePeopleContract = { min: 1, max: 2 };
    }

    const presentMembers = (visualMode === 'EMPTY_RELEASE' || role === STORY_ROLES.RELEASE) ? [] : storyParticipants;
    const peopleContract = visiblePeopleContract;

    // Silhouette selection
    let silhouette = 'single-centered';

    if (idx === 0 && hookProgression) {
      silhouette = hookProgression.firstSilhouette;
    } else if (idx === 1 && hookProgression) {
      silhouette = hookProgression.secondSilhouette;
    } else {
      switch (visualMode) {
        case 'INTERACTION_MEDIUM':
          silhouette = (idx % 2 === 0) ? 'two-person' : 'two-person-balanced';
          break;
        case 'SOLO_MEDIUM':
          silhouette = (idx % 2 === 0) ? 'single-left' : 'single-centered';
          break;
        case 'ENVIRONMENT_WIDE':
          silhouette = peopleContract.min >= 2 ? 'two-person-wide' : 'room-wide';
          break;
        case 'GROUP_WIDE':
          silhouette = 'family-group';
          break;
        case 'ACTION_DETAIL':
          silhouette = 'hands-detail';
          break;
        case 'OBJECT_DETAIL':
          silhouette = 'object-detail';
          break;
        case 'REACTION_CLOSE':
          silhouette = item.isStatement ? 'face-close' : (idx % 2 === 0 ? 'single-centered' : 'single-left');
          break;
        case 'EMPTY_RELEASE':
          silhouette = 'empty-space';
          break;
        default:
          if (peopleContract.min >= 2) {
            silhouette = 'two-person';
          } else if (scale === 'DETAIL') {
            silhouette = 'hands-detail';
          } else if (scale === 'CLOSE') {
            silhouette = 'face-close';
          } else if (scale === 'WIDE') {
            silhouette = 'room-wide';
          } else {
            silhouette = idx % 2 === 0 ? 'single-left' : 'single-right';
          }
          break;
      }
    }

    if (!isSilhouetteCompatibleWithPeopleContract(silhouette, peopleContract)) {
      if (peopleContract.min >= 4) {
        silhouette = 'family-group';
      } else if (peopleContract.min === 3) {
        silhouette = 'three-person';
      } else if (peopleContract.min >= 2) {
        silhouette = 'two-person';
      } else if (peopleContract.max === 0) {
        silhouette = scale === 'DETAIL' ? 'object-detail' : 'empty-space';
      } else {
        silhouette = 'single-centered';
      }
    }

    const rendererShotScale = mapPlannerScaleToRendererScale({
      scale,
      silhouette,
      role: plannerStoryRole,
    });
    const composition = chooseCompositionForShot(
      scale,
      silhouette,
      plannerStoryRole,
    );
    const motion = chooseMotion(role);

    const isInsightCard = Boolean(
      item.isStatement ||
        (role === STORY_ROLES.REFLECTION && video.statementText),
    );
    const holdException = isInsightCard
      ? { kind: 'INSIGHT_CARD', reason: 'Statement card hold' }
      : undefined;

    return {
      id: `beat-${String(idx + 1).padStart(2, '0')}`,
      segmentIndex: item.segmentIndex,
      clauseIndex: item.clauseIndex,
      startFrame: item.startFrame,
      endFrame: item.endFrame,
      durationFrames: item.endFrame - item.startFrame,
      voiceClause: item.text,
      audioText: item.text,
      voiceSpan: {
        text: item.text,
        startFrame: item.startFrame,
        endFrame: item.endFrame,
      },
      semanticAnchor,
      semanticTrace: {
        rawSemantic: semanticAnchor.rawSemantic,
        source: semanticAnchor.source,
        mustShow: semanticAnchor.mustShow,
        avoidGenericFallback: semanticAnchor.avoidGenericFallback,
        voiceSpan: item.text,
      },
      mustShow: semanticAnchor.mustShow || (semanticAnchor.rawSemantic ? [semanticAnchor.rawSemantic] : []),
      avoidGenericFallback: semanticAnchor.avoidGenericFallback,
      semanticSource: matched
        ? 'priority-visual'
        : semanticAnchor.avoidGenericFallback
        ? 'voice-semantic'
        : 'contextual-fallback',
      priorityVisualSource: matched || null,
      storyRole: role,
      plannerStoryRole,
      visualMode,
      storyParticipants,
      visibleMembers,
      visiblePeopleContract,
      narrativePurpose: `${role}: ${item.text.slice(0, 120)}`,
      visualIntent,
      semanticIntent: visualIntent,
      visualAction: (visualMode === 'EMPTY_RELEASE' || peopleContract.max === 0)
        ? 'Still atmosphere in the quiet room with soft natural light, clean surfaces, and zero people.'
        : visualAction,
      visualVerb,
      needsPeople: (visualMode === 'EMPTY_RELEASE' || visualMode === 'OBJECT_DETAIL' || role === STORY_ROLES.RELEASE || peopleContract.max === 0) ? false : peoplePolicy(mode, role),
      peopleContract,
      presentMembers,
      castId: cast.needsRecurringCast ? cast.castId : undefined,
      worldId: world.worldId,
      worldLock: world.worldLock,
      continuityGroup,
      shotScale: rendererShotScale,
      scale,
      silhouette,
      composition,
      motionPreset: motion,
      motionProfile:
        plannerStoryRole === 'detail'
          ? 'subtle-push'
          : plannerStoryRole === 'release'
          ? 'slow-pull'
          : 'breathing',
      visualContainer: role === STORY_ROLES.MEMORY ? 'paper' : 'canvas',
      assetStrategy: chooseAssetStrategy({
        role,
        needsRecurringCast: cast.needsRecurringCast,
      }),
      hasInsightCard: isInsightCard,
      holdException,
      referenceReason: `Role ${role} mapped to ${scale}/${silhouette}`,
      grammarVersion: 'reference-shot-grammar-v1',
    };
  });

  // 4. Reference grammar: cadence normalization (merges if > 22 cpm)
  const normalizedShots = normalizeCadence(candidateBeats, totalDurationSec);

  // 5. Anti-monotony repair
  const antiMonotonyShots = [];
  let consecutiveIM = 0;
  for (const s of normalizedShots) {
    const repaired = repairScaleMonotony(s, antiMonotonyShots);
    let currentMode = s.visualMode;
    if (repaired.scale === 'CLOSE') {
      currentMode = 'REACTION_CLOSE';
      if (repaired.silhouette && (repaired.silhouette.includes('two-person') || repaired.silhouette.includes('family'))) {
        repaired.silhouette = 'single-centered';
      }
      if (repaired.visibleMembers && repaired.visibleMembers.length > 1) {
        repaired.visibleMembers = repaired.visibleMembers.slice(0, 1);
      }
      repaired.visiblePeopleContract = { min: 1, max: 1 };
      repaired.peopleContract = { min: 1, max: 1 };
    } else if (repaired.scale === 'MEDIUM') {
      if (repaired.visiblePeopleContract?.max === 1 || (repaired.visibleMembers && repaired.visibleMembers.length === 1)) {
        currentMode = 'SOLO_MEDIUM';
      } else {
        currentMode = 'INTERACTION_MEDIUM';
      }
    } else if (repaired.scale === 'DETAIL') {
      const isObjDetail =
        s.visualMode === 'OBJECT_DETAIL' ||
        repaired.visualMode === 'OBJECT_DETAIL' ||
        (s.peopleContract && s.peopleContract.max === 0) ||
        (repaired.peopleContract && repaired.peopleContract.max === 0) ||
        (repaired.visiblePeopleContract && repaired.visiblePeopleContract.max === 0) ||
        s.silhouette === 'object-detail' ||
        repaired.silhouette === 'object-detail' ||
        (Array.isArray(repaired.visibleMembers) && repaired.visibleMembers.length === 0);

      if (isObjDetail) {
        currentMode = 'OBJECT_DETAIL';
        repaired.silhouette = 'object-detail';
        repaired.visibleMembers = [];
        repaired.visiblePeopleContract = { min: 0, max: 0 };
        repaired.peopleContract = { min: 0, max: 0 };
        repaired.needsPeople = false;
      } else {
        currentMode = 'ACTION_DETAIL';
        repaired.silhouette = 'hands-detail';
        if (repaired.visibleMembers && repaired.visibleMembers.length > 1) {
          repaired.visibleMembers = repaired.visibleMembers.slice(0, 1);
        }
        repaired.visiblePeopleContract = { min: 0, max: 1 };
        repaired.peopleContract = { min: 0, max: 1 };
      }
    } else if (repaired.scale === 'WIDE') {
      currentMode = (s.peopleContract && s.peopleContract.min >= 3) ? 'GROUP_WIDE' : 'ENVIRONMENT_WIDE';
    } else if (repaired.scale === 'RELEASE') {
      if (repaired.plannerStoryRole === 'question' || (s.peopleContract && s.peopleContract.max > 0)) {
        currentMode = (s.peopleContract && s.peopleContract.min >= 3) ? 'GROUP_WIDE' : 'ENVIRONMENT_WIDE';
        repaired.scale = 'WIDE';
        repaired.silhouette = (s.peopleContract && s.peopleContract.min >= 2) ? 'two-person-wide' : 'room-wide';
      } else {
        currentMode = 'EMPTY_RELEASE';
      }
    }

    if (currentMode && VISUAL_MODE_TO_SCALE[currentMode] && VISUAL_MODE_TO_SCALE[currentMode] !== repaired.scale) {
      currentMode = repaired.scale === 'MEDIUM'
        ? ((repaired.visiblePeopleContract?.max === 1 || (repaired.visibleMembers && repaired.visibleMembers.length === 1)) ? 'SOLO_MEDIUM' : 'INTERACTION_MEDIUM')
        : (repaired.scale === 'CLOSE'
          ? 'REACTION_CLOSE'
          : (repaired.scale === 'DETAIL'
            ? (repaired.peopleContract?.max === 0 ? 'OBJECT_DETAIL' : 'ACTION_DETAIL')
            : (repaired.scale === 'WIDE' ? 'ENVIRONMENT_WIDE' : 'EMPTY_RELEASE')));
    }

    if (currentMode === 'EMPTY_RELEASE' || repaired.plannerStoryRole === 'release' || repaired.storyRole === 'release') {
      currentMode = 'EMPTY_RELEASE';
      repaired.scale = 'RELEASE';
      repaired.silhouette = 'empty-space';
      repaired.peopleContract = { min: 0, max: 0 };
      repaired.visiblePeopleContract = { min: 0, max: 0 };
      repaired.visibleMembers = [];
      repaired.presentMembers = [];
      repaired.needsPeople = false;
    }

    if (currentMode === 'INTERACTION_MEDIUM') {
      consecutiveIM++;
      if (consecutiveIM > 3) {
        if (repaired.plannerStoryRole === 'action' || repaired.visualVerb === 'detail-action') {
          currentMode = 'ACTION_DETAIL';
          repaired.scale = 'DETAIL';
          repaired.silhouette = 'hands-detail';
          if (repaired.visibleMembers && repaired.visibleMembers.length > 1) {
            repaired.visibleMembers = repaired.visibleMembers.slice(0, 1);
          }
          repaired.visiblePeopleContract = { min: 0, max: 1 };
          repaired.peopleContract = { min: 0, max: 1 };
        } else {
          currentMode = 'REACTION_CLOSE';
          repaired.scale = 'CLOSE';
          repaired.silhouette = 'single-centered';
          if (repaired.visibleMembers && repaired.visibleMembers.length > 1) {
            repaired.visibleMembers = repaired.visibleMembers.slice(0, 1);
          }
          repaired.visiblePeopleContract = { min: 1, max: 1 };
          repaired.peopleContract = { min: 1, max: 1 };
        }
        consecutiveIM = 0;
      }
    } else {
      consecutiveIM = 0;
    }

    const comp = chooseCompositionForShot(
      repaired.scale,
      repaired.silhouette,
      repaired.plannerStoryRole,
    );
    antiMonotonyShots.push({
      ...repaired,
      scale: repaired.scale,
      visualMode: currentMode,
      shotScale: mapPlannerScaleToRendererScale({
        scale: repaired.scale,
        silhouette: repaired.silhouette,
        role: repaired.plannerStoryRole,
      }),
      composition: comp,
    });
  }

  // Preserve exact beat frame boundaries
  const synchronizedShots = antiMonotonyShots.map((s, idx) => {
    return {
      ...s,
      id: `beat-${String(idx + 1).padStart(2, '0')}`,
      startFrame: s.startFrame,
      endFrame: s.endFrame,
      durationFrames: s.endFrame - s.startFrame,
    };
  });

  // Guarantee no adjacent beats have identical visualIntent or generic semantic duplication
  for (let i = 1; i < synchronizedShots.length; i++) {
    const prev = synchronizedShots[i - 1];
    const curr = synchronizedShots[i];
    const a = normalize(prev.visualIntent);
    const b = normalize(curr.visualIntent);
    if (a && a === b) {
      const extra = curr.voiceClause
        ? ` — Tiếp nối: "${curr.voiceClause.slice(0, 35)}"`
        : ` — Nhịp nối ${i + 1}`;
      curr.visualIntent = `${curr.visualIntent}${extra}`;
      curr.semanticIntent = curr.visualIntent;
    }

    // Semantic duplication check: prevent adjacent generic scenes when voice contains distinctions
    const prevActionNorm = normalize(prev.visualAction);
    const currActionNorm = normalize(curr.visualAction);
    if (
      prevActionNorm &&
      currActionNorm &&
      (prevActionNorm === currActionNorm ||
        (prevActionNorm.includes('dining table') &&
          currActionNorm.includes('dining table') &&
          !curr.semanticAnchor?.avoidGenericFallback))
    ) {
      if (curr.semanticAnchor?.avoidGenericFallback) {
        curr.visualAction = buildVisualAction({
          text: curr.voiceClause,
          role: curr.storyRole,
          mode,
          semanticAnchor: curr.semanticAnchor,
          priority: curr.priorityVisualSource,
        });
      } else {
        const extraAction = curr.voiceClause
          ? ` Distinct quiet moment during: "${curr.voiceClause.slice(0, 40)}".`
          : ` Distinct domestic moment ${i + 1}.`;
        curr.visualAction = `${curr.visualAction}${extraAction}`;
      }
    }
  }

  const effectiveFinalQuestion = video.finalQuestionText || options.finalQuestionText || '';
  const effectiveStatementText = video.statementText || options.statementText || '';

  if (effectiveFinalQuestion) {
    let qBeat = synchronizedShots.find(
      (b) => b.storyRole === STORY_ROLES.QUESTION || b.plannerStoryRole === 'question'
    );
    if (!qBeat && synchronizedShots.length > 0) {
      qBeat = synchronizedShots[synchronizedShots.length - 1];
    }
    if (qBeat) {
      qBeat.isQuestion = true;
      qBeat.questionText = effectiveFinalQuestion;
      qBeat.card = {
        kind: 'question',
        text: effectiveFinalQuestion,
        durationFrames: qBeat.durationFrames,
      };
    }
  }

  if (effectiveStatementText) {
    let sBeat = synchronizedShots.find((b) => b.isStatement || b.hasInsightCard);
    if (sBeat) {
      sBeat.statementText = effectiveStatementText;
      sBeat.card = {
        kind: 'statement',
        text: effectiveStatementText,
        durationFrames: sBeat.durationFrames || 66,
      };
    }
  }

  const plan = {
    version: 1,
    videoIndex: video.index,
    title: video.title,
    series: video.series,
    category: video.category,
    contentMode: mode,
    statementText: effectiveStatementText || null,
    finalQuestionText: effectiveFinalQuestion || null,
    needsRecurringCast: cast.needsRecurringCast,
    castId: cast.castId,
    worldId: world.worldId,
    worldLock: world.worldLock,
    continuityGroup,
    statementDisplay: 'overlay',
    questionDisplay: 'overlay',
    assetResolutionMode:
      options.assetResolutionMode ||
      (options.approvedAssets ? 'RESOLVED' : 'UNRESOLVED'),
    grammarVersion: 'reference-shot-grammar-v1',
    priorityVisualCoverage: coverageReport,
    beats: synchronizedShots,
  };

  const structuralValidation = validateShotPlan(synchronizedShots);
  const metrics = buildShotGrammarMetrics(synchronizedShots);
  const brandAudit = auditBrandContext(
    {
      brandContext,
      rawTimelineText: options.rawTimelineText,
      spokenAudioTranscript: options.spokenAudioTranscript,
      timelineSegments: actualSegments,
    },
    synchronizedShots,
  );
  const reuseAudit = buildReuseAudit(synchronizedShots);
  const productionValidation = evaluateProductionReadiness(
    structuralValidation,
    brandAudit,
    validationMode,
  );
  const legacyValidation = validateStoryPlan(plan);

  return {
    plan,
    validation: {
      ...legacyValidation,
      valid: legacyValidation.valid && structuralValidation.ok,
      errors: [...legacyValidation.errors, ...structuralValidation.errors],
      warnings: [...legacyValidation.warnings, ...structuralValidation.warnings],
    },
    structuralValidation,
    metrics,
    productionValidation,
    brandAudit,
    reuseAudit,
    grammarVersion: 'reference-shot-grammar-v1',
  };
}

function looksGenericFiller(beat) {
  const rawText = `${beat.voiceClause || ''} ${beat.visualIntent || ''}`
    .replace(/avoid posed or decorative imagery/gi, '');
  const text = normalize(rawText);
  const hasActionVerb = includesAny(text, [
    'dat', 'gat', 'xoi', 'rot', 'viet', 'doc', 'don', 'cat', 'mo', 'gap',
    'chuan bi', 'goi', 'nhan', 'di bo', 'lang nghe', 'noi', 'ke', 'phuc vu', 'dua',
    'serving', 'placing', 'listens', 'writes', 'reads', 'clears', 'prepares',
  ]);

  const fillerTerms = [
    'teacup', 'tea cup', 'empty room', 'still life', 'showroom',
    'beautiful interior', 'generic scenery',
  ];

  const hasDecor = /\bdecor\b/i.test(text);

  return (includesAny(text, fillerTerms) || hasDecor) && !hasActionVerb;
}

export function validateStoryPlan(plan) {
  const warnings = [];
  const errors = [];
  const beats = plan.beats || [];

  if (!beats.length) errors.push('Story plan has no beats.');

  const cast = plan.castId ? CHARACTER_CASTS[plan.castId] : null;
  const validMembers = cast && cast.members ? Object.keys(cast.members) : [];

  for (const beat of beats) {
    if (!beat.visualIntent || beat.visualIntent.length < 24) {
      errors.push(`${beat.id}: visualIntent is missing or too generic.`);
    }
    if (looksGenericFiller(beat)) {
      errors.push(`${beat.id}: generic filler visual detected.`);
    }
    if (beat.storyRole === STORY_ROLES.DETAIL && beat.composition !== 'detail-insert') {
      warnings.push(`${beat.id}: detail-action should normally use detail-insert.`);
    }
    if (beat.storyRole === STORY_ROLES.MEMORY && beat.visualContainer !== 'paper') {
      warnings.push(`${beat.id}: memory beat may benefit from paper container.`);
    }
    if (Array.isArray(beat.presentMembers) && beat.presentMembers.length > 0 && plan.castId) {
      const invalidMembers = beat.presentMembers.filter((m) => !validMembers.includes(m));
      if (invalidMembers.length > 0) {
        errors.push(
          `${beat.id}: invalid presentMembers [${invalidMembers.join(', ')}] for cast ${plan.castId}; valid members: [${validMembers.join(', ')}].`
        );
      }
    }
  }

  for (let i = 1; i < beats.length; i++) {
    const a = normalize(beats[i - 1].visualIntent);
    const b = normalize(beats[i].visualIntent);
    if (a && a === b) {
      errors.push(`${beats[i].id}: repeats the previous visual intent exactly.`);
    }
  }

  if (plan.needsRecurringCast && !plan.castId) {
    errors.push('Recurring cast requested but castId is missing.');
  }

  if (Array.isArray(plan.priorityVisualCoverage)) {
    for (const cov of plan.priorityVisualCoverage) {
      if (cov.coverage === 'UNMATCHED') {
        errors.push(
          `Priority visual remained UNMATCHED: "${cov.source}" (${cov.reason || 'no feasible shot capacity'}).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      beatCount: beats.length,
      contentMode: plan.contentMode,
      recurringCast: plan.needsRecurringCast,
      castId: plan.castId || null,
      worldId: plan.worldId || null,
    },
  };
}
