/**
 * Layout.tsx — Persistent frame for human-insight/cinematic-light template.
 *
 * Renders fixed elements across scenes:
 *   - Flat warm cream background (#FAECD2)
 *   - Minimalist top progress bar (2px thin)
 *   - Mindful breathing header logo + 28px legible slogan
 *   - Dynamic Header Modes ('full' | 'dimmed' | 'logo-only' | 'hidden'):
 *       • full:      Intro, Prominent 56px, opacity 1.0
 *       • dimmed:    Standard narrative: 70% scale, opacity 0.45
 *       • logo-only: Focus Shot, Chapter, Statement: Title hides completely (opacity 0)
 *       • hidden:    Outro: Entire header hidden
 *   - Dynamic Caption Modes ('phrase' | 'plain' | 'statement'):
 *       • phrase:    Phrase-level highlight in dark charcoal
 *       • plain:     Uniform calm sentence without jumping
 *       • statement: Subtitle bar hidden for central quote card
 */

import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BackgroundMusic } from '../../../components/BackgroundMusic';
import { Subtitles } from '../../../components/Subtitles';
import { COLORS, FONT_MAIN, LAYOUT, TYPOGRAPHY } from './tokens';

export interface SceneWindowInfo {
  startFrame: number;
  durationFrames: number;
  type?: string;
  layout?: 'standard' | 'focus' | 'statement' | 'chapter';
  headerMode?: 'full' | 'dimmed' | 'logo-only' | 'hidden';
  captionMode?: 'plain' | 'phrase' | 'statement';
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
  watermarkSrc = 'watermark.png',
  slogan = 'Sống tốt hơn từ những điều nhỏ.',
  scenes,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress from 0 to 100%
  const progress = durationInFrames > 0 ? (frame / durationInFrames) * 100 : 0;

  // Subtle mindful breathing motion for header watermark (amplitude ±1.2%, cycle ~4s)
  const headerBreath = 1 + Math.sin((frame / 30) * Math.PI * 0.5) * 0.012;

