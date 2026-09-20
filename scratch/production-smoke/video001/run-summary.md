# HAY & ĐẸP. Production Smoke Test 01 — Run Summary

**Video Key:** `video001`  
**Title:** Có những bữa cơm sau này mới hiểu là rất quý  
**Canonical Spec:** `videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json` (1442 frames, ~48.07s @ 30fps)  
**Image Model:** `@cf/black-forest-labs/flux-1-schnell` ONLY  
**Overall Status:** **`PASS`**  

### Production Status Summary:
- **all production assets PASS** (13 / 13 slots approved)
- **full render complete** (`scratch/production-smoke/video001/final.mp4` — 9.94 MB)
- **final video QA complete** (`scratch/production-smoke/video001/final-video-qa.md` — 16/16 PASS)

---

## 1. Asset Plan Execution & Human QA Summary

- **Total Production Slots:** 13
- **Passed Slots:** 13 / 13 (100% PASS)
  - `scene-01` (Hook): `assets/shot-01.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-02` (Body): `assets/shot-02.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-03` (Body): `assets/shot-03.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-04` (Body): `assets/shot-04.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-05` (Body): `assets/shot-05.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-06` (Body): `assets/shot-06.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-07` (Body): `assets/shot-07.jpg` — **PASS** (`HUMAN_QA_ATTEMPT_1`)
  - `scene-08-beat-01` (Body): `assets/shot-08-vb1.jpg` — **PASS** (`HUMAN_QA_ATTEMPT_1`)
  - `scene-08-beat-02` (Body): `assets/shot-08-vb2.jpg` — **PASS** (`HUMAN_QA_FINAL_CLEANUP` via deterministic raster restoration)
    - *Final Decision:* Exactly 1 main rice bowl, 1 small side bowl, 1 pair of chopsticks, zero people, zero phones/electronic devices, clean uninterrupted wooden tabletop.
  - `scene-09-beat-01` (Memory Echo): `assets/shot-01.jpg` — **PASS** (`V3.4A_HUMAN_REVIEW`)
  - `scene-09-beat-02` (Body): `assets/shot-09-vb2.jpg` — **PASS** (`HUMAN_QA_ATTEMPT_2`)
    - *Human QA Reason:* Clean 2D editorial interior with zero people, two empty chairs, simple dining table, plain ceramic cup, warm afternoon atmosphere, no calendar/writing marks.
  - `scene-10` (Question): `assets/shot-10.jpg` — **PASS** (`HUMAN_QA_ATTEMPT_1`)
  - `scene-11` (Outro): `<OutroCard />` component — **PASS** (`LOCKED_BRAND_ASSET`)
- **Pending Slots:** 0
- **Needs Regen Slots:** 0

---

## 2. Production Render & Output Artifacts

- **Full Production MP4:**
  [`scratch/production-smoke/video001/final.mp4`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/final.mp4) (9,935,597 bytes, 1442 frames, 48.07s, 1080x1920 @ 30fps)
- **16-Point Final Video QA Report:**
  [`scratch/production-smoke/video001/final-video-qa.md`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/final-video-qa.md)
- **Final Video QA Machine Data:**
  [`scratch/production-smoke/video001/final-video-qa.json`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/final-video-qa.json)
- **Review Manifest:**
  [`scratch/production-smoke/video001/review-pack/review-manifest.json`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/review-pack/review-manifest.json)
- **Full Visual Review:**
  [`scratch/production-smoke/video001/visual-review.json`](file:///g:/Project/tool-gen-video-299/tool-video-tai-nguyen/scratch/production-smoke/video001/visual-review.json)

---

## 3. Representative Still Frame Exports

1. **Hook Scene (Frame 70):** `scratch/production-smoke/video001/frame-hook.png`
2. **Body Scene 2 (Frame 200):** `scratch/production-smoke/video001/frame-body.png`
3. **Scene 8 Beat 1 (Frame 910):** `scratch/production-smoke/video001/frame-visualbeat-1.png`
4. **Scene 8 Beat 2 (Frame 1000):** `scratch/production-smoke/video001/frame-visualbeat-2.png` (verified clean phone-free tabletop)
5. **Scene 9 Beat 1 — Memory Echo (Frame 1100):** `scratch/production-smoke/video001/frame-memory.png` (verified paper border overlay)
6. **Scene 9 Beat 2 (Frame 1200):** `scratch/production-smoke/video001/frame-memory-beat2.png` (verified afternoon interior, no calendar marks)
7. **Scene 10 Question Card (Frame 1320):** `scratch/production-smoke/video001/frame-question.png`
8. **Scene 11 Brand Outro Card (Frame 1410):** `scratch/production-smoke/video001/frame-outro.png`

---

## 4. Brand & Production Rule Compliance

- **Deterministic Raster Cleanup:** Successfully applied to `scene-08-beat-02` with zero Cloudflare/AI calls; verified by human review.
- **Visual Beats Maintained:** `visualBeats` kept active at authored timings (Scene 8 switch at frame 956; Scene 9 switch at frame 1136).
- **Watermark Parameters:** `top: 40px`, `right: 40px`, `width: 250px`, `opacity: 0.24`, non-animated; non-obstructive upper-right location.
- **Title Parameters:** `top: 170px`, `maxLines: 2`, `fontSize: 44px`.
- **Subtitle Parameters:** `bottomPlacement: 14%`, max 7 words per line, `fontSize: 38px`.
- **Script Integrity:** Phrase `nghe vài câu chuyện vụn` preserved intact.
