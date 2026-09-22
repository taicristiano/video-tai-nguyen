/**
 * ImageScene.tsx — Animated art card display for human-insight/cinematic-light (V2).
 *
 * Upgrades in V2:
 *   - Micro-motion contract: Every normal image scene has deterministic micro-motion.
 *   - Scale is restrained (1.010–1.035, never aggressive Ken Burns).
 *   - 9 deterministic motion presets:
 *       still-breathe | slow-push | slow-pull | drift-left | drift-right |
 *       rise-soft | foreground-parallax | focus-shift | emotional-hold
 *   - Scenes > 3.5s (105f) feature an intentional mid-scene framing shift.
 *   - Container mix: 'canvas' (default 60–70%) vs 'paper' (tactile 20–30%).
 *   - Visual beats: Backward-compatible support for multi-beat clauses within a narration scene.
 *   - Transitions: Clean 6–10 frames dissolve/cut.
 */

import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  COLORS,
  COMPOSITIONS,
  SHOT_SCALE,
  type CompositionPreset,
  type FocalPoint,
  type KenBurnsConfig,
  type MotionPreset,
  type ShotScale,
  type VisualBeat,
  type VisualContainer,
} from './tokens';
import {
  computeMotionGrammar,
  resolveMotionProfile,
  normalizeMotionProfile,
  type MotionProfile,
} from './motionGrammar';

export interface ImageSceneProps {
  /** Path relative to staticFile root */
  src: string;
  durationFrames: number;
  kenBurns?: KenBurnsConfig;
  sceneIndex?: number;
  storyRole?: string;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  hasSectionCard?: boolean;
  hasInsightCard?: boolean;
  cardDuration?: number;
  framing?: 'standard' | 'focus';
  container?: VisualContainer;
  composition?: CompositionPreset;
  shotScale?: ShotScale;
  focalPoint?: FocalPoint;
  cropScale?: number;
  motionPreset?: MotionPreset;
  motionProfile?: MotionProfile;
  visualBeats?: VisualBeat[];
  sceneStartFrame?: number;
}

function resolveActiveProfile(
  motionProfile?: MotionProfile,
  motionPreset?: MotionPreset,
  storyRole?: string,
  sceneIndex: number = 0
): MotionProfile {
  if (motionProfile) return motionProfile;
  const normalized = normalizeMotionProfile(motionPreset);
  if (normalized) return normalized;
  return resolveMotionProfile(storyRole, sceneIndex);
}

interface BeatLayerProps {
  imageSrc: string;
  composition: CompositionPreset;
  shotScale: ShotScale;
  focalPoint?: FocalPoint;
  cropScale?: number;
  motionPreset?: MotionPreset;
  motionProfile?: MotionProfile;
  storyRole?: string;
  opacity: number;
  localFrame: number;
  durationFrames: number;
  sceneIndex: number;
}

