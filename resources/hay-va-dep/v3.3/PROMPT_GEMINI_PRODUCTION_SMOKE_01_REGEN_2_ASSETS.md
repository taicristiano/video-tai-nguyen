# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
# HUMAN QA + SELECTIVE REGEN FOR 2 FAILED PRODUCTION ASSETS
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## HUMAN REVIEW RESULT

The 5 fresh production assets were reviewed against:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

Record these exact decisions.

---

## PASS — scene-07

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Clean 2D editorial illustration, exactly one visible adult, adult is in a quiet domestic pause holding a plain ceramic bowl, anatomy is acceptable, and no material text/logo/signature pollution is visible.
```

---

## PASS — scene-08-beat-01

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Clean 2D editorial illustration, exactly one visible adult seated at a warm wooden dining table with rice bowl and chopsticks in calm anticipation, anatomy is acceptable, and no material text pollution is visible.
```

---

## FAIL — scene-08-beat-02

```text
STYLE PASS
PEOPLE PASS
SEMANTIC FAIL
ANATOMY PASS
TEXT PASS
```

Reason:

```text
The authored semantic contract explicitly requires the dining tabletop to be completely free of electronic devices, but a smartphone is clearly visible at the upper-left of the image.
```

Set:

```text
NEEDS_REGEN
```

This is Attempt 1 -> next real generation is Attempt 2.

---

## FAIL — scene-09-beat-02

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT FAIL
```

Reason:

```text
The wall sheet/calendar on the left contains visible writing-like pseudo-text. This violates the strict clean-surface TEXT_POLLUTION contract.
```

Set:

```text
NEEDS_REGEN
```

This is Attempt 1 -> next real generation is Attempt 2.

---

## PASS — scene-10

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Clean 2D editorial illustration, exactly one adult seated at a wooden table holding a warm ceramic cup with both hands in a gentle reflective pose; anatomy is acceptable and no material text/logo/signature pollution is visible.
```

---

# EXPECTED STATE AFTER RECORDING QA

```text
scene-07        PASS
scene-08-beat01 PASS
scene-08-beat02 NEEDS_REGEN
scene-09-beat02 NEEDS_REGEN
scene-10        PASS
```

Do NOT render final.mp4 yet.

---

# SELECTIVE REGEN — EXACTLY 2 ASSETS

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Do NOT regenerate any PASS asset.

Archive Attempt-1 asset before replacement.

If HTTP 429:
```text
PRODUCTION SMOKE TEST 01 — PAUSED_QUOTA
```
Stop immediately.
Do not switch model or rotate account.

After successful generation:
- machine integrity only;
- new asset state = `PENDING_VISUAL_QA`;
- `qa = null`;
- do NOT auto-PASS;
- preserve attempt/failure history.

---

## 1. scene-08-beat-02 — Attempt 2

Authored clause:

```text
"và điện thoại không nằm giữa bàn."
```

People contract:

```text
0 people
```

The visual must communicate a phone-free table by ABSENCE of electronics.

Use this tightened prompt:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

Top-down close detail of a simple warm wooden dining table prepared for a home meal.

Show exactly:
- one plain ceramic rice bowl;
- one small plain ceramic side dish;
- one pair of wooden chopsticks resting neatly on a simple chopstick rest.

ZERO PEOPLE.
No hands.
No arms.
No body parts.

ABSOLUTELY NO ELECTRONIC DEVICES:
NO smartphone.
NO mobile phone.
NO tablet.
NO screen.
NO laptop.
NO watch.
NO charger.
NO cable.
NO remote control.

Do not show a phone even at the edge or partially cropped.

No words.
No letters.
No numbers.
No labels.
No logos.
No signature.
No watermark.
No pseudo-text.

Warm ivory / cream ambience, muted sage accent, warm wood, charcoal/sepia linework.
Simple clean 2D editorial cartoon style.
```

---

## 2. scene-09-beat-02 — Attempt 2

Authored clause:

```text
"Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào."
```

People contract:

```text
0 people
```

Use this tightened prompt:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

A quiet poignant after-meal dining room in soft afternoon light.

Show:
- two empty wooden chairs;
- one simple wooden dining table;
- one plain ceramic cup;
- one folded cloth napkin;
- subtle warm lived-in atmosphere.

ZERO PEOPLE.
No human body parts.

BACKGROUND MUST BE SIMPLE:
plain warm ivory wall;
one small framed botanical illustration is allowed.

DO NOT SHOW:
calendar,
menu,
poster,
paper sheet,
wall note,
label,
receipt,
document,
whiteboard,
chart,
newspaper,
book with visible writing.

No words.
No letters.
No numbers.
No pseudo-text.
No writing-like marks.
No logo.
No signature.
No watermark.

Warm ivory / cream palette, muted sage accents, warm wood, charcoal/sepia linework.
```

---

# REVIEW ARTIFACTS

After both Attempt-2 calls succeed, rebuild only the focused production review pack.

Export:

```text
scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg
scratch/production-smoke/video001/review-pack/scene-09-beat-02.jpg
```

Create:

```text
scratch/production-smoke/video001/review-pack/pending-2-contact-sheet.jpg
```

Requirements:
- both images shown fully;
- no crop;
- large inspection size;
- show slot, semantic intent, people contract, attempt number;
- badge = PENDING VISUAL QA.

Update production visual-review manifest and run summaries.

Do NOT render final MP4 yet.

---

# EXPECTED END STATE

If both generation calls succeed:

```text
8 reused/previously reviewed production assets = PASS
3 fresh production assets = PASS
2 regenerated assets = PENDING_VISUAL_QA

overall smoke-test asset state = PENDING_VISUAL_QA
```

Final line:

```text
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — 2 ASSETS READY FOR HUMAN REVIEW
```

Then STOP.
