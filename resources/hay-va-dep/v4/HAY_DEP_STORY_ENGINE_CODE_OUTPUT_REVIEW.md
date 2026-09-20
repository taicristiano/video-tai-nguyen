# HAY & ĐẸP. STORY ENGINE — CODE + OUTPUT REVIEW

## Verdict

The reusable Story Engine wiring is a good architectural direction, but the current end-to-end output regressed badly in visual quality.

The new video proves that:
- planner integration works,
- overlay works,
- duration is no longer artificially stretched,
- BUT asset selection bypasses the intended HAY & ĐẸP. style/cast gate and reuses legacy stick-figure assets.

Do not render Video 005 yet.

---

# P0 — ROOT CAUSE: BATCH BYPASSES THE SAFE ASSET GATE

Current `scripts/batch-engine.mjs`:

```js
const best = selectExistingAsset(manifest, sceneForMatch, excludeSet);

const continuityUnsafe =
  best?.asset?.castId &&
  beat.castId &&
  best.asset.castId !== beat.castId;

const shouldGenerate =
  !best ||
  best.score < 14 ||
  continuityUnsafe ||
  best.asset.tier === 'LEGACY_NEP';

if (!shouldGenerate) {
  return {
    asset: best.asset,
    source: 'manifest',
    score: best.score,
  };
}
```

This is wrong.

Why:
- 394 existing assets have no `tier`.
- 394 existing assets have no `castId`, `worldId`, or `storyRole`.
- `tier === undefined` is treated as safe.
- missing `castId` is not considered a continuity mismatch.
- one `keywordsVi` match can add +14, which is already equal to the generation threshold.

Therefore old NẾP/stick-figure assets can bypass Cloudflare generation.

The image generator itself has a stricter rule:

```js
const isHighTier =
  best &&
  (
    best.asset.tier === ASSET_TIERS.CORE ||
    best.asset.tier === ASSET_TIERS.COMPATIBLE
  );

if (passesConfidence && (isHighTier || !args.generate)) {
  // reuse
}
```

But `batch-engine.mjs` bypasses this rule.

This is the main reason the new render contains stick figures and legacy AI/business illustrations.

---

# P0 FIX — ONE ASSET POLICY, NOT TWO

Preferred fix:
`batch-engine.mjs` must not independently decide that a manifest asset is safe.

Always delegate selection/generation to:

`scripts/human-insight-image.mjs --generate --strict-hay-dep`

The image generator becomes the single source of truth.

Pseudo replacement:

```js
function resolveBeatAsset({
  beat,
  slug,
  sceneIndex,
  beatIndex,
  sceneType,
  mood,
  excludeSet,
}) {
  const args = [
    'scripts/human-insight-image.mjs',

    '--text', beat.voiceClause,
    '--type', sceneType,
    '--mood', mood,

    '--visual', beat.visualIntent,
    '--story-role', beat.storyRole,
    '--action', beat.visualAction || beat.visualIntent,

    '--world-id', beat.worldId || '',
    '--world-lock', beat.worldLock || '',

    '--slug', slug,
    '--scene-index', String(sceneIndex * 10 + beatIndex),

    '--shot-scale', beat.shotScale,
    '--composition', beat.composition,

    '--exclude', Array.from(excludeSet).join(','),

    '--generate',
    '--strict-hay-dep',
  ];

  if (beat.castId) {
    args.push('--cast', beat.castId);
  }

  const result = spawnSync('node', args, {
    cwd: ROOT,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(
      `Image generation failed for ${beat.id}: ${result.stderr}`,
    );
  }

  const parsed = JSON.parse(result.stdout);

  return {
    asset: {
      id: parsed.image.assetId,
      path: parsed.image.path,
      castId: parsed.asset?.castId,
      worldId: parsed.asset?.worldId,
      storyRole: parsed.asset?.storyRole,
    },
    source: parsed.source,
    score: parsed.score ?? parsed.previousBest?.score ?? 0,
  };
}
```

Remove direct manifest scoring from `batch-engine.mjs`.

---

# P0 — STRICT HAY & ĐẸP. ASSET MODE

In `human-insight-image.mjs` add:

```js
strictHayDep: false,
```

CLI:

```js
} else if (arg === '--strict-hay-dep') {
  args.strictHayDep = true;
}
```

