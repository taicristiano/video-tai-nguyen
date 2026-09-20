# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — TEMPLATE STORY ENGINE / GENERALIZATION ROUND

## Mục tiêu

Không tiếp tục tối ưu riêng Video 001.

Vấn đề hiện tại:
- Video 001 đã giúp tìm ra nhiều quy tắc dựng tốt.
- Nhưng nếu các quy tắc đó chỉ nằm trong `reauthor-video001-spec.mjs` hoặc spec riêng của Video 001 thì video 002–100 sẽ không tự thừa hưởng.
- Mục tiêu vòng này là chuyển các bài học từ V3.1/V3.2 thành **behavior mặc định của template `human-insight/cinematic-light` và active generation pipeline**.

KHÔNG hardcode:
- Video 001
- frame cụ thể
- bữa cơm
- family-young-01 cho mọi video
- shot list cụ thể của một bài.

Template phải áp dụng được cho nhiều nhóm nội dung của HAY & ĐẸP.

---

# 1. GIỮ NGUYÊN CÁC PHẦN ĐÃ TỐT

Không làm lại:
- persistent topic title;
- H&Đ logo behavior;
- slogan intro/outro behavior;
- AtmosphericCanvas;
- subtitle karaoke;
- hard-cut narrative default;
- current subtle micro-motion;
- dynamic question timing;
- 60f branded outro;
- TTS / music / ducking;
- parser HAY & ĐẸP.;
- current palette và typography.

Không thêm hiệu ứng chỉ để “trông mới”.

---

# 2. TẠO STORY-PLANNING LAYER DÙNG CHUNG

Active pipeline cần có một bước planning trước khi tạo spec/asset.

Input tối thiểu:
- title
- series: `HAY.` / `ĐẸP.`
- category
- voice paragraphs / clauses
- statement
- question
- visual priorities

Output phải là một `storyPlan` reusable, ví dụ:

```ts
type StoryBeat = {
  id: string;
  voiceClause: string;
  storyRole:
    | 'establish'
    | 'action'
    | 'interaction'
    | 'detail-action'
    | 'context'
    | 'reflection'
    | 'memory'
    | 'release'
    | 'question';

  narrativePurpose: string;

  visualIntent: string;
  visualAction?: string;

  needsPeople: boolean;
  recurringCharacters?: string[];

  castId?: string;
  locationId?: string;
  continuityGroup?: string;

  shotScale: 'wide' | 'medium' | 'close' | 'detail';
  composition:
    | 'portrait-focus'
    | 'editorial-left'
    | 'editorial-right'
    | 'detail-insert'
    | 'canvas'
    | 'paper';

  motionPreset: string;
  assetStrategy: 'library' | 'generate' | 'reuse-canonical';
};
```

Tên/schema cụ thể có thể thay đổi nếu repo hiện tại có type tương đương.
Không over-engineer.

Điều quan trọng:
**story role và visual intent phải được sinh từ ý nghĩa voice, không từ vòng lặp layout.**

---

# 3. CONTENT MODE INFERENCE

Template phải nhận biết loại nội dung trước khi lập shot plan.

Ít nhất hỗ trợ:

## A. `family-emotional`
Ví dụ:
- bố mẹ
- con cái
- bữa cơm
- ký ức gia đình
- tổ ấm

Grammar ưu tiên:
`establish → interaction → specific action → detail → reflection → release`

## B. `relationship-dialogue`
Ví dụ:
- lắng nghe
- xin lỗi
- bạn bè
- giao tiếp

Grammar ưu tiên:
`context → one person acts/speaks → reaction → concrete behavior → reflection`

Không bắt buộc family cast.

## C. `practical-habit`
Ví dụ:
- chuẩn bị từ tối
- lịch
- điện thoại
- thói quen

Grammar ưu tiên:
`problem context → friction/detail → action → improved state → takeaway`

## D. `home-living`
Ví dụ:
- dọn nhà
- góc đọc
- bàn làm việc
- đồ dùng

Grammar ưu tiên:
`space establish → problem detail → human action → improved space → practical takeaway`

Không biến thành catalog nội thất.

## E. `books-ideas`
Ví dụ:
- đọc sách
- ghi chép
- áp dụng một ý

