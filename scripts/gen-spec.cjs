const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-mot-ngay-bo-lo';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2895,
  video: {
    title: 'Một ngày bỏ lỡ không phá hủy thói quen',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 267,
      audioSegment: {
        start: 0,
        end: 8.46,
        text: 'Bạn vừa trải qua 7 ngày liên tục duy trì một thói quen tốt, nhưng rồi đến ngày thứ 8, công việc đột ngột ập đến và bạn đành phải bỏ lỡ.'
      },
      image: {
        assetId: 'cf-da-bao-gio-tat-bao-602aa827',
        path: 'assets/human-insight/images/da-bao-gio-tat-bao-602aa827.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Opening morning disruption hook'
      }
    },
    {
      type: 'body',
      startFrame: 267,
      durationFrames: 263,
      audioSegment: {
        start: 9.34,
        end: 17.2,
        text: 'Ngay khoảnh khắc nhìn thấy chuỗi ngày bị đứt đoạn trên ứng dụng theo dõi, phản xạ tự nhiên của rất nhiều người là nghĩ rằng: Thôi, hỏng hết rồi.'
      },
      image: {
        assetId: 'office-conflict-01',
        path: 'assets/human-insight/images/office-conflict-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Sudden feeling of broken streak'
      }
    },
    {
      type: 'body',
      startFrame: 530,
      durationFrames: 236,
      audioSegment: {
        start: 18.16,
        end: 25.54,
        text: 'Chúng ta thường mắc kẹt trong cái bẫy của sự toàn hảo: hoặc là thực hiện đều đặn 100%, hoặc là hoàn toàn thất bại và vô nghĩa.'
      },
      image: {
        assetId: 'system-trap-04',
        path: 'assets/human-insight/images/system-trap-04.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Perfectionism trap analysis'
      }
    },
    {
      type: 'body',
      startFrame: 766,
      durationFrames: 252,
      audioSegment: {
        start: 25.54,
        end: 33.94,
        text: 'Nhưng sự thật là, một ngày gián đoạn hiếm khi có đủ sức mạnh để phá hủy toàn bộ nỗ lực hay sự tiến bộ mà bạn đã tích lũy trước đó.'
      },
      image: {
        assetId: 'mountain-hiking-01',
        path: 'assets/human-insight/images/mountain-hiking-01.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Reassurance of cumulative progress'
      }
    },
    {
      type: 'body',
      startFrame: 1018,
      durationFrames: 283,
      audioSegment: {
        start: 33.94,
        end: 43.0,
        text: 'Vấn đề thực sự không nằm ở ngày bạn nghỉ, mà nằm ở cảm giác tội lỗi và chán nản, khiến bạn buông xuôi và tiếp tục bỏ lỡ luôn cả ngày thứ 9.'
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
        reason: 'The snowball effect of guilt'
      }
    },
    {
      type: 'body',
      startFrame: 1301,
      durationFrames: 244,
      audioSegment: {
        start: 43.76,
        end: 51.5,
        text: 'Một thói quen bền vững không đòi hỏi một chuỗi ngày hoàn hảo không tì vết. Sức mạnh thực sự của nó nằm ở khả năng nhanh chóng quay trở lại.'
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
        reason: 'Core essence of resilience'
      }
    },
    {
      type: 'body',
      startFrame: 1545,
      durationFrames: 262,
      audioSegment: {
        start: 51.5,
        end: 59.8,
        text: 'Nếu cuộc sống có những biến cố khiến hôm nay bạn không thể hoàn thành, hãy nhớ quy tắc vàng: đừng bao giờ để sự gián đoạn kéo dài sang ngày thứ hai.'
      },
      image: {
        assetId: 'classroom-math-01',
        path: 'assets/human-insight/images/classroom-math-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.18,
        reason: 'Golden rule principle'
      }
    },
    {
      type: 'body',
      startFrame: 1807,
      durationFrames: 253,
      audioSegment: {
        start: 60.68,
        end: 68.3,
        text: 'Khi bắt đầu lại vào ngày mai, bạn không cần phải ép mình gồng gánh gấp đôi để bù đắp. Việc bù đắp quá sức chỉ tạo thêm áp lực và kiệt sức.'
      },
      image: {
        assetId: 'new-workload-03',
        path: 'assets/human-insight/images/new-workload-03.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Avoid overcompensation exhaustion'
      }
    },
    {
      type: 'body',
      startFrame: 2060,
      durationFrames: 237,
      audioSegment: {
        start: 69.0,
        end: 76.58,
        text: 'Tất cả những gì bạn cần làm chỉ là nhẹ nhàng đặt chân trở lại đường ray, thực hiện phần việc nhỏ nhất và tìm lại nhịp điệu quen thuộc vốn có.'
      },
      image: {
        assetId: 'city-stroll-01',
        path: 'assets/human-insight/images/city-stroll-01.png',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Gentle return to rhythm'
      }
    },
    {
      type: 'body',
      startFrame: 2297,
      durationFrames: 244,
      audioSegment: {
        start: 76.58,
        end: 84.7,
        text: 'Con đường rèn luyện bản thân là một hành trình dài hạn kéo dài nhiều năm, nơi 90 ngày kiên trì luôn có giá trị hơn một ngày sơ suất.'
      },
      image: {
        assetId: 'travel-journey-03',
        path: 'assets/human-insight/images/travel-journey-03.png',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whoosh',
        volume: 0.16,
        reason: 'Long term journey perspective'
      }
    },
    {
      type: 'ending',
      startFrame: 2541,
      durationFrames: 354,
      audioSegment: {
        start: 84.7,
        end: 94.26,
        text: 'Một ngày trượt không bao giờ định nghĩa được bạn là ai. Điều quyết định kết quả là bạn có đủ kiên nhẫn để mỉm cười và quay lại vào ngày mai hay không. Nếp.'
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
        reason: 'Encouraging closing resolution'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Successfully wrote spec.json!');
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
