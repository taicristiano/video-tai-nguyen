# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 07
# SINGLE GOAL: REMOVE ROUND-ROBIN SFX AND USE SEMANTIC SFX ONLY

## CONTEXT

Parallel Fix 06 is complete.

The remaining offline quality issue we will fix before returning to V3.3A-1 Style Lock is SFX assignment.

Current `scripts/batch-engine.mjs` contains logic equivalent to:

```js
const sfxList = ['whoosh', 'pageTurn', 'whip'];

...

const sfxName = sfxList[i % sfxList.length];

entrySfx: {
  name: sfxName,
  volume: 0.2,
  reason: `Scene ${i + 1} entry transition`,
},
```

This means every scene receives an SFX purely because of its index.

Consequences:
- calm family dialogue may get `whip`;
- ordinary hard cuts may get `whoosh`;
- `pageTurn` can appear even when there is no paper/memory/book action;
- SFX becomes repetitive and template-like;
- the result conflicts with the visual reference grammar, where most cuts should simply be clean hard cuts.

This task has ONE GOAL ONLY:

> Replace scene-index round-robin SFX with sparse semantic SFX assignment.

Do not change visual logic, transitions, story planning, timing, subtitle, images, or music.

---

# 1. SCOPE LOCK

Primary allowed file:

```text
scripts/batch-engine.mjs
```

Allowed tests:

```text
src/templates/human-insight/cinematic-light/visualRhythm.test.ts
```

and/or one focused test:

```text
src/semantic-sfx.test.ts
```

Only inspect another file if needed to confirm the existing `entrySfx` contract.

Do NOT modify:
- Story Planner
- semantic beat splitting
- action precedence
- cast/member logic
- canonical asset reuse
- image generation
- Cloudflare
- world logic
- subtitle alignment
- Remotion visual layout
- background music
- V3.3 Style Lock

Do NOT render images.
Do NOT render MP4.

---

# 2. AUDIT CURRENT BEHAVIOR FIRST

Before editing:

1. Find the scene-level SFX assignment in `scripts/batch-engine.mjs`.
2. Confirm current list:

```text
whoosh
pageTurn
whip
```

3. Run a dry spec build or isolated helper simulation for Video 001 and print:

```text
scene index
primary storyRole
visualContainer
current entrySfx.name
current entrySfx.volume
```

Expected current anti-pattern:

```text
scene 1 -> whoosh
scene 2 -> pageTurn
scene 3 -> whip
scene 4 -> whoosh
...
```

regardless of semantic meaning.

4. Inspect the Remotion consumer of `entrySfx`.
Report only:
- whether `entrySfx` is optional;
- expected shape;
- whether omitting it is safe.

Do not change code before showing this audit.

---

# 3. DESIGN PRINCIPLE

Most HAY & ĐẸP. scene entries should have:

```text
NO SFX
```

Normal visual transition:

```text
hard cut
```

does not need an audio effect.

SFX should be an exception tied to a meaningful visual/narrative event.

Target:

```text
approximately 70–90% of narrative scenes have no entry SFX
```

Do not enforce this as a rigid percentage validator for every video.
It is a design target, not a magic quota.

---

# 4. ALLOWED SFX SEMANTICS

Use only existing SFX names:

```text
whoosh
pageTurn
whip
```

But rules must be:

## A. `pageTurn`

Allowed ONLY when semantic content genuinely involves:

```text
page
book
notebook
paper
memory / keepsake paper treatment
```

Strong cases:
- `storyRole === MEMORY` with `visualContainer === 'paper'`
- book-related detail/action visibly involving page turning

Do NOT assign `pageTurn` merely because the scene index matches.

Suggested volume:

```text
0.10–0.14
```

---

## B. `whoosh`

Allowed sparingly for a genuine transition in thought or visual emphasis.

Potential cases:
- one strong opening visual reveal;
- one transition into a major statement/insight overlay;
- possibly a clear detail insert if it benefits from a soft movement cue.

Do NOT use it:
- on every establish;
- on every scene;
- on simple dialogue cut;
- on release/question by default.

Suggested volume:

```text
0.08–0.12
```

---

## C. `whip`

For HAY & ĐẸP. `human-insight/cinematic-light`:

