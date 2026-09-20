# HAY & ĐẸP. V3.3 — VISUAL IDENTITY ENGINE BLUEPRINT

## Mục tiêu

V3.3 không tối ưu thêm Story Planner.
Không sửa subtitle/SFX/UI trong round này.
Không render Video 005.
Không batch 100.

Mục tiêu duy nhất:

> Làm cho nhiều shot của cùng một video nhìn như cùng họa sĩ, cùng nhân vật, cùng không gian.

Hiện pipeline:
`text prompt -> FLUX.1 Schnell -> independent image`

V3.3 cần prototype:
`story beat + style ref + cast ref + world ref -> reference-conditioned generation`

Cloudflare hiện có FLUX.2 models hỗ trợ multi-reference image inputs.
Không thay model global. Chỉ tạo một reference-generation path riêng cho `human-insight/cinematic-light`.

---

# 1. V3.3 chia 2 bước

## V3.3A — Reference Conditioning Spike

Chỉ generate 3–4 ảnh thử nghiệm.
Không render video hoàn chỉnh.

Mục đích:
- xác minh API multipart chạy;
- xác minh model bám style;
- xác minh cùng father/mother/children;
- xác minh cùng room anchors.

## V3.3B — Integration

Chỉ làm nếu V3.3A nhìn thực tế đạt.
Sau đó mới wire reference path vào batch engine.

---

# 2. Model test

Test 2 model, cùng prompt/cùng references:

1. `@cf/black-forest-labs/flux-2-dev`
2. `@cf/black-forest-labs/flux-2-klein-9b`

Không giả định model nào tốt hơn.
Dùng output thật để chọn.

Không thay:
`CLOUDFLARE_MODEL = flux-1-schnell`
cho workflow cũ.

Thêm:

```js
const REFERENCE_MODELS = {
  quality: '@cf/black-forest-labs/flux-2-dev',
  fast: '@cf/black-forest-labs/flux-2-klein-9b',
};
```

Env optional:

```text
HAY_DEP_REFERENCE_MODEL=@cf/black-forest-labs/flux-2-dev
```

---

# 3. Reference bundle per video

Directory:

```text
videos/<slug>/references/
```

Files:

```text
style-reference.jpg
cast-reference.jpg
world-reference.jpg
canonical-establish.jpg
reference-manifest.json
```

`reference-manifest.json`:

```json
{
  "version": 1,
  "videoSlug": "...",
  "style": {
    "path": "references/style-reference.jpg",
    "approved": false
  },
  "cast": {
    "castId": "family-young-01",
    "path": "references/cast-reference.jpg",
    "approved": false
  },
  "world": {
    "worldId": "home-family-01",
    "path": "references/world-reference.jpg",
    "approved": false
  },
  "canonicalEstablish": {
    "path": "references/canonical-establish.jpg",
    "approved": false
  }
}
```

Không đưa reference chưa approve vào global asset manifest.

---

# 4. Reference source strategy

## STYLE REFERENCE

Ưu tiên:
1. ảnh manual V3.2 trước đây mà người review đánh giá tốt;
2. nếu repo còn `public/assets/human-insight/images/v3/`, chọn frame tốt nhất;
3. nếu không còn file, generate 3 candidates và tạo contact sheet để chọn 1.

Style reference chỉ cần định nghĩa:
- medium: editorial 2D
- linework
- shading
- color/palette
- texture
- character proportions

Không cần đúng cast.

## CAST REFERENCE

Một image sheet chứa đúng:
- father
- mother
- boy
- girl

Neutral clean background.
Không scene storytelling.
Nhìn rõ:
- face
- hair
- glasses/no glasses
- wardrobe
- proportions

Reference sheet phải có labels trong metadata, KHÔNG cần text label trong hình nếu model dễ sinh chữ rác.

## WORLD REFERENCE

