# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REFERENCE-DERIVED SHOT GRAMMAR
# STORY / SHOT PLANNER UPGRADE
# FIRST REAL TEST: video005
# NO IMAGE-MODEL RESEARCH
# MODEL POLICY REMAINS LOCKED: @cf/black-forest-labs/flux-1-schnell ONLY

---

# 0. PURPOSE

Typography + watermark are now accepted and LOCKED.

Do NOT reopen:
- title size / subtitle size;
- watermark placement / opacity / size;
- V1.1 motion calibration;
- V1.2 centered artwork geometry;
- image-model choice;
- image style;
- cross-shot identity consistency.

The next missing layer is the actual STORY / SHOT LANGUAGE.

The high-view reference videos were not successful merely because of:
- zoom;
- pan;
- hard cuts;
- clean typography.

Their stronger retention grammar comes from meaningful visual progression:

```text
visual idea
→ action
→ detail
→ emotion
→ release
```

The current HAY & ĐẸP. pipeline still tends to create too many shots like:

```text
one person sitting
→ another medium person shot
→ another medium person shot
```

even when motion exists.

This task upgrades the Story / Shot Planner into a:

```text
REFERENCE-DERIVED SHOT GRAMMAR
```

Then validates it on:

```text
video005
Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần
```

This is NOT a new visual-style research phase.

---

# 1. AUTHORITATIVE REFERENCES

Read and use:

```text
resources/video-references/
resources/video-references/_analysis/HAY_DEP_REFERENCE_MASTER_REPORT.md
docs/HAY_DEP_VISUAL_V3_REFERENCE_DERIVED.md
docs/HAY_DEP_PRODUCTION_LOCK.md
docs/HAY_DEP_PRODUCTION_LOCK.json
```

Also inspect the current v1.2.1 implementation so the planner fits the real production renderer.

Do NOT assume old planner behavior is correct.

---

# 2. LOCKED PRODUCTION BASELINE

Keep:

```text
IMAGE MODEL
@cf/black-forest-labs/flux-1-schnell ONLY

STYLE
clean 2D cartoon / illustrated editorial
non-photorealistic
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber

IDENTITY
cross-shot likeness consistency NOT REQUIRED

FRAMING
outer artwork window centered
editorial-left/right = internal crop bias only

MOTION
V1.1 calm perceived motion
AMBIENT_STILL for long narrative holds
no bounce / spring / rotation

TYPOGRAPHY
use accepted V1.2.1 baseline

WATERMARK
use accepted V1.2.1 baseline

CUT STYLE
hard cuts
```

Do NOT change any of those in this task.

---

# 3. WHAT TO LEARN FROM THE HIGH-VIEW REFERENCES

Translate the reference set into planner rules.

The planner should actively produce:

```text
WIDE
→ MEDIUM
→ DETAIL
→ CLOSE
→ RELEASE
```

where semantically justified.

The planner should favor:
- concrete physical action;
- object detail;
- emotional close-up;
- environmental release;
- symbolic detail when narration is abstract;
- meaningful change every ~2.5–3.5s on average;
- hard cuts;
- varied composition silhouettes.

The planner should avoid:
- 3 medium character shots in a row;
- repeating same silhouette with different narration;
- using camera motion as a substitute for weak shot planning;
- scene changes that happen only because a timer says so;
- abstract “person thinking” images when a physical visual verb exists.

---

# 4. NEW CORE RULE: EVERY NARRATIVE BEAT NEEDS A VISUAL VERB

Before creating a shot, derive:

```text
VISUAL_VERB
```

Examples:

```text
đặt xuống
gấp lại
lau
rót
ngồi xuống
đứng dậy
cất
mở
đóng
nhìn
chạm
xếp
mang
rời đi
dừng lại
thở
tựa lưng
đẩy sang bên
```

If narration has no physical verb, derive one of:

```text
SYMBOLIC_DETAIL
ENVIRONMENTAL_STATE
EMOTIONAL_REACTION
```

Examples:

```text
a half-finished cup
folded blanket
empty chair
soft light on desk
phone face-down
clean tabletop
open window
bag by chair
lamp switched off
```

A planner output such as:

```text
person thinking at desk
```

is NOT enough unless the narration genuinely calls for a static reflective beat.

---

# 5. SHOT SCALE GRAMMAR

Every shot must declare one:

```ts
type ShotScale =
  | 'WIDE'
  | 'MEDIUM'
  | 'CLOSE'
  | 'DETAIL'
  | 'SYMBOLIC'
  | 'RELEASE';
```

