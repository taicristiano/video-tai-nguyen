import { describe, it, expect } from 'vitest';
import {
  normalizeForAlignment,
  tokenizeCanonicalScript,
  flattenSttWords,
  alignCanonicalToStt,
  assignCanonicalTimings,
  reconstructSegments,
  buildCanonicalTimeline,
  buildCanonicalApproximateTimeline,
  validateCanonicalAlignment,
  normalizeDisplayWhitespace,
  DEFAULT_ALIGNMENT_POLICY,
} from '../scripts/subtitle-canonical-aligner.mjs';

describe('Canonical Subtitle Aligner', () => {
  // Test 1 — exact transcript
  it('Test 1 — exact transcript: keeps text and preserves timings', () => {
    const canonicalText = 'Nhà mình ăn cơm cùng nhau.';
    const sttTimeline = {
      duration: 3.5,
      segments: [
        {
          start: 0.5,
          end: 3.2,
          text: 'Nhà mình ăn cơm cùng nhau.',
        },
      ],
      words: [
        { word: 'Nhà', start: 0.5, end: 0.8 },
        { word: 'mình', start: 0.9, end: 1.2 },
        { word: 'ăn', start: 1.3, end: 1.6 },
        { word: 'cơm', start: 1.7, end: 2.1 },
        { word: 'cùng', start: 2.2, end: 2.6 },
        { word: 'nhau.', start: 2.7, end: 3.2 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);
    expect(metrics.exactMatches).toBe(6);
    expect(metrics.fuzzyMatches).toBe(0);
    expect(metrics.contextSubstitutions).toBe(0);
    expect(metrics.interpolatedTokens).toBe(0);
    expect(metrics.ignoredSttTokens).toBe(0);

    const words = timeline.words;
    expect(words.map((w: any) => w.word).join(' ')).toBe('Nhà mình ăn cơm cùng nhau.');
    expect(words[0].start).toBe(0.5);
    expect(words[5].end).toBe(3.2);
  });

  // Test 2 — substitution (Known Video 001 error: "tô" vs "câu")
  it('Test 2 — substitution: "câu" inherits timing of STT "tô"', () => {
    const canonicalText = 'nghe vài câu chuyện vụn';
    const sttTimeline = {
      duration: 3.0,
      segments: [
        {
          start: 1.0,
          end: 2.8,
          text: 'nghe vài tô chuyện vụn',
        },
      ],
      words: [
        { word: 'nghe', start: 1.0, end: 1.2 },
        { word: 'vài', start: 1.2, end: 1.4 },
        { word: 'tô', start: 1.45, end: 1.65 },
        { word: 'chuyện', start: 1.7, end: 2.1 },
        { word: 'vụn', start: 2.15, end: 2.5 },
      ],
    };

    const { timeline, diffs, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);
    expect(metrics.contextSubstitutions).toBe(1);

    const words = timeline.words;
    // The displayed words must be strictly canonical ("câu", NOT "tô")
    expect(words.map((w: any) => w.word).join(' ')).toBe('nghe vài câu chuyện vụn');

    // "câu" must inherit timing of STT "tô"
    const cauWord = words.find((w: any) => w.word === 'câu');
    expect(cauWord).toBeDefined();
    expect(cauWord.start).toBe(1.45);
    expect(cauWord.end).toBe(1.65);

    // Diffs must record the replacement
    const substDiff = diffs.find((d: any) => d.type === 'SUBSTITUTION');
    expect(substDiff).toBeDefined();
    expect(substDiff.stt).toBe('tô');
    expect(substDiff.canonical).toBe('câu');
  });

  // Test 3 — missing STT word (interpolated timing)
  it('Test 3 — missing STT word: "cùng" remains in subtitle and timing is interpolated', () => {
    const canonicalText = 'mọi người cùng có mặt';
    const sttTimeline = {
      duration: 3.0,
      segments: [
        {
          start: 0.5,
          end: 2.5,
          text: 'mọi người có mặt',
        },
      ],
      words: [
        { word: 'mọi', start: 0.5, end: 0.8 },
        { word: 'người', start: 0.85, end: 1.2 },
        // "cùng" is omitted in STT
        { word: 'có', start: 1.8, end: 2.1 },
        { word: 'mặt', start: 2.15, end: 2.5 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);
    expect(metrics.interpolatedTokens).toBe(1);

    const words = timeline.words;
    expect(words.map((w: any) => w.word).join(' ')).toBe('mọi người cùng có mặt');

    const cungWord = words.find((w: any) => w.word === 'cùng');
    expect(cungWord).toBeDefined();
    // Timing must be strictly between "người" end (1.2) and "có" start (1.8)
    expect(cungWord.start).toBeGreaterThanOrEqual(1.2);
    expect(cungWord.end).toBeLessThanOrEqual(1.8);
    expect(cungWord.start).toBeLessThan(cungWord.end);
  });

  // Test 4 — extra STT word (ignored, not displayed)
  it('Test 4 — extra STT word: "cái" is omitted from displayed subtitles', () => {
    const canonicalText = 'đặt điện thoại sang một bên';
    const sttTimeline = {
      duration: 3.5,
      segments: [
        {
          start: 0.2,
          end: 3.0,
          text: 'đặt cái điện thoại sang một bên',
        },
      ],
      words: [
        { word: 'đặt', start: 0.2, end: 0.5 },
        { word: 'cái', start: 0.55, end: 0.75 }, // extra word
        { word: 'điện', start: 0.8, end: 1.1 },
        { word: 'thoại', start: 1.15, end: 1.5 },
        { word: 'sang', start: 1.6, end: 1.9 },
        { word: 'một', start: 1.95, end: 2.2 },
        { word: 'bên', start: 2.25, end: 2.6 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);
    expect(metrics.ignoredSttTokens).toBe(1);

    const words = timeline.words;
    expect(words.map((w: any) => w.word).join(' ')).toBe('đặt điện thoại sang một bên');
    expect(words.find((w: any) => w.word === 'cái')).toBeUndefined();
  });

  // Test 5 — punctuation preservation
  it('Test 5 — punctuation: preserves comma and question mark from canonical text', () => {
    const canonicalText = 'Bạn muốn mình nghe, hay cùng nghĩ cách?';
    const sttTimeline = {
      duration: 3.0,
      segments: [
        {
          start: 0.4,
          end: 2.8,
          text: 'Bạn muốn mình nghe hay cùng nghĩ cách',
        },
      ],
      words: [
        { word: 'Bạn', start: 0.4, end: 0.7 },
        { word: 'muốn', start: 0.75, end: 1.0 },
        { word: 'mình', start: 1.05, end: 1.3 },
        { word: 'nghe', start: 1.35, end: 1.6 }, // missing comma in STT
        { word: 'hay', start: 1.7, end: 1.9 },
        { word: 'cùng', start: 1.95, end: 2.2 },
        { word: 'nghĩ', start: 2.25, end: 2.5 },
        { word: 'cách', start: 2.55, end: 2.8 }, // missing question mark in STT
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);

    const words = timeline.words;
    expect(words.map((w: any) => w.word).join(' ')).toBe(
      'Bạn muốn mình nghe, hay cùng nghĩ cách?',
    );

    const ngheWord = words.find((w: any) => w.word.startsWith('nghe'));
    expect(ngheWord.word).toBe('nghe,');

    const cachWord = words.find((w: any) => w.word.startsWith('cách'));
    expect(cachWord.word).toBe('cách?');
  });

  // Test 6 — Vietnamese diacritics preservation
  it('Test 6 — diacritics: preserves canonical Vietnamese diacritics against unaccented STT', () => {
    const canonicalText = 'những điều nhỏ';
    const sttTimeline = {
      duration: 2.0,
      segments: [
        {
          start: 0.2,
          end: 1.5,
          text: 'nhung dieu nho',
        },
      ],
      words: [
        { word: 'nhung', start: 0.2, end: 0.5 },
        { word: 'dieu', start: 0.6, end: 0.9 },
        { word: 'nho', start: 1.0, end: 1.3 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalIntegrity).toBe(true);

    const words = timeline.words;
    expect(words.map((w: any) => w.word).join(' ')).toBe('những điều nhỏ');
  });

  // Monotonic Timing Invariants
  it('enforces strict monotonic invariants and no negative timestamps', () => {
    const canonicalText = 'Một hai ba bốn năm';
    const sttTimeline = {
      duration: 3.0,
      segments: [{ start: 0, end: 2.5, text: 'Một hai ba bốn năm' }],
      words: [
        { word: 'Một', start: 0.1, end: 0.4 },
        { word: 'hai', start: 0.35, end: 0.6 }, // overlapping start
        { word: 'ba', start: 0.7, end: 0.5 }, // end before start bug from bad STT
        { word: 'bốn', start: 0.65, end: 1.0 }, // start before prev end
        { word: 'năm', start: 1.1, end: 1.5 },
      ],
    };

    const { timeline } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    const validation = validateCanonicalAlignment({
      canonicalText,
      alignedTimeline: timeline,
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const words = timeline.words;
    for (let i = 0; i < words.length; i++) {
      expect(words[i].start).toBeGreaterThanOrEqual(0);
      expect(words[i].end).toBeGreaterThan(words[i].start);
      if (i > 0) {
        expect(words[i].start).toBeGreaterThanOrEqual(words[i - 1].start);
        expect(words[i].end).toBeGreaterThanOrEqual(words[i - 1].end);
      }
    }
  });

  // Test 8 — Catastrophic same-length mismatch
  it('Test 8 — Catastrophic same-length mismatch: degrades to CANONICAL_APPROXIMATE and preserves canonical text', () => {
    const canonicalText = 'một bữa cơm gia đình rất quý';
    const sttTimeline = {
      duration: 3.5,
      segments: [
        { start: 0.0, end: 3.5, text: 'hôm nay trời mưa đường rất xa' },
      ],
      words: [
        { word: 'hôm', start: 0.0, end: 0.5 },
        { word: 'nay', start: 0.5, end: 1.0 },
        { word: 'trời', start: 1.0, end: 1.5 },
        { word: 'mưa', start: 1.5, end: 2.0 },
        { word: 'đường', start: 2.0, end: 2.5 },
        { word: 'rất', start: 2.5, end: 3.0 },
        { word: 'xa', start: 3.0, end: 3.5 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.canonicalTextIntegrity).toBe(true);
    expect(metrics.canonicalIntegrity).toBe(true);
    expect(metrics.alignmentStatus).toBe('DEGRADED');
    expect(metrics.timingMode).toBe('CANONICAL_APPROXIMATE');
    expect(metrics.exactMatches).toBe(1);
    expect(metrics.contextSubstitutions).toBe(6);

    // Final displayed text remains strictly canonical
    expect(timeline.words.map((w: any) => w.word).join(' ')).toBe(
      'một bữa cơm gia đình rất quý',
    );
    expect(timeline.segments[0].text).toBe('một bữa cơm gia đình rất quý');
  });

  // Test 9 — punctuation integrity
  it('Test 9 — punctuation integrity: flags canonicalTextIntegrity as false when punctuation is missing', () => {
    const canonicalText = 'Bạn muốn mình nghe, hay cùng nghĩ cách?';
    const flawedTimeline = {
      duration: 3.0,
      segments: [{ start: 0, end: 3.0, text: 'Bạn muốn mình nghe hay cùng nghĩ cách' }],
      words: [
        { word: 'Bạn', start: 0.1, end: 0.4 },
        { word: 'muốn', start: 0.4, end: 0.8 },
        { word: 'mình', start: 0.8, end: 1.1 },
        { word: 'nghe', start: 1.1, end: 1.5 }, // missing comma
        { word: 'hay', start: 1.5, end: 1.8 },
        { word: 'cùng', start: 1.8, end: 2.1 },
        { word: 'nghĩ', start: 2.1, end: 2.5 },
        { word: 'cách', start: 2.5, end: 2.9 }, // missing question mark
      ],
    };

    const validation = validateCanonicalAlignment({
      canonicalText,
      alignedTimeline: flawedTimeline,
    });

    expect(validation.canonicalTextIntegrity).toBe(false);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain('Canonical text integrity mismatch');
  });

  // Test 10 — no raw segment leak
  it('Test 10 — no raw segment leak: extra STT segment never leaks raw text into timeline.segments', () => {
    const canonicalText = 'Nhà mình ăn cơm';
    const sttTimeline = {
      duration: 4.0,
      segments: [
        { start: 0.5, end: 2.0, text: 'Nhà mình ăn cơm' },
        { start: 2.5, end: 4.0, text: 'SAI HOÀN TOÀN' },
      ],
      words: [
        { word: 'Nhà', start: 0.5, end: 0.8 },
        { word: 'mình', start: 0.9, end: 1.2 },
        { word: 'ăn', start: 1.3, end: 1.6 },
        { word: 'cơm', start: 1.7, end: 2.0 },
      ],
    };

    const { timeline } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    for (const seg of timeline.segments) {
      expect(seg.text).not.toContain('SAI HOÀN TOÀN');
    }
  });

  // Test 11 — small real-world error remains trusted
  it('Test 11 — small real-world error remains trusted: "nghe vài tô chuyện vụn" is TRUSTED', () => {
    const canonicalText = 'nghe vài câu chuyện vụn';
    const sttTimeline = {
      duration: 3.0,
      segments: [
        {
          start: 1.0,
          end: 2.8,
          text: 'nghe vài tô chuyện vụn',
        },
      ],
      words: [
        { word: 'nghe', start: 1.0, end: 1.2 },
        { word: 'vài', start: 1.2, end: 1.4 },
        { word: 'tô', start: 1.45, end: 1.65 },
        { word: 'chuyện', start: 1.7, end: 2.1 },
        { word: 'vụn', start: 2.15, end: 2.5 },
      ],
    };

    const { timeline, metrics } = buildCanonicalTimeline({
      canonicalText,
      sttTimeline,
    });

    expect(metrics.alignmentStatus).toBe('TRUSTED');
    expect(metrics.timingMode).toBe('STT_WORD_ALIGNED');
    expect(metrics.canonicalTextIntegrity).toBe(true);
    expect(metrics.exactMatches).toBe(4);
    expect(metrics.contextSubstitutions).toBe(1);
    expect(timeline.words.map((w: any) => w.word).join(' ')).toBe(
      'nghe vài câu chuyện vụn',
    );
  });

  // Test 12 — alignment exception fallback
  it('Test 12 — alignment exception fallback: produces canonical text, never raw STT', () => {
    const canonicalText = 'Gia đình là nơi để về';
    const corruptedSttTimeline = {
      duration: 3.0,
      segments: [{ start: 0, end: 3.0, text: 'RAW STT GARBAGE LEAK' }],
      words: null,
    };

    const fallbackTimeline = buildCanonicalApproximateTimeline({
      canonicalText,
      sttTimeline: corruptedSttTimeline,
    });

    const validation = validateCanonicalAlignment({
      canonicalText,
      alignedTimeline: fallbackTimeline,
    });

    expect(validation.canonicalTextIntegrity).toBe(true);
    expect(fallbackTimeline.words.map((w: any) => w.word).join(' ')).toBe(
      'Gia đình là nơi để về',
    );
    for (const seg of fallbackTimeline.segments) {
      expect(seg.text).not.toContain('RAW STT GARBAGE LEAK');
    }
  });
});
