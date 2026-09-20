const fs = require('fs');
const path = require('path');

const slug = 'phan-17-2026-09-17-tro-ve-nha-cung-can-mot-nghi-thuc';
const outDir = path.join(__dirname, '..', 'videos', slug);
const scriptDir = path.join(outDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'template.txt'), 'human-insight/cinematic-light', 'utf8');
fs.writeFileSync(path.join(outDir, 'audio.txt'), 'full', 'utf8');

const contextLines = [
  'Video dọc 9:16.',
  'Thời lượng mục tiêu: 70–85 giây.',
  'Sweet spot: 75–80 giây.',
  'Phần: 17',
  '',
  'Brand: NẾP.',
  'Slogan: Sống tốt hơn từ những điều nhỏ.',
  '',
  'Tiêu đề:',
  'Trở về nhà cũng cần một nghi thức nhỏ',
  '',
  'Kịch bản voice:',
  'Sau một chuyến đi hoặc một ngày dài, đồ đạc rất dễ nằm nguyên trong túi nhiều ngày.',
  '',
  'Ta thường chỉ để ý tới những thay đổi đủ lớn để nhìn thấy ngay. Nhưng đời sống hằng ngày lại được tạo bởi những việc nhỏ lặp đi lặp lại.',
  '',
  'Đặt chìa khóa về chỗ.',
  '',
  'Đổ đồ bẩn ra khỏi túi.',
  '',
  'Sạc lại những thứ cần dùng.',
  '',
  'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống.',
  '',
  'Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn.',
  '',
  'Một reset 10 phút giúp chuyến đi thật sự kết thúc thay vì kéo dài dưới dạng bừa bộn.',
  '',
  'Thử một cách rất đơn giản: khi vừa về, xử lý ba việc nhỏ trước khi ngồi xuống nghỉ lâu.',
  '',
  'Không cần làm thêm năm việc khác cùng lúc. Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không.',
  '',
  'Đi đâu đó là một phần của đời sống. Biết cách trở về cũng vậy.',
  '',
  'Nếp. sống tốt hơn từ những điều nhỏ.',
  '',
  'Visual direction:',
  'Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.',
  '',
  'Ưu tiên visual:',
  '- Đặt chìa khóa về chỗ.',
  '- Đổ đồ bẩn ra khỏi túi.',
  '- Sạc lại những thứ cần dùng.',
  '- Một cảnh kết luận yên, ít chi tiết, có khoảng thở.'
];
fs.writeFileSync(path.join(outDir, 'context.txt'), contextLines.join('\n'), 'utf8');

const plan = {
  title: 'Trở về nhà cũng cần một nghi thức nhỏ',
  hook: 'Sau một chuyến đi hoặc một ngày dài, đồ đạc rất dễ nằm nguyên trong túi nhiều ngày.',
  segments: [
    {
      title: 'Nhận thức về thói quen nhỏ',
      content_summary: 'Ta thường chỉ để ý tới thay đổi đủ lớn, nhưng đời sống được tạo bởi những việc nhỏ lặp đi lặp lại.'
    },
    {
      title: 'Ba thao tác trở về',
      content_summary: 'Đặt chìa khóa về chỗ, đổ đồ bẩn ra khỏi túi, sạc lại những thứ cần dùng.'
    },
    {
      title: 'Lợi thế của sự giản dị',
      content_summary: 'Không tạo cảm giác đổi đời nhưng dễ duy trì và lặp lại.'
    },
    {
      title: 'Reset 10 phút',
      content_summary: 'Một reset 10 phút giúp chuyến đi thật sự kết thúc thay vì kéo dài dưới dạng bừa bộn.'
    },
    {
      title: 'Thực hành nhỏ',
      content_summary: 'Xử lý 3 việc nhỏ trước khi ngồi nghỉ lâu, không cần làm thêm việc khác, chỉ quan sát cảm nhận.'
    },
    {
      title: 'Thông điệp cốt lõi',
      content_summary: 'Đi đâu đó là một phần của đời sống. Biết cách trở về cũng vậy.'
    }
  ],
  ending: 'Nếp, sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 58
};
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');

