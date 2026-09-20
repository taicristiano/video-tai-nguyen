# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6 FINAL HUMAN QA + PRODUCTION LOCK
# NO IMAGE GENERATION
# NO CLOUDFLARE CALLS

## FINAL HUMAN REVIEW DECISION

The two remaining deterministic-cleanup assets are accepted at production threshold.

### video013 / shot02 — PASS

Record:

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Calendar/planning sheet and writing-like marks were removed.
The remaining tiny wall speck is a minor raster-cleanup blemish, not readable text,
pseudo-text, a signature, logo, or watermark, and is acceptable at production threshold.
The main scene remains a clean 2D illustration with one adult explaining/thinking at a desk.
```

### video028 / shot06 — PASS

Record:

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Apple-like logo was fully removed from the laptop lid.
No letterbox/side-bar artifact remains.
The scene clearly communicates one adult leaning back and disengaging from work;
the laptop is a separate secondary object and is acceptable at production threshold.
```

Use the existing `--record-qa` contract.
Do not use `--force` unless the current shot state requires it.

Expected after recording:

```text
video001 = PASS
video005 = PASS
video007 = PASS
video013 = PASS
video028 = PASS

30 PASS
0 PENDING
0 NEEDS_REGEN

overall V3.6 = PASS
```

---

# RERENDER ONLY PILOTS WHOSE ASSETS CHANGED

Do NOT regenerate images.

The following pilot MP4s are stale because their assets changed after the previous render:

```text
video007
video013
video028
```

Do NOT rerender video001 or video005.

Before replacing each stale MP4:
- archive the existing MP4;
- keep existing manifests and assets;
- make zero Cloudflare calls.

Preferred archive paths:

```text
scratch/v36/generalization/video007/archive/pilot-before-final-assets.mp4
scratch/v36/generalization/video013/archive/pilot-before-final-assets.mp4
scratch/v36/generalization/video028/archive/pilot-before-final-assets.mp4
```

Then rerender the three pilots from the CURRENT canonical assets and current PilotRoot/baseline.

Output canonical paths remain:

```text
scratch/v36/generalization/video007/pilot.mp4
scratch/v36/generalization/video013/pilot.mp4
scratch/v36/generalization/video028/pilot.mp4
```

Preserve:

```text
@cf/black-forest-labs/flux-1-schnell image policy
scene-level clean assets
visualBeats={undefined} for comparison/generalization pilots
centered comparison framing
focalPoint={undefined}
V3.4A motion grammar
hard cuts
V3.5A typography
watermark top=40 right=40 width=250 opacity=0.24
audio/SFX
```

---

# FINAL VERIFICATION

Run:

```text
npm test
```

Verify:

```text
all tests pass
all 5 video statuses PASS
overall summary PASS
30/30 shots PASS
0 pending
0 needs regen
three rerendered MP4s exist and are non-empty
video001/video005 MP4s remain untouched
no Cloudflare/image-generation calls occurred
```

Update:

```text
scratch/v36/generalization/summary.json
scratch/v36/generalization/summary.md
scratch/v36/generalization/visual-review-summary.json
```

---

# CREATE PRODUCTION LOCK DOCUMENT

Create:

```text
docs/HAY_DEP_PRODUCTION_LOCK.md
```

This document is the canonical production baseline.

Include the following LOCKED decisions.

## 1. Image Model

```text
@cf/black-forest-labs/flux-1-schnell ONLY
```

Never switch image model without an explicit new human decision.

## 2. Image Style

```text
Clean 2D illustrated / cartoon editorial
Non-photorealistic
Warm ivory / cream
Muted sage
Warm wood
Charcoal / sepia linework
Restrained terracotta / amber
```

## 3. Identity

```text
Cross-shot character identity consistency is NOT required.
```

Do not spend retries trying to match the same face/person across shots.

## 4. Per-Image QA

Every image is judged independently on:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

All five must PASS.

Machine integrity MUST NEVER automatically imply visual PASS.

## 5. Retry Policy

```text
maximum 3 real generated attempts per asset
HTTP 429 does not consume a visual attempt
HTTP 429 => PAUSED_QUOTA
no account rotation
no model switching
```

After 3 generation failures:
- do NOT make Attempt 4 automatically;
- if the remaining defect is local and deterministic (logo, pseudo-text, small border artifact),
  deterministic raster cleanup is allowed;
- cleanup result returns to PENDING_VISUAL_QA and requires explicit visual review.

## 6. Framing

For scene-level clean comparison assets:

```text
editorial-left / editorial-right -> portrait-focus
focalPoint = undefined
```

Avoid asymmetric legacy framing for balanced square assets.

## 7. Motion

Lock the accepted V3.4A deterministic calm motion grammar.

No:
- bounce
- spring
- rotation
- opacity dip at narrative cuts
- decorative motion for its own sake

Hard cuts remain baseline.

## 8. Brand Watermark

Exact asset:

```text
public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
```

Narrative scenes:

```text
position = top-right
top = 40px
right = 40px
width = 250px
opacity = 0.24
animated = false
```

Do not center watermark inside narrative scenes.
Centered brand treatment is reserved for intro/outro when intentionally designed.

## 9. Typography

Lock current V3.5A title/subtitle baseline.

Title:
```text
maxWidth = 820
fontSize = 44
lineHeight = 1.32
maxLines = 2
top = 170
```

Subtitle:
```text
maxWidth = 860
fontSize = 38
lineHeight = 1.4
bottomPlacement = 14%
maxWords = 7
```

Canonical subtitle content/timing must not be silently rewritten by visual polish.

## 10. Safe Zones

```text
frame = 1080x1920
top brand/title zone = 0..300
center artwork = 300..1380
bottom subtitle zone = 1380..1920
```

## 11. Production QA Principle

No fake PASS.

A production asset may be marked PASS only from an explicit visual QA record
(human review or another explicitly approved visual-review mechanism).

File existence, file size, JPEG validity, prompt intent, or successful render do NOT prove visual quality.

## 12. V3.6 Evidence

Document:

```text
5 representative videos
30 scene-level assets
video001 family-emotional
video005 relationship/home-reset
video007 home-living
video013 dialogue/ideas
video028 notifications/work-life
```

Final accepted result:

```text
5/5 videos PASS
30/30 assets PASS
```

Note:

```text
V3.6 pilots are scene-level generalization pilots.
visualBeats are intentionally disabled in these comparison artifacts.
This does not claim exact production visual-beat rendering fidelity.
```

---

# OPTIONAL MACHINE-READABLE LOCK

Also create:

```text
docs/HAY_DEP_PRODUCTION_LOCK.json
```

with the same critical constants/model/QA/retry rules.

Do not change production code merely to satisfy this optional JSON if the Markdown lock is already complete.

---

# FINAL REPORT

Return:

## A. Final Human QA Recorded
## B. V3.6 Final Status
## C. Rerendered Pilots
## D. Tests
## E. Production Lock Paths
## F. Locked Baseline Summary
## G. Final Verdict

The final verdict must be exactly:

```text
HAY & ĐẸP. — PRODUCTION LOCK PASS
```

or:

```text
HAY & ĐẸP. — PRODUCTION LOCK FAIL
```

Then STOP.

Do not start a V3.7/V4 phase.
Do not perform new image research.
