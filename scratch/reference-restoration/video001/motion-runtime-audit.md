# HAY & �?P. Reference Restoration 1.1 � Runtime Motion & Static Hold Audit

**Target Video:** `video001` (*C� nh?ng b?a com sau n�y m?i hi?u l� r?t qu�*)
**Timeline:** 1442 frames, 48.07s @ 30 fps (17 visual beats)
**Audit Type:** Runtime render path inspection for within-shot motion & background atmosphere

## 1. Executive Summary & Root Cause of Static Holds

Direct frame inspection of the previous render (`video001-reference-restored.mp4`) revealed that despite having 17 well-timed beats, five specific intervals felt effectively static to human viewers:

1. **~5.0s�7.0s (Shot 02 / Adult serving rice):** `transformOrigin` was pinned to `center center` with `translateX = 0` and `translateY = 0`. Because the adult and rice bowl were at the center of the card, the 3.5% scale expansion occurred outwards at the perimeter while the focal human subject experienced **0 pixels lateral displacement**.
2. **~19.2s�21.8s (Shot 05 / Parent & child arriving home):** Resolved to `DRIFT_LEFT` with `startScale: 1.02, endScale: 1.03`. The scale delta was only **1.0% over 3.57 seconds** (0.28%/sec), and lateral drift was only 0.2 px/frame. This was below human perceptual threshold on mobile screens.
3. **~23.0s�24.0s (Shot 06 / Domestic detail):** `storyRole: "context"` resolved in `motionGrammar.ts` to **`STILL`**. The STILL profile has `scale: 1.000 -> 1.000` and `translate: 0`. This shot was **literally a 100% frozen image** for 3.57 seconds.
4. **~26.0s�29.0s (Shot 07 / Reflective adult holding bowl):** `focalPoint` was specified as `{ x: 50, y: 45 }`, setting `transformOrigin` to `50% 45%`. The adult's face and bowl were at the exact center of scaling, and zero X/Y drift was applied. The character remained motionless in space.
5. **~43.0s�45.0s (Shot 10 / Question scene):** `storyRole: "question"` resolved to **`STILL`**. The entire 4.00-second question card was **100% frozen** with zero pixel delta.

6. **Atmospheric Canvas Obstruction:** Particles were positioned behind `{children}`, so the opaque 900x1080 art card obscured 83% of the horizontal frame. Moreover, particle color was pale yellow (`#FFE7B8`) at low opacity on ivory, which was destroyed by H.264 chroma subsampling (4:2:0).

## 2. 17-Beat Runtime Motion Matrix (Before vs After)

| # | Shot ID | Frames | Time | Story Role | Scale | Transform Origin | Before Profile & Delta | After Profile & Movement | Perceptibility Status |
|---|---|---|---|---|---|---|---|---|:---:|
| 1 | `shot-01a` | 0�65 | 0.00s�2.17s | `establish` | `wide` | `center center` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 2 | `shot-01b` | 65�141 | 2.17s�4.70s | `establish` | `close` | `48% 55%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 3 | `shot-02` | 141�230 | 4.70s�7.67s | `reflection` | `medium` | `center center` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:-7.65px (-0.850%), dy:-7.02px (-0.650%)) | **PASS** |
| 4 | `shot-03a` | 230�298 | 7.67s�9.93s | `interaction` | `medium` | `45% 50%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 5 | `shot-03b` | 298�409 | 9.93s�13.63s | `interaction` | `close` | `45% 46%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 6 | `shot-04a` | 409�478 | 13.63s�15.93s | `detail-action` | `medium` | `40% 50%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:-7.65px (-0.850%), dy:-7.02px (-0.650%)) | HIGH |
| 7 | `shot-04b` | 478�559 | 15.93s�18.63s | `detail-action` | `detail` | `65% 58%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:-7.65px (-0.850%), dy:-7.02px (-0.650%)) | HIGH |
| 8 | `shot-05` | 559�666 | 18.63s�22.20s | `action` | `medium` | `center center` | DRIFT_LEFT (?1%, dx:21.60px (2.400%)) | DRIFT_LEFT (?1%, dx:21.60px (2.400%), dy:-7.02px (-0.650%)) | **PASS** |
| 9 | `shot-06` | 666�773 | 22.20s�25.77s | `context` | `medium` | `center center` | STILL (?0%, dx:0.00px (0.000%)) | AMBIENT_STILL (?2%, dx:-9.00px (-1.000%), dy:+7.02px (+0.650%)) | **PASS** |
| 10 | `shot-07` | 773�871 | 25.77s�29.03s | `reflection` | `detail` | `50% 45%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:-7.02px (-0.650%)) | **PASS** |
| 11 | `shot-08a` | 871�956 | 29.03s�31.87s | `context` | `medium` | `50% 48%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:-7.65px (-0.850%), dy:-7.02px (-0.650%)) | HIGH |
| 12 | `shot-08b` | 956�1058 | 31.87s�35.27s | `detail-action` | `detail` | `50% 65%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:-7.65px (-0.850%), dy:-7.02px (-0.650%)) | HIGH |
| 13 | `shot-09a` | 1058�1136 | 35.27s�37.87s | `memory` | `medium` | `50% 50%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 14 | `shot-09b1` | 1136�1200 | 37.87s�40.00s | `memory` | `wide` | `center center` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 15 | `shot-09b2` | 1200�1261 | 40.00s�42.03s | `memory` | `close` | `45% 58%` | PUSH_IN_SOFT (?3.5%, dx:0.00px (0.000%)) | PUSH_IN_SOFT (?3.5%, dx:+7.65px (0.850%), dy:+7.02px (0.650%)) | HIGH |
| 16 | `shot-10` | 1261�1381 | 42.03s�46.03s | `question` | `wide` | `center center` | STILL (?0%, dx:0.00px (0.000%)) | AMBIENT_STILL (?2%, dx:-9.00px (-1.000%), dy:+7.02px (+0.650%)) | **PASS** |
| 17 | `shot-11` | 1381�1442 | 46.03s�48.07s | `outro` | `outro` | `center center` | STILL (?0%, dx:0.00px (0.000%)) | STILL (?0%, dx:0.00px (0.000%), dy:0.00px (0.000%)) | NORMAL |

---

## 3. Technical Changes Implemented in Patch 1.1

1. **`AMBIENT_STILL` Added to Motion Policy:**
   - When any narrative beat (> 1.5s) resolves to `STILL`, `ImageScene.tsx` automatically upgrades it to `AMBIENT_STILL`.
   - Applies `scale 1.000 -> 1.020` (2.0% gentle push) + ~9px lateral drift + ~7px vertical drift.
   - Eliminates frozen cards in Scene 6 and Scene 10 without aggressive Ken Burns.

2. **Subtle Monotonic Focal Drift (<= 10px X, <= 8px Y):**
   - Monotonic drift applied to CSS `transform: scale(...) translate(x%, y%)`.
   - Ensures subjects situated at `focalPoint` or `center center` smoothly drift by 7�9px across the hold.
   - Eliminates the static pinning artifact in Scene 2, Scene 5, Scene 7, and Scene 8.

3. **Living Atmospheric Canvas & Foreground Motes Overlay:**
   - Radial gradient illumination center drifts with sinusoidal breathing (�3.6% horizontal, �2.8% vertical) and radius oscillation (�35px).
   - Background particles boosted to warm golden amber (`#E2B165` / `#D89E48`) with higher opacity (0.38�0.55) to survive H.264 video compression.
   - 7 delicate foreground dust motes float continuously over the entire canvas (including the art card) with `pointerEvents: none` and soft glow, ensuring living depth between cuts.
