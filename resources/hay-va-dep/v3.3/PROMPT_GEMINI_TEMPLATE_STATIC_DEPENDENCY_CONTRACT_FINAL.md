# HAY & ĐẸP. — TEMPLATE STATIC DEPENDENCY CONTRACT & CLEAN-RUNTIME HARDENING
# TEMPLATE-FIRST ONLY
# VIDEO005 IS REGRESSION EVIDENCE, NOT THE DESIGN TARGET
# FUTURE VIDEOS MUST INHERIT EVERYTHING AUTOMATICALLY
# NO IMAGE GENERATION
# NO VISUAL REDESIGN
# NO VIDEO-SPECIFIC PATCHES

## 0. PRIMARY GOAL

Giải quyết toàn bộ hidden runtime/static dependencies ở cấp **shared template**, không tiếp tục thêm từng asset thiếu vào packager bằng tay.

Mục tiêu cuối:

```text
template declares all runtime dependencies
        ↓
validator resolves them
        ↓
packager includes them
        ↓
clean extracted package
        ↓
actual Remotion runtime/bundle smoke
```

Mọi future video:

```text
Video006
Video007
Video008
...
```

phải tự động hưởng contract này mà không cần sửa shared source.

Video005 chỉ là regression fixture.

---

# 1. DO NOT REOPEN ALREADY-ACCEPTED AREAS

Giữ nguyên:

```text
generic renderer
arbitrary slug
arbitrary shot count
canonical final assets
exact path/hash validation
timelineSrc
30fps contract
HAY & ĐẸP. brand
Outro visual fix
empty-canvas QA
generic packaging direction
```

Không đổi:

```text
image prompts
shot grammar
motion design
subtitle styling
ImageScene creative behavior
Layout composition
Outro visual design
```

Task này chỉ về:

```text
shared dependency declaration
shared validation
shared packaging
shared Human-QA schema strictness
clean runtime proof
```

---

# 2. CURRENT SHARED-LEVEL PROBLEMS

Các vấn đề còn lại không nên xử lý theo từng video:

## A. Hidden template dependencies

Ví dụ runtime/template hiện có thể tham chiếu trực tiếp:

```text
assets/human-insight/music/music-bg-2.mp3
assets/human-insight/brand/hay-dep-mark-sage.png
assets/creative/manifest.json
assets/news/manifest.json
```

nhưng các asset này không nhất thiết xuất hiện trong:

```text
production-render-spec.json
```

=> validator/packager không biết để include.

## B. Packager silently skips missing assets

Anti-pattern:

```js
const disk = resolveAssetDiskPath(ref);
if (disk) {
  addFile(...);
}
```

Nếu asset được spec/template tham chiếu nhưng không tồn tại:

```text
package MUST FAIL
```

không được skip.

## C. Clean smoke test chưa phải Remotion runtime smoke thật

Validate JSON/assets thôi chưa đủ.

Need prove:

```text
Root
Video
VideoContent
Layout
template imports
static dependencies
```

đều load được từ package sạch.

## D. Human QA schema vẫn có backward fallback

Không được cho phép:

```text
sourceAssetPath fallback
sha256 fallback
```

khi contract đã chốt:

```text
reviewedAssetPath REQUIRED
reviewedAssetSha256 REQUIRED
```

## E. Legacy NẾP asset vẫn có thể bị package

Không được unconditional include:

```text
public/watermark.png
```

nếu đó là legacy NẾP.

## F. Ambiguous package target

Generic package command phải dùng explicit:

```text
--slug=<slug>
```

Không chọn ngẫu nhiên `candidates[0]`.

---

# 3. SOLUTION — TEMPLATE STATIC DEPENDENCY CONTRACT

Tạo một shared dependency declaration cho template.

Ví dụ:

```text
src/templates/human-insight/cinematic-light/templateDependencies.ts
```

hoặc vị trí phù hợp với repo.

Conceptual contract:

```ts
export const CINEMATIC_LIGHT_DEPENDENCIES = {
  required: [
    'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png'
  ],

  optionalByFeature: {
    backgroundMusic: [
      'assets/human-insight/music/music-bg-2.mp3'
    ],

    outro: [
      'assets/human-insight/brand/hay-dep-mark-sage.png',
      'assets/human-insight/brand/outro-9-16.png'
    ]
  },

  runtimeImports: [
    'assets/creative/manifest.json',
    'assets/news/manifest.json'
  ]
};
```

Exact shape may differ.

Important principle:

```text
template owns template dependencies
```

NOT:

```text
packager manually knows template internals
```

---

# 4. SINGLE DEPENDENCY RESOLVER

Create one shared resolver.

Conceptually:

```text
resolveTemplateDependencies({
  template,
  spec,
  features
})
```

Output:

```text
resolvedDependencyList
```

