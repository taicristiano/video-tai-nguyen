# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3B-S.4
# SINGLE GOAL: SCHNELL CAPABILITY ROUTER ONLY
# NO IMAGE GENERATION

## CONTEXT

Empirical results now show a clear capability boundary for:

```text
@cf/black-forest-labs/flux-1-schnell
```

Observed tests:

```text
V3.3B-S.1:
STYLE-FIRST prompt geometry
→ 8/8 stable TARGET_EDITORIAL_2D

V3.3B-S.2:
exact people contract
→ 1/8 pass

V3.3B-S.3:
literal numbered human slots
→ 0/8 pass
→ style still 8/8 preserved
```

The failure is therefore no longer primarily STYLE.

The current production requirement is too strict for prompt-only Schnell on:
- mixed adult + child compositions;
- 3-person / 4-person family compositions;
- exact role binding across multiple people.

Per the S.3 decision rule:

> STOP micro-tuning multi-person prompts.

This task has ONE GOAL ONLY:

> Add an isolated capability router that classifies each Story Beat by whether it is safe for Schnell generation, should reuse a canonical asset, or requires a future simplification/stronger-model path.

Do NOT rewrite story semantics yet.
Do NOT integrate into production yet.
Do NOT generate images.
Do NOT render MP4.

---

# 1. HARD SCOPE LOCK

Allowed new file:

```text
scripts/test-hay-dep-schnell-capability-router.mjs
```

Optional focused test file:

```text
src/schnell-capability-router.test.ts
```

Allowed output directory:

```text
scratch/v33/schnell-capability-router/
```

Do NOT modify:

```text
scripts/human-insight-image.mjs
scripts/batch-engine.mjs
scripts/human-insight-story-planner.mjs
```

Do NOT modify:
- cast registry;
- world presets;
- subtitle;
- SFX;
- Remotion;
- production manifests/assets.

No Cloudflare calls.

---

# 2. ROUTER OUTPUT CONTRACT

Create a pure exported helper:

```js
routeSchnellBeat({
  beat,
  cast,
})
```

Return exactly one route:

```text
REUSE_CANONICAL
SCHNELL_SAFE
SCHNELL_PAIR_UNPROVEN
SIMPLIFY_OR_CANONICAL
```

Also return:

```js
{
  route,
  reason,
  peopleCount,
  requestedMembers,
  hasChildMember,
}
```

No side effects.

---

# 3. ROUTING PRIORITY

Apply rules in this exact order.

## Rule 1 — Existing canonical strategy wins

If:

```js
beat.assetStrategy === 'reuse-canonical'
```

return:

```text
REUSE_CANONICAL
```

Do not reclassify it.

This preserves Fix 06 behavior.

---

## Rule 2 — No people is safe

If:

```js
beat.needsPeople === false
```

or:

```js
Array.isArray(beat.presentMembers)
&& beat.presentMembers.length === 0
```

return:

```text
SCHNELL_SAFE
```

Reason:

```text
no people / object-environment composition
```

---

## Rule 3 — One requested person is safe

If exactly one visible recurring cast member is requested:

```text
peopleCount === 1
```

return:

```text
SCHNELL_SAFE
```

Reason:

```text
single-person composition
```

This reflects the current production hypothesis that Schnell is suitable for simple 1-person scenes.

Do NOT claim identity lock.

---

## Rule 4 — Solo cast with undefined presentMembers

Some current solo modes may have:

```text
presentMembers === undefined
```

but the cast registry contains exactly one member.

If:

```text
Object.keys(cast.members).length === 1
```

treat:

```text
peopleCount = 1
```

and return:

```text
SCHNELL_SAFE
```

---

## Rule 5 — 3 or more people is NOT Schnell-safe

If:

```text
peopleCount >= 3
```

return:

```text
SIMPLIFY_OR_CANONICAL
```

Reason:

```text
complex multi-person composition; Schnell failed exact role/count binding in S.2/S.3
```

Do not send these beats to Schnell dynamically in a future production router.

---

## Rule 6 — Two people with a child is NOT Schnell-safe

If:

```text
peopleCount === 2
&& hasChildMember === true
```

return:

```text
SIMPLIFY_OR_CANONICAL
```

Reason:

```text
mixed adult-child role binding failed repeatedly in S.2/S.3
```

---

## Rule 7 — Two adults remain unproven

If:

```text
peopleCount === 2
&& hasChildMember === false
```

return:

```text
SCHNELL_PAIR_UNPROVEN
```

Reason:

```text
two-adult composition has not been validated for role/identity fidelity
```

Important:

Do NOT mark it `SCHNELL_SAFE`.

This is a conservative route.

---

# 4. CHILD MEMBER DETECTION

For the CURRENT cast registry, treat these member IDs as child members:

```text
boy
girl
child
son
daughter
```

Case-insensitive.

Also allow description-based fallback:

```text
child
boy
girl
school-age
young child
```

Do not build a large NLP system.

Create a small helper:

```js
isChildCastMember(memberId, description)
```

