# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3A-S.1
# SINGLE GOAL: SCHNELL ANATOMY ROBUSTNESS ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

V3.3A-S baseline produced 8 candidates.

Observed result:
- 7/8 visually usable;
- 7/8 clearly editorial 2D;
- Candidate 04 was the strongest style benchmark;
- Candidate 06 had one severe structural anatomy failure:
  floating head / disconnected hand / missing torso.

Therefore:

```text
V3.3A-S SCHNELL STYLE BASELINE — FAIL
```

only because the baseline contract required ZERO severe anatomy failures.

This round has ONE GOAL ONLY:

> Test whether a stricter anatomical framing prompt can eliminate severe structural failures while preserving the same Schnell visual style.

Do NOT solve text bleed in this task.
Do NOT change production code.
Do NOT render video.

---

# 1. HARD SCOPE LOCK

Allowed new/modified file:

```text
scripts/test-hay-dep-schnell-anatomy-robustness.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-anatomy-robustness/
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

---

# 2. AUTH / SECRET SAFETY

Use existing:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

from environment / `.env`.

Never print values.
Never copy values into source.
Do not modify `.env`.

Only report:

```text
CLOUDFLARE_ACCOUNT_ID present: YES/NO
CLOUDFLARE_API_TOKEN present: YES/NO
```

---

# 3. MODEL

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Current API behavior already established:

```text
seed unsupported
steps unsupported
prompt-only payload
```

Do NOT retry seed/steps again.

Do NOT spend an extra probe call.

Proceed directly with exactly 8 prompt-only generations.

---

# 4. KEEP THE SAME STYLE LANGUAGE

Use the same editorial visual direction as V3.3A-S.

Do NOT intentionally change:
- palette;
- linework;
- shading;
- texture;
- face style;
- medium.

Use:

```text
Premium warm editorial 2D illustration.

Natural Vietnamese / East Asian adult proportions.
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

Important:

Do NOT evaluate or optimize text bleed here.
That will be a separate task if needed.

---

# 5. FIXED SUBJECT

Use the SAME semantic subject in all 8 candidates:

```text
A Vietnamese adult standing beside a small warm-wood side table,
holding a simple ceramic cup,
calm neutral expression,
plain warm ivory background,
soft natural daylight.
```

---

# 6. ADD ONLY ANATOMY / FRAMING CONSTRAINTS

Append this exact block:

```text
ANATOMY AND FRAMING LOCK:

One complete adult human body is clearly readable.
Show the person from head to at least mid-thigh.
Head, neck, shoulders, torso, both upper arms and both forearms are anatomically connected.
Both hands must belong naturally to the same visible body.
One hand may hold the ceramic cup.
The other hand rests naturally beside the body or lightly on the table.
Keep the torso fully present and visually connected between head and hips.
Keep the whole upper body comfortably inside frame with breathing room.

No floating head.
No detached hand.
No detached arm.
No missing torso.
No severed body parts.
No duplicate hands.
No extra fingers dominating the composition.
No body hidden behind plants or decorative objects.
No extreme crop through the neck, shoulders, chest, wrists or hands.
No surreal anatomy.
```

Do NOT add any other prompt changes.

---

# 7. GENERATE EXACTLY 8 CANDIDATES

Exactly 8 API calls.

Save:

```text
anatomy-01.jpg
anatomy-02.jpg
anatomy-03.jpg
anatomy-04.jpg
anatomy-05.jpg
anatomy-06.jpg
anatomy-07.jpg
anatomy-08.jpg
```

Do not generate replacements during this run.

We need an unbiased reliability sample.

---

# 8. CONTACT SHEET

Create:

```text
scratch/v33/schnell-anatomy-robustness/contact-sheet.jpg
```

2 rows × 4 columns.

External labels:

```text
Schnell Anatomy 01
...
Schnell Anatomy 08
```

No labels inside candidate image pixels.

---

# 9. EVALUATION

Create:

```text
scratch/v33/schnell-anatomy-robustness/evaluation.md
```

For each candidate evaluate ONLY:

```text
Head connected to torso: PASS/FAIL
Torso present: PASS/FAIL
Arms connected: PASS/FAIL
Hands connected: PASS/FAIL
No duplicate limbs: PASS/FAIL
No severe malformed anatomy: PASS/FAIL
Framing readable: PASS/FAIL
Style preserved: PASS/FAIL
```

Also record:

```text
severeAnatomyFailure: YES/NO
```

Do not score:
- identity consistency;
- world continuity;
- storytelling;
- text artifacts;
- SFX;
- motion.

---

# 10. STRICT PASS RULE

PASS only if:

```text
8/8 severeAnatomyFailure = NO
```

and:

```text
at least 7/8 style preserved = PASS
```

If even ONE candidate has:
- floating head;
- detached hand;
- missing torso;
- disconnected limb;
- severe duplicate anatomy;

then:

```text
V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — FAIL
```

Do not regenerate the bad candidate.

---

# 11. COMPARISON TO BASELINE

Create:

```text
comparison.md
```

Report:

```text
Baseline severe anatomy failure rate: 1/8 = 12.5%
New severe anatomy failure rate: X/8 = Y%
```

Also report whether:
- palette remained similar;
- editorial 2D medium remained similar;
- framing became more reliable.

Do NOT claim improvement unless supported by the 8 outputs.

---

# 12. NO PRODUCTION INTEGRATION

Even if PASS:

Do NOT:
- modify production image prompt;
- render Video 001;
- batch generate videos;
- start character identity;
- start world lock.

Human review comes next.

---

# 13. REQUIRED OUTPUTS

Return:

```text
scripts/test-hay-dep-schnell-anatomy-robustness.mjs

scratch/v33/schnell-anatomy-robustness/
  anatomy-01.jpg
  anatomy-02.jpg
  anatomy-03.jpg
  anatomy-04.jpg
  anatomy-05.jpg
  anatomy-06.jpg
  anatomy-07.jpg
  anatomy-08.jpg
  contact-sheet.jpg
  evaluation.md
  comparison.md
  run-report.json
```

`run-report.json` must include:

```json
{
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "candidateCount": 8,
  "seedSupported": false,
  "apiCalls": 8,
  "severeAnatomyFailureCount": 0
}
```

Use actual value for the last field.

---

# 14. FINAL REPORT

Return:

## A. Auth Check

## B. Generation Settings

## C. Anatomy Constraint Added

## D. 8-Candidate Anatomy Table

## E. Baseline vs New Failure Rate

## F. Contact Sheet Path

## G. Style Preservation

## H. Verdict

Exactly one:

```text
V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — PASS
```

or:

```text
V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — FAIL
```

Then STOP.

Do not start another fix.
Wait for human review.
