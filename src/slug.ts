export function deriveSlug(context: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Extract "Phần: {i}" or "Phan: {i}" or "Part: {i}"
  const partMatch = context.match(/(?:phần|phan|part)\s*:\s*([a-zA-Z0-9_-]+)/i);
  const partPrefix = partMatch ? `phan-${partMatch[1].toLowerCase()}-` : '';

  // Filter out system metadata lines (aspect ratio, duration, brand, slogan, series, part, title label)
  const topicContext = context
    .replace(/video\s+(?:dọc|doc|ngang)?[^,\n]*/gi, '')
    .replace(/(?:thời\s+lượng|thoi\s+luong)[^\n.]*(?:giây|phút|\.)?/gi, '')
    .replace(/(?:brand|thương\s+hiệu)\s*:[^\n]*/gi, '')
    .replace(/(?:slogan|khẩu\s+hiệu)\s*:[^\n]*/gi, '')
    .replace(/(?:series|dòng|pillar)\s*:[^\n]*/gi, '')
    .replace(/(?:nhóm\s+nội\s+dung|nhom\s+noi\s+dung|category)\s*:[^\n]*/gi, '')
    .replace(/(?:phần|phan|part)\s*:\s*([a-zA-Z0-9_-]+)/gi, '')
    .replace(/(?:sweet\s+spot)[^\n.]*(?:giây|phút|\.)?/gi, '')
    .replace(/(?:tiêu\s+đề|tieu\s+de)\s*:[^\n]*/gi, '')
    .trim();

  // If topicContext was emptied, fallback to original context
  const targetText = topicContext || context;

  const slug = targetText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .split('-')
    .filter(Boolean)
    .slice(0, 8)
    .join('-');

  return `${partPrefix}${today}-${slug}`;
}