---

# 5. INVALID MEMBER KEYS

Fix 05 already validates member keys.

The router must NOT silently accept an unknown `presentMembers` ID.

If a requested member does not exist in the cast:

```text
throw
```

with a clear error.

Do not invent demographics for unknown members.

---

# 6. VIDEO 001 DRY RUN

Build the CURRENT Video 001 Story Plan.

For all 16 beats output:

```text
beatId
storyRole
presentMembers
assetStrategy
route
peopleCount
hasChildMember
reason
```

Expected broad behavior:

- existing MEMORY / QUESTION canonical beats remain `REUSE_CANONICAL`;
- family group beats with 3–4 people become `SIMPLIFY_OR_CANONICAL`;
- mother+boy / father+boy style beats become `SIMPLIFY_OR_CANONICAL`;
- no-people release may become `SCHNELL_SAFE`;
- do not force unsupported beats into Schnell.

Create:

```text
scratch/v33/schnell-capability-router/video001-routing.json
```

and:

```text
video001-routing.md
```

---

# 7. FIVE-VIDEO DRY RUN

Run current plans for:

```text
001
005
007
013
028
```

For each report counts:

```text
REUSE_CANONICAL
SCHNELL_SAFE
SCHNELL_PAIR_UNPROVEN
SIMPLIFY_OR_CANONICAL
```

Also report:

```text
total beats
percentage immediately safe/reusable
percentage requiring future redesign
```

Do NOT change beat counts.

Expected beat counts remain:

```text
001 = 16
005 = 16
007 = 18
013 = 18
028 = 14
```

---

# 8. REQUIRED UNIT TESTS

Add deterministic tests.

## Test 1 — no people

```text
needsPeople = false
=> SCHNELL_SAFE
```

## Test 2 — one adult

```text
presentMembers = ['father']
=> SCHNELL_SAFE
```

## Test 3 — solo cast, presentMembers undefined

One-member cast:

```text
=> SCHNELL_SAFE
```

## Test 4 — mother + boy

```text
presentMembers = ['mother', 'boy']
=> SIMPLIFY_OR_CANONICAL
```

## Test 5 — father + mother + boy

```text
3 people
=> SIMPLIFY_OR_CANONICAL
```

## Test 6 — four-person family

```text
father,mother,boy,girl
=> SIMPLIFY_OR_CANONICAL
```

## Test 7 — two adults

Example:

```text
speaker,listener
```

with both descriptions adult:

```text
=> SCHNELL_PAIR_UNPROVEN
```

## Test 8 — canonical always wins

Even if 4 family members:

```text
assetStrategy = reuse-canonical
=> REUSE_CANONICAL
```

## Test 9 — invalid requested member throws

Unknown member ID:

```text
=> throw
```

---

# 9. IMPORTANT NON-GOALS

Do NOT:
- rewrite a 3-person beat into a 1-person beat;
- choose which person to keep;
- generate canonical assets;
- choose a stronger model;
- alter `assetStrategy`;
- modify production pipeline;
- test two-adult image quality;
- generate images.

Those are future separate tasks.

This task only creates the capability classification.

---

# 10. DECISION OUTPUT

Create:

```text
scratch/v33/schnell-capability-router/decision.md
```

It must summarize the evidence-derived policy:

```text
PROVEN:
- Style-first Schnell is stable for editorial 2D rendering.

NOT PROVEN / FAILED:
- exact mixed adult-child binding;
- exact 3+ people role binding;
- identity locking.

ROUTING POLICY:
- canonical reuse remains preferred when available;
- zero/one-person beats are Schnell-safe;
- two-adult beats require a separate validation gate;
- mixed adult-child or 3+ people require simplification/canonical/stronger model.
```

Do not claim mathematical certainty.

---

# 11. ACCEPTANCE CRITERIA

PASS only if:

1. router is pure/deterministic;
2. canonical reuse has highest priority;
3. 0/1-person beats classify safe;
4. 2-person mixed adult-child classifies `SIMPLIFY_OR_CANONICAL`;
5. 3+ people classify `SIMPLIFY_OR_CANONICAL`;
6. 2 adults classify `SCHNELL_PAIR_UNPROVEN`;
7. invalid member IDs fail loudly;
8. 5-video beat counts unchanged;
9. no image generation;
10. no production code modified.

---

# 12. FINAL REPORT

Return:

## A. Scope Confirmation

## B. Capability Rules

## C. Unit Tests

## D. Video 001 Routing Table

## E. Five-Video Route Counts

## F. Decision Summary

## G. Next Architectural Need

State only:

```text
The next separate task is to design how SIMPLIFY_OR_CANONICAL beats are transformed or fulfilled.
```

Do NOT implement that next task automatically.

## H. Verdict

Exactly one:

```text
V3.3B-S.4 SCHNELL CAPABILITY ROUTER — PASS
```

or:

```text
V3.3B-S.4 SCHNELL CAPABILITY ROUTER — FAIL
```

Then STOP.

Wait for human review.
