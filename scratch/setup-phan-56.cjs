const fs = require('fs');
const path = require('path');

const slug = 'phan-56-2026-09-17-mot-khoang-yen-khong-can-muc-dich';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 56

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Một khoảng yên không cần mục đích

Kịch bản voice:
Ta rất dễ biến cả nghỉ ngơi thành một việc phải tối ưu.

Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.

Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.

Ngồi cạnh cửa sổ.
Uống trà.
Nhìn mưa hoặc nhìn cây.

Không việc nào trong số đó nghe thật ấn tượng.

Và cũng không cần phải ấn tượng.

Không phải phút nào cũng cần học, phục hồi hay tạo giá trị.

Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: giữ lại một khoảng ngắn chỉ để ở đó, không biến nó thành nhiệm vụ.

Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ.

Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.

Đôi khi điều mình cần không phải một hoạt động tốt hơn. Chỉ là vài phút không phải trở thành phiên bản nào cả.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- ngồi cạnh cửa sổ.
- uống trà.
- nhìn mưa hoặc nhìn cây.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-56');
