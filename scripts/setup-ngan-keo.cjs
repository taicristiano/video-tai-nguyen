const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-bat-dau-tu-mot-ngan-keo';
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
Đừng dọn cả căn phòng, hãy bắt đầu từ một ngăn kéo

Hook:
Khi một việc trông quá lớn, hãy làm cho điểm bắt đầu nhỏ đến mức khó từ chối.

Voice-over:

“Cuối tuần mình sẽ dọn cả phòng.” Nghe rất tốt.

Nhưng chính vì quá lớn, việc đó rất dễ bị dời sang cuối tuần sau.

Thử đổi mục tiêu.

Không dọn cả phòng. Chỉ dọn một ngăn kéo.

Không sắp xếp toàn bộ bàn. Chỉ bỏ đi những thứ không dùng trên mặt bàn.

Một việc nhỏ tạo ra một điểm kết thúc rõ ràng. Và khi đã bắt đầu, đôi khi bạn muốn làm thêm.

Nếu không thì cũng không sao.

Một ngăn kéo gọn vẫn tốt hơn một kế hoạch dọn cả nhà chưa bao giờ bắt đầu.

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
  title: 'Bắt đầu từ một ngăn kéo',
  hook: 'Mỗi khi đứng trước một công việc trông có vẻ quá đồ sộ và mệt mỏi, bí quyết tốt nhất là hãy thu nhỏ điểm bắt đầu lại, nhỏ đến mức bạn khó lòng từ chối.',
  segments: [
    {
      title: 'Lời hứa cuối tuần quen thuộc',
      content_summary: 'Để cuối tuần rảnh rỗi mình sẽ tổng vệ sinh và dọn dẹp lại toàn bộ căn phòng.'
    },
    {
      title: 'Sức ỳ của kế hoạch khổng lồ',
      content_summary: 'Kế hoạch quá lớn khiến não sinh ra cảm giác ngần ngại và liên tục dời lịch.'
    },
    {
      title: 'Chiến lược đổi mục tiêu vi mô',
      content_summary: 'Đừng dọn cả phòng, chỉ cần mở và sắp xếp duy nhất một ngăn kéo.'
    },
    {
      title: 'Thu nhỏ phạm vi hành động',
      content_summary: 'Chỉ cần nhặt bỏ vài mẩu giấy vụn và đồ thừa không dùng trên mặt bàn.'
    },
    {
      title: 'Sức mạnh của điểm kết thúc rõ ràng',
      content_summary: 'Hành động nhỏ tạo ra vạch đích rất gần, hoàn thành trong 5 phút không áp lực.'
    },
    {
      title: 'Đà tâm lý khi đã bắt tay làm',
      content_summary: 'Khi tay đã bắt đầu, quán tính tự nhiên thôi thúc bạn muốn làm thêm.'
    },
    {
      title: 'Cho phép dừng lại thoải mái',
      content_summary: 'Dừng lại ở đúng một ngăn kéo vẫn là một thành công trọn vẹn.'
    },
    {
      title: 'So sánh giá trị thực tế',
      content_summary: 'Một ngăn kéo gọn hôm nay quý hơn kế hoạch dọn cả nhà chưa từng bắt đầu.'
    },
    {
      title: 'Tích lũy từ những bước nhỏ',
      content_summary: 'Thay đổi lớn đến từ những hành động nhỏ bé hoàn thành mỗi ngày.'
    }
  ],
  ending: 'Bắt đầu từ góc nhỏ nhất trước mắt, điều giản dị kiến tạo đời sống an lành. NẾP. Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 135
};

const script = {
  script: [
    {
      text: 'Mỗi khi đứng trước một công việc trông có vẻ quá đồ sộ và mệt mỏi, bí quyết tốt nhất là hãy thu nhỏ điểm bắt đầu lại, nhỏ đến mức bạn khó lòng từ chối.',
      type: 'hook'
    },
    {
      text: 'Chúng ta rất hay tự nhủ với bản thân rằng: thôi để cuối tuần rảnh rang mình sẽ tổng vệ sinh và dọn dẹp lại toàn bộ căn phòng.',
      type: 'body'
    },
    {
      text: 'Ý định đó nghe chừng rất tuyệt vời. Nhưng chính vì quy mô của nó quá lớn, bộ não sẽ ngầm sinh ra cảm giác ngần ngại và liên tục dời nó sang tuần sau.',
      type: 'body'
    },
    {
      text: 'Lần này, bạn hãy thử thay đổi hoàn toàn chiến lược tiếp cận. Đừng cố gắng dọn sạch cả căn phòng. Chỉ cần mở và dọn duy nhất một ngăn kéo.',
      type: 'body'
    },
    {
      text: 'Không cần sắp xếp lại toàn bộ góc làm việc phức tạp. Bạn chỉ cần nhặt bỏ vài mẩu giấy vụn và những thứ thừa thãi không còn dùng trên mặt bàn.',
      type: 'body'
    },
    {
      text: 'Một hành động cực kỳ nhỏ sẽ tạo ra một vạch đích rất gần và rõ ràng. Bạn có thể hoàn thành nó chỉ trong vòng năm phút mà không hề thấy áp lực.',
      type: 'body'
    },
    {
      text: 'Và điều kỳ diệu của tâm lý học là: một khi đôi tay đã thực sự bắt đầu chuyển động, quán tính hành động đôi khi sẽ tự nhiên thôi thúc bạn muốn dọn thêm.',
      type: 'body'
    },
    {
      text: 'Nhưng ngay cả khi bạn quyết định dừng lại đúng ở một ngăn kéo đó, thì điều đó vẫn hoàn toàn ổn và là một thành công trọn vẹn.',
      type: 'body'
    },
    {
      text: 'Bởi vì một ngăn kéo được sắp xếp ngăn nắp hôm nay vẫn luôn có giá trị gấp trăm lần một bản kế hoạch dọn cả ngôi nhà nhưng chưa bao giờ bắt đầu.',
      type: 'body'
    },
    {
      text: 'Những thay đổi lớn lao trong đời sống chưa bao giờ đến từ những cú nhảy vọt vĩ đại, mà chúng được tích lũy từ những hành động nhỏ bé được hoàn thành mỗi ngày.',
      type: 'body'
    },
    {
      text: 'Hãy bắt đầu từ góc nhỏ nhất ngay trước mắt bạn, vì những điều giản dị nhất sẽ kiến tạo nên một cuộc sống an lành. Nếp. Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, script written for:', slug);
