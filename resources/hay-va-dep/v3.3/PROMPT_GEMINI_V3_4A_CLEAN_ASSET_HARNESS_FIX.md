# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A CLEAN ASSET HARNESS FIX
# OFFLINE ONLY
# NO IMAGE GENERATION
# MODEL POLICY: @cf/black-forest-labs/flux-1-schnell ONLY

## CONTEXT

The current `V3.4A CLEAN ASSET PILOT` was blocked by Cloudflare quota before any fresh image was generated.

Human requirements are now explicit:

```text
- Use ONLY @cf/black-forest-labs/flux-1-schnell
- Images should be clean 2D cartoon / illustrated style
- Do NOT aim for photorealism
- Character identity consistency between images is NOT required
- Each individual image only needs to be clean, readable, semantically correct, and usable
```

Current quota condition must be represented as:

```text
PAUSED_QUOTA
```

NOT:

```text
BLOCKED_ASSET
```

because no new image candidate has actually failed QA yet.

This task fixes the pilot harness OFFLINE only.

Do NOT call Cloudflare.
Do NOT generate images.
Do NOT render until the code path is wired and validated with mocks / existing placeholder files only.

---

# 1. HARD SCOPE LOCK

Allowed files:

```text
scripts/generate-v34-clean-asset-pilot.mjs
```

Optional focused tests:

```text
src/v34-clean-asset-pilot.test.ts
```

Allowed scratch area:

```text
scratch/v34/clean-asset-pilot/
```

Do NOT modify:
- production image generator;
- story planner;
- batch engine;
- motionGrammar.ts;
- subtitles;
- SFX;
- production manifests/assets;
- cast/world registry.

---

# 2. FIX STYLE DEFAULT

Replace the current style wording that leans toward realistic human rendering.

Required model-facing default:

```text
STYLE DEFAULT:

Clean 2D illustrated / cartoon style.
Hand-drawn editorial illustration.
Simple expressive faces and readable body shapes.
Clearly illustrated, never photorealistic.
Do not aim for realistic skin or lifelike photographic rendering.
Character likeness consistency between images is not required.
Each image should be visually clean, readable, and usable in a short-form video.
```

Keep the warm HAY & ĐẸP. palette:

```text
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber
```

Do NOT add:
- photorealism;
- realistic skin;
- camera/lens terms;
- 3D;
- anime/chibi.

This is a cartoon / illustrated output target, not a realistic portrait target.

---

# 3. FIX TYPO

In Shot 2 voice clause, replace:

```text
nghe vài tô chuyện vụn
```

with:

```text
nghe vài câu chuyện vụn
```

Do not alter other authored narration text.

---

# 4. ENSURE DIRECTORIES EXIST

Before any state/image/manifest write, create:

```text
BASE_DIR
CANDIDATES_DIR
ASSETS_DIR
```

using recursive mkdir.

Example:

```js
fs.mkdirSync(BASE_DIR, { recursive: true });
fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DIR, { recursive: true });
```

No fresh-run filesystem failure is acceptable.

---

# 5. QUOTA STATUS CORRECTNESS

Add explicit global/state-level status support:

```text
READY
PAUSED_QUOTA
IN_PROGRESS
COMPLETE
BLOCKED_ASSET
```

If Cloudflare returns quota exhaustion / HTTP 429 before an image candidate is produced:

```text
runStatus = PAUSED_QUOTA
```

The affected shot remains:

```text
NEEDS_GENERATION
```

with the same `nextAttempt`.

Do NOT:
- append a visual attempt;
- increment attempt number;
- mark shot EXHAUSTED;
- return BLOCKED_ASSET.

`BLOCKED_ASSET` is valid only when a shot has 3 real generated candidates and all 3 fail visual QA.

---

# 6. SELECTED ASSET FINALIZATION

When a candidate passes all five QA dimensions:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

copy the selected file into:

```text
scratch/v34/clean-asset-pilot/assets/
```

with deterministic names:

```text
shot-01.jpg
shot-02.jpg
shot-03.jpg
shot-04.jpg
shot-05.jpg
shot-06.jpg
```

Do not alter image pixels.

---

# 7. IMPLEMENT `pilot-assets.json`

When state changes, regenerate:

```text
scratch/v34/clean-asset-pilot/pilot-assets.json
```