const script = {
  script: [
    {
      text: 'Sau một chuyến đi hoặc một ngày dài, đồ đạc rất dễ nằm nguyên trong túi nhiều ngày.',
      type: 'hook'
    },
    {
      text: 'Ta thường chỉ để ý tới những thay đổi đủ lớn để nhìn thấy ngay. Nhưng đời sống hàng ngày lại được tạo bởi những việc nhỏ lặp đi lặp lại.',
      type: 'body'
    },
    {
      text: 'Đặt chìa khóa về chỗ, đổ đồ bẩn ra khỏi túi, sạc lại những thứ cần dùng.',
      type: 'body'
    },
    {
      text: 'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống. Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn.',
      type: 'body'
    },
    {
      text: 'Một reset 10 phút giúp chuyến đi thật sự kết thúc thay vì kéo dài dưới dạng bửa bộn.',
      type: 'body'
    },
    {
      text: 'Thử một cách rất đơn giản: khi vừa về, xử lý 3 việc nhỏ trước khi ngồi xuống nghỉ lâu.',
      type: 'body'
    },
    {
      text: 'Không cần làm thêm 5 việc khác cùng lúc. Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không.',
      type: 'body'
    },
    {
      text: 'Đi đâu đó là một phần của đời sống. Biết cách trở về cũng vậy.',
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
  totalFrames: 1750,
  video: {
    title: 'Trở Về Nhà Cũng Cần Một Nghi Thức Nhỏ',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 170,
      audioSegment: {
        start: 0.0,
        end: 5.56,
        text: 'Sau một chuyến đi hoặc một ngày dài, đồ đạc rất dễ nằm nguyên trong túi nhiều ngày.'
      },
      image: {
        assetId: '168_return_home_after_trip',
        path: 'assets/human-insight/images/168_return_home_after_trip.png',
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
      startFrame: 170,
      durationFrames: 110,
      audioSegment: {
        start: 5.56,
        end: 9.20,
        text: 'Ta thường chỉ để ý tới những thay đổi đủ lớn để nhìn thấy ngay.'
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
        reason: 'Awareness of big changes'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 280,
      durationFrames: 150,
      audioSegment: {
        start: 9.20,
        end: 14.14,
        text: 'Nhưng đời sống hàng ngày lại được tạo bởi những việc nhỏ lặp đi lặp lại.'
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
        reason: 'Small daily repetitions'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 430,
      durationFrames: 75,
      audioSegment: {
        start: 14.14,
        end: 16.74,
        text: 'Đặt chìa khóa về chỗ,'
      },
      image: {
        assetId: 'hoac-mon-do-dinh-3ade5998',
        path: 'assets/human-insight/images/hoac-mon-do-dinh-3ade5998.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Action 1: keys in place'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 505,
      durationFrames: 60,
      audioSegment: {
        start: 16.74,
        end: 18.70,
        text: 'đổ đồ bẩn ra khỏi túi,'
      },
      image: {
        assetId: '101_folding_laundry',
        path: 'assets/human-insight/images/101_folding_laundry.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Action 2: unpack laundry'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 565,
      durationFrames: 60,
      audioSegment: {
        start: 18.70,
        end: 20.10,
        text: 'sạc lại những thứ cần dùng.'
      },
      image: {
        assetId: '174_phone_charging',
        path: 'assets/human-insight/images/174_phone_charging.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Action 3: plug in charger'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 625,
      durationFrames: 110,
      audioSegment: {
        start: 20.86,
        end: 24.34,
        text: 'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống'
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
      startFrame: 735,
      durationFrames: 105,
      audioSegment: {
        start: 24.34,
        end: 27.90,
        text: 'Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn'
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
      startFrame: 840,
      durationFrames: 185,
      audioSegment: {
        start: 27.90,
        end: 33.98,
        text: 'Một reset 10 phút giúp chuyến đi thật sự kết thúc thay vì kéo dài dưới dạng bửa bộn'
      },
      image: {
        assetId: 'decluttering-room-01',
        path: 'assets/human-insight/images/decluttering-room-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: '10 minute reset prevents clutter'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 1025,
      durationFrames: 185,
      audioSegment: {
        start: 33.98,
        end: 40.14,
        text: 'Thử một cách rất đơn giản: khi vừa về, xử lý 3 việc nhỏ trước khi ngồi xuống nghỉ lâu'
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
        reason: 'Actionable 3-step ritual'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1210,
      durationFrames: 205,
      audioSegment: {
        start: 40.14,
        end: 47.02,
        text: 'Không cần làm thêm 5 việc khác cùng lúc. Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không'
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
        reason: 'Observe gently'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1415,
      durationFrames: 160,
      audioSegment: {
        start: 47.88,
        end: 51.94,
        text: 'Đi đâu đó là một phần của đời sống. Biết cách trở về cũng vậy'
      },
      insightText: 'ĐI ĐÂU ĐÓ\nLÀ MỘT PHẦN CỦA ĐỜI SỐNG\nBIẾT CÁCH TRỞ VỀ CŨNG VẬY',
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
      startFrame: 1575,
      durationFrames: 110,
      audioSegment: {
        start: 51.94,
        end: 55.74,
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
      startFrame: 1685,
      durationFrames: 65,
      isOutro: true
    }
  ]
};

fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');

console.log('Successfully generated setup, plan, script, and spec for phan-17!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
