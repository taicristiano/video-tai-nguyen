# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
# FULL END-TO-END VIDEO
# NO NEW RESEARCH PHASE
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## GOAL

Run ONE complete HAY & ĐẸP. production video end-to-end using the locked production baseline.

This is NOT another pilot phase.
This is NOT V3.7/V4.
This is a production smoke test.

Use:

```text
video001
Có những bữa cơm sau này mới hiểu là rất quý
```

Canonical spec:

```text
videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json
```

Expected full video length:

```text
1442 frames
30 fps
~48.1 seconds
```

Render ALL scenes including:
- hook
- body
- memory
- question
- outro

---

# 1. PRODUCTION LOCK IS AUTHORITATIVE

Read and obey:

```text
docs/HAY_DEP_PRODUCTION_LOCK.md
docs/HAY_DEP_PRODUCTION_LOCK.json
```

If anything in older prompts/spec helpers conflicts with the production lock, the production lock wins.

Do NOT redesign:
- image style
- motion grammar
- watermark
- typography
- retry policy
- QA contract

---

# 2. IMAGE MODEL

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Never switch model.
Never rotate account because of quota.

Image style:

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

# 3. PRODUCTION ASSET PLAN

Before generating anything, build a complete image requirement manifest for the FULL video.

Include:
- every scene-level image;
- every active visualBeat image;
- reused human-PASS asset if available;
- whether an asset needs fresh generation.

Save:

```text
scratch/production-smoke/video001/asset-plan.json
scratch/production-smoke/video001/asset-plan.md
```

## REUSE RULE

You MAY reuse an existing asset only when:

```text
1. it has an explicit human visual PASS record;
2. its semantic intent matches the current production slot;
3. its people contract matches;
4. it is free of known cleanup/regression issues.
```

Do NOT reuse an old asset merely because a path exists.

For the first 6 scenes, prefer the already human-approved V3.6/V3.4A clean assets where semantics match.

For later scenes / visual beats:
- inspect existing candidates;
- reuse only if explicitly approved;
- otherwise generate new clean assets.

---

# 4. PRODUCTION VISUAL BEATS ARE ACTIVE

Unlike the V3.6 comparison pilots, this full production render MUST use the actual authored production behavior.

Therefore:

```text
visualBeats ARE ENABLED when present in spec.json
```

Do NOT force:

```tsx
visualBeats={undefined}
```

for the production render.

Preserve:
- visualBeat start/end timing;
- visualBeat image changes;
- composition;
- shotScale;
- motionPreset;
- transition = cut;
- card overlays;
- title/subtitle;
- audio/SFX.

This smoke test specifically validates the exact production visual-beat path.

---

# 5. IMAGE QA

Every NEW or newly-cleaned production asset must pass explicit visual QA on:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

All five must PASS.

Machine integrity never implies visual PASS.

## Retry

```text
max 3 real generated attempts per asset
```

HTTP 429:
```text
PAUSED_QUOTA
```

- does not consume a visual attempt;
- stop cleanly;
- preserve state;
- do not switch model.

After Attempt 3:
- no Attempt 4 automatically;
- deterministic raster cleanup allowed only for local defects;
- cleaned asset returns to `PENDING_VISUAL_QA`.

---

# 6. NO FAKE QA

Do NOT auto-PASS based on:
- file size;
- JPEG validity;
- successful render;
- prompt match;
- cached path.

Every reused production asset needs prior explicit human PASS metadata.
Every fresh asset remains `PENDING_VISUAL_QA` until visually reviewed.

If any fresh asset is pending, STOP before final production render and report:

```text
PRODUCTION SMOKE TEST 01 — PENDING_VISUAL_QA
```

The final MP4 may only be rendered after all required production assets are PASS.

---

# 7. FRAMING

Use the production spec normally.

Do NOT globally normalize all production compositions to `portrait-focus`.

The previous V3.6 normalization was for scene-level square comparison assets only.

For production:
- preserve authored `composition`;
- preserve authored `shotScale`;
- preserve authored `visualContainer`;
- preserve authored visualBeat composition;
- preserve authored visualBeat shotScale.

Only fix a composition if an actual rendered defect is demonstrated.

---

# 8. MOTION

Use locked V3.4A calm deterministic motion grammar.

No:
- bounce
- spring
- rotation
- opacity dip on narrative cuts
- decorative animation

Hard cuts remain baseline.

Preserve authored story-role / motion mapping.

---

# 9. BRAND + TYPOGRAPHY

Watermark:

```text
asset = public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
top = 40px
right = 40px
width = 250px
opacity = 0.24
animated = false
```

Narrative scenes:
```text
top-right only
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

Do not silently rewrite canonical subtitle content/timing.

---

# 10. TYPO / CONTENT SAFETY CHECK

Verify the corrected canonical wording remains:

```text
nghe vài câu chuyện vụn
```

Never reintroduce:

```text
nghe vài tô chuyện vụn
```

Check:
- spec narration;
- audioSegment text;
- subtitle source;
- render timeline.

---

# 11. FULL PRODUCTION RENDER

Only after ALL required assets are visual PASS:

Render the exact full production video:

```text
scratch/production-smoke/video001/final.mp4
```

Expected:

```text
1442 frames
30fps
1080x1920
H.264
```

Also export representative frames from:

```text
hook
middle body
visual-beat change
memory scene
question scene
outro
```

Suggested outputs:

```text
frame-hook.png
frame-body.png
frame-visualbeat.png
frame-memory.png
frame-question.png
frame-outro.png
```

Create final contact sheet:

```text
production-contact-sheet.jpg
```

---

# 12. FINAL VIDEO QA

Review the FINAL rendered MP4, not only source images.

Check:

```text
1. no broken/missing image
2. no off-center accidental framing
3. no blank edge exposure
4. visualBeat changes occur at correct timing
5. no opacity dip at hard cuts
6. title stable
7. subtitle readable
8. watermark readable and non-obstructive
9. no title/subtitle/watermark collision
10. no face/action covered by watermark
11. SFX not overpowering voice
12. voice/subtitle timing coherent
13. memory/question/outro render correctly
14. no stale pre-cleanup asset
15. no known text pollution
```

Save:

```text
scratch/production-smoke/video001/final-video-qa.md
scratch/production-smoke/video001/final-video-qa.json
```

---

# 13. TESTS

Run:

```text
npm test
```

All existing tests must pass.

Add only focused tests if required for a real production-path regression.

Do NOT create another hardening phase.

---

# 14. OUTPUT STRUCTURE

Use:

```text
scratch/production-smoke/video001/
  asset-plan.json
  asset-plan.md
  assets/
  visual-review.json
  final.mp4
  production-contact-sheet.jpg
  frame-hook.png
  frame-body.png
  frame-visualbeat.png
  frame-memory.png
  frame-question.png
  frame-outro.png
  final-video-qa.md
  final-video-qa.json
  run-summary.md
  run-summary.json
```

---

# 15. FINAL DECISION

PASS requires:

```text
all required production assets PASS
full 1442-frame render succeeds
visualBeats render as authored
no major framing regression
no typography collision
no watermark collision
no subtitle timing/content regression
no visual text pollution
all tests pass
```

If assets still need human review:

```text
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — PENDING_VISUAL_QA
```

If quota stops generation:

```text
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — PAUSED_QUOTA
```

If all production gates pass:

```text
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — PASS
```

Then STOP.

Do not batch-generate more videos automatically.
Wait for human review before scaling production.