Effective tier:

```js
function effectiveTier(asset) {
  return asset?.tier || ASSET_TIERS.LEGACY;
}
```

Reusable rule:

```js
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
```

Main:

```js
const passesConfidence = args.strictHayDep
  ? canReuseForHayDep(best, scene, args.threshold)
  : isConfidentExistingMatch(best, args.threshold);
```

In strict mode, generation failure must NOT silently fall back to legacy/off-style assets.

```js
} catch (err) {
  if (args.strictHayDep) {
    const safeFallback =
      best &&
      canReuseForHayDep(best, scene, args.threshold);

    if (!safeFallback) {
      throw new Error(
        `HAY & ĐẸP. image generation failed and no safe compatible asset exists: ${err.message}`,
      );
    }
  }

  // old fallback behavior for non-strict workflows only
}
```

Quality principle:
**Fail the render instead of silently inserting a stick figure.**

---

# P0 — MANIFEST REALITY

Current `public/assets/human-insight/manifest.json`:
- 394 assets
- 394 have no tier
- 394 have no castId
- 394 have no worldId
- 394 have no storyRole

Until audited, all undefined-tier assets must behave as:

`LEGACY_NEP`

They must not suppress generation in HAY & ĐẸP. strict mode.

---

# P0 — EXISTING CAST SCORING IS INERT FOR LEGACY ASSETS

Current:

```js
if (scene.castId && asset.castId) {
  ...
}
```

A legacy asset with no `castId` receives no continuity penalty.

If strict mode is not used, at least change to:

```js
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
```

But strict gating is still preferred.

---

# P0 — LEGACY TEXT POLLUTION

Actual rendered frame around statement uses old artwork containing:

`EXCELLENT AI!`

plus robot/text.

This violates HAY & ĐẸP. visual rules and competes with the statement overlay.

Cause is the same legacy asset reuse bug.

Do not patch this individual image.
Block unaudited legacy assets at the gate.

---

# P1 — STORY ROLE INFERENCE IS TOO LEXICAL

Current `roleFromText()` checks MEMORY before ESTABLISH.

So Video 001 opening:
“khi còn nhỏ ... sau này ...”
becomes `memory`.

Result:
- opening composition becomes `paper`;
- video starts like a scrapbook card instead of establishing a family/world.

Fix order:

```js
function roleFromText(text, index, count, mode) {
  const clean = String(text).trim();

  if (index === count - 1 && /\?$/.test(clean)) {
    return STORY_ROLES.QUESTION;
  }

  // Opening first establishes the visual world.
  if (index === 0) {
    return STORY_ROLES.ESTABLISH;
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
```

Do not treat every word “đọc” as detail-action.
Do not treat every word “nhớ” as memory/paper.

---

# P1 — `mergeToBeatBudget` BREAKS SEMANTIC ORDER

Current:

```js
for (const part of parts) {
  const idx = weights.indexOf(Math.min(...weights));
  groups[idx].push(part);
}
```

This balances word counts but can produce:

Input:
`A, B, C, D`

Output groups:
`A C`
`B D`

That destroys narrative order.

Replace with contiguous grouping.

```js
function mergeToBeatBudget(parts, durationSec) {
  if (parts.length <= 1) return parts;

  const targetCount = Math.max(
    1,
    Math.min(3, Math.round(durationSec / 2.6)),
  );

  if (parts.length <= targetCount) {
    return parts;
  }

  const totalWords = parts.reduce(
    (sum, part) => sum + Math.max(1, wordCount(part)),
    0,
  );

  const targetWords = totalWords / targetCount;

  const groups = [];
  let current = [];
  let currentWords = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partWords = Math.max(1, wordCount(part));

    const remainingParts = parts.length - i;
    const remainingGroups = targetCount - groups.length;

    if (
      current.length > 0 &&
      currentWords + partWords > targetWords &&
      remainingParts >= remainingGroups
    ) {
      groups.push(current.join(' ').trim());
      current = [];
      currentWords = 0;
    }

    current.push(part);
    currentWords += partWords;
  }

  if (current.length) {
    groups.push(current.join(' ').trim());
  }

  // If heuristic produced too many groups, merge only adjacent groups.
  while (groups.length > targetCount) {
    const last = groups.pop();
    groups[groups.length - 1] =
      `${groups[groups.length - 1]} ${last}`.trim();
  }

  return groups;
}
```

