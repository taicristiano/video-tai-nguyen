# HAY & ĐẸP. — `/gen-video` TEMPLATE PIPELINE CONSOLIDATION
# FULL-PROJECT HARDENING PROMPT
# TEMPLATE-FIRST — FUTURE VIDEOS FIRST
# VIDEO005 IS REGRESSION EVIDENCE ONLY
# NO IMAGE GENERATION DURING THIS PATCH
# NO VIDEO-SPECIFIC WORKAROUNDS

## 0. OBJECTIVE

Refactor the current project so that:

```text
/gen-video --template human-insight/cinematic-light ...
```

really uses the **current hardened HAY & ĐẸP. shared template pipeline** end-to-end.

The target is NOT:

```text
"make Video006 work"
```

The target is:

```text
"make any future HAY & ĐẸP. video use the same locked template,
same planner, same Human-QA gates, same generic production renderer,
same dependency contract and same packager,
without editing shared source per video."
```

Video005 is only a regression fixture.

A non-Video005 fixture is mandatory to prove genericity.

---

# 1. IMPORTANT: AUDIT ACTUAL SOURCE BEFORE EDITING

Do not trust previous reports as source of truth.

Inspect the actual current repository first.

At minimum inspect:

```text
docs/SKILL-GEN-VIDEO.md
docs/gen-video/common-pipeline.md
docs/gen-video/verification.md
docs/templates/human-insight/cinematic-light.md

docs/HAY_DEP_PRODUCTION_LOCK.json
docs/HAY_DEP_PRODUCTION_LOCK.md

src/templates/registry.ts

src/templates/human-insight/cinematic-light/
  templateDependenciesRuntime.mjs
  templateDependenciesRuntime.d.mts
  templateDependencies.ts
  brandTypographyTokens.ts
  tokens.ts
  motionGrammar.ts
  referenceShotGrammarRuntime.mjs
  storyPlannerRuntime.mjs
  Layout.tsx
  ImageScene.tsx
  InsightCard.tsx
  SectionCard.tsx
  OutroCard.tsx
  index.ts

src/types/production.ts
src/Root.tsx
src/Video.tsx
src/VideoContent.tsx
src/audio/backgroundMusic.ts

scripts/batch-engine.mjs
scripts/parse-hay-dep-videos.mjs
scripts/generate-human-insight-image.mjs
scripts/promote-approved-images.mjs
scripts/materialize-production-assets.mjs
scripts/build-production-render-spec.mjs
scripts/production-spec-adapter.mjs
scripts/render-production-video.mjs
scripts/package-production.mjs
scripts/make-changes-zip.mjs

AGENTS.md
README.md
.kiro/hooks/gen-video-prompt.json
.cursor/rules/gen-video.mdc
.claude/commands/gen-video.md
```

Also inspect all current tests relevant to v42-v48 and the human-insight template.

---

# 2. DO NOT BLINDLY ENFORCE THE CURRENT PRODUCTION LOCK YET

The current production lock is not guaranteed to match the latest accepted runtime.

Before wiring it into `/gen-video`, create a **drift matrix** between:

```text
docs/HAY_DEP_PRODUCTION_LOCK.json
```

and actual current accepted template/runtime values.

Known areas that MUST be checked include:

```text
watermark geometry / opacity
title typography
subtitle typography
safe zones
font family
motion grammar
composition/framing
palette
identity/cast behavior
```

The latest accepted generic runtime + Video005 Golden should be treated as the visual regression baseline unless there is explicit newer Human approval for the older lock values.

Do NOT regress the current accepted template just to satisfy stale JSON values.

---

# 3. RECONCILE THE PRODUCTION LOCK FIRST

After the drift audit:

```text
accepted current template/runtime
        ↓
reconciled production policy
        ↓
HAY_DEP_PRODUCTION_LOCK.json
```

The JSON must become the canonical machine-readable production policy.

If current runtime is already Human-approved and differs from stale lock values:

```text
update the lock to describe accepted runtime
```

rather than silently rolling runtime backward.

