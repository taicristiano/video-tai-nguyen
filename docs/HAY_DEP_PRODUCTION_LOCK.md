# HAY & ĐẸP. — Production Baseline Lock

**Status:** `LOCKED`  
**Lock Date:** 2026-09-20  
**Baseline Version:** V3.6 (5-Video Generalization Pilot Verification)  
**Applicability:** All current and future HAY & ĐẸP. automated pipeline and template generation tasks.

---

## 1. Image Model

```text
@cf/black-forest-labs/flux-1-schnell ONLY
```

- **Policy:** Never switch the image model without an explicit new human decision and sign-off.
- **Provider:** Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`).
- **Forbidden:** No SDXL, no Midjourney, no DALL-E, no Flux Dev, no unauthorized external generation APIs.

---

## 2. Image Style

```text
Clean 2D illustrated / cartoon editorial
Non-photorealistic
Warm ivory / cream
Muted sage
Warm wood
Charcoal / sepia linework
Restrained terracotta / amber
```

- **Style Rule:** Hand-drawn editorial illustration with clean shapes, simple expressive faces, and readable silhouettes. Clearly illustrated, never photorealistic.
- **Palette:**
  - Background: Warm ivory and cream (`#FDFBF7` / `#FFFBE7` / `#F6F1E8`).
  - Clothing & Accents: Muted sage green (`#8A9A86` / `#738670`).
  - Furniture & Material: Warm medium wood and natural grain.
  - Linework: Charcoal / soft sepia.
  - Accents: Restrained terracotta or warm amber.
- **Hard Exclusions:** No photorealism, no 3D render/CGI, no glossy textures, no photographic skin/lighting, no anime/chibi, no speech bubbles, no text/labels/signatures.

---

## 3. Character Identity Contract

```text
Cross-shot character identity consistency is NOT required.
```

- **Contract Rule:** Each image is evaluated independently on its own visual and narrative merits.
- **Zero Attempt Waste:** Do NOT consume retry attempts attempting to force cross-shot character facial or biometric likeness.

---

## 4. Per-Image Visual QA Dimensions

Every individual image asset must independently pass all 5 criteria:

1. **`STYLE`**: Clean 2D cartoon / editorial illustration; strictly non-photorealistic; correct warm palette.
2. **`PEOPLE_CONTRACT`**: Strictly matches the required people count and role in the scene intent (e.g., exactly 1 adult, 0 people for still life).
3. **`SEMANTIC_FIDELITY`**: Accurately depicts the narrative action and core objects without conflicting context.
4. **`ANATOMY`**: Plausible hands, limbs, posture, and facial features; no AI distortion, extra fingers, or melted anatomy.
5. **`TEXT_POLLUTION`**: Zero readable words, letters, numbers, symbols, pseudo-text, calendar grids, brand logos, signatures, or embedded watermarks.

> **Production Principle:** Machine integrity (valid JPEG headers, file size >= 30KB) MUST NEVER automatically imply visual PASS. All five visual QA dimensions must explicitly PASS.

---

## 5. Retry & Asset Cleanup Policy

```text
maximum 3 real generated attempts per asset
HTTP 429 does not consume a visual attempt
HTTP 429 => PAUSED_QUOTA
no account rotation
no model switching
```

- **Quota Pausing:** If Cloudflare returns `HTTP 429`, mark `PAUSED_QUOTA` immediately. Preserve current attempt counter and state.
- **Generation Cap:** At most 3 generative attempts per shot. Do NOT make Attempt 4 automatically.
- **Deterministic Raster Cleanup:**
  - Permitted only after 3 generation attempts when the remaining defect is isolated, minor, and deterministic (e.g., removing a brand logo or background pseudo-text).
  - Any cleaned asset is marked with `cleanupMethod: "deterministic-raster"`, reset to `PENDING_VISUAL_QA` (`qa: null`), and requires explicit visual review.

---

## 6. Framing & Scene Composition

