# HAY & ĐẸP. Reference Restoration — Current Motion & Pacing Audit

**Target Video:** `scratch/production-smoke/video001/final.mp4`  
**Spec Reference:** `videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json`  
**Reference Benchmark:** `resources/video-references/_analysis/HAY_DEP_REFERENCE_MASTER_REPORT.md` & `docs/HAY_DEP_VISUAL_V3_REFERENCE_DERIVED.md`  
**Audit Date:** 2026-09-20  

---

## 1. Executive Summary: The Perceived Motion / Retention Regression

An in-depth analysis of the current full production render (`final.mp4`) shows that despite programmatic motion presets existing in code (`slow-push`, `still-breathe`, `focus-shift`), the video **visually reads as a static slideshow**.

Human review correctly identified that:
- Scene 7 (frames ~773–871): almost unchanged composition for 3.27s;
- Scene 8 beat 1 (frames ~871–956): almost visually unchanged for 2.83s;
- Scene 9 beat 2 (frames ~1136–1261): static empty chairs held for 4.17s;
- Scene 3 (frames ~230–409): left-shifted static panel held for **5.97s**;
- Scene 4 (frames ~409–559): static horizontal band held for **5.00s**.

In high-performing reference videos, visual energy is NOT driven by imperceptible mathematical zooms. It is driven by **hard cuts to new visual information, changes in shot scale (Wide → Medium → Detail → Close), and alive atmospheric backgrounds** that hold viewer attention.

---

## 2. Quantitative Pacing & Motion Metrics

| Metric | Current Production (`final.mp4`) | High-Performing References | Delta / Gap |
|---|---|---|---|
| **Total Duration** | 48.07 seconds (1442 frames) | ~20s – 180s (Ref 2: 38.8s, Ref 4: 30.2s) | Baseline length |
| **Total Visual Shots** | 13 visual segments (12 cuts) | Equivalent 48s: 15–18 visual shots | -3 to -5 shots |
| **Visual Changes / Min** | **14.98 changes/min** | **18.0 – 22.5 changes/min** | **-20% slower pacing** |
| **Median Visual Hold** | **3.57 seconds** | **3.40 seconds** (core beats: 2.0–3.0s) | Sluggish core hold |
| **Max Near-Static Hold** | **5.97 seconds** (Scene 3) | **4.20 seconds** (max normal: 3.8s) | **+42% over limit** |
| **Holds Exceeding 4.0s** | 5 shots (49.6% of runtime) | ≤ 1 shot (< 8% of runtime) | **Severe static bloat** |
| **Perceptible Camera Motion** | **0 / 13 shots** (sub-pixel drift) | Restrained but visible push/drift | Motion invisible |
| **Background Atmosphere** | 100% Static Flat Color (`#F5EFEB`) | Continuous dust motes / paper texture | Dead background |

---

## 3. Micro-Motion Failure Analysis in Code

### The Illusion of Code-Level Motion
In `src/templates/human-insight/cinematic-light/motion.ts`:
- `slow-push`: `scale = 1.0 + (frame / duration) * 0.025`
  - In Scene 3 (179 frames, 5.97s): The scale changes by 2.5% over 6 seconds. That is **0.42% per second**. In a 900px wide card, the image edges expand by only **1.9 pixels per second**! On a high-DPI mobile screen, 1.9 px/s is sub-threshold to human motion perception. The brain interprets the image as completely still.
- `still-breathe`: `scale = 1.0 + sin(frame * 0.07) * 0.008`
  - Amplitude of 0.8% oscillation over 3 seconds is completely imperceptible without a pixel magnifier.
- `focus-shift`: Pan of 8px horizontally over 179 frames = **1.34 px/sec**. Again, imperceptible.

### The Reference Solution
Reference videos achieve perceived motion through two complementary layers:
1. **Editorial Motion (Primary)**: Frequent, meaningful hard cuts every 2.2–3.4s, alternating shot scale (e.g. from Wide Family to Close Hands with Chopsticks to Detail Bowl).
2. **Atmospheric Motion (Secondary)**: Continuous micro-drift of dust particles, soft light rays, and subtle living background grain that registers subconsciously, giving the feeling that time is breathing inside the scene.

---

## 4. The Five Biggest Gaps Versus Reference Videos

### Gap 1: Severe Slideshow Stagnation (Scene 3 & 4 Holds)
Scene 3 holds for 5.97s and Scene 4 holds for 5.00s. In modern short-form video, holding a single static 2D illustration for 5 to 6 seconds causes immediate drop-off in user retention. The reference videos rarely exceed 3.5–3.8s per shot.

### Gap 2: Asymmetrical Blank Dead Space (Editorial-Left Error)
Scenes 3 and 5 shift the entire card to `left: 0`, leaving a massive 290px (26.9%) empty void on the right. This destroys horizontal visual balance and makes the video feel unpolished and broken.

### Gap 3: Complete Lack of Shot-Scale Dynamic (Zero Close-Ups)
Current production has 0 close-up portraits (0% vs 20% in references). 54% of shots are medium shots at identical camera distances. The visual narrative lacks intimacy, variety, and punctuation.

### Gap 4: Programmatic Micro-Motion Below Visual Threshold
Tiny mathematical transforms (0.5% zoom per second) fail to create any perceptible camera movement. For holds longer than 2.5s, the camera must exhibit a clearly perceptible (yet gentle) push, pull, or focal pan (e.g., 5–8% scale change or targeted 25–40px drift toward the narrative focal point).

### Gap 5: Lifeless, Flat Background Canvas
The current canvas background is a flat, dead ivory fill. Reference videos use warm parchment texture with floating dust motes or glowing bokeh particles, creating depth and a cinematic universe.

---

## 5. Required Motion & Pacing Actions

1. **Re-author Shot Plan to 15–17 Meaningful Beats:**
   Split lengthy narrative moments (Scene 1, Scene 3, Scene 4, Scene 8, Scene 9) into intentional semantic cuts (Wide → Medium → Detail → Close). Eliminate all holds >4.0s.
2. **Increase Visual Change Rate to ≥18/min:**
   Achieve a healthy median hold of 2.5s–3.2s with hard cuts on spoken phrase clauses.
3. **Calibrate Perceptible Motion:**
   Within holds >2.5s, provide visible gentle push/pull (3.5%–6.0% scale drift) or a directed camera pan toward the active subject.
4. **Implement Living Atmospheric Canvas:**
   Introduce subtle paper fiber texture and deterministic, restrained floating dust motes in the background canvas.
