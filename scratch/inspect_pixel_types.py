from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In region x: 670..750, y: 700..850
# Let's see the chopstick edge and paper edge
for y in range(710, 810, 5):
    row = arr[y, 670:750, :]
    # chopstick pixels (dark or brown)
    # paper pixels (white R>220, G>220, B>220)
    # paper border (dark, adjacent to paper)
    # clean wood (R ~ 250, G ~ 186, B ~ 116)
    types = []
    for x_rel in range(80):
        x = 670 + x_rel
        p = arr[y, x]
        if np.mean(p) > 230:
            types.append("P") # Paper
        elif p[0] > 235 and p[1] > 170 and p[2] > 100:
            types.append(".") # Wood
        elif np.mean(p) < 60:
            types.append("B") # Black border
        else:
            types.append("s") # shadow/grain
    print(f"y={y}: {''.join(types)}")
