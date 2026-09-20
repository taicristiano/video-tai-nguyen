# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.3A-1
# SINGLE GOAL: LOCK THE VISUAL STYLE ONLY

## VERSION LOCK

We are in:

`V3.3A-1 — Visual Style Lock`

Do not rename the version.
Do not move to cast continuity.
Do not move to world continuity.
Do not integrate into batch generation.
Do not render a video.

This prompt has ONE GOAL ONLY:

> Find and prove one visual illustration style that HAY & ĐẸP. can consistently use for `human-insight/cinematic-light`.

Nothing else.

---

# 1. WHY THIS ROUND EXISTS

Current output still jumps between:
- semi-realistic / almost photographic;
- anime-like illustration;
- flat editorial drawing;
- different face rendering;
- different shading and linework.

Before trying to lock characters or rooms, we need a stable visual medium.

If style is not stable, character continuity tests are meaningless because the same face rendered in different media will still look like a different person.

Therefore this round evaluates STYLE ONLY.

---

# 2. DO NOT TOUCH THESE AREAS

Do NOT modify:

- `scripts/batch-engine.mjs`
- Story Planner logic
- cast inference
- world inference
- subtitle logic
- SFX
- timing
- Remotion layout
- typography
- brand outro
- current production renderer

Do NOT:
- render Video 001;
- render Video 005;
- generate story scenes;
- generate family dinner scenes;
- generate room scenes;
- test character identity.

This round is isolated.

---

# 3. CREATE AN ISOLATED STYLE TEST SCRIPT

Create:

```text
scripts/test-hay-dep-style-lock.mjs
```

The script must NOT import or modify the active batch engine.

Its purpose:

1. generate style candidates;
2. generate the same neutral subject using the selected style;
3. compare visual consistency.

Output directory:

```text
scratch/v33/style-lock/
```

---

# 4. NEUTRAL TEST SUBJECT

Use ONE neutral subject for all style tests:

```text
A Vietnamese adult sitting beside a small wooden table,
holding a ceramic cup,
looking slightly to the side,
calm natural pose,
simple ivory background,
soft daylight.
```

Important:

This subject is intentionally boring and generic.

Do NOT use:
- family dinner;
- child;
- book;
- phone;
- home interior;
- emotional scene;
- story-specific objects.

Reason:
we are measuring STYLE, not storytelling.

---

# 5. TARGET HAY & ĐẸP. STYLE

The desired visual identity is:

```text
Premium warm editorial 2D illustration.

Vietnamese / East Asian facial proportions drawn naturally.

Soft ivory and warm cream palette.

Muted sage accents.

Warm wood tones.

Charcoal / soft sepia linework.

Subtle tactile paper-like texture.

Natural soft daylight.

Gentle dimensional shading.

Human anatomy proportional and believable.

Faces expressive but restrained.

Not photorealistic.

Not anime.

Not chibi.

Not children's-book cartoon.

Not vector-flat corporate illustration.

Not watercolor wash.

Not 3D render.

Not painterly oil art.

Not fashion sketch.

Not stick figure.

No text.

No logo.

No watermark.
```

This is the STYLE definition for the test.

Do not add semantic nouns such as:
- dinner
- books
- family
- work
- parenting

to the style prompt.

---

# 6. MODELS TO TEST

Test ONLY these two models:

```text
@cf/black-forest-labs/flux-2-dev
@cf/black-forest-labs/flux-2-klein-9b
```

Do not test other models in this round.

Do not change the current production model.

This is an isolated experiment.

---

# 7. GENERATE FIRST-PASS STYLE CANDIDATES

For each model generate exactly:

```text
4 candidates
```

using:
- same neutral subject;
- same style definition;
- deterministic seeds.

Suggested seeds:

```text
1101
1102
1103
1104
```

Total first-pass outputs:

```text
8 images
```

Paths:

```text
scratch/v33/style-lock/dev/candidate-01.jpg
scratch/v33/style-lock/dev/candidate-02.jpg
scratch/v33/style-lock/dev/candidate-03.jpg
scratch/v33/style-lock/dev/candidate-04.jpg

scratch/v33/style-lock/klein9b/candidate-01.jpg
...
candidate-04.jpg
```

Do NOT generate more than 8 images in this phase.

---

# 8. KEEP PROMPT STRUCTURE IDENTICAL

For every first-pass candidate, use the exact same prompt structure:

```text
SUBJECT:
A Vietnamese adult sitting beside a small wooden table,
holding a ceramic cup,
looking slightly to the side,
calm natural pose,
simple ivory background,
soft daylight.

STYLE:
Premium warm editorial 2D illustration.
Soft ivory and warm cream palette.
Muted sage accents.
Warm wood tones.
Charcoal / soft sepia linework.
Subtle tactile paper-like texture.
Natural soft daylight.
Gentle dimensional shading.
Human anatomy proportional and believable.
Vietnamese facial features rendered naturally.
Faces expressive but restrained.

AVOID:
photorealism,
anime,
manga,
chibi,
children's-book cartoon,
flat corporate vector art,
3D render,
watercolor wash,
oil painting,
fashion sketch,
stick figures,
text,
logos,
watermarks.
```

Do not customize the prompt per candidate.

Only model and seed may differ.

---

# 9. CREATE FIRST CONTACT SHEET

Create:

```text
scratch/v33/style-lock/contact-sheet-pass1.jpg
```

Layout:

```text
2 rows x 4 columns
```

Row 1:
FLUX.2 dev candidates 1–4

