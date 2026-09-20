const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-viec-2-phut-tri-hoan-ca-tuan';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2870,
  video: {
    title: 'Việc 2 phút nhưng trì hoãn cả tuần',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 242,
      audioSegment: {
        start: 0,
        end: 7.74,
        text: 'Có bao giờ bạn nhận ra có những việc bạn chỉ mất chưa đầy 2 phút để làm xong, nhưng nó lại có thể nằm im lìm trong đầu bạn suốt cả một tuần lễ?'
      },
      image: {
        assetId: 'cf-da-bao-gio-tat-bao-602aa827-2',
        path: 'assets/human-insight/images/da-bao-gio-tat-bao-602aa827-2.jpg',
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
      startFrame: 242,
      durationFrames: 261,
      audioSegment: {
        start: 8.42,
        end: 16.64,
        text: 'Đó là việc mở điện thoại trả lời một dòng tin nhắn ngắn, cất chiếc cốc uống nước về đúng chỗ, đặt một cuộc hẹn nha sĩ, hay ghi nhanh một ý tưởng vừa lóe lên.'
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
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Daily micro tasks'
      }
    },
    {
      type: 'body',
      startFrame: 503,
      durationFrames: 267,
      audioSegment: {
        start: 16.9,
        end: 25.66,
        text: 'Tất cả đều là những hành động vô cùng nhỏ bé và đơn giản, vậy mà chúng ta hoàn toàn có thể lẳng lặng nhìn thấy chúng và để mặc chúng trôi qua ngày này qua ngày khác.'
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
        reason: 'Quiet procrastination realization'
      }
    },
    {
      type: 'body',
      startFrame: 770,
      durationFrames: 279,
      audioSegment: {
        start: 25.66,
        end: 34.96,
        text: 'Điều làm cho bạn cảm thấy mệt mỏi thực ra chưa bao giờ là 2 phút công sức bỏ ra để hoàn thành, mà nó nằm ở sức nặng vô hình của sự ghi nhớ lặp đi lặp lại.'
      },
      image: {
        assetId: 'cf-nguoi-ta-thich-ke-ve-0506c8e3',
        path: 'assets/human-insight/images/nguoi-ta-thich-ke-ve-0506c8e3.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Mental load reality'
      }
    },
    {
      type: 'body',
      startFrame: 1049,
      durationFrames: 276,
      audioSegment: {
        start: 34.96,
        end: 44.18,
        text: 'Mỗi một lần bước ngang qua hay vô tình nhớ đến, não bộ lại phải phát ra một tín hiệu ngầm: À, việc này mình vẫn chưa giải quyết, lát nữa phải làm thôi.'
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
        name: 'whip',
        volume: 0.15,
        reason: 'Subconscious reminder ping'
      }
    },
    {
      type: 'body',
      startFrame: 1325,
      durationFrames: 251,
      audioSegment: {
        start: 44.18,
        end: 52.54,
        text: 'Một việc rất nhỏ nhưng cứ lặp đi lặp lại hàng chục lần trong tâm trí sẽ vô tình tạo ra cảm giác nặng nề hơn gấp trăm lần so với chính bản thân công việc đó.'
      },
      image: {
        assetId: 'office-working-02',
        path: 'assets/human-insight/images/office-working-02.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Friction magnification'
      }
    },
    {
      type: 'body',
      startFrame: 1576,
      durationFrames: 217,
      audioSegment: {
        start: 52.54,
        end: 59.78,
        text: 'Tất nhiên, cuộc sống không đòi hỏi bạn phải trở thành một cỗ máy hoàn hảo và xử lý mọi thứ ngay tức khắc trong sự vội vã và căng thẳng.'
      },
      image: {
        assetId: 'art-studio-02',
        path: 'assets/human-insight/images/art-studio-02.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Gentle permission to pause'
      }
    },
    {
      type: 'body',
      startFrame: 1793,
      durationFrames: 238,
      audioSegment: {
        start: 59.78,
        end: 67.7,
        text: 'Nhưng nếu một việc thực sự chỉ tốn chưa đến 2 phút, đôi khi dành vài giây giải quyết dứt điểm nó còn nhẹ lòng hơn rất nhiều việc cứ tiếp tục mang nó trong đầu.'
      },
      image: {
        assetId: 'train-journey-04',
        path: 'assets/human-insight/images/train-journey-04.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Lightness of completion'
      }
    },
    {
      type: 'body',
      startFrame: 2031,
      durationFrames: 257,
      audioSegment: {
        start: 67.7,
        end: 76.28,
        text: 'Có lẽ, thứ làm cho một ngày của chúng ta trở nên kiệt sức không hẳn là một biến cố hay một dự án lớn lao, mà chính là quá nhiều việc vụn vặt chưa được khép lại.'
      },
      image: {
        assetId: 'home-investment-04',
        path: 'assets/human-insight/images/home-investment-04.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'The root cause of exhaustion'
      }
    },
    {
      type: 'body',
      startFrame: 2288,
      durationFrames: 229,
      audioSegment: {
        start: 76.28,
        end: 83.9,
        text: 'Khi bạn nhẹ nhàng khép lại một việc nhỏ, bạn không chỉ dọn sạch góc bàn, mà bạn đang trả lại cho tâm trí mình một khoảng trời tĩnh lặng và thảnh thơi.'
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
        reason: 'Clarity and mental space'
      }
    },
    {
      type: 'ending',
      startFrame: 2517,
      durationFrames: 353,
      audioSegment: {
        start: 83.9,
        end: 93.34,
        text: 'Hãy để những điều nhỏ bé được đặt về đúng vị trí của nó, vì sự an yên thực sự bắt đầu từ những việc bạn chọn hoàn thành hôm nay. Nếp, Sống tốt hơn từ những điều nhỏ.'
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
        reason: 'Peaceful closing brand mark'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Spec created for:', slug);
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
