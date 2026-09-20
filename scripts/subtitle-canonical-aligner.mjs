/**
 * scripts/subtitle-canonical-aligner.mjs
 *
 * HAY & ĐẸP. — Canonical Subtitle Aligner
 *
 * Single Goal: Subtitle text shown on video must come from the canonical
 * voice script, while STT (Groq/Whisper/api.stt.ai) is used only to provide timing.
 *
 * Preserves canonical spelling, Vietnamese diacritics, and authored punctuation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * Remove Vietnamese diacritics for phonetic/similarity comparison only.
 */
export function stripVietnameseDiacritics(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Normalize text strictly for matching purposes.
 * Does NOT alter the displayed canonical text.
 */
export function normalizeForAlignment(text) {
  if (!text) return '';
  const lower = text.toLowerCase().normalize('NFC');
  const withoutDiacritics = stripVietnameseDiacritics(lower);
  // Remove punctuation and special characters, collapse multiple spaces
  return withoutDiacritics
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize canonical voice script into structured words with preserved display.
 */
export function tokenizeCanonicalScript(text) {
  if (!text) return [];

  // Split by whitespace while retaining words and attached punctuation
  const rawTokens = text.trim().split(/\s+/).filter(Boolean);

  return rawTokens.map((rawToken, index) => {
    // Separate core word from leading/trailing punctuation for normalization
    const cleanWord = rawToken.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    const normalized = normalizeForAlignment(cleanWord || rawToken);

    return {
      display: rawToken,
      clean: cleanWord || rawToken,
      normalized,
      index,
    };
  });
}

/**
 * Flatten STT timeline into a uniform word list with timing.
 * If word timestamps are missing, falls back to proportional segment allocation.
 */
export function flattenSttWords(sttTimeline) {
  if (!sttTimeline) return [];

  const words = [];

  // Path 1: STT has explicit word timestamps
  if (Array.isArray(sttTimeline.words) && sttTimeline.words.length > 0) {
    const segments = Array.isArray(sttTimeline.segments) ? sttTimeline.segments : [];

    sttTimeline.words.forEach((w, idx) => {
      const raw = String(w.word ?? '').trim();
      if (!raw) return;

      const clean = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      const normalized = normalizeForAlignment(clean || raw);

      const start = Number(w.start) || 0;
      const end = Number(w.end) || start;

      // Find which segment this word belongs to
      const midTime = (start + end) / 2;
      let segmentIndex = 0;
      let bestDist = Infinity;
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        if (midTime >= seg.start && midTime <= seg.end) {
          segmentIndex = s;
          break;
        }
        const dist = midTime < seg.start ? (seg.start - midTime) : (midTime - seg.end);
        if (dist < bestDist) {
          bestDist = dist;
          segmentIndex = s;
        }
      }

      words.push({
        raw,
        clean: clean || raw,
        normalized,
        start,
        end,
        sttIndex: idx,
        segmentIndex,
      });
    });

    return words;
  }

  // Path 2: Only segment timestamps exist -> derive proportional per-word timings
  if (Array.isArray(sttTimeline.segments) && sttTimeline.segments.length > 0) {
    sttTimeline.segments.forEach((seg, sIdx) => {
      const segText = String(seg.text ?? '').trim();
      if (!segText) return;

      const segWords = segText.split(/\s+/).filter(Boolean);
      if (segWords.length === 0) return;

      const segStart = Number(seg.start) || 0;
      const segEnd = Number(seg.end) || segStart + 1.0;
      const segDuration = Math.max(0.1, segEnd - segStart);

      // Distribute duration proportionally based on character length
      const totalChars = segWords.reduce((sum, w) => sum + Math.max(1, w.length), 0);
      let curStart = segStart;

      segWords.forEach((raw, wIdx) => {
        const charRatio = Math.max(1, raw.length) / totalChars;
        const wDuration = segDuration * charRatio;
        const wStart = curStart;
        const wEnd = Math.min(segEnd, curStart + wDuration);
        curStart = wEnd;

        const clean = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
        const normalized = normalizeForAlignment(clean || raw);

        words.push({
          raw,
          clean: clean || raw,
          normalized,
          start: Math.round(wStart * 1000) / 1000,
          end: Math.round(wEnd * 1000) / 1000,
          sttIndex: words.length,
          segmentIndex: sIdx,
        });
      });
    });
  }

  return words;
}

/**
 * Compute Levenshtein edit distance between two normalized strings.
 */
function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Alignment score matrix parameters.
 */
const SCORE_EXACT = 4;
const SCORE_FUZZY = 2;
const SCORE_SUBST = -1;
const PENALTY_GAP = -2;

/**
 * Align canonical normalized tokens with STT normalized tokens using Needleman-Wunsch DP.
 */
export function alignCanonicalToStt({ canonicalTokens, sttWords }) {
  const N = canonicalTokens.length;
  const M = sttWords.length;

  if (N === 0) {
    return { alignments: [], metrics: { exactMatches: 0, fuzzyMatches: 0, contextSubstitutions: 0, interpolatedTokens: 0, ignoredSttTokens: M } };
  }
  if (M === 0) {
    // All canonical tokens are interpolated
    const alignments = canonicalTokens.map((cToken) => ({
      canonicalToken: cToken,
      sttWord: null,
      type: 'INTERPOLATED',
    }));
    return { alignments, metrics: { exactMatches: 0, fuzzyMatches: 0, contextSubstitutions: 0, interpolatedTokens: N, ignoredSttTokens: 0 } };
  }

  // Initialize DP matrices
  const D = Array.from({ length: N + 1 }, () => new Int32Array(M + 1));
  const backtrack = Array.from({ length: N + 1 }, () => new Uint8Array(M + 1));

  // Traceback codes: 1 = MATCH/SUBST (diagonal), 2 = CANONICAL_GAP (up), 3 = STT_GAP (left)
  for (let i = 0; i <= N; i++) {
    D[i][0] = i * PENALTY_GAP;
    backtrack[i][0] = 2;
  }
  for (let j = 0; j <= M; j++) {
    D[0][j] = j * PENALTY_GAP;
    backtrack[0][j] = 3;
  }
  backtrack[0][0] = 0;

  for (let i = 1; i <= N; i++) {
    const cNorm = canonicalTokens[i - 1].normalized;

    for (let j = 1; j <= M; j++) {
      const sNorm = sttWords[j - 1].normalized;

      let matchScore = SCORE_SUBST;
      if (cNorm === sNorm) {
        matchScore = SCORE_EXACT;
      } else {
        const dist = levenshteinDistance(cNorm, sNorm);
        if (dist <= 1 && Math.max(cNorm.length, sNorm.length) >= 2) {
          matchScore = SCORE_FUZZY;
        } else if (dist <= 2 && Math.min(cNorm.length, sNorm.length) >= 4) {
          matchScore = SCORE_FUZZY;
        }
      }

      const diag = D[i - 1][j - 1] + matchScore;
      const up = D[i - 1][j] + PENALTY_GAP;   // missing from STT
      const left = D[i][j - 1] + PENALTY_GAP; // extra in STT

      if (diag >= up && diag >= left) {
        D[i][j] = diag;
        backtrack[i][j] = 1;
      } else if (up >= left) {
        D[i][j] = up;
        backtrack[i][j] = 2;
      } else {
        D[i][j] = left;
        backtrack[i][j] = 3;
      }
    }
  }

  // Backtrack
  let i = N;
  let j = M;
  const rawPairs = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && backtrack[i][j] === 1) {
      rawPairs.push({
        cToken: canonicalTokens[i - 1],
        sWord: sttWords[j - 1],
      });
      i--;
      j--;
    } else if (i > 0 && (j === 0 || backtrack[i][j] === 2)) {
      rawPairs.push({
        cToken: canonicalTokens[i - 1],
        sWord: null, // missing in STT -> interpolated
      });
      i--;
    } else {
      rawPairs.push({
        cToken: null,
        sWord: sttWords[j - 1], // extra in STT -> ignored
      });
      j--;
    }
  }

  rawPairs.reverse();

  // Calculate metrics and build final alignment list for canonical tokens
  let exactMatches = 0;
  let fuzzyMatches = 0;
  let contextSubstitutions = 0;
  let interpolatedTokens = 0;
  let ignoredSttTokens = 0;

  const alignments = [];
  const diffs = [];

  for (const pair of rawPairs) {
    if (pair.cToken && pair.sWord) {
      const cNorm = pair.cToken.normalized;
      const sNorm = pair.sWord.normalized;

      if (cNorm === sNorm) {
        exactMatches++;
        alignments.push({
          canonicalToken: pair.cToken,
          sttWord: pair.sWord,
          type: 'EXACT',
        });
      } else {
        const dist = levenshteinDistance(cNorm, sNorm);
        const isFuzzy = (dist <= 1 && Math.max(cNorm.length, sNorm.length) >= 2) ||
                        (dist <= 2 && Math.min(cNorm.length, sNorm.length) >= 4);

        if (isFuzzy) {
          fuzzyMatches++;
          alignments.push({
            canonicalToken: pair.cToken,
            sttWord: pair.sWord,
            type: 'FUZZY',
          });
        } else {
          contextSubstitutions++;
          alignments.push({
            canonicalToken: pair.cToken,
            sttWord: pair.sWord,
            type: 'SUBSTITUTION',
          });
        }

        diffs.push({
          action: 'canonical text kept, STT timing reused',
          stt: pair.sWord.raw,
          canonical: pair.cToken.display,
          start: pair.sWord.start,
          end: pair.sWord.end,
          type: isFuzzy ? 'FUZZY' : 'SUBSTITUTION',
        });
      }
    } else if (pair.cToken && !pair.sWord) {
      interpolatedTokens++;
      alignments.push({
        canonicalToken: pair.cToken,
        sttWord: null,
        type: 'INTERPOLATED',
      });
      diffs.push({
        action: 'canonical word missing in STT, timing interpolated',
        stt: '(missing)',
        canonical: pair.cToken.display,
        type: 'INTERPOLATED',
      });
    } else if (!pair.cToken && pair.sWord) {
      ignoredSttTokens++;
      diffs.push({
        action: 'extra STT word omitted from subtitle',
        stt: pair.sWord.raw,
        canonical: '(none)',
        start: pair.sWord.start,
        end: pair.sWord.end,
        type: 'IGNORED_STT',
      });
    }
  }

  return {
    alignments,
    diffs,
    metrics: {
      canonicalTokenCount: N,
      sttTokenCount: M,
      exactMatches,
      fuzzyMatches,
      contextSubstitutions,
      interpolatedTokens,
      ignoredSttTokens,
    },
  };
}

