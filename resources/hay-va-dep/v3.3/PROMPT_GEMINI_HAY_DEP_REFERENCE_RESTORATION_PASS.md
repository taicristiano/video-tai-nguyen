# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REFERENCE RESTORATION PASS
# FIX THE REAL FULL PRODUCTION VIDEO BEFORE ANY BATCH
# VIDEO001 ONLY
# MODEL POLICY REMAINS LOCKED: @cf/black-forest-labs/flux-1-schnell ONLY

## WHY THIS PASS EXISTS

The current full production `final.mp4` is technically correct but visually underperforms.

Human review found two major classes of problems:

1. **FRAMING / COMPOSITION REGRESSION**
   - Several scenes place the entire artwork panel too far left/right.
   - Example failures in current `final.mp4`:
     - around frame ~300: artwork panel is left-heavy and leaves a large dead ivory region on the right;
     - around frame ~610: family artwork is strongly shifted left, with the right side of the 9:16 canvas mostly empty.
   - This is not acceptable as “editorial-left/right”.

2. **PERCEIVED MOTION / RETENTION REGRESSION**
   - Large parts of the video still feel like a slideshow.
   - V3.4A micro-motion exists in code, but is often visually imperceptible.
   - Examples:
     - scene 7 frames ~780–860: almost the same composition for ~2.7s;
     - scene 8 beat 1 frames ~880–950: almost visually unchanged;
     - scene 9 beat 2 frames ~1140–1220: almost visually unchanged.
   - The reference videos derive energy mainly from meaningful shot changes, scale changes and concrete detail inserts, not from tiny code-level pan/scale values.

This pass must restore the visual grammar actually learned from the high-performing reference videos.

Do NOT start Production Batch 01.
Do NOT modify video005/007/013/028 yet.
Fix video001 first.

---

# 1. AUTHORITATIVE REFERENCE MATERIAL

Read and use:

```text
resources/video-references/
resources/video-references/_analysis/HAY_DEP_REFERENCE_MASTER_REPORT.md
docs/HAY_DEP_VISUAL_V3_REFERENCE_DERIVED.md
```

Also inspect the five raw reference videos again if present.

Do not rely only on old implementation contracts.

Reference-derived facts to preserve unless raw references contradict them:

```text
tri-zonal vertical architecture
artwork concentrated in center visual zone
median shot hold ~3.4s
visual changes around 18–22/min
hard cuts >90%
concrete physical actions
wide → medium → detail → close variation
warm atmospheric depth
textured / alive background
micro-motion is restrained
```

The references do NOT justify:
- repeated 5–6s near-static panels;
- huge dead ivory side regions caused by shifting the whole image container;
- using tiny zoom values as a substitute for real shot changes;
- declaring visual PASS only because tests/render succeed.

---

# 2. KEEP THESE LOCKS

Do NOT reopen:

```text
IMAGE MODEL = @cf/black-forest-labs/flux-1-schnell ONLY
IMAGE STYLE = clean 2D cartoon / illustrated editorial
cross-shot identity consistency = NOT REQUIRED
five-dimension image QA
max 3 real generation attempts
watermark asset
watermark top-right 40/40, width 250, opacity 0.24
canonical subtitle source/timing
hard-cut baseline
```

This is a visual grammar correction, not a new image-model research phase.

---

# 3. CURRENT VIDEO AUDIT — OUTPUT FIRST, CODE SECOND

Analyze the actual current:

```text
scratch/production-smoke/video001/final.mp4
```

Extract:

```text
1 frame / 1 second contact sheet
scene boundary frames
visual beat boundary frames
```

Create:

```text
scratch/reference-restoration/video001/current-1fps-contact-sheet.jpg
scratch/reference-restoration/video001/current-framing-audit.md
scratch/reference-restoration/video001/current-motion-audit.md
```

Measure/estimate from actual output:

```text
visual changes/min
median visual hold
max near-static hold
artwork occupancy
subject horizontal centroid
dead-space left/right
wide / medium / close / detail distribution
composition silhouette diversity
number of clearly perceptible camera/framing changes
```

Report the five biggest gaps versus the reference videos.

Do not touch renderer before this audit exists.

---

# 4. FIX COMPOSITION SEMANTICS

The OUTER artwork window for normal narrative shots must remain visually balanced inside the center zone.

## Critical rule

`editorial-left` and `editorial-right` MUST NOT mean:

```text
move the entire artwork panel to the left/right half of the 1080px canvas
```

That interpretation caused the visible framing failures.

Instead:

```text
outer visual window stays centered / balanced
editorial-left  = subject/crop bias inside the centered visual window
editorial-right = subject/crop bias inside the centered visual window
```

Implement composition using:
- object position;
- focal crop;
- subject placement inside image;
- internal negative space;

NOT by shifting the whole visual card far off center.

## Framing safety gate

For normal narrative artwork:

```text
center visual window remains centered in 1080x1920 canvas
no accidental side dead-space > ~15% of canvas width
no major subject clipped by outer card edge
no large blank side column unless explicitly justified by text/composition
```

Create a framing proof sheet from corrected render.

---

# 5. SHOT PLAN MUST CHANGE — NOT JUST MOTION PRESETS

Before modifying renderer, create:

```text
scratch/reference-restoration/video001/shot-plan-reference-restored.json
scratch/reference-restoration/video001/shot-plan-reference-restored.md
```

Re-author the 48s video into a reference-like sequence.

Target:

```text
15–17 meaningful visual beats / shots over ~48s
visual changes >= 18/min
median hold roughly 2.5–3.4s
avoid any near-static visual state >4.0s
```

Do NOT mechanically split narration every N seconds.

Each change must have semantic purpose.

Preferred visual progression examples:

```text
WIDE family/table
→ MEDIUM interaction
→ DETAIL bowl/hands
→ CLOSE emotional face
→ MEDIUM action
→ DETAIL phone/object
→ WIDE room
```

No more than 2 consecutive shots with the same scale or same composition silhouette unless meaning strongly requires it.

---

# 6. REUSE EXISTING HUMAN-PASS ASSETS INTELLIGENTLY

Do NOT regenerate all artwork.

Use the already human-approved assets where useful.

You may create multiple DIFFERENT SHOTS from one approved source image by:

```text
wide crop
medium crop
detail crop
close crop
```

ONLY when the crop remains semantically valid and visually clean.

Example:
- family dinner asset can yield wide establishing shot and a tighter interaction crop;
- bowl/table asset can become a detail insert.

If a required semantic shot cannot be obtained from an approved asset without looking weak, generate a new image with Schnell.

Reference principle:

```text
if the shot is weak, change the shot;
do not hide a weak shot behind another motion preset.
```

Any new image must go through existing explicit visual QA before final render.

---

# 7. PERCEIVED MOTION CONTRACT

Do NOT attempt to solve “static” merely by increasing every zoom.

References use restrained camera motion.

The correction must prioritize:

```text
real shot changes
meaningful crop/scale changes
detail inserts
composition changes
```

Then add restrained motion inside the hold.

Within any visual hold longer than ~2.5s, at least ONE must be visibly perceptible:

```text
gentle push/pull
subtle pan tied to focal subject
foreground/background parallax
soft atmospheric dust/light movement
controlled secondary framing change
```

No bounce.
No spring.
No rotation.
No random motion.

Do not count motion as successful solely because numeric transform values change.
Verify it by comparing start/mid/end frames visually.

---

# 8. BACKGROUND MUST FEEL ALIVE

The current ivory canvas often reads as empty/static.

Use restrained reference-derived atmosphere:

```text
very subtle paper texture / grain
very sparse dust motes or soft light particles
slow ambient light drift when appropriate
```

Rules:
- barely noticeable;
- no glitter;
- no decorative particle storm;
- do not distract from illustration/subtitle;
- deterministic.

This is atmosphere, not a new visual theme.

---

# 9. TEXT / BRAND

Keep the current HAY & ĐẸP. identity.

However ensure title/watermark do not consume excessive visual attention.

Persistent title may remain if reference evidence supports it, but:
- it must not force the center artwork into a small or unbalanced panel;
- top/title zone must remain compact;
- artwork remains the main visual event.

Do not change canonical subtitle timing/content.

---

# 10. VISUAL ACCEPTANCE TESTS — OUTPUT BASED

Technical tests remain necessary but NOT sufficient.

Create:

```text
scratch/reference-restoration/video001/reference-vs-current-vs-restored.jpg
scratch/reference-restoration/video001/restored-1fps-contact-sheet.jpg
scratch/reference-restoration/video001/framing-proof.jpg
scratch/reference-restoration/video001/motion-proof.jpg
scratch/reference-restoration/video001/comparison-report.md
```

`motion-proof.jpg` must show start/mid/end frames for representative longer shots.

`framing-proof.jpg` must include the current known bad regions around:
- frame ~300
- frame ~610
plus corrected equivalents.

## FAIL if any remains true

```text
video still feels like a slideshow
majority of scenes share the same silhouette
whole visual panel visibly shifted to one side without purpose
large dead ivory side columns
near-static frame held >4s repeatedly
micro-motion exists in code but cannot be perceived in proof frames
reference comparison still shows obviously weaker visual rhythm
```

Do NOT report PASS because:
- npm test passes;
- render completes;
- image assets individually passed QA.

---

# 11. FINAL RENDER

Only after shot plan + asset QA + renderer correction are ready:

Render:

```text
scratch/reference-restoration/video001/video001-reference-restored.mp4
```

Full 1080x1920 production video.

Review the actual MP4.

Do not start the four-video batch automatically.

---

# 12. FINAL REPORT ORDER

Report in this exact order:

```text
A. WHAT WAS WRONG IN CURRENT FINAL.MP4
B. WHAT THE HIGH-VIEW REFERENCES ACTUALLY DO
C. CURRENT VS REFERENCE METRICS
D. RE-AUTHORED SHOT PLAN
E. ASSETS REUSED / NEW ASSETS
F. FRAMING FIX
G. PERCEIVED MOTION FIX
H. CONTACT SHEET COMPARISON
I. REMAINING VISUAL WEAKNESSES
J. TECHNICAL TESTS
K. VERDICT
```

Final verdict only one:

```text
HAY & ĐẸP. REFERENCE RESTORATION — PASS
```

or

```text
HAY & ĐẸP. REFERENCE RESTORATION — FAIL
```

Then STOP.

Do NOT start Production Batch 01.
