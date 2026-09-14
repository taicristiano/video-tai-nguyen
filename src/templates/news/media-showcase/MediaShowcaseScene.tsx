import {Video} from '@remotion/media';
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT_MAIN} from './tokens';
import type {MediaShowcaseAsset, MediaShowcaseSelection} from './types';

export interface MediaShowcaseSceneProps {
  publisher: string;
  media: Array<MediaShowcaseSelection & {asset: MediaShowcaseAsset}>;
  durationFrames: number;
}

const resolveSrc = (src: string) =>
  /^https?:\/\//i.test(src) ? src : staticFile(src);

const MediaSlide: React.FC<{
  item: MediaShowcaseSelection & {asset: MediaShowcaseAsset};
  durationFrames: number;
}> = ({item, durationFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = Math.min(12, Math.max(1, Math.floor(durationFrames / 4)));
  const opacity = interpolate(
    frame,
    [0, fade, Math.max(fade, durationFrames - fade), durationFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const scale = interpolate(frame, [0, durationFrames], [1.025, 1.075], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fit = item.fit ?? (item.asset.height > item.asset.width ? 'contain' : 'cover');

  return (
    <AbsoluteFill style={{opacity, background: '#101010'}}>
      {item.asset.kind === 'video' ? (
        <Video
          src={resolveSrc(item.asset.src)}
          muted
          volume={0}
          loop
          trimBefore={Math.max(0, Math.round((item.clipStartSeconds ?? 0) * fps))}
          trimAfter={
            item.clipEndSeconds === undefined
              ? undefined
              : Math.max(1, Math.round(item.clipEndSeconds * fps))
          }
          style={{width: '100%', height: '100%', objectFit: fit}}
        />
      ) : (
        <Img
          src={resolveSrc(item.asset.src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            transform: fit === 'cover' ? `scale(${scale})` : undefined,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const MediaShowcaseScene: React.FC<MediaShowcaseSceneProps> = ({
  publisher,
  media,
  durationFrames,
}) => {
  const slideDuration = Math.max(1, Math.floor(durationFrames / Math.max(1, media.length)));

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 84,
          height: 1048,
          borderLeft: `4px solid ${COLORS.border}`,
          borderRight: `4px solid ${COLORS.border}`,
          borderBottom: `4px solid ${COLORS.border}`,
          overflow: 'hidden',
          background: '#101010',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 0 42px',
            overflow: 'hidden',
            background: '#101010',
          }}
        >
          {media.map((item, index) => {
            const from = index * slideDuration;
            const remaining = durationFrames - from;
            const itemDuration =
              index === media.length - 1
                ? Math.max(1, remaining)
                : Math.min(slideDuration, remaining);

            return (
              <Sequence
                key={`${item.asset.id}-${index}`}
                from={from}
                durationInFrames={itemDuration}
              >
                <MediaSlide item={item} durationFrames={itemDuration} />
              </Sequence>
            );
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 42,
            padding: '9px 26px',
            boxSizing: 'border-box',
            background: `linear-gradient(90deg, ${COLORS.red} 0%, ${COLORS.red} 76%, rgba(255,255,255,0.94) 76%)`,
            color: '#FFFFFF',
            fontFamily: FONT_MAIN,
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          Nguồn: {publisher}
        </div>
      </div>
    </AbsoluteFill>
  );
};
