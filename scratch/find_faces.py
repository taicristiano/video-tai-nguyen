import os
from PIL import Image

v3_dir = "public/assets/human-insight/images/v3"
out_dir = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_faces"

crops = {
    # Father
    "father_shot01": ("shot-01-family-dinner-wide.jpg", (160, 190, 360, 390)),
    "father_shot03": ("shot-03-father-son-talk-medium.jpg", (580, 80, 800, 300)),
    "father_shot06": ("shot-06-mother-serving-son-medium.jpg", (380, 90, 640, 410)),
    "father_shot07": ("shot-07-father-son-notebook-medium.jpg", (370, 240, 610, 480)),
    "father_shot10": ("shot-10-husband-wife-medium.jpg", (270, 180, 490, 400)),
    "father_shot12": ("shot-12-family-memory-wide.jpg", (160, 190, 380, 420)),

    # Mother
    "mother_shot01": ("shot-01-family-dinner-wide.jpg", (640, 180, 840, 380)),
    "mother_shot04": ("shot-04-mother-warm-smile-close.jpg", (350, 100, 720, 470)),
    "mother_shot06": ("shot-06-mother-serving-son-medium.jpg", (690, 180, 910, 400)),
    "mother_shot10": ("shot-10-husband-wife-medium.jpg", (620, 260, 820, 460)),
    "mother_shot12": ("shot-12-family-memory-wide.jpg", (570, 230, 770, 440)),
    "mother_shot13": ("shot-13-grateful-smile-close.jpg", (340, 60, 780, 520)),

    # Children
    "child_shot01": ("shot-01-family-dinner-wide.jpg", (700, 320, 900, 520)),
    "child_shot03": ("shot-03-father-son-talk-medium.jpg", (240, 210, 460, 430)),
    "child_shot06": ("shot-06-mother-serving-son-medium.jpg", (130, 380, 350, 600)),
    "child_shot07": ("shot-07-father-son-notebook-medium.jpg", (600, 240, 860, 500)),
    "child_shot12_boy": ("shot-12-family-memory-wide.jpg", (60, 540, 280, 760)),
    "child_shot12_girl": ("shot-12-family-memory-wide.jpg", (710, 430, 930, 650)),
}

for key, (filename, box) in crops.items():
    img_path = os.path.join(v3_dir, filename)
    if os.path.exists(img_path):
        img = Image.open(img_path)
        crop = img.crop(box)
        crop.save(os.path.join(out_dir, f"{key}.jpg"), quality=94)

print("Updated crops")
