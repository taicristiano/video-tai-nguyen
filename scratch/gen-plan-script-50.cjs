const fs = require('fs');
const path = require('path');

const slug = 'phan-50-2026-09-17-cuoc-hop-tot-bat-dau-tu-cau-hoi-ro';
const videoDir = path.join('videos', slug);
const scriptDir = path.join(videoDir, 'script');

const plan = {
  title: "Cuộc Họp Tốt Bắt Đầu Từ Một Câu Hỏi Rõ",
  hook: "Nhiều cuộc họp dài vì mọi người cùng bước vào nhưng không biết cần rời đi với điều gì.",
  segments: [
    {
      title: "Góc nhìn một ngày ngắn hạn",
      content_summary: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể."
    },
    {
      title: "Ưu tiên 1: Cần quyết định gì",
      content_summary: "Xác định rõ quyết định then chốt cần được đưa ra trong cuộc họp."
    },
    {
      title: "Ưu tiên 2: Cần cập nhật gì",
      content_summary: "Làm rõ thông tin cốt lõi cần được đồng bộ và cập nhật cho các bên."
    },
    {
      title: "Ưu tiên 3: Ai chịu trách nhiệm bước tiếp theo",
      content_summary: "Phân công rõ ràng người phụ trách các hành động tiếp nối sau cuộc họp."
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
      title: "Định hướng từ agenda ngắn",
      content_summary: "Một nội dung tóm gọn giúp cuộc thảo luận có hướng đi rõ ràng."
    },
    {
      title: "Đổi câu hỏi dẫn dắt",
      content_summary: "Thay vì hỏi việc này có thay đổi nhiều không, hãy hỏi mình có làm được khi ngày mai bận hơn không."
    },
    {
      title: "Hành động chuẩn bị trước cuộc họp",
      content_summary: "Viết một câu: cuộc họp này kết thúc tốt khi điều gì đã rõ?"
    },
    {
      title: "Statement insight",
      content_summary: "Một giờ họp có thể được tiết kiệm từ một phút chuẩn bị đúng câu hỏi."
    },
    {
      title: "Thay đổi đủ nhẹ để tồn tại",
      content_summary: "Thay đổi phải đủ nhẹ để duy trì trong một ngày bình thường thay vì chỉ khi có động lực."
    },
    {
      title: "Cảnh yên tĩnh & Câu hỏi tương tác",
      content_summary: "Khoảnh khắc bình yên bên góc bàn làm việc cùng câu hỏi mở về thói quen chuẩn bị trước cuộc họp."
    }
  ],
  ending: "NẾP. — Sống tốt hơn từ những điều nhỏ.",
  estimated_duration: 78
};

const script = {
  script: [
    {
      text: "Nhiều cuộc họp dài vì mọi người cùng bước vào nhưng không biết cần rời đi với điều gì.",
      type: "hook"
    },
    {
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.",
      type: "body"
    },
    {
      text: "Cần quyết định gì.",
      type: "body"
    },
    {
      text: "Cần cập nhật gì.",
      type: "body"
    },
    {
      text: "Ai chịu trách nhiệm bước tiếp theo.",
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
      text: "Một agenda ngắn làm cuộc nói chuyện có hướng.",
      type: "body"
    },
    {
      text: "Vì vậy thay vì hỏi việc này có thay đổi được nhiều không, thử hỏi: mình có thể tiếp tục làm nó khi ngày mai bận hơn không?",
      type: "body"
    },
    {
      text: "Trước cuộc họp, viết một câu: cuộc họp này kết thúc tốt khi điều gì đã rõ?",
      type: "body"
    },
    {
      text: "Một giờ họp có thể được tiết kiệm từ một phút chuẩn bị đúng câu hỏi.",
      type: "body"
    },
    {
      text: "Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực.",
      type: "body"
    },
    {
      text: "Trước khi bắt đầu họp, bạn thường chuẩn bị câu hỏi trước hay bước vào rồi mới tính?",
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
console.log('Step 2 & 3 complete for phan-50');
