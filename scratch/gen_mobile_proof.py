import subprocess
from PIL import Image

video = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/video-v3.1.mp4"
out_proof = "videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/mobile-readability-proof.jpg"

timestamps = [("3s", "00:00:03.000"), ("10s", "00:00:10.000"), ("20s", "00:00:20.000"), ("30s", "00:00:30.000")]
frames = []

for label, ts in timestamps:
    tmp_out = f"videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_mobile_{label}.jpg"
    cmd = [
        "ffmpeg", "-y", "-ss", ts, "-i", video,
        "-vframes", "1", "-vf", "scale=360:640",
        tmp_out
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    img = Image.open(tmp_out)
    frames.append(img)

# Combine into 1440x640
combined = Image.new("RGB", (360 * 4, 640))
for i, img in enumerate(frames):
    combined.paste(img, (i * 360, 0))

combined.save(out_proof, quality=92)
print("Saved mobile readability proof:", out_proof)