If a conflict cannot be resolved from current Golden evidence:

```text
STOP and report the exact unresolved visual contract
```

Do not guess.

---

# 4. JSON MUST BE THE POLICY SSOT

Final contract:

```text
docs/HAY_DEP_PRODUCTION_LOCK.json
= machine-readable SSOT
```

`docs/HAY_DEP_PRODUCTION_LOCK.md` becomes:

```text
human-readable mirror / generated documentation
```

Do not maintain two independently authored policies.

Add a deterministic script such as:

```text
scripts/render-production-lock-doc.mjs
```

or equivalent, so the Markdown is generated from / validated against the JSON.

---

# 5. COMPLETE THE LOCK SCHEMA

The JSON must express all production-critical rules currently only documented informally or in Markdown.

At minimum ensure machine-readable coverage for:

```text
brand identity
image model
provider
no model switching
image style
hard visual exclusions
palette
cross-shot identity policy
per-image QA dimensions
retry / 429 policy
cleanup policy
framing
motion
watermark
typography
font family / weight
safe zones
hard-cut behavior
NO_FAKE_PASS
duration policy for this template if appropriate
Human QA requirements
```

Do not put per-video content into the production lock.

---

# 6. ADD A GENERIC REGISTRY-LEVEL PRODUCTION LOCK HOOK

Do NOT hard-code HAY & ĐẸP. paths inside the generic `/gen-video` router.

Extend the template registry minimally with optional metadata such as:

```ts
productionLockPath?: string;
dependencyContractPath?: string;
```

or an equivalent generic structure.

For:

```text
human-insight/cinematic-light
```

point to:

```text
docs/HAY_DEP_PRODUCTION_LOCK.json
src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs
```

Other templates remain unaffected unless they opt in.

---

# 7. `/gen-video` MUST LOAD THE LOCK BEFORE PLANNING

Update the generic `/gen-video` lifecycle.

Required order:

```text
1. parse flags/context
2. resolve template registry entry
3. load selected template document
4. if productionLockPath exists:
     load + validate production lock
     run template/runtime drift preflight
5. only then begin planning
```

Required precedence:

```text
1. production lock
2. selected template contract / dependency contract
3. per-video content prompt
4. generic router defaults
```

Per-video content must NOT be able to override locked production behavior.

---

# 8. ADD A PRODUCTION-LOCK PREFLIGHT VALIDATOR

Create a reusable validator such as:

```text
scripts/validate-production-lock.mjs
```

It should validate:

```text
lock schema
status = LOCKED
template ID applicability
image model constant
brand/dependency contract paths
critical typography constants
critical watermark constants
framing rules
motion rules
identity policy
QA/retry policy
```

It should compare policy against actual template/runtime values where deterministic comparison is possible.

If critical drift exists:

```text
HALT BEFORE TTS / IMAGE GENERATION
```

Do not waste generation attempts.

---

# 9. REMOVE THE THREE-COMPETING-PIPELINES PROBLEM

The repository currently contains overlapping flows:

```text
A. old docs /gen-video 8-step pipeline
B. scripts/batch-engine.mjs HAY & ĐẸP. flow
C. hardened production pipeline:
   review → promote → materialize → production spec → generic render → package
```

Consolidate them.

For `human-insight/cinematic-light`, `/gen-video` must become the canonical orchestrator.

Do NOT create a fourth pipeline.

---

# 10. PRESERVE THE GOOD PARTS OF `batch-engine.mjs`

Retain/reuse its good HAY & ĐẸP. behavior:

```text
canonical voice preservation
story planning
reference shot grammar
semantic visual planning
TTS reuse
STT/timeline canonical alignment
FLUX Schnell generation
3-attempt cap
429 → PAUSED_QUOTA
no model fallback
semantic SFX selection if retained
```

But REMOVE/DEPRECATE its obsolete responsibilities:

```text
editing src/VideoContent.tsx per video
editing src/Root.tsx per video
direct legacy spec.json render path
video-specific shared-source mutation
```

A normal future video must never rewrite shared renderer source.

