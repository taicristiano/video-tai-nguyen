import { parseHayDepVideos } from './parse-hay-dep-videos.mjs';
import { deriveSlug } from '../src/slug.js';

const vids = parseHayDepVideos();
console.log('Video 1 context slug:', deriveSlug(vids[0].cleanContext));
console.log('Video 2 context slug:', deriveSlug(vids[1].cleanContext));
console.log('Video 20 context slug:', deriveSlug(vids[19].cleanContext));
