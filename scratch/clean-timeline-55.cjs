const fs = require('fs');
const timelinePath = 'public/phan-55-2026-09-17-he-thong-giat-do-tot-la-he-thong-minh-chiu-dung/timeline.json';
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

// Filter out hallucination words
timeline.words = timeline.words.filter(w => w.start < 57.20);

// Fix spelling
timeline.words = timeline.words.map(w => {
  if (w.word === 'sọc') return { ...w, word: 'sọt' };
  if (w.word === 'mất' && w.start >= 34.0 && w.start <= 35.5) return { ...w, word: 'móc' };
  if (w.word === 'Nết,') return { ...w, word: 'Nếp,' };
  return w;
});

const newSegments = [
  { start: 0, end: 4.40, text: 'Một hệ thống có quá nhiều bước thường đẹp trên lý thuyết nhưng dễ bị bỏ giữa chừng.' },
  { start: 5.40, end: 8.88, text: 'Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?' },
  { start: 9.94, end: 14.22, text: 'Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.' },
  { start: 14.90, end: 17.36, text: 'Khi sọt đồ bẩn ở đúng nơi cởi đồ.' },
  { start: 17.36, end: 20.20, text: 'Khi móc treo gần chỗ phơi.' },
  { start: 20.20, end: 21.96, text: 'Khi ngăn đồ sạch dễ cất.' },
  { start: 22.88, end: 25.68, text: 'Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.' },
  { start: 26.82, end: 28.24, text: 'Nhưng chúng xuất hiện rất nhiều lần.' },
  { start: 28.24, end: 31.78, text: 'Mỗi bước thừa đều làm khả năng trì hoãn tăng lên.' },
  { start: 31.78, end: 37.28, text: 'Thử trong một tuần: đưa giỏ, móc hoặc nơi cất tới gần đúng điểm hành động xảy ra.' },
  { start: 37.28, end: 42.74, text: 'Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.' },
  { start: 42.74, end: 48.72, text: 'Đừng ép mình sống theo hệ thống đẹp. Hãy để hệ thống đi theo cách mình thật sự sống.' },
  { start: 49.52, end: 54.02, text: 'Trong các bước giặt, phơi và gấp quần áo, bước nào bạn dễ để dồn lại nhất?' },
  { start: 55.04, end: 57.24, text: 'Nếp, sống tốt hơn từ những điều nhỏ.' }
];

timeline.segments = newSegments;
timeline.duration = 57.24;

fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
console.log('timeline.json cleaned successfully for phan-55');
