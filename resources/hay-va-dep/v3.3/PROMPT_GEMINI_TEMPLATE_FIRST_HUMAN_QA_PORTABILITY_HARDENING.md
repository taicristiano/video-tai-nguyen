# HAY & ĐẸP. — TEMPLATE-FIRST HUMAN-QA SAFETY & PORTABILITY HARDENING
# PRIMARY GOAL: FUTURE VIDEOS MUST INHERIT EVERYTHING AUTOMATICALLY
# VIDEO005 IS ONLY A REGRESSION FIXTURE
# NO VIDEO-SPECIFIC PATCHES
# NO IMAGE GENERATION
# NO VISUAL REDESIGN

## 0. CORE PRINCIPLE

Task này KHÔNG tối ưu cho riêng Video005.

Video005 chỉ được dùng như:

```text
regression fixture / acceptance sample
```

Mục tiêu thực sự là:

```text
shared template
+ shared QA pipeline
+ shared asset promotion
+ shared production spec builder
+ shared renderer
+ shared portability validation
```

để:

```text
Video006
Video007
Video008
...
```

tự động hưởng toàn bộ hành vi đúng mà KHÔNG cần sửa source riêng từng video.

Mọi quyết định trong task này phải trả lời được:

```text
"Video tiếp theo có tự động được hưởng fix này không?"
```

Nếu câu trả lời là KHÔNG thì implementation chưa đạt.

---

# 1. SCOPE — SHARED TEMPLATE / PIPELINE FIRST

Ưu tiên sửa theo thứ tự:

```text
1. shared Human-QA promotion contract
2. shared approved-image manifest contract
3. shared canonical asset materialization
4. shared production-spec builder
5. shared validator
6. shared renderer input contract
7. shared clean-workspace portability test
8. shared packaging rules
```

Chỉ dùng Video005 để chứng minh không regression.

Không được viết code đặc biệt cho:

```text
Video005
phan-5
shot-15
16 shots
1370 frames
```

---

# 2. FORBIDDEN VIDEO-SPECIFIC LOGIC

Shared runtime/scripts phải không chứa logic kiểu:

```js
if (videoId === 'video005') ...
if (slug.includes('phan-5')) ...
if (shotId === 'shot-15') ...
```

hoặc hard-code tương đương.

Forbidden shared assumptions:

```text
shot count = 16
duration = 1370
candidate dir = video005-production
specific attempt/recovery path
specific final-image-candidate path
specific Video005 title
```

Historical tests/fixtures được phép nhắc Video005.

Production runtime không được.

---

# 3. HUMAN QA IS A GENERIC PIPELINE GATE

Critical shared rule:

```text
file exists
!=
Human approved
```

No promotion script may assign:

```text
PASS_HUMAN_QA
```

simply because a candidate image exists.

Generic Human-QA flow must be:

```text
candidate pack
→ Human review manifest
→ promotion step reads actual verdicts
→ only PASS_HUMAN_QA assets promoted
```

If ANY required shot is:

```text
PENDING
PENDING_*
FAIL
FAIL_HUMAN_QA
REJECTED
qa = null
missing
```

then production promotion MUST fail.

This behavior must apply identically to every video.

---

# 4. GENERIC HUMAN-QA REVIEW CONTRACT

Define one reusable Human review manifest schema.

Conceptually:

```json
{
  "videoSlug": "<slug>",
  "shots": [
    {
      "shotId": "shot-01",
      "candidatePath": "...",
      "humanQaVerdict": "PASS_HUMAN_QA",
      "sha256": "..."
    }
  ]
}
```

Use existing repo conventions where possible.

Do not create Video005-only schema.

Promotion code must consume this generic schema for any slug.

---

# 5. CANONICAL APPROVED MANIFEST — ONE LOCATION FOR ALL VIDEOS

Use one production SSOT convention:

```text
videos/<slug>/approved-image-manifest.json
```

This file is DERIVED from actual Human QA results.

It should contain, per shot:

```text
shotId
qa = PASS_HUMAN_QA
sourceAssetPath
canonicalImageSrc
sha256
humanQaSource
optional lineage metadata
```

No manual shot-by-shot authoring required.

No fallback search across multiple scratch conventions.

---

# 6. GENERIC CANONICAL ASSET PATH

All production videos use the same convention:

```text
public/assets/human-insight/final/<slug>/shot-XX.jpg
```

Example pattern only:

```text
public/assets/human-insight/final/<any-slug>/
```

Renderer must not care whether source originally came from:

```text
attempt 1
attempt 2
recovery
cleanup
manual imported asset
```

After Human QA, those histories are audit metadata only.

Renderer consumes canonical final asset.

---

