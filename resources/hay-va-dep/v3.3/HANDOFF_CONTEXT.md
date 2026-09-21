# HANDOFF_CONTEXT.md

## Mục đích

File này dùng để mở **chat mới** và tiếp tục đúng trạng thái hiện tại của project **HAY & ĐẸP.** mà không phải kể lại toàn bộ lịch sử.

> **Điểm quan trọng nhất:** Đã đi qua phần lớn audit kiến trúc/pipeline. Hiện đang ở **Human Visual QA của Attempt 2 cho video005**.  
> Không được quay lại nghiên cứu kiến trúc từ đầu nếu chưa phát hiện blocker mới trong output thật.

---

# 1. PROJECT / BRAND LOCK

## Brand hiện tại

```text
HAY & ĐẸP.
Điều hay để biết. Điều đẹp để giữ.
```

Legacy brand:

```text
NẾP.
Những điều nhỏ tạo nên một đời sống.
```

Legacy `NẾP.` đã được migrate khỏi spoken audio của video005 trong production flow.

## Visual identity đã khóa

```text
clean 2D cartoon / illustrated editorial
clearly hand-drawn
non-photorealistic
warm ivory / cream
muted sage
warm wood
charcoal / sepia linework
restrained terracotta / amber
matte / gouache-like fills
simplified facial features
simplified grouped hair shapes
calm premium editorial look
```

### Hard exclusions

```text
NO photorealism
NO hyperrealism
NO realistic skin texture / pores
NO individual realistic hair strands
NO glossy CGI skin
NO photographic lighting
NO lens blur / shallow depth of field
NO 3D render
NO text pollution
NO pseudo-text
NO logos / signatures / watermark pollution
```

## Image model lock

Chỉ dùng:

```text
@cf/black-forest-labs/flux-1-schnell
```

Không đổi model.
Không rotate account/model.
HTTP 429 = `PAUSED_QUOTA`, không tính attempt.

## Identity policy đã khóa

```text
Cross-shot facial likeness consistency is NOT required.
```

Mỗi ảnh chỉ cần độc lập đúng:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Không tốn retry để ép giống mặt giữa các shot.

---

# 2. TYPOGRAPHY / WATERMARK / MOTION BASELINE ĐÃ CHỐT

Không reopen nếu không có lỗi thật.

## Typography

Accepted baseline sau V1.2/V1.2.1:

- headline lớn hơn bản cũ;
- subtitle lớn hơn;
- artwork hạ xuống để có khoảng thở;
- typography/watermark user đã check và chấp nhận.

## Watermark

Accepted V1.2.1 baseline:
- top-right;
- rõ hơn bản cũ;
- không cần chỉnh tiếp.

## Artwork framing

Outer artwork window phải **centered**.

`editorial-left/right` chỉ là internal crop/focal bias, không được đẩy cả card lệch khung.

## Motion

V1.1 đã được chấp nhận:
- calm;
- subtle;
- no bounce;
- no spring;
- no rotation;
- atmosphere/background nhẹ;
- hard cuts.

Không mở “motion V1.3” chỉ để tăng motion.

---

# 3. HIGH-VIEW REFERENCE LEARNINGS ĐÃ CHỐT

Mục tiêu không phải copy style của video triệu view.

Cần học **retention grammar**:

```text
visual mới
→ action
→ detail
→ emotion
→ release
```

Các rule đã được đưa vào production planner:

```text
~18–22 meaningful visual changes/min
max 2 consecutive same scales
max 2 consecutive same silhouettes
normal image hold <= 4.0s
hard cuts
semantic action first
scale/anti-monotony second
```

Visual rhythm mong muốn:

```text
WIDE
→ MEDIUM
→ DETAIL
→ CLOSE
→ RELEASE
```

Không cần exact sequence, nhưng phải nhìn thấy sự khác biệt thật trong ảnh.

### Nguyên tắc quan trọng

```text
camera motion cannot rescue a weak shot
semantic visual progression > zoom/pan
```

---

# 4. PRODUCTION PIPELINE — TRẠNG THÁI KIẾN TRÚC HIỆN TẠI

Đã nối thật vào production path:

```text
scripts/batch-engine.mjs
→ scripts/human-insight-story-planner.mjs
→ src/templates/human-insight/cinematic-light/referenceShotGrammarRuntime.mjs
→ src/templates/human-insight/cinematic-light/storyPlannerRuntime.mjs
→ spec / visualBeats
→ scripts/human-insight-image.mjs
```

## Runtime SSOT

