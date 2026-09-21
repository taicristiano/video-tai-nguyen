# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — VIDEO005 ATTEMPT 2
# HUMAN VISUAL QA FINDINGS → TEMPLATE-LEVEL SHOT LANGUAGE + STYLE FIX
# REGENERATE PRODUCTION IMAGES
# STOP AT HUMAN QA — DO NOT RENDER MP4
# IMAGE MODEL LOCK: @cf/black-forest-labs/flux-1-schnell ONLY

---

# 0. HUMAN REVIEW OVERRIDES THE PREVIOUS "READY" REPORT

Attempt 1 was inspected visually from the REAL contact sheet and individual images.

Do NOT treat "15/15 generation succeeded" as visual success.

The actual Attempt-1 output has SYSTEMIC visual failures:

## SYSTEMIC FAILURE 1 — STYLE

Most generated assets are semi-photorealistic / realistic rendered people.

Locked HAY & ĐẸP. style is:

```text
clean 2D cartoon / illustrated editorial
obvious drawn linework
simplified shapes
matte illustrated fills
non-photorealistic
```

Attempt 1 does NOT satisfy this.

One later frame is much more clearly illustrated, which makes the sequence internally inconsistent.

This is a systemic prompt/style failure.

## SYSTEMIC FAILURE 2 — SHOT LANGUAGE LABELS ARE NOT VISIBLE IN THE IMAGES

The planner labels contain:

```text
WIDE
MEDIUM
CLOSE
DETAIL
RELEASE
```

but many generated images still look like nearly the same:

```text
two people seated on a sofa
medium conversational framing
```

Examples from real output:

- `shot-01` is labeled `WIDE`, but the image reads much closer to a medium two-shot.
- `shot-03` is labeled `CLOSE`, but still shows both people, furniture and table as a fairly wide conversational frame.
- `shot-05` is labeled `DETAIL`, but is still a full two-person sofa scene.
- several `CLOSE` shots are again two-person medium compositions.
- `shot-15` is labeled `RELEASE / empty-space / 0 people`, but the image contains TWO people.

The reference-derived grammar therefore exists in metadata but is not yet strongly visible in production output.

## SYSTEMIC FAILURE 3 — CONCRETE ACTION IS TOO GENERIC

Many beats still use generic action text similar to:

```text
Two recurring people engage in direct conversation...
```

This produces repetitive images.

Reference-derived grammar requires:

```text
specific visible action
specific object
specific reaction
environmental release
```

not repeated "two people talking".

## HARD SEMANTIC FAILURES OBSERVED

### shot-05

Expected:

```text
listener puts phone away / places phone down
DETAIL
```

Actual image:
a person is visibly HOLDING the phone.

This is the opposite semantic action.

### shot-11

Semantic/action contract includes:

```text
phone put away
```

Actual image:
the phone is prominently visible in hand.

FAIL.

### shot-15

Planner contract:

```text
RELEASE
empty-space
peopleContract = 0..0
```

Actual image:
two visible people talking.

FAIL PEOPLE_CONTRACT + SEMANTIC_FIDELITY.

---

# 1. QA STATUS FOR ATTEMPT 1

Update review manifest honestly.

Attempt-1 generated assets must NOT remain merely "PENDING" after human review.

For the production image set:

```text
STYLE:
systemic fail on realistic / semi-photorealistic images

PEOPLE_CONTRACT:
shot-15 hard fail

SEMANTIC_FIDELITY:
shot-05 hard fail
shot-11 hard fail
shot-15 hard fail

TEXT_POLLUTION:
no major visible text pollution observed in the reviewed set
```

Mark all slots requiring regeneration as:

```text
NEEDS_REGEN
```

Do NOT locally raster-clean these failures.
They are not localized defects.

---

# 2. FIX THE ROOT MODEL: STORY PARTICIPANTS != VISIBLE PEOPLE IN THIS SHOT

This is the most important planner correction.

A dialogue may involve:

```text
storyParticipants = [speaker, listener]
```

but every visual shot does NOT need to show both participants.

Create/separate concepts:

```ts
storyParticipants: string[];

visibleMembers: string[];

visiblePeopleContract: {
  min: number;
  max: number;
};
```

Do NOT automatically make:

```text
two dialogue participants
→ exactly two visible people in every shot
```

