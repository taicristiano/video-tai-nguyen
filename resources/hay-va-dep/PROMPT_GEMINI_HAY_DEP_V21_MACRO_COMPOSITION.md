# GEMINI EXECUTION ORDER — HAY & ĐẸP. CINEMATIC LIGHT V2.1
## MACRO COMPOSITION + SHOT LANGUAGE PASS

Bạn là implementation agent. Không tự đổi mục tiêu, không tự mở rộng scope, không “polish theo cảm giác”. Thực hiện đúng thứ tự dưới đây. Nếu code hiện tại khác nhẹ so với mô tả, thích nghi tối thiểu nhưng phải giữ nguyên intent và acceptance criteria.

---

# 0. MỤC TIÊU DUY NHẤT CỦA VÒNG NÀY

V2 hiện tại thay đổi nhiều ở code nhưng output thị giác chỉ khác V1 khoảng 10–15% vì vẫn giữ cùng macro silhouette:

- logo ở trên
- global title cố định quanh top ~360
- một image card ngang ở giữa
- subtitle phía dưới
- lặp lại gần như toàn video

V2.1 phải làm output nhìn khác rõ ngay cả khi tắt audio và chỉ xem contact sheet.

Không tập trung thêm motion preset nhỏ. Không thêm hiệu ứng trang trí. Không thêm AI video generation.

Mục tiêu là chuyển từ:

> “ảnh minh họa nằm trong một card + micro motion”

sang:

> “một chuỗi editorial shots 9:16 có shot scale, crop, composition, visual beat và nhịp dựng thay đổi rõ ràng”.

---

# 1. ĐỌC CODE TRƯỚC KHI SỬA

Bắt buộc đọc tối thiểu các file sau:

- `AGENTS.md`
- `docs/templates/human-insight/cinematic-light.md`
- `resources/hay-va-dep/HAY_DEP_CINEMATIC_LIGHT_V2_CONTRACT.md`
- `resources/hay-va-dep/PROMPT_GEMINI_IMPLEMENT_HAY_DEP_CINEMATIC_LIGHT_V2.md`
- `src/templates/human-insight/cinematic-light/tokens.ts`
- `src/templates/human-insight/cinematic-light/index.ts`
- `src/templates/human-insight/cinematic-light/Layout.tsx`
- `src/templates/human-insight/cinematic-light/ImageScene.tsx`
- `src/templates/human-insight/cinematic-light/OutroCard.tsx`
- `src/VideoContent.tsx`
- `src/components/Subtitles.tsx`
- `scripts/human-insight-image.mjs`
- Video 001 `spec.json` nếu có trong working tree

Trước khi code, ghi ngắn vào report nội bộ 5 nguyên nhân V2 nhìn gần giống V1. Ít nhất phải nhận ra các vấn đề sau:

1. `FRAMING.standard/focus` vẫn khóa visual vào một rectangle gần như cố định.
2. `Layout.tsx` vẫn giữ global title ở `top: 360` gần như xuyên video.
3. `visualContainer = statement` chưa có renderer khác biệt thực sự trong `ImageScene`.
4. `visualBeats` hiện đổi `currentImageSrc`, không render previous beat bên dưới nên không phải true crossfade.
5. `VideoContent.tsx` giữ scene cũ thêm `extraFrames`, trong khi scene mới cũng fade, dễ tạo ghost/crossfade kiểu slide.

Không bắt đầu implement trước khi xác nhận đủ 5 điểm này.

---

# 2. HỌC TỪ REFERENCE VIDEO THEO RULE, KHÔNG THEO CẢM GIÁC

Nếu các reference video mà user đã cung cấp có sẵn trong working context/repo, phải phân tích chúng trước. Không được chỉ xem một vài screenshot rồi nói “đã học style”.

## 2.1. Trích keyframes

Với mỗi reference video, lấy frame theo cả hai cách:

- mỗi 2 giây một frame
- frame ngay trước và sau các visual change lớn