```text
DISABLED BY DEFAULT
```

The current brand is calm/editorial.
A whip sound is normally too aggressive.

Do not delete the asset from the repo.
Do not change other templates.

Simply do not select `whip` for this template unless there is an explicit future rule.

For this task:

```text
semantic selector must never return whip
```

---

# 5. CREATE A PURE SFX SELECTOR

Create a small exported helper in `scripts/batch-engine.mjs`
or a tiny dedicated module if cleaner.

Suggested:

```js
export function chooseSemanticEntrySfx({
  storyRole,
  visualContainer,
  contentMode,
  voiceClause,
  isHook,
  isStatement,
  isEnding,
}) {
  ...
}
```

Return:

```js
null
```

for no SFX.

Or:

```js
{
  name: 'pageTurn',
  volume: 0.12,
  reason: 'memory-paper semantic transition',
}
```

The helper must be deterministic.

No round-robin.
No scene-index dependency.

---

# 6. REQUIRED SELECTION RULES

Use a small rule set.

Recommended priority:

## Rule 1 — MEMORY/PAPER

If:

```text
storyRole === 'memory'
AND visualContainer === 'paper'
```

return:

```js
{
  name: 'pageTurn',
  volume: 0.12,
  reason: 'memory-paper semantic transition',
}
```

---

## Rule 2 — Book/page detail

If the scene is clearly book/page related and story role is:

```text
detail-action
or action
```

and narration/intent contains one of:

```text
lật trang
trang sách
cuốn sách
ghi chép
notebook
page
book
```

then `pageTurn` is allowed.

Keep it subtle.

---

## Rule 3 — Major statement emphasis

If:

```text
isStatement === true
```

and NOT:
- memory/paper already handled;
- ending/question;
- release;

then optionally use one soft `whoosh`.

Do not use if adjacent scene already has SFX.

For this task, implement a simple local adjacency guard in the scene-building loop:
- if previous scene had SFX, current scene should default to no SFX.

---

## Rule 4 — Optional opening reveal

For the very first narrative scene only:

```text
isHook === true
```

a soft `whoosh` MAY be used if it helps introduce the first visual.

Use:

```text
volume = 0.08
```

But if the statement scene would immediately receive another SFX, avoid stacking.

---

## Rule 5 — Everything else

Return:

```text
null
```

Especially:
- interaction
- context
- reflection
- question
- release
- ordinary detail
- ordinary family dinner cuts

No SFX.

---

# 7. SCENE OBJECT CONTRACT

If selector returns `null`:

DO NOT write:

```js
entrySfx: null
```

unless current Remotion contract explicitly prefers null.

Prefer omitting the property entirely:

```js
const entrySfx = chooseSemanticEntrySfx(...);

const sceneObj = {
  ...
  ...(entrySfx ? { entrySfx } : {}),
};
```

Confirm current consumer supports missing `entrySfx`.

Do not modify UI/audio renderer unless absolutely necessary.

---

# 8. ADJACENCY GUARD

Maintain:

```js
let previousSceneHadSfx = false;
```

When considering statement `whoosh` or optional hook `whoosh`:

- if previous scene already has SFX,
  skip the new optional SFX.

Memory/page semantic SFX may take precedence because it is content-bound,
but do not create consecutive SFX bursts unless unavoidable.

For Video 001 specifically:
- ordinary family cuts should have no SFX;
- if there is a memory/paper beat, `pageTurn` may occur once;
- final question should have no SFX;
- release should have no SFX.

---

# 9. DO NOT ASSIGN SFX PER VISUAL BEAT

Current `entrySfx` is scene-level.

Keep it scene-level in this task.

Do NOT add SFX to each semantic visual beat.

That would create too many sounds and expand scope.

---

# 10. REQUIRED TESTS

## Test 1 — ordinary interaction has no SFX

Input:

```text
storyRole = interaction
visualContainer = canvas
isStatement = false
isHook = false
```

Expected:

```text
null
```

---

## Test 2 — ordinary context has no SFX

Expected:

```text
null
```

---

## Test 3 — memory paper gets pageTurn

Input:

```text
storyRole = memory
visualContainer = paper
```

Expected:

```text
name = pageTurn
volume <= 0.14
```

