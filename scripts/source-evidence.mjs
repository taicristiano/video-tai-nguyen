#!/usr/bin/env node

/**
 * Extract article context and reusable image/video evidence from a public URL.
 *
 * Usage:
 *   node scripts/source-evidence.mjs "<article-url>" "<slug>"
 *
 * Output:
 *   public/<slug>/source-evidence.json
 *   public/<slug>/evidence/image-*.{jpg,png,webp}
 *   videos/<slug>/source-context.txt
 */

import dns from 'node:dns/promises';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const [rawArticleUrl, slug] = process.argv.slice(2);
const MAX_IMAGES = 12;
const MAX_VIDEOS = 6;
const MAX_ARTICLE_CHARS = 40_000;

if (!rawArticleUrl || !slug) {
  console.error('Usage: node scripts/source-evidence.mjs "<article-url>" "<slug>"');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  throw new Error('slug may contain only lowercase letters, numbers, and hyphens');
}

const isPrivateIp = (address) => {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }

  const normalized = address.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('::ffff:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('ff')
  );
};

const assertPublicUrl = async (value) => {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Blocked URL protocol: ${url.protocol}`);
  }

  const addresses = await dns.lookup(url.hostname, {all: true});
  if (addresses.length === 0 || addresses.some(({address}) => isPrivateIp(address))) {
    throw new Error(`Blocked private or unresolved host: ${url.hostname}`);
  }

  return url;
};

const normalizeText = (value) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

const unique = (items, key) => {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

const parseProbe = (stdout) => {
  try {
    const data = JSON.parse(stdout);
    const streams = Array.isArray(data.streams) ? data.streams : [];
    const video = streams.find((stream) => stream.codec_type === 'video');
    const duration = Number(data.format?.duration);
    if (!video || !Number.isFinite(duration) || duration <= 0) return null;

    return {
      width: Number(video.width) || 0,
      height: Number(video.height) || 0,
      duration,
    };
  } catch {
    return null;
  }
};

const probeVideo = (src) => {
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'remotion',
      'ffprobe',
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,width,height',
      '-of',
      'json',
      src,
    ],
    {cwd: ROOT, encoding: 'utf8', timeout: 45_000},
  );

  return result.status === 0 ? parseProbe(result.stdout) : null;
};

const extensionFromContentType = (contentType) => {
  if (/image\/png/i.test(contentType)) return 'png';
  if (/image\/webp/i.test(contentType)) return 'webp';
  if (/image\/jpe?g/i.test(contentType)) return 'jpg';
  return null;
};

const socialCreatorFromTitle = (title, hostname) => {
  if (!title) return null;
  if (/(^|\.)x\.com$|(^|\.)twitter\.com$/i.test(hostname)) {
    const match = title.match(/^(.+?)\s+\((@[^)]+)\)\s+on\s+X$/i);
    if (match) return `${match[1].trim()} (${match[2].trim()})`;
  }
  return null;
};

const buildAttribution = ({creatorCandidates, publisher, title, articleUrl}) => {
  const creator =
    socialCreatorFromTitle(title, articleUrl.hostname) ||
    creatorCandidates.map(normalizeText).find(Boolean) ||
    null;
  const resolvedPublisher = normalizeText(publisher) || articleUrl.hostname;
  const sameSource =
    creator &&
    creator.localeCompare(resolvedPublisher, undefined, {sensitivity: 'base'}) === 0;

  return {
    creator,
    publisher: resolvedPublisher,
    credit:
      creator && !sameSource
        ? `Nguồn: ${creator} · ${resolvedPublisher}`
        : `Nguồn: ${creator || resolvedPublisher}`,
  };
};

const articleUrl = await assertPublicUrl(rawArticleUrl);
const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 1000},
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36',
});
const networkVideos = [];

await context.route('**/*', async (route) => {
  try {
    await assertPublicUrl(route.request().url());
    await route.continue();
  } catch {
    await route.abort('blockedbyclient');
  }
});

const page = await context.newPage();
page.on('response', (response) => {
  const contentType = response.headers()['content-type'] ?? '';
  const url = response.url();
  if (
    contentType.startsWith('video/') ||
    /application\/(?:vnd\.apple\.mpegurl|x-mpegurl)/i.test(contentType) ||
    /\.(mp4|m4v|webm|mov|m3u8)(?:$|[?#])/i.test(url)
  ) {
    networkVideos.push(url);
  }
});

try {
  const response = await page.goto(articleUrl.href, {
    waitUntil: 'domcontentloaded',
    timeout: 35_000,
  });
  const articleContentType = response?.headers()['content-type'] ?? '';
  if (!articleContentType.includes('text/html')) {
    throw new Error('Input must be a public HTML article/page URL.');
  }

  await page.waitForLoadState('networkidle', {timeout: 8_000}).catch(() => undefined);
  await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, 5000)));
  await page.waitForTimeout(1200);

  const extracted = await page.evaluate((maxArticleChars) => {
    const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();
    const absolute = (value) => {
      if (!value || value.startsWith('data:') || value.startsWith('blob:')) return null;
      try {
        return new URL(value, document.baseURI).href;
      } catch {
        return null;
      }
    };
    const textOf = (selector) => clean(document.querySelector(selector)?.textContent);
    const meta = (selector) =>
      clean(document.querySelector(selector)?.getAttribute('content'));
    const closestText = (element) => {
      const container = element.closest('figure, article, section, p, div');
      return clean(container?.textContent).slice(0, 700);
    };
    const figureCaption = (element) =>
      clean(element.closest('figure')?.querySelector('figcaption')?.textContent);

    const articleRoot =
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.body;
    const paragraphs = [...articleRoot.querySelectorAll('p')]
      .map((paragraph) => clean(paragraph.textContent))
      .filter((paragraph) => paragraph.length >= 30);
    const articleText = paragraphs.join('\n\n').slice(0, maxArticleChars);

    const images = [...articleRoot.querySelectorAll('img')]
      .map((image) => {
        const src =
          absolute(image.currentSrc) ||
          absolute(image.getAttribute('src')) ||
          absolute(image.getAttribute('data-src')) ||
          absolute(image.getAttribute('data-lazy-src'));
        const width = image.naturalWidth || image.width || 0;
        const height = image.naturalHeight || image.height || 0;
        const identity = [
          src,
          image.getAttribute('alt'),
          image.getAttribute('class'),
          image.getAttribute('id'),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return {
          src,
          width,
          height,
          excluded:
            /(^|[\s/_-])(logo|avatar|icon|sprite|advertisement|tracking)([\s/_.-]|$)/i.test(
              identity,
            ),
          alt: clean(image.getAttribute('alt')),
          caption: figureCaption(image),
          nearbyText: closestText(image),
        };
      })
      .filter(
        (image) =>
          image.src &&
          !image.excluded &&
          image.width >= 480 &&
          image.height >= 270 &&
          image.width * image.height >= 240_000,
      );

    const videos = [...articleRoot.querySelectorAll('video')]
      .flatMap((video) => {
        const common = {
          poster: absolute(video.getAttribute('poster')),
          caption: figureCaption(video),
          nearbyText: closestText(video),
        };
        const sources = [
          video.currentSrc,
          video.getAttribute('src'),
          ...[...video.querySelectorAll('source')].map((source) =>
            source.getAttribute('src'),
          ),
        ];
        return sources
          .map(absolute)
          .filter(Boolean)
          .map((src) => ({src, ...common}));
      });

    const metadataVideos = [
      'meta[property="og:video"]',
      'meta[property="og:video:url"]',
      'meta[property="og:video:secure_url"]',
      'meta[name="twitter:player:stream"]',
    ]
      .flatMap((selector) =>
        [...document.querySelectorAll(selector)].map((element) =>
          absolute(element.getAttribute('content')),
        ),
      )
      .filter(Boolean)
      .map((src) => ({src, poster: null, caption: '', nearbyText: ''}));

    const creatorCandidates = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[name="twitter:creator"]',
      '[rel="author"]',
      '[itemprop="author"] [itemprop="name"]',
    ]
      .flatMap((selector) =>
        [...document.querySelectorAll(selector)].map(
          (element) =>
            element.getAttribute('content') ||
            element.getAttribute('title') ||
            element.textContent ||
            '',
        ),
      )
      .map(clean)
      .filter(Boolean);

    return {
      title: meta('meta[property="og:title"]') || clean(document.title),
      description:
        meta('meta[property="og:description"]') ||
        meta('meta[name="description"]') ||
        '',
      publishedAt:
        meta('meta[property="article:published_time"]') ||
        document.querySelector('time')?.getAttribute('datetime') ||
        '',
      publisher: meta('meta[property="og:site_name"]'),
      creatorCandidates,
      articleText: articleText || textOf('body').slice(0, maxArticleChars),
      images,
      videos: [...videos, ...metadataVideos],
    };
  }, MAX_ARTICLE_CHARS);

  const attribution = buildAttribution({
    creatorCandidates: extracted.creatorCandidates,
    publisher: extracted.publisher,
    title: extracted.title,
    articleUrl,
  });
  const publicDir = path.join(ROOT, 'public', slug);
  const evidenceDir = path.join(publicDir, 'evidence');
  fs.mkdirSync(evidenceDir, {recursive: true});

  const imageCandidates = unique(extracted.images, (image) => image.src).slice(
    0,
    MAX_IMAGES * 2,
  );
  const images = [];

  for (const candidate of imageCandidates) {
    if (images.length >= MAX_IMAGES) break;
    try {
      const safeUrl = await assertPublicUrl(candidate.src);
      const imageResponse = await context.request.get(safeUrl.href, {
        headers: {referer: articleUrl.href},
        timeout: 30_000,
      });
      if (!imageResponse.ok()) continue;
      await assertPublicUrl(imageResponse.url());

      const extension = extensionFromContentType(
        imageResponse.headers()['content-type'] ?? '',
      );
      if (!extension) continue;

      const filename = `image-${String(images.length + 1).padStart(2, '0')}.${extension}`;
      const outputPath = path.join(evidenceDir, filename);
      fs.writeFileSync(outputPath, await imageResponse.body());

      images.push({
        id: `image-${String(images.length + 1).padStart(2, '0')}`,
        kind: 'image',
        src: `${slug}/evidence/${filename}`,
        storage: 'local',
        sourcePageUrl: articleUrl.href,
        sourceMediaUrl: safeUrl.href,
        credit: attribution.credit,
        caption: normalizeText(candidate.caption) || null,
        alt: normalizeText(candidate.alt) || null,
        nearbyText: normalizeText(candidate.nearbyText) || null,
        width: candidate.width,
        height: candidate.height,
      });
    } catch {
      // Skip blocked, inaccessible, or unsupported images.
    }
  }

  const domVideoMetadata = new Map(
    extracted.videos.map((video) => [video.src, video]),
  );
  const videoCandidates = unique(
    [
      ...extracted.videos,
      ...networkVideos.map((src) => ({
        src,
        poster: null,
        caption: '',
        nearbyText: '',
      })),
    ],
    (video) => video.src,
  );
  const videos = [];

  for (const candidate of videoCandidates) {
    if (videos.length >= MAX_VIDEOS) break;
    try {
      const safeUrl = await assertPublicUrl(candidate.src);
      const metadata = probeVideo(safeUrl.href);
      if (!metadata) continue;
      const domMetadata = domVideoMetadata.get(candidate.src) || candidate;

      videos.push({
        id: `video-${String(videos.length + 1).padStart(2, '0')}`,
        kind: 'video',
        src: safeUrl.href,
        storage: 'remote',
        sourcePageUrl: articleUrl.href,
        sourceMediaUrl: safeUrl.href,
        credit: attribution.credit,
        caption: normalizeText(domMetadata.caption) || null,
        alt: null,
        nearbyText: normalizeText(domMetadata.nearbyText) || null,
        poster: domMetadata.poster || null,
        ...metadata,
      });
    } catch {
      // Skip video candidates that cannot be safely probed.
    }
  }

  const result = {
    version: 1,
    article: {
      url: articleUrl.href,
      title: normalizeText(extracted.title) || null,
      description: normalizeText(extracted.description) || null,
      publishedAt: normalizeText(extracted.publishedAt) || null,
      creator: attribution.creator,
      publisher: attribution.publisher,
      credit: attribution.credit,
      text: extracted.articleText.trim(),
    },
    assets: [...images, ...videos],
    stats: {
      imageCount: images.length,
      videoCount: videos.length,
      usableAssetCount: images.length + videos.length,
    },
  };

  fs.writeFileSync(
    path.join(publicDir, 'source-evidence.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );

  const sourceContextPath = path.join(ROOT, 'videos', slug, 'source-context.txt');
  fs.mkdirSync(path.dirname(sourceContextPath), {recursive: true});
  fs.writeFileSync(
    sourceContextPath,
    [
      extracted.title,
      extracted.description,
      `URL: ${articleUrl.href}`,
      `Nguồn: ${attribution.credit.replace(/^Nguồn:\s*/i, '')}`,
      extracted.articleText,
    ]
      .filter(Boolean)
      .join('\n\n'),
  );

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  await context.close().catch(() => undefined);
  await browser.close();
}