Có thể dùng ffmpeg. Ví dụ:

```bash
ffmpeg -i reference.mp4 \
  -vf "fps=1/2,scale=270:-1,tile=4x4" \
  -frames:v 1 reference-contact-sheet.jpg
```

Nếu cần frame riêng:

```bash
ffmpeg -ss 12.0 -i reference.mp4 -frames:v 1 -q:v 2 ref-12s.jpg
```

## 2.2. Phân tích từng shot bằng taxonomy cố định

Mỗi shot phải được ghi theo các trường:

```text
timestamp
shot duration
shot scale: wide | medium | close | detail
composition: full-bleed | editorial-left | editorial-right | portrait-focus | detail-insert | paper
subject position: left | center | right
text mode: none | overlay | separate-zone
transition: cut | short-dissolve | hold
visual change reason: semantic clause | emotional emphasis | object detail | location change
```

## 2.3. Chỉ rút ra rule lặp lại

Không copy một frame cụ thể. Chỉ lấy pattern xuất hiện lặp lại ở nhiều shot/reference.

Các rule cần tìm:

- bao lâu có một thay đổi visual đáng kể
- tỷ lệ wide / medium / close / detail
- khi nào dùng full-bleed
- khi nào chừa negative space cho text
- khi nào cắt từ người sang object detail
- title có persistent hay không
- transition thường là cut hay dissolve
- text nằm cùng artwork hay bị tách thành “slide title” riêng
- cách tạo nhịp wide → medium → detail → hold

Tạo file:

`resources/hay-va-dep/HAY_DEP_REFERENCE_VISUAL_RULES.md`

File này chỉ chứa nguyên tắc tổng hợp, không sao chép nội dung cụ thể của reference.

Nếu reference video không có trong working context, không được bịa phân tích. Bỏ riêng bước reference extraction nhưng vẫn implement toàn bộ V2.1 contract dưới đây.

---

# 3. V2.1 VISUAL CONTRACT — PHẢI IMPLEMENT ĐÚNG

## 3.1. Macro composition quan trọng hơn micro-motion

Thứ tự ưu tiên mới:

```text
1. composition
2. shot scale / crop
3. semantic visual beat
4. cut / dissolve timing
5. subtitle placement
6. micro-motion
```

Không được tối ưu số 6 trước số 1–5.

## 3.2. Tần suất visual change

Normal narration:

- phổ biến: 1.8–3.5 giây / shot
- emotional hold: 3.5–4.8 giây
- tuyệt đối không để > 5.0 giây không có visual state change đáng kể, trừ question/statement/outro deliberate hold

“Visual state change đáng kể” là một trong:

- đổi image source
- wide → medium/close/detail crop rõ rệt
- đổi composition preset
- đổi subject focus
- object insert

Không tính các thứ sau là visual state change:

- scale tăng 1–2%
- pan 8px
- subtitle đổi chữ
- opacity pulse

## 3.3. Shot sequence

Ưu tiên chuỗi editorial tự nhiên:

```text
wide establishing
→ medium human/action
→ close/detail object/emotion
→ optional calm hold
```

Không dùng 3 shot liên tiếp cùng scale nếu có thể tránh.
Không dùng >2 beat liên tiếp cùng composition.

## 3.4. Target composition mix cho một video 45–70s

Không phải quota tuyệt đối, nhưng Video 001 smoke test phải gần vùng sau:

```text
full-bleed:       25–40%
editorial split:  20–30%
portrait-focus:   15–25%
detail-insert:    15–25%
paper:             0–15%
statement special: chỉ khi thật sự cần
```

Paper không phải default.

---

# 4. THAY SCHEMA — `tokens.ts` VÀ `index.ts`

Mở rộng type theo hướng dưới đây. Có thể đặt tên file khác nếu architecture hiện tại yêu cầu, nhưng public shape phải tương đương.

