import subprocess
from PIL import Image, ImageDraw, ImageFont

video = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/video-v3.1.mp4"
out_sheet = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/v31-contact-sheet.jpg"

times = [i * 3 for i in range(16)] # 0s to 45s
thumb_w = 270
thumb_h = 480
cols = 4
rows = 4

canvas = Image.new("RGB", (cols * thumb_w, rows * thumb_h), color=(20, 20, 20))
draw = ImageDraw.Draw(canvas)

try:
    font = ImageFont.truetype("arial.ttf", 20)
except Exception:
    font = ImageFont.load_default()

for idx, t in enumerate(times):
    r = idx // cols
    c = idx % cols
    tmp_path = f"videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_cs_{t}s.jpg"
    cmd = [
        "ffmpeg", "-y", "-ss", f"{t:02d}", "-i", video,
        "-vframes", "1", "-vf", f"scale={thumb_w}:{thumb_h}",
        tmp_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    img = Image.open(tmp_path)
    x = c * thumb_w
    y = r * thumb_h
    canvas.paste(img, (x, y))
    draw.text((x + 10, y + 10), f"{t}s", fill=(255, 230, 100), font=font)

canvas.save(out_sheet, quality=90)
print("Saved v31-contact-sheet to", out_sheet)
