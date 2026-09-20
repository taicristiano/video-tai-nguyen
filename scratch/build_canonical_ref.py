import os
from PIL import Image, ImageDraw, ImageFont

out_file = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/canonical-family-reference.jpg"
v3_dir = "public/assets/human-insight/images/v3"

# Crops of canonical cast members:
# Father: from shot-07 (best clear frontal portrait) and shot-03
# Mother: from shot-04 (best clear frontal portrait) and shot-01
# Boy: from shot-03 and shot-06
# Girl: from shot-07

members = [
    ("CANONICAL FATHER\nAge 34, short black hair, clean-shaven, NO glasses,\ngentle smile, sage/charcoal shirt",
     [("shot-07-father-son-notebook-medium.jpg", (370, 240, 610, 480)),
      ("shot-03-father-son-talk-medium.jpg", (580, 80, 800, 300)),
      ("shot-10-husband-wife-medium.jpg", (270, 180, 490, 400))]),

    ("CANONICAL MOTHER\nAge 32, dark hair in low bun with soft strands,\nwarm almond eyes, NO glasses, serene smile, beige cardigan",
     [("shot-04-mother-warm-smile-close.jpg", (350, 100, 720, 470)),
      ("shot-01-family-dinner-wide.jpg", (640, 180, 840, 380)),
      ("shot-06-mother-serving-son-medium.jpg", (690, 180, 910, 400))]),

    ("CANONICAL BOY (SON)\nAge 7, messy spiky black fringe, lively curious eyes,\nround cheeks, playful domestic energy",
     [("shot-03-father-son-talk-medium.jpg", (240, 210, 460, 430)),
      ("shot-06-mother-serving-son-medium.jpg", (130, 380, 350, 600)),
      ("shot-01-family-dinner-wide.jpg", (700, 320, 900, 520))]),

    ("CANONICAL GIRL (DAUGHTER)\nAge 5-6, dark hair tied in side bun with straight bangs,\nsweet gentle innocent face",
     [("shot-07-father-son-notebook-medium.jpg", (600, 240, 860, 500))])
]

cell_size = 200
pad = 16
col_w = 420
canvas_w = pad * 2 + len(members) * col_w
canvas_h = 760

canvas = Image.new("RGB", (canvas_w, canvas_h), color=(247, 243, 235))
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype("arial.ttf", 22)
    font_desc = ImageFont.truetype("arial.ttf", 13)
    font_label = ImageFont.truetype("arial.ttf", 12)
except Exception:
    font_title = ImageFont.load_default()
    font_desc = ImageFont.load_default()
    font_label = ImageFont.load_default()

# Header banner
draw.rectangle([0, 0, canvas_w, 60], fill=(44, 26, 14))
draw.text((pad, 16), "HAY & ĐẸP. — CANONICAL FAMILY REFERENCE SHEET (VIDEO 001)", fill=(247, 243, 235), font=font_title)

for m_idx, (desc, crops) in enumerate(members):
    col_x = pad + m_idx * col_w
    draw.text((col_x, 75), desc, fill=(44, 26, 14), font=font_desc)
    
    y = 160
    for shot_file, box in crops:
        img_path = os.path.join(v3_dir, shot_file)
        if os.path.exists(img_path):
            img = Image.open(img_path)
            crop = img.crop(box).resize((180, 180), Image.Resampling.LANCZOS)
            canvas.paste(crop, (col_x, y))
            draw.rectangle([col_x, y, col_x + 180, y + 180], outline=(180, 160, 140), width=2)
            shot_name = shot_file.split("-")[1] + " (" + shot_file.split("-")[0] + ")"
            draw.text((col_x + 190, y + 80), shot_name, fill=(100, 80, 60), font=font_label)
        y += 190

canvas.save(out_file, quality=94)
print("Saved canonical family reference sheet to", out_file)
