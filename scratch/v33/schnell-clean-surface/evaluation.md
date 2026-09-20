# HAY & ĐẸP. — V3.3B-S.6.1 EVALUATION REPORT

## 1. Executive Summary

- **Task**: Test whether removing all writing/signature/logo/watermark vocabulary from model-facing prompts and replacing it with positive clean-surface composition instructions eliminates artist pseudo-signatures and text pollution on Cloudflare FLUX.1 Schnell.
- **Model**: `@cf/black-forest-labs/flux-1-schnell`
- **Scope**: 4 previously polluted beats (`beat-06`, `beat-07`, `beat-09`, `beat-15`) × 2 independent calls = 8 images.
- **Prompt Validation**: PASSED (0/16 forbidden tokens across all prompts).
- **Result**:
  - **Text Cleanliness**: 4/8 PASS (50%) — Required: >= 7/8 PASS
  - **Style Preservation**: 8/8 PASS (100%) — Required: 8/8 PASS
  - **Per-Beat Clean Sample**: 3/4 beats had >= 1 clean sample (`beat-15` had 0/2 clean samples)
- **Verdict**: `V3.3B-S.6.1 SCHNELL CLEAN-SURFACE GEOMETRY — FAIL`
- **Conclusion**: Prompt-only clean-surface geometry is insufficient to suppress Schnell pseudo-writing reliably. In fact, reserving empty paper space in the bottom-right corner actively invites illustration-signature priors from FLUX.1 training data.

---

## 2. Quantitative Results

| Metric | Target | Actual | Status |
|---|---|---|---|
| Forbidden Tokens Detected | 0 | 0 | PASS |
| Prompt Character Ceiling | <= 2100 | Max 1928 | PASS |
| Style Preservation | 8/8 (100%) | 8/8 (100%) | PASS |
| Text Cleanliness | >= 7/8 (87.5%) | 4/8 (50%) | FAIL |
| Beat Minimum Clean (>= 1/2) | 4/4 beats | 3/4 beats (`beat-15` = 0/2) | FAIL |

---

## 3. Detailed Image-by-Image Human Inspection

### Beat-06 (Single person: Father)
- **Prompt Char Count**: 1928 chars (Forbidden tokens: 0)

#### `beat-06-a.jpg`
- **Style Preserved**: PASS (Clean 2D editorial illustration with sepia contour line and subtle warm paper tone).
- **Unwanted Pseudo-Writing**: NONE (Clean lower-right area; minor squiggly hatch marks on shelf picture frame representing drawn art, no artist signature).
- **Text Cleanliness**: PASS.
- **Visible People Observation**: Exactly 1 adult male (father), hands in pockets. Clean-shaven, glasses present. (Passes people count contract).
- **Anatomy Observation**: Natural proportion, hands cleanly inside pockets, stable neck/torso. PASS.
- **Semantic Observation**: Domestic calm, father standing in living room. PASS.

#### `beat-06-b.jpg`
- **Style Preserved**: PASS (2D editorial illustration, warm gouache fills, brown trousers, tan shirt).
- **Unwanted Pseudo-Writing**: LOWER_RIGHT (Clear artist cursive signature `Mfian Halcan` written in black ink on the white paper margin in the bottom-right corner; secondary micro-scribble along sofa cushion seam).
- **Text Cleanliness**: FAIL.
- **Visible People Observation**: Exactly 1 adult male, hands in pockets. PASS.
- **Anatomy Observation**: Stable human anatomy. PASS.
- **Semantic Observation**: Domestic calm, father standing. PASS.

---

### Beat-07 (Zero person: School/work objects)
- **Prompt Char Count**: 1805 chars (Forbidden tokens: 0)

#### `beat-07-a.jpg`
- **Style Preserved**: PASS (Clean 2D pen/ink architectural line drawing of living room).
- **Unwanted Pseudo-Writing**: LOWER_RIGHT (Distinct handwritten cursive signature `Chcil` in bottom-right corner floor area). Wall frame is cleanly blank (no text inside frame).
- **Text Cleanliness**: FAIL.
- **Visible People Observation**: 0 people visible. PASS.
- **Anatomy Observation**: N/A (0 people).
- **Semantic Observation**: Quiet room/furniture. PASS.

