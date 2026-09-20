# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.2
# SINGLE GOAL: EXACT PEOPLE CONTRACT UNDER STYLE-FIRST PROMPTING
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

V3.3B-S.1 proved that the STYLE-FIRST prompt geometry can keep FLUX.1 Schnell in a stable editorial 2D rendering mode on the four previously difficult beats.

Human review now shows a different concrete failure:

- beat-01 requests 4 family members, but generated images show 3.
- beat-02 requests mother + boy, but one generation shows extra adult(s).
- beat-04 requests boy + father + mother, but generated images show only father + boy.
- beat-09 requests mother + boy and is closer to contract.

This round has ONE GOAL ONLY:

> Make FLUX.1 Schnell obey the requested visible-people contract while preserving the proven STYLE-FIRST rendering geometry.

Do NOT solve semantic action fidelity.
Do NOT solve identity continuity.
Do NOT solve world continuity.
Do NOT solve text/signature artifacts.
Do NOT render video.

---

# 1. HARD SCOPE LOCK

Allowed new/modified file:

```text
scripts/test-hay-dep-schnell-people-contract.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-people-contract/
```

You may READ:
- current Video 001 Story Plan;
- cast registry;
- V3.3B-S.1 prompt geometry;
- `prompts.json` from V3.3B-S.1.

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
```

Do NOT modify:
- cast registry;
- world presets;
- subtitle;
- SFX;
- Remotion;
- production assets/manifests.

Do NOT render MP4.

---

# 2. MODEL / AUTH

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Known API behavior:

```text
prompt-only payload
seed unsupported
steps unsupported
```

Use existing authorized Cloudflare credentials from environment / `.env`.

Never print credential values.

---

# 3. KEEP STYLE-FIRST GEOMETRY LOCKED

Reuse the exact proven section order from V3.3B-S.1:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
4. PEOPLE CONTRACT
5. CAST
6. PRIMARY ACTION
7. WORLD
8. FRAMING
9. HARD EXCLUSIONS
```

Do NOT weaken or move:
- MEDIUM LOCK;
- RENDERING RECIPE;
- PALETTE.

Do NOT reintroduce:
- camera;
- candid;
- portrait photography;
- cinematic;
- bokeh;
- shallow depth of field.

This round is NOT allowed to trade style stability for people-count accuracy.

---

# 4. TEST EXACTLY FOUR REAL BEATS

Use current Video 001 Story Plan.

Test:

```text
beat-01
beat-02
beat-04
beat-09
```

Expected people contract from current planner:

## beat-01

```text
EXACTLY 4 visible people:
- father
- mother
- boy
- girl
```

## beat-02

```text
EXACTLY 2 visible people:
- mother
- boy
```

## beat-04

```text
EXACTLY 3 visible people:
- boy
- father
- mother
```

## beat-09

```text
EXACTLY 2 visible people:
- mother
- boy
```

Use actual `presentMembers` from current Story Plan.
If current planner differs, report the actual values and use them.

---

# 5. ADD A PEOPLE CONTRACT BLOCK

Immediately before CAST, insert:

```text
PEOPLE CONTRACT:

Show EXACTLY <N> visible people in the entire illustration.

Visible people must be ONLY:
<member list>

No other person is visible.
No extra adult.
No extra child.
No duplicate person.
No background person.
No partial human body entering from outside frame.
No face, hand, arm, head or silhouette belonging to an unrequested person.

All requested people must be clearly visible.
Do not omit any requested person.
```

For example beat-01:

```text
PEOPLE CONTRACT:

Show EXACTLY 4 visible people in the entire illustration.

Visible people must be ONLY:
father, mother, boy, girl.

No other person is visible.
No extra adult.
No extra child.
No duplicate person.
No background person.
No partial human body entering from outside frame.

All four requested family members must be clearly visible.
Do not omit father, mother, boy or girl.
```

This block must remain concise.

---

# 6. COMPACT CAST DESCRIPTIONS

After PEOPLE CONTRACT:

```text
CAST:
father: adult Vietnamese man, short black hair, muted sage shirt.
mother: adult Vietnamese woman, tied black hair, warm neutral cardigan.
boy: Vietnamese school-age boy, short black hair, muted sage top.
girl: Vietnamese young girl, dark hair, cream neutral clothing.
```

Only include requested members.

Do NOT include cast members not present in the beat.

Do NOT add verbose facial photography language.

---

# 7. DO NOT CHANGE PRIMARY ACTION

