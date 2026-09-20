const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-mot-ngay-bo-lo';
const videoDir = path.join('videos', slug);

const plan = {
  title: 'Một ngày bỏ lỡ không phá hủy thói quen',
  hook: 'Bạn vừa trải qua bảy ngày liên tục duy trì một thói quen tốt, nhưng rồi đến ngày thứ tám, công việc đột ngột ập đến và bạn đành phải bỏ lỡ.',
  segments: [
    {
      title: 'Cảm giác thất bại tức thì',
      content_summary: 'Nhìn chuỗi ngày đứt đoạn trên habit tracker, phản xạ là nghĩ rằng hỏng hết rồi.'
    },
    {
      title: 'Cái bẫy của sự toàn hảo',
      content_summary: 'Tư duy nhị nguyên khiến ta nghĩ hoặc hoàn hảo một trăm phần trăm hoặc hoàn toàn thất bại.'
    },
    {
      title: 'Một ngày không phá hủy thói quen',
      content_summary: 'Một ngày gián đoạn không đủ sức mạnh xóa bỏ toàn bộ nỗ lực đã tích lũy.'
    },
    {
      title: 'Tổn thất thực sự từ cảm xúc buông xuôi',
      content_summary: 'Vấn đề là cảm giác tội lỗi và chán nản khiến ngày thứ chín cũng bị buông xuôi luôn.'
    },
    {
      title: 'Sức mạnh của khả năng quay lại',
      content_summary: 'Thói quen bền vững không cần chuỗi ngày hoàn hảo mà cần năng lực nhanh chóng quay lại.'
    },
    {
      title: 'Quy tắc không bỏ lỡ hai lần',
      content_summary: 'Đừng bao giờ để sự gián đoạn kéo dài sang ngày thứ hai liên tiếp.'
    },
    {
      title: 'Không cần bù đắp quá mức',
      content_summary: 'Ngày mai không cần ép mình gồng gánh gấp đôi để bù, tránh kiệt sức và căng thẳng.'
    },
    {
      title: 'Trở lại nhịp điệu quen thuộc',
      content_summary: 'Chỉ cần nhẹ nhàng đặt chân trở lại đường ray và tìm lại nhịp điệu vốn có.'
    },
    {
      title: 'Góc nhìn dài hạn',
      content_summary: 'Hành trình là cuộc đua đường dài, chín mươi ngày kiên trì giá trị hơn một ngày lỡ.'
    }
  ],
  ending: 'Một ngày trượt không quyết định bạn là ai. Điều quyết định là lần tiếp theo bạn quay lại lúc nào. Nếp.',
  estimated_duration: 130
};

const script = {
  script: [
    {
      text: 'Bạn vừa trải qua bảy ngày liên tục duy trì một thói quen tốt, nhưng rồi đến ngày thứ tám, công việc đột ngột ập đến và bạn đành phải bỏ lỡ.',
      type: 'hook'
    },
    {
      text: 'Ngay khoảnh khắc nhìn thấy chuỗi ngày bị đứt đoạn trên ứng dụng theo dõi, phản xạ tự nhiên của rất nhiều người là nghĩ rằng: Thôi, hỏng hết rồi.',
      type: 'body'
    },
    {
      text: 'Chúng ta thường mắc kẹt trong cái bẫy của sự toàn hảo: hoặc là thực hiện đều đặn một trăm phần trăm, hoặc là hoàn toàn thất bại và vô nghĩa.',
      type: 'body'
    },
    {
      text: 'Nhưng sự thật là, một ngày gián đoạn hiếm khi có đủ sức mạnh để phá hủy toàn bộ nỗ lực hay sự tiến bộ mà bạn đã tích lũy trước đó.',
      type: 'body'
    },
    {
      text: 'Vấn đề thực sự không nằm ở ngày bạn nghỉ, mà nằm ở cảm giác tội lỗi và chán nản, khiến bạn buông xuôi và tiếp tục bỏ lỡ luôn cả ngày thứ chín.',
      type: 'body'
    },
    {
      text: 'Một thói quen bền vững không đòi hỏi một chuỗi ngày hoàn hảo không tì vết. Sức mạnh thực sự của nó nằm ở khả năng nhanh chóng quay trở lại.',
      type: 'body'
    },
    {
      text: 'Nếu cuộc sống có những biến cố khiến hôm nay bạn không thể hoàn thành, hãy nhớ quy tắc vàng: đừng bao giờ để sự gián đoạn kéo dài sang ngày thứ hai.',
      type: 'body'
    },
    {
      text: 'Khi bắt đầu lại vào ngày mai, bạn không cần phải ép mình gồng gánh gấp đôi để bù đắp. Việc bù đắp quá sức chỉ tạo thêm áp lực và kiệt sức.',
      type: 'body'
    },
    {
      text: 'Tất cả những gì bạn cần làm chỉ là nhẹ nhàng đặt chân trở lại đường ray, thực hiện phần việc nhỏ nhất và tìm lại nhịp điệu quen thuộc vốn có.',
      type: 'body'
    },
    {
      text: 'Con đường rèn luyện bản thân là một hành trình dài hạn kéo dài nhiều năm, nơi chín mươi ngày kiên trì luôn có giá trị hơn một ngày sơ suất.',
      type: 'body'
    },
    {
      text: 'Một ngày trượt không bao giờ định nghĩa được bạn là ai. Điều quyết định kết quả là bạn có đủ kiên nhẫn để mỉm cười và quay lại vào ngày mai hay không. Nếp.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(videoDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Successfully wrote plan.json and script.json!');
