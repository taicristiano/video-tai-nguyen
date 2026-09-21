# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — VIDEO005 ATTEMPT 3 FINAL SELECTIVE REGEN
# HUMAN QA OF REAL ATTEMPT-2 IMAGES
# FIX TEMPLATE CONTRACTS FIRST → SELECTIVE FINAL REGEN ONLY
# STOP AT HUMAN QA
# DO NOT RENDER MP4
# MODEL LOCK: @cf/black-forest-labs/flux-1-schnell ONLY

---

# 0. HUMAN REVIEW OF THE REAL ATTEMPT-2 OUTPUT

The REAL Attempt-2 contact sheet and individual images were inspected.

Attempt 2 is a major improvement in STYLE:
- the set is now clearly hand-drawn / illustrated;
- warm ivory / muted earth palette is much closer to HAY & ĐẸP.;
- the systemic semi-photorealistic failure from Attempt 1 is largely fixed.

Do NOT regenerate the whole set again.

However Attempt 2 is NOT production-ready yet.

There are still hard failures in:
- exact visible-people count;
- anatomy;
- text pollution;
- semantic action;
- shot-language contract.

This task is the FINAL bounded generation pass for Attempt-1/2 assets.

---

# 1. HUMAN QA — KEEP VS REGENERATE

## KEEP ATTEMPT-2 CANDIDATES

Do NOT spend another generation attempt on these unless a new source-level contract change makes them unusable:

```text
shot-02
shot-06
shot-07
shot-10
shot-12
shot-14
shot-16
```

These are visually usable candidates in the five locked QA dimensions.

They may require metadata / visual-mode reclassification so that labels truthfully describe their framing.

Do NOT regenerate merely to make a metric prettier.

## FINAL REGEN REQUIRED — ATTEMPT 3

These assets have hard human-visible failures:

```text
shot-01
shot-03
shot-04
shot-05
shot-08
shot-09
shot-11
shot-13
shot-15
```

For shots 01/03/04/05/08/09/11/13/15:
- Attempt 1 already consumed.
- Attempt 2 already consumed.
- Next real generation is Attempt 3.
- Attempt 3 is the final model-generation attempt.

HTTP 429 still does NOT consume the attempt.

No model switching.

---

# 2. EXACT HUMAN QA FINDINGS

## shot-01 — REGEN

Observed:
- style now good;
- 2 people count is correct;
- BUT image contains a large speech bubble with pseudo-text;
- labeled WIDE but visually reads as a tight two-person conversation frame.

Failures:

```text
TEXT_POLLUTION = FAIL
SHOT_LANGUAGE_FIDELITY = FAIL
```

Attempt-3 target:

```text
true environmental WIDE
2 people smaller in frame
substantial living-room context
NO speech bubble
NO text
NO dialogue balloon
NO captions
```

---

## shot-03 — REGEN

Contract:

```text
REACTION_CLOSE
visiblePeople = exactly 1 listener
```

Observed:
- TWO visible people;
- framing is still a two-person conversation, not a clean single reaction close.

Failures:

```text
PEOPLE_CONTRACT = FAIL
SHOT_LANGUAGE_FIDELITY = FAIL
```

Attempt-3 target:

```text
exactly ONE listener
head / shoulders / upper torso dominant
other participant completely absent
no body fragment
no reflection
no portrait of another person
```

---

## shot-04 — REGEN

Observed:
- 2-person medium composition is usable;
- BUT generated readable/gibberish sentence text;
- visible signature-like mark at bottom.

Failure:

```text
TEXT_POLLUTION = FAIL
```

Attempt-3 target:
same interaction meaning, but:

```text
NO speech bubble
NO quote
NO visible writing
NO signature
NO pseudo-text
```

---

## shot-05 — REGEN

Contract:

```text
ACTION_DETAIL
verb = đặt
phone placed face-down / put away
visible people <= 1
```

Observed:
- phone is still being HELD in both hands;
- action is opposite the requested end state;
- a second human portrait appears as a floating inset/bubble;
- not a clean object/hand detail.

Failures:

```text
SEMANTIC_FIDELITY = FAIL
PEOPLE_CONTRACT = FAIL
SHOT_LANGUAGE_FIDELITY = FAIL
```

Attempt-3 target:

```text
DETAIL INSERT
wooden coffee table dominates
one hand has JUST RELEASED a simple phone face-down on the table
fingers are no longer gripping the phone
phone rests flat on wood
screen not visible
no second person
no portrait
no face bubble
no reflection
no text
```

---

## shot-08 — REGEN

Contract:

```text
exactly 1 visible person
REACTION_CLOSE
```

Observed:
- second person/body is present;
- second body has no head / severe anatomy defect.

Failures:

```text
PEOPLE_CONTRACT = FAIL
ANATOMY = FAIL
SHOT_LANGUAGE_FIDELITY = FAIL
```

