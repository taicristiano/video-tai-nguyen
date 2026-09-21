# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — VIDEO005 REAL PRODUCTION EXECUTION
# FINAL TEMPLATE CLEANUP → BRAND MIGRATION → REAL IMAGE GENERATION
# STOP AT HUMAN VISUAL QA
# IMAGE MODEL LOCK: @cf/black-forest-labs/flux-1-schnell ONLY

---

# 0. PURPOSE

The architecture phase is complete enough to move to real production output.

Do NOT reopen:
- image-model research;
- shot-grammar research;
- framing research;
- motion research;
- typography/watermark redesign;
- cross-shot identity research.

The real production pipeline is now expected to be:

```text
canonical content
→ production story planner
→ reference-shot grammar
→ spec / visual beats
→ production image prompt
→ image generation
→ human visual QA
→ later final render
```

This task has exactly THREE goals:

```text
1. fix two small reusable template correctness issues;
2. migrate video005 away from legacy spoken brand "Nếp";
3. run the REAL production image-generation path for video005;
   then STOP at human visual QA.
```

Do NOT render the final MP4 yet.

---

# 1. LOCKED PRODUCTION BASELINE

## Image model

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Never switch model.
Never rotate to another model.
Never use FLUX.2 Dev or any other image model.

## Image style

Use:

```text
clean 2D cartoon / illustrated editorial
non-photorealistic
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber
```

## Identity policy

Cross-shot facial likeness consistency is NOT required.

Each image only needs to independently satisfy:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Do not spend retries trying to reproduce identical faces.

## Brand / typography / motion

Use the currently accepted HAY & ĐẸP. production baseline.

Do NOT alter:
- accepted V1.2.1 typography;
- accepted watermark;
- centered artwork geometry;
- V1.1 motion;
- hard-cut grammar;
- atmospheric background.

---

# 2. SMALL TEMPLATE CLEANUP — PEOPLE GROUP SILHOUETTE

## Current issue

The reusable validator can still accept an exact 4-person people contract with a `three-person` silhouette.

Example bad semantic pairing:

```text
peopleContract = { min: 4, max: 4 }
silhouette = three-person
```

This must be corrected generically.

## Required reusable silhouette domain

Add/support explicit group silhouettes:

```ts
export type ShotSilhouette =
  | 'single-centered'
  | 'single-left'
  | 'single-right'
  | 'face-close'
  | 'hands-detail'
  | 'two-person'
  | 'two-person-wide'
  | 'two-person-balanced'
  | 'two-person-offset'
  | 'two-person-over-shoulder'
  | 'three-person'
  | 'family-group'
  | 'group'
  | 'empty-space'
  | 'object-detail'
  | 'tabletop-topdown'
  | 'room-wide';
```

## Compatibility rules

Use exact semantics:

```text
0 people:
  empty-space
  object-detail
  tabletop-topdown

1 person:
  single-centered
  single-left
  single-right
  face-close
  hands-detail
  room-wide if exactly one visible human is intentionally present

2 people:
  two-person
  two-person-wide
  two-person-balanced
  two-person-offset
  two-person-over-shoulder

3 people:
  three-person
  family-group

4+ people:
  family-group
  group
```

`three-person` must NOT pass when exact visible people count is 4+.

Update anti-monotony repair so it only rotates to silhouettes compatible with the people contract.

---

# 3. SMALL TEMPLATE CLEANUP — DEDUPE CONTINUED SEGMENTS

## Current issue

Some merged beats can contain duplicated continuation indices:

```text
continuedInSegments = [0, 0]
continuedInSegments = [9, 9]
```

This does not necessarily break rendering, but it corrupts diagnostics and is unnecessary.

## Required fix

Normalize with a deterministic unique set:

```ts
function normalizeContinuedSegments(
  ...groups: Array<number[] | undefined>
): number[] {
  return [
    ...new Set(
      groups
        .flatMap((group) => group ?? [])
        .filter((v) => Number.isInteger(v))
    ),
  ].sort((a, b) => a - b);
}
```

When merging:

```ts
continuedInSegments: normalizeContinuedSegments(
  a.continuedInSegments ?? [a.segmentIndex],
  b.continuedInSegments ?? [b.segmentIndex],
);
```

Do not alter actual canonical timing.

Add a test proving duplicates are removed.

---

# 4. VIDEO005 BRAND MIGRATION — REMOVE LEGACY "NẾP" FROM SPOKEN CONTENT

## Production blocker

The production gate currently detects:

```text
BRAND_AUDIO_MISMATCH
spoken = "Nếp"
visual brand = "HAY & ĐẸP."
```

This must be fixed BEFORE any image generation.

## Important brand policy

For HAY & ĐẸP.:

```text
visual brand = HAY & ĐẸP.
slogan = "Điều hay để biết. Điều đẹp để giữ."
```

Do NOT speak the old brand `Nếp`.

Preferred production behavior:

```text
spoken narration ends naturally
→ visual OutroCard carries HAY & ĐẸP. branding
```

