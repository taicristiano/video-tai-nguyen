# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REFERENCE RESTORATION 1.2.1
# WATERMARK + TITLE CLEARANCE PATCH
# VIDEO001 ONLY
# NO IMAGE GENERATION
# NO SHOT-PLAN CHANGE
# NO MOTION CHANGE
# NO FRAMING REWRITE

## PURPOSE

Human review of the actual rendered file:

```text
scratch/reference-restoration/video001/video001-reference-restored-v1.2-typography.mp4
```

found one remaining layout problem:

1. The enlarged 58px headline sits visually too close to / partially competes with the top-right watermark.
2. The watermark is still too faint in the actual MP4 and should be clearer, but must remain premium and non-dominant.

Everything else from V1.2 should remain locked:
- 17-beat shot plan;
- centered artwork window;
- V1.1 perceived motion;
- atmospheric canvas;
- larger 58px headline baseline;
- larger 44px subtitle baseline;
- artwork top around 360px;
- hard cuts;
- no new images.

This is a narrow spacing/brand-visibility patch only.

---

# 1. ACTUAL OUTPUT PROBLEM

In the rendered MP4, the current combination:

```text
watermark:
  top: 40
  right: 40
  width: 250
  opacity: 0.24

title:
  top: 120
  fontSize: 58
  maxWidth: 880
  maxLines: 2
```

creates insufficient visual separation.

The watermark overlaps the same visual territory as the first headline line.
Even when pixels do not literally overlap in every frame, the two elements visually compete.

Do NOT solve this by shrinking the headline back to the old size.

---

# 2. TARGET LAYOUT

Use this revised baseline:

```text
WATERMARK
top: 28px
right: 32px
width: 270px
opacity: 0.34
animated: false

TITLE
top: 145px
fontSize: 58px
maxWidth: 880px
lineHeight: 1.18
maxLines: 2

ARTWORK
top: 360px
left: 90px
width: 900px
height: 1040px
```

Intent:

```text
watermark becomes easier to identify
watermark remains clearly secondary to headline
headline stays large
headline moves down enough to avoid visual collision
artwork stays where V1.2 placed it
```

Do NOT move artwork farther down unless actual proof shows a collision.

---

# 3. IMPORTANT CODE PATCH — BRAND + TITLE TOKENS

Update the actual single source of truth.

Target:

```ts
export const BRAND_WATERMARK = {
  repoPath: 'public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
  staticPath: 'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',

  // V1.2.1 visibility patch
  width: 270,
  opacity: 0.34,

  insetTop: 28,
  insetRight: 32,

  position: 'top-right' as const,
  animated: false,

  // Optional, only if actual logo still washes out after opacity increase.
  // Keep extremely subtle.
  dropShadow: '0 1px 2px rgba(44, 40, 32, 0.08)',
} as const;

export const TITLE_TYPOGRAPHY = {
  maxWidth: 880,
  fontSize: 58,
  minFontSize: 56,
  maxFontSize: 60,

  lineHeight: 1.18,
  letterSpacing: '-0.015em',
  fontWeight: '700' as const,

  // V1.2.1 clearance patch
  top: 145,

  maxLines: 2,

  textShadow:
    '0 2px 12px rgba(246,241,232,0.88), 0 1px 3px rgba(44,26,14,0.08)',
} as const;
```

Do not duplicate tokens.

---

# 4. WATERMARK RENDERING

In the actual `Layout.tsx` watermark style, use:

```tsx
<img
  src={staticFile(BRAND_WATERMARK.staticPath)}
  style={{
    position: 'absolute',
    top: BRAND_WATERMARK.insetTop,
    right: BRAND_WATERMARK.insetRight,
    width: BRAND_WATERMARK.width,
    height: 'auto',
    opacity: BRAND_WATERMARK.opacity,

    // Must remain static.
    transform: 'none',

    filter:
      BRAND_WATERMARK.dropShadow
        ? `drop-shadow(${BRAND_WATERMARK.dropShadow})`
        : undefined,

    pointerEvents: 'none',
    zIndex: 30,
  }}
/>
```

If the existing implementation already uses `<Img>`, keep `<Img>`.
Do not refactor merely to match this example.

No breathing.
No pulsing.
No per-scene fade.
No scale animation.

---

# 5. TITLE CLEARANCE RULE

The title must begin visually below the watermark footprint.

Do NOT rely on “looks probably okay”.

Add an explicit geometry safety rule.

Conceptually:

```ts
const WATERMARK_SAFE_BOTTOM = 120;
const TITLE_SAFE_TOP = 145;

if (TITLE_SAFE_TOP < WATERMARK_SAFE_BOTTOM + 20) {
  throw new Error('Title/watermark clearance too small');
}
```

Adapt to actual code/tests.

