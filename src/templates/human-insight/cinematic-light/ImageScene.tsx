/**
 * ImageScene.tsx — Animated image display for human-insight/cinematic-light.
 * Identical logic to cinematic-dark variant, imports colors from light tokens.
 */

import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, type KenBurnsConfig } from './tokens';

export interface ImageSceneProps {
  /** Path relative to staticFile root, e.g. "assets/human-insight/images/mountain-hiking-01.png" */
  src: string;
  durationFrames: number;
  kenBurns?: KenBurnsConfig;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export const ImageScene: React.FC<ImageSceneProps> = ({
  src,
  durationFrames,
  kenBurns,
  fadeInFrames = 20,
  fadeOutFrames = 20,
}) => {
  const frame = useCurrentFrame();

  // ── Fade in / out opacity ─────────────────────────────────────────────────
  const opacity = (() => {
    if (fadeInFrames > 0 && frame < fadeInFrames) {
      return interpolate(frame, [0, fadeInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
    const fadeOutStart = durationFrames - fadeOutFrames;
    if (fadeOutFrames > 0 && fadeOutStart < durationFrames && frame >= fadeOutStart) {
      return interpolate(frame, [fadeOutStart, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
    return 1;
  })();

  // ── Ken Burns transform ───────────────────────────────────────────────────
  const transform = (() => {
    if (!kenBurns) return 'scale(1.04)';
    const { direction, startScale = 1.0, endScale = 1.08 } = kenBurns;
    if (durationFrames <= 1) return `scale(${startScale})`;

    switch (direction) {
      case 'zoom-in': {
        const scale = interpolate(frame, [0, durationFrames], [startScale, endScale], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return `scale(${scale})`;
      }
      case 'zoom-out': {
        const scale = interpolate(frame, [0, durationFrames], [endScale, startScale], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return `scale(${scale})`;
      }
      default: {
        const scale = interpolate(frame, [0, durationFrames], [startScale, endScale], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return `scale(${scale})`;
      }
    }
  })();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          transform,
          transformOrigin: 'center center',
        }}
      />
      {/* Light overlay — very subtle, keeps image bright */}
      <div style={{ position: 'absolute', inset: 0, background: COLORS.imageOverlay }} />
      {/* Vignette — warm cream edges */}
      <div style={{ position: 'absolute', inset: 0, background: COLORS.vignette }} />
    </div>
  );
};