Semantic order must never change.

---

# P1 — VISUAL PRIORITIES ARE TOO DOMINANT

Current:
- each beat greedily matches one of only 4 visual priorities;
- threshold is only 0.22;
- the same priority can return repeatedly later.

Result:
Video 005 repeats:
`một người đang kể chuyện sau ngày dài`

Video 013 repeats:
`một trang sách có đánh dấu`

Visual priorities should be anchors, not the entire visual plan.

Use once-per-video assignment.

Simple patch:
- maintain `usedPriorities = new Set()`;
- do not reuse the same priority unless explicit;
- increase match threshold.

```js
function matchedPriority(
  text,
  priorities = [],
  usedPriorities = new Set(),
) {
  const n = normalize(text);

  let best = '';
  let bestScore = 0;

  for (const p of priorities) {
    const key = normalize(p);

    if (usedPriorities.has(key)) {
      continue;
    }

    const words = key
      .split(/\s+/)
      .filter((w) => w.length >= 4);

    if (!words.length) continue;

    const hits = words.filter((w) => n.includes(w)).length;
    const score = hits / words.length;

    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }

  return bestScore >= 0.45 ? best : '';
}
```

In `buildStoryPlan()`:

```js
const usedPriorities = new Set();

...
const matched = matchedPriority(
  item.text,
  video.visualPriorities,
  usedPriorities,
);

if (matched) {
  usedPriorities.add(normalize(matched));
}
```

Better:
generate mode-specific intent first, then append priority as a hint.
Do not replace the mode-specific visual grammar entirely.

---

# P1 — RELATIONSHIP CAST IS INVALID

Current Video 005:
- mode: relationship-dialogue
- castId: `solo-female-01`

But visual intent repeatedly requires:
`Two recurring people in conversation`.

One-person cast cannot lock two identities.

Add:

```json
"dialogue-pair-01": {
  "id": "dialogue-pair-01",
  "name": "Cặp đối thoại",
  "descriptionVi": "Hai người Việt Nam trưởng thành trong quan hệ thân thiết nhưng không mặc định lãng mạn",
  "members": {
    "speaker": "Vietnamese adult, 27–32, fixed oval facial design, short neat black hair, charcoal/sage casual clothing.",
    "listener": "Vietnamese adult, 27–32, distinct fixed soft facial design, shoulder-length or tied black hair, warm neutral clothing."
  },
  "continuity": "STRICT CONTINUITY: same two distinct people across all dialogue scenes. Do not switch speaker/listener identities. Do not imply romance unless the narration says so.",
  "castLockPrompt": "..."
}
```

Relationship inference:

```js
if (mode === CONTENT_MODES.RELATIONSHIP) {
  if (includesAny(text, ['vợ chồng', 'người yêu'])) {
    return {
      needsRecurringCast: true,
      castId: 'couple-young-01',
    };
  }

  return {
    needsRecurringCast: true,
    castId: 'dialogue-pair-01',
  };
}
```

---

# P1 — BOOKS/HOME/HABIT ARE ALL FEMALE

Current:
- books => solo-female-01
- home => solo-female-01
- habit => solo-female-01

This will make the whole channel visually repetitive.

Choose actor deterministically from the video identity.

```js
function deterministicSoloCast(video) {
  const seed = stableInt(
    `${video.index}|${video.title}|solo-cast`,
  );

  return seed % 2 === 0
    ? 'solo-female-01'
    : 'solo-male-01';
}
```

Use for BOOKS/HOME/HABIT unless the script explicitly implies gender.

---

# P1 — WORLD ID IS MOSTLY COSMETIC

Current:
`home-family-01/02/03`

but all three IDs use nearly the same broad prompt.

A world lock needs actual fixed visual anchors.

Example:

```js
const WORLD_PRESETS = {
  'home-family-01': [
    'Same modest Vietnamese apartment dining room.',
    'Rectangular medium-oak dining table.',
    'Cream wall.',
    'Single warm pendant lamp centered above table.',
    'Window on camera-left with soft evening light.',
    'Low sage ceramic vase on a narrow sideboard.',
    'Keep these anchors across all connected scenes.',
  ].join('\n'),

  'home-family-02': [
    'Same compact Vietnamese townhouse dining area.',
    'Round warm-wood table.',
    'Ivory wall with one small framed print.',
    'Warm ceiling lamp.',
    'Dark wooden cabinet at camera-right.',
    'Keep these anchors across all connected scenes.',
  ].join('\n'),
};
```