That is what prevents real CLOSE / DETAIL / RELEASE shots.

Examples:

## interaction medium

```text
storyParticipants = speaker + listener
visibleMembers = speaker + listener
visiblePeopleContract = 2..2
```

## listener reaction close

```text
storyParticipants = speaker + listener
visibleMembers = listener
visiblePeopleContract = 1..1
```

## phone detail insert

```text
storyParticipants = speaker + listener
visibleMembers = listener
visiblePeopleContract = 1..1
```

or, when only the hand/object is visible:

```text
visiblePeopleContract = 1..1
silhouette = hands-detail
```

## environmental release

```text
storyParticipants = speaker + listener
visibleMembers = []
visiblePeopleContract = 0..0
silhouette = empty-space
```

This must be TEMPLATE-LEVEL behavior for future dialogue videos.

---

# 3. ADD VISUAL MODE — STORY MEANING BEFORE SCALE LABEL

Introduce a reusable semantic visual mode.

Example:

```ts
type VisualMode =
  | 'ENVIRONMENT_WIDE'
  | 'INTERACTION_MEDIUM'
  | 'REACTION_CLOSE'
  | 'ACTION_DETAIL'
  | 'OBJECT_DETAIL'
  | 'EMPTY_RELEASE'
  | 'GROUP_WIDE';
```

Mapping conceptually:

```text
ENVIRONMENT_WIDE
→ WIDE
→ show environment + participants

INTERACTION_MEDIUM
→ MEDIUM
→ visible interaction/action

REACTION_CLOSE
→ CLOSE
→ usually ONE visible participant reaction

ACTION_DETAIL
→ DETAIL
→ hand/object/action dominates frame

OBJECT_DETAIL
→ DETAIL
→ zero people or limited hand presence

EMPTY_RELEASE
→ RELEASE
→ zero people

GROUP_WIDE
→ WIDE
→ family/group context
```

Shot scale must be a consequence of the visual mode/meaning.

Do not just alternate WIDE/MEDIUM/CLOSE metadata.

---

# 4. TEMPLATE-LEVEL VISUAL MODE DIVERSITY GATE

For narrative videos around 40–60 seconds, require healthy semantic visual diversity.

Do NOT hard-code a precise shot order.

But require at least 4 distinct visual-mode families when semantically possible.

For dialogue/reflection content, the plan should normally include:

```text
environmental wide
interaction medium
reaction close
action/object detail
release
```

Validation warning/error rules:

```text
no >3 consecutive INTERACTION_MEDIUM-like visual modes

DETAIL cannot render as generic full two-person sofa conversation

EMPTY_RELEASE must have visiblePeopleContract = 0..0

REACTION_CLOSE should normally have <=1 primary visible person

WIDE must expose meaningful environment
```

Use story meaning first.

---

# 5. FIX VISUAL ACTION AUTHORING

`visualAction` must be concrete enough to paint.

Generic fallback such as:

```text
Two recurring people engage in direct conversation with responsive posture and eye contact.
```

may only be used when the narration genuinely has no stronger physical cue.

When a concrete visual priority or verb exists, it MUST win.

Examples:

## verb = đặt / phone

Bad:

```text
two people talk
```

Good:

```text
The listener places a black phone face-down on the wooden coffee table,
then turns their body toward the speaker.
The speaker remains visible only as contextual presence.
```

## silence / no interruption

Good:

```text
The listener sits still with relaxed hands,
phone absent,
maintains attentive eye contact,
allowing the speaker to finish.
```

## asks before advising

Good:

```text
The listener leans slightly forward with an open palm,
pauses before speaking,
inviting the other person to continue.
```

## release

Good:

```text
Quiet living-room aftermath:
two ceramic cups remain on the table,
soft evening light,
empty sofa,
no people.
```

---

# 6. ADD ACTION-CONTRACT VALIDATION

Before calling Schnell, validate the final prompt payload.

## Zero people contradiction

If:

```text
visiblePeopleContract = 0..0
```

then final:

```text
visualAction
semanticIntent
prompt
```

must NOT instruct:
- two people;
- speaker;
- listener;
- hands;
- person.

If conflict:

```text
PROMPT_PEOPLE_CONTRADICTION
```

Do not call the model.

