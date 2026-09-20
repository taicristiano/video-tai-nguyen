# HAY & ĐẸP. — CINEMATIC LIGHT V2
## Motion & Visual Contract

Version: V2  
Template ID: `human-insight/cinematic-light`  
Brand: `HAY & ĐẸP.`  
Slogan: `Điều hay để biết. Điều đẹp để giữ.`

## 1. Mục tiêu

Cinematic Light V2 phải giải quyết vấn đề lớn nhất của V1: ảnh có chất lượng nhưng video vẫn tạo cảm giác slideshow.

V2 không biến ảnh tĩnh thành “AI video” phô trương. Mục tiêu là: **làm người xem quên rằng họ đang nhìn ảnh tĩnh**.

V2 học cơ chế dựng tốt từ nhóm video tham khảo: headline ổn định; visual đổi theo semantic beat; micro-motion liên tục; character continuity; subtitle gọn; transition đơn giản; một visual accent rõ; art direction nhất quán. Không copy palette, typography hoặc phong cách thương hiệu của kênh khác.

## 2. Brand visual DNA

### Palette
- Background ivory: `#F6F1E8`
- Warm cream: `#F7F2EA`
- Paper/light card: `#FFFCF7`
- Charcoal: `#302D28`
- Deep sage: `#465B49`
- Muted sage: `#71806C`
- Warm accent: `#C79A72`

Không dùng beige/vàng cũ phủ toàn frame. Không dùng dark/yellow visual language của reference.

### Feeling
- warm editorial
- Vietnamese everyday life
- natural soft daylight
- calm, premium, uncluttered
- tactile nhưng sạch
- không quá “vintage paper”, không dirty/grunge mạnh

## 3. Brand hierarchy

### Logo
- H&Đ. xuất hiện xuyên suốt ở mức nhẹ.
- dùng dark-sage transparent mark trên nền sáng.
- opacity khoảng `0.76–0.86`.
- small persistent mark, không cạnh tranh headline.
- breathing tối đa `±0.5%` hoặc static.

### Headline
Headline là visual anchor của toàn video.
- normal scene opacity: `0.82–0.90`.
- giữ ổn định vị trí.
- không animate ra/vào mỗi scene.
- statement/question có thể ẩn hoặc dim mạnh.

### Slogan
Slogan không chạy xuyên suốt. Chỉ dùng ở intro ngắn nếu cần và outro. Không xếp `logo + slogan + headline` thường trực trong normal scene.

## 4. Narrative scene vs Visual beat

Tách hai khái niệm:
- **Narrative scene**: một đoạn logic/narration.
- **Visual beat**: một hình/framing diễn một clause nhỏ.

Không còn mặc định `1 narration segment = 1 image`.

Mục tiêu: `1 narration segment = 1–3 visual beats` tùy semantic density.

## 5. Timing

Recommended:
- micro beat: `1.5–2.2s`
- standard beat: `2.2–3.2s`
- emotional hold: `3.2–4.5s`
- statement/question: `2.0–3.5s`

Không giữ một illustration hoàn toàn giống nhau 5–7 giây. Beat dài >3.5s phải có framing shift, subject movement, foreground change hoặc crop B.

## 6. Micro-motion contract

Mọi normal image scene phải có ít nhất một chuyển động rất nhẹ.

Base motion ví dụ:
```text
scale: 1.010 → 1.025
translateX: 0 → ±4–10px
translateY: 0 → ±2–6px
```

Chỉ chọn 1–2 chuyển động, không dùng tất cả cùng lúc.

Optional ambient:
- subtle grain drift
- floating dust rất nhẹ
- daylight drift
- soft shadow drift
- paper texture movement cực nhỏ

Nếu scene phù hợp:
- character translate 8–20px
- object parallax 4–10px
- foreground drift
- subtle subject movement giả lập bằng layer shift

Không cần AI video generation.

## 7. Motion presets

Tạo preset deterministic:
- `still-breathe`
- `slow-push`
- `slow-pull`
- `drift-left`
- `drift-right`
- `rise-soft`
- `foreground-parallax`
- `focus-shift`
- `emotional-hold`

Không dùng runtime randomness không deterministic. Chọn preset theo scene type, semantic tone, scene index, video seed.

## 8. Transition system

Default:
- cut
- crossfade
- dissolve

Timing: `6–10 frames`.

Không zoom-spin-slide mặc định. Statement/question ưu tiên fade hoặc soft lift.

## 9. Character continuity

### Character Universe
Không khóa một nhân vật cho toàn channel. Tạo các cast ID:
- `family-young-01`
- `couple-young-01`
- `parents-middleage-01`
- `elderly-couple-01`
- `solo-male-01`
- `solo-female-01`
- `child-boy-01`
- `child-girl-01`

### Một video giữ một cast nhất quán
Ví dụ Video 001 dùng `family-young-01`.

Trong toàn video:
- same age
- same hair
- same clothes
- same silhouette
- same body proportions
- same facial design language

### Prompt architecture
Cloudflare generation prompt:
```text
STYLE LOCK
+
CAST LOCK
+
SCENE DESCRIPTION
+
NO TEXT / NO LOGO RULE
```