Không người.
Cùng `home-family-01`:
- rectangular medium-oak dining table
- cream wall
- pendant lamp centered above table
- window camera-left
- sage vase/sideboard

Đây là room master.

## CANONICAL ESTABLISH

Generate sau khi 3 references trên đã có.
Đây là:
- full family
- simple dinner
- room master
- style master

Sau khi approved, canonical establish không bị overwrite.

---

# 5. Reference image preparation

FLUX.2 reference inputs cần file nhỏ.
Tạo helper:

```js
function prepareReferenceImage(
  inputPath,
  outputPath,
) {
  const result = spawnSync('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-vf',
    "scale='min(511,iw)':'min(511,ih)':force_original_aspect_ratio=decrease",
    '-q:v', '3',
    outputPath,
  ], {
    cwd: ROOT,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(
      `Failed to prepare reference: ${result.stderr}`,
    );
  }
}
```

Không stretch.
Không pad nếu không cần.

---

# 6. New generator — do not corrupt old path

Tạo:

```text
scripts/human-insight-reference-image.mjs
```

Không nhét ngay vào `human-insight-image.mjs`.

V3.3A cần isolate để dễ rollback.

CLI:

```text
--prompt
--model quality|fast|<exact-model>
--style-ref <path>
--cast-ref <path>
--world-ref <path>
--canonical-ref <path>   optional
--width
--height
--seed
--output
```

---

# 7. Multipart Cloudflare implementation

Node 20+:

```js
async function generateWithFlux2References({
  model,
  prompt,
  referencePaths = [],
  width = 1024,
  height = 1024,
  seed,
}) {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID;

  const token =
    process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    throw new Error(
      'Missing Cloudflare credentials',
    );
  }

  const url =
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${accountId}/ai/run/${model}`;

  const form = new FormData();

  form.append('prompt', prompt);
  form.append('width', String(width));
  form.append('height', String(height));

  if (Number.isFinite(seed)) {
    form.append(
      'seed',
      String(seed >>> 0),
    );
  }

  for (
    let i = 0;
    i < referencePaths.length;
    i++
  ) {
    const filePath =
      referencePaths[i];

    const buffer =
      fs.readFileSync(filePath);

    const ext =
      path.extname(filePath)
        .toLowerCase();

    const type =
      ext === '.png'
        ? 'image/png'
        : 'image/jpeg';

    form.append(
      `input_image_${i}`,
      new Blob(
        [buffer],
        { type },
      ),
      path.basename(filePath),
    );
  }

  const response =
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: form,
    });

  const body =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Cloudflare ${response.status}: ` +
      body.slice(0, 2000),
    );
  }

  const data =
    JSON.parse(body);

  const imageBase64 =
    data.result?.image;

  if (!imageBase64) {
    throw new Error(
      `No result.image: ` +
      body.slice(0, 2000),
    );
  }

  return Buffer.from(
    imageBase64,
    'base64',
  );
}
```

IMPORTANT:
- Không set `Content-Type` thủ công cho multipart.
- `FormData` tự sinh boundary.
- Max 4 image inputs.
- Reference path count > 4 => throw.

---

# 8. Reference ordering convention

Luôn dùng:

```text
input_image_0 = style reference
input_image_1 = cast reference
input_image_2 = world reference
input_image_3 = canonical establish (optional)
```

Prompt phải nói rõ index.

Ví dụ recurring human shot:

```text
Image 0 defines the exact illustration style:
linework, shading, texture and color treatment.

Image 1 defines the exact recurring family identities.
Keep the same father, mother, boy and girl.
Do not redesign faces, hair, glasses state or clothes.

Image 2 defines the same dining room.
Keep the same table, pendant lamp, wall, window and sideboard.

Image 3, when provided, is the canonical established scene.
Preserve the same character and room identity.

ACTION:
The boy animatedly tells a small story at dinner.
Father and mother look at him and listen.
Simple bowls of dinner remain on the table.

CAMERA:
medium candid editorial shot.
No camera-facing pose.

Do not add text, logos, labels or random people.
```

