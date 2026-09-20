/**
 * scripts/test-hay-dep-schnell-fulfillment-planner.mjs
 *
 * HAY & ĐẸP. — V3.3B-S.5 / V3.3B-S.5.1
 * Offline fulfillment planner for SIMPLIFY_OR_CANONICAL beats.
 * Converts unsafe multi-person / mixed adult-child family beats into:
 * - CANONICAL_REQUIRED
 * - REUSE_CANONICAL
 * - SCHNELL_SINGLE
 * - SCHNELL_OBJECT
 *
 * Enforces strict semantic anchor integrity: semanticAnchorsPreserved
 * only contains anchors that the simplified visual materially depicts.
 *
 * Pure, deterministic, zero side-effects, no image generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROUTES,
  routeSchnellBeat,
  isChildCastMember,
  getPlanForVideo,
} from './test-hay-dep-schnell-capability-router.mjs';
import { CHARACTER_CASTS } from './human-insight-story-planner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'schnell-fulfillment-planner');

export const FULFILLMENTS = {
  CANONICAL_REQUIRED: 'CANONICAL_REQUIRED',
  REUSE_CANONICAL: 'REUSE_CANONICAL',
  SCHNELL_SINGLE: 'SCHNELL_SINGLE',
  SCHNELL_OBJECT: 'SCHNELL_OBJECT',
  UNCHANGED: 'UNCHANGED',
};

export const ANCHORS = {
  GROUP_PRESENCE: 'GROUP_PRESENCE',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  SIMPLE_MEAL: 'SIMPLE_MEAL',
  PHONE_AWAY: 'PHONE_AWAY',
  SCHOOL_WORK: 'SCHOOL_WORK',
  EVERYDAY_DETAIL: 'EVERYDAY_DETAIL',
  MEMORY: 'MEMORY',
  QUESTION: 'QUESTION',
};

/**
 * Extracts a compact set of semantic anchors from a beat narration.
 * Deterministic, no heavy NLP.
 *
 * V3.3B-S.5.1: "sau một ngày dài" is temporal context only and does NOT produce SCHOOL_WORK.
 * SCHOOL_WORK requires explicit school/work evidence only.
 *
 * @param {Object} beat
 * @returns {string[]}
 */
export function extractSemanticAnchors(beat) {
  if (!beat) return [];
  const text = [
    beat.voiceClause || '',
    beat.narrativePurpose || '',
    beat.visualIntent || '',
  ].join(' ').toLowerCase();

  const anchors = new Set();

  // GROUP_PRESENCE: explicit whole-group togetherness keywords or group establish
  if (
    text.includes('đủ người') ||
    text.includes('mọi người cùng có mặt') ||
    text.includes('mọi người ngồi cùng nhau') ||
    text.includes('cả nhà') ||
    text.includes('cả gia đình') ||
    text.includes('đủ mặt') ||
    text.includes('mọi người cùng') ||
    (beat.storyRole === 'establish' && Array.isArray(beat.presentMembers) && beat.presentMembers.length >= 3)
  ) {
    anchors.add(ANCHORS.GROUP_PRESENCE);
  }

  // PHONE_AWAY: phone put aside / not on table
  if (
    text.includes('đặt sang một bên') ||
    text.includes('không nằm giữa bàn') ||
    text.includes('điện thoại')
  ) {
    anchors.add(ANCHORS.PHONE_AWAY);
  }

  // SCHOOL_WORK: explicit school / work evidence only (V3.3B-S.5.1)
  // "sau một ngày dài" ALONE is temporal context and must NOT produce SCHOOL_WORK
  if (
    text.includes('đi học') ||
    text.includes('đi làm') ||
    text.includes('tan học') ||
    text.includes('tan làm') ||
    text.includes('về nhà sau giờ học') ||
    text.includes('về nhà sau giờ làm') ||
    text.includes('sau một ngày đi học') ||
    text.includes('sau một ngày đi làm')
  ) {
    anchors.add(ANCHORS.SCHOOL_WORK);
  }

  // SIMPLE_MEAL: meal keywords
  if (
    text.includes('món ăn không cầu kỳ') ||
    text.includes('món ăn cầu kỳ') ||
    text.includes('mâm cơm đơn giản') ||
    text.includes('mâm cơm') ||
    text.includes('bữa cơm') ||
    text.includes('bữa ăn') ||
    text.includes('món ăn')
  ) {
    anchors.add(ANCHORS.SIMPLE_MEAL);
  }

  // SPEAKING: speaking / storytelling / apology
  if (
    text.includes('kể chuyện') ||
    text.includes('kể') ||
    text.includes('nói') ||
    text.includes('chia sẻ') ||
    text.includes('câu chuyện') ||
    text.includes('xin lỗi') ||
    text.includes('cuộc trò chuyện')
  ) {
    anchors.add(ANCHORS.SPEAKING);
  }

  // LISTENING: listening / seeing / reacting
  if (
    text.includes('nghe') ||
    text.includes('lắng nghe') ||
    text.includes('nhìn thấy nhau') ||
    text.includes('nhìn') ||
    text.includes('phản ứng') ||
    text.includes('quan sát')
  ) {
    anchors.add(ANCHORS.LISTENING);
  }

  // EVERYDAY_DETAIL: small realistic life detail
  if (
    text.includes('chi tiết nhỏ') ||
    text.includes('chi tiết') ||
    text.includes('đời sống thật') ||
    text.includes('việc nhỏ') ||
    text.includes('ngày thật') ||
    text.includes('ngang tầm')
  ) {
    anchors.add(ANCHORS.EVERYDAY_DETAIL);
  }

  // MEMORY: memory / reflection
  if (
    beat.storyRole === 'memory' ||
    text.includes('kỷ niệm') ||
    text.includes('nhớ lại') ||
    text.includes('từng đẹp') ||
    text.includes('hồi nhỏ')
  ) {
    anchors.add(ANCHORS.MEMORY);
  }

  // QUESTION: ending question
  if (
    beat.storyRole === 'question' ||
    text.includes('?') ||
    text.includes('không?')
  ) {
    anchors.add(ANCHORS.QUESTION);
  }

  return Array.from(anchors);
}

