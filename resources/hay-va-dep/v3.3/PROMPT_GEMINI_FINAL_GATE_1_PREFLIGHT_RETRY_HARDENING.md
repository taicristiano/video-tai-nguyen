# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — FINAL GATE 1 PRE-FLIGHT
# RETRY HARNESS HARDENING ONLY
# NO IMAGE GENERATION

## CONTEXT

V3.3B-S.6.2.1 fixed the major quota/exhaustion bug correctly:

- HTTP 429 no longer counts as a visual attempt.
- 429 no longer marks a beat EXHAUSTED.
- successful generation is saved before QA.
- visual QA is a separate state transition.
- migrated state is 3 SELECTED / 6 NEEDS_GENERATION / 0 EXHAUSTED.

Before spending any more Cloudflare quota, perform ONE final harness hardening pass.

This is NOT another visual experiment.
This is NOT prompt tuning.
This is NOT a new S.6.x research branch.

After this pre-flight passes, we proceed directly to:

```text
FINAL GATE 1 — SCHNELL RELIABILITY
```

and resume the six pending beats.

---

# 1. HARD SCOPE LOCK

Allowed files:

```text
scripts/test-hay-dep-video001-schnell-qa-retry.mjs
src/schnell-qa-retry-state.test.ts
```

Allowed output/state files:

```text
scratch/v33/video001-schnell-qa-retry/
```

Do NOT modify production files.

Do NOT call Cloudflare during this task.

Do NOT change frozen S.6 prompts.

---

# 2. ISSUE A — VERIFY PROMPT HASH ON EVERY GENERATION

Current `initFrozenPrompts()` verifies SHA-256 once, but later `loadFrozenPrompts()` only reads JSON.

Before EVERY `--generate-next` API request:

1. load current S.6 source prompts;
2. load persisted `prompts-frozen.json`;
3. call `verifyFrozenPrompts()`;
4. require `allMatch === true`.

If any beat differs:

```text
STOP before API request
```

with:

```text
FROZEN_PROMPT_MISMATCH
```

Do not trust an old initialization check.

Add a unit test proving that mutating `prompts-frozen.json` AFTER initialization causes generation preflight to fail.

---

# 3. ISSUE B — STATE TRANSITION GUARDS

## `handleGenerationSuccess()`

Require:

```text
beat.status === NEEDS_GENERATION
attemptNum === beat.nextAttempt
no existing attempt with the same attempt number
```

Otherwise throw.

A successful candidate must not be appendable twice.

## `recordVisualQa()`

Require:

```text
beat.status === AWAITING_QA
the requested attempt is the latest PENDING generated attempt
attemptEntry.generationStatus === SUCCESS
attemptEntry.qaStatus === PENDING
```

Reject:
- QA on a previous completed attempt;
- duplicate QA;
- QA on a missing candidate;
- QA while beat is already SELECTED / NEEDS_GENERATION / EXHAUSTED.

---

# 4. ISSUE C — EXHAUSTED MUST CHECK ALL THREE REAL FAILURES

Do NOT use only:

```js
if (attempt === 3) status = 'EXHAUSTED'
```

Before setting EXHAUSTED, explicitly validate:

```text
attempt 1 exists
attempt 2 exists
attempt 3 exists

all three:
generationStatus === SUCCESS
qaStatus === COMPLETED
overall === FAIL
```

Only then:

```text
EXHAUSTED
```

Otherwise throw state-integrity error.

Add a test where attempt 3 exists but attempt 2 is missing / not QA-completed:

```text
must NOT become EXHAUSTED
```

---

# 5. ISSUE D — IMPLEMENT THE ACTUAL `--record-qa` CLI

The report promises:

```text
--record-qa <beatId> <attempt> <qa-json-file>
```

but the CLI must actually implement it.

Expected QA JSON:

```json
{
  "style": "PASS",
  "peopleContract": "PASS",
  "semanticFidelity": "PASS",
  "anatomy": "PASS",
  "textPollution": "FAIL",
  "reasons": ["bottom-right pseudo-writing"]
}
```

Command:

```bash
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs \
  --record-qa beat-06 2 scratch/qa-beat06-attempt02.json
```

Behavior:

1. validate beat/attempt/file/state;
2. call `recordVisualQa()`;
3. save ledger;
4. print new beat status;
5. STOP.

Do not generate another candidate automatically.

Add tests for:
- valid CLI-equivalent QA transition;
- invalid/missing JSON fields;
- duplicate QA rejection.

---

# 6. ISSUE E — PERSIST OPERATIONAL API METRICS

Current `getMetrics(ledger, sessionStats = {})` cannot truthfully report API requests across separate resumable CLI invocations because `sessionStats` is not persisted.

