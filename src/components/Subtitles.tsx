import React, { useEffect, useMemo, useState } from "react";
import { useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

// Load font once at module level
const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Sentence {
  words: WordTimestamp[];
  start: number;
  end: number;
}

interface Timeline {
  duration?: number;
  segments?: unknown[];
  words?: WordTimestamp[];
}

interface Phrase {
  words: WordTimestamp[];
  wordIndices: number[];
  start: number;
  end: number;
}

export interface SubtitlesProps {
  /** Slug used to load public/<slug>/timeline.json (fallback if timelineSrc is omitted) */
  slug?: string;
  /** Explicit timeline JSON path relative to staticFile root (public/). Priority over slug. */
  timelineSrc?: string;
  /** Gap threshold in seconds to split into a new sentence. Default: 0.45s */
  sentenceGap?: number;
  /** Max words per line — sentences longer than this are split into chunks. Default: 7 */
  maxWords?: number;
  /** Highlighting mode: 'phrase' (groups 2-4 words into semantic units), 'plain' (uniform calm sentence), 'statement' (hidden for quote card), or 'word' (karaoke). Default: 'phrase' */
  mode?: 'phrase' | 'plain' | 'statement' | 'word';
  /** Color for the currently active (highlighted) phrase/word. Default: '#2C1A0E' */
  activeColor?: string;
  /** Font size in px. Default: 38 */
  fontSize?: number;
  /** Color for future / inactive words. */
  textColor?: string;
  /** Color for already spoken words. */
  pastColor?: string;
  /** Subtitle placement: 'below-visual' (default bottom: 10.5%), 'overlay-bottom' (bottom: 10%), 'overlay-top' (top: 18%), or 'hidden'. */
  placement?: 'below-visual' | 'overlay-bottom' | 'overlay-top' | 'hidden';
  /** Bottom placement percentage / px string override. Default: '10.5%' */
  bottomPlacement?: string;
  /** Max container width. Default: 920 */
  maxWidth?: number;
  /** Line height. Default: 1.30 */
  lineHeight?: number;
  /** Text shadow for inactive words. */
  textShadow?: string;
  /** Text shadow for active word/phrase. */
  activeTextShadow?: string;
}

// ─── Fixed design constants ───────────────────────────────────────────────────
const DEFAULT_ACTIVE_COLOR = "#2C1A0E";
const TEXT_COLOR = "#2C1A0E";
const PAST_COLOR = "#2C1A0E";

// ─── Split words into sentences by silence gap ────────────────────────────────
function buildSentences(words: WordTimestamp[], gap: number): Sentence[] {
  if (words.length === 0) return [];
  const sentences: Sentence[] = [];
  let current: WordTimestamp[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1].word.trim();
    const hasTerminalPunctuation = /[.?!…]$/.test(prevWord);
    const hasSilenceGap = words[i].start - words[i - 1].end >= gap;

    if (hasTerminalPunctuation || hasSilenceGap) {
      sentences.push({
        words: current,
        start: current[0].start,
        end: current[current.length - 1].end,
      });
      current = [words[i]];
    } else {
      current.push(words[i]);
    }
  }
  sentences.push({
    words: current,
    start: current[0].start,
    end: current[current.length - 1].end,
  });
  return sentences;
}

/**
 * Split a sentence into fixed chunks of maxWords.
 * Each chunk is shown as a stable line — no sliding window.
 */
function chunkSentence(sentence: Sentence, maxWords: number): Sentence[] {
  const chunks: Sentence[] = [];
  const words = sentence.words;
  for (let i = 0; i < words.length; i += maxWords) {
    const slice = words.slice(i, i + maxWords);
    chunks.push({
      words: slice,
      start: slice[0].start,
      end: slice[slice.length - 1].end,
    });
  }
  return chunks;
}

/**
 * Split a chunk into 1-2 semantic phrases for graceful group highlighting.
 */