Do NOT add a forced spoken brand tag unless the current HAY & ĐẸP. production content contract explicitly requires it.

## Required migration steps

Audit the canonical video005 source:
- voice script;
- timeline;
- subtitle canonical text;
- spec/story-plan;
- any legacy outro string.

Remove or replace only the legacy `Nếp` spoken outro.

Do NOT rewrite the main body unless needed for brand consistency.

If source currently ends with:

```text
"Nếp, ..."
```

preferred migration:

```text
remove the spoken brand phrase
keep the final semantic sentence natural
let visual OutroCard carry the brand
```

If a natural final sentence already exists before the legacy tag:
- keep it;
- remove only the brand tag.

---

# 5. REGENERATE VIDEO005 VOICE / TIMELINE THROUGH NORMAL PRODUCTION FLOW

After canonical text is migrated:

Run the NORMAL production voice/timeline path for video005.

Do NOT hand-edit timestamps.

Required result:

```text
brandAudit.hasMismatch = false
productionValidation.productionReady = true
```

Run the production planner again.

Confirm:

```text
structuralValidation.ok = true
productionValidation.productionReady = true
grammarVersion = reference-shot-grammar-v1
```

Before any image generation, output the updated production readiness.

If it is NOT ready:

```text
HAY & ĐẸP. VIDEO005 PRODUCTION — BLOCKED
```

and STOP.

---

# 6. REAL VIDEO005 SHOT PLAN — USE PRODUCTION OUTPUT ONLY

Use the actual current production planner result.

Do NOT hand-author a different storyboard.

Create/update:

```text
videos/<video005-slug>/story-plan.json
videos/<video005-slug>/story-plan-validation.json
videos/<video005-slug>/reference-grammar-metrics.json
videos/<video005-slug>/production-readiness.json
```

Also create human-readable:

```text
scratch/video005-production/
  shot-plan.md
  shot-plan.json
  shot-transition-strip.jpg
  generation-plan.md
```

`shot-transition-strip.jpg` should show:

```text
shot id
time
scale
silhouette
visual verb
role
```

This is evidence that the high-view reference grammar is actually entering the real production video.

---

# 7. IMAGE GENERATION POLICY

Now and only now, if productionReady = true, generate required production assets.

Use the REAL production path.

Do NOT run a separate manual image-generator harness unless the production pipeline itself calls it.

## Model

ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

## Retry

```text
max 3 REAL attempts per asset
```

HTTP 429:

```text
PAUSED_QUOTA
```

429 does NOT consume an attempt.

Do NOT switch model.

---

# 8. REAL SHOT GRAMMAR MUST DRIVE IMAGE PROMPTS

Each generated image must use the real production beat metadata:

```text
plannerStoryRole
scale
shotScale
silhouette
visualVerb
semanticIntent
peopleContract
presentMembers
composition
```

Image prompt must reflect the shot type.

Examples:

## DETAIL

Use illustration-native phrasing:

```text
Clean 2D editorial detail insert.
Strong focal separation.
Clear tactile object hierarchy.
Simplified secondary background.
```

Do NOT use:

```text
macro lens
shallow depth of field
photographic camera language
```

## WIDE

Show:
- environment;
- spatial context;
- requested people count;
- readable action.

## MEDIUM

Show:
- person(s);
- clear physical action;
- enough context for meaning.

## CLOSE

Show:
- emotional reaction / face / hands;
- clean anatomy;
- no unnecessary background clutter.

---

# 9. PEOPLE CONTRACT — STRICT

The real image prompt must contain exact people count.

Examples:

```text
0..0
ZERO visible people.
ZERO hands/arms/body parts.

1..1
EXACTLY one visible person.

2..2
EXACTLY two visible people.

3..3
EXACTLY three visible people.

4..4
EXACTLY four visible people.
```

For 4+ group scenes, use compatible `family-group` / `group` silhouettes.

Do not add background humans.

If `presentMembers` exists:
- use their roles;
- count must exactly match people contract.

---

# 10. IDENTITY POLICY IN ACTUAL PROMPT

The production image prompt must include:

```text
Use the requested character roles.
Exact facial likeness across different generated images is NOT required.
Do not add extra people.
```

It must NOT contain:

```text
Use same recurring identities
Do not invent different faces
match exact same face
```

World/environment continuity may remain.

---

# 11. TEXT POLLUTION SAFETY

Every prompt must prohibit:

```text
words
letters
numbers
labels
brand marks
signatures
watermarks
pseudo-text
```

Special reusable rules:

## Documents / mail / receipts

Use:

```text
blank paper slips
unprinted paper pieces
plain blank notebook
simple geometric paper blocks
```

Do NOT ask for printed receipts/mail.

## Timer / clock

Use:

```text
minimal simple timer
colored wedge / indicator
no numerals
no letters
no brand mark
```

The narration carries the "10 minutes" meaning.

---

# 12. IMAGE QA — NO FAKE PASS

Machine integrity is NOT visual QA.

Every generated image starts:

```text
PENDING_VISUAL_QA
qa = null
```