---

# 11. `/gen-video` MUST NOT MODIFY SHARED SOURCE FOR A NORMAL VIDEO

Remove the obsolete generic rule:

```text
update defaultSlug/defaultDuration in Root.tsx
```

For normal generation:

```text
Root.tsx stays unchanged
VideoContent.tsx stays unchanged
template source stays unchanged
```

Per-video behavior flows through:

```text
data
manifests
production-render-spec
props
```

If a normal video requires shared source edits:

```text
HALT and report TEMPLATE BLOCKER
```

Do not create a video-specific workaround.

---

# 12. UPDATE THE HUMAN-INSIGHT TEMPLATE DOC

`docs/templates/human-insight/cinematic-light.md` must describe the CURRENT architecture.

Remove/deprecate obsolete guidance that conflicts with current runtime, including old assumptions such as:

```text
legacy Ken Burns alternating rules
old image selector path
per-video coder imports
Root mutation
legacy V2 workflow
obsolete card/transition behavior
old brand asset assumptions
```

The template document should describe:

```text
content parser
canonical voice behavior
story planner
image candidate generation
Human QA gate
approved asset promotion
canonical materialization
production-render-spec
generic production renderer
video QA
generic package
dependency contract
production lock
```

---

# 13. TEMPLATE-SPECIFIC DURATION OVERRIDE

Do NOT change the generic router’s timing target for every template.

For:

```text
human-insight/cinematic-light
```

the template-specific content contract is:

```text
allowed 70–85 seconds
preferred 75–80 seconds
voice is canonical
do not rewrite voice just to hit duration
```

This must override generic 2–3 minute assumptions.

Update common docs so generic targets are not incorrectly applied when a template declares its own timing contract.

---

# 14. CANONICAL CONTENT PARSER — SUPPORT OLD AND NEW PROMPTS

Create one reusable human-insight content parser.

It must support BOTH:

## Legacy 100-video format

```text
Kịch bản voice:
Ưu tiên visual:
Yêu cầu dựng:
```

## New concise format

```text
VOICE — CANONICAL
INSIGHT CHÍNH
VISUAL SEMANTICS
STATEMENT GẦN CUỐI
FINAL QUESTION — CANONICAL
```

Do not force rewriting all 100 existing prompts before the pipeline works.

Both direct `/gen-video` context and master-prompt/batch parsing should use the same parser.

---

# 15. CANONICAL VOICE MUST NEVER BE REWRITTEN

For human-insight production mode:

```text
user-provided voice = canonical narration
```

Do NOT run a Teller rewrite over it.

Allowed:

```text
punctuation normalization for TTS
paragraph/segment mapping
timing alignment
```

Forbidden:

```text
adding sentences
removing sentences
paraphrasing
reordering
rewriting to reach target duration
adding spoken brand copy
adding CTA
```

Add exact normalized text equality tests.

---

# 16. CONTENT VS TEMPLATE RESPONSIBILITY

Per-video prompt provides only:

```text
part/index
series
title
canonical voice
primary insight
semantic visual priorities
statement text
final question
duration preference
```

Shared template/lock owns:

```text
image model
visual style
palette
shot grammar
framing
motion
typography
brand assets
safe zones
subtitle style
retry policy
QA policy
dependency assets
render behavior
packaging
```

Do not repeat global production rules in every video prompt.

---

# 17. HUMAN IMAGE QA MUST BE A REAL PIPELINE GATE

After candidate generation:

```text
create exact candidate review pack
```

Generic output:

```text
videos/<slug>/review-manifest.json
```

with:

```text
manifestType = HUMAN_QA_REVIEW_V1
shotId
reviewedAssetPath
reviewedAssetSha256
humanQaVerdict = PENDING_HUMAN_QA initially
```

Do NOT auto-PASS.

Generate review artifacts/contact sheet when useful.

Then:

```text
STOP with PENDING_HUMAN_IMAGE_QA
```

No production asset promotion until explicit Human verdicts exist.

---

# 18. MAKE `/gen-video` RESUMABLE

