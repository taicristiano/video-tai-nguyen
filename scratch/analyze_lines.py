from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# On the left side x = 0..100, find the y coordinates of dark horizontal lines
col = arr[:, 50, :] # column at x=50
# lines are very dark (RGB close to 0..50)
dark_pixels = np.where(col[:, 0] < 80)[0]
print("Dark line y-coordinates at x=50:", dark_pixels)

# Let's inspect the planks:
# Plank 0: y from 0 to line 1
# Plank 1: y from line 1 to line 2
# Plank 2: y from line 2 to line 3
# Plank 3: y from line 3 to 1024
