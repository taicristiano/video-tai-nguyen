import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONT_MAIN } from './tokens';

export interface SectionCardProps {
  number: string;
  title: string;
  subtitle?: string;
  durationFrames?: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  number,
  title,
  subtitle,
  durationFrames = 76, // ~2.53 seconds total: 0.3s enter (9f), 1.80s clean hold (54f), 4f text fade, 9f card exit
}) => {
  const frame = useCurrentFrame();

  if (frame >= durationFrames) {
    return null;
  }

  // ── Entrance (frames 0 to 9, ~0.30s): smooth lift + fade-in ─────────────────
  const enterFrames = 9;
  const enterProgress = Math.min(1, Math.max(0, frame / enterFrames));
  const enterY = interpolate(enterProgress, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enterScale = interpolate(enterProgress, [0, 1], [0.98, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enterOpacity = interpolate(enterProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Exit timing: Text fades out FIRST (5 frames) before card dissolves to eliminate ghosting ──
  const cardExitFrames = 9;
  const cardExitStart = Math.max(0, durationFrames - cardExitFrames);
  const textExitDuration = 5;
  const textExitStart = Math.max(enterFrames, cardExitStart - textExitDuration);

  // Text fade out
  const textExitProgress = Math.min(1, Math.max(0, (frame - textExitStart) / textExitDuration));
  const textExitOpacity = interpolate(textExitProgress, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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

  const totalScale = enterScale * cardExitScale;
  const totalCardOpacity = enterOpacity * cardExitOpacity;
  const totalContentOpacity = enterOpacity * textExitOpacity;

  // Tape sticks down with 2 frames delay
  const tapeProgress = Math.min(1, Math.max(0, (frame - 2) / 6));
  const tapeOpacity = interpolate(tapeProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapeY = interpolate(tapeProgress, [0, 1], [-4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 640,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1020,
        height: 638,
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
          padding: '40px 60px',
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
          {/* Washi Tape Deco at top center */}
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

        {/* Section Number (e.g. 01) */}
        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: 82,
            fontWeight: '300',
            color: '#E07A5F',
            letterSpacing: '0.15em',
            marginBottom: 14,
          }}
        >
          {number}
        </div>

        {/* Section Title (e.g. Question) */}
        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: 45,
            fontWeight: '700',
            color: COLORS.text,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.35,
            maxWidth: 880,
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </div>

        {/* Optional Subtitle / Prompt with divider */}
        {subtitle ? (
          <>
            <div
              style={{
                width: 54,
                height: 2,
                background: 'rgba(44, 26, 14, 0.22)',
                borderRadius: 1,
                marginTop: 20,
                marginBottom: 20,
              }}
            />
            <div
              style={{
                fontFamily: FONT_MAIN,
                fontSize: 36,
                fontWeight: '500',
                fontStyle: 'italic',
                color: 'rgba(44, 26, 14, 0.96)',
                letterSpacing: '0.04em',
                textAlign: 'center',
                maxWidth: 820,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          </>
        ) : null}
        </div>
      </div>
    </div>
  );
};