/**
 * Preserved-Anchor Contract (V3.3B-S.5.1 Section 4):
 * An anchor may be listed in semanticAnchorsPreserved only if the simplified visual action
 * materially depicts it. Unrepresented narration anchors are stripped.
 *
 * @param {Object} params
 * @param {string} params.fulfillment
 * @param {string[]} params.extractedAnchors
 * @param {string} params.simplifiedVisualAction
 * @returns {string[]}
 */
export function preservedAnchorsForFulfillment({
  fulfillment,
  extractedAnchors = [],
  simplifiedVisualAction = '',
}) {
  const actionLower = (simplifiedVisualAction || '').toLowerCase();
  const preserved = [];

  if (fulfillment === FULFILLMENTS.SCHNELL_OBJECT) {
    // School/work object: bags, doorway, school/work cues
    if (
      extractedAnchors.includes(ANCHORS.SCHOOL_WORK) &&
      (actionLower.includes('bag') || actionLower.includes('school') || actionLower.includes('work'))
    ) {
      preserved.push(ANCHORS.SCHOOL_WORK);
    }
    // Phone-away object: phone resting on shelf / aside
    if (
      extractedAnchors.includes(ANCHORS.PHONE_AWAY) &&
      (actionLower.includes('phone') || actionLower.includes('shelf'))
    ) {
      preserved.push(ANCHORS.PHONE_AWAY);
    }
    // Simple meal object: bowls, chopsticks, dining table
    if (
      extractedAnchors.includes(ANCHORS.SIMPLE_MEAL) &&
      (actionLower.includes('bowl') || actionLower.includes('table') || actionLower.includes('rice') || actionLower.includes('chopsticks'))
    ) {
      preserved.push(ANCHORS.SIMPLE_MEAL);
    }
    // Never include SPEAKING, LISTENING, or GROUP_PRESENCE for zero-person object shots
    return preserved.length > 0 ? preserved : [ANCHORS.EVERYDAY_DETAIL];
  }

  if (fulfillment === FULFILLMENTS.SCHNELL_SINGLE) {
    // Single-person speaking visual
    if (
      extractedAnchors.includes(ANCHORS.SPEAKING) &&
      (actionLower.includes('speaks') || actionLower.includes('speaking'))
    ) {
      preserved.push(ANCHORS.SPEAKING);
    }
    // Single-person listening visual
    if (
      extractedAnchors.includes(ANCHORS.LISTENING) &&
      (actionLower.includes('listens') || actionLower.includes('listening'))
    ) {
      preserved.push(ANCHORS.LISTENING);
    }
    // If neither speaking nor listening is explicitly depicted in action, preserve primary theme
    if (preserved.length === 0) {
      if (extractedAnchors.includes(ANCHORS.SIMPLE_MEAL)) {
        preserved.push(ANCHORS.SIMPLE_MEAL);
      } else if (extractedAnchors.includes(ANCHORS.EVERYDAY_DETAIL)) {
        preserved.push(ANCHORS.EVERYDAY_DETAIL);
      } else {
        preserved.push(ANCHORS.EVERYDAY_DETAIL);
      }
    }
    return preserved;
  }

  if (fulfillment === FULFILLMENTS.REUSE_CANONICAL || fulfillment === FULFILLMENTS.CANONICAL_REQUIRED) {
    preserved.push(ANCHORS.GROUP_PRESENCE);
    if (extractedAnchors.includes(ANCHORS.SIMPLE_MEAL)) {
      preserved.push(ANCHORS.SIMPLE_MEAL);
    }
    return preserved;
  }

  return [];
}

/**
 * Pure fulfillment planner for a single beat.
 *
 * @param {Object} params
 * @param {Object} params.beat - Story beat object
 * @param {string} params.route - Capability route from routeSchnellBeat
 * @param {Object} [params.cast] - Cast definition
 * @param {Object} [params.plan] - Entire story plan
 * @returns {Object}
 */
