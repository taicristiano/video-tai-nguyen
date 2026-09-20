# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PARALLEL FIX 04
# SINGLE GOAL: FAMILY INTERACTION ACTION PRECEDENCE ONLY

## CONTEXT

Parallel Fix 03 successfully split long multi-idea transcript segments into separate visual beats.

A semantic contamination bug remains in Video 001:

```text
voiceClause:
"nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài."

storyRole:
interaction
```

Current output incorrectly becomes:

```text
visualIntent:
parent returned home + work bag + keys + school notebook

visualAction:
Father puts his work bag beside the dining chair
while the child brings a school notebook.
```

The reason is that `familyIntent()` and `familyAction()` treat the generic phrase:

```text
"sau một ngày"
```

as equivalent to explicit school/work context.

This is wrong.

The clause is about:
- listening;
- conversation;
- looking at one another;
- reconnecting.

`sau một ngày dài` is only TEMPORAL CONTEXT.

It must not become the primary visible action.

There is also a related priority contamination:

Video 001 has this visual priority:

```text
"câu chuyện nhỏ sau một ngày đi học, đi làm."
```

The current loose priority matcher can attach it to the earlier interaction clause
because both contain generic overlap such as:

```text
"câu chuyện"
"ngày"
```

Then it marks that priority as used before the real explicit `đi học, đi làm` beat appears.

This round fixes ONE semantic problem:

> For FAMILY content, the PRIMARY interaction meaning must outrank broad temporal/context words.

Do not solve any other planner issue.

---

# 1. SCOPE LOCK

Primary allowed file:

```text
scripts/human-insight-story-planner.mjs
```

Allowed tests:

```text
src/templates/human-insight/cinematic-light/storyPlannerGeneralization.test.ts
```

and/or one focused file:

```text
src/family-action-precedence.test.ts
```

Do NOT modify:

- semantic beat splitting rules from Fix 03
- `splitVisualClauses()`
- `allocateBeatFrames()`
- cast selection
- `familyPresentMembers()`
- world selection
- relationship mode
- books mode
- home mode
- habit mode
- image generation
- Cloudflare
- SFX
- subtitle alignment
- Remotion
- V3.3 style work

Do NOT render images.
Do NOT render MP4.

---

# 2. AUDIT CURRENT BUG FIRST

Before editing, run Video 001 Story Planner and print these two beats.

## Interaction beat

```text
voiceClause:
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Print:

```text
storyRole
visualIntent
visualAction
matched visualPriority if any
presentMembers
composition
```

Expected BEFORE bug evidence:

```text
storyRole = interaction
```

but intent/action contain one or more of:

```text
work bag
keys
school notebook
đi học
đi làm
```

## Explicit school/work beat

```text
voiceClause:
Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Print the same fields.

Also print current Video 001 `visualPriorities`.

Do not edit before showing this audit.

---

# 3. CORE SEMANTIC RULE

Use this precedence for FAMILY content:

```text
1. Explicit focal object/detail
2. Explicit interaction/dialogue meaning
3. Explicit school/work/return-home context
4. Dinner/domestic action
5. role fallback
```

Most important:

> A generic temporal phrase such as `sau một ngày` is NOT sufficient evidence for school/work imagery.

Only explicit context should activate school/work visuals.

---

# 4. REMOVE THE BROAD TEMPORAL TRIGGER

Current code contains logic equivalent to:

```js
includesAny(
  text,
  ['đi học', 'đi làm', 'sau một ngày'],
)
```

in both family intent/action resolution.

Remove:

```text
sau một ngày
```

from school/work activation.

Create a small helper if useful:

```js
function hasExplicitFamilyReturnContext(text) {
  return includesAny(text, [
    'đi học',
    'đi làm',
    'về nhà',
    'tan học',
    'tan làm',
  ]);
}
```

Do not expand this into a giant keyword dictionary.

The key distinction is:

```text
"sau một ngày dài"
=> temporal context only

"sau một ngày đi học, đi làm"
=> explicit school/work context
```

