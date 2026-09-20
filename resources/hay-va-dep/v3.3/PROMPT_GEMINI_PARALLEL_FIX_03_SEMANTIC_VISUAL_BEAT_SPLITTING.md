# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 03
# SINGLE GOAL: SEMANTIC VISUAL BEAT SPLITTING ONLY

## CONTEXT

Parallel Fix 02 / 02.1 is complete.

Cloudflare image quota is still not required for this task.

Current Story Planner has a structural problem:

> One transcript segment can contain two clearly different visual ideas, but `splitVisualClauses()` often keeps them as one beat.

This creates shots that are too long and forces one image prompt to represent two different actions.

Real examples from Video 001:

### Example A

```text
Có thể là một mâm cơm đơn giản có đủ người,
hoặc chiếc điện thoại được đặt sang một bên.
```

These are TWO visual ideas:

1. full/simple family meal;
2. phone deliberately placed away.

They must not be one image prompt.

### Example B

```text
mà ở việc mọi người cùng có mặt,
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

A long visual beat currently spans about 5+ seconds.

It should be split into visually coherent beats instead of one long static shot.

### Example C

```text
Tuần này, thử giữ lại ít nhất một bữa ăn
mà mọi người ngồi cùng nhau
và điện thoại không nằm giữa bàn.
```

The family-together idea and the phone-away idea should not be forced into the same generated image.

This round fixes ONLY semantic beat splitting.

---

# 1. SCOPE LOCK

Primary allowed file:

```text
scripts/human-insight-story-planner.mjs
```

Allowed test files:

```text
src/templates/human-insight/cinematic-light/storyPlannerGeneralization.test.ts
```

and/or one small dedicated unit test file for visual clause splitting.

Do NOT modify:

- `familyAction()`
- `familyIntent()`
- role precedence
- cast logic
- presentMembers
- world logic
- image prompt generation
- image models
- Cloudflare code
- SFX
- subtitle alignment
- batch-engine rendering
- Remotion UI
- typography
- reference conditioning
- V3.3 style lock

Do NOT render images.
Do NOT render MP4.

This task is pure planner logic + tests.

---

# 2. AUDIT CURRENT IMPLEMENTATION FIRST

Before editing, inspect and report the current behavior of:

```js
splitByPunctuation()
splitLongClause()
mergeToBeatBudget()
splitVisualClauses()
allocateBeatFrames()
```

Confirm the current limitation:

```js
function splitLongClause(clause) {
  const wc = wordCount(clause);
  if (wc <= 20) return [clause];
  ...
}
```

This means a clause with two visual ideas can remain unsplit simply because it is 20 words or fewer.

Also report current output of `splitVisualClauses()` for the three real Video 001 examples above.

Do not change code before showing this audit.

---

# 3. DESIGN PRINCIPLE

A **visual beat** should express one primary visible idea.

Good:

```text
family sitting together
```

then:

```text
phone placed away
```

Bad:

```text
family sitting together + phone away + child telling story + father arriving home
```

One beat may contain supporting context, but should not require two unrelated focal actions.

The splitter must use BOTH:

1. semantic boundaries;
2. estimated visual duration.

Do NOT split purely by word count.

Do NOT split every comma.

Do NOT split every occurrence of `và`.

---

# 4. TARGET RHYTHM

For ordinary narrative beats:

```text
preferred: 2.0–4.2 seconds
soft maximum: 4.5 seconds
```

Exceptions:
- opening establish may be slightly longer;
- final emotional hold is handled elsewhere;
- this function does not need role awareness yet.

For clause splitting itself, use:

```js
const TARGET_VISUAL_BEAT_SEC = 3.2;
const SOFT_MAX_VISUAL_BEAT_SEC = 4.5;
```

Do not hardcode Video 001 text.

---

# 5. REPLACE WORD-COUNT-ONLY SPLITTING

Refactor the current logic into a helper with explicit semantic candidates.

Suggested shape:

```js
function findSemanticSplitCandidates(clause) {}
function scoreSemanticBoundary(...) {}
function splitClauseSemantically(clause, durationSec) {}
```

Exact names may differ.

`splitLongClause()` may be removed or retained internally,
but word count alone must no longer decide whether semantic splitting is allowed.

---

# 6. SEMANTIC BOUNDARY TYPES

## A. Strong boundaries

Treat these as high-value visual boundaries when both sides are meaningful:

```text
, hoặc
 hoặc
, nhưng
 nhưng
, còn
 còn
, trong khi
 trong khi
, thay vì
 thay vì
, để rồi
 để rồi
