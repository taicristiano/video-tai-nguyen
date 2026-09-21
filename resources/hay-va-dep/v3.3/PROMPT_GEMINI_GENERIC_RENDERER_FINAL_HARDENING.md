# HAY & ĐẸP. — GENERIC RENDERER FINAL HARDENING
# SHARED TEMPLATE / RUNTIME FIRST
# VIDEO005 + 7-SHOT FIXTURE AS ACCEPTANCE TESTS
# NO IMAGE GENERATION
# NO VIDEO005-ONLY PATCHES

Bạn đang tiếp tục project sau khi generic production renderer đã được triển khai và Video005 generic render + 7-shot fixture đã chạy thành công về mặt kỹ thuật.

Tuy nhiên Human review đã phát hiện một số lỗ hổng reusable trong shared renderer/template.

Mục tiêu của task này là:

```text
fix shared renderer/template/runtime
→ rerender Video005 generic
→ rerender 7-shot fixture
→ verify actual outputs
→ nếu sạch thì promote renderer thành PRODUCTION READY
```

Không quay lại image pipeline.

Không sửa riêng Video005.

---

## 0. GOLDEN RULE — TEMPLATE FIRST

Mọi lỗi có thể ảnh hưởng Video006+ phải được sửa ở shared layer:

```text
shared template
shared renderer
shared runtime
shared validator
shared QA tooling
```

Không được vá bằng:

```js
if (videoId === 'video005') ...
if (slug.includes('phan-5')) ...
```

Không tạo conditional riêng cho fixture.

Video-specific behavior phải đi qua `production-render-spec.json`.

---

# 1. CURRENT ACCEPTED STATE

Giữ nguyên các phần đã đúng:

```text
generic Root.tsx dynamic metadata
generic VideoContent.tsx
ProductionRenderSpec
production-spec-adapter.mjs
render-production-video.mjs
arbitrary shot count
arbitrary duration
generic selected asset mapping
generic motion/composition mapping
hard cuts
calm motion
centered artwork
delayRender/continueRender subtitle reliability
browser-safe runtime
zero image generation from render path
```

Không redesign lại architecture nếu không cần thiết.

---

# 2. BLOCKER #1 — LEGACY NẾP WATERMARK REGRESSION

Actual generic renders đã cho thấy watermark legacy:

```text
NẾP.
```

xuất hiện trong Video005 generic / fixture.

Đây là lỗi shared brand/template.

## Required fix

Canonical brand contract:

```text
brand = HAY & ĐẸP.
slogan = Điều hay để biết. Điều đẹp để giữ.
```

Shared renderer/template phải dùng canonical HAY & ĐẸP. watermark mặc định.

Ví dụ:

```text
hay-dep-mark-sage.png
```

hoặc canonical asset thực tế trong repo.

Không hard-code theo Video005.

## Validator hardening

Nếu:

```text
spec.brand === 'HAY & ĐẸP.'
```

thì validator phải reject legacy watermark asset như:

```text
watermark.png
legacy NẾP asset
```

nếu đó là file legacy.

Không silently render sai brand.

## Acceptance

Cả:

```text
Video005 generic
7-shot fixture
```

phải hiển thị HAY & ĐẸP. watermark đúng.

Không còn NẾP.

---

# 3. BLOCKER #2 — `timelineSrc` MUST BE WIRED END-TO-END

Hiện schema/spec có:

```text
timelineSrc
```

nhưng shared subtitle path vẫn có dấu hiệu tự suy ra:

```ts
staticFile(`${slug}/timeline.json`)
```

Điều này làm `timelineSrc` thành dead field.

## Required flow

Implement:

```text
ProductionRenderSpec.timelineSrc
        ↓
Video / VideoContent
        ↓
Layout
        ↓
Subtitles
        ↓
staticFile(timelineSrc)
```

Backward compatibility chỉ được fallback:

```text
`${slug}/timeline.json`
```

nếu `timelineSrc` thực sự absent.

Không ignore field nếu đã được khai báo.

## Fixture requirement

