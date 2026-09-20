# GEMINI 3.8 FLASH HIGH
## Implement HAY & ĐẸP. Cinematic Light V2

Đọc trước:
- `AGENTS.md`
- `docs/templates/human-insight/cinematic-light.md`
- `HAY_DEP_CINEMATIC_LIGHT_V2_CONTRACT.md`

Không rewrite project. Không đổi template ID. Chỉ nâng cấp `human-insight/cinematic-light` theo contract.

## Mục tiêu

Video hiện tại có ảnh tốt nhưng còn cảm giác slideshow. Hãy triển khai V2 để:
- headline mạnh và ổn định hơn
- logo H&Đ. rõ nhưng nhẹ
- slogan không chạy xuyên suốt
- mọi normal image scene có micro-motion
- visual beat nhanh hơn scene-level slideshow
- support character continuity
- Cloudflare seed thực sự được gửi
- visual generation theo HAY & ĐẸP. DNA
- paper card không còn là container bắt buộc
- outro dùng branded artwork 9:16
- không kéo video artificial để đủ duration

## P0 — sửa ngay

### 1. Layout.tsx
- normal headline opacity target `0.82–0.90`
- slogan chỉ intro/outro; không permanent trong normal scenes
- logo mark dùng dark-sage transparent asset, không ivory mark trên cream
- logo small persistent, opacity ~0.8
- header breathing <= ±0.5%
- statement/question vẫn có quyền ẩn headline

### 2. ImageScene.tsx
- bỏ behavior “scene < 6s = completely static”
- mọi normal image scene có deterministic micro-motion
- scale rất nhỏ, không Ken Burns mạnh
- implement motion presets deterministic
- scene >3.5s có framing shift / secondary motion
- transition 6–10f cut/crossfade/dissolve
- không motion flashy

Suggested presets:
- still-breathe
- slow-push
- slow-pull
- drift-left
- drift-right
- rise-soft
- foreground-parallax
- focus-shift
- emotional-hold

### 3. human-insight-image.mjs
- STYLE LOCK theo V2 contract
- thật sự gửi `seed` vào Cloudflare request nếu model support
- refactor seed: `videoSeed -> castSeed -> sceneSeed`
- không dùng scene text như toàn bộ identity seed
- thêm optional `castId` / `castDefinition`
- prompt generation: STYLE LOCK + CAST LOCK + SCENE + NO TEXT

### 4. Outro
- dùng branded 9:16 artwork riêng
- 60f / 2s
- fade 8–10f
- scale 1.02 -> 1.00
- không voice
- fallback về React outro nếu artwork missing

## P1 — visual beat

Hiện pipeline thường 1 narration segment = 1 image.

Thêm backward-compatible support:
```ts
visualBeats?: [
  {
    startFrame,
    endFrame,
    imageSrc,
    motionPreset,
    cropVariant
  }
]
```

Nếu `visualBeats` không có -> fallback current scene behavior.

Spec generator / batch engine có thể chia narration scene thành 1–3 visual beats dựa trên semantic clause.

Không tạo beat chỉ để đạt quota.
Target:
- 1.5–3.2s phổ biến
- emotional hold 3.2–4.5s

## P1 — character universe

Tạo config đơn giản, không over-engineer:
`src/templates/human-insight/cinematic-light/characters.ts`
hoặc JSON tương đương.

Cast IDs:
- family-young-01
- couple-young-01
- parents-middleage-01
- elderly-couple-01
- solo-male-01
- solo-female-01
- child-boy-01
- child-girl-01

Video có thể chọn `castId`.
Nếu không có, infer conservatively từ metadata/category/title.
Không ép cast cho scene không cần người.

## P1 — container mix

Thêm `visualContainer`:
- canvas
- paper
- statement

Default normal narrative = `canvas`.
Paper card chỉ dùng khi spec yêu cầu hoặc deterministic ratio phù hợp.
Không để toàn video scene nào cũng paper+tape.

## P2 — asset tiers

Chuẩn bị schema manifest:
- HAYDEP_CORE
- HAYDEP_COMPATIBLE
- LEGACY_NEP
- REJECT_OFFSTYLE

Không tự phân loại 394 ảnh nếu image library không có trong working context.
Chỉ implement matcher support cho `tier`.

Priority:
CORE -> COMPATIBLE -> generate -> LEGACY fallback.
Không tự động dùng REJECT_OFFSTYLE.

## Duration

Không hardcode 75–80s trong engine.
Nếu prompt yêu cầu duration, coi đó là editorial target.
Không kéo scene duration chỉ để đủ target.
Render duration ưu tiên:
`voice duration + natural pauses + question + 60f outro`.

## Video 001 smoke test

Dùng:
`Có những bữa cơm sau này mới hiểu là rất quý`

Expected:
- same family cast xuyên video
- headline visible
- logo visible
- slogan không permanent
- mỗi normal visual có motion rất nhẹ
- semantic visual changes
- paper card không phủ toàn video
- end question giữ nguyên
- outro branded artwork 2s
- không brand voice

## Verify

1. `npm test`
2. `npx tsc --noEmit`
3. parser 100 videos vẫn pass
4. Step 1–3 Video 001 vẫn pass
5. render Video 001
6. lấy screenshot: 0s, 5s, 10s, middle, question, outro
7. báo:
   - files changed
   - motion presets
   - cast selected cho 001
   - số visual beats
   - duration final
   - fallback compatibility

## Không được

- đổi template ID
- phá TÀI NGUYÊN
- replace global `public/watermark.png`
- xóa historical NẾP
- thêm AI video generation
- làm effect mạnh
- dùng random không deterministic
- rewrite TTS/STT
- làm lại toàn bộ architecture khi có thể mở rộng backward-compatible

Triển khai theo thứ tự P0 -> P1 -> P2.
Nếu P2 thiếu image library để audit, chỉ implement schema/matcher và ghi TODO audit.
