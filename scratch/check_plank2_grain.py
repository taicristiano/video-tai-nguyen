from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In region x=850..950, y=550..710
for x in [850, 900, 950]:
    col = arr[550:715, x, :]
    lum = 0.299 * col[:, 0] + 0.587 * col[:, 1] + 0.114 * col[:, 2]
    kernel = np.ones(5) / 5
    smoothed = np.convolve(lum, kernel, mode='same')
    minima = []
    for y in range(5, len(smoothed) - 5):
        if smoothed[y] < smoothed[y-1] and smoothed[y] < smoothed[y+1] and smoothed[y] < np.mean(smoothed[max(0, y-10):y+10]) - 1.5:
            minima.append(y + 550)
    print(f"x={x}: grain line y in lower plank 2={minima}")
