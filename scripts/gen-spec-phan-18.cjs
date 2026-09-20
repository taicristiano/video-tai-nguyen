const fs = require('fs');
const path = require('path');

const slug = 'phan-18-2026-09-17-hai-muoi-lam-phut-tap-trung-van-la';
const outDir = path.join(__dirname, '..', 'videos', slug);
const scriptDir = path.join(outDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'template.txt'), 'human-insight/cinematic-light', 'utf8');
fs.writeFileSync(path.join(outDir, 'audio.txt'), 'full', 'utf8');

const contextLines = [
  'Video dọc 9:16.',
  'Thời lượng mục tiêu: 70–85 giây.',
  'Sweet spot: 75–80 giây.',
  'Phần: 18',
  '',
  'Brand: NẾP.',
  'Slogan: Sống tốt hơn từ những điều nhỏ.',
  '',
  'Tiêu đề:',
  'Hai mươi lăm phút tập trung vẫn là một buổi học thật',
  '',
  'Kịch bản voice:',
  'Ta dễ trì hoãn vì nghĩ phải có cả buổi trống mới đáng bắt đầu.',
  '',
  'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.',
  '',
  'Có thể chỉ là 25 phút đọc.',
  '',
  'Hoặc 25 phút code.',
  '',
  'Hoặc đơn giản là 25 phút luyện một kỹ năng.',
  '',
  'Những việc này nhỏ tới mức không tạo cảm giác "lột xác".',
  '',
  'Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.',
  '',
  'Một block ngắn nhưng tập trung có thể đủ để tạo tiến triển rõ.',
  '',
  'Nếu muốn thử, khi thời gian ít, đặt timer 25 phút và chỉ làm một việc.',
  '',
  'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.',
  '',
  'Không phải lúc nào mình cũng cần nhiều thời gian hơn. Đôi khi chỉ cần một khoảng thời gian có ranh giới.',
  '',
  'Visual direction:',
  'Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.',
  '',
  'Ưu tiên visual:',
  '- 25 phút đọc.',
  '- 25 phút code.',
  '- 25 phút luyện một kỹ năng.',
  '- một cảnh kết luận yên, ít chi tiết, có khoảng thở.'
];
fs.writeFileSync(path.join(outDir, 'context.txt'), contextLines.join('\n'), 'utf8');

const plan = {
  title: 'Hai mươi lăm phút tập trung vẫn là một buổi học thật',
  hook: 'Ta dễ trì hoãn vì nghĩ phải có cả buổi trống mới đáng bắt đầu.',
  segments: [
    {
      title: 'Rào cản tâm lý',
      content_summary: 'Nghĩ rằng phải có cả buổi trống mới đáng bắt đầu, trong khi năng lượng thường nhỏ hơn giải pháp lý tưởng.'
    },
    {
      title: 'Ba block 25 phút',
      content_summary: '25 phút đọc, 25 phút code, hoặc 25 phút luyện một kỹ năng.'
    },
    {
      title: 'Lợi thế quay lại',
      content_summary: 'Nhỏ không tạo cảm giác lột xác nhưng có lợi thế quay lại vào ngày mai.'
    },
    {
      title: 'Tiến triển từ block ngắn',
      content_summary: 'Một block ngắn nhưng tập trung đủ để tạo tiến triển rõ.'
    },
    {
      title: 'Thực hành đặt timer',
      content_summary: 'Đặt timer 25 phút chỉ làm một việc và quan sát sự thay đổi sau vài ngày.'
    },
    {
      title: 'Thông điệp cốt lõi',
      content_summary: 'Không phải lúc nào cũng cần nhiều thời gian hơn, đôi khi chỉ cần một khoảng thời gian có ranh giới.'
    }
  ],
  ending: 'Nếp, sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 55
};
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');

