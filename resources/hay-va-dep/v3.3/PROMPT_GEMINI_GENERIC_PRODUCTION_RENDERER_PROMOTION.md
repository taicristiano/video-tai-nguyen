# HAY & ĐẸP. — GENERIC PRODUCTION RENDERER PROMOTION
# VIDEO005 AS REGRESSION ACCEPTANCE TEST
# PRIORITY: FIX SHARED TEMPLATE / RUNTIME SO ALL FUTURE VIDEOS INHERIT THE FIXES
# NO IMAGE GENERATION
# NO VIDEO005-ONLY PATCHES

Bạn đang tiếp tục project hiện tại sau khi:

```text
Video005 image phase = PASS 16/16
Video005 final MP4 Human Video QA = PASS
```

Video005 hiện render đẹp và ổn, nhưng production renderer vẫn còn các phần hard-code riêng cho Video005.

Mục tiêu của task này KHÔNG phải “làm Video005 đẹp hơn”.

Mục tiêu là:

```text
promote renderer hiện tại
→ thành generic production renderer
→ dùng được cho Video006, Video007... chỉ bằng data/config
→ không cần coder sửa VideoContent.tsx mỗi video
```

Video005 sẽ được dùng làm regression acceptance test để chứng minh generic renderer không làm mất chất lượng hiện tại.

---

## 0. GOLDEN RULE — TEMPLATE FIRST

Nếu phát hiện lỗi/restriction có khả năng lặp lại ở video sau:

```text
FIX SHARED TEMPLATE / RUNTIME / RENDERER
```

KHÔNG vá riêng Video005.

Ưu tiên theo thứ tự:

```text
1. shared template
2. shared renderer/runtime
3. generic adapter / manifest loader
4. video-specific data/config

LAST RESORT:
video-specific rendering conditional
```

Forbidden:

```js
if (videoId === 'video005') { ... }
if (slug.includes('phan-5')) { ... }
```

và mọi hard-code tương đương.

Video-specific differences phải đi qua data/config, không đi qua conditional logic trong renderer.

---

# 1. CURRENT VERIFIED PROBLEM

Human review của source hiện tại cho thấy production renderer vẫn hard-code Video005.

Các ví dụ cần inspect thật trong repo:

```text
src/Root.tsx
src/VideoContent.tsx
scripts/build-video005-final-render.mjs
```

Các pattern hiện tại có dạng:

```ts
const defaultSlug =
  'phan-5-2026-09-20-khi-nguoi-than-ke-chuyen-dung-voi-sua';

const defaultDuration = 1370;
```

và:

```ts
export const VIDEO005_SHOTS = [
  ...
];
```

Danh sách hard-code đang chứa các thông tin như:

```text
startFrame
endFrame
imageSrc
composition
shotScale
motionPreset
storyRole
title
```

Script render còn giả định:

```text
shot count = 16
totalFrames = 1370
Video005 slug
Video005 candidate directory
Video005 expected duration
```

Đây phải được loại bỏ khỏi reusable production path.

---

# 2. TARGET ARCHITECTURE

Production render flow phải trở thành data-driven:

```text
videos/<slug>/
    production render data
          ↓
generic production adapter
          ↓
generic VideoContent / ProductionVideo
          ↓
shared HAY & ĐẸP. template components
          ↓
Remotion
          ↓
MP4
```

Không có source code riêng cho từng video.

Một video mới chỉ cần cung cấp data phù hợp.

Ví dụ conceptual:

```ts
type ProductionRenderSpec = {
  videoIndex: number;
  slug: string;
  title: string;
  brand: string;
  slogan?: string;

  fps: number;
  totalFrames: number;

  audioSrc: string;
  timelineSrc: string;

  shots: ProductionShot[];

  outro?: OutroConfig;
};
```

và:

