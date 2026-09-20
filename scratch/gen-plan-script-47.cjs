const fs = require('fs');
const path = require('path');

const slug = 'phan-47-2026-09-17-muoi-phut-xem-lai-tien-moi-tuan';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Mười Phút Xem Lại Tiền Mỗi Tuần Tốt Hơn Né Cả Tháng",
  hook: "Việc tài chính dễ trở nên đáng sợ khi mình chỉ nhìn vào lúc có vấn đề.",
  segments: [
    {
      title: "Thói quen thêm kế hoạch và công cụ",
      content_summary: "Ta hay cố giải quyết vấn đề bằng cách thêm thật nhiều thứ: kế hoạch, công cụ, quyết tâm."
    },
    {
      title: "Điều hữu ích thường nhỏ hơn",
      content_summary: "Đôi khi điều thật sự hữu ích và hiệu quả lại nhỏ hơn rất nhiều so với tưởng tượng."
    },
    {
      title: "Ưu tiên 1: Chi tiêu tuần này",
      content_summary: "Nhìn lại những khoản chi tiêu diễn ra trong tuần một cách đơn giản, nhẹ nhàng."
    },
    {
      title: "Ưu tiên 2: Hóa đơn sắp tới",
      content_summary: "Điểm qua các hóa đơn cần thanh toán trong thời gian tới để chủ động chuẩn bị."
    },
    {
      title: "Ưu tiên 3: Một khoản đang tiết kiệm",
      content_summary: "Quan sát khoản tích lũy nhỏ đang dần hình thành mà không tạo áp lực."
    },
    {
      title: "Không cần phải ấn tượng",
      content_summary: "Không việc nào nghe thật ấn tượng, và bản thân chúng cũng không cần phải ấn tượng."
    },
    {
      title: "Bớt mơ hồ nhờ nhịp đều đặn",
      content_summary: "Một lần xem ngắn nhưng đều đặn giúp những con số tài chính bớt đi sự mơ hồ."
    },
    {
      title: "Thử nghiệm 10 phút cố định",
      content_summary: "Chọn một thời điểm cố định mỗi tuần để nhìn lại các khoản chính trong mười phút."
    },
    {
      title: "Nếu giúp thì giữ, không giúp thì đổi",
      content_summary: "Giữ tinh thần thử nghiệm nhẹ nhàng: nếu hữu ích thì giữ lại, không thì thay đổi."
    },
    {
      title: "Không cần thiết kế lại mọi thứ",
      content_summary: "Một đời sống tốt hơn không nhất thiết đến từ việc phải thiết kế lại toàn bộ hệ thống."
    },
    {
      title: "Statement insight",
      content_summary: "Rõ ràng nhỏ nhưng đều thường nhẹ hơn rất nhiều so với một lần hoảng hốt cuối tháng."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên góc bàn làm việc cùng câu hỏi mở về thói quen xem lại chi tiêu."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Việc tài chính dễ trở nên đáng sợ khi mình chỉ nhìn vào lúc có vấn đề.",
      type: "hook"
    },
    {
      text: "Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.",
      type: "body"
    },
    {
      text: "Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.",
      type: "body"
    },
    {
      text: "Chi tiêu tuần này.",
      type: "body"
    },
    {
      text: "Hóa đơn sắp tới.",
      type: "body"
    },
    {
      text: "Một khoản đang tiết kiệm.",
      type: "body"
    },
    {
      text: "Không việc nào trong số đó nghe thật ấn tượng.",
      type: "body"
    },
    {
      text: "Và cũng không cần phải ấn tượng.",
      type: "body"
    },
    {
      text: "Một lần xem ngắn nhưng đều giúp con số bớt mơ hồ.",
      type: "body"
    },
    {
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một thời điểm cố định mỗi tuần để nhìn lại các khoản chính trong 10 phút.",
      type: "body"
    },
    {
      text: "Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ.",
      type: "body"
    },
    {
      text: "Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.",
      type: "body"
    },
    {
      text: "Rõ ràng nhỏ nhưng đều thường nhẹ hơn rất nhiều so với một lần hoảng hốt cuối tháng.",
      type: "body"
    },
    {
      text: "Bạn hay xem lại chi tiêu theo tuần, hay thường đợi đến cuối tháng?",
      type: "body"
    },
    {
      text: "Nếp, sống tốt hơn từ những điều nhỏ.",
      type: "ending"
    }
  ]
};

fs.writeFileSync(path.join(videoDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(scriptDir, 'script.json'), JSON.stringify(script, null, 2), 'utf8');
console.log('Step 2 (plan.json) & Step 3 (script.json) complete');