7-shot fixture phải dùng một `timelineSrc` explicit khác với slug-derived path.

Actual rendered fixture phải có subtitle hoạt động.

Đây mới chứng minh subtitle path generic thật.

---

# 4. BLOCKER #3 — OUTRO MUST PARTICIPATE IN GENERIC QA

Hiện generic fixture có:

```text
7 narrative shots
+ OutroCard
```

nhưng QA logic vẫn có dấu hiệu tính:

```text
transitions = shots.length - 1
```

nên bỏ qua transition:

```text
shot-07 → OutroCard
```

Đây là sai abstraction.

## Required abstraction

Tạo generic render-segment model:

```text
renderSegments =
  narrative shots
  + optional outro
```

Nếu:

```text
7 shots + outro
```

thì:

```text
renderSegments = 8
transition boundaries = 7
```

Không còn assume:

```text
transition count = narrative shots - 1
```

nếu outro enabled.

## QA artifacts

Fixture contact sheet phải có:

```text
7 narrative samples
+ 1 OUTRO sample
```

Transition strip phải có:

```text
shot-07 → Outro
```

Actual Outro frame phải được sample từ rendered MP4.

Không được đánh:

```text
outroRendered = true
```

chỉ vì:

```text
spec.outro.enabled === true
```

Phải verify actual MP4.

---

# 5. BLOCKER #4 — REMOVE FAKE FLASH-FRAME PASS

Hiện QA có logic kiểu:

```js
let flashFramesCount = 0;
```

nhưng nếu metric không thực sự được đo thì không được report:

```text
flashFrames = 0 PASS_AUTOMATED
```

## Choose one truthful approach

### Preferred: real lightweight pixel/stat detection

For extracted boundary frames, compute useful metrics such as:

```text
mean luminance
near-black ratio
near-white ratio
inter-frame luminance jump
canvas-like uniformity
```

Use conservative thresholds.

Flag suspicious transitions for Human review.

Do not overclaim perfect semantic detection.

### Acceptable fallback

If robust detection is not implemented:

```text
transition frames extracted = PASS_AUTOMATED
blank/flash visual verdict = PENDING_HUMAN
```

Do NOT invent automated `0 flash`.

## Blank detection

Do not use JPEG file size alone as proof of no blank frame.

File size may be one signal only.

---

# 6. FPS CONTRACT — MAKE IT HONEST

Shared template currently contains timing logic equivalent to:

```text
frame / 30
fixed 20 / 100 / 125 frame durations
```

while generic spec exposes arbitrary:

```text
fps
```

Choose ONE consistent contract.

## Recommended for HAY & ĐẸP.

Lock production template to:

```text
fps = 30
```

because:

```text
existing motion tuned at 30fps
subtitle behavior tested at 30fps
all accepted outputs use 30fps
simpler and safer for batch production
```

Then validator must explicitly reject non-30fps specs.

Schema/docs/tests must say:

```text
HAY & ĐẸP. production renderer requires 30fps
```

Do not advertise arbitrary fps.

### Alternative

Only choose fps-aware timing if you deliberately convert ALL shared timing logic.

Do not partially support arbitrary FPS.

---

# 7. PACKAGE THE REAL VIDEO005 PRODUCTION SPEC

Ensure distribution ZIP contains:

```text
videos/phan-5-2026-09-20-khi-nguoi-than-ke-chuyen-dung-voi-sua/production-render-spec.json
```

It must be the exact spec used by generic Video005 render.

Packaging tests should verify the file exists in generated `changes.zip`.

Do not rely on local workspace file that is omitted from the archive.

---

# 8. BRAND CONTRACT SHOULD BE SHARED DATA, NOT A VIDEO PATCH

If shared template has brand defaults, centralize them.

Conceptually:

```ts
HAY_DEP_BRAND = {
  name: 'HAY & ĐẸP.',
  slogan: 'Điều hay để biết. Điều đẹp để giữ.',
  watermarkSrc: '...canonical hay-dep asset...',
}
```

