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
} from '../../../../src/templates/human-insight/cinematic-light';
import { TRANSITION_SFX, type TransitionSfxName } from '../../../../src/templates/creative/free-style-sfx';
import specData from '../../../../videos/phan-5-2026-09-17-muoi-phut-reset-cuoi-ngay-dang-gia-hon/spec.json';

/**
 * HAY & ĐẸP. V3.6 — Generalization Pilot (video005: Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần)
 * Comparison Pilot: Scene-level clean assets, visualBeats={undefined}, centered portrait-focus
 * Watermark: top=40px, right=40px, width=250px, opacity=0.24 (top-right safe zone)
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
const slug = 'phan-5-2026-09-17-muoi-phut-reset-cuoi-ngay-dang-gia-hon';

const cleanAssets: string[] = [
  "scratch/v36/generalization/video005/shot-01.jpg",
  "scratch/v36/generalization/video005/shot-02.jpg",
  "scratch/v36/generalization/video005/shot-03.jpg",
  "scratch/v36/generalization/video005/shot-04.jpg",
  "scratch/v36/generalization/video005/shot-05.jpg",
  "scratch/v36/generalization/video005/shot-06.jpg"
];

const first6Scenes = spec.scenes.slice(0, 6);
const totalSpanFrames = first6Scenes.reduce((acc, s) => acc + s.durationFrames, 0);

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

export const PilotContent: React.FC = () => (
  <Layout
    slug={slug}
    title={spec.video.title}
    bgMusic={spec.video.bgMusic ?? null}
    watermarkSrc={BRAND_WATERMARK.staticPath}
    scenes={sceneWindows}
  >
    <Audio src={staticFile(`${slug}/voice.mp3`)} />
    {first6Scenes.map((scene, i) => {
      const sfxSrc = scene.entrySfx ? TRANSITION_SFX[scene.entrySfx.name as keyof typeof TRANSITION_SFX] : undefined;
      return sfxSrc ? (
        <Sequence key={`sfx-${i}`} from={scene.startFrame} durationInFrames={90}>
          <Audio src={sfxSrc} volume={Math.min(scene.entrySfx?.volume ?? 0.2, 0.25)} />
        </Sequence>
      ) : null;
    })}
    <AbsoluteFill>
      {first6Scenes.map((scene, i) => {
        const extraFrames = 0;
        const isQuestionScene = scene.type === 'ending' && Boolean(scene.insightText) && !scene.isOutro;
        const cardDuration = scene.sectionCard
          ? (scene.sectionCard.number === '03' ? 86 : 76)
          : scene.insightText
            ? (isQuestionScene ? scene.durationFrames : 66)
            : undefined;

        const insightVariant = scene.insightVariant ?? 'overlay';
        const isFullInsightCard = Boolean(scene.insightText) && insightVariant === 'card';

        // Normalized balanced framing for clean square illustrations
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
    component={PilotContent}
    durationInFrames={totalSpanFrames}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(RemotionRoot);