/**
 * Assign monotonic timestamps to all canonical tokens, interpolating missing tokens.
 */
export function assignCanonicalTimings({ alignments, sttTimeline }) {
  const count = alignments.length;
  if (count === 0) return [];

  const totalDuration = Number(sttTimeline?.duration) || 0;
  const results = alignments.map((a) => ({
    word: a.canonicalToken.display,
    start: a.sttWord ? a.sttWord.start : null,
    end: a.sttWord ? a.sttWord.end : null,
    segmentIndex: a.sttWord ? a.sttWord.segmentIndex : null,
    type: a.type,
  }));

  // Step 1: Interpolate missing (null) timestamps
  let idx = 0;
  while (idx < count) {
    if (results[idx].start !== null) {
      idx++;
      continue;
    }

    // Find run of missing items
    const missingStart = idx;
    while (idx < count && results[idx].start === null) {
      idx++;
    }
    const missingEnd = idx; // exclusive
    const missingLen = missingEnd - missingStart;

    // Previous valid timestamp
    const prevValid = missingStart > 0 ? results[missingStart - 1] : null;
    // Next valid timestamp
    const nextValid = missingEnd < count ? results[missingEnd] : null;

    let tStart = 0;
    let tEnd = totalDuration || 1.0;
    let segIdx = 0;

    if (prevValid && nextValid) {
      tStart = prevValid.end;
      tEnd = nextValid.start;
      segIdx = prevValid.segmentIndex ?? nextValid.segmentIndex ?? 0;
      if (tEnd <= tStart) {
        // Overlap or zero gap: allocate small window
        tEnd = tStart + missingLen * 0.18;
      }
    } else if (prevValid && !nextValid) {
      tStart = prevValid.end;
      tEnd = Math.max(tStart + missingLen * 0.25, totalDuration);
      segIdx = prevValid.segmentIndex ?? 0;
    } else if (!prevValid && nextValid) {
      tEnd = nextValid.start;
      tStart = Math.max(0, tEnd - missingLen * 0.25);
      segIdx = nextValid.segmentIndex ?? 0;
    }

    const span = Math.max(0.05 * missingLen, tEnd - tStart);
    const step = span / missingLen;

    for (let k = 0; k < missingLen; k++) {
      const itemIdx = missingStart + k;
      results[itemIdx].start = Math.round((tStart + k * step) * 1000) / 1000;
      results[itemIdx].end = Math.round((tStart + (k + 1) * step) * 1000) / 1000;
      results[itemIdx].segmentIndex = segIdx;
    }
  }

  // Step 2: Enforce strict monotonic invariants
  const MIN_WORD_DURATION = 0.08; // 80ms minimum duration

  for (let i = 0; i < count; i++) {
    const item = results[i];

    // Non-negative
    if (item.start < 0) item.start = 0;

    // Monotonic start: >= previous start
    if (i > 0 && item.start < results[i - 1].start) {
      item.start = results[i - 1].start;
    }

    // Must have minimum duration
    if (item.end < item.start + MIN_WORD_DURATION) {
      item.end = Math.round((item.start + MIN_WORD_DURATION) * 1000) / 1000;
    }

    // Monotonic end: >= previous end
    if (i > 0 && item.end < results[i - 1].end) {
      item.end = Math.max(
        Math.round((item.start + MIN_WORD_DURATION) * 1000) / 1000,
        results[i - 1].end,
      );
    }
  }

  return results;
}