Attempt-3 target:
exactly ONE primary listener close reaction.

---

## shot-09 — REGEN

Contract:

```text
exactly 1 visible person
```

Observed:
- TWO visible people;
- background contains readable pseudo-text/label ("TEILE"-like text).

Failures:

```text
PEOPLE_CONTRACT = FAIL
TEXT_POLLUTION = FAIL
```

Attempt-3 target:
exactly ONE visible listener, no second back-of-head/body, no labels/writing anywhere.

---

## shot-11 — REGEN

Contract:

```text
exactly 1 visible listener
REACTION_CLOSE
```

Observed:
- second human body appears;
- body has no head / severe anatomy corruption.

Failures:

```text
PEOPLE_CONTRACT = FAIL
ANATOMY = FAIL
```

Attempt-3 target:
exactly one visible person only.

---

## shot-13 — REGEN + PREFLIGHT BUG

Current metadata:

```text
visiblePeopleContract = 1..1
visibleMembers = [speaker]
```

but current `visualAction` says:

```text
"Two people seated peacefully..."
```

Yet preflight incorrectly reports:

```text
peopleContradiction = false
```

This is a SOURCE BUG.

Observed image contains two people.

Failures:

```text
PROMPT_PREFLIGHT = FAIL
PEOPLE_CONTRACT = FAIL
```

For stronger shot-language diversity, DO NOT default to another person close.

Preferred generalized semantic treatment for this abstract reflection beat:

```text
OBJECT_DETAIL
0 visible people
two ceramic cups on the table
phone resting face-down and unused
warm quiet room traces
no humans
```

Only use this if the rebuilt REAL planner selects it semantically.

Do not hard-code shot-13 in reusable template logic.

---

## shot-15 — REGEN

Contract:

```text
EMPTY_RELEASE
RELEASE
visiblePeople = 0..0
```

Observed:
TWO people are visible.

This is a hard contract failure.

Failures:

```text
PEOPLE_CONTRACT = FAIL
SEMANTIC_FIDELITY = FAIL
SHOT_LANGUAGE_FIDELITY = FAIL
```

Attempt-3 target:

```text
EMPTY RELEASE
empty sofa
two ceramic cups remaining on wooden table
soft evening window light
quiet lived-in room
ZERO people
ZERO hands
ZERO body parts
ZERO reflections
ZERO portraits/photos of people
```

---

# 3. FIX SOURCE BUG — VISUAL MODE MUST TRUTHFULLY MATCH SCALE

Attempt-2 metadata has contradictions such as:

```text
ENVIRONMENT_WIDE + MEDIUM
REACTION_CLOSE + MEDIUM
```

Examples include current shot-02 / shot-06 / shot-07 / shot-10 / shot-12.

Do NOT regenerate good images merely because metadata is mislabeled.

Fix the reusable visual-mode taxonomy so mode and actual planned scale agree.

Add a reusable medium single-person mode if necessary:

```ts
SOLO_MEDIUM
```

Final generic modes may include:

```ts
ENVIRONMENT_WIDE
INTERACTION_MEDIUM
SOLO_MEDIUM
REACTION_CLOSE
ACTION_DETAIL
OBJECT_DETAIL
EMPTY_RELEASE
GROUP_WIDE
```

Required invariants:

```text
ENVIRONMENT_WIDE -> WIDE
GROUP_WIDE       -> WIDE

INTERACTION_MEDIUM -> MEDIUM
SOLO_MEDIUM        -> MEDIUM

REACTION_CLOSE -> CLOSE

ACTION_DETAIL -> DETAIL
OBJECT_DETAIL -> DETAIL

EMPTY_RELEASE -> RELEASE
```

Validation must reject a plan where visualMode and planner scale contradict.

Do NOT alternate modes mechanically.

Semantic meaning decides the mode first.

---

# 4. FIX AUDIT BUG — RENDERER SCALE IS CURRENTLY REPORTED WRONG

In Attempt-2 build script, code calls:

```js
mapPlannerScaleToRendererScale(b.scale)
```

but the function signature expects:

```js
mapPlannerScaleToRendererScale({
  scale,
  silhouette,
  role
})
```

This makes `rendererScale` in `prompt-contract-audit.json` incorrectly appear as `medium` for every shot.

Fix:

```js
const rendererScale = mapPlannerScaleToRendererScale({
  scale: b.scale,
  silhouette: b.silhouette,
  role: b.storyRole,
});
```

Then assert:

```js
rendererScale === b.shotScale
```

for every production beat.

Do NOT let audit metadata lie.

---

# 5. FIX PREFLIGHT — EXACT PEOPLE COUNT, NOT ZERO-ONLY

Current action preflight catches mainly zero-people contradictions.

That is insufficient.

It failed to catch:

```text
visiblePeopleContract = 1..1
visualAction = "Two people seated..."
```

