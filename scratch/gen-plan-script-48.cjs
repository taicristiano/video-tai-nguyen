const fs = require('fs');
const path = require('path');

const slug = 'phan-48-2026-09-17-cuoi-tuan-hay-hoi-tuan-nay-hoc-duoc-gi';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Cuối Tuần Hãy Hỏi: Tuần Này Mình Thật Sự Học Được Gì?",
  hook: "Một tuần có thể rất bận nhưng đến cuối lại khó nói mình đã tiến ở đâu.",
  segments: [
    {
      title: "Câu hỏi gợi ý",
      content_summary: "Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?"
    },
    {
      title: "Thực tế thay vì tưởng tượng",
      content_summary: "Không phải dễ hơn trong tưởng tượng, mà là dễ hơn trong một ngày bình thường thực tế."
    },
    {
      title: "Ưu tiên 1: Một khái niệm hiểu rõ hơn",
      content_summary: "Khi một khái niệm được thấu hiểu sâu sắc hơn giúp công việc mạch lạc hơn."
    },
    {
      title: "Ưu tiên 2: Một lỗi đã tránh được",
      content_summary: "Khi một sai sót quen thuộc đã được chủ động nhận biết và né tránh."
    },
    {
      title: "Ưu tiên 3: Một kỹ năng làm nhanh hơn",
      content_summary: "Khi một thao tác công việc được thực hiện thuần thục và nhanh chóng hơn."
    },
    {
      title: "Tần suất xuất hiện",
      content_summary: "Những chi tiết như vậy hiếm khi gọi là thay đổi lớn, nhưng xuất hiện rất nhiều lần."
    },
    {
      title: "Bản tổng kết ngắn",
      content_summary: "Một bản ghi chép ngắn giúp biến những tiến bộ nhỏ thành thứ có thể nhìn thấy."
    },
    {
      title: "Thử nghiệm viết ba dòng",
      content_summary: "Mỗi cuối tuần viết ba dòng: đã học gì, còn vướng gì, tuần sau thử gì."
    },
    {
      title: "Quan sát sự nhẹ nhõm",
      content_summary: "Nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa."
    },
    {
      title: "Statement insight",
      content_summary: "Khi nhìn thấy tiến bộ nhỏ, mình bớt cần những cú hích lớn để tiếp tục."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên góc bàn làm việc cuối tuần cùng câu hỏi mở về tiến bộ nhỏ."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Một tuần có thể rất bận nhưng đến cuối lại khó nói mình đã tiến ở đâu.",
      type: "hook"
    },
    {
      text: "Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?",
      type: "body"
    },
    {
      text: "Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.",
      type: "body"
    },
    {
      text: "Khi một khái niệm hiểu rõ hơn.",
      type: "body"
    },
    {
      text: "Khi một lỗi đã tránh được.",
      type: "body"
    },
    {
      text: "Khi một kỹ năng đã làm nhanh hơn.",
      type: "body"
    },
    {
      text: "Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.",
      type: "body"
    },
    {
      text: "Nhưng chúng xuất hiện rất nhiều lần.",
      type: "body"
    },
    {
      text: "Một bản tổng kết ngắn giúp biến tiến bộ nhỏ thành thứ mình nhìn thấy được.",
      type: "body"
    },
    {
      text: "Thử trong một tuần: mỗi cuối tuần viết ba dòng: đã học gì, còn vướng gì, tuần sau thử gì.",
      type: "body"
    },
    {
      text: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.",
      type: "body"
    },
    {
      text: "Khi nhìn thấy tiến bộ nhỏ, mình bớt cần những cú hích lớn để tiếp tục.",
      type: "body"
    },
    {
      text: "Tuần này, điều nhỏ nhất mà bạn thấy mình làm tốt hơn tuần trước là gì?",
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
console.log('Step 2 & 3 complete for phan-48');
