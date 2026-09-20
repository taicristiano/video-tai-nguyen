# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 05
# SINGLE GOAL: CAST MEMBER KEY CONTRACT ONLY

## CONTEXT

Parallel Fix 04 is complete.

The next concrete planner-to-image bug is in relationship content.

Current Video 005 selects:

```text
castId = dialogue-pair-01
```

The cast definition is:

```json
{
  "members": {
    "speaker": "...",
    "listener": "..."
  }
}
```

But the Story Planner currently emits:

```js
presentMembers = ['man', 'woman'];
```

for relationship beats.

Then `buildPresentCastPrompt()` filters requested IDs against `cast.members`.

Because:

```text
man    ❌ not a member key
woman  ❌ not a member key
```

the generated cast prompt becomes effectively:

```text
CAST CONTINUITY — dialogue-pair-01:
Use same recurring identities, no random extra people.
```

with ZERO actual character descriptions.

This defeats the recurring-cast contract.

This round fixes ONLY this member-key contract.

---

# 1. SCOPE LOCK

Primary allowed files:

```text
scripts/human-insight-story-planner.mjs
scripts/human-insight-image.mjs
src/templates/human-insight/cinematic-light/storyPlannerGeneralization.test.ts
```

You may add ONE focused test file if cleaner:

```text
src/cast-member-contract.test.ts
```

Do NOT modify:

- content-mode inference
- cast selection
- world selection
- semantic splitting
- family action precedence
- visual intent logic
- relationship visual intent logic
- image model
- Cloudflare API
- SFX
- subtitle alignment
- Remotion
- V3.3 style work

Do NOT render images.
Do NOT render MP4.

---

# 2. AUDIT CURRENT BUG FIRST

Before editing:

Run Video 005 Story Planner.

Print first 4 non-release beats:

```text
beat id
storyRole
castId
presentMembers
voiceClause
```

Expected BEFORE:

```text
castId: dialogue-pair-01
presentMembers: ['man', 'woman']
```

Then call:

```js
buildPresentCastPrompt(
  {
    noPeople: false,
    presentMembers: ['man', 'woman']
  },
  'dialogue-pair-01'
)
```

Print result.

Expected BEFORE bug evidence:

```text
CAST CONTINUITY — dialogue-pair-01:
Use same recurring identities, no random extra people.
```

and confirm it contains neither:

```text
speaker:
listener:
```

Do not edit before showing this audit.

---

# 3. SOURCE OF TRUTH

The ONLY valid member IDs for a recurring cast are:

```js
Object.keys(CHARACTER_CASTS[castId].members)
```

Do not invent generic aliases such as:

```text
man
woman
person1
person2
```

unless those IDs actually exist in that cast definition.

For:

```text
dialogue-pair-01
```

valid IDs are exactly:

```text
speaker
listener
```

---

# 4. FIX STORY PLANNER PRODUCER

Current relationship logic is equivalent to:

```js
if (
  mode === CONTENT_MODES.RELATIONSHIP &&
  cast.castId
) {
  presentMembers =
    role === STORY_ROLES.RELEASE
      ? []
      : ['man', 'woman'];
}
```

Replace the hard-coded IDs.

Create a small resolver, for example:

```js
function relationshipPresentMembers({
  castId,
  role,
  text,
}) {
  if (role === STORY_ROLES.RELEASE) {
    return [];
  }

  if (castId === 'dialogue-pair-01') {
    return ['speaker', 'listener'];
  }

  return undefined;
}
```

A more generic resolver based on cast member keys is acceptable,
provided it does NOT change other modes.

For this task:

```text
dialogue-pair-01
=> speaker + listener
```

for every normal two-person relationship beat.

Do NOT try to infer which person is alone in frame yet.

That can be a later shot-composition refinement.

---

# 5. ADD PLAN VALIDATION FOR MEMBER KEYS

`validateStoryPlan()` currently validates recurring `castId`,
but does NOT verify that `presentMembers` exist in the cast.

Add a small contract check.

For every beat where:

```text
beat.presentMembers
```

is a non-empty array and `plan.castId` exists:

1. Load valid member IDs for `plan.castId`.
2. Every requested member ID must exist.
3. If any is invalid, add an ERROR.

Example error:

```text
beat-04: invalid presentMembers [man, woman] for cast dialogue-pair-01; valid members: [speaker, listener].
```

Do not silently pass invalid IDs.

Release beat:

```text
presentMembers = []
```

is valid.

No-person beats remain valid.

---

# 6. HARDEN `buildPresentCastPrompt()`

Current logic:

```js
const lines = requested
  .filter((memberId) => cast.members[memberId])
  .map(...);
```

This silently drops invalid IDs.

That created the bug.

Change behavior:

## If `presentMembers` was explicitly supplied and non-empty:

- Validate every ID.
- If ANY requested member does not exist:
  throw a clear error.

Example:

```text
Invalid cast member "man" for cast "dialogue-pair-01".
Valid members: speaker, listener
```