Machine checks may verify:
- valid JPEG/PNG;
- dimensions;
- non-empty file.

They must NOT auto-pass visual quality.

---

# 13. HUMAN VISUAL QA DIMENSIONS

For each generated production asset review:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Only human review may mark final PASS.

Do NOT render final video005 until ALL required assets have explicit human PASS.

---

# 14. CREATE VIDEO005 REVIEW PACK

Create:

```text
scratch/video005-production/review-pack/
```

For all newly generated production assets.

Required:

```text
review-manifest.json
contact-sheet.jpg
```

Also export individual images under clear slot IDs.

Contact sheet requirements:
- fullPage / no clipping;
- object-fit: contain;
- show full image;
- no crop;
- large enough to inspect anatomy/text;
- label each card with:
  - shot id
  - frame/time range
  - scale
  - silhouette
  - visual verb
  - people contract
  - semantic intent
  - attempt
  - QA status

Do NOT create a tiny unreadable contact sheet.

---

# 15. CONTACT SHEET MUST SHOW WHETHER REFERENCE GRAMMAR IS VISIBLE

This is important.

The review sheet should make it visually obvious whether the real video now has:

```text
wide
→ medium
→ detail
→ close
→ release
```

rather than:

```text
medium person
→ medium person
→ medium person
```

Also create:

```text
scratch/video005-production/shot-language-strip.jpg
```

Use the selected/pending production images in sequence.

Show:
- shot scale;
- silhouette;
- semantic action.

This is the main proof that the high-view reference videos have influenced production output.

---

# 16. DO NOT RENDER MP4 YET

STOP after:
- canonical brand migration;
- voice/timeline update;
- productionReady true;
- real production image generation;
- review pack/contact sheet.

Do NOT call Remotion final render.

Do NOT generate a final MP4.

---

# 17. QUOTA STOP CONDITION

If HTTP 429 occurs:

```text
HAY & ĐẸP. VIDEO005 IMAGE GENERATION — PAUSED_QUOTA
```

Report:
- completed shots;
- pending shots;
- current attempt counts.

Do not consume attempts on quota errors.

Do not switch model.

Then STOP.

---

# 18. BLOCKED-ASSET CONDITION

If an asset reaches 3 real visual failures:

```text
NEEDS_LOCAL_CLEANUP
```

or:

```text
BLOCKED_ASSET
```

depending on defect type.

Allowed deterministic local cleanup after Attempt 3 only for isolated defects such as:
- one logo mark;
- isolated pseudo-text;
- small extra object;
- local bar/artifact.

Do NOT use raster cleanup to fix:
- wrong whole scene;
- wrong people count across composition;
- major anatomy;
- fundamentally wrong semantic action.

---

# 19. TEMPLATE CLEANUP TESTS

Before generation, add/run focused tests:

1. exact four-person contract rejects `three-person`;
2. exact four-person contract accepts `family-group`;
3. 5+ people accepts `group`;
4. `continuedInSegments` deduplicates indices;
5. anti-monotony repair remains people-compatible;
6. production brand gate becomes READY after video005 migration;
7. real image prompt contains no likeness-consistency requirement;
8. real image prompt receives exact people count;
9. real image prompt timer/document safety remains active.

Run full repository tests.

---

# 20. GENERATION REPORT — REQUIRED

Return in this exact order:

## A. Tiny Template Cleanup

Report:
```text
4+ people silhouette fix
continuedInSegments dedupe
```

Files changed.

## B. Video005 Brand Migration

Show:
```text
old canonical ending
new canonical ending
```

Do NOT include large verbatim script dumps.

Show:
```text
brandAudit before
brandAudit after
```

## C. Updated Voice / Timeline

Report:
```text
voice duration
timeline duration
subtitle/canonical alignment status
```

## D. Production Story Plan

Report:
```text
shot count
duration
CPM
median hold
max hold
scale distribution
silhouette distribution
grammarVersion
```

## E. Production Readiness

Must show:

```text
structuralValidation.ok
productionValidation.productionReady
```

## F. Image Generation

Report:
```text
model
required images
generated images
attempt-1 count
attempt-2 count
attempt-3 count
429 count
```

## G. Review Pack

Paths:

```text
review-manifest.json
contact-sheet.jpg
shot-language-strip.jpg
```

## H. Current Human QA State

Report:

```text
PASS
PENDING_VISUAL_QA
NEEDS_REGEN
```

counts.

## I. Tests

Exact counts.

## J. External Calls

Report exact:
```text
Cloudflare Schnell calls
TTS calls
STT calls
Remotion renders
```

Remotion renders MUST be:

```text
0
```

## K. Verdict

Use exactly one:

```text
HAY & ĐẸP. VIDEO005 PRODUCTION IMAGES — READY FOR HUMAN REVIEW
```

or

```text
HAY & ĐẸP. VIDEO005 IMAGE GENERATION — PAUSED_QUOTA
```

or

```text
HAY & ĐẸP. VIDEO005 PRODUCTION — BLOCKED
```

Then STOP.

Do NOT render final MP4.
