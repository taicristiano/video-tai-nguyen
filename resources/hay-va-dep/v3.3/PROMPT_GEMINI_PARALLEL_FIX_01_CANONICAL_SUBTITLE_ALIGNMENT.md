# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 01
# SINGLE GOAL: CANONICAL SUBTITLE ALIGNMENT ONLY

## STATUS

`V3.3A-1 — Style Lock` is PAUSED because Cloudflare Workers AI quota is exhausted.

Do NOT continue V3.3A-2.
Do NOT touch image generation.
Do NOT modify reference-conditioning code.

This is a PARALLEL FIX while waiting for quota reset.

This prompt has ONE GOAL ONLY:

> Subtitle text shown on video must come from the canonical voice script, while STT/Whisper/Groq is used only to provide timing.

Example bug to eliminate:

Canonical script:
`nghe vài câu chuyện vụn`

STT result:
`nghe vài tô chuyện vụn`

Current wrong behavior:
subtitle displays `tô`.

Required behavior:
subtitle displays canonical word `câu`, but keeps the word timing inferred from STT.

---

# 1. SCOPE LOCK

ONLY work on subtitle text alignment.

Do NOT modify:

- Story Planner
- visual beat splitting
- image prompts
- cast
- world
- style
- reference generation
- batch asset selection
- SFX
- transitions
- typography
- subtitle visual design
- TTS voice generation
- Remotion scene timing
- video duration
- batch rendering behavior unrelated to subtitle data

Do NOT render a video in this round unless a very small subtitle-only smoke render is strictly necessary.

Prefer unit tests + JSON fixtures.

---

# 2. FIRST AUDIT CURRENT PIPELINE

Before editing, locate and report:

1. Where the canonical `voiceScriptText` comes from.
2. Where TTS audio is generated.
3. Where STT/Whisper/Groq timeline is generated.
4. Exact timeline JSON shape.
5. Where subtitle text is rendered in React/Remotion.
6. Whether timeline contains:
   - word timestamps;
   - segment timestamps only;
   - punctuation;
   - confidence.

Print the audit first.

Do not assume filenames from this prompt if repo differs.

---

# 3. DESIGN PRINCIPLE

We have two sources:

## Source A — Canonical text

The authored voice script.

This is the ONLY source of truth for displayed subtitle words.

It owns:
- spelling;
- Vietnamese diacritics;
- punctuation;
- wording;
- proper nouns;
- brand terms.

## Source B — STT transcript

This is timing evidence only.

It owns:
- start timestamp;
- end timestamp;
- approximate spoken word boundaries.

It must NEVER overwrite canonical wording.

Pipeline target:

```text
canonical voice script
        +
STT word/segment timing
        ↓
canonical-timed subtitle words
```

Not:

```text
STT guessed words
        ↓
display directly
```

---

# 4. CREATE A PURE ALIGNMENT MODULE

Create one isolated module, suggested:

```text
scripts/subtitle-canonical-aligner.mjs
```

Do not embed complex alignment directly inside batch-engine.

Export pure functions so they are testable.

Suggested public API:

```js
export function normalizeForAlignment(text) {}

export function tokenizeCanonicalScript(text) {}

export function flattenSttWords(timeline) {}

export function alignCanonicalToStt({
  canonicalText,
  sttTimeline,
}) {}

export function buildCanonicalTimeline({
  canonicalText,
  sttTimeline,
}) {}
```

Names may differ slightly if repo conventions require it.

---

# 5. NORMALIZATION RULES

Alignment normalization must be forgiving.

For matching only:

- lowercase;
- Unicode normalize;
- remove punctuation;
- collapse whitespace;
- optionally strip Vietnamese accents for comparison;
- map `đ` → `d`;
- preserve original canonical token separately.

Example:

```js
normalizeForAlignment('Câu chuyện...')
=> 'cau chuyen'
```

Important:

Do NOT replace displayed canonical token with normalized text.

Canonical display remains:

```text
Câu chuyện…
```

Normalization is only for matching.

---

# 6. TOKENIZATION

Canonical tokenizer must preserve:

```js
{
  display: 'câu',
  normalized: 'cau',
  index: 12
}
```

Punctuation may be attached to display text or stored separately,
but the final reconstructed subtitle must preserve authored punctuation.

Do not lose:
- `?`
- `.`
- `,`
- Vietnamese quotation marks if present.

---

# 7. STT INPUT

If STT provides word timestamps, flatten to:

```js
{
  raw: 'tô',
  normalized: 'to',
  start: 7.21,
  end: 7.48
}
```

If STT only provides segment timestamps:
derive approximate per-word timings inside each segment by proportional allocation.

Use word length or equal distribution.

Do NOT call another AI model.

No network request is needed.

---

# 8. ALIGNMENT ALGORITHM

Use deterministic sequence alignment.

Preferred:
dynamic programming / Needleman–Wunsch style alignment.

We need alignment between:

```text
canonical normalized tokens
vs
STT normalized tokens
```

Score guidance:

```text
exact normalized match: +4
very close edit similarity: +2
substitution: -1
insertion: -2
deletion: -2
```

Vietnamese STT errors like:

```text
câu -> tô
```

will not match semantically, but sequence context should align the canonical token to that STT time slot.

The algorithm must preserve canonical token order.

Never reorder canonical text.

---

# 9. TIMING TRANSFER

For each canonical token:

### Case A — matched to STT word

Use matched STT:

```text
start
end
```

### Case B — canonical token missing in STT

Interpolate timing between nearest aligned previous/next tokens.

Example:

```text
previous end = 4.20
next start   = 4.80
missing 2 canonical words
```

Divide the gap proportionally.

### Case C — extra STT word not in canonical

Ignore its text.

Its time may be absorbed into surrounding canonical timing,
but it must never appear in displayed subtitles.

### Case D — beginning/end missing

Extrapolate inside nearest available segment bounds.

---

# 10. MONOTONIC TIMING INVARIANTS

Final canonical word timings MUST satisfy:

```text
word[i].start <= word[i].end
word[i].start >= word[i-1].start
word[i].end   >= word[i-1].end
```

No negative timestamps.

No overlap that makes karaoke regress backwards.

If tiny overlaps exist from STT, clamp safely.

---

# 11. SEGMENT RECONSTRUCTION

If current subtitle renderer expects segment-level timeline:

Rebuild segments using canonical text.

Prefer preserving existing STT segment boundaries where possible.

For every output segment:

```js
{
  start,
  end,
  text: canonicalSegmentText,
  words: [
    {
      text: canonicalWord,
      start,
      end
    }
  ]
}
```

Do not break the renderer contract unnecessarily.

Backward compatibility:
if alignment fails catastrophically,
do NOT silently display raw STT.

Instead:
- write a validation error;
- keep canonical segment text with approximate segment timing.

Canonical wording always wins.

---

# 12. VALIDATION

Add:

```js
validateCanonicalAlignment({
  canonicalText,
  alignedTimeline,
})
```

Mandatory checks:

### Text integrity

Reconstruct displayed words from timeline.

After punctuation-insensitive normalization:

```text
reconstructed canonical subtitle
==
canonical voice script
```

This must be true.

### Timing

- non-negative;
- monotonic;
- final end <= audio/timeline duration + small tolerance.

### Coverage

Report:

```text
canonical token count
STT token count
exact matches
fuzzy matches
context substitutions
interpolated canonical tokens
ignored STT tokens
```

---

# 13. QA ARTIFACT

For each generated video write:

```text
subtitle-alignment-report.json
```

Suggested schema:

```json
{
  "canonicalTokenCount": 120,
  "sttTokenCount": 121,
  "exactMatches": 112,
  "fuzzyMatches": 3,
  "contextSubstitutions": 4,
  "interpolatedTokens": 1,
  "ignoredSttTokens": 1,
  "canonicalIntegrity": true
}
```

Also optional:

```text
subtitle-alignment-diff.md
```

Only list places where STT text differed from canonical.

Example:

```text
STT:       tô
CANONICAL: câu
TIMING:    7.21–7.48
ACTION:    canonical text kept, STT timing reused
```

This is extremely useful QA.

---

# 14. TEST FIXTURES

Create small deterministic fixtures.

## Test 1 — exact transcript

Canonical:
```text
Nhà mình ăn cơm cùng nhau.
```

STT:
same text.

Expected:
canonical text unchanged,
timings preserved.

## Test 2 — substitution

Canonical:
```text
nghe vài câu chuyện vụn
```

STT:
```text
nghe vài tô chuyện vụn
```

Expected output display:
```text
nghe vài câu chuyện vụn
```

The canonical token `câu` inherits the time position of STT `tô`.

## Test 3 — missing STT word

Canonical:
```text
mọi người cùng có mặt
```

STT:
```text
mọi người có mặt
```

Expected:
`cùng` remains in subtitle,
timing interpolated.

## Test 4 — extra STT word

Canonical:
```text
đặt điện thoại sang một bên
```

STT:
```text
đặt cái điện thoại sang một bên
```

Expected:
display has NO `cái`.

## Test 5 — punctuation

Canonical:
```text
Bạn muốn mình nghe, hay cùng nghĩ cách?
```

STT may omit punctuation.

Expected final text preserves comma and question mark from canonical.

## Test 6 — Vietnamese diacritics

Canonical:
```text
những điều nhỏ
```

STT:
```text
nhung dieu nho
```

Expected:
canonical diacritics preserved.

---

# 15. INTEGRATION POINT

Only after pure tests pass:

Integrate the aligner at the smallest possible point between:

```text
STT timeline produced
→ subtitle timeline written/consumed
```

Do not change:
- audio;
- scene timing;
- visual generation.

Suggested flow:

```js
const rawTimeline = ...;

const alignedTimeline =
  buildCanonicalTimeline({
    canonicalText: voiceScriptText,
    sttTimeline: rawTimeline,
  });

write timeline used by subtitles
```

If other systems depend on raw STT text,
preserve raw timeline separately:

```text
timeline-stt-raw.json
timeline.json   // canonical-aligned
```

or similar.

Do not destroy diagnostic data.

---

# 16. TEST CURRENT VIDEO 001 DATA

Use existing Video 001 voice script and current STT timeline.

Do NOT regenerate TTS.
Do NOT call Cloudflare image generation.
Do NOT render full video.

Run aligner only.

Specifically verify known error:

```text
STT:       "tô"
CANONICAL: "câu"
```

Show exact before/after timeline snippet.

Also search for any other text differences.

---

# 17. ACCEPTANCE

This task passes ONLY if:

1. displayed subtitle source is canonical script;
2. STT is timing-only;
3. known `tô -> câu` error is fixed;
4. canonical punctuation is preserved;
5. missing STT words are not lost;
6. extra STT words are not displayed;
7. timestamps remain monotonic;
8. existing subtitle renderer requires no visual redesign;
9. no image generation/network AI was required;
10. unit tests pass.

---

# 18. OUTPUT

Return:

## A. Audit Before

## B. Files Changed

## C. Alignment Algorithm

## D. Test Results

## E. Video 001 Known Error
show:
```text
before
after
timestamp
```

## F. Alignment Metrics

## G. Remaining Limitations

## H. Verdict

Exactly:

```text
PARALLEL FIX 01 — CANONICAL SUBTITLE ALIGNMENT — PASS
```

or:

```text
PARALLEL FIX 01 — CANONICAL SUBTITLE ALIGNMENT — FAIL
```

Then STOP.

Do not start another task.