Use existing repo architecture if there is already a brand token/config file.

Do NOT create duplicate brand constants unnecessarily.

Spec may override permitted fields, but validator must prevent legacy-brand pollution.

---

# 9. SUBTITLE CONTRACT SHOULD BE REUSABLE

`Subtitles` should not know:

```text
Video005
fixture
Video006
```

It only receives:

```text
timelineSrc
fps / timing context
caption config
```

Any existing logic tied to slug should be backward compatibility only.

Future Video006 must automatically work by supplying:

```json
{
  "timelineSrc": "phan-6-.../timeline.json"
}
```

---

# 10. OUTRO CONTRACT SHOULD BE REUSABLE

Generic behavior:

```text
outro.enabled = false
→ no outro segment

outro.enabled = true
→ append generic OutroCard segment
```

Outro properties are data-driven:

```text
durationFrames
brandName
slogan
artworkSrc
```

No video ID checks.

QA tooling must understand outro as a rendered segment.

---

# 11. VIDEO005 MUST REMAIN VISUALLY UNCHANGED

Video005 current approved generic/final render is the visual regression baseline.

After this shared hardening:

```text
Video005 outro remains disabled
1370 frames
16 narrative shots
same selected image assets
same audio
same subtitles
same title
same motion
same framing
same HAY & ĐẸP. brand
```

Do not change Video005 creative output.

The only acceptable visible difference would be correction of a legacy NẾP watermark if generic render currently contains it.

---

# 12. FIXTURE MUST PROVE THE SHARED FIXES

7-shot fixture should intentionally prove:

```text
shot count != 16
duration != 1370
explicit timelineSrc
HAY & ĐẸP. watermark
outro.enabled = true
```

Rendered result must show:

```text
subtitle visible in narrative segment
HAY & ĐẸP. watermark
OutroCard present
correct brand/slogan
```

QA review pack must include:

```text
7 narrative midpoint frames
1 Outro midpoint frame
7 transition boundaries
```

---

# 13. NO IMAGE WORK

Hard counters:

```text
Cloudflare image generation calls = 0
other image generation calls = 0
image edit operations = 0
```

Reuse existing local assets only.

---

# 14. SHARED QA TOOLING

Harden `render-production-video.mjs` or reusable QA helpers so future videos inherit:

```text
N narrative shots
optional outro
generic rendered segment list
generic transition boundaries
generic frame contact sheet
generic transition strip
source hash audit
audio/video probe
truthful QA statuses
```

No Video005-specific QA assumptions.

---

# 15. TESTS REQUIRED

Add focused regression tests.

At minimum:

## A. Canonical brand

```text
HAY & ĐẸP. spec
→ canonical watermark
→ legacy NẾP asset rejected
```

## B. timelineSrc

Explicit timelineSrc flows into subtitle component.

Test should fail if renderer falls back to slug path despite explicit timelineSrc.

## C. Outro segments

For:

```text
7 narrative shots + outro
```

expected:

```text
renderSegments = 8
transitions = 7
```

## D. Actual Outro QA

Review artifact metadata includes sampled Outro frame.

## E. Truthful flash audit

No static default `flashFrames=0` accepted unless detection actually runs.

## F. FPS

If choosing 30fps lock:

```text
fps=30 → PASS
fps=24 → validator FAIL
fps=60 → validator FAIL
```

## G. Packaging

Generated changes ZIP contains Video005:

```text
production-render-spec.json
```

## H. Video005 regression

Generic normalized Video005 spec remains:

```text
16 narrative shots
1370 frames
outro false
```

## I. Fixture regression

Fixture contains:

```text
7 narrative shots
outro true
explicit timelineSrc
canonical HAY & ĐẸP. watermark
```

Run focused tests and:

```bash
npm test
```

---

# 16. EXECUTION

After fixes, render both actual videos again.

## Video005 generic regression

```bash
node scripts/render-production-video.mjs \
  --slug=phan-5-2026-09-20-khi-nguoi-than-ke-chuyen-dung-voi-sua \
  --review-dir=scratch/video005-production/generic-hardening-review \
  --output=scratch/video005-production/generic-hardening-review/video005-generic-hardened.mp4
```

