const fs = require('fs');
const path = require('path');

const slug = 'phan-19-2026-09-17-ba-viec-cho-ngay-mai-du-hon-mot';
const outDir = path.join(__dirname, '..', 'videos', slug);
const scriptDir = path.join(outDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'template.txt'), 'human-insight/cinematic-light', 'utf8');
fs.writeFileSync(path.join(outDir, 'audio.txt'), 'full', 'utf8');

const contextLines = [
  'Video dọc 9:16.',
  'Thời lượng mục tiêu: 70–85 giây.',
  'Sweet spot: 75–80 giây.',
  'Phần: 19',
  '',
  'Brand: NẾP.',
  'Slogan: Sống tốt hơn từ những điều nhỏ.',
  '',
  'Tiêu đề:',
  'Ba việc cho ngày mai đủ hơn một danh sách hai mươi việc',
  '',
  'Kịch bản voice:',
  'Danh sách càng dài càng dễ tạo cảm giác tất cả đều quan trọng.',
  '',
  'Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?',
  '',
  'Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật.',
  '',
  'Khi một việc bắt buộc.',
  'Khi một việc tiến dự án.',
  'Khi một việc nhỏ để khép vòng.',
  '',
  'Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn.',
  '',
  'Nhưng chúng xuất hiện rất nhiều lần.',
  '',
  'Ba ưu tiên rõ giúp ngày hôm sau có điểm bắt đầu.',
  '',
  'Thử trong một tuần: trước khi kết thúc hôm nay, chọn ba việc quan trọng nhất cho ngày mai.',
  '',
  'Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.',
  '',
  'Một danh sách tốt không cần dài. Nó cần giúp mình biết phải bắt đầu ở đâu.',
  '',
  'Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực.',
  '',
  'Visual direction:',
  'Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.',
  '',
  'Ưu tiên visual:',
  '- một việc bắt buộc.',
  '- một việc tiến dự án.',
  '- một việc nhỏ để khép vòng.',
  '- một cảnh kết luận yên, ít chi tiết, có khoảng thở.'
];
fs.writeFileSync(path.join(outDir, 'context.txt'), contextLines.join('\n'), 'utf8');

const plan = {
  title: 'Ba việc cho ngày mai đủ hơn một danh sách hai mươi việc',
  hook: 'Danh sách càng dài càng dễ tạo cảm giác tất cả đều quan trọng.',
  segments: [
    {
      title: 'Câu hỏi định hướng',
      content_summary: 'Điều này có làm ngày mai dễ hơn một chút không, trong một ngày thật chứ không phải tưởng tượng.'
    },
    {
      title: 'Ba nhóm việc',
      content_summary: 'Một việc bắt buộc, một việc tiến dự án, một việc nhỏ để khép vòng.'
    },
    {
      title: 'Chi tiết lặp lại',
      content_summary: 'Hiếm khi là thay đổi lớn nhưng xuất hiện rất nhiều lần, tạo điểm bắt đầu cho hôm sau.'
    },
    {
      title: 'Thử thách một tuần',
      content_summary: 'Trước khi kết thúc hôm nay, chọn 3 việc cho ngày mai và quan sát sự giảm bớt căng thẳng.'
    },
    {
      title: 'Thông điệp cốt lõi',
      content_summary: 'Một danh sách tốt không cần dài, cần giúp mình biết bắt đầu ở đâu và đủ nhẹ để tồn tại trong ngày bình thường.'
    }
  ],
  ending: 'Nếp, sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 55
};
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');

