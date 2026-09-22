/**
 * src/templates/human-insight/cinematic-light/contentParser.ts
 *
 * TypeScript wrapper for contentParserRuntime.mjs
 */

export type {
  HumanInsightDurationPreference,
  ParsedHumanInsightContent,
} from './contentParserRuntime.mjs';

export {
  normalizeCanonicalVoice,
  parseHumanInsightContent,
} from './contentParserRuntime.mjs';
