import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const manifestPath = path.join(ROOT, 'public', 'assets', 'human-insight', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

manifest.note = "Image selection: use scripts/human-insight-image.mjs for every scene. Selector prioritizes precise Vietnamese semantic keywords and semantic tags, then description/mood/character as supporting signals. Never reuse the same id in consecutive scenes.";

// Semantic dictionary mapping English concepts to Vietnamese terms
const DICT = [
  // Home & Decluttering
  { en: ['desk', 'workspace', 'home office'], vi: ['bàn làm việc', 'góc làm việc', 'mặt bàn'] },
  { en: ['living room', 'bedroom', 'apartment', 'home interior'], vi: ['căn phòng', 'phòng khách', 'phòng ngủ', 'góc phòng', 'không gian sống'] },
  { en: ['clean', 'cleaning', 'tidy', 'tidying', 'declutter', 'broom', 'mop', 'sweep', 'sweeping'], vi: ['dọn dẹp', 'dọn phòng', 'quét nhà', 'lau nhà', 'sắp xếp', 'gọn gàng', 'ngăn nắp', 'đồ đạc', 'lối đi', 'đồ tạm'] },
  { en: ['laundry', 'folding', 'clothes'], vi: ['quần áo', 'gấp quần áo', 'giặt giũ', 'chỗ cố định', 'sắp xếp đồ'] },
  { en: ['dishes', 'washing'], vi: ['rửa bát', 'dọn bếp', 'bồn rửa'] },
  { en: ['plants', 'watering', 'plant'], vi: ['tưới cây', 'chăm cây', 'cây xanh', 'ban công'] },
  { en: ['window'], vi: ['cửa sổ'] },
  { en: ['balcony'], vi: ['ban công'] },
  { en: ['morning light', 'sunrise'], vi: ['ánh sáng buổi sáng', 'nắng sớm', 'buổi sáng'] },

  // Family & Food & Friends
  { en: ['dinner', 'meal', 'lunch', 'breakfast', 'eating', 'food'], vi: ['bữa tối', 'bữa ăn', 'ăn cơm', 'bữa cơm', 'bàn ăn', 'bữa ăn chung', 'nấu ăn'] },
  { en: ['family', 'parent', 'parents', 'child', 'children'], vi: ['gia đình', 'bố mẹ', 'cha mẹ', 'con cái', 'người thân', 'quây quần', 'gắn kết'] },
  { en: ['call', 'phone', 'video call'], vi: ['cuộc gọi', 'gọi điện', 'điện thoại', 'video call', 'gọi điện thoại', 'hỏi thăm', 'cuộc gọi cố định'] },
  { en: ['walk', 'walking', 'stroll', 'park'], vi: ['đi bộ', 'dạo bộ', 'đi dạo', 'công viên', 'buổi đi bộ', 'cuối tuần', 'tản bộ'] },
  { en: ['friends', 'friendship', 'conversation', 'chat', 'chatting'], vi: ['bạn bè', 'trò chuyện', 'tâm sự', 'kết nối', 'chia sẻ'] },
  { en: ['coffee', 'cafe'], vi: ['cà phê', 'quán cà phê'] },

  // Inner emotions & Fatigue & Rest
  { en: ['tired', 'exhausted', 'fatigue', 'energy', 'stress', 'pressure', 'overwhelmed'], vi: ['mệt', 'mệt mỏi', 'cạn năng lượng', 'kiệt sức', 'áp lực', 'căng thẳng', 'quá tải', 'khó chịu'] },
  { en: ['rest', 'resting', 'relax'], vi: ['nghỉ ngơi', 'thư giãn'] },
  { en: ['sleep', 'bed'], vi: ['ngủ', 'giường'] },
  { en: ['sofa'], vi: ['ghế sofa'] },
  { en: ['sunset', 'sunrise', 'peaceful', 'quiet', 'reflection', 'reflect', 'bench'], vi: ['hoàng hôn', 'ngắm hoàng hôn', 'bình yên', 'khoảng thở', 'yên tĩnh', 'suy ngẫm', 'kết luận yên', 'nhẹ nhõm'] },
  { en: ['start again', 'fresh page', 'clean page', 'starting over'], vi: ['bắt đầu lại', 'trang mới', 'làm lại', 'thử nghiệm'] },

  // Study & Books & Notes
  { en: ['book', 'books', 'reading', 'read', 'library'], vi: ['sách', 'đọc sách', 'trang sách', 'cuốn sách', 'kệ sách'] },
  { en: ['notebook', 'journal', 'sketchbook', 'writing', 'pen', 'notes'], vi: ['cuốn sổ', 'sổ tay', 'ghi chép', 'cây bút', 'viết', 'nhật ký'] },
  { en: ['study', 'learning', 'course'], vi: ['học tập', 'học bài', 'khóa học'] },
  { en: ['code', 'coding'], vi: ['lập trình', 'coding'] },
  { en: ['laptop'], vi: ['máy tính', 'laptop'] },

  // Money & Shopping
  { en: ['money', 'budget', 'saving', 'shopping', 'buy', 'expense'], vi: ['tiền', 'tiền bạc', 'tiết kiệm', 'mua sắm', 'chi tiêu', 'ngân sách', 'giá tiền', 'món đồ'] },

  // Commute & Travel
  { en: ['commute', 'traffic'], vi: ['đi lại', 'giao thông', 'kẹt xe', 'đi làm', 'về nhà'] },
  { en: ['bus'], vi: ['xe buýt'] },
  { en: ['train', 'metro'], vi: ['đi tàu'] },
  { en: ['scooter', 'motorbike'], vi: ['xe máy'] }
];

let enrichedCount = 0;

manifest.assets.forEach(asset => {
  const descLower = (asset.desc || '').toLowerCase();
  const tagsLower = (asset.tags || []).map(t => t.toLowerCase()).join(' ');
  const textCombined = `${descLower} ${tagsLower}`;

  const viKeywords = new Set();

  for (const entry of DICT) {
    const hasEnMatch = entry.en.some(word => {
      const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\b)${escaped}(?:$|\\b)`, 'i');
      return regex.test(textCombined);
    });

    if (hasEnMatch) {
      entry.vi.forEach(v => viKeywords.add(v));
    }
  }

  asset.keywordsVi = Array.from(viKeywords);

  if (asset.id?.startsWith('cf-') && Array.isArray(asset.tags)) {
    const slugTokens = new Set(asset.id.replace(/^cf-/, '').split('-').filter(Boolean));
    asset.tags = asset.tags.filter(tag => {
      const normalizedTag = String(tag).toLowerCase();
      const isLikelySlugNoise = !normalizedTag.includes('-') && slugTokens.has(normalizedTag);
      return !isLikelySlugNoise;
    });
  }

  if (asset.keywordsVi.length > 0) enrichedCount++;
});

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Enriched ${enrichedCount}/${manifest.assets.length} assets with Vietnamese semantic keywords.`);

// Sample check
console.log('\nSample enriched assets:');
const sample = manifest.assets.filter(a => a.keywordsVi && a.keywordsVi.length > 0).slice(0, 5);
sample.forEach(s => {
  console.log(`[${s.id}] ${s.desc}`);
  console.log(`   Vietnamese keywords: ${s.keywordsVi.join(', ')}\n`);
});
