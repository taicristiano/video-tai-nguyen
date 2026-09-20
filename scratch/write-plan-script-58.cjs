const fs = require('fs');

const slug = 'phan-58-2026-09-17-ngay-lam-viec-can-mot-ranh-gioi-nhin-thay-duoc';

const plan = {
  title: "Ngày Làm Việc Cần Một Ranh Giới Nhìn Thấy Được",
  hook: "Làm ở nhà khiến công việc rất dễ kéo dài bằng những việc chỉ thêm một chút.",
  segments: [
    {
      title: "Khoảng cách năng lượng",
      content_summary: "Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường."
    },
    {
      title: "Ưu tiên 1: Đóng laptop",
      content_summary: "Có thể chỉ là đóng laptop."
    },
    {
      title: "Ưu tiên 2: Tắt màn hình",
      content_summary: "Hoặc tắt màn hình."
    },
    {
      title: "Ưu tiên 3: Rời khỏi bàn làm việc",
      content_summary: "Hoặc đơn giản là rời khỏi bàn làm việc."
    },
    {
      title: "Không tạo cảm giác lột xác",
      content_summary: "Những việc này nhỏ tới mức không tạo cảm giác lột xác."
    },
    {
      title: "Lợi thế quay lại ngày mai",
      content_summary: "Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai."
    },
    {
      title: "Tín hiệu vật lý",
      content_summary: "Một tín hiệu vật lý giúp cơ thể hiểu rằng vai trò làm việc đã tạm kết thúc."
    },
    {
      title: "Hành động cố định đóng ngày",
      content_summary: "Nếu muốn thử, tạo một hành động cố định đánh dấu hết ngày và lặp nó đều."
    },
    {
      title: "Quan sát tiến triển sau vài ngày",
      content_summary: "Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày."
    },
    {
      title: "Statement insight",
      content_summary: "Ranh giới không phải để làm ít đi. Nó giúp phần còn lại của đời sống có chỗ tồn tại."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Cảnh kết luận yên, ít chi tiết, có khoảng thở kèm câu hỏi: Khi làm việc ở nhà, bạn có một nghi thức cố định để đóng lại ngày làm việc chưa?"
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 76
};

const script = {
  script: [
    {
      text: "Làm ở nhà khiến công việc rất dễ kéo dài bằng những việc chỉ thêm một chút.",
      type: "hook"
    },
    {
      text: "Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.",
      type: "body"
    },
    {
      text: "Có thể chỉ là đóng laptop.",
      type: "body"
    },
    {
      text: "Hoặc tắt màn hình.",
      type: "body"
    },
    {
      text: "Hoặc đơn giản là rời khỏi bàn làm việc.",
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
      text: "Một tín hiệu vật lý giúp cơ thể hiểu rằng vai trò làm việc đã tạm kết thúc.",
      type: "body"
    },
    {
      text: "Nếu muốn thử, tạo một hành động cố định đánh dấu hết ngày và lặp nó đều.",
      type: "body"
    },
    {
      text: "Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.",
      type: "body"
    },
    {
      text: "Ranh giới không phải để làm ít đi. Nó giúp phần còn lại của đời sống có chỗ tồn tại.",
      type: "body"
    },
    {
      text: "Khi làm việc ở nhà, bạn có một nghi thức cố định để đóng lại ngày làm việc chưa?",
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
console.log('plan.json and script.json written successfully for phan-58');
