const fs = require('fs');
const timelinePath = 'public/phan-54-2026-09-17-hoc-xong-mot-khoa-truoc-khi-mo-khoa-moi/timeline.json';
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

timeline.words = timeline.words.map(w => {
  if (w.word === 'táp' || w.word === 'táp,') return { ...w, word: 'tab' };
  if (w.word === 'mấy' && w.start >= 55.4 && w.start <= 55.7) return { ...w, word: 'máy' };
  if (w.word === 'play-list') return { ...w, word: 'playlist' };
  if (w.word === 'Nết,') return { ...w, word: 'Nếp,' };
  return w;
});

timeline.words = timeline.words.filter(w => {
  if (w.word === 'ơ' && Math.abs(w.start - 23.22) < 0.2) return false;
  return true;
});

const newSegments = [
  { start: 0, end: 3.64, text: 'Internet khiến việc bắt đầu học rất dễ và việc hoàn thành lại rất khó.' },
  { start: 4.72, end: 7.34, text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì.' },
  { start: 8.40, end: 12.18, text: 'Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.' },
  { start: 13.22, end: 14.78, text: 'Có thể chỉ là một tab khóa học.' },
  { start: 15.74, end: 17.10, text: 'Hoặc một playlist tutorial.' },
  { start: 18.20, end: 20.04, text: 'Hoặc đơn giản là một cuốn sách chuyên môn.' },
  { start: 21.12, end: 23.84, text: 'Những việc này nhỏ tới mức không tạo cảm giác "lột xác".' },
  { start: 24.76, end: 28.46, text: 'Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.' },
  { start: 28.46, end: 34.12, text: 'Nhiều tài nguyên chưa hoàn thành tạo cảm giác mình đang học, nhưng làm sự chú ý bị chia nhỏ.' },
  { start: 34.12, end: 39.46, text: 'Nếu muốn thử, đặt quy tắc: chỉ một khóa chính đang hoạt động tại một thời điểm.' },
  { start: 39.46, end: 42.06, text: 'Đừng đánh giá nó sau một lần.' },
  { start: 42.06, end: 46.34, text: 'Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.' },
  { start: 46.34, end: 53.84, text: 'Kiến thức tích lũy không đến từ số thứ mình đã mở. Nó đến từ số lần mình đi đủ sâu để hoàn thành một vòng.' },
  { start: 53.84, end: 59.60, text: 'Hiện tại trong máy bạn đang có bao nhiêu khóa học hay playlist tutorial mở dở mà chưa xem xong?' },
  { start: 60.78, end: 62.92, text: 'Nếp, sống tốt hơn từ những điều nhỏ.' }
];

timeline.segments = newSegments;

fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
console.log('timeline.json cleaned successfully for phan-54');
