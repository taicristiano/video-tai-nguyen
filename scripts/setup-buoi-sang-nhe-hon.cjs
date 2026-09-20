const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-buoi-sang-nhe-hon';
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
Buổi sáng nhẹ hơn có thể bắt đầu từ tối hôm trước

Hook:
Có những buổi sáng dễ chịu hơn không phải vì ta thức dậy sớm hơn, mà vì tối qua đã chuẩn bị tốt hơn.

Voice-over:

Một buổi sáng dễ chịu đôi khi được quyết định từ tối hôm trước.

Quần áo đã chọn sẵn. Túi đã để cạnh cửa. Bình nước đã đặt trên bàn. Việc quan trọng nhất ngày mai đã được ghi xuống.

Mỗi thứ chỉ mất một chút thời gian.

Nhưng sáng hôm sau, bạn không phải bắt đầu ngày mới bằng hàng loạt quyết định nhỏ.

Chuẩn bị trước không có nghĩa lên lịch cho từng phút. Nó chỉ là chuyển vài quyết định từ lúc vội sang lúc mình còn đủ bình tĩnh.

Một buổi sáng nhẹ hơn đôi khi không cần thức dậy sớm hơn. Chỉ cần tối qua giúp mình một chút.

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
  title: 'Buổi sáng nhẹ hơn từ tối hôm trước',
  hook: 'Có những buổi sáng thức giấc cảm thấy thật nhẹ nhõm và dễ chịu, không phải vì bạn dậy sớm hơn bình thường hai tiếng, mà là vì tối hôm trước bạn đã chuẩn bị tốt hơn.',
  segments: [
    {
      title: 'Cảnh vội vã tương phản',
      content_summary: 'Buổi sáng căng thẳng bắt nguồn từ việc vừa mở mắt đã phải ra hàng loạt quyết định vụn.'
    },
    {
      title: 'Bí quyết định hình từ đêm trước',
      content_summary: 'Một ngày mới thảnh thơi được định hình từ những chuẩn bị nhỏ trước khi ngủ.'
    },
    {
      title: 'Những hành động chuẩn bị cụ thể',
      content_summary: 'Quần áo treo sẵn, túi cạnh cửa, bình nước trên bàn, việc quan trọng đã ghi xuống.'
    },
    {
      title: 'Chi phí thời gian cực nhỏ',
      content_summary: 'Từng việc chỉ mất vài phút trong buổi tối yên ả khi không có áp lực thời gian.'
    },
    {
      title: 'Lợi ích khổng lồ buổi sáng',
      content_summary: 'Sáng hôm sau không còn tốn năng lượng nghĩ mặc gì, tìm đồ đạc hay làm gì trước.'
    },
    {
      title: 'Ý nghĩa thực sự của việc chuẩn bị',
      content_summary: 'Không phải gò bó vào thời khóa biểu cứng nhắc cho từng phút trong ngày.'
    },
    {
      title: 'Chuyển giao thời điểm ra quyết định',
      content_summary: 'Chuyển vài quyết định nhỏ từ lúc vội sang lúc còn đủ sự bình tĩnh của đêm qua.'
    },
    {
      title: 'Tâm thế đón chào ngày mới',
      content_summary: 'Không bị cuống cuồng từ đầu, có đủ tĩnh lặng nhấp ngụm trà và hít thở sâu.'
    },
    {
      title: 'Yêu thương phiên bản buổi sáng',
      content_summary: 'Chuẩn bị mỗi tối là món quà dịu dàng và chu đáo nhất cho chính mình ngày mai.'
    }
  ],
  ending: 'Buổi sáng nhẹ hơn bắt đầu từ sự dịu dàng trao cho mình từ đêm qua. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Có những buổi sáng thức giấc cảm thấy thật nhẹ nhõm và dễ chịu, không phải vì bạn dậy sớm hơn bình thường hai tiếng, mà là vì tối hôm trước bạn đã chuẩn bị tốt hơn.',
      type: 'hook'
    },
    {
      text: 'Phần lớn những buổi sáng căng thẳng và mệt mỏi bắt nguồn từ việc chúng ta vừa mở mắt ra đã phải lao vào một chuỗi những quyết định vụn vặt và hỗn loạn.',
      type: 'body'
    },
    {
      text: 'Một ngày mới thảnh thơi thực ra đã được âm thầm định hình từ đêm hôm trước, qua những chuẩn bị rất nhỏ trước khi bạn chìm vào giấc ngủ.',
      type: 'body'
    },
    {
      text: 'Bộ quần áo đã được chọn và treo sẵn. Chiếc túi xách đặt ngay ngắn cạnh cửa. Bình nước đầy để trên bàn, và việc quan trọng nhất ngày mai đã được ghi xuống sổ.',
      type: 'body'
    },
    {
      text: 'Từng việc nhỏ ấy thực chất chỉ mất của bạn chưa đầy vài phút trong buổi tối yên ả, khi không có bất kỳ áp lực nào của thời gian hay công việc đè nặng.',
      type: 'body'
    },
    {
      text: 'Nhưng đến sáng hôm sau, khi bước chân xuống giường, bạn không còn phải tốn năng lượng suy nghĩ xem mình nên mặc gì, tìm chìa khóa ở đâu, hay làm gì trước tiên.',
      type: 'body'
    },
    {
      text: 'Chuẩn bị trước không có nghĩa là bạn phải gò bó bản thân vào một thời gian biểu cứng nhắc cho từng phút từng giây trong ngày.',
      type: 'body'
    },
    {
      text: 'Nó chỉ đơn giản là nghệ thuật chuyển giao vài quyết định nhỏ nhặt từ lúc bạn đang vội vã buổi sáng sang khoảnh khắc bạn còn đủ sự bình tĩnh của đêm qua.',
      type: 'body'
    },
    {
      text: 'Khi tâm trí không bị cuốn vào sự cuống cuồng ngay từ giây phút đầu tiên, bạn sẽ có đủ sự tĩnh lặng để nhấp một ngụm trà và hít thở thật sâu.',
      type: 'body'
    },
    {
      text: 'Một vài phút chuẩn bị mỗi tối thực chất chính là món quà dịu dàng và chu đáo nhất mà bạn dành tặng cho chính bản thân mình vào sáng hôm sau.',
      type: 'body'
    },
    {
      text: 'Buổi sáng nhẹ hơn không bắt đầu từ tiếng chuông báo thức, mà bắt đầu từ sự dịu dàng bạn trao cho mình từ đêm qua. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, script written for:', slug);
