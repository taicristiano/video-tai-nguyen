# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3A-1
# SINGLE GOAL: VISUAL STYLE LOCK ONLY
# RESUME AFTER PARALLEL FIXES 01–07

## STATUS

Parallel Fixes 01–07 are CLOSED.

Do NOT reopen:
- subtitle alignment
- ZIP packaging
- semantic beat splitting
- family action precedence
- cast member keys
- question canonical reuse
- semantic SFX

This task returns to the main V3.3 roadmap.

Current step:

```text
V3.3A-1 — STYLE LOCK ONLY
```

ONE goal:

> Find and prove one stable HAY & ĐẸP. visual illustration style for `human-insight/cinematic-light`.

This task is NOT character identity.
This task is NOT world continuity.
This task is NOT video rendering.

---

# 1. HARD SCOPE LOCK

Do NOT modify:
- `scripts/batch-engine.mjs`
- Story Planner
- subtitle system
- SFX
- cast logic
- world logic
- Remotion
- production image pipeline
- existing manifests
- existing video assets

Do NOT render:
- Video 001
- Video 005
- any MP4

Do NOT test:
- same-person identity across scenes
- same-room identity across angles
- family continuity
- story actions

Only test VISUAL STYLE.

---

# 2. QUOTA GATE FIRST

Cloudflare Workers AI quota previously failed with:

```text
free neurons 10,000/day exhausted
```

Before creating the full matrix:

1. Perform exactly ONE minimal probe call.
2. Use the first target model:
   `@cf/black-forest-labs/flux-2-dev`
3. Use the exact neutral style-test subject from this prompt.
4. Save probe output only if successful.

If the API returns quota exhaustion / daily neuron limit:

```text
V3.3A-1 STYLE LOCK — PAUSED_QUOTA
```

Then STOP immediately.

Do NOT:
- retry repeatedly;
- switch to production generation;
- modify source to work around quota;
- spend requests on other tasks.

If probe succeeds, continue.

---

# 3. ISOLATED SCRIPT ONLY

Create or update only:

```text
scripts/test-hay-dep-style-lock.mjs
```

Outputs must stay isolated under:

```text
scratch/v33/style-lock/
```

Do not write candidates into:

```text
public/assets/human-insight/
```

Do not update manifest.

---

# 4. MODELS

Test ONLY:

```text
@cf/black-forest-labs/flux-2-dev
@cf/black-forest-labs/flux-2-klein-9b
```

Do not add other models.

Do not use the production `flux-1-schnell` model for this experiment.

---

# 5. FIXED NEUTRAL SUBJECT

Pass 1 must use the SAME subject and SAME semantic content for every candidate:

```text
A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.
```

No:
- family dinner
- children
- books
- phones
- emotional storytelling
- detailed room architecture
- branded text
- narration-specific props

Reason:

> We are comparing STYLE, not storytelling ability.

---

# 6. HAY & ĐẸP. TARGET STYLE

Use this target consistently:

```text
Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian human proportions.
Believable adult anatomy.
Restrained expressive face.
Clean charcoal / sepia linework.
Soft warm ivory and cream base.
Muted sage accents.
Warm wood tones.
Subtle tactile paper/editorial texture.
Natural diffused daylight.
Gentle dimensional shading.
Calm premium magazine-illustration feeling.
Simple but not flat.
Human, warm, mature, understated.
```

Negative constraints:

```text
NOT photorealistic
NOT anime
NOT manga
NOT chibi
NOT children's-book cartoon
NOT corporate flat vector
NOT stick figure
NOT watercolor wash
NOT 3D render
NOT oil painting
NOT fashion sketch
NOT plastic glossy skin
NOT exaggerated facial features
NOT hyper-detailed cinematic realism
```

---

# 7. PASS 1 MATRIX

Use exactly these seeds:

```text
1101
1102
1103
1104
```

Generate:

```text
4 × FLUX.2 dev
4 × FLUX.2 klein 9B
```

Total full pass:

```text
8 candidate images
```

The probe image may reuse seed 1101 and count as that candidate if:
- request parameters are identical;
- output is saved correctly;
- model is FLUX.2 dev.

Do NOT create unnecessary duplicate calls.

Candidate naming:

```text
flux2-dev-1101.*
flux2-dev-1102.*
flux2-dev-1103.*
flux2-dev-1104.*

flux2-klein9b-1101.*
flux2-klein9b-1102.*
flux2-klein9b-1103.*
flux2-klein9b-1104.*
```

---

# 8. CONTACT SHEET

Create:

```text
scratch/v33/style-lock/contact-sheet-pass1.jpg
```

Layout:

```text
2 rows × 4 columns
```

Row 1:
FLUX.2 dev seeds 1101–1104

Row 2:
FLUX.2 klein 9B seeds 1101–1104

External labels only.

Do NOT place labels inside candidate image content.

Each label must show:

```text
model
seed
```

---

# 9. EVALUATION RUBRIC

Create:

```text
scratch/v33/style-lock/style-evaluation-pass1.md
```

Evaluate ONLY:

```text
Medium
Linework
Shading
Face rendering
Palette
Texture
Brand fit
```

Allowed rating values:

```text
STRONG
ACCEPTABLE
WEAK
FAIL
```

Do NOT evaluate:
- character consistency
- room continuity
- story semantics
- motion
- subtitle
- composition across video

### Minimum approval threshold

A candidate can become style reference only if:

```text
Medium       = STRONG
Palette      = STRONG
Linework     >= ACCEPTABLE
Shading      >= ACCEPTABLE
Face         >= ACCEPTABLE
Texture      >= ACCEPTABLE
Brand fit    = STRONG
```

And candidate must have ZERO:
- photoreal drift;
- anime drift;
- chibi drift;
- malformed adult anatomy;
- text/logo/watermark.

If no candidate meets this:

```text
NO STYLE REFERENCE APPROVED
```

Then STOP.

Do not force a winner.

---

# 10. SELECT EXACTLY ONE STYLE REFERENCE

If at least one candidate genuinely passes:

Choose exactly ONE.

Copy/save as:

```text
scratch/v33/style-lock/style-reference.jpg
```

Also create:

```text
scratch/v33/style-lock/style-reference.json
```

with:

```json
{
  "model": "...",
  "seed": 1101,
  "sourceFile": "...",
  "reason": "...",
  "approved": true
}
```

Reason must refer only to the style rubric.

---

# 11. REPEATABILITY TEST

Only run this section if style-reference was approved.

Use the WINNING MODEL only.

Use `style-reference.jpg` as reference-image conditioning if supported by the winning model/API.

Generate four DIFFERENT adults:

### A

```text
Vietnamese adult man standing near a window,
holding a ceramic cup,
simple neutral clothing,
calm natural posture.
```

### B

```text
Vietnamese adult woman beside a small wooden table,
gently arranging a few flowers,
simple neutral clothing.
```

### C

```text
Vietnamese adult man seated at a small desk,
reading a short handwritten note,
calm daylight.
```

### D

```text
Vietnamese adult woman tying a simple apron
beside a small side table,
natural everyday posture.
```

Important:

```text
STYLE SAME
PERSON DIFFERENT
```

Do NOT attempt to preserve the same face.

That belongs to V3.3A-2.

Save:

```text
repeat-A.*
repeat-B.*
repeat-C.*
repeat-D.*
```

---

# 12. REPEATABILITY CONTACT SHEET

Create:

```text
contact-sheet-repeatability.jpg
```

Include:

```text
style-reference
A
B
C
D
```

External labels only.

Also create:

```text
style-evaluation-repeatability.md
```

Evaluate same rubric:

```text
Medium
Linework
Shading
Face rendering
Palette
Texture
Brand fit
```

---

# 13. REPEATABILITY PASS CRITERIA

PASS only if:

1. one approved style reference exists;
2. all 4 repeat images remain clearly editorial 2D;
3. zero photoreal drift;
4. zero anime/chibi drift;
5. linework remains recognizably consistent;
6. shading language remains consistent;
7. palette remains ivory/cream/sage/warm wood;
8. texture remains editorial/tactile;
9. at least 3/4 repeat images are STRONG or ACCEPTABLE overall;
10. zero repeat image is FAIL.

Remember:

Different faces are EXPECTED.

Do not fail because A/B/C/D are different people.

---

# 14. API / REFERENCE CONDITIONING

Do not guess API fields.

Inspect the current Cloudflare model schema/working code before using reference images.

If the selected model does not support the intended reference-image input in the current API:

- report this clearly;
- do not fake reference conditioning;
- do not silently fall back to text-only and call it the same test.

In that case:

```text
V3.3A-1 STYLE LOCK — FAIL
```

with reason:
reference-conditioned repeatability could not be tested as specified.

---

# 15. NO PRODUCTION INTEGRATION

Even if PASS:

Do NOT:
- modify `human-insight-image.mjs`;
- replace production image model;
- update batch-engine;
- add style reference to production;
- start character identity;
- start world lock.

This task is experimental proof only.

---

# 16. REQUIRED OUTPUTS

If quota is available and full test runs, return:

1. `scripts/test-hay-dep-style-lock.mjs`
2. 8 Pass-1 candidates
3. `contact-sheet-pass1.jpg`
4. `style-evaluation-pass1.md`
5. `style-reference.jpg` if approved
6. `style-reference.json` if approved
7. repeat-A/B/C/D if reference approved
8. `contact-sheet-repeatability.jpg`
9. `style-evaluation-repeatability.md`

If quota blocks at probe:

Return only:
- probe error summary without secrets;
- exact quota status;
- verdict `PAUSED_QUOTA`.

---

# 17. FINAL VERDICT

Exactly one:

```text
V3.3A-1 STYLE LOCK — PASS
```

or:

```text
V3.3A-1 STYLE LOCK — FAIL
```

or:

```text
V3.3A-1 STYLE LOCK — PAUSED_QUOTA
```

Then STOP.

Do not start V3.3A-2 automatically.
Wait for human review.
