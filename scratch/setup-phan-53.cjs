const fs = require('fs');
const path = require('path');

const slug = 'phan-53-2026-09-17-khi-dang-buc-tra-loi-sau-tot-hon';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 53

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Khi đang bực, trả lời sau vẫn tốt hơn nói nhanh

Kịch bản voice:
Một câu nói trong vài giây có thể ở lại lâu hơn cảm xúc tạo ra nó.

Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.

Tin nhắn gây khó chịu.
Cuộc tranh luận.
Một lời góp ý.

Mọi thứ vẫn gần như y nguyên sau đó.

Nhưng đời sống không được tạo bởi một ngày duy nhất.

Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần.

Khoảng dừng giúp mình tách điều cần nói khỏi cách mình đang cảm thấy.

Vì vậy thay vì hỏi "việc này có thay đổi được nhiều không?", thử hỏi: "mình có thể tiếp tục làm nó khi ngày mai bận hơn không?"

Nếu câu trả lời bắt đầu sắc hơn mức bạn muốn, dừng và quay lại sau.

Không phải mọi im lặng ngắn đều là tránh né. Có lúc nó là cách bảo vệ cuộc trò chuyện khỏi phiên bản tệ nhất của mình.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- tin nhắn gây khó chịu.
- cuộc tranh luận.
- một lời góp ý.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');
console.log('Step 1 complete for phan-53');