/**
 * Reconstruct canonical segments matching STT segment structure.
 */
export function reconstructSegments({ canonicalWords, sttTimeline }) {
  const originalSegments = Array.isArray(sttTimeline?.segments) ? sttTimeline.segments : [];

  if (originalSegments.length === 0 || canonicalWords.length === 0) {
    return [
      {
        start: canonicalWords[0]?.start ?? 0,
        end: canonicalWords[canonicalWords.length - 1]?.end ?? 0,
        text: canonicalWords.map((w) => w.word).join(' '),
        words: canonicalWords.map((w) => ({ word: w.word, start: w.start, end: w.end })),
      },
    ];
  }

  // Partition canonical words into segments based on assigned segmentIndex
  const segmentBuckets = Array.from({ length: originalSegments.length }, () => []);

  for (const w of canonicalWords) {
    let sIdx = w.segmentIndex ?? 0;
    if (sIdx < 0) sIdx = 0;
    if (sIdx >= originalSegments.length) sIdx = originalSegments.length - 1;
    segmentBuckets[sIdx].push(w);
  }

  // If any segment is empty, merge or borrow words based on timing
  const reconstructed = [];

  for (let s = 0; s < originalSegments.length; s++) {
    const wordsInSeg = segmentBuckets[s];
    const origSeg = originalSegments[s];

    if (wordsInSeg.length > 0) {
      const text = wordsInSeg.map((w) => w.word).join(' ');

      reconstructed.push({
        start: origSeg.start,
        end: origSeg.end,
        text,
        words: wordsInSeg.map((w) => ({ word: w.word, start: w.start, end: w.end })),
      });
    } else {
      // Never leak origSeg.text from raw STT
      reconstructed.push({
        start: origSeg.start,
        end: origSeg.end,
        text: '',
        words: [],
      });
    }
  }

  return reconstructed;
}

