const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-cuon-so-nho-ben-canh';
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
Có một cuốn sổ nhỏ bên cạnh đôi khi hữu ích hơn một trí nhớ tốt

Hook:
Ý tưởng đến rất nhanh. Và nó cũng rời đi nhanh như vậy.

Voice-over:

Có bao nhiêu lần bạn nghĩ ra một điều hay rồi tự nhủ: “Lát nữa mình sẽ nhớ.”

Và vài tiếng sau, nó biến mất.

Không phải vì trí nhớ của bạn kém. Chỉ là trong ngày có quá nhiều thứ mới chen vào.

Một cuốn sổ nhỏ hoặc một chỗ ghi chú cố định giúp ý tưởng có nơi để đi ngay khi xuất hiện.

Không cần viết đẹp. Không cần viết thành bài. Chỉ cần vài từ đủ để ngày mai bạn hiểu mình đã nghĩ gì.

Ghi chép không phải để lưu mọi thứ. Nó chỉ giữ lại những điều mình không muốn đánh mất.

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
  title: 'Một cuốn sổ nhỏ bên cạnh',
  hook: 'Những ý tưởng hay thường ghé đến một cách vô cùng bất ngờ và chớp nhoáng. Nhưng nếu không cẩn thận, chúng cũng sẽ lặng lẽ rời đi nhanh như khi chúng xuất hiện.',
  segments: [
    {
      title: 'Khoảnh khắc tự tin vào trí nhớ',
      content_summary: 'Nghĩ ra điều hay rồi tự nhủ: Lát nữa rảnh mình sẽ nhớ để ghi lại.'
    },
    {
      title: 'Sự biến mất chóng vánh',
      content_summary: 'Chỉ vài tiếng sau ý nghĩ quý giá đã hoàn toàn bốc hơi không còn dấu vết.'
    },
    {
      title: 'Bản chất không phải do trí nhớ kém',
      content_summary: 'Không phải trí nhớ kém, mà trong ngày có quá nhiều thông tin mới ùa vào lấn át.'
    },
    {
      title: 'Vị trí trú ẩn cho ý tưởng',
      content_summary: 'Cuốn sổ nhỏ hoặc chỗ ghi chú cố định giúp ý tưởng có nơi hạ cánh an toàn.'
    },
    {
      title: 'Không cần sự cầu kỳ',
      content_summary: 'Không cần nắn nót viết đẹp hay thành bài, chỉ đơn thuần là neo giữ cảm xúc.'
    },
    {
      title: 'Đủ để gợi nhắc ngày mai',
      content_summary: 'Vài gạch đầu dòng đủ để ngày mai mở sổ bạn hiểu mình đã nghĩ gì.'
    },
    {
      title: 'Giải phóng dung lượng não bộ',
      content_summary: 'Não sinh ra để sáng tạo ý tưởng, không phải làm kho chứa gánh gồng trí nhớ.'
    },
    {
      title: 'Triết lý của việc ghi chép',
      content_summary: 'Ghi chép không phải lưu mọi thứ, chỉ giữ lại điều ta không muốn đánh mất.'
    },
    {
      title: 'Cuốn sổ là người bạn đồng hành',
      content_summary: 'Cuốn sổ nhỏ êm đềm bên cạnh chiếc bút là công cụ trung thành đáng tin cậy.'
    }
  ],
  ending: 'Để suy nghĩ nương náu trên trang giấy, đời sống tinh tế bắt đầu từ nét mực khiêm nhường. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Những ý tưởng hay thường ghé đến một cách vô cùng bất ngờ và chớp nhoáng. Nhưng nếu không cẩn thận, chúng cũng sẽ lặng lẽ rời đi nhanh như khi chúng xuất hiện.',
      type: 'hook'
    },
    {
      text: 'Đã bao nhiêu lần bạn tình cờ nghĩ ra một giải pháp tuyệt vời hay một góc nhìn thú vị, rồi tự tin mỉm cười nhủ thầm: Thôi, lát nữa rảnh mình sẽ nhớ để ghi lại?',
      type: 'body'
    },
    {
      text: 'Thế nhưng chỉ vài tiếng đồng hồ sau, hoặc thậm chí ngay khi vừa buông tay khỏi tách cà phê, ý nghĩ quý giá ấy đã hoàn toàn bốc hơi không còn một dấu vết.',
      type: 'body'
    },
    {
      text: 'Điều đó xảy ra hoàn toàn không phải vì trí nhớ của bạn sa sút hay kém cỏi. Chỉ đơn giản là trong suốt một ngày, có quá nhiều thông tin mới liên tục ùa vào lấn át.',
      type: 'body'
    },
    {
      text: 'Chính vì vậy, luôn giữ một cuốn sổ nhỏ hoặc một trang ghi chú cố định bên cạnh sẽ giúp mọi tia sáng suy nghĩ có một nơi chốn an toàn để hạ cánh ngay lập tức.',
      type: 'body'
    },
    {
      text: 'Bạn không cần phải nắn nót viết thật đẹp, cũng chẳng cần phải trau chuốt chúng thành những đoạn văn hoàn chỉnh. Việc viết ra chỉ đơn thuần là neo giữ lại một cảm xúc.',
      type: 'body'
    },
    {
      text: 'Đôi khi chỉ cần vài gạch đầu dòng ngắn ngủi, vài từ khóa giản dị là đã quá đủ để ngày mai, khi mở sổ ra, bạn lập tức hiểu rõ lúc đó mình đã nghĩ gì.',
      type: 'body'
    },
    {
      text: 'Bộ não của con người được thiết kế để sáng tạo và kết nối các ý tưởng, chứ không phải sinh ra để làm một chiếc kho chứa gồng gánh hàng ngàn việc phải ghi nhớ.',
      type: 'body'
    },
    {
      text: 'Ghi chép chưa bao giờ là việc cố gắng lưu giữ tất cả mọi thứ trên đời. Mục đích duy nhất của nó là nhẹ nhàng giữ lại những điều bạn thực sự không muốn đánh mất.',
      type: 'body'
    },
    {
      text: 'Một cuốn sổ tay nhỏ nằm êm đềm bên cạnh chiếc bút quen thuộc đôi khi lại là công cụ trung thành và đáng tin cậy hơn bất kỳ trí nhớ siêu phàm nào.',
      type: 'body'
    },
    {
      text: 'Hãy để những suy nghĩ đẹp đẽ có một chốn nương náu trên trang giấy, vì sự tinh tế của đời sống bắt đầu từ những nét mực khiêm nhường. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, script written for:', slug);
