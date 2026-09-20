# Template Spec Rules: human-insight/cinematic-light

Read this document before running Step 6 (Spec) and Step 7 (Coder) when `--template human-insight/cinematic-light` is specified.

---

## What this template is: Editorial Engine V2

Philosophy, life wisdom, editorial lifestyle, and personal growth videos. Built as a multi-layout **Editorial Engine V2** to prevent slideshow feel while preserving the quiet, tactile minimalism of `HAY & ĐẸP.`:

- **Brand**: **HAY & ĐẸP.** (H&Đ.)
- **Slogan**: **Điều hay để biết. Điều đẹp để giữ.** (intro-only, hidden in normal narrative scenes)
- **Brand Asset**: `public/assets/human-insight/brand/hay-dep-mark-sage.png` (Deep Sage `#465B49` mark on cream, opacity ~0.82)
- **Palette**: Ivory `#F6F1E8`, Warm Cream `#F7F2EA`, Charcoal `#302D28`, Deep Sage `#465B49`, Muted Sage `#71806C`, Warm Accent `#C79A72`
- **Container Mix (`visualContainer`)**:
  - `canvas` (Default ~60–70%): Seamless borderless canvas integration with soft natural frame.
  - `paper` (~20–30%): Tactile paper card with washi tape accent (`#FFFCF7`), subtle natural tilt (`±1.1°`).
  - `statement` (≤10%): Full quote/milestone card.
- **Micro-Motion Contract**: Every normal image scene has deterministic micro-motion (scale 1.010–1.035, max pan ±8px, translateY ±4px).
- **9 Deterministic Motion Presets**:
  `still-breathe`, `slow-push`, `slow-pull`, `drift-left`, `drift-right`, `rise-soft`, `foreground-parallax`, `focus-shift`, `emotional-hold`.
- **Secondary Framing Shift**: Scenes > 3.5s (105f) feature an intentional mid-scene reframe over 18f using Hermite smoothstep (`3x² - 2x³`), keeping scenes dynamic without aggressive zoom.
- **Visual Beats (`visualBeats`)**: Backward-compatible multi-beat clauses per narration segment (1.5–3.2s standard beat, 3.2–4.5s emotional hold).
- **Character Universe & Cast Lock**: 8 registered cast IDs (`family-young-01`, `couple-young-01`, `parents-middleage-01`, etc.) with deterministic seed hierarchy (`videoSeed -> castSeed -> sceneSeed`).
- **Header Dynamics (V2 Hierarchy)**:
  - `intro`: Full logo mark + headline + slogan (slogan fades out frames 105–132, completely hidden 135+).
  - `normal`: Headline visible at `opacity: 0.86`, persistent dark-sage mark at `opacity: 0.82`, slogan hidden.
  - `statement` / `question`: Headline dimmed or hidden, focusing attention on the core message.
  - `outro`: Header dissolves 20f before outro.
- **Dedicated 9:16 Outro V2**: Branded vertical artwork (`public/assets/human-insight/brand/outro-9-16.png`) held for 60 frames (2.0s), 8–10f fade-in, scale 1.02 -> 1.00, no voiceover. Fallback to React typography if missing.
- **Asset Tiers Priority**: `HAYDEP_CORE` (+25) → `HAYDEP_COMPATIBLE` (+10) → generate → `LEGACY_NEP` (0). `REJECT_OFFSTYLE` excluded.
- **Duration Policy**: Never artificially stretch scenes. Render duration = `voice + natural pauses + question + 60f outro`.

---

## Content Format Contract: HAY & ĐẸP.

| Format | Recommended Duration | Word Count | Use Case |
|---|---|---|---|
| **Family / Emotional Insight** | **30–50s** | ~80–130 words | Intimate personal reflection, family dinner, home values |
| **Practical HAY.** | **45–65s** | ~120–170 words | Daily life habits, practical wisdom, work-life balance |
| **Explanatory / Deep** | **65–85s** | ~170–230 words | Multi-part perspectives, philosophical essays |

