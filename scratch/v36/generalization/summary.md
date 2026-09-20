# HAY & ĐẸP. — V3.6: 5-Video Generalization Pilot Summary Report

**Overall Status:** **PASS** (5/5 passed, 0/5 pending visual review)  
**Date:** 20/9/2026  
**Image Model:** `@cf/black-forest-labs/flux-1-schnell` (FLUX.1 Schnell ONLY)  
**Watermark Configuration:** `top: 40px`, `right: 40px`, `width: 250px`, `opacity: 0.24` (top-right safe zone, zero animation)  

---

## 1. 5-Video Verification Results

| Video Key | Category | Title | Frames / Sec | Clean Assets | MP4 Size | QA Status |
|---|---|---|---|---|---|---|
| **video001** | `family-emotional` | Có những bữa cơm sau này mới hiểu là rất quý | 773f (~25.8s) | 6/6 SELECTED | 5.82 MB | **PASS** |
| **video005** | `relationship-dialogue` | Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần | 550f (~18.3s) | 6/6 SELECTED | 1.60 MB | **PASS** |
| **video007** | `home-living` | Hai Mươi Bốn Giờ Trước Một Món Mua Không Cần Gấp | 525f (~17.5s) | 6/6 SELECTED | 1.64 MB | **PASS** |
| **video013** | `books-ideas` | Không Phải Lúc Nào Người Khác Kể Chuyện Cũng Cần Sửa Giúp | 645f (~21.5s) | 6/6 SELECTED | 1.87 MB | **PASS** |
| **video028** | `family-emotional` | Không Cần Trả Lời Mọi Thông Báo | 444f (~14.8s) | 6/6 SELECTED | 1.24 MB | **PASS** |

---

## 2. Generalization Quality Gates Compliance

| Gate | Requirement | Video 001 | Video 005 | Video 007 | Video 013 | Video 028 |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Gate 1: Centered Framing** | Balanced `portrait-focus`, no asymmetric drift | PASS | PASS | PASS | PASS | PASS |
| **Gate 2: Clean 2D Assets** | FLUX Schnell 2D illustrated editorial | PASS | PASS | PASS | PASS | PASS |
| **Gate 3: Watermark Polish** | Top 40, Right 40, Width 250, Opacity 0.24 | PASS | PASS | PASS | PASS | PASS |
| **Gate 4: Audio & SFX Sync** | Speech timing + soft transition SFX | PASS | PASS | PASS | PASS | PASS |
| **Gate 5: Narrative Pacing** | Exact timing from `spec.json`, clean hard cuts | PASS | PASS | PASS | PASS | PASS |
| **Gate 6: Content Coherence** | Style matches profile theme & quiet tone | PASS | PASS | PASS | PASS | PASS |
| **Gate 7: Mobile Readability** | 9:16 safe margins, legible title & subtitle | PASS | PASS | PASS | PASS | PASS |
| **Gate 8: Zero Render Errors** | Exit code 0, playable 30fps H.264 MP4 | PASS | PASS | PASS | PASS | PASS |

---

## 3. Final Verdict
```text
V3.6 5-VIDEO GENERALIZATION — PASS
```
All 5 representative content profiles passed visual, layout, and rendering verification.
