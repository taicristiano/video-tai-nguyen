const fs = require('fs');

const slug = 'phan-56-2026-09-17-mot-khoang-yen-khong-can-muc-dich';

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 102,
    audioSegment: {
      start: 0,
      end: 2.84,
      text: "Ta rất dễ biến cả nghỉ ngơi thành một việc phải tối ưu."
    },
    image: {
      assetId: "burnout-empty-battery-01",
      path: "assets/human-insight/images/burnout-empty-battery-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về áp lực tối ưu hóa cả sự nghỉ ngơi"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 102,
    durationFrames: 207,
    audioSegment: {
      start: 3.66,
      end: 9.72,
      text: "Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm."
    },
    image: {
      assetId: "cf-ta-hay-giai-quyet-van-04defcdb",
      path: "assets/human-insight/images/ta-hay-giai-quyet-van-04defcdb.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Xu hướng thêm việc khi gặp vấn đề"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 309,
    durationFrames: 108,
    audioSegment: {
      start: 10.78,
      end: 13.34,
      text: "Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều."
    },
    image: {
      assetId: "cf-doi-dieu-huu-ich-hon-34e7c57c-2",
      path: "assets/human-insight/images/doi-dieu-huu-ich-hon-34e7c57c-2.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Sự hữu ích từ điều giản dị nhỏ bé"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 417,
    durationFrames: 63,
    audioSegment: {
      start: 14.44,
      end: 15.44,
      text: "Ngồi cạnh cửa sổ."
    },
    image: {
      assetId: "cf-viec-nao-trong-so-do-7bdc1027",
      path: "assets/human-insight/images/viec-nao-trong-so-do-7bdc1027.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 1: Ngồi cạnh cửa sổ"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 480,
    durationFrames: 45,
    audioSegment: {
      start: 16.50,
      end: 16.96,
      text: "Uống trà."
    },
    image: {
      assetId: "gratitude-simple-life-01",
      path: "assets/human-insight/images/gratitude-simple-life-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 2: Uống trà"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 525,
    durationFrames: 66,
    audioSegment: {
      start: 18.04,
      end: 19.14,
      text: "Nhìn mưa hoặc nhìn cây."
    },
    image: {
      assetId: "life-reflection-watch-rain-window-01",
      path: "assets/human-insight/images/199_watching_rain_by_window.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 3: Nhìn mưa hoặc nhìn cây"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 591,
    durationFrames: 90,
    audioSegment: {
      start: 20.22,
      end: 22.32,
      text: "Không việc nào trong số đó nghe thật ấn tượng."
    },
    image: {
      assetId: "cf-chi-tiet-nhu-vay-hiem-c8be6033",
      path: "assets/human-insight/images/chi-tiet-nhu-vay-hiem-c8be6033.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Bình thản trước những điều không ấn tượng"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 681,
    durationFrames: 81,
    audioSegment: {
      start: 23.16,
      end: 24.94,
      text: "Và cũng không cần phải ấn tượng."
    },
    image: {
      assetId: "cf-phai-hon-trong-tuong-tuong-c20cf72b",
      path: "assets/human-insight/images/phai-hon-trong-tuong-tuong-c20cf72b.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Chấp nhận sự bình thường tự nhiên"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 762,
    durationFrames: 123,
    audioSegment: {
      start: 25.76,
      end: 29.02,
      text: "Không phải phút nào cũng cần học, phục hồi hay tạo giá trị."
    },
    image: {
      assetId: "life-selfcare-put-phone-away-01",
      path: "assets/human-insight/images/149_put_phone_away.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Bỏ qua áp lực tạo giá trị liên tục"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 885,
    durationFrames: 198,
    audioSegment: {
      start: 30.00,
      end: 35.54,
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: giữ lại một khoảng ngắn chỉ để ở đó, không biến nó thành nhiệm vụ."
    },
    image: {
      assetId: "meditation-break-01",
      path: "assets/human-insight/images/meditation-break-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Thử nghiệm khoảng ngắn hiện diện thuần túy"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1083,
    durationFrames: 156,
    audioSegment: {
      start: 36.72,
      end: 40.88,
      text: "Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ."
    },
    image: {
      assetId: "cf-neu-no-giup-minh-doi-aa59bfa9",
      path: "assets/human-insight/images/neu-no-giup-minh-doi-aa59bfa9.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Sự nhẹ nhàng linh hoạt trong lối sống"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1239,
    durationFrames: 141,
    audioSegment: {
      start: 41.84,
      end: 45.44,
      text: "Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ."
    },
    image: {
      assetId: "cf-doi-song-tot-hon-nhat-e86db218",
      path: "assets/human-insight/images/doi-song-tot-hon-nhat-e86db218.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Không cần đập đi xây lại cả đời sống"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1380,
    durationFrames: 210,
    audioSegment: {
      start: 46.50,
      end: 52.32,
      text: "Đôi khi điều mình cần không phải một hoạt động tốt hơn. Chỉ là vài phút không phải trở thành phiên bản nào cả."
    },
    insightText: "ĐÔI KHI ĐIỀU MÌNH CẦN\nKHÔNG PHẢI HOẠT ĐỘNG TỐT HƠN\nCHỈ LÀ VÀI PHÚT\nKHÔNG PHẢI CỐ GẮNG",
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Statement insight cốt lõi của video"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "plain",
    startFrame: 1590,
    durationFrames: 147,
    audioSegment: {
      start: 53.44,
      end: 57.28,
      text: "Lần gần nhất bạn cho phép mình ngồi yên vài phút mà không mở điện thoại là khi nào?"
    },
    image: {
      assetId: "cf-no-chi-can-giup-ngay-1cad5863",
      path: "assets/human-insight/images/no-chi-can-giup-ngay-1cad5863.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 4: Cảnh kết luận yên, ít chi tiết, có khoảng thở + câu hỏi tương tác"
    }
  },
  {
    type: "ending",
    layout: "standard",
    headerMode: "full",
    captionMode: "plain",
    startFrame: 1737,
    durationFrames: 87,
    audioSegment: {
      start: 58.34,
      end: 60.50,
      text: "Nếp, sống tốt hơn từ những điều nhỏ."
    },
    image: {
      assetId: "cf-nep-dieu-nho-tao-nen-507d09a0-2",
      path: "assets/human-insight/images/nep-dieu-nho-tao-nen-507d09a0-2.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.03
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Khẳng định thông điệp thương hiệu NẾP."
    }
  },
  {
    type: "outro",
    layout: "standard",
    headerMode: "none",
    captionMode: "none",
    startFrame: 1824,
    durationFrames: 60,
    isOutro: true
  }
];

const totalFrames = 1824 + 60;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug: slug,
  totalFrames: totalFrames,
  video: {
    title: "Một Khoảng Yên Không Cần Mục Đích",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes: scenes
};

fs.writeFileSync(`videos/${slug}/spec.json`, JSON.stringify(spec, null, 2), 'utf8');
console.log('spec.json generated successfully for phan-56. Total frames:', totalFrames, 'Duration seconds:', (totalFrames / 30).toFixed(2));
