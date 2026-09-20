# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.5.1
# SINGLE GOAL: SEMANTIC ANCHOR INTEGRITY ONLY
# NO IMAGE GENERATION

## CONTEXT

V3.3B-S.5 family fulfillment planning is structurally correct and produced deterministic fulfillment for Video 001 / 028.

However, actual source review found one semantic regression in:

```text
scripts/test-hay-dep-schnell-fulfillment-planner.mjs
```

Current `extractSemanticAnchors()` includes:

```js
text.includes('sau một ngày dài')
```

inside the `SCHOOL_WORK` detector.

This contradicts the already-fixed family action precedence rule:

```text
"sau một ngày dài"
= temporal context only

"đi học" / "đi làm"
= explicit school/work context
```

The current result is visible in Video 001 beat-04:

```text
voiceClause:
"nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài."

current anchors:
SCHOOL_WORK, SPEAKING, LISTENING
```

`SCHOOL_WORK` is wrong here.

There is a second manifestation of the SAME integrity problem:

For school/work object fulfillment, the current code may claim:

```text
semanticAnchorsPreserved:
SCHOOL_WORK, SPEAKING
```

even though the simplified visual is only:

```text
school bag + work bag
```

That visual preserves `SCHOOL_WORK`, but it does NOT visually preserve `SPEAKING`.

This round fixes ONE thing only:

> `semanticAnchorsPreserved` must contain only semantic anchors that the transformed visual actually represents.

Do NOT redesign fulfillment decisions.

---

# 1. HARD SCOPE LOCK

Allowed file:

```text
scripts/test-hay-dep-schnell-fulfillment-planner.mjs
```

Optional focused tests:

```text
src/schnell-fulfillment-anchor-integrity.test.ts
```

Allowed outputs:

```text
scratch/v33/schnell-fulfillment-planner/
```

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
scripts/test-hay-dep-schnell-capability-router.mjs
```

Do NOT modify:
- fulfillment categories;
- capability routing;
- cast registry;
- world presets;
- subtitles;
- SFX;
- Remotion;
- production assets/manifests.

No Cloudflare calls.
No image generation.
No MP4.

---

# 2. FIX `SCHOOL_WORK` EXTRACTION

Current behavior must be changed.

`SCHOOL_WORK` may be added ONLY for explicit school/work evidence:

```text
đi học
đi làm
tan học
tan làm
về nhà sau giờ học
về nhà sau giờ làm
sau một ngày đi học
sau một ngày đi làm
```

Keep the list compact.

Critically:

```text
sau một ngày dài
```

ALONE must NOT produce:

```text
SCHOOL_WORK
```

Do not add broad temporal synonyms that recreate the same bug.

---

# 3. DO NOT CHANGE FULFILLMENT ROUTING

The following Video 001 fulfillment categories must remain exactly unchanged from S.5:

```text
beat-01  CANONICAL_REQUIRED
beat-02  SCHNELL_OBJECT
beat-03  REUSE_CANONICAL
beat-04  SCHNELL_SINGLE
beat-05  REUSE_CANONICAL
beat-06  UNCHANGED
beat-07  SCHNELL_OBJECT
beat-08  SCHNELL_SINGLE
beat-09  SCHNELL_SINGLE
beat-10  SCHNELL_SINGLE
beat-11  REUSE_CANONICAL
beat-12  UNCHANGED
beat-13  UNCHANGED
beat-14  UNCHANGED
beat-15  UNCHANGED
beat-16  UNCHANGED
```

Only semantic anchor metadata may change.

---

# 4. PRESERVED-ANCHOR CONTRACT

Introduce a small helper if useful, for example:

```js
function preservedAnchorsForFulfillment({
  fulfillment,
  extractedAnchors,
  simplifiedVisualAction,
}) {}
```

The core rule:

> An anchor may be listed in `semanticAnchorsPreserved` only if the simplified visual action materially depicts it.

Do not simply copy all extracted narration anchors.

---

# 5. SCHOOL/WORK OBJECT RULE

For:

```text
SCHNELL_OBJECT
```

with visual action like:

```text
School bag and work bag resting near doorway...
```

preserved anchors should be:

```text
SCHOOL_WORK
```

and optionally:

```text
EVERYDAY_DETAIL
```

only if the visual truly depicts an everyday-detail trace.

Do NOT include:

```text
SPEAKING
LISTENING
GROUP_PRESENCE
```

unless the actual simplified visual depicts those concepts.

For current Video 001 beat-07, required:

```text
semanticAnchorsPreserved includes SCHOOL_WORK
semanticAnchorsPreserved does NOT include SPEAKING
```

---

# 6. SINGLE-PERSON SPEAKING / LISTENING RULE

For a single-person speaking shot:

```text
boy speaks with a small hand gesture,
facing someone off-frame
```

allowed preserved anchors:

```text
SPEAKING
```

and `LISTENING` only if the visual action explicitly includes listening behavior.

Do NOT preserve `SCHOOL_WORK` from mere temporal context.

For current Video 001 beat-04:

```text
semanticAnchorsPreserved must include SPEAKING
semanticAnchorsPreserved must NOT include SCHOOL_WORK
```

If the action is only the boy speaking,
do not claim `LISTENING` is visually preserved unless you intentionally encode a listening/reacting action in the same single-person visual.

Prefer the conservative truth.

---

# 7. CANONICAL GROUP RULE

For:

```text
REUSE_CANONICAL
```

used because of explicit togetherness:

preserve:

```text
GROUP_PRESENCE
```

Other anchors may be included only if the canonical group image actually depicts them generically.

Do not claim phone/school/work semantics merely because narration contains them.

---

# 8. OBJECT PHONE RULE

For phone-away object visuals:

preserve:

```text
PHONE_AWAY
```

Do not copy unrelated narration anchors.

---

# 9. SIMPLE MEAL OBJECT RULE

For simple-meal still life:

preserve:

```text
SIMPLE_MEAL
```

Optionally:

```text
EVERYDAY_DETAIL
```

if appropriate.

No group presence unless people are actually represented.

---

# 10. REQUIRED TESTS

Add deterministic tests.

## Test 1 — generic temporal phrase is NOT school/work

Input:

```text
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Expected extracted anchors:

