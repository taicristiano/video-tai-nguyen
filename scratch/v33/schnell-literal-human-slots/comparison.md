# HAY & ĐẸP. V3.3B-S.3 vs V3.3B-S.2: Comparison Report

Model: `@cf/black-forest-labs/flux-1-schnell`  
Date: 2026-09-19  
Comparison Focus: Literal Human Slot Composition (S.3) vs Abstract People Contract (S.2).

---

## 1. Quantitative Benchmark Table

| Metric | V3.3B-S.2 (Abstract People Contract) | V3.3B-S.3 (Literal Human Slots) | Observed Shift |
|---|:---:|:---:|---|
| **Contract Pass Rate** | `1/8` (12.5%) | `0/8` (0.0%) | No improvement; exact multi-person role binding failed in all 8 images. |
| **Style Preserved Rate** | `8/8` (100.0%) | `8/8` (100.0%) | Invariant: Style remained 100% `TARGET_EDITORIAL_2D` across both rounds. |
| **beat-01 (4-person family)** | `1/2` (1 exact 4-person scene) | `0/2` (1 call had 3 people; 1 call had 4 adults with no children) | Regressed: 4-person scene collapsed into 3 people or 4 adults. |
| **beat-02 (woman + child boy)** | `0/2` (2 adult couples) | `0/2` (1 adult couple; 1 two-woman scene) | Unchanged: Schnell refuses to render a child boy alongside an adult woman. |
| **beat-04 (man + child boy + woman)** | `0/2` (2 adults + severed legs) | `0/2` (1 two-adult scene; 1 woman + headless male torso) | Unchanged: Schnell fails to compose 3 interacting figures; produces amputated/headless bodies. |
| **beat-09 (woman + child boy)** | `0/2` (2 adult couples) | `0/2` (2 adult couples) | Unchanged: Systematically renders adult male + adult female couple instead of woman + child boy. |

---

## 2. Qualitative Architectural Comparison

1. **Why Literal Slots Did Not Fix Child Role Binding**:
   - In S.2, relationship labels (`mother`, `boy`) resulted in adult couples because Schnell defaulted to domestic couple bias.
   - In S.3, replacing relationship labels with explicit demographic slot definitions (`Vietnamese boy, age 8–10, child body, 2/3 adult seated height`) still resulted in adult figures in 4/4 two-person scenes (`beat-02`, `beat-09`). Schnell repeatedly rendered either an adult man (`beat-02-a`, `beat-09-a`, `beat-09-b`) or a second adult woman (`beat-02-b`).
   - Schnell's spatial and text-to-concept binding is too coarse to map numbered slots (`SLOT 1`, `SLOT 2`) to specific sub-regions of the output image when multiple humans are requested.

2. **3-Person and 4-Person Structural Instability**:
   - In both S.2 and S.3, attempting to render 3 or 4 people in a single frame triggered severe structural failures:
     - `beat-04-b`: Rendered an adult woman next to a completely headless male torso.
     - `beat-01-b`: Rendered 4 adult figures with an unassigned floating hand.
     - `beat-01-a` & `beat-04-a`: Silently dropped the child slot entirely, reducing the scene to 2 or 3 figures.

3. **Conclusion on Prompt-Only Engineering for FLUX.1 Schnell**:
   - Across three rounds (S.1 style geometry, S.2 negative-bounded people contract, S.3 literal numbered human slots), prompt engineering has reached a hard ceiling.
   - FLUX.1 Schnell can reliably lock 2D editorial style and compose simple 1-person scenes, but lacks the attention capacity and compositional spatial grounding required for reliable multi-person role-binding.
