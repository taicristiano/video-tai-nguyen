const fs = require('fs');

const slug = 'phan-54-2026-09-17-hoc-xong-mot-khoa-truoc-khi-mo-khoa-moi';

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
      end: 3.64,
      text: "Internet khiến việc bắt đầu học rất dễ và việc hoàn thành lại rất khó."
    },
    image: {
      assetId: "night-study-01",
      path: "assets/human-insight/images/night-study-01.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.18,
      reason: "Mở đầu video về nghịch lý việc học trên internet"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 126,
    durationFrames: 108,
    audioSegment: {
      start: 4.72,
      end: 7.34,
      text: "Vấn đề thường không nằm ở chỗ mình không biết phải làm gì."
    },
    image: {
      assetId: "cf-van-thuong-nam-minh-biet-80f443c7-3",
      path: "assets/human-insight/images/van-thuong-nam-minh-biet-80f443c7-3.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Góc nhìn tự vấn ban đầu"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 234,
    durationFrames: 147,
    audioSegment: {
      start: 8.40,
      end: 12.18,
      text: "Vấn đề là giải pháp trong đầu thường lớn hơn năng lượng mình có trong một ngày bình thường."
    },
    image: {
      assetId: "cf-van-giai-phap-trong-dau-c8f6104c-3",
      path: "assets/human-insight/images/van-giai-phap-trong-dau-c8f6104c-3.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Khoảng cách giữa kế hoạch lớn và năng lượng thực tế"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 381,
    durationFrames: 75,
    audioSegment: {
      start: 13.22,
      end: 14.78,
      text: "Có thể chỉ là một tab khóa học."
    },
    image: {
      assetId: "online-course-01",
      path: "assets/human-insight/images/online-course-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 1: Một tab khóa học"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 456,
    durationFrames: 72,
    audioSegment: {
      start: 15.74,
      end: 17.10,
      text: "Hoặc một playlist tutorial."
    },
    image: {
      assetId: "life-learning-online-course-01",
      path: "assets/human-insight/images/cozy_pencil_sketch_online_study_scene.png",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Ưu tiên visual 2: Một playlist tutorial"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "logo-only",
    captionMode: "phrase",
    startFrame: 528,
    durationFrames: 90,
    audioSegment: {
      start: 18.20,
      end: 20.04,
      text: "Hoặc đơn giản là một cuốn sách chuyên môn."
    },
    image: {
      assetId: "quiet-reading-home-01",
      path: "assets/human-insight/images/quiet-reading-home-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Ưu tiên visual 3: Một cuốn sách chuyên môn"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 618,
    durationFrames: 111,
    audioSegment: {
      start: 21.12,
      end: 23.84,
      text: "Những việc này nhỏ tới mức không tạo cảm giác \"lột xác\"."
    },
    image: {
      assetId: "cf-viec-nay-nho-muc-tao-02a475fe",
      path: "assets/human-insight/images/viec-nay-nho-muc-tao-02a475fe.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Cảm giác không lột xác ngay tức khắc"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 729,
    durationFrames: 126,
    audioSegment: {
      start: 24.76,
      end: 28.46,
      text: "Nhưng chúng có một lợi thế: mình có thể quay lại với chúng vào ngày mai."
    },
    image: {
      assetId: "cf-chung-loi-minh-quay-lai-a4ea8f47",
      path: "assets/human-insight/images/chung-loi-minh-quay-lai-a4ea8f47.jpg",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Lợi thế của sự quay lại bền bỉ"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 855,
    durationFrames: 171,
    audioSegment: {
      start: 28.46,
      end: 34.12,
      text: "Nhiều tài nguyên chưa hoàn thành tạo cảm giác mình đang học, nhưng làm sự chú ý bị chia nhỏ."
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
      reason: "Ảo tưởng học nhiều làm phân mảnh năng lượng"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1026,
    durationFrames: 159,
    audioSegment: {
      start: 34.12,
      end: 39.46,
      text: "Nếu muốn thử, đặt quy tắc: chỉ một khóa chính đang hoạt động tại một thời điểm."
    },
    image: {
      assetId: "starting-over-01",
      path: "assets/human-insight/images/starting-over-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Nguyên tắc đơn giản hóa: một khóa chính duy nhất"
    }
  },
  {
    type: "body",
    layout: "standard",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1185,
    durationFrames: 78,
    audioSegment: {
      start: 39.46,
      end: 42.06,
      text: "Đừng đánh giá nó sau một lần."
    },
    image: {
      assetId: "cf-dung-danh-gia-no-sau-62846618",
      path: "assets/human-insight/images/dung-danh-gia-no-sau-62846618.jpg",
      kenBurns: {
        direction: "zoom-in",
        startScale: 1.0,
        endScale: 1.04
      }
    },
    entrySfx: {
      name: "whoosh",
      volume: 0.16,
      reason: "Kiên nhẫn không phán xét vội vàng"
    }
  },
  {
    type: "body",
    layout: "focus",
    headerMode: "dimmed",
    captionMode: "phrase",
    startFrame: 1263,
    durationFrames: 129,
    audioSegment: {
      start: 42.06,
      end: 46.34,
      text: "Hãy nhìn xem nó thay đổi một thao tác lặp lại như thế nào sau vài ngày."
    },
    image: {
      assetId: "small-habit-progress-01",
      path: "assets/human-insight/images/small-habit-progress-01.png",
      kenBurns: {
        direction: "zoom-out",
        startScale: 1.05,
        endScale: 1.0
      }
    },
    entrySfx: {
      name: "pageTurn",
      volume: 0.16,
      reason: "Quan sát tiến triển cụ thể trong thao tác"
    }
  },
  {
    type: "body",
    layout: "statement",
    headerMode: "none",
    captionMode: "statement",
    startFrame: 1392,
    durationFrames: 225,
    audioSegment: {
      start: 46.34,
      end: 53.84,
      text: "Kiến thức tích lũy không đến từ số thứ mình đã mở. Nó đến từ số lần mình đi đủ sâu để hoàn thành một vòng."
    },
    insightText: "KIẾN THỨC TÍCH LŨY\nKHÔNG ĐẾN TỪ SỐ THỨ MÌNH ĐÃ MỞ\nMÀ ĐẾN TỪ SỐ LẦN HOÀN THÀNH",
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
    startFrame: 1617,
    durationFrames: 198,
    audioSegment: {
      start: 53.84,
      end: 59.60,
      text: "Hiện tại trong máy bạn đang có bao nhiêu khóa học hay playlist tutorial mở dở mà chưa xem xong?"
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
    startFrame: 1815,
    durationFrames: 84,
    audioSegment: {
      start: 60.78,
      end: 62.92,
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
    startFrame: 1899,
    durationFrames: 60,
    isOutro: true
  }
];

const totalFrames = 1899 + 60;

const spec = {
  templateId: "human-insight/cinematic-light",
  slug: slug,
  totalFrames: totalFrames,
  video: {
    title: "Học Xong Một Khóa Trước Khi Mở Khóa Mới",
    bgMusic: "assets/human-insight/music/music-bg-2.mp3"
  },
  scenes: scenes
};

fs.writeFileSync(`videos/${slug}/spec.json`, JSON.stringify(spec, null, 2), 'utf8');
console.log('spec.json generated successfully. Total frames:', totalFrames, 'Duration seconds:', (totalFrames / 30).toFixed(2));
