# Agent Instructions

This project provides eleven commands that any AI coding agent can execute.
All workflow documentation lives in `docs/` — read it before executing any command.

---

## Commands

### `/setup`
Automatically installs all dependencies and configures the environment.
Full instructions: [docs/SKILL-SETUP.md](docs/SKILL-SETUP.md)

### `/gen-video [--template <template-id>] [--audio=<mode>] [--resume=<slug>] <context>`
Generates a short-form video from text context using Remotion + AI voiceover.
`<mode>` is `full`, `music`, `sfx`, or `voice-only`. `--resume=<slug>` resumes
a paused Human-QA workflow. When omitted, each template keeps its existing
audio behavior.
Full instructions: [docs/SKILL-GEN-VIDEO.md](docs/SKILL-GEN-VIDEO.md)

### `/templates`
Lists every registered template as a two-column table containing a ready-to-use
command and a short Vietnamese description.
Full instructions: [docs/SKILL-TEMPLATES.md](docs/SKILL-TEMPLATES.md)

### `/update-bg-music --template <template-id-or-name> --music <music-file-or-path>`
Updates one template's configured default background music in
`src/templates/registry.ts`. It searches the selected template's asset manifest
first, then all other asset manifests.
Full instructions: [docs/SKILL-UPDATE-BG-MUSIC.md](docs/SKILL-UPDATE-BG-MUSIC.md)

### `/update-template-voice --template <template-id-or-name> [--gemini <voice-name>] [--elevenlabs <voice-id>]`
Updates one template's configured Gemini and/or ElevenLabs TTS voice in
`src/templates/registry.ts`. At least one provider flag is required; both may be
used in the same command.
Full instructions: [docs/SKILL-UPDATE-TEMPLATE-VOICE.md](docs/SKILL-UPDATE-TEMPLATE-VOICE.md)

### `/add-music --category <name> [--file <filename-or-path>]`
Adds one `.mp3` file from `tmp-music/` to `public/assets/<name>/music/` and
registers it in that category's `manifest.json`. It does not update any
template default.
Full instructions: [docs/SKILL-ADD-MUSIC.md](docs/SKILL-ADD-MUSIC.md)

### `/sync-templates [--package <package-folder>]`
Syncs purchased template packages from `load-templates/` into docs, source,
assets, registry, env config, and npm dependencies. Already-synced packages are
skipped by package ID and version.
Full instructions: [docs/SKILL-SYNC-TEMPLATES.md](docs/SKILL-SYNC-TEMPLATES.md)

### `/update-logo [--file <filename-or-path>]`
Replaces the shared watermark logo at `public/watermark.png` using a `.png`
file from `tmp-logo/`. Full instructions:
[docs/SKILL-UPDATE-LOGO.md](docs/SKILL-UPDATE-LOGO.md)

### `/update-config --key <ENV_KEY> --value <value>`
Updates one key in the project `.env` file without printing secret values. Full
instructions: [docs/SKILL-UPDATE-CONFIG.md](docs/SKILL-UPDATE-CONFIG.md)

### `/update-version`
Reads `update-version/update-version.md`, applies its instructions once, then
marks the file `status: updated`. If already updated, it stops without running.
Full instructions: [docs/SKILL-UPDATE-VERSION.md](docs/SKILL-UPDATE-VERSION.md)

### `/ai-help`
Lists every supported slash command with usage and a short Vietnamese
description. Full instructions: [docs/SKILL-AI-HELP.md](docs/SKILL-AI-HELP.md)

---

## Agent-Specific Entry Points

| Agent | How to load instructions |
|---|---|
| **Kiro** | Auto-loaded from `.kiro/skills/<command>/SKILL.md` → redirects to `docs/` |
| **Cursor** | Auto-loaded from the matching `.cursor/rules/*.mdc` → redirects to `docs/` |
| **Claude Code** | Auto-loaded from the matching `.claude/commands/*.md` → redirects to `docs/` |
| **Gemini (Antigravity)** | Read the matching `docs/SKILL-*.md` directly |
| **Codex (OpenAI)** | Read the matching `docs/SKILL-*.md` directly |

