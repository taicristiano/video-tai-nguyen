/**
 * Layout.tsx — Persistent frame for human-insight/cinematic-light template.
 *
 * Renders fixed elements that never change across scenes:
 *   - Radial gradient light background (warm cream #FAECD2)
 *   - Title: floats at top: 15%, bold 48px, capitalize, dark brown shadow
 *   - Subtitles: word-by-word highlight in dark amber, floats at bottom
 *   - Optional background music using the per-track manifest volume
 *
 * Image (children) fills the full frame via AbsoluteFill.
 * No header zone, no logo, no border.
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BackgroundMusic } from '../../../components/BackgroundMusic';
import { Subtitles } from '../../../components/Subtitles';
import { COLORS, FONT_MAIN, LAYOUT, TYPOGRAPHY } from './tokens';

export interface LayoutProps {
  slug: string;
  title: string;
  bgMusic?: string | null;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  slug,
  title,
  bgMusic = null,
  children,
}) => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>

      {/* ── Background music ─────────────────────────────────────────────── */}
      <BackgroundMusic src={bgMusic} />

      {/* ── Image zone — full frame ──────────────────────────────────────── */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>

      {/* ── Title — fixed at 15% from top, floats over image ────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: LAYOUT.paddingH,
          paddingRight: LAYOUT.paddingH,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MAIN,
            fontSize: TYPOGRAPHY.titleSize,
            fontWeight: TYPOGRAPHY.titleWeight,
            color: COLORS.text,
            letterSpacing: TYPOGRAPHY.titleLetterSpacing,
            textAlign: 'center',
            lineHeight: 1.25,
            textTransform: 'capitalize',
            // Dark shadow on light bg — inverted from dark variant
            textShadow: '0 0 30px rgba(44,26,14,0.25), 0 2px 8px rgba(44,26,14,0.4)',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {title}
        </div>
      </div>

      {/* ── Subtitles — floats over image at bottom ──────────────────────── */}
      <Subtitles
        slug={slug}
        activeColor={COLORS.subtitleAccent}
        fontSize={TYPOGRAPHY.subtitleSize}
      />

    </AbsoluteFill>
  );
};
