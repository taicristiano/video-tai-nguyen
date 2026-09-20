const fs = require('fs');
const path = require('path');

const slug = 'phan-51-2026-09-17-be-mat-trong-la-mot-tien-ich';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Bề Mặt Trống Là Một Tiện Ích, Không Phải Khoảng Trống Lãng Phí",
  hook: "Ta thường có xu hướng lấp đầy bàn, kệ và mặt tủ vì thấy chúng còn trống.",
  segments: [
    {
      title: "Thói quen thêm giải pháp",
      content_summary: "Ta hay cố giải quyết vấn đề bằng cách thêm thật nhiều thứ: kế hoạch, công cụ, quyết tâm."
    },
    {
      title: "Điều hữu ích thường nhỏ hơn",
      content_summary: "Đôi khi điều thật sự hữu ích lại nhỏ và tinh tế hơn rất nhiều."
    },
    {
      title: "Ưu tiên 1: Mặt bàn bếp",
      content_summary: "Khoảng trống trên mặt bếp giúp việc nấu nướng và dọn dẹp nhẹ nhàng hơn."
    },
    {
      title: "Ưu tiên 2: Bàn làm việc",
      content_summary: "Mặt bàn thoáng đãng tạo không gian tập trung và đặt tài liệu khi cần."
    },
    {
      title: "Ưu tiên 3: Tủ đầu giường",
      content_summary: "Một góc tủ đầu giường gọn gàng cho giấc ngủ và buổi sáng bình yên."
    },
    {
      title: "Không cần phải ấn tượng",
      content_summary: "Không việc nào nghe thật ấn tượng, và bản thân chúng cũng không cần phải ấn tượng."
    },
    {
      title: "Công năng của khoảng trống",
      content_summary: "Bề mặt trống cho mình chỗ để thao tác, đặt tạm và thở bằng mắt."
    },
    {
      title: "Thử nghiệm giữ 1/3 khoảng trống",
      content_summary: "Chọn một bề mặt và giữ lại ít nhất một phần ba khoảng trống trong một tuần."
    },
    {
      title: "Nếu giúp thì giữ, không giúp thì đổi",
      content_summary: "Giữ tinh thần linh hoạt và nhẹ nhàng khi thử nghiệm thói quen mới."
    },
    {
      title: "Không cần thiết kế lại mọi thứ",
      content_summary: "Một đời sống tốt hơn không nhất thiết đến từ việc phải thiết kế lại toàn bộ."
    },
    {
      title: "Statement insight",
      content_summary: "Khoảng trống cũng là một thứ mình có thể sử dụng."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên góc phòng cùng câu hỏi mở về bề mặt dễ bị chất đầy đồ."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Ta thường có xu hướng lấp đầy bàn, kệ và mặt tủ vì thấy chúng còn trống.",
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
      text: "Mặt bàn bếp.",
      type: "body"
    },
    {
      text: "Bàn làm việc.",
      type: "body"
    },
    {
      text: "Tủ đầu giường.",
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
      text: "Nhưng bề mặt trống cho mình chỗ để thao tác, đặt tạm và thở bằng mắt.",
      type: "body"
    },
    {
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một bề mặt và giữ lại ít nhất một phần ba khoảng trống trong một tuần.",
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
      text: "Khoảng trống cũng là một thứ mình có thể sử dụng.",
      type: "body"
    },
    {
      text: "Trong nhà bạn, bề mặt nào hiện đang dễ bị chất đầy đồ nhất?",
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
console.log('Step 2 & 3 complete for phan-51');
