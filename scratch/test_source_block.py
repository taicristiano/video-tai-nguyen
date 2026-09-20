from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img).copy()

# ==========================================
# 1. ACTION 1: Remove Upper Small Bowl
# ==========================================
x_start = 615
x_end = 945
y_start = 76
y_end = 343

left_col = arr[y_start:y_end, x_start, :].astype(float)
right_col = arr[y_start:y_end, x_end, :].astype(float)
width = x_end - x_start
t = np.linspace(0.0, 1.0, width).reshape(1, width, 1)
arr[y_start:y_end, x_start:x_end, :] = np.clip(
    (1.0 - t) * left_col[:, np.newaxis, :] + t * right_col[:, np.newaxis, :], 
    0, 255
).astype(np.uint8)

# ==========================================
# 2. ACTION 2: Remove White Paper Stack
# ==========================================
# Source block from clean left area: y = 715..1024, x = 30..330 (width = 300)
source_block = arr[715:1024, 30:330, :].copy().astype(float)
target_area = arr[715:1024, 724:1024, :].copy().astype(float)

# We want to paste source_block into x = 724..1024
# Let's create an alpha mask for the feather blend at the left seam of target_area (x = 724):
# In target_area (width 300):
# Column 0 corresponds to x = 724, column 299 corresponds to x = 1023.
alpha = np.ones((1024 - 715, 300), dtype=float)

# Row-dependent feather start:
for y_idx, y in enumerate(range(715, 1024)):
    if y < 745:
        # Near chopstick: start feather at col 15..35 (x = 739..759)
        f_start = 12
        f_end = 30
    elif y < 770:
        f_start = 6
        f_end = 22
    else:
        # Plenty of space: start feather at col 0..18 (x = 724..742)
        f_start = 0
        f_end = 18

    alpha[y_idx, :f_start] = 0.0
    ramp = np.linspace(0.0, 1.0, f_end - f_start)
    alpha[y_idx, f_start:f_end] = ramp
    alpha[y_idx, f_end:] = 1.0

# Blend target_area
blended = (1.0 - alpha[:, :, np.newaxis]) * target_area + alpha[:, :, np.newaxis] * source_block

# Line 3 continuity check:
# Ensure Divider Line 3 at y = 782..787 runs straight across
for y in range(782, 788):
    y_idx = y - 715
    line_val = arr[y, 650, :]
    # Apply across whole row in target_area
    blended[y_idx, :, :] = line_val

arr[715:1024, 724:1024, :] = np.clip(blended, 0, 255).astype(np.uint8)

# Check if there are any remaining paper pixels around x = 705..724 for y in 760..820
# Where the left corner of paper reached x=705
for y in range(760, 830):
    for x in range(705, 725):
        p = arr[y, x]
        # if white or paper border
        if np.mean(p) > 210 or (np.mean(p) < 60 and not (782 <= y <= 787)):
            # replace with clean wood from x=700
            arr[y, x, :] = arr[y, 700, :]

res = Image.fromarray(arr)
# Crop the paper area to inspect
res.crop((600, 650, 1024, 1024)).save("scratch/crop_test_source_block_paper.jpg")
res.save("scratch/test_source_block_cleaned.jpg")
print("Saved crop_test_source_block_paper.jpg and test_source_block_cleaned.jpg")