Runtime logic nằm ở:

```text
referenceShotGrammarRuntime.mjs
storyPlannerRuntime.mjs
```

TypeScript wrappers:

```text
referenceShotGrammar.ts
storyPlanner.ts
```

dùng type + re-export, không nên duplicate runtime logic.

## Production bridge đã sửa

Đã xử lý:
- cross-segment continuation;
- canonical vs visual segment bounds;
- asset cache cho merged beat;
- no orphan narrative scene;
- planner uppercase scale → renderer lowercase scale;
- exact people min/max đi xuống prompt ảnh;
- silhouette compatibility;
- không dùng `idx % 2 / idx % 3` để chọn scale;
- không hard-code video005 fixture trong batch engine;
- timer/document prompt safety đi vào real image generator;
- bỏ facial-likeness continuity requirement;
- holdException chỉ ảnh hưởng duration;
- real offline spec bridge tests.

---

# 5. TEMPLATE-LEVEL VISUAL LANGUAGE — ATTEMPT 2 FIX

Sau khi Attempt 1 fail visual QA, template được nâng thêm:

## Tách story participants khỏi visible people

```text
storyParticipants
!=
visibleMembers
!=
visiblePeopleContract
```

Ví dụ dialogue có 2 người, nhưng:

### Reaction close

```text
visibleMembers = [listener]
visiblePeopleContract = 1..1
```

### Phone detail

```text
visiblePeopleContract = 1..1
silhouette = hands-detail
```

### Release

```text
visibleMembers = []
visiblePeopleContract = 0..0
silhouette = empty-space
```

## VisualMode

Đã thêm:

```text
ENVIRONMENT_WIDE
INTERACTION_MEDIUM
REACTION_CLOSE
ACTION_DETAIL
OBJECT_DETAIL
EMPTY_RELEASE
GROUP_WIDE
```

Scale là hệ quả của visual mode / semantic meaning, không chỉ là label thay phiên.

## Visual-mode diversity

Với narrative video >=10 shot:
- yêu cầu >=4 distinct visual modes khi semantic cho phép;
- không để quá nhiều `INTERACTION_MEDIUM` liên tục;
- `EMPTY_RELEASE` phải 0..0 people;
- `REACTION_CLOSE` thường <=1 primary visible person;
- `DETAIL` không được biến thành full two-person sofa shot.

---

# 6. VIDEO005 — BRAND MIGRATION / AUDIO / TIMELINE

Video005 hiện dùng nội dung:

```text
Khi người thân kể chuyện, đừng vội sửa hộ
```

Brand legacy spoken `Nếp` đã được bỏ.

Canonical ending hiện kết thúc tự nhiên bằng câu hỏi:

```text
"Khi bạn mệt, bạn thích người khác lắng nghe trước hay đưa giải pháp ngay?"
```

Brand được giữ ở visual OutroCard:

```text
HAY & ĐẸP.
Điều hay để biết. Điều đẹp để giữ.
```

## Audio/timeline sau migration

Theo production report:

```text
Voice duration: ~45.89s
Timeline duration: ~45.89s
13 canonical segments
181 tokens
179 exact
0 substitutions
0 hallucinations
0 interpolated
Integrity: PASS
```

## Production readiness

Sau migration:

```text
structuralValidation.ok = true
productionValidation.productionReady = true
```

---

# 7. ATTEMPT 1 — HUMAN VISUAL QA KẾT LUẬN

Attempt 1 đã chạy thật bằng Schnell.

## Attempt 1 systemic failures

### STYLE — FAIL hệ thống

Phần lớn ảnh:
- semi-photorealistic / realistic;
- realistic skin/hair/lighting;
- không đúng clean 2D illustrated editorial.

### SHOT_LANGUAGE_FIDELITY — FAIL hệ thống

Metadata có:

```text
WIDE / MEDIUM / CLOSE / DETAIL / RELEASE
```

nhưng output thực tế phần lớn vẫn là:

```text
two people seated on sofa
medium conversational framing
```

Không đọc label vẫn khó nhận ra wide/detail/close.

### Hard semantic fails đã xác nhận

#### shot-05

Expected:
```text
listener puts phone away / places phone down
DETAIL
```

Actual:
```text
person visibly holding phone
```

#### shot-11

Expected:
```text
phone put away
```

Actual:
```text
phone prominently visible in hand
```

#### shot-15

Expected:
```text
RELEASE
empty-space
peopleContract = 0..0
```

Actual:
```text
2 visible people
```

## Attempt 1 QA

