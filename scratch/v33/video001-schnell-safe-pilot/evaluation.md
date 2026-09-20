# HAY & ĐẸP. V3.3B-S.6 — Video 001 Schnell-Safe Pilot Evaluation

Date: 2026-09-19  
Model: `@cf/black-forest-labs/flux-1-schnell`  
Total Calls: 9 (1 call per beat, strictly zero retries)

---

## 1. 9-Beat QA Table

| Beat ID | Role / Route | Fulfillment | Selected Member | Style | People Contract | Semantic Fidelity | Anatomy | Text Pollution | Overall | Notes |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| `beat-02` | `reflection` | `SCHNELL_OBJECT` | *(none)* | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | **✅ PASS** | Clean dining still-life, bowls, table, no people, no text. |
| `beat-04` | `interaction` | `SCHNELL_SINGLE` | `boy` | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | **✅ PASS** | Single child speaking, round face, intact anatomy, zero text. |
| `beat-06` | `detail-action` | `UNCHANGED` | `father` | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ❌ FAIL | **❌ FAIL** | Clean 1-man composition, but contains cursive signature "Zathren". |
| `beat-07` | `action` | `SCHNELL_OBJECT` | *(none)* | ✅ PASS | ❌ FAIL | ✅ PASS | ✅ PASS | ❌ FAIL | **❌ FAIL** | Hallucinated background person in doorway and "EAASO" text in wall frame. |
| `beat-08` | `context` | `SCHNELL_SINGLE` | `mother` | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | **✅ PASS** | Single adult woman in calm armchair pause, zero text. |
| `beat-09` | `reflection` | `SCHNELL_SINGLE` | `mother` | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ❌ FAIL | **❌ FAIL** | Clean portrait on sofa, but contains signature "MH Tim" in bottom-right. |
| `beat-10` | `context` | `SCHNELL_SINGLE` | `mother` | ✅ PASS | ❌ FAIL | ✅ PASS | ✅ PASS | ❌ FAIL | **❌ FAIL** | Hallucinated extra baby/toddler on couch + text "@21.4 Motnal". |
| `beat-12` | `detail-action` | `UNCHANGED` | `father` | ✅ PASS | ❌ FAIL | ✅ PASS | ❌ FAIL | ✅ PASS | **❌ FAIL** | Severe anatomy failure: severed phantom arm/hand dangling behind hip. |
| `beat-15` | `release` | `UNCHANGED` | *(none)* | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ❌ FAIL | **❌ FAIL** | Empty room style is great, but has cursive signature "@leiin Lacking". |

---

## 2. Raw Yield Metrics

- **Overall PASS**: 3 / 9 (33.3%) — *Threshold was >= 8/9*
- **Style PASS**: 9 / 9 (100.0%) — *TARGET_EDITORIAL_2D completely stable across all beats*
- **People Contract PASS**: 6 / 9 (66.7%) — *3 failures: beat-07 (background person), beat-10 (extra baby), beat-12 (severed hand)*
- **Semantic Fidelity PASS**: 9 / 9 (100.0%)
- **Anatomy PASS**: 8 / 9 (88.9%) — *1 severe failure: beat-12 (detached limb)*
- **Text Pollution PASS**: 4 / 9 (44.4%) — *5 images suffered from artist pseudo-signatures/watermarks*

---

## 3. Mandatory Archetype Gates Review

- `beat-02` (object meal): **PASS**
- `beat-04` (single child): **PASS**
- `beat-07` (school/work object): **FAIL** *(background person in doorway + wall text)*
- `beat-15` (no-people release): **FAIL** *(signature artifact "@leiin Lacking")*

---

## 4. Failure Analysis

1. **Artist Signature Hallucination (Primary Failure Mode, 5/9 images)**:
   FLUX.1 Schnell possesses an intrinsic training bias to imprint artist pseudo-signatures ("Zathren", "MH Tim", "@leiin Lacking", "@21.4 Motnal", "EAASO") in the lower-right corner of editorial illustrations. Negative prompting alone is insufficient to suppress these signatures in raw single-attempt generation without retries.
2. **Residual People Hallucination in Object Shots (1/9 images)**:
   In `beat-07`, despite explicit "no people visible anywhere" instructions, Schnell inserted a distant figure in an open doorway.
3. **Severe Phantom Limb Anatomy (1/9 images)**:
   In `beat-12`, a severed disembodied hand and forearm was generated hanging behind the father's waistline.

---

## 5. Architectural Conclusion

While the **Style-First** geometry achieved a perfect **9/9 (100%)** aesthetic baseline and the simplified 1-person / 0-person approach completely eliminated multi-person scene collapse, the raw unassisted yield of FLUX.1 Schnell without bounded retries/inpainting or watermark post-processing is **3/9 (33.3%)**.

The simplified Schnell-safe path is not reliable enough for production integration yet.
