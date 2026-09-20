import os
from PIL import Image, ImageDraw, ImageFont

faces_dir = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_faces"
out_file = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/cast-face-proof.jpg"

rows = [
    ("FATHER (Shots 01, 03, 06, 07, 10, 12)", [
        ("Shot 01", "father_shot01.jpg"),
        ("Shot 03", "father_shot03.jpg"),
        ("Shot 06", "father_shot06.jpg"),
        ("Shot 07", "father_shot07.jpg"),
        ("Shot 10", "father_shot10.jpg"),
        ("Shot 12", "father_shot12.jpg"),
    ]),
    ("MOTHER (Shots 01, 04, 06, 10, 12, 13)", [
        ("Shot 01", "mother_shot01.jpg"),
        ("Shot 04", "mother_shot04.jpg"),
        ("Shot 06", "mother_shot06.jpg"),
        ("Shot 10", "mother_shot10.jpg"),
        ("Shot 12", "mother_shot12.jpg"),
        ("Shot 13", "mother_shot13.jpg"),
    ]),
    ("CHILDREN (Shots 01, 03, 06, 07, 12 Boy, 12 Girl)", [
        ("Shot 01 (Boy)", "child_shot01.jpg"),
        ("Shot 03 (Boy)", "child_shot03.jpg"),
        ("Shot 06 (Boy)", "child_shot06.jpg"),
        ("Shot 07 (Girl)", "child_shot07.jpg"),
        ("Shot 12 (Boy)", "child_shot12_boy.jpg"),
        ("Shot 12 (Girl)", "child_shot12_girl.jpg"),
    ])
]

cell_size = 180
header_height = 36
caption_height = 25
pad = 12

max_cols = max(len(items) for _, items in rows)
canvas_w = pad * 2 + max_cols * (cell_size + pad)
canvas_h = pad + sum(header_height + cell_size + caption_height + pad * 2 for _ in rows)

canvas = Image.new("RGB", (canvas_w, canvas_h), color=(247, 243, 235))
draw = ImageDraw.Draw(canvas)

try:
    font_header = ImageFont.truetype("arial.ttf", 18)
    font_sub = ImageFont.truetype("arial.ttf", 13)
except Exception:
    font_header = ImageFont.load_default()
    font_sub = ImageFont.load_default()

curr_y = pad
for title, items in rows:
    draw.text((pad, curr_y), title, fill=(44, 26, 14), font=font_header)
    curr_y += header_height

    for i, (label, fname) in enumerate(items):
        fpath = os.path.join(faces_dir, fname)
        x = pad + i * (cell_size + pad)
        if os.path.exists(fpath):
            face_img = Image.open(fpath)
            face_img = face_img.resize((cell_size, cell_size), Image.Resampling.LANCZOS)
            canvas.paste(face_img, (x, curr_y))
            draw.rectangle([x, curr_y, x + cell_size, curr_y + cell_size], outline=(180, 160, 140), width=2)
        else:
            draw.rectangle([x, curr_y, x + cell_size, curr_y + cell_size], fill=(220, 215, 205))
        
        draw.text((x + 8, curr_y + cell_size + 4), label, fill=(80, 60, 40), font=font_sub)

    curr_y += cell_size + caption_height + pad * 2

canvas.save(out_file, quality=94)
print(f"Rendered updated cast-face-proof to {out_file}")
