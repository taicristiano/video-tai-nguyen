/**
 * src/templates/human-insight/cinematic-light/contentParserRuntime.mjs
 *
 * Unified Content Parser for HAY & ĐẸP. (human-insight/cinematic-light).
 *
 * Supports:
 *   1. Legacy 100-video format (Kịch bản voice, Ưu tiên visual, Yêu cầu dựng, Statement)
 *   2. New concise format (VOICE — CANONICAL, INSIGHT CHÍNH, VISUAL SEMANTICS, STATEMENT GẦN CUỐI, FINAL QUESTION — CANONICAL)
 *
 * Guarantees:
 *   - CANONICAL VOICE PRESERVATION: Exact normalized text equality (zero rewriting, zero paraphrasing, zero CTA/brand injection).
 */

/**
 * Normalizes voice text for comparison and TTS without changing words.
 * Trims extra whitespace, normalizes CRLF -> LF, collapses multiple blank lines.
 */
export function normalizeCanonicalVoice(rawVoice) {
  if (!rawVoice || typeof rawVoice !== 'string') return '';
  return rawVoice
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Parses a content string in either legacy or concise format.
 *
 * @param {string} rawInput
 * @param {object} [fallbackMeta={}]
 * @returns {{
 *   part: string,
 *   series: string,
 *   title: string,
 *   canonicalVoice: string,
 *   primaryInsight: string,
 *   visualSemantics: string[],
 *   statementText: string,
 *   finalQuestionText: string,
 *   durationPreference: { allowed: [number, number], preferred: [number, number] },
 *   format: 'concise' | 'legacy' | 'unstructured'
 * }}
 */
export function parseHumanInsightContent(rawInput, fallbackMeta = {}) {
  const text = (rawInput || '').trim();

  // Strip leading /gen-video command line if present
  const content = text.replace(/^\/gen-video[^\n]*\n+/i, '').trim();

  // Detect format
  const isConcise = /VOICE\s*[-—]\s*CANONICAL/i.test(content) || /FINAL\s+QUESTION\s*[-—]\s*CANONICAL/i.test(content);
  const isLegacy = /Kịch\s+bản\s+voice\s*:/i.test(content);

  // 1. Part / Index
  const partMatch = content.match(/(?:phần|phan|part)\s*:\s*([a-zA-Z0-9_-]+)/i);
  const part = partMatch
    ? partMatch[1]
    : (fallbackMeta.part != null && String(fallbackMeta.part).trim() !== ''
        ? String(fallbackMeta.part)
        : (fallbackMeta.index != null && String(fallbackMeta.index).trim() !== ''
            ? String(fallbackMeta.index)
            : '1'));

  // 2. Series (ĐẸP. or HAY.)
  const seriesMatch = content.match(/Series\s*:\s*([^\r\n]+)/i);
  const series = seriesMatch ? seriesMatch[1].trim() : (fallbackMeta.series || 'HAY & ĐẸP.');

  // 3. Title
  const titleMatch = content.match(/Tiêu\s+đề\s*:\s*\r?\n([^\r\n]+)/i) ||
                     content.match(/Tiêu\s+đề\s*:\s*([^\r\n]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : (fallbackMeta.title || '');

  // 4. Duration Preference
  let durationPreference = {
    allowed: [70, 85],
    preferred: [75, 80],
  };
  const durationMatch =
    content.match(/(?:Thời\s+lượng(?:\s+mục\s+tiêu)?)\s*:\s*\r?\n?([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:Sweet\s+spot|Tiêu\s+đề|VOICE|Kịch\s+bản|Phần|Series|Brand|Slogan)|$)/i);
  if (durationMatch) {
    const durStr = durationMatch[1];
    const allowedRange = durStr.match(/(\d+)\s*[-—–]\s*(\d+)\s*giây/i);
    if (allowedRange) {
      durationPreference.allowed = [parseInt(allowedRange[1], 10), parseInt(allowedRange[2], 10)];
    }
  }
  const sweetSpotMatch = content.match(/(?:Sweet\s+spot|Tối\s+ưu|Ưu\s+tiên)\s*:\s*(\d+)\s*[-—–]\s*(\d+)\s*giây/i);
  if (sweetSpotMatch) {
    durationPreference.preferred = [parseInt(sweetSpotMatch[1], 10), parseInt(sweetSpotMatch[2], 10)];
  }

  let canonicalVoice = '';
  let primaryInsight = '';
  let visualSemantics = [];
  let visualDirection = '';
  let statementText = '';
  let finalQuestionText = '';

  if (isConcise) {
    // ── Concise Format Parser ──
    const voiceMatch = content.match(/VOICE\s*[-—]\s*CANONICAL\s*:\s*\r?\n([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:INSIGHT CHÍNH|VISUAL SEMANTICS|STATEMENT GẦN CUỐI|FINAL QUESTION|Series|Phần|Tiêu đề)|$)/i);
    canonicalVoice = voiceMatch ? normalizeCanonicalVoice(voiceMatch[1]) : '';

    const insightMatch = content.match(/INSIGHT\s+CHÍNH\s*:\s*\r?\n?([^\r\n]+)/i);
    primaryInsight = insightMatch ? insightMatch[1].trim() : '';

    const visualMatch =
      content.match(/(?:VISUAL\s+SEMANTICS|Ưu\s+tiên\s+visual|Visual\s+direction)\s*:?\s*\r?\n([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:STATEMENT\s+GẦN\s+CUỐI|STATEMENT|FINAL\s+QUESTION|Series|Phần|Tiêu\s+đề)|$)/i);
    if (visualMatch) {
      visualSemantics = visualMatch[1]
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]+\s*/, '').replace(/[.;,]+$/, '').trim())
        .filter(Boolean);
    }

    const statementMatch = content.match(/STATEMENT\s+GẦN\s+CUỐI\s*:\s*\r?\n?["“]?([^"”\r\n]+)["”]?/i);
    statementText = statementMatch ? statementMatch[1].trim() : '';

    const questionMatch = content.match(/FINAL\s+QUESTION(?:\s*[-—]\s*CANONICAL)?\s*:\s*\r?\n?["“]?([^"”\r\n?]+[?])["”]?/i) ||
                          content.match(/FINAL\s+QUESTION(?:\s*[-—]\s*CANONICAL)?\s*:\s*\r?\n?([^\r\n]+)/i);
    finalQuestionText = questionMatch ? questionMatch[1].trim() : '';

  } else if (isLegacy) {
    // ── Legacy 100-Video Format Parser ──
    const voiceMatch = content.match(/Kịch\s+bản\s+voice\s*:\s*\r?\n([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:Visual direction|Ưu tiên visual|Yêu cầu dựng|Tương tác cuối video|Statement|FINAL QUESTION)|$)/i);
    canonicalVoice = voiceMatch ? normalizeCanonicalVoice(voiceMatch[1]) : '';

    const visualDirMatch = content.match(/Visual\s+direction\s*:\s*\r?\n?([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:Ưu tiên visual|Yêu cầu dựng|Tương tác cuối video|Statement|FINAL QUESTION)|$)/i);
    visualDirection = visualDirMatch ? visualDirMatch[1].trim() : '';

    const visualMatch =
      content.match(/(?:Ưu\s+tiên\s+visual|VISUAL\s+SEMANTICS)\s*:?\s*\r?\n([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:Yêu\s+cầu\s+dựng|Tương\s+tác\s+cuối\s+video|Statement|FINAL\s+QUESTION|Visual\s+direction)|$)/i) ||
      content.match(/Visual\s+direction\s*:?\s*\r?\n([\s\S]*?)(?=(?:\r?\n\s*\r?\n|\r?\n)(?:Yêu\s+cầu\s+dựng|Tương\s+tác\s+cuối\s+video|Statement|FINAL\s+QUESTION)|$)/i);
    if (visualMatch) {
      visualSemantics = visualMatch[1]
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]+\s*/, '').replace(/[.;,]+$/, '').trim())
        .filter(Boolean);
    }

    // Statement can be explicitly formatted or embedded inside "Yêu cầu dựng"
    const statementMatch =
      content.match(/(?:[-*•]\s*)?Statement\s+gần\s+cuối\s+ưu\s+tiên\s+tinh\s+thần\s*:\s*["“]?([^"”\r\n]+)["”]?/i) ||
      content.match(/(?:[-*•]\s*)?Statement\s*:\s*\r?\n?["“]?([^"”\r\n]+)["”]?/i) ||
      content.match(/(?:[-*•]\s*)?STATEMENT\s+GẦN\s+CUỐI\s*:\s*\r?\n?["“]?([^"”\r\n]+)["”]?/i);
    statementText = statementMatch ? statementMatch[1].trim().replace(/^["“]+|["”]+$/g, '') : '';

    // Final question can be in "Câu hỏi gợi ý", "Tương tác cuối video", or explicitly labeled
    const questionMatch =
      content.match(/(?:[-*•]\s*)?Câu\s+hỏi\s+gợi\s+ý\s*:\s*["“]?([^"”\r\n]+)["”]?/i) ||
      content.match(/FINAL\s+QUESTION(?:\s*[-—]\s*CANONICAL)?\s*:\s*\r?\n?["“]?([^"”\r\n?]+[?])["”]?/i) ||
      content.match(/FINAL\s+QUESTION(?:\s*[-—]\s*CANONICAL)?\s*:\s*\r?\n?([^\r\n]+)/i);
    finalQuestionText = questionMatch ? questionMatch[1].trim().replace(/^["“]+|["”]+$/g, '') : '';

  } else {
    // Fallback unstructured
    canonicalVoice = normalizeCanonicalVoice(content);
  }

  // Derive final question from canonical voice if not explicitly separated
  if (!finalQuestionText && canonicalVoice) {
    const sentences = canonicalVoice.split(/(?<=[.?!\n])\s+/).filter(Boolean);
    const lastSentence = sentences[sentences.length - 1];
    if (lastSentence && lastSentence.includes('?')) {
      finalQuestionText = lastSentence.trim();
    }
  }

  return {
    part,
    series,
    title,
    canonicalVoice,
    primaryInsight,
    visualSemantics,
    visualDirection,
    statementText,
    statement: statementText,
    finalQuestionText,
    question: finalQuestionText,
    durationPreference,
    format: isConcise ? 'concise' : isLegacy ? 'legacy' : 'unstructured',
  };
}
