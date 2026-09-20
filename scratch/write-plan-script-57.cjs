const fs = require('fs');

const slug = 'phan-57-2026-09-17-muoi-phut-buffer-co-the-cuu-ca-mot-hanh-trinh';

const plan = {
  title: "Mười Phút Buffer Có Thể Cứu Cả Một Hành Trình",
  hook: "Lịch di chuyển quá sát khiến một đèn đỏ, một thang máy chậm hay một đoạn kẹt xe cũng đủ làm mọi thứ căng lên.",
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
      title: "Ưu tiên 1: Ra khỏi nhà sớm hơn",
      content_summary: "Ra khỏi nhà sớm hơn."
    },
    {
      title: "Ưu tiên 2: Đến ga trước một chút",
      content_summary: "Đến ga trước một chút."
    },
    {
      title: "Ưu tiên 3: Không xếp hẹn sát nhau",
      content_summary: "Không xếp cuộc hẹn nối sát nhau."
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
      title: "Giá trị của buffer",
      content_summary: "Buffer không làm mình mất thời gian. Nó mua lại sự bình tĩnh khi đời sống không chạy đúng kế hoạch."
    },
    {
      title: "Thử nghiệm 10-15 phút dự phòng",
      content_summary: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: với việc quan trọng, thử thêm mười đến mười lăm phút dự phòng thay vì tính đúng thời gian lý tưởng."
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
      content_summary: "Khoảng đệm nhỏ đôi khi là thứ giữ cả hành trình không biến thành một cuộc chạy."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Cảnh kết luận yên, ít chi tiết, có khoảng thở kèm câu hỏi: Khi có một cuộc hẹn quan trọng, bạn thường đến trước mười phút hay căn sát giờ mới đi?"
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 77
};

const script = {
  script: [
    {
      text: "Lịch di chuyển quá sát khiến một đèn đỏ, một thang máy chậm hay một đoạn kẹt xe cũng đủ làm mọi thứ căng lên.",
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
      text: "Ra khỏi nhà sớm hơn.",
      type: "body"
    },
    {
      text: "Đến ga trước một chút.",
      type: "body"
    },
    {
      text: "Không xếp cuộc hẹn nối sát nhau.",
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
      text: "Buffer không làm mình mất thời gian. Nó mua lại sự bình tĩnh khi đời sống không chạy đúng kế hoạch.",
      type: "body"
    },
    {
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: với việc quan trọng, thử thêm mười đến mười lăm phút dự phòng thay vì tính đúng thời gian lý tưởng.",
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
      text: "Khoảng đệm nhỏ đôi khi là thứ giữ cả hành trình không biến thành một cuộc chạy.",
      type: "body"
    },
    {
      text: "Khi có một cuộc hẹn quan trọng, bạn thường đến trước mười phút hay căn sát giờ mới đi?",
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
console.log('plan.json and script.json written successfully for phan-57');
