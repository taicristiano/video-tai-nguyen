const fs = require('fs');
const path = require('path');

const slug = 'phan-48-2026-09-17-cuoi-tuan-hay-hoi-tuan-nay-hoc-duoc-gi';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 110,
    audioSegment: {
      start: 0,
      end: 3.64,
      text: "Một tuần có thể rất bận nhưng đến cuối lại khó nói mình đã tiến ở đâu."
    },
    image: {
      assetId: "overwhelmed_at_the_office",
      path: "assets/human-insight/images/overwhelmed_at_the_office.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về nhịp sống bận rộn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 110,
    durationFrames: 150,
    audioSegment: {
      start: 3.64,
      end: 8.12,
      text: "Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?"
    },
    image: {
      assetId: "cau-hoi-kha-huu-ich-fb55382b",
      path: "assets/human-insight/images/cau-hoi-kha-huu-ich-fb55382b.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Gợi mở một câu hỏi định hướng hữu ích"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 260,
    durationFrames: 144,
    audioSegment: {
      start: 9.18,
      end: 13.46,
      text: "Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật."
    },
    image: {
      assetId: "phai-hon-trong-tuong-tuong-c20cf72b",
      path: "assets/human-insight/images/phai-hon-trong-tuong-tuong-c20cf72b.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Nhấn mạnh thực tế của một ngày sống"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 404,
    durationFrames: 76,
    audioSegment: {
      start: 13.46,
      end: 16.00,
      text: "Khi một khái niệm hiểu rõ hơn."
    },
    image: {
      assetId: "123_library_reading",
      path: "assets/human-insight/images/123_library_reading.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Một khái niệm hiểu rõ hơn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 480,
    durationFrames: 70,
    audioSegment: {
      start: 16.00,
      end: 18.32,
      text: "Khi một lỗi đã tránh được."
    },
    image: {
      assetId: "147_learning_from_mistake",
      path: "assets/human-insight/images/147_learning_from_mistake.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Một lỗi đã tránh được"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 550,
    durationFrames: 78,
    audioSegment: {
      start: 18.32,
      end: 20.94,
      text: "Khi một kỹ năng đã làm nhanh hơn."
    },
    image: {
      assetId: "remote_work_desk_sketch",
      path: "assets/human-insight/images/remote_work_desk_sketch.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Một kỹ năng làm nhanh hơn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 628,
    durationFrames: 189,
    audioSegment: {
      start: 20.94,
      end: 27.22,
      text: "Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn. Nhưng chúng xuất hiện rất nhiều lần."
    },
    image: {
      assetId: "chi-tiet-nhu-vay-hiem-c8be6033",
      path: "assets/human-insight/images/chi-tiet-nhu-vay-hiem-c8be6033.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Sự tích lũy từ những chi tiết lặp lại"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 817,
    durationFrames: 141,
    audioSegment: {
      start: 27.22,
      end: 31.92,
      text: "Một bản tổng kết ngắn giúp biến tiến bộ nhỏ thành thứ mình nhìn thấy được."
    },
    image: {
      assetId: "078_journaling_at_desk",
      path: "assets/human-insight/images/078_journaling_at_desk.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Giá trị của việc ghi chép tổng kết"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 958,
    durationFrames: 192,
    audioSegment: {
      start: 31.92,
      end: 38.34,
      text: "Thử trong một tuần: mỗi cuối tuần viết ba dòng: đã học gì, còn vướng gì, tuần sau thử gì."
    },
    image: {
      assetId: "bat-dau-bang-thu-nghiem-ef0f5cec",
      path: "assets/human-insight/images/bat-dau-bang-thu-nghiem-ef0f5cec.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Gợi ý cụ thể: ba dòng mỗi cuối tuần"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1150,
    durationFrames: 163,
    audioSegment: {
      start: 38.34,
      end: 43.76,
      text: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa."
    },
    image: {
      assetId: "nhin-lai-xem-minh-da-55c3d6e8",
      path: "assets/human-insight/images/nhin-lai-xem-minh-da-55c3d6e8.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Cảm nhận sự giảm tải và nhẹ nhõm"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1313,
    durationFrames: 152,
    audioSegment: {
      start: 43.76,
      end: 48.50,
      text: "Khi nhìn thấy tiến bộ nhỏ, mình bớt cần những cú hích lớn để tiếp tục."
    },
    insightText: "KHI NHÌN THẤY TIẾN BỘ NHỎ\nMÌNH BỚT CẦN NHỮNG CÚ HÍCH LỚN\nĐỂ TIẾP TỤC",
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
    startFrame: 1465,
    durationFrames: 142,
    audioSegment: {
      start: 49.16,
      end: 52.98,
      text: "Tuần này, điều nhỏ nhất mà bạn thấy mình làm tốt hơn tuần trước là gì?"
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
    startFrame: 1607,
    durationFrames: 94,
    audioSegment: {
      start: 54.12,
      end: 56.26,
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
    startFrame: 1701,
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
    title: "Cuối Tuần Hãy Hỏi: Tuần Này Mình Thật Sự Học Được Gì?",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete for phan-48. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