Row 2:
FLUX.2 klein 9B candidates 1–4

Each cell should visibly include outside-image label:

```text
DEV / seed 1101
DEV / seed 1102
...
KLEIN9B / seed 1104
```

Do not add labels inside generated images.

---

# 10. EVALUATE STYLE ONLY

Create:

```text
scratch/v33/style-lock/style-evaluation-pass1.md
```

For each candidate evaluate ONLY:

### A. Medium consistency
Does it clearly look like editorial 2D illustration?

### B. Linework
Is linework controlled, warm, subtle and consistent?

### C. Shading
Does it avoid both flat-vector and photorealistic shading?

### D. Face rendering
Natural Vietnamese adult face, not anime, not uncanny photo.

### E. Palette
Ivory / cream / sage / warm wood / charcoal feel.

### F. Texture
Subtle tactile editorial texture, not watercolor or plastic.

### G. Brand fit
Does this visually feel compatible with HAY & ĐẸP.?

Allowed values:

```text
STRONG
ACCEPTABLE
WEAK
FAIL
```

Do not evaluate:
- character continuity;
- room continuity;
- storytelling;
- composition variety.

---

# 11. PICK ONE STYLE REFERENCE CANDIDATE

After visual comparison, select exactly ONE candidate as:

```text
scratch/v33/style-lock/style-reference.jpg
```

Selection rule:

The winner is the image that best represents the desired medium,
NOT the prettiest face.

Required minimum:

```text
Medium: STRONG
Linework: >= ACCEPTABLE
Shading: >= ACCEPTABLE
Face: >= ACCEPTABLE
Palette: STRONG
Texture: >= ACCEPTABLE
Brand fit: STRONG
```

If no candidate meets this:
STOP.

Do not proceed to the next phase.
Report:

```text
NO STYLE REFERENCE APPROVED
```

and explain visually why.

---

# 12. SECOND TEST — STYLE REPEATABILITY

Only if one style reference is selected:

Generate 4 NEW images with different neutral subjects.

Important:
we are still NOT testing same character.

Use four different adult subjects:

### Subject A
Vietnamese man standing beside a window holding a ceramic cup.

### Subject B
Vietnamese woman sitting at a small wooden table arranging flowers.

### Subject C
Vietnamese man reading a handwritten note at a desk.

### Subject D
Vietnamese woman tying an apron beside a side table.

The people are intentionally different.

The question is:

> Does the ART STYLE stay the same?

Use the selected `style-reference.jpg` as reference input.

Use the same winning model only.

Generate exactly 4 outputs:

```text
scratch/v33/style-lock/repeatability/subject-a.jpg
subject-b.jpg
subject-c.jpg
subject-d.jpg
```

---

# 13. STYLE REFERENCE PROMPT

For repeatability generation:

```text
Image 0 defines the exact illustration medium.

Match Image 0 for:
- linework;
- shading;
- texture;
- color treatment;
- facial rendering style;
- human proportions;
- level of realism.

Do NOT copy the exact person from Image 0.

The new subject is:
{SUBJECT}

Keep the same illustration medium as Image 0.

Do not switch to:
photorealism,
anime,
manga,
flat corporate vector,
3D,
watercolor,
children's cartoon.

No text.
No logo.
No watermark.
```

This distinction is critical:

```text
STYLE SAME
PERSON DIFFERENT
```

---

# 14. SECOND CONTACT SHEET

Create:

```text
scratch/v33/style-lock/contact-sheet-repeatability.jpg
```

Must contain:
- selected style reference;
- Subject A;
- Subject B;
- Subject C;
- Subject D.

Do not judge identity consistency.

Judge only whether all five look as if they were illustrated by the same visual system.

---

# 15. REPEATABILITY EVALUATION

Create:

```text
scratch/v33/style-lock/style-evaluation-repeatability.md
```

Score:

```text
Reference ↔ A
Reference ↔ B
Reference ↔ C
Reference ↔ D
```

for:

- illustration medium
- linework
- shading
- facial rendering style
- palette
- texture

Allowed overall verdict:

```text
STRONG
ACCEPTABLE
WEAK
FAIL
```

---

# 16. FINAL ACCEPTANCE RULE

V3.3A-1 passes ONLY if:

1. one style reference was visually approved;
2. all 4 repeatability outputs remain 2D editorial;
3. no photo-real output appears;
4. no anime/chibi output appears;
5. linework/shading/palette remain visibly from the same style family;
6. at least 3/4 repeatability comparisons are:
   `STRONG` or `ACCEPTABLE`;
7. zero comparison is `FAIL`.

If this does not happen:

```text
V3.3A-1 FAIL
```

Do NOT proceed to character identity.

---

# 17. OUTPUT REQUIRED

Return only the results of THIS style round:

## A. Files created

## B. Model/API status

## C. Pass-1 contact sheet

## D. Candidate evaluation table

## E. Selected style reference
or:
`NO STYLE REFERENCE APPROVED`

## F. Repeatability contact sheet

## G. Repeatability evaluation

## H. Verdict

Exactly one:

```text
V3.3A-1 STYLE LOCK — PASS
```

or:

```text
V3.3A-1 STYLE LOCK — FAIL
```

---

# 18. STOP CONDITION

After reporting the verdict:

STOP.

Do NOT:
- create cast reference;
- create world reference;
- generate Video 001 scenes;
- modify batch engine;
- integrate reference conditioning;
- start V3.3A-2.

Wait for human review.