---

# 9. Scene reference policy

## Human recurring scene

Use:
```text
style + cast + world
```

If identity is especially important:
```text
style + cast + world + canonical establish
```

## Detail with one person

Use:
```text
style + cast + world
```

Prompt explicitly names only the present member.

## No-people release

Use:
```text
style + world
```

Do not include cast ref.

## Memory

Default:
**reuse canonical establish directly**.
Do not regenerate if a crop/container can tell the story.

## Question

Prefer:
**reuse canonical or recent approved shot**
instead of generating a new family.

---

# 10. V3.3A test scenes — Video 001 only

Do not generate all beats.

Generate exactly these test scenes:

## TEST A — establish

Full family dinner.

Purpose:
- baseline style
- 4 identities
- room

## TEST B — interaction

Boy tells story.
Father + mother listen.
Girl may be background or omitted depending composition.

Purpose:
- same identities under different pose/action
- same room
- same art medium

## TEST C — phone detail

Father places phone away.
Family remains softly in background.

Purpose:
- same father in closer/detail composition
- action semantics
- room consistency

## TEST D — release

No people.
After-dinner room.

Purpose:
- same world without people
- style consistency

Generate each with:
- FLUX.2 dev
- FLUX.2 klein 9B

=> 8 outputs max.

Create 4x2 contact sheet.

---

# 11. V3.3A acceptance

Do not use metadata to judge.

Visual review must answer:

### STYLE
- same drawing medium?
- same linework?
- same facial rendering?
- same shading?
- no photo-real vs anime jump?

### CAST
Father:
- same face shape
- same hair
- no glasses drift
- same wardrobe

Mother:
- same face
- same low bun
- no glasses drift
- same cardigan

Children:
- boy/girl distinguishable
- no duplicated boys
- no age jumps

### WORLD
- same table
- same pendant lamp
- same wall/window
- same general room layout

### ACTION
- scene tells the requested action
- not posed portrait

Score each output:
`STRONG / ACCEPTABLE / WEAK / FAIL`

A model may move to V3.3B only if:
- STYLE >= ACCEPTABLE for all 4 scenes
- CAST >= ACCEPTABLE for A/B/C
- WORLD >= ACCEPTABLE for all 4
- no shot FAIL

---

# 12. V3.3A artifact outputs

Create:

```text
videos/<slug>/qa/v33/
  model-dev/
    establish.jpg
    interaction.jpg
    phone.jpg
    release.jpg

  model-klein9b/
    establish.jpg
    interaction.jpg
    phone.jpg
    release.jpg

  contact-sheet-model-compare.jpg
  prompts.json
  v33-evaluation.md
```

Do not render mp4.

---

# 13. Only after V3.3A passes — V3.3B

Integrate into active batch with:

```text
referenceMode:
  off
  auto
  required
```

For `cinematic-light`:
default eventually = `auto`.

For other templates:
unchanged.

Pseudo:

```js
if (
  template ===
    'human-insight/cinematic-light' &&
  referenceBundle?.approved
) {
  resolved =
    resolveReferenceConditionedBeat(...);
} else {
  resolved =
    resolveLegacyTextOnlyBeat(...);
}
```

No global model migration.

---

# 14. Cost / performance guardrail

References are per-video.
Do not regenerate:
- style reference
- cast reference
- world reference

on every run.

If reference manifest exists:
reuse unless:
`--refresh-references`.

Use:
```text
--reference-mode auto
--refresh-references
```

separately.

---

# 15. Do not solve yet

V3.3 does NOT solve:
- subtitle canonical alignment
- SFX round-robin
- typography polish
- atmosphere polish
- 5-video generalization
- batch 100

Those come later.

V3.3 success criterion is only:

> SAME STYLE + SAME PEOPLE + SAME WORLD.