---

## Test 4 — book page detail may get pageTurn

Narration:

```text
lật một trang sách và đánh dấu một ý
```

Role:

```text
detail-action
```

Expected:

```text
pageTurn
```

---

## Test 5 — question has no SFX

Expected:

```text
null
```

---

## Test 6 — release has no SFX

Expected:

```text
null
```

---

## Test 7 — statement can get soft whoosh

Input:

```text
isStatement = true
storyRole = reflection
previousSceneHadSfx = false
```

Expected:

```text
whoosh
volume <= 0.12
```

---

## Test 8 — no consecutive optional whoosh

If previous scene already had SFX:

statement scene that would otherwise use whoosh:

Expected:

```text
null
```

---

## Test 9 — whip is never selected

Run a matrix of:
- establish
- interaction
- detail
- context
- reflection
- memory
- release
- question

Expected:

```text
selector result?.name !== 'whip'
```

for every case.

---

## Test 10 — selector does not depend on scene index

Run identical semantic input with simulated scene indices 0..20.

Expected same result each time.

If helper has no sceneIndex argument, this is naturally guaranteed.

---

# 11. VIDEO 001 DRY SPEC CHECK

Do NOT render.

Build/dry-run the spec for Video 001.

Print:

```text
scene
storyRole
isStatement
visualContainer
entrySfx
reason
```

Expected qualitative result:

- majority of scenes: `NONE`;
- no `whip`;
- no `pageTurn` on unrelated family/dialogue scene;
- question: `NONE`;
- release: `NONE`;
- at most a small number of semantic SFX events.

Also print:

```text
narrative scene count
scenes with SFX
percentage with SFX
```

Do not include OutroCard in the percentage.

---

# 12. FIVE-VIDEO DRY CHECK

Run dry spec SFX mapping for:

```text
001
005
007
013
028
```

For each report:

```text
scene count
SFX count
whoosh count
pageTurn count
whip count
```

Required:

```text
whip count = 0
```

For non-book videos:
`pageTurn` should occur only for true memory/paper scenes, not randomly.

For Video 013 (books):
`pageTurn` may occur on a genuinely page-related scene.

Do not require every video to have SFX.

Zero SFX is valid.

---

# 13. REGRESSION

Run full tests.

Confirm unchanged:
- beat counts:
  - 001 = 16
  - 005 = 16
  - 007 = 18
  - 013 = 18
  - 028 = 14
- cast IDs
- world IDs
- question canonical reuse
- subtitle alignment
- scene timing
- image asset strategy

No image generation.
No MP4 render.

---

# 14. NON-GOALS

Do NOT:
- source new SFX files;
- normalize SFX loudness globally;
- change background music;
- implement ducking;
- redesign transitions;
- change animation/motion;
- modify Remotion composition;
- solve style/character/world identity.

Those are separate tasks.

This is only:

> stop mechanical SFX rotation and make SFX sparse + semantic.

---

# 15. ACCEPTANCE CRITERIA

PASS only if:

1. round-robin SFX list is removed from cinematic-light batch flow;
2. SFX selection is deterministic and semantic;
3. majority of ordinary scenes have no SFX;
4. `whip` is never selected for this template;
5. `pageTurn` appears only for paper/book/memory semantics;
6. `whoosh` is subtle and sparse;
7. question and release have no SFX;
8. Video 001 no longer cycles `whoosh → pageTurn → whip`;
9. five-video dry check passes;
10. no visual/timing/story/image subsystem changed.

---

# 16. FINAL REPORT

Return:

## A. Audit Before

## B. Files Changed

## C. Semantic SFX Rules

## D. Unit Tests

## E. Video 001 Before / After

Show a compact scene table.

## F. Five-Video SFX Counts

## G. Regression

## H. Known Remaining Issues

Explicitly state:
- style consistency;
- actual character identity;
- world identity;
- visual reference conditioning;
are NOT handled here.

## I. Verdict

Exactly one:

```text
PARALLEL FIX 07 — SEMANTIC SFX ONLY — PASS
```

or:

```text
PARALLEL FIX 07 — SEMANTIC SFX ONLY — FAIL
```

Then STOP.

Do not start V3.3A-1 automatically.
Wait for human review.
