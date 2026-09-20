const fs = require('fs');
const path = require('path');

const slug = 'phan-49-2026-09-17-nhung-viec-chua-khep-lai-chiem-cho-trong-dau';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Những Việc Chưa Khép Lại Chiếm Chỗ Trong Đầu Nhiều Hơn Ta Nghĩ",
  hook: "Một email chưa trả lời hay một quyết định chưa chốt có thể tiếp tục quay lại trong đầu cả ngày.",
  segments: [
    {
      title: "Góc nhìn ngắn hạn",
      content_summary: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể."
    },
    {
      title: "Ưu tiên 1: Một tin nhắn cần trả lời",
      content_summary: "Tin nhắn chưa phản hồi vẫn âm thầm giữ một phần chú ý."
    },
    {
      title: "Ưu tiên 2: Một giấy tờ cần nộp",
      content_summary: "Thủ tục hay giấy tờ dở dang tạo ra cảm giác chưa hoàn thành."
    },
    {
      title: "Ưu tiên 3: Một cuộc hẹn chưa xác nhận",
      content_summary: "Cuộc hẹn lơ lửng khiến lịch trình thiếu sự chắc chắn."
    },
    {
      title: "Mọi thứ tưởng như y nguyên",
      content_summary: "Mọi thứ vẫn gần như y nguyên sau một ngày bình thường."
    },
    {
      title: "Bản chất tích lũy của đời sống",
      content_summary: "Đời sống được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần."
    },
    {
      title: "Tác động của open loop",
      content_summary: "Những việc dở dang tích lại tạo cảm giác bận rộn và căng thẳng ngầm."
    },
    {
      title: "Đổi câu hỏi dẫn dắt",
      content_summary: "Thay vì hỏi việc này có thay đổi nhiều không, hãy hỏi mình có duy trì được khi bận hơn không."
    },
    {
      title: "Hành động cụ thể: Khép lại 3 việc",
      content_summary: "Chọn ba việc dưới năm phút và khép chúng lại trước khi mở thêm việc mới."
    },
    {
      title: "Statement insight",
      content_summary: "Đôi khi nhẹ đầu không đến từ nghỉ thêm, mà từ việc đóng bớt những cánh cửa đang mở."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên góc bàn làm việc cùng câu hỏi mở về những việc lấp lửng trong đầu."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Một email chưa trả lời hay một quyết định chưa chốt có thể tiếp tục quay lại trong đầu cả ngày.",
      type: "hook"
    },
    {
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.",
      type: "body"
    },
    {
      text: "Một tin nhắn cần trả lời.",
      type: "body"
    },
    {
      text: "Một giấy tờ cần nộp.",
      type: "body"
    },
    {
      text: "Một cuộc hẹn chưa xác nhận.",
      type: "body"
    },
    {
      text: "Mọi thứ vẫn gần như y nguyên sau đó.",
      type: "body"
    },
    {
      text: "Nhưng đời sống không được tạo bởi một ngày duy nhất. Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần.",
      type: "body"
    },
    {
      text: "Open loop nhỏ tích lại sẽ tạo cảm giác bận ngay cả khi mình không làm gì.",
      type: "body"
    },
    {
      text: "Vì vậy thay vì hỏi việc này có thay đổi được nhiều không, thử hỏi: mình có thể tiếp tục làm nó khi ngày mai bận hơn không?",
      type: "body"
    },
    {
      text: "Chọn ba việc dưới năm phút và khép chúng lại trước khi mở thêm việc mới.",
      type: "body"
    },
    {
      text: "Đôi khi nhẹ đầu không đến từ nghỉ thêm, mà từ việc đóng bớt những cánh cửa đang mở.",
      type: "body"
    },
    {
      text: "Ngay lúc này, có việc nhỏ nào dưới năm phút đang nằm lấp lửng trong đầu bạn không?",
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
console.log('Step 2 & 3 complete for phan-49');
