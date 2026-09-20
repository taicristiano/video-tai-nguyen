# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 06
# SINGLE GOAL: REUSE CANONICAL CAST IMAGE FOR QUESTION BEATS ONLY

## CONTEXT

Parallel Fix 05 fixed the cast-member key contract.

A remaining visible continuity problem is the final QUESTION beat.

Current Story Planner assigns:

```js
assetStrategy =
  role === STORY_ROLES.MEMORY && cast.needsRecurringCast
    ? 'reuse-canonical'
    : 'library-or-generate';
```

Therefore:

```text
MEMORY    -> reuse-canonical
QUESTION  -> library-or-generate
```

For recurring-cast videos, the question beat can generate a completely new face/family/pair at the end of the video.

This was visibly bad in Video 001:
the final family looked different from the family established earlier.

We already have a canonical asset cache in the batch engine for recurring cast continuity.

This task has ONE GOAL ONLY:

> For QUESTION beats with a recurring cast, reuse an already established canonical cast image instead of generating a new cast image.

Do not solve style, world, SFX, or reference conditioning here.

---

# 1. SCOPE LOCK

Primary allowed files:

```text
scripts/human-insight-story-planner.mjs
scripts/batch-engine.mjs
```

Allowed tests:

```text
src/templates/human-insight/cinematic-light/storyPlannerGeneralization.test.ts
```

and/or one focused test:

```text
src/question-canonical-reuse.test.ts
```

Do NOT modify:

- cast selection
- presentMembers mapping
- semantic splitting
- action precedence
- image prompt text
- Cloudflare model/API
- image generation code
- world logic
- SFX
- subtitle alignment
- Remotion visual layout
- V3.3 Style Lock

Do NOT generate images.
Do NOT render MP4.

---

# 2. AUDIT CURRENT BEHAVIOR FIRST

Before editing:

Run planner for:

```text
001
005
007
013
028
```

For the final QUESTION beat, print:

```text
video index
beat id
storyRole
castId
presentMembers
assetStrategy
```

Expected BEFORE:

```text
storyRole = question
assetStrategy = library-or-generate
```

for recurring-cast videos.

Then inspect current batch-engine canonical reuse logic.

Report:

```text
canonicalAssets map exists: YES/NO
canonicalKey(beat) exists: YES/NO
which roles populate canonical cache
what happens when assetStrategy === 'reuse-canonical'
what happens if canonical asset is missing
```

Do not edit before showing this audit.

---

# 3. DESIGN RULE

For any beat:

```js
role === STORY_ROLES.QUESTION
&& cast.needsRecurringCast === true
```

asset strategy must be:

```text
reuse-canonical
```

The question beat should NOT generate a new recurring person/family/pair.

The visual storytelling difference at the end should come from:

- crop;
- motion;
- overlay question text;
- composition container;

NOT from changing the people.

---

# 4. PLANNER CHANGE

Create a small helper rather than adding another nested ternary.

Suggested:

```js
export function chooseAssetStrategy({
  role,
  needsRecurringCast,
}) {
  if (
    needsRecurringCast &&
    (
      role === STORY_ROLES.MEMORY ||
      role === STORY_ROLES.QUESTION
    )
  ) {
    return 'reuse-canonical';
  }

  return 'library-or-generate';
}
```

Then use it when building each beat.

Do not change asset strategy for:
- establish;
- interaction;
- action;
- context;
- reflection;
- detail;
- release.

---

# 5. CANONICAL SOURCE POLICY

Audit current `canonicalKey(beat)` and canonical cache behavior.

Question reuse must select a canonical image that represents the same recurring cast.

Preferred order:

```text
1. ESTABLISH canonical image
2. INTERACTION canonical image only if no establish canonical exists
```

Do NOT let later interaction beats overwrite the establish canonical if the current cache already follows "first wins".

If the batch engine already has this behavior:
DO NOT rewrite it.

Only add the smallest change required for QUESTION to use the existing path.

---

# 6. NO SILENT QUESTION RE-GENERATION

If:

```text
assetStrategy === 'reuse-canonical'
```

for a QUESTION beat,

and no canonical asset exists,

do NOT silently generate a new recurring-cast image.

That defeats the purpose.

Required behavior:

```text
fail clearly
```

or use an existing deterministic fallback ONLY if the current canonical reuse architecture already defines one that cannot change identity.

Preferred in this task:

```text
throw explicit error
```

Example:

```text
Question beat beat-16 requires canonical reuse, but no canonical asset exists for family-young-01 / home-family-01.
```

Do not call Cloudflare for that question beat.

---

# 7. VERIFY CANONICAL CACHE IS POPULATED EARLY ENOUGH

For each recurring-cast video:

```text
001
005
007
013
028
```

confirm that before the final QUESTION beat,
at least one qualifying canonical source beat exists.

Expected:
- establish appears first;
- establish has people for these modes;
- canonical cache should therefore already exist.

If one test video has no valid canonical source:
report it.
Do NOT invent a workaround outside this task.

