# HAY & ĐẸP. Reference Restoration — Current Framing & Composition Audit

**Target Video:** `scratch/production-smoke/video001/final.mp4`  
**Spec Reference:** `videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json`  
**Reference Benchmark:** `resources/video-references/_analysis/HAY_DEP_REFERENCE_MASTER_REPORT.md` & `docs/HAY_DEP_VISUAL_V3_REFERENCE_DERIVED.md`  
**Audit Date:** 2026-09-20  

---

## 1. Executive Summary: The Framing Regression

An audit of the actual rendered production MP4 (`final.mp4`) and its 1 fps contact sheet (`current-1fps-contact-sheet.jpg`) reveals severe composition regressions. The most critical flaw stems from a fundamental misinterpretation in code of what `editorial-left` and `editorial-right` mean:

- In `src/templates/human-insight/cinematic-light/tokens.ts`, `editorial-left` was authored as:
  ```ts
  'editorial-left': {
    top: 300,
    left: 0,
    width: 790,
    height: 1120,
    radius: 32,
  }
  ```
- **Consequence:** The entire image container is anchored to `left: 0`, spanning only `790px` of the `1080px` canvas. This leaves a **290px wide dead blank column (26.85% of total screen width)** completely empty on the right side.
- This failure is sustained for **5.97 seconds in Scene 3** (frames 230–409, seconds 8–14) and **3.57 seconds in Scene 5** (frames 559–666, seconds 19–22).
- The reference videos **NEVER** shift the outer artwork window off-center to leave asymmetric empty voids. Instead, the reference videos maintain a stable, centered visual window and achieve composition bias through **subject placement and internal focal cropping**.

---

## 2. Quantitative Framing Metrics

| Metric | Current Output (`final.mp4`) | Reference Benchmark | Status |
|---|---|---|:---:|
| **Center Window Centering** | Displaced to left in Scenes 3 & 5 (`left: 0`) | Always centered in horizontal canvas | **FAIL** |
| **Dead-Space Left/Right** | Left: 0px (0%), Right: 290px (26.9%) in Sc 3 & 5 | Balanced (≤12–15% each side) | **FAIL** |
| **Canvas Area Occupancy** | 41.7% – 46.9% (isolated card) | 38% – 52% (integrated atmospheric vignette) | **MARGINAL** |
| **Subject Horizontal Centroid** | Off-center (x ≈ 360–395px in Sc 3 & 5) | Visually weighted but balanced (x ≈ 480–600px) | **FAIL** |
| **Shot-Scale Diversity** | Wide: 23%, Med: 54%, Close: 0%, Detail: 15% | Wide: 22%, Med: 44%, Close: 20%, Detail: 14% | **FAIL** |
| **Silhouette Diversity** | Identical 900x1080 rectangle in 6/12 scenes | Dynamic alternation of wide, medium, detail, close | **FAIL** |

---

## 3. Scene-by-Scene Framing Analysis

### Scene 1 (Hook, Frames 0–141, 4.70s)
- **Geometry:** `portrait-focus` (top: 300, left: 90, width: 900, height: 1080).
- **Framing:** Centered, wide shot of family at table. Balanced margins (90px each side).
- **Issue:** Held for 4.70s with zero scale change; lacks progressive focus into the emotional interaction.

### Scene 2 (Body, Frames 141–230, 2.97s)
- **Geometry:** `portrait-focus` (900x1080).
- **Framing:** Adult serving rice. Centered. Good proportion, but identical silhouette to Scene 1.

### Scene 3 (Body, Frames 230–409, 5.97s) — **CRITICAL FAILURE**
- **Geometry:** `editorial-left` (top: 300, left: 0, width: 790, height: 1120).
- **Framing:** Container snapped to canvas left edge (`left: 0`). The entire right 290px (26.85% of canvas) is an empty ivory desert.
- **Duration:** 179 frames (~6.0 seconds) of unbalanced, left-heavy composition.
- **Subject:** Parent and child interacting. By placing them on the left half of the screen, the composition feels broken and amateurish, not editorial.