Implement reusable exact-count action/prompt validation.

## exactly 0

Final FULL prompt must not positively instruct:
- person/people;
- speaker/listener;
- woman/man;
- hands/body/face;
- human portrait/reflection.

Negative phrases like "NO people" are allowed.

## exactly 1

Reject positive language such as:

```text
two people
both people
speaker and listener
the other person is visible
two faces
```

Also reject more than one requested visible member.

## exactly 2

Require exactly two visible roles when roles are explicit.

No third/background people.

---

# 6. FIX ROLE CONSISTENCY

Current shot-08 has:

```text
visibleMembers = [speaker]
```

while visualAction describes:

```text
listener ...
```

Preflight does not catch this.

Add:

```ts
validateVisibleRoleContract({
  visibleMembers,
  visualAction,
  peopleContract
})
```

When explicit role names are used in visualAction:
- they must belong to `visibleMembers`;
- hidden story participants must not be requested visually.

Do not confuse:

```text
storyParticipants
```

with:

```text
visibleMembers
```

---

# 7. PREFLIGHT MUST VALIDATE THE FULL FINAL PROMPT

Do not validate only `visualAction`.

After final prompt construction, validate the complete positive prompt.

This is mandatory because raw narration / scene meaning / cast context can reintroduce people or text-related cues.

Before each Schnell call:

```ts
validateFinalImagePromptContract({
  prompt,
  visualMode,
  peopleContract,
  visibleMembers,
  visualVerb,
})
```

If invalid:

```text
DO NOT CALL SCHNELL
PROMPT_CONTRACT_BLOCKED
```

---

# 8. ZERO-PEOPLE PROMPT MUST BE VISUAL-ONLY

For:

```text
peopleContract = 0..0
```

DO NOT place the raw narration sentence in the image prompt when that narration contains human concepts such as:

```text
người khác
speaker
listener
person
people
```

Instead use only the resolved visual semantic:

```text
Quiet living-room aftermath...
```

The final positive prompt for a zero-person beat must not contain positive human references.

PEOPLE LOCK should appear near the top:

```text
PEOPLE LOCK:
ZERO visible people anywhere.
NO hands.
NO arms.
NO body parts.
NO silhouettes.
NO reflections of people.
NO framed portraits/photos containing people.
```

---

# 9. EXACT-ONE PEOPLE LOCK MUST BE MUCH STRONGER

For 1..1:

```text
PEOPLE LOCK:
EXACTLY ONE human figure total in the entire image.
No second person.
No partial second body.
No extra head.
No back-of-head.
No cropped person at frame edge.
No human reflection.
No human photo/portrait in the background.
No floating face/inset portrait.
```

Place this BEFORE world/style details.

This addresses the actual Attempt-2 failures in shots 03/05/08/09/11/13.

---

# 10. TEXT POLLUTION — EXPLICITLY BAN SPEECH BUBBLES

Attempt 2 generated text despite generic `NO WORDS`.

Add strong reusable exclusions:

```text
NO speech bubbles.
NO dialogue balloons.
NO thought bubbles.
NO quotation text.
NO captions.
NO subtitles.
NO signs.
NO labels.
NO signatures.
NO decorative writing.
NO pseudo-writing.
```

For conversation images:
describe body language only.

Do NOT ask the model to depict spoken words.

---

# 11. PUT SCALE CONTRACT EARLY IN THE PROMPT

Scale/framing contract should appear before world/style prose.

Recommended final prompt order:

```text
1. VISUAL MODE + SHOT SCALE LOCK
2. PEOPLE LOCK
3. ACTION
4. SCENE VISUAL MEANING
5. WORLD
6. STYLE LOCK
7. TEXT / SAFETY EXCLUSIONS
```

This gives Schnell the high-priority geometry first.

## CLOSE

```text
ONE primary face / head / shoulders dominates roughly 55–75% of visual attention.
Minimal environment.
```

## DETAIL

```text
hands/object action dominates roughly 65–80% of visual attention.
No full seated conversation.
No full faces unless absolutely required.
```

## WIDE

```text
room/environment dominates visual area.
people are visibly smaller.
show substantial furniture/spatial context.
```

## EMPTY_RELEASE

```text
environment only.
zero humans.
```

---

# 12. PHONE ACTION CONTRACT — FINAL ATTEMPT

For a "put phone away / đặt điện thoại xuống" beat:

Do NOT merely write:

```text
placing phone
```

Use an end-state description:

```text
The smartphone is already resting FACE-DOWN and FLAT on the wooden table.
One hand has just released it and is moving away.
No fingers are wrapping around the phone.
Phone is NOT held.
Screen is NOT visible.
```

Preflight should reject:
- hold;
- holding;
- gripping;
- phone in hand;
when required visual state is PUT_AWAY / PLACED_DOWN.

