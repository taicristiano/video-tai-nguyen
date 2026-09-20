# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.5A BRAND + TYPOGRAPHY POLISH
# NO IMAGE GENERATION
# REUSE CURRENT CLEAN SCENE-LEVEL PILOT

## CONTEXT

V3.4A is now accepted for:
- clean 2D cartoon / illustrated source assets;
- scene-level comparison pilot;
- balanced centered framing;
- deterministic calm motion;
- hard cuts.

Do NOT reopen image-generation research.
Do NOT call Cloudflare.
Do NOT change the six selected clean assets.
Do NOT change V3.4A motion grammar.

This task has ONE goal:

> Polish the visible brand system and text hierarchy so the video looks more finished and recognizably HAY & ĐẸP.

---

# 1. WATERMARK — USE THE EXACT BRAND IMAGE

Use the exact provided HAY & ĐẸP. full horizontal logo with slogan as the watermark asset.

Do NOT recreate, redraw, regenerate, typeset, or approximate the logo.

Target asset name in repo:

```text
public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
```

If the exact file is not present, STOP with:

```text
V3.5A BRAND + TYPOGRAPHY POLISH — BLOCKED_BRAND_ASSET
```

Do not substitute another logo.

Watermark behavior:
- persistent on narrative scenes;
- fixed position;
- no animation;
- no pulsing;
- no scale changes;
- no rotation;
- no fade per scene;
- preserve PNG transparency.

Because this is a wide full-logo + slogan asset:
- keep it large enough that the slogan remains readable;
- target width approximately 180–240 px on 1080×1920;
- opacity approximately 0.14–0.20;
- keep at least 32–48 px from frame edges;
- do not overlap subtitles;
- do not cover faces / important actions.

Prefer top-right or upper-right safe zone if current title layout permits.
If title conflicts, choose lower-right ABOVE the subtitle safe zone.

Watermark must remain pixel-stable.

---

# 2. TITLE / HEADLINE POLISH

Keep the persistent headline concept.

Do NOT rewrite authored titles.

Improve only:
- font sizing;
- line height;
- tracking;
- max width;
- spacing from artwork;
- visual weight.

Rules:
- maximum 2 lines;
- mobile readable;
- no oversized TikTok clickbait typography;
- calm premium editorial feel;
- stable throughout scene;
- no per-word bouncing / kinetic typography.

Use existing brand typeface if one is already defined.
Do not add a new font dependency unless necessary.

---

# 3. SUBTITLE POLISH

Keep canonical subtitle text and timing unchanged.

Only improve presentation:
- max 2 lines where possible;
- safe bottom margin;
- consistent width;
- readable line-height;
- subtle contrast support if needed.

Allowed:
- very subtle translucent backing / shadow;
- soft text shadow;
- mild background blur only if already supported.

Not allowed:
- large opaque caption boxes;
- karaoke word highlighting;
- bouncing words;
- emoji;
- animated underline;
- aggressive drop shadow.

Subtitle must remain pixel-stable relative to the frame.

---

# 4. SAFE-ZONE CONTRACT

For 1080×1920:

```text
TOP BRAND/TITLE ZONE
CENTER ARTWORK ZONE
BOTTOM SUBTITLE ZONE
```

Maintain clear separation.

Do not allow:
- watermark into subtitle zone;
- title into artwork focal faces;
- artwork motion into persistent text more than current accepted pilot;
- subtitle closer than safe mobile UI margin.

Create explicit constants/config for:
- top safe zone;
- bottom safe zone;
- watermark edge inset;
- title max width;
- subtitle max width.

Do not scatter magic numbers.

---

# 5. BRAND ATMOSPHERE

Keep current warm ivory / cream background.

Allowed only:
- very subtle paper/ambient texture if already available;
- restrained text shadow;
- tiny hierarchy spacing adjustments.

Do NOT add:
- particles;
- floating decorations;
- lens flare;
- heavy vignette;
- animated gradients;
- 3D card shadows;
- parallax;
- extra image depth effects.

We are intentionally skipping a separate “depth research” phase.

---

# 6. PILOT

Reuse the current 6 clean scene-level assets and the current balanced framing.

Render the same 773-frame comparison pilot:

```text
scratch/v35/brand-typography/video001-brand-typography-pilot.mp4
```

Also export representative frames:
```text
frame-01.png
frame-03.png
frame-05.png
frame-06.png
```

No image generation.

---

# 7. QA

PASS only if:

1. exact supplied logo asset is used;
2. watermark slogan is still legible at video scale;
3. watermark never overlaps subtitle;
4. watermark never covers important faces/actions;
5. title remains readable and visually stable;
6. subtitle remains readable and visually stable;
7. no motion regression;
8. no hard-cut regression;
9. no artwork framing regression;
10. result looks cleaner and more branded than V3.4A without becoming busier.

---

# 8. TESTS

Add focused tests for:
- exact watermark asset path;
- watermark opacity bounds;
- watermark edge inset;
- title/subtitle max width constants;
- no watermark transform animation;
- no subtitle timing/content mutation;
- V3.4A motion props untouched;
- `visualBeats={undefined}` still preserved in the scene-level comparison pilot.

No network calls.

---

# 9. REPORT

Return:

## A. Files Changed
## B. Watermark Integration
## C. Title Polish
## D. Subtitle Polish
## E. Safe-Zone Constants
## F. Pilot Paths
## G. QA Result
## H. Verdict

Exactly one:

```text
V3.5A BRAND + TYPOGRAPHY POLISH — PASS
```

or:

```text
V3.5A BRAND + TYPOGRAPHY POLISH — BLOCKED_BRAND_ASSET
```

or:

```text
V3.5A BRAND + TYPOGRAPHY POLISH — FAIL
```

Then STOP.

Do not start the 5-video generalization test automatically.
Wait for human review.
