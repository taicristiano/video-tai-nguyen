# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6 ATTEMPT-3 HUMAN REVIEW + DETERMINISTIC CLEANUP
# NO MORE IMAGE GENERATION
# NO CLOUDFLARE CALLS

## HUMAN REVIEW OF ATTEMPT 3

Record these exact QA decisions.

### PASS — video007 / shot01
```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```
Reason:
Clean 2D boutique-window illustration, exactly one adult, plain ceramics, no material pseudo-text/signature/watermark visible.

### PASS — video007 / shot05
```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```
Reason:
Clean 2D still life, zero people/body parts, ceramic dish and brass bookmark are visibly present. The open book is acceptable contextual support and does not contradict the core semantic intent.

### PASS — video028 / shot04
```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT PASS
```
Reason:
Clean full-frame 2D illustration, exactly one adult at laptop, no side bars, laptop exterior is visually plain enough, no material text pollution.

### FAIL — video013 / shot02
```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT FAIL
```
Reason:
Calendar/planning sheet on upper-left wall still contains writing-like dash/grid marks. This remains TEXT_POLLUTION under the strict clean-surface contract.

### FAIL — video028 / shot06
```text
STYLE PASS
PEOPLE PASS
SEMANTIC PASS
ANATOMY PASS
TEXT FAIL
```
Reason:
Core semantic intent is acceptable at production threshold: one adult visibly leaning back and disengaging from work with laptop separate in foreground. However the laptop has a clear Apple-like logo/brand mark, which violates TEXT_POLLUTION / no-logo policy.

After recording:
```text
video007 = PASS
video013 = NEEDS_REGEN / NEEDS_CLEANUP
video028 = NEEDS_REGEN / NEEDS_CLEANUP
```

Do NOT generate Attempt 4.

---

# DETERMINISTIC CLEANUP FALLBACK

We have reached the 3-real-attempt limit.

Perform NON-GENERATIVE raster cleanup only.

Forbidden:
- Cloudflare
- Schnell
- any image-generation model
- AI inpainting
- new image synthesis

Allowed:
- Pillow / Sharp / ImageMagick / Canvas
- crop
- flat patch
- clone from nearby plain background
- simple shape overlay
- color sampling
- feathered mask if needed

Archive Attempt-3 originals before editing.

## 1. video013 / shot02

Problem:
Upper-left calendar/planning sheet contains pseudo-text/grid marks.

Required deterministic cleanup:
- remove ONLY the calendar/planning-sheet object and its writing-like marks;
- replace that area with the nearby plain warm-ivory wall;
- do not alter the person, face, body, desk, notebook, cup, or main composition;
- no new decoration is required;
- result should look like a simple blank wall.

Output to the same canonical asset path:
```text
scratch/v36/generalization/video013/assets/shot-02.jpg
```

Archive original first:
```text
scratch/v36/generalization/video013/archive/shot-02-att3-before-cleanup.jpg
```

Set:
```text
PENDING_VISUAL_QA
qa = null
cleanupMethod = deterministic-raster
```

## 2. video028 / shot06

Problem:
Apple-like logo/brand mark on laptop lid.

Required deterministic cleanup:
- remove ONLY the logo/brand mark from the laptop;
- fill/clone with the surrounding plain laptop-lid color;
- preserve laptop shape, person, chair, desk, and room;
- do not alter pose or composition;
- no replacement logo or decorative mark.

Output:
```text
scratch/v36/generalization/video028/assets/shot-06.jpg
```

Archive original first:
```text
scratch/v36/generalization/video028/archive/shot-06-att3-before-cleanup.jpg
```

Set:
```text
PENDING_VISUAL_QA
qa = null
cleanupMethod = deterministic-raster
```

---

# UPDATE ARTIFACTS

Rebuild only:
```text
video013/contact-sheet.jpg
video028/contact-sheet.jpg
```

Update:
```text
visual-review.json
qa-report.json
summary.json
summary.md
visual-review-summary.json
```

Do NOT rerender MP4 yet.

Expected status after cleanup:
```text
video001 = PASS
video005 = PASS
video007 = PASS
video013 = PENDING_VISUAL_QA
video028 = PENDING_VISUAL_QA

28 shots PASS
2 shots PENDING
0 NEEDS_REGEN
overall = PENDING_VISUAL_QA
```

Return direct paths to:
- cleaned video013 shot02
- cleaned video028 shot06
- both rebuilt contact sheets

Final verdict:

```text
V3.6 DETERMINISTIC CLEANUP — READY_FOR_FINAL_HUMAN_REVIEW
```

Then STOP.
Do not Production Lock automatically.