/**
 * Normalize whitespace strictly for canonical display comparison.
 * Preserves Vietnamese diacritics, capitalization, and punctuation.
 */
export function normalizeDisplayWhitespace(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Default safe alignment thresholds.
 */
export const DEFAULT_ALIGNMENT_POLICY = {
  minEvidenceRatio: 0.85,
  maxSubstitutionRatio: 0.10,
  maxInterpolationRatio: 0.10,
  maxIgnoredSttRatio: 0.10,
};

/**
 * Evaluate if alignment quality is trustworthy.
 */
export function isAlignmentTrusted(metrics, policy = DEFAULT_ALIGNMENT_POLICY) {
  const canonicalCount = metrics.canonicalTokenCount || 1;
  const sttCount = metrics.sttTokenCount || 1;

  const evidenceMatches = (metrics.exactMatches || 0) + (metrics.fuzzyMatches || 0);
  const evidenceRatio = evidenceMatches / canonicalCount;
  const substitutionRatio = (metrics.contextSubstitutions || 0) / canonicalCount;
  const interpolationRatio = (metrics.interpolatedTokens || 0) / canonicalCount;
  const ignoredSttRatio = (metrics.ignoredSttTokens || 0) / sttCount;

  // Standard ratio check
  const standardTrusted =
    evidenceRatio >= policy.minEvidenceRatio &&
    substitutionRatio <= policy.maxSubstitutionRatio &&
    interpolationRatio <= policy.maxInterpolationRatio &&
    ignoredSttRatio <= policy.maxIgnoredSttRatio;

  if (standardTrusted) return true;

  // Discrete short-phrase tolerance: In short phrases (<= 6 words), a single real-world
  // deviation (1 substitution, 1 interpolation, or 1 ignored STT word) is a quantization artifact
  // (e.g. 1/5 = 20% > 10%). If all other words match exactly, it is trusted.
  const totalDeviations =
    (metrics.contextSubstitutions || 0) +
    (metrics.interpolatedTokens || 0) +
    (metrics.ignoredSttTokens || 0);

  if (
    canonicalCount <= 6 &&
    totalDeviations <= 1 &&
    (metrics.exactMatches || 0) >= canonicalCount - 1
  ) {
    return true;
  }

  return false;
}

/**
 * Build a deterministic canonical approximate timeline when STT alignment is degraded or fails.
 * Guarantees:
 * - DISPLAY TEXT = CANONICAL
 * - TIMING MODE = APPROXIMATE
 * - NEVER emits raw STT text
 */
export function buildCanonicalApproximateTimeline({ canonicalText, sttTimeline }) {
  if (!canonicalText || !canonicalText.trim()) {
    throw new Error('Missing canonicalText for approximate timeline generation');
  }

  const canonicalTokens = tokenizeCanonicalScript(canonicalText);
  if (canonicalTokens.length === 0) {
    return {
      duration: Math.max(Number(sttTimeline?.duration) || 0, 1.0),
      segments: [],
      words: [],
    };
  }

  let totalDuration = Number(sttTimeline?.duration) || 0;
  const rawSegments = Array.isArray(sttTimeline?.segments) ? sttTimeline.segments : [];
  if (totalDuration <= 0 && rawSegments.length > 0) {
    totalDuration = rawSegments[rawSegments.length - 1].end || 0;
  }
  if (totalDuration <= 0 && Array.isArray(sttTimeline?.words) && sttTimeline.words.length > 0) {
    totalDuration = sttTimeline.words[sttTimeline.words.length - 1].end || 0;
  }
  if (totalDuration <= 0) {
    totalDuration = Math.max(1.0, canonicalTokens.length * 0.35);
  }
  totalDuration = Math.round(totalDuration * 1000) / 1000;

  // Filter valid segments from STT if available
  const validSegments = rawSegments.filter(
    (s) =>
      typeof s.start === 'number' &&
      typeof s.end === 'number' &&
      !isNaN(s.start) &&
      !isNaN(s.end) &&
      s.end > s.start
  );

  let targetSegments = validSegments;
  if (targetSegments.length === 0) {
    targetSegments = [{ start: 0, end: totalDuration }];
  }

  const segDurations = targetSegments.map((s) => Math.max(0.1, s.end - s.start));
  const totalSegDuration = segDurations.reduce((a, b) => a + b, 0);

  const totalCanonicalChars = canonicalTokens.reduce(
    (sum, t) => sum + Math.max(1, t.clean.length),
    0
  );

  // Partition canonical tokens into targetSegments proportionally
  const segmentTokens = Array.from({ length: targetSegments.length }, () => []);
  let tokenIdx = 0;

  for (let s = 0; s < targetSegments.length; s++) {
    if (s === targetSegments.length - 1) {
      // Last segment takes all remaining tokens
      while (tokenIdx < canonicalTokens.length) {
        segmentTokens[s].push(canonicalTokens[tokenIdx]);
        tokenIdx++;
      }
      break;
    }

    const segRatio = segDurations[s] / totalSegDuration;
    const targetChars = Math.round(totalCanonicalChars * segRatio);
    let accumChars = 0;

    while (tokenIdx < canonicalTokens.length) {
      const remainingTokens = canonicalTokens.length - tokenIdx;
      const remainingSegments = targetSegments.length - s;
      if (remainingTokens <= remainingSegments && segmentTokens[s].length > 0) {
        break;
      }

      const tok = canonicalTokens[tokenIdx];
      segmentTokens[s].push(tok);
      tokenIdx++;
      accumChars += Math.max(1, tok.clean.length);

      if (accumChars >= targetChars && segmentTokens[s].length > 0) {
        break;
      }
    }
  }

  while (tokenIdx < canonicalTokens.length) {
    segmentTokens[segmentTokens.length - 1].push(canonicalTokens[tokenIdx]);
    tokenIdx++;
  }

  // Reconstruct timed segments and words
  const reconstructedSegments = [];
  const timedWords = [];

  for (let s = 0; s < targetSegments.length; s++) {
    const origSeg = targetSegments[s];
    const tokens = segmentTokens[s];

    if (tokens.length === 0) {
      reconstructedSegments.push({
        start: origSeg.start,
        end: origSeg.end,
        text: '',
        words: [],
      });
      continue;
    }

    const segStart = origSeg.start;
    const segEnd = origSeg.end;
    const segDur = Math.max(0.1, segEnd - segStart);
    const segChars = tokens.reduce((sum, t) => sum + Math.max(1, t.clean.length), 0);

    let curTime = segStart;
    const segWords = [];

    tokens.forEach((t, idx) => {
      const charRatio = Math.max(1, t.clean.length) / segChars;
      const wordDur = Math.max(0.04, segDur * charRatio);
      const wStart = curTime;
      let wEnd = idx === tokens.length - 1 ? segEnd : Math.min(segEnd, curTime + wordDur);
      if (wEnd <= wStart) {
        wEnd = wStart + 0.04;
      }
      curTime = wEnd;

      const timedWord = {
        word: t.display,
        start: Math.round(wStart * 1000) / 1000,
        end: Math.round(wEnd * 1000) / 1000,
      };

      segWords.push(timedWord);
      timedWords.push(timedWord);
    });

    reconstructedSegments.push({
      start: origSeg.start,
      end: origSeg.end,
      text: tokens.map((t) => t.display).join(' '),
      words: segWords,
    });
  }

  // Enforce monotonic non-decreasing timing across all words
  for (let i = 0; i < timedWords.length; i++) {
    if (i > 0) {
      if (timedWords[i].start < timedWords[i - 1].start) {
        timedWords[i].start = timedWords[i - 1].start;
      }
      if (timedWords[i].end <= timedWords[i].start) {
        timedWords[i].end = Math.round((timedWords[i].start + 0.05) * 1000) / 1000;
      }
      if (timedWords[i].end < timedWords[i - 1].end) {
        timedWords[i].end = timedWords[i - 1].end;
      }
    }
  }

  return {
    duration: totalDuration,
    segments: reconstructedSegments,
    words: timedWords,
  };
}

/**
 * Main public entry point: Build a complete canonical-aligned timeline from
 * canonical voice script text and STT raw timeline.
 */
export function buildCanonicalTimeline({
  canonicalText,
  sttTimeline,
  policy = DEFAULT_ALIGNMENT_POLICY,
}) {
  if (!canonicalText || !canonicalText.trim()) {
    throw new Error('Missing canonicalText for timeline alignment');
  }
  if (!sttTimeline) {
    throw new Error('Missing sttTimeline for timeline alignment');
  }

  const canonicalTokens = tokenizeCanonicalScript(canonicalText);
  const sttWords = flattenSttWords(sttTimeline);

  const { alignments, diffs, metrics } = alignCanonicalToStt({
    canonicalTokens,
    sttWords,
  });

  const canonicalCount = metrics.canonicalTokenCount || 1;
  const sttCount = metrics.sttTokenCount || 1;

  const evidenceMatches = (metrics.exactMatches || 0) + (metrics.fuzzyMatches || 0);
  const evidenceRatio = evidenceMatches / canonicalCount;
  const substitutionRatio = (metrics.contextSubstitutions || 0) / canonicalCount;
  const interpolationRatio = (metrics.interpolatedTokens || 0) / canonicalCount;
  const ignoredSttRatio = (metrics.ignoredSttTokens || 0) / sttCount;

  const alignmentTrusted = isAlignmentTrusted(metrics, policy);
  const alignmentStatus = alignmentTrusted ? 'TRUSTED' : 'DEGRADED';
  const timingMode = alignmentTrusted ? 'STT_WORD_ALIGNED' : 'CANONICAL_APPROXIMATE';

  let finalTimeline;

  if (alignmentTrusted) {
    const timedWords = assignCanonicalTimings({
      alignments,
      sttTimeline,
    });

    const segments = reconstructSegments({
      canonicalWords: timedWords,
      sttTimeline,
    });

    const words = timedWords.map((w) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    }));

    const lastWord = words[words.length - 1];
    const lastSeg = segments[segments.length - 1];
    const duration = Math.max(
      Number(sttTimeline.duration) || 0,
      lastWord?.end ?? 0,
      lastSeg?.end ?? 0,
    );

    finalTimeline = {
      duration: Math.round(duration * 1000) / 1000,
      segments,
      words,
    };
  } else {
    // If DEGRADED: do NOT keep arbitrary one-to-one substitution timing.
    // Build deterministic canonical approximate timeline.
    finalTimeline = buildCanonicalApproximateTimeline({
      canonicalText,
      sttTimeline,
    });
  }

  const validation = validateCanonicalAlignment({
    canonicalText,
    alignedTimeline: finalTimeline,
  });

  return {
    timeline: finalTimeline,
    diffs,
    metrics: {
      canonicalTokenCount: metrics.canonicalTokenCount,
      sttTokenCount: metrics.sttTokenCount,
      exactMatches: metrics.exactMatches,
      fuzzyMatches: metrics.fuzzyMatches,
      contextSubstitutions: metrics.contextSubstitutions,
      interpolatedTokens: metrics.interpolatedTokens,
      ignoredSttTokens: metrics.ignoredSttTokens,
      evidenceRatio: Math.round(evidenceRatio * 10000) / 10000,
      substitutionRatio: Math.round(substitutionRatio * 10000) / 10000,
      interpolationRatio: Math.round(interpolationRatio * 10000) / 10000,
      ignoredSttRatio: Math.round(ignoredSttRatio * 10000) / 10000,
      canonicalTextIntegrity: validation.canonicalTextIntegrity,
      alignmentStatus,
      timingMode,
      validationErrors: validation.errors,
      canonicalIntegrity: validation.canonicalTextIntegrity, // backward compatibility
    },
  };
}

