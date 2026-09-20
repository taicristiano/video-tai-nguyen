const fs = require('fs');

const slug = 'phan-57-2026-09-17-muoi-phut-buffer-co-the-cuu-ca-mot-hanh-trinh';

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 189,
    audioSegment: {
      start: 0,
      end: 5.80,
      text: "Lịch di chuyển quá sát khiến một đèn đỏ, một thang máy chậm hay một đoạn kẹt xe cũng đủ làm mọi thứ căng lên."
    },
    image: {
      assetId: "traffic-jam-01",
      path: "assets/human-insight/images/traffic-jam-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về sự căng thẳng khi lịch trình quá sát"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 189,
    durationFrames: 207,
    audioSegment: {
      start: 6.90,
      end: 12.70,
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
      reason: "Xu hướng phức tạp hóa giải pháp"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 396,
    durationFrames: 108,
    audioSegment: {
      start: 13.74,
      end: 16.30,
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
      reason: "Giá trị từ những điều nhỏ hơn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 504,
    durationFrames: 69,
    audioSegment: {
      start: 17.36,
      end: 18.60,
      text: "Ra khỏi nhà sớm hơn."
    },
    image: {
      assetId: "commute-to-work-01",
      path: "assets/human-insight/images/commute-to-work-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 1: Ra khỏi nhà sớm hơn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 573,
    durationFrames: 63,
    audioSegment: {
      start: 19.66,
      end: 20.72,
      text: "Đến ga trước một chút."
    },
    image: {
      assetId: "life-commute-waiting-metro-01",
      path: "assets/human-insight/images/175_waiting_metro.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 2: Đến ga trước một chút"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 636,
    durationFrames: 78,
    audioSegment: {
      start: 21.74,
      end: 23.32,
      text: "Không xếp cuộc hẹn nối sát nhau."
    },
    image: {
      assetId: "life-planning-schedule-01",
      path: "assets/human-insight/images/118_planning_schedule.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 3: Không xếp cuộc hẹn nối sát nhau"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 714,
    durationFrames: 90,
    audioSegment: {
      start: 24.38,
      end: 26.48,
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
      reason: "Sự bình thường của hành động nhỏ"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 804,
    durationFrames: 81,
    audioSegment: {
      start: 27.26,
      end: 29.12,
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
      reason: "Chấp nhận sự bình thường hiệu quả"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 885,
    durationFrames: 207,
    audioSegment: {
      start: 30.00,
      end: 35.90,
      text: "Buffer không làm mình mất thời gian. Nó mua lại sự bình tĩnh khi đời sống không chạy đúng kế hoạch."
    },
    image: {
      assetId: "stress-breathing-01",
      path: "assets/human-insight/images/stress-breathing-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Mua lại sự bình tĩnh từ buffer"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1092,
    durationFrames: 231,
    audioSegment: {
      start: 36.86,
      end: 43.52,
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: với việc quan trọng, thử thêm mười đến mười lăm phút dự phòng thay vì tính đúng thời gian lý tưởng."
    },
    image: {
      assetId: "cf-neu-muon-thu-chon-thoi-6deb421b",
      path: "assets/human-insight/images/neu-muon-thu-chon-thoi-6deb421b.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Thử nghiệm 10-15 phút dự phòng"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1323,
    durationFrames: 159,
    audioSegment: {
      start: 44.76,
      end: 48.92,
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
      reason: "Sự linh hoạt nhẹ nhàng"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1482,
    durationFrames: 138,
    audioSegment: {
      start: 49.88,
      end: 53.48,
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
      reason: "Không cần làm lại toàn bộ đời sống"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1620,
    durationFrames: 141,
    audioSegment: {
      start: 54.52,
      end: 58.46,
      text: "Khoảng đệm nhỏ đôi khi là thứ giữ cả hành trình không biến thành một cuộc chạy."
    },
    insightText: "KHOẢNG ĐỆM NHỎ\nĐÔI KHI LÀ THỨ GIỮ\nCẢ HÀNH TRÌNH KHÔNG BIẾN THÀNH\nCUỘC CHẠY ĐUA",
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Statement insight trọng tâm của video"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "plain",
    startFrame: 1761,
    durationFrames: 150,
    audioSegment: {
      start: 59.02,
      end: 63.12,
      text: "Khi có một cuộc hẹn quan trọng, bạn thường đến trước mười phút hay căn sát giờ mới đi?"
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
    startFrame: 1911,
    durationFrames: 93,
    audioSegment: {
      start: 64.20,
      end: 66.40,
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
    startFrame: 2004,
    durationFrames: 60,
    isOutro: true
  }
];

const totalFrames = 2004 + 60;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug: slug,
  totalFrames: totalFrames,
  video: {
    title: "Mười Phút Buffer Cứu Cả Hành Trình",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes: scenes
};

fs.writeFileSync(`videos/${slug}/spec.json`, JSON.stringify(spec, null, 2), 'utf8');
console.log('spec.json generated successfully for phan-57. Total frames:', totalFrames, 'Duration seconds:', (totalFrames / 30).toFixed(2));
