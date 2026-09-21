# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — FINAL PRODUCTION BRIDGE CORRECTION
# FIX ACTUAL SOURCE, NOT REPORTS
# TEMPLATE / PRODUCTION LEVEL ONLY
# VIDEO005/013 ARE FIXTURES ONLY
# OFFLINE ONLY
# ZERO CLOUDFLARE / SCHNELL
# ZERO TTS / STT
# ZERO REMOTION RENDER

## 0. IMPORTANT — SOURCE REVIEW FOUND THE PREVIOUS "READY FOR GENERATION" VERDICT IS PREMATURE

Do NOT generate images yet.

The latest `changes.zip` improved the real production chain, but actual source still contains several correctness gaps.

This is a narrow final production bridge correction.

After this pass, the next step is real image generation if and only if every gate below passes.

---

# 1. BLOCKER — CROSS-SEGMENT CADENCE MERGE IS NOT ACTUALLY RENDERED

## Actual current behavior

`storyPlannerRuntime.mjs::normalizeCadence()` has a third pass that may merge adjacent shots from DIFFERENT canonical segments.

The merged shot gets:

```js
segmentIndex: a.segmentIndex,
continuedInSegments: [...],
startFrame: a.startFrame,
endFrame: b.endFrame,
```

But `batch-engine.mjs::buildSpecFromStoryPlan()` currently selects:

```js
storyPlan.beats.filter(
  beat => beat.segmentIndex === i
)
```

It does NOT consume `continuedInSegments`.

Therefore a cross-segment merged beat is rendered only in its first segment. Its tail is clamped by:

```js
localEnd = Math.min(durFrames, ...)
```

and the later canonical segment may have no real planned beat.

This can create:
- visual truncation;
- wrong fallback visual;
- empty image path;
- cadence plan that differs from rendered video.

## Required fix

Support cross-segment visual continuation explicitly.

Preferred reusable model:

```ts
type PlannedBeat = {
  segmentIndex: number;              // anchor/original segment
  continuedInSegments?: number[];   // all canonical segments visually covered
}
```

In the spec bridge:

```ts
function beatCoversSegment(beat, segmentIndex) {
  return (
    beat.segmentIndex === segmentIndex ||
    beat.continuedInSegments?.includes(segmentIndex)
  );
}
```

Then:

```js
const plannedBeats = storyPlan.beats.filter(
  beat => beatCoversSegment(beat, i)
);
```

For each scene, project only the overlap:

```js
const overlapStart = Math.max(
  beat.startFrame,
  sceneStartFrame
);

const overlapEnd = Math.min(
  beat.endFrame,
  sceneEndFrame
);

if (overlapEnd <= overlapStart) skip;

const localStart =
  overlapStart - sceneStartFrame;

const localEnd =
  overlapEnd - sceneStartFrame;
```

## Resolve asset ONCE per merged beat

Do NOT generate/select a different image for each covered segment.

Use:

```js
const resolvedBeatAssetCache =
  new Map(); // key = beat.id or stable visualContinuationId
```

Resolve first time, reuse exact same asset across all continued segments.

## Hard fallback rule

Never silently create:

```js
image.path = ''
```

If a non-outro narrative segment has neither:
- a covering planned beat,
- nor an explicit supported visual continuation,

throw:

```text
SPEC_BRIDGE_ORPHAN_SEGMENT
```

Do NOT hide it with a blank or arbitrary previous asset.

---

# 2. CANONICAL SEGMENT IDENTITY MUST REMAIN TRUTHFUL

`preProcessSegments()` currently extends each segment end to the next segment start and sets `sourceSegmentEndFrame` from that extended range.

That is NOT the original canonical spoken segment boundary.

Keep two domains:

```ts
canonicalStartFrame
canonicalEndFrame

visualWindowStartFrame
visualWindowEndFrame
```

Canonical values must come from:

```js
curr.start
curr.end
```

exactly.

Visual window may extend across silence to the next segment start if desired for render continuity.

Do NOT label expanded silence as the canonical source segment.

Tests and reports must distinguish them.

---

# 3. BLOCKER — "SINGLE SOURCE OF TRUTH" CLAIM IS CURRENTLY FALSE

The current ZIP contains runtime logic duplicated in BOTH:

```text
referenceShotGrammarRuntime.mjs
referenceShotGrammar.ts

storyPlannerRuntime.mjs
storyPlanner.ts
```

The `.ts` files are now >1000 lines and independently implement runtime logic.

This violates the intended architecture.

There is already concrete drift:

Runtime:

```js
buildTemplateScenes(...)
→ shotScale = mapPlannerScaleToRendererScale(...)
```

TypeScript copy:

```ts
shotScale: shot.scale as any
```

which can put uppercase planner values into renderer scene data.

## Required architecture

Runtime behavior exists in ONE place only:

```text
referenceShotGrammarRuntime.mjs
storyPlannerRuntime.mjs
```

TypeScript files should contain:
- types/interfaces;
- typed wrapper declarations where necessary;
- re-exports/imports from runtime modules.

