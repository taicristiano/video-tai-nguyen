# HAY & ĐẸP. — FINAL TEMPLATE-FIRST PIPELINE HARDENING
# FOCUS: EXACT HUMAN-QA ASSET IDENTITY + GENERIC PACKAGING + CLEAN-PACKAGE RUNTIME PROOF
# VIDEO005 IS ONLY A REGRESSION FIXTURE
# FUTURE VIDEOS MUST REQUIRE ZERO SHARED SOURCE EDITS
# NO IMAGE GENERATION
# NO VISUAL REDESIGN
# NO VIDEO-SPECIFIC PATCHES

## 0. PRIMARY GOAL

Task này không tối ưu riêng cho Video005.

Video005 chỉ được dùng như:

```text
regression fixture
```

Mục tiêu thực sự là hoàn thiện **shared HAY & ĐẸP. production template/pipeline** để:

```text
Video006
Video007
Video008
...
```

đều chạy qua cùng một flow mà không cần sửa shared source.

Acceptance cuối phải trả lời YES cho câu hỏi:

```text
"Can an arbitrary future HAY & ĐẸP. video
go from Human-approved images
to portable production package
without editing shared source?"
```

Nếu không thì task chưa hoàn thành.

---

# 1. CURRENT STATE — DO NOT REOPEN WHAT ALREADY PASSED

Giữ nguyên các phần đã đạt:

```text
generic renderer runtime
arbitrary slug
arbitrary shot count
canonical final assets
production spec canonical path
exact production hash validation
timelineSrc
HAY & ĐẸP. watermark
Outro support
30fps contract
empty-canvas QA
Human QA verdict gate
```

Không redesign visual template.

Không quay lại image generation.

Không sửa shot grammar.

Không thay motion/subtitle/brand visual behavior.

---

# 2. FINAL SHARED BLOCKERS

Human review còn phát hiện 4 blocker template-level:

```text
A. Human QA verdict chưa bind chặt với exact reviewed asset path + SHA-256
B. packaging script vẫn Video005-centric / hardcoded
C. clean-package runtime smoke chưa thực sự chạy từ extracted package
D. ZIP entry path chưa đảm bảo cross-platform
```

Task này chỉ xử lý 4 điểm trên.

---

# 3. BLOCKER A — HUMAN QA MUST APPROVE AN EXACT ASSET, NOT JUST A SHOT ID

Current anti-pattern:

```text
shot-01 = PASS_HUMAN_QA
```

sau đó promotion script mới tự đi tìm một file candidate bằng:

```text
candidatePath
sourceAssetPath
reviewAssetPath
candidateDir/shot-01.jpg
canonical final path
...
```

Đây là không đủ an toàn.

Human QA phải approve:

```text
exact path
+
exact SHA-256
+
shotId
```

---

# 4. GENERIC HUMAN REVIEW MANIFEST CONTRACT

Define one reusable review manifest schema for every video.

Conceptually:

```json
{
  "slug": "<slug>",
  "shots": [
    {
      "shotId": "shot-01",
      "humanQaVerdict": "PASS_HUMAN_QA",
      "reviewedAssetPath": "some/candidate/path/shot-01.jpg",
      "reviewedAssetSha256": "<exact SHA-256>"
    }
  ]
}
```

Use current repo naming if an equivalent field already exists.

Critical requirement:

```text
Human PASS
must be tied to
exact reviewed file identity
```

No inferred path.

No later candidate search.

No basename guessing.

---

# 5. PROMOTION MUST VERIFY THE SAME EXACT REVIEWED ASSET

`scripts/promote-approved-images.mjs` must:

```text
1. read Human review manifest
2. require PASS_HUMAN_QA
3. read reviewedAssetPath exactly
4. verify file exists
5. calculate SHA-256
6. compare to reviewedAssetSha256
7. only then promote
```

If:

```text
path changed
file replaced
hash changed
asset missing
```

then promotion MUST FAIL.

---

# 6. REMOVE POST-QA ASSET SEARCHING

After Human QA verdict exists, promotion must NOT search a fallback list like:

```js
[
  candidatePath,
  sourceAssetPath,
  candidateDir/shot-XX.jpg,
  canonical path,
  ...
]
```

Human review already identifies the exact asset.

Use only:

```text
reviewedAssetPath
reviewedAssetSha256
```

No ambiguity.

---

# 7. APPROVED MANIFEST IS OUTPUT, NEVER HUMAN-QA INPUT

