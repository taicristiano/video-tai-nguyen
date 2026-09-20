const fs = require('fs');
const path = require('path');

const slug = 'phan-15-2026-09-17-mot-buoi-toi-de-chiu-co-the-bat';
const outDir = path.join(__dirname, '..', 'videos', slug);

const plan = {
  title: 'Một buổi tối dễ chịu có thể bắt đầu từ việc đóng bếp',
  hook: 'Nhiều người kết thúc ăn tối nhưng căn bếp vẫn ở trạng thái đang hoạt động.',
  segments: [
    {
      title: 'Thay đổi đủ lớn',
      content_summary: 'Ta thường chỉ để ý tới những thay đổi đủ lớn để nhìn thấy ngay. Nhưng đời sống hằng ngày lại được tạo bởi những việc nhỏ lặp đi lặp lại.'
    },
    {
      title: 'Ba việc nhỏ',
      content_summary: 'Rửa vài món chính. Lau mặt bếp. Để sẵn đồ cho sáng hôm sau.'
    },
    {
      title: 'Dễ lặp lại hơn',
      content_summary: 'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống. Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn.'
    },
    {
      title: 'Nghi thức đóng bếp',
      content_summary: 'Một nghi thức đóng bếp ngắn tạo cảm giác ngày đã chuyển sang phần nghỉ. Thử một cách rất đơn giản: chọn 3 thao tác cố định và làm chúng ngay sau bữa tối.'
    },
    {
      title: 'Thông điệp cốt lõi',
      content_summary: 'Không cần làm thêm 5 việc khác cùng lúc. Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không. Một ranh giới nhỏ giữa việc nhà và nghỉ ngơi có thể làm buổi tối dài hơn theo cách dễ chịu.'
    }
  ],
  ending: 'Nếp, Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 75
};

