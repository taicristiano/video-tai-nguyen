from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

for y in range(710, 735):
    row = arr[y, 700:1024, :]
    max_lum = np.max(np.mean(row, axis=1))
    min_lum = np.min(np.mean(row, axis=1))
    print(f"y={y}: min_lum={min_lum:.1f}, max_lum={max_lum:.1f}")