Use the same PRIMARY ACTION and MEANING from V3.3B-S.1.

This task is NOT semantic fidelity.

If an image has the correct people but the wrong furniture/action:
do NOT reject it for this test.

---

# 8. DO NOT CHANGE WORLD OR FRAMING

Keep the same compact world and drawing-language framing from V3.3B-S.1.

Do not introduce additional composition tricks to force people count.

---

# 9. EXACTLY TWO CALLS PER BEAT

Generate:

```text
4 beats × 2 independent calls = 8 images
```

No retry.
No replacement.
No cherry-picking.

Save:

```text
beat-01-a.jpg
beat-01-b.jpg
beat-02-a.jpg
beat-02-b.jpg
beat-04-a.jpg
beat-04-b.jpg
beat-09-a.jpg
beat-09-b.jpg
```

---

# 10. CONTACT SHEET

Create:

```text
scratch/v33/schnell-people-contract/contact-sheet.jpg
```

Layout:

```text
4 rows × 2 columns
```

Each row = same beat A/B.

External labels only.

---

# 11. PEOPLE-CONTRACT EVALUATION ONLY

Create:

```text
evaluation.md
```

For each image record:

```text
expectedCount
actualVisibleCount
requestedMembers
missingRequestedMembers
extraVisiblePeople
partialUnrequestedHumanParts
peopleContract:
  PASS
  FAIL
stylePreserved:
  PASS
  FAIL
```

Do NOT reject for:
- wrong action;
- wrong furniture;
- wrong world layout;
- facial identity inconsistency;
- text/signature artifacts;
- anatomy details of requested people unless an extra detached body part implies an unrequested person.

---

# 12. COUNTING RULE

Count every identifiable human as visible, including:

- foreground;
- background;
- cropped person;
- partial torso;
- identifiable head/face;
- identifiable extra hand/arm clearly belonging to another person.

Do NOT count:
- framed photos;
- abstract paintings;
- tiny non-human decorations.

If uncertain:
mark `AMBIGUOUS` and treat as FAIL for this test.

---

# 13. STYLE GUARD

Because V3.3B-S.1 already solved style drift, each image must also remain within:

```text
TARGET_EDITORIAL_2D
```

If people count is correct but the image drifts realistic:

```text
stylePreserved = FAIL
```

This prevents solving one problem by breaking the previous gate.

---

# 14. PASS RULE

PASS only if:

```text
7/8 images peopleContract = PASS
```

AND:

```text
8/8 images stylePreserved = PASS
```

AND:

```text
beat-01 gets exact 4 people in at least 1/2 calls
beat-04 gets exact 3 people in at least 1/2 calls
```

If not:

```text
V3.3B-S.2 SCHNELL PEOPLE CONTRACT — FAIL
```

No retries.

---

# 15. COMPARISON

Create:

```text
comparison.md
```

Compare against V3.3B-S.1 visually observed contract failures:

```text
beat-01: often 3 instead of 4
beat-02: variable extra/missing adult composition
beat-04: 2 instead of requested 3
beat-09: generally closer to requested 2
```

Do not make statistical claims beyond this sample.

---

# 16. REQUIRED OUTPUTS

```text
scripts/test-hay-dep-schnell-people-contract.mjs

scratch/v33/schnell-people-contract/
  beat-01-a.jpg
  beat-01-b.jpg
  beat-02-a.jpg
  beat-02-b.jpg
  beat-04-a.jpg
  beat-04-b.jpg
  beat-09-a.jpg
  beat-09-b.jpg
  contact-sheet.jpg
  evaluation.md
  comparison.md
  prompts.json
  run-report.json
```

`prompts.json` must contain exact model-facing prompts and no credentials.

---

# 17. FINAL REPORT

Return:

## A. Scope Confirmation

## B. People Contract Added

## C. 8-Image Contract Table

## D. Style Preservation

## E. Contact Sheet Path

## F. Previous vs New Contract Behavior

## G. Limitations

State clearly:
- action fidelity not evaluated;
- anatomy not evaluated except extra-person counting;
- identity continuity not evaluated;
- world continuity not evaluated;
- text/signature pollution not evaluated.

## H. Verdict

Exactly one:

```text
V3.3B-S.2 SCHNELL PEOPLE CONTRACT — PASS
```

or:

```text
V3.3B-S.2 SCHNELL PEOPLE CONTRACT — FAIL
```

Then STOP.

Wait for human review.
