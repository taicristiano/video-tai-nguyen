# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.6.1
# SINGLE GOAL: SCHNELL TEXT-POLLUTION PROMPT GEOMETRY ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

V3.3B-S.6 real-image pilot produced:

```text
9/9 style PASS
9/9 semantic fidelity PASS
8/9 anatomy PASS
6/9 people contract PASS
4/9 text-pollution PASS
3/9 overall PASS
```

The dominant observed failure was unwanted pseudo-writing / artist-like marks.

Actual polluted beats included:
- beat-06: bottom-right cursive mark;
- beat-07: pseudo-lettering inside wall decoration;
- beat-09: bottom-right cursive mark;
- beat-10: bottom-right pseudo-writing;
- beat-15: bottom-right cursive mark.

Important hypothesis:

The Cloudflare FLUX.1 Schnell endpoint is prompt-only.
The current model-facing prompt literally contains phrases such as:

```text
No written words.
No logo.
No signature.
No watermark-like marks.
```

Because there is no separate negative-prompt channel here, these forbidden concepts still appear as tokens inside the positive prompt.

This task tests ONE hypothesis only:

> Remove all writing/signature/logo/watermark vocabulary from the model-facing prompt and replace it with positive clean-surface composition instructions.

Do NOT fix:
- anatomy;
- people-count hallucination;
- canonical assets;
- semantic routing;
- world continuity;
- identity;
- production integration.

---

# 1. HARD SCOPE LOCK

Allowed new script:

```text
scripts/test-hay-dep-schnell-clean-surface-geometry.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-clean-surface/
```

You may READ:
- S.6 prompts and QA;
- current Video 001 Story Plan;
- S.5.1 fulfillment plan;
- S.1 Style-First geometry.

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
scripts/test-hay-dep-schnell-capability-router.mjs
scripts/test-hay-dep-schnell-fulfillment-planner.mjs
scripts/test-hay-dep-video001-schnell-safe-pilot.mjs
```

No production code changes.
No MP4 render.

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

Use authorized credentials from environment / `.env`.

Never print secret values.

---

# 3. TEST EXACTLY FOUR PREVIOUSLY POLLUTED BEATS

Use current Video 001 semantics for:

```text
beat-06
beat-07
beat-09
beat-15
```

These four beats previously exhibited unwanted pseudo-writing.

Generate:

```text
4 beats × 2 independent calls = 8 images
```

No retries.
No replacement.
No cherry-picking.

Save:

```text
beat-06-a.jpg
beat-06-b.jpg
beat-07-a.jpg
beat-07-b.jpg
beat-09-a.jpg
beat-09-b.jpg
beat-15-a.jpg
beat-15-b.jpg
```

---

# 4. KEEP STYLE-FIRST GEOMETRY UNCHANGED

Keep:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
4. VISIBLE PEOPLE
5. CAST / SCENE
6. WORLD
7. FRAMING
8. CLEAN SURFACE POLICY
```

Do not move ACTION before style.

Do not change fulfillment:
- beat-06 stays current single father safe beat;
- beat-07 stays school/work object beat;
- beat-09 stays current single mother beat;
- beat-15 stays no-people release.

---

# 5. CRITICAL TOKEN EXCLUSION

The exact MODEL-FACING PROMPT must contain NONE of these tokens/phrases, case-insensitive:

```text
text
word
written
writing
letter
lettering
logo
signature
watermark
caption
label
brand
typography
font
sign
signed
```

This includes negative constructions.

Forbidden examples:

```text
No text
No signature
No logo
No watermark
No lettering
```

Do not send those words to Schnell at all.

Before every API call, programmatically validate the final prompt.

If any forbidden token exists:

```text
throw
```

and STOP before the API call.

Report the offending token.

---

# 6. POSITIVE CLEAN-SURFACE POLICY

Replace all previous writing-related exclusions with this exact concept:

```text
CLEAN SURFACE POLICY:

Plain uninterrupted warm-paper surfaces.
Walls and furniture use simple solid shapes and natural wood grain only.
Decor consists only of simple plants, plain ceramic objects and geometric color blocks.
Bottom-right area remains quiet blank warm ivory paper with generous empty space.
Frame edges and corners stay visually clean and undecorated.
```

Important:

The model-facing block itself must obey Section 5.

If any word in this block conflicts with Section 5, rephrase it without forbidden vocabulary.

---

# 7. REMOVE HIGH-RISK DECOR

For ALL four test beats:

Do not request:
- framed wall art;
- posters;
- books with visible covers;
- papers facing the viewer;
- plaques;
- decorative certificates;
- calendars;
- printed packaging;
- clothing graphics.

Use only:
- plain walls;
- curtain;
- simple plant;
- blank ceramic vase;
- undecorated furniture;
- plain bag surfaces.