---

# 13. REBUILD VIDEO005 PLAN — TEMPLATE LEVEL

Run the real production planner after fixes.

Do NOT patch shot IDs manually.

The resulting plan should have:
- truthful visualMode ↔ scale pairing;
- no action/people role contradictions;
- enough visual rhythm.

For a ~16-shot dialogue/reflection video, do not allow one mode to dominate purely because the content is dialogue.

Healthy semantic variety should emerge from:

```text
environment wide
interaction medium
solo medium action/listening
reaction close
object/action detail
empty release
```

Do NOT optimize for exact counts.

But warn if one visual mode exceeds ~50% of a plan with >= 12 shots.

---

# 14. ATTEMPT-3 GENERATION — SELECTIVE ONLY

After offline preflight passes:

Generate ONLY the hard-fail slots:

```text
01
03
04
05
08
09
11
13
15
```

These are Attempt 3.

Do NOT regenerate:

```text
02
06
07
10
12
14
16
```

unless the rebuilt template makes an existing image semantically invalid.

If an existing good Attempt-2 image remains semantically compatible:
reuse it.

Semantic correctness > regenerate-everything.

---

# 15. ATTEMPT BUDGET

For the 9 selected slots:

```text
Attempt 3 = FINAL model attempt.
```

If Attempt 3 still fails:
- no Attempt 4;
- use deterministic local cleanup ONLY for isolated text/logo/small artifact defects;
- major people/anatomy/semantic failures become `BLOCKED_ASSET`.

HTTP 429:
- `PAUSED_QUOTA`;
- does not consume attempt.

Do NOT switch away from Schnell.

---

# 16. NO AUTO PASS

New Attempt-3 images start:

```text
PENDING_VISUAL_QA
qa = null
```

Kept Attempt-2 candidates should remain separately marked:

```text
KEEP_CANDIDATE_ATTEMPT2
```

until the combined final contact sheet is reviewed.

Do not claim final PASS before human review.

---

# 17. FINAL COMBINED REVIEW PACK

Create:

```text
scratch/video005-production/final-candidate/
```

using:
- kept Attempt-2 images;
- new Attempt-3 images.

Required:

```text
review-manifest.json
contact-sheet.jpg
shot-language-strip.jpg
prompt-contract-audit.json
visual-mode-audit.json
attempt-lineage.json
```

Each card:
- shot id;
- attempt used;
- scale;
- visualMode;
- silhouette;
- visiblePeopleContract;
- visualVerb;
- QA state.

---

# 18. REQUIRED TESTS

Add tests proving:

1. visualMode ↔ scale invariant;
2. `SOLO_MEDIUM` maps to MEDIUM if added;
3. incorrect `mapPlannerScaleToRendererScale(string)` usage is gone;
4. audit rendererScale equals production `shotScale`;
5. exact-one contract rejects "two people";
6. exact-one contract rejects speaker+listener visible together;
7. role mismatch (`visibleMembers=speaker`, action=listener) is blocked;
8. final full prompt is validated, not action only;
9. zero-person full positive prompt contains no positive human references;
10. exact-one PEOPLE LOCK bans second/cropped/reflected/portrait humans;
11. speech bubbles / dialogue balloons explicitly forbidden;
12. phone placed-down contract rejects held phone wording;
13. EMPTY_RELEASE prompt has no raw human narration leakage;
14. visual mode dominance warning works;
15. selective Attempt-3 list honors attempt budget.

Run full repository tests.

---

# 19. FINAL REPORT FORMAT

Return exactly:

## A. Attempt-2 Human QA
Report:
- style improvement;
- exact 9 hard-fail shots;
- exact reasons.

## B. Template Fixes
Show:
- mode/scale invariant;
- people-count preflight;
- role consistency;
- full-prompt validation;
- text-bubble safety;
- phone end-state contract.

## C. Rebuilt Production Plan
Report:
```text
shot count
CPM
visualMode distribution
scale distribution
visiblePeople distribution
warnings
```

## D. Attempt-3 Generation
Report:
```text
requested = 9
generated
429
blocked by preflight
```

## E. Attempt Lineage
For all 16 slots show:
```text
shot -> selected attempt
```

## F. Combined Review Pack
Paths.

## G. QA State
Do NOT report all PASS automatically.

## H. Tests
Exact counts.

## I. Render
Must remain:
```text
0 Remotion renders
0 final MP4
```

## J. Verdict

Exactly one:

```text
HAY & ĐẸP. VIDEO005 FINAL CANDIDATE — READY FOR HUMAN REVIEW
```

or

```text
HAY & ĐẸP. VIDEO005 ATTEMPT 3 — PAUSED_QUOTA
```

or

```text
HAY & ĐẸP. VIDEO005 FINAL CANDIDATE — BLOCKED
```

Then STOP.

DO NOT RENDER MP4.
