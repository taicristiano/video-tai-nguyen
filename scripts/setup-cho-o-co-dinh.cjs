const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-cho-o-co-dinh-cho-do-vat';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const outputDir = path.join(videoDir, 'output');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16, khoảng 120–150 giây.

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Hãy cho những món đồ quan trọng một “chỗ ở” cố định

Hook:
Một món đồ không có chỗ cố định sẽ khiến bạn tìm nó nhiều lần hơn mức cần thiết.

Voice-over:

Chìa khóa để đâu? Tai nghe đâu rồi? Cái kéo hôm qua còn ở đây mà.

Nhiều món đồ không khó tìm vì chúng quá nhỏ. Chúng khó tìm vì mỗi lần dùng xong, ta đặt chúng ở một chỗ khác.

Một nguyên tắc rất đơn giản là: những món dùng thường xuyên nên có một “chỗ ở” cố định.

Chìa khóa có một khay. Tai nghe có một ngăn. Giấy tờ cần xử lý có một chỗ.

Bạn không cần trở thành người cực kỳ ngăn nắp. Chỉ cần giảm số lần phải tự hỏi: “Mình để nó ở đâu nhỉ?”

Một chỗ cố định cho món đồ cũng là một quyết định ít hơn cho ngày mai.

Visual direction:
Tone sáng và ấm; ivory + sage; ánh sáng tự nhiên; sách, bàn gỗ, cây xanh, nhà ở và cảnh đời thường. Hình ảnh có tính editorial, sạch, không quote-motivation sáo rỗng.

Yêu cầu dựng:
- Hook xuất hiện ngay 0–2 giây, không intro logo dài.
- Mỗi cảnh khoảng 2–5 giây, chuyển động vừa đủ.
- Subtitle dễ đọc, tối đa 1–2 dòng; ivory/white, accent sage.
- Không robot, neon, cyberpunk hoặc AI fantasy.
- Không biến nội dung thành motivational speech quá đà.
- Watermark N. nhỏ ở góc không bị UI nền tảng che.
- End card 1–2 giây: NẾP. — Sống tốt hơn từ những điều nhỏ.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');

const plan = {
  title: 'Cho món đồ một chỗ ở cố định',
  hook: 'Một món đồ trong nhà không có một nơi chốn cố định sẽ luôn khiến bạn phải mất công tìm kiếm nó nhiều lần hơn mức cần thiết rất nhiều.',
  segments: [
    {
      title: 'Cảnh tượng quen thuộc mỗi ngày',
      content_summary: 'Chìa khóa xe để đâu, tai nghe rơi góc nào, chiếc kéo mới dùng ban sáng biến mất.'
    },
    {
      title: 'Bản chất của việc thất lạc đồ đạc',
      content_summary: 'Đồ không khó tìm vì nhỏ, mà vì mỗi lần dùng xong ta tiện tay đặt một chỗ khác.'
    },
    {
      title: 'Nguyên lý chỗ ở cố định',
      content_summary: 'Cho mỗi món đồ quan trọng một nơi chốn thuộc về riêng nó.'
    },
    {
      title: 'Thiết lập các trạm nhỏ trong nhà',
      content_summary: 'Khay gốm cho chìa khóa, ngăn kéo cho tai nghe, góc nhỏ cho giấy tờ.'
    },
    {
      title: 'Tự động hóa thói quen đặt đồ',
      content_summary: 'Đôi tay tự động đưa đồ về chỗ cũ mà không tiêu tốn năng lượng suy nghĩ.'
    },
    {
      title: 'Không cần ngăn nắp cực đoan',
      content_summary: 'Không cần ép mình trở thành người hoàn hảo hay cứng nhắc trong nhà.'
    },
    {
      title: 'Giảm tải câu hỏi tự vấn',
      content_summary: 'Giảm số lần phải tự hỏi bối rối: mình để nó ở đâu rồi nhỉ.'
    },
    {
      title: 'Tiết kiệm năng lượng quyết định',
      content_summary: 'Một chỗ cố định là bớt đi một quyết định vụn vặt và căng thẳng cho ngày mai.'
    },
    {
      title: 'Không gian thảnh thơi nuôi dưỡng tâm trí',
      content_summary: 'Mọi thứ ở đúng vị trí giúp ngôi nhà thành nơi nạp lại năng lượng bình yên.'
    }
  ],
  ending: 'Gọn gàng dịu êm bắt đầu từ những điều rất nhỏ. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Một món đồ trong nhà không có một nơi chốn cố định sẽ luôn khiến bạn phải mất công tìm kiếm nó nhiều lần hơn mức cần thiết rất nhiều.',
      type: 'hook'
    },
    {
      text: 'Chìa khóa xe để đâu rồi nhỉ? Chiếc tai nghe quen thuộc rơi ở góc nào? Hay chiếc kéo cắt giấy mới dùng ban sáng sao giờ tìm mãi không thấy?',
      type: 'body'
    },
    {
      text: 'Thực ra phần lớn những món đồ quen thuộc không hề khó tìm vì chúng quá nhỏ bé. Chúng khó tìm vì mỗi lần dùng xong, ta lại tiện tay đặt chúng ở một chỗ khác nhau.',
      type: 'body'
    },
    {
      text: 'Để giải phóng tâm trí khỏi sự bực bội này, có một nguyên tắc sống tối giản vô cùng hiệu quả: hãy cho mỗi món đồ quan trọng một chỗ ở cố định.',
      type: 'body'
    },
    {
      text: 'Một chiếc khay gốm nhỏ ngay cửa ra vào chỉ để thả chìa khóa. Một ngăn kéo cạnh bàn làm việc dành riêng cho tai nghe. Một góc nhỏ cố định cho những giấy tờ cần xử lý.',
      type: 'body'
    },
    {
      text: 'Khi một món đồ đã có vị trí thuộc về riêng nó, mỗi lần dùng xong, đôi tay bạn sẽ tự động đưa nó về chỗ cũ mà không cần tiêu tốn bất kỳ năng lượng suy nghĩ nào.',
      type: 'body'
    },
    {
      text: 'Bạn hoàn toàn không cần phải ép mình trở thành một người ngăn nắp một cách hoàn hảo hay cứng nhắc trong từng góc nhỏ của ngôi nhà.',
      type: 'body'
    },
    {
      text: 'Điều bạn thật sự cần chỉ là giảm bớt số lần mỗi ngày mình phải bối rối tự hỏi: rốt cuộc mình đã vô tình đặt nó ở đâu rồi nhỉ?',
      type: 'body'
    },
    {
      text: 'Dành cho một món đồ một chỗ ở cố định cũng chính là bạn đang bớt đi một quyết định vụn vặt và một sự căng thẳng không đáng có cho ngày mai.',
      type: 'body'
    },
    {
      text: 'Khi mọi thứ xung quanh bạn đều êm đềm ở đúng vị trí của nó, ngôi nhà sẽ thực sự trở thành nơi chốn để bạn trở về nghỉ ngơi và nạp lại năng lượng.',
      type: 'body'
    },
    {
      text: 'Hãy bắt đầu từ chiếc chìa khóa hay cuốn sách bạn đang cầm trên tay, vì sự gọn gàng dịu êm sẽ bắt đầu từ những điều rất nhỏ. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, script written for:', slug);