The old rule:

```text
existing generation directory => conflict and halt
```

is incompatible with Human QA gates.

Add a safe generic resume mechanism, preferably:

```text
/gen-video --resume=<slug>
```

or an equivalent explicit lifecycle continuation.

Do not silently auto-resume an arbitrary existing directory.

Resume must inspect persisted stage state and continue only from the next valid stage.

---

# 19. RESUME AFTER HUMAN IMAGE QA

On resume:

```text
validate HUMAN_QA_REVIEW_V1
→ exact path/hash
→ promote-approved-images
→ materialize-production-assets
→ build production-render-spec
```

Reuse the hardened shared scripts.

Do not duplicate this logic inside the router.

---

# 20. PRODUCTION SPEC MUST SUPPORT REAL STATEMENT / QUESTION CARDS

Current production rendering must be upgraded from boolean-only card metadata.

Do not rely only on:

```text
hasInsightCard
hasSectionCard
```

without card content.

Add a generic card payload to the production spec, for example:

```ts
card?: {
  kind: 'statement' | 'question' | 'section';
  text: string;
  subtitle?: string;
  durationFrames?: number;
}
```

Exact shape may follow existing architecture.

---

# 21. STATEMENT CARD

For the human-insight template:

```text
statement near end
```

should render using the existing shared `InsightCard` where appropriate.

The production builder derives the statement from canonical content/story plan.

No video-specific card code.

---

# 22. FINAL QUESTION CARD

Do NOT force the existing numbered `SectionCard` UI for a normal ending question.

The user contract says:

```text
01/02/03 numbering is not required unless content is actually a list/question sequence
```

Implement a dedicated shared `QuestionCard` or a clean unnumbered generic card variant.

Required:

```text
question text comes from canonical final question
no generic “Bạn nghĩ sao?”
no forced comment CTA
```

---

# 23. CARDS MUST NOT CREATE BLANK TRANSITION FRAMES

Preserve accepted hard-cut behavior.

At every narrative/card boundary:

```text
frame N-1 visually covered
frame N visually covered
```

No fade-to-empty canvas.

Do not reintroduce the previous Outro/card blank-frame regression.

---

# 24. PRODUCTION SPEC MUST CARRY THE AUDIO MODE

`--audio=full` must not lose meaning when the hardened production renderer is used.

Persist the resolved mode, for example:

```text
audioMode: full | music | sfx | voice-only
```

or an equivalent effective policy.

The production spec / renderer must know whether:

```text
background music is enabled
SFX is enabled
```

---

# 25. PRESERVE TEMPLATE-NATIVE SEMANTIC SFX

The current HAY & ĐẸP. pipeline already contains useful semantic SFX selection logic.

Move/refactor it from `batch-engine.mjs` into a shared human-insight template module.

Do not require generic “one SFX on every scene” behavior.

For this calm template:

```text
SFX must be restrained
narration-safe
semantic
not decorative
```

Do not place SFX on every scene merely because mode is `full`.

Suppress SFX where inappropriate, especially:

```text
question
release
ending
quiet emotional hold
```

---

# 26. GENERIC PRODUCTION RENDERER MUST RENDER SFX WHEN ENABLED

Extend `ProductionShot` as needed, e.g.:

```ts
entrySfx?: {
  name: string;
  src?: string;
  volume?: number;
}
```

or equivalent.

`VideoContent.tsx` should render SFX from data when the resolved audio policy enables SFX.

No per-video source changes.

---

# 27. AUDIO DEPENDENCY SSOT MUST NOT DRIFT

Current template dependency contract is the SSOT for default background music.

Avoid duplicate ownership in:

```text
src/templates/registry.ts
templateDependenciesRuntime.mjs
/update-bg-music
```

For templates with a dependency contract:

```text
effective default music must come from that contract
```

Registry may point to the contract, but must not become a second independently editable default.

Update the background-music update workflow accordingly.

---

# 28. PRODUCTION LOCK IDENTITY POLICY MUST WIN

The locked policy says:

```text
cross-shot facial/biometric identity consistency is NOT required
```

Enforce that semantically.

Allowed:

```text
role labels
people count
family-role semantics
world/location hints
```

Forbidden QA/retry behavior:

```text
reject because face differs from prior shot
retry to force facial likeness
waste attempts on biometric consistency
```

Add tests proving cross-shot facial mismatch alone cannot trigger regeneration/fail.

---

# 29. REASSESS CAST / ASSET REUSE LOGIC

Current cast/world metadata may remain only if it helps story semantics.

But do not let:

```text
needsRecurringCast
```

implicitly force:

```text
identity QA
canonical-image reuse
retries for likeness
```

If `reuse-canonical` exists mainly to preserve identity rather than semantic need, decouple it.

Semantic progression remains more important than face matching.

---

# 30. FRAMING AND MOTION MUST MATCH THE RECONCILED LOCK

After lock reconciliation:

```text
planner
renderer
motion grammar
composition selection
production lock
```

must agree.

Specifically audit:

```text
editorial-left / editorial-right for square assets
portrait-focus contract
horizontal drift profiles
pull-out profiles
ambient drift
ImageScene extra perceived drift
hard cuts
opacity behavior
```

Do not blindly preserve stale rules or blindly change accepted runtime.

Use Golden evidence.

---

# 31. PRODUCTION SPEC TYPE CLEANUP

Update `src/types/production.ts` so runtime and builder agree.

At minimum audit/add:

```text
audioMode
entrySfx
card payload
OutroConfig.brandMarkSrc
effective template configuration fields actually used
```

Remove ambiguous booleans only if safe; maintain backward compatibility where needed.

---

# 32. STRICT CANONICAL-ASSET PRODUCTION BUILD

Production builder should use:

```text
APPROVED_IMAGE_MANIFEST_V1
canonicalImageSrc
exact SHA-256
```

Do not allow production fallback to non-canonical candidate paths except in explicit test-fixture mode.

If a synthetic test needs non-canonical assets:

```text
make that an explicit test-only option
```

not a production fallback.

---

# 33. FINAL VIDEO QA GATE

A successful MP4 render is not automatically a Human visual PASS.

After render:

```text
generate video review pack
contact sheet
transition strip
QA checklist
```

Then report:

```text
PENDING_HUMAN_VIDEO_QA
```

unless an explicit Human video verdict already exists.

Do not claim final completion solely because Remotion rendered.

---

# 34. OPTIONAL SECOND RESUME

If implementing a formal Human video gate:

```text
/gen-video --resume=<slug>
```

after Human video approval should:

```text
validate explicit Human video verdict
promote/copy canonical final video if needed
package production
mark pipeline COMPLETE
```

If the existing product flow handles Human video approval externally, document the exact continuation instead of inventing a fake automated PASS.

---

# 35. COMPLETION CONTRACT FOR HUMAN-INSIGHT PRODUCTION

A truly completed production episode should have, as applicable:

```text
template selection
production lock version
audio policy
canonical plan/script
voice.mp3
timeline.json
story plan
HUMAN_QA_REVIEW_V1
APPROVED_IMAGE_MANIFEST_V1
canonical final images
production-render-spec.json
rendered MP4
video QA evidence
production package
```

The exact lifecycle state must be explicit:

```text
PLANNING
PENDING_HUMAN_IMAGE_QA
READY_TO_RENDER
PENDING_HUMAN_VIDEO_QA
COMPLETE
PAUSED_QUOTA
BLOCKED
```

or an equivalent finite-state model.

---

# 36. UPDATE `/gen-video` DOCS WITHOUT BREAKING OTHER TEMPLATES

`docs/SKILL-GEN-VIDEO.md` remains generic.

Add generic hooks/state semantics.

Do NOT rewrite it as a HAY & ĐẸP.-only router.

Templates without:

```text
productionLockPath
reviewed production lifecycle
```

continue following their existing pipeline.

---

# 37. UPDATE GENERIC DOCS THAT ARE NOW STALE

Audit and synchronize:

```text
docs/gen-video/common-pipeline.md
docs/gen-video/verification.md
AGENTS.md
README.md
.kiro/hooks/gen-video-prompt.json
.cursor/rules/gen-video.mdc
.claude/commands/gen-video.md
```

Remove inaccurate statements such as:

```text
src is always overwritten per /gen-video
Root must be modified per video
all templates always execute all 8 steps without lifecycle stop
```

The docs must reflect:

```text
template lifecycle hooks
data-driven shared renderers
Human QA pause/resume
production lock preflight
```

---

# 38. DO NOT BREAK OTHER TEMPLATES

Run regression checks for at least:

```text
one fixed news template
one creative template
human-insight/cinematic-light
```

The new production-lock/reviewed lifecycle must activate only for templates configured to use it.

---

# 39. UPDATE THE 100-PROMPT FORMAT ONLY AFTER PIPELINE SUPPORT EXISTS

Do NOT bulk rewrite 100 prompts first.

First make parser/runtime support the concise format.

Then optionally provide a migration tool:

```text
legacy prompt
→ concise content-only prompt
```

The existing 100-video file must remain readable until migration is explicitly approved.

---

# 40. RECOMMENDED CONCISE VIDEO CONTRACT

After this patch, a future HAY & ĐẸP. prompt should only need something like:

```text
/gen-video --template human-insight/cinematic-light --audio=full

Phần: 6
Series: ĐẸP.

Thời lượng:
70–85 giây.
Sweet spot 75–80 giây.

Tiêu đề:
...

VOICE — CANONICAL:
...

INSIGHT CHÍNH:
...

VISUAL SEMANTICS:
...

STATEMENT GẦN CUỐI:
...

FINAL QUESTION — CANONICAL:
...
```

All global HOW rules must come from template/production lock.

---

# 41. REQUIRED TESTS — PRODUCTION LOCK

At minimum:

```text
lock configured for human-insight template
lock loaded before planning
invalid/missing lock halts preflight
runtime drift halts before generation
JSON/Markdown lock sync
image model exact-match
no model switch
429 policy
cross-shot identity not required
NO_FAKE_PASS semantics
```

---

# 42. REQUIRED TESTS — CONTENT CONTRACT

At minimum:

```text
legacy prompt parser still works
concise prompt parser works
canonical voice exact normalized equality
final question exact preservation
statement exact preservation
70–85 template timing override
generic 2–3 minute assumption does not override human-insight
```

---

# 43. REQUIRED TESTS — ZERO SHARED SOURCE MUTATION

Run a generic fixture and hash shared files before/after.

Assert unchanged:

```text
src/Root.tsx
src/Video.tsx
src/VideoContent.tsx
shared human-insight template files
```

Normal episode generation must create data/assets only.

---

# 44. REQUIRED TESTS — HUMAN QA STATE MACHINE

Test:

```text
candidate generation
→ review manifest PENDING
→ pipeline stops

PENDING / FAIL / missing exact hash
→ resume blocked

all PASS_HUMAN_QA exact path+hash
→ resume proceeds
```

No automatic Human PASS.

---

# 45. REQUIRED TESTS — CARD RENDERING

For a non-Video005 fixture:

```text
statement card payload exists
statement text renders
final question card payload exists
question text renders
no forced 01/02/03 numbering
no blank card boundary frames
```

---

# 46. REQUIRED TESTS — AUDIO MODES

For human-insight:

```text
full       → voice + bg music + semantic SFX
music      → voice + bg music, no SFX
sfx        → voice + semantic SFX, no bg music
voice-only → voice only
```

No hidden template-ID suffix logic.

No SFX on every scene unless semantically selected.

---

# 47. REQUIRED TESTS — DEPENDENCY / AUDIO SSOT

Assert one effective default music value across:

```text
template dependency contract
runtime
validator
packager
audio-mode resolver
```

Updating the template default once must propagate everywhere.

---

# 48. REQUIRED TESTS — NON-VIDEO005 FULL FIXTURE

Create a fixture with:

