# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.6
# SINGLE GOAL: VIDEO 001 SCHNELL-SAFE FULFILLMENT IMAGE PILOT
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

V3.3B-S.5.1 is complete.

Current Video 001 fulfillment plan is now semantically clean and deterministic.

Video 001 has:

```text
16 total beats

CANONICAL_REQUIRED = 1
REUSE_CANONICAL    = 3
SCHNELL_SINGLE     = 4
SCHNELL_OBJECT     = 2
UNCHANGED          = 6
```

Among the 6 UNCHANGED beats:
- 2 are existing single-person Schnell-safe beats;
- 1 is zero-person Schnell-safe release;
- 3 are already canonical-reuse beats.

Therefore exactly 9 beats can be tested through the Schnell generation path without requiring a group canonical image.

This task has ONE GOAL ONLY:

> Validate the actual Schnell-safe portion of the transformed Video 001 fulfillment plan using real image generation.

Do NOT solve the canonical group asset in this task.
Do NOT render MP4.
Do NOT integrate production code.

---

# 1. HARD SCOPE LOCK

Allowed new/modified script:

```text
scripts/test-hay-dep-video001-schnell-safe-pilot.mjs
```

Allowed output directory:

```text
scratch/v33/video001-schnell-safe-pilot/
```

You may READ:
- current Video 001 Story Plan;
- S.4 capability router;
- S.5.1 fulfillment planner;
- cast registry;
- world preset;
- S.1 proven Style-First geometry.

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
scripts/test-hay-dep-schnell-capability-router.mjs
scripts/test-hay-dep-schnell-fulfillment-planner.mjs
```

Do NOT modify:
- cast registry;
- world presets;
- subtitle;
- SFX;
- Remotion;
- production manifests/assets.

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

Do NOT retry unsupported seed/steps.

Use authorized Cloudflare credentials from environment / `.env`.

Never print credential values.

---

# 3. BUILD CURRENT PLAN FIRST

Load current Video 001 Story Plan.

Then run:
1. `routeSchnellBeat()`
2. `planSchnellFulfillment()`

Do not hardcode stale fulfillment metadata.

Required current fulfillment counts:

```text
CANONICAL_REQUIRED = 1
REUSE_CANONICAL    = 3
SCHNELL_SINGLE     = 4
SCHNELL_OBJECT     = 2
UNCHANGED          = 6
```

If counts differ:

```text
V3.3B-S.6 VIDEO 001 SCHNELL-SAFE PILOT — FAIL
```

and STOP before image generation.

---

# 4. GENERATE EXACTLY THESE 9 BEATS

Generate only beats whose final path is actually Schnell-safe:

```text
beat-02
beat-04
beat-06
beat-07
beat-08
beat-09
beat-10
beat-12
beat-15
```

Expected broad paths:

```text
beat-02  SCHNELL_OBJECT
beat-04  SCHNELL_SINGLE
beat-06  UNCHANGED + SCHNELL_SAFE
beat-07  SCHNELL_OBJECT
beat-08  SCHNELL_SINGLE
beat-09  SCHNELL_SINGLE
beat-10  SCHNELL_SINGLE
beat-12  UNCHANGED + SCHNELL_SAFE
beat-15  UNCHANGED + SCHNELL_SAFE / no people
```

Do NOT generate:

```text
beat-01
beat-03
beat-05
beat-11
beat-13
beat-14
beat-16
```

Those require or reuse canonical assets.

---

# 5. EXACTLY ONE CALL PER BEAT

Generate:

```text
9 beats × 1 call = 9 API calls
```

No retry.
No replacement.
No cherry-picking.

Reason:

> We need an unbiased raw-yield measurement of the simplified Schnell-safe plan.

Save:

```text
beat-02.jpg
beat-04.jpg
beat-06.jpg
beat-07.jpg
beat-08.jpg
beat-09.jpg
beat-10.jpg
beat-12.jpg
beat-15.jpg
```

---

# 6. KEEP STYLE-FIRST GEOMETRY

Every model-facing prompt must begin in this exact order:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
```

Use the proven S.1 style-first wording.

Do NOT put action first.

Do NOT use:
- camera;
- candid;
- portrait photography;
- bokeh;
- cinematic realism;
- shallow depth of field.

Do NOT include literal brand-name tokens:

```text
HAY & ĐẸP.
HAY DEP
STYLE LOCK — HAY & ĐẸP.
```

inside model-facing prompts.

---