If IDs differ, they should actually describe different stable worlds.

---

# P1 — `assetStrategy: reuse-canonical` IS NOT IMPLEMENTED

Planner outputs:

```js
assetStrategy: 'reuse-canonical'
```

But no active code reads it.

`rg` shows it only exists in the planner.

Therefore the report implies functionality that does not exist.

Implement per-video canonical cache.

Example in `processVideo()`:

```js
const canonicalAssets = new Map();
```

Helper key:

```js
function canonicalKey(beat) {
  return `${beat.continuityGroup}:${beat.castId || 'none'}`;
}
```

After resolving an `establish` or strong `interaction` human beat:

```js
if (
  beat.castId &&
  (
    beat.storyRole === 'establish' ||
    beat.storyRole === 'interaction'
  )
) {
  canonicalAssets.set(
    canonicalKey(beat),
    resolved.asset,
  );
}
```

Before resolution:

```js
if (beat.assetStrategy === 'reuse-canonical') {
  const canonical =
    canonicalAssets.get(canonicalKey(beat));

  if (canonical) {
    resolvedVisualBeats.push({
      ...
      imageSrc: canonical.path,
      ...
    });

    continue;
  }
}
```

Memory treatment can change crop/container/motion while keeping the same identity source.

---

# P1 — TESTS ARE TOO WEAK

Current generalization test mainly checks:
- output contains mode names;
- all five print `VALID`.

But `VALID` comes from the same weak validator under test.

It does not catch:
- 001 opening role = memory instead of establish;
- 005 single-person cast for two-person dialogue;
- 013 almost every beat = detail-action;
- legacy stick figures selected end-to-end;
- `assetStrategy` not implemented.

Add direct assertions.

Examples:

```ts
expect(plan001.beats[0].storyRole).toBe('establish');

expect(plan005.castId).toBe('dialogue-pair-01');
expect(
  plan005.beats.some((b) => b.storyRole === 'interaction'),
).toBe(true);

const detailRatio013 =
  plan013.beats.filter(
    (b) => b.storyRole === 'detail-action',
  ).length / plan013.beats.length;

expect(detailRatio013).toBeLessThan(0.55);

expect(plan013.beats[0].storyRole).toBe('establish');

expect(
  plan007.beats.some(
    (b) => b.storyRole === 'action',
  ),
).toBe(true);
```

Asset decision unit tests:

```ts
it('does not reuse unaudited undefined-tier asset in strict HAY & ĐẸP. mode', () => {
  ...
});

it('does not reuse asset with missing castId for recurring-cast beat', () => {
  ...
});

it('allows matching CORE asset with same cast/world', () => {
  ...
});
```

---

# P2 — OVERLAY VISUAL DESIGN

Overlay architecture is now correct: artwork remains visible.

But current white rounded rectangle is still visually heavy.

Do not optimize before asset gate is fixed.

Later:
- lower white opacity;
- reduce box height;
- allow text directly on negative space where possible.

This is polish, not current blocker.

---

# P2 — SFX IS STILL ROUND-ROBIN

Current:

```js
const sfxName = sfxList[i % sfxList.length];
```

This is not a visual blocker, but it is the same anti-pattern removed from layout.

Eventually choose SFX by transition/story role:
- pageTurn => memory/paper
- whoosh => explicit transition
- none => most narrative cuts
- whip rarely

Do not fix in the P0 round unless easy.

---

# Required end-to-end QA

Before rendering again:

1. Story-plan dry run.
2. Asset-decision dry run for Video 001.
3. For every planned human beat, print:
   - beat id
   - role
   - desired cast
   - chosen source
   - chosen tier
   - chosen cast
   - decision: REUSE / GENERATE
4. Expected before generation:
   - unaudited legacy assets => GENERATE
5. Render 001 only after dry-run proves no legacy stick assets are selected.

The next Video 001 render must NOT contain:
- stick figures,
- AI/business legacy illustrations,
- text such as `EXCELLENT AI!`,
- random bus/social-media scenes unrelated to dinner.

