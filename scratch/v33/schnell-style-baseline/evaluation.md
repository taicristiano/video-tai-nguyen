# HAY & ĐẸP. V3.3A-S — FLUX.1 Schnell Style Baseline Evaluation

**Version Lock**: `V3.3A-S — Schnell Style Baseline`  
**Model**: `@cf/black-forest-labs/flux-1-schnell`  
**API Call Shape**: Prompt-only JSON payload (Cloudflare Workers AI schema rejected explicit `seed` and `steps` fields; seed supported: NO)  
**Contact Sheet**: `scratch/v33/schnell-style-baseline/contact-sheet.jpg`  
**Evaluation Scope**: Visual style stability, medium consistency, anatomy, palette, and drift check on fixed neutral subject.

---

## 1. Candidate Evaluation Table

| Candidate | Seed / Index | Medium | Linework | Shading | Face | Palette | Texture | Anatomy | Brand Fit | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| **schnell-2101** | Candidate 01 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **schnell-2102** | Candidate 02 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **ACCEPTABLE** | **ACCEPTABLE** |
| **schnell-2103** | Candidate 03 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **schnell-2104** | Candidate 04 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG (BEST)** |
| **schnell-2105** | Candidate 05 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **schnell-2106** | Candidate 06 | FAIL | FAIL | FAIL | WEAK | ACCEPTABLE | WEAK | **FAIL** | FAIL | **FAIL** |
| **schnell-2107** | Candidate 07 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** |
| **schnell-2108** | Candidate 08 | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **STRONG** | **ACCEPTABLE** | **ACCEPTABLE** |

*Scoring scale: `STRONG / ACCEPTABLE / WEAK / FAIL`*

---

## 2. Drift Flags Audit

| Candidate | photorealDrift | animeDrift | chibiDrift | flatVectorDrift | anatomyFailure | Notes |
|---|---|---|---|---|---|---|
| **schnell-2101** | NO | NO | NO | NO | NO | Clean editorial 2D illustration. Proportional male holding ceramic cup with both hands. |
| **schnell-2102** | NO | NO | NO | NO | NO | Clean illustration beside wooden stool. Note: Small corner text artifact ("HAY + &'P"). |
| **schnell-2103** | NO | NO | NO | NO | NO | Full body beside tripod table. Sage sweater, cropped charcoal trousers. Perfect proportions. |
| **schnell-2104** | NO | NO | NO | NO | NO | Outstanding medium shot. Warm cream knit sweater, wooden table with potted sprig. Zero text. |
| **schnell-2105** | NO | NO | NO | NO | NO | Mature Vietnamese adult with natural facial character. Earthy taupe/sage attire. |
| **schnell-2106** | NO | NO | NO | NO | **YES** | Severe composition collapse: Floating head and severed hand holding cup over plant; body missing. |
| **schnell-2107** | NO | NO | NO | NO | NO | Clean 3/4 profile beside high stool. Dignified adult face, warm earthy palette. |
| **schnell-2108** | NO | NO | NO | NO | NO | Distinguished mature male with glasses and cardigan. Note: Faint top-right watermark ("HAY & P"). |

---

## 3. Section 10 Baseline Pass Rule Verification

Checking all 6 conditions from Section 10:

1. **At least 6/8 candidates are visually usable**:
   - Status: ✅ **PASS** (7/8 candidates are usable: 01, 02, 03, 04, 05, 07, 08).
2. **At least 6/8 are clearly editorial 2D**:
   - Status: ✅ **PASS** (7/8 candidates are strictly 2D editorial illustration with hand-drawn quality).
3. **At least 6/8 meet rubric threshold (Medium, Linework, Face, Palette, Brand Fit >= ACCEPTABLE)**:
   - Status: ✅ **PASS** (7/8 score STRONG or ACCEPTABLE across all dimensions).
4. **Zero candidate has severe malformed anatomy**:
   - Status: ❌ **FAIL** (Candidate 06 suffered severe composition collapse with floating head and severed hand; torso and lower body omitted).
5. **No more than 1/8 has photoreal/anime/chibi drift**:
   - Status: ✅ **PASS** (0/8 photoreal drift, 0/8 anime drift, 0/8 chibi drift).
6. **Overall palette remains recognizably ivory/cream, muted sage, warm wood, charcoal/sepia**:
   - Status: ✅ **PASS** (Highly cohesive warm editorial palette sustained across all successful candidates).

---

## 4. Overall Baseline Analysis

- **Strengths of FLUX.1 Schnell**:
  - Extremely fast inference (~2-3 seconds per generation vs 60-90 seconds on FLUX.2 dev).
  - Highly economical (~30-50 neurons per image, allowing ~200-300 generations/day on Cloudflare's free tier).
  - When coherent (7/8 = 87.5%), the editorial 2D illustration quality, linework warmth, natural Vietnamese adult proportions, and ivory/sage/warm-wood palette perfectly embody the HAY & ĐẸP. aesthetic.
  - Candidate 04 is an exemplary benchmark for the brand.

- **Vulnerabilities of FLUX.1 Schnell**:
  - Deterministic seeds are not supported by the Cloudflare Workers AI schema for this model endpoint (runs in prompt-only mode).
  - 4-step distillation occasionally suffers attention dropouts (e.g. Candidate 06 floating head/hand anomaly).
  - Text prompts containing the phrase "HAY & ĐẸP." occasionally trigger small text/signature artifacts in corners (Candidate 02 and 08).
