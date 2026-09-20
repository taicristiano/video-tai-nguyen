from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

for x in [50, 200, 400, 600, 800, 950]:
    col = arr[:, x, :]
    dark = np.where((col[:, 0] < 80) & (col[:, 1] < 80) & (col[:, 2] < 80))[0]
    print(f"x={x}: dark lines y:", dark)