Definitions:

```text
WIDE
environment + person / spatial context

MEDIUM
person + clear action

CLOSE
face / hands / emotional reaction

DETAIL
specific object / physical action / meaningful insert

SYMBOLIC
object or environment carrying abstract meaning

RELEASE
wider calming frame after a tighter/emotional sequence
```

---

# 6. SILHOUETTE DIVERSITY RULE

No more than TWO consecutive shots may share the same macro silhouette.

Define silhouette separately from scale.

Suggested type:

```ts
type ShotSilhouette =
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
```

Hard planner rule:

```ts
function hasSilhouetteViolation(shots: PlannedShot[]) {
  for (let i = 2; i < shots.length; i++) {
    const a = shots[i - 2].silhouette;
    const b = shots[i - 1].silhouette;
    const c = shots[i].silhouette;

    if (a === b && b === c) return true;
  }
  return false;
}
```

Do NOT simply alternate left/right medium portraits to game this rule.
The visual idea must genuinely differ.

---

# 7. SCALE DIVERSITY RULE

Avoid more than 2 consecutive shots with the same scale.

Example validation:

```ts
function hasScaleViolation(shots: PlannedShot[]) {
  for (let i = 2; i < shots.length; i++) {
    const a = shots[i - 2].scale;
    const b = shots[i - 1].scale;
    const c = shots[i].scale;

    if (a === b && b === c) return true;
  }
  return false;
}
```

Preferred local pattern:

```text
WIDE
→ MEDIUM
→ DETAIL
→ MEDIUM
→ CLOSE
→ RELEASE
```

Not mandatory globally, but the planner should create visible rhythm.

---

# 8. SHOT DURATION GRAMMAR

Do NOT mechanically cut every N seconds.

Target reference-like behavior:

```text
typical hold: 2.3–3.5s
detail insert: 1.5–2.8s
emotional close: 2.0–3.2s
wide/release: 2.5–4.0s
```

Avoid:
```text
near-static narrative shot > 4.0s
```

unless narration truly needs stillness.

Planner target:

```text
~18–22 meaningful visual changes / minute
```

This is a rhythm target, not a timer.

---

# 9. HOOK GRAMMAR

The first ~3 seconds should visually earn attention.

Do NOT default to a generic wide shot every time.

For each video, planner must choose one of:

```text
DETAIL -> WIDE
CLOSE -> WIDE
ACTION -> REACTION
OBJECT -> HUMAN CONTEXT
```

For video005, inspect the actual narration and choose a hook that clearly represents:
- end-of-day fatigue;
- clutter;
- reset ritual;
- before/after contrast.

Example candidate grammar:

```text
DETAIL:
messy desk / dropped keys / mug

→ MEDIUM:
adult arriving home, visibly tired

→ WIDE:
untidy room
```

Only use if it matches the canonical narration.

---

# 10. SEMANTIC SHOT CHAIN

Each narration section should produce a chain like:

```ts
type SemanticShotChain = {
  narrationClause: string;
  visualVerb: string;
  emotionalIntent: string;

  shots: PlannedShot[];
};
```

Each `PlannedShot` should include:

```ts
type PlannedShot = {
  id: string;

  startFrame: number;
  endFrame: number;
  durationFrames: number;

  scale: ShotScale;
  silhouette: ShotSilhouette;

  storyRole:
    | 'hook'
    | 'establish'
    | 'action'
    | 'interaction'
    | 'detail'
    | 'reflection'
    | 'memory'
    | 'release'
    | 'question'
    | 'outro';

  visualVerb: string;

  peopleContract: {
    min: number;
    max: number;
  };

  semanticIntent: string;

  assetStrategy:
    | 'REUSE_FULL'
    | 'REUSE_CROP'
    | 'NEW_IMAGE'
    | 'COMPONENT';

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
};
```

---

# 11. REUSE BEFORE GENERATION

Before generating a new asset, ask:

```text
Can an already human-approved image create this shot through a semantically valid crop?
```

If YES:

```text
assetStrategy = REUSE_CROP
```

Examples:
- one family dinner image may support:
  - wide family shot;
  - medium interaction crop;
  - detail crop on bowls/hands IF clean enough.

But do NOT crop so aggressively that:
- anatomy breaks;
- semantic context disappears;
- resolution becomes weak;
- the shot looks accidental.

If the required visual idea genuinely needs a new action/object:
use:

```text
NEW_IMAGE
```

and normal Schnell QA rules apply.

---

# 12. IMPORTANT CODE — REFERENCE-DERIVED PLANNER CONFIG