They must NOT reimplement:
- `validateShotPlan`;
- `repairScaleMonotony`;
- `choosePlannerScale`;
- `mapPlannerScaleToRendererScale`;
- `normalizeCadence`;
- `buildTemplateScenes`;
- prompt safety logic.

Restore actual single source of truth.

## Type contract must include real runtime silhouettes

Runtime currently can produce:

```text
two-person-wide
two-person-balanced
two-person-offset
two-person-over-shoulder
```

Add them to `ShotSilhouette` if those variants remain.

Do NOT hide type mismatch using:

```ts
as any
```

Add:

```bash
npx tsc --noEmit
```

if project supports TypeScript typecheck.

---

# 4. BLOCKER — PEOPLE CONTRACT DOES NOT FULLY REACH REAL IMAGE PROMPT

Production beat has:

```js
peopleContract: {
  min,
  max
}
```

but `batch-engine.mjs::resolveBeatAsset()` only passes:
- `--no-people`
- `--present-members`

It does NOT pass the actual min/max people contract.

`human-insight-image.mjs` can therefore default to every member in a cast when `presentMembers` is absent, even if the planner requires exactly one visible person.

## Required bridge

Add CLI/payload fields:

```text
--people-min
--people-max
```

Pass from:

```js
beat.peopleContract.min
beat.peopleContract.max
```

into the image generation scene object.

Image prompt must explicitly enforce:

```text
0..0 → ZERO visible people/body parts
1..1 → EXACTLY one visible person
2..2 → EXACTLY two visible people
3..3 → EXACTLY three visible people
```

If `presentMembers` exists, its length must equal the exact people contract.

If not, do NOT default to all cast members when that violates min/max.

---

# 5. BLOCKER — SILHOUETTE COMPATIBILITY VALIDATOR IS TOO PERMISSIVE

Current runtime returns true for:

```text
peopleContract = { min: 2, max: 2 }
+
silhouette = object-detail
```

and:

```text
tabletop-topdown
```

That contradicts "exactly two visible people".

Fix semantics.

Suggested minimum:

```text
0 people:
  empty-space
  object-detail
  tabletop-topdown

exactly 1:
  single-centered
  single-left
  single-right
  face-close
  hands-detail when one person's hands/body are visibly implied

exactly 2:
  two-person
  two-person-wide
  two-person-balanced
  two-person-offset
  two-person-over-shoulder

exactly 3:
  three-person
```

If story wants an object-only detail, planner must set people contract to zero for THAT visual beat.

Do not make validator lie just to preserve a scale/silhouette choice.

---

# 6. QUALITY BLOCKER — PRIMARY SCALE CHOOSER STILL MECHANICALLY ALTERNATES

Modulo logic is removed, which is good.

But `choosePlannerScale()` still has mechanical rhythm behavior such as:

```js
interaction:
  previousScale === 'MEDIUM'
    ? 'WIDE'
    : 'MEDIUM'
```

and fallback:

```js
if previousScale === MEDIUM:
  DETAIL or CLOSE

if previousScale === DETAIL/CLOSE:
  MEDIUM
```

That still chooses scale from previous scale before genuine story need.

The reference rule is:

```text
SEMANTIC INTENT FIRST
ANTI-MONOTONY SECOND
```

## Required change

`choosePlannerScale()` should primarily use:

```text
storyRole
visualVerb
semanticIntent/text
people contract
environment/action/emotion/object meaning
```

Examples:

```text
physical object / hand action → DETAIL
human exchange → MEDIUM
emotional reaction → CLOSE
environment / arrival / spatial orientation → WIDE
release / breathing room → RELEASE
default → MEDIUM
```

Do NOT alternate based on `previousScale`.

Only:

```js
repairScaleMonotony(...)
```

may inspect previous scale to prevent the THIRD repetitive shot.

---

# 7. BLOCKER — IMAGE LIKENESS POLICY STILL CONTRADICTS LOCKED HAY & ĐẸP. POLICY

Current actual image prompt still says:

```text
Use same recurring identities
```

and memory negatives still include:

```text
Do not invent different faces or family
```

while another line says:

```text
Cross-shot character likeness is not required
```

These instructions conflict.

Locked policy:

```text
Cross-shot character likeness consistency is NOT required.

Each image only needs:
- correct semantic action;
- exact people count;
- clean anatomy;
- clean 2D cartoon/editorial style;
- no pseudo-text / logos / watermark pollution.
```

## Fix

Remove all hard likeness continuity language.

Keep role semantics:

```text
speaker
listener
mother
father
child
```

and world/style continuity.

Allowed phrasing:

```text
Use the requested character roles.
Exact facial likeness across different generated images is NOT required.
Do not add extra people.
```

For memory shots, do NOT say:

```text
Do not invent different faces
```

---

# 8. PROMPT QUALITY — REMOVE PHOTOGRAPHIC LANGUAGE FROM ACTUAL IMAGE PROMPT

Actual `human-insight-image.mjs` uses:

```text
Macro detail insert ... shallow depth of field
```

while the style lock says illustrated / non-photorealistic.

Replace photographic terms with illustration-native language:

```text
Detail insert with strong focal separation,
simplified secondary background,
clear tactile object hierarchy.
```

