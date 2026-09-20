const fs = require('fs');
const path = require('path');

const slug = 'phan-16-2026-09-17-dung-lap-kin-moi-khoang-trong-trong-lich';
const outDir = path.join(__dirname, '..', 'videos', slug);
const scriptDir = path.join(outDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'template.txt'), 'human-insight/cinematic-light', 'utf8');
fs.writeFileSync(path.join(outDir, 'audio.txt'), 'full', 'utf8');

const contextLines = [
  'Video dọc 9:16.',
  'Thời lượng mục tiêu: 70–85 giây.',
  'Sweet spot: 75–80 giây.',
  'Phần: 16',
  '',
  'Brand: NẾP.',
  'Slogan: Sống tốt hơn từ những điều nhỏ.',
  '',
  'Tiêu đề:',
  'Đừng lấp kín mọi khoảng trống trong lịch',
  '',
  'Kịch bản voice:',
  'Một lịch kín có thể cho cảm giác mình đang kiểm soát tốt thời gian.',
  '',
  'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.',
  '',
  'Có thể chỉ là cuộc hẹn nối nhau.',
  '',
  'Hoặc cuối tuần không có khoảng nghỉ.',
  '',
  'Hoặc đơn giản là việc nhỏ chen vào mọi khe trống.',
  '',
  'Những việc này nhỏ tới mức không tạo cảm giác lột xác.',
  '',
  'Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.',
  '',
  'Nhưng khi không còn buffer, một việc trễ nhỏ cũng đủ làm cả ngày căng lên.',
  '',
  'Nếu muốn thử, giữ lại ít nhất một khoảng trống không gắn nhiệm vụ trong ngày bận.',
  '',
  'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.',
  '',
  'Khoảng trống không phải thời gian bị bỏ phí. Nó là nơi lịch sống có thể co giãn.',
  '',
  'Visual direction:',
  'Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.',
  '',
  'Ưu tiên visual:',
  '- cuộc hẹn nối nhau.',
  '- cuối tuần không có khoảng nghỉ.',
  '- việc nhỏ chen vào mọi khe trống.',
  '- một cảnh kết luận yên, ít chi tiết, có khoảng thở.'
];
fs.writeFileSync(path.join(outDir, 'context.txt'), contextLines.join('\n'), 'utf8');

const plan = {
  title: 'Đừng lấp kín mọi khoảng trống trong lịch',
  hook: 'Một lịch kín có thể cho cảm giác mình đang kiểm soát tốt thời gian.',
  segments: [
    {
      title: 'Năng lượng và giải pháp',
      content_summary: 'Vấn đề thường không nằm ở chỗ không biết làm gì, mà giải pháp trong đầu thường lớn hơn năng lượng trong một ngày bình thường.'
    },
    {
      title: 'Lịch trình quá tải',
      content_summary: 'Cuộc hẹn nối nhau, cuối tuần không khoảng nghỉ, việc nhỏ chen vào mọi khe trống.'
    },
    {
      title: 'Lợi thế của việc nhỏ',
      content_summary: 'Nhỏ không tạo cảm giác lột xác nhưng có lợi thế quay lại vào ngày mai.'
    },
    {
      title: 'Thiếu buffer tạo căng thẳng',
      content_summary: 'Khi không còn buffer, một việc trễ nhỏ cũng đủ làm cả ngày căng lên. Giữ lại một khoảng trống không gắn nhiệm vụ trong ngày bận.'
    },
    {
      title: 'Quan sát thao tác',
      content_summary: 'Đừng đánh giá sau một lần, hãy nhìn xem nó thay đổi thao tác lặp lại sau vài ngày.'
    },
    {
      title: 'Thông điệp cốt lõi',
      content_summary: 'Khoảng trống không phải thời gian bị bỏ phí. Nó là nơi lịch sống có thể co giãn.'
    }
  ],
  ending: 'Nếp, sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 75
};
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');

