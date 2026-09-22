/**
 * src/templates/human-insight/cinematic-light/templateDependenciesRuntime.d.mts
 *
 * TypeScript types for templateDependenciesRuntime.mjs.
 */

export interface DurationContract {
  minDurationSec: number;
  preferredMinDurationSec: number;
  preferredMaxDurationSec: number;
  maxDurationSec: number;
  targetMidpointSec: number;
}

export interface TemplateStaticDependencyContract {
  templateId: string;
  brand: string;
  durationContract?: DurationContract;
  required: string[];
  optionalByFeature: {
    backgroundMusic: string[];
    outro: string[];
  };
  defaults: {
    defaultBgMusic: string;
    defaultWatermark: string;
    defaultOutroBrandMark: string;
    defaultOutroArtwork: string;
  };
}

export interface EffectiveTemplateConfig {
  watermarkSrc: string;
  bgMusic: string | null;
  outro: {
    enabled: boolean;
    durationFrames: number;
    artworkSrc: string | null;
    brandMarkSrc: string | null;
  };
  activeDependencies: string[];
}

export interface DependencyResolverOptions {
  contract?: TemplateStaticDependencyContract;
}

export const CINEMATIC_LIGHT_DURATION_CONTRACT: DurationContract;
export const CINEMATIC_LIGHT_DEPENDENCIES: TemplateStaticDependencyContract;

export function resolveEffectiveTemplateConfig(
  spec?: {
    watermarkSrc?: string;
    audioSrc?: string;
    timelineSrc?: string;
    bgMusic?: string | null | false;
    audioMode?: 'full' | 'music' | 'sfx' | 'voice-only';
    outro?: {
      enabled?: boolean;
      durationFrames?: number;
      artworkSrc?: string;
      brandMarkSrc?: string;
    };
    shots?: Array<{ imageSrc?: string }>;
  },
  options?: DependencyResolverOptions
): EffectiveTemplateConfig;

export function resolveTemplateDependencies(
  spec?: {
    watermarkSrc?: string;
    audioSrc?: string;
    timelineSrc?: string;
    bgMusic?: string | null | false;
    audioMode?: 'full' | 'music' | 'sfx' | 'voice-only';
    outro?: {
      enabled?: boolean;
      durationFrames?: number;
      artworkSrc?: string;
      brandMarkSrc?: string;
    };
    shots?: Array<{ imageSrc?: string }>;
  },
  options?: DependencyResolverOptions
): string[];
