# Walkthrough: Triển Khai HAY & ĐẸP. Cinematic Light V2

Tài liệu ghi nhận kết quả triển khai nâng cấp toàn diện **HAY & ĐẸP. Cinematic Light V2** theo `HAY_DEP_CINEMATIC_LIGHT_V2_CONTRACT.md` cho template `human-insight/cinematic-light`.

---

## 1. Mục tiêu V2 đã hoàn thành
- **Loại bỏ cảm giác slideshow**: Tích hợp 9 deterministic micro-motion presets và cơ chế secondary framing shift Hermite cubic ease-in-out cho các cảnh > 3.5s (105 frames).
- **Brand Hierarchy chuẩn V2**:
  - Logo H&Đ. Deep Sage (`#465B49`) độ mờ ~0.82 trên nền cream, breathing tối đa `±0.4%`.
  - Headline ổn định vị trí, độ mờ tăng cường `0.86` (đạt mục tiêu contract `0.82–0.90`).
  - Slogan chỉ xuất hiện ở intro ngắn (0–4.5s), tự động fade out hoàn toàn trong các phân cảnh normal narrative.
  - Tự động ẩn headline và subtitles khi hiển thị quote/statement/question cards.
- **Container Mix linh hoạt**:
  - `canvas` (mặc định ~60–70%): Hình ảnh hòa vào canvas viền mềm, không lạm dụng paper frame.
  - `paper` (~20–30%): Khung giấy tactile kèm washi tape nhấn mạnh các khoảnh khắc cảm xúc gia đình cụ thể.
  - `statement` (≤10%): Card trích dẫn triết lý trung tâm.
- **Character Universe & Continuity**:
  - 8 cast IDs: `family-young-01`, `couple-young-01`, `parents-middleage-01`, `elderly-couple-01`, `solo-male-01`, `solo-female-01`, `child-boy-01`, `child-girl-01`.
  - Hàm `inferCastId(text, category)` suy luận cast tự nhiên.
- **Image Generation V2 & Seed Strategy**:
  - `STYLE LOCK` + `CAST LOCK` + `SCENE` + `NO TEXT/LOGO`.
  - Seed đa tầng: `videoSeed -> castSeed -> sceneSeed` (bước nhảy số nguyên tố 7919).
  - Thực sự truyền `seed` (uint32) vào request payload gửi Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`).
  - Phân tầng asset: `HAYDEP_CORE` (+25) → `HAYDEP_COMPATIBLE` (+10) → generate → `LEGACY_NEP` (0). Loại trừ `REJECT_OFFSTYLE` (-9999).
- **Visual Beats (P1 Backward-Compatible)**: Hỗ trợ cấu trúc `visualBeats?: [{ startFrame, endFrame, imageSrc, motionPreset, cropVariant }]` với chuyển cảnh 6–8f crossfade.
- **Dedicated 9:16 Branded Outro Artwork**:
  - Tạo artwork 1080x1920 tại `public/assets/human-insight/brand/outro-9-16.png` với nền ivory ấm, logo Deep Sage, dải ảnh tĩnh góc bàn trà nắng tự nhiên và Kinfolk books.
  - 60 frames (2.0s), scale 1.02 -> 1.00 ("đóng quyển sách"), fade-in 8–10f, không voiceover, ẩn subtitles và header.

---

## 2. Danh sách Files đã cập nhật

| File | Thay đổi chính |
|---|---|
| `public/assets/human-insight/brand/hay-dep-mark-sage.png` | Mark H&Đ. Deep Sage (`#465B49`), tương phản cao trên nền cream |
| `public/assets/human-insight/brand/outro-9-16.png` | Artwork dọc 9:16 chuẩn thương hiệu (ivory + sage serif + sunlit desk) |
| `src/templates/human-insight/cinematic-light/tokens.ts` | Bổ sung V2 palette (`#465B49`, `#71806C`, `#302D28`, `#C79A72`), `MotionPreset`, `VisualBeat`, `VisualContainer` |
| `src/templates/human-insight/cinematic-light/characters.ts` | Tạo character universe với 8 cast IDs, prompt CAST LOCK, hàm `inferCastId()` |
| `src/templates/human-insight/cinematic-light/index.ts` | Export toàn bộ types V2, characters, mở rộng `HumanInsightScene` và `HumanInsightSpec` |
| `src/templates/human-insight/cinematic-light/Layout.tsx` | Headline opacity 0.86, slogan intro-only (fades 105–132f), mark H&Đ sage ~0.82, ẩn subtitle khi outro |
| `src/templates/human-insight/cinematic-light/OutroCard.tsx` | Chuyển sang 9:16 vertical artwork, 60f, scale 1.02 -> 1.00, fallback typography |
| `src/templates/human-insight/cinematic-light/ImageScene.tsx` | 9 motion presets, secondary framing shift >3.5s, container mix (`canvas` vs `paper`), visual beats crossfade |
| `src/VideoContent.tsx` | Chuyển tiếp `container`, `motionPreset`, `visualBeats`, `sceneStartFrame` vào `<ImageScene>` |
| `scripts/human-insight-image.mjs` | V2 STYLE LOCK, 8 casts, truyền `seed` vào Cloudflare payload, chuỗi `videoSeed -> castSeed -> sceneSeed`, P2 asset tiers matcher |
| `docs/templates/human-insight/cinematic-light.md` | Cập nhật tài liệu spec & coder theo quy chuẩn V2 |
| `videos/.../spec.json` | Cập nhật Video 001 với `castId: "family-young-01"`, container mix, motion presets, mẫu `visualBeats` |

---

## 3. Kết quả Kiểm thử & Smoke Test Video 001

1. **Unit Tests**: `npm test` -> 6 test files passed, 14/14 tests passed.
2. **TypeScript Type Check**: `npx tsc --noEmit` -> 0 errors.
3. **100 Videos Catalog Parser**: `node scripts/parse-hay-dep-videos.mjs` -> 100 video parse thành công.
4. **Step 1–3 Video 001 Test**: `node scripts/test-step1-3.mjs` -> passed.
5. **Remotion Video Render**:
   - File: `videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/video.mp4`
   - Size: **27.7 MB**
   - Duration: **55.0 giây (1650 frames @30fps)** (tuân thủ nguyên tắc không kéo dãn nhân tạo, thời lượng = voice 52.8s + natural pause + question + 60f outro)
6. **Keyframe Screenshots**:
   - `00s-intro.png`: Headline đậm nét (opacity 1.0), logo sage H&Đ, slogan hiển thị ở intro, canvas container mềm mại.
   - `05s-scene1.png`: Slogan đã mờ hoàn toàn, headline ổn định 0.86, nhân vật gia đình nhất quán.
   - `10s-scene2.png`: Phân cảnh tiếp theo giữ cùng dàn nhân vật, subtitle phrase karaoke mượt mà.
   - `25s-middle.png`: Sử dụng paper container có washi tape có chọn lọc cho cảnh trở về nhà bên người thân.
   - `49s-question.png`: Headline tự động ẩn để tập trung vào câu hỏi tương tác kết thúc video.
   - `54s-outro.png`: Artwork 9:16 dedicated ("đóng quyển sách"), sạch hoàn toàn, không voiceover.
