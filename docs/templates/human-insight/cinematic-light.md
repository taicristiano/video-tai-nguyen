# Template Spec Rules: human-insight/cinematic-light

Read this document before running Step 6 (Spec) and Step 7 (Coder) when `--template human-insight/cinematic-light` is specified.

---

## What this template is: Editorial Engine

Philosophy, life wisdom, editorial lifestyle, and personal growth videos. Built as a multi-layout **Editorial Engine** to prevent visual fatigue across 2–3 minute videos while preserving the quiet, tactile minimalism of `NẾP.`:

- **Background**: flat warm cream `#FAECD2` — no gradient
- **Tactile Art Card**: Photos placed in an elegant white paper frame with soft 3D shadow, subtle natural tilt angle (`±1.1°`), and Washi Tape accent.
- **Physical Paper & Viewport Camera**: The physical paper card stays stable on the background while the camera moves *inside* the image viewport using distinct held shots rather than continuous creeping zoom.
- **Editorial Held Shots & Mid-Scene Reframes**: Scenes > 6s use 2 distinct held shots (Shot A held at 1.00 -> 18f (~0.60s) mid-scene reframe -> Shot B held at 1.055, pan -14px, translateY -4.5px) delivering the clear perception that the camera reframed to a closer medium shot without continuous creeping zoom. Short scenes (< 6s) hold steady at 1.01.
- **Header Dynamics (Semi-Persistent Headline Contract)**:
  - `intro: 1.0`: 0–4s, full strength (`opacity: 1.0`, `scale: 1.0`), fades 3.7s–4.5s.
  - `normal: 0.46`: Settles smoothly into a compact breadcrumb (`opacity: 0.46`, `scale: 0.78`, fixed position) across standard illustrations.
  - `question: 0` / `statement: 0`: Fades out in ~9f, completely hidden during card hold, fades back in over 10f to `0.46`.
  - `conclusion: 0.25`: 64s (~0.46) -> 66s (~0.25) -> 68s (0).
  - `outro: 0`: Entire header hidden (`opacity: 0`), giving way to pure centered `NẾP.` outro.
- **4 Layout Variations**:
  - `standard` (~60%): Card `1020x638`, `top: 640`. Balanced layout with title and caption.
  - `focus` (~20%): Big Card `1060x740`, `top: 560`. Title hidden. Camera closer into concrete items/details.
  - `statement` (~10%): Central typography quote card for 2.2s (66 frames) with 1.80s clean still hold before text and card dissolve synchronously together into the underlying illustration (zero blank card frames).
  - `chapter` (~10%): Numbered question break card (`01`, `02`, `03`) for 2.53–2.87s (76–86 frames), title hidden, text fades out 4 frames before blank card dissolves into image.
- **3 Caption Modes**:
  - `phrase` (~70%): Phrase-level highlight (2–4 words) in dark charcoal (`#2C1A0E`, 700 bold), unread text at `opacity: 0.45`.
  - `plain` (~20%): Calm uniform sentence (opacity 0.88, weight 500, no karaoke highlight).
  - `statement` (~10%): Caption bar hidden (quote displayed in center card).
  - Position: `bottom: 22.0%` (calm editorial placement directly below art card).
- **Peaceful Branding Outro**: Final ~2.0s screen with centered `NẾP.` logo and slogan.

---

## Content Format Contract: NẾP. Insight vs Deep

| Format | Target Duration | Word Count | Use Case |
|---|---|---|---|
| **`NẾP. Insight` (Default)** | **70–80s** | ~210–240 words | 1 single core insight, 3 questions or principles. Crisp, profound, leaves breathing space. |
| **`NẾP. Story / Deep`** | 120–180s | ~360–500 words | Narrative development, multi-step storytelling with payoff. |

*Rule*: Unless explicitly requested otherwise, always format as **`NẾP. Insight` (70–80s)**. When script exceeds 90s, cut redundant explanations and keep only the single strongest real-world example per point.

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
9. **Conclusion & Outro Flow (MANDATORY)**:
   - 64s: Article title opacity ~0.46
   - 66s: Article title fades to ~0.25
   - 68s: Article title fades to 0
   - 68.8s: Final illustration finishes fading completely.
   - 68.9–69.3s: Logo emerges gracefully (13 frames fade-in) eliminating any blank gap.
   - 69.3–71.0s: Pure centered `NẾP.` outro screen (Logo + Slogan) held tranquil.

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
