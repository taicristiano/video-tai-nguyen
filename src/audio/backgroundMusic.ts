/**
 * src/audio/backgroundMusic.ts
 *
 * Background music volume resolver.
 * Self-contained registry of configured track volumes with DEFAULT_BG_MUSIC_VOLUME fallback.
 * Eliminates accidental cross-boundary static imports from public/ directories.
 */

import { CINEMATIC_LIGHT_DEPENDENCIES } from '../templates/human-insight/cinematic-light/templateDependencies';

export const DEFAULT_BG_MUSIC_VOLUME = 0.1;

type MusicTrack = {
  path: string;
  volume?: number;
};

/**
 * Registry of known track volumes.
 */
const REGISTERED_TRACK_VOLUMES: Record<string, number> = {
  'assets/news/music/news-ambient-01.mp3': 0.09,
  'assets/news/music/sonican-flash-news.mp3': 0.166,
  'assets/news/music/the_mountain-news-news-music.mp3': 0.11,
  'assets/news/music/sonican-tech-news-information.mp3': 0.072,
  'assets/news/music/miromaxmusic-music-promotion.mp3': 0.08,
  'assets/news/music/nastelbom-soft-music.mp3': 0.085,
  'assets/news/music/grand_project-breaking-news-background-music_short.mp3': 0.089,
  [CINEMATIC_LIGHT_DEPENDENCIES.defaults.defaultBgMusic]: 0.12,
};

const tracksByPath = new Map<string, MusicTrack>();

for (const [trackPath, volume] of Object.entries(REGISTERED_TRACK_VOLUMES)) {
  tracksByPath.set(trackPath, {
    path: trackPath,
    volume,
  });
}

export const getBgMusicVolume = (path: string): number => {
  const volume = tracksByPath.get(path)?.volume;

  if (volume === undefined) {
    return DEFAULT_BG_MUSIC_VOLUME;
  }

  if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new Error(
      `Background music volume for "${path}" must be a number between 0 and 1.`,
    );
  }

  return volume;
};