*Voice & Ending Rule*: Natural voice pacing. Interactive question ending. Slogan and branding are never spoken in voiceover; they appear visually in the layout and OutroCard.

## Step 6 Output (Spec)

Create `videos/<slug>/spec.json`:

```json
{
  "templateId": "human-insight/cinematic-light",
  "slug": "<slug>",
  "totalFrames": <number>,
  "video": {
    "title": "<Vietnamese title — concise, max 8 words>",
    "bgMusic": "<defaultBgMusic from src/templates/registry.ts>"
  },
  "scenes": [...]
}
```

---

## Editorial Pacing Rules (REQUIRED for Step 6)

1. **No consecutive repeats**: Never use the same layout for more than 2 consecutive scenes.
2. **Visual beat every 10–15 seconds**: Alternate rhythmically:
   `STANDARD → STANDARD → FOCUS → STANDARD → CHAPTER → STANDARD → STATEMENT → STANDARD → FOCUS...`
3. **Focus scene selection**: Assign `focus` to scenes describing concrete physical objects, trouble spots, or intimate details (e.g. desks, kitchens, paper clutter, charging cables).
4. **Statement scene selection**: Assign `statement` to major philosophical epigrams / conclusions (maximum 1 per 25–35 seconds).
   - Hold: 2.20s total (66 frames: 0.3s enter, 1.47s clean still hold, 4f text fade, 9f blank card dissolve).
   - Typography: 48px bold 700 uppercase, formatted into 3 balanced lines.
5. **Chapter scene selection**: Assign `chapter` with `sectionCard: { number, title }` to major numbered milestones (`01`, `02`, `03`).
6. **Caption mode balance & Inactive Legibility**:
   - 70% `phrase` (important/active sentences)
   - 20% `plain` (transitional/calm sentences without bold jumping)
   - 10% `statement` (scenes with central quote cards)
   - Inactive text opacity: `0.52` (+15% legibility increase), allowing users to read the whole sentence comfortably.
7. **Question Card Timing Contract (MANDATORY)**:
   - Question cards (`01`, `02`, `03`) are deliberate thought pauses, never quick flashes.
   - Total duration: 2.53s (76 frames) for Q1 & Q2; 2.87s (86 frames) for Q3 (+0.2s breathing room).
   - Breakdown: 0.30s enter (9 frames) → 1.80s (Q3: 2.13s) clean still hold → 4 frames text fade out → 9 frames blank card dissolve (zero text ghosting over illustration).
   - Typography: 45px bold 700 uppercase, letterSpacing 0.07em, formatted into 2 concise lines (e.g. `MÌNH SẼ DÙNG\nNÓ Ở ĐÂU?`), without subtitle.
   - Voice narration reads the question synchronously with the card. Subtitles are suppressed during the card pause to prevent split attention.
8. **Camera Shot Reframe Rules for Long Scenes (MANDATORY)**:
   - **No continuous creeping zoom**: The viewer must experience distinct, steady held shots separated by intentional mid-scene reframes ("camera vừa đổi framing" chứ không phải "ảnh đang từ từ phóng to").
   - **Scenes > 6.0s**: 2 Distinct Editorial Shots:
     * Shot A: `scale: 1.00`, `x: 0`, `y: 0` (Wide) held steady until beat reframe (~4.0–4.5s).
     * Reframe Transition: 20–21 frames (~0.67–0.70s) Hermite cubic easeInOut step.
     * Shot B: `scale: 1.08`, `x: -20`, `y: -6` (Medium / Detail) held steady until scene end.
   - **Scenes < 6.0s**: Held steady baseline at `1.01` (zero camera drift).
