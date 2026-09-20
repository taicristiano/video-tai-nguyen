# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. STORY ENGINE — CORRECTNESS FIX AFTER END-TO-END REVIEW

Do not add features.
Do not render Video 005.
Do not claim PASS from unit tests.

Read:
1. `HAY_DEP_STORY_ENGINE_CODE_OUTPUT_REVIEW.md`
2. current `scripts/batch-engine.mjs`
3. current `scripts/human-insight-image.mjs`
4. current `scripts/human-insight-story-planner.mjs`
5. current manifest JSON.

## What the actual rendered Video 001 proves

The Story Engine architecture is wired, but the output has regressed to legacy stick-figure / NẾP-style illustrations.

Actual frames contain:
- stick figures,
- unrelated bus/social-media imagery,
- AI/business artwork,
- visible source text such as `EXCELLENT AI!`.

This is NOT a prompt styling problem.

Root cause identified in code:
`batch-engine.mjs::resolveBeatAsset()` reuses any best manifest asset with score >= 14 when its tier is undefined.

Current manifest has 394 assets with:
- no tier
- no castId
- no worldId
- no storyRole

Therefore legacy assets bypass the strict image generator and suppress Cloudflare generation.

---

# PHASE 1 — FIX ASSET RESOLUTION FIRST

Implement the P0 asset gate from the review document.

Preferred:
- remove duplicate reuse decision from batch;
- always call `human-insight-image.mjs --generate --strict-hay-dep`;
- generator is the only reuse/generate authority.

Add:
`--strict-hay-dep`

Undefined tier means:
`LEGACY_NEP`

In strict mode:
only `HAYDEP_CORE` or `HAYDEP_COMPATIBLE` may suppress generation.

For recurring-cast beat:
asset without castId is NOT reusable.

Generation failure:
do not silently fall back to legacy image.
Fail the operation if no safe HAY & ĐẸP. asset exists.

Do not continue until a dry-run proves old stick assets resolve to GENERATE.

---

# PHASE 2 — FIX PLANNER SEMANTICS

Implement:

1. first beat => `establish`
2. last question => `question`
3. last narrative beat => `release` when appropriate
4. memory becomes mode-aware and late-arc only
5. reading word alone does not mean detail-action
6. relationship dialogue produces interaction roles
7. replace non-contiguous `mergeToBeatBudget` grouping with contiguous grouping
8. visual priorities become one-time anchors, threshold >= 0.45
9. priorities supplement mode-specific intent instead of replacing it blindly

Expected after fix:

### Video 001
First role:
`establish`
NOT `memory`

### Video 005
Must contain real:
`interaction`
roles.

### Video 013
Must NOT be mostly `detail-action`.
First beat:
`establish`.

---

# PHASE 3 — FIX CAST MODEL

Add `dialogue-pair-01`.

Video 005:
- recurring cast true
- cast = `dialogue-pair-01`
- NOT `solo-female-01`

Books/home/habit:
do not force every video to female.
Use deterministic solo male/female selection unless script explicitly implies gender.

---

# PHASE 4 — IMPLEMENT CANONICAL REUSE

Current planner emits:
`assetStrategy: reuse-canonical`

but active code ignores it.

Implement canonical asset cache as described in the review.

Memory beat with recurring cast should reuse an earlier canonical human asset whenever appropriate rather than generating unrelated faces.

---

# PHASE 5 — STRONGER TESTS

Replace self-validating tests with direct assertions.

Mandatory assertions:

```text
001 first role == establish
005 cast == dialogue-pair-01
005 contains interaction
013 first role == establish
013 detail-action ratio < 0.55
undefined-tier asset cannot reuse in strict HAY & ĐẸP.
missing-cast asset cannot reuse for recurring-cast scene
matching CORE same-cast asset can reuse
```

Add an asset-decision dry-run script.

For Video 001 print every beat:

```text
beat
role
cast
best asset
best tier
best cast
decision: REUSE / GENERATE
reason
```

Before image generation, expected decisions for unaudited old 394 assets:
`GENERATE`

---

# PHASE 6 — ONLY THEN RENDER VIDEO 001

Run:

```bash
node scripts/test-story-planner.mjs
node scripts/test-asset-decisions.mjs 1
npm test
npx tsc --noEmit --skipLibCheck
node scripts/batch-engine.mjs 1 1 --force
```

After render produce 12-frame contact sheet.

Reject render if ANY frame contains:
- stick figure / diagram people
- unrelated office/AI/bus/social-media legacy illustration
- embedded source text
- wrong content universe
- memory scene with different recurring cast

Do not render 005 yet.

---

# FINAL REPORT

Return:

A. exact root cause
B. files changed
C. asset decision output for 001
D. revised 001/005/013 role sequences
E. exact tests
F. contact sheet
G. honest verdict

Do not say production-ready.
Do not say PASS unless output itself no longer regresses to legacy visual assets.
