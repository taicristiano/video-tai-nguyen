from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Check line 2 across x: 600..950
for x in range(600, 950, 50):
    col = arr[340:355, x, :]
    dark_y = np.where(np.mean(col, axis=1) < 80)[0] + 340
    print(f"x={x}: dark line y={dark_y}")
