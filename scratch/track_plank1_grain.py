from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In plank 1 (y: 76..342)
# Check columns at x = 100, 200, 300, 400, 500, 600, 950, 1000
for x in [100, 200, 300, 400, 500, 580, 940, 1000]:
    col = arr[76:342, x, :]
    lum = 0.299 * col[:, 0] + 0.587 * col[:, 1] + 0.114 * col[:, 2]
    # smooth slightly
    kernel = np.ones(5) / 5
    smoothed = np.convolve(lum, kernel, mode='same')
    # find local minima
    minima = []
    for y in range(5, len(smoothed) - 5):
        if smoothed[y] < smoothed[y-1] and smoothed[y] < smoothed[y+1] and smoothed[y] < np.mean(smoothed[max(0, y-10):y+10]) - 1.5:
            minima.append(y + 76)
    print(f"x={x}: grain line y={minima}")
