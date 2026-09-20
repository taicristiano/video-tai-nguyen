from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

for x in [200, 400, 680]:
    col = arr[715:784, x, :]
    lum = 0.299 * col[:, 0] + 0.587 * col[:, 1] + 0.114 * col[:, 2]
    kernel = np.ones(5) / 5
    smoothed = np.convolve(lum, kernel, mode='same')
    minima = []
    for y in range(3, len(smoothed) - 3):
        if smoothed[y] < smoothed[y-1] and smoothed[y] < smoothed[y+1] and smoothed[y] < np.mean(smoothed) - 1.0:
            minima.append(y + 715)
    print(f"x={x}: Plank 2 (715..784) grain lines y={minima}")
