from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Block in Plank 2 just above Line 3: y = 715..787, x = 50..350
block_plank2 = arr[715:787, 50:350, :]
print("Plank 2 block shape:", block_plank2.shape)

# Combined block from y = 715 to 1024 at x = 50..350
combined_block = arr[715:1024, 50:350, :]
print("Combined block shape:", combined_block.shape)

Image.fromarray(combined_block).save("scratch/test_combined_source.jpg")
print("Saved test_combined_source.jpg")
