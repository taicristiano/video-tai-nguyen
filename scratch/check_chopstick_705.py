from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Are there any chopstick pixels in x: 705..1024, y: 720..1024?
# Chopstick pixels have dark contour or reddish brown wood color:
# e.g. R in [180..220], G in [100..130], B in [50..80]
# But wait, does chopstick reach x >= 705 at y >= 720?
# Let's inspect y=720..740, x=705..720
for y in range(720, 740):
    for x in range(705, 725):
        p = arr[y, x]
        if np.mean(p) < 60: # dark border
            print(f"Dark pixel at y={y}, x={x}: RGB={p}")
