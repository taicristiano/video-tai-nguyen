from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

left_rows = np.mean(arr[76:342, 580:610, :], axis=(1, 2))
right_rows = np.mean(arr[76:342, 920:950, :], axis=(1, 2))

for y_idx in range(5, len(left_rows)-5):
    if left_rows[y_idx] < left_rows[y_idx-1] and left_rows[y_idx] < left_rows[y_idx+1] and left_rows[y_idx] < left_rows[y_idx-3] - 2:
        print(f"Left grain line at y={y_idx+76}: val={left_rows[y_idx]:.1f}")

for y_idx in range(5, len(right_rows)-5):
    if right_rows[y_idx] < right_rows[y_idx-1] and right_rows[y_idx] < right_rows[y_idx+1] and right_rows[y_idx] < right_rows[y_idx-3] - 2:
        print(f"Right grain line at y={y_idx+76}: val={right_rows[y_idx]:.1f}")