const script = {
  script: [
    {
      text: 'Ta dễ trì hoãn vì nghĩ phải có cả buổi trống mới đáng bắt đầu.',
      type: 'hook'
    },
    {
      text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.',
      type: 'body'
    },
    {
      text: 'Có thể chỉ là 25 phút đọc. Hoặc 25 phút code. Hoặc đơn giản là 25 phút luyện một kỹ năng.',
      type: 'body'
    },
    {
      text: 'Những việc này nhỏ tới mức không tạo cảm giác lột xác. Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.',
      type: 'body'
    },
    {
      text: 'Một block ngắn nhưng tập trung có thể đủ để tạo tiến triển rõ.',
      type: 'body'
    },
    {
      text: 'Nếu muốn thử, khi thời gian ít, đặt timer 25 phút và chỉ làm một việc.',
      type: 'body'
    },
    {
      text: 'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.',
      type: 'body'
    },
    {
      text: 'Không phải lúc nào mình cũng cần nhiều thời gian hơn. Đôi khi chỉ cần một khoảng thời gian có ranh giới.',
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
  totalFrames: 1660,
  video: {
    title: 'Hai Mươi Lăm Phút Tập Trung Vẫn Là Một Buổi Học Thật',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 130,
      audioSegment: {
        start: 0.0,
        end: 3.76,
        text: 'Ta dễ trì hoãn vì nghĩ phải có cả buổi trống mới đáng bắt đầu.'
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
      startFrame: 130,
      durationFrames: 95,
      audioSegment: {
        start: 4.58,
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
      startFrame: 225,
      durationFrames: 150,
      audioSegment: {
        start: 7.88,
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
        reason: 'Big solution vs daily energy'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 375,
      durationFrames: 65,
      audioSegment: {
        start: 12.58,
        end: 14.32,
        text: 'Có thể chỉ là 25 phút đọc,'
      },
      image: {
        assetId: 'quiet-reading-home-01',
        path: 'assets/human-insight/images/quiet-reading-home-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Option 1: 25 min reading'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 440,
      durationFrames: 65,
      audioSegment: {
        start: 14.32,
        end: 16.44,
        text: 'hoặc 25 phút code,'
      },
      image: {
        assetId: 'code-debugging-01',
        path: 'assets/human-insight/images/code-debugging-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Option 2: 25 min coding'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 505,
      durationFrames: 75,
      audioSegment: {
        start: 16.44,
        end: 18.92,
        text: 'hoặc đơn giản là 25 phút luyện một kỹ năng.'
      },
      image: {
        assetId: 'learning-language-01',
        path: 'assets/human-insight/images/learning-language-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Option 3: 25 min practicing skill'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 580,
      durationFrames: 100,
      audioSegment: {
        start: 19.68,
        end: 22.40,
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
        reason: 'Small actions feel ordinary'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 680,
      durationFrames: 110,
      audioSegment: {
        start: 23.16,
        end: 26.44,
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
        reason: 'Easier to repeat'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 790,
      durationFrames: 140,
      audioSegment: {
        start: 26.44,
        end: 30.80,
        text: 'Một block ngắn nhưng tập trung có thể đủ để tạo tiến triển rõ'
      },
      image: {
        assetId: 'small-habit-progress-01',
        path: 'assets/human-insight/images/small-habit-progress-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Visible progress from short blocks'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 930,
      durationFrames: 175,
      audioSegment: {
        start: 30.80,
        end: 36.62,
        text: 'Nếu muốn thử, khi thời gian ít, đặt timer 25 phút và chỉ làm một việc'
      },
      image: {
        assetId: '078_journaling_at_desk',
        path: 'assets/human-insight/images/078_journaling_at_desk.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Actionable practice: 25m timer'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1105,
      durationFrames: 185,
      audioSegment: {
        start: 36.62,
        end: 42.60,
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
        name: 'whoosh',
        volume: 0.18,
        reason: 'Observe gently over days'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1290,
      durationFrames: 185,
      audioSegment: {
        start: 43.66,
        end: 48.68,
        text: 'Không phải lúc nào mình cũng cần nhiều thời gian hơn. Đôi khi chỉ cần một khoảng thời gian có ranh giới'
      },
      insightText: 'KHÔNG PHẢI LÚC NÀO\nMÌNH CŨNG CẦN\nNHIỀU THỜI GIAN HƠN\n\nĐÔI KHI CHỈ CẦN\nMỘT KHOẢNG THỜI GIAN\nCÓ RANH GIỚI',
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
      startFrame: 1475,
      durationFrames: 120,
      audioSegment: {
        start: 48.68,
        end: 52.58,
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
      startFrame: 1595,
      durationFrames: 65,
      isOutro: true
    }
  ]
};

fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');

console.log('Successfully generated setup, plan, script, and spec for phan-18!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
