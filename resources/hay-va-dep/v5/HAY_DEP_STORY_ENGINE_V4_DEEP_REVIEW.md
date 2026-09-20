# HAY & ĐẸP. — DEEP REVIEW STORY ENGINE BUILD (2026-09-19)

## Kết luận

Bản correctness-fix đã sửa đúng một lỗi lớn: legacy asset/stick-figure không còn lọt qua strict gate.

Nhưng output hiện tại vẫn CHƯA đạt để chuyển sang Video 005. Có hai blocker P0 mới, nghiêm trọng hơn phần polish:

1. **Timeline scene bị nén mất 3.60 giây khoảng nghỉ**, làm visual/statement/question chạy trước audio/subtitle và cuối voice bị cắt.
2. **Image generation vẫn không kể đúng nội dung**: phần lớn frame trông như gia đình đọc sách, không phải bữa cơm. Nguyên nhân nằm ở prompt architecture, `needsPeople` không được dùng, full-cast prompt, style prompt bị nhiễm từ `books`, role/action quá trừu tượng và ảnh bị ép méo sang 688x384.

Strict gate = thành công.
Story/visual output = chưa thành công.

---

# P0.1 — TIMELINE COMPRESSION / AUDIO TRUNCATION

## Evidence từ timeline thật

`timeline.json`:

- 0.00–3.96
- 4.70–7.26
- 7.68–12.84
- 13.62–18.02
- 18.62–21.46
- 22.20–25.46
- 25.78–29.02
- 29.02–35.26
- 35.26–42.02
- 42.02–46.06

Tổng spoken segment duration = khoảng **42.46s**.

Tổng silence gap = khoảng **3.60s**.

Last spoken end = khoảng **46.06s**.

Video render hiện tại = **44.47s**.

## Root cause

`batch-engine.mjs` hiện làm:

```js
let durSec = seg.end - seg.start;
let durFrames = Math.round(durSec * 30);

scene.startFrame = currentFrame;
...
currentFrame += durFrames;
```

Nó nối các segment sát nhau và bỏ toàn bộ gap trong timeline.

Trong khi `VideoContent.tsx` phát:

```tsx
<Audio src={staticFile(`${slug}/voice.mp3`)} />
```

từ frame 0, và `Subtitles.tsx` dùng trực tiếp timestamp tuyệt đối trong `timeline.json`.

=> Scene timeline bị nén, audio/subtitle timeline không nén.

## Visible proof

Khoảng 31.75s:
- statement visual đã hiện “CÓ NHỮNG ĐIỀU LÚC ĐANG CÓ THÌ RẤT BÌNH THƯỜNG”
- subtitle phía dưới vẫn còn câu trước “một bữa ăn mà mọi người ngồi…”

Question visual bắt đầu sớm hơn voice question.

Outro bắt đầu trước khi toàn bộ question voice kết thúc.

## Exact fix

Trong `batch-engine.mjs`, không concatenate narrative scene bằng `currentFrame`.

```js
const FPS = 30;

const timelineEndSec = Number(
  timeline.duration ??
  Math.max(...segments.map((s) => Number(s.end || 0))),
);

const narrativeEndFrame = Math.ceil(timelineEndSec * FPS);

for (let i = 0; i < segments.length; i++) {
  const seg = segments[i];

  const sceneStartFrame = Math.round(seg.start * FPS);

  const spokenEndFrame = Math.max(
    sceneStartFrame + 1,
    Math.round(seg.end * FPS),
  );

  const nextSceneStartFrame =
    i < segments.length - 1
      ? Math.round(segments[i + 1].start * FPS)
      : narrativeEndFrame;

  // Keep the current visual on screen through the silence gap.
  const sceneEndFrame = Math.max(
    spokenEndFrame,
    nextSceneStartFrame,
  );

  const durFrames = sceneEndFrame - sceneStartFrame;

  sceneObj.startFrame = sceneStartFrame;
  sceneObj.durationFrames = durFrames;
}
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

After the last spoken scene:

```js
const outroStartFrame = narrativeEndFrame;