Desired minimum visual clearance:

```text
>= 24px
```

between watermark visual bottom and first title line box.

Because the logo asset contains transparent padding,
verify this using actual rendered output, not PNG dimensions alone.

---

# 6. DO NOT CHANGE SUBTITLE

Keep V1.2 subtitle exactly:

```text
fontSize: 44px
maxWidth: 920px
lineHeight: 1.30
bottomPlacement: 10.5%
maxWords: 7
```

No subtitle work is needed in this patch.

---

# 7. DO NOT CHANGE ARTWORK

Keep:

```text
top: 360px
left: 90px
width: 900px
height: 1040px
bottom: 1400px
```

The artwork placement is already good.

Do not reintroduce editorial-left/right outer-card shifting.

---

# 8. DO NOT CHANGE MOTION

Preserve exactly the V1.1/V1.2 runtime motion behavior.

No recalibration.

Keep:
- AMBIENT_STILL;
- gentle push/drift;
- atmosphere;
- 17 beats;
- hard cuts.

This patch must not become a motion pass.

---

# 9. OUTPUT-BASED PROOF

Render:

```text
scratch/reference-restoration/video001/
video001-reference-restored-v1.2.1-brand-clearance.mp4
```

Same:
```text
1442 frames
30 fps
1080x1920
same audio
same 17 beats
```

Create:

```text
brand-clearance-before-after.jpg
```

Use at least 4 representative narrative frames.

For each:
```text
LEFT  = V1.2
RIGHT = V1.2.1
```

Add guide annotations:
- watermark bounding area;
- title first-line bounding area;
- vertical clearance.

Also create:

```text
watermark-visibility-proof.jpg
```

Show:
- 100% frame view;
- mobile-scaled preview;
- top-zone crop.

The goal is to verify the watermark is easier to recognize without becoming distracting.

---

# 10. MOBILE PREVIEW

This is important.

Create a simulated smaller preview equivalent to typical phone-feed viewing.

For example:

```text
preview width: 360px
```

Export:

```text
mobile-preview-v1.2.1.jpg
```

At this size verify:
- HAY & ĐẸP. logo is identifiable;
- headline is immediately readable;
- watermark is secondary;
- no visual collision.

---

# 11. TESTS

Update/add focused tests only.

Example:

```ts
describe('V1.2.1 brand clearance', () => {
  it('keeps the larger title', () => {
    expect(TITLE_TYPOGRAPHY.fontSize).toBe(58);
  });

  it('moves title down for watermark clearance', () => {
    expect(TITLE_TYPOGRAPHY.top).toBeGreaterThanOrEqual(140);
  });

  it('makes watermark clearer', () => {
    expect(BRAND_WATERMARK.width).toBeGreaterThanOrEqual(260);
    expect(BRAND_WATERMARK.opacity).toBeGreaterThanOrEqual(0.30);
  });

  it('keeps watermark restrained', () => {
    expect(BRAND_WATERMARK.opacity).toBeLessThanOrEqual(0.38);
  });

  it('keeps artwork geometry unchanged', () => {
    expect(SAFE_ZONES.artworkTop).toBe(360);
    expect(SAFE_ZONES.artworkLeft).toBe(90);
    expect(SAFE_ZONES.artworkWidth).toBe(900);
  });
});
```

Adapt to real APIs.

---

# 12. ACCEPTANCE

PASS only if actual rendered output proves:

```text
headline no longer visually touches watermark
headline remains clearly larger than old baseline
watermark is noticeably clearer than V1.2
watermark still feels secondary/premium
watermark tagline is more recognizable at mobile scale
artwork stays centered and unchanged
subtitle stays unchanged
motion stays unchanged
17-beat shot plan stays unchanged
no new image generation
no new collision introduced
```

FAIL if:
- watermark becomes too dominant;
- title is shrunk to solve the problem;
- artwork is pushed down unnecessarily;
- subtitle changes;
- motion changes;
- top zone still feels crowded.

---

# 13. FINAL REPORT

Return:

## A. Exact Token Changes
```text
watermark width: 250 -> ?
watermark opacity: 0.24 -> ?
watermark top: 40 -> ?
watermark right: 40 -> ?
title top: 120 -> ?
```

## B. Output Proof
Paths:
```text
brand-clearance-before-after.jpg
watermark-visibility-proof.jpg
mobile-preview-v1.2.1.jpg
```

## C. Regression Check
Confirm:
```text
artwork unchanged
subtitle unchanged
motion unchanged
shot plan unchanged
```

## D. Tests
Exact counts.

## E. Video
Path + size + frame count.

## F. Verdict

Exactly one:

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.2.1 — PASS
```

or:

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.2.1 — FAIL
```

Then STOP.

Do NOT touch video005/007/013/028 yet.
