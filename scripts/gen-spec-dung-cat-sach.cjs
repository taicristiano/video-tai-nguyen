const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-dung-cat-sach-qua-ky';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2883,
  video: {
    title: 'Đừng cất cuốn sách quá kỹ',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 218,
      audioSegment: {
        start: 0,
        end: 6.66,
        text: 'Một thói quen tốt sẽ luôn trở nên dễ dàng bắt đầu hơn rất nhiều khi công cụ bạn cần được đặt ngay trong tầm mắt thay vì cất giấu quá kỹ.'
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
        volume: 0.18,
        reason: 'Opening reading hook'
      }
    },
    {
      type: 'body',
      startFrame: 218,
      durationFrames: 267,
      audioSegment: {
        start: 7.88,
        end: 15.66,
        text: 'Nếu bạn luôn khao khát đọc sách nhiều hơn, nhưng cuốn sách ấy lại nằm sâu trong ngăn tủ kín, thì mỗi lần muốn đọc, não bộ buộc phải nhớ tới nó trước tiên.'
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
        reason: 'Book hidden friction'
      }
    },
    {
      type: 'body',
      startFrame: 485,
      durationFrames: 249,
      audioSegment: {
        start: 16.7,
        end: 24.46,
        text: 'Khoảng cách từ ý nghĩ đến hành động lúc này phải vượt qua hàng loạt ma sát: đi lại mở tủ, tìm kiếm cuốn sách, rồi mới có thể ngồi xuống lật từng trang.'
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
        reason: 'Action obstacle realization'
      }
    },
    {
      type: 'body',
      startFrame: 734,
      durationFrames: 234,
      audioSegment: {
        start: 24.46,
        end: 32.28,
        text: 'Lần này, hãy thử một thay đổi rất nhỏ trong không gian sống: mang cuốn sách bạn đang đọc dở ra đặt ngay ở những nơi bạn thường xuyên ngồi xuống.'
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
        name: 'whoosh',
        volume: 0.16,
        reason: 'Environment shift solution'
      }
    },
    {
      type: 'body',
      startFrame: 968,
      durationFrames: 297,
      audioSegment: {
        start: 32.28,
        end: 42.18,
        text: 'Đặt nó ngay trên góc bàn làm việc gỗ. Để nó trên chiếc đôn cạnh ghế sofa phòng khách. Hoặc đặt một cuốn nhẹ nhàng ngay trên bàn cạnh đầu giường ngủ.'
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
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Specific touchpoints placement'
      }
    },
    {
      type: 'body',
      startFrame: 1265,
      durationFrames: 255,
      audioSegment: {
        start: 42.18,
        end: 50.18,
        text: 'Mục đích của việc này hoàn toàn không phải để ép buộc hay tạo áp lực cho bản thân, mà chỉ đơn giản là biến việc đọc thành một lựa chọn dễ nhìn thấy.'
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
        name: 'whip',
        volume: 0.15,
        reason: 'Gentle visual invitation'
      }
    },
    {
      type: 'body',
      startFrame: 1520,
      durationFrames: 238,
      audioSegment: {
        start: 51.14,
        end: 58.6,
        text: 'Môi trường xung quanh không thể trực tiếp tạo dựng thói quen thay bạn, nhưng một môi trường được sắp đặt thông minh có thể làm bước đầu tiên trở nên vô cùng nhẹ nhõm.'
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
        name: 'whoosh',
        volume: 0.16,
        reason: 'Smart environment principle'
      }
    },
    {
      type: 'body',
      startFrame: 1758,
      durationFrames: 233,
      audioSegment: {
        start: 58.6,
        end: 66.38,
        text: 'Đôi khi thay vì phải gồng mình tìm kiếm thêm động lực hay ý chí sắt đá, tất cả những gì bạn cần chỉ là kéo thứ mình muốn làm lại gần mình hơn.'
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
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Less friction less effort'
      }
    },
    {
      type: 'body',
      startFrame: 1991,
      durationFrames: 246,
      audioSegment: {
        start: 66.38,
        end: 74.56,
        text: 'Một cuốn sách đang mở sẵn trên bàn luôn tạo ra lời mời gọi êm đềm và dễ bắt đầu hơn rất nhiều so với một cuốn sách gáy thẳng tắp bị lãng quên trong tủ.'
      },
      image: {
        assetId: 'cf-nguoi-ta-thich-ke-ve-0506c8e3',
        path: 'assets/human-insight/images/nguoi-ta-thich-ke-ve-0506c8e3.jpg',
        kenBurns: {
          direction: 'zoom-in',
          startScale: 1.0,
          endScale: 1.08
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Open book contrast'
      }
    },
    {
      type: 'body',
      startFrame: 2237,
      durationFrames: 229,
      audioSegment: {
        start: 74.56,
        end: 82.2,
        text: 'Khi vật dụng hòa vào nhịp sống thường nhật, thói quen sẽ tự động nảy mầm một cách tự nhiên như hơi thở mà không cần bất kỳ sự gắng gượng nào.'
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
        volume: 0.18,
        reason: 'Natural habit blossoming'
      }
    },
    {
      type: 'ending',
      startFrame: 2466,
      durationFrames: 417,
      audioSegment: {
        start: 82.2,
        end: 93.18,
        text: 'Hãy để những trang sách ở gần tay bạn hơn, vì một cuộc sống sâu sắc bắt đầu từ những khoảng lặng bạn chọn nuôi dưỡng mỗi ngày. Nếp. Sống tốt hơn từ những điều nhỏ.'
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
        reason: 'Closing serene resolution'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Spec created for:', slug);
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
