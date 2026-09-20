const fs = require('fs');
const path = require('path');

const slug = 'phan-50-2026-09-17-cuoc-hop-tot-bat-dau-tu-cau-hoi-ro';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 50

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Cuộc họp tốt bắt đầu từ một câu hỏi rõ

Kịch bản voice:
Nhiều cuộc họp dài vì mọi người cùng bước vào nhưng không biết cần rời đi với điều gì.

Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.

Cần quyết định gì.
Cần cập nhật gì.
Ai chịu trách nhiệm bước tiếp theo.

Mọi thứ vẫn gần như y nguyên sau đó.

Nhưng đời sống không được tạo bởi một ngày duy nhất.

Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần.

Một agenda ngắn làm cuộc nói chuyện có hướng.

Vì vậy thay vì hỏi "việc này có thay đổi được nhiều không?", thử hỏi: "mình có thể tiếp tục làm nó khi ngày mai bận hơn không?"

Trước cuộc họp, viết một câu: cuộc họp này kết thúc tốt khi điều gì đã rõ?

Một giờ họp có thể được tiết kiệm từ một phút chuẩn bị đúng câu hỏi.

Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- cần quyết định gì.
- cần cập nhật gì.
- ai chịu trách nhiệm bước tiếp theo.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-50');
