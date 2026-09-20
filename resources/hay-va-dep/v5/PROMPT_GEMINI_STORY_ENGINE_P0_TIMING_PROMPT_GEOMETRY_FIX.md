# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. STORY ENGINE — P0 TIMING + PROMPT SEMANTICS + IMAGE GEOMETRY FIX

Do NOT render Video 005.
Do NOT add new UI feature.
Do NOT add new motion preset.
Do NOT change brand typography/palette.
Do NOT claim continuity is fixed from metadata.

Read:
`HAY_DEP_STORY_ENGINE_V4_DEEP_REVIEW.md`

The current correctness-fix solved legacy asset leakage, but the actual rendered Video 001 still fails:
- visual reads “family reading books,” not family dinner;
- cast changes;
- world anchors are not perceptually stable;
- scenes are 3.60s ahead of audio by the end because timeline gaps are removed;
- outro starts before question voice finishes;
- generated images are distorted to 688x384 landscape before entering tall video cards.

Implement the following in exact order.

---

# PHASE 1 — TIMELINE MUST BE ABSOLUTE

In `scripts/batch-engine.mjs`:

Narrative scenes must use real transcript timestamps.

Replace `currentFrame` concatenation for narrative scenes with:

```js
const FPS = 30;

const timelineEndSec = Number(
  timeline.duration ??
  Math.max(...segments.map((s) => Number(s.end || 0))),
);

const narrativeEndFrame = Math.ceil(
  timelineEndSec * FPS,
);
```

Inside segment loop:

```js
const sceneStartFrame = Math.round(
  seg.start * FPS,
);

const spokenEndFrame = Math.max(
  sceneStartFrame + 1,
  Math.round(seg.end * FPS),
);

const nextSceneStartFrame =
  i < segments.length - 1
    ? Math.round(
        segments[i + 1].start * FPS,
      )
    : narrativeEndFrame;

const sceneEndFrame = Math.max(
  spokenEndFrame,
  nextSceneStartFrame,
);

const durFrames =
  sceneEndFrame - sceneStartFrame;
```

Scene:

```js
startFrame: sceneStartFrame,
durationFrames: durFrames,
```

Visual beat local timing:

```js
const localStart = Math.max(
  0,
  beat.startFrame - sceneStartFrame,
);

const localEnd = Math.min(
  durFrames,
  Math.max(
    localStart + 1,
    beat.endFrame - sceneStartFrame,
  ),
);
```

Do not rescale transcript timestamps into a compressed scene.

Outro:

```js
const outroStartFrame =
  narrativeEndFrame;

const outroDurationFrames = 60;

scenes.push({
  ...
  startFrame: outroStartFrame,
  durationFrames: outroDurationFrames,
  isOutro: true,
});

const totalFrames =
  outroStartFrame + outroDurationFrames;
```

Expected Video 001:
narrative ~46.06s + 2s outro = roughly 48.1s.

Add tests:
- outro starts after timeline duration;
- total duration includes outro;
- real silence gaps are preserved;
- subtitles and scene start use same absolute clock.

STOP if this test fails.

---

# PHASE 2 — REMOVE SEMANTIC CONTENT FROM GLOBAL STYLE

Replace global `STYLE_PROMPT`.

It MUST NOT contain:
- family
- books
- home
- dinner
- phone
- any content object.

Use:

```js
const STYLE_PROMPT = [
  'STYLE LOCK:',
  'Premium warm editorial 2D illustration for HAY & ĐẸP.',
  'Soft ivory and warm cream palette, muted sage accents, warm wood, charcoal/sepia linework.',
  'Natural gentle light, tactile editorial texture, proportional expressive Vietnamese characters.',
  'Calm uncluttered composition, subtle depth, believable anatomy.',
].join('\n');
```

Add a unit test:

```ts
expect(stylePrompt.toLowerCase())
  .not.toMatch(/\bfamily\b|\bbooks?\b|\bhome\b|\bdinner\b/);
```

---

# PHASE 3 — CONCRETE ACTION MUST BE DIFFERENT FROM VISUAL INTENT

Current:

```js
visualAction: visualIntent
```

is wrong.

Create `buildVisualAction()`.

For `family-emotional`, implement at least:

