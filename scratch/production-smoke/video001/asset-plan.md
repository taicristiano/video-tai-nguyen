# HAY & ĐẸP. Production Smoke Test 01 — Full Asset Plan

**Video Key:** `video001`  
**Title:** Có những bữa cơm sau này mới hiểu là rất quý  
**Canonical Spec:** `videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json`  
**Total Timeline:** 1442 frames (~48.07s @ 30fps)  
**Image Model:** `@cf/black-forest-labs/flux-1-schnell` ONLY  
**Visual Style:** Clean 2D illustrated / cartoon editorial (non-photorealistic, warm palette)

---

## 1. Asset Requirements Matrix (13 Production Slots)

| Slot ID | Scene | Type / Role | Frames | Composition | People Contract | Prior Human QA | Action | Target Asset Path |
|---|:---:|---|:---:|---|---|:---:|:---:|---|
| `scene-01` | 1 | `hook` / establish | 141 (0..141) | `portrait-focus` (wide) | Family dinner | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-01.jpg` |
| `scene-02` | 2 | `body` / reflection | 89 (141..230) | `portrait-focus` (medium) | 1 adult serving rice | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-02.jpg` |
| `scene-03` | 3 | `body` / interaction | 179 (230..409) | `editorial-left` (medium) | Parent & child talking | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-03.jpg` |
| `scene-04` | 4 | `body` / detail-action | 150 (409..559) | `detail-insert` (detail) | Placing phone aside | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-04.jpg` |
| `scene-05` | 5 | `body` / action | 107 (559..666) | `editorial-left` (medium) | Family arriving home | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-05.jpg` |
| `scene-06` | 6 | `body` / context | 107 (666..773) | `portrait-focus` (medium) | Reflective pause | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-06.jpg` |
| `scene-07` | 7 | `body` / reflection | 98 (773..871) | `portrait-focus` (medium) | 1 adult domestic pause | None (legacy file) | **GENERATE** | `assets/shot-07.jpg` |
| `scene-08-beat-01` | 8 | `body` (VB 1) / context | 85 (871..956) | `portrait-focus` (medium) | 1 adult at dining table | None (legacy file) | **GENERATE** | `assets/shot-08-vb1.jpg` |
| `scene-08-beat-02` | 8 | `body` (VB 2) / detail-action | 102 (956..1058) | `detail-insert` (detail) | 0 people (still life table) | None (legacy file) | **GENERATE** | `assets/shot-08-vb2.jpg` |
| `scene-09-beat-01` | 9 | `body` (VB 1) / memory | 78 (1058..1136) | `paper` (wide) | Memory echo of Scene 1 | PASS (`V3.4A_HUMAN_REVIEW`) | **REUSE** | `assets/shot-01.jpg` |
| `scene-09-beat-02` | 9 | `body` (VB 2) / release | 125 (1136..1261) | `portrait-focus` (wide) | 0 people (quiet room) | None (legacy file) | **GENERATE** | `assets/shot-09-vb2.jpg` |
| `scene-10` | 10 | `ending` / question | 121 (1261..1382) | `portrait-focus` (wide) | 1 adult contemplative | None (legacy file) | **GENERATE** | `assets/shot-10.jpg` |
| `scene-11` | 11 | `ending` / outro | 60 (1382..1442) | OutroCard component | None (brand outro) | PASS (`LOCKED_BRAND`) | **COMPONENT** | `outro-9-16.png` |

---

## 2. Summary of Asset Sourcing

- **Validated Reused Assets:** 7 slots
  - Scenes 1, 2, 3, 4, 5, 6: Reused from human-reviewed V3.4A / V3.6 clean asset baseline.
  - Scene 9 VisualBeat 1: Reused from Scene 1 canonical family dinner hook asset (authored memory echo).
  - Scene 11: Rendered via `<OutroCard />` component with verified brand asset.
- **Fresh Generation Required:** 5 slots
  - `scene-07`: One adult in a quiet, serene domestic moment.
  - `scene-08-beat-01`: One adult seated calmly at a simple wooden dining table.
  - `scene-08-beat-02`: Still life of wooden table setting with simple bowls and chopsticks, zero phones.
  - `scene-09-beat-02`: Quiet lived-in dining room with empty chairs in soft afternoon light after meal.
  - `scene-10`: One adult seated peacefully at table with a warm cup in thoughtful reflection.

---

## 3. Production Generation Guardrails

1. **Model:** `@cf/black-forest-labs/flux-1-schnell` exclusively.
2. **Style Recipe:** Clean 2D cartoon / editorial illustration; warm ivory `#FDFBF7`, muted sage `#8A9A86`, warm wood, charcoal linework.
3. **Hard Exclusions:** No photorealism, no 3D render, no text, no letters, no numbers, no symbols, no signatures, no watermarks, no brand logos.
4. **Retry Limit:** Max 3 attempts per asset. If `HTTP 429` occurs, record `PAUSED_QUOTA` immediately without consuming visual attempts.
5. **Human QA Integrity:** All freshly generated assets will remain in `PENDING_VISUAL_QA` until explicit visual review. No fake PASS.
