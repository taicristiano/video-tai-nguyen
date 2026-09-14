# Gen Video Common Pipeline

Read this document for the shared operational steps. Visual design and scene
implementation rules belong to the selected template document.

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `ASPECT_RATIO` | No | `9:16` | `9:16` or `16:9` |
| `THEME` | No | `dark` | `dark` or `light` |
| `SHOW_SUBTITLES` | No | `true` | Hide only when explicitly set to `false` |
| `ELEVENLABS_API_KEY` | No* | - | Primary TTS provider |
| `ELEVENLABS_VOICE_ID` | No | provider default | ElevenLabs voice |
| `GEMINI_API_KEY` | No* | - | Fallback TTS provider |
| `GEMINI_TTS_VOICE` | No | `Achird` | Gemini voice |
| `GROQ_API_KEY` | No* | - | Primary STT provider |
| `GROQ_STT_MODEL` | No | `whisper-large-v3-turbo` | Groq STT model |
| `STT_API_KEY` | No* | - | Fallback api.stt.ai Bearer token |
| `STT_LANGUAGE` | No | `vi` | STT language |

At least one TTS key is required. Provider priority is ElevenLabs, then Gemini.
At least one STT key is required. Provider priority is Groq, then api.stt.ai.

## Step 1: Setup

1. Parse and remove command flags before treating the remaining text as context:
   - `--template <template-id>`
   - `--audio=full`, `--audio=music`, `--audio=sfx`, or `--audio=voice-only`
   - reject unknown/repeated audio values instead of guessing
   - halt with the usage message if no clean context remains
2. Derive `<slug>` from the clean context:
   - lowercase
   - replace spaces with `-`
   - remove non-`[a-z0-9-]`
   - keep the first 8 tokens
   - prefix `YYYY-MM-DD`
3. Halt if `videos/<slug>/` already exists.
4. Create:

```text
videos/<slug>/script/
videos/<slug>/output/
public/<slug>/
```

5. Write only the clean context, without command flags, to
   `videos/<slug>/context.txt`.
6. Select a template:
   - explicit `--template`: validate it in `src/templates/registry.ts`
   - no flag: use `creative/free-style`
7. Write the selected ID to `videos/<slug>/template.txt`.
8. Resolve the audio policy and write it to `videos/<slug>/audio.txt`:
   - explicit `--audio=<mode>`: write `<mode>`
   - omitted flag: write `template`

`audio.txt` is the durable source of truth for Steps 6-8. The accepted contents
are `template`, `full`, `music`, `sfx`, and `voice-only`.

Templates that acquire article media may add template-specific artifacts after
this step. Follow the selected template document before starting Planner.

## Step 2: Planner

Input: `videos/<slug>/context.txt`

Output: `videos/<slug>/plan.json`

```json
{
  "title": "Vietnamese title",
  "hook": "Attention-grabbing opening",
  "segments": [
    {"title": "Segment title", "content_summary": "Segment purpose"}
  ],
  "ending": "Closing idea",
  "estimated_duration": 60
}
```

Rules:

- Vietnamese, informative, and neutral unless context requires another tone.
- Target 45-100 seconds.
- Use 3-6 body segments, excluding hook and ending.
- The hook must create immediate curiosity.

## Step 3: Teller

Input: `videos/<slug>/plan.json`

Output: `videos/<slug>/script/script.json`

```json
{
  "script": [
    {"text": "Narration", "type": "hook"},
    {"text": "Narration", "type": "body"},
    {"text": "Narration", "type": "ending"}
  ]
}
```

Rules:

- `type` is `hook`, `body`, or `ending`.
- Every text entry is non-empty Vietnamese.
- Total spoken duration should remain 45-100 seconds.

## Step 4: Audio

If `public/<slug>/voice.mp3` exists, reuse it. Otherwise run:

```bash
node scripts/tts.mjs "videos/<slug>/script/script.json" "<slug>"
```

The script automatically selects the first configured provider. A template voice
from `src/templates/registry.ts` overrides the generic environment voice.

Verify `public/<slug>/voice.mp3` exists.

### Audio Reuse Guard

`voice.mp3` is an expensive generated artifact and is the source of truth once it
exists. Never regenerate voiceover merely because the duration is longer or
shorter than the target range. If the generated narration duration is outside the
45-100 second target, continue with the existing audio and adapt Step 6 timing,
scene count, pacing, and final render duration to `timeline.json`.

Only overwrite `voice.mp3` when the user explicitly asks to regenerate the
voiceover, for example after changing the voice, script, or provider. In that
case run:

```bash
node scripts/tts.mjs "videos/<slug>/script/script.json" "<slug>" --force
```

Do not call `--force` as an automatic fix for video length.

## Step 5: Transcribe

Run:

```bash
node scripts/transcribe.mjs "<slug>"
```

The script uses Groq first when `GROQ_API_KEY` is set, then falls back to
api.stt.ai when `STT_API_KEY` is set.

Output: `public/<slug>/timeline.json`

```json
{
  "duration": 68.4,
  "segments": [
    {"start": 0, "end": 2.4, "text": "Exact transcript segment"}
  ],
  "words": [
    {"word": "Exact", "start": 0, "end": 0.3}
  ]
}
```

- `segments` drive scene timing.
- `words` drive word-level subtitles.
- Verify the file exists before continuing.

## Shared Timing Contract

Use `timeline.json` as the only timing source.

1. Map script entries to transcript segments sequentially.
2. If transcript segments outnumber script entries, group consecutive segments.
3. If script entries outnumber transcript segments, split the longest suitable
   segment.
4. Set the first scene's `startFrame` to `0`. Set later scene boundaries from
   the start of their mapped transcript groups:

```text
firstScene.startFrame = 0
laterScene.startFrame = Math.round(groupStartSeconds * 30)
```

5. Calculate:

```text
totalFrames = Math.ceil(timeline.duration * 30) + 60
```

6. Derive sequence durations from scene boundaries:

```text
nonFinalDuration = nextScene.startFrame - currentScene.startFrame
finalDuration    = totalFrames - finalScene.startFrame
```

7. Preserve the transcript group's actual `start`, `end`, and `text` in the
   scene's `audioSegment`.
8. Ensure scene boundaries are strictly increasing. Merge or adjust a boundary
   if rounding produces a zero-length scene.
9. Scene durations used by the composition must sum exactly to `totalFrames`.
10. Do not add overlap buffers directly to scene durations. If transitions overlap
   sequences, compensate using the selected template's transition-duration
   helper.

Do not duplicate or redefine this timing algorithm in template documents.

## Step 8: Render

Run from project root:

```bash
npx remotion render src/Root.tsx Video \
  --output "videos/<slug>/output/video.mp4" \
  --codec h264 \
  --props '{"slug":"<slug>"}'
```

Verify `videos/<slug>/output/video.mp4` exists.

## Shared Failure Rules

- Missing required input: report the missing path and halt.
- External API failure: report provider, status, and relevant response body.
- Non-zero command exit: report stderr and halt.
- Never render before TypeScript and visual verification pass.