For scene-level clean comparison assets:

```text
editorial-left / editorial-right -> portrait-focus
focalPoint = undefined
```

- Square (1:1) illustrations must be framed centrally using balanced `portrait-focus`.
- Legacy asymmetric presets (`editorial-left`, `editorial-right`) must not be applied to centered square assets, preventing blank letterbox voids.

---

## 7. Motion Grammar

Lock the accepted V3.4A deterministic calm motion grammar:

- **Movements:** Slow subtle push-in (`scale: 1.0 -> 1.04`), calm breathing, or static hold.
- **Prohibited:**
  - NO bounce
  - NO spring
  - NO rotation
  - NO opacity dip / black flashes at narrative cuts
  - NO decorative motion for its own sake
- **Transitions:** Hard cuts between narrative scenes remain the locked baseline.

---

## 8. Brand Watermark

- **Exact Asset:** `public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png` (Never recreate, redraw, or typeset).
- **Narrative Scene Positioning:**
  ```text
  position = top-right
  top = 40px
  right = 40px
  width = 250px
  opacity = 0.24
  animated = false
  ```
- **Constraint:** Do NOT center watermark inside narrative scenes. Centered brand treatment is reserved strictly for dedicated intro/outro screens.

---

## 9. Typography Baseline

Lock current V3.5A typography hierarchy:

### Title (`TopicTitle`)
```text
maxWidth = 820px
fontSize = 44px
lineHeight = 1.32
maxLines = 2
top = 170px
fontFamily = "Playfair Display", serif
fontWeight = 600
```

### Subtitle (`Subtitles`)
```text
maxWidth = 860px
fontSize = 38px
lineHeight = 1.4
bottomPlacement = 14%
maxWords = 7
fontFamily = "Inter", sans-serif
fontWeight = 500
```
- **Integrity Rule:** Canonical subtitle speech alignment and timings must not be altered during visual polish.

---

## 10. Vertical Layout Safe Zones (1080 × 1920)

```text
frame = 1080x1920
top brand/title zone   = 0 .. 300px
center artwork zone    = 300 .. 1380px
bottom subtitle zone   = 1380 .. 1920px
```

- Visual art sits comfortably within the center vertical canvas without colliding with top brand badges or bottom captions.

---

## 11. Production QA Integrity Principle

**NO FAKE PASS.**

- A production asset may only be marked `PASS` through an explicit, auditable visual QA record.
- File existence, buffer size, JPEG validity, prompt adherence, or successful Remotion rendering do NOT prove visual quality.

---

## 12. V3.6 Validation Evidence

The V3.6 Generalization Pilot verified 5 representative content profiles across 30 distinct scenes:

| Video Key | Content Profile | Title | Frame Count | Status |
|---|---|---|:---:|:---:|
| **`video001`** | `family-emotional` | Có những bữa cơm sau này mới hiểu là rất quý | 773f (~25.8s) | **PASS** (6/6) |
| **`video005`** | `relationship-dialogue` | Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần | 550f (~18.3s) | **PASS** (6/6) |
| **`video007`** | `home-living` | Hai Mươi Bốn Giờ Trước Một Món Mua Không Cần Gấp | 525f (~17.5s) | **PASS** (6/6) |
| **`video013`** | `books-ideas` | Không Phải Lúc Nào Người Khác Kể Chuyện Cũng Cần Sửa Giúp | 645f (~21.5s) | **PASS** (6/6) |
| **`video028`** | `family-emotional` | Không Cần Trả Lời Mọi Thông Báo | 444f (~14.8s) | **PASS** (6/6) |

- **Total Assessed:** 30 / 30 assets `PASS`.
- **Suite Verification:** 5 / 5 videos `PASS`.
- **Scope Note:** V3.6 pilots are scene-level generalization pilots. `visualBeats` are intentionally disabled in these comparison artifacts to benchmark macro-scene framing and visual quality.
