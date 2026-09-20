const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-bat-dau-tu-mot-ngan-keo';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2928,
  video: {
    title: 'Bắt đầu từ một ngăn kéo',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 264,
      audioSegment: {
        start: 0,
        end: 8.28,
        text: 'Mỗi khi đứng trước một công việc trông có vẻ quá đồ sộ và mệt mỏi, bí quyết tốt nhất là hãy thu nhỏ điểm bắt đầu lại, nhỏ đến mức bạn khó lòng từ chối.'
      },
      image: {
        assetId: 'new-workload-03',
        path: 'assets/human-insight/images/new-workload-03.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Opening big task visual'
      }
    },
    {
      type: 'body',
      startFrame: 264,
      durationFrames: 212,
      audioSegment: {
        start: 9.3,
        end: 15.34,
        text: 'Chúng ta rất hay tự nhủ với bản thân rằng: thôi để cuối tuần rảnh rang mình sẽ tổng vệ sinh và dọn dẹp lại toàn bộ căn phòng.'
      },
      image: {
        assetId: 'cf-da-bao-gio-tat-bao-602aa827',
        path: 'assets/human-insight/images/da-bao-gio-tat-bao-602aa827.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Weekend promise narrative'
      }
    },
    {
      type: 'body',
      startFrame: 476,
      durationFrames: 285,
      audioSegment: {
        start: 16.38,
        end: 24.84,
        text: 'Ý định đó nghe chừng rất tuyệt vời. Nhưng chính vì quy mô của nó quá lớn, bộ não sẽ ngầm sinh ra cảm giác ngần ngại và liên tục dời nó sang tuần sau.'
      },
      image: {
        assetId: 'night-study-01',
        path: 'assets/human-insight/images/night-study-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Procrastination hesitation'
      }
    },
    {
      type: 'body',
      startFrame: 761,
      durationFrames: 281,
      audioSegment: {
        start: 25.9,
        end: 34.74,
        text: 'Lần này, bạn hãy thử thay đổi hoàn toàn chiến lược tiếp cận. Đừng cố gắng dọn sạch cả căn phòng. Chỉ cần mở và dọn duy nhất một ngăn kéo.'
      },
      image: {
        assetId: 'cf-do-ly-ca-phe-nguoi-11654080',
        path: 'assets/human-insight/images/do-ly-ca-phe-nguoi-11654080.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Micro goal pivot'
      }
    },
    {
      type: 'body',
      startFrame: 1042,
      durationFrames: 263,
      audioSegment: {
        start: 34.74,
        end: 43.5,
        text: 'Không cần sắp xếp lại toàn bộ góc làm việc phức tạp. Bạn chỉ cần nhặt bỏ vài mẩu giấy vụn và những thứ thừa thãi không còn dùng trên mặt bàn.'
      },
      image: {
        assetId: 'office-working-02',
        path: 'assets/human-insight/images/office-working-02.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Simple surface clean'
      }
    },
    {
      type: 'body',
      startFrame: 1305,
      durationFrames: 285,
      audioSegment: {
        start: 43.5,
        end: 52.66,
        text: 'Một hành động cực kỳ nhỏ sẽ tạo ra một vạch đích rất gần và rõ ràng. Bạn có thể hoàn thành nó chỉ trong vòng 5 phút mà không hề thấy áp lực.'
      },
      image: {
        assetId: 'art-studio-02',
        path: 'assets/human-insight/images/art-studio-02.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Clear finish line feeling'
      }
    },
    {
      type: 'body',
      startFrame: 1590,
      durationFrames: 239,
      audioSegment: {
        start: 53.34,
        end: 60.96,
        text: 'Và điều kỳ diệu của tâm lý học là: một khi đôi tay đã thực sự bắt đầu chuyển động, quán tính hành động đôi khi sẽ tự nhiên thôi thúc bạn muốn dọn thêm.'
      },
      image: {
        assetId: 'train-journey-04',
        path: 'assets/human-insight/images/train-journey-04.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Action momentum shift'
      }
    },
    {
      type: 'body',
      startFrame: 1829,
      durationFrames: 209,
      audioSegment: {
        start: 60.96,
        end: 67.94,
        text: 'Nhưng ngay cả khi bạn quyết định dừng lại đúng ở một ngăn kéo đó, thì điều đó vẫn hoàn toàn ổn và là một thành công trọn vẹn.'
      },
      image: {
        assetId: 'home-investment-04',
        path: 'assets/human-insight/images/home-investment-04.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Permission to stop comfortably'
      }
    },
    {
      type: 'body',
      startFrame: 2038,
      durationFrames: 240,
      audioSegment: {
        start: 67.94,
        end: 75.94,
        text: 'Bởi vì một ngăn kéo được sắp xếp ngăn nắp hôm nay vẫn luôn có giá trị gấp trăm lần một bản kế hoạch dọn cả ngôi nhà nhưng chưa bao giờ bắt đầu.'
      },
      image: {
        assetId: 'mountain-hiking-01',
        path: 'assets/human-insight/images/mountain-hiking-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Contrast of real action'
      }
    },
    {
      type: 'body',
      startFrame: 2278,
      durationFrames: 246,
      audioSegment: {
        start: 75.94,
        end: 84.14,
        text: 'Những thay đổi lớn lao trong đời sống chưa bao giờ đến từ những cú nhảy vọt vĩ đại, mà chúng được tích lũy từ những hành động nhỏ bé được hoàn thành mỗi ngày.'
      },
      image: {
        assetId: 'cf-hay-nho-dieu-nay-ngay-d84d3b61',
        path: 'assets/human-insight/images/hay-nho-dieu-nay-ngay-d84d3b61.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Small steps accumulation'
      }
    },
    {
      type: 'ending',
      startFrame: 2524,
      durationFrames: 404,
      audioSegment: {
        start: 84.14,
        end: 94.68,
        text: 'Hãy bắt đầu từ góc nhỏ nhất ngay trước mắt bạn, vì những điều giản dị nhất sẽ kiến tạo nên một cuộc sống an lành. Nếp. Sống tốt hơn từ những điều nhỏ.'
      },
      image: {
        assetId: 'cf-vay-nen-than-van-chut-f43f71ea',
        path: 'assets/human-insight/images/vay-nen-than-van-chut-f43f71ea.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Serene resolution end card'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Spec created for:', slug);
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
