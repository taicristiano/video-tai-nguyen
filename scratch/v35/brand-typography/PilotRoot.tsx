import React from 'react';
import { Composition, registerRoot, AbsoluteFill, Sequence, staticFile, Audio } from 'remotion';
import {
  Layout,
  ImageScene,
  SectionCard,
  InsightCard,
  OutroCard,
  BRAND_WATERMARK,
  type HumanInsightSpec,
  type SceneWindowInfo,
} from '../../../src/templates/human-insight/cinematic-light';
import { TRANSITION_SFX, type TransitionSfxName } from '../../../src/templates/creative/free-style-sfx';
import specData from '../../../videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json';

/**
 * HAY & ĐẸP. V3.5A — Brand & Typography Polish Comparison Pilot (frames 0-772).
 *
 * Polishes visible brand system and text hierarchy:
 *   - Exact brand logo asset with slogan: assets/hay-dep/brand/logo-full-horizontal-with-slogan.png
 *   - Watermark: fixed top-right safe zone, no transform/animation, 0.18 opacity, pixel-stable
 *   - Headline: calm editorial sizing (44px), max 2 lines, maxWidth 820px, restrained text shadow
 *   - Subtitles: canonical text and timing unchanged, safe bottom zone (bottom: 14%), soft text shadow
 *   - Centered balanced framing: portrait-focus, focalPoint={undefined}, visualBeats={undefined}
 *   - Deterministic calm motion and hard cuts preserved from V3.4A
 */

interface SpecWithSfx extends HumanInsightSpec {
  scenes: (HumanInsightSpec['scenes'][number] & {
    entrySfx?: {
      name: TransitionSfxName;
      volume?: number;
      reason: string;
    };
  })[];
}

const spec = specData as SpecWithSfx;
const slug = 'phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu';

// Reused 6 clean scene-level assets from V3.4A
const cleanAssets: string[] = [
  'scratch/v34/clean-assets/shot-01.jpg',
  'scratch/v34/clean-assets/shot-02.jpg',
  'scratch/v34/clean-assets/shot-03.jpg',
  'scratch/v34/clean-assets/shot-04.jpg',
  'scratch/v34/clean-assets/shot-05.jpg',
  'scratch/v34/clean-assets/shot-06.jpg',
];

const sceneWindows: SceneWindowInfo[] = spec.scenes.map((scene) => ({
  startFrame: scene.startFrame,
  durationFrames: scene.durationFrames,
  type: scene.type,
  layout: scene.layout ?? 'standard',
  headerMode: scene.headerMode,
  captionMode: scene.captionMode,
  titleMode: scene.titleMode,
  captionPlacement: scene.captionPlacement,
  hasSectionCard: Boolean(scene.sectionCard),
  hasInsightCard: Boolean(scene.insightText) && scene.insightVariant === 'card',
  cardDuration: scene.sectionCard
    ? (scene.sectionCard.number === '03' ? 86 : 76)
    : scene.insightText
      ? 66
      : undefined,
  isOutro: scene.isOutro,
}));

export const PilotBrandTypographyContent: React.FC = () => (
  <Layout
    slug={slug}
    title={spec.video.title}
    bgMusic={spec.video.bgMusic ?? null}
    watermarkSrc={BRAND_WATERMARK.staticPath}
    scenes={sceneWindows}
  >
    <Audio src={staticFile(`${slug}/voice.mp3`)} />
    {spec.scenes.slice(0, 6).map((scene, i) => {
      const sfxSrc = scene.entrySfx ? TRANSITION_SFX[scene.entrySfx.name as keyof typeof TRANSITION_SFX] : undefined;
      return sfxSrc ? (
        <Sequence key={`sfx-${i}`} from={scene.startFrame} durationInFrames={90}>
          <Audio src={sfxSrc} volume={Math.min(scene.entrySfx?.volume ?? 0.2, 0.25)} />
        </Sequence>
      ) : null;
    })}
    <AbsoluteFill>
      {spec.scenes.slice(0, 6).map((scene, i) => {
        const extraFrames = 0;
        const isQuestionScene = scene.type === 'ending' && Boolean(scene.insightText) && !scene.isOutro;
        const cardDuration = scene.sectionCard
          ? (scene.sectionCard.number === '03' ? 86 : 76)
          : scene.insightText
            ? (isQuestionScene ? scene.durationFrames : 66)
            : undefined;

        const insightVariant = scene.insightVariant ?? 'overlay';
        const isFullInsightCard = Boolean(scene.insightText) && insightVariant === 'card';

        // Centered balanced framing from V3.4A alignment fix
        const comparisonComposition =
          scene.composition === 'editorial-left' || scene.composition === 'editorial-right'
            ? 'portrait-focus'
            : (scene.composition ?? 'portrait-focus');

        return (
          <Sequence
            key={i}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames + extraFrames}
          >
            {scene.isOutro ? (
              <OutroCard durationFrames={scene.durationFrames} />
            ) : (
              <>
                <ImageScene
                  src={cleanAssets[i] || scene.image.path}
                  durationFrames={scene.durationFrames + extraFrames}
                  kenBurns={scene.image?.kenBurns}
                  sceneIndex={i}
                  storyRole={scene.storyRole}
                  framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                  composition={comparisonComposition}
                  shotScale={scene.shotScale}
                  focalPoint={undefined}
                  hasSectionCard={Boolean(scene.sectionCard)}
                  hasInsightCard={isFullInsightCard}
                  cardDuration={cardDuration}
                  fadeInFrames={0}
                  fadeOutFrames={0}
                  container={scene.visualContainer}
                  motionPreset={scene.motionPreset}
                  motionProfile={scene.motionProfile}
                  visualBeats={undefined}
                  sceneStartFrame={scene.startFrame}
                />
                {scene.sectionCard ? (
                  <SectionCard
                    number={scene.sectionCard.number}
                    title={scene.sectionCard.title}
                    subtitle={scene.sectionCard.subtitle}
                    durationFrames={cardDuration}
                  />
                ) : null}
                {scene.insightText ? (
                  <InsightCard
                    statement={scene.insightText}
                    durationFrames={cardDuration}
                    framing={scene.layout === 'focus' ? 'focus' : 'standard'}
                    variant={insightVariant}
                  />
                ) : null}
              </>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  </Layout>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Video"
    component={PilotBrandTypographyContent}
    durationInFrames={773}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(RemotionRoot);
