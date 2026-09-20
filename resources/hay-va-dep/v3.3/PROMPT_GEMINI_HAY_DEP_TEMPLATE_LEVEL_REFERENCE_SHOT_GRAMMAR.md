# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — TEMPLATE-LEVEL REFERENCE SHOT GRAMMAR INTEGRATION
# PHASE 1.2 — GENERALIZED STORY / SHOT PLANNER
# VIDEO005 IS ONLY THE ACCEPTANCE FIXTURE
# OFFLINE ONLY
# ZERO CLOUDFLARE CALLS
# DO NOT GENERATE IMAGES
# DO NOT RENDER FINAL VIDEO

---

# 0. CORE REQUIREMENT — READ THIS FIRST

The previous work is NOT acceptable if it only patches or hand-authors `video005`.

The goal of this task is:

```text
PUT THE REFERENCE-DERIVED SHOT GRAMMAR INTO
THE REUSABLE TEMPLATE / STORY PLANNER PIPELINE
```

so that:

```text
video005
video006
video007
future HAY & ĐẸP. videos
```

all automatically receive the same shot-planning rules.

`video005` is ONLY the first acceptance fixture used to prove that the template-level implementation works.

DO NOT hard-code:
- video005 title;
- video005 narration;
- video005 shot IDs;
- video005 timing;
- video005 semantic intents;
- video005 asset paths;
- video005 reuse decisions;

inside the reusable template implementation.

Any video-specific data must come from the canonical video spec / narration passed into the planner.

---

# 1. ARCHITECTURAL GOAL

Target reusable flow:

```text
Canonical video spec / narration
        ↓
human-insight/cinematic-light Story Planner
        ↓
Reference-Derived Shot Grammar
        ↓
Candidate semantic shot plan
        ↓
Template-level validation
        ↓
Reuse / New Image strategy
        ↓
Visual Beat / Scene spec generation
        ↓
Image generation later
        ↓
Remotion render later
```

The grammar must live in reusable template code, NOT in:

```text
scratch/reference-shot-grammar/video005/*
```

Those scratch files are evidence/output only.

The reusable source of truth must live under:

```text
src/templates/human-insight/cinematic-light/
```

or the actual production planner module used by that template.

---

# 2. CURRENT CODE THAT MUST BE INSPECTED

Inspect the REAL active production path before editing.

Known relevant files include:

```text
src/templates/human-insight/cinematic-light/referenceShotGrammar.ts
src/templates/human-insight/cinematic-light/referenceShotGrammar.test.ts
src/templates/human-insight/cinematic-light/index.ts
```

But these files alone are not enough.

You MUST locate the actual code that currently transforms:

```text
canonical narration / spec
→ scenes / visual beats / image intents
```

Search the repo for the real production planner.

Likely concepts/names may include:

```text
storyPlanner
scenePlanner
visualPlanner
visualRhythm
semanticBeat
visualBeat
buildSpec
generateSpec
human-insight
cinematic-light
```

Do NOT invent a new disconnected planner if one already exists.

---

# 3. SUCCESS CONDITION

PASS is allowed only if the reusable production planner path actually calls the shot-grammar layer.

The real template path must use something equivalent to:

```ts
const candidatePlan = buildCandidateShotPlan(input);

const grammarResult = applyReferenceShotGrammar(
  candidatePlan,
  input
);

const validation = validateShotPlan(grammarResult.shots);

if (!validation.ok) {
  // deterministic revision / fallback / fail-fast
}

const metrics = buildShotGrammarMetrics(
  grammarResult.shots
);

return buildTemplateScenes(grammarResult);
```

The exact API can differ.

What matters is:

```text
future videos using this template inherit the grammar automatically
```

---

# 4. VIDEO005 MUST NOT BE HAND-AUTHORED IN TEMPLATE CODE

Forbidden:

```ts
if (slug.includes('muoi-phut-reset')) {
  return VIDEO005_PLAN;
}
```

Forbidden:

```ts
const shot01 = ...
const shot02 = ...
const shot03 = ...
```

