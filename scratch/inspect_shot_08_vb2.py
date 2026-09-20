from PIL import Image

img_path = "scratch/production-smoke/video001/assets/shot-08-vb2.jpg"
img = Image.open(img_path)
print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
