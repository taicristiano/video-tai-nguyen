/**
 * scripts/test-hay-dep-schnell-capability-router.mjs
 *
 * Isolated capability router for FLUX.1 Schnell:
 * Classifies Story Beats into:
 * - REUSE_CANONICAL
 * - SCHNELL_SAFE
 * - SCHNELL_PAIR_UNPROVEN
 * - SIMPLIFY_OR_CANONICAL
 *
 * Pure, deterministic, zero side-effects, no image generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan, CHARACTER_CASTS } from './human-insight-story-planner.mjs';
import { deriveSlug } from '../src/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'scratch', 'v33', 'schnell-capability-router');

export const ROUTES = {
  REUSE_CANONICAL: 'REUSE_CANONICAL',
  SCHNELL_SAFE: 'SCHNELL_SAFE',
  SCHNELL_PAIR_UNPROVEN: 'SCHNELL_PAIR_UNPROVEN',
  SIMPLIFY_OR_CANONICAL: 'SIMPLIFY_OR_CANONICAL',
};

export const CHILD_MEMBER_IDS = new Set(['boy', 'girl', 'child', 'son', 'daughter']);
export const CHILD_DESCRIPTION_KEYWORDS = ['child', 'boy', 'girl', 'school-age', 'young child'];

/**
 * Detects whether a cast member represents a child.
 * Checks memberId first (case-insensitive), then falls back to description.
 */
export function isChildCastMember(memberId, description = '') {
  if (memberId && CHILD_MEMBER_IDS.has(String(memberId).trim().toLowerCase())) {
    return true;
  }
  if (description && typeof description === 'string') {
    const descLower = description.toLowerCase();
    return CHILD_DESCRIPTION_KEYWORDS.some((kw) => descLower.includes(kw));
  }
  return false;
}

/**
 * Pure helper to classify a beat for Schnell generation capability.
 *
 * @param {Object} params
 * @param {Object} params.beat - Story beat object from planner
 * @param {Object} [params.cast] - Cast definition from CHARACTER_CASTS or registry
 * @returns {{ route: string, reason: string, peopleCount: number, requestedMembers: string[], hasChildMember: boolean }}
 */