inside reusable planner code.

Forbidden:

```text
hard-coded 20-shot plan
hard-coded 19-shot plan
hard-coded narration clause mapping
hard-coded video005 reuse assets
```

Allowed:

```text
video005-specific expected output in tests/fixtures
```

because it is an acceptance fixture.

---

# 5. GENERALIZED TEMPLATE TYPES

Keep or improve the reusable types.

Example:

```ts
export type ShotScale =
  | 'WIDE'
  | 'MEDIUM'
  | 'CLOSE'
  | 'DETAIL'
  | 'SYMBOLIC'
  | 'RELEASE';

export type ShotSilhouette =
  | 'single-centered'
  | 'single-left'
  | 'single-right'
  | 'two-person'
  | 'three-person'
  | 'tabletop-topdown'
  | 'object-detail'
  | 'room-wide'
  | 'empty-space'
  | 'hands-detail'
  | 'face-close';

export type ShotStoryRole =
  | 'hook'
  | 'establish'
  | 'context'
  | 'action'
  | 'interaction'
  | 'detail'
  | 'reflection'
  | 'memory'
  | 'release'
  | 'question'
  | 'outro';

export interface PlannedShot {
  id: string;

  startFrame: number;
  endFrame: number;
  durationFrames: number;

  scale: ShotScale;
  silhouette: ShotSilhouette;
  storyRole: ShotStoryRole;

  visualVerb: string;
  semanticIntent: string;

  peopleContract: {
    min: number;
    max: number;
  };

  assetStrategy:
    | 'REUSE_FULL'
    | 'REUSE_CROP'
    | 'NEW_IMAGE'
    | 'COMPONENT';

  sourceAsset?: string;

  cropIntent?: {
    kind: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'DETAIL';
    focalPoint?: { x: number; y: number };
    cropScale?: number;
  };

  composition:
    | 'portrait-focus'
    | 'editorial-left'
    | 'editorial-right'
    | 'detail-insert'
    | 'paper';

  motionProfile: string;

  referenceReason: string;

  exceptionReason?: string;
}
```

Do not make these types video-specific.

---

# 6. TEMPLATE-LEVEL GRAMMAR RULES

Central reusable contract:

```ts
export const REFERENCE_SHOT_GRAMMAR = {
  targetChangesPerMinute: {
    min: 18,
    max: 22,
  },

  holdSeconds: {
    detail: { min: 1.5, max: 2.8 },
    close: { min: 2.0, max: 3.2 },
    medium: { min: 2.2, max: 3.5 },
    wide: { min: 2.5, max: 4.0 },
    release: { min: 2.5, max: 4.0 },
  },

  maxConsecutiveSameScale: 2,
  maxConsecutiveSameSilhouette: 2,

  hookPatterns: [
    ['DETAIL', 'WIDE'],
    ['CLOSE', 'WIDE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
  ],

  preferredProgressions: [
    ['WIDE', 'MEDIUM', 'DETAIL', 'MEDIUM', 'CLOSE', 'RELEASE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
    ['CLOSE', 'DETAIL', 'RELEASE'],
  ],
} as const;
```

These are reusable heuristics.

Do NOT force every video into the exact same pattern.

---

# 7. EVERY NARRATIVE BEAT NEEDS A VISUAL STRATEGY

Template planner must derive for each narration clause:

```text
ACTION
or
SYMBOLIC / EMOTIONAL / ENVIRONMENTAL
```

Use:

```ts
export type VisualStrategy =
  | {
      kind: 'ACTION';
      visualVerb: string;
    }
  | {
      kind: 'SYMBOLIC_OR_EMOTIONAL';
      visualVerb: string;
    };
```

Heuristic detection can help:

```ts
const ACTION_HINTS = [
  'đặt',
  'gấp',
  'gập',
  'lau',
  'rót',
  'mở',
  'đóng',
  'cất',
  'mang',
  'ngồi',
  'đứng',
  'nhìn',
  'chạm',
  'xếp',
  'dừng',
  'tựa',
  'dọn',
  'đưa',
  'thở',
  'rời',
] as const;
```