# 7. GENERIC MATERIALIZATION PIPELINE

Shared step:

```text
approved-image-manifest
→ verify PASS
→ verify exact source
→ verify source SHA-256
→ byte-copy to canonical public path
→ verify destination SHA-256
```

No:

```text
resize
recompress
re-encode
image edit
image generation
```

This must work for arbitrary:

```text
slug
shot count
source asset lineage
```

---

# 8. NO PATH GUESSING

Shared builder MUST NOT do:

```js
[
  guessed candidate dir,
  final-image-candidate,
  attempt2,
  attempt3,
  recovery,
  scratch fallback
]
```

Use exactly:

```text
Human-approved manifest sourceAssetPath
```

then canonicalize it.

One source.
One canonical output.
One hash.

---

# 9. CANONICAL-ONLY PRODUCTION SPEC

Production spec must contain only:

```text
assets/human-insight/final/<slug>/shot-XX.jpg
```

or the agreed equivalent canonical public-relative path.

Production spec MUST NOT contain:

```text
scratch/
attempt
recovery
cleanup source
final-image-candidate
developer machine path
```

This rule applies to all videos.

---

# 10. EXACT PATH + EXACT HASH

Shared validator requires:

```text
specShot.imageSrc === manifestShot.canonicalImageSrc
```

AND:

```text
SHA256(canonical asset) === manifestShot.sha256
```

Do not accept:

```text
same basename
same shotId but different file
matching filename from wrong directory
```

No basename fallback.

No synthetic allowed-path lists.

---

# 11. FULL STATIC ASSET CONTRACT

`validateProductionSpec({ checkAssets: true })` must generically validate every runtime-referenced asset.

At minimum:

```text
audioSrc
timelineSrc
watermarkSrc
every shot.imageSrc
outro.artworkSrc when enabled
other spec-level static assets actually consumed by renderer
```

If declared:

```text
must exist
```

If optional and absent:

```text
skip
```

Errors must identify exact missing asset.

---

# 12. SHARED BRAND PORTABILITY

Canonical HAY & ĐẸP. assets required by renderer must be part of the portable production package.

Brand paths should come from shared brand config/tokens.

Do not special-case a video.

If spec references:

```text
watermark
outro artwork
brand mark
```

those files must be packaged.

---

# 13. CLEAN WORKSPACE = PRIMARY ACCEPTANCE TEST

Do NOT treat current developer workspace as proof of portability.

Mandatory generic test:

```text
build package
→ extract to empty temp directory
→ load arbitrary production spec
→ validate ALL referenced assets
→ verify canonical image hashes
→ initialize renderer/bundle smoke
```

The extracted workspace must not rely on:

```text
old scratch directories
external source images
developer leftovers
absolute local paths
```

---

# 14. GENERIC TEST FIXTURE — NOT ONLY VIDEO005

Video005 alone is insufficient.

Use at least two validation sources:

## A. Existing real regression video

Video005:

```text
proves no regression
```

## B. Generic synthetic/local fixture

Must differ in:

```text
slug
shot count
duration
asset set
optional outro state
timeline path
```

Purpose:

```text
prove shared template/pipeline is actually generic
```

No AI generation needed.

---

# 15. PROMOTION MUST FAIL FOR UNREVIEWED ASSETS

Add generic negative tests.

### Case 1

```text
candidate exists
Human QA = PENDING
```

Expected:

```text
promotion FAIL
```

### Case 2

```text
qa = null
```

Expected:

```text
FAIL
```

### Case 3

```text
N-1 PASS
1 FAIL
```

Expected:

```text
whole production promotion blocked
```

These tests must use generic fixture data, not only Video005.

---

# 16. GENERIC ASSET IDENTITY TESTS

Add generic regressions:

### Same basename, wrong path

```text
shot-05.jpg
shot-05.jpg
```

different content/hash.

Expected:

```text
wrong one rejected
```

### Hash mismatch

Expected:

```text
FAIL
```

### Non-canonical spec path

Spec points at approved source instead of canonical output.

Expected:

```text
FAIL
```

---

# 17. GENERIC BUILDER FLOW

Future production flow must be:

```text
story plan
+
Human QA review manifest
+
audio/timeline
+
shared brand config
        ↓
promote-approved-images
        ↓
approved-image-manifest
        ↓
materialize canonical assets
        ↓
build-production-render-spec
        ↓
validate
        ↓
generic renderer
```

No manual shot-by-shot JSON transcription.

---

# 18. VIDEO006 SHOULD REQUIRE DATA, NOT CODE

After this task, creating Video006 should require only:

```text
new story/video data
new audio/timeline
new image candidates
Human QA decisions
```

Then generic commands.

