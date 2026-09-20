# GEMINI 3.8 FLASH HIGH
# HAY & ĐẸP. — V3.4A SCENE-LEVEL CLEAN PILOT PATCH
# OFFLINE ONLY — FINAL SMALL FIX

## CONTEXT

The current harness now correctly:
- uses only `@cf/black-forest-labs/flux-1-schnell`;
- targets clean 2D cartoon / illustration;
- does not require identity consistency;
- protects latest pending QA attempt integrity;
- keeps HTTP 429 as `PAUSED_QUOTA`.

One final mismatch remains in the comparison pilot.

The six clean assets are SCENE-LEVEL assets:
```text
shot-01 ... shot-06
```

But current `generatePilotRootCode()` still passes `scene.visualBeats`, replacing only `vbIdx === 0` and leaving later visual beats on their OLD source images.

That means the supposed clean-asset comparison pilot can still show broken old images.

We do NOT want to generate more visual-beat assets.
We do NOT want to expand the pilot scope.
We do NOT want more image research.

## REQUIRED FIX

For THIS isolated comparison pilot only:

1. Keep one clean asset for the full duration of each of the six scenes.
2. Explicitly disable internal visual-beat image swapping:
```tsx
visualBeats={undefined}
```
or omit the prop entirely.
3. Preserve:
   - scene timing;
   - V3.4A motion profile;
   - composition;
   - shotScale;
   - container;
   - title/subtitle;
   - SectionCard / InsightCard;
   - hard cuts;
   - audio/SFX.
4. Update the generated root comment to say clearly:
```text
scene-level clean-asset comparison pilot
internal visual-beat image swapping intentionally disabled
```
5. Do NOT claim this is the exact production visual-beat render.
6. Add/update one offline test asserting generated `PilotRoot.tsx` does NOT pass active `visualBeats` into `ImageScene`.

## STATE

Do not call Cloudflare.
Do not generate images.
Do not change current state:

```text
runStatus = PAUSED_QUOTA
all 6 shots = NEEDS_GENERATION
nextAttempt = 1
attempts = 0
```

## VERDICT

Return exactly:

```text
V3.4A SCENE-LEVEL CLEAN PILOT PATCH — PASS
```

or FAIL.

Then STOP.