But the planner must not reduce storytelling to keyword matching.

Use narration meaning + role + neighboring beats.

---

# 8. GENERALIZED CLAUSE SPLITTING

Long narration clauses may produce multiple visual beats.

Implement this generically.

Example rules:

```text
if clause <= ~3.5s:
  usually 1 visual shot

if clause ~3.5–5.0s:
  1 or 2 shots depending on semantic density

if clause > ~5.0s:
  strongly consider 2 semantic shots
```

Do NOT split merely by duration.

A clause should be split when it naturally contains:

```text
action + consequence
problem + reaction
object + human response
instruction + result
abstract claim + visual metaphor
```

The actual function may look like:

```ts
function shouldSplitClause(
  clause: NarrativeClause,
  context: PlannerContext
): boolean {
  // semantic density first
  // duration second
}
```

---

# 9. GENERALIZED HOOK PLANNER

The first ~3 seconds should not always be a generic wide.

Reusable hook selection:

```ts
export function chooseHookPattern(
  openingClause: NarrativeClause,
  context: PlannerContext
) {
  // choose among:
  // DETAIL -> WIDE
  // CLOSE -> WIDE
  // ACTION -> REACTION
  // OBJECT -> HUMAN CONTEXT
}
```

Use semantic content.

Example logic:

```text
concrete object/action available
→ DETAIL / ACTION first

emotion-heavy opening
→ CLOSE first

spatial/problem opening
→ WIDE may still be correct
```

No video-specific conditionals.

---

# 10. GENERALIZED SCALE / SILHOUETTE PLANNING

The planner should choose scale based on story need,
then repair monotony if needed.

Preferred decision order:

```text
semantic intent
→ story role
→ visual verb
→ shot scale
→ silhouette
→ anti-repetition adjustment
```

NOT:

```text
alternate scale every shot
```

Example:

```ts
function chooseShotScale(input: {
  strategy: VisualStrategy;
  storyRole: ShotStoryRole;
  previousShots: PlannedShot[];
  clauseDurationFrames: number;
}): ShotScale {
  // semantic rules first
}
```

Then:

```ts
function repairScaleMonotony(
  candidate: PlannedShot,
  previousShots: PlannedShot[]
): PlannedShot {
  // only adjust when 3rd same scale/silhouette would occur
}
```

Do NOT game the metric by changing every shot scale.

---

# 11. GENERALIZED REUSE DECISION MUST USE SEMANTIC COMPATIBILITY

This is CRITICAL.

Current Phase 1 over-reused some source images.

Implement a reusable semantic reuse contract.

Example:

```ts
export type ReuseSemanticMatch =
  | 'EXACT'
  | 'ACCEPTABLE'
  | 'MISMATCH';

export interface ReuseCandidateEvaluation {
  sourceAsset: string;
  semanticMatch: ReuseSemanticMatch;

  canUseFull: boolean;
  canUseCrop: boolean;

  reason: string;
}
```

Decision:

```ts
function resolveAssetStrategy(
  shot: PlannedShotDraft,
  approvedAssets: ApprovedAsset[]
): AssetStrategyResolution {
  // semantic fidelity > reuse efficiency
}
```

Core rule:

```text
semantic fidelity
> narrative rhythm
> scale/silhouette diversity
> reuse efficiency
```

NEVER keep a reuse just to reach 50%.

---

# 12. TEMPLATE-LEVEL REUSE MATCHING

Each approved asset available to the planner should expose metadata.

Example:

```ts
export interface ApprovedVisualAsset {
  path: string;

  peopleCount: number;

  sceneMeaning: string;
  visualAction?: string;

  supportedScales?: ShotScale[];

  supportedCropTargets?: Array<{
    kind: 'MEDIUM' | 'CLOSE' | 'DETAIL';
    semanticMeaning: string;
    focalPoint?: {
      x: number;
      y: number;
    };
  }>;

  qaStatus: 'PASS';
}
```

Do NOT infer reuse solely from filename.