9. **Conclusion & Outro Flow (Dynamic via scene.isOutro / headerMode)**:
   - Final narration scene ends with the interactive question.
   - Last 20 frames before outro: Title and top header logo dissolve smoothly (1.0 -> 0).
   - Outro Scene (`isOutro: true`, `headerMode: 'hidden'`, 60 frames / 2.0s):
     * Logo `assets/human-insight/brand/hay-dep-mark.png` + `HAY & ĐẸP.` + slogan `Điều hay để biết. Điều đẹp để giữ.`
     * Tranquil ending visual without voiceover.

---

## Music Selection (REQUIRED)

Use the configured `defaultBgMusic` from `src/templates/registry.ts`.
Write that value to `spec.json`:

```json
"video": {
  "bgMusic": "assets/human-insight/music/music-bg-2.mp3"
}
```

If the resolved audio policy disables music, set `"bgMusic": null`.

---

## Image Selection (REQUIRED)

1. Read `public/assets/human-insight/manifest.json`.
2. For every narration scene, run the selector below. Do not manually choose an
   image by scanning the manifest because the selector applies semantic scoring
   across `keywordsVi`, `tags`, description, mood, and character continuity.
```bash
npm run human-insight:image -- \
  --text "<audioSegment.text>" \
  --type "<hook|body|stat|ending>" \
  --mood "<overall mood>" \
  --character "<male|female|neutral>" \
  --visual "<one concrete sentence describing what should visibly appear in this scene>" \
  --generate
```
3. `--visual` is required for every scene. Describe concrete visible content
   (person/action/place/objects/composition), not an abstract emotion. This same
   description is used both for semantic matching and as the Cloudflare image
   generation prompt when no existing asset is confident enough.
4. Reuse an existing manifest image only when the selector reports a confident
   semantic match. Mood, stress, sadness, hope, or other emotion-only overlap is
   not enough. When confidence is low, let `--generate` create a scene-specific
   Cloudflare image instead of forcing a vaguely related library image.
5. Use the returned `image.assetId` and `image.path` in `spec.json`.
6. Never use the same `assetId` for two consecutive scenes. Pass the previous
   scene asset through `--exclude <assetId>` when selecting the next scene.
7. Alternate Ken Burns direction between `zoom-in` and `zoom-out`.

---

## Scene Format in spec.json

```json
{
  "type": "body",
  "layout": "standard" | "focus" | "statement" | "chapter",
  "headerMode": "full" | "dimmed" | "logo-only" | "hidden",
  "captionMode": "phrase" | "plain" | "statement",
  "startFrame": 310,
  "durationFrames": 279,
  "audioSegment": {
    "start": 10.32,
    "end": 19.62,
    "text": "..."
  },
  "image": {
    "assetId": "digital-distraction-01",
    "path": "assets/human-insight/images/digital-distraction-01.png",
    "kenBurns": {
      "direction": "zoom-out",
      "startScale": 1.08,
      "endScale": 1.0
    }
  },
  "sectionCard": {
    "number": "01",
    "title": "CÂU HỎI ĐẦU TIÊN",
    "subtitle": "mình sẽ dùng nó ở đâu?"
  },
  "insightText": "MỘT MÓN ĐỒ KHÔNG BAO GIỜ CHỈ LÀ GIÁ TIỀN"
}
```

*(Note: `sectionCard` is used when `layout === "chapter"`; `insightText` is used when `layout === "statement"`).*

---

## Step 7 (Coder)

Coder agent uses the standard pattern below to build `src/VideoContent.tsx`:

```tsx
import React from 'react';
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from 'remotion';
import {
  Layout,
  ImageScene,
  SectionCard,
  InsightCard,
  OutroCard,
  type HumanInsightSpec,
  type SceneWindowInfo,
} from './templates/human-insight/cinematic-light';
import { TRANSITION_SFX, type TransitionSfxName } from './templates/creative/free-style-sfx';
import specData from '../videos/<slug>/spec.json';

interface SpecWithSfx extends HumanInsightSpec {
  scenes: (HumanInsightSpec['scenes'][number] & {
    entrySfx?: {
      name: TransitionSfxName;
      volume?: number;
      reason: string;
    };
  })[];
}

const spec = specData as SpecWithSfx;

// Automatically map scene windows for dynamic title & header hierarchy
const sceneWindows: SceneWindowInfo[] = spec.scenes.map((scene) => ({
  startFrame: scene.startFrame,
  durationFrames: scene.durationFrames,
  layout: scene.layout ?? 'standard',
  headerMode: scene.headerMode,
  captionMode: scene.captionMode,
  hasSectionCard: Boolean(scene.sectionCard),
  hasInsightCard: Boolean(scene.insightText),
  isOutro: scene.isOutro,
}));

export const VideoContent: React.FC<{ slug: string }> = ({ slug }) => (
  <Layout
    slug={slug}
    title={spec.video.title}
    bgMusic={spec.video.bgMusic ?? null}
    scenes={sceneWindows}
  >
    <Audio src={staticFile(`${slug}/voice.mp3`)} />
    {spec.scenes.map((scene, i) =>
      scene.entrySfx ? (
        <Sequence
          key={`sfx-${i}`}
          from={scene.startFrame}
          durationInFrames={90}
        >
          <Audio
            src={TRANSITION_SFX[scene.entrySfx.name]}
            volume={Math.min(scene.entrySfx.volume ?? 0.2, 0.25)}
          />
        </Sequence>
      ) : null,
    )}
    <AbsoluteFill>
      {spec.scenes.map((scene, i) => {
        const isLast = i === spec.scenes.length - 1;
        // Keep previous scene alive for 12 frames during the transition to eliminate black/murky dips
        const extraFrames = isLast ? 0 : 12;
        return (
          <Sequence
            key={i}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames + extraFrames}
          >
            {scene.isOutro ? (
              <OutroCard durationFrames={scene.durationFrames} />
            ) : (
              <>
                <ImageScene
                  src={scene.image.path}
                  durationFrames={scene.durationFrames + extraFrames}
                  kenBurns={scene.image.kenBurns}
                  sceneIndex={i}
                  framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                  hasSectionCard={Boolean(scene.sectionCard)}
                  hasInsightCard={Boolean(scene.insightText)}
                  fadeInFrames={scene.sectionCard || scene.insightText ? 40 : 12}
                  fadeOutFrames={12}
                />
                {scene.sectionCard ? (
                  <SectionCard
                    number={scene.sectionCard.number}
                    title={scene.sectionCard.title}
                    subtitle={scene.sectionCard.subtitle}
                    durationFrames={40}
                  />
                ) : null}
                {scene.insightText ? (
                  <InsightCard
                    statement={scene.insightText}
                    durationFrames={40}
                    framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                  />
                ) : null}
              </>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  </Layout>
);
```

---

## Checklist before submitting spec.json

- [ ] `templateId` = `"human-insight/cinematic-light"`
- [ ] `video.title` ≤ 8 Vietnamese words
- [ ] `video.bgMusic` configured
- [ ] Layout variation applied (`standard`, `focus`, `statement`, `chapter`)
- [ ] No more than 2 consecutive scenes share the same layout
- [ ] Chapter cards configured for numbered milestones
- [ ] Outro scene configured at end if requested
- [ ] `totalFrames` = last scene's `startFrame` + last scene's `durationFrames`

---

## Directory & Video Output Rule (Part-based Series)

When generating with context containing `Phần: {i}` (or `Phan: {i}`, `Part: {i}`):
1. **Directory Naming**: Prefix the folder with `phan-{i}-`:
   `videos/phan-{i}-{YYYY-MM-DD}-{slug}/`
   (e.g., `videos/phan-1-2026-09-16-ba-cau-hoi-truoc-khi-mua-mon/`)
2. **Video File Location**: Output directly to the scene directory without an `output/` subfolder:
   `videos/phan-{i}-{YYYY-MM-DD}-{slug}/video.mp4`
   (e.g., `videos/phan-1-2026-09-16-ba-cau-hoi-truoc-khi-mua-mon/video.mp4`)
