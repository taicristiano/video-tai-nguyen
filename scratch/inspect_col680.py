from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Inspect column x=680 from y=710 to 1024
col_680 = arr[710:1024, 680, :]
print("Shape of col_680:", col_680.shape)

# Let's see: Line 3 is at y=782..785 at x=680
print("Line 3 at x=680:", np.where(np.mean(col_680[:85], axis=1) < 80)[0] + 710)