```text
STYLE               = FAIL systemic
PEOPLE_CONTRACT     = FAIL shot-15
SEMANTIC_FIDELITY   = FAIL shot-05/11/15
ANATOMY             = not main blocker
TEXT_POLLUTION      = no major blocker observed
SHOT_LANGUAGE       = FAIL systemic
```

Attempt 1 review manifest đã được đổi sang:

```text
NEEDS_REGEN
```

---

# 8. ATTEMPT 2 — CURRENT STATE

Đây là trạng thái cần tiếp tục trong chat mới.

Gemini đã báo:

```text
HAY & ĐẸP. VIDEO005 ATTEMPT 2 — READY FOR HUMAN VISUAL REVIEW
```

Nhưng **đây mới là report**.

Cần kiểm tra **ảnh thật Attempt 2** trước khi PASS.

## Attempt 2 production report

### Shot count

```text
16
```

### CPM

```text
21.02
```

### VisualMode distribution

```text
ENVIRONMENT_WIDE     4
REACTION_CLOSE       9
INTERACTION_MEDIUM   1
ACTION_DETAIL        1
EMPTY_RELEASE        1
```

### Scale distribution

```text
WIDE      2
MEDIUM    7
CLOSE     5
DETAIL    1
RELEASE   1
```

### Visible people distribution

```text
0 visible people: 1
1 visible person : 10
2 visible people : 5
```

### Generation

```text
Model: @cf/black-forest-labs/flux-1-schnell
16 Cloudflare calls
15 assets = Attempt 2
shot-16 = dedicated new asset, Attempt 1
429 = 0
```

### QA state hiện tại

```text
PASS = 0
PENDING_VISUAL_QA = 16
NEEDS_REGEN = 0
```

Không được tin con số `NEEDS_REGEN = 0` cho tới khi human review ảnh thật.

---

# 9. LATEST FILE — PHẢI REVIEW TRƯỚC TIÊN

User đã upload:

```text
changes(3).zip
```

Đây là package mới nhất của Attempt 2.

Bên trong có:

```text
scratch/video005-production/attempt-2/contact-sheet.jpg
scratch/video005-production/attempt-2/shot-language-strip.jpg
scratch/video005-production/attempt-2/review-manifest.json
scratch/video005-production/attempt-2/prompt-contract-audit.json
scratch/video005-production/attempt-2/visual-mode-audit.json
scratch/video005-production/attempt-2/shot-01.jpg ... shot-16.jpg
```

Ngoài ra có source code / tests / production images.

## Images đã hiện trong chat hiện tại

Latest conversation đã render được:

```text
Attempt 2 contact-sheet.jpg
Attempt 2 shot-language-strip.jpg
```

Nhưng **chưa có assistant verdict Human Visual QA cho Attempt 2**.

### ĐÂY LÀ NEXT ACTION CHÍNH

Trong chat mới:

1. mở `changes(3).zip`;
2. inspect actual Attempt 2 contact sheet;
3. inspect shot-language strip;
4. mở individual shots khi cần;
5. đánh giá theo locked QA;
6. không tin report “READY” nếu ảnh thật không đạt.

---

# 10. HUMAN VISUAL QA — LOCKED CRITERIA

Mỗi ảnh đánh:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Diagnostic thêm:

```text
SHOT_LANGUAGE_FIDELITY
```

## PASS conditions

### STYLE
Ảnh phải nhìn rõ là:
- hand-drawn/editorial;
- 2D;
- simplified;
- matte;
- non-photorealistic.

### PEOPLE_CONTRACT
Exact number of visible people/body parts đúng.

### SEMANTIC_FIDELITY
Action trong ảnh phải đúng với narration/visualVerb.

### ANATOMY
Không extra fingers/arms/hands, không deform rõ.

### TEXT_POLLUTION
Không chữ giả, logo, số, nhãn, watermark ngoài brand composition.

### SHOT_LANGUAGE_FIDELITY
Không cần đọc label vẫn nên nhận ra:
- WIDE thật sự có environment;
- CLOSE thật sự close;
- DETAIL thật sự object/action dominates;
- RELEASE thật sự có breathing room.

---

# 11. ATTEMPT BUDGET

Attempt 1 đã consumed cho 15 original generated slots.

Attempt 2 đã consumed cho 15 slots đó.

Còn tối đa:

```text
Attempt 3
```

cho các slot fail sau Human QA Attempt 2.

Shot-16 là fresh dedicated asset:
- Attempt 2 batch nhưng riêng shot-16 mới là generation attempt 1.

