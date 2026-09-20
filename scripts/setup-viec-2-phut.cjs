const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-viec-2-phut-tri-hoan-ca-tuan';
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
Có những việc chỉ mất 2 phút nhưng ta trì hoãn cả tuần

Hook:
Có những việc làm chưa tới hai phút, nhưng lại ở trong đầu ta suốt cả tuần.

Voice-over:

Có những việc chỉ mất chưa đến hai phút.

Trả lời một tin nhắn. Cất lại món đồ. Đặt một lịch hẹn. Ghi xuống một ý tưởng.

Nhưng ta có thể để chúng nằm đó cả tuần.

Điều mệt không nằm ở hai phút để làm. Nó nằm ở việc mỗi lần nhìn thấy, ta lại phải nhớ: “À, mình vẫn chưa xử lý việc này.”

Không phải mọi việc đều cần làm ngay. Nhưng nếu một việc thật sự rất nhỏ, đôi khi hoàn thành nó nhẹ hơn nhiều so với tiếp tục mang nó trong đầu.

Có lẽ thứ làm một ngày nặng đi không phải một việc lớn. Mà là quá nhiều việc nhỏ chưa khép lại.

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
  title: 'Việc 2 phút nhưng trì hoãn cả tuần',
  hook: 'Có bao giờ bạn nhận ra, có những việc bạn chỉ mất chưa đầy hai phút để làm xong, nhưng nó lại có thể nằm im lìm trong đầu bạn suốt cả một tuần lễ?',
  segments: [
    {
      title: 'Những việc hai phút quen thuộc',
      content_summary: 'Trả lời tin nhắn, cất đồ đạc, đặt lịch hẹn, ghi nhanh ý tưởng.'
    },
    {
      title: 'Nghịch lý của sự trì hoãn',
      content_summary: 'Việc rất nhỏ nhưng ta lại để mặc chúng trôi qua ngày này qua ngày khác.'
    },
    {
      title: 'Chi phí tinh thần vô hình',
      content_summary: 'Cái mệt không nằm ở 2 phút hành động mà ở sức nặng của sự ghi nhớ lặp lại.'
    },
    {
      title: 'Tín hiệu ngầm trong não bộ',
      content_summary: 'Mỗi lần nhìn thấy, não lại phát tín hiệu: mình vẫn chưa xử lý xong việc này.'
    },
    {
      title: 'Ma sát nhận thức tích tụ',
      content_summary: 'Việc nhỏ lặp lại trong đầu tạo cảm giác nặng nề gấp trăm lần thực tế.'
    },
    {
      title: 'Không cần hoàn hảo mọi lúc',
      content_summary: 'Cuộc sống không ép bạn xử lý mọi thứ ngay tức khắc trong căng thẳng.'
    },
    {
      title: 'Hoàn thành nhẹ hơn mang theo',
      content_summary: 'Dành vài giây làm xong dứt điểm còn nhẹ hơn tiếp tục mang nó trong đầu.'
    },
    {
      title: 'Nguyên nhân làm ngày nặng nề',
      content_summary: 'Thứ làm kiệt sức không phải việc lớn, mà là quá nhiều việc nhỏ chưa khép lại.'
    },
    {
      title: 'Trả lại khoảng trống cho tâm trí',
      content_summary: 'Khép lại việc nhỏ là trả lại cho tâm trí khoảng trời tĩnh lặng và thảnh thơi.'
    }
  ],
  ending: 'Sự an yên bắt đầu từ những việc ta chọn hoàn thành hôm nay. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Có bao giờ bạn nhận ra, có những việc bạn chỉ mất chưa đầy hai phút để làm xong, nhưng nó lại có thể nằm im lìm trong đầu bạn suốt cả một tuần lễ?',
      type: 'hook'
    },
    {
      text: 'Đó là việc mở điện thoại trả lời một dòng tin nhắn ngắn, cất chiếc cốc uống nước về đúng chỗ, đặt một cuộc hẹn nha sĩ, hay ghi nhanh một ý tưởng vừa lóe lên.',
      type: 'body'
    },
    {
      text: 'Tất cả đều là những hành động vô cùng nhỏ bé và đơn giản. Vậy mà chúng ta hoàn toàn có thể lẳng lặng nhìn thấy chúng và để mặc chúng trôi qua ngày này qua ngày khác.',
      type: 'body'
    },
    {
      text: 'Điều làm cho bạn cảm thấy mệt mỏi thực ra chưa bao giờ là hai phút công sức bỏ ra để hoàn thành. Mà nó nằm ở sức nặng vô hình của sự ghi nhớ lặp đi lặp lại.',
      type: 'body'
    },
    {
      text: 'Mỗi một lần bước ngang qua hay vô tình nhớ đến, não bộ lại phải phát ra một tín hiệu ngầm: À, việc này mình vẫn chưa giải quyết, lát nữa phải làm thôi.',
      type: 'body'
    },
    {
      text: 'Một việc rất nhỏ nhưng cứ lặp đi lặp lại hàng chục lần trong tâm trí sẽ vô tình tạo ra cảm giác nặng nề hơn gấp trăm lần so với chính bản thân công việc đó.',
      type: 'body'
    },
    {
      text: 'Tất nhiên, cuộc sống không đòi hỏi bạn phải trở thành một cỗ máy hoàn hảo và xử lý mọi thứ ngay tức khắc trong sự vội vã và căng thẳng.',
      type: 'body'
    },
    {
      text: 'Nhưng nếu một việc thực sự chỉ tốn chưa đến hai phút, đôi khi dành vài giây giải quyết dứt điểm nó còn nhẹ lòng hơn rất nhiều việc cứ tiếp tục mang nó trong đầu.',
      type: 'body'
    },
    {
      text: 'Có lẽ thứ làm cho một ngày của chúng ta trở nên kiệt sức không hẳn là một biến cố hay một dự án lớn lao. Mà chính là quá nhiều việc vụn vặt chưa được khép lại.',
      type: 'body'
    },
    {
      text: 'Khi bạn nhẹ nhàng khép lại một việc nhỏ, bạn không chỉ dọn sạch góc bàn, mà bạn đang trả lại cho tâm trí mình một khoảng trời tĩnh lặng và thảnh thơi.',
      type: 'body'
    },
    {
      text: 'Hãy để những điều nhỏ bé được đặt về đúng vị trí của nó, vì sự an yên thực sự bắt đầu từ những việc bạn chọn hoàn thành hôm nay. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Step 1, 2, 3 complete for:', slug);