```ts
export type CompositionPreset =
  | 'full-bleed'
  | 'editorial-left'
  | 'editorial-right'
  | 'portrait-focus'
  | 'detail-insert'
  | 'paper';

export type ShotScale = 'wide' | 'medium' | 'close' | 'detail';

export type BeatTransition = 'cut' | 'dissolve';

export type CaptionPlacement =
  | 'below-visual'
  | 'overlay-bottom'
  | 'overlay-top'
  | 'hidden';

export interface FocalPoint {
  /** percentage 0..100 */
  x: number;
  /** percentage 0..100 */
  y: number;
}

export interface VisualBeat {
  startFrame: number;
  endFrame: number;
  imageSrc: string;

  composition?: CompositionPreset;
  shotScale?: ShotScale;
  focalPoint?: FocalPoint;
  transition?: BeatTransition;
  captionPlacement?: CaptionPlacement;

  motionPreset?: MotionPreset;
}
```

Mở rộng scene:

```ts
export type TitleMode = 'intro-only' | 'scene' | 'hidden';

export interface HumanInsightScene {
  // existing fields...
  composition?: CompositionPreset;
  shotScale?: ShotScale;
  focalPoint?: FocalPoint;
  titleMode?: TitleMode;
  captionPlacement?: CaptionPlacement;
}
```

Backward compatibility:

- spec cũ không có field mới vẫn render được
- nhưng default V2.1 KHÔNG được quay về fixed-card look

Default mới:

```ts
composition = 'portrait-focus'
shotScale = 'medium'
titleMode = sceneIndex === 0 ? 'intro-only' : 'hidden'
captionPlacement = 'below-visual'
```

---

# 5. BỎ GLOBAL TITLE PERSISTENT — SỬA `Layout.tsx`

Đây là P0.

Hiện `Layout.tsx` render title fixed ở khoảng `top: 360` gần như cả video. Điều này làm mọi shot có cùng silhouette.

## 5.1. Rule mới

Global video title chỉ có vai trò hook/intro.

Default:

```text
0.0–0.4s: title fade in
0.4–3.0s: hold
3.0–3.7s: fade out
sau ~3.7s: không còn global title
```

Scene đặc biệt có thể dùng text riêng qua statement/section card, nhưng không resurrect global title liên tục.

## 5.2. Code hướng dẫn

Thay logic persistent title bằng logic tương tự:

```ts
const introTitleOpacity = interpolate(
  frame,
  [0, 12, 90, 112],
  [0, 1, 1, 0],
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  },
);

const sceneAllowsGlobalTitle =
  currentScene?.titleMode === 'scene' || frame < 112;

const finalTitleOpacity = sceneAllowsGlobalTitle
  ? introTitleOpacity
  : 0;
```

Nếu `titleMode === 'scene'`, chỉ dùng cho trường hợp đặc biệt; không default.

Không giữ `HEADLINE_OPACITY.normal = 0.86` xuyên video nữa.

Logo H&Đ. vẫn có thể persistent nhẹ, nhưng không được tạo thành một header block lớn bắt visual phải nằm dưới nó.

---

# 6. THAY `ImageScene` TỪ “ONE RECTANGLE” THÀNH COMPOSITION RENDERER

Không tiếp tục vá `FRAMING.standard/focus`.

Tạo abstraction mới, ví dụ:

`src/templates/human-insight/cinematic-light/CompositionFrame.tsx`

hoặc refactor trực tiếp `ImageScene.tsx` nếu code gọn.

## 6.1. Geometry bắt buộc

Dùng layout gần như sau cho 1080×1920.

```ts
export const COMPOSITIONS = {
  'full-bleed': {
    top: 0,
    left: 0,
    width: 1080,
    height: 1920,
    radius: 0,
  },
  'editorial-left': {
    top: 300,
    left: 0,
    width: 790,
    height: 1120,
    radius: 32,
  },
  'editorial-right': {
    top: 300,
    left: 290,
    width: 790,
    height: 1120,
    radius: 32,
  },
  'portrait-focus': {
    top: 300,
    left: 90,
    width: 900,
    height: 1080,
    radius: 36,
  },
  'detail-insert': {
    top: 440,
    left: 0,
    width: 1080,
    height: 820,
    radius: 0,
  },
  paper: {
    top: 380,
    left: 90,
    width: 900,
    height: 960,
    radius: 28,
  },
} as const;
```