const BeatLayer: React.FC<BeatLayerProps> = ({
  imageSrc,
  composition,
  shotScale,
  focalPoint,
  cropScale,
  motionPreset,
  motionProfile,
  storyRole,
  opacity,
  localFrame,
  durationFrames,
  sceneIndex,
}) => {
  if (opacity <= 0.001) return null;

  const progress = Math.min(1, Math.max(0, localFrame / Math.max(1, durationFrames)));
  const rawProfile = resolveActiveProfile(motionProfile, motionPreset, storyRole, sceneIndex);
  // Narrative holds (> 1.5s / 45 frames) must not remain static: upgrade STILL to AMBIENT_STILL
  const profile = (rawProfile === 'STILL' && durationFrames > 45) ? 'AMBIENT_STILL' : rawProfile;
  const motion = computeMotionGrammar(profile, progress);

  // Motion Grammar Lock Compliance (HAY & ĐẸP. Production Lock V3.7):
  // Strictly obey resolved motion profile from computeMotionGrammar.
  // translateY = 0 contract enforced; zero undeclared vertical or horizontal drift.
  const activeTranslateX = motion.translateX;
  const activeTranslateY = motion.translateY; // strictly 0

  const scaleMultiplier = cropScale ?? (shotScale ? SHOT_SCALE[shotScale] : 1.0) ?? 1.0;
  const finalScale = (motion.scale * scaleMultiplier).toFixed(5);
  const transformString = `scale(${finalScale}) translate(${activeTranslateX.toFixed(3)}%, ${activeTranslateY.toFixed(3)}%)`;
  const defaultObjectPosition =
    composition === 'editorial-left' ? '38% 50%' :
    composition === 'editorial-right' ? '62% 50%' : '50% 50%';
  const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : defaultObjectPosition;
  const transformOrigin = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center center';
  const geom = COMPOSITIONS[composition] ?? COMPOSITIONS['portrait-focus'];

  if (composition === 'full-bleed') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          opacity,
          pointerEvents: 'none',
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: transformString,
            transformOrigin,
          }}
        />
        {/* Subtle gradient overlay to ensure subtitle and logo readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(246,241,232,0.14) 0%, rgba(246,241,232,0.02) 48%, rgba(246,241,232,0.72) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  if (composition === 'paper') {
    const baseTilt = sceneIndex % 2 === 0 ? -1.0 : 1.0;
    return (
      <div
        style={{
          position: 'absolute',
          top: geom.top,
          left: geom.left,
          width: geom.width,
          height: geom.height,
          background: COLORS.bgPaperCard,
          padding: 14,
          borderRadius: geom.radius,
          border: '1px solid rgba(48, 45, 40, 0.09)',
          boxShadow:
            '0 24px 50px rgba(48, 45, 40, 0.12), 0 6px 18px rgba(48, 45, 40, 0.06)',
          transform: `rotate(${baseTilt}deg)`,
          opacity,
          transformOrigin: 'center center',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        {/* Washi Tape */}
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%) rotate(-0.5deg)',
            width: 104,
            height: 28,
            background: 'rgba(235, 220, 195, 0.85)',
            border: '1px dashed rgba(160, 130, 90, 0.35)',
            borderRadius: 2,
            boxShadow: '0 2px 6px rgba(48, 45, 40, 0.08)',
            zIndex: 10,
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 18,
            overflow: 'hidden',
            position: 'relative',
            background: COLORS.bgWarmCream,
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              transform: transformString,
              transformOrigin,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: COLORS.imageOverlay, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: COLORS.vignette, pointerEvents: 'none' }} />
        </div>
      </div>
    );
  }

  if (composition === 'detail-insert') {
    return (
      <div
        style={{
          position: 'absolute',
          top: geom.top,
          left: geom.left,
          width: geom.width,
          height: geom.height,
          overflow: 'hidden',
          opacity,
          boxShadow: '0 14px 40px rgba(48, 45, 40, 0.12)',
          background: COLORS.bgWarmCream,
          pointerEvents: 'none',
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: transformString,
            transformOrigin,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: COLORS.imageOverlay, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: COLORS.vignette, pointerEvents: 'none' }} />
      </div>
    );
  }

  if (composition === 'editorial-left' || composition === 'editorial-right') {
    return (
      <div
        style={{
          position: 'absolute',
          top: geom.top,
          left: geom.left,
          width: geom.width,
          height: geom.height,
          borderRadius: geom.radius,
          overflow: 'hidden',
          opacity,
          boxShadow: '0 20px 48px rgba(48, 45, 40, 0.10), 0 6px 18px rgba(48, 45, 40, 0.05)',
          border: '1px solid rgba(48, 45, 40, 0.08)',
          background: COLORS.bgWarmCream,
          pointerEvents: 'none',
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: transformString,
            transformOrigin,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: COLORS.imageOverlay, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: COLORS.vignette, pointerEvents: 'none' }} />
      </div>
    );
  }

  // Fallback: portrait-focus
  return (
    <div
      style={{
        position: 'absolute',
        top: geom.top,
        left: geom.left,
        width: geom.width,
        height: geom.height,
        borderRadius: geom.radius,
        overflow: 'hidden',
        opacity,
        boxShadow: '0 20px 48px rgba(48, 45, 40, 0.10), 0 6px 18px rgba(48, 45, 40, 0.05)',
        border: '1px solid rgba(48, 45, 40, 0.08)',
        background: COLORS.bgWarmCream,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          transform: transformString,
          transformOrigin,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: COLORS.imageOverlay, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: COLORS.vignette, pointerEvents: 'none' }} />
    </div>
  );
};