A `REUSE_CROP` must be semantically possible from actual source metadata/inspection.

---

# 13. TEMPLATE-LEVEL VALIDATION

Upgrade `validateShotPlan()`.

Required checks:

```text
missing visual verb
missing semantic intent
hold > 4s without exception
3 consecutive same scale
3 consecutive same silhouette
cadence outside configured min/max
timeline gaps
timeline overlaps
invalid duration
invalid people contract
```

Suggested:

```ts
export interface ShotPlanValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
  metrics: ShotGrammarMetrics;
}
```

Example:

```ts
export function validateShotPlan(
  shots: PlannedShot[]
): ShotPlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // structural checks

  const metrics = buildShotGrammarMetrics(shots);

  if (
    metrics.changesPerMinute <
      REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.min ||
    metrics.changesPerMinute >
      REFERENCE_SHOT_GRAMMAR.targetChangesPerMinute.max
  ) {
    errors.push(
      `cadence out of range: ${metrics.changesPerMinute}`
    );
  }

  // recommended hold ranges -> warning only

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics,
  };
}
```

---

# 14. RECOMMENDED HOLD RANGES ARE WARNINGS, NOT HARD RULES

Example:

```ts
function addHoldWarnings(
  shot: PlannedShot,
  warnings: string[]
) {
  const seconds = shot.durationFrames / 30;

  const range =
    shot.scale === 'DETAIL'
      ? REFERENCE_SHOT_GRAMMAR.holdSeconds.detail
      : shot.scale === 'CLOSE'
      ? REFERENCE_SHOT_GRAMMAR.holdSeconds.close
      : shot.scale === 'MEDIUM'
      ? REFERENCE_SHOT_GRAMMAR.holdSeconds.medium
      : shot.scale === 'WIDE'
      ? REFERENCE_SHOT_GRAMMAR.holdSeconds.wide
      : shot.scale === 'RELEASE'
      ? REFERENCE_SHOT_GRAMMAR.holdSeconds.release
      : null;

  if (!range) return;

  if (seconds < range.min || seconds > range.max) {
    warnings.push(
      `${shot.id}: ${seconds.toFixed(2)}s outside recommended ${shot.scale} range`
    );
  }
}
```

A 1.37s MEDIUM shot may be acceptable as a deliberate micro-cut.

---

# 15. TEMPLATE-LEVEL CADENCE REPAIR

Do not just fail when cadence is 22.9.

Provide reusable deterministic repair logic.

Example conceptual flow:

```ts
function normalizeCadence(
  shots: PlannedShot[],
  context: PlannerContext
): PlannedShot[] {
  // If too fast:
  // merge semantically redundant adjacent shots
  // never merge unrelated ideas

  // If too slow:
  // split semantically dense long clauses
  // never split for timer alone
}
```

For every merge/split:

```text
semantic reason is mandatory
```

Do NOT build a generic “remove every nth shot” algorithm.

---

# 16. BRAND MUST COME FROM TEMPLATE / VIDEO CONFIG

Never hard-code:

```text
NẾP.
```

or:

```text
HAY & ĐẸP.
```

inside shot grammar.

Use current video/template branding input.

Example:

```ts
export interface PlannerBrandContext {
  brandName: string;
  slogan?: string;
  outroComponentId?: string;
}
```

Then:

```ts
buildOutroShot(brandContext)
```

If canonical audio contains a different legacy brand than the visual brand:

```text
BRAND_AUDIO_MISMATCH
```

Planner should surface this as validation/audit output.

Do not silently overwrite spoken audio.

---

# 17. PROMPT AUTHORING MUST ALSO BE TEMPLATE-LEVEL

Create reusable prompt helpers.

Example:

```ts
export function buildImagePromptForShot(
  shot: PlannedShot,
  style: VisualStyleContext
): string {
  // general reusable prompt builder
}
```

Shared hard exclusions:

```text
no photorealism
no 3D render
no readable text
no labels
no signatures
no watermark marks
no accidental extra people
no malformed anatomy
```