/**
 * Validate that aligned timeline matches canonical wording and monotonic invariants.
 * Strictly verifies spelling, diacritics, capitalization, and punctuation.
 */
export function validateCanonicalAlignment({ canonicalText, alignedTimeline }) {
  const errors = [];

  if (!alignedTimeline || !Array.isArray(alignedTimeline.words)) {
    return {
      valid: false,
      canonicalTextIntegrity: false,
      errors: ['alignedTimeline missing words array'],
    };
  }

  const words = alignedTimeline.words;

  // 1. Exact Canonical Text Integrity Check (no diacritic or punctuation stripping)
  const expectedDisplay = normalizeDisplayWhitespace(
    tokenizeCanonicalScript(canonicalText)
      .map((t) => t.display)
      .join(' ')
  );

  const actualDisplay = normalizeDisplayWhitespace(
    words.map((w) => w.word).join(' ')
  );

  const canonicalTextIntegrity = actualDisplay === expectedDisplay;

  if (!canonicalTextIntegrity) {
    errors.push(
      `Canonical text integrity mismatch:\nExpected: "${expectedDisplay}"\nActual:   "${actualDisplay}"`,
    );
  }

  // 2. Timing Invariants Check
  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (typeof w.start !== 'number' || typeof w.end !== 'number' || isNaN(w.start) || isNaN(w.end)) {
      errors.push(`Word[${i}] "${w.word}" has invalid timestamp NaN/non-number`);
      continue;
    }

    if (w.start < 0) {
      errors.push(`Word[${i}] "${w.word}" has negative start: ${w.start}`);
    }

    if (w.start > w.end) {
      errors.push(`Word[${i}] "${w.word}" has start (${w.start}) > end (${w.end})`);
    }

    if (i > 0 && w.start < words[i - 1].start) {
      errors.push(
        `Word[${i}] "${w.word}" starts (${w.start}) before word[${i - 1}] starts (${words[i - 1].start})`,
      );
    }

    if (i > 0 && w.end < words[i - 1].end) {
      errors.push(
        `Word[${i}] "${w.word}" ends (${w.end}) before word[${i - 1}] ends (${words[i - 1].end})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    canonicalTextIntegrity,
    errors,
  };
}

/**
 * CLI support for test/verification.
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`
Usage:
  node scripts/subtitle-canonical-aligner.mjs <canonicalTextOrFile> <sttTimelineJsonFile> [--output <path>]
`);
    process.exit(0);
  }

  const [canonicalInput, timelineInput] = args;

  let canonicalText = canonicalInput;
  if (fs.existsSync(canonicalInput)) {
    canonicalText = fs.readFileSync(canonicalInput, 'utf-8');
    // If it's a script.json, extract text
    if (canonicalInput.endsWith('.json')) {
      try {
        const parsed = JSON.parse(canonicalText);
        if (Array.isArray(parsed.script)) {
          canonicalText = parsed.script.map((s) => s.text).join('\n\n');
        }
      } catch {}
    }
  }

  const sttTimeline = JSON.parse(fs.readFileSync(timelineInput, 'utf-8'));

  const result = buildCanonicalTimeline({
    canonicalText,
    sttTimeline,
  });

  const outIdx = args.indexOf('--output');
  if (outIdx !== -1 && args[outIdx + 1]) {
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(result.timeline, null, 2), 'utf-8');
    console.log(`Saved aligned timeline to: ${args[outIdx + 1]}`);
  }

  console.log('Alignment Metrics:', JSON.stringify(result.metrics, null, 2));
  console.log(`Diffs found: ${result.diffs.length}`);
  if (result.diffs.length > 0) {
    console.log('Sample diffs:', result.diffs.slice(0, 5));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
