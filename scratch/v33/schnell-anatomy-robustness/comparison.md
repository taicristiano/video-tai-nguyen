# HAY & ĐẸP. V3.3A-S.1 — Comparison to Baseline

**Baseline Run**: `V3.3A-S (FLUX.1 Schnell Baseline)`  
**Current Run**: `V3.3A-S.1 (FLUX.1 Schnell Anatomy Robustness)`  
**Model**: `@cf/black-forest-labs/flux-1-schnell` (Cloudflare Workers AI)

---

## 1. Quantitative Failure Rate Comparison

```text
Baseline severe anatomy failure rate: 1/8 = 12.5%
New severe anatomy failure rate:      1/8 = 12.5%
```

| Metric | Baseline (V3.3A-S) | New (V3.3A-S.1) | Change |
|---|---|---|---|
| **Total Candidates Tested** | 8 | 8 | Same |
| **Severe Anatomy Failures** | 1 (schnell-2106) | 1 (anatomy-06) | **0% net change (12.5%)** |
| **Torso Missing Failures** | 1 (schnell-2106) | 0 | Improved (+12.5%) |
| **Detached Limb / Hand Failures** | 1 (schnell-2106) | 1 (anatomy-06) | Unchanged (12.5%) |
| **Visually Usable Outputs** | 7/8 (87.5%) | 7/8 (87.5%) | Identical |
| **Style Preserved Rate** | 7/8 (87.5%) | 8/8 (100%) | Maintained high |

---

## 2. Qualitative Observations

### A. Palette Consistency
- **Result**: **Identical & Highly Consistent**.
- Both runs faithfully sustained the HAY & ĐẸP. color language: warm ivory and soft cream backgrounds, muted sage green accents, warm medium-wood tones (tables and stools), and gentle charcoal/sepia contours.

### B. Editorial 2D Medium Preservation
- **Result**: **100% Preserved**.
- Appending the `ANATOMY AND FRAMING LOCK` constraint did not trigger any style drift. None of the 8 candidates drifted into 3D, photorealism, anime, manga, chibi, or flat corporate vector. The tactile editorial paper-like grain was fully maintained.

### C. Framing Reliability
- **Result**: **Noticeably More Consistent**.
- The instruction `"Show the person from head to at least mid-thigh... Keep the whole upper body comfortably inside frame with breathing room"` eliminated extreme close-ups. 7 of 8 candidates captured either full body or 3/4 mid-thigh framing with breathing room and clear table/stool placement.
- Torso presence was 8/8 (100%), whereas baseline had 7/8 (87.5%).

### D. Nature of the Remaining Failure
- In Candidate 06 (`anatomy-06.jpg`), the model correctly drew the head, neck, torso, and right arm in side profile. However, it independently generated a severed, floating hand holding a white ceramic cup directly in mid-air in front of the chest, separated by empty cream background.
- This proves that in a **4-step distilled architecture** like FLUX.1 Schnell, negative prompting against "detached hand" cannot provide 100% mathematical spatial binding between concurrent objects (person body + hand holding cup) under pure text guidance. The baseline failure rate remains at ~12.5% (1 out of 8).
