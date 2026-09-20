const fs = require('fs');
const path = require('path');

const slug = '2026-09-15-cuon-so-nho-ben-canh';
const spec = {
  templateId: 'human-insight/cinematic-light',
  slug: slug,
  totalFrames: 3103,
  video: {
    title: 'Một cuốn sổ nhỏ bên cạnh',
    bgMusic: 'assets/human-insight/music/music-bg-2.mp3'
  },
  audioDesign: {
    mode: 'full'
  },
  scenes: [
    {
      type: 'hook',
      startFrame: 0,
      durationFrames: 276,
      audioSegment: {
        start: 0,
        end: 8.68,
        text: 'Những ý tưởng hay thường ghé đến một cách vô cùng bất ngờ và chớp nhoáng. Nhưng nếu không cẩn thận, chúng cũng sẽ lặng lẽ rời đi nhanh như khi chúng xuất hiện.'
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
        volume: 0.18,
        reason: 'Opening fleeting idea hook'
      }
    },
    {
      type: 'body',
      startFrame: 276,
      durationFrames: 278,
      audioSegment: {
        start: 9.72,
        end: 17.96,
        text: 'Đã bao nhiêu lần bạn tình cờ nghĩ ra một giải pháp tuyệt vời hay một góc nhìn thú vị, rồi tự tin mỉm cười nhủ thầm: Thôi, lát nữa rảnh mình sẽ nhớ để ghi lại?'
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
        reason: 'Confident thought narrative'
      }
    },
    {
      type: 'body',
      startFrame: 554,
      durationFrames: 254,
      audioSegment: {
        start: 19.0,
        end: 26.42,
        text: 'Thế nhưng chỉ vài tiếng đồng hồ sau, hoặc thậm chí ngay khi vừa buông tay khỏi tách cà phê, ý nghĩ quý giá ấy đã hoàn toàn bốc hơi không còn một dấu vết.'
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
        reason: 'Idea evaporation realization'
      }
    },
    {
      type: 'body',
      startFrame: 808,
      durationFrames: 299,
      audioSegment: {
        start: 27.42,
        end: 36.44,
        text: 'Điều đó xảy ra hoàn toàn không phải vì trí nhớ của bạn sa sút hay kém cỏi. Chỉ đơn giản là trong suốt một ngày, có quá nhiều thông tin mới liên tục ùa vào lấn át.'
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
        reason: 'Information overload explanation'
      }
    },
    {
      type: 'body',
      startFrame: 1107,
      durationFrames: 251,
      audioSegment: {
        start: 37.34,
        end: 44.86,
        text: 'Chính vì vậy, luôn giữ một cuốn sổ nhỏ hoặc một trang ghi chú cố định bên cạnh sẽ giúp mọi tia sáng suy nghĩ có một nơi chốn an toàn để hạ cánh ngay lập tức.'
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
        reason: 'Notebook landing spot'
      }
    },
    {
      type: 'body',
      startFrame: 1358,
      durationFrames: 272,
      audioSegment: {
        start: 45.64,
        end: 54.34,
        text: 'Bạn không cần phải nắn nót viết thật đẹp, cũng chẳng cần phải trau chuốt chúng thành những đoạn văn hoàn chỉnh. Việc viết ra chỉ đơn thuần là neo giữ lại một cảm xúc.'
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
        name: 'whip',
        volume: 0.15,
        reason: 'No pressure writing philosophy'
      }
    },
    {
      type: 'body',
      startFrame: 1630,
      durationFrames: 273,
      audioSegment: {
        start: 54.34,
        end: 63.44,
        text: 'Đôi khi chỉ cần vài gạch đầu dòng ngắn ngủi, vài từ khóa giản dị là đã quá đủ để ngày mai, khi mở sổ ra, bạn lập tức hiểu rõ lúc đó mình đã nghĩ gì.'
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
        volume: 0.16,
        reason: 'Brief keywords clarity'
      }
    },
    {
      type: 'body',
      startFrame: 1903,
      durationFrames: 251,
      audioSegment: {
        start: 63.44,
        end: 71.8,
        text: 'Bộ não của con người được thiết kế để sáng tạo và kết nối các ý tưởng, chứ không phải sinh ra để làm một chiếc kho chứa gồng gánh hàng ngàn việc phải ghi nhớ.'
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
        reason: 'Brain creativity function'
      }
    },
    {
      type: 'body',
      startFrame: 2154,
      durationFrames: 285,
      audioSegment: {
        start: 71.8,
        end: 81.3,
        text: 'Ghi chép chưa bao giờ là việc cố gắng lưu giữ tất cả mọi thứ trên đời. Mục đích duy nhất của nó là nhẹ nhàng giữ lại những điều bạn thực sự không muốn đánh mất.'
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
        name: 'whip',
        volume: 0.15,
        reason: 'Gentle retention wisdom'
      }
    },
    {
      type: 'body',
      startFrame: 2439,
      durationFrames: 240,
      audioSegment: {
        start: 81.3,
        end: 89.3,
        text: 'Một cuốn sổ tay nhỏ nằm êm đềm bên cạnh chiếc bút quen thuộc đôi khi lại là công cụ trung thành và đáng tin cậy hơn bất kỳ trí nhớ siêu phàm nào.'
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
        name: 'whoosh',
        volume: 0.18,
        reason: 'Faithful companion notebook'
      }
    },
    {
      type: 'ending',
      startFrame: 2679,
      durationFrames: 424,
      audioSegment: {
        start: 89.3,
        end: 100.52,
        text: 'Hãy để những suy nghĩ đẹp đẽ có một chốn nương náu trên trang giấy, vì sự tinh tế của đời sống bắt đầu từ những nét mực khiêm nhường. Nếp. Sống tốt hơn từ những điều nhỏ.'
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
