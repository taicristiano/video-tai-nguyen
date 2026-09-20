from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In Plank 3 (y: 787..1024)
# What are the grain lines at x=200, 400, 680?
for x in [200, 400, 680]:
    col = arr[787:1024, x, :]
    lum = 0.299 * col[:, 0] + 0.587 * col[:, 1] + 0.114 * col[:, 2]
    kernel = np.ones(5) / 5
    smoothed = np.convolve(lum, kernel, mode='same')
    minima = []
    for y in range(5, len(smoothed) - 5):
        if smoothed[y] < smoothed[y-1] and smoothed[y] < smoothed[y+1] and smoothed[y] < np.mean(smoothed[max(0, y-10):y+10]) - 1.5:
            minima.append(y + 787)
    print(f"x={x}: Plank 3 grain lines y={minima}")

# What is the base color in Plank 3?
print("Base color in Plank 3 at x=400, y=900:", arr[900, 400, :])
# What is the base color in Plank 2 at x=800, y=650?
print("Base color in Plank 2 at x=800, y=650:", arr[650, 800, :])
