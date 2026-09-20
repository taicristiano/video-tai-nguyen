# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.6.2
# SINGLE GOAL: BOUNDED VISUAL QA + RETRY GATE
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

S.6 established the raw single-attempt behavior of the simplified Schnell-safe Video 001 path:

```text
9 target beats
3/9 overall PASS
9/9 style PASS
9/9 semantic PASS
6/9 people-contract PASS
8/9 anatomy PASS
4/9 text-cleanliness PASS
```

S.6.1 then tested prompt-only clean-surface suppression on four polluted beats:

```text
8 images
8/8 style preserved
4/8 text-clean
```

Result:

```text
Prompt-only text suppression is NOT reliable enough.
```

Therefore STOP prompt-only micro-tuning.

This task tests ONE architectural question only:

> Can the existing Schnell-safe generation path become operationally reliable through a bounded post-generation visual QA + retry gate, without any more prompt tuning?

No post-processing.
No crop.
No inpainting.
No prompt rewrite.
No canonical-group generation.
No MP4 render.

---

# 1. HARD SCOPE LOCK

Allowed new script:

```text
scripts/test-hay-dep-video001-schnell-qa-retry.mjs
```

Allowed output directory:

```text
scratch/v33/video001-schnell-qa-retry/
```

You may READ:
- S.6 script and exact S.6 model-facing prompts;
- S.6 QA report;
- current Video 001 Story Plan;
- S.4 capability router;
- S.5.1 fulfillment planner;
- cast/world metadata.

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

Do NOT modify production manifests/assets.
Do NOT render MP4.

---

# 2. FREEZE THE PROMPTS

Critical:

Use the EXACT model-facing prompt geometry from S.6 for each of the 9 beats.

Target beats:

```text
beat-02
beat-04
beat-06
beat-07
beat-08
beat-09
beat-10
beat-12
beat-15
```

Do NOT:
- add clean-surface wording;
- remove negative wording;
- add new anatomy wording;
- change cast wording;
- change world wording;
- change framing;
- change semantic action;
- change visible-people contract.

This is a RETRY experiment, not another prompt experiment.

Before generation, save the exact frozen prompt per beat to:

```text
prompts-frozen.json
```

Also compare against the S.6 prompt source and report:

```text
promptChangedFromS6: false
```

for every beat.

If any prompt differs from S.6:

```text
V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — FAIL
```

and STOP before API calls.

---

# 3. MODEL / AUTH

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

No seed/steps retries.

Use authorized Cloudflare credentials from environment / `.env`.

Never print credential values.

---

# 4. RETRY POLICY

For each target beat:

### Attempt 1

Generate:

```text
beat-XX-attempt-01.jpg
```

Visually inspect against ALL five hard QA dimensions.

If overall PASS:
- select it immediately;
- do NOT generate attempt 2 or 3.

If FAIL:
generate attempt 2.

### Attempt 2

Generate:

```text
beat-XX-attempt-02.jpg
```

If overall PASS:
- select it immediately;
- STOP retrying that beat.

If FAIL:
generate final attempt 3.

### Attempt 3

Generate:

```text
beat-XX-attempt-03.jpg
```

If PASS:
select.

If FAIL:
mark:

```text
EXHAUSTED
```

and do not generate any more.

Maximum:

```text
3 API calls per beat
27 API calls total
```

No attempt 4.
No candidate replacement outside this sequence.
No cherry-picking after a PASS.

The selected candidate is always:

```text
the FIRST overall-PASS attempt
```

---

# 5. VISUAL QA — FIVE HARD DIMENSIONS

For each attempt evaluate:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Overall PASS only if all five PASS.

---

# 6. STYLE GATE

PASS only if clearly:

```text
TARGET_EDITORIAL_2D
```

Fail for:

```text
realistic digital painting
near-photoreal
anime
chibi
3D render
generic flat corporate vector
```

---

# 7. PEOPLE CONTRACT GATE

Use the FINAL S.5.1 / S.6 fulfillment contract.

## Single-person beat

Require:
- exactly one visible person;
- correct broad member type / age group;
- no second/background person;
- no partial extra human body.

## Object / no-people beat

Require:
- zero visible people;
- zero human body parts;
- zero reflection/silhouette implying another human.

Do NOT require exact face identity.

---

# 8. SEMANTIC FIDELITY GATE

Judge against the final simplified S.5.1 action, NOT the old unsafe multi-person action.

Examples:

```text
beat-04
boy speaking with small gesture
```

does NOT require family.

```text
beat-07
school/work bags near doorway/chair
```

does NOT require a visible conversation.

```text
beat-02
simple meal still-life
```

does NOT require people.

PASS only if the primary simplified idea is visually clear.

---

# 9. ANATOMY GATE

For visible people, FAIL on:

```text
floating head
headless torso
detached hand/arm
severed body
missing torso
severe duplicate limb
impossible body connection
```

Do not fail harmless tiny finger imperfections.

For no-people beats:
any human body fragment already fails PEOPLE_CONTRACT.

---

# 10. TEXT-POLLUTION GATE

FAIL on ANY visible unintended:

```text
pseudo-writing
artist-like cursive mark
word-like glyph
wall pseudo-caption
logo-like mark
watermark-like mark
```

Visual inspection is the source of truth.

Do NOT rely on OCR as the primary decision mechanism.

---

# 11. QA RECORD

Create:

```text
qa.json
```

For every beat:

```json
{
  "beatId": "beat-06",
  "attempts": [
    {
      "attempt": 1,
      "file": "beat-06-attempt-01.jpg",
      "style": "PASS",
      "peopleContract": "PASS",
      "semanticFidelity": "PASS",
      "anatomy": "PASS",
      "textPollution": "FAIL",
      "overall": "FAIL",
      "reasons": ["bottom-right pseudo-writing"]
    },
    {
      "attempt": 2,
      "file": "beat-06-attempt-02.jpg",
      "style": "PASS",
      "peopleContract": "PASS",
      "semanticFidelity": "PASS",
      "anatomy": "PASS",
      "textPollution": "PASS",
      "overall": "PASS",
      "reasons": []
    }
  ],
  "selectedAttempt": 2,
  "selectedFile": "beat-06-attempt-02.jpg",
  "status": "SELECTED"
}
```

If exhausted:

```json
{
  "selectedAttempt": null,
  "selectedFile": null,
  "status": "EXHAUSTED"
}
```

Never fabricate QA.

---

# 12. SELECTED DIRECTORY

Copy/link first PASS candidate for each beat to:

```text
selected/beat-02.jpg
selected/beat-04.jpg
selected/beat-06.jpg
selected/beat-07.jpg
selected/beat-08.jpg
selected/beat-09.jpg
selected/beat-10.jpg
selected/beat-12.jpg
selected/beat-15.jpg
```

If a beat is exhausted:
do not create its selected file.

---

# 13. CONTACT SHEET — SELECTED

If all 9 beats obtain a PASS candidate, create:

```text
contact-sheet-selected.jpg
```

3 × 3 layout:

```text
02 04 06
07 08 09
10 12 15
```

External labels show:
- beat id;
- selected attempt number.

Do not modify candidate pixels.

If any beat is exhausted:
still create a selected-status contact sheet with a clear missing/exhausted card in that slot.

---

# 14. CONTACT SHEET — REJECTED

If any rejected attempts exist, create:

```text
contact-sheet-rejected.jpg
```

Include ALL rejected attempts.

External label:

```text
beat-12 attempt-01
FAIL: anatomy
```

Do not alter source image pixels.

---

# 15. METRICS

Create:

```text
run-report.json
```

Include:

```json
{
  "videoIndex": 1,
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "targetBeatCount": 9,
  "selectedBeatCount": 0,
  "exhaustedBeatCount": 0,
  "totalApiCalls": 0,
  "firstAttemptPassCount": 0,
  "secondAttemptPassCount": 0,
  "thirdAttemptPassCount": 0,
  "totalRejectedAttempts": 0,
  "styleRejectCount": 0,
  "peopleRejectCount": 0,
  "semanticRejectCount": 0,
  "anatomyRejectCount": 0,
  "textRejectCount": 0,
  "averageAttemptsPerSelectedBeat": 0
}
```

Use actual values.

---

# 16. ECONOMIC / OPERATIONAL METRICS

Also report:

```text
API calls per selected beat
retry rate
exhaustion rate
```

Do NOT estimate neuron cost unless directly measured.

Do NOT claim statistical certainty beyond this pilot.

---

# 17. PASS RULE

This task asks:

> Is bounded QA + retry sufficient by itself?

Therefore PASS requires ALL:

```text
9/9 beats obtain an overall-PASS selected asset
0 exhausted beats
0 selected severe anatomy failures
0 selected people-contract failures
0 selected semantic failures
0 selected text pollution
9/9 selected style PASS
```

AND:

```text
totalApiCalls <= 27
```

No 8/9 exception.

If even one beat exhausts all 3 attempts:

```text
FAIL
```

---

# 18. DECISION RULE

## If PASS

State:

```text
Bounded visual QA + retry is operationally viable for the simplified Schnell-safe path.
```

This does NOT mean:
- canonical group is solved;
- identity continuity is solved;
- production integration is done.

The next separate task would be canonical-group asset strategy.

## If FAIL

State:

```text
Bounded retry alone is insufficient for the simplified Schnell-safe path.
```

Then recommend only one of these next architectural directions:

```text
post-generation cleanup/inpainting
OR
stronger image model routing
```

Do NOT start another prompt-tuning loop.

---

# 19. IMPORTANT NON-GOALS

Do NOT:
- alter the frozen S.6 prompts;
- implement OCR;
- implement inpainting;
- crop signatures;
- modify images after generation;
- generate canonical family group;
- render MP4;
- integrate production code.

---

# 20. REQUIRED OUTPUTS

```text
scripts/test-hay-dep-video001-schnell-qa-retry.mjs

scratch/v33/video001-schnell-qa-retry/
  prompts-frozen.json
  qa.json
  run-report.json
  evaluation.md
  contact-sheet-selected.jpg
  contact-sheet-rejected.jpg   (if rejected attempts exist)
  selected/
    beat-02.jpg
    beat-04.jpg
    beat-06.jpg
    beat-07.jpg
    beat-08.jpg
    beat-09.jpg
    beat-10.jpg
    beat-12.jpg
    beat-15.jpg
  beat-XX-attempt-YY.jpg ...
```

---

# 21. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Frozen Prompt Verification

## C. Retry Policy

## D. Beat-by-Beat Attempt Table

## E. Selected Set QA

## F. Rejection Breakdown

## G. Operational Metrics

Show:

```text
selected / 9
exhausted / 9
total API calls
average attempts / selected beat
first-attempt pass
second-attempt pass
third-attempt pass
```

## H. Contact Sheet Paths

## I. Architectural Decision

Exactly one:

```text
Bounded visual QA + retry is operationally viable for the simplified Schnell-safe path.
```

or:

```text
Bounded retry alone is insufficient for the simplified Schnell-safe path.
```

## J. Verdict

Exactly one:

```text
V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — PASS
```

or:

```text
V3.3B-S.6.2 BOUNDED VISUAL QA RETRY — FAIL
```

Then STOP.

Do not render MP4.
Wait for human review.