---

# 5. INTERACTION ROLE MUST WIN

For FAMILY content, if:

```js
role === STORY_ROLES.INTERACTION
```

and the clause contains direct interaction meaning such as:

```text
nghe
kể
nói
trò chuyện
nhìn thấy nhau
cùng có mặt
ngồi cùng
```

then the primary intent/action must be interpersonal interaction.

It must NOT be replaced by work/school props even if the clause also contains a temporal phrase.

Suggested behavior:

### `familyIntent()`

Return something like:

```text
One family member actively tells a small story while the others listen,
make eye contact and react naturally around the same dining table.
```

### `familyAction()`

Return something concrete like:

```text
The boy speaks with a small hand gesture while father and mother turn toward him,
listen and react naturally at the dining table.
```

You may keep wording consistent with existing style.

Do not hardcode Video 001 title/index.

---

# 6. EXPLICIT SCHOOL/WORK BEAT MUST STILL WORK

This beat:

```text
Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.
```

contains explicit:

```text
đi học
đi làm
```

and is currently classified as:

```text
storyRole = action
```

It SHOULD still be allowed to use school/work arrival context.

Expected action may remain similar to:

```text
Father places a work bag near the chair
while the child arrives with school items,
then they join the family table.
```

This task must not remove useful explicit school/work imagery everywhere.

The distinction is:

```text
interaction + generic "sau một ngày dài"
=> conversation/listening

explicit "đi học, đi làm"
=> school/work context allowed
```

---

# 7. FIX VISUAL PRIORITY COMPATIBILITY

Current `matchedPriority()` is intentionally generic and should NOT be rewritten globally in this task.

Instead add a small compatibility guard for FAMILY mode before a matched priority is accepted/marked as used.

Suggested helper:

```js
function isFamilyPriorityCompatible({
  text,
  role,
  priority,
}) {
  ...
}
```

Required rule:

If a priority contains explicit school/work anchors:

```text
đi học
đi làm
về nhà
tan học
tan làm
```

but the current clause does NOT contain any of those anchors,

then that priority is NOT compatible with the current FAMILY beat.

Especially:

```text
interaction clause:
"nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài."

priority:
"câu chuyện nhỏ sau một ngày đi học, đi làm."

=> REJECT priority for this beat
```

Important:

Do NOT mark a rejected priority as used.

It must remain available for a later compatible beat.

Then the explicit school/work beat should be able to receive it.

---

# 8. DO NOT OVER-GENERALIZE PRIORITY MATCHING

Do NOT redesign:

```text
matchedPriority()
```

for all modes.

Do NOT add embeddings.
Do NOT add NLP libraries.
Do NOT add AI calls.

Only add the smallest FAMILY compatibility gate needed to prevent:
- school/work priority attached to non-school/work interaction;
- premature `usedPriorities` consumption.

---

# 9. COMPOSITION SIDE EFFECT

Current `chooseComposition()` switches to:

```text
editorial-left
```

when intent contains:

```text
work bag
keys
notebook
```

After fixing the interaction beat, it should naturally stop choosing `editorial-left`
for that beat unless some legitimate context requires it.

Do NOT modify `chooseComposition()`.

This is an acceptance observation, not a composition task.

Expected for the target interaction beat:

```text
composition = portrait-focus
```

or another existing interaction-safe composition,
but not one selected solely due to work/school contamination.

---

# 10. REQUIRED TESTS

Add focused deterministic tests.

## Test 1 — Generic temporal phrase does NOT trigger work/school

Text:

```text
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Role:

```text
interaction
```

Expected intent/action:

MUST include interaction meaning such as:

```text
listen
speak
react
eye contact
```

MUST NOT contain:

```text
work bag
keys
school notebook
school
work
```

---

## Test 2 — Explicit `đi học, đi làm` still triggers context

Text:

```text
Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Role:

```text
action
```

Expected:
school/work arrival context is still allowed.

---