```text
different slug
3–5 shots
different duration
statement card
question card
audio=full
optional outro
```

Run:

```text
parse
→ plan
→ story plan
→ review manifest creation
→ simulated Human PASS fixture
→ promote
→ materialize
→ production spec
→ package
→ clean extract
→ Remotion bundle/composition smoke
```

No shared source edits.

No actual AI image generation is required for this test.

---

# 49. VIDEO005 REGRESSION

Use existing Video005 data only to prove:

```text
existing approved output path still builds/validates
no card/renderer regression
no asset-path regression
no dependency regression
```

Do not optimize architecture around Video005.

---

# 50. SIDE-EFFECT LIMITS FOR THIS PATCH

Required during this hardening task:

```text
AI image generation calls = 0
image edit calls = 0
unnecessary TTS calls = 0
```

Use fixtures/local existing assets for tests.

A full MP4 render is optional unless needed for regression.

Bundle/composition smoke is preferred.

---

# 51. CLEAN ARCHITECTURE TARGET

Final human-insight production flow:

```text
/gen-video
    ↓
resolve template
    ↓
load production lock
    ↓
validate lock/runtime drift
    ↓
parse canonical content
    ↓
plan story
    ↓
reuse/generate voice
    ↓
timeline + canonical alignment
    ↓
story/shot plan
    ↓
generate candidate images
    ↓
review-manifest = PENDING_HUMAN_QA
    ↓
STOP / wait for Human QA
    ↓
resume
    ↓
promote exact approved assets
    ↓
materialize canonical assets
    ↓
build production-render-spec
    ↓
generic data-driven Remotion render
    ↓
video QA pack
    ↓
Human video review
    ↓
package
    ↓
COMPLETE
```

No per-video shared source edits.

---

# 52. FINAL REPORT FORMAT

Report:

## A. Full-project root causes

Summarize the competing pipelines and stale docs.

## B. Production lock drift matrix

Show:

```text
field
lock value before
actual accepted runtime
final reconciled value
reason/evidence
```

Especially:

```text
watermark
title
subtitle
safe zones
fonts
motion
framing
identity
```

## C. Lock enforcement

Show where `/gen-video` loads/validates it.

## D. Registry/template hook

Show generic registry metadata.

## E. Human-insight lifecycle

Show exact state machine.

## F. Canonical content parser

Show legacy + concise support.

## G. Voice preservation

Report exact normalized equality test.

## H. Shared-source immutability

Report source hashes before/after fixture.

## I. Card support

Show statement + question implementation.

## J. Audio mode

Show all four modes and semantic SFX behavior.

## K. Human QA

Show image QA pause/resume and exact asset identity.

## L. Production renderer

Confirm only data/spec changes per episode.

## M. Documentation sync

List updated canonical docs.

## N. Non-Video005 fixture

Show full generic flow and clean bundle smoke.

## O. Video005 regression

Only report regression status.

## P. Tests

Exact focused/full test counts.

## Q. Side effects

```text
Image generation calls: 0
Image edit calls: 0
TTS regeneration calls: 0 unless explicitly unavoidable
Remotion full renders: N
```

End with exactly one:

```text
HAY & ĐẸP. `/gen-video` TEMPLATE PIPELINE CONSOLIDATED — FUTURE VIDEOS READY
```

or:

```text
HAY & ĐẸP. `/gen-video` TEMPLATE PIPELINE STILL SPLIT — DO NOT START VIDEO006
```

---

# 53. MOST IMPORTANT PRINCIPLE

Do not patch:

```text
Video006
```

Patch:

```text
human-insight/cinematic-light
```

Do not duplicate:

```text
production rules in every prompt
```

Enforce:

```text
production lock + template contract
```

Do not mutate:

```text
Root.tsx / VideoContent.tsx per episode
```

Generate:

```text
data + assets + manifests + production spec
```

Do not trust:

```text
successful generation/render
```

as Human QA.

And do not wire the stale production lock blindly.

First reconcile it to the accepted template runtime, then make it enforceable.
