# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 01.1
# SINGLE GOAL: ALIGNMENT SAFETY GATE ONLY

## CONTEXT

Parallel Fix 01 correctly fixes the observed Video 001 error:

STT:
`nghe vài tô chuyện vụn`

Canonical:
`nghe vài câu chuyện vụn`

and correctly reuses the STT timing for `câu`.

However, the current aligner has one reliability problem:

> `canonicalIntegrity: true` currently proves only that the OUTPUT text was rebuilt from canonical text. It does NOT prove that STT timing was aligned to the correct canonical words.

A completely unrelated STT sequence can still return:
- many `SUBSTITUTION`s,
- `canonicalIntegrity: true`,
- no validation error.

This round fixes ONLY that safety problem.

Do NOT work on images, Story Planner, style, SFX, UI, subtitle design, or rendering.

---

# 1. SCOPE LOCK

Only modify subtitle alignment validation/fallback behavior.

Allowed files:
- `scripts/subtitle-canonical-aligner.mjs`
- subtitle aligner tests
- the smallest integration points in `scripts/transcribe.mjs` / `scripts/batch-engine.mjs` if required for safe fallback

Do NOT change:
- TTS
- STT provider
- transcription model
- word alignment scoring unless required for safety metrics
- Story Planner
- scene timing
- image generation
- Remotion subtitle appearance

---

# 2. REPRODUCE THE CURRENT FALSE-POSITIVE FIRST

Before editing, add/execute this exact case:

Canonical:

```text
một bữa cơm gia đình rất quý
```

STT:

```text
hôm nay trời mưa đường rất xa
```

with 7 normal sequential word timestamps.

Current behavior is expected to look like:

```text
exactMatches: 1
contextSubstitutions: 6
canonicalIntegrity: true
```

Print the result before fixing.

This is the bug.

---

# 3. SEPARATE TWO CONCEPTS

After this fix, metrics MUST distinguish:

## A. `canonicalTextIntegrity`

Question:

> Does the final displayed text exactly preserve the authored canonical text?

This checks:
- spelling
- Vietnamese diacritics
- capitalization
- punctuation
- token order

This can be true even if timing evidence is poor.

## B. `alignmentQuality`

Question:

> Is STT evidence sufficiently similar to canonical text that word-level timing transfer is trustworthy?

This must be evaluated independently.

Do NOT keep a single ambiguous boolean called only `canonicalIntegrity`.

Backward-compatible alias may remain temporarily, but report must expose the two concepts separately.

---

# 4. EXACT CANONICAL TEXT INTEGRITY

Current validation normalizes away punctuation/diacritics.

That is not enough for text integrity.

Create a canonical display comparison.

Suggested:

```js
function normalizeDisplayWhitespace(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim();
}
```

Expected display reconstruction:

```js
const expectedDisplay = normalizeDisplayWhitespace(
  tokenizeCanonicalScript(canonicalText)
    .map((t) => t.display)
    .join(' ')
);

const actualDisplay = normalizeDisplayWhitespace(
  alignedTimeline.words
    .map((w) => w.word)
    .join(' ')
);

const canonicalTextIntegrity =
  actualDisplay === expectedDisplay;
```

This comparison MUST preserve:
- `câu` vs `cau`
- `nghe,` vs `nghe`
- `Câu` vs `câu`
- `?`
- `.`

Do not use accent-stripped normalization for this integrity check.

---

# 5. ADD ALIGNMENT QUALITY METRICS

From current alignment metrics calculate:

```js
const canonicalCount =
  metrics.canonicalTokenCount || 1;

const sttCount =
  metrics.sttTokenCount || 1;

const evidenceMatches =
  metrics.exactMatches +
  metrics.fuzzyMatches;

const evidenceRatio =
  evidenceMatches /
  canonicalCount;

const substitutionRatio =
  metrics.contextSubstitutions /
  canonicalCount;

const interpolationRatio =
  metrics.interpolatedTokens /
  canonicalCount;

const ignoredSttRatio =
  metrics.ignoredSttTokens /
  sttCount;
```

Expose all four ratios.

Use rounded values only for report display.
Keep full precision internally.

---

# 6. SAFETY THRESHOLD

For TTS generated from the exact canonical script, STT should normally be highly similar.

Default safe thresholds:

```js
const DEFAULT_ALIGNMENT_POLICY = {
  minEvidenceRatio: 0.85,
  maxSubstitutionRatio: 0.10,
  maxInterpolationRatio: 0.10,
  maxIgnoredSttRatio: 0.10,
};
```

Safe alignment:

```js
const alignmentTrusted =
  evidenceRatio >=
    policy.minEvidenceRatio &&
  substitutionRatio <=
    policy.maxSubstitutionRatio &&
  interpolationRatio <=
    policy.maxInterpolationRatio &&
  ignoredSttRatio <=
    policy.maxIgnoredSttRatio;
```

Do not tune thresholds against only Video 001.

Tests must include exact, small-error, missing-word, extra-word, and catastrophic mismatch cases.

---

# 7. ALIGNMENT VERDICT

Return:

```js
alignmentStatus:
  'TRUSTED'
  | 'DEGRADED'
```

Do not use vague PASS for the internal API.

For Video 001 expected:

```text
canonicalTextIntegrity = true
alignmentStatus = TRUSTED
```

For unrelated same-length STT:

```text
canonicalTextIntegrity = true
alignmentStatus = DEGRADED
```

This distinction is the main goal of the task.

---

# 8. DEGRADED FALLBACK MUST STILL USE CANONICAL TEXT

If word-level alignment is `DEGRADED`:

DO NOT display raw STT.

DO NOT keep arbitrary one-to-one substitution timing.

Create a deterministic canonical fallback timeline.

Use:
- canonical text for all words;
- STT/audio duration as timing bounds;
- segment timestamps when safely available;
- proportional word timing within canonical segments.

The exact fallback implementation may be simple.

Required invariant:

```text
DISPLAY TEXT = CANONICAL
TIMING MODE = APPROXIMATE
```

Never:

```text
DISPLAY TEXT = RAW STT
```

Return/report:

```js
timingMode:
  'STT_WORD_ALIGNED'
  | 'CANONICAL_APPROXIMATE'
```

---

# 9. REMOVE RAW-STT FALLBACK ON ALIGNMENT ERROR

Current `scripts/transcribe.mjs` contains behavior equivalent to:

```text
Canonical alignment warning...
Preserving STT timeline.
```

This violates the source-of-truth rule.

Replace it.

If canonical script exists and alignment throws:

```text
canonical text must still win
```

Use the canonical approximate fallback.

If even fallback construction fails:
throw an explicit error.

Do not silently publish raw STT as final subtitle timeline.

Raw STT remains available only in:

```text
timeline-stt-raw.json
```

for diagnostics.

---

# 10. NO RAW TEXT LEAK THROUGH EMPTY SEGMENTS

Current `reconstructSegments()` has an empty-segment branch that can use:

```js
text: origSeg.text
```

That can reintroduce raw STT text into `timeline.segments`.

Remove this possibility.

Invariant:

> Every final `timeline.segments[].text` must be derived from canonical text only.

For an empty bucket:
- use `text: ''`, or
- redistribute canonical words to a neighboring segment,
- but NEVER copy `origSeg.text`.

Remember:
Story Planner consumes `timeline.segments`, so raw STT text leaking here can affect visual planning even when subtitle words are canonical.

---

# 11. REPORT SCHEMA

Update `subtitle-alignment-report.json`.

Required:

```json
{
  "canonicalTokenCount": 177,
  "sttTokenCount": 177,

  "exactMatches": 176,
  "fuzzyMatches": 0,
  "contextSubstitutions": 1,
  "interpolatedTokens": 0,
  "ignoredSttTokens": 0,

  "evidenceRatio": 0.9944,
  "substitutionRatio": 0.0056,
  "interpolationRatio": 0,
  "ignoredSttRatio": 0,

  "canonicalTextIntegrity": true,
  "alignmentStatus": "TRUSTED",
  "timingMode": "STT_WORD_ALIGNED",

  "validationErrors": []
}
```

For catastrophic mismatch:

```text
canonicalTextIntegrity: true
alignmentStatus: DEGRADED
timingMode: CANONICAL_APPROXIMATE
```

---

# 12. REQUIRED TESTS

Keep all existing tests.

Add:

## Test 8 — Catastrophic same-length mismatch

Canonical:
```text
một bữa cơm gia đình rất quý
```

STT:
```text
hôm nay trời mưa đường rất xa
```

Expected:

```text
canonicalTextIntegrity = true
alignmentStatus = DEGRADED
timingMode = CANONICAL_APPROXIMATE
```

Final displayed text remains canonical.

## Test 9 — punctuation integrity

Canonical:
```text
Bạn muốn mình nghe, hay cùng nghĩ cách?
```

Force a hypothetical output without comma/question mark into validator.

Expected:
```text
canonicalTextIntegrity = false
```

## Test 10 — no raw segment leak

Construct STT with an extra/empty segment containing:

```text
SAI HOÀN TOÀN
```

Expected:
no final `timeline.segments[].text` contains:
```text
SAI HOÀN TOÀN
```

## Test 11 — small real-world error remains trusted

Canonical:
```text
nghe vài câu chuyện vụn
```

STT:
```text
nghe vài tô chuyện vụn
```

Expected:
```text
alignmentStatus = TRUSTED
timingMode = STT_WORD_ALIGNED
```

## Test 12 — alignment exception fallback

Simulate an alignment failure at integration level.

Expected:
final timeline still uses canonical text,
never raw STT.

---

# 13. VIDEO 001 VERIFICATION

Run against current real Video 001 raw timeline.

Expected:

```text
canonicalTokenCount: 177
sttTokenCount: 177
exactMatches: 176
contextSubstitutions: 1

canonicalTextIntegrity: true
alignmentStatus: TRUSTED
timingMode: STT_WORD_ALIGNED
```

Known correction remains:

```text
STT: tô
CANONICAL: câu
TIME: 10.20–10.32
```

---

# 14. ACCEPTANCE

PASS only if:

1. Video 001 remains correct.
2. Unrelated STT no longer reports trusted alignment.
3. `canonicalTextIntegrity` checks punctuation/diacritics/case.
4. degraded alignment still displays canonical wording.
5. no final segment can copy raw `origSeg.text`.
6. alignment exception cannot publish raw STT as final timeline.
7. raw STT is retained only for diagnostics.
8. all subtitle tests pass.

---

# 15. FINAL OUTPUT

Return:

## A. False Positive Before Fix

## B. Files Changed

## C. New Safety Metrics

## D. New Tests

## E. Catastrophic Mismatch Result

## F. Video 001 Result

## G. Remaining Limitations

## H. Verdict

Exactly:

```text
PARALLEL FIX 01.1 — ALIGNMENT SAFETY GATE — PASS
```

or:

```text
PARALLEL FIX 01.1 — ALIGNMENT SAFETY GATE — FAIL
```

Then STOP.

Do not start another task.
