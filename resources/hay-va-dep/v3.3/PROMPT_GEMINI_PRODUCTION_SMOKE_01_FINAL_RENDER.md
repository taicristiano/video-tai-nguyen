# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
# FINAL HUMAN QA + FULL PRODUCTION RENDER
# NO IMAGE GENERATION
# NO CLOUDFLARE CALLS

## FINAL HUMAN QA DECISION

The final cleaned asset is accepted.

### PASS — scene-08-beat-02

Record:
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS

Reason:
Deterministic cleanup successfully removed the extra side bowl and lower-right cropped white artifact.
The image now shows exactly:
1 main rice bowl,
1 small side bowl,
1 pair of chopsticks,
with zero people, zero phones/electronic devices, no text/logo/signature pollution, and a clean uninterrupted wooden tabletop.
The clean 2D editorial style remains intact.

Source:
HUMAN_QA_FINAL_CLEANUP

After recording, expected asset state:
all required production assets = PASS
0 pending
0 needs regen

Do NOT generate any more images.

## FULL PRODUCTION RENDER

Render the exact full VIDEO001 production timeline from the CURRENT canonical assets.

Canonical spec:
videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json

Expected:
1442 frames
30 fps
1080x1920
~48.07 seconds
H.264

Output:
scratch/production-smoke/video001/final.mp4

## IMPORTANT PRODUCTION PATH

This is the REAL production path.

visualBeats MUST be active when authored in spec.json.

Do NOT use the V3.6 comparison override:
visualBeats={undefined}

Preserve exact authored visual-beat timing:
- scene-08-beat-01
- scene-08-beat-02
- scene-09-beat-01
- scene-09-beat-02

Preserve:
- production composition
- production shotScale
- production visualContainer
- V3.4A motion grammar
- hard cuts
- title/subtitle timing
- SectionCard / InsightCard
- audio / SFX
- OutroCard
- watermark baseline

## LOCKED BRAND VALUES

Watermark:
asset = public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
top = 40px
right = 40px
width = 250px
opacity = 0.24
animated = false

Title:
maxWidth = 820
fontSize = 44
lineHeight = 1.32
maxLines = 2
top = 170

Subtitle:
maxWidth = 860
fontSize = 38
lineHeight = 1.4
bottomPlacement = 14%
maxWords = 7

Canonical phrase must remain:
nghe vài câu chuyện vụn

Never reintroduce:
nghe vài tô chuyện vụn

## REPRESENTATIVE FRAME EXPORTS

Export from the rendered production composition:
scratch/production-smoke/video001/frame-hook.png
scratch/production-smoke/video001/frame-body.png
scratch/production-smoke/video001/frame-visualbeat-1.png
scratch/production-smoke/video001/frame-visualbeat-2.png
scratch/production-smoke/video001/frame-memory.png
scratch/production-smoke/video001/frame-question.png
scratch/production-smoke/video001/frame-outro.png

Make sure at least one export captures:
- scene-08-beat-01
- scene-08-beat-02
- scene-09-beat-01
- scene-09-beat-02

## FINAL VIDEO QA

Review the actual rendered MP4 / representative frames.

Check:
1. all assets load correctly
2. no stale Attempt-1/2/3 pre-cleanup image appears
3. scene-08 visual beat switches at authored timing
4. scene-09 memory echo switches at authored timing
5. no accidental crop / blank edge exposure
6. no off-center framing regression
7. no opacity dip at hard cuts
8. title stable
9. subtitle readable and synchronized
10. watermark readable and non-obstructive
11. watermark does not cover faces/actions
12. no title/subtitle/watermark collision
13. SFX does not overpower voice
14. question scene renders correctly
15. outro renders correctly
16. no visible text pollution in production visuals

Save:
scratch/production-smoke/video001/final-video-qa.md
scratch/production-smoke/video001/final-video-qa.json

## TESTS

Run:
npm test

All tests must pass.

Do not add new tests unless a real production-path regression is discovered.

## FINAL OUTPUTS

Confirm existence and non-zero size of:
scratch/production-smoke/video001/final.mp4
scratch/production-smoke/video001/final-video-qa.md
scratch/production-smoke/video001/final-video-qa.json
scratch/production-smoke/video001/run-summary.md
scratch/production-smoke/video001/run-summary.json

Update production smoke-test summary to:
all production assets PASS
full render complete
final video QA complete

## FINAL VERDICT

If all gates pass:
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — PASS

If the render or production-path QA exposes a real regression:
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — FAIL

Then STOP.

Do not batch-generate more videos.
Do not start a new research phase.
Wait for human review of the final MP4.
