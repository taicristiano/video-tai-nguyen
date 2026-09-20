# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REFERENCE RESTORATION 1.2
# TYPOGRAPHY + LAYOUT + MOTION BASELINE POLISH
# VIDEO001 ONLY
# NO IMAGE GENERATION
# NO MODEL RESEARCH
# MODEL POLICY REMAINS LOCKED: @cf/black-forest-labs/flux-1-schnell ONLY

---

# 0. PURPOSE

We already have a strong corrected baseline:

```text
video001-reference-restored-v1.1.mp4
```

V1.1 fixed the major visual problems:

```text
FRAMING                     PASS
SHOT / CUT CADENCE          PASS
WITHIN-SHOT MOTION          PASS
ATMOSPHERE                  PASS
REFERENCE APPLICATION       PASS
```

Do NOT reopen image generation research.
Do NOT rewrite the 17-beat shot plan.
Do NOT add more cuts.
Do NOT change the image model.
Do NOT redesign the HAY & ĐẸP. visual identity.

This pass has THREE narrow production goals:

1. make the persistent headline visibly larger and stronger;
2. make subtitles visibly larger and easier to read on mobile;
3. move the main artwork zone slightly lower so the larger headline can breathe,
   while PRESERVING the centered framing and V1.1 perceived-motion improvements.

The user specifically wants:

```text
headline bigger
subtitle bigger
main visual slightly lower
framing still balanced
motion still alive
HAY & ĐẸP. still calm / premium / editorial
```

This is a production polish pass, NOT a new research version.

---

# 1. AUTHORITATIVE INPUTS

Use:

```text
scratch/reference-restoration/video001/video001-reference-restored-v1.1.mp4
videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json
docs/HAY_DEP_PRODUCTION_LOCK.md
docs/HAY_DEP_PRODUCTION_LOCK.json
resources/video-references/_analysis/HAY_DEP_REFERENCE_MASTER_REPORT.md
docs/HAY_DEP_VISUAL_V3_REFERENCE_DERIVED.md
```

If the exact current source locations differ, locate the active implementation first.

Likely relevant files include:

```text
src/templates/human-insight/cinematic-light/brandTypographyTokens.ts
src/templates/human-insight/cinematic-light/Layout.tsx
src/templates/human-insight/cinematic-light/tokens.ts
src/templates/human-insight/cinematic-light/ImageScene.tsx
src/templates/human-insight/cinematic-light/AtmosphericCanvas.tsx
```

Do not assume paths blindly.
Confirm which files are actually used by the v1.1 production render.

---

# 2. LOCKED BASELINE — MUST NOT REGRESS

Keep ALL of the following:

## Image model

```text
@cf/black-forest-labs/flux-1-schnell ONLY
```

No image calls are needed for this pass.

## Image style

```text
clean 2D cartoon / illustrated editorial
non-photorealistic
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber
```

## Identity

```text
cross-shot identity consistency NOT REQUIRED
```

## V1.1 shot grammar

Keep the existing restored 17-beat plan.
Do NOT add or remove beats.

Target remains approximately:

```text
17 visual beats
~48.07 seconds
~19.97 visual changes/min
median hold ~2.7s
hard cuts
wide / medium / close / detail diversity
```

## V1.1 framing semantics

Outer artwork window remains CENTERED.

Critical rule:

```text
editorial-left / editorial-right
DO NOT shift the outer card.

They only change internal crop / focal bias.
```

## V1.1 motion

Keep the perceived-motion patch:

```text
AMBIENT_STILL for narrative STILL holds > ~1.5s
visible but restrained push / drift
no frozen narrative cards
no bounce
no spring
no rotation
no overshoot
no opacity dips at hard cuts
```

## Atmosphere

Keep:
- subtle paper grain;
- very sparse warm dust motes;
- gentle ambient-light drift.

Do NOT make particles stronger merely because typography changes.

---

# 3. USER VISUAL FEEDBACK

Current v1.1 layout is significantly better than the old smoke-test render, but the user wants stronger mobile hierarchy.

Current example visually shows:
- headline readable but still a little small;
- subtitle readable but could be stronger;
- artwork begins relatively high;
- there is room to lower artwork slightly and give the headline more authority.

Desired frame impression:

```text
premium vertical editorial poster
strong clear headline
large readable subtitle
center artwork remains the main visual event
clean breathing room
no crowding
```