Grammar ưu tiên:
`reader context → page/detail → thinking/action → application in life → reflection`

Không dùng generic book stack liên tục.

Nếu nội dung không khớp rõ, fallback `reflective-everyday`.

---

# 4. ACTION-FIRST VISUAL POLICY

Đây là thay đổi quan trọng nhất.

Template KHÔNG được ưu tiên:
- ảnh đẹp;
- ảnh mood;
- decor;
- teacup;
- căn phòng trống;
- object still-life;

nếu có thể dùng một **hành động cụ thể** để kể cùng voice clause.

Ranking khi lập visual intent:

1. **specific human action**
2. **human interaction/reaction**
3. **object being used in context**
4. **environment with human trace**
5. generic object / decor chỉ là fallback cuối.

Ví dụ:

Voice:
“đặt điện thoại sang một bên”

Tốt:
`a hand placing the phone on a side shelf while family remains in background`

Không tốt:
`a beautiful smartphone on a wooden table`

Voice:
“một ngày thật”

Tốt:
`parent setting bowls, child putting chopsticks, work bag beside chair`

Không tốt:
`warm apartment interior`

---

# 5. NO-FILLER GATE

Mỗi beat phải trả lời:

- Beat này bổ sung thông tin gì?
- Nhân vật/object đang làm gì?
- Nếu bỏ beat, mạch visual có mất một bước không?

Nếu chỉ có lý do:
> “đẹp”, “tạo mood”, “đổi bố cục”, “cho đỡ chán”

=> reject / merge.

Thêm validation function, ví dụ:

```ts
validateStoryPlan(plan)
```

cảnh báo:
- repeated semantic intent;
- generic object-only beat;
- empty-room filler;
- decor filler;
- same idea illustrated nhiều lần;
- layout rotation without story reason.

Không cần AI judge phức tạp nếu rule-based đủ.

---

# 6. SHOT SELECTION KHÔNG ĐƯỢC ROUND-ROBIN LAYOUT

Không được kiểu:
`portrait → left → right → detail → portrait`
chỉ để tạo variety.

Composition phải derive từ `storyRole + visualAction`.

Suggested policy:

- `establish` → wide / portrait-focus / canvas
- `interaction` → medium / portrait-focus / editorial
- `detail-action` → detail-insert
- `reflection` → medium / canvas
- `memory` → paper allowed
- `release` → quiet wide/medium
- `question` → same-universe artwork + overlay

Variety là kết quả của story need, không phải mục tiêu riêng.

---

# 7. VISUAL RHYTHM DEFAULT

Template-level target:
- standard beat: 2.2–3.5s
- detail action: 1.8–3.0s
- emotional hold: 3.2–4.5s
- question: 3–6s tùy voice
- outro: 2.0s

Không ép shot count.

Nếu một paragraph dài:
- split theo semantic clause.

Nếu hai clause cùng một visual action:
- merge.

Không kéo video chỉ để đủ duration metadata.

---

# 8. CHARACTER CONTINUITY PHẢI LÀ TEMPLATE CAPABILITY

Không khóa một family cho toàn channel.

Pipeline phải quyết định:

```ts
needsRecurringCast: boolean
```

Nếu `false`:
- không ép cast.

Nếu `true`:
- chọn/create `castId`;
- tạo **canonical cast definition một lần cho video**;
- tất cả human beats cùng continuityGroup dùng cast đó.

Per-video continuity lock gồm:
- age
- gender presentation
- hairstyle
- glasses/no-glasses
- facial design descriptors
- wardrobe family
- body proportions

Không chỉ khóa màu quần áo.

Ví dụ:
`family-emotional` có thể dùng family cast.
`books-ideas` có thể chỉ dùng `solo-female-01`.
`home-living` có thể dùng solo/couple hoặc không cần recurring face.

---

# 9. CANONICAL CAST SOURCE OF TRUTH

Không để:
- character config nói một kiểu;
- QA report nói kiểu khác;
- generated output dùng kiểu thứ ba.

Tạo một object duy nhất, ví dụ:

```ts
type VideoCast = {
  castId: string;
  members: {...};
  seed: number;
  referenceAsset?: string;
};
```

