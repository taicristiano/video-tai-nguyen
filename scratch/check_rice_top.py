from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Filter out the divider lines y=71..80 and y=340..350
# Let's inspect y from 85 to 335
rice_mask = (arr[85:335, :600, 0] < 120) & (arr[85:335, :600, 1] < 120) & (arr[85:335, :600, 2] < 120)
rice_y, rice_x = np.where(rice_mask)
print("Rice bowl in Plank 1: min y=", np.min(rice_y) + 85, "x from", np.min(rice_x), "to", np.max(rice_x))