function getChunkPhrases(words: WordTimestamp[]): Phrase[] {
  if (words.length === 0) return [];
  if (words.length <= 4) {
    return [
      {
        words,
        wordIndices: words.map((_, i) => i),
        start: words[0].start,
        end: words[words.length - 1].end,
      },
    ];
  }
  const splitAt = Math.ceil(words.length / 2);
  const p1 = words.slice(0, splitAt);
  const p2 = words.slice(splitAt);
  return [
    {
      words: p1,
      wordIndices: p1.map((_, i) => i),
      start: p1[0].start,
      end: p1[p1.length - 1].end,
    },
    {
      words: p2,
      wordIndices: p2.map((_, i) => i + splitAt),
      start: p2[0].start,
      end: p2[p2.length - 1].end,
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────
export const Subtitles: React.FC<SubtitlesProps> = ({
  slug,
  timelineSrc,
  sentenceGap = 0.45,
  maxWords = 7,
  mode = 'phrase',
  activeColor = DEFAULT_ACTIVE_COLOR,
  fontSize = 44,
  textColor = TEXT_COLOR,
  pastColor = PAST_COLOR,
  placement = 'below-visual',
  bottomPlacement = '10.5%',
  maxWidth = 920,
  lineHeight = 1.30,
  textShadow,
  activeTextShadow,
}) => {
  const [words, setWords] = useState<WordTimestamp[]>([]);
  const resolvedTimeline = timelineSrc || (slug ? `${slug}/timeline.json` : '');
  const [handle] = useState(() => delayRender(`Loading subtitles: ${resolvedTimeline || slug}`));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    if (!resolvedTimeline) {
      setWords([]);
      continueRender(handle);
      return;
    }
    fetch(staticFile(resolvedTimeline))
      .then((r) => r.json())
      .then((data: Timeline | WordTimestamp[]) => {
        if (Array.isArray(data)) {
          setWords(data);
        } else if (data.words && data.words.length > 0) {
          setWords(data.words);
        } else {
          setWords([]);
        }
        continueRender(handle);
      })
      .catch(() => {
        setWords([]);
        continueRender(handle);
      });
  }, [resolvedTimeline, handle]);

  // Build sentences, then split each into fixed chunks
  const chunks = useMemo(() => {
    const sentences = buildSentences(words, sentenceGap);
    return sentences.flatMap((s) => chunkSentence(s, maxWords));
  }, [words, sentenceGap, maxWords]);

  const currentTime = frame / fps;

  // Active chunk = last chunk whose start <= currentTime
  const chunkIdx = useMemo(() => {
    let active = -1;
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].start <= currentTime) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [chunks, currentTime]);

  if (mode === 'statement' || chunkIdx === -1) return null;

  const chunk = chunks[chunkIdx];
  const phrases = getChunkPhrases(chunk.words);

  // Active phrase index
  let activePhraseIdx = -1;
  const speakingPhraseIdx = phrases.findIndex(
    (p) => currentTime >= p.start && currentTime <= p.end,
  );
  if (speakingPhraseIdx !== -1) {
    activePhraseIdx = speakingPhraseIdx;
  } else {
    for (let i = 0; i < phrases.length; i++) {
      if (phrases[i].start <= currentTime) activePhraseIdx = i;
      else break;
    }
  }

  // Active word index (used only if mode === 'word')
  let highlightWordIdx = -1;
  const speakingWordIdx = chunk.words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end,
  );
  if (speakingWordIdx !== -1) {
    highlightWordIdx = speakingWordIdx;
  } else {
    for (let i = 0; i < chunk.words.length; i++) {
      if (chunk.words[i].start <= currentTime) highlightWordIdx = i;
      else break;
    }
  }

  if (placement === 'hidden') {
    return null;
  }

  const isOverlay = placement === 'overlay-bottom' || placement === 'overlay-top';
  const containerPositionStyle: React.CSSProperties =
    placement === 'overlay-top'
      ? { top: '18%', bottom: 'auto' }
      : placement === 'overlay-bottom'
        ? { bottom: '10%' }
        : { bottom: bottomPlacement };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 48px",
        pointerEvents: "none",
        zIndex: 30,
        ...containerPositionStyle,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          gap: "0 10px",
          flexWrap: "nowrap",
          maxWidth,
          ...(isOverlay
            ? {
                background: "rgba(246, 241, 232, 0.72)",
                padding: "8px 24px",
                borderRadius: 24,
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 12px rgba(48, 45, 40, 0.08)",
              }
            : {}),
        }}
      >
        {chunk.words.map((w, i) => {
          let isActive = false;
          let isPast = false;
          let wordOpacity = 0.52;
          let wordWeight = 500;

          if (mode === 'plain') {
            wordOpacity = 0.88;
            wordWeight = 500;
          } else if (mode === 'phrase') {
            const currentPhrase = activePhraseIdx >= 0 ? phrases[activePhraseIdx] : null;
            isActive = currentPhrase ? currentPhrase.wordIndices.includes(i) : false;
            isPast = activePhraseIdx > 0 && currentPhrase ? i < currentPhrase.wordIndices[0] : false;
            wordOpacity = isActive ? 1.0 : isPast ? 0.42 : 0.52;
            wordWeight = isActive ? 700 : 500;
          } else {
            isActive = i === highlightWordIdx;
            isPast = i < highlightWordIdx;
            wordOpacity = isActive ? 1.0 : isPast ? 0.42 : 0.52;
            wordWeight = isActive ? 700 : 500;
          }

          return (
            <span
              key={`${chunkIdx}-${i}`}
              style={{
                fontFamily,
                fontSize,
                fontWeight: wordWeight,
                lineHeight,
                whiteSpace: "nowrap",
                color: isActive
                  ? activeColor
                  : isPast
                    ? pastColor
                    : textColor,
                opacity: wordOpacity,
                textShadow: isActive
                  ? (activeTextShadow ?? "0 1px 4px rgba(44, 26, 14, 0.12)")
                  : (textShadow ?? "none"),
                // Stable typography: no word-by-word bouncing, peaceful phrase transition
                transition: "color 0.2s ease, opacity 0.2s ease",
                display: "inline-block",
                zIndex: isActive ? 2 : 1,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