### Scene 4 (Body, Frames 409–559, 5.00s)
- **Geometry:** `detail-insert` (top: 440, left: 0, width: 1080, height: 820).
- **Framing:** Full-width horizontal band.
- **Issue:** Held for 5.0s. The artwork contains both person and phone on shelf, but because it's a static wide-medium band, the narrative punch ("chiếc điện thoại được đặt sang một bên") is diluted across 5 full seconds.

### Scene 5 (Body, Frames 559–666, 3.57s) — **CRITICAL FAILURE**
- **Geometry:** `editorial-left` (top: 300, left: 0, width: 790, height: 1120).
- **Framing:** Identical left-shifted container as Scene 3. Massive blank space on right side.
- **Subject:** Parent returning home with bag, child at desk. Left-skewed balance.

### Scene 6 (Body, Frames 666–773, 3.57s)
- **Geometry:** `portrait-focus` (900x1080).
- **Framing:** Centered. Reverts abruptly from left-skew to centered box, accentuating visual instability.

### Scene 7 (Body, Frames 773–871, 3.27s)
- **Geometry:** `portrait-focus` (900x1080).
- **Framing:** Centered adult holding bowl. Identical framing box to Scene 6 and Scene 2.

### Scene 8 (Body, Frames 871–1058, 6.23s)
- **Beat 1 (871–956, 2.83s):** `portrait-focus` (900x1080). Centered adult waiting at table.
- **Beat 2 (956–1058, 3.40s):** `detail-insert` (1080x820). Full-width top-down tabletop.
- **Assessment:** Beat switch is effective, but Beat 1 uses the exact same centered rectangle as Scenes 1, 2, 6, 7.

### Scene 9 (Body, Frames 1058–1261, 6.77s)
- **Beat 1 (1058–1136, 2.60s):** `paper` (top: 380, left: 90, width: 900, height: 960). Centered memory card with paper border.
- **Beat 2 (1136–1261, 4.17s):** `portrait-focus` (900x1080). Afternoon interior with empty chairs. Held statically for 4.17s.

### Scene 10 (Question, Frames 1261–1381, 4.00s)
- **Geometry:** `portrait-focus` (900x1080). Adult holding cup with question card overlay. Held statically for 4.00s.

### Scene 11 (Outro, Frames 1381–1442, 2.03s)
- **Geometry:** Outro card (1080x1920 with vertical vignette).

---

## 4. Root Cause of Framing Regression

1. **Literal container shift instead of internal focal crop:**
   `tokens.ts` defined `editorial-left` by altering `left: 0` and `width: 790`. In professional vertical video, editorial asymmetry is created by framing the subject inside a centered visual window with negative breathing room, NEVER by pushing the window to one screen border and leaving a blank margin on the opposite side.
2. **Lack of shot scale progression:**
   There are ZERO close-up portraits in the video. The viewer is kept at an arm's length (medium shot) across almost the entire piece.
3. **Framing safety violation:**
   The right-side margin in Scenes 3 and 5 is 290px, which is **26.85%** of the 1080px canvas width—far exceeding the acceptable 12–15% threshold.

---

## 5. Required Framing Corrections

1. **Center Window Architecture:**
   The outer visual window for standard narrative shots MUST remain centered on the 1080px canvas (e.g. `left: 60px..90px`, `width: 900px..960px`).
2. **Internal Focal Crop for Editorial Bias:**
   `editorial-left` and `editorial-right` must be implemented via `objectPosition: '30% center'` or `'70% center'` within a centered outer window, keeping the canvas balanced while guiding the eye.
3. **Integration of Close-Up & Detail Scales:**
   Introduce tightly framed emotional close-ups and focused detail inserts (e.g. hands serving rice, facial expression, chopsticks, warm steam) to break the monotony of the 900x1080 box.
