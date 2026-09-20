from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img).copy()

# Row-wise horizontal interpolation across the upper bowl
# x_start = 615, x_end = 945
# y_start = 76, y_end = 342
x_start = 615
x_end = 945
y_start = 76
y_end = 343

left_col = arr[y_start:y_end, x_start, :].astype(float)
right_col = arr[y_start:y_end, x_end, :].astype(float)

width = x_end - x_start
t = np.linspace(0.0, 1.0, width).reshape(1, width, 1)

interpolated = (1.0 - t) * left_col[:, np.newaxis, :] + t * right_col[:, np.newaxis, :]

arr[y_start:y_end, x_start:x_end, :] = np.clip(interpolated, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
crop_test = res.crop((550, 50, 1000, 370))
crop_test.save("scratch/test_row_interp_upper_bowl.jpg")
print("Saved test_row_interp_upper_bowl.jpg")
