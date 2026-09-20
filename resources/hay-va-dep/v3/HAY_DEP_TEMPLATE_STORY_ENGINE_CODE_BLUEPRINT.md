# HAY & ĐẸP. — TEMPLATE STORY ENGINE IMPLEMENTATION BLUEPRINT

Dựa trên review trực tiếp ZIP hiện tại.

## A. Các lỗi kiến trúc quan trọng đang có trong code hiện tại

### 1. `batch-engine.mjs` vẫn đang round-robin layout

Code hiện tại:

```js
} else if (i % 3 === 2) {
  layout = 'focus';
  headerMode = 'dimmed';
  captionMode = 'plain';
} else {
  layout = 'standard';
  headerMode = 'dimmed';
  captionMode = 'phrase';
}
```

Đây chính là behavior cần bỏ.

Layout/composition phải derive từ story role, không từ `i % 3`.

---

### 2. `batch-engine.mjs` KHÔNG truyền cast/slug/scene-index vào image generator

Hiện batch gọi:

```js
[
  'scripts/human-insight-image.mjs',
  '--text', seg.text,
  '--type', sceneType,
  '--mood', mood,
  '--visual', matchedPrio,
  '--exclude', ...,
  '--generate',
]
```

Trong khi `human-insight-image.mjs` đã support:
- `--cast`
- `--slug`
- `--scene-index`

=> Seed strategy + cast continuity đang tồn tại trong code nhưng active batch KHÔNG dùng.

Đây là blocker generalization rất lớn.

---

### 3. `human-insight-image.mjs` vẫn có fallback stick figure

Code hiện tại:

```js
else {
  castPrompt =
    'CAST:\nUse simple gender-neutral stick-figure characters when people are needed...';
}
```

Điều này trái hoàn toàn V3 visual direction.

Phải bỏ.

Fallback phải là:
- natural editorial Vietnamese people if people are needed;
- no recurring identity unless planner requests cast.

---

### 4. Character source bị duplicate

Có cả:
- `src/templates/human-insight/cinematic-light/characters.ts`
- `scripts/human-insight-image.mjs` với `CHARACTER_CASTS` copy riêng

=> dễ drift.

Phải đưa về một source JSON chung.

Đề xuất:
`src/templates/human-insight/cinematic-light/character-casts.json`

TS và Node script đều đọc file này.

---

### 5. `validateVisualRhythm.ts` đang ép variety sai hướng

Hiện validator cảnh báo:
- 3 composition giống nhau liên tiếp;
- video dùng < 4 composition types.

Hai rule này có thể khiến planner cố tình:
`portrait → left → right → detail`
chỉ để pass test.

Phải xóa 2 tiêu chí này.

Template mới chỉ validate:
- shot quá dài;
- paper quá nhiều;
- detail action không dùng detail shot;
- generic filler;
- repeated semantic intent;
- long scene không có beat variation.

---

### 6. Statement mặc định vẫn biến thành full card

`batch-engine.mjs` hiện:

```js
if (isStatement) {
  layout = 'statement';
  headerMode = 'logo-only';
  captionMode = 'statement';
}
```

và:

```js
sceneObj.insightText = formatStatement(...)
```

`VideoContent.tsx` thấy `insightText` là render `InsightCard`, hiện là white card.

=> story continuity bị cắt.

Default mới:
- statement overlay;
- full card chỉ opt-in.

---

### 7. Question scene reusable pipeline chưa được author đúng

Scene cuối là `type: ending`, nhưng general batch không đảm bảo:
- question artwork cùng universe;
- question overlay;
- question text hiển thị đúng.

Phải explicit:
`insightVariant: 'overlay'`.

---

### 8. `smart-asset-matcher.mjs` không phải matcher active của batch

`batch-engine.mjs` import:

```js
import { selectExistingAsset, readManifest } from './human-insight-image.mjs';
```

Không dùng `smart-asset-matcher.mjs`.

Vì vậy:
- đừng sửa matcher không active rồi nghĩ pipeline đã đổi;
- mọi scoring reusable phải đi vào `human-insight-image.mjs` hoặc batch phải đổi import rõ ràng.

---

# B. FILE MỚI 1 — Story Planner

Copy file đính kèm:

`human-insight-story-planner.mjs`

vào:

```text
scripts/human-insight-story-planner.mjs
```

