# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A CLEAN ASSET PILOT EXECUTION
# USE EXISTING HARDENED HARNESS
# MODEL: @cf/black-forest-labs/flux-1-schnell ONLY

## GOAL

Generate exactly the six clean scene-level assets for the V3.4A comparison pilot, validate them one-by-one, then finalize the short comparison pilot.

Do NOT change the harness.
Do NOT tune prompts.
Do NOT change model.
Do NOT add identity consistency.
Do NOT modify production manifests.

Current image policy:

```text
Clean 2D illustrated / cartoon style.
Not photorealistic.
Character identity consistency between images is NOT required.
Each individual image must be clean and usable.
```

## PRECHECK

Run:

```bash
node scripts/generate-v34-clean-asset-pilot.mjs --status
```

Expected initial state:

```text
6 shots NEEDS_GENERATION
nextAttempt = 1
attempts = 0
```

`runStatus` may still say `PAUSED_QUOTA`; that is okay. The first real generation call determines whether quota is available again.

## EXECUTION LOOP

Process shots strictly in order:

```text
0 → 1 → 2 → 3 → 4 → 5
```

For each shot:

1. Run exactly one generation:
```bash
node scripts/generate-v34-clean-asset-pilot.mjs --generate --shot <index>
```

2. If HTTP 429 / quota:
```text
STOP immediately
V3.4A CLEAN ASSET PILOT — PAUSED_QUOTA
```

Do not rotate accounts.
Do not switch model.
Do not count quota failure as a visual attempt.

3. Inspect the generated candidate visually.

Evaluate exactly five dimensions:

```text
STYLE
PEOPLE_CONTRACT
SEMANTIC_FIDELITY
ANATOMY
TEXT_POLLUTION
```

### STYLE
PASS when clearly clean 2D cartoon / illustrated / hand-drawn.
FAIL obvious photoreal, 3D, anime/chibi, unusable corporate vector.

### PEOPLE_CONTRACT
PASS only when requested visible people count is respected.

### SEMANTIC_FIDELITY
PASS when the main action/object matches the shot intent.
Do not accept a generic lifestyle image when the action contradicts narration.

### ANATOMY
FAIL clear detached/duplicated/missing limbs, floating head, severe hand/body connection error, impossible body structure.
Minor finger imperfections may pass if not visually distracting.

### TEXT_POLLUTION
FAIL any visible pseudo-writing, fake signature, watermark-like mark, random glyph/word/account handle.

4. Record QA only for the latest pending attempt.

If all five PASS:
```text
SELECTED
```

If any dimension FAIL:
- record FAIL;
- generate the next attempt for that same shot;
- maximum 3 real generated attempts.

If Attempt 3 fails:
```text
STOP immediately
V3.4A CLEAN ASSET PILOT — BLOCKED_ASSET
```

Do not create Attempt 4.

## NO IDENTITY CONSISTENCY

Do NOT fail because:
- father looks different between scenes;
- mother looks different between scenes;
- child looks different between scenes.

Cross-shot character identity is irrelevant.

## FINALIZE

Only when all 6 shots are SELECTED:

```bash
node scripts/generate-v34-clean-asset-pilot.mjs --finalize
```

Expected outputs:

```text
scratch/v34/clean-asset-pilot/assets/shot-01.jpg ... shot-06.jpg
scratch/v34/clean-asset-pilot/pilot-assets.json
scratch/v34/clean-asset-pilot/contact-sheet-clean-assets.jpg
scratch/v34/clean-asset-pilot/video001-motion-clean-assets.mp4
```

This is a:

```text
scene-level clean-asset comparison pilot
```

Internal visual-beat image swapping is intentionally disabled for this comparison artifact.

Do NOT claim it is the exact production visual-beat render.

## REQUIRED REPORT

Return:

### A. Initial Status
### B. Attempt Table

```text
shot
attempt
style
people
semantic
anatomy
text
overall
reason
```

### C. Selected Assets

### D. Final State

### E. Contact Sheet Path

### F. Pilot MP4 Path

### G. Decision

Exactly one:

```text
V3.4A CLEAN ASSET PILOT — PASS
```

or:

```text
V3.4A CLEAN ASSET PILOT — PAUSED_QUOTA
```

or:

```text
V3.4A CLEAN ASSET PILOT — BLOCKED_ASSET
```

Then STOP.

Do not start V3.4B automatically.
Wait for human review.
