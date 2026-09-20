import { describe, it, expect } from 'vitest';
// @ts-expect-error JS module
import {
  CONTENT_MODES,
  STORY_ROLES,
  buildVisualIntent,
  buildVisualAction,
  hasExplicitFamilyReturnContext,
  isFamilyPriorityCompatible,
  matchedPriority,
  buildStoryPlan,
} from '../scripts/human-insight-story-planner.mjs';

describe('Family Interaction Action Precedence (Parallel Fix 04)', () => {
  // Test 1: Generic temporal phrase does NOT trigger work/school
  it('Test 1: generic temporal phrase "sau một ngày dài" does NOT trigger work/school props for interaction role', () => {
    const text = 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.';
    const role = STORY_ROLES.INTERACTION;
    const mode = CONTENT_MODES.FAMILY;

    const intent = buildVisualIntent({ text, role, mode });
    const action = buildVisualAction({ text, role, mode });

    // MUST include interaction meaning such as listen, speak, react, eye contact
    const combinedLower = `${intent} ${action}`.toLowerCase();
    expect(combinedLower).toMatch(/\blisten/);
    expect(combinedLower).toMatch(/\bspeak/);
    expect(combinedLower).toMatch(/\breact/);
    expect(combinedLower).toMatch(/\beye contact/);

    // MUST NOT contain work bag, keys, school notebook, school, work
    expect(combinedLower).not.toContain('work bag');
    expect(combinedLower).not.toContain('keys');
    expect(combinedLower).not.toContain('school notebook');
    expect(combinedLower).not.toMatch(/\bschool\b/);
    expect(combinedLower).not.toMatch(/\bwork\b/);
  });

  // Test 2: Explicit "đi học, đi làm" still triggers context
  it('Test 2: explicit "đi học, đi làm" still triggers school/work arrival context for action role', () => {
    const text = 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.';
    const role = STORY_ROLES.ACTION;
    const mode = CONTENT_MODES.FAMILY;

    const intent = buildVisualIntent({ text, role, mode });
    const action = buildVisualAction({ text, role, mode });

    const combined = `${intent} ${action}`;
    expect(hasExplicitFamilyReturnContext(text)).toBe(true);
    expect(combined).toMatch(/work bag|school notebook|returned home/i);
  });

  // Test 3: Interaction role outranks explicit background context
  it('Test 3: interaction role outranks explicit background context, focusing primary action on interpersonal interaction', () => {
    const text = 'Sau khi đi làm về, bố ngồi nghe con kể chuyện ở bàn ăn.';
    const role = STORY_ROLES.INTERACTION;
    const mode = CONTENT_MODES.FAMILY;

    const action = buildVisualAction({ text, role, mode });
    const intent = buildVisualIntent({ text, role, mode });

    // Primary visible action must be father listening to child, not work bag hero shot
    expect(action.toLowerCase()).toContain('father listening to child');
    expect(action.toLowerCase()).not.toContain('work bag');
    expect(intent.toLowerCase()).not.toContain('work bag');
  });

  // Test 4: Family priority incompatible with earlier interaction
  it('Test 4: family school/work priority is incompatible with clause lacking school/work anchors', () => {
    const clause = 'nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.';
    const priority = 'câu chuyện nhỏ sau một ngày đi học, đi làm.';
    const role = STORY_ROLES.INTERACTION;

    const compatible = isFamilyPriorityCompatible({ text: clause, role, priority });
    expect(compatible).toBe(false);
  });

  // Test 5: Same priority compatible with explicit school/work beat
  it('Test 5: same priority is compatible with explicit school/work beat', () => {
    const clause = 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.';
    const priority = 'câu chuyện nhỏ sau một ngày đi học, đi làm.';
    const role = STORY_ROLES.ACTION;

    const compatible = isFamilyPriorityCompatible({ text: clause, role, priority });
    expect(compatible).toBe(true);
  });

  // Test 6: Rejected priority remains unused and attaches to subsequent compatible beat
  it('Test 6: rejected priority remains unused and attaches to subsequent compatible beat', () => {
    const priority = 'câu chuyện nhỏ sau một ngày đi học, đi làm.';
    const priorities = [priority];
    const usedPriorities = new Set();

    const beatA = { text: 'nghe vài câu chuyện vụn sau một ngày dài', role: STORY_ROLES.INTERACTION };
    const beatB = { text: 'Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm.', role: STORY_ROLES.ACTION };

    // Beat A evaluation
    const matchedA = matchedPriority(
      beatA.text,
      priorities,
      usedPriorities,
      (p: string) => isFamilyPriorityCompatible({ text: beatA.text, role: beatA.role, priority: p })
    );
    expect(matchedA).toBe('');
    expect(usedPriorities.size).toBe(0);

    // Beat B evaluation
    const matchedB = matchedPriority(
      beatB.text,
      priorities,
      usedPriorities,
      (p: string) => isFamilyPriorityCompatible({ text: beatB.text, role: beatB.role, priority: p })
    );
    expect(matchedB).toBe(priority);
  });
});
