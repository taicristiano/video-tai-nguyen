# HAY & ĐẸP. — V3.3B-S.6 vs V3.3B-S.6.1 COMPARISON

## 1. Context & Hypothesis

- **S.6 Pilot Observation**:
  In V3.3B-S.6, 5 out of 9 generated beats suffered from unwanted pseudo-writing or artist signatures (`beat-06`, `beat-07`, `beat-09`, `beat-10`, `beat-15`).
  The S.6 prompts contained negative exclusion tokens (`No written words`, `No logo`, `No signature`, `No watermark-like marks`).
  Hypothesis: Because Cloudflare FLUX.1 Schnell lacks a negative-prompt channel, these negative tokens paradoxically primed the model to generate writing/signatures.

- **S.6.1 Intervention**:
  Completely removed all 16 forbidden writing-related vocabulary tokens (`text`, `word`, `written`, `writing`, `letter`, `lettering`, `logo`, `signature`, `watermark`, `caption`, `label`, `brand`, `typography`, `font`, `sign`, `signed`).
  Replaced with positive `CLEAN SURFACE POLICY` (plain warm-paper surfaces, simple solid shapes, lower-right area reserved as quiet blank empty space, undecorated frame corners).

---

## 2. Beat-by-Beat Comparison

| Beat | Subject | S.6 Result | S.6.1 Result (Call A / Call B) | Shift & Visual Behavior |
|---|---|---|---|---|
| `beat-06` | Father (single person) | **FAIL** (cursive mark in bottom-right) | **Call A**: PASS (clean)<br>**Call B**: FAIL (`Mfian Halcan` signature) | Partial improvement (50% clean). Reserving bottom-right space prevented text in Call A, but Call B stamped an explicit cursive artist signature directly in that open space. |
| `beat-07` | School/work object (0 people) | **FAIL** (wall decor contained pseudo-lettering) | **Call A**: FAIL (`Chcil` signature in bottom-right)<br>**Call B**: PASS (clean) | Wall decor text was **completely eliminated** (wall frames in both calls are pristine blank canvases). However, Call A spontaneously placed an artist signature in the bottom-right corner. (50% clean). |
| `beat-09` | Mother (single person) | **FAIL** (cursive mark in bottom-right) | **Call A**: PASS (text clean; extra baby)<br>**Call B**: PASS (text clean) | **100% text cleanliness improvement** (0/2 text pollution). Both calls remained free of signatures. (Note: Call A hallucinated a child, violating people count, but text cleanliness passed). |
| `beat-15` | Domestic release (0 people) | **FAIL** (cursive mark in bottom-right) | **Call A**: FAIL (`Obiom ldoyz` signature)<br>**Call B**: FAIL (`Aumlan` signature) | **0% clean (persistent failure)**. Both independent calls placed prominent cursive signatures on the floor in the open lower-right corner. Wall decor in Call A also had pseudo-captions. |

---

## 3. Key Findings

1. **Eliminating Negative Tokens Did NOT Eliminate Signatures**:
   While removing `No signature` and `No written words` stopped certain wall-decor text generation (e.g., `beat-07` frames became cleanly blank), it did NOT stop FLUX.1 Schnell from signing the images in the lower-right margin.
2. **The "Empty Corner" Trap**:
   In S.6.1, prompts explicitly requested: *"Bottom-right area remains quiet blank warm ivory paper with generous empty space."*
   In training datasets for editorial magazine illustrations and fine art drawings, open blank lower margins or corners are the primary location where human illustrators sign their work. Schnell's generative prior for "editorial illustration" interprets empty margins as the natural slot for a signature (`Mfian Halcan`, `Chcil`, `Obiom ldoyz`, `Aumlan`).
3. **Yield Ceiling for Prompt-Only Schnell**:
   Overall text cleanliness was only 4/8 (50%), failing the required >= 7/8 threshold. One beat (`beat-15`) failed 2/2 times.
4. **Architectural Implication**:
   Prompt-only geometry cannot guarantee text-free outputs on FLUX.1 Schnell. Post-generation visual QA gating (with retry or automated corner crop/inpainting) is required if Schnell is retained, or generation must move to a model with native negative-prompt support.
