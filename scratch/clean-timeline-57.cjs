const fs = require('fs');
const timelinePath = 'public/phan-57-2026-09-17-muoi-phut-buffer-co-the-cuu-ca-mot-hanh-trinh/timeline.json';
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

// Fix spelling in words
timeline.words = timeline.words.map(w => {
  if (w.word === 'căng' && w.start >= 61.8 && w.start <= 62.4) return { ...w, word: 'căn' };
  if (w.word === 'Nếp') return { ...w, word: 'Nếp,' };
  return w;
});

const newSegments = [
  { start: 0, end: 5.80, text: 'Lịch di chuyển quá sát khiến một đèn đỏ, một thang máy chậm hay một đoạn kẹt xe cũng đủ làm mọi thứ căng lên.' },
  { start: 6.90, end: 12.70, text: 'Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm.' },
  { start: 13.74, end: 16.30, text: 'Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều.' },
  { start: 17.36, end: 18.60, text: 'Ra khỏi nhà sớm hơn.' },
  { start: 19.66, end: 20.72, text: 'Đến ga trước một chút.' },
  { start: 21.74, end: 23.32, text: 'Không xếp cuộc hẹn nối sát nhau.' },
  { start: 24.38, end: 26.48, text: 'Không việc nào trong số đó nghe thật ấn tượng.' },
  { start: 27.26, end: 29.12, text: 'Và cũng không cần phải ấn tượng.' },
  { start: 30.00, end: 35.90, text: 'Buffer không làm mình mất thời gian. Nó mua lại sự bình tĩnh khi đời sống không chạy đúng kế hoạch.' },
  { start: 36.86, end: 43.52, text: 'Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: với việc quan trọng, thử thêm mười đến mười lăm phút dự phòng thay vì tính đúng thời gian lý tưởng.' },
  { start: 44.76, end: 46.30, text: 'Nếu nó không giúp, mình đổi.' },
  { start: 47.28, end: 48.92, text: 'Nếu nó giúp, mình giữ.' },
  { start: 49.88, end: 53.48, text: 'Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ.' },
  { start: 54.52, end: 58.46, text: 'Khoảng đệm nhỏ đôi khi là thứ giữ cả hành trình không biến thành một cuộc chạy.' },
  { start: 59.02, end: 63.12, text: 'Khi có một cuộc hẹn quan trọng, bạn thường đến trước mười phút hay căn sát giờ mới đi?' },
  { start: 64.20, end: 66.40, text: 'Nếp, sống tốt hơn từ những điều nhỏ.' }
];

timeline.segments = newSegments;
timeline.duration = 66.40;

fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
console.log('timeline.json cleaned successfully for phan-57');
