# HAY & ĐẸP. V3.3B-S.4 — Schnell Capability Router Decision Policy

Date: 2026-09-19  
Scope: Capability boundary routing policy for `@cf/black-forest-labs/flux-1-schnell`

---

## 1. Proven Capabilities

- **Style-First Editorial 2D**: FLUX.1 Schnell reliably maintains the `TARGET_EDITORIAL_2D` visual aesthetic across beats when medium, rendering recipe, and palette are placed first (8/8 in S.1, 8/8 in S.2, 8/8 in S.3).
- **Zero-Person / Object Scenes**: Cleanly rendered without anatomical confusion.
- **Single-Person Compositions**: Feasible within editorial 2D guidelines.

---

## 2. Not Proven / Failed Capabilities

- **Exact Mixed Adult-Child Binding**: Schnell systematically defaults to adult couples or drops the child (0/4 in S.2, 0/4 in S.3).
- **Exact 3+ People Role Binding**: Schnell collapses multi-person scenes, drops members, or generates amputated/severed body parts (headless torso, floating legs, floating hand).
- **Facial / Identity Locking**: Schnell cannot preserve character identity across independent generations via prompt alone.

---

## 3. Evidence-Derived Routing Policy

1. **REUSE_CANONICAL**: Existing canonical asset strategies (`assetStrategy: 'reuse-canonical'`) always take highest precedence. Preserves curated recurring assets (memory, question).
2. **SCHNELL_SAFE**:
   - Zero-person beats (`needsPeople: false` or `presentMembers: []`).
   - Single-person beats (`peopleCount: 1` or solo cast).
3. **SCHNELL_PAIR_UNPROVEN**:
   - Two-adult beats (`peopleCount: 2` with `hasChildMember: false`).
   - Held in reserve pending a dedicated 2-adult fidelity test. Never assumed safe.
4. **SIMPLIFY_OR_CANONICAL**:
   - Multi-person scenes with 3 or more people (`peopleCount >= 3`).
   - Mixed adult-child scenes (`peopleCount === 2 && hasChildMember === true`).
   - **MUST NOT** be dispatched dynamically to FLUX.1 Schnell prompt-only generation.

---

## 4. Next Architectural Need

The next separate task is to design how `SIMPLIFY_OR_CANONICAL` beats are transformed or fulfilled (e.g. story plan semantic simplification to 1-person focus, canonical group master assets, or tiering to a higher-capacity image model).
