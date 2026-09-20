import { describe, it, expect } from 'vitest';
// @ts-expect-error JS module
import { splitVisualClauses, allocateBeatFrames, normalizeSplitText } from '../scripts/human-insight-story-planner.mjs';

describe('Semantic Visual Beat Splitting (Parallel Fix 03)', () => {
  // Test 1: Strong "hoặc" split even around 4.4s (Example A)
  it('Test 1: splits strong "hoặc" conjunction around 4.4s into 2 distinct beats', () => {
    const text = 'Có thể là một mâm cơm đơn giản có đủ người, hoặc chiếc điện thoại được đặt sang một bên.';
    const beats = splitVisualClauses(text, 4.4);
    expect(beats.length).toBe(2);
    expect(beats[0]).toBe('Có thể là một mâm cơm đơn giản có đủ người');
    expect(beats[1]).toBe('hoặc chiếc điện thoại được đặt sang một bên.');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  // Test 2: Long comma action split (Example B)
  it('Test 2: splits long comma-separated action cues at 5.16s', () => {
    const text = 'mà ở việc mọi người cùng có mặt, nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài.';
    const beats = splitVisualClauses(text, 5.16);
    expect(beats.length).toBeGreaterThanOrEqual(2);
    expect(beats[0]).toBe('mà ở việc mọi người cùng có mặt');
    expect(beats[1]).toContain('nghe vài câu chuyện vụn');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  // Test 3: Independent phone idea after "và" (Example C)
  it('Test 3: separates independent phone/focal object idea after "và" at 6.24s', () => {
    const text = 'Tuần này, thử giữ lại ít nhất một bữa ăn mà mọi người ngồi cùng nhau và điện thoại không nằm giữa bàn.';
    const beats = splitVisualClauses(text, 6.24);
    expect(beats.length).toBeGreaterThanOrEqual(2);
    const phoneBeat = beats.find((b: string) => b.includes('điện thoại'));
    expect(phoneBeat).toBeDefined();
    expect(phoneBeat).toBe('và điện thoại không nằm giữa bàn.');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  // Test 4: Do not split ordinary short "và" (2.8s)
  it('Test 4: preserves short phrase with ordinary "và" (2.8s) as a single beat', () => {
    const text = 'chúng ta cùng cười và cùng ăn tối.';
    const beats = splitVisualClauses(text, 2.8);
    expect(beats.length).toBe(1);
    expect(beats[0]).toBe(text);
  });

  // Test 5: Do not split tiny comma phrases (2.5s)
  it('Test 5: does not split short comma phrase (2.5s)', () => {
    const text = 'Sau đó, mọi người đi ngủ.';
    const beats = splitVisualClauses(text, 2.5);
    expect(beats.length).toBe(1);
    expect(beats[0]).toBe(text);
  });

  // Test 6: Preserve connectors and word order ("nhưng", "hoặc", "còn")
  it('Test 6a: preserves connector "nhưng" and exact word order', () => {
    const text = 'Tôi rất muốn đi ra ngoài chơi, nhưng bên ngoài trời đang đổ mưa rất to.';
    const beats = splitVisualClauses(text, 4.5);
    expect(beats.length).toBe(2);
    expect(beats[0]).toBe('Tôi rất muốn đi ra ngoài chơi');
    expect(beats[1]).toBe('nhưng bên ngoài trời đang đổ mưa rất to.');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  it('Test 6b: preserves connector "còn" and exact word order', () => {
    const text = 'Người lớn thì bận rộn dọn dẹp, còn trẻ con thì ngồi vẽ tranh trong góc phòng.';
    const beats = splitVisualClauses(text, 4.5);
    expect(beats.length).toBe(2);
    expect(beats[0]).toBe('Người lớn thì bận rộn dọn dẹp');
    expect(beats[1]).toBe('còn trẻ con thì ngồi vẽ tranh trong góc phòng.');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  it('Test 6c: preserves connector "trong khi" and exact word order', () => {
    const text = 'Mẹ đang cẩn thận xới từng bát cơm, trong khi bố chuẩn bị bàn ăn cho cả nhà.';
    const beats = splitVisualClauses(text, 4.8);
    expect(beats.length).toBe(2);
    expect(beats[0]).toBe('Mẹ đang cẩn thận xới từng bát cơm');
    expect(beats[1]).toBe('trong khi bố chuẩn bị bàn ăn cho cả nhà.');
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  // Test 7: Max 3 beats per transcript segment
  it('Test 7: enforces a maximum of 3 visual beats even for long multi-clause segments', () => {
    const text = 'Có thể là một mâm cơm ấm cúng, hoặc chiếc điện thoại được đặt sang một bên, nhưng mọi người vẫn nói chuyện vui vẻ, và cùng nhau dọn dẹp bàn ăn.';
    const beats = splitVisualClauses(text, 8.5);
    expect(beats.length).toBeLessThanOrEqual(3);
    expect(normalizeSplitText(beats.join(' '))).toBe(normalizeSplitText(text));
  });

  // Test 8: Frame allocation monotonic and bounded
  it('Test 8: frame allocation is strictly monotonic, covers bounds, and duration > 0', () => {
    const segment = { start: 13.62, end: 18.02, text: 'Có thể là một mâm cơm... hoặc chiếc điện thoại...' };
    const clauses = [
      'Có thể là một mâm cơm đơn giản có đủ người',
      'hoặc chiếc điện thoại được đặt sang một bên.',
    ];
    const frames = allocateBeatFrames(segment, clauses);
    expect(frames.length).toBe(2);

    const expectedStart = Math.max(0, Math.round(segment.start * 30));
    const expectedEnd = Math.max(expectedStart + 1, Math.round(segment.end * 30));

    expect(frames[0].startFrame).toBe(expectedStart);
    expect(frames[frames.length - 1].endFrame).toBe(expectedEnd);

    for (let i = 0; i < frames.length; i++) {
      expect(frames[i].startFrame).toBeLessThan(frames[i].endFrame);
      if (i > 0) {
        expect(frames[i].startFrame).toBe(frames[i - 1].endFrame);
      }
    }
  });

  it('Test 8b: handles object clauses and edge-case short segments safely', () => {
    const segment = { start: 0, end: 0.05, text: 'Nhanh' };
    const clauses = [{ text: 'Nhanh một' }, { text: 'Nhanh hai' }];
    const frames = allocateBeatFrames(segment, clauses);
    expect(frames.length).toBe(2);
    expect(frames[0].startFrame).toBe(0);
    expect(frames[0].endFrame).toBe(1);
    expect(frames[1].startFrame).toBe(1);
    expect(frames[1].endFrame).toBe(2);
  });
});
