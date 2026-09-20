const fs = require('fs');
const path = require('path');

const slug = 'phan-11-2026-09-17-mot-goc-dat-do-khi-vua-ve-nha';
const outDir = path.join(__dirname, '..', 'videos', slug);
const scriptDir = path.join(outDir, 'script');

fs.mkdirSync(scriptDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'template.txt'), 'human-insight/cinematic-light', 'utf8');
fs.writeFileSync(path.join(outDir, 'audio.txt'), 'full', 'utf8');

const contextText = `Video dọc 9:16.
Thời lượng mục tiêu: 70–85 giây.
Sweet spot: 75–80 giây.
Phần: 11

Brand: NẾP.
Slogan: Sống tốt hơn từ những điều nhỏ.

Tiêu đề:
Một góc đặt đồ khi vừa về nhà có thể giảm rất nhiều bừa bộn

Kịch bản voice:
Khoảnh khắc vừa bước vào nhà thường quyết định đồ sẽ nằm đúng chỗ hay trôi khắp phòng.

Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.

Có thể chỉ là chìa khóa.

Hoặc ví và tai nghe.

Hoặc đơn giản là áo khoác hoặc túi.

Những việc này nhỏ tới mức không tạo cảm giác lột xác.

Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.

Một landing zone nhỏ giúp những món tạm thời không lan sang bàn ăn, ghế sofa và giường.

Nếu muốn thử, tạo một khay, móc hoặc ngăn nhỏ ngay gần cửa cho đồ mang theo mỗi ngày.

Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.

Đôi khi cả căn phòng gọn hơn chỉ nhờ một điểm dừng đúng chỗ ngay khi mình bước vào.

Visual direction:
Tone sáng, ấm, đời thường; ivory + sage + charcoal; illustration người que/phong cách NẾP. hiện tại; ánh sáng tự nhiên; ít chi tiết thừa; tránh chữ nằm sẵn trong illustration.

Ưu tiên visual:
- chìa khóa.
- ví và tai nghe.
- áo khoác hoặc túi.
- một cảnh kết luận yên, ít chi tiết, có khoảng thở.`;

fs.writeFileSync(path.join(outDir, 'context.txt'), contextText, 'utf8');

const plan = {
  title: 'Một góc đặt đồ khi vừa về nhà có thể giảm rất nhiều bừa bộn',
  hook: 'Khoảnh khắc vừa bước vào nhà thường quyết định đồ sẽ nằm đúng chỗ hay trôi khắp phòng.',
  segments: [
    {
      title: 'Vấn đề năng lượng',
      content_summary: 'Vấn đề thường không nằm ở chỗ không biết làm gì, mà giải pháp trong đầu thường lớn hơn năng lượng có trong ngày bình thường.'
    },
    {
      title: 'Những vật dụng quen thuộc',
      content_summary: 'Có thể chỉ là chìa khóa, ví và tai nghe, áo khoác hoặc túi.'
    },
    {
      title: 'Lợi thế của việc nhỏ',
      content_summary: 'Việc nhỏ không tạo cảm giác lột xác nhưng có lợi thế: mình có thể quay lại với chúng vào ngày mai.'
    },
    {
      title: 'Landing zone gần cửa',
      content_summary: 'Một landing zone nhỏ giúp đồ tạm thời không lan sang bàn ăn, sofa và giường. Tạo một khay, móc hoặc ngăn nhỏ ngay gần cửa.'
    },
    {
      title: 'Quan sát thói quen',
      content_summary: 'Đừng đánh giá sau một lần, hãy nhìn xem nó thay đổi thao tác lặp lại sau vài ngày.'
    },
    {
      title: 'Điểm dừng đúng chỗ',
      content_summary: 'Đôi khi cả căn phòng gọn hơn chỉ nhờ một điểm dừng đúng chỗ ngay khi bước vào.'
    }
  ],
  ending: 'Nếp, Sống tốt hơn từ những điều nhỏ.',
  estimated_duration: 75
};

fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');

const script = {
  script: [
    {
      text: 'Khoảnh khắc vừa bước vào nhà thường quyết định đồ sẽ nằm đúng chỗ hay trôi khắp phòng.',
      type: 'hook'
    },
    {
      text: 'Vấn đề thường không nằm ở chỗ mình không biết phải làm gì. Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường.',
      type: 'body'
    },
    {
      text: 'Có thể chỉ là chìa khóa. Hoặc ví và tai nghe. Hoặc đơn giản là áo khoác hoặc túi.',
      type: 'body'
    },
    {
      text: 'Những việc này nhỏ tới mức không tạo cảm giác lột xác. Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai.',
      type: 'body'
    },
    {
      text: 'Một landing zone nhỏ giúp những món tạm thời không lan sang bàn ăn, ghế sofa và giường. Nếu muốn thử, tạo một khay, móc hoặc ngăn nhỏ ngay gần cửa cho đồ mang theo mỗi ngày.',
      type: 'body'
    },
    {
      text: 'Đừng đánh giá nó sau một lần. Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày.',
      type: 'body'
    },
    {
      text: 'Đôi khi cả căn phòng gọn hơn chỉ nhờ một điểm dừng đúng chỗ ngay khi mình bước vào.',
      type: 'body'
    },
    {
      text: 'Nếp, Sống tốt hơn từ những điều nhỏ.',
      type: 'ending'
    }
  ]
};