Có thể tinh chỉnh 5–10% sau khi screenshot, nhưng không được quay về mọi preset đều là rectangle ~1020×638 ở cùng vị trí.

## 6.2. Focal point

Ảnh phải support `focalPoint`:

```ts
const objectPosition = focalPoint
  ? `${focalPoint.x}% ${focalPoint.y}%`
  : '50% 50%';
```

Điều này quan trọng hơn pan 4–8px.

## 6.3. Shot scale

Scale baseline theo shot:

```ts
const SHOT_SCALE: Record<ShotScale, number> = {
  wide: 1.00,
  medium: 1.08,
  close: 1.18,
  detail: 1.32,
};
```

Sau đó micro-motion chỉ cộng thêm khoảng 0.00–0.025.

Không dùng `cropVariant` cũ làm cơ chế chính nữa. Có thể map legacy `cropVariant` sang `shotScale` để backward-compatible.

---

# 7. FULL-BLEED PHẢI THẬT SỰ FULL-BLEED

Khi composition = `full-bleed`:

- ảnh cover toàn 1080×1920
- không border
- không rounded rectangle
- không shadow card
- không paper frame
- không vignette trắng mạnh làm mất contrast
- thêm overlay gradient rất nhẹ chỉ để subtitle/logo đọc được

Ví dụ:

```tsx
<div
  style={{
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  }}
>
  <Img
    src={staticFile(src)}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      transform,
    }}
  />

  <div
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(to bottom, rgba(246,241,232,0.12) 0%, rgba(246,241,232,0.02) 48%, rgba(246,241,232,0.72) 100%)',
    }}
  />
</div>
```

Full-bleed phải tạo silhouette khác ngay trong contact sheet.

---

# 8. TRUE VISUAL BEATS — SỬA CROSSFADE

Code hiện tại KHÔNG phải true crossfade vì chỉ render `currentImageSrc`.

Bắt buộc render previous beat và active beat đồng thời trong transition window.

Pseudo-code phải tương đương logic này:

```tsx
const activeIndex = beats.findIndex(
  (b) => frame >= b.localStart && frame < b.localEnd,
);

const active = beats[Math.max(0, activeIndex)];
const previous = activeIndex > 0 ? beats[activeIndex - 1] : null;

const local = frame - active.localStart;
const dissolveFrames = active.transition === 'cut' ? 0 : 6;

const mix = dissolveFrames === 0
  ? 1
  : interpolate(local, [0, dissolveFrames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

return (
  <>
    {previous && mix < 1 ? (
      <BeatLayer
        beat={previous}
        opacity={1 - mix}
        localFrame={previous.localEnd - previous.localStart - 1}
      />
    ) : null}

    <BeatLayer
      beat={active}
      opacity={mix}
      localFrame={Math.max(0, local)}
    />
  </>
);
```

`BeatLayer` phải nhận composition/shotScale/focalPoint riêng của từng beat.

Điều này cho phép:

```text
wide family table
→ medium faces
→ detail hands/phone/empty chair
```

trong cùng một narration scene.

---

# 9. BỎ GHOST GIỮA SCENE — SỬA `VideoContent.tsx`

Trong V2.1 normal narrative scene không được giữ scene cũ thêm 10–12 frames chỉ để “transition”.

Thay:

```ts
const extraFrames = ... ? 0 : 10;
```

bằng default:

```ts
const extraFrames = 0;
```

Normal narrative scene boundary ưu tiên hard cut.

Nếu cần dissolve, implement có chủ đích bằng transition layer / TransitionSeries sau, không tạo overlap ngầm giữa hai full scene.

