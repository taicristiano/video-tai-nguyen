# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6
# 5-VIDEO GENERALIZATION PILOT
# WITH FINAL WATERMARK TUNING
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## CONTEXT

The current HAY & ĐẸP. baseline is considered locked enough for generalization testing:

V3.4A Motion + centered framing          PASS
V3.4A Clean scene-level assets          PASS
V3.5A Brand + typography                PASS

Do NOT reopen image identity research.
Do NOT introduce another image model.
Do NOT change the core motion grammar unless a real regression is discovered.

Image policy is LOCKED:
- model = @cf/black-forest-labs/flux-1-schnell ONLY
- style = clean 2D cartoon / illustrated editorial
- photorealism = NOT WANTED
- cross-image identity consistency = NOT REQUIRED
- each image judged independently

This task has TWO goals only:
1. apply the current production baseline to 5 representative videos;
2. verify that the system generalizes without major visual/layout regressions.

## 1. FINAL WATERMARK TUNING BEFORE GENERALIZATION

Keep the exact supplied HAY & ĐẸP. logo asset:
public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png

Narrative-scene watermark remains top-right.
Do NOT center it in narrative scenes.

Update target values to:
- top: 40px
- right: 40px
- width: 250px
- opacity: 0.24

Rules:
- no animation
- no pulse
- no breathing
- no scaling animation
- no rotation
- no per-scene fade
- pixel-stable

Centered logo treatment is allowed ONLY on intro/outro cards if already supported.
Do not redesign intro/outro in this task.

Add/update focused tests for the new width / opacity / inset contract.

## 2. GENERALIZATION VIDEO SET

Use the current five known representative videos / content profiles:
- 001 family-emotional
- 005 relationship-dialogue
- 007 home-living
- 013 books-ideas
- 028 family-emotional

Use their current story plans/specs in the repository.

Do NOT batch 100 videos.

## 3. PILOT SCOPE PER VIDEO

For each video, produce a SHORT representative pilot only.

Target:
- 5–6 scene-level shots
- approximately 20–30 seconds

Pick the earliest representative narrative span that includes a useful mix of roles such as:
establish, reflection, interaction, detail-action, action, context, release, question.

Do NOT render the full video unless the existing pipeline makes short-span rendering impossible.

## 4. IMAGE GENERATION

Use only:
@cf/black-forest-labs/flux-1-schnell

Each scene-level image should target:
- clean 2D illustrated / cartoon style
- hand-drawn editorial feel
- simple expressive faces
- readable body shapes
- warm ivory / cream palette
- muted sage
- warm wood
- charcoal / sepia linework
- restrained terracotta / amber

Do NOT aim for:
- photorealism
- realistic skin
- 3D
- anime/chibi
- photographic camera language

No identity consistency requirement across images.

## 5. IMAGE QA

For every generated scene-level image, evaluate exactly:
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION

PASS only if all five PASS.

STYLE:
Accept clean 2D cartoon / illustrated editorial output.
Do not over-police small style variation.

PEOPLE_CONTRACT:
Requested visible people count must be respected.

SEMANTIC_FIDELITY:
Main action/object must match the narration intent.

ANATOMY:
Reject clear detached / duplicate / impossible body structures.
Minor finger imperfections may pass if not distracting.

TEXT_POLLUTION:
Reject fake signatures, pseudo-text, watermark-like glyphs, random words/handles.

## 6. RETRY POLICY

Per scene-level image:
max 3 real generated attempts

Flow:
Attempt 1 -> QA -> PASS = select immediately
FAIL -> Attempt 2
PASS = select immediately
FAIL -> Attempt 3
PASS = select
FAIL -> mark BLOCKED_ASSET for that video

No Attempt 4.

If HTTP 429 / quota:
PAUSED_QUOTA

Stop current execution.
Do not rotate accounts.
Do not switch models.
Do not count 429 as a visual attempt.

