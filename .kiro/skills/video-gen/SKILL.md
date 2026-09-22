---
name: video-gen
description: Generate short-form videos with Remotion + AI voiceover from text context. Trigger on /gen-video or /setup commands.
metadata:
  tags: remotion, video, react, animation, vietnamese, tts, stt, audio
---

# /gen-video [--template <id>] [--audio=<mode>] [--resume=<slug>] <context> — Video Generation Pipeline

Read `docs/SKILL-GEN-VIDEO.md`. For gated templates (e.g. `human-insight/cinematic-light`),
follow the orchestrator-owned resumable lifecycle and Human QA gates:
- AI agents MUST NOT auto-pass Human Image QA or Human Video QA.
- Mandatory STOP at `PENDING_HUMAN_IMAGE_QA` and `PENDING_HUMAN_VIDEO_QA`.
- Approval requires external human action via `node scripts/record-human-review.mjs` (`reviewSource: 'EXTERNAL_HUMAN'`).
- Video approvals are SHA-256 hash-bound to `video.mp4` and invalidated upon re-render.
- Enforce the 70–85s duration contract (preferred 75–80s, target midpoint 77.5s) with immutable canonical voice text.

For standard templates, execute the 8-step pipeline.

Follow its progressive-loading instructions. Do not load every template or
Remotion rule; read only the selected template document and relevant rules.