File này đã có:
- content mode inference;
- recurring cast inference;
- world/location continuity;
- semantic clause splitting;
- story role inference;
- action-first visual intent;
- composition theo story role;
- motion preset theo story role;
- no-filler validation.

Không được rewrite thành version đơn giản hơn.

---

# C. FILE MỚI 2 — Character Source of Truth

Copy file đính kèm:

`character-casts.json`

vào:

```text
src/templates/human-insight/cinematic-light/character-casts.json
```

Sau đó sửa `characters.ts`:

```ts
import castData from './character-casts.json';

export interface CharacterCast {
  id: string;
  name: string;
  descriptionVi: string;
  members: Record<string, string>;
  continuity: string;
  castLockPrompt: string;
}

export const CHARACTER_CASTS =
  castData as Record<string, CharacterCast>;

export function inferCastId(
  text: string,
  category?: string,
): string | undefined {
  const lower = `${text} ${category ?? ''}`.toLowerCase();

  if (
    lower.includes('bữa cơm') ||
    lower.includes('gia đình') ||
    lower.includes('con cái') ||
    lower.includes('bố mẹ') ||
    lower.includes('nhà mình')
  ) {
    return 'family-young-01';
  }

  if (
    lower.includes('ông bà') ||
    lower.includes('tuổi già')
  ) {
    return 'elderly-couple-01';
  }

  if (
    lower.includes('vợ chồng') ||
    lower.includes('người yêu') ||
    lower.includes('hôn nhân')
  ) {
    return 'couple-young-01';
  }

  if (
    lower.includes('cô gái') ||
    lower.includes('phụ nữ')
  ) {
    return 'solo-female-01';
  }

  if (
    lower.includes('chàng trai') ||
    lower.includes('người trẻ')
  ) {
    return 'solo-male-01';
  }

  return undefined;
}
```

---

# D. PATCH `human-insight-image.mjs`

## D1. Xóa `CHARACTER_CASTS` duplicate

Thêm gần top:

```js
const CASTS_PATH = path.join(
  ROOT,
  'src/templates/human-insight/cinematic-light/character-casts.json',
);

export const CHARACTER_CASTS = JSON.parse(
  fs.readFileSync(CASTS_PATH, 'utf-8'),
);
```

Xóa toàn bộ object `export const CHARACTER_CASTS = {...}` hiện tại.

---

## D2. Thêm CLI args

Trong default args:

```js
storyRole: '',
action: '',
worldId: '',
worldLock: '',
```

Trong parser:

```js
} else if (arg === '--story-role') {
  args.storyRole = argv[++i];
} else if (arg === '--action') {
  args.action = argv[++i];
} else if (arg === '--world-id') {
  args.worldId = argv[++i];
} else if (arg === '--world-lock') {
  args.worldLock = argv[++i];
```

Trong `scene`:

```js
const scene = {
  text: args.text,
  type: args.type,
  mood: args.mood,
  character,
  castId,
  visual: args.visual,
  storyRole: args.storyRole || undefined,
  action: args.action || undefined,
  worldId: args.worldId || undefined,
  worldLock: args.worldLock || undefined,
  shotScale: args.shotScale || undefined,
  composition: args.composition || undefined,
};
```

---

## D3. Bỏ stick-figure fallback

Thay `buildPrompt()` cast fallback bằng:

```js
function buildCastPrompt(scene, castId) {
  if (castId && CHARACTER_CASTS[castId]) {
    return CHARACTER_CASTS[castId].castLockPrompt;
  }

  if (scene.character === 'male') {
    return [
      'CAST:',
      'Use one natural Vietnamese male-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\n');
  }

  if (scene.character === 'female') {
    return [
      'CAST:',
      'Use one natural Vietnamese female-presenting editorial character if a person is needed.',
      'Keep age, hairstyle, wardrobe and facial design internally coherent within this scene.',
      'Do not use stick figures.',
    ].join('\n');
  }

  return [
    'CAST:',
    'Use natural Vietnamese editorial human characters only when the scene needs people.',
    'Do not use stick figures, diagram people, icon people, mannequins, or infographic characters.',
    'Do not add random extra people.',
  ].join('\n');
}
```

---

## D4. Thêm negative rules theo story role

