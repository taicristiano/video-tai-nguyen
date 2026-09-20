/**
 * Layout.tsx — Persistent frame for human-insight/cinematic-light template (V2).
 *
 * Upgrades in V2:
 *   - Normal headline opacity target: 0.82–0.90 (0.86) — stable visual anchor
 *   - Slogan only during intro (0–4.5s) and outro; hidden in normal narrative scenes
 *   - Logo mark uses dark-sage transparent asset (assets/human-insight/brand/hay-dep-mark-sage.png)
 *   - Logo mark is small, persistent, opacity ~0.82, never competing with headline
 *   - Header breathing is gentle and restricted (<= ±0.4%)
 *   - Statement and Question cards suppress headline cleanly during card holds
 */

import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BackgroundMusic } from '../../../components/BackgroundMusic';
import { Subtitles } from '../../../components/Subtitles';
import { AtmosphericCanvas } from './AtmosphericCanvas';
import { COLORS, FONT_MAIN, LAYOUT, TYPOGRAPHY } from './tokens';
import { BRAND_WATERMARK, TITLE_TYPOGRAPHY, SUBTITLE_TYPOGRAPHY, SAFE_ZONES } from './brandTypographyTokens';

export interface SceneWindowInfo {
  startFrame: number;
  durationFrames: number;
  type?: string;
  layout?: 'standard' | 'focus' | 'statement' | 'chapter';
  headerMode?: 'full' | 'dimmed' | 'logo-only' | 'hidden';
  captionMode?: 'plain' | 'phrase' | 'statement';
  titleMode?: 'intro-only' | 'scene' | 'hidden';
  captionPlacement?: 'below-visual' | 'overlay-bottom' | 'overlay-top' | 'hidden';
  hasSectionCard?: boolean;
  hasInsightCard?: boolean;
  cardDuration?: number;
  isOutro?: boolean;
}

export interface LayoutProps {
  slug: string;
  title: string;
  bgMusic?: string | null;
  watermarkSrc?: string;
  slogan?: string;
  scenes?: SceneWindowInfo[];
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  slug,
  title,
  bgMusic = null,
  watermarkSrc = BRAND_WATERMARK.staticPath,
  slogan = 'Điều hay để biết. Điều đẹp để giữ.',
  scenes,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress from 0 to 100%
  const progress = durationInFrames > 0 ? (frame / durationInFrames) * 100 : 0;

  // ── Header Breathing Contract V2: Restrained subtle motion (amplitude <= ±0.4%, cycle ~4s) ──
  const headerBreath = 1 + Math.sin((frame / 30) * Math.PI * 0.5) * 0.004;

