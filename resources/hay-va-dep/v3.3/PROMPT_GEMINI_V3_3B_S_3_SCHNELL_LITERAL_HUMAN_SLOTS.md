# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.3
# SINGLE GOAL: LITERAL HUMAN SLOT COMPOSITION
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

V3.3B-S.1 solved STYLE stability:
- 8/8 stayed editorial 2D.

V3.3B-S.2 failed PEOPLE CONTRACT:
- only 1/8 passed;
- exact numeric count sometimes worked;
- role identity often failed:
  - requested mother + boy became two adults;
  - requested father + mother + boy became two adults or malformed partial person;
  - 4-person family worked only 1/2.

Current S.2 prompt uses abstract relationship labels such as:

```text
father
mother
boy
girl
```

plus a relatively long negative people block.

This round tests ONE hypothesis only:

> FLUX.1 Schnell may obey people composition better when every visible human is defined as a concrete numbered visual slot with explicit age group, gender presentation, body scale, position and clothing — instead of relationship labels alone.

Do NOT solve:
- action fidelity;
- identity continuity;
- world continuity;
- text/signature pollution;
- video rendering.

---

# 1. HARD SCOPE LOCK

Allowed new/modified file:

```text
scripts/test-hay-dep-schnell-literal-human-slots.mjs
```

Allowed output directory:

```text
scratch/v33/schnell-literal-human-slots/
```

You may READ:
- current Video 001 Story Plan;
- V3.3B-S.1 style-first prompt;
- V3.3B-S.2 people-contract prompts/results.

Do NOT modify production files:

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
- production assets/manifests.

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

Use existing authorized Cloudflare credentials from environment / `.env`.

Never print credential values.

---

# 3. KEEP THE PROVEN STYLE-FIRST BLOCK UNCHANGED

The first three sections MUST remain the proven V3.3B-S.1 form:

```text
1. MEDIUM LOCK
2. RENDERING RECIPE
3. PALETTE
```

Do NOT weaken or reorder them.

Do NOT reintroduce:
- camera
- candid
- portrait photography
- bokeh
- cinematic
- shallow depth of field

Every output must remain TARGET_EDITORIAL_2D.

---

# 4. REPLACE ABSTRACT PEOPLE CONTRACT WITH LITERAL HUMAN SLOTS

Remove the previous long abstract block.

Use:

```text
HUMAN LAYOUT:
VISIBLE HUMAN COUNT = N.

SLOT 1: ...
SLOT 2: ...
...
```

Every slot must specify:
- adult/child;
- gender presentation;
- approximate age;
- relative height/body scale;
- simple clothing;
- fixed position in frame.

Use POSITIVE composition wording first.

End the block with only one compact constraint:

```text
The entire illustration contains these N human figures only, all clearly visible as separate coherent bodies.
```

Do NOT repeat a long list of negative people phrases.

---

# 5. TEST EXACTLY FOUR REAL BEATS

Use current Video 001 semantics for:

```text
beat-01
beat-02
beat-04
beat-09
```

Do NOT change voiceClause / visualAction / visualIntent.

---

# 6. EXACT HUMAN SLOT DEFINITIONS

## beat-01 — 4 humans

Use:

```text
HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 4.

SLOT 1 — left side:
Vietnamese adult man, age about 35–40,
adult male body proportions,
short black hair,
muted sage shirt.

SLOT 2 — right side:
Vietnamese adult woman, age about 32–38,
adult female body proportions,
tied black hair,
warm neutral cardigan.

SLOT 3 — front-left / nearer center:
Vietnamese boy, age about 8–10,
clearly child-sized body,
approximately two-thirds adult seated height,
short black hair,
muted sage top.

SLOT 4 — front-right / nearer center:
Vietnamese girl, age about 6–8,
clearly child-sized body,
smaller than both adults,
dark hair,
cream neutral clothing.

All four figures are visible simultaneously around the same dining table.
The entire illustration contains these four human figures only, all clearly visible as separate coherent bodies.
```

Important:
- do NOT use relationship labels as the main identity signal;
- `father/mother/boy/girl` may appear only in metadata outside the model prompt, not inside HUMAN LAYOUT.

---

## beat-02 — 2 humans

Use:

```text
HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 2.

SLOT 1 — left:
Vietnamese adult woman, age about 32–38,
adult female proportions,
tied black hair,
warm neutral cardigan.

SLOT 2 — right:
Vietnamese boy, age about 8–10,
clearly child-sized body,
approximately two-thirds the adult's seated height,
short black hair,
muted sage top.

The adult woman and the child are both clearly visible together.
The entire illustration contains these two human figures only, both clearly visible as separate coherent bodies.
```

Critical:
the second slot must LOOK CHILD-SIZED, not another adult.

---

## beat-04 — 3 humans

Use:

```text
HUMAN LAYOUT:
VISIBLE HUMAN COUNT = 3.

SLOT 1 — left:
Vietnamese adult man, age about 35–40,
adult male proportions,
short black hair,
muted sage shirt.

SLOT 2 — center:
Vietnamese boy, age about 8–10,
clearly child-sized body,
smaller than both adults,
short black hair,
muted sage top.

SLOT 3 — right:
Vietnamese adult woman, age about 32–38,
adult female proportions,
tied black hair,
warm neutral cardigan.

Arrange the three figures in a clear left-center-right grouping with the child visibly between the two adults.
The entire illustration contains these three human figures only, all clearly visible as separate coherent bodies.
```

---

## beat-09 — 2 humans

Use the same two-slot demographic layout as beat-02:

```text
adult Vietnamese woman + clearly child-sized Vietnamese boy
```

Keep beat-09's own action/meaning unchanged.

---

# 7. CAST SECTION

Do NOT add another verbose CAST block repeating the same demographics.

After HUMAN LAYOUT, use only:

```text
CAST CONSISTENCY:
Keep the requested clothing colors and general age-group appearance consistent with the slots above.
```

Avoid duplication.

---

# 8. PRIMARY ACTION / MEANING

Reuse EXACTLY the same compact PRIMARY ACTION and MEANING as V3.3B-S.1 / S.2.

This task is not action evaluation.

---

# 9. WORLD / FRAMING / HARD EXCLUSIONS

Reuse the proven Style-First forms from V3.3B-S.1.

Keep:

```text
WORLD
FRAMING
HARD EXCLUSIONS
```

Do not add photographic vocabulary.

Keep text/logo/signature exclusions, but do not evaluate them in this test.

---

# 10. PROMPT LENGTH

Target:

```text
<= 1900 characters
```

Hard max:

```text
2100 characters
```

If too long:
- compact slot wording;
- do not remove MEDIUM LOCK / RENDERING RECIPE / PALETTE;
- do not remove age/body-scale/position information.

Never blind-slice the prompt.

Save exact prompts to:

```text
prompts.json
```

---

# 11. GENERATE EXACTLY 8 IMAGES

Exactly:

```text
4 beats × 2 independent calls
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

# 12. CONTACT SHEET

Create:

```text
scratch/v33/schnell-literal-human-slots/contact-sheet.jpg
```

Layout:

```text
4 rows × 2 columns
```

External labels only.

---

# 13. EVALUATION — HUMAN SLOT CONTRACT ONLY

Create:

```text
evaluation.md
```

For each image record:

```text
expectedHumanCount
actualHumanCount

slot1:
  expected: ...
  observed: ...
  pass: YES/NO

slot2:
  expected: ...
  observed: ...
  pass: YES/NO

slot3: ... if applicable
slot4: ... if applicable

allSlotsPresent: YES/NO
unexpectedExtraHuman: YES/NO
partialUnassignedHumanBody: YES/NO
humanSlotContract: PASS/FAIL
stylePreserved: PASS/FAIL
```

---

# 14. SLOT MATCH RULES

A slot FAILS if its required age group/gender category is visibly wrong.

Examples:

```text
expected child boy
observed adult man
=> FAIL

expected adult woman
observed adult man
=> FAIL
```

A child must be visibly child-sized relative to the adult(s).

Do NOT require exact face identity.

Do NOT require exact age within one year.

---

# 15. PARTIAL HUMAN RULE

Any unexplained:
- legs;
- arm;
- hand;
- head;
- torso

that appears to belong to an additional human counts as:

```text
partialUnassignedHumanBody = YES
humanSlotContract = FAIL
```

---

# 16. STYLE GUARD

All images must remain:

```text
TARGET_EDITORIAL_2D
```

If any image drifts realistic / photoreal:

```text
stylePreserved = FAIL
```

Do not accept people-contract improvement that breaks S.1 style stability.

---

# 17. PASS RULE

PASS only if:

```text
6/8 humanSlotContract = PASS
```

AND:

```text
8/8 stylePreserved = PASS
```

AND these mandatory beat-level gates:

```text
beat-01 exact four-slot family >= 1/2
beat-02 adult-woman + child-boy >= 1/2
beat-04 adult-man + child-boy + adult-woman >= 1/2
beat-09 adult-woman + child-boy >= 1/2
```

If any mandatory beat-level gate is 0/2:

```text
FAIL
```

No retries.

---

# 18. COMPARISON

Create:

```text
comparison.md
```

Compare V3.3B-S.2 vs S.3:

S.2 facts:

```text
people-contract PASS = 1/8

beat-01:
1/2 exact four people

beat-02:
0/2 requested woman + child boy

beat-04:
0/2 requested adult man + child boy + adult woman

beat-09:
0/2 requested woman + child boy

style preserved:
8/8
```

Then report S.3 actual values.

Do not claim statistical certainty.

---

# 19. DECISION RULE AFTER THIS TEST

If PASS:

```text
literal human-slot geometry is viable
```

and STOP for human review.

If FAIL:

Do NOT propose another people-prompt micro-tuning loop.

Report explicitly:

```text
FLUX.1 Schnell is not reliable enough for exact multi-person role composition under this production requirement.
```

The next architectural direction should then be:
- reduce generated scenes to simpler 1-person / 2-person compositions;
- rely on approved canonical group assets for complex family-group scenes;
- or use a stronger image model for exact multi-person scenes.

Do not implement that redesign in this task.

---

# 20. REQUIRED OUTPUTS

```text
scripts/test-hay-dep-schnell-literal-human-slots.mjs

scratch/v33/schnell-literal-human-slots/
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

---

# 21. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Why Literal Slots Differ From S.2

## C. Prompt Lengths

## D. 8-Image Human Slot Table

## E. Style Preservation

## F. Contact Sheet

## G. S.2 vs S.3 Comparison

## H. Architectural Decision

If FAIL, explicitly state Schnell should no longer be tuned for exact multi-person contract via prompt-only changes.

## I. Verdict

Exactly one:

```text
V3.3B-S.3 SCHNELL LITERAL HUMAN SLOTS — PASS
```

or:

```text
V3.3B-S.3 SCHNELL LITERAL HUMAN SLOTS — FAIL
```

Then STOP.

Wait for human review.