Shared flow must be:

```text
Human review manifest
        ↓
promote-approved-images
        ↓
approved-image-manifest.json
```

Forbidden:

```text
approved-image-manifest.json
used as fallback Human review evidence
```

That creates a circular SSOT.

Remove any fallback where approved manifest can impersonate Human QA input.

---

# 8. APPROVED MANIFEST GENERIC CONTRACT

Canonical output:

```text
videos/<slug>/approved-image-manifest.json
```

Each shot includes:

```text
shotId
qa = PASS_HUMAN_QA
reviewedAssetPath/sourceAssetPath
reviewedAssetSha256
canonicalImageSrc
canonicalSha256
humanQaSource
```

Exact field names may follow project conventions.

Important:

```text
reviewed SHA
==
source SHA
==
canonical copied SHA
```

---

# 9. GENERIC PACKAGING — REMOVE VIDEO005-CENTRIC PACKAGER

Current `make-changes-zip.mjs` or equivalent must NOT hard-code:

```text
Video005
phan-5
video005-production
attempt2
attempt3
recovery
specific 16 image names
specific 1370-frame assets
hay-dep-video005-attempt3-changes.zip
```

These are incompatible with future-video scale.

---

# 10. CREATE A GENERIC PRODUCTION PACKAGER

Create or refactor to a generic command such as:

```bash
node scripts/package-production.mjs --slug=<slug>
```

Optional generic args may include:

```text
--output=<zip>
--include-review-media
--include-history
```

But normal production packaging should require only:

```text
slug
```

---

# 11. PACKAGE CONTENT MUST BE DERIVED, NOT HARDCODED

For any `<slug>`, packager should derive from:

```text
videos/<slug>/production-render-spec.json
videos/<slug>/approved-image-manifest.json
shared runtime dependencies
shared brand assets
runtime-referenced audio/timeline/images/outro/watermark
```

Do not maintain manual lists of per-video shot paths.

---

# 12. PACKAGE ALL ASSETS ACTUALLY REFERENCED BY SPEC

Generic packager must inspect spec and include every referenced runtime asset:

```text
audioSrc
timelineSrc
watermarkSrc
shot.imageSrc for all shots
outro.artworkSrc when enabled
bgMusic when declared
other declared static assets
```

Also include:

```text
approved-image-manifest.json
production-render-spec.json
required shared renderer code
required shared scripts/config
```

---

# 13. GENERIC PACKAGING SHOULD NOT REQUIRE SCRATCH HISTORY

Production package must work without:

```text
attempt histories
recovery histories
candidate scratch directories
developer workspace leftovers
```

Historical review artifacts may be optional.

Canonical production package should rely on:

```text
canonical final assets
canonical manifest
production spec
runtime code
brand/static assets
audio/timeline
```

---

# 14. CROSS-PLATFORM ZIP ENTRY CONTRACT

ZIP entries must use standard forward-slash paths:

```text
scripts/...
public/assets/...
videos/...
src/...
```

Never store entry names as:

```text
scripts\...
public\assets\...
```