scenes.push({
  ...
  startFrame: outroStartFrame,
  durationFrames: 60,
  isOutro: true,
});

const totalFrames = outroStartFrame + 60;
```

Do not start outro from compressed `currentFrame`.

## Tests required

```ts
expect(outro.startFrame)
  .toBeGreaterThanOrEqual(
    Math.ceil(timeline.duration * fps),
  );

expect(totalFrames)
  .toBeGreaterThanOrEqual(
    Math.ceil(timeline.duration * fps) + 60,
  );
```

Also assert scene N starts from the real segment timestamp.

Expected Video 001 after fix:
roughly 46.06s narration + 2s outro ≈ **48.1s**.

---

# P0.2 — OUTPUT VISUAL TELLS “FAMILY READING BOOKS”, NOT “FAMILY DINNER”

The strict asset gate is now clean, but generated assets are semantically wrong.

Actual contact sheet shows:
- nearly every scene contains books/notebooks;
- almost no dining table;
- no clear serving rice / passing bowl / eating interaction;
- phone-away action is not actually shown at the relevant moment;
- release is still a family portrait-like scene instead of after-dinner traces.

Muted + hidden-text story reads:
> “A family reads/studies together.”

It does NOT read:
> “A family shares ordinary dinners and later realizes those dinners were precious.”

This is a FAIL of the Story Engine semantic layer.

---

# P0.3 — STYLE PROMPT IS CONTAMINATING EVERY IMAGE WITH “BOOKS”

Current global style prompt contains:

```text
Calm Vietnamese family, home, books, and everyday-life storytelling.
```

`books` is a semantic noun, not a style descriptor.

It is injected into EVERY Cloudflare prompt.

This strongly correlates with the current output where almost every family member holds a book.

Replace `STYLE_PROMPT` with style-only language:

```js
const STYLE_PROMPT = [
  'STYLE LOCK:',
  'Premium warm editorial 2D illustration for HAY & ĐẸP.',
  'Soft ivory and warm cream palette, muted sage accents, warm wood, charcoal/sepia linework.',
  'Natural gentle light, tactile editorial texture, proportional expressive Vietnamese characters.',
  'Calm uncluttered composition, subtle depth, believable anatomy.',
].join('\n');
```

No:
- family
- books
- home
- dining
- specific object/action nouns

Those belong to CAST / WORLD / ACTION / SCENE.

---

# P0.4 — PROMPT ORDER PUTS THE ACTUAL SCENE TOO LATE

Current order:

1. STYLE
2. full CAST
3. WORLD
4. ROLE
5. ACTION
6. SHOT
7. SCENE
8. NEGATIVE

Current prompt is capped by:

```js
if (full.length > 2000) {
  full = full.slice(0, 2000);
}
```

The actual scene semantics can start around 1500–1700 chars.
Negative rules can be partially or completely truncated.

For a fast diffusion model, the most important concrete action should be near the beginning.

Use this order:

```text
ACTION / SCENE
PRESENT CHARACTERS
WORLD
STYLE
CAMERA
NEGATIVE
```

Suggested function:

```js
function buildPrompt(scene, castId) {
  const action = scene.action || scene.visual || scene.text;

  const sections = [
    `ACTION:\n${action}`,
    `SCENE MEANING:\n${scene.visual || scene.text}`,
    buildPresentCastPrompt(scene, castId),
    buildWorldPrompt(scene),
    STYLE_PROMPT,
    buildShotPrompt(scene),
    buildNegativeRules(scene),
  ].filter(Boolean);

  const full = sections.join('\n\n');

  if (full.length > 1950) {
    throw new Error(
      `Image prompt too long (${full.length}). ` +
      `Compact individual sections; do not blind-slice the final prompt.`,
    );
  }

  return full;
}
```

Do NOT `slice(0, 2000)` blindly.

Compact cast/world sections instead.

---

# P0.5 — `visualAction` IS FAKE: IT IS EXACTLY `visualIntent`

Planner currently writes:

```js
visualIntent,
visualAction: visualIntent,
```

Then image generator only adds ACTION when:

```js
scene.action && scene.action !== scene.visual
```

Therefore ACTION is normally absent.

Action-first exists in architecture naming, but not in the actual prompt.

Fix planner to generate a short concrete action separately.

Example for family:

```js
function familyAction(text, role) {
  if (includesAny(text, ['điện thoại'])) {
    return 'A parent places the phone face-down on a side shelf while the family keeps eating in the background.';
  }

  if (includesAny(text, ['đi học', 'đi làm', 'sau một ngày'])) {
    return 'Father puts his work bag beside the dining chair and sits down while the child brings a school notebook to the table.';
  }

  if (includesAny(text, ['ngồi cùng', 'cùng nhau'])) {
    return 'All four family members sit around the same dining table, talking and eating; no phone is on the table.';
  }

  if (includesAny(text, ['bữa cơm', 'bữa ăn', 'mâm cơm'])) {
    if (role === STORY_ROLES.ESTABLISH) {
      return 'All four recurring family members eat a simple Vietnamese dinner at the same wooden dining table.';
    }

    return 'Mother serves rice into a child’s bowl while another family member passes a simple dish across the table.';
  }

  if (role === STORY_ROLES.RELEASE) {
    return 'No people. The same dining room after dinner: four used place settings, chopsticks and bowls remain under the warm pendant light.';
  }

  return 'Show one specific domestic action that directly demonstrates the spoken clause.';
}
```

Then:

```js
const visualAction = buildVisualAction({
  text: item.text,
  role,
  mode,
});

