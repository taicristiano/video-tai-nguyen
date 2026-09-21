import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
  REFERENCE_SHOT_GRAMMAR,
  detectVisualVerb,
  resolveVisualStrategy,
  validateShotPlan,
  buildShotGrammarMetrics,
  evaluateAssetReuse,
  resolveAssetStrategy,
  buildImagePromptForShot,
  chooseCompositionForShot,
  isValidHoldException,
  type PlannedShot,
  type ApprovedVisualAsset,
} from './referenceShotGrammar';
import {
  planHumanInsightVideo,
  buildCandidateShotPlan,
  buildPlannerRunResult,
  validatePlannerArtifacts,
  auditBrandContext,
  shouldSplitClause,
  chooseHookPattern,
  buildTemplateScenes,
  buildReuseAudit,
  evaluateProductionReadiness,
  mapPlannerRoleToRendererRole,
} from './storyPlanner';

describe('reference-derived shot grammar contracts & planner integration', () => {
  const baseShot: PlannedShot = {
    id: 'shot-01',
    startFrame: 0,
    endFrame: 90,
    durationFrames: 90,
    scale: 'MEDIUM',
    silhouette: 'single-left',
    storyRole: 'action',
    visualVerb: 'đặt xuống',
    peopleContract: { min: 1, max: 1 },
    semanticIntent: 'Testing intentional action',
    assetStrategy: 'NEW_IMAGE',
    composition: 'portrait-focus',
    motionProfile: 'PUSH_IN_SOFT',
    referenceReason: 'Establishing clean visual verb',
  };

  // ── Baseline Contract Tests ───────────────────────────────────────────────

  it('rejects 3 consecutive identical shot scales without exception', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', scale: 'MEDIUM', silhouette: 'single-left' },
      { ...baseShot, id: 's2', scale: 'MEDIUM', silhouette: 'single-right', startFrame: 90, endFrame: 180 },
      { ...baseShot, id: 's3', scale: 'MEDIUM', silhouette: 'single-centered', startFrame: 180, endFrame: 270 },
    ];

    const result = validateShotPlan(shots, { checkCadence: false });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('s3: 3 consecutive MEDIUM shots');
  });

  it('rejects 3 consecutive identical silhouettes without exception', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', scale: 'WIDE', silhouette: 'single-centered' },
      { ...baseShot, id: 's2', scale: 'MEDIUM', silhouette: 'single-centered', startFrame: 90, endFrame: 180 },
      { ...baseShot, id: 's3', scale: 'CLOSE', silhouette: 'single-centered', startFrame: 180, endFrame: 270 },
    ];

    const result = validateShotPlan(shots, { checkCadence: false });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('s3: 3 consecutive single-centered silhouettes');
  });

  it('rejects cadence above configured maximum (22.0 changes/min)', () => {
    const shots: PlannedShot[] = Array.from({ length: 25 }, (_, i) => ({
      ...baseShot,
      id: `s${i + 1}`,
      startFrame: i * 36,
      endFrame: (i + 1) * 36,
      durationFrames: 36,
      scale: (i % 2 === 0 ? 'DETAIL' : 'MEDIUM') as any,
      silhouette: (i % 2 === 0 ? 'single-left' : 'single-right') as any,
    }));

    const result = validateShotPlan(shots, { checkCadence: true });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e: any) => e.includes('cadence above max'))).toBe(true);
  });

  it('rejects cadence below configured minimum (18.0 changes/min)', () => {
    const shots: PlannedShot[] = Array.from({ length: 6 }, (_, i) => ({
      ...baseShot,
      id: `s${i + 1}`,
      startFrame: i * 200,
      endFrame: (i + 1) * 200,
      durationFrames: 200,
      scale: (i % 2 === 0 ? 'WIDE' : 'MEDIUM') as any,
      silhouette: (i % 2 === 0 ? 'room-wide' : 'single-left') as any,
      holdException: {
        kind: 'AUTHORED_EMOTIONAL_PAUSE',
        reason: 'Deliberate long atmospheric meditation pause',
      },
      storyRole: 'reflection',
    }));

    const result = validateShotPlan(shots, { checkCadence: true });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e: any) => e.includes('cadence below min'))).toBe(true);
  });

  it('produces warning for hold duration outside recommended scale range without failing plan', () => {
    const shots: PlannedShot[] = [
      {
        ...baseShot,
        id: 's1',
        scale: 'DETAIL',
        durationFrames: 105, // 3.5s (DETAIL recommended: 1.5 - 2.8s)
        startFrame: 0,
        endFrame: 105,
      },
    ];

    const result = validateShotPlan(shots, { checkCadence: false });
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('outside recommended DETAIL range');
  });

  it('requires visual verb and semantic intent', () => {
    const invalidShot: PlannedShot[] = [
      { ...baseShot, id: 's1', visualVerb: '', semanticIntent: '' },
    ];

    const result = validateShotPlan(invalidShot, { checkCadence: false });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('s1: missing visualVerb');
    expect(result.errors).toContain('s1: missing semanticIntent');
  });

  it('rejects timeline gaps and overlaps between adjacent shots', () => {
    const gapShots: PlannedShot[] = [
      { ...baseShot, id: 's1', startFrame: 0, endFrame: 90, durationFrames: 90 },
      { ...baseShot, id: 's2', startFrame: 100, endFrame: 190, durationFrames: 90 },
    ];
    const gapResult = validateShotPlan(gapShots, { checkCadence: false });
    expect(gapResult.ok).toBe(false);
    expect(gapResult.errors.some((e: any) => e.includes('Timeline mismatch'))).toBe(true);
  });

  it('applies document text-safety exclusions when scene involves paper/notebooks', () => {
    const paperShot: PlannedShot = {
      ...baseShot,
      semanticIntent: 'Đôi bàn tay nhẹ nhàng khép lại cuốn sổ tay ghi chép trên bàn',
    };
    const prompt = buildImagePromptForShot(paperShot);
    expect(prompt).toContain('DOCUMENT TEXT-SAFETY:');
    expect(prompt).toContain('Always render blank unprinted paper slips, plain unprinted notebook pages');
  });

  it('applies timer safety exclusions with no readable numerals when scene involves timers', () => {
    const timerShot: PlannedShot = {
      ...baseShot,
      semanticIntent: 'Ngón tay vặn chiếc đồng hồ hẹn giờ cơ học timer 10 phút trên bàn',
    };
    const prompt = buildImagePromptForShot(timerShot);
    expect(prompt).toContain('TIMER SAFETY:');
    expect(prompt).toContain('Minimal mechanical timer with simple wedge indicator');
  });

  it('maps composition preset sanely via chooseCompositionForShot', () => {
    expect(chooseCompositionForShot('DETAIL', 'tabletop-topdown', 'action')).toBe('detail-insert');
    expect(chooseCompositionForShot('DETAIL', 'hands-detail', 'action')).toBe('detail-insert');
    expect(chooseCompositionForShot('SYMBOLIC', 'object-detail', 'context')).toBe('paper');
    expect(chooseCompositionForShot('MEDIUM', 'single-left', 'reflection')).toBe('editorial-left');
    expect(chooseCompositionForShot('MEDIUM', 'single-right', 'reflection')).toBe('editorial-right');
    expect(chooseCompositionForShot('CLOSE', 'face-close', 'reflection')).toBe('portrait-focus');
  });

  // ── Prompt Section 11 Required 16 Unit Tests ──────────────────────────────

  // 1. metrics shot count equals actual plan length
  it('1. metrics shot count equals actual plan length', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', startFrame: 0, endFrame: 60, durationFrames: 60 },
      { ...baseShot, id: 's2', startFrame: 60, endFrame: 120, durationFrames: 60 },
      { ...baseShot, id: 's3', startFrame: 120, endFrame: 180, durationFrames: 60 },
    ];
    const metrics = buildShotGrammarMetrics(shots);
    expect(metrics.shotCount).toBe(shots.length);
    expect(metrics.shotCount).toBe(3);
  });

  // 2. strategy counts equal metrics
  it('2. strategy counts equal metrics', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', assetStrategy: 'NEW_IMAGE' },
      { ...baseShot, id: 's2', assetStrategy: 'NEW_IMAGE', startFrame: 90, endFrame: 180 },
      { ...baseShot, id: 's3', assetStrategy: 'REUSE_FULL', startFrame: 180, endFrame: 270 },
      { ...baseShot, id: 's4', assetStrategy: 'REUSE_CROP', startFrame: 270, endFrame: 360 },
      { ...baseShot, id: 's5', assetStrategy: 'COMPONENT', startFrame: 360, endFrame: 420 },
    ];
    const metrics = buildShotGrammarMetrics(shots);
    expect(metrics.reuseCount).toBe(2);
    expect(metrics.newImageCount).toBe(2);
    expect(metrics.componentCount).toBe(1);
    expect(metrics.reuseCount + metrics.newImageCount + metrics.componentCount).toBe(shots.length);
  });

  // 3. reuse audit summary equals real plan
  it('3. reuse audit summary equals real plan', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', assetStrategy: 'NEW_IMAGE' },
      { ...baseShot, id: 's2', assetStrategy: 'REUSE_FULL', startFrame: 90, endFrame: 180 },
      { ...baseShot, id: 's3', assetStrategy: 'COMPONENT', startFrame: 180, endFrame: 240, storyRole: 'outro' },
    ];
    const audit = buildReuseAudit(shots);
    expect(audit.summary.totalShots).toBe(shots.length);
    expect(audit.summary.reuseCount).toBe(1);
    expect(audit.summary.newImageCount).toBe(1);
    expect(audit.summary.componentCount).toBe(1);
    expect(audit.evaluations.length).toBe(shots.length);
  });

  // 4. stale reuse prose cannot be generated from zero-reuse plan
  it('4. stale reuse prose cannot be generated from zero-reuse plan', () => {
    const shots: PlannedShot[] = [
      { ...baseShot, id: 's1', assetStrategy: 'NEW_IMAGE' },
      { ...baseShot, id: 's2', assetStrategy: 'NEW_IMAGE', startFrame: 90, endFrame: 180 },
      { ...baseShot, id: 's3', assetStrategy: 'COMPONENT', startFrame: 180, endFrame: 240, storyRole: 'outro' },
    ];
    const metrics = buildShotGrammarMetrics(shots);
    const audit = buildReuseAudit(shots);

    const fakeRunResult = {
      plan: {
        grammarVersion: 'reference-shot-grammar-v1' as const,
        plannerVersion: 'cinematic-light-story-planner-v2.1' as const,
        generatedByTemplate: true as const,
        sourceSlug: 'test',
        title: 'Test',
        shots,
        metrics,
        validation: validateShotPlan(shots, { checkCadence: false }),
        structuralValidation: validateShotPlan(shots, { checkCadence: false }),
        productionValidation: { ok: true, productionReady: true, errors: [], warnings: [] },
        brandAudit: { templateBrand: 'HAY & ĐẸP.', audioMentionsBrand: false, hasMismatch: false, notes: '' },
        reuseAudit: audit,
        scenes: [],
      },
      metrics,
      validation: validateShotPlan(shots, { checkCadence: false }),
      structuralValidation: validateShotPlan(shots, { checkCadence: false }),
      productionValidation: { ok: true, productionReady: true, errors: [], warnings: [] },
      brandAudit: { templateBrand: 'HAY & ĐẸP.', audioMentionsBrand: false, hasMismatch: false, notes: '' },
      reuseAudit: audit,
      storyboardHeaderModel: {
        shotCount: 3,
        changesPerMinute: metrics.changesPerMinute,
        uniqueScales: metrics.uniqueScales,
        uniqueSilhouettes: metrics.uniqueSilhouettes,
        text: `${metrics.shotCount} shots | ${metrics.changesPerMinute.toFixed(2)} changes/min | ${metrics.uniqueScales} scales | ${metrics.uniqueSilhouettes} silhouettes`,
      },
      transitionStripHeaderModel: {
        shotCount: 3,
        changesPerMinute: metrics.changesPerMinute,
        uniqueScales: metrics.uniqueScales,
        uniqueSilhouettes: metrics.uniqueSilhouettes,
        text: `${metrics.shotCount} shots | ${metrics.changesPerMinute.toFixed(2)} changes/min | ${metrics.uniqueScales} scales | ${metrics.uniqueSilhouettes} silhouettes`,
      },
    };

    const consistency = validatePlannerArtifacts(fakeRunResult);
    expect(consistency.ok).toBe(true);
    expect(fakeRunResult.reuseAudit.summary.reuseCount).toBe(0);
    // Verifies no fake REUSE_CROP or REUSE_FULL claims exist in evaluations
    const hasAnyReuse = fakeRunResult.reuseAudit.evaluations.some(
      (e: any) => e.strategy === 'REUSE_FULL' || e.strategy === 'REUSE_CROP',
    );
    expect(hasAnyReuse).toBe(false);
  });

  // 5. storyboard header model comes from metrics
  it('5. storyboard header model comes from metrics', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test Title',
      timelineSegments: [
        { start: 0, end: 3.0, text: 'Câu mở đầu cho thử nghiệm' },
        { start: 3.0, end: 6.0, text: 'Câu thứ hai diễn ra êm đẹp' },
      ],
      brandContext: { brandName: 'HAY & ĐẸP.' },
    };
    const result = buildPlannerRunResult(input);
    expect(result.storyboardHeaderModel.shotCount).toBe(result.metrics.shotCount);
    expect(result.storyboardHeaderModel.changesPerMinute).toBe(result.metrics.changesPerMinute);
    expect(result.storyboardHeaderModel.uniqueScales).toBe(result.metrics.uniqueScales);
    expect(result.storyboardHeaderModel.uniqueSilhouettes).toBe(result.metrics.uniqueSilhouettes);
    expect(result.storyboardHeaderModel.text).toContain(`${result.metrics.shotCount} shots`);
    expect(result.storyboardHeaderModel.text).toContain(`${result.metrics.changesPerMinute.toFixed(2)} changes/min`);
  });

  // 6. transition strip header model comes from metrics
  it('6. transition strip header model comes from metrics', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test Title',
      timelineSegments: [
        { start: 0, end: 3.0, text: 'Câu mở đầu cho thử nghiệm' },
        { start: 3.0, end: 6.0, text: 'Câu thứ hai diễn ra êm đẹp' },
      ],
      brandContext: { brandName: 'HAY & ĐẸP.' },
    };
    const result = buildPlannerRunResult(input);
    expect(result.transitionStripHeaderModel.shotCount).toBe(result.metrics.shotCount);
    expect(result.transitionStripHeaderModel.text).toBe(result.storyboardHeaderModel.text);
  });

  // 7. >4s NEW_IMAGE with fake free-form reason is rejected
  it('7. rejects >4s NEW_IMAGE with fake free-form exception reason', () => {
    const longShot: PlannedShot[] = [
      {
        ...baseShot,
        id: 's1',
        durationFrames: 150, // 5.0s > 4.0s
        exceptionReason: 'Dedicated Insight Statement Card hold', // free-form bypass attempt
        assetStrategy: 'NEW_IMAGE',
      },
    ];
    const result = validateShotPlan(longShot, { checkCadence: false });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('s1: hold too long (5.00s)');
  });

  // 8. INSIGHT_CARD exception requires actual insight-card metadata
  it('8. INSIGHT_CARD exception requires actual insight-card metadata', () => {
    // Fails without hasInsightCard: true
    const invalidShot: PlannedShot[] = [
      {
        ...baseShot,
        id: 's1',
        durationFrames: 150,
        holdException: {
          kind: 'INSIGHT_CARD',
          reason: 'Dedicated Insight Statement Card hold',
        },
        hasInsightCard: false,
      },
    ];
    const invalidResult = validateShotPlan(invalidShot, { checkCadence: false });
    expect(invalidResult.ok).toBe(false);
    expect(invalidResult.errors).toContain('s1: hold too long (5.00s)');

    // Passes when hasInsightCard: true
    const validShot: PlannedShot[] = [
      {
        ...invalidShot[0],
        hasInsightCard: true,
      },
    ];
    const validResult = validateShotPlan(validShot, { checkCadence: false });
    expect(validResult.ok).toBe(true);
  });

  // 9. OUTRO exception requires actual outro component
  it('9. OUTRO exception requires actual outro component', () => {
    // Fails if not COMPONENT or not outro role
    const invalidShot: PlannedShot[] = [
      {
        ...baseShot,
        id: 's1',
        durationFrames: 150,
        storyRole: 'action',
        assetStrategy: 'NEW_IMAGE',
        holdException: {
          kind: 'OUTRO_COMPONENT',
          reason: 'Standard branded outro release hold',
        },
      },
    ];
    expect(isValidHoldException(invalidShot[0])).toBe(false);

    // Passes when storyRole: 'outro' and assetStrategy: 'COMPONENT'
    const validShot: PlannedShot = {
      ...invalidShot[0],
      storyRole: 'outro',
      assetStrategy: 'COMPONENT',
    };
    expect(isValidHoldException(validShot)).toBe(true);
  });

  // 10. planner hook identity survives scene conversion
  it('10. planner hook identity survives scene conversion', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test',
      timelineSegments: [{ start: 0, end: 3.0, text: 'Mở đầu video' }],
    };
    const scenes = buildTemplateScenes(
      [
        {
          ...baseShot,
          id: 'shot-01',
          storyRole: 'hook',
        },
      ],
      input,
    );
    expect(scenes[0].type).toBe('hook');
    expect(scenes[0].plannerStoryRole).toBe('hook');
    expect(mapPlannerRoleToRendererRole('hook')).toBe('establish');
  });

  // 11. planner outro identity survives scene conversion
  it('11. planner outro identity survives scene conversion', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test',
      timelineSegments: [{ start: 0, end: 3.0, text: 'Kết thúc video' }],
    };
    const scenes = buildTemplateScenes(
      [
        {
          ...baseShot,
          id: 'shot-outro',
          storyRole: 'outro',
          assetStrategy: 'COMPONENT',
        },
      ],
      input,
    );
    expect(scenes[0].isOutro).toBe(true);
    expect(scenes[0].plannerStoryRole).toBe('outro');
  });

  // 12. PRODUCTION mode blocks BRAND_AUDIO_MISMATCH
  it('12. PRODUCTION mode blocks BRAND_AUDIO_MISMATCH', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test',
      timelineSegments: [],
      brandContext: { brandName: 'HAY & ĐẸP.' },
    };
    const shotsWithMismatch: PlannedShot[] = [
      {
        ...baseShot,
        audioText: 'Nếp, những điều nhỏ tạo nên một đời sống',
      },
    ];
    const structural = validateShotPlan(shotsWithMismatch, { checkCadence: false });
    const brandAudit = auditBrandContext(input, shotsWithMismatch);

    const prodValidation = evaluateProductionReadiness(structural, brandAudit, 'PRODUCTION');
    expect(prodValidation.ok).toBe(false);
    expect(prodValidation.productionReady).toBe(false);
    expect(prodValidation.errors.some((e: any) => e.includes('BRAND_AUDIO_MISMATCH'))).toBe(true);
  });

  // 13. DRAFT mode surfaces brand mismatch without pretending productionReady
  it('13. DRAFT mode surfaces brand mismatch without pretending productionReady', () => {
    const input = {
      slug: 'test-slug',
      title: 'Test',
      timelineSegments: [],
      brandContext: { brandName: 'HAY & ĐẸP.' },
    };
    const shotsWithMismatch: PlannedShot[] = [
      {
        ...baseShot,
        audioText: 'Nếp, những điều nhỏ tạo nên một đời sống',
      },
    ];
    const structural = validateShotPlan(shotsWithMismatch, { checkCadence: false });
    const brandAudit = auditBrandContext(input, shotsWithMismatch);

    const draftValidation = evaluateProductionReadiness(structural, brandAudit, 'DRAFT');
    expect(draftValidation.ok).toBe(true); // structurally ok, no blocking errors in draft
    expect(draftValidation.productionReady).toBe(false); // but NOT production ready
    expect(draftValidation.warnings.some((w: any) => w.includes('BRAND_AUDIO_MISMATCH'))).toBe(true);
  });

  // 14. video005 generated from real reusable planner
  it('14. video005 generated from real reusable planner', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const timelinePath = path.join(
      rootDir,
      'public/phan-5-2026-09-17-muoi-phut-reset-cuoi-ngay-dang-gia-hon/timeline.json',
    );
    expect(fs.existsSync(timelinePath)).toBe(true);
    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

    const result = buildPlannerRunResult({
      slug: 'phan-5-2026-09-17-muoi-phut-reset-cuoi-ngay-dang-gia-hon',
      title: 'Mười Phút Reset Cuối Ngày Đáng Giá Hơn Một Giờ Dọn Cuối Tuần',
      timelineSegments: timeline.segments,
      brandContext: { brandName: 'HAY & ĐẸP.' },
    });

    const plan = result.plan;
    expect(plan.grammarVersion).toBe('reference-shot-grammar-v1');
    expect(plan.structuralValidation.ok).toBe(true);
    expect(plan.metrics.changesPerMinute).toBeGreaterThanOrEqual(18.0);
    expect(plan.metrics.changesPerMinute).toBeLessThanOrEqual(22.0);
    expect(plan.metrics.maxHoldSeconds).toBeLessThanOrEqual(4.0);
    expect(plan.metrics.uniqueScales).toBeGreaterThanOrEqual(4);
    expect(plan.metrics.uniqueSilhouettes).toBeGreaterThanOrEqual(5);

    const consistency = validatePlannerArtifacts(result);
    expect(consistency.ok).toBe(true);
  });

  // 15. video013 generated from same planner
  it('15. video013 generated from same planner', () => {
    const rootDir = path.resolve(__dirname, '../../../../');
    const timelinePath = path.join(
      rootDir,
      'public/phan-13-2026-09-17-khong-phai-luc-nao-nguoi-khac-ke-chuyen/timeline.json',
    );
    expect(fs.existsSync(timelinePath)).toBe(true);
    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

    const result = buildPlannerRunResult({
      slug: 'phan-13-2026-09-17-khong-phai-luc-nao-nguoi-khac-ke-chuyen',
      title: 'Không Phải Lúc Nào Người Khác Kể Chuyện Cũng Để Tìm Lời Khuyên',
      timelineSegments: timeline.segments,
      brandContext: { brandName: 'HAY & ĐẸP.' },
    });

    const plan = result.plan;
    expect(plan.grammarVersion).toBe('reference-shot-grammar-v1');
    expect(plan.structuralValidation.ok).toBe(true);
    expect(plan.metrics.changesPerMinute).toBeGreaterThanOrEqual(18.0);
    expect(plan.metrics.changesPerMinute).toBeLessThanOrEqual(22.0);
    expect(plan.metrics.maxHoldSeconds).toBeLessThanOrEqual(4.0);
    expect(plan.metrics.uniqueScales).toBeGreaterThanOrEqual(4);

    const consistency = validatePlannerArtifacts(result);
    expect(consistency.ok).toBe(true);
  });

  // 16. no video-specific conditionals added
  it('16. no video-specific conditionals added in reusable planner code', () => {
    const plannerSrc = fs.readFileSync(path.join(__dirname, 'storyPlanner.ts'), 'utf-8');
    const grammarSrc = fs.readFileSync(path.join(__dirname, 'referenceShotGrammar.ts'), 'utf-8');

    const FORBIDDEN_WORDS = [
      'phan-5',
      'phan-13',
      'muoi-phut',
      'khong-phai-luc-nao',
      'video005',
      'video013',
    ];

    for (const word of FORBIDDEN_WORDS) {
      expect(plannerSrc.toLowerCase()).not.toContain(word);
      expect(grammarSrc.toLowerCase()).not.toContain(word);
    }
  });
});