Không được vừa giữ outgoing scene vừa fade incoming scene theo hai cơ chế độc lập.

Question/statement/outro có thể fade riêng.

---

# 10. MICRO-MOTION GIỮ LẠI NHƯNG HẠ VAI TRÒ

Không xóa motion preset V2.

Nhưng đổi triết lý:

- shot change tạo động chính
- micro-motion chỉ tạo “sống” trong shot

Target:

```text
scale delta: 0.008–0.025
pan: 4–18px tùy composition
translateY: 2–10px
```

Không cần thêm preset mới.

`emotional-hold` có thể gần như tĩnh.

Full-bleed/portrait có thể push rõ hơn framed paper.

---

# 11. SUBTITLE PHẢI THÍCH NGHI VỚI COMPOSITION

Hiện `Subtitles.tsx` khóa `bottom: 22%` cho mọi scene.

V2.1 cần support placement ít nhất:

```text
below-visual
overlay-bottom
overlay-top
hidden
```

Không cần rewrite subtitle timing.

Có thể thêm prop:

```ts
placement?: CaptionPlacement;
```

Geometry gợi ý:

```ts
const placementStyle = {
  'below-visual': { bottom: '14%' },
  'overlay-bottom': { bottom: '10%' },
  'overlay-top': { top: '18%', bottom: 'auto' },
};
```

Khi overlay trên ảnh, thêm background/gradient sau subtitle ở mức rất nhẹ, không dùng dark pill nặng.

Không để subtitle và visual như hai vùng không liên quan.

---

# 12. PAPER CONTAINER PHẢI THỰC SỰ HIẾM

Current V2 paper/washi tape nhìn giống decoration thay vì shot language.

V2.1:

- paper tối đa 15% normal visual duration
- không quá 1 paper beat trong 5 beats liên tiếp
- chỉ dùng khi semantic liên quan diary, letter, memory, photo, book, keepsake hoặc editorial pause
- không dùng chỉ để tạo variation giả

`statement` không còn là một `VisualContainer` giả. Statement là scene/card type riêng hoặc composition riêng có renderer thật.

---

# 13. VIDEO 001 — BẮT BUỘC RE-AUTHOR SPEC, KHÔNG CHỈ ĐỔI ENGINE

Sau khi engine support V2.1, mở Video 001 `spec.json` và re-author shot plan.

Không được chỉ dựa vào default cycle.

Mỗi scene phải đọc `audioSegment.text` và chọn:

- composition
- shotScale
- focalPoint nếu cần
- visualBeats nếu scene > ~4.5s hoặc có >=2 semantic clauses
- captionPlacement
- titleMode

Rule bắt buộc cho Video 001:

```text
- có ít nhất 4 composition preset khác nhau
- có ít nhất 1 full-bleed trong 8 giây đầu
- global title biến mất sau hook
- có ít nhất 3 detail/object inserts trong toàn video
- không có >2 beats liên tiếp cùng composition
- không có >5.0s không visual change, trừ question/outro
- paper <=15% total normal visual duration
- question card giữ nhịp riêng
- outro 2s giữ nguyên concept “đóng quyển sách”
```

Với chủ đề bữa cơm gia đình, ưu tiên visual grammar kiểu:

```text
wide: toàn cảnh bàn ăn / căn bếp
medium: người thân ngồi gần nhau / hành động gắp thức ăn
close: nét mặt / bàn tay / bát cơm
object insert: điện thoại đặt sang bên / chiếc ghế / đôi đũa / món ăn đơn giản
wide return: cả bàn ăn như một memory frame
```

Đây là grammar, không phải bắt buộc đúng object nếu narration không phù hợp.

---

# 14. IMAGE GENERATION PHẢI SINH ẢNH PHÙ HỢP SHOT

`human-insight-image.mjs` hiện đã có STYLE LOCK + CAST LOCK. V2.1 phải bổ sung shot/composition semantics vào prompt khi generate.