## Test 3 — Interaction role outranks explicit background context

Text:

```text
Sau khi đi làm về, bố ngồi nghe con kể chuyện ở bàn ăn.
```

Role:

```text
interaction
```

Expected primary visible action:

```text
father listening to child
```

not:

```text
work bag hero shot
```

It is okay if a work bag exists as minor background context,
but it must not be the primary action.

---

## Test 4 — Family priority incompatible with earlier interaction

Clause:

```text
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Priority:

```text
câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Expected:

```text
compatible = false
```

---

## Test 5 — Same priority compatible with explicit school/work beat

Clause:

```text
Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Same priority.

Expected:

```text
compatible = true
```

---

## Test 6 — Rejected priority remains unused

Build a small two-beat sequence:

Beat A:
```text
nghe vài câu chuyện vụn sau một ngày dài
```

Beat B:
```text
câu chuyện nhỏ sau một ngày đi học, đi làm
```

Priority:
```text
câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Expected:
- Beat A does NOT consume priority.
- Beat B receives priority.

---

# 11. VIDEO 001 DRY RUN

Run current Video 001 Story Planner.

Do NOT generate images.

Print only:

## Beat containing

```text
nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.
```

Required AFTER:

```text
storyRole: interaction
visualIntent: interpersonal listening/conversation
visualAction: interpersonal listening/conversation
visualPriority: none OR a compatible interaction priority
presentMembers: unchanged
composition: no workbag/notebook-driven editorial-left
```

Explicitly assert these substrings are absent from BOTH
`visualIntent` and `visualAction`:

```text
work bag
keys
school notebook
```

## Beat containing

```text
Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.
```

Required AFTER:
- school/work context remains valid;
- the corresponding visual priority may attach here.

---

# 12. REGRESSION CHECK

Run the 5-video planner dry run:

```text
001
005
007
013
028
```

Expected:

- beat counts unchanged from Fix 03:
  - 001 = 16
  - 005 = 16
  - 007 = 18
  - 013 = 18
  - 028 = 14
- content mode unchanged;
- cast unchanged;
- world unchanged;
- Fix 03 semantic clause splits unchanged.

This task is semantic action resolution only.

---

# 13. IMPORTANT NON-GOALS

Do NOT fix:

- `dialogue-pair-01` member-key mismatch
- world continuity
- character identity
- SFX round-robin
- question-shot reuse
- style reference generation
- semantic splitter over-fragmentation
- cast composition choices
- actual image model output

Those are separate tasks.

---

# 14. ACCEPTANCE CRITERIA

PASS only if:

1. `sau một ngày` alone no longer triggers school/work imagery.
2. interaction beats prioritize conversation/listening.
3. explicit `đi học/đi làm` still supports school/work imagery.
4. incompatible school/work visual priority is rejected from the earlier interaction beat.
5. rejected priority is not marked used.
6. the same priority is available to the later explicit school/work beat.
7. Video 001 target interaction contains no `work bag`, `keys`, or `school notebook`.
8. Fix 03 beat counts remain unchanged.
9. no unrelated subsystem changes.
10. no image generation/rendering.

---

# 15. FINAL REPORT

Return:

## A. Audit Before

## B. Files Changed

## C. Precedence Rule

## D. Priority Compatibility Rule

## E. Unit Tests

## F. Video 001 Before / After

For both target beats show:

```text
voiceClause
storyRole
visualPriority
visualIntent
visualAction
presentMembers
composition
```

## G. Five-Video Regression

## H. Known Remaining Issues

Explicitly state that:
- character identity;
- world identity;
- relationship member keys;
- SFX;
are NOT handled here.

## I. Verdict

Exactly one:

```text
PARALLEL FIX 04 — FAMILY INTERACTION ACTION PRECEDENCE — PASS
```

or:

```text
PARALLEL FIX 04 — FAMILY INTERACTION ACTION PRECEDENCE — FAIL
```

Then STOP.

Do not start another task.
Do not render images.
Wait for human review.
