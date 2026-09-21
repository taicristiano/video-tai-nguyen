# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REAL PRODUCTION PIPELINE FINAL SEMANTIC / RENDER BRIDGE FIX
# TEMPLATE-LEVEL ONLY
# OFFLINE ONLY
# ZERO CLOUDFLARE / SCHNELL CALLS
# ZERO IMAGE GENERATION
# ZERO REMOTION RENDER

## 0. WHY THIS PASS EXISTS

The real call-chain is now connected:

```text
batch-engine.mjs
→ human-insight-story-planner.mjs
→ referenceShotGrammarRuntime.mjs / storyPlannerRuntime.mjs
```

That part is real.

However source review of the actual changed ZIP found several production blockers that the current smoke test does NOT catch.

Do NOT generate images yet.

This pass must fix the reusable production pipeline, not video005 specifically.

After this pass, if all gates pass, the next step is to generate/render video005 using the normal production path.

---

# 1. BLOCKER A — SEGMENT INDEX / TIMING DRIFT

## Actual bug

`preProcessSegments()` merges short canonical timeline segments.

Later, `buildStoryPlan()` assigns:

```js
segmentIndex
```

based on the merged/preprocessed list.

But `scripts/batch-engine.mjs` later groups planned beats against the ORIGINAL canonical `segments`:

```js
const plannedBeats = storyPlan.beats.filter(
  (beat) => beat.segmentIndex === i
);
```

Therefore `segmentIndex` no longer refers to the same segment after preprocessing.

In the current video005 dry-run, many beats fall outside the frame range of their declared original segment, and the final original segment can have no matching beat at all.

This is a production blocker because visual beats can be clipped, shifted, duplicated, or replaced by fallback assets.

## Required invariant

For every final production beat:

```ts
beat.segmentIndex
```

MUST refer to the ORIGINAL canonical timeline segment consumed by `batch-engine.mjs`.

And:

```text
beat.startFrame >= originalSegmentStartFrame
beat.endFrame <= originalSegmentEndFrame
```

unless there is an explicit, supported cross-segment visual continuation model.

### Preferred fix

Do NOT merge original segment identity.

You may still preprocess text for semantic analysis, but preserve:

```ts
sourceSegmentIndex
sourceSegmentStartFrame
sourceSegmentEndFrame
```

and project every final beat back into the correct original timeline segment.

Cadence merging in production must NOT blindly merge beats from different original `segmentIndex` values.

Example rule:

```ts
if (a.segmentIndex !== b.segmentIndex) {
  doNotMerge();
}
```

If a production video remains above 22 CPM after same-segment merging:
- report a structural cadence error, OR
- implement a proven explicit visual-continuation mechanism.

Do NOT silently shift segment indices.

## Mandatory test

For video005 and video013:

```ts
for (const beat of plan.beats) {
  const seg = canonicalSegments[beat.segmentIndex];

  expect(beat.startFrame)
    .toBeGreaterThanOrEqual(round(seg.start * 30));

  expect(beat.endFrame)
    .toBeLessThanOrEqual(round(seg.end * 30));
}
```

Also ensure every original narrative segment has:
- at least one planned beat,
OR
- an explicit supported visual continuation mapping.

No orphan original segment.

---

# 2. BLOCKER B — PLANNER SCALE IS UPPERCASE, REAL RENDERER EXPECTS LOWERCASE

## Actual bug

Reference planner currently uses:

```text
WIDE
MEDIUM
CLOSE
DETAIL
SYMBOLIC
RELEASE
```

and production sets:

```js
shotScale: scale
```

But real renderer contract in:

```text
src/templates/human-insight/cinematic-light/tokens.ts
```

is:

```ts
type ShotScale = 'wide' | 'medium' | 'close' | 'detail';
```

`ImageScene.tsx` resolves:

```ts
SHOT_SCALE[shotScale]
```

with lowercase keys.

The real image generator also uses lowercase keys:

```js
scaleDescriptions = {
  wide,
  medium,
  close,
  detail
}
```

Therefore uppercase planner values fall back and the intended reference scale grammar is NOT actually reaching image prompt framing or render crop scale.

## Required architecture

Keep planner scale and renderer scale separate:

```ts
plannerScale: PlannerShotScale // uppercase semantic planner domain

shotScale: RendererShotScale   // lowercase renderer domain
```

or keep existing:

```ts
scale: 'WIDE' | ...
shotScale: 'wide' | ...
```

Add one reusable function:

```ts
export function mapPlannerScaleToRendererScale({
  scale,
  silhouette,
  role,
}): 'wide' | 'medium' | 'close' | 'detail'
```

