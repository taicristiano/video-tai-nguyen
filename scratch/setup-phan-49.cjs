const fs = require('fs');
const path = require('path');

const slug = 'phan-49-2026-09-17-nhung-viec-chua-khep-lai-chiem-cho-trong-dau';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 49

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Những việc chưa khép lại chiếm chỗ trong đầu nhiều hơn ta nghĩ

Kịch bản voice:
Một email chưa trả lời hay một quyết định chưa chốt có thể tiếp tục quay lại trong đầu cả ngày.

Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.

Một tin nhắn cần trả lời.
Một giấy tờ cần nộp.
Một cuộc hẹn chưa xác nhận.

Mọi thứ vẫn gần như y nguyên sau đó.

Nhưng đời sống không được tạo bởi một ngày duy nhất.

Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần.

Open loop nhỏ tích lại sẽ tạo cảm giác bận ngay cả khi mình không làm gì.

Vì vậy thay vì hỏi "việc này có thay đổi được nhiều không?", thử hỏi: "mình có thể tiếp tục làm nó khi ngày mai bận hơn không?"

Chọn ba việc dưới năm phút và khép chúng lại trước khi mở thêm việc mới.

Đôi khi nhẹ đầu không đến từ nghỉ thêm, mà từ việc đóng bớt những cánh cửa đang mở.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- một tin nhắn cần trả lời.
- một giấy tờ cần nộp.
- một cuộc hẹn chưa xác nhận.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-49');