Create a centralized planner contract.

Example:

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

  preferredProgressions: [
    ['WIDE', 'MEDIUM', 'DETAIL', 'MEDIUM', 'CLOSE', 'RELEASE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
    ['CLOSE', 'DETAIL', 'RELEASE'],
  ],

  hookPatterns: [
    ['DETAIL', 'WIDE'],
    ['CLOSE', 'WIDE'],
    ['DETAIL', 'MEDIUM', 'WIDE'],
  ],
} as const;
```

Do not scatter these rules across prompt strings.

---

# 13. IMPORTANT CODE — VISUAL VERB EXTRACTION

Do NOT build a fake NLP system.
Use deterministic heuristics + authored planner reasoning.

Example:

```ts
const ACTION_HINTS = [
  'đặt',
  'gấp',
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
] as const;

export function detectVisualVerb(text: string): string | null {
  const normalized = text.toLowerCase();

  for (const verb of ACTION_HINTS) {
    if (normalized.includes(verb)) {
      return verb;
    }
  }

  return null;
}
```

Then planner fallback:

```ts
function resolveVisualStrategy(clause: string) {
  const verb = detectVisualVerb(clause);

  if (verb) {
    return {
      kind: 'ACTION',
      visualVerb: verb,
    };
  }

  return {
    kind: 'SYMBOLIC_OR_EMOTIONAL',
    visualVerb: 'symbolic-detail',
  };
}
```

The planner still must reason about the actual clause.
Do not treat keyword detection as sufficient semantic planning.

---

# 14. IMPORTANT CODE — PLANNER QUALITY VALIDATION

Add planner-level validation BEFORE image generation.

Example:

```ts
export function validateShotPlan(shots: PlannedShot[]) {
  const errors: string[] = [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];

    if (!shot.visualVerb?.trim()) {
      errors.push(`${shot.id}: missing visualVerb`);
    }

    if (!shot.semanticIntent?.trim()) {
      errors.push(`${shot.id}: missing semanticIntent`);
    }

    const holdSeconds = shot.durationFrames / 30;

    if (
      holdSeconds > 4.0 &&
      shot.storyRole !== 'outro'
    ) {
      errors.push(`${shot.id}: hold too long (${holdSeconds.toFixed(2)}s)`);
    }
  }

  for (let i = 2; i < shots.length; i++) {
    if (
      shots[i - 2].scale === shots[i - 1].scale &&
      shots[i - 1].scale === shots[i].scale
    ) {
      errors.push(
        `${shots[i].id}: 3 consecutive ${shots[i].scale} shots`
      );
    }

    if (
      shots[i - 2].silhouette === shots[i - 1].silhouette &&
      shots[i - 1].silhouette === shots[i].silhouette
    ) {
      errors.push(
        `${shots[i].id}: 3 consecutive ${shots[i].silhouette} silhouettes`
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
```

Do NOT make validator so rigid that it destroys storytelling.
If a deliberate exception exists, require an explicit reason:

```ts
exceptionReason?: string;
```

---

# 15. IMPORTANT CODE — REFERENCE SCORECARD

Create a scorecard for the planner output.

Not a political/evaluative ranking—this is an internal visual-plan validation.

Example:

```ts
export function buildShotGrammarMetrics(shots: PlannedShot[]) {
  const durationFrames =
    shots[shots.length - 1].endFrame - shots[0].startFrame;

  const durationMinutes = durationFrames / 30 / 60;

  const changesPerMinute =
    shots.length / Math.max(durationMinutes, 0.001);

  const scales = new Set(shots.map((s) => s.scale));
  const silhouettes = new Set(shots.map((s) => s.silhouette));

  return {
    shotCount: shots.length,
    changesPerMinute,
    uniqueScales: scales.size,
    uniqueSilhouettes: silhouettes.size,
    maxHoldSeconds: Math.max(
      ...shots.map((s) => s.durationFrames / 30)
    ),
  };
}
```

Use this as a diagnostic, not as permission to game numbers.

---

# 16. VIDEO005 — FIRST REAL TEST

Target:

```text
video005
Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần
```

Find and read its canonical spec / narration.

Do NOT reuse the old 6-shot comparison pilot as the final plan.

Build a NEW full production shot plan from the canonical narration.

Create:

```text
scratch/reference-shot-grammar/video005/
  shot-plan.json
  shot-plan.md
  shot-grammar-metrics.json
  shot-grammar-audit.md
```

---

# 17. VIDEO005 — REQUIRED PLANNING QUESTIONS

For every narration clause answer:

```text
What is the visual verb?
What is the concrete physical action?
What object detail can carry meaning?
What emotional reaction is worth a close-up?
What wide/release shot prevents visual claustrophobia?
Can an approved asset be cropped?
Does this shot genuinely differ from the previous silhouette?
```

Do not create the plan until these are answered.

---

# 18. VIDEO005 — RETENTION STRUCTURE

Without inventing narration, aim for this kind of macro arc if the script supports it:

```text
HOOK
fatigue / disorder / immediate visual tension

→ ESTABLISH
end-of-day environment

→ ACTION 1
small reset behavior

→ DETAIL
hands / object / surface

→ ACTION 2
another concrete reset step

→ EMOTIONAL CLOSE
small sense of relief

→ RELEASE
room feels calmer / body relaxes

→ REFLECTION / IDEA
why ten minutes matters

→ QUESTION / CTA
quiet close

→ OUTRO
```

Do NOT force this exact sequence if canonical content differs.

---

# 19. DO NOT GENERATE IMAGES YET

Phase 1 is PLANNER ONLY.

First produce:
- shot plan;
- metrics;
- reuse/new-image map;
- contact-board mock from existing approved assets/crops where possible.

Do NOT call Cloudflare in Phase 1.

---

# 20. CREATE A VISUAL STORYBOARD BEFORE GENERATION

Create:

```text
scratch/reference-shot-grammar/video005/storyboard.jpg
```

Use:
- existing approved assets where possible;
- crop simulations;
- labeled placeholders for new-image shots.

Each tile must show:

```text
shot id
time/frame range
scale
silhouette
visual verb
semantic intent
asset strategy
```

The storyboard must make visual rhythm obvious before generation.

---

# 21. CREATE A SHOT-TRANSITION STRIP

Create:

```text
scratch/reference-shot-grammar/video005/shot-transition-strip.jpg
```

A compact left-to-right strip showing only silhouettes / crops.

Purpose:
make it immediately obvious if the plan repeats:

```text
medium person
medium person
medium person
```

FAIL planner if the strip looks monotonous.

---

# 22. HUMAN REVIEW GATE

STOP after planner/storyboard.

Do NOT generate fresh images.
Do NOT render final video.

Return:

```text
REFERENCE SHOT GRAMMAR — VIDEO005 READY FOR HUMAN REVIEW
```

We will inspect the shot language before spending image-generation attempts.

---

# 23. ACCEPTANCE FOR PHASE 1

PASS planner review only if:

```text
every narrative beat has a visual verb or explicit symbolic strategy
no >2 same scale consecutively unless justified
no >2 same silhouette consecutively unless justified
macro shot sequence visibly alternates scale/composition
hook has a real visual idea
detail inserts are meaningful
wide/release shots exist
shot duration rhythm is reference-like
plan does not rely on zoom to rescue weak images
asset reuse is used intelligently
new-image requirements are limited to genuinely new semantics
```

---

# 24. TESTS

Add focused planner tests only.

Example:

```ts
describe('reference-derived shot grammar', () => {
  it('rejects 3 consecutive identical shot scales', () => {
    // actual planner API
  });

  it('rejects 3 consecutive identical silhouettes', () => {
    // actual planner API
  });

  it('requires visual verb or explicit symbolic strategy', () => {
    // actual planner API
  });

  it('calculates changes-per-minute from authored shot plan', () => {
    // actual planner API
  });
});
```

Do not fabricate APIs just to satisfy tests.

---

# 25. FINAL REPORT

Return in this exact order:

## A. What Was Learned From References
Concrete rules only.

## B. Planner Architecture Changes
Files + code-level changes.

## C. Video005 Canonical Content Breakdown
Narration clauses -> visual verbs.

## D. Video005 Shot Plan
Full table.

## E. Shot Grammar Metrics
Report:
```text
shot count
duration
changes/min
median hold
max hold
unique scales
unique silhouettes
```

## F. Reuse vs New Images
List exact counts.

## G. Storyboard Paths
```text
storyboard.jpg
shot-transition-strip.jpg
```

## H. Planner Weaknesses
Be explicit.

## I. Tests
Exact counts.

## J. Verdict

Exactly one:

```text
HAY & ĐẸP. REFERENCE SHOT GRAMMAR — READY FOR HUMAN REVIEW
```

or

```text
HAY & ĐẸP. REFERENCE SHOT GRAMMAR — FAIL
```

Then STOP.

Do NOT call Cloudflare.
Do NOT generate images.
Do NOT render video005 final MP4.
