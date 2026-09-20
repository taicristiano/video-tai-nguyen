# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.1
# SINGLE GOAL: SCHNELL STYLE-FIRST PROMPT GEOMETRY
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

The Video 001 real-asset pilot FAILED.

Observed production-like results:

```text
13 beats required generation
30 API calls
4 first-attempt passes
8 beats failed all 3 attempts
18 rejected attempts had severe realistic / near-photoreal style drift
```

The contact sheets show two unstable visual modes:
1. realistic digital-painting / near-photoreal scenes;
2. simpler clean 2D scenes.

The CURRENT pilot prompt is structured roughly as:

```text
ACTION
SCENE MEANING
CAST
WORLD
STYLE
ANATOMY
SHOT
NEGATIVE
```

For FLUX.1 Schnell, the visual medium/style instructions therefore arrive AFTER a large amount of scene/cast/world semantics.

This round tests ONE hypothesis only:

> Put a concrete 2D rendering recipe FIRST, simplify photographic-sounding wording, then append scene semantics.

Do NOT fix anatomy, people-count, phone semantics, noPeople, identity, or world continuity in this round.

---

# 1. HARD SCOPE LOCK

Allowed new/modified file:

```text
scripts/test-hay-dep-schnell-style-first-geometry.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-style-first/
```

You may READ:
- current Video 001 Story Plan;
- cast registry;
- world lock;
- current pilot prompt builder;
- current selected/rejected QA report.

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
```

Do NOT modify:
- cast registry;
- world presets;
- subtitle;
- SFX;
- Remotion;
- production manifest/assets.

Do NOT render MP4.

---

# 2. MODEL / AUTH

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Known API behavior:

```text
prompt-only payload
seed unsupported
steps unsupported
```

Do not retry unsupported parameters.

Read authorized Cloudflare credentials from environment / `.env`.

Never print secret values.

---

# 3. USE FOUR REAL HARD BEATS

Use CURRENT Video 001 Story Plan.

Test exactly these beats because the previous pilot repeatedly drifted realistic:

```text
beat-01  establish
beat-02  reflection
beat-04  interaction
beat-09  reflection
```

Do NOT alter:
- voiceClause;
- visualIntent;
- visualAction;
- requested presentMembers;
- castId;
- worldId.

We are testing prompt geometry, not story logic.

---

# 4. EXACTLY TWO GENERATIONS PER BEAT

Generate:

```text
4 beats × 2 independent calls = 8 images
```

No retry.
No replacement.
No cherry-picking.

Save:

```text
beat-01-a.jpg
beat-01-b.jpg
beat-02-a.jpg
beat-02-b.jpg
beat-04-a.jpg
beat-04-b.jpg
beat-09-a.jpg
beat-09-b.jpg
```

---

# 5. NEW PROMPT ORDER

The model-facing prompt MUST use this exact section order:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
4. CAST
5. PRIMARY ACTION
6. WORLD
7. FRAMING
8. HARD EXCLUSIONS
```

Do NOT put ACTION first.

Do NOT put WORLD before medium/style.

---

# 6. MEDIUM LOCK — MUST BE FIRST

Start every prompt with:

```text
MEDIUM LOCK:

2D EDITORIAL DRAWING ONLY.
Hand-drawn magazine illustration on warm paper.
Visible ink contour lines around faces, bodies, hands, furniture and objects.
Opaque matte color shapes with restrained soft shading.
Clearly drawn and illustrated, never camera-rendered.
Mature contemporary editorial illustration for adults.
```

This must be the first model-facing content.

No title or metadata before it.

---

# 7. RENDERING RECIPE

Immediately after MEDIUM LOCK:

```text
RENDERING RECIPE:

Charcoal / sepia contour drawing.
Matte gouache-like color fills.
One restrained soft shadow layer.
Subtle paper grain visible across the image.
Simplified but believable adult facial features.
Natural Vietnamese / East Asian proportions.
Edges remain visibly illustrated instead of photographic.
Background details are simplified into clean drawn shapes.
No lens effects, no bokeh, no cinematic camera realism.
```

Important:
- this is a rendering recipe, not abstract adjectives;
- do NOT use the phrase `photorealistic` in the positive prompt;
- do NOT mention DSLR, photography, film still, cinematic realism.

---

# 8. PALETTE

Then:

```text
PALETTE:

Warm ivory and cream background.
Muted sage clothing or accents.
Warm medium wood.
Charcoal / sepia linework.
Small restrained terracotta or amber accents.
Low saturation.
No glossy surfaces.
```

---

# 9. CAST

Use current requested `presentMembers`.

Keep cast descriptions, but COMPACT them.

Example family member descriptions should retain identity semantics but remove verbose photographic language.

Do NOT add people that are not requested.

Do NOT solve people-contract reliability in this task.

---

# 10. PRIMARY ACTION

Use:

```text
PRIMARY ACTION:
<current visualAction>
```

Then one short line:

```text
MEANING:
<compact current visualIntent, max ~220 characters>
```

Do not paste repeated clauses or duplicated priority explanations.

Remove:
- `Visual priority hint: ... Convert this priority...`
- redundant narrative text already expressed by action.

---

# 11. WORLD

Use current world anchors, but compact to maximum 3 lines:

```text
WORLD:
Same Vietnamese family dining room.
Medium warm-wood table, warm ivory walls, one pendant lamp.
Keep window/furniture anchors simple and drawn.
```

Use actual current world preset values.

Do NOT repeat `WORLD LOCK:` twice.

---

# 12. FRAMING

Do NOT use:

```text
candid
camera
portrait photography
shallow depth of field
cinematic
```

Convert current shot metadata into drawing language.

Examples:

```text
Wide drawn establishing composition.
Medium drawn interaction composition.
Detail illustration focused on a hand/object action.
Balanced editorial framing with breathing room.
```

Use current shotScale/composition semantics without photographic vocabulary.

---

# 13. HARD EXCLUSIONS — LAST

End with:

```text
HARD EXCLUSIONS:

No written words anywhere in the illustration.
No signs, labels, logos, signatures or watermark-like marks.
No anime styling.
No chibi styling.
No children's-book styling.
No flat corporate vector styling.
No 3D rendering.
No glossy realistic skin.
No extra decorative wall lettering.
```

Do NOT add a long anatomy block here.

This test is STYLE ONLY.

---

# 14. PROMPT LENGTH

Target:

```text
<= 1400 characters
```

Hard maximum:

```text
1600 characters
```

If above 1600:
compact semantic/world wording.

Do NOT blind-slice text.

Record prompt length for each beat.

---

# 15. CONTACT SHEET

Create:

```text
scratch/v33/schnell-style-first/contact-sheet.jpg
```

Layout:

```text
4 rows × 2 columns
```

Each row = same beat A/B.

External labels:

```text
beat-01 A
beat-01 B
...
```

---

# 16. STYLE EVALUATION ONLY

Create:

```text
evaluation.md
```

For each image classify:

```text
medium:
  TARGET_EDITORIAL_2D
  REALISTIC_DIGITAL_PAINTING
  CHILDREN_BOOK_CARTOON
  ANIME_LIKE
  FLAT_VECTOR
  OTHER

linework:
  STRONG
  ACCEPTABLE
  WEAK
  FAIL

palette:
  STRONG
  ACCEPTABLE
  WEAK
  FAIL

texture:
  STRONG
  ACCEPTABLE
  WEAK
  FAIL

adult_brand_fit:
  STRONG
  ACCEPTABLE
  WEAK
  FAIL
```

Also:

```text
severeStyleDrift: YES/NO
```

Do NOT reject for:
- anatomy;
- wrong people count;
- semantic mismatch;
- identity mismatch.

Those are explicitly outside this test.

---

# 17. ACTUAL HUMAN-REVIEW STANDARD

Be conservative.

The following are NOT sufficient to call TARGET_EDITORIAL_2D:

```text
a realistic digital painting that is merely not a photograph
a generic anime illustration
a children's-book family drawing
a flat corporate illustration
```

TARGET_EDITORIAL_2D should visibly have:
- drawn contour language;
- matte color treatment;
- adult editorial restraint;
- consistent paper-like rendering.

---

# 18. PASS RULE

PASS only if:

```text
7/8 images = TARGET_EDITORIAL_2D
```

AND:

```text
0/8 severe realistic / near-photoreal drift
```

AND:

```text
at least 7/8 adult_brand_fit >= ACCEPTABLE
```

If any two images fall into realistic digital painting:

```text
FAIL
```

Do not retry.

---

# 19. BASELINE COMPARISON

Create:

```text
comparison.md
```

Use existing pilot QA facts:

```text
Previous real-asset pilot:
18 style-drift rejection events
8 generated beats failed all retries overall
```

For the four tested beats specifically, report previous style behavior from `qa.json`.

Then compare against the new 8-image style-first set.

Do not claim statistical certainty.

---

# 20. NO PRODUCTION INTEGRATION

Even if PASS:

Do NOT:
- edit production prompt builder;
- rerun all 16 beats;
- render video;
- change model integration.

Human review comes first.

---

# 21. REQUIRED OUTPUTS

```text
scripts/test-hay-dep-schnell-style-first-geometry.mjs

scratch/v33/schnell-style-first/
  beat-01-a.jpg
  beat-01-b.jpg
  beat-02-a.jpg
  beat-02-b.jpg
  beat-04-a.jpg
  beat-04-b.jpg
  beat-09-a.jpg
  beat-09-b.jpg
  contact-sheet.jpg
  evaluation.md
  comparison.md
  prompts.json
  run-report.json
```

`prompts.json` must contain the exact model-facing prompts and character counts, but NO credentials.

---

# 22. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Previous Prompt Geometry

## C. New Style-First Geometry

## D. Prompt Lengths

## E. 8-Image Style Table

## F. Contact Sheet

## G. Previous vs New Style Drift

## H. Limitations

State clearly:
- anatomy not evaluated;
- people contract not evaluated;
- semantic fidelity not evaluated;
- identity/world continuity not evaluated.

## I. Verdict

Exactly one:

```text
V3.3B-S.1 SCHNELL STYLE-FIRST PROMPT GEOMETRY — PASS
```

or:

```text
V3.3B-S.1 SCHNELL STYLE-FIRST PROMPT GEOMETRY — FAIL
```

Then STOP.

Wait for human review.