Special semantic helpers:

```ts
if shot.scale === 'DETAIL':
  emphasize clean object geometry

if shot.peopleContract.max === 0:
  explicit zero people/body parts

if shot visual intent involves paper:
  request blank/unprinted paper

if shot involves timer:
  no readable numerals or brands
```

Do not author all prompts manually in video005 plan.

---

# 18. TIMER SAFETY RULE — REUSABLE

For any timer/clock visual:

Avoid:

```text
readable 10
readable numbers
brand logo
complex dial text
```

Prefer:

```text
minimal mechanical timer
simple colored wedge / indicator
no numerals
no letters
no brand marks
```

This is a reusable template prompt rule.

---

# 19. PAPER / DOCUMENT SAFETY RULE — REUSABLE

For mail/receipts/documents:

Avoid:

```text
receipts
printed mail
forms
calendar labels
notes with writing
```

Prefer:

```text
blank paper slips
unprinted paper pieces
plain notebook
blank card
simple geometric blocks
```

This reduces pseudo-text across all future videos.

---

# 20. ACTUAL TEMPLATE INTEGRATION TEST

You MUST prove the grammar is called by the real template planner.

Add an integration test using at least TWO fixtures:

```text
video005
+
one second unrelated HAY & ĐẸP. video
```

The second fixture may be:

```text
video007
video013
video028
```

No images generated.

The test should prove:

```text
same reusable planner
different narration
different shot plan
same grammar constraints
```

Example expected assertions:

```ts
const planA = planHumanInsightVideo(video005Spec);
const planB = planHumanInsightVideo(video013Spec);

expect(planA.shots).not.toEqual(planB.shots);

expect(validateShotPlan(planA.shots).ok).toBe(true);
expect(validateShotPlan(planB.shots).ok).toBe(true);

expect(planA.grammarVersion)
  .toBe('reference-shot-grammar-v1');

expect(planB.grammarVersion)
  .toBe('reference-shot-grammar-v1');
```

Adapt to actual APIs.

This test is mandatory.

---

# 21. VIDEO005 ACCEPTANCE FIXTURE

After template integration is complete,
run the REAL planner on video005.

Do NOT manually edit the result afterward.

Generate outputs:

```text
scratch/reference-shot-grammar/video005/
  shot-plan.json
  shot-plan.md
  shot-grammar-metrics.json
  shot-grammar-audit.md
  reuse-audit.json
  reuse-audit.md
  brand-audit.md
  storyboard.jpg
  shot-transition-strip.jpg
```

These files must be generated from the reusable planner output.

---

# 22. SECOND GENERALIZATION FIXTURE

Also run planner only for ONE second video.

Recommended:

```text
video013
```

Create only:

```text
scratch/reference-shot-grammar/video013/
  shot-plan.json
  shot-grammar-metrics.json
  shot-grammar-audit.md
```

No storyboard required unless cheap.

Purpose:

```text
prove template generalization
```

No image generation.

---

# 23. CORRECT VIDEO005 REUSE AUDIT

Reinspect every reused source.

Mandatory attention:

```text
shot-08
shot-09
shot-16
shot-18
```

If actual source asset cannot truthfully represent the planned semantic:

```text
NEW_IMAGE
```

Do not preserve reuse ratio.

---

# 24. CADENCE TARGET

For video005:

```text
18–22 changes/min
```

Current old plan at 22.9 is outside configured range.

Let the TEMPLATE planner normalize it semantically.

Likely healthy result:

```text
~19 shots
~21.7 changes/min
```

but do NOT force 19 shots.

Story meaning wins.

---

# 25. DO NOT FORCE SCALE CHANGE EVERY CUT

The old transition strip reached:

```text
max consecutive same scale = 1
```

That can indicate metric gaming.

The template rule is:

```text
max 2 same scale
```

Two consecutive MEDIUM shots are allowed if:
- different semantic intent;
- different silhouette/action;
- story continuity is better.

Do not alternate scales mechanically.

---

# 26. TEMPLATE OUTPUT METADATA

