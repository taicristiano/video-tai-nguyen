# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.6.2.1
# SINGLE GOAL: RETRY HARNESS STATE + QUOTA CORRECTNESS
# NO PROMPT TUNING
# NO NEW IMAGE GENERATION UNLESS QUOTA IS AVAILABLE

## CONTEXT

V3.3B-S.6.2 was intended to answer:

> Can bounded visual QA + retry (max 3 generated candidates per beat) make the simplified Schnell-safe path operationally reliable?

The current S.6.2 report says:

```text
selected = 3/9
exhausted = 6/9
verdict = FAIL
```

But source review found the experiment did NOT actually execute the retry contract.

Current code behavior for a failed Attempt 1 is approximately:

```js
try {
  await callCloudflareSchnell(prompt);
} catch (err) {
  ...
}
entry.status = 'EXHAUSTED';
```

This is invalid for the S.6.2 experiment because:

1. HTTP 429 quota exhaustion is infrastructure blocking, NOT a visual-QA failure.
2. A beat may be `EXHAUSTED` only after THREE successfully generated image candidates each fail visual QA.
3. Attempt 2 response bytes are discarded if the API succeeds.
4. Attempt 2 is never saved to `beat-XX-attempt-02.jpg`.
5. Attempt 2 is never visually inspected.
6. Attempt 3 is never executed.
7. Current `totalApiCalls` is derived from `qaLedger.attempts.length`, which counts reused S.6 baseline images as if they were current-run API calls and does not correctly represent HTTP requests / successful generations.
8. `promptChangedFromS6` currently compares a string with itself:

```js
const prompt = s6Entry.prompt;
const promptChangedFromS6 = prompt !== s6Entry.prompt;
```

so it is tautologically `false`.

Therefore the current result MUST NOT be interpreted as evidence that bounded retry is insufficient.

This task fixes ONE thing only:

> Make the S.6.2 retry experiment state machine, quota handling, prompt verification, and metrics truthful/resumable.

Do NOT change the image prompts.
Do NOT generate canonical assets.
Do NOT add cleanup/inpainting.
Do NOT render MP4.

---

# 1. HARD SCOPE LOCK

Allowed file:

```text
scripts/test-hay-dep-video001-schnell-qa-retry.mjs
```

Allowed focused tests:

```text
src/schnell-qa-retry-state.test.ts
```

Allowed output directory:

```text
scratch/v33/video001-schnell-qa-retry/
```

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
scripts/test-hay-dep-schnell-capability-router.mjs
scripts/test-hay-dep-schnell-fulfillment-planner.mjs
scripts/test-hay-dep-video001-schnell-safe-pilot.mjs
scripts/test-hay-dep-schnell-clean-surface-geometry.mjs
```

No production integration.

---

# 2. DO NOT CHANGE FROZEN S.6 PROMPTS

The exact 9 S.6 prompts remain the experiment inputs.

Do not:
- add/remove words;
- use S.6.1 clean-surface prompts;
- change cast;
- change people contract;
- change semantics;
- change style geometry.

---

# 3. FIX PROMPT VERIFICATION

Replace the tautological check.

Use SHA-256.

For every beat:

```js
sourcePrompt = S6 prompts.json prompt
sourceSha256 = sha256(sourcePrompt)
```

After writing `prompts-frozen.json`, reload it:

```js
frozenPrompt = persisted frozen prompt
frozenSha256 = sha256(frozenPrompt)
```

Require:

```text
sourceSha256 === frozenSha256
```

Store:

```json
{
  "sourceSha256": "...",
  "frozenSha256": "...",
  "promptChangedFromS6": false
}
```

If hashes differ:
STOP before any API request.

---

# 4. CORRECT STATE MODEL

Each beat must use exactly these beat statuses:

```text
SELECTED
NEEDS_GENERATION
AWAITING_QA
EXHAUSTED
```

Global run status may additionally be:

```text
PAUSED_QUOTA
COMPLETE
```

Do NOT use `EXHAUSTED` for quota/network/API failures.

---

# 5. WHAT COUNTS AS AN ATTEMPT

An `attempt` exists ONLY after:

1. Cloudflare returns a successful image response;
2. image bytes are saved to disk.

Only then append:

```json
{
  "attempt": 2,
  "file": "beat-06-attempt-02.jpg",
  "generationStatus": "SUCCESS",
  "qaStatus": "PENDING"
}
```

An HTTP 429 does NOT create a visual attempt.

Instead append to a separate array:

```json
"generationErrors": [
  {
    "requestedAttempt": 2,
    "httpStatus": 429,
    "kind": "QUOTA",
    "message": "..."
  }
]
```

Do NOT increment generated-attempt count.

---

# 6. QUOTA HANDLING

If Cloudflare returns HTTP 429 with quota exhaustion:

- stop further generation immediately;
- preserve every beat's current state;
- set global:

```text
runStatus = PAUSED_QUOTA
```

- current beat remains:

```text
NEEDS_GENERATION
```

for the same requested attempt number.

Do NOT:
- mark that beat exhausted;
- advance to attempt 3;
- mark later beats exhausted;
- conclude PASS/FAIL.

Required verdict when blocked before experiment completion:

```text
V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — PAUSED_QUOTA
```

---

# 7. EXHAUSTED DEFINITION

A beat may become:

```text
EXHAUSTED
```

ONLY if:

```text
attempt-01 = generated + visually QA FAIL
attempt-02 = generated + visually QA FAIL
attempt-03 = generated + visually QA FAIL
```

Three real image candidates.
Three real visual-QA failures.

Nothing else qualifies.

---

# 8. SUCCESSFUL RETRY MUST BE SAVED

When an API call succeeds:

```js
const buffer = await callCloudflareSchnell(prompt);
fs.writeFileSync(outputPath, buffer);
```

Do not discard the buffer.

Expected path:

```text
beat-06-attempt-02.jpg
```

Then set:

```text
AWAITING_QA
```

Do not automatically generate attempt 3 before visual QA of attempt 2.

---

# 9. QA IS A SEPARATE STATE TRANSITION

Provide a deterministic helper such as:

```js
recordVisualQa({
  beatId,
  attempt,
  style,
  peopleContract,
  semanticFidelity,
  anatomy,
  textPollution,
  reasons,
})
```

It computes:

```text
overall PASS iff all 5 dimensions PASS
```

If PASS:

```text
status = SELECTED
selectedAttempt = attempt
selectedFile = file
```

If FAIL and attempt < 3:

```text
status = NEEDS_GENERATION
nextAttempt = attempt + 1
```

If FAIL and attempt === 3:

```text
status = EXHAUSTED
```

The helper must reject QA recording if the corresponding generated image file does not exist.

---

# 10. RESUME SUPPORT

The script must be resumable after quota resets.

Add commands with equivalent behavior:

```text
--init
--status
--generate-next
--record-qa <beatId> <attempt> <qa-json-file>
--finalize
```

`--generate-next`:
- finds the first beat with `NEEDS_GENERATION`;
- generates exactly ONE candidate;
- saves it;
- switches it to `AWAITING_QA`;
- then STOP.

This is intentional.

Gemini/human visually inspects that one image before the next generation.

Do not generate multiple unreviewed candidates in one command.

---

# 11. MIGRATE CURRENT S.6.2 STATE CORRECTLY

Do not throw away valid S.6 Attempt 1 evidence.

Initialize/migrate:

### Already PASS from S.6

```text
beat-02 = SELECTED attempt 1
beat-04 = SELECTED attempt 1
beat-08 = SELECTED attempt 1
```

### Failed S.6 Attempt 1

```text
beat-06
beat-07
beat-09
beat-10
beat-12
beat-15
```

must become:

```text
NEEDS_GENERATION
nextAttempt = 2
```

because only their first real image candidate has failed.

Existing prior HTTP 429 events may be retained in:

```text
generationErrors
```

but do NOT count as attempts.

No beat should be `EXHAUSTED` at migration time.

---

# 12. METRICS MUST DISTINGUISH FOUR THINGS

Create truthful metrics:

```text
baselineImagesReused
successfulGenerationCallsThisRun
failedApiRequestsThisRun
successfulGeneratedCandidatesTotal
visuallyRejectedCandidates
selectedBeats
exhaustedBeats
pendingBeats
```

Also:

```text
apiRequestsThisRun
```

must equal actual HTTP requests in the current execution.

Do NOT call reused S.6 attempt-01 images current-run API calls.

---

# 13. FINALIZATION RULE

`--finalize` must refuse to issue PASS/FAIL if any beat is:

```text
NEEDS_GENERATION
AWAITING_QA
```

or if:

```text
runStatus = PAUSED_QUOTA
```

In that case output:

```text
EXPERIMENT INCOMPLETE
```

and the applicable status.

PASS only when all 9 beats are `SELECTED`.

FAIL only when at least one beat is genuinely `EXHAUSTED` after 3 real QA-failed generated candidates and no beats remain awaiting/pending.

---

# 14. CONTACT SHEET SEMANTICS

Do NOT label a pending beat:

```text
EXHAUSTED 3/3
```

unless 3 generated images actually failed QA.

Use cards:

```text
SELECTED attempt N
NEEDS GENERATION attempt N
AWAITING QA attempt N
EXHAUSTED 3/3 QA FAIL
```

---

# 15. REQUIRED UNIT TESTS

Add deterministic tests with mocked API/state only.
No Cloudflare calls.

## Test 1 — 429 does not create attempt

Start:

```text
beat-06 NEEDS_GENERATION nextAttempt=2
```

Simulate 429.

Expect:

```text
attempt count unchanged
status = NEEDS_GENERATION
global = PAUSED_QUOTA
generationErrors += 1
```

---

## Test 2 — successful generation creates pending attempt

Simulate successful image bytes for attempt 2.

Expect:

```text
file saved
attempt 2 appended
qaStatus = PENDING
status = AWAITING_QA
```

---

## Test 3 — PASS QA selects first successful retry

Record all five QA dimensions PASS for attempt 2.

Expect:

```text
SELECTED
selectedAttempt = 2
nextAttempt = null
```

---

## Test 4 — failed attempt 2 requests attempt 3

Record one QA dimension FAIL.

Expect:

```text
NEEDS_GENERATION
nextAttempt = 3
```

---

## Test 5 — failed attempt 3 becomes exhausted

Only after real attempts 1, 2, 3 all visually fail:

```text
EXHAUSTED
```

---

## Test 6 — cannot exhaust from API errors

Three simulated HTTP failures without generated image candidates:

```text
must NOT become EXHAUSTED
```

---

## Test 7 — prompt SHA equality

Frozen prompt SHA must equal S.6 source SHA.

Mutated frozen prompt fixture must fail.

---

## Test 8 — finalize refuses incomplete experiment

Any `NEEDS_GENERATION` / `AWAITING_QA`:

```text
no PASS/FAIL verdict
```

---

## Test 9 — migration from current state

After migration:

```text
SELECTED = 3
NEEDS_GENERATION = 6
EXHAUSTED = 0
```

---

# 16. DO NOT SPEND QUOTA DURING CODE FIX

First:
- implement;
- run unit tests;
- migrate ledger;
- print `--status`.

If quota is currently known exhausted:
STOP.

Do NOT call Cloudflare just to prove it is still exhausted.

If quota is available and you choose to continue:
generate exactly ONE next candidate, then STOP for visual QA.

---

# 17. REQUIRED REPORT NOW

Return:

## A. Root Cause

Explicitly state that the previous S.6.2 FAIL verdict was invalid because quota/API blocking was incorrectly mapped to visual exhaustion.

## B. Files Changed

## C. Correct State Machine

## D. Quota Semantics

## E. Metric Semantics

## F. Unit Tests

## G. Migrated Current Status

Expected:

```text
SELECTED: 3
NEEDS_GENERATION: 6
AWAITING_QA: 0
EXHAUSTED: 0
next attempt for six failed beats: 2
```

## H. Current Experiment Verdict

If quota prevents continuation:

```text
V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — PAUSED_QUOTA
```

Do NOT report FAIL.

If code-only work is complete and no generation was attempted, also report the experiment as incomplete, not PASS/FAIL.

Then STOP.

---

# 18. ACCEPTANCE CRITERIA

PASS for THIS HARNESS-CORRECTION TASK only if:

1. 429 never counts as visual attempt;
2. 429 never marks beat exhausted;
3. successful image bytes are persisted;
4. visual QA is a separate state transition;
5. attempt 3 is reachable only after attempt 2 visual FAIL;
6. EXHAUSTED means 3 real generated+QA-failed candidates;
7. state is resumable;
8. metrics distinguish baseline reuse, requests, successes, API errors;
9. prompt verification uses real SHA comparison;
10. migrated status is 3 selected / 6 need attempt 2 / 0 exhausted;
11. no production code changed;
12. no unnecessary Cloudflare calls.

Final harness task verdict:

```text
V3.3B-S.6.2.1 RETRY HARNESS CORRECTNESS — PASS
```

or:

```text
V3.3B-S.6.2.1 RETRY HARNESS CORRECTNESS — FAIL
```

This harness verdict is separate from the still-incomplete S.6.2 image experiment.

Then STOP.
