import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONT_MAIN, FRAMING } from './tokens';

export interface InsightCardProps {
  /** The insight statement to highlight */
  statement: string;
  authorOrContext?: string;
  subtitle?: string;
  durationFrames?: number;
  framing?: 'standard' | 'focus';
  variant?: 'overlay' | 'card';
}

export const InsightCard: React.FC<InsightCardProps> = ({
  statement,
  authorOrContext,
  subtitle,
  durationFrames = 66, // 0.3s enter (9f) + 1.47s clean still hold (44f) + 4f text fade + 9f card exit = 2.20s total
  framing = 'standard',
  variant = 'overlay',
}) => {
  const frame = useCurrentFrame();

  if (frame >= durationFrames) {
    return null;
  }

  if (variant === 'overlay') {
    const exitFrames = 8;
    const exitStart = Math.max(0, durationFrames - exitFrames);

    const opacity = interpolate(
      frame,
      [0, 8, exitStart, durationFrames],
      [0, 1, 1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      },
    );

    return (
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: framing === 'focus' ? 690 : 720,
          zIndex: 25,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            padding: '28px 38px',
            borderRadius: 24,
            background:
              'linear-gradient(180deg, rgba(255,252,247,0.72), rgba(255,252,247,0.90))',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(48,45,40,0.08)',
            boxShadow: '0 12px 36px rgba(48,45,40,0.08)',
            fontFamily: FONT_MAIN,
            fontSize: 46,
            lineHeight: 1.34,
            fontWeight: 700,
            color: COLORS.text,
            textAlign: 'center',
            whiteSpace: 'pre-line',
          }}
        >
          {statement}
        </div>
      </div>
    );
  }

  const { width, height, top } = FRAMING[framing];

  // ── Entrance: immediate cut-in for hard cut fidelity (zero blank intermediate frame) ──
  const enterY = 0;
  const enterScale = 1.0;
  const enterOpacity = 1.0;

  // ── Exit timing: Card and statement text dissolve TOGETHER (zero blank card window) ──
  const cardExitFrames = 10;
  const cardExitStart = Math.max(0, durationFrames - cardExitFrames);

  // Card background dissolve
  const cardExitProgress = Math.min(1, Math.max(0, (frame - cardExitStart) / cardExitFrames));
  const cardExitScale = interpolate(cardExitProgress, [0, 1], [1.0, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardExitOpacity = interpolate(cardExitProgress, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Statement text dissolves synchronously with card (never leaves a blank white frame)
  const textExitOpacity = cardExitOpacity;

  const totalScale = enterScale * cardExitScale;
  const totalCardOpacity = enterOpacity * cardExitOpacity;
  const totalContentOpacity = enterOpacity * textExitOpacity;

  // Tape sticks down with 2 frames delay
  const tapeProgress = Math.min(1, Math.max(0, (frame - 2) / 6));
  const tapeOpacity = interpolate(tapeProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapeY = interpolate(tapeProgress, [0, 1], [-5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: 'translateX(-50%)',
        width,
        height,
        zIndex: 25,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFFDF9',
          borderRadius: 20,
          border: '1px solid rgba(44, 26, 14, 0.1)',
          boxShadow:
            '0 24px 50px rgba(44, 26, 14, 0.12), 0 6px 18px rgba(44, 26, 14, 0.06)',
          transform: `translateY(${enterY}px) scale(${totalScale})`,
          opacity: totalCardOpacity,
          transformOrigin: 'center center',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 64px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: totalContentOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Washi Tape Deco */}
          <div
            style={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: `translateX(-50%) translateY(${tapeY}px) rotate(-0.5deg)`,
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

        {/* Small editorial prompt / badge */}
        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: 20,
            fontWeight: '600',
            color: '#E07A5F',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          INSIGHT
        </div>

        {/* Statement Typography */}
        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: 48,
            fontWeight: '700',
            color: COLORS.text,
            letterSpacing: '0.04em',
            textAlign: 'center',
            lineHeight: 1.35,
            maxWidth: 860,
            whiteSpace: 'pre-line',
            textTransform: 'uppercase',
          }}
        >
          {statement}
        </div>

        {/* Delicate divider */}
        <div
          style={{
            width: 60,
            height: 2,
            background: 'rgba(44, 26, 14, 0.22)',
            borderRadius: 1,
            marginTop: 26,
            marginBottom: authorOrContext ? 16 : 0,
          }}
        />

        {authorOrContext ? (
          <div
            style={{
              fontFamily: FONT_MAIN,
              fontSize: 22,
              fontWeight: '400',
              fontStyle: 'italic',
              color: 'rgba(44, 26, 14, 0.65)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            {authorOrContext}
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
};