...
visualIntent,
visualAction,
```

---

# P0.6 — FAMILY ROLE GRAMMAR IS STILL TOO ABSTRACT

Actual Video 001 role chain is mostly:

```text
establish
reflection
reflection
context
context
context
reflection
context
context
memory
release
question
```

No meaningful `interaction`, `detail-action`, or `action`, despite the script explicitly describing:
- people being present;
- telling small stories;
- putting phone aside;
- returning from school/work;
- sitting together.

Add FAMILY rules BEFORE generic reflection:

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

Target grammar for Video 001 should resemble:

```text
establish
detail-action
interaction
detail-action
action/context
interaction
reflection
action
interaction
memory
release
question
```

Not every exact role must match this sequence, but the planner must produce visible-action roles.

---

# P0.7 — `needsPeople` IS DEAD METADATA

Planner computes:

```js
needsPeople: peoplePolicy(mode, role),
```

But batch/image generator never consumes it.

Release currently has:

```text
needsPeople = false
```

yet still gets:

```text
castId = family-young-01
```

and image generator injects the full family prompt.

That is why even release can contain the family.

Pass the field:

```js
'--needs-people',
beat.needsPeople ? 'true' : 'false',
```

or cleaner flags:

```js
if (!beat.needsPeople) {
  args.push('--no-people');
}
```

Image CLI:

```js
noPeople: false,

