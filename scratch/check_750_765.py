from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

for y in range(750, 765):
    print(f"y={y}: RGB at x=100={arr[y, 100, :]}, at x=600={arr[y, 600, :]}")
