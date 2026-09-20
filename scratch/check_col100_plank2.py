from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

for y in range(710, 785, 10):
    print(f"y={y} at x=100: RGB={arr[y, 100, :]}")
