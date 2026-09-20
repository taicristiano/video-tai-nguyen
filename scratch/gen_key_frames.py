import subprocess
from PIL import Image, ImageDraw, ImageFont

video = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/video-v3.1.mp4"
out_proof = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/frames-2s-35s-39s.jpg"

timestamps = [("2s", "00:00:02.000", "2s — Establishing Dinner (Father, Mother, Boy)"),
              ("35s", "00:00:35.000", "35s — Family Memory (Father, Mother, Boy, Girl)"),
              ("39s", "00:00:39.000", "39s — Grateful Close-up (Mother nostalgic smile)")]
frames = []

for label, ts, title in timestamps:
    tmp_out = f"videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_frame_{label}.jpg"
    cmd = [
        "ffmpeg", "-y", "-ss", ts, "-i", video,
        "-vframes", "1", "-vf", "scale=360:640",
        tmp_out
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    img = Image.open(tmp_out)
    frames.append((img, title))

# Combine into 1080x700 with headers
combined = Image.new("RGB", (360 * 3, 700), color=(24, 20, 16))
draw = ImageDraw.Draw(combined)

try:
    font = ImageFont.truetype("arial.ttf", 14)
except Exception:
    font = ImageFont.load_default()

for i, (img, title) in enumerate(frames):
    x = i * 360
    draw.text((x + 10, 15), title, fill=(240, 225, 200), font=font)
    combined.paste(img, (x, 50))

combined.save(out_proof, quality=94)
print("Saved frames comparison to", out_proof)
