# HAY & ĐẸP. — TEMPLATE DEPENDENCY SSOT FINALIZATION
# TEMPLATE-FIRST ONLY
# VIDEO005 = REGRESSION FIXTURE, NOT DESIGN TARGET
# FUTURE VIDEOS MUST INHERIT THIS AUTOMATICALLY
# NO IMAGE GENERATION
# NO VISUAL REDESIGN
# NO VIDEO-SPECIFIC PATCHES

## 0. PRIMARY GOAL

Task này phải tập trung hoàn toàn vào **shared template**.

Không tối ưu riêng cho Video005.

Video005 chỉ dùng để chứng minh:

```text
existing production does not regress
```

Mục tiêu thật:

```text
shared template
→ single dependency SSOT
→ runtime / validator / builder / packager all consume the same contract
→ future videos need zero shared source edits
```

Acceptance cuối phải trả lời được:

```text
"Video006, Video007, Video008...
có dùng cùng template này mà không cần sửa source chung không?"
```

Nếu câu trả lời là KHÔNG thì task chưa xong.

---

# 1. CURRENT TEMPLATE-LEVEL BLOCKERS

Hiện còn 3 vấn đề chính:

```text
A. template dependency contract đang có 2 source of truth
B. một số runtime/builder/adapter vẫn hard-code asset path ngoài contract
C. make-changes-zip vẫn có khả năng tự chọn video thay vì bắt buộc --slug
```

Task này chỉ sửa 3 vấn đề đó.

Không reopen renderer creative logic.

Không đổi image system.

Không đổi shot grammar.

Không đổi motion/subtitle design.

---

# 2. BLOCKER A — ONLY ONE DEPENDENCY SOURCE OF TRUTH

Hiện đang có cả:

```text
templateDependencies.ts
templateDependenciesRuntime.mjs
```

và cả hai có thể tự khai báo:

```text
defaultBgMusic
defaultWatermark
defaultOutroBrandMark
defaultOutroArtwork
resolveTemplateDependencies()
```

Đây là duplication nguy hiểm.

Target:

```text
ONE implementation
ONE data contract
ONE resolver
```

---

# 3. REQUIRED ARCHITECTURE — SINGLE TEMPLATE CONTRACT

Chọn một implementation thật duy nhất.

Khuyến nghị một trong hai hướng:

## Option A — Runtime ESM là SSOT

```text
templateDependenciesRuntime.mjs
```

là implementation duy nhất.

TypeScript dùng declaration:

```text
templateDependenciesRuntime.d.mts
```

hoặc equivalent typed wrapper không duplicate data.

## Option B — Pure data contract + one resolver

Ví dụ:

```text
templateDependencies.json / .mjs
```

chứa data duy nhất.

Một resolver duy nhất đọc data này.

TypeScript chỉ import cùng data/resolver.

### Hard requirement

Không được còn:

```text
TS defaults
≠
MJS defaults
```

hoặc hai hàm resolver song song.

---

# 4. TEMPLATE MUST OWN ALL DEFAULT ASSET PATHS

Shared template contract phải là nơi duy nhất biết:

```text
default watermark
default background music
default outro artwork
default outro brand mark
other shared static template assets
```

Ví dụ conceptual:

```js
export const TEMPLATE_DEFAULTS = {
  watermarkSrc: '...',
  bgMusicSrc: '...',
  outroArtworkSrc: '...',
  outroBrandMarkSrc: '...'
};
```

Không quan trọng exact naming.

Quan trọng:

```text
asset path knowledge belongs to template contract
```

---

# 5. REMOVE HARD-CODED TEMPLATE ASSET LITERALS FROM RUNTIME

Search toàn bộ shared template/runtime.

Đặc biệt:

```text
OutroCard.tsx
Layout.tsx
VideoContent.tsx
backgroundMusic.ts
other template components
```

Forbidden pattern:

```ts
'artworks/outro-9-16.png'
'music-bg-2.mp3'
'hay-dep-mark-sage.png'
'logo-full-horizontal-with-slogan.png'
```

nếu chúng là shared template defaults.

Thay bằng:

```text
TEMPLATE_DEPENDENCIES.defaults.<field>
```

hoặc resolved template config.

---

# 6. OUTROCARD MUST USE TEMPLATE CONTRACT

Ví dụ hiện tại nếu có:

```ts
artworkSrc = 'assets/human-insight/brand/outro-9-16.png'
```

thì phải đổi thành:

```ts
artworkSrc =
  TEMPLATE_DEPENDENCIES.defaults.defaultOutroArtwork
```

Tương tự:

```text
brandMarkSrc
watermark
background music default
```

Không để component tự biết asset path riêng.

---

# 7. BUILDER MUST NOT DUPLICATE TEMPLATE DEFAULT PATHS

Search:

```text
build-production-render-spec.mjs
```

Nếu còn kiểu:

```js
watermarkSrc: 'assets/hay-dep/brand/...'
artworkSrc: 'assets/human-insight/brand/...'
```

thì remove.

Builder phải lấy defaults từ:

```text
shared template contract
```

Conceptual:

```js
const deps = getTemplateDefaults(templateId);

spec.watermarkSrc = providedOverride ?? deps.watermarkSrc;
```

Không duplicate literal.

---

# 8. ADAPTER / VALIDATOR MUST NOT DUPLICATE DEFAULT PATHS

Search:

```text
production-spec-adapter.mjs
```

Nếu validator tự default bằng literal riêng:

```js
spec.watermarkSrc ||= '...'
```

thì sửa thành:

```text
template contract default
```

Validator không được có brand/template asset knowledge riêng.

---

# 9. DEPENDENCY RESOLVER MUST BE THE ONLY RESOLVER

All these consumers must call the same resolver:

```text
validator
packager
builder
runtime config
clean-package test
```

No duplicate:

```text
resolveTemplateDependencies()
```

implementations.

At most:

```text
one implementation
multiple imports
```

---

# 10. EFFECTIVE CONFIG RESOLUTION

Create one concept:

```text
resolveEffectiveTemplateConfig(spec)
```

or equivalent.

It should determine:

```text
effective watermark
effective bg music
effective outro artwork
effective outro brand mark
active conditional dependencies
```

Then:

```text
runtime
validator
packager
```

use the SAME effective config.

This avoids:

```text
runtime renders asset A
packager packages asset B
validator checks asset C
```

---

# 11. TEMPLATE FEATURE CONDITIONS

Dependency contract must remain feature-aware.

Example:

```text
outro.enabled = false
→ no outro-specific assets required

outro.enabled = true
→ outro artwork + brand mark required
```

Background music:

```text
explicitly disabled
→ no bg music dependency

not specified
→ template default bg music

explicit override
→ override asset
```

All derived from the same resolver.

---

# 12. STATICFILE / ASSET-LITERAL AUDIT

Add a test that scans shared production template files for:

```text
staticFile(
asset path literals
```

Every production asset path must be either:

```text
provided via spec
or
provided via template contract
```

No undeclared template asset literal.

Whitelist only non-asset strings if necessary.

---

# 13. TEMPLATE CONTRACT DRIFT TEST

Add an explicit regression test:

```text
change template default in SSOT fixture
```

Then assert:

```text
runtime config sees new value
validator sees new value
packager sees new value
builder sees new value
```

without editing four different files.

Purpose:

```text
prove there is truly one dependency SSOT
```

---

# 14. NO VIDEO-SPECIFIC DEFAULTS

Template contract must not contain:

```text
Video005
phan-5
shot-15
16 shots
1370 frames
attempt paths
recovery paths
```

It only contains:

```text
template-level defaults
template-level dependencies
template-level feature rules
```

---

# 15. MAKE-CHANGES-ZIP MUST REQUIRE EXPLICIT SLUG

Shared wrapper:

```text
make-changes-zip.mjs
```

must NOT:

```js
slug = candidates[0]
```

or auto-pick first video.

Target:

```bash
node scripts/make-changes-zip.mjs --slug=<slug>
```

If missing:

```text
FAIL
```

with clear usage message.

Reason:

```text
repo may contain Video005, Video006, Video007...
```

Never guess production target.

---

# 16. PACKAGE-PRODUCTION AND MAKE-CHANGES-ZIP MUST ALIGN

Both commands should follow the same targeting contract:

```text
--slug REQUIRED
```

No wrapper behavior that is looser than core packager.

Add tests:

```text
missing --slug
→ FAIL

valid arbitrary slug
→ PASS
```

---

# 17. DO NOT TURN MAKE-CHANGES-ZIP INTO VIDEO-SPECIFIC ARCHIVE LOGIC

`make-changes-zip.mjs` should either:

```text
delegate to package-production
```

or compose generic package outputs.

It should NOT know:

```text
Video005 paths
specific attempt assets
specific review directories
specific shot counts
```

---

# 18. CLEAN PACKAGE SMOKE — KEEP, BUT REPORT HONESTLY

Current acceptable proof:

```text
source + assets extracted from package
Remotion bundler uses extracted project entrypoint
external npm dependencies may come from controlled host node_modules
```

This is acceptable for:

```text
source/assets production package
```

Do not call it:

```text
fully self-contained deploy artifact
```

unless package also contains dependencies.

Final report must phrase this accurately.

---

# 19. NON-VIDEO005 FIXTURE REMAINS PRIMARY GENERICITY TEST

Use arbitrary fixture:

```text
slug != Video005
shot count != 16
duration != 1370
```

Run:

```text
template config resolution
→ build spec
→ validate
→ package
→ extract
→ Remotion bundle smoke
```

No shared source changes.

---

# 20. VIDEO005 ROLE

