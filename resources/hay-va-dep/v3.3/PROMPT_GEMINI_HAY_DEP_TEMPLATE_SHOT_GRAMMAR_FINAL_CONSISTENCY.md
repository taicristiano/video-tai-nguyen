# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — TEMPLATE SHOT GRAMMAR FINAL CONSISTENCY + PRODUCTION GATE
# OFFLINE ONLY
# ZERO CLOUDFLARE CALLS
# ZERO IMAGE GENERATION
# ZERO FINAL VIDEO RENDER
# FIX REUSABLE TEMPLATE ONLY — VIDEO005 IS ONLY AN ACCEPTANCE FIXTURE

## 0. WHY THIS PASS EXISTS

The template-level direction is correct, but the latest generated evidence is internally inconsistent.

This is NOT another research phase.

This is a narrow final correctness pass to make all template outputs and production gates agree with the same real planner result.

After this pass, if clean, the next phase is image generation.

---

# 1. HARD ARCHITECTURE RULE

Do NOT patch `video005` manually.

Do NOT hard-code any video005 title, slug, shot id, timing, semantic intent, or asset path into reusable planner code.

Reusable changes belong under the actual production template path:

```text
src/templates/human-insight/cinematic-light/
```

Video005 and video013 are acceptance fixtures only.

---

# 2. SINGLE SOURCE OF TRUTH FOR ALL GENERATED EVIDENCE

The latest output currently has stale contradictions:

- report/walkthrough says video005 has 19 shots / 21.76 changes/min / 4 reuse shots;
- actual generated `shot-plan.json` has 18 shots / 20.61 changes/min / 0 reuse / 17 NEW_IMAGE + 1 COMPONENT;
- reuse-audit prose still mentions `REUSE_CROP` and `REUSE_FULL` while its summary and actual plan say zero reuse;
- transition-strip header still shows stale shot/cadence numbers.

Fix this at the TEMPLATE ARTIFACT GENERATOR level.

All evidence must be generated from ONE immutable planner result object:

```ts
type PlannerRunResult = {
  plan: ShotPlan;
  metrics: ShotGrammarMetrics;
  validation: ShotPlanValidation;
  brandAudit: BrandAudit;
  reuseAudit: ReuseAuditResult;
};
```

Artifact writers MUST consume this object directly:

```ts
writeShotPlan(result);
writeMetrics(result);
writeReuseAudit(result);
writeBrandAudit(result);
renderStoryboard(result);
renderTransitionStrip(result);
writeWalkthrough(result);
writeFinalReport(result);
```

NO copied/hard-coded metrics in markdown strings.

---

# 3. ADD OUTPUT CONSISTENCY VALIDATION

Create a reusable validator such as:

```ts
export function validatePlannerArtifacts(
  result: PlannerRunResult
): ArtifactConsistencyResult
```

At minimum enforce:

```ts
result.plan.shots.length === result.metrics.shotCount

countStrategy(result.plan.shots, 'REUSE_FULL') +
countStrategy(result.plan.shots, 'REUSE_CROP')
=== result.metrics.reuseCount

countStrategy(result.plan.shots, 'NEW_IMAGE')
=== result.metrics.newImageCount

countStrategy(result.plan.shots, 'COMPONENT')
=== result.metrics.componentCount

result.reuseAudit.summary.reuseCount
=== result.metrics.reuseCount

result.reuseAudit.summary.newImageCount
=== result.metrics.newImageCount

result.reuseAudit.evaluations.length
=== result.plan.shots.length
```

Storyboard header and transition-strip header MUST be built from:

```ts
result.metrics
```

not manually supplied numbers.

If any mismatch exists:

```text
ARTIFACT_CONSISTENCY_ERROR
```

and human-review verdict must be FAIL.

---

# 4. REMOVE STALE REUSE CLAIMS

Current actual video005 plan is:

```text
18 shots
0 reuse
17 NEW_IMAGE
1 COMPONENT
```

That is acceptable if semantically truthful.

Do NOT force reuse.

If current plan still resolves to zero reuse after real template execution, then:
- `reuse-audit.json`
- `reuse-audit.md`
- storyboard badges
- report
- walkthrough

must ALL say zero reuse.

Delete stale prose like:

```text
shot-09 -> REUSE_CROP
shot-18 -> REUSE_FULL
```

unless the CURRENT planner result actually contains those strategies.

Core rule remains:

```text
semantic fidelity > reuse efficiency
```