because on Linux/POSIX extractors `\` may become part of the filename.

Packager must normalize all ZIP entry names to:

```text
/
```

regardless of host OS.

---

# 15. DO NOT RELY ON POWERSHELL-SPECIFIC ZIP SEMANTICS

If current packager uses:

```text
Compress-Archive
```

and produces Windows-style entry names, replace or wrap it with a cross-platform ZIP implementation.

Acceptable approach:

```text
Node zip library
Python zipfile
another repo-approved cross-platform mechanism
```

Requirement:

```text
same archive structure on Windows/Linux/macOS
```

No OS-specific path leakage.

---

# 16. CLEAN-PACKAGE RUNTIME SMOKE MUST ACTUALLY USE EXTRACTED PACKAGE

Previous anti-pattern:

```text
extract ZIP
but import runtime from current developer workspace
```

This does NOT prove portability.

Correct test:

```text
build package
→ extract package into empty temp dir
→ execute/import runtime FROM THAT TEMP DIR
```

The original repo/workspace must not satisfy imports/assets.

---

# 17. REAL CLEAN-PACKAGE SMOKE TEST

Mandatory shared acceptance:

```text
1. create generic package
2. extract to empty temp workspace
3. confirm expected directory tree
4. load production-render-spec from extracted workspace
5. validate checkAssets=true from extracted root
6. verify all canonical hashes
7. run renderer/runtime smoke FROM extracted code
```

At minimum runtime smoke must prove:

```text
shared module import succeeds
Root/Video composition can initialize
production spec can be parsed
staticFile references resolve
no missing package dependency caused by omitted files
```

---

# 18. STRONGER OPTION — REMOTION BUNDLE FROM CLEAN PACKAGE

Preferred if practical:

```text
cd <temp-extracted-workspace>
run Remotion bundle or composition metadata smoke
```

No full MP4 required unless needed.

The important proof is:

```text
renderer actually initializes from package itself
```

not from the original repo.

---

# 19. GENERIC NON-VIDEO005 ACCEPTANCE FIXTURE IS MANDATORY

Do not use Video005 as the sole proof.

Create/use a fixture such as:

```text
slug = test-template-portability-4shot
shots = 4
duration != Video005
different timeline
different assets
optional outro enabled
```

Use existing local assets only.

No image generation.

---

# 20. RUN THE COMPLETE GENERIC PIPELINE ON THE FIXTURE

The fixture must go through:

```text
Human review manifest
→ promote-approved-images
→ approved-image-manifest
→ materialize canonical assets
→ build-production-render-spec
→ package-production --slug
→ extract package
→ validate
→ runtime smoke from extracted package
```

If this passes, it proves template-level genericity.

---

# 21. NO VIDEO-SPECIFIC SOURCE CHANGES FOR FIXTURE

Do not edit shared source specifically to make fixture pass.

Fixture supplies data only.

Required:

```text
shared source edits required for second arbitrary slug = 0
```

---

# 22. SHARED SOURCE PURITY — EXPAND SCAN

Scan ALL reusable pipeline files, including packaging.

At minimum:

```text
promote-approved-images.mjs
materialize-production-assets.mjs
build-production-render-spec.mjs
production-spec-adapter.mjs
render-production-video.mjs
package-production.mjs
make-changes-zip.mjs if still present
Root.tsx
VideoContent.tsx
```

Forbidden in shared production path:

```text
video005
video005-production
phan-5
16-shot assumption
1370-frame assumption
specific attempt/recovery filenames
```

Tests/fixtures may mention historical examples.

Runtime/package scripts may not.

---

# 23. HUMAN-QA IDENTITY NEGATIVE TESTS

Add generic tests:

## A. Reviewed file replaced after approval

Review manifest stores hash A.

File at same path is replaced with content B.

Promotion:

```text
MUST FAIL
```

## B. Same basename, different file

Human approved:

```text
dir-a/shot-01.jpg
```

Promotion sees:

```text
dir-b/shot-01.jpg
```

Expected:

```text
FAIL
```

## C. PASS verdict but reviewedAssetSha256 missing

Expected:

```text
FAIL
```

## D. PASS verdict but reviewedAssetPath missing

Expected:

```text
FAIL
```

## E. approved-image-manifest used as Human review input

Expected:

```text
REJECT / unsupported
```

---

# 24. GENERIC PACKAGING TESTS

Add tests:

## A. Arbitrary slug packaging

No Video005 assumptions.

## B. Arbitrary shot count

All shot assets discovered from spec.

## C. Outro enabled

Outro asset automatically packaged.

## D. Outro disabled

No required outro asset unless otherwise referenced.

## E. Brand watermark

Referenced watermark packaged.

## F. Audio/timeline

Both packaged from spec.

## G. ZIP path separators

Inspect archive entry names.

Expected:

```text
all use /
```

Forbidden:

```text
\
```

---

# 25. CLEAN-PACKAGE NEGATIVE TEST

Create archive missing one referenced runtime asset.

Extract.

Run validation.

Expected:

```text
FAIL
```

This proves clean package test is actually inspecting extracted content.

---

# 26. CLEAN-PACKAGE IMPORT ISOLATION TEST

Ensure test cannot accidentally resolve modules from original workspace.

Use one or more:

```text
spawn child process with cwd=tempExtractDir
sanitized NODE_PATH
explicit temp-local import path
environment isolation
```

Do not import:

```text
../src/...
```

from the original test runner.

---

# 27. VIDEO005 ROLE

Video005 should only verify:

```text
no regression
```

Do NOT redesign package APIs around its directory tree.

Do NOT include Video005-only scripts in the required future production flow.

Legacy/history files may remain archived but must not be required by template runtime.

---

# 28. FUTURE VIDEO WORKFLOW — TARGET

For any future video:

```text
create story/audio
→ create candidates
→ Human QA exact assets
→ promote
→ materialize
→ build spec
→ render
→ package
```

Conceptual commands:

```bash
node scripts/promote-approved-images.mjs --slug=<slug>