const script = {
  script: [
    {
      text: 'Một lịch kín có thể cho cảm giác mình đang kiểm soát tốt thời gian.',
      type: 'hook'
    },
    {
      text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.',
      type: 'body'
    },
    {
      text: 'Có thể chỉ là cuộc hẹn nối nhau. Hoặc cuối tuần không có khoảng nghỉ. Hoặc đơn giản là việc nhỏ chen vào mọi khe trống.',
      type: 'body'
    },
    {
      text: 'Những việc này nhỏ tới mức không tạo cảm giác lột xác. Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.',
      type: 'body'
    },
    {
      text: 'Nhưng khi không còn buffer, một việc trễ nhỏ cũng đủ làm cả ngày căng lên. Nếu muốn thử, giữ lại ít nhất một khoảng trống không gắn nhiệm vụ trong ngày bận.',
      type: 'body'
    },
    {
      text: 'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.',
      type: 'body'
    },
    {
      text: 'Khoảng trống không phải thời gian bị bỏ phí. Nó là nơi lịch sống có thể co giãn.',
      type: 'body'
    },
    {
      text: 'Nếp, sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};
fs.writeFileSync(path.join(scriptDir, 'script.json'), JSON.stringify(script, null, 2), 'utf8');

const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 1505,
  video: {
    title: 'Đừng Lấp Kín Mọi Khoảng Trống Trong Lịch',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 125,
      audioSegment: {
        start: 0.0,
        end: 3.64,
        text: 'Một lịch kín có thể cho cảm giác mình đang kiểm soát tốt thời gian.'
      },
      image: {
        assetId: 'ta-hay-giai-quyet-van-04defcdb',
        path: 'assets/human-insight/images/ta-hay-giai-quyet-van-04defcdb.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.2,
        reason: 'Opening hook entrance'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 125,
      durationFrames: 95,
      audioSegment: {
        start: 4.32,
        end: 7.04,
        text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì.'
      },
      image: {
        assetId: 'van-thuong-nam-minh-biet-80f443c7-3',
        path: 'assets/human-insight/images/van-thuong-nam-minh-biet-80f443c7-3.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Awareness of problem'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 220,
      durationFrames: 150,
      audioSegment: {
        start: 7.62,
        end: 11.74,
        text: 'Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.'
      },
      image: {
        assetId: 'van-giai-phap-trong-dau-c8f6104c-3',
        path: 'assets/human-insight/images/van-giai-phap-trong-dau-c8f6104c-3.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Big solution vs energy'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 370,
      durationFrames: 60,
      audioSegment: {
        start: 12.32,
        end: 14.20,
        text: 'Có thể chỉ là cuộc hẹn nối nhau,'
      },
      image: {
        assetId: 'formal-meeting-01',
        path: 'assets/human-insight/images/formal-meeting-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Back-to-back appointments'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 430,
      durationFrames: 65,
      audioSegment: {
        start: 14.20,
        end: 16.28,
        text: 'hoặc cuối tuần không có khoảng nghỉ,'
      },
      image: {
        assetId: '099_exhausted_after_long_day',
        path: 'assets/human-insight/images/099_exhausted_after_long_day.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Weekend without rest'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 495,
      durationFrames: 85,
      audioSegment: {
        start: 16.36,
        end: 18.90,
        text: 'hoặc đơn giản là việc nhỏ chen vào mọi khe chống.'
      },
      image: {
        assetId: 'overwhelmed_by_notifications',
        path: 'assets/human-insight/images/overwhelmed_by_notifications.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Small tasks crowding every gap'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 580,
      durationFrames: 95,
      audioSegment: {
        start: 19.48,
        end: 22.10,
        text: 'Những việc này nhỏ tới mức không tạo cảm giác lột xác,'
      },
      image: {
        assetId: 'viec-nay-nho-muc-tao-f316a100',
        path: 'assets/human-insight/images/viec-nay-nho-muc-tao-f316a100.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Small changes not dramatic'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 675,
      durationFrames: 110,
      audioSegment: {
        start: 22.56,
        end: 26.02,
        text: 'nhưng chúng có một lợi thế, mình có thể quay lại với chúng vào ngày mai.'
      },
      image: {
        assetId: 'chung-loi-minh-quay-lai-a4ea8f47',
        path: 'assets/human-insight/images/chung-loi-minh-quay-lai-a4ea8f47.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Can return tomorrow'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 785,
      durationFrames: 150,
      audioSegment: {
        start: 26.02,
        end: 30.52,
        text: 'Nhưng khi không còn buffer, một việc trễ nhỏ cũng đủ làm cả ngày căng lên'
      },
      image: {
        assetId: 'time-pressure-01',
        path: 'assets/human-insight/images/time-pressure-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Lack of buffer pressure'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 935,
      durationFrames: 120,
      audioSegment: {
        start: 31.08,
        end: 34.76,
        text: 'Nếu muốn thử, giữ lại ít nhất một khoảng trống không gắn nhiệm vụ trong ngày bận'
      },
      image: {
        assetId: '076_meditation',
        path: 'assets/human-insight/images/076_meditation.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Keeping intentional empty space'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1055,
      durationFrames: 160,
      audioSegment: {
        start: 35.18,
        end: 40.16,
        text: 'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày'
      },
      image: {
        assetId: 'dung-danh-gia-no-sau-32ce156e',
        path: 'assets/human-insight/images/dung-danh-gia-no-sau-32ce156e.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Observe repeated action over time'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1215,
      durationFrames: 135,
      audioSegment: {
        start: 40.70,
        end: 44.88,
        text: 'Khoảng trống không phải thời gian bị bỏ phí. Nó là nơi lịch sống có thể co giãn'
      },
      insightText: 'KHOẢNG TRỐNG KHÔNG PHẢI\nTHỜI GIAN BỊ BỎ PHÍ\nNƠI LỊCH SỐNG CO GIÃN',
      entrySfx: {
        name: 'whoosh',
        volume: 0.22,
        reason: 'Core statement card'
      }
    },
    {
      type: 'ending',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 1350,
      durationFrames: 90,
      audioSegment: {
        start: 44.82,
        end: 47.74,
        text: 'Nếp, sống tốt hơn từ những điều nhỏ'
      },
      image: {
        assetId: 'nep-dieu-nho-tao-nen-507d09a0-2',
        path: 'assets/human-insight/images/nep-dieu-nho-tao-nen-507d09a0-2.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Peaceful conclusion'
      }
    },
    {
      type: 'ending',
      layout: 'standard',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1440,
      durationFrames: 65,
      isOutro: true
    }
  ]
};

fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');

console.log('Successfully generated setup, plan, script, and spec for phan-16!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