This is a text-pollution experiment, not a world-richness experiment.

---

# 8. BOTTOM-RIGHT SAFE AREA

Every prompt must positively reserve:

```text
the lower-right corner as quiet empty warm ivory paper / plain wall area
```

No focal person, bag, furniture detail, plant or important semantic object may occupy that lower-right region.

This creates a deterministic future cleanup-safe zone if needed.

Do NOT post-process or crop images in this task.

---

# 9. PEOPLE / SEMANTICS STAY UNCHANGED

Use the existing S.6 people contract and final fulfillment semantics.

Do not intentionally simplify further.

If beat-07 hallucinates a human:
record it, but do not reject for the TEXT-POLLUTION experiment.

If beat-06/09 anatomy is imperfect:
record separately, but do not reject the text-cleanliness result.

This round scores text cleanliness first.

---

# 10. STYLE GUARD

Every image must remain:

```text
TARGET_EDITORIAL_2D
```

Use the same proven:
- visible ink contours;
- matte gouache-like fills;
- warm paper;
- sepia/charcoal lines;
- muted sage;
- warm wood.

Do not weaken S.1.

---

# 11. EVALUATION

Create:

```text
evaluation.md
```

For each image record:

```text
beatId

unwantedPseudoWriting:
  YES / NO

location:
  NONE
  LOWER_RIGHT
  WALL_DECOR
  OBJECT_SURFACE
  OTHER

stylePreserved:
  PASS / FAIL

peopleContractObservation:
  PASS / FAIL / NOT_SCORED

anatomyObservation:
  PASS / FAIL / NOT_SCORED

semanticObservation:
  PASS / FAIL / NOT_SCORED

textCleanliness:
  PASS / FAIL
```

`textCleanliness = PASS` only when there is no visible pseudo-writing / artist-like mark anywhere.

Do not use OCR as the primary evaluator.
Inspect the images visually.

---

# 12. CONTACT SHEET

Create:

```text
scratch/v33/schnell-clean-surface/contact-sheet.jpg
```

Layout:

```text
4 rows × 2 columns
```

External labels only:

```text
beat-06 A
beat-06 B
...
```

Do not alter source pixels.

---

# 13. BASELINE COMPARISON

Create:

```text
comparison.md
```

Baseline S.6 facts:

```text
Text-clean PASS = 4/9
Text-polluted = 5/9
```

For the four selected polluted baseline beats:

```text
beat-06 = polluted
beat-07 = polluted
beat-09 = polluted
beat-15 = polluted
```

Compare only descriptively.

Do not claim statistical certainty from 8 samples.

---

# 14. PASS RULE

PASS only if:

```text
7/8 textCleanliness = PASS
```

AND:

```text
8/8 stylePreserved = PASS
```

AND every tested beat gets at least one clean sample:

```text
beat-06 >= 1/2 clean
beat-07 >= 1/2 clean
beat-09 >= 1/2 clean
beat-15 >= 1/2 clean
```

No retries.

If FAIL:

Do NOT start another prompt-only writing-suppression loop.

Conclude:

```text
Prompt-only clean-surface geometry is insufficient to suppress Schnell pseudo-writing reliably.
```

The next solution must be post-generation QA/cleanup or a different model.

---

# 15. REQUIRED OUTPUTS

```text
scripts/test-hay-dep-schnell-clean-surface-geometry.mjs

scratch/v33/schnell-clean-surface/
  beat-06-a.jpg
  beat-06-b.jpg
  beat-07-a.jpg
  beat-07-b.jpg
  beat-09-a.jpg
  beat-09-b.jpg
  beat-15-a.jpg
  beat-15-b.jpg
  contact-sheet.jpg
  evaluation.md
  comparison.md
  prompts.json
  run-report.json
```

`prompts.json` must include:
- exact model-facing prompt;
- character count;
- forbidden-token validation result.

No credentials.

---

# 16. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Why This Differs From S.6

## C. Forbidden-Token Validation

## D. 8-Image Text Cleanliness Table

## E. Style Preservation

## F. Contact Sheet Path

## G. S.6 vs S.6.1 Comparison

## H. Architectural Decision

If PASS:

```text
Positive clean-surface geometry materially reduces Schnell pseudo-writing and can proceed to the next structural reliability gate.
```

If FAIL:

```text
Prompt-only clean-surface geometry is insufficient to suppress Schnell pseudo-writing reliably.
```

## I. Verdict

Exactly one:

```text
V3.3B-S.6.1 SCHNELL CLEAN-SURFACE GEOMETRY — PASS
```

or:

```text
V3.3B-S.6.1 SCHNELL CLEAN-SURFACE GEOMETRY — FAIL
```

Then STOP.

Do not render MP4.
Wait for human review.
