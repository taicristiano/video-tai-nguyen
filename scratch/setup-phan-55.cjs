const fs = require('fs');
const path = require('path');

const slug = 'phan-55-2026-09-17-he-thong-giat-do-tot-la-he-thong-minh-chiu-dung';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 55

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Hệ thống giặt đồ tốt là hệ thống mình chịu dùng

Kịch bản voice:
Một hệ thống có quá nhiều bước thường đẹp trên lý thuyết nhưng dễ bị bỏ giữa chừng.

Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?

Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.

Khi sọt đồ bẩn ở đúng nơi cởi đồ.
Khi móc treo gần chỗ phơi.
Khi ngăn đồ sạch dễ cất.

Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.

Nhưng chúng xuất hiện rất nhiều lần.

Mỗi bước thừa đều làm khả năng trì hoãn tăng lên.

Thử trong một tuần: đưa giỏ, móc hoặc nơi cất tới gần đúng điểm hành động xảy ra.

Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.

Đừng ép mình sống theo hệ thống đẹp. Hãy để hệ thống đi theo cách mình thật sự sống.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- sọt đồ bẩn ở đúng nơi cởi đồ.
- móc treo gần chỗ phơi.
- ngăn đồ sạch dễ cất.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-55');