All agents use the canonical sources in `docs/`.

---

## For Gemini and Codex

When the user types `/setup`:
→ Read `docs/SKILL-SETUP.md` and execute every step in order, including its
approval-aware Execution Contract. Treat approvals as pauses inside the same
run, resume automatically after approval, and persist until setup is verified
or a genuine external blocker is reached.

When the user types `/gen-video [--template <template-id>] [--audio=<mode>] [--resume=<slug>] <context>`:
→ Read `docs/SKILL-GEN-VIDEO.md`. For templates with Human QA gates (such as
  `human-insight/cinematic-light`), execute the orchestrator-owned gated lifecycle:
  - Enforce 70–85s duration contract via pitch-preserving audio pacing calibration without rewriting canonical voice.
  - Candidate image generation → MANDATORY STOP at `PENDING_HUMAN_IMAGE_QA`. AI auto-pass is strictly forbidden; human approval must be recorded via `record-human-review.mjs` (`reviewSource: 'EXTERNAL_HUMAN'`).
  - Selective retry on FAIL (max 3 attempts).
  - Promotion, spec derivation, Remotion render → MANDATORY STOP at `PENDING_HUMAN_VIDEO_QA`. AI auto-pass is strictly forbidden; human video approval is hash-bound to `video.mp4`.
  - Package clean distribution on resume after Video QA approval → `COMPLETE`.
  For standard templates, execute the 8-step pipeline:
  Setup → Planner → Teller → Audio → Transcribe → Spec → Coder → Render

When the user types `/templates`:
→ Read `docs/SKILL-TEMPLATES.md`, then list every entry from
  `src/templates/registry.ts` in the required two-column table.

When the user types `/update-bg-music --template <template-id-or-name> --music <music-file-or-path>`:
→ Read `docs/SKILL-UPDATE-BG-MUSIC.md`, then run the update script exactly as
  documented.

When the user types `/update-template-voice --template <template-id-or-name> [--gemini <voice-name>] [--elevenlabs <voice-id>]`:
→ Read `docs/SKILL-UPDATE-TEMPLATE-VOICE.md`, then run the update script
  exactly as documented.

When the user types `/add-music --category <name> [--file <filename-or-path>]`:
→ Read `docs/SKILL-ADD-MUSIC.md`, then run the add script exactly as
documented.

When the user types `/sync-templates [--package <package-folder>]`:
→ Read `docs/SKILL-SYNC-TEMPLATES.md`, then run the sync script exactly as
documented. Do not run `/gen-video` automatically after syncing.

When the user types `/update-logo [--file <filename-or-path>]`:
→ Read `docs/SKILL-UPDATE-LOGO.md`, then run the update script exactly as
documented.

When the user types `/update-config --key <ENV_KEY> --value <value>`:
→ Read `docs/SKILL-UPDATE-CONFIG.md`, then run the update script exactly as
  documented. Do not print secret values back to the user.

When the user types `/update-version`:
→ Read `docs/SKILL-UPDATE-VERSION.md`, then check
  `update-version/update-version.md`. If it is already marked updated, stop.
  Otherwise apply its instructions and mark it updated only after completion.

When the user types `/ai-help`:
→ Read `docs/SKILL-AI-HELP.md`, then list every supported command. Do not run
  any workflow or mutation command.

Follow the progressive-loading instructions in `docs/SKILL-GEN-VIDEO.md`. For
the Coder step, read `docs/remotion-best-practices/SKILL.md`, then only the
individual rule files required by the selected design.

The canonical docs in `docs/` are the single source of truth.

---

## Pipeline Overview

