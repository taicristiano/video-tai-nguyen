from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Print values at x=690, y=787..1024
col = arr[787:1024, 690, :]
for y in range(787, 1024, 10):
    val = arr[y, 690, :]
    print(f"y={y}: RGB={val}")
