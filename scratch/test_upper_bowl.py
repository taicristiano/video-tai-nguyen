from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img).copy()

# Upper bowl cleanup:
# Region to replace in Plank 1: y = 76..342, x = 635..925
# Width to replace = 290px
# Let's inspect source wood block:
# Left of bowl: x = 330..620 (width 290) in the same plank y = 76..342
source_block = arr[76:342, 330:620, :].copy()

# Let's check blending with alpha mask at boundaries
# Boundary x_start = 635, x_end = 925
# Fade in from 635 to 650 (15px), fade out from 910 to 925 (15px)
alpha = np.ones((342 - 76, 290), dtype=float)
for i in range(15):
    alpha[:, i] = i / 15.0
    alpha[:, 289 - i] = i / 15.0

target_area = arr[76:342, 635:925, :].astype(float)
blended = (1.0 - alpha[:, :, np.newaxis]) * target_area + alpha[:, :, np.newaxis] * source_block.astype(float)
arr[76:342, 635:925, :] = np.clip(blended, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
# Crop around the cleaned area to inspect
crop_test = res.crop((550, 50, 980, 370))
crop_test.save("scratch/test_cleanup_upper_bowl.jpg")
print("Saved test_cleanup_upper_bowl.jpg")
