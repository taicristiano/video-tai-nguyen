/**
 * src/templates/human-insight/cinematic-light/templateDependenciesRuntime.mjs
 *
 * HAY & ĐẸP. — Template Static Dependency Contract & Resolver.
 * Single source of truth for all runtime assets required by human-insight/cinematic-light.
 */

export const CINEMATIC_LIGHT_DEPENDENCIES = {
  templateId: 'human-insight/cinematic-light',
  brand: 'HAY & ĐẸP.',
  required: [
    'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
  ],
  optionalByFeature: {
    backgroundMusic: [
      'assets/human-insight/music/music-bg-2.mp3',
    ],
    outro: [
      'assets/human-insight/brand/hay-dep-mark-sage.png',
      'assets/human-insight/brand/outro-9-16.png',
    ],
  },
  defaults: {
    defaultBgMusic: 'assets/human-insight/music/music-bg-2.mp3',
    defaultWatermark: 'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
    defaultOutroBrandMark: 'assets/human-insight/brand/hay-dep-mark-sage.png',
    defaultOutroArtwork: 'assets/human-insight/brand/outro-9-16.png',
  },
};

/**
 * Resolves the unified effective configuration and static dependency list for a spec.
 * Used identically across Remotion runtime, build-production-render-spec,
 * production-spec-adapter (validator), and package-production.
 *
 * @param {object} [spec={}]
 * @param {object} [options={}]
 * @param {object} [options.contract]
 * @returns {{
 *   watermarkSrc: string,
 *   bgMusic: string | null,
 *   outro: { enabled: boolean, durationFrames: number, artworkSrc: string | null, brandMarkSrc: string | null },
 *   activeDependencies: string[]
 * }}
 */
export function resolveEffectiveTemplateConfig(spec = {}, options = {}) {
  const contract = options.contract || CINEMATIC_LIGHT_DEPENDENCIES;

  // 1. Watermark: explicit override > template default
  const effectiveWatermark = spec.watermarkSrc || contract.defaults?.defaultWatermark;

  // 2. Background Music: null/false => disabled, string => override, undefined => template default
  const effectiveBgMusic =
    spec.bgMusic === false || spec.bgMusic === null
      ? null
      : typeof spec.bgMusic === 'string' && spec.bgMusic.trim().length > 0
      ? spec.bgMusic.trim()
      : contract.defaults?.defaultBgMusic;

  // 3. Outro: conditional on outro.enabled
  const outroEnabled = Boolean(spec.outro?.enabled);
  const effectiveOutroArtwork = outroEnabled
    ? spec.outro?.artworkSrc || contract.defaults?.defaultOutroArtwork
    : null;
  const effectiveOutroBrandMark = outroEnabled
    ? spec.outro?.brandMarkSrc || contract.defaults?.defaultOutroBrandMark
    : null;
  const outroDurationFrames = outroEnabled ? (spec.outro?.durationFrames ?? 60) : 0;

  // 4. Resolve static dependencies relative to public/
  const activeDependencies = [];

  function addDep(ref) {
    if (!ref || typeof ref !== 'string') return;
    const clean = ref.replace(/^[/\\]+/, '').replace(/^public[/\\]/, '').replace(/\\/g, '/').trim();
    if (clean && !activeDependencies.includes(clean)) {
      activeDependencies.push(clean);
    }
  }

  // Contract base required
  for (const dep of contract.required || []) {
    addDep(dep);
  }

  // Watermark
  addDep(effectiveWatermark);

  // Audio and Timeline
  addDep(spec.audioSrc);
  addDep(spec.timelineSrc);

  // Effective Background Music (if not disabled)
  if (effectiveBgMusic) {
    addDep(effectiveBgMusic);
  }

  // Outro assets (if enabled)
  if (outroEnabled) {
    if (effectiveOutroBrandMark) addDep(effectiveOutroBrandMark);
    if (effectiveOutroArtwork) addDep(effectiveOutroArtwork);
  }

  // Shot images
  for (const shot of spec.shots || []) {
    if (shot.imageSrc) {
      addDep(shot.imageSrc);
    }
  }

  return {
    watermarkSrc: effectiveWatermark,
    bgMusic: effectiveBgMusic,
    outro: {
      enabled: outroEnabled,
      durationFrames: outroDurationFrames,
      artworkSrc: effectiveOutroArtwork,
      brandMarkSrc: effectiveOutroBrandMark,
    },
    activeDependencies,
  };
}

/**
 * Resolves all static file dependencies (relative to public/) required by a production spec.
 * Delegates to resolveEffectiveTemplateConfig to ensure 100% parity with runtime and packager.
 *
 * @param {object} [spec={}]
 * @param {object} [options={}]
 * @returns {string[]}
 */
export function resolveTemplateDependencies(spec = {}, options = {}) {
  return resolveEffectiveTemplateConfig(spec, options).activeDependencies;
}