export function routeSchnellBeat({ beat, cast }) {
  if (!beat) {
    throw new Error('routeSchnellBeat requires a beat object');
  }

  // Strict validation: presentMembers must exist in cast
  if (Array.isArray(beat.presentMembers) && beat.presentMembers.length > 0) {
    if (!cast || !cast.members) {
      throw new Error(`Cast members requested [${beat.presentMembers.join(', ')}], but cast has no defined members.`);
    }
    for (const memberId of beat.presentMembers) {
      if (!(memberId in cast.members)) {
        throw new Error(`Unknown requested cast member: "${memberId}". Known cast members are: [${Object.keys(cast.members).join(', ')}]`);
      }
    }
  }

  // Determine peopleCount, requestedMembers, and hasChildMember
  let peopleCount = 0;
  let requestedMembers = [];
  let hasChildMember = false;

  if (beat.needsPeople === false) {
    peopleCount = 0;
    requestedMembers = [];
    hasChildMember = false;
  } else if (Array.isArray(beat.presentMembers)) {
    requestedMembers = [...beat.presentMembers];
    peopleCount = requestedMembers.length;
    hasChildMember = requestedMembers.some((m) =>
      isChildCastMember(m, cast?.members?.[m])
    );
  } else if (beat.presentMembers === undefined || beat.presentMembers === null) {
    if (cast?.members && Object.keys(cast.members).length === 1) {
      // Rule 4: Solo cast with undefined presentMembers
      const soleMember = Object.keys(cast.members)[0];
      requestedMembers = [soleMember];
      peopleCount = 1;
      hasChildMember = isChildCastMember(soleMember, cast.members[soleMember]);
    } else {
      requestedMembers = [];
      peopleCount = 0;
      hasChildMember = false;
    }
  }

  // --- Rule 1: Existing canonical strategy wins ---
  if (beat.assetStrategy === 'reuse-canonical') {
    return {
      route: ROUTES.REUSE_CANONICAL,
      reason: 'existing canonical strategy',
      peopleCount,
      requestedMembers,
      hasChildMember,
    };
  }

  // --- Rule 2: No people is safe ---
  if (beat.needsPeople === false || (Array.isArray(beat.presentMembers) && beat.presentMembers.length === 0)) {
    return {
      route: ROUTES.SCHNELL_SAFE,
      reason: 'no people / object-environment composition',
      peopleCount: 0,
      requestedMembers: [],
      hasChildMember: false,
    };
  }

  // --- Rule 3: One requested person is safe ---
  if (peopleCount === 1) {
    return {
      route: ROUTES.SCHNELL_SAFE,
      reason: 'single-person composition',
      peopleCount,
      requestedMembers,
      hasChildMember,
    };
  }

  // --- Rule 4: Solo cast with undefined presentMembers ---
  if (beat.presentMembers === undefined && cast?.members && Object.keys(cast.members).length === 1) {
    return {
      route: ROUTES.SCHNELL_SAFE,
      reason: 'single-person composition (solo cast fallback)',
      peopleCount: 1,
      requestedMembers,
      hasChildMember,
    };
  }

  // --- Rule 5: 3 or more people is NOT Schnell-safe ---
  if (peopleCount >= 3) {
    return {
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      reason: 'complex multi-person composition; Schnell failed exact role/count binding in S.2/S.3',
      peopleCount,
      requestedMembers,
      hasChildMember,
    };
  }

  // --- Rule 6: Two people with a child is NOT Schnell-safe ---
  if (peopleCount === 2 && hasChildMember === true) {
    return {
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      reason: 'mixed adult-child role binding failed repeatedly in S.2/S.3',
      peopleCount,
      requestedMembers,
      hasChildMember,
    };
  }

  // --- Rule 7: Two adults remain unproven ---
  if (peopleCount === 2 && hasChildMember === false) {
    return {
      route: ROUTES.SCHNELL_PAIR_UNPROVEN,
      reason: 'two-adult composition has not been validated for role/identity fidelity',
      peopleCount,
      requestedMembers,
      hasChildMember,
    };
  }

  // Default conservative fallback
  return {
    route: ROUTES.SCHNELL_SAFE,
    reason: 'no visible people requested',
    peopleCount,
    requestedMembers,
    hasChildMember,
  };
}

/**
 * Runs the 9 mandatory unit tests.
 */