Shape:

```json
{
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "identityConsistencyRequired": false,
  "styleTarget": "clean-2d-cartoon-illustration",
  "shots": [
    {
      "pilotShotIndex": 0,
      "sourceSceneOrBeatId": "scene-0",
      "storyRole": "establish",
      "selectedAttempt": 2,
      "file": "assets/shot-01.jpg",
      "qa": {
        "style": "PASS",
        "peopleContract": "PASS",
        "semanticFidelity": "PASS",
        "anatomy": "PASS",
        "textPollution": "PASS"
      }
    }
  ]
}
```

For unselected shots:
- either omit them from `shots`
- or include `selectedAttempt: null`

Choose one deterministic contract and test it.

---

# 8. IMPLEMENT CONTACT SHEET

Once all 6 shots are SELECTED, create:

```text
scratch/v34/clean-asset-pilot/contact-sheet-clean-assets.jpg
```

Layout:

```text
2 columns × 3 rows
```

External labels only:

```text
Shot 01
scene-0
establish
```

Do not modify source image pixels.

If fewer than 6 shots are selected:
do not create a final clean contact sheet.

---

# 9. IMPLEMENT PILOT RERENDER PATH

Add a finalization command, for example:

```text
--finalize
```

It must first require:

```text
all 6 shots = SELECTED
```

Only then:
1. build a pilot-only asset mapping;
2. rerender the same existing V3.4A pilot timing/motion span;
3. do NOT modify production manifest;
4. save:

```text
scratch/v34/clean-asset-pilot/video001-motion-clean-assets.mp4
```

The rerender must reuse:
- current V3.4A motion grammar;
- current timing;
- current subtitle/title;
- current hard cuts.

Only the six pilot image references are replaced.

If all 6 shots are not selected:

```text
--finalize
```

must refuse to render.

---

# 10. DO NOT CLAIM MOTION PASS

Final clean-asset harness completion means only:

```text
the pilot now has individually clean source images
```

It does NOT automatically mean:

```text
V3.4A motion quality = PASS
```

Human review of the rerendered pilot decides that later.

---

# 11. REQUIRED TESTS

Add focused offline tests for:

1. style prompt contains:
   - `2D`
   - `illustrated` or `cartoon`
   - explicit non-photoreal target;
2. style prompt does NOT contain realistic / camera-oriented output requirements;
3. Shot 2 typo is fixed to `câu chuyện vụn`;
4. directories are auto-created on clean temp dir;
5. HTTP 429:
   - sets `PAUSED_QUOTA`;
   - does not create attempt;
   - does not advance nextAttempt;
   - does not mark EXHAUSTED;
6. selected PASS candidate copies into `assets/shot-0N.jpg`;
7. `pilot-assets.json` is generated correctly;
8. final contact sheet requires all 6 selected;
9. finalize refuses render before 6/6 selected;
10. no model other than `@cf/black-forest-labs/flux-1-schnell` appears in executable generation path.

No external API calls in tests.

---

# 12. CURRENT STATE AFTER OFFLINE FIX

Do NOT generate images.

The expected state remains:

```text
runStatus = PAUSED_QUOTA

Shot 0 = NEEDS_GENERATION attempt 1
Shot 1 = NEEDS_GENERATION attempt 1
Shot 2 = NEEDS_GENERATION attempt 1
Shot 3 = NEEDS_GENERATION attempt 1
Shot 4 = NEEDS_GENERATION attempt 1
Shot 5 = NEEDS_GENERATION attempt 1
```

If an old state incorrectly says BLOCKED_ASSET only because of 429, migrate it to `PAUSED_QUOTA`.

---

# 13. FINAL REPORT

Return:

## A. Root Cause

## B. Files Changed

## C. Updated Cartoon Style Rule

## D. Typo Fix

## E. Directory Safety

## F. Quota State Semantics

## G. Selected Asset Finalization

## H. Manifest / Contact Sheet / Rerender Wiring

## I. Tests

## J. Current State

## K. Verdict

Exactly one:

```text
V3.4A CLEAN ASSET HARNESS FIX — PASS
```

or:

```text
V3.4A CLEAN ASSET HARNESS FIX — FAIL
```

Then STOP.

Do NOT call Cloudflare.
Do NOT generate images.
Do NOT start V3.4B.
