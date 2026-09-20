# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — PRODUCTION SMOKE TEST 01
# REVIEW PACK FIX — OFFLINE ONLY
# NO IMAGE GENERATION / NO CLOUDFLARE

## CONTEXT

The current production contact sheet is vertically clipped.
The third row is not fully visible, so human QA cannot be completed reliably.

Do NOT generate any new images.
Do NOT call Cloudflare.
Do NOT change any asset.
Do NOT render final.mp4 yet.

## CURRENT HUMAN REVIEW FROM THE VISIBLE CONTACT SHEET

Record nothing yet unless explicitly stated below.

Preliminary visual inspection:

```text
scene-07        = visually acceptable / likely PASS
scene-08-beat01 = visually acceptable / likely PASS
scene-09-beat02 = visible TEXT_POLLUTION candidate:
                  wall sheet/calendar contains writing-like marks
scene-08-beat02 = cannot fully review because contact sheet is clipped
scene-10        = cannot fully review because contact sheet is clipped
```

Do NOT convert these preliminary notes into final manifest QA yet.

## REQUIRED REVIEW PACK

Create a complete human-review pack from the EXISTING 5 pending assets.

Copy/export the five exact canonical assets to:

```text
scratch/production-smoke/video001/review-pack/
  scene-07.jpg
  scene-08-beat-01.jpg
  scene-08-beat-02.jpg
  scene-09-beat-02.jpg
  scene-10.jpg
```

Do not recompress if simple file copy is possible.

Also create:

```text
scratch/production-smoke/video001/review-pack/review-manifest.json
```

For each item include:

```text
slot
sourceAssetPath
frameRange
voice / narrative clause
semanticIntent
peopleContract
currentQaStatus
attempt
```

## FIX THE CONTACT SHEET

Rebuild:

```text
scratch/production-smoke/video001/production-contact-sheet-full.jpg
```

Requirements:

- show ALL 11 visual assets completely;
- no vertical clipping;
- use Playwright `fullPage: true` OR compute viewport height from content;
- every card must show:
  - slot name
  - scene/beat
  - people contract
  - short semantic intent
  - PASS / PENDING badge
- third row must be fully visible including captions;
- no asset replacement.

Also create a focused 5-image review sheet:

```text
scratch/production-smoke/video001/review-pack/pending-5-contact-sheet.jpg
```

Layout:
- 2 columns or 3 columns;
- large enough to inspect hands, text pollution, body parts, and logos;
- full image visible with `object-fit: contain`;
- no crop.

## REPORT

Return:

### A. Five Direct Asset Paths
### B. Full Contact Sheet Path
### C. Pending-5 Contact Sheet Path
### D. Review Manifest Path
### E. Confirmation

Final line:

```text
PRODUCTION SMOKE TEST 01 — REVIEW PACK READY
```

Then STOP.

Do not record final visual QA.
Do not regenerate.
Do not render final MP4.
