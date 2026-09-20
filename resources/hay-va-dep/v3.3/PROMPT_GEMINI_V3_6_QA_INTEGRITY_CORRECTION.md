# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6 QA INTEGRITY CORRECTION
# OFFLINE FIRST — DO NOT REGENERATE IMAGES YET
# MODEL POLICY REMAINS: @cf/black-forest-labs/flux-1-schnell ONLY

## WHY THIS FIX IS REQUIRED

The current V3.6 runner cannot legitimately claim visual QA PASS.

Current bug:

```js
evaluateQa(...)
```

only checks that the image buffer is large enough, then returns:

```text
STYLE = PASS
PEOPLE_CONTRACT = PASS
SEMANTIC_FIDELITY = PASS
ANATOMY = PASS
TEXT_POLLUTION = PASS
```

without actually visually evaluating the image.

The cached-asset branch also auto-labels existing files PASS.

Therefore the current:

```text
V3.6 5-VIDEO GENERALIZATION — PASS
```

is NOT a valid production-readiness verdict yet.

This task fixes QA integrity while REUSING all existing generated assets.

Do NOT regenerate all images.
Do NOT call another model.
Do NOT change the locked visual baseline.

---

# 1. KEEP ALL LOCKED BASELINES

Keep:

```text
model = @cf/black-forest-labs/flux-1-schnell ONLY
style = clean 2D cartoon / illustrated editorial
cross-image identity consistency = NOT REQUIRED
watermark = top 40 / right 40 / width 250 / opacity 0.24
scene-level comparison pilot
visualBeats = undefined
centered framing
current motion grammar
current title/subtitle system
```

---

# 2. REMOVE FAKE AUTOMATIC VISUAL QA

Delete / disable any code path where file size alone causes all five visual dimensions to PASS.

`evaluateQa()` may only perform MACHINE-INTEGRITY checks such as:

```text
file exists
buffer decodes
minimum dimensions
non-corrupt image
```

It MUST NOT decide:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

from buffer size or prompt text.

Those five dimensions require an explicit visual QA record.

---

# 3. EXISTING ASSETS MUST BECOME PENDING REVIEW

Do NOT delete existing V3.6 images.

For existing assets in:

```text
video001
video005
video007
video013
video028
```

preserve the files but represent QA as:

```text
PENDING_VISUAL_QA
```

unless they already have a legitimate human-reviewed QA record from the earlier hardened V3.4A workflow.

For `video001`, reused V3.4A selected images may retain their previously human-reviewed QA status.

For fresh V3.6 assets in 005 / 007 / 013 / 028:
do NOT trust the old auto-PASS records.

---

# 4. CREATE A REVIEW MANIFEST

For every existing V3.6 shot create review metadata:

```json
{
  "videoKey": "video005",
  "shotIndex": 1,
  "file": "assets/shot-01.jpg",
  "voice": "...",
  "sceneText": "...",
  "peopleContract": "...",
  "qaStatus": "PENDING_VISUAL_QA",
  "qa": null
}
```

Save per video:

```text
visual-review.json
```

Also create:

```text
scratch/v36/generalization/visual-review-summary.json
```

---

# 5. KEEP / REBUILD CONTACT SHEETS

Create or preserve one contact sheet per video:

```text
video001/contact-sheet.jpg
video005/contact-sheet.jpg
video007/contact-sheet.jpg
video013/contact-sheet.jpg
video028/contact-sheet.jpg
```

External labels must include:

```text
Shot number
people contract summary
short semantic intent
```

Do not stamp PASS on unreviewed images.

Use:

```text
PENDING QA
```

for fresh V3.6 assets.

---

# 6. ADD EXPLICIT QA RECORDING

Implement a generalized CLI such as:

```bash
node scripts/run-v36-generalization.mjs --record-qa \
  --video video005 \
  --shot 1 \
  --style PASS \
  --people PASS \
  --semantic PASS \
  --anatomy PASS \
  --text PASS \
  --reason "..."
```

Required guards:

```text
asset exists
shot exists
QA not already finalized unless explicit --force is provided
all five values are exactly PASS or FAIL
```

Overall shot PASS only if all five PASS.

If any fail:

```text
shot status = NEEDS_REGEN
```

Do NOT automatically regenerate during this offline correction task.

---

# 7. FIX CURRENT TEXT REGRESSION

In current V3.6 `video001` runner config, fix:

```text
nghe vài tô chuyện vụn
```

to:

```text
nghe vài câu chuyện vụn
```

Do not change other authored narration.

---

# 8. SUMMARY MUST NOT BE HARDCODED PASS

Remove hard-coded PASS conclusions from:

```text
qa-report.json
evaluation.md
summary.json
summary.md
```

Derive status from actual recorded QA.

Valid per-video states:

```text
PENDING_VISUAL_QA
PASS
NEEDS_REGEN
BLOCKED_ASSET
PAUSED_QUOTA
```

Overall V3.6 must remain:

```text
PENDING_VISUAL_QA
```

until all required shots have real QA records.

---

# 9. NO IMAGE GENERATION IN THIS TASK

Do NOT call Cloudflare.

Do NOT create replacement images yet.

This task only:
- fixes QA integrity;
- preserves existing assets;
- prepares them for real visual review.

---

# 10. TESTS

Add focused tests proving:

1. buffer size alone can never cause visual PASS;
2. cached assets are not automatically visual PASS;
3. fresh V3.6 assets migrate to `PENDING_VISUAL_QA`;
4. video001 legitimately reviewed V3.4A assets may remain PASS;
5. `--record-qa` validates all five dimensions;
6. one failed dimension => `NEEDS_REGEN`;
7. all five PASS => shot PASS;
8. per-video PASS is derived, not hardcoded;
9. overall summary cannot say PASS while any shot is pending;
10. typo is `câu chuyện vụn`.

No network calls.

---

# 11. FINAL STATE

Expected after this correction:

```text
video001 = PASS or reviewed state from V3.4A
video005 = PENDING_VISUAL_QA
video007 = PENDING_VISUAL_QA
video013 = PENDING_VISUAL_QA
video028 = PENDING_VISUAL_QA

V3.6 overall = PENDING_VISUAL_QA
```

Keep all current image files and pilot MP4s.

---

# 12. REPORT

Return:

## A. Root Cause
## B. Files Changed
## C. QA State Migration
## D. Review Artifact Paths
## E. `--record-qa` Contract
## F. Tests
## G. Current V3.6 Status

Final verdict exactly:

```text
V3.6 QA INTEGRITY CORRECTION — PASS
```

or:

```text
V3.6 QA INTEGRITY CORRECTION — FAIL
```

Then STOP.

Do NOT start regeneration.
Do NOT start Production Lock.
Wait for human visual review.