```
/gen-video [--audio=<mode>] <context>
  For human-insight/cinematic-light (gated orchestrator):
    Start:  Parser → Plan → Audio (TTS & Duration Check) → Transcribe → Candidate Gen → PENDING_HUMAN_IMAGE_QA (MANDATORY STOP)
    Resume (Image QA FAIL): Selective Retry (max 3 attempts) → PENDING_HUMAN_IMAGE_QA (MANDATORY STOP)
    Resume (Image QA PASS - External Human): Promote → Materialize → Spec → Render → PENDING_HUMAN_VIDEO_QA (MANDATORY STOP)
    Resume (Video QA PASS - External Human): Package Production → COMPLETE

  For standard templates:
    Step 1: Setup        → videos/<slug>/context.txt, audio.txt, directories
    Step 2: Planner      → videos/<slug>/plan.json
    Step 3: Teller       → videos/<slug>/script/script.json
    Step 4: Audio (TTS)  → public/<slug>/voice.mp3 (ElevenLabs primary, Gemini fallback)
    Step 5: Transcribe   → public/<slug>/timeline.json (Groq primary, api.stt.ai fallback)
    Step 6: Spec         → videos/<slug>/spec.json or production-render-spec.json
    Step 7: Coder        → data-driven production renderer or generated scenes
    Step 8: Render & QA  → videos/<slug>/video.mp4
```

---

## Project Structure

```
create-video-with-ai/
├── docs/                    ← canonical skill documents (read this first)
│   ├── SKILL-AI-HELP.md
│   ├── SKILL-ADD-MUSIC.md
│   ├── SKILL-SETUP.md
│   ├── SKILL-GEN-VIDEO.md
│   ├── SKILL-SYNC-TEMPLATES.md
│   ├── SKILL-TEMPLATES.md
│   ├── SKILL-UPDATE-BG-MUSIC.md
│   ├── SKILL-UPDATE-TEMPLATE-VOICE.md
│   ├── SKILL-UPDATE-CONFIG.md
│   ├── SKILL-UPDATE-LOGO.md
│   ├── SKILL-UPDATE-VERSION.md
│   ├── gen-video/           ← lazy-loaded common, creative, verification rules
│   ├── remotion-best-practices/
│   └── templates/           ← per-template generation rules
├── scripts/
│   ├── add-music.mjs        ← add mp3 assets to public/assets/<category>/
│   ├── sync-templates.mjs   ← sync purchased template packages from load-templates/
│   ├── update-bg-music.mjs  ← set template defaultBgMusic in registry
│   ├── update-template-voice.mjs ← set template voice config in registry
│   ├── update-config.mjs    ← update .env keys without printing secrets
│   ├── update-logo.mjs      ← replace public/watermark.png
│   ├── update-version.mjs   ← guard/mark update-version instructions
│   ├── human-insight-production-orchestrator.mjs ← canonical production lifecycle owner
│   ├── tts.mjs              ← TTS synthesis (ElevenLabs / Gemini)
│   ├── transcribe.mjs       ← STT transcription (Groq / api.stt.ai)
│   └── ...                  ← template acquisition/helper scripts
├── src/                     ← Remotion source (zero shared-source mutation; data-driven production renderer)
│   ├── Root.tsx
│   ├── Video.tsx
│   ├── VideoContent.tsx     ← includes <Audio> component
│   ├── templates/           ← registered fixed/hybrid/creative templates
│   ├── tokens.ts            ← shared interface (do NOT modify)
│   └── scenes/              ← generated per-video for custom templates only (locked templates use data-driven renderer)
│       ├── tokens.ts
│       ├── Scene1Hook.tsx
│       └── ...
├── public/
│   ├── watermark.png        ← shared watermark/logo replaced by /update-logo
│   ├── assets/              ← reusable template assets and music manifests
│   │   ├── creative/
│   │   └── news/
│   └── <slug>/              ← generated audio/timeline per video
│       ├── voice.mp3
│       └── timeline.json
├── videos/                  ← output artifacts per video
│   └── <slug>/
│       ├── pipeline-state.json
│       ├── context.txt
│       ├── audio.txt
│       ├── template.txt
│       ├── story-plan.json
│       ├── review-manifest.json
│       ├── approved-image-manifest.json
│       ├── production-render-spec.json
│       ├── props.json
│       └── video.mp4
├── tmp-music/               ← local ignored staging for /add-music mp3 files
├── tmp-logo/                ← local ignored staging for /update-logo png files
├── load-templates/          ← local ignored staging for purchased template packages
├── update-version/          ← user-provided update-version.md instructions
├── .env                     ← local secrets/config updated by /update-config
└── .env.example             ← documented environment variable template
```
