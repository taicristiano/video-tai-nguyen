# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A VALIDATION
# CLEAN ASSET PILOT ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell
# NO IDENTITY CONSISTENCY REQUIREMENT

## CONTEXT

Human review found that the current V3.4A pilot is NOT visually valid because the source images themselves are broken / inconsistent / semantically wrong.

Important clarification:

```text
We do NOT require the same father/mother/child identity across images.
We only require EACH INDIVIDUAL IMAGE to be clean and usable.
```

Production image acceptance priority:

```text
1. correct basic scene meaning
2. correct visible people count
3. no severe anatomy defect
4. no pseudo-text / fake signature / watermark
5. acceptable TARGET_EDITORIAL_2D style
```

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Do NOT use any other model.
Do NOT introduce FLUX.2.
Do NOT attempt identity locking.
Do NOT revisit canonical-family work.

V3.4A motion engine itself is retained for now.
This task only creates a visually valid pilot asset set so the motion pilot can be judged honestly.

---

# 1. SINGLE GOAL

Create a CLEAN six-shot source-asset set for the existing V3.4A 20–30 second pilot, then rerender the SAME motion pilot.

This is NOT image-model research.

This is a production acceptance gate:

```text
bad image -> reject
clean image -> use
```

---

# 2. HARD SCOPE LOCK

Allowed:
- one isolated pilot asset-generation / validation script;
- scratch pilot images;
- pilot-only asset manifest;
- rerender of the existing short V3.4A pilot.

Do NOT modify:
- story planner;
- subtitle alignment;
- SFX;
- motionGrammar.ts;
- production image generator;
- production manifests;
- cast registry;
- world registry;
- production video content.

No full video render.

---

# 3. SOURCE OF TRUTH FOR THE SIX PILOT SHOTS

Use the ACTUAL six visual units currently rendered by the V3.4A pilot.

Do NOT invent six new scenes.

Before generation, produce a table:

```text
pilotShotIndex
sourceSceneOrBeatId
storyRole
voice/narration clause
current visual intent
current people contract
```

This table is mandatory because previous reporting mixed:
- 16 story beats;
- 6 larger rendered pilot scenes.

We need to know exactly what the six rendered visual units are.

If this mapping cannot be grounded from the current code/manifests:

```text
V3.4A CLEAN ASSET PILOT — BLOCKED_SOURCE_MAPPING
```

and STOP.

---

# 4. IMAGE POLICY

For each of the six pilot shots:

```text
max 3 generation attempts
```

Use the current proven Style-First prompt geometry.

Do NOT research new prompt strategies.
Do NOT run A/B prompt experiments.
Do NOT change model.

The prompt may include only the current:
- style lock;
- concrete scene meaning;
- people count;
- basic world context;
- framing.

Keep it simple.

---

# 5. NO IDENTITY CONSISTENCY

Explicitly:

```text
father in shot A does NOT need to match father in shot B
mother does NOT need to match across scenes
child does NOT need to match across scenes
```

Do NOT reject an image because recurring characters look different.

Do NOT add identity QA.

---

# 6. HARD QA PER IMAGE

Each generated image must pass ALL five:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

## STYLE

PASS if it is clearly usable editorial 2D / hand-drawn HAY & ĐẸP. visual.

Do not over-police tiny stylistic variation.

FAIL only for obvious drift such as:
- photorealistic;
- 3D;
- anime/chibi;
- unusable corporate vector.

## PEOPLE_CONTRACT

PASS only if requested visible people count is respected.

Examples:
- zero-person shot => absolutely no visible human / body fragment;
- one-person shot => exactly one visible person;
- if current six-shot pilot genuinely requires more people, use the current contract but do not require identity consistency.

## SEMANTIC_FIDELITY

The image must depict the intended action or object.

Examples:
- narration says phone is put aside => image must NOT show the phone being actively used;
- school/work object scene => must visibly read as school/work trace;
- simple meal => must visibly read as simple meal/tableware.

Do not accept generic “family lifestyle” imagery if the action is wrong.

## ANATOMY

FAIL only on clear defects:
- detached limb;
- missing torso;
- duplicate arm;
- headless body;
- severe hand/body connection error;
- impossible body structure.

Tiny finger imperfections may pass if not visually distracting.

## TEXT_POLLUTION

FAIL on any visible:
- fake signature;
- pseudo-writing;
- watermark-like mark;
- random word/glyph;
- fake account handle.

---

# 7. ATTEMPT RULE

For each shot:

```text
Attempt 1
→ QA
→ PASS: select immediately
→ FAIL: Attempt 2
→ PASS: select immediately
→ FAIL: Attempt 3
→ PASS: select
→ FAIL: BLOCKED
```

No Attempt 4.

No changing prompt between attempts except correcting an implementation bug.

No cherry-picking after first PASS.

---

# 8. STOP RULE

If any of the six pilot shots fails all three attempts:

```text
V3.4A CLEAN ASSET PILOT — BLOCKED_ASSET
```

STOP.

Do NOT:
- start prompt tuning;
- switch model;
- simplify scene automatically;
- render the pilot with a failed image.

Return the exact blocked shot and failure reasons for human review.

---

# 9. PILOT-ONLY MANIFEST

If all six shots pass, save selected assets under:

```text
scratch/v34/clean-asset-pilot/assets/
```

Create:

```text
scratch/v34/clean-asset-pilot/pilot-assets.json
```

For each selected asset:

```json
{
  "pilotShotIndex": 0,
  "sourceSceneOrBeatId": "...",
  "selectedAttempt": 1,
  "file": "...",
  "qa": {
    "style": "PASS",
    "peopleContract": "PASS",
    "semanticFidelity": "PASS",
    "anatomy": "PASS",
    "textPollution": "PASS"
  }
}
```

Do not change production asset references.

---

# 10. RERENDER THE SAME V3.4A PILOT

Only after all six selected assets pass.

Use the SAME:
- motion grammar;
- timings;
- text;
- subtitles;
- hard cuts;
- six-shot pilot span.

Only swap pilot asset references.

Save:

```text
scratch/v34/clean-asset-pilot/video001-motion-clean-assets.mp4
```

Do not change motion code.

---

# 11. REPRESENTATIVE FRAMES

Export:

```text
frame-shot-01.png
frame-shot-02.png
frame-shot-03.png
frame-shot-04.png
frame-shot-05.png
frame-shot-06.png
```

One representative frame per pilot shot.

Create:

```text
contact-sheet-clean-assets.jpg
```

2 × 3 layout.

External labels only.

---

# 12. REPORT

Return:

## A. Six-Shot Source Mapping

## B. Generation Settings

Confirm:

```text
model = @cf/black-forest-labs/flux-1-schnell
identity consistency = NOT REQUIRED
```

## C. Attempt Table

```text
shot
attempt
style
people
semantic
anatomy
text
overall
reason
```

## D. Selected Asset Table

## E. Clean Asset Contact Sheet Path

## F. Rerendered Pilot Path

## G. Human Review Notes

State explicitly that this task only validates source-image cleanliness.
Do not declare V3.4 motion quality PASS automatically.

## H. Verdict

Exactly one:

```text
V3.4A CLEAN ASSET PILOT — PASS
```

or:

```text
V3.4A CLEAN ASSET PILOT — BLOCKED_ASSET
```

or:

```text
V3.4A CLEAN ASSET PILOT — BLOCKED_SOURCE_MAPPING
```

Then STOP.

Do NOT start V3.4B automatically.
Wait for human review.