```ts
type ProductionShot = {
  shotId: string;
  startFrame: number;
  endFrame: number;

  imageSrc: string;

  visualMode: string;
  shotScale: string;
  composition: string;
  motionPreset: string;
  storyRole: string;

  fadeInFrames?: number;
  fadeOutFrames?: number;
};
```

Không bắt buộc dùng đúng interface này.

Hãy dùng architecture sạch nhất phù hợp với repo hiện tại.

---

# 3. SOURCE OF TRUTH

Không tạo thêm một SSOT cạnh tranh nếu repo đã có dữ liệu đủ tốt.

Inspect:

```text
story-plan.json
spec.json
plan.json
props.json
production-readiness.json
final image candidate manifest
timeline.json
```

Xác định bộ dữ liệu nào thực sự nên trở thành production render input.

Nếu cần adapter:

```text
existing planner/output data
→ normalize
→ ProductionRenderSpec
```

thì tạo adapter reusable.

Không duplicate toàn bộ shot data bằng tay sang file TypeScript.

---

# 4. REMOVE VIDEO005 SHOT HARDCODING

`src/VideoContent.tsx` không được chứa:

```text
VIDEO005_SHOTS
```

hoặc danh sách shot cụ thể của bất kỳ video nào.

Nó phải nhận shot data qua props/spec.

Ví dụ:

```tsx
<VideoContent
  shots={renderSpec.shots}
  ...
/>
```

hoặc equivalent architecture.

Shared component chịu trách nhiệm render:

```text
any valid shot list
```

không biết Video005 là gì.

---

# 5. GENERIC ROOT METADATA

`src/Root.tsx` không được hard-code:

```text
Video005 slug
1370 frames
Video005 title
16 shots
```

Use Remotion dynamic metadata / input props / generic data loader.

Required principle:

```text
durationInFrames = renderSpec.totalFrames
fps = renderSpec.fps
width/height = shared template defaults or spec
```

Nếu video khác có:

```text
11 shots
1734 frames
52.8 seconds
```

Root phải hoạt động không cần sửa source.

---

# 6. GENERIC PRODUCTION RENDER COMMAND

Tạo generic production render entry point.

Preferred conceptual command:

```bash
node scripts/render-production-video.mjs --slug=<slug>
```

hoặc:

```bash
node scripts/render-production-video.mjs --spec=<path>
```

Không dùng production path chính là:

```text
build-video005-final-render.mjs
```

Video-specific script cũ có thể:

```text
deprecated wrapper
```

hoặc giữ để lịch sử/test, nhưng production SSOT mới phải generic.

Ví dụ:

```text
scripts/render-production-video.mjs
```

Responsibilities:

```text
load production spec
validate selected assets
validate timeline/audio
compute hash baseline
invoke Remotion
perform shared post-render audits
write review artifacts
```

---

# 7. SELECTED IMAGE RESOLUTION MUST BE GENERIC

Video renderer không được biết:

```text
Attempt 1
Attempt 2
Attempt 3
Recovery
Cleanup
```

Những thứ đó thuộc image-production lineage.

Renderer chỉ cần nhận:

```text
final selected asset for each shot
```

Ví dụ:

```text
shot.imageSrc
```

đã resolved từ production manifest.

For Video005 current production selection must still resolve to:

```text
final-image-candidate/shot-01.jpg
...
final-image-candidate/shot-16.jpg
```

Video006 có thể có folder/lineage hoàn toàn khác mà renderer vẫn chạy.

---

# 8. SHARED TEMPLATE FIX RULE

Nếu task này phát hiện bất kỳ vấn đề reusable nào, sửa ở shared layer.

Các file có thể liên quan:

```text
src/templates/human-insight/cinematic-light/Layout.tsx
src/templates/human-insight/cinematic-light/ImageScene.tsx
src/components/Subtitles.tsx
src/templates/human-insight/cinematic-light/storyPlannerRuntime.mjs
shared motion/framing utilities
```

Rule:

```text
shared defect
→ shared fix
→ regression test
```

Không:

```text
shared defect
→ video005 override
```

---

# 9. PRESERVE APPROVED SHARED FIXES

Không regress các fix đã tốt:

### Hard cuts

```text
fadeInFrames = 0
fadeOutFrames = 0
0 means 0
```

Không dùng:

```js
fadeInFrames || 8
```

nếu `0` là giá trị hợp lệ.

### Subtitle reliability

Giữ fix:

```text
delayRender / continueRender
```

nếu đó đang là shared solution đúng.

### Browser-safe runtime

Giữ shared runtime Remotion/Webpack compatible.

### Artwork framing

Outer artwork window:

```text
CENTERED
```

Internal crop/focal bias mới được left/right.

### Motion

```text
calm
subtle
no bounce
no spring
no rotation
```

### Image generation

Không được kích hoạt từ render path.

---

# 10. OUTROCARD MUST BE GENERIC

Inspect current shared contract around:

```text
outroComponentId: 'OutroCard'
Layout.tsx
scene.isOutro
```

Hiện production render Video005 có dấu hiệu tất cả scene được tạo:

```ts
isOutro: false
```

nên shared `OutroCard` capability có thể bị bypass.

Không hard-code Outro vào Video005.

Thiết kế generic rule.

Ví dụ:

```text
renderSpec.outro.enabled
renderSpec.outro.frames
renderSpec.outro.brand
renderSpec.outro.slogan
```

hoặc data-driven equivalent.

Quan trọng:

```text
OutroCard là capability của template
```

không phải special-case của một video.

Nếu production content config nói không dùng outro:

```text
no outro
```

Nếu config nói dùng:

```text
renderer renders generic OutroCard
```

### Video005 contract

Project đã từng khóa:

```text
HAY & ĐẸP.
Điều hay để biết. Điều đẹp để giữ.
```

ở visual OutroCard.

Inspect current intended production spec/source of truth và restore behavior qua GENERIC template/data path nếu contract vẫn active.

KHÔNG thêm spoken brand.

Nếu việc thêm Outro làm thay đổi timeline hiện tại, không tự ý kéo dài video.

Hãy xác định intended data contract trước và report rõ.

---

# 11. SUBTITLE BEHAVIOR MUST BE TEMPLATE-LEVEL

Không viết logic kiểu:

```text
hide subtitle on shot-16
show subtitle on video005 ending
```

Subtitle visibility phải dựa vào semantic scene state:

```text
normal narrative
insight card
section card
outro
question
```

not video ID.

Current fix cho ending question phải được generalize nếu chưa generic.

---

# 12. MOTION / SCALE MUST BE DATA-DRIVEN

Không hard-code per-shot motion trong source renderer.

Renderer nhận:

```text
motionPreset
composition
shotScale
```

từ production shot data.

Shared template translates these values into actual animation.

Future planner improvements therefore automatically flow into renderer.

---

# 13. ZERO IMAGE WORK

This task:

```text
Cloudflare calls = 0
image generation = 0
image editing = 0
```

Không regenerate Video005.

Không thay final images.

Không sửa image planner/prompt trừ khi compilation requires type/interface compatibility only.

---

# 14. BUILD A GENERIC VALIDATOR

Before render, shared production validator should verify:

```text
slug exists
title exists
fps valid
totalFrames valid
audio exists
timeline exists

shots.length >= 1

for every shot:
  shotId exists
  imageSrc exists
  startFrame valid
  endFrame > startFrame
  no negative duration
  no overlapping invalid bounds
  required render fields valid
```

Check timeline coverage.

No assumptions:

```text
shots === 16
frames === 1370
```

---

# 15. GENERIC POST-RENDER QA

Promote useful Video005 render audit into shared tooling where sensible:

```text
source-image hash integrity
audio/video duration probe
transition boundary sampling
blank/flash detection
frame contact sheet
transition strip
render report
video QA checklist
```

