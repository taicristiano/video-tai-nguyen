# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3A-S
# SINGLE GOAL: SCHNELL STYLE BASELINE ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

We are temporarily pausing FLUX.2 experiments because its neuron cost is too high for the current production economics.

For now, the production candidate is:

```text
@cf/black-forest-labs/flux-1-schnell
```

This round has ONE GOAL ONLY:

> Determine whether FLUX.1 Schnell, with the current HAY & ĐẸP. art direction and prompt discipline, can produce a stable enough visual style for production.

This is NOT a video render.
This is NOT character identity locking.
This is NOT world continuity locking.
This is NOT reference-image conditioning.

---

# 1. AUTH / SECRET SAFETY

The user will provide a valid Cloudflare account and API token they are authorized to use.

Expected environment variables:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Rules:

- Read them from `.env` / process environment.
- NEVER print the values.
- NEVER include them in reports.
- NEVER copy them into source code.
- NEVER write them into scratch outputs.
- Do not modify `.env`.

Audit only:

```text
CLOUDFLARE_ACCOUNT_ID present: YES/NO
CLOUDFLARE_API_TOKEN present: YES/NO
```

If either is missing:

```text
V3.3A-S SCHNELL STYLE BASELINE — FAIL
```

and STOP.

---

# 2. HARD SCOPE LOCK

Allowed new/modified file:

```text
scripts/test-hay-dep-schnell-style-baseline.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-style-baseline/
```

Do NOT modify:

- `scripts/human-insight-image.mjs`
- `scripts/batch-engine.mjs`
- Story Planner
- cast registry
- world presets
- SFX
- subtitle alignment
- Remotion
- production manifest
- production assets

Do NOT render MP4.

Do NOT write generated images into:

```text
public/assets/human-insight/
```

This is an isolated visual experiment only.

---

# 3. MODEL / GENERATION SETTINGS

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Do NOT use:
- FLUX.2 dev
- FLUX.2 klein
- any other model

Use the same generation shape as current production as closely as possible.

Target:

```text
steps = 4
```

If the current Cloudflare schema rejects explicit `steps` or `seed`,
report that fact and use only the fields actually supported by the current API.

Do not fake seed support.

---

# 4. ONE AUTH PROBE FIRST

Before the 8-image baseline:

Perform exactly ONE minimal probe generation.

Use:

```text
seed = 2101
```

if seed is supported.

Subject:

```text
A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.
```

Use the exact style prompt defined below.

If the API returns:
- authentication error;
- permission error;
- invalid account;
- quota exhaustion;

STOP immediately and report the error category without exposing secrets.

Do not repeatedly retry.

If the probe succeeds, it may count as candidate 2101.

---

# 5. FIXED HAY & ĐẸP. STYLE PROMPT

Use this exact art direction in every candidate:

```text
STYLE LOCK — HAY & ĐẸP.

Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian adult proportions.
Believable anatomy.
Restrained expressive face.
Clean charcoal / sepia linework.
Soft warm ivory and cream base.
Muted sage accents.
Warm wood tones.
Subtle tactile paper / editorial texture.
Natural diffused daylight.
Gentle dimensional shading.
Calm premium magazine-illustration feeling.
Simple but not flat.
Human, warm, mature, understated.

NOT photorealistic.
NOT anime.
NOT manga.
NOT chibi.
NOT children's-book cartoon.
NOT corporate flat vector.
NOT stick figure.
NOT watercolor wash.
NOT 3D render.
NOT oil painting.
NOT fashion sketch.
NOT glossy plastic skin.
NOT exaggerated facial features.
NOT hyper-detailed cinematic realism.
NO text.
NO logo.
NO watermark.
```

---

# 6. FIXED SUBJECT FOR BASELINE

All 8 candidates must use the SAME semantic subject:

```text
A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.
```

Reason:

> We are testing visual style stability, not storytelling.

Do NOT add:
- family
- children
- books
- phones
- room architecture
- branded text
- emotional narrative
- extra props

---

# 7. GENERATE EXACTLY 8 CANDIDATES

Use these seeds if supported:

```text
2101
2102
2103
2104
2105
2106
2107
2108
```

Save as:

```text
schnell-2101.*
schnell-2102.*
schnell-2103.*
schnell-2104.*
schnell-2105.*
schnell-2106.*
schnell-2107.*
schnell-2108.*
```

Do not create more than 8 full candidates.

If seed is not supported by the API:
- still create exactly 8 calls;
- name by call index;
- record `"seedSupported": false`;
- do not claim deterministic seeds.

---