Every generated plan should include reusable metadata:

```ts
{
  grammarVersion: 'reference-shot-grammar-v1',
  plannerVersion: 'cinematic-light-story-planner-vX',
  generatedByTemplate: true,
  sourceSlug: '...',
  metrics: {...},
  validation: {...}
}
```

This lets future production runs prove the shot plan came from the template.

---

# 27. FILE OWNERSHIP RULE

Reusable logic belongs in:

```text
src/templates/human-insight/cinematic-light/
```

or actual shared production planner modules.

Video-specific generated evidence belongs in:

```text
scratch/reference-shot-grammar/<videoKey>/
```

DO NOT put reusable algorithm logic under `scratch/`.

DO NOT edit individual video source files just to make the fixture pass,
unless there is a real canonical-content bug that must be separately reported.

---

# 28. NO IMAGE GENERATION IN THIS TASK

Strictly:

```text
0 Cloudflare calls
0 Schnell calls
0 new images
0 final MP4 renders
```

We are validating planner generalization only.

---

# 29. REQUIRED TESTS

At minimum add:

1. 3 same scales rejected;
2. 3 same silhouettes rejected;
3. cadence above max rejected;
4. cadence below min rejected;
5. recommended hold range produces warning;
6. >4s hold without exception rejected;
7. visual verb/strategy required;
8. timeline gap/overlap rejected;
9. semantic reuse mismatch cannot become REUSE_FULL/CROP;
10. brand mismatch surfaced;
11. image prompt builder applies document text-safety;
12. image prompt builder applies timer no-numeral safety;
13. REAL planner path applies grammar for video005;
14. REAL planner path applies same grammar for a second unrelated video;
15. both fixtures produce different semantic plans but same grammar version.

Run full repo test suite.

---

# 30. HUMAN REVIEW ARTIFACT

For video005 rebuild:

```text
storyboard.jpg
shot-transition-strip.jpg
```

Storyboard must clearly label:

```text
shot id
time
scale
silhouette
role
visual verb
semantic intent
asset strategy
```

If `NEW_IMAGE`:
show a placeholder / prompt preview.

If `REUSE_*`:
show the actual reused asset/crop.

Do not display a reused source if it does not match semantics.

---

# 31. ACCEPTANCE GATES

PASS only if ALL are true:

```text
grammar is wired into real reusable template planner
no video005 hard-coded planner logic
video005 plan is generated from template
second unrelated video plan is generated from same template
semantic reuse audit is truthful
cadence is inside configured range
scale diversity is not mechanically gamed
brand comes from configuration
legacy NẾP mismatch is surfaced if present
prompt text-risk rules are reusable
0 image generation calls
full tests pass
```

---

# 32. FINAL REPORT FORMAT

Return exactly in this order:

## A. Template Integration
Show:

```text
old production planner path
new production planner path
```

List actual reusable source files modified.

## B. Proof It Is Not Video-Specific
Show:
- no video005 conditions in template logic;
- video005 output;
- second fixture output;
- same grammarVersion.

## C. Generalized Grammar Rules
List implemented reusable rules.

## D. Video005 Result
Report:
```text
shot count
duration
changes/min
median hold
max hold
reuse count
new-image count
component count
```

## E. Video005 Reuse Audit
Especially:
```text
shot-08
shot-09
shot-16
shot-18
```

## F. Second Fixture Result
Show video key + metrics.

## G. Brand Audit
State canonical visual brand/audio truth.

## H. Prompt Safety
Confirm document/timer safety is template-level.

## I. Tests
Exact test count.

## J. Artifacts
Paths to video005 storyboard/strip and second fixture metrics.

## K. Verdict

Exactly one:

```text
HAY & ĐẸP. TEMPLATE-LEVEL REFERENCE SHOT GRAMMAR — READY FOR HUMAN REVIEW
```

or

```text
HAY & ĐẸP. TEMPLATE-LEVEL REFERENCE SHOT GRAMMAR — FAIL
```

Then STOP.

Do NOT generate images.
Do NOT render final video.
