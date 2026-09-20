const fs = require('fs');

const slug = 'phan-55-2026-09-17-he-thong-giat-do-tot-la-he-thong-minh-chiu-dung';

const scenes = [
  {
    type: "hook",
    layout: "standard",
    headerMode: "full",
    captionMode: "phrase",
    startFrame: 0,
    durationFrames: 147,
    audioSegment: {
      start: 0,
      end: 4.40,
      text: "Một hệ thống có quá nhiều bước thường đẹp trên lý thuyết nhưng dễ bị bỏ giữa chừng."
    },
    image: {
      assetId: "cf-nha-can-giong-anh-mau-f0ed8d83",
      path: "assets/human-insight/images/nha-can-giong-anh-mau-f0ed8d83.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về hệ thống quá nhiều bước"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 147,
    durationFrames: 135,
    audioSegment: {
      start: 5.40,
      end: 8.88,
      text: "Có một câu hỏi khá hữu ích: điều này có làm ngày mai dễ hơn một chút không?"
    },
    image: {
      assetId: "cf-cau-hoi-kha-huu-ich-fb55382b",
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
      reason: "Câu hỏi tự vấn đơn giản"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 282,
    durationFrames: 159,
    audioSegment: {
      start: 9.94,
      end: 14.22,
      text: "Không phải dễ hơn trong tưởng tượng. Mà dễ hơn trong một ngày thật."
    },
    image: {
      assetId: "cf-phai-hon-trong-tuong-tuong-c20cf72b",
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
      reason: "Thực tế thay vì tưởng tượng lý thuyết"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 441,
    durationFrames: 93,
    audioSegment: {
      start: 14.90,
      end: 17.36,
      text: "Khi sọt đồ bẩn ở đúng nơi cởi đồ."
    },
    image: {
      assetId: "life-home-folding-laundry-01",
      path: "assets/human-insight/images/101_folding_laundry.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 1: Sọt đồ bẩn đúng vị trí"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 534,
    durationFrames: 78,
    audioSegment: {
      start: 17.36,
      end: 20.20,
      text: "Khi móc treo gần chỗ phơi."
    },
    image: {
      assetId: "laundry-day-01",
      path: "assets/human-insight/images/laundry-day-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 2: Móc treo gần chỗ phơi"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 612,
    durationFrames: 60,
    audioSegment: {
      start: 20.20,
      end: 21.96,
      text: "Khi ngăn đồ sạch dễ cất."
    },
    image: {
      assetId: "life-home-organizing-closet-01",
      path: "assets/human-insight/images/106_organizing_closet.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 3: Ngăn đồ sạch dễ cất"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 672,
    durationFrames: 114,
    audioSegment: {
      start: 22.88,
      end: 25.68,
      text: "Những chi tiết như vậy hiếm khi được gọi là thay đổi lớn."
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
      name: "pageTurn",
      volume: 0.16,
      reason: "Góc nhìn về những chi tiết nhỏ"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 786,
    durationFrames: 78,
    audioSegment: {
      start: 26.82,
      end: 28.24,
      text: "Nhưng chúng xuất hiện rất nhiều lần."
    },
    image: {
      assetId: "cf-diem-lap-nho-tao-cam-4314ad21",
      path: "assets/human-insight/images/diem-lap-nho-tao-cam-4314ad21.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Tác động từ tần suất lặp lại liên tục"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 864,
    durationFrames: 102,
    audioSegment: {
      start: 28.24,
      end: 31.78,
      text: "Mỗi bước thừa đều làm khả năng trì hoãn tăng lên."
    },
    image: {
      assetId: "cf-ta-hay-giai-quyet-van-04defcdb",
      path: "assets/human-insight/images/ta-hay-giai-quyet-van-04defcdb.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Bản chất của sự trì hoãn từ ma sát thừa"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 966,
    durationFrames: 153,
    audioSegment: {
      start: 31.78,
      end: 37.28,
      text: "Thử trong một tuần: đưa giỏ, móc hoặc nơi cất tới gần đúng điểm hành động xảy ra."
    },
    image: {
      assetId: "cf-neu-muon-thu-nay-chi-90ccb531",
      path: "assets/human-insight/images/neu-muon-thu-nay-chi-90ccb531.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Thử nghiệm đưa đồ về đúng điểm hành động"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1119,
    durationFrames: 165,
    audioSegment: {
      start: 37.28,
      end: 42.74,
      text: "Rồi nhìn lại xem mình đã bớt một quyết định, một lần tìm kiếm hay một chút căng thẳng nào chưa."
    },
    image: {
      assetId: "cf-nhin-lai-xem-minh-da-55c3d6e8",
      path: "assets/human-insight/images/nhin-lai-xem-minh-da-55c3d6e8.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Cảm nhận sự nhẹ nhõm khi bớt ma sát"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1284,
    durationFrames: 189,
    audioSegment: {
      start: 42.74,
      end: 48.72,
      text: "Đừng ép mình sống theo hệ thống đẹp. Hãy để hệ thống đi theo cách mình thật sự sống."
    },
    insightText: "ĐỪNG ÉP MÌNH SỐNG\nTHEO HỆ THỐNG ĐẸP\nHÃY ĐỂ HỆ THỐNG ĐI THEO\nCÁCH MÌNH THẬT SỰ SỐNG",
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
    startFrame: 1473,
    durationFrames: 165,
    audioSegment: {
      start: 49.52,
      end: 54.02,
      text: "Trong các bước giặt, phơi và gấp quần áo, bước nào bạn dễ để dồn lại nhất?"
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
    startFrame: 1638,
    durationFrames: 90,
    audioSegment: {
      start: 55.04,
      end: 57.24,
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
    startFrame: 1728,
    durationFrames: 60,
    isOutro: true
  }
];

const totalFrames = 1728 + 60;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug: slug,
  totalFrames: totalFrames,
  video: {
    title: "Hệ Thống Giặt Đồ Tốt Là Hệ Thống Mình Dùng",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes: scenes
};

fs.writeFileSync(`videos/${slug}/spec.json`, JSON.stringify(spec, null, 2), 'utf8');
console.log('spec.json generated successfully for phan-55. Total frames:', totalFrames, 'Duration seconds:', (totalFrames / 30).toFixed(2));
