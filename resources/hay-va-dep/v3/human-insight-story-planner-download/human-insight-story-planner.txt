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
  const haystack = [
    video.title,
    video.category,
    video.series,
    video.voiceScriptText,
  ].filter(Boolean).join(' ');

  if (includesAny(haystack, [
    'gia đình', 'bố mẹ', 'con cái', 'anh chị em', 'bữa cơm',
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
    'thói quen', 'chuẩn bị', 'lịch', 'động lực', 'bỏ lỡ', 'buổi sáng',
    'điện thoại', 'ngày bận', 'tập trung', '20 phút', '10 phút',
  ])) {
    return CONTENT_MODES.HABIT;
  }

  return CONTENT_MODES.REFLECTIVE;
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
    // Dialogue content benefits from continuity, but do not force a family.
    return { needsRecurringCast: true, castId: 'solo-female-01' };
  }

  if (mode === CONTENT_MODES.BOOKS || mode === CONTENT_MODES.HABIT) {
    return { needsRecurringCast: true, castId: 'solo-female-01' };
  }

  if (mode === CONTENT_MODES.HOME) {
    return { needsRecurringCast: true, castId: 'solo-female-01' };
  }

  return { needsRecurringCast: false, castId: undefined };
}

export function inferWorld(video, mode) {
  const seed = stableInt(`${video.index}|${video.title}|${mode}`);

  switch (mode) {
    case CONTENT_MODES.FAMILY:
      return {
        worldId: `home-family-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Same warm Vietnamese family home across connected scenes.',
          'Simple wooden furniture, ivory/warm-cream walls, muted sage details, natural domestic clutter.',
          'Warm evening practical light mixed with soft natural ambient light.',
          'Do not suddenly turn the home into a restaurant, luxury showroom, or unrelated apartment.',
        ].join('\n'),
      };

    case CONTENT_MODES.RELATIONSHIP:
      return {
        worldId: `everyday-dialogue-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Keep recurring conversation scenes in one believable everyday Vietnamese setting.',
          'Calm home, quiet cafe, or walking environment chosen once and kept visually coherent.',
          'No random luxury setting changes.',
        ].join('\n'),
      };

    case CONTENT_MODES.BOOKS:
      return {
        worldId: `reading-space-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Same warm reading/work space across connected scenes.',
          'Wood desk, ivory wall, soft daylight, muted sage accents, lived-in but uncluttered.',
          'Books must be used by a person, not displayed as a catalog.',
        ].join('\n'),
      };

    case CONTENT_MODES.HOME:
      return {
        worldId: `home-living-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Same believable lived-in Vietnamese home across connected scenes.',
          'Keep wall, floor, furniture language and daylight direction coherent.',
          'No showroom interior.',
        ].join('\n'),
      };

    case CONTENT_MODES.HABIT:
      return {
        worldId: `daily-routine-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Keep the same everyday routine environment when scenes are causally connected.',
          'Use practical home/work context, not generic aesthetic decor.',
        ].join('\n'),
      };

    default:
      return {
        worldId: `everyday-reflection-${String(seed % 3 + 1).padStart(2, '0')}`,
        worldLock: [
          'WORLD LOCK:',
          'Keep a coherent warm everyday-life visual universe.',
          'Ivory, warm wood, muted sage, charcoal linework, natural light.',
        ].join('\n'),
      };
  }
}

function splitByPunctuation(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+|;\s+|:\s+(?=[A-ZÀ-Ỹ])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLongClause(clause) {
  const wc = wordCount(clause);
  if (wc <= 20) return [clause];

  // Split only on meaning-bearing conjunctions, not every comma.
  const parts = clause
    .split(/\s+(?:nhưng|mà|còn|hoặc|và rồi|trong khi|thay vì|để rồi)\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts;
  return [clause];
}

function mergeToBeatBudget(parts, durationSec) {
  if (parts.length <= 1) return parts;

  // Aim at ~2.6s per beat, max 3 beats per transcript segment.
  const targetCount = Math.max(1, Math.min(3, Math.round(durationSec / 2.6)));
  if (parts.length <= targetCount) return parts;

  const groups = Array.from({ length: targetCount }, () => []);
  const weights = Array(targetCount).fill(0);

  for (const part of parts) {
    const idx = weights.indexOf(Math.min(...weights));
    groups[idx].push(part);
    weights[idx] += Math.max(1, wordCount(part));
  }

  return groups
    .map((group) => group.join(' ').trim())
    .filter(Boolean);
}

export function splitVisualClauses(text, durationSec = 3) {
  const initial = splitByPunctuation(text).flatMap(splitLongClause);
  return mergeToBeatBudget(initial.length ? initial : [text], durationSec);
}

function roleFromText(text, index, count, mode) {
  if (index === count - 1 && /\?$/.test(String(text).trim())) return STORY_ROLES.QUESTION;

  if (includesAny(text, [
    'sau này', 'kỷ niệm', 'nhớ', 'ngày trước', 'hồi nhỏ', 'tuổi thơ',
    'lúc đang có', 'từng đẹp', 'đã từng',
  ])) {
    return STORY_ROLES.MEMORY;
  }

  if (includesAny(text, [
    'đặt', 'cất', 'gắp', 'xới', 'rót', 'viết', 'đọc', 'dọn', 'mở',
    'gấp', 'chuẩn bị', 'bỏ', 'sửa', 'chụp', 'gọi', 'nhắn', 'đi bộ',
  ])) {
    return STORY_ROLES.DETAIL;
  }

  if (includesAny(text, [
    'kể chuyện', 'lắng nghe', 'xin lỗi', 'cảm ơn', 'nói', 'hỏi',
    'nhìn nhau', 'ở cạnh', 'ngồi cùng', 'gặp', 'trò chuyện',
  ])) {
    return STORY_ROLES.INTERACTION;
  }

  if (index === 0) return STORY_ROLES.ESTABLISH;

  if (includesAny(text, [
    'vì', 'thực ra', 'đôi khi', 'có những điều', 'giá trị', 'đáng nhớ',
    'đáng quý', 'hiểu ra', 'nhận ra',
  ])) {
    return STORY_ROLES.REFLECTION;
  }

  if (index >= count - 2) return STORY_ROLES.RELEASE;

  if (mode === CONTENT_MODES.HOME || mode === CONTENT_MODES.HABIT) return STORY_ROLES.ACTION;
  return STORY_ROLES.CONTEXT;
}

function matchedPriority(text, priorities = []) {
  const n = normalize(text);
  let best = '';
  let bestScore = 0;

  for (const p of priorities || []) {
    const words = normalize(p).split(/\s+/).filter((w) => w.length >= 3);
    if (!words.length) continue;
    const hits = words.filter((w) => n.includes(w)).length;
    const score = hits / words.length;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return bestScore >= 0.22 ? best : '';
}

function familyIntent(text, role) {
  if (includesAny(text, ['điện thoại'])) {
    return 'A family remains the main subject while one hand deliberately places the phone away from the dining table on a side shelf; the phone is secondary, not the hero object.';
  }
  if (includesAny(text, ['đi học', 'đi làm', 'sau một ngày'])) {
    return 'A parent has just returned home and places a work bag or keys near the chair while the child brings a school notebook; the family reconnects around the same dining table.';
  }
  if (includesAny(text, ['bữa cơm', 'bữa ăn', 'ăn cơm', 'ăn tối'])) {
    if (role === STORY_ROLES.ESTABLISH) {
      return 'The recurring family shares an ordinary simple dinner at home; people are eating and talking naturally, not posing for camera.';
    }
    return 'The same recurring family performs one concrete dinner action: serving rice, passing a bowl, using chopsticks, listening to a child, or clearing the table.';
  }
  if (role === STORY_ROLES.INTERACTION) {
    return 'One family member actively speaks or reacts while the other recurring family members visibly listen and respond.';
  }
  if (role === STORY_ROLES.MEMORY) {
    return 'Reuse or visually echo an earlier canonical family dinner moment as a warm remembered scene; do not invent new faces.';
  }
  if (role === STORY_ROLES.RELEASE) {
    return 'A quiet after-moment in the same family home with clear human traces from the shared activity; calm, lived-in, not showroom-clean.';
  }
  return 'The recurring family performs a specific small domestic action in the same home; no posed family portrait.';
}

function relationshipIntent(text, role) {
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

export function buildVisualIntent({ text, role, mode, visualPriorities }) {
  const priority = matchedPriority(text, visualPriorities);
  if (priority) {
    return `${priority}. Convert this priority into a specific visible human action whenever possible; avoid posed or decorative imagery.`;
  }

  switch (mode) {
    case CONTENT_MODES.FAMILY:
      return familyIntent(text, role);
    case CONTENT_MODES.RELATIONSHIP:
      return relationshipIntent(text, role);
    case CONTENT_MODES.BOOKS:
      return bookIntent(text, role);
    case CONTENT_MODES.HOME:
      return homeIntent(text, role);
    case CONTENT_MODES.HABIT:
      return habitIntent(text, role);
    default:
      return role === STORY_ROLES.REFLECTION || role === STORY_ROLES.RELEASE
        ? 'Show a quiet everyday human aftermath or reflection with visible traces of a real activity; avoid generic scenery.'
        : 'Show one concrete everyday human action that directly demonstrates the narration; avoid generic mood or decor imagery.';
  }
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

function allocateBeatFrames(segment, clauses) {
  const startFrame = Math.max(0, Math.round(Number(segment.start || 0) * 30));
  const endFrame = Math.max(startFrame + 1, Math.round(Number(segment.end || 0) * 30));
  const totalFrames = endFrame - startFrame;
  const weights = clauses.map((c) => Math.max(1, wordCount(c)));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = startFrame;
  return clauses.map((clause, idx) => {
    const isLast = idx === clauses.length - 1;
    const proportional = Math.round(totalFrames * (weights[idx] / totalWeight));
    const beatEnd = isLast ? endFrame : Math.max(cursor + 1, cursor + proportional);
    const result = { clause, startFrame: cursor, endFrame: beatEnd };
    cursor = beatEnd;
    return result;
  });
}

export function buildStoryPlan(video, timelineSegments = []) {
  const mode = inferContentMode(video);
  const cast = inferRecurringCast(video, mode);
  const world = inferWorld(video, mode);
  const continuityGroup = `${video.index || 'video'}:${cast.castId || 'no-cast'}:${world.worldId}`;

  const allBeatSeeds = [];
  timelineSegments.forEach((segment, segmentIndex) => {
    const durationSec = Math.max(0.1, Number(segment.end || 0) - Number(segment.start || 0));
    const clauses = splitVisualClauses(segment.text || '', durationSec);
    const timed = allocateBeatFrames(segment, clauses);
    timed.forEach((item, clauseIndex) => {
      allBeatSeeds.push({
        ...item,
        segmentIndex,
        clauseIndex,
        text: item.clause,
      });
    });
  });

  const beats = allBeatSeeds.map((item, idx) => {
    const role = roleFromText(item.text, idx, allBeatSeeds.length, mode);
    const visualIntent = buildVisualIntent({
      text: item.text,
      role,
      mode,
      visualPriorities: video.visualPriorities,
    });

    return {
      id: `beat-${String(idx + 1).padStart(2, '0')}`,
      segmentIndex: item.segmentIndex,
      clauseIndex: item.clauseIndex,
      startFrame: item.startFrame,
      endFrame: item.endFrame,
      voiceClause: item.text,
      storyRole: role,
      narrativePurpose: `${role}: ${item.text.slice(0, 120)}`,
      visualIntent,
      visualAction: visualIntent,
      needsPeople: peoplePolicy(mode, role),
      castId: cast.needsRecurringCast ? cast.castId : undefined,
      worldId: world.worldId,
      worldLock: world.worldLock,
      continuityGroup,
      shotScale: chooseShotScale(role),
      composition: chooseComposition(role, mode, visualIntent),
      motionPreset: chooseMotion(role),
      visualContainer: role === STORY_ROLES.MEMORY ? 'paper' : 'canvas',
      assetStrategy: role === STORY_ROLES.MEMORY && cast.needsRecurringCast
        ? 'reuse-canonical'
        : 'library-or-generate',
    };
  });

  const plan = {
    version: 1,
    videoIndex: video.index,
    title: video.title,
    series: video.series,
    category: video.category,
    contentMode: mode,
    needsRecurringCast: cast.needsRecurringCast,
    castId: cast.castId,
    worldId: world.worldId,
    worldLock: world.worldLock,
    continuityGroup,
    statementDisplay: 'overlay',
    questionDisplay: 'overlay',
    beats,
  };

  return {
    plan,
    validation: validateStoryPlan(plan),
  };
}

function looksGenericFiller(beat) {
  const text = normalize(`${beat.voiceClause} ${beat.visualIntent}`);
  const hasActionVerb = includesAny(text, [
    'dat', 'gat', 'xoi', 'rot', 'viet', 'doc', 'don', 'cat', 'mo', 'gap',
    'chuan bi', 'goi', 'nhan', 'di bo', 'lang nghe', 'noi', 'ke', 'phuc vu',
    'serving', 'placing', 'listens', 'writes', 'reads', 'clears', 'prepares',
  ]);

  const fillerTerms = [
    'teacup', 'tea cup', 'empty room', 'decor', 'still life', 'showroom',
    'beautiful interior', 'generic scenery',
  ];

  return includesAny(text, fillerTerms) && !hasActionVerb;
}

export function validateStoryPlan(plan) {
  const warnings = [];
  const errors = [];
  const beats = plan.beats || [];

  if (!beats.length) errors.push('Story plan has no beats.');

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
