# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION BATCH 01
# FULL END-TO-END PREPARATION FOR 4 VIDEOS
# NO NEW RESEARCH PHASE
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## CONTEXT

Production Smoke Test 01 (video001) has passed on the real full production path:

- full 1442-frame render completed;
- visualBeats enabled as authored;
- all production assets human-QA PASS;
- final video QA PASS;
- production lock remains authoritative.

Do NOT reopen:
- image model research;
- style research;
- identity consistency research;
- motion research;
- watermark/typography redesign.

Authoritative lock:

```text
docs/HAY_DEP_PRODUCTION_LOCK.md
docs/HAY_DEP_PRODUCTION_LOCK.json
```

## BATCH TARGETS

Prepare and complete the remaining four V3.6 representative videos as FULL production videos:

```text
video005
video007
video013
video028
```

Use each video's canonical current spec/story plan in the repository.

Do NOT include video001; it is already production-approved.

---

# 1. IMAGE MODEL LOCK

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

No model switching.
No account rotation.

Style:

```text
clean 2D illustrated / cartoon editorial
non-photorealistic
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber
```

Cross-shot identity consistency is NOT required.

---

# 2. FULL PRODUCTION ASSET PLAN PER VIDEO

For EACH target video:

1. Read the full canonical spec.
2. Enumerate every required production visual slot:
   - scene image;
   - every active visualBeat image;
   - memory/release/question visual where applicable;
   - component-only cards such as OutroCard.
3. Build:

```text
scratch/production-batch-01/<videoKey>/asset-plan.json
scratch/production-batch-01/<videoKey>/asset-plan.md
```

Do not assume the 6-shot V3.6 pilot assets cover the full production timeline.

---

# 3. REUSE POLICY

An existing image may be reused only when ALL are true:

```text
explicit human visual PASS exists
semantic intent matches current production slot
people contract matches
asset has no known unresolved defect
```

Prefer already-approved V3.6 assets where they map exactly.

Do not reuse merely because a file exists.

---

# 4. PRODUCTION VISUAL BEATS

For FULL production renders:

```text
visualBeats MUST be enabled when authored
```

Do NOT use:

```tsx
visualBeats={undefined}
```

That override was only for comparison/generalization pilots.

Preserve authored:
- localStart/localEnd;
- image swapping;
- composition;
- shotScale;
- transition;
- motion profile;
- card overlays;
- audio/SFX.

---

# 5. IMAGE GENERATION + QA

For every NEW required asset:

Use Schnell only.

Visual QA dimensions:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

All five must PASS.

Machine integrity never implies visual PASS.

Retry:

```text
max 3 real generated attempts per asset
HTTP 429 -> PAUSED_QUOTA
429 does not consume an attempt
```

No Attempt 4 automatically.

After 3 real failures:
- deterministic local raster cleanup is allowed only for isolated local defects;
- cleaned asset returns to `PENDING_VISUAL_QA`;
- explicit human QA required.

---

# 6. HUMAN REVIEW GATE — IMPORTANT

Do NOT fake PASS.

For any newly generated or cleaned asset:

```text
qaStatus = PENDING_VISUAL_QA
qa = null
```

Create review pack per video:

```text
scratch/production-batch-01/<videoKey>/review-pack/
```

Include:
- direct copies of all PENDING assets;
- review-manifest.json;
- pending-contact-sheet.jpg.

The contact sheet must:
- be unclipped;
- use object-fit: contain;
- show full image;
- show slot / frame range / people contract / semantic intent / attempt.

If ANY required asset is pending, do NOT render that video's final MP4 yet.

---

# 7. BATCH EXECUTION ORDER

Process sequentially:

```text
video005 -> video007 -> video013 -> video028
```

Do not start the next video's Cloudflare generation if the current video hits PAUSED_QUOTA.

However, if current video simply reaches `PENDING_VISUAL_QA`, you MAY prepare the next video's asset plan and reuse analysis OFFLINE, but do not generate an uncontrolled large batch beyond the four named videos.

---

# 8. BRAND / TYPOGRAPHY / MOTION LOCK

Watermark:

```text
asset = public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
top = 40px
right = 40px
width = 250px
opacity = 0.24
animated = false
```

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

Motion:
- V3.4A calm deterministic grammar;
- hard cuts;
- no bounce / spring / rotation;
- no opacity dip at narrative cuts.

---

# 9. FINAL RENDER PER VIDEO

Only after EVERY required production asset for a video has explicit visual PASS:

Render:

```text
scratch/production-batch-01/<videoKey>/final.mp4
```

Use:
- full canonical frame count;
- 30 fps;
- 1080x1920;
- H.264;
- authored visualBeats active.

Export representative frames:
- hook;
- body;
- at least one visualBeat transition if present;
- memory/release if present;
- question/CTA;
- outro.

---

# 10. FINAL VIDEO QA PER VIDEO

Review actual rendered MP4.

Check at minimum:

```text
all assets load
no stale rejected asset
visualBeat timing correct
no blank edge exposure
no accidental framing drift
no opacity dip at cuts
title stable
subtitle readable/synchronized
watermark visible/non-obstructive
no text collision
audio/voice/SFX acceptable
question/CTA correct
outro correct
no visible text pollution
```

Save:

```text
final-video-qa.md
final-video-qa.json
run-summary.md
run-summary.json
```

A final MP4 must not be marked PASS from successful rendering alone.

---

# 11. TESTS

Run:

```text
npm test
```

Do not introduce another hardening phase unless a real production regression is found.

---

# 12. BATCH SUMMARY

Create:

```text
scratch/production-batch-01/batch-summary.md
scratch/production-batch-01/batch-summary.json
```

Report per video:

```text
required production slots
reused human-PASS assets
fresh generated assets
attempt1 / attempt2 / attempt3 counts
deterministic cleanups
pending assets
final render status
final video QA
```

---

# 13. STOP CONDITIONS / FINAL VERDICT

If any fresh assets need human review:

```text
HAY & ĐẸP. PRODUCTION BATCH 01 — PENDING_VISUAL_QA
```

Return all review-pack paths and STOP before rendering affected videos.

If quota stops generation:

```text
HAY & ĐẸP. PRODUCTION BATCH 01 — PAUSED_QUOTA
```

If all four full videos have all assets PASS, final renders complete, and final video QA PASS:

```text
HAY & ĐẸP. PRODUCTION BATCH 01 — PASS
```

Then STOP.

Do not start another batch automatically.