## 7. SCENE-LEVEL COMPARISON RENDERING

For these generalization pilots, use scene-level clean assets.

Internal visual-beat image swapping should remain disabled for the comparison pilots:
visualBeats={undefined}

This is intentional.

Do NOT claim the comparison pilots are exact production visual-beat renders.

For clean square/centered illustrations:
editorial-left / editorial-right -> normalize to portrait-focus

Reset legacy asset-specific focal point:
focalPoint={undefined}

Preserve:
- scene timing
- shotScale
- motionProfile
- motionPreset
- hard cuts
- title
- subtitle
- SectionCard / InsightCard
- audio / SFX

## 8. BRAND + TYPOGRAPHY BASELINE

Preserve the V3.5A title/subtitle system.

Do NOT rewrite authored text.

Keep:
- persistent headline
- max 2 lines
- stable text
- current subtitle timing
- current subtitle placement
- no kinetic typography
- no karaoke animation
- no bouncing words

Apply the updated watermark values from Section 1.

## 9. REGRESSION GATES PER VIDEO

Each pilot is reviewed for:
A. IMAGE CLEANLINESS
B. FRAMING
C. MOTION
D. TITLE
E. SUBTITLE
F. WATERMARK
G. HARD CUTS
H. OVERALL USABILITY

PASS criteria:
- no severe image defect
- no obvious off-center framing
- no blank edge exposure
- no subtitle/title collision
- no watermark collision
- no motion jitter
- no opacity dip at cuts
- no visually broken scene

Do NOT fail because recurring people look different across images.

## 10. OUTPUT STRUCTURE

Use:
scratch/v36/generalization/
  video001/
  video005/
  video007/
  video013/
  video028/

For each video save:
- pilot.mp4
- contact-sheet.jpg
- pilot-assets.json
- qa-report.json
- evaluation.md

Also create:
- scratch/v36/generalization/summary.md
- scratch/v36/generalization/summary.json

## 11. SUMMARY METRICS

Report per video:
- generated scenes
- selected on attempt 1
- selected on attempt 2
- selected on attempt 3
- blocked scenes
- quota interruptions
- image QA failures by category
- framing regressions
- motion regressions
- typography regressions
- watermark regressions
- overall PASS / FAIL

Also report aggregate:
- total scenes tested
- first-attempt pass rate
- eventual pass rate within 3 attempts
- blocked asset count
- number of videos passing all gates

Do not turn this into a model benchmark study.
This is a production-readiness smoke test.

## 12. OVERALL DECISION RULE

Overall V3.6 PASS requires:
- all 5 video pilots render successfully
- no video has BLOCKED_ASSET
- no major framing regression
- no major motion regression
- no title/subtitle collision
- no watermark collision

Small stylistic variation between generated images is acceptable.

If one video has a blocked scene after 3 real generated attempts:
V3.6 — FAIL

Stop and report that exact failure.
Do not open a new prompt-tuning research loop automatically.

If quota stops the run:
V3.6 — PAUSED_QUOTA

Stop and preserve state for resume.

## 13. FINAL REPORT

Return:

A. Watermark Final Values
Confirm:
- top = 40px
- right = 40px
- width = 250px
- opacity = 0.24
- placement = top-right narrative scenes

B. Five Video Pilot Table
video | scenes | attempt1 pass | attempt2 pass | attempt3 pass | blocked | layout | motion | typography | watermark | overall

C. Aggregate Metrics

D. Output Paths

E. Known Limitations
Include explicitly:
- cross-image character identity consistency is not required
- comparison pilots use scene-level assets
- internal visual-beat image swapping is disabled

F. Decision

Exactly one:
V3.6 5-VIDEO GENERALIZATION — PASS
or
V3.6 5-VIDEO GENERALIZATION — FAIL
or
V3.6 5-VIDEO GENERALIZATION — PAUSED_QUOTA

Then STOP.

Do not start Production Lock automatically.
Wait for human review.