## 429

```text
PAUSED_QUOTA
```

Không tính attempt.

---

# 12. REGEN POLICY

Nếu Attempt 2 fail:

## Systemic fail

Nếu nhiều ảnh còn photorealistic / same sofa framing:
- sửa root template prompt/planner;
- regenerate các affected slots;
- không raster cleanup.

## Localized fail

Sau Attempt 3 mới được deterministic local cleanup cho lỗi nhỏ:
- isolated pseudo-text;
- small unwanted object;
- logo mark;
- local artifact.

Không raster cleanup cho:
- wrong whole scene;
- wrong people count;
- major anatomy;
- wrong action;
- wrong visual mode.

---

# 13. DO NOT DO THESE THINGS

Không:
- reopen whole architecture;
- change image model;
- switch away from Schnell;
- auto-PASS based on file integrity;
- render MP4 before all required images PASS;
- use motion to rescue weak images;
- force facial likeness consistency;
- trust Gemini report without viewing images;
- create endless new phases.

---

# 14. WHEN ATTEMPT 2 PASSES

Nếu Human QA Attempt 2 đạt đủ production assets:

Next step:

```text
1. mark selected assets PASS;
2. update manifest;
3. render final video005 bằng real production pipeline;
4. inspect actual MP4;
5. compare visual rhythm với reference-derived grammar;
6. only then promote to batch production.
```

MP4 review phải check:
- title/watermark accepted baseline;
- no framing shift;
- no blank frames;
- real shot changes visible;
- wide/medium/detail/close/release progression;
- calm motion;
- atmosphere;
- subtitle legibility;
- no static slideshow feeling.

---

# 15. USER WORKING STYLE

User muốn:
- skeptical review;
- nhìn file/ảnh thật;
- không tin Gemini report mù quáng;
- full prompts cho Gemini, có code quan trọng;
- mỗi lần chỉ 1 next action rõ;
- tránh proliferate phase;
- ưu tiên output nhìn đẹp hơn test-count;
- template-level fix để video sau tự hưởng;
- không vá riêng video005 nếu lỗi là reusable.

Câu user thường dùng:
```text
đọc kỹ / xem kỹ rồi mới tính phương án tiếp
```

Hãy giữ đúng phong cách này.

---

# 16. LATEST HANDOFF VERDICT

Tại thời điểm tạo file này:

```text
PIPELINE ARCHITECTURE:
enough / do not reopen by default

VIDEO005 ATTEMPT 1:
FAIL human visual QA

VIDEO005 ATTEMPT 2:
GENERATED
PENDING HUMAN VISUAL QA

FINAL MP4:
NOT RENDERED

NEXT ACTION:
REVIEW ACTUAL ATTEMPT-2 IMAGES FROM changes(3).zip
```

---

# 17. FILES / ARTIFACTS QUAN TRỌNG TRONG CHAT CŨ

Latest uploaded:

```text
changes(3).zip
```

Previous relevant archives:

```text
changes(2).zip   # Attempt 1 production image set + pipeline
changes(1).zip   # production bridge correction
changes.zip      # earlier production bridge
```

Prompts đã dùng gần đây:

```text
PROMPT_GEMINI_HAY_DEP_FINAL_PRODUCTION_BRIDGE_CORRECTION.md
PROMPT_GEMINI_HAY_DEP_VIDEO005_BRAND_MIGRATION_AND_REAL_IMAGE_GENERATION.md
PROMPT_GEMINI_HAY_DEP_VIDEO005_ATTEMPT2_VISUAL_QA_FIX.md
```

Nếu mở chat mới chỉ cần:
- upload `changes(3).zip`;
- upload `HANDOFF_CONTEXT.md`;
- nói:  
  **“Tiếp tục từ HANDOFF_CONTEXT.md, review Attempt 2 actual images trước.”**

---

# 18. FIRST RESPONSE EXPECTATION IN NEW CHAT

Không cần kể lại lịch sử.

Assistant mới nên làm ngay:

```text
1. inspect changes(3).zip
2. inspect Attempt 2 contact sheet
3. inspect shot-language strip
4. inspect individual suspect shots
5. give real Human Visual QA verdict
6. choose exactly one next action
```

Nếu Attempt 2 chưa đạt:
- chỉ định shot nào fail;
- phân biệt systemic vs local;
- nếu cần viết Prompt Attempt 3.

Nếu Attempt 2 đạt:
- mark PASS list;
- proceed to final render prompt.

---

# END
