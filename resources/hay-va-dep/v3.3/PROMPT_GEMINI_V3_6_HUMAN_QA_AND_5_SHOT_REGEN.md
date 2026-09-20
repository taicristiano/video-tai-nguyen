# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.6 HUMAN QA RECORD + SELECTIVE REGEN
# ONLY 5 FAILED SHOTS
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## GOAL

Apply the supplied HUMAN visual QA decisions to the current V3.6 manifests, then regenerate ONLY the five failed shots.

Do NOT change the 19 passed fresh assets.
Do NOT change video001.
Do NOT regenerate whole videos.
Do NOT switch image model.
Do NOT auto-pass regenerated images.

Locked model:
`@cf/black-forest-labs/flux-1-schnell`

Cross-image identity consistency remains NOT REQUIRED.

## HUMAN REVIEW SUMMARY

Fresh V3.6 assets reviewed: 24
PASS: 19
NEEDS_REGEN: 5

Regen targets only:

1. video007 / shot01 — TEXT_POLLUTION
2. video007 / shot05 — PEOPLE_CONTRACT
3. video013 / shot02 — TEXT_POLLUTION
4. video028 / shot04 — TEXT_POLLUTION
5. video028 / shot06 — STYLE/CLEANLINESS

Use the exact QA decisions from:
`V3_6_HUMAN_VISUAL_QA_DECISIONS.json`

First execute the exact human QA records. A ready command script is supplied:
`v36-record-human-qa.sh`

After recording, expected suite state:

- video001 = PASS
- video005 = PASS
- video007 = NEEDS_REGEN
- video013 = NEEDS_REGEN
- video028 = NEEDS_REGEN
- overall V3.6 = NEEDS_REGEN

## SELECTIVE REGEN REQUIREMENT

Add or use a narrowly scoped selective regeneration path.

Preferred CLI:

```bash
node scripts/run-v36-generalization.mjs --regen-shot --video <videoKey> --shot <1..6>
```

Guards:
- shot must currently be `NEEDS_REGEN`;
- only `@cf/black-forest-labs/flux-1-schnell`;
- preserve the old failed asset in an archive folder before replacing it;
- HTTP 429 => PAUSED_QUOTA and STOP;
- no account rotation;
- no model switch;
- regenerated asset gets `PENDING_VISUAL_QA`, NEVER automatic PASS;
- do not change other shots.

After each successful regen:
- copy new asset into the existing shot asset path;
- copy to public scratch path;
- set that shot back to `PENDING_VISUAL_QA`;
- clear previous visual QA result but retain failure history / reason;
- rebuild that video's contact sheet;
- update visual-review.json / qa-report.json / summary files;
- do NOT rerender pilot MP4 yet. Human review comes first.

## PROMPT PATCHES

### video007 / shot01
Original intent:
Looking at boutique shop window.

Tighten with:

```text
Clean 2D editorial illustration.
Exactly one visible adult standing outside a warm boutique display window.
Display only plain ceramics and decorative objects.
ABSOLUTELY NO writing, labels, price tags, pseudo-text, glyphs, letters, logos, signatures, or watermark-like marks anywhere on objects or shelves.
All jars, cards, containers, and packaging must be completely blank.
Warm ivory / cream palette, muted sage, warm wood, clean linework.
```

### video007 / shot05
Original intent:
Ceramic dish & brass bookmark on desk.
Contract: 0 visible people.

Tighten with:

```text
Clean 2D editorial still life ONLY.
No people.
No human hands.
No arms.
No fingers.
No body parts.
Only a small handcrafted ceramic dish and an elegant brass bookmark resting on a polished wooden desk.
Warm ivory ambient light.
No text, no labels, no signatures, no watermark, no logo.
```

### video013 / shot02
Original intent:
Explaining complex plans at desk.
Contract: 1 visible adult.

Tighten with:

```text
Clean 2D editorial illustration of exactly one adult at a wooden study desk, calmly explaining or thinking through plans.
Background must be visually simple.
If papers, boards, posters, calendars, notebooks, or wall notes appear, they MUST be completely blank or use only non-writing geometric color blocks.
No letters.
No numbers.
No charts containing glyphs.
No pseudo-text.
No writing-like marks.
No signature.
No watermark.
```

### video028 / shot04
Original intent:
Composed glance at laptop screen.
Contract: 1 visible adult.

Tighten with:

```text
Clean 2D editorial illustration of exactly one adult seated at a tidy wooden workstation with a plain laptop.
Laptop exterior must be completely blank.
No brand logo.
No writing on laptop edges.
No labels.
No pseudo-text.
No signature.
No watermark-like mark.
Keep the entire lower-right corner visually clean.
Warm ivory, muted sage, warm wood.
```

### video028 / shot06
Original intent:
Leaning back in chair with closed/slightly closed laptop.
Contract: 1 visible adult.

Tighten with:

```text
Clean 2D editorial illustration of exactly one adult relaxing back in an office chair with a plain laptop.
Full-frame illustration with artwork extending naturally to every edge.
NO black bars.
NO letterboxing.
NO cinematic bars.
NO embedded frame.
NO border artifact.
Laptop must be plain with no logo.
No text.
No signature.
No watermark.
```

## MACHINE INTEGRITY

For regenerated files, machine checks may validate:
- file exists;
- valid JPEG;
- decodes;
- sufficient dimensions / non-corrupt buffer.

Machine checks MUST NOT set:
STYLE / PEOPLE / SEMANTIC / ANATOMY / TEXT to PASS.

## OUTPUTS

After all five regenerations (or until quota pause), produce:

```text
scratch/v36/generalization/video007/contact-sheet.jpg
scratch/v36/generalization/video013/contact-sheet.jpg
scratch/v36/generalization/video028/contact-sheet.jpg
```

Also provide direct paths to the five new image assets.

## EXPECTED FINAL STATE BEFORE HUMAN REVIEW

If all five image calls succeed:

```text
video001 = PASS
video005 = PASS
video007 = PENDING_VISUAL_QA
video013 = PENDING_VISUAL_QA
video028 = PENDING_VISUAL_QA

5 regenerated shots = PENDING_VISUAL_QA
all other reviewed shots remain PASS
overall V3.6 = PENDING_VISUAL_QA
```

If quota hits:

```text
V3.6 SELECTIVE REGEN — PAUSED_QUOTA
```

Otherwise:

```text
V3.6 SELECTIVE REGEN — READY_FOR_HUMAN_REVIEW
```

Then STOP.

Do not mark the five new images PASS.
Do not start Production Lock.
Do not rerender final pilot videos yet.
