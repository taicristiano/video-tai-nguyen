# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — REFERENCE RESTORATION 1.1
# PERCEIVED MOTION PATCH ONLY
# VIDEO001 ONLY
# NO IMAGE GENERATION
# NO SHOT-PLAN REWRITE
# NO FRAMING REWRITE

## CONTEXT

The Reference Restoration pass made two important improvements that must be preserved:

1. Framing is now balanced and centered.
2. Editorial cut cadence is now close to the high-performing references:
   - 17 beats / ~48s
   - ~19.97 visual changes/min
   - median hold ~2.7s
   - no repeated >4s near-static shot by shot-plan duration.

However, direct inspection of the ACTUAL rendered MP4 shows the video still feels too static inside many holds.

The previous report claimed:
- `Perceptible Camera Motion: 17 / 17 beats`
- `Living grain + dust motes + light drift`

But output-based inspection does NOT support that claim consistently.

Do NOT reopen composition, image-model, identity, typography, brand or shot-plan research.

This task fixes ONLY perceived within-shot motion and atmosphere.

---

# 1. AUTHORITATIVE INPUT

Use the current restored video and implementation:

```text
scratch/reference-restoration/video001/video001-reference-restored.mp4
```

Keep current 17-beat shot plan exactly unless a technical bug prevents motion from applying.

Do NOT generate new images.

---

# 2. OUTPUT-BASED PROBLEM EVIDENCE

Human/output inspection found several intervals whose artwork or full frame is effectively static:

```text
~5.0s–7.0s
~19.2s–21.8s
~23s–24s
~26.0s–29.0s
~43s–45s
```

Representative examples:
- rice-serving adult;
- mother/child arriving home;
- reflective adult holding bowl;
- question scene.

A diagnostic frame-difference pass also shows materially less continuous movement than the 38.8s high-performing reference.

Treat frame-difference statistics only as a diagnostic signal, NOT as a visual target to game.

---

# 3. DO NOT CHANGE WHAT IS ALREADY GOOD

LOCK:

```text
17-beat restored shot plan
centered outer artwork window
editorial-left/right as INTERNAL crop bias only
hard cuts
current approved assets
current subtitles
current title
watermark
SFX / voice
OutroCard
```

Do NOT regenerate any visual.
Do NOT add new cuts.
Do NOT increase cut frequency.
Do NOT change frame count.

---

# 4. FIX WHY MOTION IS NOT REACHING OUTPUT

Audit the actual render path.

For every one of the 17 beats determine:

```text
resolved motion profile
effective start scale
effective end scale
effective x/y movement
transform origin
whether transform is actually applied to visible image
whether crop/container masks hide the movement
whether current story-role STILL path bypasses motion
```

Create:

```text
scratch/reference-restoration/video001/motion-runtime-audit.json
scratch/reference-restoration/video001/motion-runtime-audit.md
```

Do not infer motion success from config values.
Compare actual rendered start/mid/end frames.

---

# 5. PERCEIVED MOTION POLICY

The high-performing references do NOT require aggressive camera movement.

Motion must remain calm and editorial.

For normal narrative holds around 2–4s:

### Wide / Establish
Prefer:
```text
scale delta: ~1.5%–2.5%
optional y drift: <= 8px
```

### Medium / Interaction / Reflection
Prefer:
```text
scale delta: ~2%–3%
optional x drift: <= 10px
```

### Close / Emotional
Prefer:
```text
scale delta: ~2%–3.5%
very small focal drift
```

### Detail
Prefer:
```text
scale delta: ~2.5%–4%
```

These are target ranges, not mandatory exact constants.

Do NOT:
- bounce;
- spring;
- rotate;
- overshoot;
- make image visibly float;
- create seasick pans.

The motion should be visible when comparing start vs end, but easy to ignore during normal viewing.

---

# 6. REMOVE TRUE STATIC PROFILES FROM NARRATIVE HOLDS

For narrative image beats longer than ~1.5s, do not use a truly static transform.

If current profile resolves to `STILL`, replace its rendered behavior with something like:

```text
AMBIENT_STILL:
scale 1.000 -> ~1.018
very subtle deterministic focal drift
```

This keeps semantic calmness without creating a frozen frame.

Exception:
- graphic OutroCard may remain primarily static;
- even there, background atmosphere may continue.

---

# 7. ATMOSPHERE MUST ACTUALLY RENDER

Audit `AtmosphericCanvas.tsx`.

The previous report says:
```text
5 floating dust motes
paper grain
ambient illumination drift
```

But several output intervals are virtually unchanged frame-to-frame.

Verify:
- component is present for ALL narrative scenes;
- it is not hidden behind opaque layers;
- opacity is not effectively zero;
- animation is frame-driven;
- motion continues across shot holds;
- it survives Remotion rendering, not only preview.

Keep it subtle.

Target:
- paper grain can remain mostly static;
- dust/light drift should create low-level continuous life;
- do not make particles obvious.

---

# 8. MOTION PROOF — MUST USE ACTUAL RENDERED FRAMES

Create:

```text
scratch/reference-restoration/video001/motion-proof-runtime.jpg
```

For each of these intervals show START / MID / END:

```text
5.0–7.0s
19.2–21.8s
26.0–29.0s
43.0–45.0s
```

Also create:

```text
scratch/reference-restoration/video001/motion-proof-diff.md
```

For each interval state:
- visible crop/scale change;
- subject displacement in px;
- atmosphere change;
- whether a human can perceive the change in side-by-side frames.

FAIL if START/MID/END are effectively identical.

---

# 9. REFERENCE COMPARISON

Use the same high-performing raw reference set already used for restoration.

Create a concise comparison:

```text
scratch/reference-restoration/video001/reference-motion-comparison.md
```

Do NOT claim our motion is equivalent just because config constants are non-zero.

Compare:
- continuity of low-level motion;
- frequency of true static seconds;
- perceived image life between cuts.

Important:
The restored video already has approximately correct CUT CADENCE.
This pass is specifically about motion BETWEEN cuts.

---

# 10. RERENDER

Render:

```text
scratch/reference-restoration/video001/video001-reference-restored-v1.1.mp4
```

Same:
```text
1442 frames
30fps
1080x1920
```

No new assets.

---

# 11. ACCEPTANCE

PASS only if:

```text
framing remains fixed
17-beat shot plan remains intact
no new image generation
no motion regression at hard cuts
no opacity dip
no crop edge exposure
no subtitle/title/watermark collision
the known static intervals now show perceptible but restrained motion
atmosphere is actually visible at low level in rendered output
video no longer feels like a sequence of frozen cards
```

Do not use unit tests as proof of visual PASS.

Run tests, but inspect actual MP4.

---

# 12. REPORT

Return:

```text
A. ROOT CAUSE OF STATIC HOLDS
B. RUNTIME MOTION AUDIT
C. CHANGES MADE
D. START/MID/END PROOF
E. REFERENCE COMPARISON
F. REMAINING WEAKNESSES
G. TESTS
H. VERDICT
```

Final verdict exactly one:

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.1 — PASS
```

or

```text
HAY & ĐẸP. REFERENCE RESTORATION 1.1 — FAIL
```

Then STOP.

Do NOT start Production Batch 01.
