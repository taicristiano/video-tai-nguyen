# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A
# MOTION GRAMMAR BASELINE ONLY
# NO IMAGE GENERATION

## CONTEXT

V3.3 image-generation research is now FROZEN.

Important production constraint:

```text
Image model: @cf/black-forest-labs/flux-1-schnell ONLY
```

Do NOT introduce FLUX.2 Dev or any other image model.

Known V3.3 outcome:
- Style-first editorial 2D is stable enough.
- Semantic simplification works.
- Schnell has known stochastic limitations in text pollution, people count, anatomy and identity continuity.
- We accept these as known constraints for now.
- Do NOT continue prompt tuning, canonical-image experiments, model routing, retry architecture research, or image QA research in this task.

We are moving on.

Current roadmap:

```text
V3.3   Character + Style + World Identity     FROZEN
V3.4   Motion & Depth                         CURRENT
V3.5   Typography / Atmosphere / Brand polish
V3.6   Generalization 5-video test
Production Lock
```

This task has ONE GOAL ONLY:

> Define and implement a deterministic, calm motion grammar for still-image narrative shots in the `human-insight/cinematic-light` template, using existing assets only.

Do NOT regenerate images.
Do NOT render a whole content batch.

---

# 1. HARD SCOPE LOCK

You may inspect and modify only files directly responsible for image-shot motion in the current Remotion narrative template.

Likely candidates include:
- `ImageScene.tsx`
- `VideoContent.tsx`
- motion helper/config files directly used by them

Do NOT modify:
- story planner;
- subtitle alignment;
- SFX;
- image generation scripts;
- cast/world registry;
- capability router;
- fulfillment planner;
- Cloudflare code;
- production content scripts.

No image generation.
No Cloudflare calls.

---

# 2. VISUAL REFERENCE GRAMMAR

HAY & ĐẸP. reference-derived grammar:

```text
calm premium editorial
mostly hard cuts
no obvious slideshow feel
no constant zoom pumping
no dramatic camera moves
no fast whip/pan
no random motion per shot
headline remains visually stable
artwork lives in central visual zone
text has protected negative space
```

Motion must support the narration, not call attention to itself.

---

# 3. MOTION PROFILES

Introduce exactly these reusable motion profiles:

```text
STILL
PUSH_IN_SOFT
PULL_OUT_SOFT
DRIFT_LEFT
DRIFT_RIGHT
DETAIL_PUSH
```

No more profiles in this task.

Suggested ranges:

```text
STILL
scale: 1.00 → 1.00
translate: 0 → 0

PUSH_IN_SOFT
scale: 1.00 → 1.035

PULL_OUT_SOFT
scale: 1.035 → 1.00

DRIFT_LEFT
scale: 1.02 → 1.03
translateX: +1.2% → -1.2%

DRIFT_RIGHT
scale: 1.02 → 1.03
translateX: -1.2% → +1.2%

DETAIL_PUSH
scale: 1.015 → 1.05
```

Use smooth interpolation.
No spring bounce.
No overshoot.
No rotation.

These are target ranges, not permission to exceed them.

---

# 4. STORY-ROLE MAPPING

Motion assignment must be deterministic by story role.

Use this baseline:

```text
establish       → PULL_OUT_SOFT
reflection      → PUSH_IN_SOFT
interaction     → STILL or PUSH_IN_SOFT
detail-action   → DETAIL_PUSH
action          → DRIFT_LEFT or DRIFT_RIGHT
context         → STILL
memory          → PUSH_IN_SOFT
release         → PULL_OUT_SOFT
question        → STILL
```

If the shot is a reused canonical / repeated image:
prefer a different subtle crop direction only if it does NOT create a jumpy sequence.

No random selection.

For left/right drift:
alternate deterministically by beat index:

```text
even beat index → DRIFT_LEFT
odd beat index  → DRIFT_RIGHT
```

---

# 5. HARD-CUT POLICY

Narrative image transitions remain:

```text
HARD CUT
```

Default:

```text
fadeInFrames = 0
fadeOutFrames = 0
```

Do NOT reintroduce crossfades.

Do NOT reintroduce the old opacity bug.

Motion is internal to each shot, not a transition effect.

---

# 6. MOTION DURATION

Motion should span the full shot duration.

Important:
- no motion reset inside a shot;
- no pause halfway;
- no enter/exit zoom bursts;
- no speed ramp.

Use normalized shot progress:

```text
0.0 → 1.0
```

and interpolate over the shot duration.

---

# 7. SAFE CROP / TEXT ZONE

Do not allow motion to expose empty canvas edges.

Implement conservative overscan so translation remains inside the image.

Requirements:
- no black/blank edge reveal;
- no artwork crossing into persistent title/subtitle safe zones more than current static layout;
- no vertical translation in this task;
- translation only X axis for drift profiles.

If current container uses `object-fit: cover`, keep it.

---

# 8. HEADLINE / SUBTITLE STABILITY

Persistent headline and subtitles must NOT inherit image motion.

Image motion applies only to the artwork/image layer.

Text layers remain pixel-stable.

No parallax on text.

---

# 9. VIDEO 001 MOTION PLAN

Generate an offline motion-plan report for current Video 001:

```text
beatId
storyRole
motionProfile
startScale
endScale
startX
endX
durationFrames
```

Save:

```text
scratch/v34/motion-baseline/video001-motion-plan.json
video001-motion-plan.md
```

Do not generate new images.

---

# 10. REQUIRED VISUAL PILOT

Render only a short motion pilot using EXISTING assets from Video 001.

Target:
- 6 representative consecutive beats;
- include at least:
  - one reflection;
  - one interaction;
  - one detail-action;
  - one context/release if available.

Create:

```text
scratch/v34/motion-baseline/video001-motion-pilot.mp4
```

Duration:
approximately 20–30 seconds.

Do not render the whole video.

---

# 11. QA CHECKLIST

PASS only if:

1. no blank edge exposure;
2. no crossfade;
3. no opacity dip at cuts;
4. no motion profile exceeds defined ranges;
5. no spring/bounce;
6. no rotation;
7. title/subtitle remain stable;
8. motion feels calm, not slideshow-like;
9. repeated adjacent shots do not create obvious directional whiplash;
10. all motion assignment is deterministic.

---

# 12. TESTS

Add focused tests for:

- deterministic storyRole → motionProfile mapping;
- beat-index drift alternation;
- max scale bounds;
- max translate bounds;
- `STILL` exactly 1.0 / 0;
- no fade default regression;
- no random usage in motion assignment.

Do not add broad unrelated tests.

---

# 13. REQUIRED REPORT

Return:

## A. Scope Confirmation

## B. Files Changed

## C. Motion Profiles

## D. Story-Role Mapping

## E. Hard-Cut Regression Check

## F. Video 001 Motion Plan Summary

## G. Pilot Render Path

## H. QA Result

## I. Verdict

Exactly one:

```text
V3.4A MOTION GRAMMAR BASELINE — PASS
```

or:

```text
V3.4A MOTION GRAMMAR BASELINE — FAIL
```

Then STOP.

Do not start V3.4B automatically.
Wait for human review.
