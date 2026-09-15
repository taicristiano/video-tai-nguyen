/**
 * index.ts — Entry point for human-insight/cinematic-light template.
 *
 * Usage in VideoContent.tsx:
 *
 *   import { Layout, ImageScene } from '../templates/human-insight/cinematic-light';
 *   import type { HumanInsightSpec } from '../templates/human-insight/cinematic-light';
 *   import specData from '../../videos/<slug>/spec.json';
 *
 *   const spec = specData as HumanInsightSpec;
 *
 *   export const VideoContent: React.FC<{ slug: string }> = ({ slug }) => (
 *     <Layout slug={slug} title={spec.video.title} bgMusic={spec.video.bgMusic ?? null}>
 *       <Audio src={staticFile(`${slug}/voice.mp3`)} />
 *       <AbsoluteFill>
 *         <Series>
 *           {spec.scenes.map((scene, i) => (
 *             <Series.Sequence key={i} durationInFrames={scene.durationFrames}>
 *               <ImageScene
 *                 src={scene.image.path}
 *                 durationFrames={scene.durationFrames}
 *                 kenBurns={scene.image.kenBurns}
 *                 fadeInFrames={15}
 *                 fadeOutFrames={0}
 *               />
 *             </Series.Sequence>
 *           ))}
 *         </Series>
 *       </AbsoluteFill>
 *     </Layout>
 *   );
 */

export { Layout } from './Layout';
export type { LayoutProps } from './Layout';

export { ImageScene } from './ImageScene';
export type { ImageSceneProps } from './ImageScene';

export { COLORS, FONT_MAIN, LAYOUT, TYPOGRAPHY, TEMPLATE_META } from './tokens';
export type { KenBurnsConfig, KenBurnsDirection } from './tokens';

// ─── Spec types (shared shape with cinematic-dark) ────────────────────────────

export interface HumanInsightImage {
  assetId: string;
  path: string;
  kenBurns?: import('./tokens').KenBurnsConfig;
}

export type SceneType = 'hook' | 'body' | 'stat' | 'ending';

export interface HumanInsightScene {
  type: SceneType;
  startFrame: number;
  durationFrames: number;
  audioSegment: {
    start: number;
    end: number;
    text: string;
  };
  image: HumanInsightImage;
}

export interface HumanInsightSpec {
  templateId: 'human-insight/cinematic-light';
  slug: string;
  totalFrames: number;
  video: {
    title: string;
    bgMusic?: string | null;
  };
  scenes: HumanInsightScene[];
}
