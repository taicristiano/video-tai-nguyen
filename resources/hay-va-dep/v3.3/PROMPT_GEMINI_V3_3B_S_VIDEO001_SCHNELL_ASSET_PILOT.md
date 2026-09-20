# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S PILOT
# SINGLE GOAL: VIDEO 001 REAL-ASSET PILOT WITH BOUNDED QA/RETRY
# MODEL: @cf/black-forest-labs/flux-1-schnell

## CONTEXT

Two isolated Schnell tests produced the same practical raw yield:

```text
7/8 usable
1/8 severe anatomy failure
```

The second anatomy-heavy prompt did NOT improve the observed failure rate.

Therefore:
- STOP prompt-only anatomy tuning;
- do NOT claim Schnell has a proven "12.5% failure rate" from only 16 samples;
- do NOT claim a mathematical root cause;
- instead test the model on the REAL Video 001 asset workload.

This task has ONE GOAL ONLY:

> Generate a production-like set of still-image assets for Video 001 using FLUX.1 Schnell, apply a bounded visual QA/retry gate, and produce a contact sheet for human review.

No MP4 render.
No production integration.
No batch of 100 videos.

---

# 1. HARD SCOPE LOCK

Allowed new/modified script:

```text
scripts/test-hay-dep-video001-schnell-pilot.mjs
```

Allowed output directory:

```text
scratch/v33/video001-schnell-pilot/
```

