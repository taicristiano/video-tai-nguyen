# Gen Video Verification

Verification is a design step, not only a compile check.

## Required Checks

1. Run:

```bash
npx tsc --noEmit
```

2. Use risk-based frame sampling for creative or custom scenes:
   - Always inspect the middle frame, where the main idea should be visible.
   - Always inspect a late frame, where the final readable state should be clear.
   - Inspect an early frame only when the scene has a complex entrance, delayed
     content, or meaningful first-second behavior.
3. For fixed templates, do not generate verification stills when only
   content/spec/timing changed and the existing template components are reused.
   Rely on TypeScript, tests, timing validation, and final render verification.
   Generate representative stills only if fixed template code, layout behavior,
   media handling, subtitles, safe areas, or transitions changed.
4. Inspect frames immediately before, during, and after a transition only when
   the transition is custom, newly introduced, visually complex, or changed.
   Established template transitions covered by tests do not require repeated
   three-frame inspection at every boundary.
5. Run the repository test command when available.

The normal target is 12-18 inspected frames for a seven-scene creative video,
not an exhaustive frame set. Fixed-template generations with unchanged template
code normally require zero inspected stills. Increase sampling when a scene is
dense, uses browser/video media, has elements near safe-area boundaries, or
fails an initial inspection.

Store verification stills outside the repository, such as an OS temporary
directory. Do not add generated verification frames to the project.

## Inspect For

- Core idea and dominant visual are clear.
- Text is readable and not too dense.
- Animation timing follows narration.
- Early frames are not accidentally empty.
- Late frames provide enough reading time.
- No overflow, clipping, or unintended overlap.
- Meaningful content avoids watermark and subtitle safe areas.
- Contrast remains readable over animated backgrounds.
- Scene compositions are not mechanically repeated.
- Final duration matches the audio-derived `totalFrames`.
- Verify that `audio.txt` exists and matches the rendered layers:
  - `full`: music and transition SFX are audible;
  - `music`: music is present and transition SFX are absent;
  - `sfx`: `video.bgMusic` is `null` and transition SFX are present;
  - `voice-only`: `video.bgMusic` is `null` and generated transition SFX are absent;
  - `template`: the selected template's default audio contract is preserved.

## Weak Scene Signals

Redesign a scene when:

- It is mostly static text without intentional typography.
- Decorative elements do not communicate or support composition.
- Everything appears simultaneously without a reason.
- Motion continues mechanically and distracts from reading.
- Empty space appears accidental.
- The scene only changes copy while reusing another scene's full layout.

## Production Lock & Human QA Gates

For locked production templates (e.g. `human-insight/cinematic-light`):

1. **Preflight Lock Check**:
   `node scripts/validate-production-lock.mjs` must exit with code 0 before starting.
2. **Audio Pacing & Duration Contract Pre-Check**:
   - Planned total duration (`voice + outro`) must be within 70–85s (preferred 75–80s, target midpoint 77.5s).
   - If out of range, narration pacing is calibrated via pitch-preserving `ffmpeg atempo` without mutating canonical voice text.
   - Durations that cannot be brought within [70, 85]s halt immediately with `BLOCKED` (`AUDIO_DURATION_OUT_OF_RANGE`).
3. **Image QA Review Gate (`PENDING_HUMAN_IMAGE_QA`)**:
   - Verify candidate image count equals required shot count.
   - Independent shot semantics: `crossShotConsistencyRequired = false`. Different faces between shots alone MUST NOT fail QA; verify people count, role semantics, style, anatomy, and zero text pollution.
   - **No AI Auto-Pass**: Automated/heuristic checks CANNOT author `PASS_HUMAN_QA`. The pipeline must execute a MANDATORY STOP at `PENDING_HUMAN_IMAGE_QA`.
   - Approval must come from an external human (`reviewSource: 'EXTERNAL_HUMAN'`) recorded via:
     `node scripts/record-human-review.mjs --slug=<slug> --action=image-pass-all`
     before asset promotion to `approved/` and materialization to `public/<slug>/`.
4. **Transition & Boundary Invariant**:
   - Inspect boundary frames (frame 0, scene start, scene end) to ensure zero
     unintended blank or 0-opacity canvas dips between scenes.
5. **Video QA Review Gate (`PENDING_HUMAN_VIDEO_QA`)**:
   - Probed `video.mp4` duration must be within [70, 85] seconds. Any render outside this range triggers `RENDER_DURATION_OUT_OF_RANGE` and blocks QA.
   - Play back rendered `videos/<slug>/video.mp4`.
   - Verify narration and card typography alignment.
   - **No AI Auto-Pass**: Automated checks CANNOT author `PASS_HUMAN_VIDEO_QA`. The pipeline must execute a MANDATORY STOP at `PENDING_HUMAN_VIDEO_QA`.
   - Explicit human approval must be recorded via:
     `node scripts/record-human-review.mjs --slug=<slug> --action=video-pass`
   - Video approval is SHA-256 hash-bound to `video.mp4` and automatically invalidated upon re-render. Approval is required before clean packaging and marking `COMPLETE`.

## Final Render Gate

Do not render the final video until:

- TypeScript passes (`npx tsc --noEmit`).
- Preflight production lock check passes (if template has a lock).
- Image QA gate is approved (if template requires human QA).
- Required stills were inspected, when still inspection is required.
- Weak scenes and collisions were fixed.
- Scene durations sum exactly to `totalFrames`.
- Audio, watermark, and subtitles are present as required by the template.
- An explicit audio mode overrides conflicting template-default music/SFX rules.