Expected shared source edits:

```text
0
```

Expected manual asset path edits:

```text
0
```

Expected manual production-spec shot edits:

```text
0
```

---

# 19. SHARED SOURCE PURITY TEST

Scan reusable files such as:

```text
promote-approved-images.mjs
materialize-production-assets.mjs
build-production-render-spec.mjs
production-spec-adapter.mjs
render-production-video.mjs
Root.tsx
VideoContent.tsx
```

They must contain zero special-case knowledge of:

```text
video005
phan-5
16 shots
1370 frames
specific scratch directory
```

Fixtures/tests may reference concrete videos.

Shared runtime may not.

---

# 20. FULL PACKAGE CONTRACT

Final portable archive must include, for every included production video:

```text
videos/<slug>/approved-image-manifest.json
videos/<slug>/production-render-spec.json

public/assets/human-insight/final/<slug>/shot-*.jpg

audio
timeline
brand assets referenced by spec
outro artwork if referenced

shared renderer
shared validator
shared promotion/materialization/build scripts
```

Do not make package validity depend on scratch history.

---

# 21. DO NOT CHANGE VISUAL TEMPLATE IN THIS TASK

Visual system is already accepted.

Do not modify:

```text
shot grammar
motion design
Layout visual layout
ImageScene visual behavior
OutroCard appearance
subtitle styling
image prompts
image model
```

unless required solely for non-visual interface compatibility.

This task is:

```text
shared safety
SSOT
asset identity
portability
automation
```

not visual redesign.

---

# 22. ZERO IMAGE WORK

Hard limits:

```text
Image generation calls = 0
Image edit calls = 0
```

Use existing local assets only.

---

# 23. REQUIRED GENERIC TESTS

At minimum:

```text
A. unreviewed file cannot be promoted
B. qa=null cannot be promoted
C. mixed PASS/FAIL blocks promotion
D. exact canonical path required
E. exact hash required
F. basename fallback forbidden
G. missing watermark fails
H. missing outro artwork fails when enabled
I. canonical byte-copy preserves SHA-256
J. arbitrary slug works
K. arbitrary shot count works
L. clean extracted ZIP validates
M. renderer/bundle smoke from clean package works
N. shared runtime contains no video-specific branch
```

Run focused suite and:

```bash
npm test
```

---

# 24. VIDEO005 ROLE IN THIS TASK

Video005 is ONLY:

```text
golden regression fixture
```

Use it to confirm:

```text
existing production result still reproducible
```

Do not design APIs around Video005 folder naming.

Do not add Video005 fallback.

Do not use Video005 as sole genericity proof.

---

# 25. FINAL ACCEPTANCE CRITERIA

Task passes only if:

```text
Human QA cannot be auto-invented

Human-approved manifest is generic

Canonical production asset convention is generic

Exact path + exact hash enforced

No path guessing

No basename fallback

All referenced static assets validated

Clean extracted package works

At least one non-Video005 fixture passes

Shared runtime has zero per-video special branches

Video006 requires zero shared code changes
```

---

# 26. FINAL REPORT FORMAT

Report:

## A. Shared Human-QA contract

Explain generic promotion behavior.

## B. Shared asset SSOT

Show:

```text
Human review
→ approved manifest
→ canonical production assets
```

## C. Generic canonical path contract

State reusable path convention.

## D. Exact identity validation

Explain exact path/hash rules.

## E. Full static asset validation

List all asset categories validated.

## F. Generic negative tests

Report:

```text
PENDING rejected
null QA rejected
FAIL rejected
wrong path rejected
same basename rejected
hash mismatch rejected
missing brand asset rejected
missing outro asset rejected
```

## G. Clean-workspace test

Report extraction and validation result.

## H. Non-Video005 fixture

Report generic fixture results.

## I. Shared source purity

Confirm no video-specific branches.

## J. Future Video006 workflow

Must state:

```text
manual shot path edits = 0
manual production-spec edits = 0
shared source edits = 0
```

## K. Tests

Exact focused/full counts.

## L. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Remotion renders: N
```

End with exactly one:

```text
SHARED HAY & ĐẸP. PRODUCTION TEMPLATE SAFE & PORTABLE — FUTURE VIDEOS GO
```

or:

```text
SHARED PRODUCTION TEMPLATE STILL BLOCKED — DO NOT SCALE TO FUTURE VIDEOS
```

---

# 27. MOST IMPORTANT PRINCIPLE

Do not ask:

```text
"Does Video005 work?"
```

Ask:

```text
"Can an arbitrary future HAY & ĐẸP. video pass through the exact same shared pipeline without source-code edits?"
```

Only when the answer is YES is the task complete.