```js
function buildNegativeRules(scene) {
  const rules = [
    'NO TEXT, NO LABELS, NO LOGO, NO WATERMARK.',
    'No posed camera-facing family portrait unless explicitly requested.',
    'No random extra people.',
    'No duplicated children.',
    'No sudden glasses change.',
    'No sudden age change.',
    'No luxury showroom look.',
  ];

  if (scene.storyRole === 'detail-action') {
    rules.push(
      'The object must be actively used by a hand/person whenever possible; avoid product photography.',
    );
  }

  if (scene.storyRole === 'interaction') {
    rules.push(
      'Show visible action and reaction between people; avoid isolated portrait faces.',
    );
  }

  if (scene.storyRole === 'memory') {
    rules.push(
      'Do not invent a different family or different recurring faces.',
    );
  }

  return rules.join('\n');
}
```

---

## D5. Replace `buildPrompt()`

```js
function buildPrompt(scene, castId) {
  const castPrompt = buildCastPrompt(scene, castId);
  const shotPrompt = buildShotPrompt(scene);

  const worldPrompt = scene.worldLock
    ? scene.worldLock
    : [
        'WORLD:',
        'Warm believable Vietnamese everyday-life environment.',
        'Ivory / warm cream, muted sage, warm wood, charcoal details.',
      ].join('\n');

  const rolePrompt = scene.storyRole
    ? `STORY ROLE:\n${scene.storyRole}`
    : '';

  const actionPrompt = scene.action
    ? `SPECIFIC ACTION:\n${scene.action}`
    : '';

  const visual = scene.visual ||
    `Show one concrete everyday action that directly communicates: "${scene.text}"`;

  return [
    STYLE_PROMPT,
    castPrompt,
    worldPrompt,
    rolePrompt,
    actionPrompt,
    shotPrompt,
    `SCENE:\n${visual}`,
    buildNegativeRules(scene),
  ].filter(Boolean).join('\n\n');
}
```

---

## D6. Generated asset metadata

Trong `appendGeneratedAsset()` thêm:

```js
storyRole: scene.storyRole || undefined,
worldId: scene.worldId || undefined,
continuityGroup: scene.continuityGroup || undefined,
```

---

## D7. Scoring continuity

Trong `scoreAsset()` sau tier score:

```js
if (scene.castId && asset.castId) {
  if (scene.castId === asset.castId) {
    score += 20;
    reasons.push(`cast:${scene.castId}`);
  } else {
    score -= 40;
    reasons.push(`cast-mismatch:${asset.castId}`);
  }
}

if (scene.worldId && asset.worldId) {
  if (scene.worldId === asset.worldId) {
    score += 8;
    reasons.push(`world:${scene.worldId}`);
  } else {
    score -= 8;
    reasons.push(`world-mismatch:${asset.worldId}`);
  }
}

if (scene.storyRole && asset.storyRole === scene.storyRole) {
  score += 6;
  reasons.push(`story-role:${scene.storyRole}`);
}
```

Important:
cast mismatch phải nặng hơn generic keyword match.

---

# E. PATCH `batch-engine.mjs`

## E1. Imports

Thêm:

```js
import {
  buildStoryPlan,
} from './human-insight-story-planner.mjs';
```

---

## E2. Destructure metadata

Thay:

```js
const {
  index,
  part,
  title,
  cleanContext,
  voiceScriptText,
  statementText,
  visualPriorities,
} = videoData;
```

bằng:

```js
const {
  index,
  part,
  title,
  series,
  category,
  cleanContext,
  voiceScriptText,
  statementText,
  visualPriorities,
} = videoData;
```

---

## E3. Sau khi load `timeline.segments`

Thêm ngay:

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

if (!storyResult.validation.valid) {
  throw new Error(
    `Story plan invalid:\n${storyResult.validation.errors.join('\n')}`,
  );
}

const storyPlan = storyResult.plan;

fs.writeFileSync(
  path.join(videosDir, 'story-plan.json'),
  JSON.stringify(storyPlan, null, 2),
  'utf-8',
);

fs.writeFileSync(
  path.join(videosDir, 'story-plan-validation.json'),
  JSON.stringify(storyResult.validation, null, 2),
  'utf-8',
);

