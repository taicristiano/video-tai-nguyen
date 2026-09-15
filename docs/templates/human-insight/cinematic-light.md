# Template Spec Rules: human-insight/cinematic-light

Read this document before running Step 6 (Spec) when `--template human-insight/cinematic-light` is specified.

---

## What this template is

Philosophy, life wisdom, and personal growth videos. Light variant of cinematic-dark. Key characteristics:

- **Background**: flat warm cream `#FAECD2` — no gradient
- **Main content**: real photos (people, nature) displayed full-frame, changing each scene with Ken Burns
- **Fixed title**: floats at `top: 15%`, large bold (`48px 700`), capitalize each word, deep brown `#2C1A0E` with subtle dark shadow
- **Fixed subtitles**: word-by-word highlight in dark `#1A0A00` at the bottom, synced to audio
- **No logo, no header zone, no border**
- **AI only decides**: which image to use per scene + Ken Burns direction (only `zoom-in` or `zoom-out`)

---

## Step 6 Output

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

## Music Selection (REQUIRED)

Use the configured `defaultBgMusic` for this template in
`src/templates/registry.ts`. Do not choose a track by narration mood.

Write that value to `spec.json`:

```json
"video": {
  "bgMusic": "assets/human-insight/music/music-bg-2.mp3"
}
```

If the resolved audio policy disables music, set `"bgMusic": null`.

---

## Image Selection (REQUIRED)

### Step 1: Read the manifest

Read `public/assets/human-insight/manifest.json`. Each asset has:
- `id` — used as `assetId` in spec.json
- `path` — actual file path for rendering
- `desc` — short description of the image
- `tags` — emotion/topic keywords
- `mood` — overall mood of the image

### Step 1.5: Preserve character continuity

Before selecting images, decide whether the narration implies a recurring
character:

- `male` — words like anh, ông, cha, bố, người đàn ông, chàng trai
- `female` — words like chị, cô, mẹ, người phụ nữ, cô gái
- `neutral` — when no gender is implied

Use the same character hint for all scenes about the same person. Avoid one
scene visually implying a man and the next scene implying a woman unless the
script explicitly changes characters.

### Step 2: Map each scene to an image

For each scene:
1. Read `audioSegment.text` — the narration for that segment
2. Run the helper script to score the image library and optionally generate a
   matching low-resolution image:

```bash
npm run human-insight:image -- \
  --text "<audioSegment.text>" \
  --type "<hook|body|stat|ending>" \
  --mood "<overall mood>" \
  --character "<male|female|neutral>" \
  --generate
```

The helper:

- checks `manifest.assets[]` first
- returns an existing asset when it passes the match threshold
- calls Cloudflare Workers AI only when no asset is suitable and
  `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` are configured
- generates a `688x384` JPEG and compresses to quality `70`
- saves the image under `public/assets/human-insight/images/`
- appends a manifest entry with `id`, `path`, `desc`, `tags`, and `mood`
- falls back to the best existing asset if generation is unavailable or fails

Use the returned `image.assetId` and `image.path` in `spec.json`.

### Step 3: No consecutive repeats

- **Never use the same `assetId` for two consecutive scenes**
- If the best match was used in the previous scene, pick the second-best

### Step 4: Ken Burns direction

Only use `zoom-in` or `zoom-out` — no pan (avoids off-center drift):

| Scene content | Ken Burns |
|---|---|
| Hook, strong opening, attention-grabbing | `zoom-in` |
| Body, reflection, contemplation | Alternate `zoom-in` / `zoom-out` |
| Ending, letting go, closing | `zoom-out` |

---

## Scene Timing

Use `docs/gen-video/common-pipeline.md` Shared Timing Contract.

---

## Scene Format in spec.json

```json
{
  "type": "hook" | "body" | "stat" | "ending",
  "startFrame": 0,
  "durationFrames": 210,
  "audioSegment": {
    "start": 0.0,
    "end": 7.0,
    "text": "<text from timeline.json>"
  },
  "image": {
    "assetId": "<id from manifest>",
    "path": "<path from manifest>",
    "kenBurns": {
      "direction": "zoom-in",
      "startScale": 1.0,
      "endScale": 1.08
    }
  }
}
```

---

## Video Title Rules

`spec.json → video.title`:
- Max 8 Vietnamese words
- Must be a title, not a descriptive sentence
- Good: `"Nghệ thuật tha thứ"`, `"Khi bạn cảm thấy mệt mỏi"`
- Bad: `"Video về cách học cách tha thứ cho bản thân và người khác"`

---

## Step 7 (Coder)

Coder agent does NOT design scenes. Instead:

1. Read `videos/<slug>/spec.json`
2. Import components from `src/templates/human-insight/cinematic-light/`
3. Compose `VideoContent.tsx` using the exact pattern below
4. Update `src/Root.tsx` — only change `defaultSlug` and `defaultDuration`

### VideoContent.tsx pattern (use EXACTLY this):

```tsx
import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile } from 'remotion';
import { Layout, ImageScene } from '../templates/human-insight/cinematic-light';
import type { HumanInsightSpec } from '../templates/human-insight/cinematic-light';
import specData from '../../videos/<slug>/spec.json';

const spec = specData as HumanInsightSpec;

export const VideoContent: React.FC<{ slug: string }> = ({ slug }) => (
  <Layout
    slug={slug}
    title={spec.video.title}
    bgMusic={spec.video.bgMusic ?? null}
  >
    <Audio src={staticFile(`${slug}/voice.mp3`)} />
    <AbsoluteFill>
      <Series>
        {spec.scenes.map((scene, i) => (
          <Series.Sequence key={i} durationInFrames={scene.durationFrames}>
            <ImageScene
              src={scene.image.path}
              durationFrames={scene.durationFrames}
              kenBurns={scene.image.kenBurns}
              fadeInFrames={15}
              fadeOutFrames={0}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  </Layout>
);
```

**Do NOT add any custom animations, colors, or layout** — the template handles everything.

---

## Checklist before submitting spec.json

- [ ] `templateId` = `"human-insight/cinematic-light"`
- [ ] `video.title` ≤ 8 Vietnamese words
- [ ] `video.bgMusic` = this template's configured `defaultBgMusic` (or `null`
      when the resolved audio policy disables music)
- [ ] Every scene has: `type`, `startFrame`, `durationFrames`, `audioSegment`, `image`
- [ ] No two consecutive scenes share the same `assetId`
- [ ] `image.path` matches the `path` field in manifest (do not invent paths)
- [ ] Generated images, if any, were created via `scripts/human-insight-image.mjs`
      and saved as `688x384` JPEG quality `70`
- [ ] Recurring character gender stays visually consistent across scenes
- [ ] `totalFrames` = last scene's `startFrame` + last scene's `durationFrames`
