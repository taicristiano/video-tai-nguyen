import { describe, expect, it } from 'vitest';
import { deriveSlug } from './slug';

describe('deriveSlug', () => {
  it('handles standard context without part', () => {
    const slug = deriveSlug('Ba câu hỏi trước khi mua món đồ mới');
    const today = new Date().toISOString().slice(0, 10);
    expect(slug).toBe(`${today}-ba-cau-hoi-truoc-khi-mua-mon-do`);
  });

  it('handles context with Phần: {i} and ignores metadata lines', () => {
    const context = `Video dọc 9:16, thời lượng mục tiêu 70–85 giây.

Phần: 1

Brand: HAY & ĐẸP.
Slogan: Điều hay để biết. Điều đẹp để giữ.

Ba câu hỏi trước khi mua món đồ mới`;

    const slug = deriveSlug(context);
    const today = new Date().toISOString().slice(0, 10);
    expect(slug).toBe(`phan-1-${today}-ba-cau-hoi-truoc-khi-mua-mon-do`);
  });

  it('handles HAY & ĐẸP. prompt context with Series and Tiêu đề metadata without polluting slug', () => {
    const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 1

Brand: HAY & ĐẸP.
Slogan: Điều hay để biết. Điều đẹp để giữ.
Series: ĐẸP.

Tiêu đề:
Có những bữa cơm sau này mới hiểu là rất quý`;

    const slug = deriveSlug(context);
    const today = new Date().toISOString().slice(0, 10);
    expect(slug).toBe(`phan-1-${today}-co-nhung-bua-com-sau-nay-moi-hieu`);

    // Verify slug topic does not contain series, dep, or hay as metadata prefix
    const topicPart = slug.replace(new RegExp(`^phan-1-${today}-`), '');
    expect(topicPart.startsWith('series')).toBe(false);
    expect(topicPart.startsWith('dep')).toBe(false);
    expect(topicPart.startsWith('hay')).toBe(false);
  });
});
