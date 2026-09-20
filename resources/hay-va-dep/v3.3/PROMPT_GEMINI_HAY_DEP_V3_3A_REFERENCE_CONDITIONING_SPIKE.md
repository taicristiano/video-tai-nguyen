# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. V3.3A — VISUAL IDENTITY REFERENCE-CONDITIONING SPIKE

VERSION LOCK:
We are in **V3.3**, not V4/V5.

Do not rename this round.

## Goal

Current Story Engine is structurally better, but Video 001 still looks like independent AI images:
- art medium changes between semi-realistic and anime/editorial;
- father/mother/children faces change;
- glasses/hair change;
- room changes.

Text-only `castId + worldId + seed` is NOT enough.

This round tests reference-conditioned image generation.

Do NOT:
- render Video 005;
- batch 100;
- polish subtitle/SFX/UI;
- rewrite Story Planner;
- replace the existing text-only generator globally.

Read:
`HAY_DEP_V3_3_VISUAL_IDENTITY_ENGINE_BLUEPRINT.md`

Then execute exactly.

---

# PHASE 0 — AUDIT CURRENT IMAGE PATH

Confirm:

1. `scripts/human-insight-image.mjs` currently uses:
   `@cf/black-forest-labs/flux-1-schnell`

2. Current generation is JSON text-to-image only.

3. Current pipeline has:
   - castId
   - worldId
   - presentMembers
   - seed
   but no reference-image conditioning.

4. Video 001 current output still changes:
   - father glasses/hair/face;
   - mother hairstyle/face;
   - children;
   - room;
   - illustration medium.

Print audit first.

---

# PHASE 1 — ADD ISOLATED REFERENCE GENERATOR

Create:

`scripts/human-insight-reference-image.mjs`

Do NOT modify the old generator yet.

Implement:
- multipart Cloudflare request;
- model switch:
  - `quality` => `@cf/black-forest-labs/flux-2-dev`
  - `fast` => `@cf/black-forest-labs/flux-2-klein-9b`
- up to 4 `input_image_N`;
- seed;
- width/height;
- output path.

Use native `FormData` + `Blob`.

Do NOT manually set multipart Content-Type.

Add:
- syntax check;
- clear API errors;
- no silent fallback to FLUX.1.

---

# PHASE 2 — PREPARE REFERENCES

For Video 001 create:

`videos/<slug>/references/`

Need:
- style-reference.jpg
- cast-reference.jpg
- world-reference.jpg
- reference-manifest.json

## Style reference

Audit local repo for the best earlier V3.2/V3 artwork.

If a previously-approved strong editorial illustration exists locally:
copy it as style reference.

If none exists:
generate exactly 3 style candidates,
create a contact sheet,
choose the single strongest candidate based on:
- editorial 2D
- warm ivory/sage palette
- consistent linework
- no photo-realism
- no anime exaggeration

Do not silently pick without contact sheet evidence.

## Cast reference

Generate a clean family identity sheet:
- father
- mother
- boy
- girl
- neutral composition
- no story action
- no random people
- no text labels inside image

The exact identity description comes from:
`character-casts.json::family-young-01`

## World reference

Generate empty:
`home-family-01`

Must clearly include:
- rectangular medium-oak table
- cream wall
- centered pendant lamp
- camera-left window
- sideboard + sage vase

No people.

---

# PHASE 3 — GENERATE CANONICAL ESTABLISH

Use:
- image0 style
- image1 cast
- image2 world

Generate one canonical dinner establish:

ACTION:
all four family members eating a simple Vietnamese dinner.

This image becomes:
`canonical-establish.jpg`

Do not call it approved automatically.

---

# PHASE 4 — 4-SCENE PROTOTYPE

Using the same references generate:

A. establish
B. interaction: boy tells story, parents listen
C. phone detail: father puts phone away, family in background
D. release: same room after dinner, NO PEOPLE

Generate all four with:

1. `flux-2-dev`
2. `flux-2-klein-9b`

For A/B/C:
use style + cast + world.
For B/C optionally add canonical establish as image3.

For D:
use style + world only.
NO CAST IMAGE.

Total max:
8 prototype outputs.

---

# PHASE 5 — CREATE EVIDENCE

Create:

`qa/v33/contact-sheet-model-compare.jpg`

Also:

`qa/v33/prompts.json`

with for every output:
- model
- seed
- action
- references used
- output path

Create:
`qa/v33/v33-evaluation.md`

Evaluation table:

| Scene | Model | Style | Cast | World | Action | Verdict |
|---|---|---|---|---|---|---|

Allowed values:
`STRONG / ACCEPTABLE / WEAK / FAIL`

Do not write `100% consistent`.

---

# PHASE 6 — HUMAN-VISUAL ACCEPTANCE RULE

The model winner is NOT:
- fastest;
- newest;
- highest metadata score.

Winner is the one where contact sheet most looks like:
> frames from one illustrated short film.

Reject a model if:
- father gains/loses glasses;
- mother hair changes substantially;
- child identity flips;
- photo-real scene appears among illustrations;
- room anchors change heavily;
- action is replaced by posed portrait.

---

# PHASE 7 — DO NOT INTEGRATE YET

Stop after prototype.

Return:
1. code file created;
2. API test result for both models;
3. reference bundle;
4. 8 outputs;
5. contact sheet;
6. evaluation table;
7. recommendation:
   - dev
   - klein9b
   - neither

If `neither`:
do not wire batch.
Explain visually why.

Do NOT render mp4 in V3.3A.

---

# IMPORTANT

This round is not about tests turning green.

The only purpose is to answer:

**Can multi-reference generation make the same style + same family + same dining room persist across different actions?**

If yes, next round will be V3.3B integration.
If no, we choose another identity strategy before touching batch generation.