---

# 4. NEW TYPOGRAPHY BASELINE

The values below are the TARGET baseline for 1080x1920.

They may be adjusted by a few pixels ONLY if required to prevent collision,
but the final result must remain visibly larger than v1.1.

## 4.1 Headline / Persistent Topic Title

Target:

```text
fontSize: 58px
allowed tuning range: 56px–60px
maxWidth: 880px
fontWeight: 700
lineHeight: 1.18
letterSpacing: -0.015em
top: 120px
maxLines: 2
textAlign: center
```

Important:
- The title must be CLEARLY larger than the previous 44px baseline.
- Do not silently fall back to 44–48px.
- Preserve Vietnamese diacritics cleanly.
- Stable typography only; no kinetic words, bounce or per-word animation.
- Keep title fully readable on a phone-sized screen.
- Maximum 2 lines.

Preferred hierarchy:

```text
watermark
↓
headline
↓ generous but controlled gap
artwork
```

Do NOT allow the headline to collide with the top-right watermark.

---

# 5. NEW SUBTITLE BASELINE

Target:

```text
fontSize: 44px
allowed tuning range: 42px–46px
maxWidth: 920px
lineHeight: 1.30
bottomPlacement: 10.5%
horizontalPadding: >= 48px
maxWords: 7
```

Keep current semantic emphasis style if already used:

```text
normal phrase = muted charcoal / taupe
active emphasis = darker / bolder
```

Rules:
- subtitle must be CLEARLY easier to read than v1.1;
- no giant opaque box;
- no karaoke bounce;
- no emoji;
- no aggressive drop shadow;
- no subtitle/title collision;
- no subtitle/artwork collision.

If a subtitle becomes 2 lines:
- keep line gap comfortable;
- preserve bottom safe area;
- do not shrink all subtitles globally just because one phrase is long.

---

# 6. MAIN ARTWORK ZONE — MOVE DOWN SLIGHTLY

The current centered framing is GOOD.
Do NOT break it.

We only want the visual block slightly lower to create more breathing room above.

Target outer visual geometry for normal narrative shots:

```text
frameWidth: 1080
artworkLeft: 90
artworkWidth: 900

artworkTop: 360
artworkHeight: 1040
artworkBottom: 1400

radius: 36
```

This represents a controlled downward shift from the old `top: 300` style baseline.

Important:
- Keep balanced 90px outer margins.
- Do NOT move outer card left/right for editorial bias.
- Do NOT allow artwork to collide with subtitle.
- Do NOT reduce artwork so much that it becomes secondary.
- Do NOT expose blank edges during motion.

If actual v1.1 implementation uses a slightly different centered geometry,
adapt proportionally but preserve this intent:

```text
headline gets more vertical room
artwork starts ~50–80px lower than v1.1
artwork remains large and centered
```

---

# 7. UPDATED SAFE ZONES

Target conceptual zones:

```text
TOP BRAND + TITLE ZONE
y = 0 .. ~330

BREATHING GAP
~330 .. 360

CENTER ARTWORK ZONE
y = 360 .. 1400

BOTTOM SUBTITLE ZONE
y = 1400 .. 1920
```

Do NOT treat these as rigid clipping boxes for text.
They are composition guidance.

Keep:
- watermark top-right;
- title centered;
- artwork centered;
- subtitle visually anchored in lower zone.

---

# 8. IMPORTANT CODE PATCH — TYPOGRAPHY TOKENS

Adapt the actual active token file.

Example target implementation:

```ts
// brandTypographyTokens.ts

export const BRAND_WATERMARK = {
  repoPath: 'public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
  staticPath: 'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',

  width: 250,
  opacity: 0.24,

  insetTop: 40,
  insetRight: 40,

  position: 'top-right' as const,
  animated: false,
} as const;

export const TITLE_TYPOGRAPHY = {
  maxWidth: 880,

  // UPDATED: stronger mobile hierarchy
  fontSize: 58,
  minFontSize: 56,
  maxFontSize: 60,

  lineHeight: 1.18,
  letterSpacing: '-0.015em',
  fontWeight: '700' as const,

  // UPDATED: gives large two-line title enough room
  top: 120,

  maxLines: 2,

  textShadow:
    '0 2px 12px rgba(246,241,232,0.88), 0 1px 3px rgba(44,26,14,0.08)',
} as const;

export const SUBTITLE_TYPOGRAPHY = {
  maxWidth: 920,

  // UPDATED: stronger phone readability
  fontSize: 44,
  minFontSize: 42,
  maxFontSize: 46,

  lineHeight: 1.30,

  // UPDATED: a little lower, but still inside mobile-safe lower zone
  bottomPlacement: '10.5%',

  maxWords: 7,

  textColor: '#766D66',
  activeColor: '#2C1A0E',
  pastColor: '#8A817A',

  activeTextShadow: '0 1px 4px rgba(44,26,14,0.10)',
} as const;

export const SAFE_ZONES = {
  frameWidth: 1080,
  frameHeight: 1920,

  topZoneStart: 0,
  topZoneEnd: 330,

  artworkTop: 360,
  artworkBottom: 1400,
  artworkHeight: 1040,
  artworkWidth: 900,
  artworkLeft: 90,

  bottomZoneStart: 1400,
  bottomZoneEnd: 1920,
} as const;
```

IMPORTANT:
Do not blindly duplicate constants if the repo already has a canonical token.
Update the actual single source of truth.

---

# 9. IMPORTANT CODE PATCH — CENTERED COMPOSITION TOKENS

The old bug came from making `editorial-left/right` move the WHOLE card.
Do not reintroduce it.

Example target:

```ts
// tokens.ts

export const CENTERED_ARTWORK_WINDOW = {
  top: 360,
  left: 90,
  width: 900,
  height: 1040,
  radius: 36,
} as const;

export const COMPOSITION_PRESETS = {
  'portrait-focus': {
    ...CENTERED_ARTWORK_WINDOW,
    objectPosition: '50% 50%',
  },

  'editorial-left': {
    ...CENTERED_ARTWORK_WINDOW,

    // bias INSIDE the centered card only
    objectPosition: '38% 50%',
  },

  'editorial-right': {
    ...CENTERED_ARTWORK_WINDOW,

    // bias INSIDE the centered card only
    objectPosition: '62% 50%',
  },

  'detail-insert': {
    ...CENTERED_ARTWORK_WINDOW,
    objectPosition: '50% 55%',
  },
} as const;
```

Acceptance condition:

```text
left margin ≈ 90px
right margin ≈ 90px
```

for the OUTER window.

Internal crop may differ.

---

# 10. IMPORTANT CODE PATCH — V1.1 MOTION MUST SURVIVE

Do not reduce motion while adjusting layout.

The v1.1 motion behavior should remain conceptually like this:

```ts
type RuntimeMotion = {
  startScale: number;
  endScale: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

const isNarrativeHold = durationFrames > 45;

const resolvedProfile =
  rawProfile === 'STILL' && isNarrativeHold
    ? 'AMBIENT_STILL'
    : rawProfile;
```

Example restrained runtime profiles:

```ts
const MOTION_RUNTIME: Record<string, RuntimeMotion> = {
  AMBIENT_STILL: {
    startScale: 1.0,
    endScale: 1.02,
    startX: 0,
    endX: 9,
    startY: 0,
    endY: 7,
  },

  PUSH_IN_SOFT: {
    startScale: 1.0,
    endScale: 1.035,
    startX: 0,
    endX: 8,
    startY: 0,
    endY: 7,
  },

  PULL_OUT_SOFT: {
    startScale: 1.035,
    endScale: 1.0,
    startX: 0,
    endX: -8,
    startY: 0,
    endY: 6,
  },

  DRIFT_LEFT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: 11,
    endX: -11,
    startY: 0,
    endY: -7,
  },

  DRIFT_RIGHT: {
    startScale: 1.02,
    endScale: 1.03,
    startX: -11,
    endX: 11,
    startY: 0,
    endY: 7,
  },

  DETAIL_PUSH: {
    startScale: 1.015,
    endScale: 1.05,
    startX: 0,
    endX: 7,
    startY: 0,
    endY: -6,
  },
};
```

Use the existing active v1.1 constants if they are already calibrated.
The above is intent/reference, not a demand to replace values unnecessarily.

---

# 11. IMPORTANT CODE PATCH — FRAME-DRIVEN TRANSFORM

Motion must be output-visible and deterministic.

Prefer px translations after interpolation.

Example:

```tsx
import {
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

const frame = useCurrentFrame();

const localFrame = Math.max(
  0,
  Math.min(durationFrames - 1, frame - sceneStartFrame)
);

const progress = interpolate(
  localFrame,
  [0, Math.max(1, durationFrames - 1)],
  [0, 1],
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }
);

const eased = Easing.inOut(Easing.cubic)(progress);

const scale = interpolate(
  eased,
  [0, 1],
  [motion.startScale, motion.endScale]
);

const x = interpolate(
  eased,
  [0, 1],
  [motion.startX, motion.endX]
);

const y = interpolate(
  eased,
  [0, 1],
  [motion.startY, motion.endY]
);

const finalScale =
  (shotScale ?? 1) *
  (cropScale ?? 1) *
  scale;

const transform = `
  translate3d(${x}px, ${y}px, 0)
  scale(${finalScale})
`;
```

Then:

```tsx
<Img
  src={src}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition,
    transform,
    transformOrigin: focalPoint
      ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
      : '50% 50%',
    willChange: 'transform',
  }}
/>
```

Important:
- inspect actual implementation;
- do not double-apply shotScale/cropScale;
- do not convert currently working motion from px to % accidentally;
- keep enough overscan to avoid edge exposure.

---

# 12. EDGE-SAFETY / OVERSCAN

Since artwork is moved down and motion continues,
verify no motion exposes container edges.

If needed, use a small overscan buffer.

Example:

```ts
const motionOverscan = 1.02;
const finalScale =
  motionOverscan *
  (shotScale ?? 1) *
  (cropScale ?? 1) *
  scale;
```

Only add this if actual rendered proof shows edge risk.

Do not blindly increase every shot.

---

# 13. ATMOSPHERIC CANVAS — KEEP V1.1 ALIVE

Do not remove the v1.1 atmosphere.

It should remain subtle and deterministic.

Reference structure:

```tsx
export const AtmosphericCanvas: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const frame = useCurrentFrame();

  const t = frame / 30;

  const lightX = 50 + Math.sin(t * 0.16) * 3.6;
  const lightY = 42 + Math.cos(t * 0.13) * 2.8;

  return (
    <AbsoluteFill style={{ backgroundColor: '#F8F1E6' }}>
      {/* paper texture / ambient light */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(
              circle at ${lightX}% ${lightY}%,
              rgba(255, 237, 196, 0.20),
              rgba(255, 237, 196, 0.0) 46%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {children}

      {/* low-level foreground atmosphere */}
      <DustOverlay frame={frame} />
    </AbsoluteFill>
  );
};
```

Dust particles must:
- be deterministic;
- be sparse;
- be low contrast;
- continue over narrative holds;
- not obscure faces/text;
- survive H.264 enough to create subtle life.

Do NOT turn this into visible glitter.

---

# 14. EXAMPLE DETERMINISTIC DUST OVERLAY

If current implementation already works, keep it.

Otherwise the intended pattern is:

```tsx
const MOTES = [
  { x: 8,  y: 22, r: 2.0, speed: 0.14, phase: 0.1 },
  { x: 19, y: 63, r: 1.4, speed: 0.11, phase: 1.7 },
  { x: 37, y: 38, r: 1.8, speed: 0.12, phase: 2.3 },
  { x: 58, y: 74, r: 1.3, speed: 0.10, phase: 0.8 },
  { x: 76, y: 31, r: 1.7, speed: 0.13, phase: 3.1 },
  { x: 88, y: 57, r: 1.2, speed: 0.09, phase: 2.0 },
  { x: 46, y: 86, r: 1.5, speed: 0.12, phase: 4.0 },
] as const;

function DustOverlay({ frame }: { frame: number }) {
  const t = frame / 30;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {MOTES.map((m, i) => {
        const dy = Math.sin(t * m.speed + m.phase) * 12;
        const dx = Math.cos(t * (m.speed * 0.8) + m.phase) * 6;
        const opacity =
          0.08 +
          ((Math.sin(t * 0.35 + m.phase) + 1) / 2) * 0.09;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background: '#D8A35D',
              opacity,
              transform: `translate3d(${dx}px, ${dy}px, 0)`,
              filter: 'blur(0.4px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
```

Do NOT use `Math.random()` at render time.

---

# 15. LAYOUT IMPLEMENTATION — DO NOT HARD-CODE PER SCENE

Do not manually reposition every scene.

The typography/layout update must come from centralized tokens.

Preferred architecture:

```text
brandTypographyTokens.ts
  ↓
Layout.tsx
  ↓
ImageScene / TopicTitle / Subtitle
```

Scene-specific exceptions must be rare and documented.

---

# 16. TITLE FITTING LOGIC

Headline should target 58px.

Only use fallback size when a REAL two-line collision occurs.

Example:

```ts
function resolveTitleFontSize(title: string) {
  if (title.length > 62) return 56;
  return 58;
}
```

Better:
use actual measured text width / layout if the project already supports it.

Never go below 56 for this pass unless human review explicitly requests it.

---

# 17. SUBTITLE FITTING LOGIC

Base:

```text
44px
```

For unusually long two-line chunks:

```text
42px minimum
```

Do not shrink to old 38px globally.

Example:

```ts
const subtitleFontSize =
  isLongTwoLineChunk ? 42 : 44;
```

Keep this deterministic.

---

# 18. HEADLINE / ARTWORK COLLISION CHECK

Create an explicit runtime or test-level geometry assertion.

For the default target:

```text
headline approximate bottom <= 300px
artwork top >= 350px
```

Target visual gap:

```text
~35–60px
```

Do not rely only on DOM existence.

---

# 19. ARTWORK / SUBTITLE COLLISION CHECK

Target:

```text
artwork bottom <= 1400px
subtitle primary line center >= ~1560px
```

There must be visible breathing space.

Subtitle may overlap the bottom zone conceptually,
but must NOT overlap the actual artwork card.

---

# 20. WATERMARK

Keep exact current values:

```text
top: 40px
right: 40px
width: 250px
opacity: 0.24
animated: false
```

Do NOT center the watermark inside narrative scenes.

Because title is now bigger:
verify the title's right side does not visually collide with the logo.

If collision exists:
- adjust title top/width slightly;
- do NOT move watermark into center;
- do NOT shrink watermark below current locked size without human instruction.

---

# 21. SCENE-SPECIFIC VISUAL CHECKS

After the global token patch,
inspect these scenes especially.

## Scene around phone placement
The user specifically showed this composition.

Verify:
- title larger and readable;
- artwork starts lower;
- woman's face/phone remain inside comfortable crop;
- right-side shelving does not dominate;
- no blank edge exposure during motion.

## Family wide scenes
Verify:
- lowered card does not push table/feet into subtitle region;
- card remains visually large.

## Still-life tabletop
Verify:
- larger subtitle does not collide with card;
- top-down composition remains centered.

## Empty-chair memory shot
Verify:
- card shift downward does not make upper wall feel too empty;
- atmosphere remains visible.

## Question shot
Verify:
- 58px headline + 44px subtitle do not crowd reflective character;
- `AMBIENT_STILL` still visible.

---

# 22. OUTPUT-BASED PROOF — REQUIRED

Do not report PASS from code/tests alone.

Render a patched full video:

```text
scratch/reference-restoration/video001/
video001-reference-restored-v1.2-typography.mp4
```

Expected:

```text
1442 frames
30fps
1080x1920
same authored audio/timing
same 17-beat plan
```

---

# 23. TYPOGRAPHY PROOF

Export at least 6 representative frames:

```text
frame-typo-hook.png
frame-typo-body.png
frame-typo-phone.png
frame-typo-tabletop.png
frame-typo-memory.png
frame-typo-question.png
```

Create:

```text
typography-before-after.jpg
```

For each selected scene:
- left = v1.1
- right = v1.2

Show:
- title size;
- subtitle size;
- artwork top position;
- card bottom position.

---

# 24. FRAMING PROOF

Create:

```text
framing-proof-v1.2.jpg
```

Include:
- former known bad framing scenes;
- phone scene shown by user;
- family wide;
- question scene.

Verify:
- outer card still centered;
- left/right margins balanced;
- no blank columns;
- no crop regression.

---

# 25. MOTION REGRESSION PROOF

Because layout changed, verify motion still works.

Create:

```text
motion-proof-v1.2.jpg
```

Show start/mid/end for:

```text
~5–7s
~19–22s
~26–29s
~43–45s
```

PASS only if v1.2 preserves at least the v1.1 perceived motion level.

Do not reduce movement just because card position changed.

---

# 26. CONTACT SHEET

Create:

```text
v1.2-2s-montage.jpg
```

Sample every 2 seconds from actual rendered output.

Review the whole visual rhythm.