const script = {
  script: [
    {
      text: 'Nhiều người kết thúc ăn tối nhưng căn bếp vẫn ở trạng thái đang hoạt động.',
      type: 'hook'
    },
    {
      text: 'Ta thường chỉ để ý tới những thay đổi đủ lớn để nhìn thấy ngay. Nhưng đời sống hằng ngày lại được tạo bởi những việc nhỏ lặp đi lặp lại.',
      type: 'body'
    },
    {
      text: 'Rửa vài món chính. Lau mặt bếp. Để sẵn đồ cho sáng hôm sau.',
      type: 'body'
    },
    {
      text: 'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống. Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn.',
      type: 'body'
    },
    {
      text: 'Một nghi thức đóng bếp ngắn tạo cảm giác ngày đã chuyển sang phần nghỉ. Thử một cách rất đơn giản: chọn 3 thao tác cố định và làm chúng ngay sau bữa tối. Không cần làm thêm 5 việc khác cùng lúc. Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không.',
      type: 'body'
    },
    {
      text: 'Một ranh giới nhỏ giữa việc nhà và nghỉ ngơi có thể làm buổi tối dài hơn theo cách dễ chịu.',
      type: 'body'
    },
    {
      text: 'Nếp, Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 1700,
  video: {
    title: 'Một Buổi Tối Dễ Chịu Có Thể Bắt Đầu Từ Việc Đóng Bếp',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 150,
      audioSegment: {
        start: 0.0,
        end: 4.52,
        text: 'Nhiều người kết thúc ăn tối, nhưng căn bếp vẫn ở trạng thái đang hoạt động.'
      },
      image: {
        assetId: '071_cooking_at_home',
        path: 'assets/human-insight/images/071_cooking_at_home.png',
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
      startFrame: 150,
      durationFrames: 120,
      audioSegment: {
        start: 5.32,
        end: 8.54,
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
        reason: 'Big changes mindset'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 270,
      durationFrames: 150,
      audioSegment: {
        start: 9.4,
        end: 13.22,
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
        reason: 'Small habits insight'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 420,
      durationFrames: 50,
      audioSegment: {
        start: 14.12,
        end: 15.7,
        text: 'Rửa vài món chính,'
      },
      image: {
        assetId: '072_washing_dishes',
        path: 'assets/human-insight/images/072_washing_dishes.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Wash main dishes'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 470,
      durationFrames: 45,
      audioSegment: {
        start: 15.7,
        end: 17.0,
        text: 'lau mặt bếp,'
      },
      image: {
        assetId: '192_clearing_desk_end_of_day',
        path: 'assets/human-insight/images/192_clearing_desk_end_of_day.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Wipe counter'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 515,
      durationFrames: 60,
      audioSegment: {
        start: 17.0,
        end: 18.64,
        text: 'để sẵn đồ cho sáng hôm sau.'
      },
      image: {
        assetId: 'making-breakfast-01',
        path: 'assets/human-insight/images/making-breakfast-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Prep for morning'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 575,
      durationFrames: 130,
      audioSegment: {
        start: 19.16,
        end: 22.8,
        text: 'Từng việc riêng lẻ đều không tạo cảm giác mình vừa thay đổi cuộc sống.'
      },
      image: {
        assetId: '180_reflect_after_long_day',
        path: 'assets/human-insight/images/180_reflect_after_long_day.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Individual actions reflect'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 705,
      durationFrames: 90,
      audioSegment: {
        start: 23.76,
        end: 26.46,
        text: 'Nhưng đó cũng chính là lý do chúng dễ được lặp lại hơn.'
      },
      image: {
        assetId: '142_own_pace',
        path: 'assets/human-insight/images/142_own_pace.png',
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
      startFrame: 795,
      durationFrames: 140,
      audioSegment: {
        start: 26.46,
        end: 31.14,
        text: 'Một nghi thức đóng bếp ngắn tạo cảm giác ngày đã chuyển sang phần nghỉ'
      },
      image: {
        assetId: '193_evening_walk_after_dinner',
        path: 'assets/human-insight/images/193_evening_walk_after_dinner.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Closing kitchen transition'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 935,
      durationFrames: 175,
      audioSegment: {
        start: 31.14,
        end: 36.92,
        text: 'Thử một cách rất đơn giản: Chọn ba thao tác cố định và làm chúng ngay sau bữa tối'
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
        reason: 'Three simple actions'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 1110,
      durationFrames: 80,
      audioSegment: {
        start: 36.92,
        end: 39.64,
        text: 'Không cần làm thêm năm việc khác cùng lúc'
      },
      image: {
        assetId: '148_letting_go',
        path: 'assets/human-insight/images/148_letting_go.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Let go of extra tasks'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1190,
      durationFrames: 135,
      audioSegment: {
        start: 39.64,
        end: 44.22,
        text: 'Chỉ cần quan sát xem thay đổi nhỏ đó có làm ngày của mình dễ hơn không'
      },
      image: {
        assetId: '133_climbing_step_by_step',
        path: 'assets/human-insight/images/133_climbing_step_by_step.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Observe ease'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'none',
      captionMode: 'phrase',
      startFrame: 1325,
      durationFrames: 185,
      audioSegment: {
        start: 44.22,
        end: 50.38,
        text: 'Một ranh giới nhỏ giữa việc nhà và nghỉ ngơi có thể làm buổi tối dài hơn theo cách dễ chịu'
      },
      insightText: 'MỘT RANH GIỚI NHỎ\nGIỮA VIỆC NHÀ VÀ NGHỈ NGƠI\nLÀM BUỔI TỐI DỄ CHỊU HƠN',
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
      startFrame: 1510,
      durationFrames: 125,
      audioSegment: {
        start: 50.38,
        end: 54.58,
        text: 'Nếp, Sống tốt hơn từ những điều nhỏ.'
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
      startFrame: 1635,
      durationFrames: 65,
      isOutro: true
    }
  ]
};

fs.mkdirSync(path.join(outDir, 'script'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'script', 'script.json'), JSON.stringify(script, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');

console.log('Successfully generated plan.json, script.json, and spec.json!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