console.log(
  `🧠 Story mode=${storyPlan.contentMode}, ` +
  `cast=${storyPlan.castId || 'none'}, ` +
  `world=${storyPlan.worldId}, ` +
  `beats=${storyPlan.beats.length}`,
);
```

---

## E4. Xóa round-robin layout

XÓA hoàn toàn:

```js
} else if (i % 3 === 2) {
  ...
}
```

Không còn bất kỳ `% 3` nào quyết định layout.

---

## E5. Resolve story beats cho mỗi transcript segment

Trong scene loop:

```js
const plannedBeats = storyPlan.beats.filter(
  (beat) => beat.segmentIndex === i,
);

const primaryBeat =
  plannedBeats[0] ?? {
    storyRole: isHook ? 'establish' : isEnding ? 'question' : 'context',
    visualIntent: matchedPrio || seg.text,
    shotScale: isHook ? 'wide' : 'medium',
    composition: 'portrait-focus',
    motionPreset: isEnding ? 'emotional-hold' : 'still-breathe',
    visualContainer: 'canvas',
    castId: storyPlan.castId,
    worldId: storyPlan.worldId,
    worldLock: storyPlan.worldLock,
  };
```

---

## E6. Helper generate/select asset cho beat

Thêm helper phía trên `processVideo()`:

```js
function resolveBeatAsset({
  beat,
  slug,
  sceneIndex,
  beatIndex,
  sceneType,
  mood,
  excludeSet,
}) {
  const manifest = readManifest();

  const sceneForMatch = {
    text: beat.voiceClause,
    type: sceneType,
    mood,
    visual: beat.visualIntent,
    castId: beat.castId,
    worldId: beat.worldId,
    storyRole: beat.storyRole,
    character: 'neutral',
  };

  const best = selectExistingAsset(
    manifest,
    sceneForMatch,
    excludeSet,
  );

  const continuityUnsafe =
    best?.asset?.castId &&
    beat.castId &&
    best.asset.castId !== beat.castId;

  const shouldGenerate =
    !best ||
    best.score < 14 ||
    continuityUnsafe ||
    best.asset.tier === 'LEGACY_NEP';

  if (!shouldGenerate) {
    return {
      asset: best.asset,
      source: 'manifest',
      score: best.score,
    };
  }

  const args = [
    'scripts/human-insight-image.mjs',
    '--text', beat.voiceClause,
    '--type', sceneType,
    '--mood', mood,
    '--visual', beat.visualIntent,
    '--story-role', beat.storyRole,
    '--action', beat.visualAction || beat.visualIntent,
    '--world-id', beat.worldId || '',
    '--world-lock', beat.worldLock || '',
    '--slug', slug,
    '--scene-index', String(sceneIndex * 10 + beatIndex),
    '--shot-scale', beat.shotScale,
    '--composition', beat.composition,
    '--exclude', Array.from(excludeSet).join(','),
    '--generate',
  ];

  if (beat.castId) {
    args.push('--cast', beat.castId);
  }

  const result = spawnSync(
    'node',
    args,
    { cwd: ROOT, encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    throw new Error(
      `Image generation failed for ${beat.id}: ${result.stderr}`,
    );
  }

  const parsed = JSON.parse(result.stdout);

  return {
    asset: {
      id: parsed.image.assetId,
      path: parsed.image.path,
    },
    source: parsed.source,
    score: parsed.score ?? parsed.previousBest?.score ?? 0,
  };
}
```

---

## E7. Build `visualBeats`

Thay một-asset-per-scene bằng:

```js
const sourceSegStart = Math.round(seg.start * 30);
const sourceSegEnd = Math.max(
  sourceSegStart + 1,
  Math.round(seg.end * 30),
);
const sourceSegDuration = sourceSegEnd - sourceSegStart;

const resolvedVisualBeats = [];
let primaryAsset = null;

for (let beatIndex = 0; beatIndex < plannedBeats.length; beatIndex++) {
  const beat = plannedBeats[beatIndex];

  const startRatio =
    (beat.startFrame - sourceSegStart) / sourceSegDuration;

  const endRatio =
    (beat.endFrame - sourceSegStart) / sourceSegDuration;

  const localStart = Math.max(
    0,
    Math.round(startRatio * durFrames),
  );

  const localEnd = Math.min(
    durFrames,
    Math.max(localStart + 1, Math.round(endRatio * durFrames)),
  );

  const excludeSet = new Set(usedAssetIds);
  if (lastAssetId) excludeSet.add(lastAssetId);

  const resolved = resolveBeatAsset({
    beat,
    slug,
    sceneIndex: i,
    beatIndex,
    sceneType,
    mood,
    excludeSet,
  });

  usedAssetIds.add(resolved.asset.id);
  lastAssetId = resolved.asset.id;

  if (!primaryAsset) primaryAsset = resolved.asset;

  resolvedVisualBeats.push({
    startFrame: localStart,
    endFrame: localEnd,
    imageSrc: resolved.asset.path,
    composition: beat.composition,
    shotScale: beat.shotScale,
    motionPreset: beat.motionPreset,
    transition: 'cut',
  });
}
```

Sau đó:

```js
const fallbackAsset =
  primaryAsset ?? {
    id: lastAssetId || 'gratitude-simple-life-01',
    path: 'assets/human-insight/images/gratitude-simple-life-01.png',
  };
```

Scene:

```js
const sceneObj = {
  type: isHook ? 'hook' : isEnding ? 'ending' : 'body',
  layout: 'standard',
  headerMode: isHook ? 'full' : 'dimmed',
  captionMode: isEnding ? 'statement' : 'phrase',

  storyRole: primaryBeat.storyRole,
  narrativePurpose: primaryBeat.narrativePurpose,
  visualIntent: primaryBeat.visualIntent,
  castId: primaryBeat.castId,
  worldId: primaryBeat.worldId,
  continuityGroup: primaryBeat.continuityGroup,

  composition: primaryBeat.composition,
  shotScale: primaryBeat.shotScale,
  visualContainer: primaryBeat.visualContainer,
  motionPreset: primaryBeat.motionPreset,

  startFrame: currentFrame,
  durationFrames: durFrames,

  audioSegment: {
    start: seg.start,
    end: seg.end,
    text: seg.text || '',
  },

  image: {
    assetId: fallbackAsset.id,
    path: fallbackAsset.path,
  },

  visualBeats:
    resolvedVisualBeats.length > 1
      ? resolvedVisualBeats
      : undefined,
};
```

---

## E8. Statement / Question behavior

Không còn:

```js
layout = 'statement';
```

Default:

```js
if (isStatement) {
  sceneObj.insightText =
    formatStatement(statementText || seg.text);
  sceneObj.insightVariant = 'overlay';
}

if (isEnding) {
  sceneObj.insightText = seg.text;
  sceneObj.insightVariant = 'overlay';
  sceneObj.captionPlacement = 'hidden';
  sceneObj.motionPreset = 'emotional-hold';
}
```

Full card chỉ khi explicit config sau này.

---

# F. PATCH SPEC TYPES

Trong `HumanInsightScene` thêm optional metadata:

```ts
export type StoryRole =
  | 'establish'
  | 'action'
  | 'interaction'
  | 'detail-action'
  | 'context'
  | 'reflection'
  | 'memory'
  | 'release'
  | 'question';

export interface HumanInsightScene {
  // existing fields...

  storyRole?: StoryRole;
  narrativePurpose?: string;
  visualIntent?: string;

  worldId?: string;
  continuityGroup?: string;

  insightVariant?: 'overlay' | 'card';
}
```

Không ảnh hưởng spec cũ.

---

# G. PATCH `InsightCard.tsx`

Thêm prop:

```ts
variant?: 'overlay' | 'card';
```

Default:

```ts
variant = 'overlay'
```

Ngay trước return cũ:

```tsx
if (variant === 'overlay') {
  const exitFrames = 8;
  const exitStart = Math.max(0, durationFrames - exitFrames);

  const opacity = interpolate(
    frame,
    [0, 8, exitStart, durationFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: framing === 'focus' ? 690 : 720,
        zIndex: 25,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: '28px 38px',
          borderRadius: 24,
          background:
            'linear-gradient(180deg, rgba(255,252,247,0.72), rgba(255,252,247,0.90))',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(48,45,40,0.08)',
          boxShadow: '0 12px 36px rgba(48,45,40,0.08)',
          fontFamily: FONT_MAIN,
          fontSize: 46,
          lineHeight: 1.34,
          fontWeight: 700,
          color: COLORS.text,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {statement}
      </div>
    </div>
  );
}
```

Giữ nguyên return white-card cũ cho `variant === 'card'`.

---

# H. PATCH `VideoContent.tsx`

Tính:

```ts
const insightVariant =
  scene.insightVariant ?? 'overlay';

const isFullInsightCard =
  Boolean(scene.insightText) &&
  insightVariant === 'card';
```

Thay:

```tsx
hasInsightCard={Boolean(scene.insightText)}
```

bằng:

```tsx
hasInsightCard={isFullInsightCard}
```

Điều này rất quan trọng:
overlay text không được làm `ImageScene` ẩn artwork.

Render:

```tsx
{scene.insightText ? (
  <InsightCard
    statement={scene.insightText}
    durationFrames={cardDuration}
    framing={scene.layout === 'focus' ? 'focus' : 'standard'}
    variant={insightVariant}
  />
) : null}
```

---

# I. PATCH `validateVisualRhythm.ts`

XÓA hoàn toàn:

```ts
// Criterion B:
Composition repeated 3 times...

// Criterion C:
video uses < 4 composition types...
```

Không được dùng composition diversity như quality metric.

Thay bằng semantic checks nếu metadata có:

```ts
for (const scene of spec.scenes) {
  if (scene.isOutro) continue;

  if (
    scene.storyRole === 'detail-action' &&
    scene.composition &&
    scene.composition !== 'detail-insert'
  ) {
    warnings.push(
      `Scene ${scene.startFrame}: detail-action should usually use detail-insert.`,
    );
  }

  if (
    scene.storyRole === 'memory' &&
    scene.visualContainer &&
    scene.visualContainer !== 'paper'
  ) {
    warnings.push(
      `Scene ${scene.startFrame}: memory beat should consider paper treatment.`,
    );
  }
}
```

Giữ:
- max shot duration;
- long scene single beat;
- paper ratio.

---

# J. Story Planner Test

Tạo:
`src/templates/human-insight/cinematic-light/storyPlannerGeneralization.test.ts`

Không import `.mjs` trực tiếp nếu Vitest/TS gây friction.
Có thể test bằng child_process gọi một CLI dry-run,
hoặc chuyển pure planner core sang JS import-compatible helper.

Ít nhất assert 5 videos:

- 001 => `family-emotional`
- 005 => `relationship-dialogue`
- 007 => `home-living`
- 013 => `books-ideas`
- 028 => `family-emotional`

Assert:
- 005 không có family dinner grammar;
- 007 có human action, không empty-room-only;
- 013 có read/annotate/apply action, không book stack only;
- 028 recurring cast true;
- không plan nào có visualIntent chứa generic filler-only pattern.

---

# K. Generalization dry-run command

Thêm script:

```text
scripts/test-story-planner.mjs
```

Pseudo:

```js
import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { buildStoryPlan } from './human-insight-story-planner.mjs';

const wanted = [1, 5, 7, 13, 28];
const videos = parseHayDepVideos();

for (const index of wanted) {
  const video = videos.find((v) => v.index === index);

  // Synthetic timing only for dry-run planner:
  const paras = video.voiceScriptText
    .split(/\n\s*\n/)
    .filter(Boolean);

  let t = 0;
  const segments = paras.map((text) => {
    const duration = Math.max(2.4, text.split(/\s+/).length / 2.6);
    const seg = { start: t, end: t + duration, text };
    t += duration;
    return seg;
  });

  const { plan, validation } =
    buildStoryPlan(video, segments);

  console.log(JSON.stringify({
    index,
    title: video.title,
    mode: plan.contentMode,
    cast: plan.castId ?? null,
    world: plan.worldId,
    beats: plan.beats.map((b) => ({
      role: b.storyRole,
      intent: b.visualIntent,
      composition: b.composition,
    })),
    validation,
  }, null, 2));
}
```

---

# L. Acceptance

Gemini không được chỉ nói "đã làm".

Bắt buộc chứng minh:

```bash
node scripts/test-story-planner.mjs
npm test
npx tsc --noEmit --skipLibCheck
```

Và grep:

```bash
rg -n "i % 3|sceneIndex %|minimum required: 4|stick-figure" \
  scripts/batch-engine.mjs \
  scripts/human-insight-image.mjs \
  src/templates/human-insight/cinematic-light
```

Kỳ vọng:
- không còn round-robin layout trong batch;
- không còn minimum 4 composition rule;
- không còn stick-figure fallback active.

Quan trọng nhất:
Video 005/007/013 story plan phải khác grammar của Video 001.
