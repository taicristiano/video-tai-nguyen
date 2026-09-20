const fs = require('fs');

const slug = 'phan-56-2026-09-17-mot-khoang-yen-khong-can-muc-dich';

const plan = {
  title: "Một Khoảng Yên Không Cần Mục Đích",
  hook: "Ta rất dễ biến cả nghỉ ngơi thành một việc phải tối ưu.",
  segments: [
    {
      title: "Xu hướng thêm việc",
      content_summary: "Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm."
    },
    {
      title: "Điều nhỏ bé hữu ích",
      content_summary: "Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều."
    },
    {
      title: "Ưu tiên 1: Ngồi cạnh cửa sổ",
      content_summary: "Ngồi cạnh cửa sổ."
    },
    {
      title: "Ưu tiên 2: Uống trà",
      content_summary: "Uống trà."
    },
    {
      title: "Ưu tiên 3: Nhìn mưa hoặc nhìn cây",
      content_summary: "Nhìn mưa hoặc nhìn cây."
    },
    {
      title: "Không ấn tượng",
      content_summary: "Không việc nào trong số đó nghe thật ấn tượng."
    },
    {
      title: "Không cần ấn tượng",
      content_summary: "Và cũng không cần phải ấn tượng."
    },
    {
      title: "Bớt áp lực giá trị",
      content_summary: "Không phải phút nào cũng cần học, phục hồi hay tạo giá trị."
    },
    {
      title: "Thử nghiệm khoảng ngắn",
      content_summary: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: giữ lại một khoảng ngắn chỉ để ở đó, không biến nó thành nhiệm vụ."
    },
    {
      title: "Linh hoạt giữ hoặc đổi",
      content_summary: "Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ."
    },
    {
      title: "Đời sống không cần làm lại từ đầu",
      content_summary: "Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ."
    },
    {
      title: "Statement insight",
      content_summary: "Đôi khi điều mình cần không phải một hoạt động tốt hơn. Chỉ là vài phút không phải trở thành phiên bản nào cả."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Cảnh kết luận yên, ít chi tiết, có khoảng thở kèm câu hỏi: Lần gần nhất bạn cho phép mình ngồi yên vài phút mà không mở điện thoại là khi nào?"
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 77
};

const script = {
  script: [
    {
      text: "Ta rất dễ biến cả nghỉ ngơi thành một việc phải tối ưu.",
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
      text: "Ngồi cạnh cửa sổ.",
      type: "body"
    },
    {
      text: "Uống trà.",
      type: "body"
    },
    {
      text: "Nhìn mưa hoặc nhìn cây.",
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
      text: "Không phải phút nào cũng cần học, phục hồi hay tạo giá trị.",
      type: "body"
    },
    {
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: giữ lại một khoảng ngắn chỉ để ở đó, không biến nó thành nhiệm vụ.",
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
      text: "Đôi khi điều mình cần không phải một hoạt động tốt hơn. Chỉ là vài phút không phải trở thành phiên bản nào cả.",
      type: "body"
    },
    {
      text: "Lần gần nhất bạn cho phép mình ngồi yên vài phút mà không mở điện thoại là khi nào?",
      type: "body"
    },
    {
      text: "Nếp, sống tốt hơn từ những điều nhỏ.",
      type: "ending"
    }
  ]
};

fs.writeFileSync(`videos/${slug}/plan.json`, JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(`videos/${slug}/script/script.json`, JSON.stringify(script, null, 2), 'utf8');
console.log('plan.json and script.json written successfully for phan-56');