These should work for:

```text
N shots
N-1 transitions
arbitrary valid duration
```

No loop fixed to 15 transitions.

---

# 16. VIDEO005 REGRESSION ACCEPTANCE TEST

After genericization, render Video005 through ONLY the generic production path.

Do NOT use the old Video005-specific renderer.

Required:

```text
generic render
→ Video005
```

Acceptance:

```text
16/16 correct selected images
1370 frames unless justified generic Outro contract changes it
30fps
1080x1920
audio intact
0 blank frames
0 flash transitions
subtitle correct
watermark correct
calm motion
centered artwork
```

Compare to current approved MP4.

Goal:

```text
visually equivalent or better
```

No regressions.

---

# 17. GENERICITY PROOF — SECOND FIXTURE

Video005 alone cannot prove genericity.

Create a lightweight LOCAL renderer fixture/test using existing local assets.

NO image generation.

Fixture should differ materially:

```text
shot count != 16
totalFrames != 1370
different title
different slug
different shot durations
different mix/order of motion presets
```

Example:

```text
7 shots
~15–20 sec
```

Reuse existing local test assets if necessary.

The content itself does not matter.

Purpose:

```text
prove generic renderer works without any Video005 assumptions
```

At minimum generic integration tests must prove this.

Prefer a short actual Remotion render if reasonably cheap.

Do not treat this fixture as a publishable HAY & ĐẸP. video.

---

# 18. NO VIDEO-SPECIFIC SOURCE MODIFICATION TEST

Add a regression test that scans reusable renderer files and fails if they contain identifiers such as:

```text
VIDEO005_SHOTS
video005-production
phan-5-2026
1370 as Video005 duration constant
shot count == 16 production assumption
```

Be careful:

`1370` or `16` may legitimately appear in historical test fixtures.

The prohibition applies to GENERIC production runtime/source.

---

# 19. PRODUCTION MANIFEST / SPEC

Create or normalize a reusable production render manifest schema.

For Video005 it should describe:

```text
metadata
timeline/audio
selected shots
image paths
frame bounds
render properties
brand/outro config
```

Future video pipeline should output the same schema.

Ideal future flow:

```text
content + planner
→ image pipeline
→ Human QA selected images
→ production-render-spec.json
→ generic renderer
```

Renderer should not care how images were generated.

---

# 20. TEMPLATE PROMOTION REQUIREMENT

At task completion, explicitly answer:

```text
If I create Video006 tomorrow,
what files must be changed manually?
```

Target answer:

```text
No shared renderer/template source files.

Only new video data/assets/spec generated by pipeline.
```

If answer still includes:

```text
edit VideoContent.tsx
edit Root.tsx
add VIDEO006_SHOTS
edit render script constants
```

task is NOT complete.

---

# 21. TESTS

Add focused tests for generic renderer.

At minimum:

### A. arbitrary shot count

```text
7-shot fixture accepted
```

### B. arbitrary duration

No 1370 assumption.

### C. dynamic metadata

Root receives duration/title/slug from spec.

### D. asset mapping

N shots map N selected assets.

### E. transition audit

N shots => N-1 boundaries.

### F. no image generation

Renderer cannot trigger image generation.

### G. no Video005 hard-code

Reusable runtime does not depend on Video005 identifiers.

### H. Video005 regression

Video005 normalized generic spec still produces expected scene graph.

### I. Outro

Outro behavior comes from data/template config, not video ID.

Run focused suite, then:

```bash
npm test
```

---

# 22. HUMAN QA AFTER GENERIC VIDEO005 RENDER

Generate:

```text
scratch/video005-production/generic-render-review/
```

with:

```text
video005-generic.mp4
render-report.json
selected-assets.json
frame-contact-sheet.jpg
transition-strip.jpg
video-qa-checklist.json
```

State:

```text
PENDING_HUMAN_VIDEO_QA
```

Do not automatically production-pass subjective QA.

---

# 23. DO NOT DESTROY CURRENT GOLDEN VIDEO

Preserve current approved:

```text
scratch/video005-production/final-video-review/video005-final.mp4
```

Do not overwrite it.

Generic renderer produces a separate regression candidate:

```text
video005-generic.mp4
```

This allows direct comparison.

---

# 24. CHANGES THAT ARE ALLOWED

This task MAY modify reusable production files when required, including:

```text
Root.tsx
VideoContent.tsx
shared Layout/ImageScene/Subtitles
production renderer scripts
generic manifest adapter/loader
generic QA tooling
tests
types
```

BUT:

Any change should be reusable by future videos.

For every changed reusable file, report:

```text
why this belongs in shared template/runtime
how Video006+ benefits
```

---

# 25. CHANGES THAT ARE NOT ALLOWED

Do NOT:

```text
reopen image QA
change image model
change Video005 artwork
change approved subtitle text
rewrite narration
change brand
change accepted typography for aesthetic preference
increase motion just to look dynamic
add Video005-only renderer branches
```

---

# 26. FINAL ACCEPTANCE CRITERIA

Task passes only if:

```text
VIDEO005_SHOTS hard-code removed from production runtime

Root metadata is dynamic

generic production render script exists

shot count arbitrary
duration arbitrary
slug arbitrary
title arbitrary

selected images come from data/spec

motion/composition come from shot data

shared template handles rendering

Outro behavior is generic/data-driven

QA tooling handles N shots and N-1 cuts

no Video005-specific conditional

zero image generation/edit

Video005 generic re-render technically PASS

second non-16-shot fixture proves genericity

full tests PASS
```

And:

```text
future Video006 requires no manual edit
to Root.tsx / VideoContent.tsx / renderer constants
```

---

# 27. FINAL REPORT FORMAT

Report:

## A. Existing hard-codes found

List exact files/code paths.

## B. Generic architecture implemented

Show final flow:

```text
data/spec
→ generic adapter
→ generic renderer
→ shared template
→ Remotion
```

## C. Shared template/runtime changes

For each change:

```text
file
root cause
fix
benefit for future videos
```

## D. Removed Video005 assumptions

Report at least:

```text
VIDEO005_SHOTS
default Video005 slug
1370 hard-code
16-shot assumption
15-cut assumption
Video005 candidate path assumptions
```

## E. OutroCard

Explain final generic contract and whether Video005 uses it.

## F. Video005 regression render

Report:

```text
frames
duration
resolution
blank frames
flash frames
audio sync
selected asset integrity
```

## G. Generic fixture proof

Report:

```text
fixture shot count
fixture total frames
render/test result
```

## H. Future Video006 workflow

Explicitly state which files need manual source edits.

Expected:

```text
0 shared source files
```

## I. Tests

Exact focused/full counts.

## J. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Video005 generic Remotion renders: N
Fixture renders: N
```

## K. Review artifacts

Provide generic Video005 MP4/contact sheet/transition strip paths.

End with exactly one of:

```text
GENERIC PRODUCTION RENDERER READY FOR HUMAN REGRESSION QA
```

or:

```text
GENERIC RENDERER PROMOTION BLOCKED — DO NOT START VIDEO006
```

---

# 28. MOST IMPORTANT PRINCIPLE

Do not optimize only for Video005.

Every reusable fix in this task should answer:

```text
Will Video006, Video007 and later videos automatically receive this behavior?
```

If yes:

```text
shared template/runtime fix
```

If no and the behavior is reusable:

```text
implementation is incomplete
```

Target final production flow:

```text
new script/content
→ planner
→ approved images
→ generic production render spec
→ generic shared template renderer
→ MP4
```

without manually writing:

```text
VIDEO006_SHOTS
VIDEO007_SHOTS
...
```
