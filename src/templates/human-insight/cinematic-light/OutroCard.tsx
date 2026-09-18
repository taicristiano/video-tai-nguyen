import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONT_MAIN, TYPOGRAPHY } from './tokens';

export interface OutroCardProps {
  watermarkSrc?: string;
  slogan?: string;
  durationFrames?: number;
}

export const OutroCard: React.FC<OutroCardProps> = ({
  watermarkSrc = 'watermark.png',
  slogan = 'Sống tốt hơn từ những điều nhỏ.',
  durationFrames = 60, // 2 seconds at 30fps
}) => {
  const frame = useCurrentFrame();

  // Clean ending flow: logo begins fading in earlier by 0.17s (5 frames), eliminating blank screen gap
  const logoDelayFrames = 1;
  const logoFadeDuration = 13;
  const enterProgress = Math.min(1, Math.max(0, (frame - logoDelayFrames) / logoFadeDuration));
  const opacity = interpolate(enterProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(enterProgress, [0, 1], [0.98, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        <Img
          src={staticFile(watermarkSrc)}
          style={{
            height: 140,
            width: 'auto',
            opacity: 0.95,
            objectFit: 'contain',
            marginBottom: 24,
          }}
        />

        {slogan ? (
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
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
