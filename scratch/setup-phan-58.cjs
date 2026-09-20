const fs = require('fs');
const path = require('path');

const slug = 'phan-58-2026-09-17-ngay-lam-viec-can-mot-ranh-gioi-nhin-thay-duoc';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 58

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Ngày làm việc cần một ranh giới nhìn thấy được

Kịch bản voice:
Làm ở nhà khiến công việc rất dễ kéo dài bằng những việc 'chỉ thêm một chút'.

Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.

Có thể chỉ là đóng laptop.

Hoặc tắt màn hình.

Hoặc đơn giản là rời khỏi bàn làm việc.

Những việc này nhỏ tới mức không tạo cảm giác "lột xác".

Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.

Một tín hiệu vật lý giúp cơ thể hiểu rằng vai trò làm việc đã tạm kết thúc.

Nếu muốn thử, tạo một hành động cố định đánh dấu hết ngày và lặp nó đều.

Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.

Ranh giới không phải để làm ít đi. Nó giúp phần còn lại của đời sống có chỗ tồn tại.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- đóng laptop.
- tắt màn hình.
- rời khỏi bàn làm việc.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-58');
