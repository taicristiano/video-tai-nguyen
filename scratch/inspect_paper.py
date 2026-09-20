from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# White paper has high brightness (R > 240, G > 240, B > 240)
# Let's find its bounding box and mask
paper_mask = (arr[:, :, 0] > 230) & (arr[:, :, 1] > 230) & (arr[:, :, 2] > 230)
y_indices, x_indices = np.where(paper_mask)

print("White paper y range:", np.min(y_indices), "to", np.max(y_indices))
print("White paper x range:", np.min(x_indices), "to", np.max(x_indices))

# Also the black border of the paper:
# Look at region x: 700..1024, y: 700..1024
# What is the minimum x of the black border?
border_pixels = np.where((arr[700:1024, 700:1024, 0] < 50) & (arr[700:1024, 700:1024, 1] < 50) & (arr[700:1024, 700:1024, 2] < 50))
print("Border min y offset:", np.min(border_pixels[0]) + 700, "min x offset:", np.min(border_pixels[1]) + 700)