You may READ existing:
- Video 001 catalog/prompt data;
- canonical aligned timeline;
- Story Planner;
- cast registry;
- world presets;
- `buildPrompt()` / production image prompt logic.

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
```

Do NOT modify:
- subtitle code;
- SFX;
- Remotion;
- production manifest;
- production assets;
- cast registry;
- world presets.

Do NOT render MP4.

---

# 2. MODEL

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Known current Cloudflare behavior:

```text
prompt-only payload
seed unsupported
steps unsupported
```

Do not retry unsupported `seed` or `steps`.

---

# 3. SECRET SAFETY

Use:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

from environment / `.env`.

Never print values.
Never write values into source/artifacts.
Do not modify `.env`.

Report only presence YES/NO.

---

# 4. SOURCE OF TRUTH

Use the CURRENT Video 001 pipeline state after Parallel Fixes 01–07.

Required inputs:

```text
Video index: 001
Current canonical voice/timeline
Current Story Planner
Current cast/world selection
Current semantic beat splitting
Current family action precedence
Current question canonical-reuse rule
```

First build the current Story Plan.

Expected high-level invariants:

```text
contentMode = family-emotional
castId = family-young-01
worldId = current deterministic home-family-* selection
beatCount = 16
```

If current repo produces different values:
report actual values and STOP if validation fails.

Do not hardcode an obsolete plan.

---

# 5. PILOT PROMPT POLICY

For each generated beat, use current production semantics:

```text
voiceClause
visualIntent
visualAction
presentMembers
castId
worldLock
shotScale
composition
storyRole
```

Use the existing production `buildPrompt()` structure as the baseline.

However, for this PILOT ONLY, remove literal brand-name tokens from the model-facing style header if present:

```text
HAY & ĐẸP.
HAY & DEP
HAY DEP
STYLE LOCK — HAY & ĐẸP.
```

Reason:
baseline tests showed the model sometimes attempted to draw brand-like text.

Keep all VISUAL STYLE semantics unchanged:

```text
Premium warm editorial 2D illustration
ivory / cream
muted sage
warm wood
charcoal / sepia linework
tactile editorial texture
natural light
mature Vietnamese characters
NO text / logo / watermark
```

Do NOT modify production source.
This sanitization exists only inside the isolated pilot script.

---

# 6. ANATOMY SAFETY BLOCK

For beats containing people, append a COMPACT safety block:

```text
ANATOMY:
Believable connected human anatomy.
Head, neck, torso, arms and visible hands belong naturally to the same body.
No floating head.
No detached hand or arm.
No duplicate limbs.
No missing torso.
No surreal anatomy.
Keep intended people comfortably inside frame.
```

Do not reuse the very long V3.3A-S.1 anatomy block.

Reason:
the longer block did not improve observed yield and can dominate the semantic prompt.

For `needsPeople === false`:
do not add human anatomy instructions.

---

# 7. CANONICAL REUSE MUST BE HONORED

Do NOT generate a fresh asset when current Story Planner says:

```text
assetStrategy = reuse-canonical
```

For Video 001:

- establish normal generation creates the canonical cast image;
- MEMORY reuses canonical;
- QUESTION reuses canonical.

Use the same canonical asset according to current Fix 06 behavior.

Do not spend extra Cloudflare calls on reuse-canonical beats.

---

# 8. GENERATION POLICY

For every beat requiring a new asset:

### Attempt 1
Generate exactly one candidate.

Save:

```text
beat-XX-attempt-01.jpg
```

Then visually inspect it against the hard QA gate below.

### If PASS
Select immediately.
Do not generate more.

### If FAIL
Generate Attempt 2:

```text
beat-XX-attempt-02.jpg
```

Use the SAME semantic prompt.
Do not rewrite story content.

### If Attempt 2 FAILS
Generate one final Attempt 3:

```text
beat-XX-attempt-03.jpg
```

### Maximum

```text
3 attempts per generated beat
```

Never exceed 3.

This is a bounded QA/retry experiment, not unlimited cherry-picking.

---

# 9. HARD QA GATE

A candidate must FAIL if ANY is true:

## A. Anatomy

```text
floating head
detached hand
detached arm
missing torso
severe duplicate limb
impossible connected anatomy
```

## B. Text pollution

Any unintended:

```text
word
logo
signature
watermark
brand-like glyph
```

inside the generated illustration.

## C. People contract

Generated image violates requested people:

Examples:

```text
requested father only → whole family appears
requested father + boy → unrelated extra adults appear
noPeople → person appears
```

Minor background silhouettes count as extra people if visually identifiable.

## D. Core semantic failure

Image does not visibly represent the requested primary action.

Examples:

```text
phone-away beat → phone prominently remains on dining table
listening beat → no conversational/listening behavior
work/school beat → unrelated decorative portrait
```

## E. Severe style drift

Fail if clearly:

```text
photoreal
anime
chibi
3D
flat corporate vector
stick figure
```

---

# 10. SOFT QA — DO NOT RETRY FOR THESE ALONE

Do NOT reject merely because:
- face differs from the canonical face;
- room furniture geometry differs slightly;
- garment shade changes slightly;
- exact pose differs from text;
- illustration is not as beautiful as Candidate 04.

Schnell does NOT have identity lock in this stage.

This pilot measures whether bounded retries can produce a clean usable asset set.

---

# 11. QA RECORD

Create:

```text
scratch/v33/video001-schnell-pilot/qa.json
```

For every generated beat record:

```json
{
  "beatId": "beat-04",
  "storyRole": "interaction",
  "voiceClause": "...",
  "attempts": [
    {
      "file": "beat-04-attempt-01.jpg",
      "verdict": "FAIL",
      "reasons": ["detached hand"]
    },
    {
      "file": "beat-04-attempt-02.jpg",
      "verdict": "PASS",
      "reasons": []
    }
  ],
  "selectedFile": "beat-04-attempt-02.jpg"
}
```

For reuse-canonical beats:

```json
{
  "beatId": "beat-16",
  "assetStrategy": "reuse-canonical",
  "selectedFrom": "beat-01",
  "apiCalls": 0
}
```

Never fabricate QA.

---

# 12. SELECTED ASSETS

Copy/link selected assets into:

```text
scratch/v33/video001-schnell-pilot/selected/
```

Use:

```text
beat-01.jpg
beat-02.jpg
...
beat-16.jpg
```

For reuse-canonical beats:
it is acceptable for multiple selected paths to resolve to the same underlying image/copy.

---

# 13. CONTACT SHEET — SELECTED SET

Create:

```text
contact-sheet-selected.jpg
```

Show all 16 story beats in order.

Suggested layout:

```text
4 columns × 4 rows
```

External labels:

```text
beat-01
establish
```

etc.

Do NOT draw labels into the candidate image pixels.

---

# 14. CONTACT SHEET — FAILURES

If any rejected attempts exist, create:

```text
contact-sheet-rejected.jpg
```

Include ALL rejected candidates.

External labels:

```text
beat-04 attempt-01
FAIL: detached hand
```

This is important for human diagnosis.

If no failures exist:
do not create this file.

---

# 15. PILOT METRICS

Create:

```text
pilot-report.json
```

Include factual metrics:

```json
{
  "videoIndex": 1,
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "beatCount": 16,
  "generatedBeatCount": 0,
  "reuseCanonicalBeatCount": 0,
  "totalApiCalls": 0,
  "firstAttemptPassCount": 0,
  "retryBeatCount": 0,
  "failedAfterMaxRetriesCount": 0,
  "anatomyRejectCount": 0,
  "textPollutionRejectCount": 0,
  "peopleContractRejectCount": 0,
  "semanticRejectCount": 0,
  "styleDriftRejectCount": 0
}
```

Use actual values.

---

# 16. PILOT PASS RULE

PASS only if:

1. Story Plan validates.
2. All 16 beats have a selected asset.
3. No selected asset has a hard QA failure.
4. No beat fails all 3 attempts.
5. MEMORY and QUESTION honor canonical reuse.
6. No selected image contains unintended text/logo/watermark.
7. No selected image has severe anatomy failure.
8. Total API calls remain within bounded retry policy.

Do NOT require:
- same face across separately generated beats;
- exact room identity;
- perfect production polish.

Those remain future identity/world work.

---

# 17. IMPORTANT: NO MP4

Even if PASS:

Do NOT render Video 001.

The next gate is HUMAN VISUAL REVIEW of:

```text
contact-sheet-selected.jpg
contact-sheet-rejected.jpg (if any)
qa.json
pilot-report.json
```

---

# 18. FINAL REPORT

Return:

## A. Auth Check

## B. Current Video 001 Plan
Show:
```text
mode
cast
world
beat count
```

## C. Generation Summary
Show:
```text
generated beats
canonical reuse beats
total API calls
```

## D. QA Retry Summary

Table:

```text
beat
role
attempt count
selected attempt
hard failures encountered
```

## E. Rejection Counts

```text
anatomy
text pollution
people contract
semantic
style drift
```

## F. Contact Sheet Paths

## G. Important Limitations

Explicitly state:

```text
This pilot does NOT prove face identity consistency.
This pilot does NOT prove world architectural continuity.
FLUX.1 Schnell remains text-driven.
```

## H. Verdict

Exactly one:

```text
V3.3B-S VIDEO 001 SCHNELL ASSET PILOT — PASS
```

or:

```text
V3.3B-S VIDEO 001 SCHNELL ASSET PILOT — FAIL
```

Then STOP.

Do not render MP4.
Do not start production integration.
Wait for human review.