fs.writeFileSync(path.join(scriptDir, 'script.json'), JSON.stringify(script, null, 2), 'utf8');

const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 1725,
  video: {
    title: 'Một Góc Đặt Đồ Khi Vừa Về Nhà Có Thể Giảm Bừa Bộn',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  scenes: [
    {
      type: 'hook',
      layout: 'standard',
      headerMode: 'full',
      captionMode: 'phrase',
      startFrame: 0,
      durationFrames: 175,
      audioSegment: {
        start: 0.0,
        end: 5.26,
        text: 'Khoảnh khắc vừa bước vào nhà thường quyết định đồ sẽ nằm đúng chỗ hay trôi khắp phòng.'
      },
      image: {
        assetId: 'evening_return_home',
        path: 'assets/human-insight/images/evening_return_home.png',
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
      startFrame: 175,
      durationFrames: 100,
      audioSegment: {
        start: 6.06,
        end: 8.60,
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
        reason: 'Reflecting on problem'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 275,
      durationFrames: 150,
      audioSegment: {
        start: 9.26,
        end: 13.46,
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
        reason: 'Energy vs big solution'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 425,
      durationFrames: 50,
      audioSegment: {
        start: 14.28,
        end: 15.62,
        text: 'Có thể chỉ là chìa khóa,'
      },
      image: {
        assetId: 'new-home-key-01',
        path: 'assets/human-insight/images/new-home-key-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Key item'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 475,
      durationFrames: 55,
      audioSegment: {
        start: 15.62,
        end: 17.24,
        text: 'hoặc ví và tay nghe,'
      },
      image: {
        assetId: '110_checking_essentials_before_leaving',
        path: 'assets/human-insight/images/110_checking_essentials_before_leaving.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.06,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Wallet and earphones'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 530,
      durationFrames: 80,
      audioSegment: {
        start: 17.24,
        end: 19.94,
        text: 'hoặc đơn giản là áo khoác hoặc túi.'
      },
      image: {
        assetId: '106_organizing_closet',
        path: 'assets/human-insight/images/106_organizing_closet.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.06
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Coat or bag'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 610,
      durationFrames: 110,
      audioSegment: {
        start: 20.68,
        end: 23.50,
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
        reason: 'Small steps not dramatic'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 720,
      durationFrames: 120,
      audioSegment: {
        start: 23.50,
        end: 27.76,
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
        reason: 'Repeatable advantage'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 840,
      durationFrames: 180,
      audioSegment: {
        start: 27.76,
        end: 33.74,
        text: 'Một landing zone nhỏ giúp những món tạm thời không lan sang bàn ăn, ghế sofa và giường'
      },
      image: {
        assetId: 'hoac-don-gian-loi-di-2787233d',
        path: 'assets/human-insight/images/hoac-don-gian-loi-di-2787233d.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Landing zone prevents clutter'
      }
    },
    {
      type: 'body',
      layout: 'focus',
      headerMode: 'logo-only',
      captionMode: 'phrase',
      startFrame: 1020,
      durationFrames: 180,
      audioSegment: {
        start: 33.74,
        end: 39.74,
        text: 'Nếu muốn thử, tạo một khay, móc hoặc ngăn nhỏ ngay gần cửa cho đồ mang theo mỗi ngày'
      },
      image: {
        assetId: 'hoac-mon-do-dinh-3ade5998',
        path: 'assets/human-insight/images/hoac-mon-do-dinh-3ade5998.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.18,
        reason: 'Tray and hook near door'
      }
    },
    {
      type: 'body',
      layout: 'standard',
      headerMode: 'dimmed',
      captionMode: 'phrase',
      startFrame: 1200,
      durationFrames: 190,
      audioSegment: {
        start: 39.74,
        end: 46.02,
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
      startFrame: 1390,
      durationFrames: 165,
      audioSegment: {
        start: 46.02,
        end: 51.46,
        text: 'Đôi khi cả căn phòng gọn hơn chỉ nhờ một điểm dừng đúng chỗ ngay khi mình bước vào'
      },
      insightText: 'ĐÔI KHI CẢ CĂN PHÒNG GỌN HƠN\nCHỈ NHỜ MỘT ĐIỂM DỪNG ĐÚNG CHỖ\nNGAY KHI MÌNH BƯỚC VÀO',
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
      startFrame: 1555,
      durationFrames: 105,
      audioSegment: {
        start: 51.46,
        end: 55.34,
        text: 'Nếp, Sống tốt hơn từ những điều nhỏ'
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
      startFrame: 1660,
      durationFrames: 65,
      isOutro: true
    }
  ]
};

fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');

console.log('Successfully generated setup, plan, script, and spec for phan-11!');
console.log('Total scenes:', spec.scenes.length);
console.log('Total frames:', spec.totalFrames);