const script = {
  script: [
    {
      text: 'Danh sách càng dài càng dễ tạo cảm giác tất cả đều quan trọng.',
      type: 'hook'
    },
    {
      text: 'Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không? Không phải dễ hơn trong tưởng tượng, mà dễ hơn trong một ngày thật.',
      type: 'body'
    },
    {
      text: 'Khi một việc bắt buộc. Khi một việc tiến dự án. Khi một việc nhỏ để khép vòng.',
      type: 'body'
    },
    {
      text: 'Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn, nhưng chúng xuất hiện rất nhiều lần.',
      type: 'body'
    },
    {
      text: 'Ba ưu tiên rõ giúp ngày hôm sau có điểm bắt đầu.',
      type: 'body'
    },
    {
      text: 'Thử trong một tuần: trước khi kết thúc hôm nay, chọn ba việc quan trọng nhất cho ngày mai.',
      type: 'body'
    },
    {
      text: 'Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.',
      type: 'body'
    },
    {
      text: 'Một danh sách tốt không cần dài. Nó cần giúp mình biết phải bắt đầu ở đâu.',
      type: 'body'
    },
    {
      text: 'Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực.',
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
    title: 'Ba Việc Cho Ngày Mai Đủ Hơn Một Danh Sách Hai Mươi Việc',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 140,
      audioSegment: {
        start: 0.0,
        end: 4.28,
        text: 'Danh sách càng dài, càng dễ tạo cảm giác, tất cả đều quan trọng.'
      },
      image: {
        assetId: '118_planning_schedule',
        path: 'assets/human-insight/images/118_planning_schedule.png',
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
      startFrame: 140,
      durationFrames: 135,
      audioSegment: {
        start: 4.28,
        end: 8.78,
        text: 'Có một câu hỏi khá hữu ích: Điều này có làm ngày mai dễ hơn một chút không?'
      },
      image: {
        assetId: 'cau-hoi-kha-huu-ich-fb55382b',
        path: 'assets/human-insight/images/cau-hoi-kha-huu-ich-fb55382b.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Guiding question'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 275,
      durationFrames: 120,
      audioSegment: {
        start: 8.78,
        end: 12.64,
        text: 'Không phải dễ hơn trong tưởng tượng, mà dễ hơn trong một ngày thật.'
      },
      image: {
        assetId: 'phai-hon-trong-tuong-tuong-c20cf72b',
        path: 'assets/human-insight/images/phai-hon-trong-tuong-tuong-c20cf72b.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Reality vs imagination'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 395,
      durationFrames: 70,
      audioSegment: {
        start: 12.64,
        end: 14.86,
        text: 'Khi một việc bắt buộc,'
      },
      image: {
        assetId: 'deadline-night-office-01',
        path: 'assets/human-insight/images/deadline-night-office-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Task 1: mandatory work'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 465,
      durationFrames: 60,
      audioSegment: {
        start: 14.86,
        end: 16.40,
        text: 'khi một việc tiến dự án,'
      },
      image: {
        assetId: '089_side_project_after_work',
        path: 'assets/human-insight/images/089_side_project_after_work.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Task 2: moving project forward'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 525,
      durationFrames: 70,
      audioSegment: {
        start: 16.40,
        end: 18.44,
        text: 'khi một việc nhỏ để khép vòng.'
      },
      image: {
        assetId: '192_clearing_desk_end_of_day',
        path: 'assets/human-insight/images/192_clearing_desk_end_of_day.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Task 3: small task closing the loop'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 595,
      durationFrames: 135,
      audioSegment: {
        start: 18.44,
        end: 23.84,
        text: 'Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn, nhưng chúng xuất hiện rất nhiều lần.'
      },
      image: {
        assetId: 'chi-tiet-nhu-vay-hiem-c8be6033',
        path: 'assets/human-insight/images/chi-tiet-nhu-vay-hiem-c8be6033.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Frequent small details'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 730,
      durationFrames: 100,
      audioSegment: {
        start: 24.54,
        end: 27.12,
        text: 'Ba ưu tiên rõ giúp ngày hôm sau có điểm bắt đầu.'
      },
      image: {
        assetId: '150_take_first_step',
        path: 'assets/human-insight/images/150_take_first_step.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Clear starting point'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 830,
      durationFrames: 150,
      audioSegment: {
        start: 27.68,
        end: 32.10,
        text: 'Thử trong một tuần: trước khi kết thúc hôm nay, chọn ba việc quan trọng nhất cho ngày mai.'
      },
      image: {
        assetId: '078_journaling_at_desk',
        path: 'assets/human-insight/images/078_journaling_at_desk.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Choosing 3 priorities before day ends'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 980,
      durationFrames: 165,
      audioSegment: {
        start: 32.70,
        end: 37.58,
        text: 'Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa.'
      },
      image: {
        assetId: 'nhin-lai-xem-minh-da-55c3d6e8',
        path: 'assets/human-insight/images/nhin-lai-xem-minh-da-55c3d6e8.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Look back at reduced friction'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1145,
      durationFrames: 140,
      audioSegment: {
        start: 38.38,
        end: 42.24,
        text: 'Một danh sách tốt không cần dài. Nó cần giúp mình biết phải bắt đầu ở đâu.'
      },
      insightText: 'MỘT DANH SÁCH TỐT\nKHÔNG CẦN DÀI\n\nNÓ CẦN GIÚP MÌNH BIẾT\nPHẢI BẮT ĐẦU Ở ĐÂU',
      entrySfx: {
        name: 'whoosh',
        volume: 0.22,
        reason: 'Core statement card'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1285,
      durationFrames: 200,
      audioSegment: {
        start: 42.88,
        end: 49.02,
        text: 'Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực.'
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
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Sustainable on normal days'
      }
    },
    {
      type: 'ending',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 1485,
      durationFrames: 110,
      audioSegment: {
        start: 49.70,
        end: 52.24,
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

console.log('Successfully generated setup, plan, script, and spec for phan-19!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