---

# 8. QUESTION ROLE VISUAL METADATA MUST STAY UNCHANGED

Do NOT change:

```text
storyRole
voiceClause
presentMembers
shotScale
composition
motionPreset
questionDisplay
```

Only:

```text
assetStrategy
```

and the asset-resolution behavior required to honor it.

For Video 001, question may still be:

```text
storyRole = question
presentMembers = father,mother,boy,girl
shotScale = wide
composition = portrait-focus
motionPreset = emotional-hold
```

but the image source should be canonical reuse.

---

# 9. REQUIRED TESTS

## Test 1 — Family question reuses canonical

Video 001 final question:

Expected:

```text
assetStrategy = reuse-canonical
castId = family-young-01
```

---

## Test 2 — Relationship question reuses canonical

Video 005 final question:

Expected:

```text
assetStrategy = reuse-canonical
castId = dialogue-pair-01
presentMembers = ['speaker', 'listener']
```

---

## Test 3 — Solo recurring-cast question reuses canonical

Use one of:

```text
007
013
```

Expected:

```text
assetStrategy = reuse-canonical
```

---

## Test 4 — Memory behavior unchanged

Any MEMORY beat with recurring cast remains:

```text
reuse-canonical
```

---

## Test 5 — Normal narrative beat unchanged

Choose one interaction/action/context beat.

Expected:

```text
library-or-generate
```

unless it already has a different intentional strategy.

---

## Test 6 — Release unchanged

Release beat must NOT be changed to question reuse.

Keep existing:
- no people;
- existing asset strategy.

---

## Test 7 — Missing canonical source fails loudly

Unit-test asset resolution with:

```text
question beat
assetStrategy = reuse-canonical
canonical cache = empty
```

Expected:
explicit error.

Must NOT:
- call generator;
- fall back to random existing cast asset.

Mock/spies are acceptable.
No real Cloudflare call.

---

## Test 8 — Establish wins canonical cache

If current batch logic is first-wins:

Simulate:
1. establish stores canonical A;
2. later interaction produces B;
3. question requests reuse.

Expected:

```text
question -> A
```

Do not overwrite canonical A.

If current behavior differs, report it before editing and make only the smallest correction necessary.

---

# 10. FIVE-VIDEO DRY RUN

Run:

```text
001
005
007
013
028
```

Print only:

```text
video
question beat
castId
presentMembers
assetStrategy
canonical source role
```

Expected all recurring-cast question beats:

```text
assetStrategy = reuse-canonical
```

Beat counts must remain:

```text
001 = 16
005 = 16
007 = 18
013 = 18
028 = 14
```

---

# 11. ASSET-RESOLUTION DRY RUN

Do NOT generate images.

Use mocked/fake asset IDs.

Example:

```text
establish => canonical-family-A.jpg
interaction => generated-family-B.jpg
question => ?
```

Expected:

```text
question => canonical-family-A.jpg
```

Repeat one relationship example:

```text
establish => dialogue-pair-A.jpg
question => dialogue-pair-A.jpg
```

This proves the question cannot create a new face.

---

# 12. IMPORTANT NON-GOALS

Do NOT solve:

- visual style inconsistency;
- actual facial identity across separately generated normal beats;
- world identity;
- dynamic speaker/listener solo framing;
- SFX;
- overlay design;
- crop implementation;
- reference-conditioned generation.

V3.3A-1 will handle style when Cloudflare quota is available.

This task ONLY prevents the final question beat from generating a fresh recurring cast.

---

# 13. ACCEPTANCE CRITERIA

PASS only if:

1. recurring-cast QUESTION beats use `reuse-canonical`;
2. MEMORY reuse behavior remains unchanged;
3. normal narrative beats remain unchanged;
4. question cannot silently generate a new cast if canonical asset is missing;
5. canonical establish remains first-wins if that is current policy;
6. Video 001 final question reuses the opening canonical family image;
7. Video 005 final question reuses the canonical dialogue pair image;
8. beat counts stay unchanged;
9. no image generation/rendering occurs;
10. no unrelated subsystem changes.

---

# 14. FINAL REPORT

Return:

## A. Audit Before

## B. Files Changed

## C. Question Reuse Rule

## D. Canonical Cache Behavior

## E. Unit Tests

## F. Video 001 Before / After

Show:

```text
question beat
castId
presentMembers
assetStrategy
canonical source
```

## G. Video 005 Before / After

Same fields.

## H. Five-Video Regression

## I. Missing-Canonical Failure Example

## J. Known Remaining Issues

Explicitly state:
- visual identity across normal generated beats;
- world continuity;
- SFX;
- style lock;
are NOT handled here.

## K. Verdict

Exactly one:

```text
PARALLEL FIX 06 — QUESTION CANONICAL CAST REUSE — PASS
```

or:

```text
PARALLEL FIX 06 — QUESTION CANONICAL CAST REUSE — FAIL
```

Then STOP.

Do not start another task.
Do not render images.
Wait for human review.