#### `beat-07-b.jpg`
- **Style Preserved**: PASS (2D editorial illustration with warm wood paneling, sofa, coffee table, soft gouache shading).
- **Unwanted Pseudo-Writing**: NONE (Both wall frames are completely clean and blank; bottom-right floor is completely clear; zero text or signature anywhere).
- **Text Cleanliness**: PASS.
- **Visible People Observation**: 0 people visible. PASS.
- **Anatomy Observation**: N/A (0 people).
- **Semantic Observation**: Quiet living room interior. PASS.

---

### Beat-09 (Single person: Mother)
- **Prompt Char Count**: 1892 chars (Forbidden tokens: 0)

#### `beat-09-a.jpg`
- **Style Preserved**: PASS (Delicate 2D editorial illustration with sepia ink contours).
- **Unwanted Pseudo-Writing**: NONE (Completely clean background, sofa, curtain, and bottom-right corner).
- **Text Cleanliness**: PASS.
- **Visible People Observation**: Mother holding a baby/child (2 visible people; contract requested 1 single adult, model hallucinated infant).
- **Anatomy Observation**: Well-formed hands, facial features natural. PASS.
- **Semantic Observation**: Mother in domestic setting. PASS.

#### `beat-09-b.jpg`
- **Style Preserved**: PASS (2D editorial drawing on warm paper, hair bun, beige attire).
- **Unwanted Pseudo-Writing**: NONE (Clean wall frame outline, clean curtains, clean bottom-right corner).
- **Text Cleanliness**: PASS.
- **Visible People Observation**: Exactly 1 adult female (mother) seated in armchair. PASS.
- **Anatomy Observation**: Believable hands, natural profile. PASS.
- **Semantic Observation**: Mother resting serenely. PASS.

---

### Beat-15 (Zero person: Domestic release)
- **Prompt Char Count**: 1834 chars (Forbidden tokens: 0)

#### `beat-15-a.jpg`
- **Style Preserved**: PASS (Warm amber 2D editorial interior illustration).
- **Unwanted Pseudo-Writing**: LOWER_RIGHT & WALL_DECOR (Handwritten cursive artist signature `Obiom ldoyz` in golden ink in bottom-right corner; faint scribble in bottom-left corner; pseudo-caption lettering under picture frame on right wall).
- **Text Cleanliness**: FAIL.
- **Visible People Observation**: 0 people visible. PASS.
- **Anatomy Observation**: N/A (0 people).
- **Semantic Observation**: Peaceful evening living room. PASS.

#### `beat-15-b.jpg`
- **Style Preserved**: PASS (2D editorial drawing, warm wood panel, neutral tones).
- **Unwanted Pseudo-Writing**: LOWER_RIGHT & WALL_DECOR (Prominent cursive artist signature `Aumlan` / `Aum fan` in bottom-right floor; small rectangular wall switch/sign on wood slat).
- **Text Cleanliness**: FAIL.
- **Visible People Observation**: 0 people visible in room (wall art contains stylized illustration of torso/hands). PASS.
- **Anatomy Observation**: N/A (0 people).
- **Semantic Observation**: Empty quiet living room. PASS.

---

## 4. Overall Scorecard

| Beat | Call A | Call B | Clean Rate | Style Rate |
|---|---|---|---|---|
| `beat-06` | PASS (clean) | FAIL (`Mfian Halcan`) | 1/2 (50%) | 2/2 (100%) |
| `beat-07` | FAIL (`Chcil`) | PASS (clean) | 1/2 (50%) | 2/2 (100%) |
| `beat-09` | PASS (clean) | PASS (clean) | 2/2 (100%) | 2/2 (100%) |
| `beat-15` | FAIL (`Obiom ldoyz`) | FAIL (`Aumlan`) | 0/2 (0%) | 2/2 (100%) |
| **Total** | **2/4** | **2/4** | **4/8 (50%)** | **8/8 (100%)** |
