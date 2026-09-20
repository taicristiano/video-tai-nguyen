const fs = require('fs');
const timelinePath = 'public/phan-56-2026-09-17-mot-khoang-yen-khong-can-muc-dich/timeline.json';
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

// Fix spelling in words
timeline.words = timeline.words.map(w => {
  if (w.word === 'nghĩ' && w.start >= 1.2 && w.start <= 1.5) return { ...w, word: 'nghỉ' };
  if (w.word === 'yêu.') return { ...w, word: 'ưu.' };
  if (w.word === 'Nết') return { ...w, word: 'Nếp,' };
  return w;
});

const newSegments = [
  { start: 0, end: 2.84, text: 'Ta rất dễ biến cả nghỉ ngơi thành một việc phải tối ưu.' },
  { start: 3.66, end: 9.72, text: 'Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.' },
  { start: 10.78, end: 13.34, text: 'Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.' },
  { start: 14.44, end: 15.44, text: 'Ngồi cạnh cửa sổ.' },
  { start: 16.50, end: 16.96, text: 'Uống trà.' },
  { start: 18.04, end: 19.14, text: 'Nhìn mưa hoặc nhìn cây.' },
  { start: 20.22, end: 22.32, text: 'Không việc nào trong số đó nghe thật ấn tượng.' },
  { start: 23.16, end: 24.94, text: 'Và cũng không cần phải ấn tượng.' },
  { start: 25.76, end: 29.02, text: 'Không phải phút nào cũng cần học, phục hồi hay tạo giá trị.' },
  { start: 30.00, end: 35.54, text: 'Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: giữ lại một khoảng ngắn chỉ để ở đó, không biến nó thành nhiệm vụ.' },
  { start: 36.72, end: 38.26, text: 'Nếu nó không giúp, mình đổi.' },
  { start: 39.24, end: 40.88, text: 'Nếu nó giúp, mình giữ.' },
  { start: 41.84, end: 45.44, text: 'Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.' },
  { start: 46.50, end: 52.32, text: 'Đôi khi điều mình cần không phải một hoạt động tốt hơn. Chỉ là vài phút không phải trở thành phiên bản nào cả.' },
  { start: 53.44, end: 57.28, text: 'Lần gần nhất bạn cho phép mình ngồi yên vài phút mà không mở điện thoại là khi nào?' },
  { start: 58.34, end: 60.50, text: 'Nếp, sống tốt hơn từ những điều nhỏ.' }
];

timeline.segments = newSegments;
timeline.duration = 60.50;

fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
console.log('timeline.json cleaned successfully for phan-56');
