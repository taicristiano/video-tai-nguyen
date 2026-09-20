/**
 * src/templates/human-insight/cinematic-light/brandTypographyTokens.ts
 *
 * HAY & ĐẸP. — V3.5A BRAND + TYPOGRAPHY POLISH
 * Explicit Safe-Zone, Watermark, Title, and Subtitle contract constants.
 * All measurements for 1080x1920 portrait format.
 */

export const BRAND_WATERMARK = {
  /** Exact target asset path relative to project root */
  repoPath: 'public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
  /** Remotion staticFile relative path */
  staticPath: 'assets/hay-dep/brand/logo-full-horizontal-with-slogan.png',
  /** Target width: 270px on 1080x1920 (V1.2.1 visibility patch) */
  width: 270,
  /** Target opacity: 0.34 (clearer on mobile, still restrained/secondary) */
  opacity: 0.34,
  minOpacity: 0.30,
  maxOpacity: 0.38,
  /** Inset from frame edges: 28px top, 32px right (V1.2.1) */
  insetTop: 28,
  insetRight: 32,
  minEdgeInset: 24,
  maxEdgeInset: 40,
  /** Fixed position safe-zone anchor */
  position: 'top-right' as const,
  /** Stability contract: absolute zero transforms / animations */
  animated: false,
  /** Extremely subtle drop shadow for crisp boundary without wash-out */
  dropShadow: '0 1px 2px rgba(44, 40, 32, 0.08)',
  /** Visual bottom safe baseline for clearance calculations */
  safeBottom: 120,
} as const;

export const TITLE_TYPOGRAPHY = {
  /** Maximum width in px to ensure <= 2 lines on mobile */
  maxWidth: 880,
  /** Font size: calm, premium editorial (V1.2 enlarged) */
  fontSize: 58,
  minFontSize: 56,
  maxFontSize: 60,
  /** Line height for comfortable 2-line rhythm */
  lineHeight: 1.18,
  /** Subtle tracking */
  letterSpacing: '-0.015em',
  /** Font weight */
  fontWeight: '700' as const,
  /** Top offset in px: V1.2.1 clearance patch (moved to 145px to avoid watermark competition) */
  top: 145,
  /** Maximum allowable lines */
  maxLines: 2,
  /** Restrained text shadow for subtle contrast */
  textShadow: '0 2px 12px rgba(246, 241, 232, 0.88), 0 1px 3px rgba(44, 26, 14, 0.08)',
} as const;

/** Minimum required visual clearance between watermark footprint and title top (>= 24px) */
export const WATERMARK_TITLE_CLEARANCE = TITLE_TYPOGRAPHY.top - BRAND_WATERMARK.safeBottom;
if (WATERMARK_TITLE_CLEARANCE < 24) {
  throw new Error(`Title/watermark clearance too small: ${WATERMARK_TITLE_CLEARANCE}px < 24px`);
}


export const SUBTITLE_TYPOGRAPHY = {
  /** Consistent max width */
  maxWidth: 920,
  /** Font size: stronger phone readability (V1.2 enlarged) */
  fontSize: 44,
  minFontSize: 42,
  maxFontSize: 46,
  /** Line height */
  lineHeight: 1.30,
  /** Bottom margin percentage: inside mobile-safe lower zone */
  bottomPlacement: '10.5%',
  /** Max words per line chunk */
  maxWords: 7,
  /** Restrained contrast support */
  activeTextShadow: '0 1px 4px rgba(44, 26, 14, 0.10)',
  /** Colors */
  textColor: '#766D66',
  activeColor: '#2C1A0E',
  pastColor: '#8A817A',
} as const;

export const SAFE_ZONES = {
  /** Frame dimensions */
  frameWidth: 1080,
  frameHeight: 1920,
  /** Top Safe Zone (Brand & Persistent Title): y = 0 to 330px */
  topZoneStart: 0,
  topZoneEnd: 330,
  topSafeZoneMin: 120,
  /** Center Artwork Zone: y = 360 to 1400px (lowered for breathing room) */
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
  /** Bottom Subtitle Zone: y = 1400 to 1920px */
  bottomZoneStart: 1400,
  bottomZoneEnd: 1920,
  bottomSafeZoneMin: 180,
} as const;

