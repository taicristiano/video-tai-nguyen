/**
 * brandTypographyTokensRuntime.mjs
 *
 * Runtime JavaScript module for brand typography and safe-zone constants.
 */

import { CINEMATIC_LIGHT_DEPENDENCIES } from './templateDependenciesRuntime.mjs';

export const HAY_DEP_BRAND = {
  name: CINEMATIC_LIGHT_DEPENDENCIES.brand,
  slogan: 'Điều hay để biết. Điều đẹp để giữ.',
  watermarkStaticPath: CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultWatermark,
  markSageStaticPath: CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultOutroBrandMark,
};

export const BRAND_WATERMARK = {
  repoPath: `public/${CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultWatermark}`,
  staticPath: CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultWatermark,
  width: 270,
  opacity: 0.34,
  minOpacity: 0.30,
  maxOpacity: 0.38,
  insetTop: 28,
  insetRight: 32,
  minEdgeInset: 24,
  maxEdgeInset: 40,
  position: 'top-right',
  animated: false,
  dropShadow: '0 1px 2px rgba(44, 40, 32, 0.08)',
  safeBottom: 120,
};

export const TITLE_TYPOGRAPHY = {
  maxWidth: 880,
  fontSize: 58,
  minFontSize: 56,
  maxFontSize: 60,
  lineHeight: 1.18,
  letterSpacing: '-0.015em',
  fontWeight: '700',
  top: 145,
  maxLines: 2,
  textShadow: '0 2px 12px rgba(246, 241, 232, 0.88), 0 1px 3px rgba(44, 26, 14, 0.08)',
};

export const WATERMARK_TITLE_CLEARANCE = TITLE_TYPOGRAPHY.top - BRAND_WATERMARK.safeBottom;
if (WATERMARK_TITLE_CLEARANCE < 24) {
  throw new Error(`Title/watermark clearance too small: ${WATERMARK_TITLE_CLEARANCE}px < 24px`);
}

export const SUBTITLE_TYPOGRAPHY = {
  maxWidth: 920,
  fontSize: 44,
  minFontSize: 42,
  maxFontSize: 46,
  lineHeight: 1.30,
  bottomPlacement: '10.5%',
  maxWords: 7,
  activeTextShadow: '0 1px 4px rgba(44, 26, 14, 0.10)',
  textColor: '#766D66',
  activeColor: '#2C1A0E',
  pastColor: '#8A817A',
};

export const SAFE_ZONES = {
  frameWidth: 1080,
  frameHeight: 1920,
  topZoneStart: 0,
  topZoneEnd: 330,
  topSafeZoneMin: 120,
  artworkTop: 360,
  artworkBottom: 1400,
  artworkHeight: 1040,
  artworkWidth: 900,
  artworkLeft: 90,
  centerArtworkTop: 360,
  centerArtworkBottom: 1400,
  centerArtworkHeight: 1040,
  centerArtworkWidth: 900,
  centerArtworkLeft: 90,
  bottomZoneStart: 1400,
  bottomZoneEnd: 1920,
  bottomSafeZoneMin: 180,
};