## Concrete verb evidence

If a beat contains a concrete verb/object such as:

```text
đặt phone
gập blanket
cầm cup
tắt lamp
```

the final `visualAction` must preserve the key object/action.

Do not reduce it to `symbolic-detail`.

---

# 7. STRENGTHEN THE LOCKED 2D STYLE PROMPT

Attempt 1 shows the current "Premium warm editorial 2D illustration" wording is not strong enough for Schnell.

Update the reusable STYLE LOCK.

Use positive illustration-native instructions:

```text
STYLE LOCK — HAY & ĐẸP.

Clearly hand-drawn 2D editorial illustration.
Obvious charcoal/sepia outline around characters, hands, furniture and objects.
Simplified facial features.
Simplified grouped hair shapes, NOT individual realistic hair strands.
Matte painted / flat gouache-like color fills.
Soft simplified illustrated shadows.
Warm ivory / cream background.
Muted sage, warm wood and restrained terracotta accents.
Calm contemporary editorial-cartoon look.
Readable anatomy, simple clean forms.
The result must unmistakably look DRAWN / ILLUSTRATED, not photographed.
```

Add hard exclusions:

```text
NO photorealism.
NO hyperrealism.
NO realistic skin texture or pores.
NO individual realistic hair strands.
NO photographic rendering.
NO cinematic photographic lighting.
NO realistic lens blur.
NO glossy 3D skin.
NO CGI.
NO photo-like human faces.
```

Do not use photographic terminology elsewhere in the positive prompt.

---

# 8. SHOT-SCALE PROMPT CONTRACT MUST BE VISUALLY EXPLICIT

## WIDE

Final prompt must state something equivalent to:

```text
WIDE ENVIRONMENTAL ILLUSTRATION.
Show substantial room context.
Environment occupies roughly half or more of the visual composition.
People are smaller in frame.
Do not crop tightly around faces.
```

## MEDIUM

```text
MEDIUM INTERACTION ILLUSTRATION.
Show upper/lower torso as needed plus the physical action.
Enough environment to understand the context.
```

## CLOSE

Prefer a single primary reaction when story allows:

```text
CLOSE REACTION ILLUSTRATION.
One primary face / shoulders / hands dominates the frame.
Minimal environment.
Do NOT fall back to a full two-person sofa composition.
```

If two people are semantically mandatory:
use a deliberate close interaction / over-shoulder grammar.

## DETAIL

```text
DETAIL INSERT.
The object or hand action dominates at least ~60% of visual attention.
No full seated two-person composition.
Do not show both full faces.
```

## RELEASE

```text
RELEASE / BREATHING FRAME.
Quiet environmental visual.
When peopleContract = 0..0: absolutely no people, hands or body parts.
```

---

# 9. VIDEO005 PLAN MUST BE REBUILT BY THE REAL TEMPLATE PLANNER

Do NOT manually patch shot IDs.

Run the real production planner after the reusable fixes.

For video005, healthy output should visibly contain a MIX such as:

```text
wide environment
medium interaction
single reaction close
phone/hands detail
medium exchange
reaction close
empty environmental release
...
```

Do NOT force these exact counts.

But reject a plan if almost every beat still becomes:

```text
two-person seated conversation
```

Add a human-readable audit:

```text
visual-mode distribution
people-count distribution
scale distribution
silhouette distribution
```

---

# 10. ATTEMPT 2 GENERATION STRATEGY

Because Attempt 1 has a SYSTEMIC STYLE failure, selective regeneration is insufficient.

Regenerate ALL 15 originally generated production images after template fixes.

These are:

```text
Attempt 2 for the 15 generated slots.
```

The previous reused final slot must be re-evaluated.

## shot-16 / final question

Do NOT blindly reuse shot-01 merely for efficiency.

If the final RELEASE/question semantics need a distinct calmer/wider image:
generate a new dedicated shot-16 image.

If generated for the first time:
its attempt count = 1.

Semantic fidelity > reuse.

---

# 11. MODEL / RETRY LOCK

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Attempt rules:

```text
Attempt 1 already consumed for original generated assets.
Attempt 2 is the next call after fixes.
Max 3 real attempts.
HTTP 429 does NOT consume attempt.
No model switching.
```

---

# 12. MACHINE QA IS NOT HUMAN QA