Use appropriate Windows-compatible command syntax if needed.

Do not overwrite current approved golden MP4.

## Fixture

```bash
node scripts/render-production-video.mjs \
  --spec=test-fixtures/video-fixture-7shot/production-render-spec.json \
  --output=scratch/fixture-hardening-review/fixture.mp4 \
  --review-dir=scratch/fixture-hardening-review
```

---

# 17. HUMAN REVIEW ARTIFACTS

Video005:

```text
scratch/video005-production/generic-hardening-review/
```

Fixture:

```text
scratch/fixture-hardening-review/
```

Each should contain:

```text
MP4
frame-contact-sheet.jpg
transition-strip.jpg
render-report.json
video-qa-checklist.json
selected-assets.json
```

Fixture contact sheet must visibly include Outro.

---

# 18. ACCEPTANCE CRITERIA

Task only passes when ALL are true:

```text
Video005 generic render:
- HAY & ĐẸP. watermark
- no NẾP.
- subtitles correct
- 16 shots
- 1370 frames
- 0 creative regression

Fixture:
- HAY & ĐẸP. watermark
- no NẾP.
- subtitle works from explicit timelineSrc
- 7 narrative shots
- Outro visually present
- contact sheet includes Outro
- transition audit includes shot-07 → Outro

Shared QA:
- no fake flash PASS
- statuses reflect actual detection capability

FPS:
- explicit honest contract

Packaging:
- Video005 production-render-spec.json included

Image generation/edit:
- zero
```

---

# 19. FUTURE VIDEO006 GATE

At completion answer:

```text
Can Video006 render by creating only:
- video data
- audio/timeline
- final selected images
- production-render-spec.json

without editing shared source?
```

Required answer:

```text
YES
```

If a developer still needs to edit:

```text
Root.tsx
VideoContent.tsx
Layout.tsx
Subtitles.tsx
render-production-video.mjs
```

for normal Video006 creation, renderer is NOT production-ready.

---

# 20. FINAL REPORT FORMAT

Report:

## A. Shared root causes fixed

Cover:

```text
legacy watermark
timelineSrc dead field
Outro omitted from QA segments
fake flash metric
FPS ambiguity
packaging omission
```

## B. Shared files modified

For each:

```text
file
fix
benefit to Video006+
```

## C. Final brand contract

State canonical watermark and legacy rejection behavior.

## D. Subtitle data flow

Show:

```text
spec.timelineSrc
→ ...
→ Subtitles
```

## E. Outro render model

Report fixture:

```text
narrative shots = 7
outro segments = 1
total render segments = 8
audited transitions = 7
```

## F. Flash/blank QA

Explain what is actually measured and what remains Human QA.

Do not exaggerate automation.

## G. FPS contract

State final decision.

## H. Video005 hardened regression

Report:

```text
frames
duration
brand
subtitle
transitions
visual parity
```

## I. Fixture actual render

Report:

```text
subtitle present
HAY & ĐẸP. watermark present
Outro present
Outro sampled in contact sheet
shot-07→Outro transition audited
```

## J. Packaging

Confirm Video005 production render spec exists inside ZIP.

## K. Tests

Exact focused/full test counts.

## L. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Video005 renders: N
Fixture renders: N
```

## M. Video006 readiness

Explicitly report:

```text
shared source files requiring manual edits for Video006 = 0
```

End with exactly one:

```text
GENERIC RENDERER PRODUCTION READY — VIDEO006 GO
```

or:

```text
GENERIC RENDERER STILL BLOCKED — DO NOT START VIDEO006
```

---

# 21. MOST IMPORTANT PRINCIPLE

Do not optimize this patch for the fixture or Video005 alone.

Every fix must answer:

```text
Does Video006+ automatically inherit this behavior?
```

If yes:

```text
correct shared fix
```

If no and behavior is reusable:

```text
fix is incomplete
```
