const fs = require('fs');
const path = require('path');

const slug = 'phan-50-2026-09-17-cuoc-hop-tot-bat-dau-tu-cau-hoi-ro';
const specPath = path.join('videos', slug, 'spec.json');

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 144,
    audioSegment: {
      start: 0,
      end: 4.20,
      text: "Nhiều cuộc họp dài vì mọi người cùng bước vào nhưng không biết cần rời đi với điều gì."
    },
    image: {
      assetId: "formal-meeting-01",
      path: "assets/human-insight/images/formal-meeting-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về vấn đề các cuộc họp dài"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 144,
    durationFrames: 119,
    audioSegment: {
      start: 5.38,
      end: 8.22,
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể."
    },
    image: {
      assetId: "doi-thu-can-thay-doi-65ec32be",
      path: "assets/human-insight/images/doi-thu-can-thay-doi-65ec32be.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Góc nhìn ngắn hạn một ngày"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 263,
    durationFrames: 58,
    audioSegment: {
      start: 9.28,
      end: 10.16,
      text: "Cần quyết định gì."
    },
    image: {
      assetId: "difficult-decision-01",
      path: "assets/human-insight/images/difficult-decision-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 1: Cần quyết định gì"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 321,
    durationFrames: 58,
    audioSegment: {
      start: 11.22,
      end: 12.16,
      text: "Cần cập nhật gì."
    },
    image: {
      assetId: "thoughtful_architect_at_the_whiteboard",
      path: "assets/human-insight/images/thoughtful_architect_at_the_whiteboard.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 2: Cần cập nhật gì"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 379,
    durationFrames: 82,
    audioSegment: {
      start: 13.14,
      end: 14.78,
      text: "Ai chịu trách nhiệm bước tiếp theo."
    },
    image: {
      assetId: "manager_handing_papers_to_employee",
      path: "assets/human-insight/images/manager_handing_papers_to_employee.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whip",
      volume: 0.15,
      reason: "Ưu tiên visual 3: Ai chịu trách nhiệm bước tiếp theo"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 461,
    durationFrames: 93,
    audioSegment: {
      start: 15.96,
      end: 17.96,
      text: "Mọi thứ vẫn gần như y nguyên sau đó."
    },
    image: {
      assetId: "chung-ta-gang-phai-chung-8d66347b",
      path: "assets/human-insight/images/chung-ta-gang-phai-chung-8d66347b.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Cảm giác không có gì thay đổi tức thì"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 554,
    durationFrames: 235,
    audioSegment: {
      start: 19.00,
      end: 25.86,
      text: "Nhưng đời sống không được tạo bởi một ngày duy nhất. Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần."
    },
    image: {
      assetId: "sketchy_team_brainstorming_session",
      path: "assets/human-insight/images/sketchy_team_brainstorming_session.png",
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
    startFrame: 789,
    durationFrames: 102,
    audioSegment: {
      start: 26.78,
      end: 29.38,
      text: "Một agenda ngắn làm cuộc nói chuyện có hướng."
    },
    image: {
      assetId: "collaborative_office_meeting_sketch",
      path: "assets/human-insight/images/collaborative_office_meeting_sketch.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.04,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Định hướng rõ ràng cho cuộc đối thoại"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 891,
    durationFrames: 212,
    audioSegment: {
      start: 30.00,
      end: 36.26,
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
    startFrame: 1103,
    durationFrames: 133,
    audioSegment: {
      start: 37.30,
      end: 41.16,
      text: "Trước cuộc họp, viết một câu: cuộc họp này kết thúc tốt khi điều gì đã rõ?"
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
      name: "pageTurn",
      volume: 0.16,
      reason: "Chuẩn bị câu hỏi trọng tâm trước giờ họp"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1236,
    durationFrames: 133,
    audioSegment: {
      start: 42.36,
      end: 45.50,
      text: "Một giờ họp có thể được tiết kiệm từ một phút chuẩn bị đúng câu hỏi."
    },
    insightText: "MỘT GIỜ HỌP\nCÓ THỂ ĐƯỢC TIẾT KIỆM\nTỪ MỘT PHÚT\nCHUẨN BỊ ĐÚNG CÂU HỎI",
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Statement insight trọng tâm của video"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1369,
    durationFrames: 209,
    audioSegment: {
      start: 46.58,
      end: 52.14,
      text: "Điều quan trọng là thay đổi này phải đủ nhẹ để tồn tại trong một ngày bình thường, chứ không chỉ trong ngày mình có nhiều động lực."
    },
    image: {
      assetId: "chi-muc-nang-luong-hom-709cefd7",
      path: "assets/human-insight/images/chi-muc-nang-luong-hom-709cefd7.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Độ nhẹ của thay đổi để duy trì lâu dài"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "plain",
    startFrame: 1578,
    durationFrames: 138,
    audioSegment: {
      start: 53.16,
      end: 56.86,
      text: "Trước khi bắt đầu họp, bạn thường chuẩn bị câu hỏi trước hay bước vào rồi mới tính?"
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
    startFrame: 1716,
    durationFrames: 104,
    audioSegment: {
      start: 56.86,
      end: 60.46,
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
    startFrame: 1820,
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
    title: "Cuộc Họp Tốt Bắt Đầu Từ Một Câu Hỏi Rõ",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes
};

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
console.log(`Step 6 Spec complete for phan-50. Total frames: ${totalFrames} (${(totalFrames / 30).toFixed(2)}s)`);
