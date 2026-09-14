# Template Spec Rules: news/media-showcase

Read this document before Step 2, Step 6, and Step 7 when
`--template news/media-showcase` is selected.

This is a **fixed, media-first news slideshow**. It follows a red-and-white
television-news frame with:

- one large image/video viewport;
- a visible source strip attached to the media;
- publication date;
- a short, large headline;
- voiceover, subtitles, and restrained background music.

The images and videos extracted from the supplied URL are the main content.
Do not replace them with stock media, AI media, charts, decorative graphics, or
generic illustrations.

The media viewport is strictly source-media-only:

- Do not generate any content, illustration, diagram, icon, card, quote, stat,
  transition graphic, or explanatory text inside it.
- Do not place labels, badges, headlines, captions, or branding over the media.
- The only elements outside the viewport are the fixed source strip,
  publication date, title, subtitles, and template frame.
- Keep showing source images/videos until the narration ends.
- When the available media runs out, restart from the first selected asset and
  continue cycling in the same order.

## Required URL And Acquisition

The generation context must contain exactly one primary public `http` or
`https` article/content page URL. Extra instructions may accompany it.

Immediately after Step 1, before Planner or TTS, run:

```bash
node scripts/source-evidence.mjs "<page-url>" "<slug>"
```

This creates:

```text
videos/<slug>/source-context.txt
public/<slug>/source-evidence.json
public/<slug>/evidence/image-*.*
```

Use `source-context.txt` as the primary factual input for Planner and Teller.
Use `source-evidence.json` as the only source of slideshow media.

Unlike `creative/source-led-*`, this template requires usable media. Stop before
Planner/TTS when `stats.usableAssetCount` is zero.

The extractor may not obtain protected media from YouTube, TikTok, Facebook,
Instagram, or similar iframe players. Do not fabricate or substitute media when
the page exposes no usable direct asset.

## Media Selection

- Use every relevant usable image/video from the evidence manifest when
  practical.
- Preserve source order where it supports the article narrative.
- Exclude duplicate images, logos, avatars, ads, icons, and unrelated media.
- Do not reuse an asset unless the user explicitly asks for repetition.
- Exception: when there are not enough assets to cover the full video, reuse
  them cyclically in source order until the final frame.
- Each scene contains 1-3 media items.
- Distribute media across narration scenes; multiple items inside one scene
  rotate as a slideshow.
- Keep video muted with `volume={0}`.
- Loop a video clip when its selected interval is shorter than its assigned
  display duration.
- Use `cover` for wide media only when important content remains visible.
- Use `contain` for portrait media, infographics, screenshots, or sensitive
  framing.
- For video, set a relevant `clipStartSeconds` and `clipEndSeconds`. Never
  select an arbitrary interval merely to add motion.

## Planner And Teller

Planner reads:

- `videos/<slug>/context.txt`;
- `videos/<slug>/source-context.txt`;
- `public/<slug>/source-evidence.json`.

Plan 4-8 concise narration segments depending on article length and media count.
The narration explains the article; it must not repeatedly say “trong ảnh” or
“trong video”.

Headlines shown on screen must be factual summaries of the current narration
segment, not captions invented from visual appearance.

## Step 6 Spec

Write:

```json
{
  "templateId": "news/media-showcase",
  "slug": "<slug>",
  "totalFrames": 1200,
  "video": {
    "title": "Tiêu đề duy nhất giữ nguyên xuyên suốt video",
    "date": "17.6.2026",
    "bgMusic": "assets/news/music/nastelbom-soft-music.mp3"
  },
  "source": {
    "articleUrl": "https://publisher.example/article",
    "publisher": "Publisher",
    "evidenceManifest": "<slug>/source-evidence.json"
  },
  "mediaAssets": [
    {
      "id": "image-01",
      "kind": "image",
      "src": "<slug>/evidence/image-01.jpg",
      "storage": "local",
      "sourcePageUrl": "https://publisher.example/article",
      "sourceMediaUrl": "https://cdn.example/image.jpg",
      "credit": "Nguồn: Publisher",
      "caption": "Original caption",
      "alt": "Original alt",
      "width": 1600,
      "height": 900
    }
  ],
  "scenes": [
    {
      "startFrame": 0,
      "durationFrames": 240,
      "audioSegment": {"start": 0, "end": 8, "text": "..."},
      "media": [
        {"assetId": "image-01", "fit": "cover"}
      ]
    }
  ]
}
```

Rules:

- `mediaAssets` contains each selected manifest asset exactly once.
- Every `scene.media[].assetId` resolves to one `mediaAssets[]` entry.
- Every scene contains at least one media item.
- Assign media continuously through all scenes. If the last asset is reached
  before the video ends, return to the first asset.
- `video.title` and `video.date` are global immutable display values.
- Render exactly the same `video.title` and `video.date` for every frame. Never
  derive or replace them from scene narration.
- `video.title` should usually stay under 90 Vietnamese characters.
- Use the article publication date when available; otherwise use the generation
  date and do not label it as the article's publication date in narration.
- Choose one gentle track from `public/assets/news/manifest.json`. Prefer
  `nastelbom-soft-music.mp3` or `miromaxmusic-music-promotion.mp3`; use urgent
  music only for genuinely urgent stories.
- Timing follows `docs/gen-video/common-pipeline.md`.

## Step 7 Coder

Read:

- `docs/remotion-best-practices/SKILL.md`;
- rules for images, videos, sequencing, timing, and subtitles.

Use the fixed components in:

```text
src/templates/news/media-showcase/
```

Implementation outline:

1. Import `Layout`, `MediaShowcaseScene`, and `MediaShowcaseSpec`.
2. Resolve each `scene.media[].assetId` from `spec.mediaAssets`.
3. Render scenes with `<Series>`.
4. Add the normal voiceover `<Audio>`.
5. Pass `spec.video.title` and `spec.video.date` once to the persistent
   `Layout`; do not pass scene-specific alternatives.
6. Pass only publisher, media, and `durationFrames` to each
   `MediaShowcaseScene`.
7. Do not change the frame, palette, typography, media viewport, or headline
   placement per story.
8. Keep subtitles enabled in production and disabled in template-dev.
9. Lock the subtitle active-word color to the template red (`#D92343`).
10. Never render generated content inside the media viewport. It contains only
   the selected `<Img>` or muted `<Video>`.

## Visual Contract

- 1080x1920, 9:16.
- Red vertical rail on the left.
- Pale header band with a black rule.
- Media viewport occupies the dominant upper area.
- Date label sits below the media in a gray rectangle.
- Headline is large, black, and left-aligned.
- Date and headline remain mounted and unchanged for the entire video.
- Source attribution stays visible while media is visible.
- Subtitle active words are red.
- Animations are restrained: fade, slight reveal, gentle Ken Burns for images.
- No logos copied from the reference image.
- No lower-third branding copied from a broadcaster.

## Checklist

- [ ] Context contains one public page URL.
- [ ] Acquisition runs before Planner/TTS.
- [ ] At least one usable image/video exists.
- [ ] Only media from `source-evidence.json` is used.
- [ ] The media viewport contains only images/videos, with no generated overlay.
- [ ] Every visible asset has source attribution.
- [ ] Source video is muted.
- [ ] Media cycles continuously to the end when assets are insufficient.
- [ ] Subtitle active-word color is red.
- [ ] `video.date` and `video.title` remain identical on every frame.
- [ ] Each scene has 1-3 media items.
- [ ] Media is not cropped misleadingly.
- [ ] Background music comes from the news manifest.
- [ ] Scene timing is audio-derived and sums to `totalFrames`.
