import React, { useState } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONT_MAIN, TYPOGRAPHY } from './tokens';

export interface OutroCardProps {
  artworkSrc?: string;
  brandName?: string;
  slogan?: string;
  durationFrames?: number;
}

export const OutroCard: React.FC<OutroCardProps> = ({
  artworkSrc = 'assets/human-insight/brand/outro-9-16.png',
  brandName = 'HAY & ĐẸP.',
  slogan = 'Điều hay để biết. Điều đẹp để giữ.',
  durationFrames = 60, // 2.0s at 30fps
}) => {
  const frame = useCurrentFrame();
  const [artworkFailed, setArtworkFailed] = useState(false);

  // ── Motion Contract V2: 60f total, fade-in 8-10f, scale 1.02 -> 1.00 (book closing feel) ──
  const fadeDuration = 9;
  const opacity = interpolate(frame, [0, fadeDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, durationFrames], [1.02, 1.00], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fallback to clean React typography outro if artwork is missing or failed
  if (!artworkSrc || artworkFailed) {
    return (
      <AbsoluteFill
        style={{
          background: COLORS.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={staticFile('assets/human-insight/brand/hay-dep-mark-sage.png')}
          style={{
            height: 120,
            width: 'auto',
            opacity: 0.88,
            objectFit: 'contain',
            marginBottom: 20,
          }}
          onError={() => {
            // If sage mark fails, try default mark
          }}
        />

        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: 38,
            fontWeight: '700',
            color: COLORS.text,
            letterSpacing: '0.08em',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          {brandName}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 6,
          }}
        >
          <div
            style={{
              width: 48,
              height: 1,
              background: 'rgba(44, 26, 14, 0.3)',
            }}
          />
          <div
            style={{
              fontFamily: FONT_MAIN,
              fontSize: TYPOGRAPHY.sloganSize,
              fontWeight: '500',
              color: COLORS.text,
              opacity: 0.88,
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}
          >
            {slogan}
          </div>
          <div
            style={{
              width: 48,
              height: 1,
              background: 'rgba(44, 26, 14, 0.3)',
            }}
          />
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Img
          src={staticFile(artworkSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => setArtworkFailed(true)}
        />
      </div>
    </AbsoluteFill>
  );
};
