# HAY & ĐẸP. V3.3B-S.2 vs V3.3B-S.1: People Contract Comparison

Model: `@cf/black-forest-labs/flux-1-schnell`  
Comparison Scope: Observed people-counting and member-composition behaviors on the 4 difficult beats.

---

## 1. Direct Comparison by Beat

| Beat | Requested Contract | V3.3B-S.1 (Baseline Style-First) | V3.3B-S.2 (With Explicit People Contract) | Observed Change |
|---|---|---|---|---|
| **beat-01** | 4 people (`father`, `mother`, `boy`, `girl`) | Generated 3 people in both runs (omitted 1 member). | `beat-01-a`: Generated exact 4 people (PASS).<br>`beat-01-b`: Generated 2 people + 1 pair of severed legs under table (FAIL). | Improved from 0/2 to 1/2 reaching exact 4-person composition, but remains unstable on variant B. |
| **beat-02** | 2 people (`mother`, `boy`) | Variable extra/missing adult composition (extra adult drift). | `beat-02-a`: Exactly 2 people, but rendered as adult couple (father + mother figure; boy missing).<br>`beat-02-b`: Exactly 2 people, but rendered as adult couple (man in collared shirt + woman; boy missing). | People count stabilized at 2/2, but semantic member assignment failed: FLUX defaulted to adult couple rather than mother + schoolboy. |
| **beat-04** | 3 people (`boy`, `father`, `mother`) | Generated 2 people instead of requested 3 in both runs. | `beat-04-a`: Generated 2 complete adults + 1 severed pair of standing legs (FAIL).<br>`beat-04-b`: Generated 2 standing adults; 3rd person omitted entirely (FAIL). | Unchanged failure mode: FLUX.1 Schnell strongly resists rendering 3 complete interacting figures in a single room composition, resulting in 2 figures or structural limb amputation. |
| **beat-09** | 2 people (`mother`, `boy`) | Generally closer to 2 people, but mixed adult/child roles. | `beat-09-a`: Exactly 2 people, but rendered as adult man + adult woman (boy missing).<br>`beat-09-b`: Exactly 2 people, but rendered as adult man + adult woman (boy missing). | Count obeyed (2/2 images had exactly 2 people), but role identity drifted to romantic/adult couple instead of mother + child. |

---

## 2. Qualitative Observations

1. **Numerical Count vs Role Understanding**:
   - The explicit `PEOPLE CONTRACT` block (`Show EXACTLY 2 visible people...`) succeeded in stabilizing the gross count to 2 in `beat-02` (2/2) and `beat-09` (2/2).
   - However, FLUX.1 Schnell exhibits a strong inductive bias when generating a domestic two-person scene: it systematically defaults to an adult male + adult female couple rather than an adult female + young boy, despite the prompt explicitly listing `mother` and `boy` in both the contract and the cast.

2. **Difficulty with 3+ Persons**:
   - For `beat-04` (requesting 3 people), Schnell failed in 2/2 calls to render 3 complete bodies. In `beat-04-a`, Schnell attempted to satisfy the prompt by rendering a severed, free-standing pair of trousers and shoes next to the sofa without an upper body. In `beat-04-b`, it simply dropped the third person and drew 2 people.
   - For `beat-01` (requesting 4 people), Schnell achieved a complete 4-person composition in `beat-01-a`, but in `beat-01-b` it collapsed into 2 people and a severed pair of legs under the coffee table.

3. **Style Invariance**:
   - The insertion of the `PEOPLE CONTRACT` block did not degrade the editorial 2D rendering style. All 8/8 images preserved the warm paper texture, sepia contour linework, and matte gouache fills established in V3.3B-S.1.
