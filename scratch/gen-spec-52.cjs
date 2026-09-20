const fs = require('fs');
const path = require('path');

const slug = 'phan-52-2026-09-17-mat-cung-can-khoang-nghi-giua-man-hinh';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 187,
    audioSegment: {
      start: 0,
      end: 5.80,
      text: "Một ngày có thể chuyển từ laptop sang điện thoại, rồi lại về laptop mà không có điểm nghỉ thật sự."
    },
    image: {
      assetId: "digital-distraction-01",
      path: "assets/human-insight/images/digital-distraction-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về sự quá tải màn hình"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 187,
    durationFrames: 145,
    audioSegment: {
      start: 6.66,
      end: 10.70,
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
      reason: "Đặt ra câu hỏi tự vấn đơn giản"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 332,
    durationFrames: 131,
    audioSegment: {
      start: 11.48,
      end: 14.54,
      text: "Không phải dễ hơn trong tưởng tượng, mà dễ hơn trong một ngày thật."
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
      reason: "Nhấn mạnh thực tế của cuộc sống thường nhật"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 463,
    durationFrames: 60,
    audioSegment: {
      start: 15.44,
      end: 17.42,
      text: "Khi nhìn ra xa qua cửa sổ."
    },
    image: {
      assetId: "199_watching_rain_by_window",
      path: "assets/human-insight/images/199_watching_rain_by_window.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Nhìn ra xa qua cửa sổ"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 523,
    durationFrames: 40,
    audioSegment: {
      start: 17.42,
      end: 18.74,
      text: "Khi nhắm mắt vài nhịp."
    },
    image: {
      assetId: "076_meditation",
      path: "assets/human-insight/images/076_meditation.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Nhắm mắt vài nhịp"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 563,
    durationFrames: 49,
    audioSegment: {
      start: 18.74,
      end: 19.96,
      text: "Khi đứng dậy khỏi bàn."
    },
    image: {
      assetId: "094_full_body_stretch",
      path: "assets/human-insight/images/094_full_body_stretch.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Đứng dậy khỏi bàn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 612,
    durationFrames: 162,
    audioSegment: {
      start: 20.78,
      end: 25.42,
      text: "Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn, nhưng chúng xuất hiện rất nhiều lần."
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
      reason: "Sức mạnh của những việc nhỏ lặp đi lặp lại"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 774,
    durationFrames: 122,
    audioSegment: {
      start: 26.18,
      end: 29.72,
      text: "Chuyển ánh nhìn ra khỏi màn hình là một cách đơn giản để tạo khoảng ngắt."
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
      reason: "Khoảng ngắt tự nhiên cho đôi mắt"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 896,
    durationFrames: 151,
    audioSegment: {
      start: 30.00,
      end: 34.90,
      text: "Thử trong một tuần: giữa hai block làm việc, dành một phút không nhìn vào màn hình khác."
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
      reason: "Thử nghiệm nhỏ: một phút không màn hình"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1047,
    durationFrames: 170,
    audioSegment: {
      start: 34.90,
      end: 40.58,
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
    startFrame: 1217,
    durationFrames: 161,
    audioSegment: {
      start: 40.58,
      end: 45.94,
      text: "Không phải mọi lần nghỉ đều cần thêm nội dung. Có lúc nghỉ nghĩa là bớt nhìn."
    },
    insightText: "KHÔNG PHẢI MỌI LẦN NGHỈ\nĐỀU CẦN THÊM NỘI DUNG\nCÓ LÚC NGHỈ\nNGHĨA LÀ BỚT NHÌN",
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
    startFrame: 1378,
    durationFrames: 143,
    audioSegment: {
      start: 45.94,
      end: 50.70,
      text: "Khi nghỉ giữa giờ làm, bạn thường lướt điện thoại hay rời mắt hẳn khỏi màn hình?"
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
    startFrame: 1521,
    durationFrames: 95,
    audioSegment: {
      start: 50.70,
      end: 53.86,
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
    startFrame: 1616,
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
    title: "Mắt Cũng Cần Khoảng Nghỉ Giữa Các Màn Hình",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete for phan-52. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
