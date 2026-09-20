from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Print colors along row y=200 from x=600 to 950
for x in range(610, 930, 20):
    print(f"x={x}: RGB={arr[200, x, :]}")
