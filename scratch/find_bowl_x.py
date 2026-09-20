from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

clean_wood_left = arr[76:343, 400, :]
clean_wood_right = arr[76:343, 980, :]

diffs = []
for x in range(400, 1000):
    col = arr[76:343, x, :]
    alpha = (x - 400) / (980 - 400)
    expected = (1 - alpha) * clean_wood_left + alpha * clean_wood_right
    d = np.max(np.abs(col.astype(float) - expected), axis=1)
    diffs.append((x, np.max(d)))

diffs = np.array(diffs)
bowl_xs = diffs[diffs[:, 1] > 25, 0]
print("Upper bowl and shadow x range (threshold 25):", np.min(bowl_xs), "to", np.max(bowl_xs))
# Also let's find the y range in that x range
mask = np.zeros((343 - 76, 1000 - 400), dtype=bool)
for i, x in enumerate(range(400, 1000)):
    col = arr[76:343, x, :]
    alpha = (x - 400) / (980 - 400)
    expected = (1 - alpha) * clean_wood_left + alpha * clean_wood_right
    mask[:, i] = np.max(np.abs(col.astype(float) - expected), axis=1) > 25

y_ind, x_ind = np.where(mask)
print("Upper bowl y range:", np.min(y_ind) + 76, "to", np.max(y_ind) + 76)
print("Upper bowl x range:", np.min(x_ind) + 400, "to", np.max(x_ind) + 400)
