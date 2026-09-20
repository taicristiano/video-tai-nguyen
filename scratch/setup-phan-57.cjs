const fs = require('fs');
const path = require('path');

const slug = 'phan-57-2026-09-17-muoi-phut-buffer-co-the-cuu-ca-mot-hanh-trinh';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 57

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Mười phút buffer có thể cứu cả một hành trình

Kịch bản voice:
Lịch di chuyển quá sát khiến một đèn đỏ, một thang máy chậm hay một đoạn kẹt xe cũng đủ làm mọi thứ căng lên.

Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.

Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.

Ra khỏi nhà sớm hơn.
Đến ga trước một chút.
Không xếp cuộc hẹn nối sát nhau.

Không việc nào trong số đó nghe thật ấn tượng.

Và cũng không cần phải ấn tượng.

Buffer không làm mình mất thời gian. Nó mua lại sự bình tĩnh khi đời sống không chạy đúng kế hoạch.

Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: với việc quan trọng, thử thêm mười đến mười lăm phút dự phòng thay vì tính đúng thời gian lý tưởng.

Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ.

Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.

Khoảng đệm nhỏ đôi khi là thứ giữ cả hành trình không biến thành một cuộc chạy.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- ra khỏi nhà sớm hơn.
- đến ga trước một chút.
- không xếp cuộc hẹn nối sát nhau.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-57');
