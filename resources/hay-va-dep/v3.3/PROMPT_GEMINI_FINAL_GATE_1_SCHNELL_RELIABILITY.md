# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — FINAL GATE 1
# SCHNELL RELIABILITY EXECUTION
# USE EXISTING HARDENED RETRY HARNESS
# NO CODE CHANGES

## GOAL

Complete the already-defined bounded visual QA + retry experiment for the 9 Schnell-safe Video 001 beats.

This is a GO / NO-GO gate.

Do NOT create another micro-fix.
Do NOT tune prompts.
Do NOT modify the retry harness.
Do NOT modify production code.
Do NOT render MP4.

Existing state after PRE-FLIGHT:

```text
SELECTED:
beat-02
beat-04
beat-08

NEEDS_GENERATION attempt 2:
beat-06
beat-07
beat-09
beat-10
beat-12
beat-15

AWAITING_QA:
none

EXHAUSTED:
none
```

Harness:

```text
scripts/test-hay-dep-video001-schnell-qa-retry.mjs
```

---

# 1. PRE-CHECK

Run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --status
```

Confirm exactly:

```text
SELECTED = 3
NEEDS_GENERATION = 6
AWAITING_QA = 0
EXHAUSTED = 0
```

If state differs materially:

```text
FINAL GATE 1 — HARNESS_STATE_BLOCKED
```

and STOP.

Do not repair code/state automatically.

---

# 2. DO NOT CHANGE PROMPTS

Use the frozen S.6 prompts exactly as enforced by the harness.

No prompt editing.

No clean-surface variant.

No added negative prompt.

No anatomy rewrite.

No semantic rewrite.

No cast rewrite.

If SHA preflight fails:

```text
FINAL GATE 1 — PROMPT_INTEGRITY_BLOCKED
```

and STOP.

---

# 3. GENERATION LOOP

For the first beat currently in `NEEDS_GENERATION`, run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --generate-next
```

The command must generate EXACTLY ONE image and stop in:

```text
AWAITING_QA
```

Never call `--generate-next` again before recording QA for that image.

---

# 4. VISUAL QA

Open and visually inspect the newly generated candidate.

Evaluate all five hard dimensions:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Each must be exactly:

```text
PASS
FAIL
```

Overall PASS only if all five PASS.

## STYLE

PASS only if clearly:

```text
TARGET_EDITORIAL_2D
```

Fail on:
- realistic / near-photoreal;
- anime;
- chibi;
- 3D;
- generic corporate flat vector.

## PEOPLE_CONTRACT

For a single-person beat:
- exactly one visible person;
- correct broad requested member/age group;
- no second/background/partial extra person.

For object / no-people beat:
- zero visible people;
- zero visible human body parts.

## SEMANTIC_FIDELITY

Judge against the FINAL simplified S.5.1 action.

Do not require the old unsafe family composition.

## ANATOMY

Fail on:
- floating head;
- headless torso;
- detached arm/hand;
- severed body;
- missing torso;
- severe duplicate limb;
- impossible connection.

Do not fail tiny harmless finger imperfections.

## TEXT_POLLUTION

Fail on any unintended:
- pseudo-writing;
- artist-like cursive mark;
- word-like glyph;
- pseudo-caption;
- logo-like mark;
- watermark-like mark.

Visual inspection is source of truth.
Do not use OCR as primary evidence.

---

# 5. RECORD QA

Create one temporary QA JSON for the candidate:

```json
{
  "style": "PASS",
  "peopleContract": "PASS",
  "semanticFidelity": "PASS",
  "anatomy": "PASS",
  "textPollution": "PASS",
  "reasons": []
}
```

For any FAIL dimension, record concrete reason(s).

Then run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs \
  --record-qa <beatId> <attempt> <qa-json-file>
```

Then run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --status
```

---

# 6. CONTINUE ONLY ACCORDING TO STATE MACHINE

If the beat becomes:

```text
SELECTED
```

move to the next `NEEDS_GENERATION` beat.

If it becomes:

```text
NEEDS_GENERATION attempt 3
```

generate Attempt 3 using the same workflow.

If it becomes:

```text
EXHAUSTED
```

FINAL GATE 1 has failed.

STOP immediately to save quota.

Do not continue other beats.

If Cloudflare returns quota 429:

```text
PAUSED_QUOTA
```

STOP immediately.

Do not mark any visual attempt failed.

Do not conclude PASS/FAIL.

---

# 7. HARD MAXIMUM

The harness already enforces:

```text
maximum 3 real visual attempts per beat
```

Do not bypass it.

No Attempt 4.

No manual replacement candidate.

No cherry-picking outside the ledger.

---

# 8. FINALIZATION

When either:

```text
all 9 beats = SELECTED
```

or:

```text
one beat = EXHAUSTED
```

run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --finalize
```

Then run:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --status
```

---

# 9. FINAL GATE DECISION

## PASS

Only if:

```text
SELECTED = 9 / 9
EXHAUSTED = 0
AWAITING_QA = 0
NEEDS_GENERATION = 0
```

and every selected candidate has all five QA dimensions PASS.

Verdict:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — PASS
```

Architectural meaning:

```text
The simplified 0/1-person/object Schnell path is operationally viable with bounded visual QA + retry.
```

This does NOT solve canonical family-group assets.

---

## FAIL

If ANY beat becomes truly:

```text
EXHAUSTED
```

after three real generated + visual-QA-failed candidates:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — FAIL
```

Architectural meaning:

```text
Schnell + bounded retry is insufficient for the simplified safe path.
```

STOP.

Do NOT open another prompt-tuning loop.

---

## PAUSED

If quota blocks before completion:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — PAUSED_QUOTA
```

Report exact remaining states and STOP.

Resume later from ledger.

---

# 10. REQUIRED FINAL REPORT

Return:

## A. Initial State

## B. Attempt Log

Table:

```text
beat
attempt
style
people
semantic
anatomy
text
overall
reason
```

Include only real generated candidates reviewed during this continuation plus baseline selected/rejected state as context.

## C. Final State

```text
SELECTED
NEEDS_GENERATION
AWAITING_QA
EXHAUSTED
```

## D. Operational Metrics

```text
live API requests since migration
successful live generations
failed API requests
second-attempt passes
third-attempt passes
visually rejected candidates
```

## E. Contact Sheets

Provide paths to:

```text
contact-sheet-selected.jpg
contact-sheet-rejected.jpg
```

if present.

## F. Decision

Exactly one:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — PASS
```

or:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — FAIL
```

or:

```text
FINAL GATE 1 — SCHNELL RELIABILITY — PAUSED_QUOTA
```

Then STOP.

Do NOT start FINAL GATE 2 automatically.
Wait for human review.