Ví dụ:
```text
STYLE LOCK:
Warm editorial HAY & ĐẸP. illustration.
Soft ivory/warm-cream background.
Muted sage accents.
Charcoal/sepia graphite linework.
Natural daylight.
Premium uncluttered everyday-life storytelling.

CAST LOCK — family-young-01:
Father: Vietnamese man, 34, short straight black hair,
sage overshirt, cream T-shirt, charcoal trousers.

Mother: Vietnamese woman, 32, shoulder-length straight black hair,
warm beige cardigan, cream dress.

Boy: 7, short black hair, sage T-shirt.
Girl: 5, bob haircut, warm cream dress.

STRICT CONTINUITY:
same age, hairstyle, clothes, proportions and facial design across scenes.

SCENE:
...

NO TEXT, NO LABELS, NO LOGO, NO WATERMARK.
```

## 10. Seed strategy

Không dùng identity seed dựa trên `scene.text + scene.character`.

V2:
```text
videoSeed = hash(videoId / part / slug)
castSeed = hash(videoSeed + castId)
sceneSeed = deterministic small variation from castSeed + sceneIndex
```

Khi Cloudflare model hỗ trợ seed, phải thực sự truyền `seed` vào request body.

## 11. Image generation / asset fallback

Priority:
1. curated CORE asset
2. curated COMPATIBLE asset
3. generate image với STYLE LOCK + CAST LOCK
4. LEGACY fallback
5. generic safe fallback

Không coi toàn bộ kho ảnh ngang hàng.

## 12. Asset tiers

Audit 394 ảnh thành:
- `HAYDEP_CORE`
- `HAYDEP_COMPATIBLE`
- `LEGACY_NEP`
- `REJECT_OFFSTYLE`

Metadata gợi ý:
```json
{
  "id": "...",
  "tier": "HAYDEP_CORE",
  "style": "editorial-stick",
  "subjects": ["family", "dinner"],
  "castCompatibility": ["family-young-01"],
  "palette": ["ivory", "sage", "charcoal"],
  "mood": ["warm", "calm"],
  "motionSafe": true
}
```

Matcher ưu tiên tier trước similarity score nếu semantic score đủ ngưỡng.

## 13. Illustration container

Không dùng paper-card + tape cho mọi scene.

Target mix:
- 60–70% illustration hòa vào canvas
- 20–30% editorial paper/card
- <=10% statement/question special card

Paper frame là một thủ pháp, không phải default container.

## 14. Subtitle

- tối đa 1–2 dòng
- phrase emphasis có chọn lọc
- không đổi size/layout liên tục
- movement chính nằm ở visual, không phải text

## 15. Statement card

Chỉ dùng khi câu thật sự đáng dừng.
- 1 ý
- 1–3 dòng
- 2–3s
- typography mạnh hơn subtitle
- background sạch

## 16. Question card

- 2–3.5s
- dễ đọc
- không CTA ép comment
- không “Bạn nghĩ sao?” chung chung
- có thể giữ illustration nhẹ phía sau thay vì full blank card

## 17. Outro V2

Dùng branded artwork riêng 9:16:
- HAY & ĐẸP.
- `Điều hay để biết. Điều đẹp để giữ.`
- warm editorial / photographic
- ivory + sage + warm wood
- natural daylight

Duration: `60 frames / 2.0s @30fps`.

Motion:
- opacity 0 → 1 trong 8–10f
- scale `1.02 → 1.00`
- không voice outro

Outro phải có cảm giác “đóng quyển sách”.

## 18. Intro V2

Hook 0–3s. Không dành quá nhiều thời gian cho branding.
- headline xuất hiện nhanh
- logo nhỏ
- visual chạy ngay
- slogan không bắt buộc

Người xem phải hiểu chủ đề trước khi thấy full branding.

## 19. Duration policy

Không hardcode mọi video phải 75–80s.

V2 support:
- emotional/family simple insight: 30–45s
- practical HAY.: 45–60s
- explanatory/deep: 60–80s

Prompt có thể yêu cầu duration cụ thể nhưng engine không kéo ảnh artificial để đạt target. Render duration ưu tiên `voice + natural pauses + question + outro`.

## 20. Video 001 target

Title: `Có những bữa cơm sau này mới hiểu là rất quý`  
Series: `ĐẸP.`  
Category: `Gia đình & tình thân`

Suggested:
- cast: `family-young-01`
- duration thực tế ưu tiên 35–50s nếu pacing tự nhiên cho phép
- same family xuyên video
- visual beats:
  1. family dinner as ordinary childhood memory
  2. all family members present
  3. small daily conversation
  4. phone moved aside
  5. parent arriving home / child telling story
  6. quiet emotional family dinner
  7. reflective final frame
  8. question
  9. branded outro

## 21. Acceptance criteria

V2 đạt yêu cầu khi:
- không normal frame nào “dead still” > ~2.5–3s mà không có micro-motion
- headline dễ nhận biết khi sampling bất kỳ giữa video
- logo H&Đ. rõ nhưng không tranh spotlight
- slogan không chiếm top area toàn video
- same cast không đổi tóc/quần áo/tuổi vô lý giữa scene
- illustration không nhảy mạnh giữa detailed-pencil và ultra-simple stick nếu không có lý do
- paper card không xuất hiện ở mọi scene
- scene cut theo semantic beat
- outro artwork đẹp, 2s
- không append brand vào TTS
- video không bị kéo dài chỉ để đạt duration metadata
- render 001 nhìn như video kể chuyện, không phải slideshow có voice

## 22. Nguyên tắc cuối

HAY & ĐẸP. V2 không cố “animate nhiều”.

Nó phải: **ổn định về nhận diện, nhất quán về nhân vật, thay đổi đúng lúc, và luôn có một chuyển động vừa đủ để khung hình còn sống.**
