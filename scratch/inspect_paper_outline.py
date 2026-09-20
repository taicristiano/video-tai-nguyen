from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

paper_area = (arr[650:1024, 650:1024, 0] > 230) & (arr[650:1024, 650:1024, 1] > 230) & (arr[650:1024, 650:1024, 2] > 230)
y_ind, x_ind = np.where(paper_area)
print("Paper only: y from", np.min(y_ind) + 650, "to", np.max(y_ind) + 650)
print("Paper only: x from", np.min(x_ind) + 650, "to", np.max(x_ind) + 650)

# Check the black outline of the paper in this area:
# The top-left corner of the paper outline
outline = (arr[680:1024, 680:1024, :] < 60).all(axis=2)
# But chopsticks also have black outline! Where are chopsticks vs paper?
# Chopsticks at y=700..800 are around x=680..720.
# The paper top-left is around x=720, y=715.
# Let's inspect slice x=700..750, y=700..750
print("Slice x=715..730, y=710..725:")
for y in range(710, 725):
    row_chars = ""
    for x in range(715, 735):
        p = arr[y, x]
        if np.mean(p) < 60:
            row_chars += "#" # black outline
        elif np.mean(p) > 230:
            row_chars += "." # white paper
        else:
            row_chars += " " # wood
    print(f"y={y}: {row_chars}")
