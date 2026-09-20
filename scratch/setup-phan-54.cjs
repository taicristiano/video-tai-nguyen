const fs = require('fs');
const path = require('path');

const slug = 'phan-54-2026-09-17-hoc-xong-mot-khoa-truoc-khi-mo-khoa-moi';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 54

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Học xong một khóa trước khi mở khóa mới

Kịch bản voice:
Internet khiến việc bắt đầu học rất dễ và việc hoàn thành lại rất khó.

Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.

Có thể chỉ là một tab khóa học.

Hoặc một playlist tutorial.

Hoặc đơn giản là một cuốn sách chuyên môn.

Những việc này nhỏ tới mức không tạo cảm giác "lột xác".

Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.

Nhiều tài nguyên chưa hoàn thành tạo cảm giác mình đang học, nhưng làm sự chú ý bị chia nhỏ.

Nếu muốn thử, đặt quy tắc: chỉ một khóa chính đang hoạt động tại một thời điểm.

Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.

Kiến thức tích lũy không đến từ số thứ mình đã mở. Nó đến từ số lần mình đi đủ sâu để hoàn thành một vòng.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- một tab khóa học.
- một playlist tutorial.
- một cuốn sách chuyên môn.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-54');
