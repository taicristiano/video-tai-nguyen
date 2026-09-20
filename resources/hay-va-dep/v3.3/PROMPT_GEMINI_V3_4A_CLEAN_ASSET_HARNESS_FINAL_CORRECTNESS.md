# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A CLEAN ASSET HARNESS FINAL CORRECTNESS FIX
# OFFLINE ONLY — NO CLOUDFLARE CALLS

## CONTEXT

The current harness is mostly correct, but human code review found two blocking correctness issues before spending quota again.

Keep all current rules:
- image model: `@cf/black-forest-labs/flux-1-schnell` ONLY
- clean 2D cartoon / illustrated style
- no photorealism requirement
- no identity consistency requirement
- each image judged independently
- HTTP 429 = `PAUSED_QUOTA`

Do NOT generate images.
Do NOT call Cloudflare.
Do NOT start V3.4B.

---

# 1. FIX QA ATTEMPT INTEGRITY

Current `recordQa()` finds an attempt by number but does not guarantee that it is the CURRENT latest pending attempt.

This can allow an old failed attempt to be QA-recorded again while a newer attempt is actually awaiting QA.

Required guards before any QA mutation:

```text
shot.status === AWAITING_QA
latestAttempt exists
latestAttempt.attempt === attemptNum
latestAttempt.generationStatus === SUCCESS
latestAttempt.qaStatus === PENDING
candidate file exists
```

Then mutate ONLY `latestAttempt`.

Reject:
- older attempt numbers;
- duplicate QA;
- missing candidate file;
- already completed attempt.

Add tests proving:
- attempt 1 cannot be QA-recorded when attempt 2 is latest pending;
- same attempt cannot be recorded twice.

---

# 2. FIX PILOT FINALIZATION FIDELITY

Current `finalizePilot()` creates a simplified `PilotRoot.tsx` with one `<ImageScene>` per scene and does not preserve the existing `scene.visualBeats` behavior.

The production spec can contain multiple visual beats inside one scene.

Therefore the clean pilot must NOT silently flatten:

```text
scene.visualBeats
```

into one image for the entire scene while claiming it is the same V3.4A pilot.

Choose the smallest correct implementation:

## Preferred

Reuse the existing current `VideoContent` / rendering path and inject a PILOT-ONLY asset override mapping for the six pilot scenes without changing production manifests.

OR, if isolated PilotRoot is kept:

- preserve `scene.visualBeats`;
- preserve their local start/end frames;
- preserve composition / shotScale / motionPreset / transition;
- replace only the image source associated with the intended pilot visual unit.

If the six clean assets intentionally correspond to six scene-level images rather than every visual beat, state this explicitly and disable internal visual-beat swapping for the comparison pilot; in that case the artifact must be named/described as a `scene-level clean-asset comparison pilot`, NOT “the same V3.4A pilot”.

Do not make false equivalence claims.

---

# 3. ADD HAPPY-PATH OFFLINE TESTS

Existing tests prove refusal paths but not successful finalization wiring.

Add offline tests using mocked exec / fake image buffers for:

1. all 6 SELECTED -> `--finalize` allowed;
2. deterministic six asset files exist;
3. generated pilot root / override mapping is valid;
4. visual-beat behavior is either preserved OR explicitly scene-level by contract;
5. successful contact sheet path is invoked without network access;
6. no Cloudflare calls occur.

Do not require a real MP4 render in unit tests.

---

# 4. DO NOT CHANGE CURRENT STATE

After this task:

```text
runStatus = PAUSED_QUOTA
all 6 shots = NEEDS_GENERATION
nextAttempt = 1
attempts = 0
```

No generation.

---

# 5. REPORT

Return:

## A. Files Changed
## B. QA Attempt Integrity Fix
## C. Pilot Finalization Fidelity Fix
## D. Happy-Path Tests
## E. Current State
## F. Verdict

Exactly one:

```text
V3.4A CLEAN ASSET HARNESS FINAL CORRECTNESS — PASS
```

or:

```text
V3.4A CLEAN ASSET HARNESS FINAL CORRECTNESS — FAIL
```

Then STOP.