All downstream systems use the SAME resolver:

```text
validator
packager
clean-workspace tests
runtime smoke
```

No duplicate dependency lists.

---

# 5. DYNAMIC FEATURE-AWARE DEPENDENCIES

Dependencies should be conditional where appropriate.

Example:

```text
outro.enabled = false
→ outro artwork not required

outro.enabled = true
→ required outro dependencies resolved

background music disabled
→ no bg music required

background music enabled/defaulted
→ resolved bg music asset required
```

Avoid requiring unused assets.

---

# 6. DEFAULT RUNTIME ASSETS MUST BE DECLARED

Critical rule:

If runtime code has a default like:

```ts
bgMusic = 'assets/human-insight/music/music-bg-2.mp3'
```

that default must appear in template dependency contract.

Same for:

```ts
staticFile('assets/human-insight/brand/hay-dep-mark-sage.png')
```

No hidden `staticFile(...)` dependency may exist outside the template dependency contract.

---

# 7. REMOVE HIDDEN STATICFILE REFERENCES WHERE POSSIBLE

Prefer:

```text
dependency passed from resolved template config
```

instead of direct hard-coded runtime calls.

For example:

```text
templateConfig.brandMarkSrc
templateConfig.defaultBgMusicSrc
templateConfig.outroArtworkSrc
```

Then:

```text
template dependency contract
→ template config
→ runtime
```

No asset path knowledge scattered across components.

---

# 8. BACKGROUND MUSIC CONTRACT

Resolve ambiguity around `bgMusic`.

Choose one clean behavior.

Preferred:

```text
spec.bgMusic absent
→ shared template applies declared defaultBgMusicSrc

spec.bgMusic present
→ use explicit override
```

But either way:

```text
effective bgMusic path
```

must be known to:

```text
validator
packager
renderer
```

through the shared dependency resolver.

No invisible default.

---

# 9. RUNTIME IMPORT MANIFEST DEPENDENCIES

If shared runtime imports:

```text
public/assets/creative/manifest.json
public/assets/news/manifest.json
```

then choose one:

## Option A — They are truly required runtime dependencies

Declare them in template/shared runtime dependency contract and package them.

## Option B — They are not needed by production renderer

Refactor production path so renderer no longer imports them.

Do NOT leave accidental imports that package must satisfy for unrelated features.

Prefer reducing runtime dependency graph where safe.

---

# 10. VALIDATOR MUST USE RESOLVED DEPENDENCIES

`validateProductionSpec({ checkAssets: true })` should validate:

```text
spec-declared assets
+
template-resolved assets
+
effective defaults
```

At minimum:

```text
audioSrc
timelineSrc
all shot.imageSrc
watermarkSrc
effective background music
outro dependencies if enabled
template-required manifests/assets
```

Missing any required dependency:

```text
FAIL
```

No silent skip.

---

# 11. PACKAGER MUST FAIL FAST

Before building ZIP:

```text
package-production
→ load spec
→ resolve template dependencies
→ validateProductionSpec(checkAssets=true)
→ if invalid: STOP
```

Packager must not create a "successful" archive with missing runtime assets.

Required behavior:

```text
missing referenced asset
→ non-zero exit
→ no final package marked successful
```

---

# 12. PACKAGER MUST CONSUME DEPENDENCY RESOLVER

Do NOT manually add:

```text
music-bg-2.mp3
hay-dep-mark-sage.png
outro-9-16.png
creative/manifest.json
news/manifest.json
```

inside packager logic.

Instead:

```text
resolveTemplateDependencies(...)
→ list
→ package list
```

Future template asset additions should require changing:

```text
template dependency contract
```

not:

```text
package-production.mjs
```

---

# 13. GENERIC PACKAGE COMMAND MUST REQUIRE SLUG

Preferred CLI:

```bash
node scripts/package-production.mjs --slug=<slug>
```

`--slug` required.

If omitted:

```text
FAIL with explicit usage error
```

Do not:

```text
pick first candidate
pick latest directory
guess video
```

This prevents accidental wrong-video packaging as repository grows.

---

# 14. LEGACY NẾP ASSET MUST NOT BE INCLUDED BY DEFAULT

Remove unconditional packaging of:

```text
public/watermark.png
```

or any legacy NẾP branding.

Only package assets that are:

```text
resolved by current HAY & ĐẸP. template dependency contract
or explicitly referenced by production spec
```

Add test:

```text
HAY & ĐẸP. package contains no legacy NẾP watermark dependency
```

unless explicitly required by an unrelated historical package, which should not be part of normal production.

---

# 15. HUMAN REVIEW SCHEMA — MAKE IT STRICT

New shared contract requires:

```text
reviewedAssetPath
reviewedAssetSha256
humanQaVerdict
shotId
```

All mandatory.

Remove fallback:

```text
reviewedAssetPath ||= sourceAssetPath
reviewedAssetSha256 ||= sha256
```

If required field missing:

```text
promotion FAIL
```

---

# 16. ADD MANIFEST TYPE DISCRIMINATOR

Do not detect circular SSOT by filename alone.

Human QA review manifest:

```json
{
  "manifestType": "HUMAN_QA_REVIEW_V1"
}
```

Approved output manifest:

```json
{
  "manifestType": "APPROVED_IMAGE_MANIFEST_V1"
}
```

Promotion accepts ONLY:

```text
HUMAN_QA_REVIEW_V1
```

Even if files are renamed.

Add negative test:

```text
approved manifest renamed to review-manifest.json
→ still rejected
```

---

# 17. REVIEWED ASSET IDENTITY MUST BE IMMUTABLE

Promotion:

```text
read reviewedAssetPath
→ hash live file
→ compare reviewedAssetSha256
```

If file changed after Human review:

```text
FAIL
```

No searching replacement.

No canonical fallback.

No same-basename substitution.

---

# 18. REAL CLEAN REMOTION SMOKE

Current JSON validation is not enough.

Mandatory acceptance:

```text
package-production
→ extract to empty temp workspace
→ execute renderer/bootstrap FROM extracted package
```

Need prove actual production code can initialize.

---

# 19. CLEAN SMOKE MUST NOT IMPORT SOURCE FROM ORIGINAL REPO

Use:

```text
cwd = extracted package
```

and child process.

Ensure imports resolve from:

```text
extracted package
```

not:

```text
../original-repo/src
```

If dependencies like React/Remotion are external development dependencies, using a controlled parent `node_modules` is acceptable ONLY if:

```text
all project source/static files come from extracted package
```

Report this limitation truthfully.

---

# 20. PREFERRED CLEAN RUNTIME TEST

Preferred:

```text
from extracted package:
  Remotion bundle
  or getCompositions / composition metadata
```

Using actual:

```text
src/index / Root
```

or project entrypoint.

Need initialize:

```text
Root.tsx
Video.tsx
VideoContent.tsx
Layout
ImageScene
OutroCard
Subtitles
```

as applicable.

No full MP4 required.

---

# 21. DETECT MISSING HIDDEN DEPENDENCIES THROUGH SMOKE

Test intentionally remove one template dependency from extracted package.

Expected:

```text
validator FAIL
and/or
bundle/runtime smoke FAIL
```

Then restore it:

```text
PASS
```

This proves dependency contract is meaningful.

---

# 22. NON-VIDEO005 FIXTURE IS PRIMARY GENERICITY PROOF

Create/use generic fixture:

```text
slug != Video005
shot count != 16
duration != 1370
outro state explicit
background music path/default exercised
```

Run full shared pipeline:

```text
review manifest
→ promote
→ canonical assets
→ build spec
→ package
→ extract
→ validate dependencies
→ actual Remotion smoke
```

Shared source edits:

```text
0
```

---

# 23. VIDEO005 IS REGRESSION ONLY

Use Video005 to ensure:

```text
existing production remains valid
```

Do not derive template APIs from:

```text
video005-production
phan-5
specific attempt files
```

---

# 24. TEMPLATE DEPENDENCY PURITY TEST

Search production template/runtime code for:

```text
staticFile(
```

and asset-like imports.

Test should ensure every runtime static asset path is either:

```text
declared in template dependency contract
or
provided explicitly by spec/resolved config
```

No undeclared hidden static dependencies.

---

# 25. TEMPLATE DEPENDENCY CONTRACT TESTS

Add tests:

## A. Required dependency missing

```text
FAIL
```

## B. Optional feature disabled

Dependency not required.

## C. Optional feature enabled

Dependency required.

## D. Default bgMusic

Default dependency resolved and packaged.

## E. Explicit bgMusic override

Override dependency packaged instead of hidden default.

## F. Outro enabled

All outro dependencies resolved.

## G. Outro disabled

No unnecessary outro dependency requirement.

## H. Runtime manifest imports

Either declared/packageable or removed from production import graph.

---

# 26. PACKAGER FAIL-FAST TESTS

## A.

Spec references missing audio:

```text
package FAIL
```

## B.

Missing timeline:

```text
FAIL
```

## C.

Missing watermark:

```text
FAIL
```

## D.

Missing shot image:

```text
FAIL
```

## E.

Missing effective bgMusic:

```text
FAIL
```

## F.

Missing required Outro dependency:

```text
FAIL
```

No successful ZIP generated.

---

# 27. HUMAN-QA STRICTNESS TESTS

## A.

Missing `reviewedAssetPath`:

```text
FAIL
```

## B.

Missing `reviewedAssetSha256`:

```text
FAIL
```

## C.

Only legacy `sourceAssetPath + sha256` present:

```text
FAIL
```

