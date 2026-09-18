/**
 * ImageScene.tsx — Animated art card display for human-insight/cinematic-light.
 *
 * Concepts:
 *   - 2 Framing Modes:
 *       • standard: 1020x638, top: 640 (balanced layout with title & caption)
 *       • focus:    1040x720, top: 580 (closer look into details, title hidden)
 *   - STABLE Physical Paper Card: The white paper frame and Washi tape remain physically anchored.
 *   - Camera Inside Viewport: The camera moves inside the picture frame (slow zoom & pan).
 *   - 5-Second Organic Reframe: Scene > 5s smoothly reframes at ~5s to follow story.
 *   - Seamless crossfade/morph when paired with SectionCard or InsightCard.
 *   - Clean cinematic shot crossfade on scene exit.
 */

import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FRAMING, type KenBurnsConfig } from './tokens';

export interface ImageSceneProps {
  /** Path relative to staticFile root */
  src: string;
  durationFrames: number;
  kenBurns?: KenBurnsConfig;
  sceneIndex?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  hasSectionCard?: boolean;
  hasInsightCard?: boolean;
  cardDuration?: number;
  framing?: 'standard' | 'focus';
}

export const ImageScene: React.FC<ImageSceneProps> = ({
  src,
  durationFrames,
  kenBurns,
  sceneIndex = 0,
  fadeInFrames = 10,
  fadeOutFrames = 10,
  hasSectionCard = false,
  hasInsightCard = false,
  cardDuration: cardDurationProp,
  framing = 'standard',
}) => {
  const frame = useCurrentFrame();
  const hasOverlayCard = hasSectionCard || hasInsightCard;
  const { width, height, top } = FRAMING[framing];

  const cardDuration = cardDurationProp ?? (hasSectionCard ? 76 : hasInsightCard ? 66 : 0);

  // ── Entrance transition (snappy 10 frames ~0.33s) ─────────────────────────
  let enterProgress = 1;
  let enterY = 0;
  let enterScale = 1.0;
  let enterOpacity = 1;

  if (hasOverlayCard) {
    // Reveal starts earlier (12f for InsightCard, 9f for SectionCard) for seamless dissolve without blank card window
    const cardRevealDuration = hasInsightCard ? 12 : 9;
    const cardRevealStart = Math.max(0, cardDuration - cardRevealDuration);
    enterProgress = Math.min(1, Math.max(0, (frame - cardRevealStart) / cardRevealDuration));
    enterY = interpolate(enterProgress, [0, 1], [4, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    enterScale = interpolate(enterProgress, [0, 1], [0.995, 1.0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    enterOpacity = interpolate(enterProgress, [0, 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    const enterDuration = fadeInFrames || 10;
    enterProgress = Math.min(1, Math.max(0, frame / enterDuration));
    enterY = interpolate(enterProgress, [0, 1], [8, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    enterScale = interpolate(enterProgress, [0, 1], [0.99, 1.0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    enterOpacity = interpolate(enterProgress, [0, 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  // ── Exit transition (snappy 10 frames ~0.33s) ─────────────────────────────
  const exitDuration = fadeOutFrames || 10;
  const exitStart = Math.max(0, durationFrames - exitDuration);
  const exitProgress = Math.min(1, Math.max(0, (frame - exitStart) / exitDuration));
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const totalOpacity = enterOpacity * exitOpacity;
  const totalCardScale = enterScale * exitScale;

  // ── Paper Frame Natural tilt angle ────────────────────────────────────────
  const baseTilt = sceneIndex % 2 === 0 ? -1.1 : 1.1;
  const tiltFrame = hasOverlayCard ? Math.max(0, frame - (cardDuration - 9)) : frame;
  const tiltProgress = Math.min(1, Math.max(0, tiltFrame / 10));
  const dynamicTilt = interpolate(
    tiltProgress,
    [0, 1],
    [baseTilt - 0.25, baseTilt],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // ── Tape placement ────────────────────────────────────────────────────────
  const tapeDelay = hasOverlayCard ? Math.max(0, cardDuration - 7) : 3;
  const tapeProgress = Math.min(1, Math.max(0, (frame - tapeDelay) / 7));
  const tapeOpacity = interpolate(tapeProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapeTranslateY = interpolate(tapeProgress, [0, 1], [-5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Camera Motion: Editorial Shot Framing Beats (Wide -> Medium -> Detail) ─
  let innerScale = 1.0;
  let innerPanX = 0;
  let innerTranslateY = 0;
  let origin = 'center center';

  const cardOffset = hasOverlayCard ? cardDuration : 0;
  const visibleFrames = durationFrames - cardOffset;
  const targetDir = sceneIndex % 2 === 0 ? -1 : 1;

  if (visibleFrames >= 180) {
    // ── Long Scenes (> 6s): 2 Distinct Editorial Shots (Shot A → Shot B) ─────
    // Shot A: scale 1.00, x 0, y 0 (Wide)
    // Shot B: scale 1.06, x -16, y -5 (Medium / Detail)
    // Clear feeling of 2 distinct shots with zero creeping zoom
    let tStart: number;
    let tEnd: number;

    if (sceneIndex === 1) {
      // Scene 2: Bedroom (9–18s)
      // 10–13s SHOT A (until absolute frame 390 = local frame 205)
      // 13–13.7s đổi framing (21 frames = 0.70s, until local frame 226)
      // 13.7–18s SHOT B (held steady at scale 1.08, x -20, y -6)
      tStart = 205;
      tEnd = 226;
    } else if (sceneIndex === 5) {
      // Scene 6: Laptop (40–49s)
      // 40–44s SHOT A (until absolute frame 1320 = local frame 210)
      // 44–44.7s đổi framing (21 frames = 0.70s, until local frame 231)
      // 44.7–49s SHOT B (held steady at scale 1.08, x -20, y -6)
      tStart = 210;
      tEnd = 231;
    } else {
      // General formula for any other scene with visible illustration >= 6s:
      const midFrame = cardOffset + Math.round(visibleFrames * 0.46);
      const halfWin = 10; // 20 frames (~0.67s) smooth transition
      tStart = midFrame - halfWin;
      tEnd = midFrame + halfWin;
    }

    const reframeWindow = tEnd - tStart;

    if (frame < tStart) {
      // Shot A: Wide Framing (Held steady, no creeping zoom)
      innerScale = 1.00;
      innerPanX = 0;
      innerTranslateY = 0;
      origin = 'center center';
    } else if (frame <= tEnd) {
      // Reframe Transition: Hermite easeInOut step to Shot B
      const prog = (frame - tStart) / reframeWindow;
      const s = prog * prog * (3 - 2 * prog); // Hermite smooth step
      innerScale = interpolate(s, [0, 1], [1.00, 1.08]);
      innerPanX = interpolate(s, [0, 1], [0, -20]);
      innerTranslateY = interpolate(s, [0, 1], [0, -6]);
      origin = 'center center';
    } else {
      // Shot B: Medium / Detail Framing (Held steady, no creeping zoom)
      innerScale = 1.08;
      innerPanX = -20;
      innerTranslateY = -6;
      origin = 'center center';
    }
  } else {
    // Shorter scenes (< 6s): Calm held baseline at 1.01 (zero creeping motion)
    innerScale = 1.01;
    innerPanX = 0;
    innerTranslateY = 0;
    origin = 'center center';
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* ── Stable Paper Card Frame ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top,
          width,
          height,
          background: '#FFFDF9',
          padding: 14,
          borderRadius: 20,
          border: '1px solid rgba(44, 26, 14, 0.09)',
          boxShadow:
            '0 24px 50px rgba(44, 26, 14, 0.12), 0 6px 18px rgba(44, 26, 14, 0.06)',
          transform: `translateY(${enterY}px) scale(${totalCardScale}) rotate(${dynamicTilt}deg)`,
          opacity: totalOpacity,
          transformOrigin: 'center center',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Washi Tape Deco (Physically affixed to paper) ───────────────── */}
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: `translateX(-50%) translateY(${tapeTranslateY}px) rotate(-0.5deg)`,
            width: 104,
            height: 28,
            background: 'rgba(235, 220, 195, 0.85)',
            border: '1px dashed rgba(160, 130, 90, 0.35)',
            borderRadius: 2,
            boxShadow: '0 2px 6px rgba(44, 26, 14, 0.08)',
            opacity: tapeOpacity,
            zIndex: 10,
          }}
        />

        {/* ── Image Viewport: Camera moves INSIDE the frame ───────────────── */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            background: '#F7EFE1',
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              transform: `scale(${innerScale}) translateX(${innerPanX}px) translateY(${innerTranslateY}px)`,
              transformOrigin: origin,
            }}
          />

          {/* Light overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: COLORS.imageOverlay,
              pointerEvents: 'none',
            }}
          />

          {/* Vignette — warm cream edges */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: COLORS.vignette,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
