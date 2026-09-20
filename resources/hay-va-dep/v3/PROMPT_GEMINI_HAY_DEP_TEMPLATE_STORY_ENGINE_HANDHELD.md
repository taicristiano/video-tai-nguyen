# GEMINI 3.8 FLASH HIGH
# IMPLEMENT HAY & ĐẸP. TEMPLATE STORY ENGINE — HANDHELD ROUND

Bạn đang sửa repo hiện tại.

Không tự thiết kế lại.
Không nghĩ architecture mới.
Không tối ưu riêng Video 001.
Không bỏ qua code blueprint.

## BẮT BUỘC ĐỌC TRƯỚC

1. `AGENTS.md`
2. `resources/hay-va-dep/v3/HAY_DEP_TEMPLATE_STORY_ENGINE_CODE_BLUEPRINT.md`
3. `resources/hay-va-dep/HAY_DEP_V3_2_SHOT_PLAN_VIDEO001.md`
4. `docs/templates/human-insight/cinematic-light.md`

Ngoài ra copy 2 file được cung cấp vào repo:

- `resources/hay-va-dep/v3/human-insight-story-planner.mjs`
  -> `scripts/human-insight-story-planner.mjs`

- `resources/hay-va-dep/v3/character-casts.json`
  -> `src/templates/human-insight/cinematic-light/character-casts.json`

## MỤC TIÊU DUY NHẤT

Chuyển intelligence đã học từ Video 001 thành reusable behavior của:

`human-insight/cinematic-light`

để Video 005 / 007 / 013 / 028 tự sinh story grammar đúng loại nội dung mà không phụ thuộc `reauthor-video001-spec.mjs`.

---

# PHASE 0 — AUDIT, KHÔNG SỬA

Trước khi sửa, xác nhận các facts này trong repo:

1. `batch-engine.mjs` có `i % 3 === 2` để đổi layout.
2. `batch-engine.mjs` chưa truyền `--cast`, `--slug`, `--scene-index` vào `human-insight-image.mjs`.
3. `human-insight-image.mjs` có duplicate `CHARACTER_CASTS`.
4. neutral fallback trong `buildPrompt()` vẫn nói `stick-figure`.
5. `validateVisualRhythm.ts` có:
   - warning 3 composition giống nhau liên tiếp;
   - yêu cầu minimum 4 composition types.
6. `InsightCard.tsx` hiện chỉ là full white card.
7. `VideoContent.tsx` truyền `hasInsightCard={Boolean(scene.insightText)}`.
8. `batch-engine.mjs` dùng matcher từ `human-insight-image.mjs`, không dùng `smart-asset-matcher.mjs`.

In ra audit ngắn trước khi code.

Nếu fact nào khác repo hiện tại, dừng đúng fact đó và báo, không tự suy đoán.

---

# PHASE 1 — COPY STORY PLANNER NGUYÊN BẢN

Copy file được cung cấp:

`human-insight-story-planner.mjs`

thành:

`scripts/human-insight-story-planner.mjs`

Không rút gọn.
Không rewrite thành code khác.

Chạy syntax check:

```bash
node --check scripts/human-insight-story-planner.mjs
```

---

# PHASE 2 — SINGLE CHARACTER SOURCE OF TRUTH

Copy:

`character-casts.json`

thành:

`src/templates/human-insight/cinematic-light/character-casts.json`

Sửa `characters.ts` đúng code trong blueprint:
- import JSON;
- giữ type;
- export CHARACTER_CASTS;
- inferCastId giữ backward compatibility.

Sửa `human-insight-image.mjs`:
- đọc CÙNG JSON đó bằng `fs.readFileSync`;
- xóa object `CHARACTER_CASTS` duplicate.

Không còn hai định nghĩa cast.

Verify:

```bash
rg -n "CAST LOCK — family-young-01" \
  src/templates/human-insight/cinematic-light scripts/human-insight-image.mjs
```

