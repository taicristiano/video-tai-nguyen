# HAY & ĐẸP. — FINAL ASSET SSOT & PORTABILITY HARDENING
# NO VISUAL TEMPLATE CHANGES
# NO IMAGE GENERATION
# NO VIDEO005-SPECIFIC FALLBACKS
# GOAL: CLEAN-WORKSPACE REPRODUCIBILITY FOR VIDEO006+

Bạn đang tiếp tục project sau khi:

- Video005 image QA = PASS 16/16
- Video005 MP4 Human QA = PASS
- Generic renderer = visual/runtime PASS
- Shared Outro fix = PASS
- timelineSrc = generic PASS
- Brand HAY & ĐẸP. = PASS
- FPS contract = 30fps PASS
- Empty-canvas / transition QA = PASS

Không reopen các phần trên.

Human review mới nhất phát hiện blocker cuối cùng:

```text
Generic asset SSOT / portability chưa thực sự sạch.
```

Task này CHỈ xử lý:

```text
approved image asset SSOT
→ canonical public production assets
→ exact-path/hash validation
→ clean-workspace portability
```

---

# 1. CURRENT VERIFIED PROBLEM

Shared builder hiện vẫn có dấu hiệu biết về Video005, ví dụ:

```text
scratch/video005-production/...
```

và có logic tự đoán asset path như:

```js
`final-image-candidate/${shotId}.jpg`
```

trước hoặc song song với Human-approved source asset.

Đây là sai nguyên tắc SSOT.

Production renderer phải KHÔNG biết:

```text
Attempt 1
Attempt 2
Attempt 3
Recovery
Cleanup
video005-production
final-image-candidate internal scratch layout
```

Renderer chỉ được biết:

```text
final canonical production asset
```

---

# 2. CLEAN FINAL ARCHITECTURE

Target:

```text
Human-approved image manifest
        ↓
materialize canonical production assets
        ↓
public/assets/human-insight/final/<slug>/shot-XX.jpg
        ↓
production-render-spec.json
        ↓
generic renderer
```

Example:

```text
public/assets/human-insight/final/
  phan-5-2026-09-20-khi-nguoi-than-ke-chuyen-dung-voi-sua/
    shot-01.jpg
    shot-02.jpg
    ...
    shot-16.jpg
```

Future:

```text
public/assets/human-insight/final/phan-6-.../
```

No scratch path inside production spec.

---

# 3. CANONICAL APPROVED MANIFEST LOCATION

Choose exactly ONE canonical location for all production videos:

```text
videos/<slug>/approved-image-manifest.json
```

This becomes the Human Visual QA SSOT.

Do NOT make builder search multiple ambiguous locations such as:

```text
scratch/video005-production/...
scratch/<slug>/...
final-image-candidate/...
```

Scratch directories may remain review/history artifacts only.

Production builder reads:

```text
videos/<slug>/approved-image-manifest.json
```

ONLY.

---

# 4. APPROVED MANIFEST CONTRACT

Each shot must include at minimum:

```json
{
  "shotId": "shot-01",
  "qa": "PASS_HUMAN_QA",
  "sourceAssetPath": "...",
  "sha256": "...",
  "selectedAttempt": 3
}
```

Actual schema may follow current repo conventions.

Important fields:

```text
shotId
PASS_HUMAN_QA state
exact approved source path
SHA-256
```

Lineage fields are audit-only.

Production renderer does not need lineage.

---

# 5. STRICT HUMAN QA GATE

Production asset materialization must fail if any shot is:

```text
PENDING
FAIL
REJECTED
missing
duplicate
hash mismatch
```

Required:

```text
all required shots = PASS_HUMAN_QA
```

No fallback to older attempt.

No "best available image".

No basename guessing.

---

# 6. MATERIALIZE FINAL PRODUCTION ASSETS

Add a reusable shared step.

For example:

```text
scripts/materialize-production-assets.mjs
```

or integrate cleanly into:

```text
build-production-render-spec.mjs
```

Responsibilities:

```text
1. read approved-image-manifest.json
2. verify approved source asset exists
3. verify source SHA-256
4. copy exact bytes to canonical public final path
5. verify copied SHA-256 equals source SHA-256
6. write canonical imageSrc
```

Do NOT:

