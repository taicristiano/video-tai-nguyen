from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In region x: 550..950, y: 76..342
# The wood color has R around 200..220, G around 135..155, B around 75..95.
# The bowl has ceramic green/grey: R ≈ 180..205, G ≈ 185..205, B ≈ 165..185.
# Or shadows: R ≈ 170..190, G ≈ 110..130, B ≈ 65..80.
# Let's inspect the bounding box of where the bowl and shadow are different from plain wood.

# Compare with the clean wood column at x=550 (from y=76 to 342)
clean_col = arr[76:342, 550, :]
region = arr[76:342, 550:950, :]

print("Region shape:", region.shape)