export function runUnitTests() {
  console.log('=== Running 9 Deterministic Unit Tests ===');
  const results = [];

  const familyCast = CHARACTER_CASTS['family-young-01'];
  const dialogueCast = CHARACTER_CASTS['dialogue-pair-01'];
  const soloCast = CHARACTER_CASTS['solo-male-01'];

  // Test 1: no people
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: false, presentMembers: [], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.SCHNELL_SAFE;
    results.push({ test: 'Test 1 — no people', expected: ROUTES.SCHNELL_SAFE, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 1 — no people', expected: ROUTES.SCHNELL_SAFE, error: err.message, pass: false });
  }

  // Test 2: one adult
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['father'], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.SCHNELL_SAFE;
    results.push({ test: 'Test 2 — one adult', expected: ROUTES.SCHNELL_SAFE, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 2 — one adult', expected: ROUTES.SCHNELL_SAFE, error: err.message, pass: false });
  }

  // Test 3: solo cast, presentMembers undefined
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: undefined, assetStrategy: 'library-or-generate' },
      cast: soloCast,
    });
    const pass = res.route === ROUTES.SCHNELL_SAFE;
    results.push({ test: 'Test 3 — solo cast, presentMembers undefined', expected: ROUTES.SCHNELL_SAFE, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 3 — solo cast, presentMembers undefined', expected: ROUTES.SCHNELL_SAFE, error: err.message, pass: false });
  }

  // Test 4: mother + boy
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['mother', 'boy'], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.SIMPLIFY_OR_CANONICAL;
    results.push({ test: 'Test 4 — mother + boy', expected: ROUTES.SIMPLIFY_OR_CANONICAL, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 4 — mother + boy', expected: ROUTES.SIMPLIFY_OR_CANONICAL, error: err.message, pass: false });
  }

  // Test 5: father + mother + boy
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['father', 'mother', 'boy'], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.SIMPLIFY_OR_CANONICAL;
    results.push({ test: 'Test 5 — father + mother + boy (3 people)', expected: ROUTES.SIMPLIFY_OR_CANONICAL, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 5 — father + mother + boy (3 people)', expected: ROUTES.SIMPLIFY_OR_CANONICAL, error: err.message, pass: false });
  }

  // Test 6: four-person family
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['father', 'mother', 'boy', 'girl'], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.SIMPLIFY_OR_CANONICAL;
    results.push({ test: 'Test 6 — four-person family', expected: ROUTES.SIMPLIFY_OR_CANONICAL, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 6 — four-person family', expected: ROUTES.SIMPLIFY_OR_CANONICAL, error: err.message, pass: false });
  }

  // Test 7: two adults
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['speaker', 'listener'], assetStrategy: 'library-or-generate' },
      cast: dialogueCast,
    });
    const pass = res.route === ROUTES.SCHNELL_PAIR_UNPROVEN;
    results.push({ test: 'Test 7 — two adults (speaker, listener)', expected: ROUTES.SCHNELL_PAIR_UNPROVEN, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 7 — two adults (speaker, listener)', expected: ROUTES.SCHNELL_PAIR_UNPROVEN, error: err.message, pass: false });
  }

  // Test 8: canonical always wins
  try {
    const res = routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['father', 'mother', 'boy', 'girl'], assetStrategy: 'reuse-canonical' },
      cast: familyCast,
    });
    const pass = res.route === ROUTES.REUSE_CANONICAL;
    results.push({ test: 'Test 8 — canonical always wins (even with 4 people)', expected: ROUTES.REUSE_CANONICAL, actual: res.route, pass });
  } catch (err) {
    results.push({ test: 'Test 8 — canonical always wins (even with 4 people)', expected: ROUTES.REUSE_CANONICAL, error: err.message, pass: false });
  }

  // Test 9: invalid requested member throws
  try {
    routeSchnellBeat({
      beat: { needsPeople: true, presentMembers: ['unknown_person'], assetStrategy: 'library-or-generate' },
      cast: familyCast,
    });
    results.push({ test: 'Test 9 — invalid requested member throws', expected: 'THROW', actual: 'NO_THROW', pass: false });
  } catch (err) {
    results.push({ test: 'Test 9 — invalid requested member throws', expected: 'THROW', actual: `THREW: ${err.message}`, pass: true });
  }

  let allPassed = true;
  for (const r of results) {
    console.log(`  ${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.test} -> ${r.actual || r.error}`);
    if (!r.pass) allPassed = false;
  }

  return { results, allPassed };
}

/**
 * Loads story plan for a given video index.
 */
export function getPlanForVideo(videoIndex) {
  const videos = parseHayDepVideos();
  const video = videos.find((v) => v.index === videoIndex);
  if (!video) throw new Error(`Video ${videoIndex} not found in catalog`);

  let segments = null;
  try {
    const slug = deriveSlug(video.cleanContext);
    const timelinePath = path.join(ROOT, 'public', slug, 'timeline.json');
    if (fs.existsSync(timelinePath)) {
      const data = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
      if (Array.isArray(data.segments) && data.segments.length > 0) {
        segments = data.segments;
      }
    }
  } catch {}

  if (!segments) {
    const paras = video.voiceScriptText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\r/g, '').trim())
      .filter(Boolean);

    let t = 0;
    segments = paras.map((text) => {
      const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
      const seg = { start: t, end: t + duration, text };
      t += duration;
      return seg;
    });
  }

  const { plan, validation } = buildStoryPlan(video, segments);
  const cast = plan.castId ? CHARACTER_CASTS[plan.castId] : null;

  return { video, plan, validation, cast };
}

