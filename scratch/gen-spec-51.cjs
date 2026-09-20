const fs = require('fs');
const path = require('path');

const slug = 'phan-51-2026-09-17-be-mat-trong-la-mot-tien-ich';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 138,
    audioSegment: {
      start: 0,
      end: 4.06,
      text: "Ta thường có xu hướng lấp đầy bàn, kệ và mặt tủ vì thấy chúng còn trống."
    },
    image: {
      assetId: "decluttering-room-01",
      path: "assets/human-insight/images/decluttering-room-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về thói quen lấp đầy bề mặt"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 138,
    durationFrames: 207,
    audioSegment: {
      start: 5.16,
      end: 11.00,
      text: "Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ: thêm kế hoạch, thêm công cụ, thêm quyết tâm."
    },
    image: {
      assetId: "ta-hay-giai-quyet-van-04defcdb",
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
      reason: "Thói quen thêm giải pháp phức tạp"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 345,
    durationFrames: 108,
    audioSegment: {
      start: 12.04,
      end: 14.60,
      text: "Nhưng đôi khi điều hữu ích hơn lại nhỏ hơn rất nhiều."
    },
    image: {
      assetId: "doi-dieu-huu-ich-hon-34e7c57c-2",
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
      reason: "Chuyển hướng sang sự tinh gọn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 453,
    durationFrames: 67,
    audioSegment: {
      start: 15.52,
      end: 17.34,
      text: "Mặt bàn bếp."
    },
    image: {
      assetId: "making-breakfast-01",
      path: "assets/human-insight/images/making-breakfast-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Mặt bàn bếp"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 520,
    durationFrames: 52,
    audioSegment: {
      start: 17.34,
      end: 19.08,
      text: "Bàn làm việc."
    },
    image: {
      assetId: "calm_morning_workspace_illustration",
      path: "assets/human-insight/images/calm_morning_workspace_illustration.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Bàn làm việc"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 572,
    durationFrames: 40,
    audioSegment: {
      start: 19.08,
      end: 20.40,
      text: "Tủ đầu giường."
    },
    image: {
      assetId: "sleep-routine-01",
      path: "assets/human-insight/images/sleep-routine-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Tủ đầu giường"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 612,
    durationFrames: 155,
    audioSegment: {
      start: 20.88,
      end: 25.58,
      text: "Không việc nào trong số đó nghe thật ấn tượng và cũng không cần phải ấn tượng."
    },
    image: {
      assetId: "viec-nao-trong-so-do-47c4daaa",
      path: "assets/human-insight/images/viec-nao-trong-so-do-47c4daaa.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Bình dị hóa các chi tiết nhỏ"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 767,
    durationFrames: 139,
    audioSegment: {
      start: 25.58,
      end: 30.22,
      text: "Nhưng bề mặt trống cho mình chỗ để thao tác, đặt tạm và thở bằng mắt."
    },
    image: {
      assetId: "142_own_pace",
      path: "assets/human-insight/images/142_own_pace.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Công năng thực sự của khoảng trống"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 906,
    durationFrames: 198,
    audioSegment: {
      start: 30.22,
      end: 36.82,
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một bề mặt và giữ lại ít nhất một phần ba khoảng trống trong một tuần."
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
      reason: "Thử nghiệm nhỏ: giữ lại 1/3 khoảng trống"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1104,
    durationFrames: 160,
    audioSegment: {
      start: 36.82,
      end: 42.16,
      text: "Nếu nó không giúp, mình đổi. Nếu nó giúp, mình giữ."
    },
    image: {
      assetId: "neu-no-giup-minh-doi-efef5643",
      path: "assets/human-insight/images/neu-no-giup-minh-doi-efef5643.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Tâm thế linh hoạt và nhẹ nhàng"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1264,
    durationFrames: 136,
    audioSegment: {
      start: 42.16,
      end: 46.70,
      text: "Một đời sống tốt hơn không nhất thiết đến từ việc thiết kế lại mọi thứ."
    },
    image: {
      assetId: "doi-song-tot-hon-nhat-e86db218",
      path: "assets/human-insight/images/doi-song-tot-hon-nhat-e86db218.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Không cần thiết kế lại toàn bộ để sống tốt"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1400,
    durationFrames: 108,
    audioSegment: {
      start: 46.70,
      end: 49.90,
      text: "Khoảng trống cũng là một thứ mình có thể sử dụng."
    },
    insightText: "KHOẢNG TRỐNG\nCŨNG LÀ MỘT THỨ\nMÌNH CÓ THỂ SỬ DỤNG",
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
    startFrame: 1508,
    durationFrames: 118,
    audioSegment: {
      start: 50.68,
      end: 53.98,
      text: "Trong nhà bạn, bề mặt nào hiện đang dễ bị chất đầy đồ nhất?"
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
    startFrame: 1626,
    durationFrames: 104,
    audioSegment: {
      start: 53.98,
      end: 57.44,
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
    startFrame: 1730,
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
    title: "Bề Mặt Trống Là Một Tiện Ích, Không Phải Khoảng Trống Lãng Phí",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete for phan-51. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