```text
SPEAKING
LISTENING
```

Expected:

```text
SCHOOL_WORK absent
```

---

## Test 2 — explicit school/work remains detected

Input:

```text
câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Expected:

```text
SCHOOL_WORK present
```

---

## Test 3 — current Video 001 beat-04 has no false school/work anchor

Expected:

```text
fulfillment = SCHNELL_SINGLE
selectedMember = boy
semanticAnchorsPreserved contains SPEAKING
semanticAnchorsPreserved does NOT contain SCHOOL_WORK
```

---

## Test 4 — current Video 001 beat-07 object does not falsely preserve speaking

Expected:

```text
fulfillment = SCHNELL_OBJECT
semanticAnchorsPreserved = [SCHOOL_WORK]
```

or:

```text
[SCHOOL_WORK, EVERYDAY_DETAIL]
```

No:

```text
SPEAKING
LISTENING
```

---

## Test 5 — group reuse preserves group presence

For current beat-03 or beat-11:

```text
semanticAnchorsPreserved contains GROUP_PRESENCE
```

No unrelated school/work anchor.

---

## Test 6 — phone object preserves phone-away only

Synthetic/real phone-away simplify case:

```text
semanticAnchorsPreserved contains PHONE_AWAY
```

No unrelated anchors.

---

# 11. VIDEO 001 REGRESSION

Regenerate offline:

```text
video001-fulfillment.json
video001-fulfillment.md
```

Confirm:

```text
fulfillment counts unchanged:
CANONICAL_REQUIRED = 1
REUSE_CANONICAL = 3
SCHNELL_SINGLE = 4
SCHNELL_OBJECT = 2
UNCHANGED = 6
```

Required specific corrections:

```text
beat-04:
OLD: SCHOOL_WORK, SPEAKING, LISTENING
NEW: no SCHOOL_WORK
```

```text
beat-07:
OLD: SCHOOL_WORK, SPEAKING
NEW: SCHOOL_WORK only
     (or SCHOOL_WORK + EVERYDAY_DETAIL if truly represented)
```

---

# 12. VIDEO 028 REGRESSION

Regenerate Video 028 fulfillment.

Fulfillment categories/counts must remain unchanged.

Only remove false semantic-anchor claims if any exist.

---

# 13. IMPORTANT NON-GOALS

Do NOT:
- change selectedMember;
- change simplifiedVisualAction except minimally if required to make a preserved anchor truthful;
- change CANONICAL_REQUIRED / REUSE_CANONICAL decisions;
- redesign Video 028;
- touch Video 005;
- generate images;
- start the image pilot.

---

# 14. ACCEPTANCE CRITERIA

PASS only if:

1. generic `sau một ngày dài` no longer maps to `SCHOOL_WORK`;
2. explicit `đi học` / `đi làm` still maps to `SCHOOL_WORK`;
3. beat-04 no longer carries false `SCHOOL_WORK`;
4. beat-07 no longer falsely claims `SPEAKING` preservation;
5. fulfillment categories/counts remain unchanged;
6. Video 001 / 028 still resolve deterministically;
7. no production code modified;
8. no image generation.

---

# 15. FINAL REPORT

Return:

## A. Root Cause

## B. Files Changed

## C. Anchor Extraction Rule

## D. Preserved-Anchor Rule

## E. Tests

## F. Video 001 Before / After
Show beat-04 and beat-07.

## G. Fulfillment Count Regression

## H. Verdict

Exactly one:

```text
V3.3B-S.5.1 SEMANTIC ANCHOR INTEGRITY — PASS
```

or:

```text
V3.3B-S.5.1 SEMANTIC ANCHOR INTEGRITY — FAIL
```

Then STOP.

Do not start the image-generation pilot automatically.
Wait for human review.
