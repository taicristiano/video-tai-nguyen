# HAY & ĐẸP. — REFERENCE SHOT GRAMMAR AUDIT (VIDEO005)

**Audit Status**: PASS  
**Cadence**: 21.76 changes/min (Target Range: 18.0 - 22.0 changes/min)  

---

## 1. Rule Conformance Verification

| Rule ID | Constraint Description | Target / Threshold | Actual Video005 Value | Conformance Verdict |
|---|---|---|---|---|
| **RULE-01** | Visual Change Cadence | 18.0 - 22.0 changes/min | **21.76 changes/min** | **PASS** |
| **RULE-02** | Anti-Monotony: Max Consecutive Scales | <= 2 consecutive | **0 violations (max 2)** | **PASS** |
| **RULE-03** | Anti-Monotony: Max Consecutive Silhouettes | <= 2 consecutive | **0 violations (max 2)** | **PASS** |
| **RULE-04** | Maximum Hold Duration | <= 4.0s (unless valid exception) | **3.93s** | **PASS** |
| **RULE-05** | Median Hold Duration | 2.0s - 3.5s | **2.97s** | **PASS** |
| **RULE-06** | Scale Diversity | >= 4 unique scales | **6 unique scales** | **PASS** |
| **RULE-07** | Silhouette Diversity | >= 5 unique silhouettes | **9 unique silhouettes** | **PASS** |
| **RULE-08** | Timeline Continuity | 0 gaps, 0 overlaps | **Strict 0 frame mismatch** | **PASS** |

---

## 2. Long-Hold Analysis
- Every normal visual hold in this plan is strictly **<= 4.0s** (3.93s max).
- Zero fake free-form exceptions were assigned to generic image shots.
- Outro hold (2.20s) is a typed `OUTRO_COMPONENT`.
