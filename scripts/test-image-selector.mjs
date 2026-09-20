import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'assets', 'human-insight', 'manifest.json'), 'utf-8'));
const catalog = manifest.assets.map(a => ({ id: a.id, desc: a.desc, tags: a.tags }));

async function testSelector() {
  const scenes = [
    { text: 'Ta thường nghĩ muốn căn phòng tốt hơn thì phải mua thêm hoặc làm lại thật nhiều.' },
    { text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì.' },
    { text: 'Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.' },
    { text: 'Có thể chỉ là một chiếc bàn được reset sau khi làm việc,' },
    { text: 'hoặc một món đồ có chỗ cố định,' },
    { text: 'hoặc đơn giản là một lối đi không bị chắn bởi đồ tạm.' },
    { text: 'Những việc này nhỏ tới mức không tạo cảm giác lột xác,' },
    { text: 'nhưng chúng có một lợi thế, mình có thể quay lại với chúng vào ngày mai.' },
    { text: 'Căn phòng dễ sống là căn phòng giảm bớt những quyết định nhỏ mỗi ngày.' },
    { text: 'Nếu muốn thử, tối nay chỉ chọn một góc thường xuyên gây vướng và làm nó dễ dùng hơn.' },
    { text: 'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.' },
    { text: 'Nhà không cần giống ảnh mẫu.' },
    { text: 'Nó chỉ cần giúp những ngày bình thường trôi qua nhẹ hơn. Góc nào trong nhà đang khiến bạn thấy vướng nhất mỗi ngày?' }
  ];

  const prompt = `You are an art director for HAY & ĐẸP. (lifestyle, calm everyday living, editorial human-insight video series).
Select the most fitting illustration asset from the catalog for each scene in this video.

Video Title: Một căn phòng dễ sống không cần phải hoàn hảo
Visual Priorities:
- một chiếc bàn được reset sau khi làm việc
- một món đồ có chỗ cố định
- một lối đi không bị chắn bởi đồ tạm
- một cảnh kết luận yên, ít chi tiết, có khoảng thở

Asset Catalog:
${JSON.stringify(catalog)}

Scenes to assign:
${JSON.stringify(scenes, null, 2)}

Rules:
1. Match the visual narrative, objects, and mood of each scene accurately (e.g. room, desk, cleaning, home, reflection).
2. Avoid consecutive repeated assetId.
3. Return ONLY a valid JSON array of objects:
[
  { "sceneIndex": 0, "assetId": "...", "reason": "..." },
  ...
]
`;

  const res = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt
  });

  const cleaned = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
  const selected = JSON.parse(cleaned);
  console.log('Gemini selection:');
  selected.forEach(s => {
    const asset = manifest.assets.find(a => a.id === s.assetId);
    console.log(`Scene ${s.sceneIndex}: [${s.assetId}] ${asset ? asset.desc : 'NOT FOUND'}`);
    console.log(`   Narration: "${scenes[s.sceneIndex].text}"`);
    console.log(`   Reason: ${s.reason}\n`);
  });
}

testSelector().catch(console.error);
