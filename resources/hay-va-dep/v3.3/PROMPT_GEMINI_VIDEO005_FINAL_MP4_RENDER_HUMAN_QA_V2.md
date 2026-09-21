# HAY & ĐẸP. — VIDEO005
# FINAL PRODUCTION MP4 RENDER + HUMAN VIDEO QA PACK
# IMAGE PHASE LOCKED — 16/16 PASS
# NO IMAGE GENERATION
# NO IMAGE EDITING
# NO ARCHITECTURE REWORK

Bạn đang tiếp tục project hiện tại sau khi toàn bộ image phase của Video005 đã hoàn tất Human Visual QA.

Đây là bước:

```text
FINAL PRODUCTION RENDER
→ HUMAN VIDEO QA
```

Không phải image iteration mới.

---

## 0. CURRENT VERIFIED STATE — SOURCE OF TRUTH

Video:

```text
Video005
Khi người thân kể chuyện, đừng vội sửa hộ
```

Brand:

```text
HAY & ĐẸP.
Điều hay để biết. Điều đẹp để giữ.
```

Image Human QA đã hoàn tất:

```text
PASS_HUMAN_QA = 16
PENDING = 0
HARD_FAIL = 0

IMAGE PHASE = COMPLETE
```

Không được reopen image phase.

---

## 1. FINAL SELECTED IMAGE SET

Final selected candidate directory:

```text
scratch/video005-production/final-image-candidate/
```

Use exactly:

```text
shot-01.jpg
shot-02.jpg
shot-03.jpg
shot-04.jpg
shot-05.jpg
shot-06.jpg
shot-07.jpg
shot-08.jpg
shot-09.jpg
shot-10.jpg
shot-11.jpg
shot-12.jpg
shot-13.jpg
shot-14.jpg
shot-15.jpg
shot-16.jpg
```

All 16 are Human-approved.

Do NOT:

```text
regenerate
replace
recompress unnecessarily
select older attempt
fallback to Attempt 2/3 versions
re-run cleanup
edit pixels
crop source JPGs
```

The final candidate directory is now the production visual SSOT for Video005.

---

## 2. IMAGE PHASE HARD LOCK

Forbidden:

```text
Cloudflare image generation
FLUX generation
any other image model
image regeneration
prompt revision
style prompt revision
story planner revision
shot grammar revision
visualMode revision
people contract revision
local raster cleanup
```

Counters for this task:

```text
Image-generation calls = 0
Image-edit operations = 0
```

If production render code attempts to regenerate any missing image:

```text
STOP
BLOCK
```

Do not silently rebuild images.

---

## 3. DO NOT CHANGE APPROVED VISUAL ARCHITECTURE

The following are locked:

```text
reference shot grammar
visual mode taxonomy
shot count = 16
selected image lineage
shot order
shot durations
motion baseline
typography baseline
watermark baseline
brand
spoken audio
subtitle content
timeline
CTA / OutroCard
```

No new visual phase.

No architecture refactor.

No "improvement" pass.

---


---

## 3A. TEMPLATE PROMOTION RULE — FIX REUSABLE ROOT CAUSES, NEVER VIDEO005-ONLY PATCHES

This render task must NOT proactively redesign or refactor the template.

However, if technical QA or Human Video QA reveals a real defect whose root cause is in a shared renderer, shared template, shared component, or reusable production runtime, DO NOT patch only Video005.

Required rule:

```text
actual MP4 defect
→ identify root cause
→ decide whether local-data-specific or reusable
```

If the defect is reusable/systemic:

```text
fix shared template / renderer / runtime
add regression test
re-render Video005
verify actual MP4 again
```

Forbidden:

```text
if (videoId === 'video005') ...
hard-coded Video005-only rendering exception
manual per-video crop override used to hide a shared bug
manual subtitle offset used to hide a shared layout bug
manual transition patch used to hide a shared fade bug
```