Định nghĩa data thật chỉ được nằm trong JSON.

---

# PHASE 3 — PATCH HUMAN IMAGE GENERATOR ĐÚNG BLUEPRINT

Làm đúng Section D trong:
`HAY_DEP_TEMPLATE_STORY_ENGINE_CODE_BLUEPRINT.md`

Bắt buộc:

### CLI thêm:
- `--story-role`
- `--action`
- `--world-id`
- `--world-lock`

### buildPrompt:
phải theo thứ tự:

```text
STYLE LOCK
CAST LOCK
WORLD LOCK
STORY ROLE
SPECIFIC ACTION
SHOT
SCENE
NEGATIVE RULES
```

### Xóa active stick-figure fallback

Không còn string:
`Use simple gender-neutral stick-figure characters`

Fallback neutral phải là natural editorial human.

### scoreAsset:
thêm:
- cast continuity scoring
- world continuity scoring
- story role scoring

Cast mismatch phải bị penalty mạnh hơn semantic keyword bonus.

### generated metadata:
lưu:
- castId
- worldId
- storyRole

Không thay Cloudflare model.
Không thay threshold chỉ để tests pass.

---

# PHASE 4 — PATCH BATCH ENGINE

Làm đúng Section E blueprint.

## 4.1 Import planner

```js
import {
  buildStoryPlan,
} from './human-insight-story-planner.mjs';
```

## 4.2 Destructure thêm
- series
- category

## 4.3 Sau transcription

Call:

```js
const storyResult = buildStoryPlan(
  {
    index,
    part,
    title,
    series,
    category,
    voiceScriptText,
    statementText,
    visualPriorities,
  },
  segments,
);
```

Write:
- `story-plan.json`
- `story-plan-validation.json`

Invalid plan => throw, không im lặng fallback.

## 4.4 Xóa round-robin

XÓA:

```js
i % 3
```

Không có `%` nào dùng để rotate composition/layout.

## 4.5 Asset generation

Thêm helper `resolveBeatAsset()` đúng blueprint.

BẮT BUỘC khi spawn image generator phải truyền:

```text
--slug
--scene-index
--cast (nếu có)
--story-role
--action
--world-id
--world-lock
--shot-scale
--composition
```

Đây là phần quan trọng nhất.

Không được giữ call cũ chỉ có:
`text/type/mood/visual`.

## 4.6 visualBeats

Mỗi transcript segment:
- lấy beats cùng `segmentIndex`;
- convert source transcript frame ratios sang local scene frames;
- resolve asset từng beat;
- build `visualBeats`.

Không cần 2–3 beat cho mọi scene.
Planner quyết định.

## 4.7 Scene metadata

Persist:
- storyRole
- narrativePurpose
- visualIntent
- castId
- worldId
- continuityGroup
- composition
- shotScale
- motionPreset
- visualContainer

Spec cũ vẫn valid.

---

# PHASE 5 — STATEMENT / QUESTION OVERLAY

Làm đúng Sections F/G/H blueprint.

## Spec:
thêm:

```ts
insightVariant?: 'overlay' | 'card';
```

## InsightCard:
thêm prop variant.

Default:
`overlay`.

Giữ white card cũ cho `card`.

## VideoContent:
CHỈ set:

```tsx
hasInsightCard={true}
```

khi:

```ts
insightVariant === 'card'
```

Overlay không được làm ImageScene biến mất.

## Batch:
statement mặc định:
`insightVariant = 'overlay'`

ending question mặc định:
`insightVariant = 'overlay'`

Không còn tự động biến statement thành `layout = 'statement'`.

Không tạo component mới nếu `InsightCard` extension đủ dùng.

---

# PHASE 6 — FIX VISUAL RHYTHM VALIDATOR

Trong `validateVisualRhythm.ts`:

XÓA:
- warning 3 composition giống nhau liên tiếp;
- minimum 4 composition types.

Lý do:
hai rule này tạo incentive round-robin layout.

