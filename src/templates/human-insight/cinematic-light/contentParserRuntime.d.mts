export interface HumanInsightDurationPreference {
  allowed: [number, number];
  preferred: [number, number];
}

export interface ParsedHumanInsightContent {
  part: string;
  series: string;
  title: string;
  canonicalVoice: string;
  primaryInsight: string;
  visualSemantics: string[];
  visualDirection?: string;
  statementText: string;
  statement?: string;
  finalQuestionText: string;
  question?: string;
  durationPreference: HumanInsightDurationPreference;
  format: 'concise' | 'legacy' | 'unstructured';
}

export function normalizeCanonicalVoice(rawVoice: string): string;
export function parseHumanInsightContent(rawInput: string, fallbackMeta?: Record<string, any>): ParsedHumanInsightContent;
