const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-dung-cat-sach-qua-ky';
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
Muốn đọc nhiều hơn? Đừng cất cuốn sách quá kỹ

Hook:
Một thói quen dễ bắt đầu hơn khi thứ bạn cần nằm ngay trước mắt.

Voice-over:

Nếu muốn đọc nhiều hơn nhưng cuốn sách luôn nằm sâu trong tủ, mỗi lần đọc bạn phải nhớ tới nó trước.

Thử để cuốn đang đọc ở nơi bạn thường ngồi.

Trên bàn. Bên cạnh ghế. Hoặc cạnh giường.

Không phải để ép mình đọc. Chỉ để biến việc đọc thành một lựa chọn dễ nhìn thấy hơn.

Môi trường không thể tạo thói quen thay mình. Nhưng nó có thể làm bước đầu tiên bớt khó.

Đôi khi thay vì cố “có thêm động lực”, ta chỉ cần đặt thứ mình muốn làm ở gần hơn.

Một cuốn sách mở sẵn luôn dễ bắt đầu hơn một cuốn sách bị quên trong tủ.

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
  title: 'Đừng cất cuốn sách quá kỹ',
  hook: 'Một thói quen tốt sẽ luôn trở nên dễ dàng bắt đầu hơn rất nhiều khi công cụ bạn cần được đặt ngay trong tầm mắt thay vì cất giấu quá kỹ.',
  segments: [
    {
      title: 'Trở ngại vô hình từ việc cất đồ',
      content_summary: 'Sách nằm sâu trong tủ thì mỗi lần đọc não bộ phải nhớ tới nó trước tiên.'
    },
    {
      title: 'Ma sát trước khi bắt đầu',
      content_summary: 'Khoảng cách từ ý nghĩ đến hành động phải qua nhiều ma sát tìm kiếm mở tủ.'
    },
    {
      title: 'Giải pháp tối giản cho không gian',
      content_summary: 'Mang cuốn sách dở ra đặt ngay ở những nơi bạn thường xuyên ngồi xuống.'
    },
    {
      title: 'Những điểm chạm quen thuộc',
      content_summary: 'Trên góc bàn làm việc, trên đôn cạnh sofa, hoặc bàn cạnh đầu giường.'
    },
    {
      title: 'Tín hiệu thị giác tự nhiên',
      content_summary: 'Không ép buộc bản thân, chỉ biến việc đọc thành lựa chọn dễ thấy.'
    },
    {
      title: 'Sức mạnh của thiết kế môi trường',
      content_summary: 'Môi trường thông minh làm cho bước đầu tiên trở nên vô cùng nhẹ nhõm.'
    },
    {
      title: 'Bỏ bớt nhu cầu về động lực',
      content_summary: 'Thay vì gồng mình tìm động lực, chỉ cần kéo thứ muốn làm lại gần hơn.'
    },
    {
      title: 'So sánh sự khởi đầu',
      content_summary: 'Sách mở sẵn trên bàn mời gọi hơn nhiều so với cuốn sách bị quên trong tủ.'
    },
    {
      title: 'Dòng chảy tự nhiên của thói quen',
      content_summary: 'Khi đồ vật hòa vào nhịp sống, thói quen tự nảy mầm không cần gắng gượng.'
    }
  ],
  ending: 'Để trang sách gần tay hơn, đời sống sâu sắc bắt đầu từ khoảng lặng nuôi dưỡng mỗi ngày. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Một thói quen tốt sẽ luôn trở nên dễ dàng bắt đầu hơn rất nhiều khi công cụ bạn cần được đặt ngay trong tầm mắt thay vì cất giấu quá kỹ.',
      type: 'hook'
    },
    {
      text: 'Nếu bạn luôn khao khát đọc sách nhiều hơn, nhưng cuốn sách ấy lại nằm sâu trong ngăn tủ kín, thì mỗi lần muốn đọc, não bộ buộc phải nhớ tới nó trước tiên.',
      type: 'body'
    },
    {
      text: 'Khoảng cách từ ý nghĩ đến hành động lúc này phải vượt qua hàng loạt ma sát: đi lại mở tủ, tìm kiếm cuốn sách, rồi mới có thể ngồi xuống lật từng trang.',
      type: 'body'
    },
    {
      text: 'Lần này, hãy thử một thay đổi rất nhỏ trong không gian sống: mang cuốn sách bạn đang đọc dở ra đặt ngay ở những nơi bạn thường xuyên ngồi xuống.',
      type: 'body'
    },
    {
      text: 'Đặt nó ngay trên góc bàn làm việc gỗ. Để nó trên chiếc đôn cạnh ghế sofa phòng khách. Hoặc đặt một cuốn nhẹ nhàng ngay trên bàn cạnh đầu giường ngủ.',
      type: 'body'
    },
    {
      text: 'Mục đích của việc này hoàn toàn không phải để ép buộc hay tạo áp lực cho bản thân, mà chỉ đơn giản là biến việc đọc thành một lựa chọn dễ nhìn thấy.',
      type: 'body'
    },
    {
      text: 'Môi trường xung quanh không thể trực tiếp tạo dựng thói quen thay bạn, nhưng một môi trường được sắp đặt thông minh có thể làm bước đầu tiên trở nên vô cùng nhẹ nhõm.',
      type: 'body'
    },
    {
      text: 'Đôi khi thay vì phải gồng mình tìm kiếm thêm động lực hay ý chí sắt đá, tất cả những gì bạn cần chỉ là kéo thứ mình muốn làm lại gần mình hơn.',
      type: 'body'
    },
    {
      text: 'Một cuốn sách đang mở sẵn trên bàn luôn tạo ra lời mời gọi êm đềm và dễ bắt đầu hơn rất nhiều so với một cuốn sách gáy thẳng tắp bị lãng quên trong tủ.',
      type: 'body'
    },
    {
      text: 'Khi vật dụng hòa vào nhịp sống thường nhật, thói quen sẽ tự động nảy mầm một cách tự nhiên như hơi thở mà không cần bất kỳ sự gắng gượng nào.',
      type: 'body'
    },
    {
      text: 'Hãy để những trang sách ở gần tay bạn hơn, vì một cuộc sống sâu sắc bắt đầu từ những khoảng lặng bạn chọn nuôi dưỡng mỗi ngày. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, script written for:', slug);
