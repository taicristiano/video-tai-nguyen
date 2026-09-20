const fs = require('fs');
const path = require('path');

const slug = 'phan-49-2026-09-17-nhung-viec-chua-khep-lai-chiem-cho-trong-dau';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 177,
    audioSegment: {
      start: 0,
      end: 5.38,
      text: "Một email chưa trả lời hay một quyết định chưa chốt có thể tiếp tục quay lại trong đầu cả ngày."
    },
    image: {
      assetId: "overthinking-night-01",
      path: "assets/human-insight/images/overthinking-night-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về những việc chưa khép lại"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 177,
    durationFrames: 110,
    audioSegment: {
      start: 6.42,
      end: 9.24,
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể."
    },
    image: {
      assetId: "difficult-decision-01",
      path: "assets/human-insight/images/difficult-decision-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Góc nhìn một ngày ngắn hạn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 287,
    durationFrames: 65,
    audioSegment: {
      start: 9.88,
      end: 11.74,
      text: "Một tin nhắn cần trả lời."
    },
    image: {
      assetId: "overwhelmed_by_notifications",
      path: "assets/human-insight/images/overwhelmed_by_notifications.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Một tin nhắn cần trả lời"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 352,
    durationFrames: 45,
    audioSegment: {
      start: 11.74,
      end: 13.24,
      text: "Một giấy tờ cần nộp."
    },
    image: {
      assetId: "manager_handing_papers_to_employee",
      path: "assets/human-insight/images/manager_handing_papers_to_employee.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Một giấy tờ cần nộp"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 397,
    durationFrames: 50,
    audioSegment: {
      start: 13.24,
      end: 14.88,
      text: "Một cuộc hẹn chưa xác nhận."
    },
    image: {
      assetId: "video-meeting-01",
      path: "assets/human-insight/images/video-meeting-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Một cuộc hẹn chưa xác nhận"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 447,
    durationFrames: 82,
    audioSegment: {
      start: 15.32,
      end: 17.10,
      text: "Mọi thứ vẫn gần như y nguyên sau đó."
    },
    image: {
      assetId: "doi-thu-can-thay-doi-65ec32be",
      path: "assets/human-insight/images/doi-thu-can-thay-doi-65ec32be.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Cảm giác mọi thứ không suy suyển"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 529,
    durationFrames: 202,
    audioSegment: {
      start: 18.16,
      end: 23.94,
      text: "Nhưng đời sống không được tạo bởi một ngày duy nhất. Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần."
    },
    image: {
      assetId: "chung-ta-gang-phai-chung-8d66347b",
      path: "assets/human-insight/images/chung-ta-gang-phai-chung-8d66347b.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Bản chất tích lũy của cuộc sống"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 731,
    durationFrames: 137,
    audioSegment: {
      start: 24.80,
      end: 28.92,
      text: "Open loop nhỏ tích lại sẽ tạo cảm giác bận ngay cả khi mình không làm gì."
    },
    image: {
      assetId: "burnout-empty-battery-01",
      path: "assets/human-insight/images/burnout-empty-battery-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Áp lực ngầm từ những vòng lặp mở"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 868,
    durationFrames: 252,
    audioSegment: {
      start: 28.92,
      end: 36.76,
      text: "Vì vậy thay vì hỏi việc này có thay đổi được nhiều không, thử hỏi: mình có thể tiếp tục làm nó khi ngày mai bận hơn không?"
    },
    image: {
      assetId: "cau-hoi-kha-huu-ich-fb55382b",
      path: "assets/human-insight/images/cau-hoi-kha-huu-ich-fb55382b.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Đổi câu hỏi định hướng thực tế hơn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1120,
    durationFrames: 134,
    audioSegment: {
      start: 37.88,
      end: 41.80,
      text: "Chọn ba việc dưới năm phút và khép chúng lại trước khi mở thêm việc mới."
    },
    image: {
      assetId: "small-habit-progress-01",
      path: "assets/human-insight/images/small-habit-progress-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Hành động cụ thể: ba việc dưới năm phút"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1254,
    durationFrames: 155,
    audioSegment: {
      start: 41.80,
      end: 46.98,
      text: "Đôi khi nhẹ đầu không đến từ nghỉ thêm, mà từ việc đóng bớt những cánh cửa đang mở."
    },
    insightText: "ĐÔI KHI NHẸ ĐẦU\nKHÔNG ĐẾN TỪ NGHỈ THÊM\nMÀ TỪ VIỆC ĐÓNG BỚT\nNHỮNG CÁNH CỬA ĐANG MỞ",
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
    startFrame: 1409,
    durationFrames: 162,
    audioSegment: {
      start: 46.98,
      end: 51.84,
      text: "Ngay lúc này, có việc nhỏ nào dưới năm phút đang nằm lấp lửng trong đầu bạn không?"
    },
    image: {
      assetId: "no-chi-can-giup-ngay-1cad5863",
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
    startFrame: 1571,
    durationFrames: 97,
    audioSegment: {
      start: 52.86,
      end: 55.20,
      text: "Nếp, sống tốt hơn từ những điều nhỏ."
    },
    image: {
      assetId: "nep-dieu-nho-tao-nen-507d09a0-2",
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
    startFrame: 1668,
    durationFrames: 60,
    isOutro: true
  }
];

// Validate contiguous frames
let currentFrame = 0;
for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  if (scene.startFrame !== currentFrame) {
    throw new Error(`Scene ${i} startFrame mismatch: expected ${currentFrame}, got ${scene.startFrame}`);
  }
  currentFrame += scene.durationFrames;
}

const totalFrames = currentFrame;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug,
  totalFrames,
  video: {
    title: "Những Việc Chưa Khép Lại Chiếm Chỗ Trong Đầu Nhiều Hơn Ta Nghĩ",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete for phan-49. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
