# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6 FINAL SELECTIVE REGEN
# ATTEMPT 3 FOR THE SAME 5 SHOTS ONLY
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## HUMAN REVIEW RESULT OF ATTEMPT 2

All five regenerated assets are still FAIL.

Do NOT touch any already-passed assets.
Do NOT rerender MP4 yet.
Do NOT switch model.
This is the FINAL real generation attempt for these five shots.

Model:
`@cf/black-forest-labs/flux-1-schnell`

Identity consistency:
NOT REQUIRED.

After this attempt, each new asset must remain `PENDING_VISUAL_QA`.
No automatic visual PASS.

## RECORD ATTEMPT-2 HUMAN FAILURES FIRST

### video007 / shot01
FAIL:
- TEXT_POLLUTION
Reason:
- visible artist/signature-like mark in the bottom-right corner.

### video007 / shot05
FAIL:
- STYLE
- SEMANTIC_FIDELITY
Reason:
- image is photorealistic instead of clean 2D cartoon/editorial;
- expected a ceramic dish + brass bookmark still life, but output became a photographic bowl/cup + open book.

### video013 / shot02
FAIL:
- TEXT_POLLUTION
Reason:
- planning board/calendar/papers still contain writing-like marks, labels, chart text, and pseudo-text.

### video028 / shot04
FAIL:
- STYLE/CLEANLINESS
- TEXT_POLLUTION
Reason:
- strong vertical purple side bars embedded inside the image;
- laptop still contains an Apple-like logo / brand mark.

### video028 / shot06
FAIL:
- SEMANTIC_FIDELITY
- TEXT_POLLUTION
Reason:
- laptop is visibly open although intent is relaxing back with a closed/slightly closed laptop;
- laptop contains an Apple-like logo / brand mark.

Set those five shots to `NEEDS_REGEN` before generating Attempt 3.

Archive current Attempt-2 assets before replacement.

---

# ATTEMPT 3 PROMPTS

## 1. video007 / shot01

Target:
one adult outside a ceramic boutique display window.

Use:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
NOT a photograph. NOT realistic. NOT 3D.

Exactly one visible adult standing outside a simple ceramic shop window.
Inside the display: only plain unbranded ceramic bowls and vases.
Every object is completely blank.

IMPORTANT CLEAN SURFACE RULE:
No words.
No letters.
No numbers.
No labels.
No price tags.
No cards.
No packaging text.
No logos.
No signature.
No artist mark.
No watermark.
No glyph-like scribbles.
Keep ALL FOUR CORNERS and the ENTIRE BOTTOM EDGE completely blank.

Warm ivory background, muted sage clothing, warm wooden shelf, charcoal/sepia linework.
Simple hand-drawn 2D cartoon shapes.
```

Do not add decorative cards or signs.

---

## 2. video007 / shot05

Target:
0 people still life; ceramic dish + brass bookmark.

Use:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Strong visible ink/line-art contours.
Absolutely NOT photorealistic.
NOT realistic lighting.
NOT photographic depth of field.
NOT 3D.

STILL LIFE ONLY.
ZERO PEOPLE.
No hand.
No arm.
No fingers.
No body part.

Show exactly:
- one small handcrafted ceramic dish;
- one simple brass bookmark;
- both resting on a warm wooden desk.

No book.
No paper.
No other hero object.
No text.
No letters.
No logo.
No signature.
No watermark.

Warm ivory ambient background, muted sage/terracotta accent, simple hand-drawn editorial style.
```

---

## 3. video013 / shot02

Target:
1 adult thinking/explaining plans at desk, but ZERO surfaces that invite text generation.

Use:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Exactly one visible adult seated at a simple wooden desk.
The adult gestures thoughtfully as if explaining a plan.

BACKGROUND MUST BE EXTREMELY SIMPLE:
plain warm ivory wall;
one blank wooden shelf;
one closed blank notebook;
one plain cup.

DO NOT SHOW:
calendar,
planning board,
whiteboard,
sticky notes,
wall papers,
posters,
charts,
graphs,
documents,
printed sheets,
screens with UI.

No words.
No letters.
No numbers.
No symbols.
No pseudo-text.
No signature.
No watermark.
No logos.

Warm ivory, muted sage, warm wood, charcoal linework.
```

Semantic intent should come from the person's thoughtful gesture, NOT from visible written planning artifacts.

---

## 4. video028 / shot04

Target:
one adult calmly glancing at plain laptop.

Use:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.
Exactly one visible adult seated at a tidy wooden desk, calmly glancing at an open generic laptop screen.

Laptop must be generic and completely blank:
NO Apple shape.
NO fruit shape.
NO brand mark.
NO icon.
NO writing.
NO sticker.
NO edge label.

FULL-FRAME ARTWORK:
illustration must naturally extend to every image edge.
No colored side bars.
No black bars.
No frame-within-frame.
No border strips.
No letterboxing.

No signature.
No watermark.
No pseudo-text.

Warm ivory room, muted sage clothing, warm wood desk, clean 2D linework.
```

---

## 5. video028 / shot06

Target:
adult leaning back, finished responding, CLOSED laptop visible separately.

Use:

```text
CLEAN FLAT 2D CARTOON EDITORIAL ILLUSTRATION ONLY.

Exactly one visible adult relaxing back in an office chair after finishing work.
The person's hands are away from the computer.

A CLOSED plain generic laptop rests on the wooden desk beside the chair.
The laptop must be visibly closed.

Laptop exterior:
completely blank.
NO Apple shape.
NO fruit shape.
NO logo.
NO icon.
NO text.
NO sticker.

Do NOT place an open laptop on the person's lap.

Full-frame clean illustration.
No black bars.
No side bars.
No letterboxing.
No embedded frame.
No signature.
No watermark.

Warm ivory background, muted sage clothing, warm wood, simple editorial cartoon linework.
```

---

# GENERATION CONTRACT

For each target:
- this is Attempt 3;
- call Schnell exactly once;
- archive Attempt-2 first;
- machine integrity only after generation;
- replace current asset if machine integrity succeeds;
- set shot to `PENDING_VISUAL_QA`;
- qa = null;
- preserve failure history;
- regenerate contact sheet for affected video.

If HTTP 429:
`V3.6 FINAL SELECTIVE REGEN — PAUSED_QUOTA`
and STOP.

Do not make Attempt 4.

## OUTPUT

Return direct paths for the five new Attempt-3 assets and updated contact sheets:

- video007/contact-sheet.jpg
- video013/contact-sheet.jpg
- video028/contact-sheet.jpg

Final status after successful generation must be:

```text
video001 = PASS
video005 = PASS
video007 = PENDING_VISUAL_QA
video013 = PENDING_VISUAL_QA
video028 = PENDING_VISUAL_QA
overall = PENDING_VISUAL_QA
```

Verdict:

```text
V3.6 FINAL SELECTIVE REGEN — READY_FOR_HUMAN_REVIEW
```

Then STOP.
Do not Production Lock.
Do not rerender final videos.
