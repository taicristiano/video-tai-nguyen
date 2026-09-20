const fs = require('fs');
const path = require('path');

const slug = 'phan-48-2026-09-17-cuoi-tuan-hay-hoi-tuan-nay-hoc-duoc-gi';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 48

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Cuối tuần hãy hỏi: tuần này mình thật sự học được gì?

Kịch bản voice:
Một tuần có thể rất bận nhưng đến cuối lại khó nói mình đã tiến ở đâu.

Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?

Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.

Khi một khái niệm hiểu rõ hơn.
Khi một lỗi đã tránh được.
Khi một kỹ năng đã làm nhanh hơn.

Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.

Nhưng chúng xuất hiện rất nhiều lần.

Một bản tổng kết ngắn giúp biến tiến bộ nhỏ thành thứ mình nhìn thấy được.

Thử trong một tuần: mỗi cuối tuần viết ba dòng: đã học gì, còn vướng gì, tuần sau thử gì.

Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.

Khi nhìn thấy tiến bộ nhỏ, mình bớt cần những cú hích lớn để tiếp tục.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- một khái niệm hiểu rõ hơn.
- một lỗi đã tránh được.
- một kỹ năng đã làm nhanh hơn.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-48');