...
} else if (arg === '--no-people') {
  args.noPeople = true;
}
```

Prompt:

```js
if (scene.noPeople) {
  return [
    'PEOPLE:',
    'NO PEOPLE in frame.',
    'Show only believable traces of the activity that just happened.',
  ].join('\n');
}
```

Continuity `castId` can remain metadata, but it must not mean every cast member physically appears.

---

# P0.8 — FULL CAST LOCK PUSHES EVERY SCENE TOWARD GROUP PORTRAITS

`family-young-01.castLockPrompt` describes father + mother + boy + girl in full for every beat.

That encourages:
- all four people appearing;
- posed group compositions;
- token budget dominated by identity;
- less room for the concrete action.

Add:

```ts
presentMembers?: string[];
```

For family examples:

```text
establish => father,mother,boy,girl
phone detail => father
school/work => father,boy
child story => boy,father,mother
release => []
question => father,mother,boy,girl
```

Build only the present cast:

```js
function buildPresentCastPrompt(scene, castId) {
  if (scene.noPeople) {
    return 'PEOPLE:\nNO PEOPLE in frame.';
  }

  const cast = CHARACTER_CASTS[castId];
  if (!cast) return buildGenericCastPrompt(scene);

  const memberIds =
    Array.isArray(scene.presentMembers) &&
    scene.presentMembers.length > 0
      ? scene.presentMembers
      : Object.keys(cast.members);

  const lines = memberIds
    .filter((id) => cast.members[id])
    .map((id) => `${id}: ${cast.members[id]}`);

  return [
    `CAST CONTINUITY — ${castId}:`,
    ...lines,
    'Use exactly these recurring identities. Do not add random people.',
  ].join('\n');
}
```

This is a reusable template capability, not Video-001 hardcode.

---

# P0.9 — IMAGE POST-PROCESSING FORCES EVERY IMAGE TO 688×384 LANDSCAPE

Current:

```js
const OUTPUT_WIDTH = 688;
const OUTPUT_HEIGHT = 384;
```

and:

```js
-vf scale=688:384
```

That changes aspect ratio.

But the Remotion containers are vertical/tall:
- portrait-focus
- editorial-left/right
- paper

Forcing generated artwork to 16:9 landscape and then `objectFit: cover` into tall cards causes:
- distortion;
- heavy crop;
- lost heads/hands/context;
- extra upscale softness.

Do NOT force width and height independently.

Simplest safe fix:

```js
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
```

If size cap is needed, preserve aspect:

```text
scale='min(1400,iw)':-2
```

Never `scale=W:H` without `force_original_aspect_ratio`.

---

# P0.10 — SEED IS COMPUTED BUT NOT SENT TO CLOUDFLARE

Code computes:

```js
const seed = seeds.sceneSeed;
```

then:

```js
generateWithCloudflare(prompt, seed)
```

but request payload is:

```js
const payload = {
  prompt,
};
```

So seed is currently dead.

Restore:

```js
const payload = {
  prompt,
  seed: seed >>> 0,
  steps: 4,
};
```

Verify once through the live model.

This matters for reproducibility, though text-only seed is still not enough for true identity continuity.

---

# P1 — CAST CONTINUITY IS STILL NOT VISUALLY STRONG

Actual output:
- opening father wears glasses even though canonical definition says NO GLASSES;
- later father appears without glasses;
- later glasses return;
- mother hairstyle changes;
- child designs shift.

Therefore the current claim “same family across 12 beats” is not visually true.

Current system gives **same archetype/style**, not reliable same person.

Do not call this fixed.

After P0 timing/semantic fixes, V3.3 identity should consider reference-conditioned generation.

---

# P1 — WORLD LOCK IS TEXT-ONLY, OUTPUT DOES NOT OBEY IT

`home-family-01` is specific:

```text
medium-oak dining table
cream walls
pendant lamp centered above table
window camera-left
sage vase on sideboard
```

But output barely shows these anchors.

This proves text-only independent generation is insufficient to guarantee same room.

Do not add more adjectives indefinitely.

First:
- remove prompt contamination;
- put ACTION first;
- shrink full cast prompt;
- restore seed.

If still unstable, use a reference-capable model later for canonical character/world conditioning.

---

# P1 — GENERATED ASSET IS LABELED CORE BEFORE VISUAL QA

`appendGeneratedAsset()` currently writes every generated image as:

```js
tier: ASSET_TIERS.CORE,
```

But current generated “CORE” assets include semantically wrong family-reading scenes.

Therefore `CORE` currently means:
> generated by new pipeline

not:
> approved HAY & ĐẸP. quality

Add:

```js
CANDIDATE: 'HAYDEP_CANDIDATE',
```

Generated default:

```js
tier: ASSET_TIERS.CANDIDATE,
```

Only promote to CORE after QA.

Strict reuse should continue allowing only:
- CORE
- COMPATIBLE

not CANDIDATE.

---

# P1 — GENERATED ASSETS CURRENTLY CANNOT BE REUSED FROM MANIFEST

`isReusableAsset()` rejects:

```js
if (asset.reuse === false) return false;
if (id.startsWith('cf-')) return false;
```

Every new Cloudflare image is:
- `cf-*`
- `reuse: false`

So despite being labeled CORE, it cannot actually be reused by the manifest selector.

This creates:
- repeated generation cost;
- manifest bloat;
- new identity drift on every forced rerender.

Later introduce:
- `promptHash`
- `videoSlug`
- `reuseScope: 'exact-prompt' | 'video' | 'global'`

At minimum allow exact same prompt hash + same video to reuse.

Do not solve this before the P0 visual issues.

---

# P1 — CANONICAL CACHE CAN DRIFT

Current:

```js
if (
  beat.castId &&
  (
    beat.storyRole === 'establish' ||
    beat.storyRole === 'interaction'
  )
) {
  canonicalAssets.set(key, resolved.asset);
}
```

A later interaction overwrites the opening canonical.

Change:

```js
if (
  beat.castId &&
  (
    beat.storyRole === 'establish' ||
    beat.storyRole === 'interaction'
  ) &&
  !canonicalAssets.has(canonicalKey(beat))
) {
  canonicalAssets.set(
    canonicalKey(beat),
    resolved.asset,
  );
}
```

First canonical wins unless explicitly replaced after QA.

---

# P1 — TESTS STILL MISS END-TO-END FAILURES

Current tests do not detect:
- scene/audio timeline compression;
- voice cutoff;
- style prompt contamination by `books`;
- `needsPeople=false` ignored;
- wrong image aspect;
- full cast every beat;
- output showing books instead of dinner;
- father glasses mismatch;
- generated candidate mislabeled CORE.

Add integration assertions:

```text
timeline end <= outro start
video duration >= timeline end + outro
first family beat role = establish
phone clause => detail-action/action
family conversation clause => interaction
release needsPeople = false
noPeople scene => no cast roster prompt
global STYLE contains no semantic nouns such as family/books/home
prompt ACTION appears before CAST/STYLE
prompt length <= 1950 without blind slicing
postprocess preserves aspect ratio
generated asset default tier != CORE
```

Dry-run tests are necessary but not sufficient.

---

# P2 — UI / POLISH

Overlay architecture is better than full-white card.

However current statement/question overlay is still a large white rounded rectangle over faces.

Do not polish it yet.

After P0:
- use negative space when available;
- smaller translucent panel;
- avoid covering focal faces.

SFX is also still round-robin:

```js
const sfxName = sfxList[i % sfxList.length];
```

Eventually:
- most narrative hard cuts => no SFX;
- pageTurn => memory/paper only;
- whoosh rare;
- whip almost never in HAY & ĐẸP.

Not a blocker right now.

---

# Current score

| Area | Score |
|---|---:|
| Legacy safety gate | 9/10 |
| Reusable architecture | 7.5/10 |
| Story role semantics | 5.5/10 |
| Visual-to-voice alignment | 3.5/10 |
| Cast continuity | 3/10 |
| World continuity | 2.5/10 |
| Timing/audio sync | 2/10 |
| UI shell / branding | 7.5/10 |
| Current visual output | ~5.5/10 |

Do NOT proceed to Video 005 yet.

Fix order:
**timeline → prompt semantics → noPeople/presentMembers → aspect ratio → seed → render 001 again → only then validate another content mode.**