async function main() {
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  console.log('=== HAY & ĐẸP. V3.3B-S.4: Schnell Capability Router ===');
  console.log(`Base directory: ${BASE_DIR}\n`);

  // 1. Run deterministic unit tests
  const unitTestSummary = runUnitTests();
  if (!unitTestSummary.allPassed) {
    console.error('❌ One or more unit tests failed!');
    process.exit(1);
  }

  // 2. Video 001 Dry Run
  console.log('\n=== Video 001 Dry Run ===');
  const v1Data = getPlanForVideo(1);
  const v1Routing = [];

  for (const beat of v1Data.plan.beats) {
    const routeInfo = routeSchnellBeat({ beat, cast: v1Data.cast });
    v1Routing.push({
      beatId: beat.id,
      storyRole: beat.storyRole,
      presentMembers: beat.presentMembers || [],
      assetStrategy: beat.assetStrategy,
      route: routeInfo.route,
      peopleCount: routeInfo.peopleCount,
      hasChildMember: routeInfo.hasChildMember,
      reason: routeInfo.reason,
    });
  }

  const v1JsonPath = path.join(BASE_DIR, 'video001-routing.json');
  fs.writeFileSync(v1JsonPath, JSON.stringify(v1Routing, null, 2));
  console.log(`✅ Saved Video 001 routing JSON: ${v1JsonPath}`);

  // Create Video 001 Markdown table
  const v1MdLines = [
    '# Video 001 Routing Table — Schnell Capability Router',
    '',
    `**Video**: 001 — "${v1Data.video.title}"  `,
    `**Content Mode**: \`${v1Data.plan.contentMode}\` | **Cast**: \`${v1Data.plan.castId}\`  `,
    `**Total Beats**: ${v1Routing.length}`,
    '',
    '| Beat ID | Story Role | Present Members | Asset Strategy | Route | People Count | Has Child | Reason |',
    '|---|---|---|---|:---:|:---:|:---:|---|',
  ];

  for (const r of v1Routing) {
    const membersStr = r.presentMembers.length > 0 ? r.presentMembers.join(', ') : '*(none)*';
    v1MdLines.push(`| \`${r.beatId}\` | \`${r.storyRole}\` | ${membersStr} | \`${r.assetStrategy}\` | **\`${r.route}\`** | ${r.peopleCount} | ${r.hasChildMember ? 'YES' : 'NO'} | ${r.reason} |`);
  }

  const v1MdPath = path.join(BASE_DIR, 'video001-routing.md');
  fs.writeFileSync(v1MdPath, v1MdLines.join('\n'));
  console.log(`✅ Saved Video 001 routing MD: ${v1MdPath}`);

  // 3. Five-Video Dry Run (001, 005, 007, 013, 028)
  console.log('\n=== Five-Video Dry Run (001, 005, 007, 013, 028) ===');
  const targetIndices = [1, 5, 7, 13, 28];
  const fiveVideoResults = [];

  for (const idx of targetIndices) {
    const vData = getPlanForVideo(idx);
    const counts = {
      [ROUTES.REUSE_CANONICAL]: 0,
      [ROUTES.SCHNELL_SAFE]: 0,
      [ROUTES.SCHNELL_PAIR_UNPROVEN]: 0,
      [ROUTES.SIMPLIFY_OR_CANONICAL]: 0,
    };

    for (const beat of vData.plan.beats) {
      const res = routeSchnellBeat({ beat, cast: vData.cast });
      counts[res.route]++;
    }

    const total = vData.plan.beats.length;
    const safeOrReusable = counts[ROUTES.REUSE_CANONICAL] + counts[ROUTES.SCHNELL_SAFE];
    const unproven = counts[ROUTES.SCHNELL_PAIR_UNPROVEN];
    const redesignNeeded = counts[ROUTES.SIMPLIFY_OR_CANONICAL];

    fiveVideoResults.push({
      videoIndex: String(idx).padStart(3, '0'),
      title: vData.video.title,
      mode: vData.plan.contentMode,
      castId: vData.plan.castId || 'none',
      totalBeats: total,
      counts,
      safeOrReusablePct: ((safeOrReusable / total) * 100).toFixed(1) + '%',
      unprovenPct: ((unproven / total) * 100).toFixed(1) + '%',
      redesignPct: ((redesignNeeded / total) * 100).toFixed(1) + '%',
    });
  }

  console.table(fiveVideoResults.map((r) => ({
    Video: r.videoIndex,
    Mode: r.mode,
    Beats: r.totalBeats,
    REUSE_CANONICAL: r.counts[ROUTES.REUSE_CANONICAL],
    SCHNELL_SAFE: r.counts[ROUTES.SCHNELL_SAFE],
    PAIR_UNPROVEN: r.counts[ROUTES.SCHNELL_PAIR_UNPROVEN],
    SIMPLIFY_OR_CANONICAL: r.counts[ROUTES.SIMPLIFY_OR_CANONICAL],
    'Safe/Reusable %': r.safeOrReusablePct,
    'Redesign %': r.redesignPct,
  })));

  // 4. Create Decision Markdown
  const decisionContent = `# HAY & ĐẸP. V3.3B-S.4 — Schnell Capability Router Decision Policy

Date: 2026-09-19  
Scope: Capability boundary routing policy for \`@cf/black-forest-labs/flux-1-schnell\`

---

## 1. Proven Capabilities

- **Style-First Editorial 2D**: FLUX.1 Schnell reliably maintains the \`TARGET_EDITORIAL_2D\` visual aesthetic across beats when medium, rendering recipe, and palette are placed first (8/8 in S.1, 8/8 in S.2, 8/8 in S.3).
- **Zero-Person / Object Scenes**: Cleanly rendered without anatomical confusion.
- **Single-Person Compositions**: Feasible within editorial 2D guidelines.

---

## 2. Not Proven / Failed Capabilities

- **Exact Mixed Adult-Child Binding**: Schnell systematically defaults to adult couples or drops the child (0/4 in S.2, 0/4 in S.3).
- **Exact 3+ People Role Binding**: Schnell collapses multi-person scenes, drops members, or generates amputated/severed body parts (headless torso, floating legs, floating hand).
- **Facial / Identity Locking**: Schnell cannot preserve character identity across independent generations via prompt alone.

---

## 3. Evidence-Derived Routing Policy

1. **REUSE_CANONICAL**: Existing canonical asset strategies (\`assetStrategy: 'reuse-canonical'\`) always take highest precedence. Preserves curated recurring assets (memory, question).
2. **SCHNELL_SAFE**:
   - Zero-person beats (\`needsPeople: false\` or \`presentMembers: []\`).
   - Single-person beats (\`peopleCount: 1\` or solo cast).
3. **SCHNELL_PAIR_UNPROVEN**:
   - Two-adult beats (\`peopleCount: 2\` with \`hasChildMember: false\`).
   - Held in reserve pending a dedicated 2-adult fidelity test. Never assumed safe.
4. **SIMPLIFY_OR_CANONICAL**:
   - Multi-person scenes with 3 or more people (\`peopleCount >= 3\`).
   - Mixed adult-child scenes (\`peopleCount === 2 && hasChildMember === true\`).
   - **MUST NOT** be dispatched dynamically to FLUX.1 Schnell prompt-only generation.

---

## 4. Next Architectural Need

The next separate task is to design how \`SIMPLIFY_OR_CANONICAL\` beats are transformed or fulfilled (e.g. story plan semantic simplification to 1-person focus, canonical group master assets, or tiering to a higher-capacity image model).
`;

  const decisionPath = path.join(BASE_DIR, 'decision.md');
  fs.writeFileSync(decisionPath, decisionContent);
  console.log(`✅ Saved decision policy document: ${decisionPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}
