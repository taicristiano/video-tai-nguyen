const fs = require('fs');
const path = require('path');

const slug = 'phan-47-2026-09-17-muoi-phut-xem-lai-tien-moi-tuan';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 123,
    audioSegment: {
      start: 0,
      end: 3.56,
      text: "Việc tài chính dễ trở nên đáng sợ khi mình chỉ nhìn vào lúc có vấn đề."
    },
    image: {
      assetId: "087_unexpected_expense",
      path: "assets/human-insight/images/087_unexpected_expense.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về tâm lý tài chính"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 123,
    durationFrames: 205,
    audioSegment: {
      start: 4.64,
      end: 10.42,
      text: "Ta hay cố giải quyết một vấn đề bằng cách thêm thật nhiều thứ, thêm kế hoạch, thêm công cụ, thêm quyết tâm."
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
      reason: "Xu hướng phức tạp hóa vấn đề"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 328,
    durationFrames: 109,
    audioSegment: {
      start: 11.46,
      end: 14.02,
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
      reason: "Chuyển hướng sang giải pháp tối giản"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 437,
    durationFrames: 58,
    audioSegment: {
      start: 15.10,
      end: 16.00,
      text: "Chi tiêu tuần này."
    },
    image: {
      assetId: "083_household_budgeting",
      path: "assets/human-insight/images/083_household_budgeting.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Chi tiêu tuần này"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 495,
    durationFrames: 62,
    audioSegment: {
      start: 17.02,
      end: 17.96,
      text: "Hóa đơn sắp tới."
    },
    image: {
      assetId: "081_paying_bills",
      path: "assets/human-insight/images/081_paying_bills.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Hóa đơn sắp tới"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 557,
    durationFrames: 70,
    audioSegment: {
      start: 19.16,
      end: 20.38,
      text: "Một khoản đang tiết kiệm."
    },
    image: {
      assetId: "082_saving_money",
      path: "assets/human-insight/images/082_saving_money.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Một khoản đang tiết kiệm"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 627,
    durationFrames: 158,
    audioSegment: {
      start: 21.42,
      end: 26.16,
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
      reason: "Bình thường hóa các việc nhỏ"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 785,
    durationFrames: 117,
    audioSegment: {
      start: 26.16,
      end: 30.06,
      text: "Một lần xem ngắn nhưng đều giúp con số bớt mơ hồ."
    },
    image: {
      assetId: "financial-planning-01",
      path: "assets/human-insight/images/financial-planning-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Sự rõ ràng từ việc xem đều đặn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 902,
    durationFrames: 197,
    audioSegment: {
      start: 30.06,
      end: 36.64,
      text: "Bạn có thể bắt đầu bằng một thử nghiệm nhỏ: chọn một thời điểm cố định mỗi tuần để nhìn lại các khoản chính trong 10 phút."
    },
    image: {
      assetId: "078_journaling_at_desk",
      path: "assets/human-insight/images/078_journaling_at_desk.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Gợi ý hành động 10 phút mỗi tuần"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1099,
    durationFrames: 159,
    audioSegment: {
      start: 36.64,
      end: 41.94,
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
      reason: "Tinh thần linh hoạt không áp lực"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1258,
    durationFrames: 137,
    audioSegment: {
      start: 41.94,
      end: 46.50,
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
      reason: "Đời sống tốt hơn từ điều giản dị"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1395,
    durationFrames: 158,
    audioSegment: {
      start: 46.50,
      end: 51.34,
      text: "Rõ ràng nhỏ nhưng đều thường nhẹ hơn rất nhiều so với một lần hoảng hốt cuối tháng."
    },
    insightText: "RÕ RÀNG NHỎ NHƯNG ĐỀU\nTHƯỜNG NHẸ HƠN RẤT NHIỀU SO VỚI\nMỘT LẦN HOẢNG HỐT\nCUỐI THÁNG",
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
    startFrame: 1553,
    durationFrames: 116,
    audioSegment: {
      start: 52.18,
      end: 55.62,
      text: "Bạn hay xem lại chi tiêu theo tuần hay thường đợi đến cuối tháng?"
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
    startFrame: 1669,
    durationFrames: 116,
    audioSegment: {
      start: 55.62,
      end: 59.18,
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
    startFrame: 1785,
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
    title: "Mười Phút Xem Lại Tiền Mỗi Tuần Tốt Hơn Né Cả Tháng",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