  // ── Slogan Contract: Only present during intro (frames 0 to 110), fades out by frame 125 ──
  const sloganIntroOpacity = interpolate(frame, [100, 125], [0.88, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const showSlogan = slogan && frame < 125 && sloganIntroOpacity > 0.01;

  const outroScene = scenes?.find((s) => s.isOutro);
  const currentScene = scenes?.find(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.durationFrames,
  );
  const isOutroActive = Boolean(currentScene?.isOutro || (outroScene && frame >= outroScene.startFrame));

  // Derive questionStartFrame from first scene where type === 'ending' && !isOutro
  const questionScene = scenes?.find((s) => s.type === 'ending' && !s.isOutro);
  const questionStartFrame = questionScene
    ? questionScene.startFrame
    : (outroScene ? outroScene.startFrame : durationInFrames);
  const isQuestionScene = frame >= questionStartFrame && !isOutroActive;

  // ── Persistent Topic Title Anchor (P0.2) ──
  // Visible across narrative from frame 0 until questionStartFrame
  // Stable opacity ~0.92, hidden on Question & Outro
  let finalTitleOpacity = 0;
  if (!isQuestionScene && !isOutroActive && frame < questionStartFrame) {
    if (frame < 12) {
      finalTitleOpacity = interpolate(frame, [0, 12], [0, 0.92], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (frame >= questionStartFrame - 12) {
      finalTitleOpacity = interpolate(frame, [questionStartFrame - 12, questionStartFrame], [0.92, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else {
      finalTitleOpacity = 0.92;
    }
  }

  let headerOpacity = 1.0;
  let activeCaptionMode: 'phrase' | 'plain' | 'statement' = 'phrase';
  let activeCaptionPlacement: 'below-visual' | 'overlay-bottom' | 'overlay-top' | 'hidden' =
    currentScene?.captionPlacement ?? 'below-visual';

  if (isOutroActive) {
    // Dedicated Outro Scene: header & subtitle hidden for clean centered branding
    headerOpacity = 0;
    finalTitleOpacity = 0;
    activeCaptionMode = 'statement';
    activeCaptionPlacement = 'hidden';
  } else if (outroScene && frame >= outroScene.startFrame - 20 && frame < outroScene.startFrame) {
    // Smooth dissolution into outro (last 20 frames before outro starts)
    const outroTransition = interpolate(
      frame,
      [outroScene.startFrame - 20, outroScene.startFrame],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    headerOpacity = interpolate(outroTransition, [0, 1], [1.0, 0]);
    finalTitleOpacity = 0;
    activeCaptionMode = 'phrase';
  } else if (isQuestionScene) {
    finalTitleOpacity = 0;
    headerOpacity = 1.0;
    activeCaptionMode = 'statement';
    activeCaptionPlacement = 'hidden';
  }

  return (
    <AtmosphericCanvas>
      {/* ── Minimalist Top Progress Bar (2px thin) ───────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(44, 26, 14, 0.08)',
          zIndex: 50,
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: COLORS.accentTerracotta,
            borderRadius: '0 1px 1px 0',
          }}
        />
      </div>

      {/* ── Background music ─────────────────────────────────────────────── */}
      <BackgroundMusic src={bgMusic} />

      {/* ── Image zone — center-focused ──────────────────────────────────── */}
      <AbsoluteFill style={{ zIndex: 5 }}>
        {children}
      </AbsoluteFill>

      {/* ── Persistent Watermark Logo (Fixed top-right, static, V1.2.1 0.34 opacity) ── */}
      {watermarkSrc && !isOutroActive ? (
        <div
          style={{
            position: 'absolute',
            top: BRAND_WATERMARK.insetTop,
            right: BRAND_WATERMARK.insetRight,
            width: BRAND_WATERMARK.width,
            pointerEvents: 'none',
            zIndex: 25,
            opacity: BRAND_WATERMARK.opacity,
            filter: BRAND_WATERMARK.dropShadow
              ? `drop-shadow(${BRAND_WATERMARK.dropShadow})`
              : undefined,
          }}
        >
          <Img
            src={staticFile(watermarkSrc)}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>
      ) : null}

      {/* ── Persistent Topic Title Anchor (top=120px, max 2 lines, maxWidth 880px) ── */}
      <div
        style={{
          position: 'absolute',
          top: TITLE_TYPOGRAPHY.top,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20,
          opacity: finalTitleOpacity,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: TITLE_TYPOGRAPHY.maxWidth,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 40px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: FONT_MAIN,
              fontSize: TITLE_TYPOGRAPHY.fontSize,
              fontWeight: TITLE_TYPOGRAPHY.fontWeight,
              color: COLORS.text,
              opacity: 0.92,
              lineHeight: TITLE_TYPOGRAPHY.lineHeight,
              textAlign: 'center',
              letterSpacing: TITLE_TYPOGRAPHY.letterSpacing,
              textShadow: TITLE_TYPOGRAPHY.textShadow,
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: TITLE_TYPOGRAPHY.maxLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
        </div>
      </div>

      {/* ── Subtitles — dynamic phrase/plain/statement mode with adaptive placement ── */}
      {!isOutroActive && activeCaptionPlacement !== 'hidden' ? (
        <Subtitles
          slug={slug}
          mode={activeCaptionMode}
          placement={activeCaptionPlacement}
          bottomPlacement={SUBTITLE_TYPOGRAPHY.bottomPlacement}
          maxWidth={SUBTITLE_TYPOGRAPHY.maxWidth}
          lineHeight={SUBTITLE_TYPOGRAPHY.lineHeight}
          maxWords={SUBTITLE_TYPOGRAPHY.maxWords}
          activeColor={SUBTITLE_TYPOGRAPHY.activeColor}
          fontSize={SUBTITLE_TYPOGRAPHY.fontSize}
          textColor={SUBTITLE_TYPOGRAPHY.textColor}
          pastColor={SUBTITLE_TYPOGRAPHY.pastColor}
          textShadow="none"
          activeTextShadow={SUBTITLE_TYPOGRAPHY.activeTextShadow}
        />
      ) : null}
    </AtmosphericCanvas>
  );
};
