const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-bot-lua-chon';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2541,
  video: {
    title: 'Đôi khi bạn cần bớt lựa chọn',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 243,
      audioSegment: {
        start: 0,
        end: 7.7,
        text: 'Chúng ta rất thường tự nói với chính mình rằng: giá như một ngày có thêm vài tiếng đồng hồ nữa, mình chắc chắn sẽ làm được nhiều điều hơn.'
      },
      image: {
        assetId: 'cf-ngay-ap-luc-bop-nghet-31582df0',
        path: 'assets/human-insight/images/ngay-ap-luc-bop-nghet-31582df0.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Opening contemplative hook'
      }
    },
    {
      type: 'body',
      startFrame: 243,
      durationFrames: 213,
      audioSegment: {
        start: 8.5,
        end: 14.8,
        text: 'Nhưng nếu nhìn lại thật kỹ, đôi khi vấn đề lớn nhất của bạn chưa bao giờ thực sự nằm ở việc thiếu thốn thời gian.'
      },
      image: {
        assetId: 'formal-meeting-01',
        path: 'assets/human-insight/images/formal-meeting-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Gentle counter-perspective'
      }
    },
    {
      type: 'body',
      startFrame: 456,
      durationFrames: 214,
      audioSegment: {
        start: 15.58,
        end: 21.92,
        text: 'Vấn đề thực sự là có quá nhiều thứ cùng lúc lao vào tranh giành sự chú ý của bạn trong cùng một giờ đồng hồ đó.'
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
        name: 'whip',
        volume: 0.15,
        reason: 'Attention competition friction'
      }
    },
    {
      type: 'body',
      startFrame: 670,
      durationFrames: 253,
      audioSegment: {
        start: 22.72,
        end: 30.4,
        text: 'Đó là hàng chục thẻ trình duyệt đang mở dở dang, những thông báo tin nhắn liên tục nhấp nháy, và vô số công việc nghe chừng cũng quan trọng.'
      },
      image: {
        assetId: 'night-study-01',
        path: 'assets/human-insight/images/night-study-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Digital noise clutter'
      }
    },
    {
      type: 'body',
      startFrame: 923,
      durationFrames: 219,
      audioSegment: {
        start: 31.16,
        end: 37.66,
        text: 'Mỗi một lựa chọn nhỏ nhặt, dù bạn có nhấp vào hay phớt lờ, đều âm thầm rút bớt một phần năng lượng tập trung quý báu.'
      },
      image: {
        assetId: 'cf-do-ly-ca-phe-nguoi-11654080',
        path: 'assets/human-insight/images/do-ly-ca-phe-nguoi-11654080.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Energy drain cost'
      }
    },
    {
      type: 'body',
      startFrame: 1142,
      durationFrames: 242,
      audioSegment: {
        start: 38.5,
        end: 45.86,
        text: 'Bộ não của con người không sinh ra để xử lý hàng trăm ngã rẽ mỗi ngày. Càng nhiều sự lựa chọn, bạn càng nhanh chóng rơi vào kiệt sức.'
      },
      image: {
        assetId: 'system-trap-04',
        path: 'assets/human-insight/images/system-trap-04.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Cognitive overload explanation'
      }
    },
    {
      type: 'body',
      startFrame: 1384,
      durationFrames: 197,
      audioSegment: {
        start: 46.4,
        end: 52.34,
        text: 'Vì vậy, một ngày làm việc dễ dàng và thảnh thơi không nhất thiết phải là một ngày có nhiều thời gian rảnh rỗi hơn.'
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
        reason: 'Transition to relief'
      }
    },
    {
      type: 'body',
      startFrame: 1581,
      durationFrames: 215,
      audioSegment: {
        start: 53.04,
        end: 59.38,
        text: 'Đó có thể chỉ đơn giản là một ngày có ít thứ phải cân nhắc, ít mục tiêu bị xé nhỏ, và ít quyết định vụn vặt hơn.'
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
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Calm minimalism visualization'
      }
    },
    {
      type: 'body',
      startFrame: 1796,
      durationFrames: 195,
      audioSegment: {
        start: 60.36,
        end: 65.94,
        text: 'Khi bạn dám can đảm đóng bớt những cánh cửa phụ, bạn mới có đủ sự hiện diện và năng lượng cho cánh cửa chính.'
      },
      image: {
        assetId: 'cf-chung-ta-gang-phai-chung-8d66347b',
        path: 'assets/human-insight/images/chung-ta-gang-phai-chung-8d66347b.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Courage of elimination'
      }
    },
    {
      type: 'body',
      startFrame: 1991,
      durationFrames: 231,
      audioSegment: {
        start: 66.8,
        end: 73.68,
        text: 'Đôi khi, để hoàn thành xuất sắc một việc thực sự quan trọng, bí quyết duy nhất là bạn phải chủ động bỏ bớt vài điều không quan trọng.'
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
        reason: 'Core wisdom insight'
      }
    },
    {
      type: 'ending',
      startFrame: 2222,
      durationFrames: 319,
      audioSegment: {
        start: 74.44,
        end: 82.52,
        text: 'Hãy bớt đi một lựa chọn để tâm trí được tự do, bởi những điều nhỏ bé và tinh giản mới thực sự tạo nên một đời sống trọn vẹn. Nếp.'
      },
      image: {
        assetId: 'city-stroll-01',
        path: 'assets/human-insight/images/city-stroll-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Uplifting conclusion'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Spec created for:', slug);
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