---

# 5. FIX LONG-HOLD EXCEPTION ABUSE

Current generated plan contains long NEW_IMAGE shots with:

```text
exceptionReason: "Dedicated Insight Statement Card hold"
```

even when they are not actual statement-card components.

Examples from current plan include:
- context NEW_IMAGE hold;
- timer/detail NEW_IMAGE hold;
- reflection NEW_IMAGE hold.

A free-form `exceptionReason` must NOT be enough to bypass the >4s gate.

Replace with typed exception semantics.

Example:

```ts
export type HoldExceptionKind =
  | 'INSIGHT_CARD'
  | 'OUTRO_COMPONENT'
  | 'AUTHORED_EMOTIONAL_PAUSE';

export interface HoldException {
  kind: HoldExceptionKind;
  reason: string;
}
```

Validation rules:

```ts
INSIGHT_CARD
=> shot/component metadata must actually contain an InsightCard

OUTRO_COMPONENT
=> storyRole === 'outro' && assetStrategy === 'COMPONENT'

AUTHORED_EMOTIONAL_PAUSE
=> explicit authored reason
=> cannot be used mechanically by cadence normalization
```

Example validator:

```ts
function isValidHoldException(shot: PlannedShot): boolean {
  const ex = shot.holdException;
  if (!ex) return false;

  if (ex.kind === 'INSIGHT_CARD') {
    return Boolean(shot.hasInsightCard);
  }

  if (ex.kind === 'OUTRO_COMPONENT') {
    return (
      shot.storyRole === 'outro' &&
      shot.assetStrategy === 'COMPONENT'
    );
  }

  if (ex.kind === 'AUTHORED_EMOTIONAL_PAUSE') {
    return (
      ex.reason.trim().length >= 12 &&
      shot.storyRole !== 'action'
    );
  }

  return false;
}
```

If a >4s normal image shot has no valid exception:
- split it semantically, OR
- shorten/rebalance adjacent shot timing.

Do NOT relabel arbitrary shots as Insight Cards.

---

# 6. FIX PLANNER ROLE -> RENDER SCENE ROLE LOSS

Current generated output has planner roles that silently change when converted to renderer scenes.

Examples:
- planner `hook` becomes scene `establish`;
- planner `outro` becomes scene `establish`.

This is unsafe because motion/render logic may use the scene role.

Fix generically.

Preferred:

```ts
interface HumanInsightScene {
  plannerStoryRole: ShotStoryRole;
  storyRole: RendererStoryRole;
  ...
}
```

Use an explicit mapping:

```ts
function mapPlannerRoleToRendererRole(
  role: ShotStoryRole
): RendererStoryRole
```

But preserve the original:

```ts
plannerStoryRole: shot.storyRole
```

For `hook`:
- if renderer has no hook type, map motion role explicitly,
- do NOT silently erase the source role.

For `outro`:
- `isOutro: true`
- planner role must remain `outro`
- renderer behavior must be explicitly outro/component behavior.

Add tests proving:
```text
hook remains identifiable after buildTemplateScenes
outro remains identifiable after buildTemplateScenes
```

---

# 7. PRODUCTION BRAND GATE

The template correctly detects:

```text
BRAND_AUDIO_MISMATCH
visual brand = HAY & ĐẸP.
spoken canonical audio = Nếp
```

But current planner still reports `validation.ok: true`.

For a PRODUCTION run, this mismatch must block image generation/render.

Introduce validation mode:

```ts
type PlannerValidationMode =
  | 'DRAFT'
  | 'PRODUCTION';
```

Behavior:

```text
DRAFT:
BRAND_AUDIO_MISMATCH -> warning/audit

PRODUCTION:
BRAND_AUDIO_MISMATCH -> hard error
productionReady = false
```

Example:

```ts
if (
  mode === 'PRODUCTION' &&
  brandAudit.hasMismatch
) {
  errors.push(
    `BRAND_AUDIO_MISMATCH: audio=${brandAudit.audioBrandName}, template=${brandAudit.templateBrand}`
  );
}
```

Do NOT silently replace spoken audio.

Do NOT regenerate voice in this task.

The planner may be valid structurally while:

```text
productionReady = false
```

because brand audio still needs migration.

---

# 8. REPORT MUST DISTINGUISH STRUCTURAL VALIDITY FROM PRODUCTION READINESS

Return both:

```ts
{
  structuralValidation: {
    ok: true/false
  },

  productionValidation: {
    ok: true/false,
    errors: [...]
  }
}
```

This prevents a misleading:

```text
validation.ok = true
```

while the video still says the wrong brand.

---

# 9. FIX TRANSITION STRIP / STORYBOARD DATA SOURCE

The storyboard and transition strip must render from the SAME current plan object.

Header example:

```ts
const header = [
  `${metrics.shotCount} shots`,
  `${metrics.changesPerMinute.toFixed(2)} changes/min`,
  `${metrics.uniqueScales} scales`,
  `${metrics.uniqueSilhouettes} silhouettes`,
].join(' | ');
```

No cached old header values.

No copied HTML from prior run.

Add snapshot/data tests for the generated header model if practical.

---

# 10. PROMPT / COMPOSITION SANITY

Keep existing reusable prompt safety.

Also check generic scale/composition mapping.

For example:

```text
DETAIL + tabletop-topdown
```

should not accidentally default to a generic portrait composition unless explicitly justified.

Create reusable helper:

```ts
function chooseCompositionForShot(
  scale: ShotScale,
  silhouette: ShotSilhouette,
  role: ShotStoryRole
)
```

Suggested:
- `DETAIL` / `hands-detail` -> `detail-insert`
- `DETAIL` / `tabletop-topdown` -> `detail-insert`
- `SYMBOLIC` object detail -> `paper` or `detail-insert`
- people medium/close -> portrait/editorial according to narrative need
- release/wide -> portrait-focus / paper depending context

Do not hard-code video005.

---

# 11. TESTS — TEMPLATE LEVEL

Add tests for:

1. metrics shot count equals actual plan length;
2. strategy counts equal metrics;
3. reuse audit summary equals real plan;
4. stale reuse prose cannot be generated from zero-reuse plan;
5. storyboard header model comes from metrics;
6. transition strip header model comes from metrics;
7. >4s NEW_IMAGE with fake free-form reason is rejected;
8. INSIGHT_CARD exception requires actual insight-card metadata;
9. OUTRO exception requires actual outro component;
10. planner hook identity survives scene conversion;
11. planner outro identity survives scene conversion;
12. PRODUCTION mode blocks BRAND_AUDIO_MISMATCH;
13. DRAFT mode surfaces brand mismatch without pretending productionReady;
14. video005 generated from real reusable planner;
15. video013 generated from same planner;
16. no video-specific conditionals added.

Run full repo tests.

---

# 12. REGENERATE ACCEPTANCE EVIDENCE

After code fixes, run the real reusable planner again for:

```text
video005
video013
```

For video005 rebuild:

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
  walkthrough.md
```

Every file must agree numerically.

No image generation.

For video013 regenerate the minimum metrics/audit proof.

---

# 13. EXPECTED CURRENT TRUTH

Do NOT force these exact numbers, but the currently observed truthful video005 baseline is approximately:

```text
18 shots
52.4s
20.61 changes/min
median hold 2.8s
0 reuse
17 NEW_IMAGE
1 COMPONENT
```

If the corrected template changes these due valid long-hold splitting, report the NEW real values everywhere.

Do NOT preserve old 19-shot / 21.76 / 4-reuse numbers merely because a previous report said so.

---

# 14. DO NOT CALL IMAGE GENERATION

Strict:

```text
0 Cloudflare calls
0 Schnell calls
0 image generations
0 final video render
```

---

# 15. FINAL REPORT FORMAT

Return exactly:

## A. Single Source of Truth Fix
Explain how artifacts are now generated from one planner result.

## B. Current Video005 Truth
Exact:
- shot count
- cadence
- median hold
- max hold
- reuse/new/component counts

## C. Long Hold Exceptions
List every >4s shot and why it is valid, or show how it was split.

## D. Role Preservation
Show hook and outro mapping.

## E. Brand Production Gate
Show:
```text
structuralValidation
productionValidation
```

## F. Video013 Generalization Proof
Metrics + same grammar version.

## G. Artifact Consistency
Confirm all output artifacts agree.

## H. Tests
Exact counts.

## I. Verdict

Use one:

```text
HAY & ĐẸP. TEMPLATE SHOT GRAMMAR FINAL CONSISTENCY — READY FOR HUMAN REVIEW
```

or

```text
HAY & ĐẸP. TEMPLATE SHOT GRAMMAR FINAL CONSISTENCY — FAIL
```

Then STOP.
