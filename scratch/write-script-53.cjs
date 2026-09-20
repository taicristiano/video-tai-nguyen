const fs = require('fs');
const script = {
  script: [
    {
      text: "Một câu nói trong vài giây có thể ở lại lâu hơn cảm xúc tạo ra nó.",
      type: "hook"
    },
    {
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể.",
      type: "body"
    },
    {
      text: "Tin nhắn gây khó chịu.",
      type: "body"
    },
    {
      text: "Cuộc tranh luận.",
      type: "body"
    },
    {
      text: "Một lời góp ý.",
      type: "body"
    },
    {
      text: "Mọi thứ vẫn gần như y nguyên sau đó.",
      type: "body"
    },
    {
      text: "Nhưng đời sống không được tạo bởi một ngày duy nhất.",
      type: "body"
    },
    {
      text: "Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần.",
      type: "body"
    },
    {
      text: "Khoảng dừng giúp mình tách điều cần nói khỏi cách mình đang cảm thấy.",
      type: "body"
    },
    {
      text: "Vì vậy thay vì hỏi \"việc này có thay đổi được nhiều không?\", thử hỏi: \"mình có thể tiếp tục làm nó khi ngày mai bận hơn không?\"",
      type: "body"
    },
    {
      text: "Nếu câu trả lời bắt đầu sắc hơn mức bạn muốn, dừng và quay lại sau.",
      type: "body"
    },
    {
      text: "Không phải mọi im lặng ngắn đều là tránh né. Có lúc nó là cách bảo vệ cuộc trò chuyện khỏi phiên bản tệ nhất của mình.",
      type: "body"
    },
    {
      text: "Khi nhận một tin nhắn khiến mình bực, bạn thường phản hồi ngay hay để đó rồi tính?",
      type: "body"
    },
    {
      text: "Nếp, sống tốt hơn từ những điều nhỏ.",
      type: "ending"
    }
  ]
};
fs.writeFileSync('videos/phan-53-2026-09-17-khi-dang-buc-tra-loi-sau-tot-hon/script/script.json', JSON.stringify(script, null, 2), 'utf8');
console.log('script.json written successfully');