## D.

Wrong manifestType:

```text
FAIL
```

## E.

Approved manifest renamed as review manifest:

```text
FAIL
```

## F.

Exact path/hash:

```text
PASS
```

---

# 28. GENERIC PACKAGING TEST

For non-Video005 fixture:

```text
package-production --slug=<fixture>
```

Expected:

```text
all resolved runtime dependencies included
all ZIP entries use /
no legacy NẾP watermark
no Video005-specific files
```

---

# 29. SHARED SOURCE PURITY

Scan:

```text
template dependency contract
dependency resolver
promote-approved-images
materialize-production-assets
build-production-render-spec
production-spec-adapter
render-production-video
package-production
make-changes-zip
Root
Video
VideoContent
Layout
ImageScene
OutroCard
Subtitles
backgroundMusic
```

Forbidden shared production logic:

```text
video005
phan-5
16 shots
1370
specific attempt/recovery path
```

---

# 30. FUTURE VIDEO WORKFLOW

For Video006+:

```text
create story/audio
→ generate/select images
→ Human review exact asset identity
→ promote
→ materialize
→ build spec
→ render
→ package
→ clean validation
```

Required manual code changes:

```text
0
```

Required manual packager changes:

```text
0
```

Required template dependency changes per video:

```text
0
```

Only if TEMPLATE itself gains a new shared feature/asset should its dependency contract change.

---

# 31. NO VISUAL / IMAGE WORK

Hard requirement:

```text
Image generation calls = 0
Image edit calls = 0
```

No creative rework.

---

# 32. REQUIRED FINAL TEST MATRIX

At minimum:

```text
A. strict reviewedAssetPath required
B. strict reviewedAssetSha256 required
C. manifestType enforcement
D. renamed approved manifest rejected
E. replaced reviewed file rejected
F. template dependency resolver works
G. missing effective default dependency fails
H. optional feature dependency behavior correct
I. packager fail-fast works
J. legacy NẾP asset excluded
K. --slug required
L. non-Video005 fixture packages
M. ZIP forward-slash only
N. extracted clean validation passes
O. actual Remotion/runtime smoke from extracted package passes
P. removed dependency makes smoke/validation fail
Q. shared source has no video-specific logic
```

Then run:

```bash
npm test
```

---

# 33. FINAL ACCEPTANCE

Task only passes when:

```text
template fully declares runtime dependencies

no hidden staticFile/runtime asset remains

validator and packager share one dependency resolver

packager fails on missing dependency

Human review schema is strict

manifest type prevents circular SSOT

legacy NẾP asset is not packaged

explicit --slug is required

non-Video005 fixture completes full pipeline

clean extracted package can initialize actual Remotion runtime

future videos need zero shared source edits
```

---

# 34. FINAL REPORT FORMAT

Report:

## A. Template dependency contract

Show location/schema.

## B. Dependency resolver

Explain how validator/packager/runtime share it.

## C. Hidden dependencies resolved

Explicitly address:

```text
default background music
brand sage mark
outro artwork
creative/news manifest imports
```

For each:

```text
declared
or
removed from production dependency graph
```

## D. Packager fail-fast

Show missing asset negative tests.

## E. Human-QA schema strictness

Show:

```text
reviewedAssetPath required
reviewedAssetSha256 required
manifestType required
```

## F. Legacy branding

Confirm:

```text
public/watermark.png / NẾP not included by default
```

## G. Generic package targeting

Confirm:

```text
--slug required
```

## H. Clean Remotion runtime smoke

Report:

```text
package generated
package extracted
cwd isolated
spec loaded from extracted package
all static dependencies resolved
Root/runtime initialized from extracted package
Remotion bundle/composition smoke PASS
```

Do not label JSON-only validation as runtime smoke.

## I. Non-Video005 fixture

Show full end-to-end result.

## J. Shared purity

Confirm zero video-specific logic.

## K. Future-video readiness

State:

```text
manual shared source edits = 0
manual package edits = 0
manual dependency edits per video = 0
```

## L. Tests

Exact focused/full counts.

## M. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Remotion full renders: N
```

End with exactly one:

```text
SHARED HAY & ĐẸP. TEMPLATE DEPENDENCY CONTRACT COMPLETE — FUTURE VIDEOS GO
```

or:

```text
SHARED TEMPLATE DEPENDENCY CONTRACT STILL INCOMPLETE — DO NOT SCALE
```

---

# 35. MOST IMPORTANT PRINCIPLE

Do not fix:

```text
"missing asset X for Video005"
```

Fix:

```text
"how does the template declare every dependency it needs?"
```

Do not fix:

```text
"how does package-production know music-bg-2.mp3?"
```

Fix:

```text
"how do validator, packager, and runtime share one dependency contract?"
```

Only that approach is acceptable for Video006+ scale.
