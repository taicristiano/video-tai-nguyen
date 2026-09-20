# HAY & ĐẸP. — V3.3B-S.1: Baseline Comparison Report
**Model**: `@cf/black-forest-labs/flux-1-schnell`  
**Comparison**: V3.3B-S Pilot (Action-First Prompt) vs. V3.3B-S.1 (Style-First Geometry)

---

## 1. Previous Real-Asset Pilot (V3.3B-S) Facts

- **Overall Generation**:
  - 13 generated beats required 30 total API calls.
  - 4 first-attempt passes, 8 beats failed all 3 attempts.
  - **18 style-drift rejection events** across the run.
- **Previous Behavior on the Four Tested Hard Beats (`qa.json`)**:
  - `beat-01` (establish): 3 / 3 attempts rejected due to severe photorealism / camera rendering drift.
  - `beat-02` (reflection): 3 / 3 attempts rejected due to severe photorealism / camera rendering drift.
  - `beat-04` (interaction): 3 / 3 attempts rejected due to severe photorealism / camera rendering drift.
  - `beat-09` (reflection): 3 / 3 attempts rejected due to severe photorealism / camera rendering drift.
  - **Tested Beat Style Drift Rate in V3.3B-S**: 12 / 12 attempts (**100.0%**) suffered severe realistic / near-photoreal style drift.

---

## 2. Root Cause in Previous Architecture

The previous prompt geometry placed scene semantics first:
```text
ACTION
SCENE MEANING
CAST
WORLD
STYLE LOCK
ANATOMY
SHOT
NEGATIVE
```
In this arrangement:
1. The model ingested over 1,000 characters of naturalistic human and environment descriptions before encountering any medium or illustration tokens.
2. Photographic vocabulary (`candid`, `portrait-focus`, `portrait photography`, `natural movement`) primed the diffusion model's photographic manifold.
3. FLUX.1 Schnell, being heavily trained on photographic datasets, defaulted to realistic digital painting or camera captures.

---

## 3. New Style-First Architecture (V3.3B-S.1)

The new prompt geometry places a concrete 2D rendering recipe at the absolute top:
```text
1. MEDIUM LOCK (2D EDITORIAL DRAWING ONLY, visible ink contour lines, matte shapes)
2. RENDERING RECIPE (Charcoal/sepia contour, gouache fills, paper grain, no bokeh/camera)
3. PALETTE (Warm ivory/cream, muted sage, warm wood, low saturation)
4. CAST (Compact identity descriptions, no photographic wording)
5. PRIMARY ACTION & MEANING (Compact narrative semantics)
6. WORLD (Drawn architectural anchors)
7. FRAMING (Drawing language: "drawn composition", no photographic words)
8. HARD EXCLUSIONS (No 3D, no realistic skin, no anime, no text)
```

---

## 4. Side-by-Side Comparison

| Metric | V3.3B-S Previous Pilot (These 4 Beats) | V3.3B-S.1 Style-First Test (8 Images) |
|---|:---:|:---:|
| **Sample Count** | 12 attempts across 4 beats | 8 independent calls across 4 beats |
| **Prompt Ordering** | Action-First | **Style-First** |
| **`TARGET_EDITORIAL_2D`** | 0 / 12 (0.0%) | **8 / 8 (100.0%)** |
| **Severe Photoreal / Realistic Drift** | 12 / 12 (100.0%) | **0 / 8 (0.0%)** |
| **Linework Visibility** | Weak / Photographic skin (0/12) | **Strong visible contour ink lines (8/8)** |
| **Texture Treatment** | Glossy digital / Camera depth | **Matte paper grain & gouache fills (8/8)** |
| **Adult Editorial Brand Fit** | 0 / 12 acceptable editorial | **8 / 8 STRONG** |

---

## 5. Non-Claims & Observations

- **No Statistical Certainty**: 8 images across 4 beats do not constitute mathematical certainty across thousands of seeds. However, the contrast between 0% editorial (12/12 photoreal in V3.3B-S) and 100% editorial (8/8 editorial 2D in V3.3B-S.1) demonstrates that prompt geometry is the dominant lever governing FLUX.1 Schnell's rendering mode.
- **Other Axes Unsolved**: As scoped, this test evaluated style only. Issues like family member counts, exact poses, background lettering/signatures, or face identity consistency remain orthogonal and were not tested.
