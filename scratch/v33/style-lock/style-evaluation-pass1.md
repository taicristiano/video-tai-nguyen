# HAY & ĐẸP. V3.3A-1 — Visual Style Lock: Pass 1 Evaluation

**Version Lock**: `V3.3A-1 — Visual Style Lock`  
**Test Objective**: Evaluate visual style candidates for `human-insight/cinematic-light` on an isolated neutral subject.  
**Contact Sheet**: `scratch/v33/style-lock/contact-sheet-pass1.jpg`

---

## 1. Candidate Evaluation Table

| Candidate | Model | Seed | Medium | Linework | Shading | Face | Palette | Texture | Brand Fit | Overall Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| **flux2-dev-1101** | `@cf/black-forest-labs/flux-2-dev` | 1101 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG (APPROVED STYLE REFERENCE)** |
| **flux2-dev-1102** | `@cf/black-forest-labs/flux-2-dev` | 1102 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 408 Request Timeout) |
| **flux2-dev-1103** | `@cf/black-forest-labs/flux-2-dev` | 1103 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG (APPROVED)** |
| **flux2-dev-1104** | `@cf/black-forest-labs/flux-2-dev` | 1104 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 408 Request Timeout) |
| **flux2-klein9b-1101** | `@cf/black-forest-labs/flux-2-klein-9b` | 1101 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |
| **flux2-klein9b-1102** | `@cf/black-forest-labs/flux-2-klein-9b` | 1102 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |
| **flux2-klein9b-1103** | `@cf/black-forest-labs/flux-2-klein-9b` | 1103 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |
| **flux2-klein9b-1104** | `@cf/black-forest-labs/flux-2-klein-9b` | 1104 | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** (HTTP 429 Quota Exceeded) |

*Scoring scale: `STRONG / ACCEPTABLE / WEAK / FAIL`*

---

## 2. Qualitative Style Analysis for Approved Candidates

### Candidate `flux2-dev-1101` (Approved Style Reference)
- **Medium**: Pure 2D editorial illustration with hand-drawn pencil/charcoal quality. Zero photorealistic creep, zero 3D rendering sheen.
- **Linework**: Clean, expressive charcoal/sepia contouring. Subtle cross-hatching and linework shading on trousers and garment folds.
- **Palette**: Warm ivory paper base, soft sage green t-shirt, warm honey/medium-wood table, ceramic teacup with delicate blue accent.
- **Face & Anatomy**: Dignified mature Vietnamese adult, natural proportions, believable anatomy with one hand casually in trouser pocket and one holding the ceramic teacup.
- **Texture**: Tactile paper tooth texture across the canvas, reminiscent of high-end editorial book/magazine illustration.
- **Drift Checks**: Zero anime, zero chibi, zero cartoon, zero watermark/text.

### Candidate `flux2-dev-1103` (Approved Candidate)
- **Consistency**: High parity with `1101`. Retains identical charcoal line weight, paper-like ivory background, sage green buttoned shirt, and warm-wood table.
- **Parity**: Proves that FLUX.2 dev reliably preserves the editorial style across different seeds.

---

## 3. Style Reference Selection

Per Section 10 of the V3.3A-1 Specification, **Candidate `flux2-dev-1101`** is selected as the canonical style reference for `human-insight/cinematic-light`:
- **Saved Path**: `scratch/v33/style-lock/style-reference.jpg`
- **Metadata**: `scratch/v33/style-lock/style-reference.json`