Examples of reusable defects that MUST be fixed at template/runtime level:

```text
blank/black frame at hard cut
fadeInFrames=0 incorrectly falling back to non-zero fade
outer artwork window shifting off-center
DETAIL/CLOSE crop rules cutting important content
EMPTY_RELEASE losing breathing room because shared zoom is too aggressive
subtitle layout overlapping artwork systematically
watermark clipping/flicker
shared motion preset producing bounce/spring/rotation
source asset selection resolving to historical/rejected asset
timeline/audio sync bug caused by shared renderer logic
```

Examples of defects that may remain local to Video005 data/assets:

```text
a single source image has a unique artifact
one narration timing entry is wrong only in this video's data
one selected source path is wrong only in this video's manifest
```

Even for local defects, prefer fixing the data/manifest source of truth rather than adding renderer conditionals.

The objective of Video005 is not only to produce one good MP4.

It is also the production acceptance test for the reusable HAY & ĐẸP. video template.

Promotion rule:

```text
Video005 actual MP4 PASS
+
no unresolved reusable renderer/template defect
=
template eligible for subsequent videos / batch production
```

Do not mark the template production-ready merely because Remotion successfully produced a file.


## 4. VIDEO TIMELINE SOURCE

Use current production timeline/story plan.

Known final recovery manifest values:

```text
totalShots = 16
totalFrames = 1370
durationSeconds ≈ 45.67s
```

Audio/timeline must remain aligned with current canonical production content.

Do not resynthesize narration unless current production render literally cannot find the already-approved audio asset.

If audio asset is missing:

```text
STOP
REPORT BLOCKER
```

Do not create a new voice implicitly.

---

## 5. AUDIO CONTENT LOCK

Canonical ending remains:

```text
“Khi bạn mệt, bạn thích người khác lắng nghe trước hay đưa giải pháp ngay?”
```

Legacy spoken brand:

```text
NẾP.
```

must NOT return.

Visual OutroCard uses:

```text
HAY & ĐẸP.
Điều hay để biết. Điều đẹp để giữ.
```

Do not append spoken brand audio.

---

## 6. MOTION BASELINE — LOCKED

Accepted motion baseline:

```text
calm
subtle
no bounce
no spring
no rotation
light atmospheric/background movement
hard cuts
```

Do NOT create a new motion version.

Do not use camera movement to compensate for imagery.

Shot changes must remain perceptible because the imagery itself is different.

---

## 7. HARD CUT RULE

Narrative shots use hard cuts.

Avoid:

```text
crossfade between narrative images
dip-to-black between ordinary shots
white flash
blank frame transition
opacity gap
scene fade exposing empty canvas
```

At the exact transition frame:

```text
previous image coverage
→ immediate next image coverage
```

There must not be a frame where both images are effectively invisible.

---

## 8. SPECIFIC HISTORICAL BLANK-FRAME REGRESSION TO GUARD AGAINST

A previous implementation had:

```text
fadeInFrames = 0
fadeOutFrames = 0
```

but fallback code like:

```js
fadeInFrames || 8
```

converted `0` into `8`, causing:

```text
opacity ≈ 0
```

around scene transitions and exposing the empty background.

Verify current production code does NOT regress to this behavior.

Correct principle:

```text
0 means no fade
```

not:

```text
0 means fallback duration
```

Do not change accepted motion unless needed to prevent an actual blank-frame bug.

---

## 9. ARTWORK FRAMING LOCK

Outer artwork window:

```text
CENTERED
```

Internal focal bias may use:

```text
editorial-left
editorial-right
```

but must NOT shift the whole artwork card off-center.

Human QA must verify:

```text
no unexpected horizontal drift
no image card jump between shots
no clipping of important subject
no accidental zoom beyond safe crop
```

---

## 10. TYPOGRAPHY BASELINE — LOCKED

Previously accepted typography:

```text
headline larger than old version
subtitle appropriately enlarged
artwork lowered for breathing room
```

