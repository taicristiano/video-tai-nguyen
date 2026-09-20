const fs = require('fs');
const path = require('path');

const slug = 'phan-52-2026-09-17-mat-cung-can-khoang-nghi-giua-man-hinh';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Mắt Cũng Cần Khoảng Nghỉ Giữa Các Màn Hình",
  hook: "Một ngày có thể chuyển từ laptop sang điện thoại rồi lại về laptop mà không có điểm nghỉ thật sự.",
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
      title: "Ưu tiên 1: Nhìn ra xa qua cửa sổ",
      content_summary: "Phóng tầm mắt ra xa để các cơ mắt được thả lỏng tự nhiên."
    },
    {
      title: "Ưu tiên 2: Nhắm mắt vài nhịp",
      content_summary: "Nhắm mắt tĩnh lặng trong vài nhịp thở để giảm tải kích thích thị giác."
    },
    {
      title: "Ưu tiên 3: Đứng dậy khỏi bàn",
      content_summary: "Rời khỏi ghế ngồi để cơ thể đổi tư thế và kích hoạt tuần hoàn."
    },
    {
      title: "Sự tích lũy từ chi tiết nhỏ",
      content_summary: "Những chi tiết như vậy hiếm khi gọi là thay đổi lớn, nhưng xuất hiện rất nhiều lần."
    },
    {
      title: "Tạo khoảng ngắt đơn giản",
      content_summary: "Chuyển ánh nhìn ra khỏi màn hình là cách nhẹ nhàng nhất để ngắt mạch căng thẳng."
    },
    {
      title: "Thử nghiệm một phút không màn hình",
      content_summary: "Giữa hai block làm việc, dành đúng một phút không nhìn vào bất kỳ màn hình nào."
    },
    {
      title: "Quan sát sự nhẹ nhõm",
      content_summary: "Nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa."
    },
    {
      title: "Statement insight",
      content_summary: "Không phải mọi lần nghỉ đều cần thêm nội dung. Có lúc nghỉ nghĩa là bớt nhìn."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên khung cửa sổ cùng câu hỏi mở về thói quen nghỉ ngơi giữa giờ."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Một ngày có thể chuyển từ laptop sang điện thoại rồi lại về laptop mà không có điểm nghỉ thật sự.",
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
      text: "Khi nhìn ra xa qua cửa sổ.",
      type: "body"
    },
    {
      text: "Khi nhắm mắt vài nhịp.",
      type: "body"
    },
    {
      text: "Khi đứng dậy khỏi bàn.",
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
      text: "Chuyển ánh nhìn ra khỏi màn hình là một cách đơn giản để tạo khoảng ngắt.",
      type: "body"
    },
    {
      text: "Thử trong một tuần: giữa hai block làm việc, dành một phút không nhìn vào màn hình khác.",
      type: "body"
    },
    {
      text: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.",
      type: "body"
    },
    {
      text: "Không phải mọi lần nghỉ đều cần thêm nội dung. Có lúc nghỉ nghĩa là bớt nhìn.",
      type: "body"
    },
    {
      text: "Khi nghỉ giữa giờ làm, bạn thường lướt điện thoại hay rời mắt hẳn khỏi màn hình?",
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
console.log('Step 2 & 3 complete for phan-52');
