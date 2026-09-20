const fs = require('fs');
const path = require('path');

const slug = 'phan-52-2026-09-17-mat-cung-can-khoang-nghi-giua-man-hinh';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 52

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Mắt cũng cần khoảng nghỉ giữa các màn hình

Kịch bản voice:
Một ngày có thể chuyển từ laptop sang điện thoại rồi lại về laptop mà không có điểm nghỉ thật sự.

Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?

Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.

Khi nhìn ra xa qua cửa sổ.
Khi nhắm mắt vài nhịp.
Khi đứng dậy khỏi bàn.

Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.

Nhưng chúng xuất hiện rất nhiều lần.

Chuyển ánh nhìn ra khỏi màn hình là một cách đơn giản để tạo khoảng ngắt.

Thử trong một tuần: giữa hai block làm việc, dành một phút không nhìn vào màn hình khác.

Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.

Không phải mọi lần nghỉ đều cần thêm nội dung. Có lúc nghỉ nghĩa là bớt nhìn.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- nhìn ra xa qua cửa sổ.
- nhắm mắt vài nhịp.
- đứng dậy khỏi bàn.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-52');
