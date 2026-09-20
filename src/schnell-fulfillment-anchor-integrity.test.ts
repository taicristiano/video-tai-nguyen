import { describe, it, expect } from 'vitest';
// @ts-expect-error JS module
import {
  extractSemanticAnchors,
  preservedAnchorsForFulfillment,
  planSchnellFulfillment,
  FULFILLMENTS,
  ANCHORS,
} from '../scripts/test-hay-dep-schnell-fulfillment-planner.mjs';
// @ts-expect-error JS module
import { ROUTES } from '../scripts/test-hay-dep-schnell-capability-router.mjs';
// @ts-expect-error JS module
import { CHARACTER_CASTS } from '../scripts/human-insight-story-planner.mjs';

describe('V3.3B-S.5.1 Semantic Anchor Integrity Tests', () => {
  const familyCast = CHARACTER_CASTS['family-young-01'];

  it('Test 1: generic temporal phrase "sau một ngày dài" is NOT school/work', () => {
    const anchors = extractSemanticAnchors({
      voiceClause: 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
      narrativePurpose: '',
      visualIntent: '',
    });

    expect(anchors).toContain(ANCHORS.SPEAKING);
    expect(anchors).toContain(ANCHORS.LISTENING);
    expect(anchors).not.toContain(ANCHORS.SCHOOL_WORK);
  });

  it('Test 2: explicit school/work remains detected for "câu chuyện nhỏ sau một ngày đi học, đi làm."', () => {
    const anchors = extractSemanticAnchors({
      voiceClause: 'câu chuyện nhỏ sau một ngày đi học, đi làm.',
      narrativePurpose: '',
      visualIntent: '',
    });

    expect(anchors).toContain(ANCHORS.SCHOOL_WORK);
    expect(anchors).toContain(ANCHORS.SPEAKING);
  });

  it('Test 3: Video 001 beat-04 has no false school/work anchor in preservedAnchors', () => {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-04',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['boy', 'father', 'mother'],
        voiceClause: 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
        narrativePurpose: 'interaction: nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });

    expect(res.fulfillment).toBe(FULFILLMENTS.SCHNELL_SINGLE);
    expect(res.selectedMember).toBe('boy');
    expect(res.semanticAnchorsPreserved).toContain(ANCHORS.SPEAKING);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.SCHOOL_WORK);
  });

  it('Test 4: Video 001 beat-07 object does not falsely preserve speaking', () => {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-07',
        storyRole: 'action',
        needsPeople: true,
        presentMembers: ['father', 'boy'],
        voiceClause: 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.',
        narrativePurpose: 'action: Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });

    expect(res.fulfillment).toBe(FULFILLMENTS.SCHNELL_OBJECT);
    expect(res.semanticAnchorsPreserved).toContain(ANCHORS.SCHOOL_WORK);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.SPEAKING);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.LISTENING);
  });

  it('Test 5: group reuse preserves group presence without unrelated school/work anchor', () => {
    const res = planSchnellFulfillment({
      beat: {
        id: 'beat-03',
        storyRole: 'interaction',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'mà ở việc mọi người cùng có mặt',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });

    expect(res.fulfillment).toBe(FULFILLMENTS.REUSE_CANONICAL);
    expect(res.semanticAnchorsPreserved).toContain(ANCHORS.GROUP_PRESENCE);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.SCHOOL_WORK);
  });

  it('Test 6: phone object preserves phone-away only', () => {
    const res = planSchnellFulfillment({
      beat: {
        id: 'test-beat-phone',
        storyRole: 'detail-action',
        needsPeople: true,
        presentMembers: ['mother', 'boy'],
        voiceClause: 'điện thoại được đặt sang một bên',
      },
      route: ROUTES.SIMPLIFY_OR_CANONICAL,
      cast: familyCast,
      plan: { castId: 'family-young-01' },
    });

    expect(res.fulfillment).toBe(FULFILLMENTS.SCHNELL_OBJECT);
    expect(res.semanticAnchorsPreserved).toContain(ANCHORS.PHONE_AWAY);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.SPEAKING);
    expect(res.semanticAnchorsPreserved).not.toContain(ANCHORS.GROUP_PRESENCE);
  });
});
