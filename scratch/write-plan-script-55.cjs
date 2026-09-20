const fs = require('fs');

const slug = 'phan-55-2026-09-17-he-thong-giat-do-tot-la-he-thong-minh-chiu-dung';

const plan = {
  title: "Hệ Thống Giặt Đồ Tốt Là Hệ Thống Mình Chịu Dùng",
  hook: "Một hệ thống có quá nhiều bước thường đẹp trên lý thuyết nhưng dễ bị bỏ giữa chừng.",
  segments: [
    {
      title: "Câu hỏi gợi ý",
      content_summary: "Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?"
    },
    {
      title: "Thực tế thay vì tưởng tượng",
      content_summary: "Không phải dễ hơn trong tưởng tượng, mà là dễ hơn trong một ngày thật."
    },
    {
      title: "Ưu tiên 1: Sọt đồ bẩn đúng chỗ",
      content_summary: "Khi sọt đồ bẩn ở đúng nơi cởi đồ."
    },
    {
      title: "Ưu tiên 2: Móc treo gần chỗ phơi",
      content_summary: "Khi móc treo gần chỗ phơi."
    },
    {
      title: "Ưu tiên 3: Ngăn đồ sạch dễ cất",
      content_summary: "Khi ngăn đồ sạch dễ cất."
    },
    {
      title: "Chi tiết nhỏ",
      content_summary: "Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn."
    },
    {
      title: "Tần suất lặp lại",
      content_summary: "Nhưng chúng xuất hiện rất nhiều lần."
    },
    {
      title: "Mỗi bước thừa",
      content_summary: "Mỗi bước thừa đều làm khả năng trì hoãn tăng lên."
    },
    {
      title: "Thử nghiệm đưa về điểm hành động",
      content_summary: "Thử trong một tuần: đưa giỏ, móc hoặc nơi cất tới gần đúng điểm hành động xảy ra."
    },
    {
      title: "Nhìn lại sự nhẹ nhõm",
      content_summary: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa."
    },
    {
      title: "Statement insight",
      content_summary: "Đừng ép mình sống theo hệ thống đẹp. Hãy để hệ thống đi theo cách mình thật sự sống."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Cảnh kết luận yên, ít chi tiết, có khoảng thở kèm câu hỏi: Trong các bước giặt, phơi và gấp quần áo, bước nào bạn dễ để dồn lại nhất?"
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 76
};

const script = {
  script: [
    {
      text: "Một hệ thống có quá nhiều bước thường đẹp trên lý thuyết nhưng dễ bị bỏ giữa chừng.",
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
      text: "Khi sọt đồ bẩn ở đúng nơi cởi đồ.",
      type: "body"
    },
    {
      text: "Khi móc treo gần chỗ phơi.",
      type: "body"
    },
    {
      text: "Khi ngăn đồ sạch dễ cất.",
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
      text: "Mỗi bước thừa đều làm khả năng trì hoãn tăng lên.",
      type: "body"
    },
    {
      text: "Thử trong một tuần: đưa giỏ, móc hoặc nơi cất tới gần đúng điểm hành động xảy ra.",
      type: "body"
    },
    {
      text: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.",
      type: "body"
    },
    {
      text: "Đừng ép mình sống theo hệ thống đẹp. Hãy để hệ thống đi theo cách mình thật sự sống.",
      type: "body"
    },
    {
      text: "Trong các bước giặt, phơi và gấp quần áo, bước nào bạn dễ để dồn lại nhất?",
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
console.log('plan.json and script.json written successfully for phan-55');