---

# 27. TESTS — IMPORTANT CODE ASSERTIONS

Update existing focused tests.

Example:

```ts
describe('HAY & ĐẸP typography/layout v1.2', () => {
  it('uses a visibly larger title baseline', () => {
    expect(TITLE_TYPOGRAPHY.fontSize).toBeGreaterThanOrEqual(56);
  });

  it('uses a visibly larger subtitle baseline', () => {
    expect(SUBTITLE_TYPOGRAPHY.fontSize).toBeGreaterThanOrEqual(42);
  });

  it('keeps title to max 2 lines', () => {
    expect(TITLE_TYPOGRAPHY.maxLines).toBe(2);
  });

  it('moves artwork below the enlarged title zone', () => {
    expect(SAFE_ZONES.artworkTop).toBeGreaterThanOrEqual(350);
  });

  it('keeps centered artwork margins', () => {
    expect(SAFE_ZONES.artworkLeft).toBe(90);
    expect(SAFE_ZONES.artworkWidth).toBe(900);
  });
});
```

And composition regression:

```ts
it('editorial-left keeps centered outer geometry', () => {
  expect(COMPOSITION_PRESETS['editorial-left'].left).toBe(90);
  expect(COMPOSITION_PRESETS['editorial-left'].width).toBe(900);
});

it('editorial-right keeps centered outer geometry', () => {
  expect(COMPOSITION_PRESETS['editorial-right'].left).toBe(90);
  expect(COMPOSITION_PRESETS['editorial-right'].width).toBe(900);
});
```

Motion regression:

```ts
it('does not allow long narrative STILL to remain frozen', () => {
  const resolved = resolveRuntimeMotion({
    profile: 'STILL',
    durationFrames: 120,
    isNarrative: true,
  });

  expect(resolved.endScale).toBeGreaterThan(resolved.startScale);
});
```

Adapt to actual APIs.
Do not create fake functions solely for tests.

---

# 28. ACCEPTANCE GATES

PASS only if ALL are true:

## Typography
```text
headline visibly larger than v1.1
subtitle visibly larger than v1.1
headline max 2 lines
Vietnamese diacritics clean
```

## Layout
```text
artwork visibly lower than v1.1
artwork still large
artwork centered
no headline/artwork collision
no artwork/subtitle collision
```

## Framing
```text
no regression to left/right shifted outer cards
no blank side columns
no clipped main subject
```

## Motion
```text
v1.1 perceived-motion patch preserved
known static intervals do not regress
atmosphere remains alive
```

## Brand
```text
watermark remains top-right
250px width
0.24 opacity
static
```

## Rhythm
```text
17-beat restored shot plan unchanged
hard-cut cadence unchanged
```

## Technical
```text
full render succeeds
npm test passes
no image-generation calls
no new assets
```

---

# 29. FAIL CONDITIONS

FAIL if ANY occur:

```text
headline is effectively same size as before
subtitle still feels small on mobile
artwork becomes visibly too small
artwork shifts sideways again
new headline overlaps watermark
subtitle overlaps artwork
motion becomes weaker than v1.1
atmosphere disappears
blank edge exposure during push/drift
new image generation is performed
17-beat plan is rewritten
```

---

# 30. FINAL REPORT FORMAT

Return exactly:

## A. Typography Changes
Report:
```text
old title size -> new title size
old subtitle size -> new subtitle size
old artwork top -> new artwork top
old artwork height -> new artwork height
```

## B. Layout Geometry
Report:
```text
watermark box
title zone
artwork box
subtitle zone
```

## C. Code Changes
List actual modified files.

For each file:
- describe exact change;
- quote key constant values;
- confirm no unrelated refactor.

## D. Motion Preservation
Show that V1.1 motion survived.

## E. Visual Proofs
Paths:
```text
typography-before-after.jpg
framing-proof-v1.2.jpg
motion-proof-v1.2.jpg
v1.2-2s-montage.jpg
```

## F. Remaining Weaknesses
Be explicit.

## G. Tests
Report exact test count.

## H. Output Video
Path + bytes + frames + fps + resolution.

## I. Verdict

Exactly one:

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.2 — PASS
```

or

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.2 — FAIL
```

Then STOP.

Do NOT start Production Batch 01 automatically.
Do NOT touch video005/007/013/028 yet.
Wait for human review of the v1.2 MP4.