# 7. MEDIUM LOCK

Start with:

```text
MEDIUM LOCK:

2D EDITORIAL DRAWING ONLY.
Hand-drawn magazine illustration on warm paper.
Visible ink contour lines around faces, bodies, hands, furniture and objects.
Opaque matte color shapes with restrained soft shading.
Clearly drawn and illustrated, never camera-rendered.
Mature contemporary editorial illustration for adults.
```

---

# 8. RENDERING RECIPE

Then:

```text
RENDERING RECIPE:

Charcoal / sepia contour drawing.
Matte gouache-like color fills.
One restrained soft shadow layer.
Subtle paper grain visible across the image.
Simplified but believable Vietnamese / East Asian human features when people are present.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.
```

---

# 9. PALETTE

Then:

```text
PALETTE:

Warm ivory and cream.
Muted sage.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.
```

---

# 10. FULFILLMENT-SPECIFIC PROMPT CONTRACT

## A. `SCHNELL_SINGLE`

Use the S.5.1 fields:

```text
selectedMember
simplifiedVisualIntent
simplifiedVisualAction
semanticAnchorsPreserved
```

Prompt must explicitly state:

```text
VISIBLE PEOPLE:
Exactly one visible person in the entire illustration.
Only <selectedMember>.
No second person.
No background person.
No partial extra human body.
```

Use only the selected member's cast description.

Do NOT include descriptions for off-frame family members.

Example:

```text
CAST:
boy: Vietnamese school-age boy, short black hair, muted sage top.
```

For single-person beats:
- other people may be implied off-frame;
- they must NOT be visible.

---

## B. `SCHNELL_OBJECT`

Prompt must explicitly state:

```text
VISIBLE PEOPLE:
No people visible anywhere in the illustration.
No face, head, hand, arm, body, silhouette, reflection or background person.
```

Then use only:

```text
simplifiedVisualIntent
simplifiedVisualAction
semanticAnchorsPreserved
```

Do NOT append cast descriptions.

---

## C. UNCHANGED `SCHNELL_SAFE`

Use current beat semantics.

If current safe beat has exactly one requested member:

```text
Exactly one visible person.
Only that requested member.
```

If zero people:

```text
No people visible anywhere.
```

Do NOT expand it back into multi-person storytelling.

---

# 11. WORLD

Use the current Video 001 world preset compactly.

Maximum 3 lines.

Example structure:

```text
WORLD:

Same warm Vietnamese family dining/home environment.
Warm ivory walls, medium warm wood furniture, one simple pendant lamp.
Keep architecture and decor understated and drawn.
```

Use actual current preset anchors.

Do NOT overload the prompt with room details.

---

# 12. FRAMING

Use drawing-language framing only:

```text
Wide drawn composition.
Medium drawn composition.
Editorial detail illustration.
Balanced negative space.
```

Map from current beat shot metadata.

No photographic language.

---

# 13. HARD EXCLUSIONS

End every prompt with:

```text
HARD EXCLUSIONS:

No written words anywhere.
No logo.
No signature.
No watermark-like marks.
No random lettering on walls, clothing, books or objects.
No anime.
No chibi.
No children's-book styling.
No corporate flat vector.
No 3D rendering.
No glossy realistic skin.
No extra people.
No malformed or detached body parts.
```

For object beats also include:

```text
No human body parts.
```

---

# 14. PROMPT LENGTH

Target:

```text
<= 1800 characters
```

Hard maximum:

```text
2100 characters
```

Never blind-slice.

Save exact prompts + character counts to:

```text
prompts.json
```

No credentials.

---

# 15. QA — FIVE DIMENSIONS

Evaluate each of the 9 images on:

```text
style
people contract
semantic fidelity
anatomy
text pollution
```

Use:

```text
PASS
FAIL
```

---

# 16. STYLE GATE

PASS only if the image is clearly:

```text
TARGET_EDITORIAL_2D
```

Fail for:
- realistic digital painting;
- near-photoreal;
- anime;
- chibi;
- 3D;
- generic flat corporate vector.

---

# 17. PEOPLE CONTRACT GATE

## Single-person beat

PASS only if:

```text
exactly 1 visible person
correct age-group / member type
no extra partial person
```

No exact face identity requirement.

## Object/no-people beat

PASS only if:

```text
0 visible people
0 human body parts
```

---

# 18. SEMANTIC FIDELITY GATE

Judge against the FINAL fulfillment action, not the original unsafe multi-person visual.

Examples:

### beat-04

If final action is:

```text
boy speaks with a small hand gesture, facing someone off-frame
```

PASS if that is clearly depicted.

Do NOT require the whole family.

### beat-07

If final action is:

```text
school bag and work bag near doorway / dining chair
```

PASS if the work/school trace is clearly readable.

Do NOT require a visible conversation.

### beat-02

If final action is simple meal still-life:
PASS if a simple Vietnamese meal/table trace is clearly shown with no people.

---

# 19. ANATOMY GATE

For single-person images fail if any:

```text
floating head
detached hand
detached arm
missing torso
severe duplicate limb
severed body
```

Do not fail tiny finger imperfections unless they visibly break the image.

For object beats:
human anatomy should not exist at all.

---

# 20. TEXT-POLLUTION GATE

Fail if generated illustration contains any unintended:

```text
word
signature
logo
watermark-like mark
pseudo-lettering
```

Visible gibberish signatures count as FAIL.

---

# 21. CONTACT SHEET

Create:

```text
scratch/v33/video001-schnell-safe-pilot/contact-sheet.jpg
```

Suggested layout:

```text
3 columns × 3 rows
```

Order:

```text
02 04 06
07 08 09
10 12 15
```

External labels only:

```text
beat-04
SCHNELL_SINGLE
```

Do not add labels inside source image pixels.

---

# 22. QA REPORT

Create:

```text
qa.json
evaluation.md
run-report.json
```

For each beat:

```json
{
  "beatId": "beat-04",
  "sourceRoute": "SIMPLIFY_OR_CANONICAL",
  "fulfillment": "SCHNELL_SINGLE",
  "selectedMember": "boy",
  "semanticAnchorsPreserved": ["SPEAKING"],
  "style": "PASS",
  "peopleContract": "PASS",
  "semanticFidelity": "PASS",
  "anatomy": "PASS",
  "textPollution": "PASS",
  "overall": "PASS"
}
```

---

# 23. PASS RULE

Pilot PASS requires:

```text
>= 8/9 overall PASS
```

AND:

```text
9/9 style PASS
```

AND these mandatory archetype gates:

```text
beat-04 single child      = PASS
beat-02 object meal       = PASS
beat-07 school/work object= PASS
beat-15 no-people release = PASS
```

AND:

```text
0 severe anatomy failures among selected single-person images
```

Because there are no retries, one non-mandatory isolated text artifact or semantic miss may be tolerated within the 8/9 threshold.

If any mandatory archetype fails:

```text
FAIL
```

---

# 24. DO NOT TEST CANONICAL GROUP YET

This task intentionally does NOT validate:

```text
beat-01 CANONICAL_REQUIRED
beat-03/05/11 REUSE_CANONICAL
beat-13/14/16 existing canonical reuse
```

Do not generate a fake Schnell family canonical.

Do not substitute an old failed family image.

Canonical group strategy is the NEXT separate architectural task if this Schnell-safe pilot passes.

---

# 25. ACCEPTANCE CRITERIA

PASS only if:

1. current S.5.1 fulfillment counts validate before generation;
2. exactly 9 API calls are made;
3. only the 9 Schnell-safe beats are generated;
4. style-first rendering remains stable;
5. 0/1-person contracts are respected;
6. simplified semantics are visually represented;
7. no severe anatomy failures;
8. at least 8/9 images pass overall;
9. mandatory beat archetypes pass;
10. no production code modified;
11. no MP4 rendered.

---

# 26. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Current S.5.1 Plan Validation

## C. Generation Settings

## D. 9-Beat QA Table

## E. Failure Analysis

## F. Contact Sheet Path

## G. Raw Yield

Show:

```text
overall pass count / 9
style pass count / 9
people contract pass count / 9
semantic pass count / 9
anatomy pass count / 9
text-pollution pass count / 9
```

## H. Architectural Decision

If PASS, state exactly:

```text
The simplified Schnell-safe path is viable enough to proceed to a separate canonical-group asset strategy.
```

If FAIL, state exactly:

```text
The simplified Schnell-safe path is not reliable enough for production integration yet.
```

## I. Verdict

Exactly one:

```text
V3.3B-S.6 VIDEO 001 SCHNELL-SAFE PILOT — PASS
```

or:

```text
V3.3B-S.6 VIDEO 001 SCHNELL-SAFE PILOT — FAIL
```

Then STOP.

Do not render MP4.
Do not start canonical-group work automatically.
Wait for human review.