Generation prompt phải lấy từ object này.

Nếu pipeline có canonical reference artwork:
- các scene memory/recall nên ưu tiên reuse/crop/variant từ canonical asset thay vì generate khuôn mặt mới không cần thiết.

Không cần redesign character engine toàn project.
Chỉ đảm bảo một source of truth.

---

# 10. WORLD / LOCATION CONTINUITY

Nếu video kể cùng một câu chuyện:
- tạo `locationId`, ví dụ `home-dining-01`;
- khóa:
  - loại bàn;
  - tone ánh sáng;
  - wall/furniture language;
  - time-of-day family.

Không cần room giống pixel-perfect.
Nhưng không được:
- scene 1 ở căn hộ A;
- scene 2 thành nhà hàng;
- scene 3 thành căn bếp hoàn toàn khác;
nếu voice đang kể cùng một buổi / cùng một gia đình.

Story planner quyết định:
`sameWorld: true/false`.

---

# 11. ASSET MATCHER — ĐỔI THỨ TỰ ƯU TIÊN

Khi chọn ảnh từ library hoặc generated pool, scoring phải ưu tiên:

1. story-role / action semantic fit;
2. cast continuity;
3. world/location continuity;
4. style/tier compatibility;
5. palette;
6. generic similarity.

Một asset semantic gần nhưng cast sai phải thua asset semantic đủ tốt + cast đúng.

Nếu không có asset hợp:
=> generate mới.

Không lấy asset filler chỉ vì similarity score cao.

---

# 12. STATEMENT & QUESTION KHÔNG ĐƯỢC MẶC ĐỊNH CẮT ĐỨT SHORT FILM

Default cho `human-insight/cinematic-light`:

## Statement
Ưu tiên:
- statement text overlay trên artwork đang kể chuyện;
- hoặc giữ artwork + dim nhẹ.

Full white statement card chỉ khi:
- spec explicitly requests `statementCard: true`;
- hoặc nội dung thực sự cần pause mạnh.

## Question
Default:
- giữ cùng visual universe;
- question text overlay trên artwork mềm / subdued;
- không tự động che 100% artwork bằng white card.

Full question card phải opt-in.

Dùng component/layout hiện có nếu đủ.
Không cần tạo layout mới nếu có thể cấu hình current one.

---

# 13. PAPER CARD POLICY

Không paper/tape mặc định.

Template default:
- narrative normal → canvas/artwork
- memory/archival/reflection → paper allowed
- statement special → optional

Target không cứng:
- phần lớn normal scenes không paper;
- paper là punctuation, không phải container mặc định.

---

# 14. GENERATION PROMPT BUILDER

Human-insight image prompt nên build theo:

```text
STYLE LOCK
+
CAST LOCK (nếu cần)
+
WORLD LOCK (nếu cần)
+
STORY ROLE
+
SPECIFIC ACTION
+
CAMERA / COMPOSITION
+
NEGATIVE RULES
```

Ví dụ:

```text
STORY ROLE: interaction
ACTION:
Vietnamese boy excitedly tells a story from school with one hand gesturing;
father and mother actively look at him and listen;
younger sister reacts with a smile.

WORLD:
same warm family dining room as other scenes.

Do not pose characters toward camera.
Do not make a family portrait.
No text, labels, logo, watermark.
```

Tránh prompt:
`warm happy family dinner, beautiful cinematic atmosphere`

vì quá generic.

---

# 15. PROMPT NEGATIVE RULES THEO ROLE

Human scene:
- no camera-facing portrait unless specifically requested;
- no random extra people;
- no duplicated children;
- no glasses change;
- no age jump;
- no text.

Home scene:
- no showroom;
- no luxury catalog;
- no empty room unless release/context specifically requires it.

Book scene:
- no generic giant book stack;
- show reading/writing/applying.

Object detail:
- include hand/action/context where possible;
- no product photography.

---

# 16. AUTOMATIC STORY QA ARTIFACTS

Trong dev/QA mode, active pipeline nên có thể xuất:

1. `story-plan.json`
2. shot audit markdown/table
3. 12–16 frame contact sheet
4. artwork-only contact sheet
5. cast/reference sheet nếu recurring cast
6. optional muted QA notes

