# Template Spec Rules: human-insight/cinematic-light

Read this document before running Step 6 (Spec) and Step 7 (Coder) when `--template human-insight/cinematic-light` is specified.

---

## Production Lock Single Source of Truth (SSOT)

This template operates under a locked production specification defined in:
- **Machine SSOT**: [`docs/HAY_DEP_PRODUCTION_LOCK.json`](../../HAY_DEP_PRODUCTION_LOCK.json)
- **Rendered Spec**: [`docs/HAY_DEP_PRODUCTION_LOCK.md`](../../HAY_DEP_PRODUCTION_LOCK.md)
- **Preflight Verification**: `node scripts/validate-production-lock.mjs`

Any modification to background music or template settings automatically synchronizes through the single SSOT.

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
- **Motion Grammar Contract**: Hard cuts between scenes (0-frame transition fades); strictly `translateY = 0` (zero undeclared vertical or horizontal drift).
- **7 Deterministic Motion Profiles**:
  `STILL`, `AMBIENT_STILL`, `PUSH_IN_SOFT`, `PULL_OUT_SOFT`, `DRIFT_LEFT`, `DRIFT_RIGHT`, `DETAIL_PUSH`.
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
- **Duration Policy**: Never artificially stretch scenes. Render duration = `voice + natural pauses + question + 60f outro` (locked target: 70–85s).

---

## Content Format Contract & Unified Content Parser

The template uses `src/templates/human-insight/cinematic-light/contentParserRuntime.mjs` to parse input contexts. It supports:
1. **Concise Format**: structured blocks (`VOICE — CANONICAL`, `INSIGHT CHÍNH`, `VISUAL SEMANTICS`, `STATEMENT GẦN CUỐI`, `FINAL QUESTION — CANONICAL`).
2. **Legacy Format**: labeled sections (`Kịch bản voice:`, `Ưu tiên visual:`, `Yêu cầu dựng:`, `Statement:`).

*Strict Invariant:* The canonical voice narration is extracted verbatim with zero rewriting, omission, or hallucination.

## Canonical Duration & Voice Policy

- **Duration Contract**:
  - **Allowed Duration**: **70–85 seconds** (strictly enforced).
  - **Preferred Target**: **75–80 seconds** (target midpoint: **77.5s**).
- **Narration Pacing Calibration**:
  - If raw narration duration produces an estimated video duration outside 70–85s, the orchestrator applies bounded pitch-preserving audio time-stretch (`ffmpeg atempo`) to calibrate pacing toward the 77.5s midpoint.
  - **Zero Voice Rewrite**: Canonical voice text remains 100% byte/normalized equal before and after calibration. Zero filler words, zero rewriting.
  - If duration cannot be calibrated within 70–85s, the pipeline halts with `BLOCKED` (`AUDIO_DURATION_OUT_OF_RANGE`).
- **Ending & Outro**: The final scene ends with the unnumbered canonical question card, followed by the 60-frame (2.0s) tranquil outro. Slogan and branding are never spoken in voiceover; they appear visually in the layout and OutroCard.

## Visual Semantics & Text-Pollution Hardening Contract

- **WHAT vs. HOW Separation**:
  - Content specifies **WHAT** (`VISUAL SEMANTICS:` / `Ưu tiên visual:` concrete actions, objects, settings).
  - Template specifies **HOW** (editorial illustration style, cream/sage/wood palette, framing, composition, motion).
- **Concrete Voice Semantics > Generic Portrait Fallback**:
  - When the aligned spoken voice span mentions a concrete action or object, the planner must illustrate that specific action/object rather than defaulting to generic relationship/family portraits.
  - Quiet contextual or domestic fallbacks are reserved for abstract lines without concrete objects/actions.
- **Priority Visuals Consumption & Coverage**:
  - Supplied priority visuals are normalized and mapped to the closest corresponding voice spans.
  - Story plan tracks `priorityVisualCoverage` with status `DIRECT`, `PARTIAL`, or `UNMATCHED`.
  - Unmatched feasible priority visuals trigger replanning or a validation error before candidate generation.
- **Strict Text-Pollution Ban**:
  - Generated illustrations must be completely free of readable text, letters, digits, typography, signage, book-cover text, packaging labels, clothing text, pseudo-text, handwriting, or calligraphy.
  - **Signatures & Watermarks Forbidden**: Artist signatures, initials, creator stamps, seals, or corner marks are strictly banned (especially in corners).