```

Important:

Preserve the connector in the resulting clause where possible.

Example:

Input:

```text
một mâm cơm đơn giản có đủ người, hoặc chiếc điện thoại được đặt sang một bên
```

Acceptable output:

```text
[
  "một mâm cơm đơn giản có đủ người",
  "hoặc chiếc điện thoại được đặt sang một bên"
]
```

Do not silently delete `hoặc`.

---

## B. Comma boundaries

A comma by itself is NOT automatically a split.

Consider it only when:

1. total estimated segment/part duration would otherwise exceed the soft max;
2. both sides have enough semantic content;
3. the right side begins a new visible action/state.

Minimum guideline:

```text
left >= 4 words
right >= 4 words
```

Example worth splitting:

```text
mọi người cùng có mặt,
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài
```

The second side begins a distinct interaction action: `nghe`.

Do NOT create a giant Vietnamese NLP system.

Use a small reusable visual-action cue list.

Suggested cues:

```text
nghe
nói
kể
nhìn
đặt
cất
gắp
xới
ngồi
đứng
đi
về
mở
đóng
viết
ghi
dọn
xếp
cầm
đưa
nhận
```

Keep this helper generic across HAY & ĐẸP. content modes.

---

## C. `và` boundary

Do NOT split every `và`.

Only consider `và` when:

1. the beat is too long OR the right side contains a clearly independent focal object/action;
2. both sides remain meaningful;
3. the right side starts a new visual subject or action.

A particularly important generic pattern:

```text
... và điện thoại ...
```

when the left side already describes a human/group action.

Example:

```text
mọi người ngồi cùng nhau
và điện thoại không nằm giữa bàn
```

This SHOULD become two visual ideas.

But:

```text
nghe câu chuyện và nhìn thấy nhau
```

may remain one interaction beat if duration is acceptable.

Do not hardcode the entire sentence.
A small cue-based rule is acceptable.

---

# 7. PRESERVE TEXT ORDER AND WORDS

Semantic splitting must NOT reorder content.

Do not rewrite narration.

Do not paraphrase.

Do not drop connectors accidentally.

For a segment:

```text
A, hoặc B
```

the concatenated split clauses should still represent the original words in original order, ignoring only separator punctuation/whitespace normalization.

Add a helper/test such as:

```js
normalizeSplitText(parts.join(' '))
```

vs original normalized text.

Connector words like:

```text
hoặc
nhưng
còn
và
```

must not disappear.

---

# 8. DURATION-AWARE RECURSIVE SPLIT

Use estimated time to decide whether another split is useful.

Suggested flow:

```text
segment text
→ major punctuation split
→ semantic split candidates
→ estimate duration by word proportion
→ if a part > 4.5s and valid semantic boundary exists:
     split again
→ stop when:
     part <= 4.5s
     OR no safe semantic boundary exists
     OR 3 parts reached for that original segment
```

Keep:

```text
max 3 visual beats per transcript segment
```

to avoid over-fragmentation.

Do not split a 2.5s segment into three micro-shots.

---

# 9. UPDATE `mergeToBeatBudget()`

Current implementation can merge semantically separated parts back together simply to hit a numeric target count.

This must not destroy **strong semantic boundaries**.

Introduce boundary metadata if needed.

For example:

```js
{
  text: '...',
  boundaryBefore: 'strong' | 'soft' | 'none'
}
```

or an equivalent internal representation.

Rule:

> Never merge across a STRONG semantic boundary just because the target beat count is lower.

Strong boundary examples:
- `hoặc`
- `nhưng`
- explicit independent phone/action boundary

Soft comma boundaries may be merged if necessary.

Do not expose complex metadata in final `voiceClause` output unless needed.

---

# 10. FRAME ALLOCATION

Keep `allocateBeatFrames()` proportional by word count for now.

Do NOT redesign timing alignment in this task.

But add validation:

```text
each beat duration > 0
beat start/end are monotonic
first beat starts at segment start
last beat ends at segment end
```

For split segments, report estimated durations in seconds during tests.

No beat should exceed 4.5s IF a valid semantic boundary was available.

If no safe boundary exists, a longer beat is allowed.
Do not force grammatically broken splits.

---

# 11. REQUIRED UNIT TESTS

Add focused deterministic tests.

## Test 1 — strong `hoặc` split even around 4.4s

Input:

```text
Có thể là một mâm cơm đơn giản có đủ người, hoặc chiếc điện thoại được đặt sang một bên.
```

Duration:

```text
4.4s
```

Expected:

```text
2 clauses
```

One about the meal.
One containing `điện thoại`.

The word `hoặc` must not disappear from normalized reconstruction.

---

## Test 2 — long comma action split

Input:

```text
mà ở việc mọi người cùng có mặt, nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Duration:

```text
5.16s
```

Expected:

```text
>= 2 clauses
```

No single clause should consume the full 5.16s when a safe comma/action boundary exists.

---

## Test 3 — independent phone idea after `và`

Input:

```text
Tuần này, thử giữ lại ít nhất một bữa ăn mà mọi người ngồi cùng nhau và điện thoại không nằm giữa bàn.
```

Duration:

```text
6.24s
```

Expected:

- at least 2 clauses;
- one clause carries family-together concept;
- a separate clause contains `điện thoại`;
- max 3 clauses.

---

## Test 4 — do not split ordinary short `và`

Input:

```text
Hai người ngồi gần nhau và trò chuyện nhẹ nhàng.
```

Duration:

```text
2.8s
```

Expected:

```text
1 clause
```

---

## Test 5 — do not split tiny comma phrases

Input:

```text
Buổi sáng, căn phòng yên tĩnh.
```

Duration:

```text
2.5s
```

Expected:

```text
1 clause
```

---

## Test 6 — preserve connectors/text order

Test:

```text
A nhưng B
A hoặc B
A còn B
```

with meaningful real phrases.

After splitting and normalized reconstruction:
all lexical words/connectors remain in original order.

---

## Test 7 — max 3 beats

Use a deliberately long sentence with many valid semantic boundaries.

Expected:

```text
clauses.length <= 3
```

---

## Test 8 — frame allocation monotonic

For a split segment verify:

```text
beat[0].startFrame = segment start
beat[n-1].endFrame = segment end
all beat durations > 0
no backwards frame movement
```

---

# 12. VIDEO 001 DRY RUN

Run Story Planner for Video 001 using existing timeline.

Do NOT generate images.

Print only the relevant beats for these portions:

```text
7.68–12.84
13.62–18.02
29.02–35.26
```

For each print:

```text
voiceClause
startFrame
endFrame
durationSec
storyRole
```

Acceptance intent:

### 7.68–12.84
Should no longer be one ~5.16s beat if a safe semantic split is available.

### 13.62–18.02
Meal concept and phone-away concept must be separate beats.

### 29.02–35.26
Phone concept must not be trapped in the same visual clause as the whole family-together idea.

---

# 13. GENERALIZATION CHECK

Run existing planner tests for:

```text
001
005
007
013
028
```

Do not change expected cast/mode/world behavior.

This task must not break the 5-video generalization dry run.

Report total beat count per video before/after.

A small increase is expected.

A large explosion is a failure.

Guideline:

```text
no test video should exceed 18 beats
```

unless it already did before this task.

---

# 14. IMPORTANT NON-GOALS

After semantic splitting, you may still see a wrong visual action such as:

```text
"sau một ngày"
→ work bag / school notebook
```

DO NOT fix it here.

That will be a separate single-purpose task:

```text
PARALLEL FIX 04 — ACTION PRECEDENCE
```

Likewise do not fix:
- dialogue-pair member keys;
- SFX;
- question reuse;
- character identity.

One problem at a time.

---

# 15. ACCEPTANCE CRITERIA

PASS only if:

1. strong semantic boundaries split independently of the old `>20 words` gate;
2. Video 001 meal-vs-phone sentence becomes separate beats;
3. long interaction segment gets a safe split;
4. CTA family-vs-phone concept separates;
5. short ordinary `và` phrases do not over-split;
6. connectors/word order are preserved;
7. no segment creates more than 3 beats;
8. beat frame allocation remains monotonic;
9. existing 5-video planner tests still pass;
10. no image generation or unrelated code change occurs.

---

# 16. FINAL REPORT

Return:

## A. Audit Before

## B. Files Changed

## C. Splitting Rules

## D. Unit Tests

## E. Video 001 Before/After
Show only the three target segments.

## F. Five-Video Beat Counts
Before vs after.

## G. Known Remaining Issue
Explicitly mention that action mapping / `sau một ngày` is NOT fixed in this task.

## H. Verdict

Exactly one:

```text
PARALLEL FIX 03 — SEMANTIC VISUAL BEAT SPLITTING — PASS
```

or:

```text
PARALLEL FIX 03 — SEMANTIC VISUAL BEAT SPLITTING — FAIL
```

Then STOP.

Do not start Action Precedence.
Do not render images.
Do not start V3.3A-1.
Wait for human review.
