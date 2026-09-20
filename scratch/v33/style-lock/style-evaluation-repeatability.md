# HAY & ĐẸP. V3.3A-1 — Visual Style Lock: Repeatability Evaluation

**Version Lock**: `V3.3A-1 — Visual Style Lock`  
**Test Objective**: Measure style repeatability across 4 distinct neutral adult subjects when conditioned on an approved style reference.  
**Style Reference**: `scratch/v33/style-lock/style-reference.jpg` (Candidate `flux2-dev-1101`)  
**Winning Model**: `@cf/black-forest-labs/flux-2-dev`  
**Conditioning Method**: Reference image passed via multipart `input_image_0`  
**Contact Sheet**: `scratch/v33/style-lock/contact-sheet-repeatability.jpg`

---

## 1. Repeatability Comparison Table

| Comparison | Subject Description | Medium | Linework | Shading | Face Style | Palette | Texture | Overall Verdict |
|---|---|---|---|---|---|---|---|---|
| **Reference ↔ Subject A** | Vietnamese man standing beside window holding ceramic cup | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **Reference ↔ Subject B** | Vietnamese woman sitting at wooden table arranging flowers | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |
| **Reference ↔ Subject C** | Vietnamese man reading handwritten note at desk | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **Reference ↔ Subject D** | Vietnamese woman tying apron beside side table | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |

*Scoring scale: `STRONG / ACCEPTABLE / WEAK / FAIL`*

---

## 2. Qualitative Style Analysis for Completed Candidates

### Subject A (`repeat-A.jpg` — 712 KB)
- **Illustration Medium**: Pure 2D editorial illustration. Warm tactile paper tooth across the entire frame. Zero photorealistic creep, zero 3D sheen.
- **Linework**: Fine charcoal / soft sepia line art. Controlled contours with expressive hand-drawn sensibility, matching the line weight of the style reference.
- **Shading**: Gentle, directional soft daylight entering from the window. Subtle cross-hatching and tonal washes on garment folds.
- **Facial Rendering**: Dignified Vietnamese adult male, distinct from the reference subject (different person, identical artistic rendering style). Restrained, contemplative expression.
- **Palette**: Cohesive warm ivory background, muted sage green shirt, warm medium-wood windowsill, simple ceramic teacup.
- **Texture**: Rich tactile paper texture, indistinguishable from the reference medium.

### Subject C (`repeat-C.jpg` — 651 KB)
- **Illustration Medium**: Premium 2D editorial illustration. Rich paper tooth texture matching the established publication look.
- **Linework**: Hand-drawn pencil/charcoal contouring on the desk, the handwritten note, and the subject's hands and posture.
- **Shading**: Warm, dimensional shading that defines volume without breaking into photorealism.
- **Facial Rendering**: Mature Vietnamese male focused calmly on reading a handwritten note. Expressive, quiet dignity. Proportions are anatomically believable and adult.
- **Palette**: Warm ivory base, cream paper note, honey-wood desk, neutral charcoal/sage attire.
- **Texture**: Consistent tactile paper tooth.

---

## 3. Quota & Blocking Analysis for Subjects B & D

- **Subject B & Subject D**: Both requests reached Cloudflare Workers AI and were rejected with:
  ```text
  Cloudflare HTTP 429: "AiError: you have used up your daily free allocation of 10,000 neurons, please upgrade to Cloudflare's Workers Paid plan if you would like to continue usage. code: 4006"
  ```
- Diagnostic cards with exact error metadata were written to `scratch/v33/style-lock/repeat-B.jpg` and `scratch/v33/style-lock/repeat-D.jpg`, and embedded in `scratch/v33/style-lock/contact-sheet-repeatability.jpg`.

---

## 4. Acceptance Rule Checklist (Section 13 & 16)

| # | Acceptance Criterion | Status | Notes |
|---|---|---|---|
| 1 | One approved style reference exists | ✅ **YES** | `flux2-dev-1101` approved in Pass 1 |
| 2 | All 4 repeatability outputs remain 2D editorial | ⚠️ **PARTIAL** | 2/4 generated (both 2D editorial), 2/4 blocked by quota |
| 3 | Zero photoreal drift | ✅ **PASS** | Neither Subject A nor C shows photoreal drift |
| 4 | Zero anime/chibi drift | ✅ **PASS** | Zero anime, manga, chibi, or cartoon aesthetics |
| 5 | Linework remains recognizably consistent | ✅ **PASS** | Line weight and charcoal treatment match Reference exactly |
| 6 | Shading language remains consistent | ✅ **PASS** | Gentle dimensional shading with identical light falloff |
| 7 | Palette remains ivory/cream/sage/warm wood | ✅ **PASS** | Color harmony perfectly sustained across A and C |
| 8 | Texture remains editorial/tactile | ✅ **PASS** | Tactile paper tooth present in all successful generations |
| 9 | At least 3/4 repeat images are STRONG or ACCEPTABLE | ❌ **NO (2/4)** | 2 STRONG, 2 blocked by HTTP 429 quota exhaustion |
| 10 | Zero repeat image is FAIL | ❌ **NO (2 FAIL)** | Subjects B & D failed due to upstream quota |

---

## 5. Verdict

Because Cloudflare's daily free neuron allocation (10,000 neurons/day) was exhausted before Subjects B and D could be synthesized, the repeatability suite is partially complete (2/4 verified STRONG, 2/4 blocked by quota).

Per Section 17 of the V3.3A-1 Specification:
```text
V3.3A-1 STYLE LOCK — PAUSED_QUOTA
```
*(With proven visual proof: FLUX.2 dev successfully demonstrates STRONG style parity and reference-conditioning repeatability for all images generated within quota).*
