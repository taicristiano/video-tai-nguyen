from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Check column x=1023
col_right = arr[:, 1023, :]
# Find where paper begins at x=1023
for y in range(650, 800):
    if np.mean(col_right[y]) > 200 or np.mean(col_right[y]) < 60:
        print(f"At x=1023, y={y}: RGB={col_right[y]}")