# 8. CONTACT SHEET

Create:

```text
scratch/v33/schnell-style-baseline/contact-sheet.jpg
```

Layout:

```text
2 rows × 4 columns
```

External label for each image:

```text
FLUX.1 Schnell
seed 2101
```

or:

```text
FLUX.1 Schnell
candidate 01
```

if seed is unsupported.

Do NOT draw text inside source candidate images.

---

# 9. EVALUATION RUBRIC

Create:

```text
scratch/v33/schnell-style-baseline/evaluation.md
```

Evaluate each candidate ONLY on:

```text
Medium
Linework
Shading
Face rendering
Palette
Texture
Brand fit
Anatomy
```

Allowed rating values:

```text
STRONG
ACCEPTABLE
WEAK
FAIL
```

Also record drift flags:

```text
photorealDrift: YES/NO
animeDrift: YES/NO
chibiDrift: YES/NO
flatVectorDrift: YES/NO
anatomyFailure: YES/NO
```

Do NOT evaluate:
- same-person identity;
- room continuity;
- story semantics;
- motion;
- subtitles.

---

# 10. BASELINE PASS RULE

The SCHNELL BASELINE passes only if:

1. At least 6/8 candidates are visually usable.
2. At least 6/8 are clearly editorial 2D.
3. At least 6/8 have:
   - Medium >= ACCEPTABLE
   - Linework >= ACCEPTABLE
   - Face >= ACCEPTABLE
   - Palette >= ACCEPTABLE
   - Brand fit >= ACCEPTABLE
4. Zero candidate has severe malformed anatomy.
5. No more than 1/8 has photoreal/anime/chibi drift.
6. Overall palette remains recognizably:
   - ivory / cream
   - muted sage
   - warm wood
   - charcoal / sepia

If this fails:

```text
NO SCHNELL STYLE BASELINE APPROVED
```

Do not force production integration.

---

# 11. SELECT ONE REPRESENTATIVE REFERENCE FOR REVIEW ONLY

If baseline passes:

Choose exactly ONE candidate that best represents the desired look.

Copy to:

```text
scratch/v33/schnell-style-baseline/review-reference.jpg
```

Create:

```text
scratch/v33/schnell-style-baseline/review-reference.json
```

Example:

```json
{
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "seed": 2104,
  "sourceFile": "schnell-2104.jpg",
  "approvedForReview": true,
  "reason": "best balance of editorial 2D medium, restrained face, warm palette, tactile texture and mature brand fit"
}
```

Important:

This is NOT a reference-conditioning asset.

FLUX.1 Schnell is text-driven here.

This file is only a visual example for human review.

---

# 12. DO NOT INTEGRATE INTO PRODUCTION YET

Even if PASS:

Do NOT:
- change the production model;
- modify `human-insight-image.mjs`;
- modify batch-engine;
- render Video 001;
- batch generate 100 videos.

The next step must be HUMAN REVIEW of the 8 images.

---

# 13. REQUIRED OUTPUTS

Return:

```text
scripts/test-hay-dep-schnell-style-baseline.mjs

scratch/v33/schnell-style-baseline/
  schnell-2101.*
  schnell-2102.*
  schnell-2103.*
  schnell-2104.*
  schnell-2105.*
  schnell-2106.*
  schnell-2107.*
  schnell-2108.*
  contact-sheet.jpg
  evaluation.md
  review-reference.jpg        (only if baseline passes)
  review-reference.json       (only if baseline passes)
```

Also create:

```text
scratch/v33/schnell-style-baseline/run-report.json
```

with:

```json
{
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "candidateCount": 8,
  "seedSupported": true,
  "stepsRequested": 4,
  "probeSucceeded": true,
  "apiCalls": 8
}
```

Adjust factual fields if the API behaves differently.

---

# 14. FINAL REPORT

Return:

## A. Auth Check
Only YES/NO presence. No values.

## B. Probe Result

## C. Generation Settings

## D. 8-Candidate Summary

## E. Evaluation Table

## F. Contact Sheet Path

## G. Representative Review Candidate

## H. Limitations

Explicitly state:

```text
FLUX.1 Schnell does NOT provide real identity locking here.
Same seed + same text is not treated as guaranteed face continuity.
Reference-image conditioning is NOT part of this baseline.
```

## I. Verdict

Exactly one:

```text
V3.3A-S SCHNELL STYLE BASELINE — PASS
```

or:

```text
V3.3A-S SCHNELL STYLE BASELINE — FAIL
```

Then STOP.

Do not render Video 001.
Wait for human review.