```text
recompress JPG
resize
re-encode
edit pixels
generate image
```

Copy raw bytes only.

---

# 7. PRODUCTION SPEC MUST USE ONLY CANONICAL PUBLIC PATHS

For every shot:

```text
production-render-spec.json.imageSrc
```

must look like:

```text
assets/human-insight/final/<slug>/shot-XX.jpg
```

or equivalent canonical public-relative path.

Forbidden:

```text
scratch/...
final-image-candidate/...
video005-production/...
attempt2...
attempt3...
recovery...
```

Production render spec must be portable.

---

# 8. REMOVE PATH GUESSING

Remove logic equivalent to:

```js
const candidatePaths = [
  mShot?.imageSrc,
  `final-image-candidate/${shotId}.jpg`,
  mShot?.sourceAssetPath,
  ...
];
```

Do not guess.

Use:

```text
approved manifest exact source
→ verified canonical copy
→ exact canonical imageSrc
```

One path.

One truth.

---

# 9. REMOVE BASENAME VALIDATION

Current validator must NOT accept an image merely because:

```text
basename matches
```

Bad:

```text
shot-05.jpg == shot-05.jpg
```

without exact path/hash proof.

Cross-validation must verify:

```text
shotId exact
canonical path exact
SHA-256 exact
```

No basename-only fallback.

No synthetic whitelist.

---

# 10. SHARED BUILDER MUST CONTAIN ZERO VIDEO005 KNOWLEDGE

Search shared files:

```text
build-production-render-spec.mjs
production-spec-adapter.mjs
render-production-video.mjs
Root.tsx
VideoContent.tsx
```

They must contain zero:

```text
video005-production
phan-5-2026
VIDEO005
16-shot assumption
1370 assumption
```

Historical tests/fixtures may contain them.

Generic runtime may not.

---

# 11. APPROVED MANIFEST GENERATION

Do not require a developer to manually author approved manifest shot-by-shot.

The Human QA workflow should produce/update:

```text
videos/<slug>/approved-image-manifest.json
```

from the final reviewed candidate pack.

For Video005, create it from already Human-approved 16 assets.

For Video006 future flow:

```text
candidate generation
→ Human QA
→ manifest promotion command
→ approved-image-manifest.json
```

No source-code edit.

---

# 12. FINAL VIDEO006 FLOW

Required future workflow:

```text
story plan
→ images
→ Human image QA
→ approved-image-manifest.json
→ materialize canonical assets
→ build-production-render-spec
→ generic render
→ Human video QA
```

Commands should conceptually be:

```bash
node scripts/promote-approved-images.mjs --slug=<slug>

node scripts/build-production-render-spec.mjs --slug=<slug>

node scripts/render-production-video.mjs --slug=<slug>
```

Exact names may differ.

But no manual JSON transcription.

---

# 13. CLEAN-WORKSPACE PORTABILITY TEST — MANDATORY

This is the most important regression test.

Create a temp clean workspace containing ONLY files from:

```text
changes.zip
```

or equivalent packaged project subset.

Then:

```text
1. extract ZIP
2. locate production-render-spec.json
3. validate all assets with checkAssets=true
4. verify all canonical imageSrc paths exist
5. verify SHA-256
```

Video005 production spec must PASS without relying on:

```text
unpacked developer scratch folders
external workspace leftovers
hidden local assets
```

---

# 14. OPTIONAL STRONGER PORTABILITY TEST

If practical, in temp extracted workspace:

```text
render Video005 using generic renderer
```

At minimum:

```text
validate spec
load all images
resolve timeline/audio
```

must succeed.

Do not require a full second MP4 render if expensive, unless needed.

---

# 15. PACKAGE CANONICAL PRODUCTION ASSETS

`changes.zip` must contain:

```text
videos/<slug>/approved-image-manifest.json

videos/<slug>/production-render-spec.json

public/assets/human-insight/final/<slug>/shot-01.jpg
...
shot-N.jpg
```

Also include shared scripts required to build/render.

The ZIP must be self-contained enough for production validation.

---

# 16. VIDEO005 MIGRATION

For Video005:

Move/materialize the 16 Human-approved final images into canonical path.

Example:

```text
public/assets/human-insight/final/
phan-5-2026-09-20-khi-nguoi-than-ke-chuyen-dung-voi-sua/
shot-01.jpg
...
shot-16.jpg
```

