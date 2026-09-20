const fs = require('fs');
const path = require('path');

const slug = 'phan-47-2026-09-17-muoi-phut-xem-lai-tien-moi-tuan';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 47

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Mười phút xem lại tiền mỗi tuần tốt hơn né cả tháng

Kịch bản voice:
Việc tài chính dễ trở nên đáng sợ khi mình chỉ nhìn vào lúc có vấn đề.

Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.

Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.

Chi tiêu tuần này.
Hóa đơn sắp tới.
Một khoản đang tiết kiệm.

Không việc nào trong số đó nghe thật ấn tượng.

Và cũng không cần phải ấn tượng.

Một lần xem ngắn nhưng đều giúp con số bớt mơ hồ.

Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một thời điểm cố định mỗi tuần để nhìn lại các khoản chính trong 10 phút.

Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ.

Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.

Rõ ràng nhỏ nhưng đều thường nhẹ hơn rất nhiều so với một lần hoảng hốt cuối tháng.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- chi tiêu tuần này.
- hóa đơn sắp tới.
- một khoản đang tiết kiệm.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete');