Giữ:
- >5s dead shot warning;
- long scene with one beat;
- paper ratio.

Thêm story metadata validation theo blueprint.

Tests hiện tại nào assert minimum composition phải sửa theo semantic rule mới.

---

# PHASE 7 — GENERALIZATION DRY RUN

Tạo:

`scripts/test-story-planner.mjs`

Dùng:
- parser 100 video thật;
- synthetic timing như blueprint;
- planner thật.

Chạy cho:

- 001
- 005
- 007
- 013
- 028

Output table:

```text
Video
Mode
Cast
World
Beat count
Story roles
First 3 visual intents
Validation
```

Expected:

### 001
`family-emotional`

### 005
`relationship-dialogue`

Không được có dinner/family grammar mặc định nếu content không yêu cầu.

### 007
`home-living`

Không được toàn empty interior.

### 013
`books-ideas`

Phải có reader action:
read / annotate / think / apply.

Không được generic book stacks.

### 028
`family-emotional`
recurring cast = true.

---

# PHASE 8 — TESTS

Bổ sung tests hoặc CLI assertions cho:

1. content mode inference
2. no filler
3. no round-robin composition requirement
4. cast source of truth
5. statement overlay default
6. question overlay default

Run:

```bash
node --check scripts/human-insight-story-planner.mjs
node scripts/test-story-planner.mjs
node scripts/parse-hay-dep-videos.mjs
npm test
npx tsc --noEmit --skipLibCheck
```

---

# PHASE 9 — GREP ACCEPTANCE

Run:

```bash
rg -n "i % 3|minimum required: 4|stick-figure|Use simple gender-neutral" \
  scripts/batch-engine.mjs \
  scripts/human-insight-image.mjs \
  src/templates/human-insight/cinematic-light
```

Expected:
0 active matches.

Run:

```bash
rg -n "CHARACTER_CASTS\\s*=\\s*\\{" \
  scripts/human-insight-image.mjs \
  src/templates/human-insight/cinematic-light
```

Expected:
0 duplicate inline cast object.

---

# PHASE 10 — PROVE VIDEO 001 IS NOT SPECIAL-CASED

Search active reusable code:

```bash
rg -n "phan-1-2026|Video 001|bữa cơm|bua com|1190|1178" \
  scripts/batch-engine.mjs \
  scripts/human-insight-story-planner.mjs \
  scripts/human-insight-image.mjs \
  src/templates/human-insight/cinematic-light
```

Allowed:
- generic keyword rules such as `bữa cơm` in content-mode inference / family intent.

NOT allowed:
- slug Video 001;
- frame 1190/1178;
- hardcoded spec sequence;
- special branch `if index === 1`.

`reauthor-video001-spec.mjs` may remain as historical/smoke reference,
but active batch may not import/call it.

---

# KHÔNG ĐƯỢC LÀM

- Không render 100 videos.
- Không thêm motion preset.
- Không đổi palette.
- Không đổi typography.
- Không đổi TTS.
- Không đổi Cloudflare model.
- Không thêm một LLM runtime planner mới.
- Không dùng Gemini API runtime cho story planning.
- Không viết lại ImageScene.
- Không sửa TÀI NGUYÊN templates.
- Không xóa historical NẾP.
- Không claim production ready.

---

# OUTPUT CUỐI

Trả đúng format:

## A. Audit Before
8 facts Phase 0.

## B. Files Changed

## C. Key Code Changes
show exact snippets:
- planner call
- image generator spawn args
- statement overlay
- validator removed rules

## D. Generalization Table
001 / 005 / 007 / 013 / 028

## E. Example Plan
full plans for 005 and 013.

## F. Verification
exact outputs:
- node check
- planner dry-run
- parser count
- npm test
- tsc
- grep count

## G. Remaining Limitations

Không nói PASS chỉ vì tests xanh.
Mục tiêu vòng này là chứng minh reusable template đã học storytelling grammar.