export const ImageScene: React.FC<ImageSceneProps> = ({
  src,
  durationFrames,
  sceneIndex = 0,
  storyRole,
  fadeInFrames = 0,
  fadeOutFrames = 0,
  hasSectionCard = false,
  hasInsightCard = false,
  cardDuration: cardDurationProp,
  framing,
  container = 'canvas',
  composition: compositionProp,
  shotScale: shotScaleProp,
  focalPoint,
  cropScale: cropScaleProp,
  motionPreset,
  motionProfile,
  visualBeats,
  sceneStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const hasOverlayCard = hasSectionCard || hasInsightCard;
  const cardDuration = cardDurationProp ?? (hasSectionCard ? 76 : hasInsightCard ? 66 : 0);

  // ── Entrance transition (default: hard cut, 0 frames) ────────────────
  let enterOpacity = 1;

  if (hasInsightCard) {
    // Overlay card: keep underlying illustration visible at full opacity to prevent blank background
    enterOpacity = 1;
  } else if (hasSectionCard) {
    const cardRevealDuration = 9;
    const cardRevealStart = Math.max(0, cardDuration - cardRevealDuration);
    if (frame < cardRevealStart) {
      enterOpacity = 0;
    } else {
      const enterProgress = Math.min(1, Math.max(0, (frame - cardRevealStart) / cardRevealDuration));
      enterOpacity = interpolate(enterProgress, [0, 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  } else if (fadeInFrames && fadeInFrames > 0) {
    const enterProgress = Math.min(1, Math.max(0, frame / fadeInFrames));
    enterOpacity = interpolate(enterProgress, [0, 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    enterOpacity = 1;
  }

  // ── Exit transition (default: hard cut, 0 frames) ────────────────────
  let exitOpacity = 1;
  if (fadeOutFrames && fadeOutFrames > 0) {
    const exitStart = Math.max(0, durationFrames - fadeOutFrames);
    const exitProgress = Math.min(1, Math.max(0, (frame - exitStart) / fadeOutFrames));
    exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const totalSceneOpacity = enterOpacity * exitOpacity;

  // Resolve default composition & shot scale for backward compatibility
  const resolvedComposition: CompositionPreset =
    compositionProp ??
    (container === 'paper' ? 'paper' : framing === 'focus' ? 'portrait-focus' : 'portrait-focus');
  const resolvedShotScale: ShotScale = shotScaleProp ?? 'medium';
  const resolvedProfile: MotionProfile = resolveActiveProfile(motionProfile, motionPreset, storyRole, sceneIndex);

  // ── True Visual Beat Sequence Resolver ──────────────────────────────
  const beats =
    visualBeats && visualBeats.length > 0
      ? visualBeats.map((b, bIdx) => {
          const isAbsolute = b.startFrame >= sceneStartFrame && b.endFrame > sceneStartFrame;
          const start = isAbsolute ? b.startFrame - sceneStartFrame : b.startFrame;
          const end = isAbsolute ? b.endFrame - sceneStartFrame : b.endFrame;
          const beatRole = b.storyRole ?? storyRole;
          const beatProfile =
            b.motionProfile ??
            (b.motionPreset ? normalizeMotionProfile(b.motionPreset) : null) ??
            resolveMotionProfile(beatRole, bIdx);

          return {
            ...b,
            localStart: Math.max(0, start),
            localEnd: Math.min(durationFrames, end),
            composition: b.composition ?? resolvedComposition,
            shotScale: b.shotScale ?? (b.cropVariant as ShotScale) ?? resolvedShotScale,
            focalPoint: b.focalPoint ?? focalPoint,
            cropScale: b.cropScale,
            motionPreset: b.motionPreset ?? beatProfile,
            motionProfile: beatProfile,
            storyRole: beatRole,
            transition: b.transition ?? 'cut',
          };
        })
      : [
          {
            startFrame: 0,
            endFrame: durationFrames,
            localStart: 0,
            localEnd: durationFrames,
            imageSrc: src,
            composition: resolvedComposition,
            shotScale: resolvedShotScale,
            focalPoint,
            cropScale: cropScaleProp,
            motionPreset: resolvedProfile,
            motionProfile: resolvedProfile,
            storyRole,
            transition: 'cut' as const,
          },
        ];

  const activeIndex = beats.findIndex((b) => frame >= b.localStart && frame < b.localEnd);
  const activeIdx =
    activeIndex !== -1
      ? activeIndex
      : frame >= beats[beats.length - 1].localEnd
        ? beats.length - 1
        : 0;

  const active = beats[activeIdx];
  const previous = activeIdx > 0 ? beats[activeIdx - 1] : null;

  const local = frame - active.localStart;
  const dissolveFrames = active.transition === 'dissolve' ? 6 : 0;

  const mix =
    dissolveFrames === 0
      ? 1
      : interpolate(local, [0, dissolveFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Previous beat layer during crossfade window (only if transition is dissolve) */}
      {previous && mix < 1 ? (
        <BeatLayer
          imageSrc={previous.imageSrc}
          composition={previous.composition}
          shotScale={previous.shotScale}
          focalPoint={previous.focalPoint}
          cropScale={previous.cropScale}
          motionPreset={previous.motionPreset}
          motionProfile={previous.motionProfile}
          storyRole={previous.storyRole}
          opacity={(1 - mix) * totalSceneOpacity}
          localFrame={previous.localEnd - previous.localStart - 1}
          durationFrames={Math.max(1, previous.localEnd - previous.localStart)}
          sceneIndex={sceneIndex}
        />
      ) : null}

      {/* Active beat layer */}
      <BeatLayer
        imageSrc={active.imageSrc}
        composition={active.composition}
        shotScale={active.shotScale}
        focalPoint={active.focalPoint}
        cropScale={active.cropScale}
        motionPreset={active.motionPreset}
        motionProfile={active.motionProfile}
        storyRole={active.storyRole}
        opacity={mix * totalSceneOpacity}
        localFrame={Math.max(0, local)}
        durationFrames={Math.max(1, active.localEnd - active.localStart)}
        sceneIndex={sceneIndex}
      />
    </AbsoluteFill>
  );
};