- **Text-Bearing Object Substitutions**:
  - Screens/phones: rendered blank or face-down; zero readable text or UI digits.
  - Books/paper: rendered with plain blank covers and text-free pages.
  - Wall art: simple botanical shapes, geometric color blocks, or empty frames; zero typographic prints or quotes.
  - Packaging: plain unlabeled containers with zero barcodes or logos.
- **Human QA as Final Authority**:
  - Automated pre-flight checks may reject invalid prompts or images, but only Human QA (`EXTERNAL_HUMAN`) can approve candidates for production render.

## Step 6 Output (Production Spec)

Create `videos/<slug>/production-render-spec.json`:

```json
{
  "slug": "<slug>",
  "title": "<Vietnamese title — concise, max 8 words>",
  "fps": 30,
  "totalFrames": <number>,
  "width": 1080,
  "height": 1920,
  "brand": "HAY & ĐẸP.",
  "slogan": "Điều hay để biết. Điều đẹp để giữ.",
  "watermarkSrc": "assets/hay-dep/brand/logo-full-horizontal-with-slogan.png",
  "audioSrc": "<slug>/voice.mp3",
  "timelineSrc": "<slug>/timeline.json",
  "audioMode": "full",
  "shots": [
    {
      "shotId": "shot-01",
      "startFrame": 0,
      "endFrame": 75,
      "durationFrames": 75,
      "imageSrc": "assets/human-insight/images/...",
      "framing": "standard",
      "composition": "portrait-focus",
      "shotScale": "medium",
      "motionPreset": "AMBIENT_STILL",
      "storyRole": "establish"
    }
  ],
  "outro": {
    "enabled": true,
    "durationFrames": 60,
    "artworkSrc": "assets/human-insight/brand/outro-9-16.png",
    "brandMarkSrc": "assets/human-insight/brand/hay-dep-mark-sage.png",
    "brandName": "HAY & ĐẸP.",
    "slogan": "Điều hay để biết. Điều đẹp để giữ."
  }
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
7. **Question Card & Zero Blank Transition Invariant (MANDATORY)**:
   - **Dedicated QuestionCard**: For concluding reflection or standalone thought pauses, render the dedicated unnumbered `QuestionCard`. Do not force artificial `01/02/03` numbering or generic filler (like "Bạn nghĩ sao?").
   - **Zero Blank Boundary Invariant**: Underlying illustration canvas remains visible at full opacity behind frosted overlay cards, eliminating 0-opacity canvas dips at scene boundaries.
   - **Timing & Transitions**:
     * Total duration: 2.53s (76 frames) for standard questions; 2.87s (86 frames) for extended reflection (+0.2s breathing room).
     * Breakdown: 0.30s enter (9 frames) → 1.80s clean still hold → 4 frames text fade out → 9 frames blank card dissolve (zero text ghosting over illustration).
     * Typography: 45px bold 700 uppercase, letterSpacing 0.07em, formatted into 2 concise lines (e.g. `MÌNH SẼ DÙNG\nNÓ Ở ĐÂU?`), without subtitle.
     * Voice narration reads the question synchronously with the card. Subtitles are suppressed during the card pause to prevent split attention.
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

## Production Lifecycle & Orchestration Architecture

Production for `human-insight/cinematic-light` is owned end-to-end by the canonical orchestrator (`scripts/human-insight-production-orchestrator.mjs`).

### Resumable Lifecycle & Human QA Gating

1. **Initial Start (`/gen-video`)**:
   - Production lock preflight check (`scripts/validate-production-lock.mjs`).
   - Content parsed via `contentParserRuntime.mjs` (`canonicalVoice`, `statementText`, `finalQuestionText`).
   - Voice and Timeline synthesis via `ensureVoiceAudio` and `ensureTimeline`. Duration verified against 70–85s contract; automatic pitch-preserving pacing calibration applied if needed.
   - Story planning via `buildStoryPlan` (`story-plan.json`).
   - Candidate image generation via shared `generateHumanInsightShot` (`@cf/black-forest-labs/flux-1-schnell`).
   - Assembly of `review-manifest.json` (`HUMAN_QA_REVIEW_V1`).
   - Transitions to `PENDING_HUMAN_IMAGE_QA` and **MANDATORY STOP**. AI auto-pass is strictly forbidden.
   - Human reviews candidates and records approval via:
     `node scripts/record-human-review.mjs --slug=<slug> --action=image-pass-all`

2. **Resume after Human Image QA (`/gen-video --resume=<slug>`)**:
   - **Selective Retry on FAIL**: If any shot has `FAIL_HUMAN_QA`, only the failed shots are selectively regenerated (Attempt 2 or Attempt 3, max 3 attempts). Attempt counter is incremented (Human rejection consumes 1 attempt; 429 quota pause does not). Approved (`PASS_HUMAN_QA`) shots are preserved untouched. Candidates reset to `PENDING_HUMAN_QA` and halts at `PENDING_HUMAN_IMAGE_QA`.
   - **Promotion & Materialization on PASS**: When all shots have `PASS_HUMAN_QA` with `reviewSource: 'EXTERNAL_HUMAN'`, approved assets are promoted (`approved-image-manifest.json`), materialized into canonical paths (`public/assets/human-insight/final/<slug>/`), and official spec is built via `buildProductionRenderSpec`.
   - Remotion render executes via `renderProductionVideo.mjs`. Render checks actual MP4 duration in [70, 85]s.
   - Review artifacts generated (contact sheet, transition strip).
   - Transitions to `PENDING_HUMAN_VIDEO_QA` and **MANDATORY STOP**. AI auto-pass is strictly forbidden.
   - Human reviews video and records approval via:
     `node scripts/record-human-review.mjs --slug=<slug> --action=video-pass`

3. **Resume after Human Video QA (`/gen-video --resume=<slug>`)**:
   - Verifies explicit `PASS_HUMAN_VIDEO_QA` approval recorded from `EXTERNAL_HUMAN`, SHA-256 hash-bound to `video.mp4`.
   - Packages distribution zip (`packageProduction.mjs`).
   - Transitions to `COMPLETE`.

### Canonical Motion Profiles

The template supports strictly the 7 canonical motion profiles:
- `STILL`: Steady contemplative hold.
- `AMBIENT_STILL`: Subtle organic breathing hold.
- `PUSH_IN_SOFT`: Gentle forward push for intimacy.
- `PULL_OUT_SOFT`: Gentle pull out for perspective.
- `DRIFT_LEFT`: Slow lateral drift to the left.
- `DRIFT_RIGHT`: Slow lateral drift to the right.
- `DETAIL_PUSH`: Slow push focusing on an action or object detail.

*(Legacy preset names such as `still-breathe`, `slow-zoom-in`, `slow-zoom-out`, `pan-right` remain supported at runtime as backward-compatibility aliases only, not for active authoring).*

---

## Step 7 (Coder / Production Renderer)

The `human-insight/cinematic-light` template uses an **immutable, generic data-driven Remotion renderer**.

> [!IMPORTANT]
> **Zero Shared-Source Mutation Invariant**:
> `src/Root.tsx`, `src/Video.tsx`, `src/VideoContent.tsx`, and template components (`Layout.tsx`, `ImageScene.tsx`, `QuestionCard.tsx`) MUST NEVER be modified per video run.
> All per-video configuration, timing, assets, cards, and audio modes flow strictly through runtime props passed via `props.json` (`{ "spec": <production-render-spec> }`).

Rendering command:
```bash
npx remotion render src/Root.tsx Video --output "videos/<slug>/video.mp4" --codec h264 --props "videos/<slug>/props.json"
```

Or execute the complete generic production render and video QA pack generator:
```bash
node scripts/render-production-video.mjs --slug=<slug>
```

---

## Production Spec & Verification Checklist

- [ ] `templateId` = `"human-insight/cinematic-light"`
- [ ] `title` ≤ 8 Vietnamese words
- [ ] Canonical voice text preserved verbatim (zero rewriting, zero CTA/brand injection)
- [ ] Statement card and unnumbered QuestionCard preserved from parsed content
- [ ] All candidate assets pass Human image QA (`PASS_HUMAN_QA` in `review-manifest.json`)
- [ ] Official spec generated via `build-production-render-spec.mjs`
- [ ] Outro configured at end (60 frames / 2.0s)
- [ ] Human video QA approval recorded before packaging

---

## Directory & Video Output Rule (Part-based Series)

When generating with context containing `Phần: {i}` (or `Phan: {i}`, `Part: {i}`):
1. **Directory Naming**: Prefix the folder with `phan-{i}-`:
   `videos/phan-{i}-{YYYY-MM-DD}-{slug}/`
   (e.g., `videos/phan-1-2026-09-16-ba-cau-hoi-truoc-khi-mua-mon/`)
2. **Video File Location**: Output directly to the scene directory without an `output/` subfolder:
   `videos/phan-{i}-{YYYY-MM-DD}-{slug}/video.mp4`
   (e.g., `videos/phan-1-2026-09-16-ba-cau-hoi-truoc-khi-mua-mon/video.mp4`)
