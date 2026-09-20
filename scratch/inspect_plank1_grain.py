from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# In plank 1 (y: 75..345)
# Look at color variations (grain lines are slightly darker brownish than base wood)
base_color = arr[150, 200, :]
print("Base wood color in plank 1:", base_color)

# Let's inspect column at x=550 (left of bowl)
col_left = arr[75:345, 550, :]
diff_left = np.mean(col_left.astype(float) - base_color.astype(float), axis=1)
# grain lines have lower values (darker)
print("Plank 1 left (x=550): min values at y:", np.where(diff_left < -15)[0] + 75)

# Inspect column at x=950 (right of bowl)
col_right = arr[75:345, 950, :]
diff_right = np.mean(col_right.astype(float) - base_color.astype(float), axis=1)
print("Plank 1 right (x=950): min values at y:", np.where(diff_right < -15)[0] + 75)
