const fs = require('fs');

const slug = 'phan-53-2026-09-17-khi-dang-buc-tra-loi-sau-tot-hon';

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 126,
    audioSegment: {
      start: 0,
      end: 3.72,
      text: "Một câu nói trong vài giây có thể ở lại lâu hơn cảm xúc tạo ra nó."
    },
    image: {
      assetId: "apology-friends-01",
      path: "assets/human-insight/images/apology-friends-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về tác động của lời nói khi bực bội"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 126,
    durationFrames: 120,
    audioSegment: {
      start: 3.72,
      end: 7.76,
      text: "Nếu chỉ nhìn một ngày, thay đổi nhỏ thường không đáng kể."
    },
    image: {
      assetId: "cf-doi-thu-can-thay-doi-65ec32be",
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
      reason: "Góc nhìn một ngày ngắn ngủi"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 246,
    durationFrames: 72,
    audioSegment: {
      start: 7.76,
      end: 10.20,
      text: "Tin nhắn gây khó chịu."
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
      volume: 0.16,
      reason: "Ưu tiên visual 1: Tin nhắn gây khó chịu"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 318,
    durationFrames: 54,
    audioSegment: {
      start: 10.20,
      end: 11.86,
      text: "Cuộc tranh luận."
    },
    image: {
      assetId: "life-social-friends-disagreement-talk-01",
      path: "assets/human-insight/images/067_friends_disagreement_talk.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 2: Cuộc tranh luận"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 372,
    durationFrames: 53,
    audioSegment: {
      start: 11.86,
      end: 14.16,
      text: "Một lời góp ý."
    },
    image: {
      assetId: "receiving-feedback-01",
      path: "assets/human-insight/images/receiving-feedback-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 3: Một lời góp ý"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 425,
    durationFrames: 73,
    audioSegment: {
      start: 14.16,
      end: 16.12,
      text: "Mọi thứ vẫn gần như y nguyên sau đó."
    },
    image: {
      assetId: "cf-chung-ta-gang-phai-chung-8d66347b",
      path: "assets/human-insight/images/chung-ta-gang-phai-chung-8d66347b.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Thực tế sau các phản ứng nhất thời"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 498,
    durationFrames: 102,
    audioSegment: {
      start: 16.12,
      end: 19.52,
      text: "Nhưng đời sống không được tạo bởi một ngày duy nhất."
    },
    image: {
      assetId: "office-conflict-01",
      path: "assets/human-insight/images/office-conflict-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Nhìn sâu vào bức tranh đời sống dài hạn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 600,
    durationFrames: 132,
    audioSegment: {
      start: 19.52,
      end: 24.02,
      text: "Nó được tạo bởi những hành động mình gặp lại hàng chục, hàng trăm lần."
    },
    image: {
      assetId: "stress-breathing-01",
      path: "assets/human-insight/images/stress-breathing-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Sức mạnh tích lũy từ những phản xạ lặp đi lặp lại"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 732,
    durationFrames: 123,
    audioSegment: {
      start: 24.84,
      end: 28.02,
      text: "Khoảng dừng giúp mình tách điều cần nói khỏi cách mình đang cảm thấy."
    },
    image: {
      assetId: "cf-cau-hoi-kha-huu-ich-fb55382b",
      path: "assets/human-insight/images/cau-hoi-kha-huu-ich-fb55382b.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Giá trị của khoảng dừng tâm trí"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 855,
    durationFrames: 96,
    audioSegment: {
      start: 28.02,
      end: 31.50,
      text: "Vì vậy thay vì hỏi: việc này có thay đổi được nhiều không?"
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
      name: "whoosh",
      volume: 0.16,
      reason: "Chuyển đổi câu hỏi tự vấn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 951,
    durationFrames: 129,
    audioSegment: {
      start: 31.50,
      end: 35.40,
      text: "Thử hỏi: mình có thể tiếp tục làm nó khi ngày mai bận hơn không?"
    },
    image: {
      assetId: "small-habit-progress-01",
      path: "assets/human-insight/images/small-habit-progress-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Tiêu chuẩn bền vững trong ngày bận rộn"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1080,
    durationFrames: 144,
    audioSegment: {
      start: 36.44,
      end: 40.32,
      text: "Nếu câu trả lời bắt đầu sắc hơn mức bạn muốn, dừng và quay lại sau."
    },
    image: {
      assetId: "evening-walk-01",
      path: "assets/human-insight/images/evening-walk-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Hành động dừng lại và de-escalate khi bắt đầu gay gắt"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1224,
    durationFrames: 222,
    audioSegment: {
      start: 40.32,
      end: 47.80,
      text: "Không phải mọi im lặng ngắn đều là tránh né. Có lúc nó là cách bảo vệ cuộc trò chuyện khỏi phiên bản tệ nhất của mình."
    },
    insightText: "KHÔNG PHẢI MỌI IM LẶNG NGẮN\nĐỀU LÀ TRÁNH NÉ\nCÓ LÚC NÓ LÀ CÁCH BẢO VỆ\nCUỘC TRÒ CHUYỆN",
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
    startFrame: 1446,
    durationFrames: 153,
    audioSegment: {
      start: 47.80,
      end: 52.74,
      text: "Khi nhận một tin nhắn khiến mình bực, bạn thường phản hồi ngay hay để đó rồi tính?"
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
    startFrame: 1599,
    durationFrames: 93,
    audioSegment: {
      start: 52.74,
      end: 56.26,
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
    startFrame: 1692,
    durationFrames: 60,
    isOutro: true
  }
];

const totalFrames = 1692 + 60;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug: slug,
  totalFrames: totalFrames,
  video: {
    title: "Khi Đang Bực, Trả Lời Sau Vẫn Tốt Hơn",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes: scenes
};

fs.writeFileSync(`videos/${slug}/spec.json`, JSON.stringify(spec, null, 2), 'utf8');
console.log('spec.json generated successfully. Total frames:', totalFrames, 'Duration seconds:', (totalFrames / 30).toFixed(2));