```js
function familyAction(text, role) {
  if (includesAny(text, ['điện thoại'])) {
    return 'A parent places the phone face-down on a side shelf while the family keeps eating in the background.';
  }

  if (
    includesAny(
      text,
      ['đi học', 'đi làm', 'sau một ngày'],
    )
  ) {
    return 'Father puts his work bag beside the dining chair and sits down while the child brings a school notebook.';
  }

  if (
    includesAny(
      text,
      ['ngồi cùng', 'cùng nhau', 'cùng có mặt'],
    )
  ) {
    return 'All four recurring family members sit around the same dining table, talking and eating; no phone is on the table.';
  }

  if (
    includesAny(
      text,
      ['bữa cơm', 'bữa ăn', 'mâm cơm'],
    )
  ) {
    if (role === STORY_ROLES.ESTABLISH) {
      return 'All four recurring family members eat a simple Vietnamese dinner at the same wooden dining table.';
    }

    return 'Mother serves rice into a child’s bowl while another family member passes a simple dish across the table.';
  }

  if (role === STORY_ROLES.RELEASE) {
    return 'No people. The same dining room after dinner: four used place settings, bowls and chopsticks remain under the warm pendant light.';
  }

  return 'Show one specific domestic action that directly demonstrates the spoken clause.';
}
```

Mode dispatcher:

```js
function buildVisualAction({
  text,
  role,
  mode,
}) {
  switch (mode) {
    case CONTENT_MODES.FAMILY:
      return familyAction(text, role);

    // implement similarly concise action
    // for relationship/books/home/habit

    default:
      return 'Show one concrete visible human action that directly demonstrates the spoken clause.';
  }
}
```

In planner:

```js
const visualAction =
  buildVisualAction({
    text: item.text,
    role,
    mode,
  });

...
visualIntent,
visualAction,
```

Test:

```ts
expect(
  plan001.beats.some(
    (b) =>
      b.visualAction !==
      b.visualIntent,
  ),
).toBe(true);
```

---

# PHASE 4 — FAMILY STORY ROLES MUST SEE ACTION

Before generic reflection/context in `roleFromText`:

```js
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
```

Expected Video 001 role sequence must contain:
- establish
- interaction
- detail-action
- release
- question

Do NOT assert one exact full sequence.

But assert:

```ts
expect(
  roles001.includes('interaction'),
).toBe(true);

expect(
  roles001.includes('detail-action'),
).toBe(true);
```

---

# PHASE 5 — `needsPeople` MUST ACTUALLY CONTROL PROMPT

Add to image CLI:

```js
noPeople: false,
presentMembers: [],
```

CLI:

```js
} else if (arg === '--no-people') {
  args.noPeople = true;
} else if (arg === '--present-members') {
  args.presentMembers = argv[++i]
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
```

Scene:

```js
noPeople: args.noPeople,
presentMembers: args.presentMembers,
```

Batch:

```js
if (!beat.needsPeople) {
  args.push('--no-people');
}

if (
  Array.isArray(beat.presentMembers) &&
  beat.presentMembers.length > 0
) {
  args.push(
    '--present-members',
    beat.presentMembers.join(','),
  );
}
```

If `noPeople`:
do NOT inject family roster.

Return:

```text
PEOPLE:
NO PEOPLE in frame.
Show only believable traces of the activity that just happened.
```

---

# PHASE 6 — ADD `presentMembers` PER BEAT

Add optional:

```ts
presentMembers?: string[];
```

For family:

```js
function familyPresentMembers(
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
```

This controls who is described in the generation prompt.
It does not change the persistent cast identity.

---

# PHASE 7 — BUILD CAST PROMPT ONLY FOR PRESENT MEMBERS

Replace full `castLockPrompt` injection.

```js
function buildPresentCastPrompt(
  scene,
  castId,
) {
  if (scene.noPeople) {
    return [
      'PEOPLE:',
      'NO PEOPLE in frame.',
    ].join('\n');
  }

  const cast =
    CHARACTER_CASTS[castId];

  if (!cast) {
    return buildGenericCastPrompt(scene);
  }

  const requested =
    Array.isArray(scene.presentMembers) &&
    scene.presentMembers.length > 0
      ? scene.presentMembers
      : Object.keys(cast.members);

  const lines = requested
    .filter(
      (memberId) =>
        cast.members[memberId],
    )
    .map(
      (memberId) =>
        `${memberId}: ${cast.members[memberId]}`,
    );

  return [
    `CAST CONTINUITY — ${castId}:`,
    ...lines,
    'Use the same recurring identities.',
    'Do not add random people.',
  ].join('\n');
}
```

This prevents every shot from becoming a four-person family portrait.

---

# PHASE 8 — PROMPT ORDER MUST BE CONTENT-FIRST

Use:

