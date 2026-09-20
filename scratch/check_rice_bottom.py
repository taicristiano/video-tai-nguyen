from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Find bottom of rice bowl:
# Bowl has dark rim (R<100, G<100, B<100) or cast shadow
# In x: 100..600, y: 600..800
rice_mask = (arr[600:800, 100:600, 0] < 120) & (arr[600:800, 100:600, 1] < 120) & (arr[600:800, 100:600, 2] < 120)
y_ind, x_ind = np.where(rice_mask)
print("Rice bowl in y=600..800: max y=", np.max(y_ind) + 600, "x range:", np.min(x_ind) + 100, "to", np.max(x_ind) + 100)

# Also check cast shadow of rice bowl:
# Shadow has darker tone: arr[y, x] < [220, 150, 90]
shadow_mask = (arr[600:800, 100:600, 0] < 220) & (arr[600:800, 100:600, 1] < 150)
y_s, x_s = np.where(shadow_mask)
print("Rice bowl shadow in y=600..800: max y=", np.max(y_s) + 600, "x range:", np.min(x_s) + 100, "to", np.max(x_s) + 100)
