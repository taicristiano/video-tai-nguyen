export interface SemanticSfxResult {
  name: string;
  src?: string;
  volume: number;
  reason: string;
}

export interface ChooseSemanticSfxOptions {
  storyRole?: string;
  role?: string;
  visualContainer?: string;
  container?: string;
  contentMode?: string;
  voiceClause?: string;
  narration?: string;
  text?: string;
  visualIntent?: string;
  intent?: string;
  isHook?: boolean;
  isStatement?: boolean;
  isEnding?: boolean;
  previousSceneHadSfx?: boolean;
}

export const SEMANTIC_SFX_MAP: Record<string, string>;
export function chooseSemanticEntrySfx(options?: ChooseSemanticSfxOptions): SemanticSfxResult | null;