Do not redesign.

Human Video QA should only verify:

```text
headline readable
subtitle readable
safe margins respected
no overlap with artwork
no sudden typography repositioning
```

Do not tune font sizes unless there is an actual production rendering bug.

---

## 11. WATERMARK BASELINE — LOCKED

Accepted watermark:

```text
top-right
clear enough
V1.2.1 baseline
```

Do not revise styling or position.

QA only:

```text
present
not clipped
not flickering
not unexpectedly changing opacity
```

---

## 12. SUBTITLE QA

Subtitle must:

```text
match spoken narration
remain legible
stay inside safe area
not collide with UI / artwork / brand
not disappear too early
not lag noticeably behind audio
```

Check at least:

```text
first sentence
middle dialogue section
question sentence
final sentence
```

Do not rewrite subtitle copy.

---

## 13. FINAL IMAGE ASSET INTEGRITY

Before render:

Compute SHA-256 of all 16 selected files in:

```text
scratch/video005-production/final-image-candidate/
```

After render:

verify these source files remain unchanged.

Expected:

```text
16/16 source images unchanged
```

Rendering must be read-only against selected source assets.

---

## 14. SELECTED-ASSET PATH AUDIT

Before render, produce an explicit mapping:

```text
shot-01 → final-image-candidate/shot-01.jpg
...
shot-16 → final-image-candidate/shot-16.jpg
```

Assert:

```text
16 mappings
16 files exist
0 duplicates caused by wrong path
0 references to rejected Attempt-3 asset for 05/15
```

Important:

```text
shot-05
shot-15
```

must use the final locally cleaned files from `final-image-candidate`, not historical recovery originals.

---

## 15. RENDER PRODUCTION MP4

Render using the real production Remotion pipeline.

Do not create a fake slideshow script.

Do not manually stitch images with ffmpeg as a replacement for the application pipeline unless ffmpeg is already an internal final encoding stage after Remotion.

Expected:

```text
Remotion production render = 1
Final MP4 = 1
```

No multiple quality renders unless the first fails technically.

Do not loop rendering for aesthetic experimentation.

---

## 16. OUTPUT DIRECTORY

Create a final production review directory, for example:

```text
scratch/video005-production/final-video-review/
```

Include:

```text
video005-final.mp4
render-report.json
selected-assets.json
source-image-hash-audit.json
timeline-audit.json
video-qa-checklist.json
```

Also create lightweight review artifacts if useful:

```text
frame-contact-sheet.jpg
transition-strip.jpg
```

These should come from the actual rendered MP4, not from source images alone.

---

## 17. RENDER REPORT

`render-report.json` should include:

```text
videoIndex
title
outputPath
durationSeconds
totalFrames
fps
resolution
audioDuration
timelineDuration
shotCount
selectedImageCount
renderStart
renderEnd
renderSuccess
imageGenerationCalls
imageEditCalls
remotionRenderCount
mp4Count
```

Expected:

```text
shotCount = 16
selectedImageCount = 16
imageGenerationCalls = 0
imageEditCalls = 0
remotionRenderCount = 1
mp4Count = 1
```

---

## 18. TIMELINE INTEGRITY

Verify:

```text
totalFrames expected ≈ 1370
duration expected ≈ 45.67s
```

Allow only deterministic differences explained by:

```text
fps rounding
audio frame alignment
known production timing logic
```

If duration unexpectedly changes by a meaningful amount:

```text
STOP
REPORT
```

Do not silently adjust shot timing.

---

## 19. AUDIO / VIDEO SYNC AUDIT

Verify:

```text
audio starts correctly
no initial silence bug
no audio truncation
no tail cut-off
final question fully audible
visual timeline covers full voice duration
no extra frozen dead air after narration
```

Report:

```text
audioDuration
videoDuration
difference
```

A very small frame-rounding difference is acceptable.

---