node scripts/build-production-render-spec.mjs --slug=<slug>

node scripts/render-production-video.mjs --slug=<slug>

node scripts/package-production.mjs --slug=<slug>
```

Required:

```text
manual source edits = 0
manual package-script edits = 0
manual shot-path edits = 0
manual production-spec edits = 0
```

---

# 29. NO VISUAL WORK

Do not modify creative behavior unless required for compilation only.

No changes to:

```text
image prompt system
image model
shot grammar
ImageScene visual animation
Layout visual composition
OutroCard visual design
subtitle styling
brand design
```

This task is pipeline/template hardening only.

---

# 30. ZERO IMAGE OPERATIONS

Required:

```text
Image generation calls = 0
Image edit calls = 0
```

No exceptions.

---

# 31. TEST REQUIREMENTS

At minimum cover:

```text
A. Human PASS binds exact reviewed path
B. Human PASS binds exact reviewed SHA-256
C. replaced reviewed file rejected
D. same basename wrong file rejected
E. missing reviewed path/hash rejected
F. approved manifest cannot substitute Human review evidence
G. generic arbitrary slug promotion works
H. generic arbitrary shot count works
I. generic package-production works
J. all ZIP entries use forward slash
K. all spec-referenced assets packaged
L. missing package asset causes clean validation FAIL
M. clean extracted package validates
N. runtime/import smoke executes from extracted package
O. non-Video005 fixture full pipeline passes
P. shared source scan includes packaging scripts and finds no video-specific logic
```

Run:

```bash
npm test
```

---

# 32. PACKAGE STRUCTURE ACCEPTANCE

An extracted generic production package should resemble:

```text
videos/
  <slug>/
    approved-image-manifest.json
    production-render-spec.json

public/
  assets/
    human-insight/
      final/
        <slug>/
          shot-01.jpg
          ...
    hay-dep/
      brand/
        ...

  <slug>/
    voice.mp3
    timeline.json

src/
  shared runtime files...

scripts/
  shared pipeline files...
```

Exact layout may follow repo architecture, but must be generic and self-contained.

---

# 33. FINAL ACCEPTANCE GATE

Task only passes if an arbitrary non-Video005 fixture can execute:

```text
review exact asset
→ promote
→ canonicalize
→ build spec
→ package
→ extract on clean workspace
→ validate
→ runtime smoke
```

with:

```text
0 shared source edits
0 package-script edits
0 guessed paths
0 external workspace dependencies
```

---

# 34. FINAL REPORT FORMAT

Report:

## A. Exact Human-QA asset binding

Show old risk and final exact path/hash behavior.

## B. Human review manifest contract

Show generic fields.

## C. Promotion behavior

Confirm no candidate searching after QA.

## D. Generic packager

Show:

```text
package-production --slug=<slug>
```

and explain content discovery.

## E. Cross-platform ZIP

Report:

```text
number of archive entries
backslash entry count = 0
forward-slash structure PASS
```

## F. Clean-package runtime proof

Report exactly how test prevents importing original workspace.

## G. Non-Video005 fixture

Show full flow and results.

## H. Shared code purity

Include packaging scripts in purity scan.

Must report:

```text
video005-specific references in shared runtime/package path = 0
```

## I. Future-video workflow

Explicitly:

```text
manual Human asset path lookup = 0
manual production spec editing = 0
manual packaging code editing = 0
shared source edits = 0
```

## J. Tests

Exact focused/full test counts.

## K. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Remotion full renders: N
```

End with exactly one:

```text
SHARED HAY & ĐẸP. TEMPLATE PIPELINE FULLY GENERIC & PORTABLE — FUTURE VIDEOS GO
```

or:

```text
SHARED HAY & ĐẸP. TEMPLATE PIPELINE STILL BLOCKED — DO NOT SCALE
```

---

# 35. MOST IMPORTANT PRINCIPLE

Do not optimize the system so:

```text
Video005 can be packaged
```

Optimize it so:

```text
any future HAY & ĐẸP. video
can pass through the same shared template,
Human-QA gate,
asset SSOT,
renderer,
and packager
without source-code changes.
```

Video005 is evidence of regression safety.

The non-Video005 fixture is evidence of genericity.

Both are required.
