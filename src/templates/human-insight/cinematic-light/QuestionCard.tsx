import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONT_MAIN } from './tokens';

export interface QuestionCardProps {
  /** Canonical question text */
  question: string;
  subtitle?: string;
  durationFrames?: number;
  framing?: 'standard' | 'focus';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  subtitle,
  durationFrames = 76,
  framing = 'focus',
}) => {
  const frame = useCurrentFrame();

  if (frame >= durationFrames) {
    return null;
  }

  // Hard cut entry and full visual coverage with zero blank boundary frames
  return (
    <div
      style={{
        position: 'absolute',
        top: 360,
        left: 90,
        width: 900,
        height: 1040,
        borderRadius: 36,
        backgroundColor: '#FFFCF7',
        border: '1px solid rgba(48, 45, 40, 0.08)',
        boxShadow: '0 16px 48px rgba(48, 45, 40, 0.08)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 56px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        opacity: 1,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MAIN,
          fontSize: 48,
          lineHeight: 1.34,
          fontWeight: 700,
          color: COLORS.text,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          maxWidth: 780,
        }}
      >
        {question}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 24,
            fontFamily: FONT_MAIN,
            fontSize: 28,
            lineHeight: 1.4,
            fontWeight: 400,
            color: COLORS.textMuted,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