Store persistent counters in ledger, e.g.:

```json
{
  "operationalMetrics": {
    "baselineImagesReused": 9,
    "apiRequestsSinceMigration": 0,
    "successfulGenerationCallsSinceMigration": 0,
    "failedApiRequestsSinceMigration": 0
  }
}
```

Rules:

Before each real HTTP request:

```text
apiRequestsSinceMigration += 1
```

On successful image response:

```text
successfulGenerationCallsSinceMigration += 1
```

On API/network/quota error:

```text
failedApiRequestsSinceMigration += 1
```

Invariant:

```text
apiRequestsSinceMigration
=
successfulGenerationCallsSinceMigration
+
failedApiRequestsSinceMigration
```

`getMetrics()` must read persisted counters, not default ephemeral `sessionStats`.

Do NOT count reused S.6 Attempt-1 files as live API requests.

Add persistence/reload test.

---

# 7. ISSUE F — NON-QUOTA API ERRORS MUST NOT LEAVE FALSE PAUSED STATE

Migration currently starts from:

```text
PAUSED_QUOTA
```

When user intentionally runs `--generate-next` after quota is expected to be available:

Before making the request set:

```text
runStatus = IN_PROGRESS
```

Then:

- if response succeeds → remain IN_PROGRESS;
- if actual quota 429 → PAUSED_QUOTA;
- if non-quota API/network error → remain IN_PROGRESS with beat still NEEDS_GENERATION.

Do not leave stale `PAUSED_QUOTA` after a non-quota failure.

---

# 8. ISSUE G — DO NOT FABRICATE HISTORICAL GENERATION ERRORS

Migration must not manufacture one fake 429 event per failed beat.

If an old ledger containing actual historical API errors exists:
- import the exact recorded event.

If no grounded historical per-beat error source exists:
- leave `generationErrors: []`;
- optionally add a ledger-level migration note:

```text
Previous run was reported quota-blocked; no exact historical per-beat API event imported.
```

Every `generationErrors[]` entry must correspond to a real/imported error event.

Update migration test accordingly.

---

# 9. REQUIRED UNIT TESTS

Keep existing tests and add focused coverage for:

1. frozen prompt mutated after initialization blocks generation preflight;
2. duplicate generation attempt number throws;
3. wrong `nextAttempt` throws;
4. QA can only target latest PENDING attempt;
5. duplicate QA throws;
6. attempt 3 cannot exhaust unless attempts 1/2/3 all real + QA FAIL;
7. `--record-qa` input validation;
8. persisted API metrics survive save/reload;
9. API request metric invariant;
10. non-quota API error does not leave stale PAUSED_QUOTA;
11. migration does not fabricate generationErrors.

No external API calls.

---

# 10. MIGRATED TARGET STATE

After correction/migration, the experiment state must still be:

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

Do not alter visual QA results from S.6.

---

# 11. REQUIRED CLI WORKFLOW AFTER THIS TASK

The harness must support this exact human-in-the-loop loop:

```bash
# Generate ONE candidate
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --generate-next

# Human/agent visually reviews the generated image.
# Write a QA JSON file.

# Record QA only
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs \
  --record-qa <beatId> <attempt> <qa-json-file>

# Inspect state
node scripts/test-hay-dep-video001-schnell-qa-retry.mjs --status
```

No command should silently generate the next image after QA.

---

# 12. ACCEPTANCE CRITERIA

PASS only if:

1. every live generation re-verifies frozen prompt SHA;
2. generation state transitions are guarded;
3. QA transitions are guarded;
4. EXHAUSTED requires three real generated + QA-failed candidates;
5. `--record-qa` CLI actually exists and works;
6. API metrics persist across CLI invocations;
7. live API metric invariant holds;
8. non-quota errors do not leave false PAUSED_QUOTA;
9. migration does not fabricate API events;
10. target state remains 3 selected / 6 need attempt 2 / 0 exhausted;
11. tests pass;
12. zero Cloudflare calls during this task.

---

# 13. FINAL REPORT

Return:

## A. Residual Issues Found

## B. Files Changed

## C. State Guard Changes

## D. Prompt Integrity Preflight

## E. `--record-qa` CLI

## F. Persistent Metrics

## G. Migration Provenance

## H. Unit Tests

## I. Current Experiment State

## J. Verdict

Exactly:

```text
FINAL GATE 1 PRE-FLIGHT — PASS
```

or:

```text
FINAL GATE 1 PRE-FLIGHT — FAIL
```

Then STOP.

Do not generate images.

After PASS, the next action is ONLY:

```text
FINAL GATE 1 — SCHNELL RELIABILITY
Resume the six pending beats from Attempt 2.
```
