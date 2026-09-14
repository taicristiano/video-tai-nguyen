export type MediaShowcaseAssetKind = 'image' | 'video';

export interface MediaShowcaseAsset {
  id: string;
  kind: MediaShowcaseAssetKind;
  /** Remote URL, or a path relative to public/. */
  src: string;
  storage: 'local' | 'remote';
  sourcePageUrl: string;
  sourceMediaUrl: string;
  credit: string;
  caption?: string | null;
  alt?: string | null;
  width: number;
  height: number;
  duration?: number;
}

export interface MediaShowcaseSelection {
  assetId: string;
  fit?: 'cover' | 'contain';
  clipStartSeconds?: number;
  clipEndSeconds?: number;
}

export interface MediaShowcaseSceneSpec {
  startFrame: number;
  durationFrames: number;
  audioSegment: {
    start: number;
    end: number;
    text: string;
  };
  media: MediaShowcaseSelection[];
}

export interface MediaShowcaseSpec {
  templateId: 'news/media-showcase';
  slug: string;
  totalFrames: number;
  video: {
    title: string;
    date: string;
    bgMusic: string | null;
  };
  source: {
    articleUrl: string;
    publisher: string;
    evidenceManifest: string;
  };
  mediaAssets: MediaShowcaseAsset[];
  scenes: MediaShowcaseSceneSpec[];
}
