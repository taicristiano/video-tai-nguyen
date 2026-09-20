const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-buoi-sang-nhe-hon';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 2830,
  video: {
    title: 'Buổi sáng nhẹ hơn từ tối hôm trước',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 258,
      audioSegment: {
        start: 0,
        end: 8.08,
        text: 'Có những buổi sáng thức giấc cảm thấy thật nhẹ nhõm và dễ chịu, không phải vì bạn dậy sớm hơn bình thường hai tiếng, mà là vì tối hôm trước bạn đã chuẩn bị tốt hơn.'
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
        reason: 'Opening serene morning wake-up'
      }
    },
    {
      type: 'body',
      startFrame: 258,
      durationFrames: 235,
      audioSegment: {
        start: 9.14,
        end: 15.84,
        text: 'Phần lớn những buổi sáng căng thẳng và mệt mỏi bắt nguồn từ việc chúng ta vừa mở mắt ra đã phải lao vào một chuỗi những quyết định vụn vặt và hỗn loạn.'
      },
      image: {
        assetId: 'cf-ngay-ap-luc-bop-nghet-31582df0',
        path: 'assets/human-insight/images/ngay-ap-luc-bop-nghet-31582df0.jpg',
        kenBurns: {
          direction: 'zoom-out',
          startScale: 1.08,
          endScale: 1.0
        }
      },
      entrySfx: {
        name: 'whip',
        volume: 0.15,
        reason: 'Morning stress contrast'
      }
    },
    {
      type: 'body',
      startFrame: 493,
      durationFrames: 218,
      audioSegment: {
        start: 17.02,
        end: 23.16,
        text: 'Một ngày mới thảnh thơi thực ra đã được âm thầm định hình từ đêm hôm trước, qua những chuẩn bị rất nhỏ trước khi bạn chìm vào giấc ngủ.'
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
        name: 'pageTurn',
        volume: 0.2,
        reason: 'Evening preparation scene'
      }
    },
    {
      type: 'body',
      startFrame: 711,
      durationFrames: 326,
      audioSegment: {
        start: 24.24,
        end: 34.02,
        text: 'Bộ quần áo đã được chọn và treo sẵn. Chiếc túi xách đặt ngay ngắn cạnh cửa. Bình nước đầy để trên bàn, và việc quan trọng nhất ngày mai đã được ghi xuống sổ.'
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
        reason: 'Ready belongings transition'
      }
    },
    {
      type: 'body',
      startFrame: 1037,
      durationFrames: 248,
      audioSegment: {
        start: 35.14,
        end: 42.32,
        text: 'Từng việc nhỏ ấy thực chất chỉ mất của bạn chưa đầy vài phút trong buổi tối yên ả, khi không có bất kỳ áp lực nào của thời gian hay công việc đè nặng.'
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
        reason: 'Calm evening minutes'
      }
    },
    {
      type: 'body',
      startFrame: 1285,
      durationFrames: 273,
      audioSegment: {
        start: 43.34,
        end: 51.42,
        text: 'Nhưng đến sáng hôm sau, khi bước chân xuống giường, bạn không còn phải tốn năng lượng suy nghĩ xem mình nên mặc gì, tìm chìa khóa ở đâu, hay làm gì trước tiên.'
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
        name: 'whoosh',
        volume: 0.16,
        reason: 'Effortless morning start'
      }
    },
    {
      type: 'body',
      startFrame: 1558,
      durationFrames: 171,
      audioSegment: {
        start: 52.46,
        end: 57.62,
        text: 'Chuẩn bị trước không có nghĩa là bạn phải gò bó bản thân vào một thời gian biểu cứng nhắc cho từng phút từng giây trong ngày.'
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
        reason: 'Reframing preparation flexibility'
      }
    },
    {
      type: 'body',
      startFrame: 1729,
      durationFrames: 235,
      audioSegment: {
        start: 57.62,
        end: 65.46,
        text: 'Nó chỉ đơn giản là nghệ thuật chuyển giao vài quyết định nhỏ nhặt từ lúc bạn đang vội vã buổi sáng sang khoảnh khắc bạn còn đủ sự bình tĩnh của đêm qua.'
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
        reason: 'Decision shifting insight'
      }
    },
    {
      type: 'body',
      startFrame: 1964,
      durationFrames: 246,
      audioSegment: {
        start: 65.46,
        end: 73.22,
        text: 'Khi tâm trí không bị cuốn vào sự cuống cuồng ngay từ giây phút đầu tiên, bạn sẽ có đủ sự tĩnh lặng để nhấp một ngụm trà và hít thở thật sâu.'
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
        name: 'whoosh',
        volume: 0.16,
        reason: 'Sipping tea tranquility'
      }
    },
    {
      type: 'body',
      startFrame: 2210,
      durationFrames: 211,
      audioSegment: {
        start: 74.1,
        end: 80.7,
        text: 'Một vài phút chuẩn bị mỗi tối thực chất chính là món quà dịu dàng và chu đáo nhất mà bạn dành tặng cho chính bản thân mình vào sáng hôm sau.'
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
        reason: 'Gentle self care message'
      }
    },
    {
      type: 'ending',
      startFrame: 2421,
      durationFrames: 409,
      audioSegment: {
        start: 80.7,
        end: 91.42,
        text: 'Buổi sáng nhẹ hơn không bắt đầu từ tiếng chuông báo thức, mà bắt đầu từ sự dịu dàng bạn trao cho mình từ đêm qua. Nếp. Sống tốt hơn từ những điều nhỏ.'
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
        reason: 'Inspiring end card'
      }
    }
  ]
};

fs.writeFileSync(path.join('videos', slug, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8');
console.log('Spec created for:', slug);
console.log('Total scenes:', spec.scenes.length);
console.log('Last scene end:', spec.scenes[10].startFrame + spec.scenes[10].durationFrames, 'totalFrames:', spec.totalFrames);
