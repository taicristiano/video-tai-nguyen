# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — FINAL GATE 2
# CANONICAL CAST + REFERENCE CONTINUITY PILOT
# PRIMARY MODEL: @cf/black-forest-labs/flux-2-dev
# ONE GOAL: PROVE RECURRING CHARACTER IDENTITY WITH A CANONICAL FAMILY MASTER

## WHY THIS GATE EXISTS

FINAL GATE 1 is now conclusively complete:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — FAIL
```

Evidence:
- Schnell style and simplified semantics are useful.
- But one supposedly safe zero-person beat (`beat-07`) exhausted all 3 real QA attempts:
  - Attempt 1: extra/background human + pseudo-writing
  - Attempt 2: drawn human figure leaked into wall frame
  - Attempt 3: bottom-right `@210` pseudo-mark
- Therefore Schnell + bounded retry is NOT sufficient as the only production image path.

Also, V3.3 is specifically about:

```text
Character + Style + World Identity
```

Prompt-only Schnell does NOT provide recurring-character identity lock across independent generations.

Therefore the architecture is now LOCKED as:

```text
OBJECT / ENVIRONMENT
  → Schnell primary
  → bounded QA/retry
  → stronger-model fallback if exhausted

RECURRING HUMAN CAST
  → reference-capable stronger model directly

GROUP / CANONICAL CAST
  → reference-capable stronger model directly
  → reuse canonical assets where semantics allow
```

This gate tests ONE thing only:

> Can a reference-capable stronger model create one approved canonical family master and preserve the same recurring characters across derived single-person shots?

Do NOT revisit Schnell prompt engineering.

---

# 1. HARD SCOPE LOCK

Allowed new script:

```text
scripts/test-hay-dep-final-gate2-canonical-cast.mjs
```

Allowed output:

```text
scratch/v33/final-gate2-canonical-cast/
```

You may READ:
- current Video 001 Story Plan;
- current cast registry `family-young-01`;
- current world preset `home-family-01`;
- proven Style-First editorial 2D prompt geometry;
- any existing prior FLUX.2 Dev test script in the repo.

Do NOT modify:
- production image generator;
- batch engine;
- story planner;
- cast registry;
- world registry;
- subtitles;
- SFX;
- Remotion;
- production assets/manifests.

No MP4.

---

# 2. MODEL

Use ONLY:

```text
@cf/black-forest-labs/flux-2-dev
```

Use only authorized Cloudflare credentials/quota.

Do not rotate accounts or credentials to bypass quota.

If quota is unavailable:

```text
FINAL GATE 2 — PAUSED_QUOTA
```

and STOP.

---

# 3. DO NOT INVENT THE IMAGE-CONDITIONING API SCHEMA

Before any generation:

1. Search the repo for the prior working FLUX.2 Dev script / payload used during V3.3A-1 or related experiments.
2. Reuse the actual known request shape.
3. Confirm how reference image conditioning is represented.

If no grounded working image-conditioning request shape exists:

```text
FINAL GATE 2 — BLOCKED_REFERENCE_SCHEMA
```

and STOP.

Do not guess Cloudflare fields.

---

# 4. CANONICAL CAST CONTRACT

Use the CURRENT `family-young-01` registry descriptions.

Canonical master must contain exactly:

```text
father
mother
boy
girl
```

Required broad structure:

```text
2 Vietnamese adults
1 school-age boy
1 younger/school-age girl
```

Use registry truth for exact ages/clothing/details.

Do not hardcode descriptions that conflict with current registry.

---

# 5. CANONICAL MASTER SCENE

Create one canonical family master representing the family together in `home-family-01`.

Semantic purpose:

```text
the recurring family identity master
```

Scene:

```text
family gathered naturally around a simple dining table in their warm home
```

This is NOT yet a production beat replacement.

It is an identity reference asset.

Composition:
- all four people clearly visible;
- no overlapping faces;
- no hidden child;
- no cropped heads;
- adults and children visibly distinct in age/body scale;
- calm natural interaction;
- enough separation that each member can be visually recognized.

---

# 6. STYLE LOCK

Use the already-proven Style-First ordering:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
4. CAST
5. PRIMARY SCENE
6. WORLD
7. FRAMING
8. EXCLUSIONS
```

Target:

```text
TARGET_EDITORIAL_2D
```

Visual language:
- mature editorial illustration;
- visible charcoal/sepia contour lines;
- matte gouache-like fills;
- warm ivory paper;
- muted sage;
- warm wood;
- restrained terracotta/amber;
- low saturation;
- no photographic vocabulary.

Do not use:
- candid;
- portrait photography;
- bokeh;
- cinematic realism;
- lens language.

---

# 7. CANONICAL MASTER BOUNDED GENERATION

Canonical master gets:

```text
maximum 3 attempts
```

For each candidate visually evaluate:

```text
STYLE
EXACT PEOPLE COUNT
ROLE / AGE BINDING
ANATOMY
TEXT POLLUTION
WORLD FIT
```

Select the FIRST candidate that passes all six.

Do not cherry-pick after a PASS.

If all three fail:

```text
FINAL GATE 2 — FAIL
```

and STOP.

Do not continue to derived images.

Save selected canonical:

```text
canonical-family-master.jpg
```

Also retain rejected attempts.

---

# 8. DERIVED REFERENCE-CONDITIONED SHOTS

After canonical master PASS, generate exactly THREE derived shots using the selected canonical image as the identity reference.

Each derived shot:

```text
1 API call only
```

No retry in this gate.

The goal is to measure reference continuity honestly.

Generate:

## Derived A — Boy

Based on Video 001 simplified speaking beat:

```text
exactly one visible boy
same boy identity as canonical master
speaking gently with a small hand gesture
someone implied off-frame
warm family home
```

Save:

```text
derived-boy.jpg
```

## Derived B — Mother

Based on Video 001 reflective beat:

```text
exactly one visible mother
same mother identity as canonical master
quiet reflective pause in living/dining area
```

Save:

```text
derived-mother.jpg
```

## Derived C — Father

Based on Video 001 safe/detail beat:

```text
exactly one visible father
same father identity as canonical master
simple everyday action near dining/living furniture
```

Save:

```text
derived-father.jpg
```

Do NOT include other family members visibly.

---

# 9. IDENTITY CONTINUITY QA

For each derived human, evaluate against the canonical master.

Required identity dimensions:

```text
broad facial structure
hair shape/style
age impression
gender presentation
body scale / age scale
distinctive registry traits
```

Clothing may vary only if the prompt intentionally changes it.

Do not require pixel-identical faces.

PASS means:

> A reasonable viewer would read the derived person as the same recurring illustrated character from the canonical family master.

Use:

```text
IDENTITY = PASS / FAIL
```

---

# 10. OTHER HARD QA FOR DERIVED SHOTS

Every derived image must also pass:

```text
STYLE
PEOPLE CONTRACT
SEMANTIC FIDELITY
ANATOMY
TEXT POLLUTION
WORLD FIT
```

So each derived image has seven gates:

```text
IDENTITY
STYLE
PEOPLE CONTRACT
SEMANTIC FIDELITY
ANATOMY
TEXT POLLUTION
WORLD FIT
```

Overall derived PASS only if all seven PASS.

---

# 11. CONTACT SHEETS

Create:

```text
contact-sheet-canonical.jpg
```

showing:
- canonical attempts;
- selected canonical clearly labeled externally.

Create:

```text
contact-sheet-continuity.jpg
```

Layout:

```text
canonical family master
derived boy
derived mother
derived father
```

External labels only.

Do not alter image pixels.

---

# 12. REQUIRED REPORT FILES

Create:

```text
canonical-qa.json
continuity-qa.json
run-report.json
evaluation.md
prompts.json
```

`prompts.json`:
- exact model-facing prompts;
- reference image used for each derived call;
- no credentials.

---

# 13. PASS RULE

FINAL GATE 2 PASS requires ALL:

```text
canonical family master = PASS
derived boy = PASS all 7 gates
derived mother = PASS all 7 gates
derived father = PASS all 7 gates
```

In particular:

```text
IDENTITY continuity = 3/3 PASS
STYLE = 4/4 PASS including canonical
TEXT pollution = 0 selected failures
severe anatomy = 0 selected failures
people contract = all selected PASS
```

No partial 2/3 identity acceptance.

---

# 14. FAIL RULE

FAIL if:
- canonical master cannot pass within 3 attempts;
- any one of the three derived reference-conditioned shots fails identity;
- any derived shot fails a hard selected-image gate.

Verdict:

```text
FINAL GATE 2 — CANONICAL CAST CONTINUITY — FAIL
```

Do NOT tune endlessly afterward.

Stop for architectural review.

---

# 15. ARCHITECTURAL MEANING

If PASS, we can lock:

```text
Recurring humans / family cast
→ canonical reference-capable stronger model

Objects / environment
→ Schnell primary
→ bounded retry
→ strong fallback on exhaustion
```

Then the next and final large step will be:

```text
FINAL GATE 3 — PRODUCTION SMOKE TEST
```

If FAIL, do not proceed to production smoke test.

---

# 16. REQUIRED FINAL REPORT

Return:

## A. Scope Confirmation

## B. Reference API Grounding
State exactly which existing repo implementation/request schema was reused.

## C. Canonical Attempt Table

```text
attempt
style
people count
role binding
anatomy
text
world
overall
```

## D. Selected Canonical Master

## E. Derived Continuity Table

```text
asset
identity
style
people
semantic
anatomy
text
world
overall
```

## F. Contact Sheet Paths

## G. API Call Count

## H. Decision

Exactly one:

```text
FINAL GATE 2 — CANONICAL CAST CONTINUITY — PASS
```

or:

```text
FINAL GATE 2 — CANONICAL CAST CONTINUITY — FAIL
```

or:

```text
FINAL GATE 2 — PAUSED_QUOTA
```

or:

```text
FINAL GATE 2 — BLOCKED_REFERENCE_SCHEMA
```

Then STOP.

Do not start FINAL GATE 3 automatically.
Wait for human review.