export function planSchnellFulfillment({ beat, route, cast, plan }) {
  if (!beat) throw new Error('planSchnellFulfillment requires a beat');

  // Rule C (Section 4): Beats that are NOT SIMPLIFY_OR_CANONICAL remain UNCHANGED
  if (route !== ROUTES.SIMPLIFY_OR_CANONICAL) {
    return {
      sourceRoute: route,
      fulfillment: FULFILLMENTS.UNCHANGED,
    };
  }

  const text = [
    beat.voiceClause || '',
    beat.narrativePurpose || '',
    beat.visualIntent || '',
  ].join(' ').toLowerCase();

  const anchors = extractSemanticAnchors(beat);
  const presentMembers = Array.isArray(beat.presentMembers) ? [...beat.presentMembers] : [];
  const originalPeopleCount = presentMembers.length;
  const hasRecurringCast =
    beat.needsRecurringCast === true ||
    Boolean(beat.castId) ||
    Boolean(plan?.castId) ||
    Boolean(cast);

  // --- Rule A (Section 4): Group-establish beat ---
  if (beat.storyRole === 'establish' && hasRecurringCast && originalPeopleCount >= 3) {
    const actionDesc =
      beat.visualAction || 'All recurring family members gathered together at the dining table.';
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.CANONICAL_REQUIRED,
      targetPeopleCount: null,
      selectedMember: null,
      simplifiedVisualIntent:
        'Opening group identity established once using a curated/stronger-model canonical asset. Recurring family gathered together.',
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'opening group identity must be established once using a curated/stronger-model canonical asset',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.CANONICAL_REQUIRED,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // --- Rule B (Section 4): Explicit whole-group togetherness ---
  const hasExplicitGroupTogetherness =
    text.includes('đủ người') ||
    text.includes('mọi người cùng có mặt') ||
    text.includes('mọi người ngồi cùng nhau') ||
    text.includes('cả nhà') ||
    text.includes('cả gia đình') ||
    text.includes('đủ mặt');

  if (hasExplicitGroupTogetherness) {
    const actionDesc =
      'Reuse canonical establish asset: the whole family gathered together in their recurring home environment.';
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.REUSE_CANONICAL,
      targetPeopleCount: null,
      selectedMember: null,
      simplifiedVisualIntent:
        'Reuse canonical group establish asset to maintain whole-group family presence without dynamic Schnell multi-person generation.',
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: 'establish',
      reason: 'narration requires explicit whole-group togetherness; reuse canonical establish group asset',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.REUSE_CANONICAL,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // --- Rule 6A (Section 6): School/work context -> SCHNELL_OBJECT ---
  const hasSchoolWorkContext =
    text.includes('đi học') ||
    text.includes('đi làm') ||
    text.includes('tan học') ||
    text.includes('tan làm') ||
    text.includes('sau một ngày đi học');

  if (hasSchoolWorkContext) {
    const actionDesc =
      'School bag and work bag resting near the doorway or dining chair, soft warm indoor lighting, no visible people.';
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
      targetPeopleCount: 0,
      selectedMember: null,
      simplifiedVisualIntent:
        'Atmospheric still-life trace of school and work without visible people.',
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'school/work context carried reliably by object/environment trace without visible people',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // --- Rule 6C (Section 6): Phone-away detail -> SCHNELL_OBJECT ---
  const hasPhoneAway =
    text.includes('đặt sang một bên') ||
    text.includes('không nằm giữa bàn') ||
    text.includes('điện thoại');

  if (hasPhoneAway) {
    const actionDesc =
      'Phone face-down on a small side shelf away from the dining table, warm ambient lighting, no visible people.';
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
      targetPeopleCount: 0,
      selectedMember: null,
      simplifiedVisualIntent:
        'Still detail of phone put aside; no visible hands or people.',
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'phone-away detail carried reliably by object trace without visible hands or people',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // --- Rule 6B (Section 6): Simple-meal / ordinary-life detail -> SCHNELL_OBJECT ---
  const hasSimpleMealObject =
    text.includes('món ăn không cầu kỳ') ||
    text.includes('không nằm ở món ăn cầu kỳ') ||
    text.includes('mâm cơm đơn giản');

  if (hasSimpleMealObject) {
    const actionDesc =
      'Simple bowls of rice, chopsticks, soup bowl, used wooden chairs around warm dining table, soft evening light, no visible people.';
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
      targetPeopleCount: 0,
      selectedMember: null,
      simplifiedVisualIntent:
        'Quiet warm dining table still-life with simple meal; no visible people.',
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'simple-meal detail carried reliably by table still-life trace without visible people',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.SCHNELL_OBJECT,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // --- Rule 5 (Section 5): Single-person Simplification -> SCHNELL_SINGLE ---
  const members =
    presentMembers.length > 0
      ? presentMembers
      : cast?.members
      ? Object.keys(cast.members)
      : ['person'];

  // 5A: Explicit speaking / telling
  const hasAdultSpeaking =
    text.includes('bố hay mẹ nói') ||
    text.includes('bố/mẹ nói') ||
    text.includes('người lớn nói') ||
    text.includes('người lớn xin lỗi');

  const hasSpeaking =
    anchors.includes(ANCHORS.SPEAKING) ||
    text.includes('kể chuyện') ||
    text.includes('kể') ||
    text.includes('nói') ||
    text.includes('chia sẻ') ||
    text.includes('câu chuyện');

  if (hasSpeaking) {
    let selected = null;
    let actionDesc = '';

    if (hasAdultSpeaking) {
      selected =
        members.find((m) => ['mother', 'father'].includes(m)) ||
        members.find((m) => !isChildCastMember(m, cast?.members?.[m])) ||
        members[0];
      actionDesc = `${selected} speaks with a calm, reassuring, and gentle expression, facing someone off-frame.`;
    } else {
      // Prefer child if present
      selected =
        members.find((m) => isChildCastMember(m, cast?.members?.[m])) ||
        members[0];
      actionDesc = `${selected} speaks with a small hand gesture, facing someone off-frame.`;
    }

    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
      targetPeopleCount: 1,
      selectedMember: selected,
      simplifiedVisualIntent: `Single focal character (${selected}) speaking or sharing a moment; other persons implied off-frame.`,
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'narration carried by single focal speaker without unsafe multi-person Schnell generation',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // 5B: Explicit listening / seeing / reacting
  const hasListening =
    anchors.includes(ANCHORS.LISTENING) ||
    text.includes('nghe') ||
    text.includes('lắng nghe') ||
    text.includes('nhìn') ||
    text.includes('phản ứng');

  if (hasListening) {
    // Prefer adult listener
    const selected =
      ['mother', 'father', 'listener'].find((m) => members.includes(m)) ||
      members.find((m) => !isChildCastMember(m, cast?.members?.[m])) ||
      members[0];

    const actionDesc = `${selected} pauses and listens attentively with a warm expression, eyes turned toward someone outside frame.`;
    return {
      sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
      fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
      targetPeopleCount: 1,
      selectedMember: selected,
      simplifiedVisualIntent: `Single focal adult (${selected}) listening attentively; other persons implied off-frame.`,
      simplifiedVisualAction: actionDesc,
      canonicalSourceRole: null,
      reason: 'narration carried by single focal listener without unsafe multi-person Schnell generation',
      semanticAnchorsPreserved: preservedAnchorsForFulfillment({
        fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
        extractedAnchors: anchors,
        simplifiedVisualAction: actionDesc,
      }),
    };
  }

  // 5C: Reflection / emotional everyday moment
  const selected =
    ['mother', 'father', 'adult'].find((m) => members.includes(m)) ||
    members.find((m) => !isChildCastMember(m, cast?.members?.[m])) ||
    members[0];

  const actionDesc = `${selected} quietly pauses at the dining table with a calm reflective expression, other family members implied off-frame.`;
  return {
    sourceRoute: ROUTES.SIMPLIFY_OR_CANONICAL,
    fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
    targetPeopleCount: 1,
    selectedMember: selected,
    simplifiedVisualIntent: `Single focal family member (${selected}) in a quiet reflective moment; other members implied off-frame.`,
    simplifiedVisualAction: actionDesc,
    canonicalSourceRole: null,
    reason: 'abstract reflection beat carried by single adult without unsafe multi-person Schnell generation',
    semanticAnchorsPreserved: preservedAnchorsForFulfillment({
      fulfillment: FULFILLMENTS.SCHNELL_SINGLE,
      extractedAnchors: anchors,
      simplifiedVisualAction: actionDesc,
    }),
  };
}

/**
 * Runs deterministic unit tests, including S.5 routing tests and S.5.1 anchor integrity tests.
 */
export function runUnitTests() {
  console.log('=== Running Deterministic Unit Tests (S.5 & S.5.1) ===');
  const results = [];
  const familyCast = CHARACTER_CASTS['family-young-01'];

  // --- S.5 Routing Tests (1 to 9) ---

  // Test 1 — complex establish becomes canonical required
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-01',
        storyRole: 'establish',
        needsPeople: true,
        presentMembers: ['father', 'mother', 'boy', 'girl'],
        voiceClause: 'khi còn nhỏ, một bữa cơm đủ người thường chỉ là chuyện rất bình thường.',
        needsRecurringCast: true,
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass = res.fulfillment === FULFILLMENTS.CANONICAL_REQUIRED;
    results.push({ test: 'Test 1 — complex establish becomes canonical required', expected: FULFILLMENTS.CANONICAL_REQUIRED, actual: res.fulfillment, pass });
  } catch (err) {
    results.push({ test: 'Test 1 — complex establish becomes canonical required', expected: FULFILLMENTS.CANONICAL_REQUIRED, error: err.message, pass: false });
  }

  // Test 2 — whole-group presence reuses canonical
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-03',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'mà ở việc mọi người cùng có mặt',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass = res.fulfillment === FULFILLMENTS.REUSE_CANONICAL && res.canonicalSourceRole === 'establish';
    results.push({ test: 'Test 2 — whole-group presence reuses canonical', expected: FULFILLMENTS.REUSE_CANONICAL, actual: res.fulfillment, pass });
  } catch (err) {
    results.push({ test: 'Test 2 — whole-group presence reuses canonical', expected: FULFILLMENTS.REUSE_CANONICAL, error: err.message, pass: false });
  }

  // Test 3 — listening interaction becomes single-person listener
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-03',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'lắng nghe và nhìn phản ứng',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_SINGLE &&
      res.targetPeopleCount === 1 &&
      res.selectedMember === 'mother';
    results.push({
      test: 'Test 3 — listening interaction becomes single-person listener',
      expected: 'SCHNELL_SINGLE (targetPeopleCount=1, selectedMember=mother)',
      actual: `${res.fulfillment} (targetPeopleCount=${res.targetPeopleCount}, selectedMember=${res.selectedMember})`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 3 — listening interaction becomes single-person listener', expected: FULFILLMENTS.SCHNELL_SINGLE, error: err.message, pass: false });
  }

  // Test 4 — child storytelling becomes single child
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-04',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['father', 'mother', 'boy'],
        voiceClause: 'kể chuyện ở trường',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_SINGLE &&
      res.targetPeopleCount === 1 &&
      res.selectedMember === 'boy';
    results.push({
      test: 'Test 4 — child storytelling becomes single child',
      expected: 'SCHNELL_SINGLE (selectedMember=boy)',
      actual: `${res.fulfillment} (selectedMember=${res.selectedMember})`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 4 — child storytelling becomes single child', expected: FULFILLMENTS.SCHNELL_SINGLE, error: err.message, pass: false });
  }

  // Test 5 — school/work becomes object
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-05',
        storyRole: 'action',
        needsPeople: true,
        presentMembers: ['father', 'boy'],
        voiceClause: 'sau một ngày đi học, đi làm',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_OBJECT &&
      res.targetPeopleCount === 0 &&
      res.selectedMember === null &&
      res.simplifiedVisualAction.toLowerCase().includes('bag');
    results.push({
      test: 'Test 5 — school/work becomes object',
      expected: 'SCHNELL_OBJECT (targetPeopleCount=0, bag cues)',
      actual: `${res.fulfillment} (targetPeopleCount=${res.targetPeopleCount})`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 5 — school/work becomes object', expected: FULFILLMENTS.SCHNELL_OBJECT, error: err.message, pass: false });
  }

  // Test 6 — phone-away becomes object
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-06',
        storyRole: 'detail-action',
        needsPeople: true,
        presentMembers: ['father', 'mother'],
        voiceClause: 'điện thoại được đặt sang một bên',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_OBJECT &&
      res.targetPeopleCount === 0 &&
      res.selectedMember === null;
    results.push({
      test: 'Test 6 — phone-away becomes object',
      expected: 'SCHNELL_OBJECT (targetPeopleCount=0, selectedMember=null)',
      actual: `${res.fulfillment} (targetPeopleCount=${res.targetPeopleCount})`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 6 — phone-away becomes object', expected: FULFILLMENTS.SCHNELL_OBJECT, error: err.message, pass: false });
  }

  // Test 7 — explicit group togetherness is NOT simplified to single person
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-07',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'mà mọi người ngồi cùng nhau',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.REUSE_CANONICAL &&
      res.canonicalSourceRole === 'establish';
    results.push({
      test: 'Test 7 — explicit group togetherness is NOT simplified to single person',
      expected: FULFILLMENTS.REUSE_CANONICAL,
      actual: res.fulfillment,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 7 — explicit group togetherness is NOT simplified to single person', expected: FULFILLMENTS.REUSE_CANONICAL, error: err.message, pass: false });
  }

  // Test 8 — canonical strategy beat remains unchanged
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-08',
        storyRole: 'memory',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        assetStrategy: 'reuse-canonical',
        voiceClause: 'Có những điều lúc đang có thì rất bình thường.',
      },
      route: ROUTES.REUSE_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass = res.fulfillment === FULFILLMENTS.UNCHANGED && res.sourceRoute === ROUTES.REUSE_CANONICAL;
    results.push({
      test: 'Test 8 — canonical strategy beat remains unchanged',
      expected: FULFILLMENTS.UNCHANGED,
      actual: res.fulfillment,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 8 — canonical strategy beat remains unchanged', expected: FULFILLMENTS.UNCHANGED, error: err.message, pass: false });
  }

  // Test 9 — non-SIMPLIFY route remains unchanged
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-09',
        storyRole: 'detail-action',
        needsPeople: true,
        presentMembers: ['father'],
        assetStrategy: 'library-or-generate',
        voiceClause: 'Hoặc chiếc điện thoại được đặt sang một bên.',
      },
      route: ROUTES.SCHNELL_SAFE,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass = res.fulfillment === FULFILLMENTS.UNCHANGED && res.sourceRoute === ROUTES.SCHNELL_SAFE;
    results.push({
      test: 'Test 9 — non-SIMPLIFY route remains unchanged',
      expected: FULFILLMENTS.UNCHANGED,
      actual: res.fulfillment,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test 9 — non-SIMPLIFY route remains unchanged', expected: FULFILLMENTS.UNCHANGED, error: err.message, pass: false });
  }

  // --- S.5.1 Semantic Anchor Integrity Tests (Section 10) ---

  // Test S5.1-1: generic temporal phrase is NOT school/work
  try {
    const anchors = extractSemanticAnchors({
      voiceClause: 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
      narrativePurpose: '',
      visualIntent: '',
    });
    const hasSpeaking = anchors.includes(ANCHORS.SPEAKING);
    const hasListening = anchors.includes(ANCHORS.LISTENING);
    const hasSchoolWork = anchors.includes(ANCHORS.SCHOOL_WORK);
    const pass = hasSpeaking && hasListening && !hasSchoolWork;
    results.push({
      test: 'Test S5.1-1 — generic temporal phrase is NOT school/work',
      expected: 'SPEAKING, LISTENING present; SCHOOL_WORK absent',
      actual: `anchors=[${anchors.join(', ')}]`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-1 — generic temporal phrase is NOT school/work', error: err.message, pass: false });
  }

  // Test S5.1-2: explicit school/work remains detected
  try {
    const anchors = extractSemanticAnchors({
      voiceClause: 'câu chuyện nhỏ sau một ngày đi học, đi làm.',
      narrativePurpose: '',
      visualIntent: '',
    });
    const hasSchoolWork = anchors.includes(ANCHORS.SCHOOL_WORK);
    results.push({
      test: 'Test S5.1-2 — explicit school/work remains detected',
      expected: 'SCHOOL_WORK present',
      actual: `hasSchoolWork=${hasSchoolWork} (anchors=[${anchors.join(', ')}])`,
      pass: hasSchoolWork,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-2 — explicit school/work remains detected', error: err.message, pass: false });
  }

  // Test S5.1-3: current Video 001 beat-04 has no false school/work anchor
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-04',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['boy', 'father', 'mother'],
        voiceClause: 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
        narrativePurpose: 'interaction: nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_SINGLE &&
      res.selectedMember === 'boy' &&
      res.semanticAnchorsPreserved.includes(ANCHORS.SPEAKING) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.SCHOOL_WORK);
    results.push({
      test: 'Test S5.1-3 — Video 001 beat-04 has no false school/work anchor',
      expected: 'SCHNELL_SINGLE, selected=boy, SPEAKING preserved, no SCHOOL_WORK',
      actual: `${res.fulfillment}, selected=${res.selectedMember}, preserved=[${res.semanticAnchorsPreserved.join(', ')}]`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-3 — Video 001 beat-04 has no false school/work anchor', error: err.message, pass: false });
  }

  // Test S5.1-4: current Video 001 beat-07 object does not falsely preserve speaking
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-07',
        storyRole: 'action',
        needsPeople: true,
        presentMembers: ['father', 'boy'],
        voiceClause: 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.',
        narrativePurpose: 'action: Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.fulfillment === FULFILLMENTS.SCHNELL_OBJECT &&
      res.semanticAnchorsPreserved.includes(ANCHORS.SCHOOL_WORK) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.SPEAKING) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.LISTENING);
    results.push({
      test: 'Test S5.1-4 — Video 001 beat-07 object does not falsely preserve speaking',
      expected: 'SCHNELL_OBJECT, SCHOOL_WORK preserved, no SPEAKING/LISTENING',
      actual: `${res.fulfillment}, preserved=[${res.semanticAnchorsPreserved.join(', ')}]`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-4 — Video 001 beat-07 object does not falsely preserve speaking', error: err.message, pass: false });
  }

  // Test S5.1-5: group reuse preserves group presence without unrelated school/work anchor
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-03',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'mà ở việc mọi người cùng có mặt',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.semanticAnchorsPreserved.includes(ANCHORS.GROUP_PRESENCE) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.SCHOOL_WORK);
    results.push({
      test: 'Test S5.1-5 — group reuse preserves group presence, no school/work',
      expected: 'GROUP_PRESENCE preserved, no SCHOOL_WORK',
      actual: `preserved=[${res.semanticAnchorsPreserved.join(', ')}]`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-5 — group reuse preserves group presence, no school/work', error: err.message, pass: false });
  }

  // Test S5.1-6: phone object preserves phone-away only
  try {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-phone',
        storyRole: 'detail-action',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'điện thoại được đặt sang một bên',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });
    const pass =
      res.semanticAnchorsPreserved.includes(ANCHORS.PHONE_AWAY) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.SPEAKING) &&
      !res.semanticAnchorsPreserved.includes(ANCHORS.GROUP_PRESENCE);
    results.push({
      test: 'Test S5.1-6 — phone object preserves phone-away only',
      expected: 'PHONE_AWAY preserved only',
      actual: `preserved=[${res.semanticAnchorsPreserved.join(', ')}]`,
      pass,
    });
  } catch (err) {
    results.push({ test: 'Test S5.1-6 — phone object preserves phone-away only', error: err.message, pass: false });
  }

  let allPassed = true;
  for (const r of results) {
    console.log(`  ${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.test} -> ${r.actual || r.error}`);
    if (!r.pass) allPassed = false;
  }

  return { results, allPassed };
}

/**
 * Generates fulfillment plan for a video, validating against Section 13 rules.
 */
export function generateFulfillmentForVideo(videoIndex) {
  const { video, plan, cast } = getPlanForVideo(videoIndex);
  const rows = [];

  for (const beat of plan.beats) {
    const routeInfo = routeSchnellBeat({ beat, cast });
    const fulfillmentInfo = planSchnellFulfillment({
      beat,
      route: routeInfo.route,
      cast,
      plan,
    });

    // Validation (Section 13)
    if (fulfillmentInfo.fulfillment === FULFILLMENTS.SCHNELL_SINGLE) {
      if (fulfillmentInfo.targetPeopleCount !== 1) {
        throw new Error(`Beat ${beat.id}: SCHNELL_SINGLE requires targetPeopleCount === 1`);
      }
      if (!fulfillmentInfo.selectedMember) {
        throw new Error(`Beat ${beat.id}: SCHNELL_SINGLE requires selectedMember !== null`);
      }
      if (cast?.members && !(fulfillmentInfo.selectedMember in cast.members)) {
        throw new Error(`Beat ${beat.id}: selectedMember "${fulfillmentInfo.selectedMember}" not in cast members`);
      }
    } else if (fulfillmentInfo.fulfillment === FULFILLMENTS.SCHNELL_OBJECT) {
      if (fulfillmentInfo.targetPeopleCount !== 0) {
        throw new Error(`Beat ${beat.id}: SCHNELL_OBJECT requires targetPeopleCount === 0`);
      }
      if (fulfillmentInfo.selectedMember !== null) {
        throw new Error(`Beat ${beat.id}: SCHNELL_OBJECT requires selectedMember === null`);
      }
      const actionLower = (fulfillmentInfo.simplifiedVisualAction || '').toLowerCase();
      if (actionLower.includes('father') || actionLower.includes('mother') || actionLower.includes('person') || actionLower.includes('people') || actionLower.includes('child')) {
        if (!actionLower.includes('no visible people')) {
          throw new Error(`Beat ${beat.id}: SCHNELL_OBJECT mentions visible people: ${fulfillmentInfo.simplifiedVisualAction}`);
        }
      }
    } else if (fulfillmentInfo.fulfillment === FULFILLMENTS.REUSE_CANONICAL) {
      if (!fulfillmentInfo.canonicalSourceRole) {
        throw new Error(`Beat ${beat.id}: REUSE_CANONICAL requires canonicalSourceRole !== null`);
      }
    }

    rows.push({
      beatId: beat.id,
      storyRole: beat.storyRole,
      sourceRoute: routeInfo.route,
      fulfillment: fulfillmentInfo.fulfillment,
      targetPeopleCount: fulfillmentInfo.targetPeopleCount ?? null,
      selectedMember: fulfillmentInfo.selectedMember ?? null,
      semanticAnchorsPreserved: fulfillmentInfo.semanticAnchorsPreserved || [],
      simplifiedVisualAction: fulfillmentInfo.simplifiedVisualAction || '(unchanged)',
      reason: fulfillmentInfo.reason || routeInfo.reason,
      voiceClause: beat.voiceClause,
    });
  }

  return { video, plan, cast, rows };
}

async function main() {
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S.5.1: Semantic Anchor Integrity Planner ===');
  console.log(`Base directory: ${BASE_DIR}\n`);

  // 1. Run deterministic unit tests
  const unitTestSummary = runUnitTests();
  if (!unitTestSummary.allPassed) {
    console.error('❌ One or more unit tests failed!');
    process.exit(1);
  }

  // 2. Video 001 Dry Run
  console.log('\n=== Generating Video 001 Fulfillment ===');
  const v1 = generateFulfillmentForVideo(1);
  const v1JsonPath = path.join(BASE_DIR, 'video001-fulfillment.json');
  fs.writeFileSync(v1JsonPath, JSON.stringify(v1.rows, null, 2));
  console.log(`✅ Saved: ${v1JsonPath}`);

  const v1MdLines = [
    '# Video 001 Fulfillment Table — Schnell Family Fulfillment Planner',
    '',
    `**Video**: 001 — "${v1.video.title}"  `,
    `**Content Mode**: \`${v1.plan.contentMode}\` | **Cast**: \`${v1.plan.castId}\`  `,
    `**Total Beats**: ${v1.rows.length}`,
    '',
    '| Beat ID | Story Role | Source Route | Fulfillment | Target Count | Selected Member | Anchors Preserved | Simplified Action / Reason |',
    '|---|---|---|:---:|:---:|:---:|---|---|',
  ];

  for (const r of v1.rows) {
    const anchorsStr = r.semanticAnchorsPreserved.length > 0 ? r.semanticAnchorsPreserved.join(', ') : '*(none)*';
    const memberStr = r.selectedMember ? `\`${r.selectedMember}\`` : '*(none)*';
    const countStr = r.targetPeopleCount !== null ? String(r.targetPeopleCount) : '-';
    v1MdLines.push(
      `| \`${r.beatId}\` | \`${r.storyRole}\` | \`${r.sourceRoute}\` | **\`${r.fulfillment}\`** | ${countStr} | ${memberStr} | ${anchorsStr} | **Action**: ${r.simplifiedVisualAction}<br/>*Reason*: ${r.reason} |`
    );
  }

  const v1MdPath = path.join(BASE_DIR, 'video001-fulfillment.md');
  fs.writeFileSync(v1MdPath, v1MdLines.join('\n'));
  console.log(`✅ Saved: ${v1MdPath}`);

  // 3. Video 028 Dry Run
  console.log('\n=== Generating Video 028 Fulfillment ===');
  const v28 = generateFulfillmentForVideo(28);
  const v28JsonPath = path.join(BASE_DIR, 'video028-fulfillment.json');
  fs.writeFileSync(v28JsonPath, JSON.stringify(v28.rows, null, 2));
  console.log(`✅ Saved: ${v28JsonPath}`);

  const v28MdLines = [
    '# Video 028 Fulfillment Table — Schnell Family Fulfillment Planner',
    '',
    `**Video**: 028 — "${v28.video.title}"  `,
    `**Content Mode**: \`${v28.plan.contentMode}\` | **Cast**: \`${v28.plan.castId}\`  `,
    `**Total Beats**: ${v28.rows.length}`,
    '',
    '| Beat ID | Story Role | Source Route | Fulfillment | Target Count | Selected Member | Anchors Preserved | Simplified Action / Reason |',
    '|---|---|---|:---:|:---:|:---:|---|---|',
  ];

  for (const r of v28.rows) {
    const anchorsStr = r.semanticAnchorsPreserved.length > 0 ? r.semanticAnchorsPreserved.join(', ') : '*(none)*';
    const memberStr = r.selectedMember ? `\`${r.selectedMember}\`` : '*(none)*';
    const countStr = r.targetPeopleCount !== null ? String(r.targetPeopleCount) : '-';
    v28MdLines.push(
      `| \`${r.beatId}\` | \`${r.storyRole}\` | \`${r.sourceRoute}\` | **\`${r.fulfillment}\`** | ${countStr} | ${memberStr} | ${anchorsStr} | **Action**: ${r.simplifiedVisualAction}<br/>*Reason*: ${r.reason} |`
    );
  }

  const v28MdPath = path.join(BASE_DIR, 'video028-fulfillment.md');
  fs.writeFileSync(v28MdPath, v28MdLines.join('\n'));
  console.log(`✅ Saved: ${v28MdPath}`);

  // 4. Output Summary (Section 14)
  console.log('\n=== Generating Summary Document ===');
  const getCounts = (rows) => {
    const counts = {
      [FULFILLMENTS.CANONICAL_REQUIRED]: 0,
      [FULFILLMENTS.REUSE_CANONICAL]: 0,
      [FULFILLMENTS.SCHNELL_SINGLE]: 0,
      [FULFILLMENTS.SCHNELL_OBJECT]: 0,
      [FULFILLMENTS.UNCHANGED]: 0,
    };
    for (const r of rows) {
      counts[r.fulfillment]++;
    }
    return counts;
  };

  const v1Counts = getCounts(v1.rows);
  const v28Counts = getCounts(v28.rows);

  const summaryContent = `# HAY & ĐẸP. V3.3B-S.5.1 — Family Fulfillment Planner Summary

Date: 2026-09-19  
Scope: Offline fulfillment plan for \`SIMPLIFY_OR_CANONICAL\` family beats with strict semantic anchor integrity.

---

## 1. Fulfillment Counts by Video

| Video | Total Beats | CANONICAL_REQUIRED | REUSE_CANONICAL | SCHNELL_SINGLE | SCHNELL_OBJECT | UNCHANGED |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Video 001** | ${v1.rows.length} | ${v1Counts[FULFILLMENTS.CANONICAL_REQUIRED]} | ${v1Counts[FULFILLMENTS.REUSE_CANONICAL]} | ${v1Counts[FULFILLMENTS.SCHNELL_SINGLE]} | ${v1Counts[FULFILLMENTS.SCHNELL_OBJECT]} | ${v1Counts[FULFILLMENTS.UNCHANGED]} |
| **Video 028** | ${v28.rows.length} | ${v28Counts[FULFILLMENTS.CANONICAL_REQUIRED]} | ${v28Counts[FULFILLMENTS.REUSE_CANONICAL]} | ${v28Counts[FULFILLMENTS.SCHNELL_SINGLE]} | ${v28Counts[FULFILLMENTS.SCHNELL_OBJECT]} | ${v28Counts[FULFILLMENTS.UNCHANGED]} |

---

## 2. Transformation Impact Analysis

### Video 001 (16 beats total)
- **Formerly Unsafe Family Beats (\`SIMPLIFY_OR_CANONICAL\`)**: 10 beats
- **Became Schnell-Safe via Simplification**: ${v1Counts[FULFILLMENTS.SCHNELL_SINGLE] + v1Counts[FULFILLMENTS.SCHNELL_OBJECT]} beats
  - \`SCHNELL_SINGLE\` (1-person focal): ${v1Counts[FULFILLMENTS.SCHNELL_SINGLE]} beats
  - \`SCHNELL_OBJECT\` (0-person still life / detail): ${v1Counts[FULFILLMENTS.SCHNELL_OBJECT]} beats
- **Require Canonical Group Asset**: ${v1Counts[FULFILLMENTS.CANONICAL_REQUIRED] + v1Counts[FULFILLMENTS.REUSE_CANONICAL]} beats
  - \`CANONICAL_REQUIRED\` (master 4-person opening): ${v1Counts[FULFILLMENTS.CANONICAL_REQUIRED]} beat
  - \`REUSE_CANONICAL\` (togetherness reuse of establish): ${v1Counts[FULFILLMENTS.REUSE_CANONICAL]} beats
- **Unchanged Beats**: ${v1Counts[FULFILLMENTS.UNCHANGED]} beats (3 already safe, 3 already canonical reuse)

### Video 028 (14 beats total)
- **Formerly Unsafe Family Beats (\`SIMPLIFY_OR_CANONICAL\`)**: 12 beats
- **Became Schnell-Safe via Simplification**: ${v28Counts[FULFILLMENTS.SCHNELL_SINGLE] + v28Counts[FULFILLMENTS.SCHNELL_OBJECT]} beats
  - \`SCHNELL_SINGLE\` (1-person focal): ${v28Counts[FULFILLMENTS.SCHNELL_SINGLE]} beats
  - \`SCHNELL_OBJECT\` (0-person still life / detail): ${v28Counts[FULFILLMENTS.SCHNELL_OBJECT]} beats
- **Require Canonical Group Asset**: ${v28Counts[FULFILLMENTS.CANONICAL_REQUIRED] + v28Counts[FULFILLMENTS.REUSE_CANONICAL]} beats
  - \`CANONICAL_REQUIRED\` (master 4-person opening): ${v28Counts[FULFILLMENTS.CANONICAL_REQUIRED]} beat
  - \`REUSE_CANONICAL\`: ${v28Counts[FULFILLMENTS.REUSE_CANONICAL]} beats
- **Unchanged Beats**: ${v28Counts[FULFILLMENTS.UNCHANGED]} beats (1 already safe, 1 already canonical reuse)

---

## 3. Other Videos Status
- **Video 007 & 013**: 100% \`SCHNELL_SAFE\` / \`REUSE_CANONICAL\`. No transformation needed, remains unchanged.
- **Video 005**: 11 beats routed \`SCHNELL_PAIR_UNPROVEN\`. Intentionally UNTOUCHED in this task, reserved for dedicated 2-adult fidelity test.

---

## 4. Anchor Integrity Audit
- **Video 001 beat-04**: Preserved anchors corrected to \`[SPEAKING]\`. False \`SCHOOL_WORK\` anchor eliminated.
- **Video 001 beat-07**: Preserved anchors corrected to \`[SCHOOL_WORK]\`. False \`SPEAKING\` anchor eliminated (object still life cannot depict speech).
`;

  const summaryPath = path.join(BASE_DIR, 'summary.md');
  fs.writeFileSync(summaryPath, summaryContent);
  console.log(`✅ Saved: ${summaryPath}`);

  console.log('\n=== All Operations Complete ===');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