  // ── Headline Geometry (Intro 0-4s full, settled compact from 4.5s onwards) ──
  // 0s - 3.67s (0-110f): prominent full size (scale 1.0, translateY 0)
  // 3.67s - 4.5s (110-135f): smooth interpolation to compact (scale 0.78, translateY -30)
  // 4.5s onwards (135f+): permanently fixed at compact (scale 0.78, translateY -30)
  const introShrinkProgress = interpolate(frame, [110, 135], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(introShrinkProgress, [0, 1], [1.0, 0.78]);
  const titleTranslateY = interpolate(introShrinkProgress, [0, 1], [0, -30]);

  // ── Semi-Persistent Headline Opacity Computation (Production Contract) ──
  // Rule Engine:
  //   intro: 1.0 (0-3.67s, fades 3.67s-4.5s)
  //   normal: 0.46 (calibrated legible breadcrumb across standard illustrations)
  //   question / statement: 0 (fades out in 9f, hidden during hold, fades back in 10f)
  //   conclusion: 0.25 (fades from 0.46 at 64s to 0.25 at 66s, then to 0 at 68s)
  //   outro: 0 (68.8s-71s clean centered branding)
  const HEADLINE_OPACITY = {
    intro: 1.0,
    normal: 0.46,
    question: 0,
    statement: 0,
    conclusion: 0.25,
    outro: 0,
  };

  let finalTitleOpacity = HEADLINE_OPACITY.normal;
  let headerOpacity = 1.0;
  let activeCaptionMode: 'phrase' | 'plain' | 'statement' = 'phrase';

  if (frame < 110) {
    // Intro baseline: 100% full strength
    finalTitleOpacity = HEADLINE_OPACITY.intro;
    headerOpacity = 1.0;
    activeCaptionMode = 'phrase';
  } else if (frame <= 135) {
    // Intro transition to compact breadcrumb (0.35s fade)
    finalTitleOpacity = interpolate(frame, [110, 135], [HEADLINE_OPACITY.intro, HEADLINE_OPACITY.normal], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    headerOpacity = 1.0;
    activeCaptionMode = 'phrase';
  } else if (frame >= 1920) {
    // ── Conclusion & Outro Sequence (64s onwards) ──────────────────────────
    // 64s - 66s (1920 - 1980f): fade from 0.43 to 0.25
    // 66s - 68s (1980 - 2040f): fade from 0.25 to 0
    // 68s - 68.8s (2040 - 2065f): top header logo dissolves smoothly into outro
    // 68.8s - 71s (2065 - 2130f): clean centered NẾP. outro
    if (frame < 1980) {
      finalTitleOpacity = interpolate(frame, [1920, 1980], [HEADLINE_OPACITY.normal, HEADLINE_OPACITY.conclusion], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      headerOpacity = 1.0;
      activeCaptionMode = 'phrase';
    } else if (frame < 2040) {
      finalTitleOpacity = interpolate(frame, [1980, 2040], [HEADLINE_OPACITY.conclusion, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      headerOpacity = 1.0;
      activeCaptionMode = 'phrase';
    } else if (frame < 2065) {
      finalTitleOpacity = 0;
      headerOpacity = interpolate(frame, [2040, 2065], [1.0, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      activeCaptionMode = 'phrase';
    } else {
      finalTitleOpacity = 0;
      headerOpacity = 0;
      activeCaptionMode = 'statement';
    }
  } else if (scenes && scenes.length > 0) {
    const currentScene = scenes.find(
      (s) => frame >= s.startFrame && frame < s.startFrame + s.durationFrames,
    );

    if (currentScene) {
      const cardLimit =
        currentScene.cardDuration ??
        (currentScene.hasSectionCard ? 76 : currentScene.hasInsightCard ? 66 : 0);
      const sceneFrame = frame - currentScene.startFrame;

      if (cardLimit > 0) {
        // Scene with an overlay Question Card or Insight Card
        const cardExitStart = cardLimit - 9;
        const cardExitEnd = cardLimit + 3;

        if (sceneFrame < 9) {
          // Card entering: fade headline out smoothly in ~0.30s
          finalTitleOpacity = interpolate(sceneFrame, [0, 9], [HEADLINE_OPACITY.normal, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          activeCaptionMode = 'statement';
        } else if (sceneFrame < cardExitStart) {
          // Card actively held: headline completely hidden
          finalTitleOpacity = 0;
          activeCaptionMode = 'statement';
        } else if (sceneFrame < cardExitEnd) {
          // Card dissolving: headline smoothly fades back in to normal breadcrumb
          finalTitleOpacity = interpolate(sceneFrame, [cardExitStart, cardExitEnd], [0, HEADLINE_OPACITY.normal], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          activeCaptionMode = 'statement';
        } else {
          // Card complete: steady compact breadcrumb
          finalTitleOpacity = HEADLINE_OPACITY.normal;
          activeCaptionMode = currentScene.captionMode ?? 'phrase';
        }
      } else {
        // Normal illustration scene without overlay card
        finalTitleOpacity = HEADLINE_OPACITY.normal;
        activeCaptionMode = currentScene.captionMode ?? 'phrase';
      }
    } else {
      // Fallback outside defined scenes
      headerOpacity = 1.0;
      finalTitleOpacity = HEADLINE_OPACITY.normal;
      activeCaptionMode = 'phrase';
    }
  } else {
    headerOpacity = 1.0;
    finalTitleOpacity = HEADLINE_OPACITY.normal;
    activeCaptionMode = 'phrase';
  }

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>

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

      {/* ── Image zone — full frame ──────────────────────────────────────── */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>

      {/* ── Watermark logo & 28px Slogan ─────────────────────────────────── */}
      {watermarkSrc ? (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            transform: `scale(${headerBreath})`,
            transformOrigin: 'center top',
            opacity: headerOpacity,
            transition: 'opacity 0.25s ease',
          }}
        >
          <Img
            src={staticFile(watermarkSrc)}
            style={{
              height: 115,
              width: 'auto',
              opacity: 0.95,
              objectFit: 'contain',
            }}
          />
          {slogan ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 15,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 1,
                  background: 'rgba(44, 26, 14, 0.25)',
                }}
              />
              <div
                style={{
                  fontFamily: FONT_MAIN,
                  fontSize: TYPOGRAPHY.sloganSize,
                  fontWeight: '500',
                  color: COLORS.text,
                  opacity: 0.88,
                  letterSpacing: '0.06em',
                  textAlign: 'center',
                }}
              >
                {slogan}
              </div>
              <div
                style={{
                  width: 36,
                  height: 1,
                  background: 'rgba(44, 26, 14, 0.25)',
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Title — prominent during intro, shrinks after 3s, hides on Focus/Chapter ── */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: LAYOUT.paddingH,
          paddingRight: LAYOUT.paddingH,
          zIndex: 10,
          transform: `scale(${titleScale}) translateY(${titleTranslateY}px)`,
          opacity: finalTitleOpacity,
          transformOrigin: 'center top',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
              textShadow: '0 2px 10px rgba(44, 26, 14, 0.18)',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 48,
              height: 2,
              background: 'rgba(44, 26, 14, 0.25)',
              borderRadius: 1,
              marginTop: 18,
            }}
          />
        </div>
      </div>

      {/* ── Subtitles — dynamic phrase/plain/statement mode in dark charcoal ── */}
      <Subtitles
        slug={slug}
        mode={activeCaptionMode}
        activeColor="#2C1A0E"
        fontSize={TYPOGRAPHY.subtitleSize}
        textColor="#2C1A0E"
        pastColor="#2C1A0E"
        textShadow="none"
        activeTextShadow="0 1px 4px rgba(44, 26, 14, 0.12)"
      />

    </AbsoluteFill>
  );
};