Do not silently:
- drop invalid members;
- return header-only cast prompt;
- substitute random cast members.

## If `presentMembers` is undefined:

Fallback to:

```js
Object.keys(cast.members)
```

is still allowed.

## If `scene.noPeople === true`:

Keep existing no-people behavior.

## If `presentMembers = []` and `noPeople === true`:

Keep no-people behavior.

Do NOT change unrelated generic cast behavior.

---

# 7. REQUIRED VIDEO 005 RESULT

After fix, a normal Video 005 interaction beat must contain:

```js
presentMembers: ['speaker', 'listener']
```

And:

```js
buildPresentCastPrompt(...)
```

must include BOTH lines equivalent to:

```text
speaker: Vietnamese adult, 27–32, fixed oval facial design...
listener: Vietnamese adult, 27–32, distinct fixed soft facial design...
```

The exact descriptions should come from:

```text
character-casts.json
```

Do not duplicate the descriptions into the planner.

---

# 8. REQUIRED TESTS

Add focused tests.

## Test 1 — Video 005 uses real member IDs

Build Video 005 plan.

For every non-release beat with people:

```text
presentMembers
```

must contain only:

```text
speaker
listener
```

and never:

```text
man
woman
```

---

## Test 2 — Relationship release has no people

For the release beat:

```js
presentMembers === []
```

Keep current behavior.

---

## Test 3 — Prompt builder includes both cast descriptions

Input:

```js
{
  noPeople: false,
  presentMembers: ['speaker', 'listener']
}
```

Cast:

```text
dialogue-pair-01
```

Expected prompt contains:

```text
speaker:
listener:
```

and both descriptions from the cast registry.

---

## Test 4 — Invalid requested member throws

Input:

```js
{
  noPeople: false,
  presentMembers: ['man', 'woman']
}
```

Cast:

```text
dialogue-pair-01
```

Expected:

```text
throw
```

with:
- cast ID;
- invalid member ID;
- valid member list.

Do not silently return a prompt.

---

## Test 5 — Plan validation catches invalid key

Construct a small plan with:

```text
castId = dialogue-pair-01
presentMembers = ['man']
```

Expected:

```text
validation.valid = false
```

and clear error.

---

## Test 6 — Valid member keys pass validation

Same plan with:

```text
presentMembers = ['speaker', 'listener']
```

Expected:

```text
validation.valid = true
```

assuming no unrelated errors.

---

# 9. FIVE-VIDEO REGRESSION

Run:

```text
001
005
007
013
028
```

Expected beat counts remain:

```text
001 = 16
005 = 16
007 = 18
013 = 18
028 = 14
```

Expected casts/worlds unchanged.

Important:

- Family `presentMembers` must remain unchanged.
- Solo modes must remain unchanged.
- Only relationship member IDs should change.

---

# 10. DRY PROMPT CHECK

Without generating images, choose 3 normal Video 005 beats:

```text
establish
interaction
question
```

For each:

1. show `presentMembers`;
2. run `buildPresentCastPrompt()`;
3. show resulting CAST section.

Required:
- no empty cast header;
- no `man` / `woman`;
- actual `speaker` / `listener` descriptions present.

Also check release beat:

```text
NO PEOPLE in frame.
```

---

# 11. NON-GOALS

Do NOT solve:

- speaker/listener role switching by narration
- one-person reaction shots
- character facial identity
- visual reference conditioning
- world identity
- SFX
- question-shot reuse
- art style
- actual image quality

Those are separate tasks.

This task is ONLY:

> valid member IDs from Story Planner → actual cast descriptions in image prompt.

---

# 12. ACCEPTANCE CRITERIA

PASS only if:

1. Video 005 no longer emits `['man','woman']`.
2. It emits valid `['speaker','listener']`.
3. `buildPresentCastPrompt()` includes actual descriptions.
4. invalid explicit member IDs fail loudly.
5. `validateStoryPlan()` catches invalid member IDs.
6. release/no-people behavior remains valid.
7. 5-video beat counts remain unchanged.
8. family/solo behavior does not change.
9. no image generation/rendering.
10. no unrelated code changes.

---

# 13. FINAL REPORT

Return:

## A. Audit Before

## B. Files Changed

## C. Member-Key Contract

## D. Unit Tests

## E. Video 005 Before / After

Show:

```text
beat id
storyRole
presentMembers
cast prompt
```

for:
- establish
- interaction
- question
- release

## F. Invalid-Key Failure Example

## G. Five-Video Regression

## H. Known Remaining Issues

Explicitly state that:
- one-person speaker/listener shot selection;
- visual identity;
- world identity;
- SFX;
are NOT handled here.

## I. Verdict

Exactly one:

```text
PARALLEL FIX 05 — CAST MEMBER KEY CONTRACT — PASS
```

or:

```text
PARALLEL FIX 05 — CAST MEMBER KEY CONTRACT — FAIL
```

Then STOP.

Do not start another task.
Do not render images.
Wait for human review.