Recommended baseline:

```text
WIDE      -> wide
MEDIUM    -> medium
CLOSE     -> close
DETAIL    -> detail
RELEASE   -> wide

SYMBOLIC:
  object-detail/tabletop-topdown -> detail
  otherwise -> medium
```

Production beats must contain BOTH:

```text
scale      = planner domain
shotScale  = renderer domain
```

`batch-engine.mjs` must pass lowercase `beat.shotScale`.

## Defensive image-generator fix

In `scripts/human-insight-image.mjs`, normalize input:

```js
const shotScale = String(
  scene.shotScale || fallback
).toLowerCase();
```

Do not let case mismatch silently degrade to medium.

## Mandatory tests

Prove:

```text
WIDE -> wide
MEDIUM -> medium
CLOSE -> close
DETAIL -> detail
RELEASE -> wide
```

And test actual generated spec/visual beat data uses only:

```text
wide | medium | close | detail
```

Never uppercase.

---

# 3. BLOCKER C — PEOPLE CONTRACT AND SILHOUETTE CONTRADICT EACH OTHER

## Actual bug

Current relationship video can produce:

```text
peopleContract = exactly 2
presentMembers = [speaker, listener]
silhouette = single-centered
```

This happens because anti-monotony repair changes repeated `two-person` silhouettes into `single-centered`.

That is semantically impossible.

Current people-contract construction also does:

```js
max: Math.max(presentMembers.length, 2)
```

so one explicit member can still permit two visible people.

## Required people contract

When `presentMembers` is explicit:

```ts
const n = presentMembers.length;

peopleContract = {
  min: n,
  max: n,
};
```

Exact means exact.

## Required silhouette compatibility validator

Add reusable:

```ts
isSilhouetteCompatibleWithPeopleContract(
  silhouette,
  peopleContract
)
```

Minimum invariants:

```text
single-centered / single-left / single-right / face-close
=> max <= 1

two-person variants
=> min <= 2 <= max

three-person
=> min <= 3 <= max

empty-space / object-detail / tabletop-topdown
=> max === 0

hands-detail
=> max <= 1
```

## Anti-monotony repair must be people-aware

Never repair:

```text
two-person -> single-centered
```

when exactly two people are required.

Add reusable multi-person visual variants if needed, for example:

```text
two-person-wide
two-person-balanced
two-person-offset
two-person-over-shoulder
```

These are planner silhouettes only; renderer composition can still map to supported composition presets.

Or use another generalized compatible representation.

The core requirement:

```text
anti-monotony may NEVER violate peopleContract
```

## Mandatory test

For every planned beat:

```ts
expect(
  isSilhouetteCompatibleWithPeopleContract(
    beat.silhouette,
    beat.peopleContract
  )
).toBe(true);
```

Run on all 5 representative fixture videos.

---

# 4. BLOCKER D — SCALE SELECTION STILL USES INDEX MODULO

## Actual bug

The current production planner contains behavior equivalent to:

```js
scale = idx % 3 === 0
  ? 'DETAIL'
  : idx % 2 === 0
  ? 'MEDIUM'
  : 'CLOSE';
```

for generic action/default cases.

That is exactly the mechanical alternation the reference-derived planner was supposed to remove.

Do NOT alternate shot scales based on index.

## Required semantic scale selection

Create reusable:

```ts
choosePlannerScale({
  storyRole,
  visualVerb,
  semanticIntent,
  peopleContract,
  presentMembers,
  previousShots,
})
```

Decision priority:

```text
semantic meaning
→ story role
→ physical action / object
→ people contract
→ previous visual rhythm
→ anti-monotony repair only if necessary
```

Examples:

```text
object / hand action
→ DETAIL

two-person active exchange
→ MEDIUM

emotion/reaction
→ CLOSE

environment / arrival / spatial context
→ WIDE

release / breathing room
→ RELEASE
```

Fallback may be MEDIUM.

Do NOT use `idx % N` for shot grammar.

Add source-level test ensuring reusable planner contains no index-modulo scale alternation.

---

# 5. BLOCKER E — HARD-CODED VIDEO005 FIXTURE IN REAL BATCH ENGINE

## Actual bug

`scripts/batch-engine.mjs` currently contains production code equivalent to:

```js
if (index === 5 || slug.includes('phan-5-')) {
  copy legacy 2026-09-17 timeline
}
```

This is acceptance-fixture logic inside the REAL production pipeline.

It can attach an unrelated stale timeline to a future/current Video 5.

Remove it completely from production code.

