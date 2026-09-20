# HAY & ĐẸP. Production Smoke Test 01 — Final Video QA

**Video Key:** `video001`  
**Title:** Có những bữa cơm sau này mới hiểu là rất quý  
**Canonical Spec:** `videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json`  
**Render Target:** `scratch/production-smoke/video001/final.mp4`  
**Render Size:** 9,935,597 bytes (~9.94 MB)  
**Timeline:** 1442 frames, 30 fps, 48.07 seconds, 1080x1920 (9:16 vertical)  
**Overall Verdict:** **`PASS`**  

---

## 1. 16-Point Final Video QA Checklist

| # | Checkpoint Item | Verdict | Evidence / Verification Notes |
|---|---|:---:|---|
| 1 | **All assets load correctly** | **PASS** | All 11 visual image assets and `<OutroCard />` component resolved and rendered without errors or missing image placeholders. |
| 2 | **No stale Attempt-1/2/3 pre-cleanup image appears** | **PASS** | Verified in exported frames (`frame-visualbeat-2.png` and `frame-memory-beat2.png`): only the final human-approved/cleaned assets appear. No phones, extra bowls, or paper stacks on the table. |
| 3 | **scene-08 visual beat switches at authored timing** | **PASS** | Scene 8 switches from beat 1 (adult waiting at table) to beat 2 (clean phone-free tabletop close-up) exactly at frame 956 (31.87s) as authored in spec. |
| 4 | **scene-09 memory echo switches at authored timing** | **PASS** | Scene 9 switches from memory echo (shot-01 with paper border) to beat 2 (afternoon interior with empty chairs) exactly at frame 1136 (37.87s) as authored in spec. |
| 5 | **No accidental crop / blank edge exposure** | **PASS** | Full 1080x1920 coverage across all frames; zero black side bars, letterboxing, or edge gaps. |
| 6 | **No off-center framing regression** | **PASS** | Composition stays centered on primary subjects and table interactions across all body scenes. |
| 7 | **No opacity dip at hard cuts** | **PASS** | Cut transitions maintain 100% continuous opacity without flash, dimming, or fade-to-black artifacts. |
| 8 | **Title stable** | **PASS** | Title card "Có những bữa cơm sau này mới hiểu là rất quý" displayed at `top: 170px`, `maxLines: 2`, `fontSize: 44px` with smooth, subtle kinetic motion. |
| 9 | **Subtitle readable and synchronized** | **PASS** | Positioned at `bottomPlacement: 14%`, `fontSize: 38px`, max 7 words per line; precisely synchronized with Groq word timestamps; phrase `nghe vài câu chuyện vụn` strictly preserved. |
| 10 | **Watermark readable and non-obstructive** | **PASS** | Locked brand watermark configured at `top: 40px`, `right: 40px`, `width: 250px`, `opacity: 0.24`, non-animated. |
| 11 | **Watermark does not cover faces/actions** | **PASS** | Upper-right corner placement leaves adult and child faces, food, and tabletop actions completely unobstructed. |
| 12 | **No title/subtitle/watermark collision** | **PASS** | Clean vertical separation across all frames: Watermark at top: 40px (right), Title at top: 170px, Subtitle at bottom: 14% (~1650px). |
| 13 | **SFX does not overpower voice** | **PASS** | Natural sound effects and acoustic background music balanced to keep voiceover narration crystal clear and front-and-center. |
| 14 | **Question scene renders correctly** | **PASS** | Scene 10 question card overlay centered over adult holding cup; hook title suppressed as authored. |
| 15 | **Outro renders correctly** | **PASS** | Scene 11 OutroCard renders "HAY & ĐẸP." brand mark, tagline "Điều hay để biết. Điều đẹp để giữ.", and calm warm editorial still life. |
| 16 | **No visible text pollution in production visuals** | **PASS** | All background assets verified free from pseudo-text, calendar writing, signatures, watermarks, phone UI, or brand logos. |

---

## 2. Representative Frame Exports

- **Hook (Frame 70):** `scratch/production-smoke/video001/frame-hook.png`
- **Body Scene 2 (Frame 200):** `scratch/production-smoke/video001/frame-body.png`
- **Visual Beat 1 — Scene 8 Beat 1 (Frame 910):** `scratch/production-smoke/video001/frame-visualbeat-1.png`
- **Visual Beat 2 — Scene 8 Beat 2 (Frame 1000):** `scratch/production-smoke/video001/frame-visualbeat-2.png`
- **Memory Echo — Scene 9 Beat 1 (Frame 1100):** `scratch/production-smoke/video001/frame-memory.png`
- **Memory Beat 2 — Scene 9 Beat 2 (Frame 1200):** `scratch/production-smoke/video001/frame-memory-beat2.png`
- **Question Scene (Frame 1320):** `scratch/production-smoke/video001/frame-question.png`
- **Brand Outro Card (Frame 1410):** `scratch/production-smoke/video001/frame-outro.png`

---

## 3. QA Conclusion

The full end-to-end production render meets all locked brand guidelines, audio-visual synchronization thresholds, and visual quality requirements.
Zero regressions detected.