After Attempt 2:

```text
all images = PENDING_VISUAL_QA
qa = null
```

Do NOT auto-PASS.

Generate new:

```text
scratch/video005-production/attempt-2/
  review-manifest.json
  contact-sheet.jpg
  shot-language-strip.jpg
  prompt-contract-audit.json
  visual-mode-audit.json
```

Contact sheet:
- full images;
- object-fit contain;
- readable labels;
- no crop.

---

# 13. PROMPT CONTRACT AUDIT BEFORE EACH MODEL CALL

For each shot store/check:

```json
{
  "shotId": "...",
  "visualMode": "...",
  "plannerScale": "...",
  "rendererScale": "...",
  "visiblePeopleContract": {"min":0,"max":0},
  "visibleMembers": [],
  "visualVerb": "...",
  "visualAction": "...",
  "styleLockPresent": true,
  "scaleContractPresent": true,
  "peopleContradiction": false,
  "actionContradiction": false
}
```

If contradiction is true:
DO NOT call Schnell for that slot.

---

# 14. HUMAN QA DIMENSIONS REMAIN LOCKED

Human review uses:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Additionally report:

```text
SHOT_LANGUAGE_FIDELITY
```

as a diagnostic dimension because this pass specifically tests the reference-derived grammar.

It does not replace the five production QA dimensions.

---

# 15. ACCEPTANCE FOR ATTEMPT 2 REVIEW PACK

We should be able to look at the contact sheet WITHOUT reading the labels and visually recognize:

```text
wide
medium
close
detail
release
```

If labels say DETAIL but the image still looks like a normal two-person medium shot:
FAIL.

If labels say RELEASE / zero people but people are visible:
FAIL.

If most shots remain photo-like:
FAIL.

---

# 16. DO NOT RENDER VIDEO

Strict:

```text
Remotion final render = 0
MP4 final render = 0
```

Stop at human review pack.

---

# 17. TESTS

Add/update tests for:

1. story participants are separate from visible people;
2. dialogue CLOSE may have one visible member;
3. dialogue DETAIL may have one visible member / hand detail;
4. EMPTY_RELEASE always 0..0 visible people;
5. zero-people visualAction cannot mention people/speaker/listener/hands;
6. concrete visual verb/object survives into visualAction;
7. DETAIL prompt explicitly forbids full two-person composition;
8. CLOSE prompt explicitly creates reaction framing;
9. WIDE prompt requires substantial environment;
10. STYLE prompt contains explicit non-photorealistic drawn-form constraints;
11. visual mode diversity audit works;
12. generic dialogue action cannot dominate most beats when concrete actions exist;
13. shot-05-like "phone put away" prompt cannot instruct holding phone;
14. real attempt manifest increments attempts correctly;
15. 429 does not consume attempt.

Run full repository tests.

---

# 18. FINAL REPORT

Return exactly:

## A. Human Review of Attempt 1
State actual systemic failures:
- style
- shot-language fidelity
- hard semantic failures

## B. Template-Level Fixes
Files and reusable logic.

## C. Video005 New Production Plan
Report:
```text
shot count
CPM
visual-mode distribution
scale distribution
visible-people distribution
```

## D. Attempt 2 Generation
Report:
```text
Schnell calls
attempt-2 count
new shot-16 count if any
429 count
```

## E. Prompt Preflight
Report contradiction count before generation.
Must be 0 for generated calls.

## F. Review Pack
Paths:
```text
attempt-2/contact-sheet.jpg
attempt-2/shot-language-strip.jpg
attempt-2/prompt-contract-audit.json
attempt-2/visual-mode-audit.json
```

## G. QA State
All remain:
```text
PENDING_VISUAL_QA
```

until human review.

## H. Tests
Exact counts.

## I. Remotion
Must be:
```text
0 renders
```

## J. Verdict

Exactly one:

```text
HAY & ĐẸP. VIDEO005 ATTEMPT 2 — READY FOR HUMAN VISUAL REVIEW
```

or

```text
HAY & ĐẸP. VIDEO005 ATTEMPT 2 — BLOCKED
```

or

```text
HAY & ĐẸP. VIDEO005 ATTEMPT 2 — PAUSED_QUOTA
```

Then STOP.

DO NOT RENDER MP4.