## Correct acceptance-fixture architecture

If the smoke test needs legacy `"Nếp"` transcript:

Use a generic optional test/dry-run override:

```ts
processVideo(video, {
  planOnly: true,
  plannerOverrides: {
    spokenAudioTranscript: 'Nếp, ...'
  }
});
```

or let the smoke/test script inject a fixture transcript directly.

No video index/slug special cases in:

```text
scripts/batch-engine.mjs
production planner
template runtime
```

Production brand audit should inspect:
- actual current canonical timeline / transcript;
- actual current planned audio text.

## Mandatory test

Search reusable/production code for fixture special casing:

```text
index === 5
video005
phan-5-
muoi-phut-reset
```

No acceptance-fixture conditionals allowed in production path.

---

# 6. BLOCKER F — PROMPT SAFETY HELPER IS NOT IN THE REAL IMAGE GENERATION PATH

## Actual bug

`referenceShotGrammarRuntime.mjs` contains useful reusable safety rules in:

```js
buildImagePromptForShot(...)
```

including:
- blank paper / document safety;
- timer no-numeral safety;
- people contract;
- no pseudo-text.

But real production image generation still goes through:

```text
batch-engine.mjs
→ resolveBeatAsset()
→ scripts/human-insight-image.mjs
```

and does not consume that planner prompt helper.

Therefore those safety rules currently do not protect real generated assets.

## Required fix

Do NOT duplicate a second full style prompt.

Preferred:
extract reusable targeted safety helper:

```ts
buildImageSafetyRulesForShot(shot)
```

from template runtime.

It should return additions such as:

```text
DOCUMENT SAFETY
TIMER SAFETY
ZERO PEOPLE / EXACT PEOPLE
TEXT POLLUTION EXCLUSIONS
```

Then make REAL:

```text
scripts/human-insight-image.mjs
```

consume those rules when building the final prompt.

You may pass required planner metadata from `batch-engine`:

```text
--visual-verb
--people-min
--people-max
--planner-scale
```

or construct a serializable planning payload.

Do not rely only on generic:

```text
NO TEXT, NO LOGO, NO WATERMARK
```

for document/timer scenes.

## Required document rule

```text
blank paper slips
unprinted pages
no letters
no forms
no calendar labels
no pseudo-text
```

## Required timer rule

```text
simple timer indicator
no numerals
no letters
no logo
```

Add tests on the actual `human-insight-image.mjs` prompt result.

---

# 7. IMAGE POLICY — DO NOT REINTRODUCE CHARACTER LIKENESS CONSISTENCY

Current HAY & ĐẸP. production image policy is:

```text
Clean 2D cartoon / editorial illustration.
Photorealism not required.
Cross-shot character likeness consistency is NOT required.
Each image must independently pass semantics, people count, anatomy, and text cleanliness.
```

Legacy image prompt currently says things like:

```text
Use same recurring identities
Do not invent different faces
```

Do NOT make exact likeness a generation requirement.

Preserve:
- role/member correctness;
- exact number of visible people;
- broad family/dialogue role semantics;
- world/environment continuity when useful.

But change prompt contract to something equivalent to:

```text
Character likeness consistency between images is NOT required.
Prioritize clean anatomy, exact visible people count, correct action and clean 2D illustration.
```

`castId` may remain for role semantics.

Do not spend retries trying to reproduce identical faces.

---

# 8. BLOCKER G — HOLD EXCEPTION MUST NOT BYPASS ANTI-MONOTONY

Current validator/repair condition exempts a shot from 3-consecutive scale/silhouette checks when it has a valid hold exception.

Hold exception is ONLY about duration.

It must not disable visual-rhythm rules.

Change:

```ts
3 same scale/silhouette
```

to be validated regardless of hold exception.

Typed hold exceptions only affect:

```text
>4s duration validation
```

Nothing else.

---

# 9. ASSET STRATEGY DOMAINS MUST NOT BE MISLEADING

Current production planner uses legacy values:

```text
library-or-generate
reuse-canonical
```

while reference grammar metrics expect:

```text
NEW_IMAGE
REUSE_FULL
REUSE_CROP
COMPONENT
```

This currently produces misleading smoke output like:

```text
0 new, 0 reused, 0 component
```

even though production will generate/select assets.

Do NOT conflate the two domains.

Use separate fields, for example:

```ts
assetResolutionMode:
  | 'LIBRARY_OR_GENERATE'
  | 'REUSE_CANONICAL'

assetStrategy:
  | 'NEW_IMAGE'
  | 'REUSE_FULL'
  | 'REUSE_CROP'
  | 'COMPONENT'
  | 'UNRESOLVED'
```

