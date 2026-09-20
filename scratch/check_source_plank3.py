from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In x = 50..350, y = 787..1024
# Check if any pixels have R < 235 (except grain lines which have R ~ 200..210)
block = arr[787:1024, 50:350, :]
print("Block shape:", block.shape)

# Check dark pixels (R < 100)
dark = np.where(block[:, :, 0] < 100)
print("Pixels with R < 100 (excluding top divider):", len(dark[0][dark[0] > 6]))

# Save this block as image to visually inspect
b_img = Image.fromarray(block)
b_img.save("scratch/test_source_plank3.jpg")
print("Saved test_source_plank3.jpg")
