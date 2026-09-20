const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-mot-ngay-bo-lo';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const outputDir = path.join(videoDir, 'output');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16, calendar, habit tracker, calm morning scenes.

Tiêu đề: Một ngày bỏ lỡ không phá hủy thói quen.

Voice-over:

Bạn tập được bảy ngày.

Ngày thứ tám bận quá nên bỏ.

Rất nhiều người nghĩ:
“Thôi, hỏng rồi.”

Nhưng một ngày bỏ lỡ thường không phải vấn đề lớn nhất.

Vấn đề là cảm giác thất bại khiến ngày thứ chín cũng bị bỏ luôn.

Thói quen không cần hoàn hảo.

Nó cần khả năng quay lại.

Nếu hôm nay không làm được,
mục tiêu ngày mai không phải bù gấp đôi.

Chỉ là trở lại nhịp cũ.

Kết:
Một ngày trượt không quyết định bạn là ai.
Điều quan trọng hơn là lần tiếp theo bạn quay lại lúc nào.

End card: NẾP.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 Setup complete for slug:', slug);
