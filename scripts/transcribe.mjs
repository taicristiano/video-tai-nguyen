/**
 * scripts/transcribe.mjs
 *
 * Transcribe audio with word/segment-level timestamps.
 *
 * Provider selection:
 *   1. Groq Whisper — if GROQ_API_KEY is set (primary)
 *   2. api.stt.ai   — if STT_API_KEY is set (fallback)
 *
 * Usage:
 *   node scripts/transcribe.mjs "<slug>"
 *
 * Input:  public/<slug>/voice.mp3
 * Output: public/<slug>/timeline.json
 *
 * Output format (timeline.json):
 * {
 *   "duration": 68.4,
 *   "segments": [
 *     { "start": 0.0, "end": 1.9, "text": "Ây, ai viết code nhanh như rocket," }
 *   ],
 *   "words": [
 *     { "word": "Ây,", "start": 0.0, "end": 0.2 }
 *   ]
 * }
 *
 * Segments drive scene timing. Words are required for subtitle highlighting.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildCanonicalTimeline,
  buildCanonicalApproximateTimeline,
  tokenizeCanonicalScript,
} from './subtitle-canonical-aligner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnv();

// ─── Args ─────────────────────────────────────────────────────────────────────
const [, , slug] = process.argv;

if (!slug) {
  console.error('Usage: node scripts/transcribe.mjs <slug>');
  process.exit(1);
}

// ─── Paths ────────────────────────────────────────────────────────────────────
const audioPath = path.join(ROOT, 'public', slug, 'voice.mp3');
const outputPath = path.join(ROOT, 'public', slug, 'timeline.json');

if (!fs.existsSync(audioPath)) {
  console.error(`Error: voice.mp3 not found at ${audioPath}`);
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';
const sttApiKey = process.env.STT_API_KEY;
const language = process.env.STT_LANGUAGE || 'vi';

if (!groqApiKey && !sttApiKey) {
  console.error('Error: set GROQ_API_KEY or STT_API_KEY in .env');
  process.exit(1);
}

function validateTimeline(timeline) {
  if (!timeline.segments || !Array.isArray(timeline.segments) || timeline.segments.length === 0) {
    throw new Error('STT provider returned no segments');
  }

  if (!Array.isArray(timeline.words)) {
    timeline.words = [];
  }

  if (timeline.duration === null || timeline.duration === undefined) {
    const lastSegment = timeline.segments[timeline.segments.length - 1];
    const lastWord = timeline.words[timeline.words.length - 1];
    timeline.duration = Math.max(lastSegment?.end ?? 0, lastWord?.end ?? 0);
  }

  for (let i = 0; i < timeline.segments.length; i++) {
    const seg = timeline.segments[i];
    if (typeof seg.start !== 'number' || typeof seg.end !== 'number') {
      throw new Error(`Invariant violation: segment[${i}] has invalid timestamps`);
    }
    if (seg.start > seg.end) {
      throw new Error(`Invariant violation: segment[${i}].start (${seg.start}) > end (${seg.end})`);
    }
    if (i > 0 && seg.start < timeline.segments[i - 1].start) {
      throw new Error(`Invariant violation: segment[${i}].start (${seg.start}) < segment[${i - 1}].start`);
    }
  }

  for (let i = 0; i < timeline.words.length; i++) {
    const w = timeline.words[i];
    if (typeof w.start !== 'number' || typeof w.end !== 'number') {
      throw new Error(`Invariant violation: word[${i}] "${w.word}" has invalid timestamps`);
    }
    if (w.start > w.end) {
      throw new Error(`Invariant violation: word[${i}] "${w.word}" start (${w.start}) > end (${w.end})`);
    }
    if (i > 0 && w.start < timeline.words[i - 1].start) {
      throw new Error(`Invariant violation: word[${i}] "${w.word}" start (${w.start}) < word[${i - 1}].start`);
    }
  }

  return timeline;
}

function normalizeGroqResponse(data) {
  const segments = Array.isArray(data.segments)
    ? data.segments.map((seg) => ({
        start: seg.start,
        end: seg.end,
        text: String(seg.text ?? '').trim(),
      }))
    : [];

  const words = Array.isArray(data.words)
    ? data.words.map((word) => ({
        word: String(word.word ?? '').trim(),
        start: word.start,
        end: word.end,
      }))
    : [];

  for (let i = 0; i < segments.length; i++) {
    if (i > 0 && segments[i].start < segments[i - 1].start) {
      segments[i].start = segments[i - 1].start;
    }
    if (segments[i].end < segments[i].start) {
      segments[i].end = segments[i].start;
    }
  }

  for (let i = 0; i < words.length; i++) {
    if (i > 0 && words[i].start < words[i - 1].start) {
      words[i].start = words[i - 1].start;
    }
    if (words[i].end < words[i].start) {
      words[i].end = words[i].start;
    }
  }

  return validateTimeline({
    duration: data.duration ?? null,
    segments,
    words,
  });
}

function normalizeSttAiResponse(data) {
  const allWords = [];

  const timeline = {
    duration: data.duration ?? null,
    segments: Array.isArray(data.segments)
      ? data.segments.map((seg) => ({
          start: seg.start,
          end: seg.end,
          text: String(seg.text ?? '').trim(),
        }))
      : [],
    words: [],
  };

  for (const seg of data.segments ?? []) {
    if (Array.isArray(seg.words) && seg.words.length > 0) {
      for (const w of seg.words) {
        allWords.push({
          word: String(w.word ?? '').trim(),
          start: w.start,
          end: w.end,
        });
      }
    }
  }

  timeline.words = allWords;
  return validateTimeline(timeline);
}

async function transcribeWithGroq() {
  console.log('   Provider: Groq');
  console.log(`   Model:    ${groqModel}`);

  const audioBuffer = fs.readFileSync(audioPath);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

  const formData = new FormData();
  formData.append('file', audioBlob, 'voice.mp3');
  formData.append('model', groqModel);
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');
  formData.append('temperature', '0');
  formData.append('timestamp_granularities[]', 'word');
  formData.append('timestamp_granularities[]', 'segment');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq STT API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return normalizeGroqResponse(data);
}

async function transcribeWithSttAi() {
  console.log('   Provider: api.stt.ai');

  const audioBuffer = fs.readFileSync(audioPath);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

  const formData = new FormData();
  formData.append('file', audioBlob, 'voice.mp3');
  formData.append('language', language);
  formData.append('speakers', '1');

  const response = await fetch('https://api.stt.ai/v1/transcribe', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sttApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`api.stt.ai error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return normalizeSttAiResponse(data);
}

async function transcribe() {
  if (groqApiKey) {
    try {
      return await transcribeWithGroq();
    } catch (err) {
      if (!sttApiKey) {
        throw err;
      }
      console.error(`\n⚠️  Groq STT failed: ${err.message}`);
      console.error('   Falling back to api.stt.ai');
    }
  }

  if (sttApiKey) {
    return transcribeWithSttAi();
  }

  throw new Error('No STT provider available');
}

// ─── Transcribe ───────────────────────────────────────────────────────────────
console.log(`\n🎧 Transcribing: ${audioPath}`);
console.log(`   Language: ${language}`);

try {
  const timeline = await transcribe();

  // ─── Write raw STT output ──────────────────────────────────────────────────
  const rawOutputPath = path.join(ROOT, 'public', slug, 'timeline-stt-raw.json');
  fs.writeFileSync(rawOutputPath, JSON.stringify(timeline, null, 2), 'utf-8');

  // Check if canonical script exists for this slug
  const scriptJsonPath = path.join(ROOT, 'videos', slug, 'script', 'script.json');
  let finalTimeline = timeline;

  if (fs.existsSync(scriptJsonPath)) {
    try {
      const scriptData = JSON.parse(fs.readFileSync(scriptJsonPath, 'utf-8'));
      const canonicalText = Array.isArray(scriptData.script)
        ? scriptData.script.map((s) => s.text).join('\n\n')
        : '';

      if (canonicalText.trim()) {
        console.log(`\n🔗 Aligning canonical voice script with STT timings...`);
        let alignedTimeline;
        let diffs = [];
        let metrics;

        try {
          const res = buildCanonicalTimeline({
            canonicalText,
            sttTimeline: timeline,
          });
          alignedTimeline = res.timeline;
          diffs = res.diffs;
          metrics = res.metrics;
        } catch (alignErr) {
          console.warn(`   ⚠️ Canonical alignment error: ${alignErr.message}. Falling back to CANONICAL_APPROXIMATE.`);
          try {
            alignedTimeline = buildCanonicalApproximateTimeline({
              canonicalText,
              sttTimeline: timeline,
            });
            const canonicalTokens = tokenizeCanonicalScript(canonicalText);
            metrics = {
              canonicalTokenCount: canonicalTokens.length,
              sttTokenCount: Array.isArray(timeline?.words) ? timeline.words.length : 0,
              exactMatches: 0,
              fuzzyMatches: 0,
              contextSubstitutions: 0,
              interpolatedTokens: 0,
              ignoredSttTokens: 0,
              evidenceRatio: 0,
              substitutionRatio: 0,
              interpolationRatio: 0,
              ignoredSttRatio: 0,
              canonicalTextIntegrity: true,
              alignmentStatus: 'DEGRADED',
              timingMode: 'CANONICAL_APPROXIMATE',
              validationErrors: [`Alignment exception: ${alignErr.message}`],
              canonicalIntegrity: true,
            };
          } catch (fallbackErr) {
            throw new Error(`Both canonical alignment and approximate fallback failed: ${alignErr.message} | ${fallbackErr.message}`);
          }
        }

        finalTimeline = alignedTimeline;

        // Save QA reports
        const videosDir = path.join(ROOT, 'videos', slug);
        if (fs.existsSync(videosDir)) {
          fs.writeFileSync(
            path.join(videosDir, 'subtitle-alignment-report.json'),
            JSON.stringify(metrics, null, 2),
            'utf-8',
          );

          const diffMdLines = [
            '# Subtitle Alignment Diff',
            '',
            `- **Video Slug**: \`${slug}\``,
            `- **Canonical Tokens**: ${metrics.canonicalTokenCount}`,
            `- **STT Tokens**: ${metrics.sttTokenCount}`,
            `- **Exact Matches**: ${metrics.exactMatches}`,
            `- **Fuzzy Matches**: ${metrics.fuzzyMatches}`,
            `- **Context Substitutions**: ${metrics.contextSubstitutions}`,
            `- **Interpolated Tokens**: ${metrics.interpolatedTokens}`,
            `- **Ignored STT Tokens**: ${metrics.ignoredSttTokens}`,
            `- **Evidence Ratio**: ${metrics.evidenceRatio}`,
            `- **Substitution Ratio**: ${metrics.substitutionRatio}`,
            `- **Interpolation Ratio**: ${metrics.interpolationRatio}`,
            `- **Ignored STT Ratio**: ${metrics.ignoredSttRatio}`,
            `- **Canonical Text Integrity**: ${metrics.canonicalTextIntegrity ? 'PASS' : 'FAIL'}`,
            `- **Alignment Status**: \`${metrics.alignmentStatus}\``,
            `- **Timing Mode**: \`${metrics.timingMode}\``,
            '',
            '## Differences',
            '',
          ];

          if (diffs.length === 0) {
            diffMdLines.push('No differences found. STT text perfectly matches canonical voice script.');
          } else {
            diffs.forEach((d, idx) => {
              diffMdLines.push(`### Diff ${idx + 1} (${d.type})`);
              diffMdLines.push(`- **STT**: \`${d.stt}\``);
              diffMdLines.push(`- **CANONICAL**: \`${d.canonical}\``);
              if (d.start !== undefined && d.end !== undefined) {
                diffMdLines.push(`- **TIMING**: \`${d.start}s – ${d.end}s\``);
              }
              diffMdLines.push(`- **ACTION**: ${d.action}`);
              diffMdLines.push('');
            });
          }

          fs.writeFileSync(
            path.join(videosDir, 'subtitle-alignment-diff.md'),
            diffMdLines.join('\n'),
            'utf-8',
          );
        }

        console.log(
          `   Aligned: ${metrics.canonicalTokenCount} canonical tokens ` +
          `(${metrics.exactMatches} exact, ${metrics.contextSubstitutions} subst, ` +
          `${metrics.interpolatedTokens} interp). Status: ${metrics.alignmentStatus} (${metrics.timingMode})`
        );
      }
    } catch (alignErr) {
      throw alignErr;
    }
  }

  // ─── Write final output for Subtitles and Remotion ──────────────────────────
  fs.writeFileSync(outputPath, JSON.stringify(finalTimeline, null, 2), 'utf-8');

  console.log(`\n✅ Transcription complete`);
  console.log(`   Segments: ${finalTimeline.segments.length}`);
  console.log(`   Words:    ${finalTimeline.words.length}`);
  console.log(`   Duration: ${finalTimeline.duration}s`);
  console.log(`   Output:   ${outputPath}`);

  // Print segment summary
  console.log('\n📋 Segments:');
  for (const seg of finalTimeline.segments) {
    const dur = (seg.end - seg.start).toFixed(2);
    console.log(`   [${seg.start.toFixed(2)}s – ${seg.end.toFixed(2)}s | ${dur}s] "${seg.text.slice(0, 60)}${seg.text.length > 60 ? '...' : ''}"`);
  }

} catch (err) {
  console.error(`\n❌ Transcription failed: ${err.message}`);
  process.exit(1);
}
