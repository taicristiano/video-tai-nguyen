const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-bot-lua-chon';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');
const outputDir = path.join(videoDir, 'output');
const publicDir = path.join('public', slug);

fs.mkdirSync(scriptDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const context = `Video dọc 9:16, minimal editorial, calendar, phone notifications, choices fading away.

Tiêu đề: Bạn không cần thêm thời gian; đôi khi bạn cần bớt lựa chọn.

Voice-over:

Ta thường nói:
“Nếu có thêm thời gian, mình sẽ làm được nhiều hơn.”

Nhưng đôi khi vấn đề không phải thiếu giờ.

Mà là có quá nhiều thứ cạnh tranh cho cùng một giờ đó.

Quá nhiều tab.
Quá nhiều thông báo.
Quá nhiều việc “cũng quan trọng.”

Mỗi lựa chọn nhỏ đều lấy một chút sự chú ý.

Vì vậy,
một ngày dễ hơn không nhất thiết là ngày có nhiều thời gian hơn.

Có thể chỉ là ngày có ít thứ cần quyết định hơn.

Kết:
Đôi khi muốn làm thêm một điều quan trọng,
ta phải chủ động bỏ bớt vài điều không quan trọng.

End card: NẾP. — Sống tốt hơn từ những điều nhỏ.
`;

fs.writeFileSync(path.join(videoDir, 'context.txt'), context, 'utf8');
fs.writeFileSync(path.join(videoDir, 'template.txt'), 'human-insight/cinematic-light\n', 'utf8');
fs.writeFileSync(path.join(videoDir, 'audio.txt'), 'full\n', 'utf8');

const plan = {
  title: 'Đôi khi bạn cần bớt lựa chọn',
  hook: 'Chúng ta rất thường tự nói với chính mình rằng: giá như một ngày có thêm vài tiếng đồng hồ nữa, mình chắc chắn sẽ làm được nhiều điều hơn.',
  segments: [
    {
      title: 'Ảo tưởng về sự thiếu thời gian',
      content_summary: 'Vấn đề chưa bao giờ thực sự nằm ở việc thiếu thốn thời gian.'
    },
    {
      title: 'Sự cạnh tranh trong từng khoảnh khắc',
      content_summary: 'Quá nhiều thứ cùng lúc lao vào tranh giành sự chú ý trong cùng một giờ.'
    },
    {
      title: 'Những kẻ đánh cắp vô hình',
      content_summary: 'Hàng chục tab mở dở, thông báo nhấp nháy, việc gì cũng có vẻ quan trọng.'
    },
    {
      title: 'Cái giá của từng quyết định vụn',
      content_summary: 'Mỗi lựa chọn nhỏ nhặt đều âm thầm rút bớt năng lượng tập trung.'
    },
    {
      title: 'Quá tải nhận thức',
      content_summary: 'Não không sinh ra để xử lý hàng trăm ngã rẽ mỗi ngày, nhiều lựa chọn gây kiệt sức.'
    },
    {
      title: 'Định nghĩa lại một ngày nhẹ nhõm',
      content_summary: 'Một ngày dễ hơn không nhất thiết là ngày có nhiều thời gian hơn.'
    },
    {
      title: 'Sức mạnh của việc ít phải quyết định',
      content_summary: 'Đó là ngày có ít thứ cần cân nhắc, ít mục tiêu bị xé nhỏ.'
    },
    {
      title: 'Nghệ thuật loại trừ chủ động',
      content_summary: 'Dám đóng bớt cánh cửa phụ mới có đủ năng lượng cho cánh cửa chính.'
    },
    {
      title: 'Tập trung vào điều cốt lõi',
      content_summary: 'Muốn làm tốt điều quan trọng, phải chủ động bỏ bớt vài điều không quan trọng.'
    }
  ],
  ending: 'Bớt đi một lựa chọn để tâm trí tự do, những điều tinh giản tạo nên đời sống trọn vẹn. Nếp.',
  estimated_duration: 130
};

const script = {
  script: [
    {
      text: 'Chúng ta rất thường tự nói với chính mình rằng: giá như một ngày có thêm vài tiếng đồng hồ nữa, mình chắc chắn sẽ làm được nhiều điều hơn.',
      type: 'hook'
    },
    {
      text: 'Nhưng nếu nhìn lại thật kỹ, đôi khi vấn đề lớn nhất của bạn chưa bao giờ thực sự nằm ở việc thiếu thốn thời gian.',
      type: 'body'
    },
    {
      text: 'Vấn đề thực sự là có quá nhiều thứ cùng lúc lao vào tranh giành sự chú ý của bạn trong cùng một giờ đồng hồ đó.',
      type: 'body'
    },
    {
      text: 'Đó là hàng chục thẻ trình duyệt đang mở dở dang, những thông báo tin nhắn liên tục nhấp nháy, và vô số công việc nghe chừng cũng quan trọng.',
      type: 'body'
    },
    {
      text: 'Mỗi một lựa chọn nhỏ nhặt, dù bạn có nhấp vào hay phớt lờ, đều âm thầm rút bớt một phần năng lượng tập trung quý báu.',
      type: 'body'
    },
    {
      text: 'Bộ não của con người không sinh ra để xử lý hàng trăm ngã rẽ mỗi ngày. Càng nhiều sự lựa chọn, bạn càng nhanh chóng rơi vào kiệt sức.',
      type: 'body'
    },
    {
      text: 'Vì vậy, một ngày làm việc dễ dàng và thảnh thơi không nhất thiết phải là một ngày có nhiều thời gian rảnh rỗi hơn.',
      type: 'body'
    },
    {
      text: 'Đó có thể chỉ đơn giản là một ngày có ít thứ phải cân nhắc, ít mục tiêu bị xé nhỏ, và ít quyết định vụn vặt hơn.',
      type: 'body'
    },
    {
      text: 'Khi bạn dám can đảm đóng bớt những cánh cửa phụ, bạn mới có đủ sự hiện diện và năng lượng cho cánh cửa chính.',
      type: 'body'
    },
    {
      text: 'Đôi khi, để hoàn thành xuất sắc một việc thực sự quan trọng, bí quyết duy nhất là bạn phải chủ động bỏ bớt vài điều không quan trọng.',
      type: 'body'
    },
    {
      text: 'Hãy bớt đi một lựa chọn để tâm trí được tự do, bởi những điều nhỏ bé và tinh giản mới thực sự tạo nên một đời sống trọn vẹn. Nếp.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Setup, plan, and script generated for:', slug);