Ví dụ prompt layer:

```text
SHOT:
Vertical 9:16 editorial composition.
Medium shot.
Subject placed in the left third.
Meaningful negative space on the right.
Natural candid domestic moment.
No posed camera-facing look.

SCENE:
...
```

Hoặc detail:

```text
SHOT:
Vertical 9:16 close detail insert.
Focus on hands, bowl and table texture.
Shallow depth and warm natural daylight.
Human faces may be partially outside frame.
```

Không generate mọi ảnh như một “centered family illustration”.

Nếu dùng curated image, `focalPoint` và crop phải cứu composition khi asset phù hợp semantic nhưng framing chưa đúng.

---

# 15. ADD A VALIDATOR — KHÔNG CHO SPEC TRỞ LẠI SLIDESHOW

Tạo helper validator, ví dụ:

`src/templates/human-insight/cinematic-light/validateVisualRhythm.ts`

Hoặc script tương đương.

Validator cho V2.1 Video 001 phải báo warning/error cho:

```text
A. > 5.0s không visual state change
B. > 2 beats liên tiếp cùng composition
C. video dùng < 4 composition types
D. paper > 20% normal visual duration
E. global title persistent sau hook do default config
F. scene > 5.5s nhưng chỉ 1 beat và không được đánh dấu emotional hold
```

Pseudo-code:

```ts
export function validateVisualRhythm(spec: HumanInsightSpec) {
  const warnings: string[] = [];
  const allBeats = flattenBeats(spec);

  for (let i = 0; i < allBeats.length; i++) {
    const beat = allBeats[i];
    const duration = beat.endFrame - beat.startFrame;

    if (duration > 150 && !beat.emotionalHold) {
      warnings.push(`Beat ${i} exceeds 5s without deliberate hold`);
    }

    if (
      i >= 2 &&
      allBeats[i - 1].composition === beat.composition &&
      allBeats[i - 2].composition === beat.composition
    ) {
      warnings.push(`Composition repeated 3 times at beat ${i}`);
    }
  }

  const uniqueCompositions = new Set(allBeats.map((b) => b.composition));
  if (uniqueCompositions.size < 4) {
    warnings.push('Need at least 4 composition types');
  }

  return warnings;
}
```

Không cần over-engineer scoring. Mục tiêu là chặn regression.

---

# 16. TESTS BẮT BUỘC

Thêm unit tests tối thiểu cho:

1. legacy spec không có field mới vẫn render/parse được
2. composition geometry resolve đúng
3. `full-bleed` = 1080×1920, radius 0
4. visual beat active index resolve đúng ở boundary
5. dissolve render previous + active beat trong transition window
6. cut không tạo overlap
7. validator bắt 3 identical compositions liên tiếp
8. validator bắt beat >5s không deliberate hold

Sau đó chạy:

```bash
npm test
npx tsc --noEmit
node scripts/parse-hay-dep-videos.mjs
node scripts/test-step1-3.mjs
```

Tất cả phải pass trước render.

---

# 17. RENDER + QA — KHÔNG CHỈ CHỤP 6 FRAME

Render Video 001.

Sau render, tạo:

```text
screenshots-v21/
  00s.jpg
  03s.jpg
  06s.jpg
  09s.jpg
  12s.jpg
  15s.jpg
  18s.jpg
  ... mỗi 3s ...
  question.jpg
  outro.jpg
  contact-sheet.jpg
```

Mục đích: nhìn contact sheet phải thấy variation ngay mà không cần play video.

Tạo thêm một contact sheet V2 cũ nếu file render cũ còn tồn tại để side-by-side.

---

# 18. ACCEPTANCE CRITERIA — FAIL MỘT MỤC THÌ CHƯA XONG

V2.1 chỉ được báo “hoàn thành” khi đáp ứng tất cả:

```text
[ ] Global title không persistent xuyên video.
[ ] Ít nhất 4 composition silhouettes thực sự khác nhau.
[ ] Full-bleed chiếm ít nhất 1 shot rõ ràng và không còn card border.
[ ] Normal visual không còn bị khóa trong FRAMING rectangle duy nhất.
[ ] Không có >5s visual đứng yên ở normal narration.
[ ] Visual beat transition là true cut/dissolve, không fade từ background.
[ ] Không còn scene ghost do extraFrames overlap mặc định.
[ ] Paper <=20%, target <=15%.
[ ] Shot scale có wide/medium/close hoặc detail trong cùng video.
[ ] Subtitle placement thích nghi với composition.
[ ] Contact sheet nhìn khác rõ V2 cũ ngay cả khi không đọc text.
[ ] Tests + TypeScript + parser pass.
[ ] Video 001 render thành công.
```

Nếu contact sheet vẫn có pattern:

```text
logo
title
same rectangle
subtitle
```

lặp lại gần như mọi frame, coi như FAIL dù test code pass.

---

# 19. KHÔNG ĐƯỢC LÀM

- Không thêm motion preset thứ 10, 11, 12 để né macro redesign.
- Không chỉ tăng scale/pan vài pixel rồi gọi là V2.1.
- Không chỉ đổi màu/font/shadow.
- Không cho mọi scene thành full-bleed; cần rhythm và variation.
- Không dùng random runtime.
- Không rewrite TTS/STT.
- Không đổi template ID `human-insight/cinematic-light`.
- Không phá TÀI NGUYÊN hoặc template khác.
- Không xóa fallback/backward compatibility.
- Không làm video flashy, spin, zoom mạnh, glitch.
- Không biến HAY & ĐẸP. thành TikTok meme style.
- Không dùng paper/tape như decoration mặc định.
- Không báo xong chỉ vì npm test pass.

---

# 20. THỨ TỰ THỰC HIỆN — KHÔNG ĐẢO

1. Read code + confirm 5 root causes.
2. Analyze available reference videos and write `HAY_DEP_REFERENCE_VISUAL_RULES.md`.
3. Add V2.1 schema/types.
4. Remove persistent global title behavior.
5. Implement composition renderer.
6. Implement shotScale + focalPoint.
7. Implement true visual beat cut/dissolve.
8. Remove default scene overlap ghost.
9. Add adaptive subtitle placement.
10. Update image-generation prompt with shot semantics.
11. Add validator + tests.
12. Re-author Video 001 spec manually/semantically.
13. Run tests.
14. Render Video 001.
15. Create 3-second contact sheet.
16. Compare V2 vs V2.1 against acceptance criteria.
17. Only then report completion.

---

# 21. FORMAT BÁO CÁO CUỐI CÙNG

Không gửi một báo cáo dài kiểu “đã sửa 10 file” nếu output chưa chứng minh khác biệt.

Báo cáo cuối chỉ cần các phần sau:

```text
A. Root causes confirmed
B. Files changed
C. Macro compositions implemented
D. Video 001 shot plan summary
E. Visual rhythm metrics
   - number of beats
   - max normal shot duration
   - composition distribution
   - shot-scale distribution
   - paper ratio
F. Tests
G. Render path
H. Contact-sheet path
I. 3 điểm khác rõ nhất so với V2 cũ
J. Remaining known issues, nếu có
```

Không tự tuyên bố “cinematic hơn” nếu không chỉ ra được contact sheet và metrics chứng minh.

---

# 22. TINH THẦN THỰC THI

Đây không phải vòng brainstorm.

Không đề xuất 5 option cho user.
Không hỏi user chọn composition.
Không tự đổi brand direction.
Không dành thời gian polish nhỏ trước macro architecture.

Bạn là implementation agent. Orchestrator đã quyết định architecture và acceptance criteria ở trên. Hãy thực hiện đúng contract này, render thật, kiểm tra thật, và chỉ báo xong khi output vượt qua acceptance criteria.
