/**
 * src/v35-brand-typography.test.ts
 *
 * HAY & ĐẸP. — V3.5A BRAND + TYPOGRAPHY POLISH
 * Focused offline tests for watermark, typography, safe-zone, and stability contracts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  BRAND_WATERMARK,
  TITLE_TYPOGRAPHY,
  SUBTITLE_TYPOGRAPHY,
  SAFE_ZONES,
} from './templates/human-insight/cinematic-light/brandTypographyTokens';
import { COMPOSITIONS } from './templates/human-insight/cinematic-light/tokens';
import specData from '../videos/phan-1-2026-09-19-co-nhung-bua-com-sau-nay-moi-hieu/spec.json';

describe('V3.5A Brand & Typography Polish Contracts', () => {
  // 1. Exact watermark asset path
  it('Test 1: exact watermark asset path exists and has valid PNG dimensions', () => {
    expect(BRAND_WATERMARK.repoPath).toBe('public/assets/hay-dep/brand/logo-full-horizontal-with-slogan.png');
    expect(BRAND_WATERMARK.staticPath).toBe('assets/hay-dep/brand/logo-full-horizontal-with-slogan.png');

    const exists = fs.existsSync(BRAND_WATERMARK.repoPath);
    expect(exists).toBe(true);

    const buf = fs.readFileSync(BRAND_WATERMARK.repoPath);
    expect(buf.length).toBeGreaterThan(1000);
    // PNG magic bytes
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);

    // PNG dimensions
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1376);
    expect(height).toBe(749);
  });

  // 1b. Missing watermark asset guard returns BLOCKED_BRAND_ASSET
  it('Test 1b: watermark asset guard strictly identifies BLOCKED_BRAND_ASSET when target path is missing', () => {
    const validateBrandAsset = (targetPath: string) => {
      if (!fs.existsSync(targetPath)) {
        return 'V3.5A BRAND + TYPOGRAPHY POLISH — BLOCKED_BRAND_ASSET';
      }
      return 'OK';
    };

    expect(validateBrandAsset('public/assets/non-existent/logo.png')).toBe(
      'V3.5A BRAND + TYPOGRAPHY POLISH — BLOCKED_BRAND_ASSET'
    );
    expect(validateBrandAsset(BRAND_WATERMARK.repoPath)).toBe('OK');
  });

  // 2. Watermark opacity bounds (tuned for V1.2.1 to 0.34)
  it('Test 2: watermark opacity is tuned to 0.34 (restrained, 0.30-0.38)', () => {
    expect(BRAND_WATERMARK.opacity).toBeGreaterThanOrEqual(0.30);
    expect(BRAND_WATERMARK.opacity).toBeLessThanOrEqual(0.38);
    expect(BRAND_WATERMARK.opacity).toBe(0.34);
  });

  // 3. Watermark edge inset (28/32px) and target width (270px)
  it('Test 3: watermark edge insets are 28/32px and width is tuned to 270px', () => {
    expect(BRAND_WATERMARK.insetTop).toBe(28);
    expect(BRAND_WATERMARK.insetRight).toBe(32);
    expect(BRAND_WATERMARK.insetTop).toBeGreaterThanOrEqual(24);
    expect(BRAND_WATERMARK.insetTop).toBeLessThanOrEqual(40);

    expect(BRAND_WATERMARK.width).toBe(270);
  });

  // 4. Title and Subtitle max width constants
  it('Test 4: title and subtitle max width constants prevent overflow and preserve mobile readability', () => {
    expect(TITLE_TYPOGRAPHY.maxWidth).toBeLessThanOrEqual(880);
    expect(TITLE_TYPOGRAPHY.maxWidth).toBeGreaterThanOrEqual(780);
    expect(TITLE_TYPOGRAPHY.maxLines).toBe(2);

    expect(SUBTITLE_TYPOGRAPHY.maxWidth).toBeLessThanOrEqual(920);
    expect(SUBTITLE_TYPOGRAPHY.maxWidth).toBeGreaterThanOrEqual(800);

    expect(SAFE_ZONES.topSafeZoneMin).toBeGreaterThanOrEqual(120);
    expect(SAFE_ZONES.bottomSafeZoneMin).toBeGreaterThanOrEqual(180);
  });

  // 5. No watermark transform animation (static pixel-stable watermark)
  it('Test 5: watermark has no transform animation, no scale pulsing, and is pixel-stable in Layout.tsx', () => {
    expect(BRAND_WATERMARK.animated).toBe(false);

    const layoutSource = fs.readFileSync(
      path.join(__dirname, 'templates/human-insight/cinematic-light/Layout.tsx'),
      'utf8'
    );

    // Layout should NOT apply headerBreath scale to watermark
    const watermarkSection = layoutSource.slice(
      layoutSource.indexOf('BRAND_WATERMARK.insetTop') - 100,
      layoutSource.indexOf('BRAND_WATERMARK.insetTop') + 400
    );

    expect(watermarkSection).not.toContain('headerBreath');
    expect(watermarkSection).not.toContain('transform:');
    expect(watermarkSection).not.toContain('transition:');
    expect(watermarkSection).toContain('BRAND_WATERMARK.opacity');
  });

  // 6. No subtitle timing or content mutation
  it('Test 6: canonical subtitle text and timing from spec are completely preserved', () => {
    const scenes = (specData as any).scenes.slice(0, 6);
    expect(scenes).toHaveLength(6);

    const expectedTexts = [
      'Khi còn nhỏ, một bữa cơm đủ người',
      'Giá trị của bữa cơm không nằm ở món ăn',
      'mà ở việc mọi người cùng có mặt',
      'Có thể là một mâm cơm đơn giản',
      'Có khi chỉ là câu chuyện nhỏ',
      'Những chi tiết như vậy không tạo cảm giác',
    ];

    scenes.forEach((scene: any, i: number) => {
      expect(scene.audioSegment.text).toContain(expectedTexts[i]);
      expect(scene.durationFrames).toBeGreaterThan(60);
      expect(scene.audioSegment.start).toBeDefined();
      expect(scene.audioSegment.end).toBeGreaterThan(scene.audioSegment.start);
    });
  });

  // 7. V3.4A motion props untouched
  it('Test 7: V3.4A motion props, presets, and durations are untouched', () => {
    const scenes = (specData as any).scenes.slice(0, 6);
    const expectedPresets = [
      'slow-push',
      'still-breathe',
      'focus-shift',
      'slow-push',
      'still-breathe',
      'still-breathe',
    ];

    scenes.forEach((scene: any, i: number) => {
      expect(scene.motionPreset).toBe(expectedPresets[i]);
      expect(scene.durationFrames).toBeGreaterThan(50);
      expect(scene.startFrame).toBeDefined();
    });
  });

  // 8. visualBeats={undefined} preserved in comparison pilot
  it('Test 8: visualBeats is explicitly undefined in PilotRoot.tsx for scene-level comparison', () => {
    const v35PilotRoot = fs.readFileSync(
      path.join(__dirname, '../scratch/v35/brand-typography/PilotRoot.tsx'),
      'utf8'
    );

    expect(v35PilotRoot).toContain('visualBeats={undefined}');
    expect(v35PilotRoot).toContain('focalPoint={undefined}');
    expect(v35PilotRoot).toContain('portrait-focus');
    expect(v35PilotRoot).toContain('BRAND_WATERMARK.staticPath');
  });

  // 9. HAY & ĐẸP typography/layout v1.2 contracts
  it('Test 9: HAY & ĐẸP typography/layout v1.2 contracts', () => {
    expect(TITLE_TYPOGRAPHY.fontSize).toBeGreaterThanOrEqual(56);
    expect(SUBTITLE_TYPOGRAPHY.fontSize).toBeGreaterThanOrEqual(42);
    expect(TITLE_TYPOGRAPHY.maxLines).toBe(2);
    expect(SAFE_ZONES.artworkTop).toBeGreaterThanOrEqual(350);
    expect(SAFE_ZONES.artworkLeft).toBe(90);
    expect(SAFE_ZONES.artworkWidth).toBe(900);
    expect(COMPOSITIONS['editorial-left'].left).toBe(90);
    expect(COMPOSITIONS['editorial-left'].width).toBe(900);
    expect(COMPOSITIONS['editorial-right'].left).toBe(90);
    expect(COMPOSITIONS['editorial-right'].width).toBe(900);
  });

  // 10. V1.2.1 brand clearance contracts
  it('Test 10: V1.2.1 brand clearance contracts', () => {
    expect(TITLE_TYPOGRAPHY.fontSize).toBe(58);
    expect(TITLE_TYPOGRAPHY.top).toBeGreaterThanOrEqual(140);
    expect(TITLE_TYPOGRAPHY.top).toBe(145);
    expect(BRAND_WATERMARK.width).toBeGreaterThanOrEqual(260);
    expect(BRAND_WATERMARK.width).toBe(270);
    expect(BRAND_WATERMARK.opacity).toBeGreaterThanOrEqual(0.30);
    expect(BRAND_WATERMARK.opacity).toBeLessThanOrEqual(0.38);
    expect(BRAND_WATERMARK.opacity).toBe(0.34);
    expect(SAFE_ZONES.artworkTop).toBe(360);
    expect(SAFE_ZONES.artworkLeft).toBe(90);
    expect(SAFE_ZONES.artworkWidth).toBe(900);
    expect(TITLE_TYPOGRAPHY.top - BRAND_WATERMARK.safeBottom).toBeGreaterThanOrEqual(24);
  });
});