Do not use:
- shallow depth of field;
- camera;
- lens;
- photographic lighting.

---

# 9. HOLD EXCEPTION TEST IS STILL STALE

Actual test currently checks anti-monotony only when:

```ts
if (!beats[i].holdException) {
  ...
}
```

This preserves the exact bypass that the last prompt asked to remove.

Fix test:

```ts
for every beat, regardless of holdException:
  no 3 same scales
  no 3 same silhouettes
```

Hold exception affects ONLY duration validation.

---

# 10. BLOCKER — REQUIRED BRIDGE TESTS WERE NOT ACTUALLY ADDED

The current `production-pipeline-reference-grammar.test.ts` is still the old 18-test integration suite.

It does NOT prove the new requirements:
- original/canonical segment coverage;
- `continuedInSegments` spec projection;
- no orphan spec scene;
- renderer lower-case scale;
- people/silhouette compatibility;
- real image prompt people min/max;
- real document/timer safety;
- no likeness continuity requirement;
- single-source runtime wrapper;
- fake asset spec bridge.

Add focused tests now.

At minimum:

1. cross-segment merged beat covers every listed segment in spec;
2. same merged beat uses same resolved asset in all covered segments;
3. no non-outro scene receives empty image path;
4. canonical source start/end remain original;
5. visual window may separately cover silence;
6. WIDE -> wide;
7. MEDIUM -> medium;
8. CLOSE -> close;
9. DETAIL -> detail;
10. RELEASE -> wide;
11. SYMBOLIC deterministic mapping;
12. every spec `shotScale` is lower-case supported renderer value;
13. exact people min/max reaches real image prompt;
14. two-person contract rejects single/object-only silhouettes;
15. zero-person contract accepts object/tabletop;
16. anti-monotony repair never violates people contract;
17. holdException never bypasses anti-monotony;
18. no previousScale mechanical alternation in primary semantic scale selection;
19. no hard video005 production special case;
20. document safety exists in REAL generated prompt;
21. timer safety exists in REAL generated prompt;
22. no `"Use same recurring identities"` in production prompt;
23. no `"Do not invent different faces"` in production prompt;
24. `.ts` wrappers do not duplicate runtime implementations;
25. TypeScript shot silhouette union covers runtime variants;
26. fake asset resolver story-plan → spec bridge succeeds;
27. fixtures 001/005/007/013/028 have:
    - 0 orphan visual scenes
    - 0 empty asset paths
    - 0 unsupported renderer scales
    - 0 people/silhouette contradictions.

Run full repository tests.

If TypeScript project supports:

```bash
npx tsc --noEmit
```

also run it.

---

# 11. REAL SPEC-BRIDGE FIXTURE OUTPUT

Offline only.

For:

```text
001
005
007
013
028
```

produce a machine-readable matrix:

```json
{
  "video": "005",
  "canonicalSegments": 0,
  "plannedBeats": 0,
  "crossSegmentContinuations": 0,
  "orphanScenes": 0,
  "emptyImagePaths": 0,
  "unsupportedRendererScales": 0,
  "peopleSilhouetteContradictions": 0,
  "productionReady": false
}
```

Video005 may remain brand-blocked if actual current audio really contains Nếp.

Do not inject a fake Video005 transcript from production code.

---

# 12. CLEAN PATCH OWNERSHIP

Do not include files changed only as side effects of a dry run unless their source code really changed.

In particular review:

```text
src/Root.tsx
src/VideoContent.tsx
```

The batch engine mutates slug/duration/spec import during a normal run.

If these files are only dirty because a dry run/render changed default values, do not treat those runtime values as a conceptual bridge fix.

Keep only intentional reusable code modifications.

---

# 13. ZERO EXTERNAL CALLS

This pass:

```text
0 Cloudflare
0 Schnell
0 TTS
0 STT
0 Remotion render
```

Use fake offline asset resolver.

---

# 14. FINAL REPORT — SOURCE TRUTH ONLY

Return:

## A. Cross-Segment Continuation
Show actual code that projects one merged beat into every covered canonical segment.

## B. Canonical vs Visual Segment Bounds
Show both domains.

## C. Single Source of Truth
Show `.ts` wrappers re-export runtime rather than duplicate it.

## D. Scale Bridge
Planner uppercase + renderer lower-case.

## E. People Contract → Image Prompt
Show min/max travels through batch engine to real image prompt.

## F. Silhouette Integrity
Show exact compatibility rules.

## G. Semantic Scale Choice
Confirm primary chooser no longer alternates based on previous scale.

## H. Identity Policy
Confirm no facial-likeness consistency language remains.

## I. Actual Test Additions
List NEW tests added in this pass, not old total only.

## J. 5-Fixture Spec Bridge Matrix
Show zeros for orphan/empty/unsupported/contradiction.

## K. Full Tests / Typecheck
Exact results.

## L. External Calls
0.

## M. Verdict

Exactly one:

```text
HAY & ĐẸP. FINAL PRODUCTION BRIDGE — READY FOR IMAGE GENERATION
```

or

```text
HAY & ĐẸP. FINAL PRODUCTION BRIDGE — FAIL
```

Then STOP.

Do NOT generate images yet.
