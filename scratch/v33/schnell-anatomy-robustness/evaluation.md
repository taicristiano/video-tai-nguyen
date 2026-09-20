# HAY & ĐẸP. V3.3A-S.1 — Schnell Anatomy Robustness Evaluation

**Version Lock**: `V3.3A-S.1 — Schnell Anatomy Robustness`  
**Model**: `@cf/black-forest-labs/flux-1-schnell`  
**API Call Mode**: Prompt-only JSON payload directly (8 calls, zero probe waste)  
**Contact Sheet**: `scratch/v33/schnell-anatomy-robustness/contact-sheet.jpg`  
**Test Objective**: Test whether appending the stricter `ANATOMY AND FRAMING LOCK` eliminates severe structural failures while preserving visual style.

---

## 1. Candidate Anatomy Evaluation Table

| Candidate | Head Conn. | Torso Pres. | Arms Conn. | Hands Conn. | No Dupl. Limbs | No Severe Malf. | Framing Read. | Style Preserved | severeAnatomyFailure |
|---|---|---|---|---|---|---|---|---|---|
| **anatomy-01** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-02** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-03** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-04** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-05** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-06** | PASS | PASS | PASS | **FAIL** | **FAIL** | **FAIL** | **FAIL** | PASS | **YES** |
| **anatomy-07** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |
| **anatomy-08** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **NO** |

---

## 2. Qualitative Notes per Candidate

- **anatomy-01**: Complete adult male standing beside wooden stool with potted plant and framed wall art. Believable proportions, relaxed posture holding ceramic cup. Clean 2D editorial style.
- **anatomy-02**: Full-body adult standing beside wooden side table with second cup. One hand in pocket, one hand holding cup. Perfectly connected anatomy.
- **anatomy-03**: Full-body adult wearing drape-knit sweater, standing beside wooden table with small flower vase. Natural hands, clear breathing room.
- **anatomy-04**: Full-body adult in crisp cream shirt and green trousers beside wooden stool. Clean contours and natural limb attachments.
- **anatomy-05**: Medium-long shot (head to mid-thigh) standing near wooden architectural pillar and side table. Believable hand holding cup.
- **anatomy-06**: **Severe structural failure**. While the head, neck, and torso are rendered in profile, a detached severed hand holding a white cup floats in mid-air between the chest and the stool with blank background separating it from the body.
- **anatomy-07**: 3/4 view standing beside wooden stool with decorative sprig. Proper hand attachment holding green ceramic cup.
- **anatomy-08**: Mature Vietnamese adult male with distinguished features, standing beside wooden coffee table holding cup with both hands. Excellent anatomy and brand fit.

---

## 3. Strict Pass Rule Audit (Section 10)

1. **8/8 severeAnatomyFailure = NO**:
   - Result: ❌ **FAIL** (7/8 NO, 1/8 YES due to `anatomy-06` exhibiting a detached floating hand).
2. **At least 7/8 style preserved = PASS**:
   - Result: ✅ **PASS** (8/8 style preserved = 100%).

Per Section 10: *"If even ONE candidate has: floating head; detached hand; missing torso; disconnected limb; severe duplicate anatomy; then: V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — FAIL."*

---

## 4. Verdict

```text
V3.3A-S.1 SCHNELL ANATOMY ROBUSTNESS — FAIL
```
