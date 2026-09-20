from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Line 3 between x=600 and 705
for x in [600, 630, 660, 690]:
    col = arr[780:792, x, :]
    dark_idx = np.where(np.mean(col, axis=1) < 80)[0] + 780
    print(f"x={x}: Line 3 dark y={dark_idx}, values={col[dark_idx - 780]}")