Video005 is only:

```text
regression verification
```

No new template design decisions should depend on its:

```text
slug
shot count
timing
candidate lineage
```

---

# 21. REQUIRED TESTS — TEMPLATE-FIRST

At minimum:

## A. Single dependency implementation

Assert only one implementation owns defaults/resolver.

## B. No duplicate asset defaults

Search shared runtime/builder/adapter.

## C. OutroCard uses contract

No hard-coded default artwork path.

## D. Builder uses contract

No hard-coded watermark/outro defaults.

## E. Adapter uses contract

No hard-coded template defaults.

## F. Runtime/validator/packager parity

For same spec:

```text
effective dependencies identical
```

## G. Default bgMusic parity

Same path everywhere.

## H. Outro enabled parity

Same artwork/brand paths everywhere.

## I. Dependency SSOT mutation test

One contract change propagates to all consumers.

## J. Missing --slug in package-production

FAIL.

## K. Missing --slug in make-changes-zip

FAIL.

## L. Arbitrary non-Video005 slug

PASS.

## M. Clean package bundle smoke

PASS.

## N. Shared source purity

No video-specific logic.

---

# 22. SOURCE FILES TO INSPECT

At minimum:

```text
src/templates/human-insight/cinematic-light/templateDependencies.ts
src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs
src/templates/human-insight/cinematic-light/index.ts
src/templates/human-insight/cinematic-light/OutroCard.tsx
src/templates/human-insight/cinematic-light/Layout.tsx
src/VideoContent.tsx
src/audio/backgroundMusic.ts

scripts/build-production-render-spec.mjs
scripts/production-spec-adapter.mjs
scripts/package-production.mjs
scripts/make-changes-zip.mjs
scripts/render-production-video.mjs
```

Use actual architecture.

Do not invent files unnecessarily.

---

# 23. NO VISUAL CHANGES

Do not alter:

```text
colors
typography
animation style
shot grammar
image scale
subtitle appearance
Outro visual composition
brand visual design
```

Only dependency/config plumbing.

---

# 24. ZERO IMAGE OPERATIONS

Required:

```text
Image generation calls = 0
Image edit calls = 0
```

No exceptions.

---

# 25. FUTURE VIDEO TARGET

After task:

```text
Video006 data
→ same shared template
→ same shared defaults
→ same dependency resolver
→ same builder
→ same validator
→ same renderer
→ same packager
```

Expected:

```text
shared source edits = 0
template dependency edits per video = 0
packager edits per video = 0
```

Only when the TEMPLATE itself changes should dependency contract change.

---

# 26. FINAL ACCEPTANCE CRITERIA

Task passes only when:

```text
ONE dependency SSOT exists

ONE resolver exists

runtime uses it

builder uses it

validator uses it

packager uses it

no hard-coded template asset defaults remain outside contract

make-changes-zip requires explicit --slug

package-production requires explicit --slug

non-Video005 fixture passes

clean extracted source/assets bundle successfully

Video005 regression remains valid
```

---

# 27. FINAL REPORT FORMAT

Report:

## A. Single template dependency SSOT

State exact file/module that is now authoritative.

## B. Removed duplicate implementation

Explain what happened to previous TS/MJS duplication.

## C. Runtime consumption

Show:

```text
OutroCard
VideoContent
background music
```

using the shared contract.

## D. Builder/validator consumption

Confirm no asset default literals remain.

## E. Effective dependency parity

Report same resolved dependency list for:

```text
runtime
validator
packager
```

## F. Asset-literal audit

Report undeclared template asset literals:

```text
0
```

or list legitimate exceptions.

## G. Generic packaging target

Confirm:

```text
package-production --slug required
make-changes-zip --slug required
```

## H. Non-Video005 fixture

Report pipeline + bundle result.

## I. Video005 regression

Only confirm no regression.

## J. Clean package semantics

State truthfully:

```text
project source/assets come from extracted package
external npm dependencies supplied by controlled host environment
```

if that is still the setup.

## K. Future-video readiness

Must state:

```text
manual template source edits per video = 0
manual dependency edits per video = 0
manual packager edits per video = 0
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
SHARED HAY & ĐẸP. TEMPLATE SSOT COMPLETE — FUTURE VIDEOS GO
```

or:

```text
SHARED HAY & ĐẸP. TEMPLATE SSOT STILL DUPLICATED — DO NOT SCALE
```

---

# 28. MOST IMPORTANT PRINCIPLE

Do not fix:

```text
"this asset path is wrong in Video005"
```

Fix:

```text
"where does the template define this asset path exactly once?"
```

Do not fix:

```text
"packager needs outro-9-16.png"
```

Fix:

```text
"how does packager discover whatever outro asset the template currently declares?"
```

Do not fix:

```text
"Video006 should work"
```

Fix:

```text
"any future video using this template automatically inherits the same dependency behavior."
```