## 20. BLANK FRAME / FLASH AUDIT

Programmatically inspect actual rendered MP4 around every shot boundary.

For all 15 transitions:

sample frames around:

```text
N-1
N
N+1
```

Detect obvious:

```text
black frame
white frame
empty canvas
opacity collapse
unexpected flash
```

Do not rely only on metadata.

If practical, output:

```text
transition-strip.jpg
```

showing boundary frames.

Acceptance:

```text
15/15 transitions visually covered
0 blank-frame transitions
```

---

## 21. ACTUAL MP4 FRAME REVIEW

Human review artifacts must derive from the actual final video.

Create a contact sheet sampled from MP4, for example:

```text
1 representative rendered frame per shot
```

This is specifically to verify that:

```text
source image selection
crop
motion
overlay
subtitle
watermark
```

all survive actual composition.

Do NOT reuse the pre-render image contact sheet and call it video QA.

---

## 22. SHOT RHYTHM QA

Human Video QA must assess the actual MP4 for:

```text
WIDE
→ MEDIUM
→ CLOSE
→ DETAIL
→ RELEASE
```

not necessarily strict repeating order, but visual changes must be perceptible.

The video should not feel like:

```text
same sofa medium
same portrait framing
static slideshow
```

Known reference-derived target:

```text
~18–22 meaningful visual changes/minute
```

Current video:

```text
16 shots
~45.7 sec
≈21 changes/min
```

which is structurally appropriate.

Do NOT add cuts merely to increase CPM.

---

## 23. STATIC-SLIDESHOW CHECK

Check actual experience at normal playback speed.

Questions:

```text
Does each shot feel intentionally selected?
Are close/detail/wide differences obvious?
Does motion remain subtle rather than dead?
Does any image stay visually unchanged for too long?
Does the video feel calm without feeling frozen?
```

Do not solve perceived slowness by aggressive zoom.

Semantic progression is more important than movement amplitude.

---

## 24. SHOT-SPECIFIC VIDEO QA

Pay extra attention to the former problem slots.

### shot-03

Verify rendered crop still shows:

```text
one person only
no accidental crop exposing unwanted background artifact
```

### shot-05

Verify:

```text
final cleaned asset selected
pseudo-text not visible
action detail remains readable after crop
phone/hand not cropped awkwardly
```

### shot-11

Verify:

```text
no pseudo-text appears
close framing not over-zoomed
```

### shot-13

Verify:

```text
two cups + phone detail remains readable
0 humans
object-detail crop stays intact
```

### shot-15

Verify:

```text
final cleaned asset selected
signature absent
release framing keeps sufficient negative space
motion does not zoom so aggressively that release feeling is lost
```

---

## 25. TITLE / BRAND QA

Verify actual MP4:

```text
HAY & ĐẸP.
```

spelling/diacritics correct.

Slogan:

```text
Điều hay để biết. Điều đẹp để giữ.
```

if shown in approved composition.

No legacy visual:

```text
NẾP.
```

unless intentionally present in historical content—which it should not be in Video005 final production.

---

## 26. NO NEW CONTENT

Do not add:

```text
new title sentence
new CTA
new ending
new narration
new music
new sound effect
new logo animation
new captions
new intro
new outro
```

This task is render + QA, not creative revision.

---

## 27. HUMAN VIDEO QA STATE

After successful render:

Do NOT automatically call the video production-approved.

State:

```text
PENDING_HUMAN_VIDEO_QA
```

Automated checks can PASS technically.

But final production gate requires human review of actual MP4.

---

## 28. REQUIRED QA CHECKLIST

Create:

```text
video-qa-checklist.json
```

with at least:

```text
SOURCE_ASSET_SELECTION
SOURCE_ASSET_HASH_INTEGRITY
AUDIO_PRESENT
AUDIO_TIMELINE_SYNC
SUBTITLE_LEGIBILITY
TYPOGRAPHY_BASELINE
WATERMARK_BASELINE
ARTWORK_CENTERING
NO_BLANK_FRAMES
NO_FLASH_TRANSITIONS
SHOT_CHANGE_VISIBILITY
SHOT_LANGUAGE_RHYTHM
MOTION_CALM
NO_EXCESSIVE_ZOOM
NO_STATIC_SLIDESHOW_FEEL
FINAL_QUESTION_COMPLETE
OUTRO_BRAND_CORRECT
```

Each can be:

```text
PASS_AUTOMATED
PENDING_HUMAN
FAIL
```

Do not label subjective checks Human-PASS automatically.

---

## 29. TESTS

Before render, run relevant production tests.

Then render.

After render, run video-specific validation if available.

Finally:

```bash
npm test
```

Do not spend time creating a huge new test framework.

Only add regression tests if an actual final-render bug is found.

---

## 30. STOP CONDITIONS

STOP without rendering if:

```text
any of 16 selected images missing
selected asset path mismatch
shot-05 or shot-15 points to historical uncleaned asset
audio missing
timeline invalid
source asset hash changed unexpectedly
```

STOP after render if:

```text
blank frames detected
audio truncated
major timing mismatch
wrong source image used
render crashes
```

Do not attempt creative automatic fixes.

Report blocker first.

---

## 31. SIDE-EFFECT COUNTERS

Final report must explicitly state:

```text
Cloudflare image-generation calls: 0
Other image-generation calls: 0
Image-edit operations: 0

Remotion production renders: N
Final MP4 files created: N
```

Expected successful run:

```text
Remotion production renders: 1
Final MP4 files created: 1
```

---

## 32. FINAL REPORT FORMAT

When completed, report exactly:

### A. Pre-render gate

```text
16/16 selected assets found
16/16 correct paths
16/16 hashes recorded
audio found
timeline valid
```

### B. Render execution

```text
render command
resolution
fps
total frames
duration
output MP4 path
render count
```

### C. Audio/timeline

```text
audio duration
video duration
difference
final question complete
```

### D. Transition audit

```text
transitions checked = 15
blank frames = X
flash frames = X
```

### E. Selected-asset verification

Explicitly verify at least:

```text
shot-03
shot-05
shot-11
shot-13
shot-15
```

Especially:

```text
shot-05 uses final cleaned asset
shot-15 uses final cleaned asset
```

### F. Visual rhythm

Report actual MP4 observations for:

```text
wide
medium
close
detail
release
```

Do not simply repeat planner metadata.

### G. Brand / subtitle / watermark

Report their actual rendered state.

### H. Tests

Provide exact focused/full suite counts.

### I. Side-effect counters

```text
Cloudflare image-generation calls: 0
Other image-generation calls: 0
Image-edit operations: 0
Remotion production renders: 1
Final MP4 files created: 1
```

### J. Human Video QA artifacts

Provide paths:

```text
scratch/video005-production/final-video-review/video005-final.mp4
scratch/video005-production/final-video-review/render-report.json
scratch/video005-production/final-video-review/frame-contact-sheet.jpg
scratch/video005-production/final-video-review/transition-strip.jpg
scratch/video005-production/final-video-review/video-qa-checklist.json
```

End with exactly:

```text
READY FOR HUMAN VIDEO QA — FINAL MP4 RENDERED FROM 16/16 HUMAN-APPROVED IMAGE ASSETS
```

If render or technical QA fails, instead:

```text
FINAL VIDEO BLOCKED — DO NOT PROMOTE TO PRODUCTION
```

---

## 33. MOST IMPORTANT PRINCIPLE

The image pipeline is finished.

Do not reopen it.

Current task is only:

```text
16/16 approved images
→ real production Remotion render
→ inspect actual MP4
→ Human Video QA
```

Do not confuse:

```text
successful render
```

with:

```text
successful final video
```

The actual MP4 still needs Human Video QA before batch-production promotion.
