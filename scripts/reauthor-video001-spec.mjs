import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const slug = 'phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu';
const specDir = path.join(ROOT, 'videos', slug);

// V3.2 Storytelling Pass spec for Video 001
const spec = {
  "templateId": "human-insight/cinematic-light",
  "slug": "phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu",
  "totalFrames": 1430,
  "castId": "family-young-01",
  "video": {
    "title": "Có những bữa cơm sau này mới hiểu là rất quý",
    "bgMusic": "assets/human-insight/music/music-bg-1.mp3"
  },
  "audioDesign": {
    "mode": "full"
  },
  "scenes": [
    {
      "type": "hook",
      "startFrame": 0,
      "durationFrames": 120,
      "composition": "portrait-focus",
      "shotScale": "wide",
      "titleMode": "intro-only",
      "captionPlacement": "below-visual",
      "motionPreset": "slow-push",
      "audioSegment": {
        "start": 0,
        "end": 3.96,
        "text": "Khi còn nhỏ, một bữa cơm đủ người thường chỉ là chuyện rất bình thường."
      },
      "image": {
        "assetId": "shot-01-family-dinner-wide",
        "path": "assets/human-insight/images/v3/shot-01-family-dinner-wide.jpg"
      },
      "entrySfx": {
        "name": "chime",
        "volume": 0.2,
        "reason": "Opening warm family hook"
      }
    },
    {
      "type": "body",
      "startFrame": 120,
      "durationFrames": 80,
      "composition": "detail-insert",
      "shotScale": "detail",
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "motionPreset": "slow-push",
      "audioSegment": {
        "start": 4.7,
        "end": 7.26,
        "text": "Giá trị của bữa cơm không nằm ở món ăn cầu kỳ,"
      },
      "image": {
        "assetId": "shot-02-simple-dishes-detail",
        "path": "assets/human-insight/images/v3/shot-02-simple-dishes-detail.jpg"
      },
      "entrySfx": {
        "name": "shimmer",
        "volume": 0.15,
        "reason": "Detail transition to simple cooking"
      }
    },
    {
      "type": "body",
      "startFrame": 200,
      "durationFrames": 160,
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "audioSegment": {
        "start": 7.68,
        "end": 12.84,
        "text": "mà ở việc mọi người cùng có mặt, nghe vài câu chuyện vụn và nhìn thấy nhau sau một ngày dài."
      },
      "image": {
        "assetId": "shot-03-father-arrives-home",
        "path": "assets/human-insight/images/v3/shot-03-father-arrives-home.jpg"
      },
      "visualBeats": [
        {
          "startFrame": 0,
          "endFrame": 80,
          "imageSrc": "assets/human-insight/images/v3/shot-03-father-arrives-home.jpg",
          "composition": "editorial-left",
          "shotScale": "medium",
          "motionPreset": "drift-left",
          "transition": "cut"
        },
        {
          "startFrame": 80,
          "endFrame": 160,
          "imageSrc": "assets/human-insight/images/v3/shot-04-child-telling-story.jpg",
          "composition": "portrait-focus",
          "shotScale": "medium",
          "motionPreset": "focus-shift",
          "transition": "cut"
        }
      ]
    },
    {
      "type": "body",
      "startFrame": 360,
      "durationFrames": 140,
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "audioSegment": {
        "start": 13.62,
        "end": 18.02,
        "text": "Có thể là một mâm cơm đơn giản có đủ người, hoặc chiếc điện thoại được đặt sang một bên."
      },
      "image": {
        "assetId": "shot-06-mother-serving-son-medium",
        "path": "assets/human-insight/images/v3/shot-06-mother-serving-son-medium.jpg"
      },
      "visualBeats": [
        {
          "startFrame": 0,
          "endFrame": 70,
          "imageSrc": "assets/human-insight/images/v3/shot-06-mother-serving-son-medium.jpg",
          "composition": "editorial-right",
          "shotScale": "medium",
          "motionPreset": "slow-push",
          "transition": "cut"
        },
        {
          "startFrame": 70,
          "endFrame": 140,
          "imageSrc": "assets/human-insight/images/v3/shot-05-phone-put-aside-detail.jpg",
          "composition": "detail-insert",
          "shotScale": "detail",
          "motionPreset": "slow-pull",
          "transition": "cut"
        }
      ]
    },
    {
      "type": "body",
      "startFrame": 500,
      "durationFrames": 90,
      "composition": "portrait-focus",
      "shotScale": "medium",
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "motionPreset": "drift-left",
      "audioSegment": {
        "start": 18.62,
        "end": 21.46,
        "text": "Có khi chỉ là câu chuyện nhỏ sau một ngày đi học, đi làm."
      },
      "image": {
        "assetId": "shot-07-father-son-notebook-medium",
        "path": "assets/human-insight/images/v3/shot-07-father-son-notebook-medium.jpg"
      }
    },
    {
      "type": "body",
      "startFrame": 590,
      "durationFrames": 100,
      "composition": "editorial-left",
      "shotScale": "medium",
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "motionPreset": "slow-pull",
      "audioSegment": {
        "start": 22.2,
        "end": 25.46,
        "text": "Những chi tiết như vậy không tạo cảm giác mình vừa thay đổi cả cuộc sống."
      },
      "image": {
        "assetId": "shot-08-family-dinner-routine",
        "path": "assets/human-insight/images/v3/shot-08-family-dinner-routine.jpg"
      }
    },
    {
      "type": "body",
      "startFrame": 690,
      "durationFrames": 100,
      "composition": "portrait-focus",
      "shotScale": "medium",
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "motionPreset": "still-breathe",
      "audioSegment": {
        "start": 25.78,
        "end": 29.02,
        "text": "Nhưng chính vì nhỏ, chúng có cơ hội xuất hiện trong những ngày thật."
      },
      "image": {
        "assetId": "shot-09-evening-dinner-prep",
        "path": "assets/human-insight/images/v3/shot-09-evening-dinner-prep.jpg"
      }
    },
    {
      "type": "body",
      "startFrame": 790,
      "durationFrames": 190,
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "audioSegment": {
        "start": 29.02,
        "end": 35.26,
        "text": "Tuần này, thử giữ lại ít nhất một bữa ăn mà mọi người ngồi cùng nhau và điện thoại không nằm giữa bàn."
      },
      "image": {
        "assetId": "shot-10-husband-wife-medium",
        "path": "assets/human-insight/images/v3/shot-10-husband-wife-medium.jpg"
      },
      "visualBeats": [
        {
          "startFrame": 0,
          "endFrame": 95,
          "imageSrc": "assets/human-insight/images/v3/shot-10-husband-wife-medium.jpg",
          "composition": "editorial-left",
          "shotScale": "medium",
          "motionPreset": "drift-right",
          "transition": "cut"
        },
        {
          "startFrame": 95,
          "endFrame": 190,
          "imageSrc": "assets/human-insight/images/v3/shot-11-phone-on-side-table.jpg",
          "composition": "editorial-right",
          "shotScale": "medium",
          "motionPreset": "slow-pull",
          "transition": "cut"
        }
      ]
    },
    {
      "type": "body",
      "startFrame": 980,
      "durationFrames": 210,
      "titleMode": "hidden",
      "captionPlacement": "below-visual",
      "insightText": "CÓ NHỮNG ĐIỀU LÚC ĐANG CÓ THÌ RẤT BÌNH THƯỜNG",
      "audioSegment": {
        "start": 35.26,
        "end": 42.02,
        "text": "Có những điều lúc đang có thì rất bình thường. Đến khi lịch mỗi người khác đi, ta mới biết chúng từng đẹp đến mức nào."
      },
      "image": {
        "assetId": "shot-12-family-memory-wide",
        "path": "assets/human-insight/images/v3/shot-12-family-memory-wide.jpg"
      },
      "visualBeats": [
        {
          "startFrame": 0,
          "endFrame": 105,
          "imageSrc": "assets/human-insight/images/v3/shot-12-family-memory-wide.jpg",
          "composition": "paper",
          "shotScale": "wide",
          "motionPreset": "slow-push",
          "transition": "cut"
        },
        {
          "startFrame": 105,
          "endFrame": 210,
          "imageSrc": "assets/human-insight/images/v3/shot-13-quiet-table-after-dinner.jpg",
          "composition": "portrait-focus",
          "shotScale": "medium",
          "motionPreset": "emotional-hold",
          "transition": "cut"
        }
      ]
    },
    {
      "type": "ending",
      "startFrame": 1190,
      "durationFrames": 180,
      "composition": "full-bleed",
      "shotScale": "wide",
      "titleMode": "hidden",
      "captionPlacement": "hidden",
      "motionPreset": "emotional-hold",
      "insightText": "Nhà bạn có bữa ăn nào dù món rất đơn giản nhưng vẫn nhớ lâu không?",
      "audioSegment": {
        "start": 42.02,
        "end": 46.06,
        "text": "Nhà bạn có bữa ăn nào dù món rất đơn giản nhưng vẫn nhớ lâu không?"
      },
      "image": {
        "assetId": "shot-14-question-cozy-dining",
        "path": "assets/human-insight/images/v3/shot-14-question-cozy-dining.jpg"
      }
    },
    {
      "type": "ending",
      "startFrame": 1370,
      "durationFrames": 60,
      "isOutro": true,
      "titleMode": "hidden",
      "captionPlacement": "hidden",
      "audioSegment": {
        "start": 46.06,
        "end": 47.67,
        "text": ""
      },
      "image": {
        "assetId": "outro-9-16",
        "path": "assets/human-insight/brand/outro-9-16.png"
      }
    }
  ]
};

fs.writeFileSync(path.join(specDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf-8');
console.log('✅ Updated spec.json successfully for V3.2 Video 001!');
