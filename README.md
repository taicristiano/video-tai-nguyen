# Create Video with AI

Tạo video ngắn bằng Remotion + AI Agent với voiceover tự động.

Pipeline đầy đủ: lên kế hoạch → viết script → TTS (giọng nói) → STT (timestamps) → thiết kế spec → render Remotion.

## Quick Start

```bash
/setup
```

Cài đặt tất cả dependencies và cấu hình môi trường tự động.

```bash
/gen-video <context>
/gen-video --template news/current-affairs-dark --audio=voice-only <context>
/gen-video --resume=<slug>
```

Without `--template`, generation uses `creative/free-style`: AI creates
content-driven scenes while preserving the shared watermark, subtitle, timing,
and verification contracts.

`--audio` accepts `full`, `music`, `sfx`, or `voice-only`. Omit it to preserve
the selected template's default audio behavior.

`--resume=<slug>` resumes a previously paused generation (e.g. after Human QA
review) from its next pending stage.

Đối với template production có cổng kiểm duyệt (`human-insight/cinematic-light`):
- AI **bắt buộc dừng** tại `PENDING_HUMAN_IMAGE_QA` và `PENDING_HUMAN_VIDEO_QA`, tuyệt đối không được tự ý auto-pass.
- Con người review và duyệt qua script:
  - Duyệt ảnh: `node scripts/record-human-review.mjs --slug=<slug> --action=image-pass-all`
  - Duyệt video: `node scripts/record-human-review.mjs --slug=<slug> --action=video-pass`
- Hợp đồng thời lượng chuẩn 70–85s (mục tiêu 75–80s) được kiểm soát tự động qua cân chỉnh nhịp giọng đọc (`ffmpeg atempo`), giữ nguyên 100% văn bản kịch bản gốc.

Tạo video từ nội dung context được cung cấp.

## Bundled Templates

Bản này đi kèm một bộ template free để dùng ngay:

- Creative: `free-style`, `free-style-sfx`, `pixel-style`, `pixel-style-sfx`,
  `demo-scroll`, `demo-scroll-sfx`, `article-video-demo`, `source-led-light`,
  `source-led-dark`, `source-led-light-sfx`, `source-led-dark-sfx`
- News: `tech-dark`, `tech-light`, `current-affairs-light`,
  `current-affairs-dark`, `real-estate-civic-light`,
  `real-estate-civic-dark`, `entertainment-magazine-light`,
  `entertainment-premiere-dark`, `sports-arena-dark`,
  `sports-briefing-light`, `health-briefing-light`, `health-public-alert`,
  `business-terminal-dark`, `business-ledger-light`,
  `travel-postcard-light`, `travel-guide-light`, `auto-showroom-dark`,
  `auto-market-light`, `education-briefing-light`, `education-campus-light`

Để thêm template mới sau này, đặt package đã mua hoặc được tặng vào
`load-templates/`, rồi chạy `/sync-templates`.

## Supported Agents

| Agent | Cấu hình |
|-------|----------|
| Kiro | `.kiro/skills/video-gen/SKILL.md` |
| Cursor | `.cursor/rules/gen-video.mdc` |
| Claude Code | `.claude/commands/gen-video.md` |
| Gemini / Codex | `docs/SKILL-GEN-VIDEO.md` |

## Cấu hình (.env)

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

| Biến | Bắt buộc | Mặc định | Mô tả |
|------|----------|---------|-------|
| `ASPECT_RATIO` | Không | `9:16` | Tỷ lệ khung hình (`9:16` dọc hoặc `16:9` ngang) |
| `THEME` | Không | `dark` | Giao diện (`dark` hoặc `light`) |
| `SHOW_SUBTITLES` | Không | `true` | Hiển thị subtitle tô sáng theo timeline |
| `ELEVENLABS_API_KEY` | Không* | — | API key ElevenLabs (TTS chính) |
| `ELEVENLABS_VOICE_ID` | Không | `K7ewtjKRNtwwt3lKQ6M0` | Voice ID ElevenLabs |
| `GEMINI_API_KEY` | Không* | — | API key Gemini (TTS dự phòng) |
| `GEMINI_TTS_VOICE` | Không | `Achird` | Tên voice Gemini TTS |
| `GROQ_API_KEY` | Không* | — | API key Groq STT chính |
| `GROQ_STT_MODEL` | Không | `whisper-large-v3-turbo` | Model Groq STT |
| `STT_API_KEY` | Không* | — | Bearer token api.stt.ai dự phòng |
| `STT_LANGUAGE` | Không | `vi` | Ngôn ngữ STT |

*Cần ít nhất một TTS key. Ưu tiên: ElevenLabs → Gemini.
*Cần ít nhất một STT key. Ưu tiên: Groq → api.stt.ai.

## Yêu cầu hệ thống

- Node.js 20.x, 22.x hoặc 24.x
- Chromium do Playwright cài đặt
- ffmpeg trên `PATH`
- Hỗ trợ chính thức: macOS 14+, Windows 11+/Server 2019+, Ubuntu 22.04/24.04,
  Debian 12/13. Các bản phân phối Linux khác là best effort.

Xem hướng dẫn đa nền tảng đầy đủ tại
[`docs/SKILL-SETUP.md`](docs/SKILL-SETUP.md).

## Pipeline

```
/gen-video [--audio=<mode>] <context>
  → Step 1: Setup       (slug, thư mục, context.txt, audio.txt)
  → Step 2: Planner     (plan.json — tiếng Việt)
  → Step 3: Teller      (script.json — tiếng Việt)
  → Step 4: Audio       (voice.mp3 — ElevenLabs / Gemini)
  → Step 5: Transcribe  (timeline.json — Groq hoặc api.stt.ai)
  → Step 6: Spec        (spec.json / production-render-spec.json)
  → Step 7: Coder       (data-driven production props; 0 shared source edits for locked templates)
  → Step 8: Render & QA (video.mp4 + Human-QA verification)
```

## Cấu trúc thư mục

```
create-video-with-ai/
├── scripts/
│   ├── tts.mjs          ← TTS: ElevenLabs (primary) / Gemini (fallback)
│   └── transcribe.mjs   ← STT: Groq / api.stt.ai → timeline.json
├── src/
│   ├── Root.tsx          ← Remotion Root (tự động nhận props runtime, không sửa khi chạy template cố định)
│   ├── Video.tsx         ← Không sửa
│   ├── VideoContent.tsx  ← Shared component có <Audio> (không sửa cho locked template)
│   ├── tokens.ts         ← Interface DesignTokens (không sửa)
│   └── scenes/           ← Tạo lại mỗi run cho custom template (locked template dùng data-driven renderer)
│       ├── tokens.ts
│       ├── Scene1Hook.tsx
│       └── ...
├── videos/<slug>/
│   ├── context.txt
│   ├── audio.txt
│   ├── plan.json
│   ├── script/script.json
│   ├── spec.json
│   └── video.mp4
└── public/<slug>/
    ├── voice.mp3
    └── timeline.json
```
