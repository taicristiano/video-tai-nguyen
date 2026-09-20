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
right_col = arr[y_start:y_end, x_start:x_end, :].shape
right_col_val = arr[y_start:y_end, x_end, :].astype(float)
width = x_end - x_start
t = np.linspace(0.0, 1.0, width).reshape(1, width, 1)
arr[y_start:y_end, x_start:x_end, :] = np.clip(
    (1.0 - t) * left_col[:, np.newaxis, :] + t * right_col_val[:, np.newaxis, :], 
    0, 255
).astype(np.uint8)

# ==========================================
# 2. ACTION 2: Remove White Paper Stack
# ==========================================
# Source clean wood block from far left: x = 50..400 (width = 350), y = 715..1024 (height = 309)
source_plank = arr[715:1024, 50:400, :].copy().astype(float)

# We want to replace everything where the paper was:
# In region y = 715..1024, x = 680..1024 (width = 344)
target_region = arr[715:1024, 680:1024, :].astype(float)
source_patch = source_plank[:, :344, :] # shape (309, 344, 3)

# Build alpha mask over (309, 344)
# Column 0 corresponds to x = 680
alpha_mask = np.zeros((309, 344), dtype=float)

for y_idx, y in enumerate(range(715, 1024)):
    if y < 735:
        # Paper starts at x >= 780
        cut_x = 760
    elif y < 760:
        # Paper starts at x >= 735
        cut_x = 730
    elif y < 770:
        cut_x = 705
    else:
        # Paper left corner reached x = 705, chopstick is at x <= 675
        cut_x = 695

    # In target_region coords (offset 680)
    col_cut = cut_x - 680
    f_start = max(0, col_cut - 8)
    f_end = min(344, col_cut + 6)
    
    alpha_mask[y_idx, :f_start] = 0.0
    if f_end > f_start:
        alpha_mask[y_idx, f_start:f_end] = np.linspace(0.0, 1.0, f_end - f_start)
    alpha_mask[y_idx, f_end:] = 1.0

# Blend
blended_region = (1.0 - alpha_mask[:, :, np.newaxis]) * target_region + alpha_mask[:, :, np.newaxis] * source_patch

# Divider Line 3 (y = 782..787)
# Continue Divider Line 3 seamlessly across x = 680..1024
line3_prof = arr[782:788, 650, :]
for dy in range(6):
    y = 782 + dy
    y_idx = y - 715
    blended_region[y_idx, :, :] = line3_prof[dy, :]

arr[715:1024, 680:1024, :] = np.clip(blended_region, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
res.crop((600, 650, 1024, 1024)).save("scratch/crop_test_source_block2.jpg")
res.save("scratch/test_source_block_cleaned2.jpg")
print("Saved crop_test_source_block2.jpg and test_source_block_cleaned2.jpg")
