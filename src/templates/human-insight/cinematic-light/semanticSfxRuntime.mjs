/**
 * src/templates/human-insight/cinematic-light/semanticSfxRuntime.mjs
 *
 * Restrained semantic SFX resolver for human-insight/cinematic-light.
 */

export const SEMANTIC_SFX_MAP = {
  pageTurn: 'assets/human-insight/sfx/page-turn.wav',
  whoosh: 'assets/human-insight/sfx/whoosh.wav',
};

export function chooseSemanticEntrySfx({
  storyRole,
  role,
  visualContainer,
  container,
  contentMode,
  voiceClause = '',
  narration = '',
  text = '',
  visualIntent = '',
  intent = '',
  isHook = false,
  isStatement = false,
  isEnding = false,
  previousSceneHadSfx = false,
} = {}) {
  const effectiveRole = storyRole || role;
  const effectiveContainer = visualContainer || container || 'canvas';
  const effectiveVoice = voiceClause || narration || text || '';
  const effectiveIntent = visualIntent || intent || '';

  // Always suppress on ending, question, release
  if (isEnding || effectiveRole === 'question' || effectiveRole === 'release') {
    return null;
  }

  // Rule 1: Memory / paper
  if (effectiveRole === 'memory' && effectiveContainer === 'paper') {
    return {
      name: 'pageTurn',
      src: SEMANTIC_SFX_MAP.pageTurn,
      volume: 0.12,
      reason: 'memory-paper semantic transition',
    };
  }

  // Rule 2: Book / page detail
  const bookVoiceKeywords = /(?:lật trang|trang sách|cuốn sách|ghi chép|notebook|\bpage\b|\bbook\b)/i;
  const voiceHasKeywords = bookVoiceKeywords.test(effectiveVoice);
  const intentHasTurningKeywords = /(?:lật trang|turning page|turn the page|flipping page|open book)/i.test(effectiveIntent);

  if (
    (voiceHasKeywords || intentHasTurningKeywords) &&
    (effectiveRole === 'detail-action' || effectiveRole === 'action' || effectiveRole === 'detail')
  ) {
    return {
      name: 'pageTurn',
      src: SEMANTIC_SFX_MAP.pageTurn,
      volume: 0.12,
      reason: 'book-page semantic action',
    };
  }

  // Rule 3: Major statement emphasis
  if (isStatement) {
    if (previousSceneHadSfx) {
      return null;
    }
    return {
      name: 'whoosh',
      src: SEMANTIC_SFX_MAP.whoosh,
      volume: 0.10,
      reason: 'statement emphasis transition',
    };
  }

  // Rule 4: Optional opening reveal
  if (isHook) {
    if (previousSceneHadSfx) {
      return null;
    }
    return {
      name: 'whoosh',
      src: SEMANTIC_SFX_MAP.whoosh,
      volume: 0.08,
      reason: 'opening reveal transition',
    };
  }

  // Rule 5: Everything else
  return null;
}