Or implement an equally clear model.

Smoke report must not claim counts it cannot know yet.

If actual image selection is deferred:

```text
assetStrategy = UNRESOLVED
```

is truthful.

---

# 10. TRUE OFFLINE SPEC-BRIDGE TEST

Current `--plan-only` returns BEFORE the real spec-building/image-resolution loop.

Therefore it does not prove that planner metadata survives into `spec.json`.

Add a pure/injectable spec-building path.

Preferred:

```ts
buildSpecFromStoryPlan({
  storyPlan,
  timeline,
  assetResolver
})
```

where test supplies:

```ts
assetResolver = fakeOfflineAssetResolver
```

No network.

This integration test must prove:

```text
planner scale
→ lowercase renderer shotScale
→ visualBeats
→ scene composition
→ motionPreset
```

and correct segment timing.

Do NOT generate images.

Required assertions:
- no beat disappears;
- no beat assigned to wrong canonical segment;
- visual beat frame ranges are valid;
- renderer `shotScale` only lower-case supported values;
- no blank/fallback caused by segment-index drift.

This is the final proof needed before spending image quota.

---

# 11. REQUIRED REAL FIXTURE CHECKS

Run the real production planner/spec bridge offline for:

```text
video001
video005
video007
video013
video028
```

Report for each:

```text
canonical segment count
planned beat count
orphan segments
out-of-segment beats
CPM
max hold
people/silhouette contradictions
unsupported renderer shotScale values
```

Required:

```text
orphan segments = 0
out-of-segment beats = 0
people/silhouette contradictions = 0
unsupported renderer shotScale = 0
```

---

# 12. TESTS

Add focused tests covering:

1. segmentIndex references original canonical segment;
2. no beat crosses its declared canonical segment boundary;
3. no canonical segment is orphaned;
4. cadence merge never merges different segmentIndex values;
5. planner WIDE maps to renderer `wide`;
6. planner MEDIUM -> `medium`;
7. CLOSE -> `close`;
8. DETAIL -> `detail`;
9. RELEASE -> `wide`;
10. SYMBOLIC maps deterministically to supported renderer scale;
11. image generator normalizes shot-scale case defensively;
12. exact `presentMembers` creates exact people contract;
13. silhouette always compatible with people contract;
14. anti-monotony repair never converts exact-two-person shot to single silhouette;
15. no index-modulo shot-scale alternation;
16. no video005 fixture special case in batch engine;
17. real image prompt contains document text-safety;
18. real image prompt contains timer no-numeral safety;
19. cross-shot character likeness is NOT required in image prompt;
20. holdException cannot bypass anti-monotony;
21. asset strategy smoke output is truthful;
22. offline fake-asset spec bridge preserves all visual beats;
23. video001 fixture passes invariants;
24. video005 fixture passes invariants;
25. video007 fixture passes invariants;
26. video013 fixture passes invariants;
27. video028 fixture passes invariants.

Run full repo tests.

---

# 13. ZERO EXTERNAL CALLS

This entire pass must make:

```text
0 Cloudflare calls
0 FLUX/Schnell calls
0 TTS calls
0 STT calls
0 Remotion renders
```

Use only local fixtures and fake asset resolver.

---

# 14. FINAL REPORT

Return exactly:

## A. Segment Alignment Fix
Show original segment invariant and fixture counts.

## B. Planner → Renderer Scale Bridge
Show uppercase planner scale + lowercase renderer shotScale mapping.

## C. People / Silhouette Integrity
Show zero contradictions across 5 fixtures.

## D. Semantic Scale Selection
Show index-modulo logic removed.

## E. Acceptance Fixture Isolation
Show video005 special timeline code removed from production.

## F. Real Image Prompt Safety
Show actual `human-insight-image.mjs` consumes reusable safety rules.

## G. Image Identity Policy
Confirm cross-shot likeness consistency is NOT required.

## H. Hold / Anti-Monotony Fix
Confirm hold exceptions only affect duration.

## I. Offline Spec-Bridge Proof
Show real story plan → fake assets → spec/visualBeats.

## J. Tests
Exact counts.

## K. External Calls
Must be 0.

## L. Verdict

Exactly one:

```text
HAY & ĐẸP. REAL PRODUCTION SHOT GRAMMAR BRIDGE — READY FOR GENERATION
```

or

```text
HAY & ĐẸP. REAL PRODUCTION SHOT GRAMMAR BRIDGE — FAIL
```

Then STOP.

Do NOT generate video005 images yet.