Each copied file must have same SHA-256 as approved source.

Then rebuild:

```text
production-render-spec.json
```

so all 16 `imageSrc` fields point to canonical public final assets.

---

# 17. VIDEO005 MUST NOT CHANGE VISUALLY

No new images.

No image edits.

No re-encoding.

No timing change.

No subtitle change.

No motion change.

No brand change.

No template visual changes.

This is path/SSOT/packaging hardening only.

If Video005 needs re-render for verification:

```text
visual parity expected
```

---

# 18. TESTS

Add focused tests.

At minimum:

### A. No Video005 hard-code

Shared builder/runtime contain no:

```text
video005-production
phan-5-2026
VIDEO005
```

### B. Exact approved asset

Builder uses exact manifest-approved source.

### C. Hash verification

Source hash mismatch → FAIL.

### D. No basename fallback

Two files with same basename but different path/hash:

```text
wrong one must be rejected
```

### E. Materialized asset parity

```text
source SHA-256 == canonical copy SHA-256
```

### F. Production spec path contract

All `imageSrc`:

```text
assets/human-insight/final/<slug>/...
```

### G. No scratch paths

Production spec contains zero:

```text
scratch/
attempt
recovery
final-image-candidate
```

### H. Human QA gate

Non-PASS image → builder FAIL.

### I. Clean ZIP validation

Extract package into temp dir:

```text
validateProductionSpec(checkAssets=true) = PASS
```

### J. Arbitrary slug / shot count

Use generic fixture or synthetic test.

No Video005 assumption.

Run focused suite then:

```bash
npm test
```

---

# 19. DO NOT TOUCH VISUAL TEMPLATE

Do NOT modify unless compilation absolutely requires it:

```text
Layout.tsx
ImageScene.tsx
OutroCard.tsx
Subtitles visual behavior
motion presets
visualMode
shot grammar
image prompt system
```

Previous visual renderer is already accepted.

This task is production asset SSOT + portability only.

---

# 20. SIDE EFFECT LIMITS

Required:

```text
Image generation calls = 0
Image edit calls = 0
```

Prefer:

```text
Remotion renders = 0
```

unless one final regression render is genuinely needed.

Do not generate more QA media unnecessarily.

---

# 21. FINAL REPORT FORMAT

Report:

## A. Previous portability root cause

Explain:

```text
scratch-path dependency
path guessing
basename matching
Video005 fallback
```

## B. Canonical approved manifest

Report final location/schema.

## C. Canonical production assets

Show path convention:

```text
public/assets/human-insight/final/<slug>/...
```

## D. Builder flow

Show:

```text
approved manifest
→ hash verification
→ canonical byte-copy
→ production spec
```

## E. Video005 migration

Report:

```text
16/16 canonical assets
16/16 SHA-256 exact matches
0 re-encoded
```

## F. Production spec

Confirm:

```text
0 scratch paths
0 attempt/recovery paths
0 guessed paths
```

## G. Shared code purity

Confirm:

```text
0 video005-production references
0 Video005 special branches
```

## H. Clean-workspace portability test

Report:

```text
ZIP extracted to temp
asset validation PASS
spec validation PASS
hash validation PASS
```

## I. Video006 flow

Explicitly answer:

```text
manual image path editing = 0
manual production spec shot editing = 0
shared source edits = 0
```

## J. Tests

Exact focused/full counts.

## K. Packaging

Confirm ZIP includes:

```text
approved manifest
production spec
canonical final image assets
required shared scripts
```

## L. Side effects

```text
Image generation calls: 0
Image edit calls: 0
Remotion renders: N
```

End with exactly:

```text
GENERIC PRODUCTION PIPELINE PORTABLE & READY — VIDEO006 GO
```

or:

```text
GENERIC PRODUCTION PIPELINE PORTABILITY BLOCKED — DO NOT START VIDEO006
```

---

# 22. MOST IMPORTANT PRINCIPLE

Production spec must reference assets that exist in a clean packaged workspace.

Never again allow:

```text
"works only because an old scratch folder exists on one machine"
```

Target:

```text
approved Human asset
→ canonical public asset
→ exact hash
→ production spec
→ portable generic renderer
```

Everything after Human QA must be deterministic and reproducible.
