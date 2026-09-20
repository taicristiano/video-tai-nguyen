const fs = require('fs');
const path = require('path');

const slug = 'phan-51-2026-09-17-be-mat-trong-la-mot-tien-ich';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 51

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Bề mặt trống là một tiện ích, không phải khoảng trống lãng phí

Kịch bản voice:
Ta thường có xu hướng lấp đầy bàn, kệ và mặt tủ vì thấy chúng còn trống.

Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.

Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.

Mặt bàn bếp.
Bàn làm việc.
Tủ đầu giường.

Không việc nào trong số đó nghe thật ấn tượng.

Và cũng không cần phải ấn tượng.

Nhưng bề mặt trống cho mình chỗ để thao tác, đặt tạm và thở bằng mắt.

Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một bề mặt và giữ lại ít nhất một phần ba khoảng trống trong một tuần.

Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ.

Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.

Khoảng trống cũng là một thứ mình có thể sử dụng.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- mặt bàn bếp.
- bàn làm việc.
- tủ đầu giường.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-51');