Không cần render những artifact này trong production nếu flag off.

Ví dụ:
`--qa-story`

Không làm dependency nặng nếu repo đã có screenshot/contact-sheet helpers.

---

# 17. TEMPLATE-LEVEL VALIDATION

Add tests cho story planner, ít nhất:

### Test 1 — family-emotional
Phải có:
- establish
- interaction
- specific domestic action
- reflection/release

Không được toàn object shot.

### Test 2 — practical-habit
Không được tự tạo family dinner grammar.
Phải có:
- friction
- action
- improved state

### Test 3 — books-ideas
Không được chỉ sinh book stacks.
Phải có reader action / annotation / application.

### Test 4 — home-living
Không được toàn empty interiors.
Phải có human use/action.

### Test 5 — relationship-dialogue
Phải có interaction/reaction, không chỉ portrait faces.

---

# 18. GENERALIZATION CHECK TRÊN CATALOG THẬT

Không chỉ test Video 001.

Chạy story planner/spec dry-run cho ít nhất 5 video:

1. Video 001 — ĐẸP. / Gia đình
   `Có những bữa cơm sau này mới hiểu là rất quý`

2. Video 005 — HAY. / Giao tiếp
   `Khi người thân kể chuyện, đừng vội sửa hộ`

3. Video 007 — HAY. / Nhà cửa
   `Một căn nhà dễ chịu không nhất thiết cần thêm đồ`

4. Video 013 — HAY. / Sách
   `Đọc một cuốn sách hay không nhất thiết phải nhớ hết`

5. Video 028 — ĐẸP. / Gia đình / trẻ nhỏ
   `Con cái không cần bố mẹ lúc nào cũng đúng`

For each return:
- inferred content mode;
- recurring cast yes/no;
- 6–12 story beats;
- beat roles;
- sample visual intents;
- no-filler validation;
- statement/question behavior.

Không cần render đủ 5 trong round này.
Mục tiêu là chứng minh template không bị overfit Video 001.

---

# 19. BACKWARD COMPATIBILITY

Spec cũ không có storyPlan vẫn render được.

Nếu field mới thiếu:
- use current behavior.

Không phá:
- existing generated videos;
- TÀI NGUYÊN template;
- other templates;
- historical NẾP data.

Không đổi template ID:
`human-insight/cinematic-light`.

---

# 20. SOURCE OF TRUTH

Sau round này:
- `scripts/reauthor-video001-spec.mjs` chỉ còn là smoke-test/reference nếu cần;
- không được là nơi duy nhất chứa storytelling intelligence.

Storytelling rules phải nằm ở reusable code/config/docs của:
`human-insight/cinematic-light`

và generation pipeline chung.

Nếu xóa `reauthor-video001-spec.mjs`,
video tiếp theo vẫn phải nhận được story grammar tốt.

Đây là acceptance criterion rất quan trọng.

---

# 21. DEFINITION OF DONE

Round này chỉ PASS khi:

1. Video 001 không còn là special-case chính của engine.
2. 005/007/013/028 tạo ra story plans hợp loại nội dung riêng của chúng.
3. Không có round-robin layout.
4. Không có generic filler policy.
5. Character continuity là per-video capability.
6. Same-world continuity là per-video capability.
7. Question/statement mặc định không cắt đứt artwork.
8. Story plan có action-first visual intents.
9. Existing V3.1 technical locks vẫn pass.
10. Tests / typecheck pass.
11. Không hardcode frame/video index/title cụ thể trong reusable template.

---

# 22. OUTPUT CUỐI

Báo chính xác:

## A. Files changed

## B. Reusable template behavior added
- story planner
- content mode inference
- action-first policy
- continuity
- no-filler validation
- question/statement behavior

## C. Generalization table

| Video | Mode | Recurring cast | #beats | Story grammar |
|---|---|---|---:|---|

cho 001 / 005 / 007 / 013 / 028.

## D. Example story plans
Ít nhất 005 và 013 để chứng minh không overfit family content.

## E. Tests

## F. Remaining limitations

Không claim “production-ready” chỉ vì tests pass.

Đây là **template generalization round**, không phải final visual QA.