```js
function buildPrompt(scene, castId) {
  const action =
    scene.action ||
    scene.visual ||
    scene.text;

  const sections = [
    `ACTION:\n${action}`,
    `SCENE MEANING:\n${scene.visual || scene.text}`,
    buildPresentCastPrompt(
      scene,
      castId,
    ),
    buildWorldPrompt(scene),
    STYLE_PROMPT,
    buildShotPrompt(scene),
    buildNegativeRules(scene),
  ].filter(Boolean);

  const full =
    sections.join('\n\n');

  if (full.length > 1950) {
    throw new Error(
      `Image prompt too long: ${full.length}. ` +
      `Compact individual sections; do not blind-slice.`,
    );
  }

  return full;
}
```

Delete:

```js
full = full.slice(0, 2000);
```

Add test:
ACTION appears before CAST and STYLE.

---

# PHASE 9 — PRESERVE GENERATED IMAGE ASPECT RATIO

Delete:

```js
const OUTPUT_WIDTH = 688;
const OUTPUT_HEIGHT = 384;
```

Do NOT convert to forced landscape.

Use:

```js
function compressJpeg(
  inputPath,
  outputPath,
) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      inputPath,
      '-q:v',
      '3',
      outputPath,
    ],
    {
      cwd: ROOT,
      encoding: 'utf-8',
    },
  );

  if (result.status !== 0) {
    fs.copyFileSync(
      inputPath,
      outputPath,
    );
  }
}
```

If later size limiting is needed, preserve ratio.

Add integration test using a temporary 512x768 fixture and verify output remains same aspect.

---

# PHASE 10 — RESTORE CLOUDFLARE SEED

Current code computes a seed but never sends it.

Change:

```js
const payload = {
  prompt,
  seed: seed >>> 0,
  steps: 4,
};
```

Do not remove `computeSeeds()`.

Log response errors if Cloudflare rejects seed.
Do not silently omit it.

---

# PHASE 11 — DO NOT CALL GENERATED IMAGE CORE AUTOMATICALLY

Add:

```js
CANDIDATE:
  'HAYDEP_CANDIDATE',
```

Generated asset:

```js
tier:
  ASSET_TIERS.CANDIDATE,
```

Only human/visual QA or a later approved promotion script can promote candidate to CORE.

Strict global reuse remains:
CORE / COMPATIBLE only.

Canonical in-memory reuse within same render is still allowed.

---

# PHASE 12 — CANONICAL MUST NOT BE OVERWRITTEN

Change:

```js
canonicalAssets.set(...)
```

to:

```js
const key =
  canonicalKey(beat);

if (
  beat.castId &&
  (
    beat.storyRole ===
      'establish' ||
    beat.storyRole ===
      'interaction'
  ) &&
  !canonicalAssets.has(key)
) {
  canonicalAssets.set(
    key,
    resolved.asset,
  );
}
```

First canonical reference wins.

---

# PHASE 13 — ADD REAL INTEGRATION TESTS

Required:

```text
1. actual timeline gaps preserved
2. outroStart >= timeline.duration * fps
3. total frames >= timeline end + 60
4. family phone clause => detail/action role
5. family conversation => interaction role
6. release => needsPeople false
7. release prompt contains NO PEOPLE and no full family roster
8. STYLE prompt contains no family/books/home content nouns
9. ACTION is before CAST/STYLE in image prompt
10. prompt is not blind-sliced
11. image compression preserves aspect ratio
12. generated default tier = HAYDEP_CANDIDATE
13. canonical cache does not overwrite first canonical
```

Also update `test-story-planner.mjs`:
if real `timeline.json` exists for a video, use it.
Do not always use synthetic paragraph timing.

---

# PHASE 14 — DRY RUN BEFORE RENDER

Print Video 001 table:

```text
beat
voice clause
role
action
needsPeople
presentMembers
world
asset decision
```

Expected:
- opening establish / full family / dinner
- phone clause concrete phone action
- conversation clause interaction
- release NO PEOPLE
- no visual action about reading books unless the voice actually says books

Print generated prompt previews for:
- establish
- phone detail
- release

Reject before rendering if any prompt contains unrelated `books` or if release includes cast roster.

---

# PHASE 15 — RENDER VIDEO 001 ONLY

Then:

```bash
node scripts/batch-engine.mjs 1 1 --force
```

Produce:
- mp4
- 16-frame contact sheet
- 3 prompt previews
- actual final duration
- timeline duration
- outro start time

Do not render Video 005.

---

# VISUAL ACCEPTANCE FOR NEXT VIDEO 001

Muted + hidden text must read:

```text
ordinary family dinner
→ simple food
→ people reconnect after day
→ child/family conversation
→ phone moved away
→ family stays together
→ ordinary days repeat
→ memory
→ after-dinner quiet release
```

FAIL if contact sheet again looks like:
- family reading books,
- repeated group portraits,
- random generic family poses,
- same family holding arbitrary objects.

Do not say PASS from tests.
Only output render can pass visual acceptance.
