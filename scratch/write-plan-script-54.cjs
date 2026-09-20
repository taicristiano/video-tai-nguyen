const fs = require('fs');

const slug = 'phan-54-2026-09-17-hoc-xong-mot-khoa-truoc-khi-mo-khoa-moi';

const plan = {
  title: "Học Xong Một Khóa Trước Khi Mở Khóa Mới",
  hook: "Internet khiến việc bắt đầu học rất dễ và việc hoàn thành lại rất khó.",
  segments: [
    {
      title: "Khoảng cách năng lượng",
      content_summary: "Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường."
    },
    {
      title: "Ưu tiên 1: Một tab khóa học",
      content_summary: "Có thể chỉ là một tab khóa học đang mở dở trên trình duyệt."
    },
    {
      title: "Ưu tiên 2: Một playlist tutorial",
      content_summary: "Hoặc một playlist tutorial dài nhiều tập trên mạng."
    },
    {
      title: "Ưu tiên 3: Cuốn sách chuyên môn",
      content_summary: "Hoặc đơn giản là một cuốn sách chuyên môn nằm trên bàn làm việc."
    },
    {
      title: "Cảm giác không lột xác",
      content_summary: "Những việc này nhỏ tới mức không tạo cảm giác lột xác ngay lập tức."
    },
    {
      title: "Lợi thế bền vững",
      content_summary: "Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai."
    },
    {
      title: "Sự phân mảnh chú ý",
      content_summary: "Nhiều tài nguyên chưa hoàn thành tạo cảm giác mình đang học, nhưng làm sự chú ý bị chia nhỏ."
    },
    {
      title: "Quy tắc một khóa chính",
      content_summary: "Nếu muốn thử, đặt quy tắc: chỉ một khóa chính đang hoạt động tại một thời điểm."
    },
    {
      title: "Quan sát thay đổi thực tế",
      content_summary: "Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày."
    },
    {
      title: "Statement insight",
      content_summary: "Kiến thức tích lũy không đến từ số thứ mình đã mở. Nó đến từ số lần mình đi đủ sâu để hoàn thành một vòng."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Cảnh kết luận yên, ít chi tiết, có khoảng thở kèm câu hỏi: Hiện tại trong máy bạn đang có bao nhiêu khóa học hay playlist tutorial mở dở mà chưa xem xong?"
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 76
};

const script = {
  script: [
    {
      text: "Internet khiến việc bắt đầu học rất dễ và việc hoàn thành lại rất khó.",
      type: "hook"
    },
    {
      text: "Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.",
      type: "body"
    },
    {
      text: "Có thể chỉ là một tab khóa học.",
      type: "body"
    },
    {
      text: "Hoặc một playlist tutorial.",
      type: "body"
    },
    {
      text: "Hoặc đơn giản là một cuốn sách chuyên môn.",
      type: "body"
    },
    {
      text: "Những việc này nhỏ tới mức không tạo cảm giác \"lột xác\".",
      type: "body"
    },
    {
      text: "Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.",
      type: "body"
    },
    {
      text: "Nhiều tài nguyên chưa hoàn thành tạo cảm giác mình đang học, nhưng làm sự chú ý bị chia nhỏ.",
      type: "body"
    },
    {
      text: "Nếu muốn thử, đặt quy tắc: chỉ một khóa chính đang hoạt động tại một thời điểm.",
      type: "body"
    },
    {
      text: "Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.",
      type: "body"
    },
    {
      text: "Kiến thức tích lũy không đến từ số thứ mình đã mở. Nó đến từ số lần mình đi đủ sâu để hoàn thành một vòng.",
      type: "body"
    },
    {
      text: "Hiện tại trong máy bạn đang có bao nhiêu khóa học hay playlist tutorial mở dở mà chưa xem xong?",
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
console.log('plan.json and script.json written successfully for phan-54');
