# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
# FINAL SELECTIVE REGEN — SCENE-08-BEAT-02 ATTEMPT 3 ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## HUMAN REVIEW OF ATTEMPT 2

### PASS — scene-09-beat-02

Record:

```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Clean 2D editorial interior with zero people, two empty chairs, simple dining table, plain ceramic cup, warm afternoon atmosphere, and no calendar/pseudo-text/writing-like marks.
The missing cloth napkin is non-critical contextual detail and does not break the core semantic intent.
```

### FAIL — scene-08-beat-02

Record:

```text
STYLE PASS
PEOPLE PASS
SEMANTIC FAIL
ANATOMY PASS
TEXT PASS
```

Reason:

```text
Attempt 2 still contains a clearly visible smartphone on the tabletop.
The authored semantic contract requires a completely phone-free / electronics-free dining surface.
```

Set:

```text
NEEDS_REGEN
```

This is now Attempt 2 failed -> next real generation is Attempt 3.

---

# ATTEMPT 3 — scene-08-beat-02 ONLY

Use ONLY:

```text
@cf/black-forest-labs/flux-1-schnell
```

Do not regenerate any other asset.
Archive Attempt-2 before replacement.
If HTTP 429 -> PAUSED_QUOTA and STOP.

## IMPORTANT PROMPT STRATEGY

Do NOT describe the missing object.
Do NOT mention smartphone, phone, electronics, screens, or devices in the positive scene description.

Instead, constrain the tabletop to EXACTLY the required visible objects.

Use this prompt:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT photorealistic. NOT 3D.

Top-down close detail of a simple warm wooden dining table prepared for a quiet home meal.

The tabletop contains EXACTLY these visible objects and NOTHING ELSE:

1. ONE plain ceramic bowl filled with white rice.
2. ONE small plain ceramic side bowl.
3. ONE pair of wooden chopsticks resting neatly beside the rice bowl.

No people.
No hands.
No arms.
No body parts.

The rest of the tabletop must be completely empty and uninterrupted warm wood.
No extra objects at any edge.
No partially cropped objects.
No decorative accessories.
No cups.
No books.
No papers.
No utensils other than the single pair of chopsticks.

No words.
No letters.
No numbers.
No labels.
No logos.
No signature.
No watermark.
No pseudo-text.

Warm ivory / cream ambience, muted sage ceramic accent, warm wood tabletop, charcoal/sepia linework.
Simple clean hand-drawn 2D editorial cartoon style.
```

Machine integrity may validate file/decoding only.
DO NOT auto-PASS visual QA.

After successful generation:

```text
scene-08-beat-02 = PENDING_VISUAL_QA
qa = null
attempt = 3
```

Rebuild only:

```text
scratch/production-smoke/video001/review-pack/scene-08-beat-02.jpg
scratch/production-smoke/video001/review-pack/pending-1-contact-sheet.jpg
```

Do NOT render final.mp4 yet.

Expected state:

```text
scene-07        PASS
scene-08-beat01 PASS
scene-08-beat02 PENDING_VISUAL_QA (Attempt 3)
scene-09-beat02 PASS
scene-10        PASS
```

Final line:

```text
HAY & ĐẸP. PRODUCTION SMOKE TEST 01 — FINAL ASSET READY FOR HUMAN REVIEW
```

Then STOP.

Do not make Attempt 4.
