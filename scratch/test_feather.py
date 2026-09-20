from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img).copy()

# 1. Clean Upper Bowl (x: 615..945, y: 76..343)
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

# 2. Clean Paper (Lower-Right)
# In Plank 2 and Plank 3 (y: 710..1024, x: 690..1024)
# First, construct the clean synthetic wood block for (y: 710..1024, x: 680..1024)
# Reference column at x=685 (where it's clean wood):
ref_col = arr[710:1024, 685, :].copy().astype(float)

# In ref_col, let's verify Line 3 profile at y=780..788
# Line 3 profile from x=685:
# Let's ensure Line 3 is sharp and clean
for y in range(781, 787):
    # exact Line 3 dark values
    ref_col[y - 710, :] = arr[y, 650, :]

# Grain lines in Plank 2: y = 745 (let's ensure soft brown line)
# Grain lines in Plank 3: y = 818, 845, 863, 882, 923, 981 (present in ref_col)

# Create the full reconstructed block for x=690..1024
reconstructed = np.tile(ref_col[:, np.newaxis, :], (1, 1024 - 690, 1))

# For y in 710..740, the original wood in Plank 2 extends further right (up to x=900+)!
# So only replace where paper was!
# Let's define the alpha mask for where the paper is:
paper_mask = np.zeros((1024 - 710, 1024 - 690), dtype=float)

for y_idx, y in enumerate(range(710, 1024)):
    # Find paper start x in row y
    row = arr[y, 690:1024, :]
    is_paper = (row[:, 0] > 220) & (row[:, 1] > 220) & (row[:, 2] > 220)
    is_dark_border = (row[:, 0] < 80) & (row[:, 1] < 80) & (row[:, 2] < 80)
    
    if np.any(is_paper):
        first_p = np.where(is_paper)[0][0] + 690
        # Check border
        b_cand = np.where(np.mean(arr[y, max(690, first_p-15):first_p, :], axis=1) < 80)[0]
        if len(b_cand) > 0:
            start_x = max(690, first_p-15) + np.min(b_cand)
        else:
            start_x = first_p
    elif y >= 780 and np.any(is_dark_border):
        # below y=780, check dark border
        db = np.where(is_dark_border)[0] + 690
        # filter out line 3
        if not (781 <= y <= 787):
            start_x = np.min(db) if len(db) > 0 else 1024
        else:
            start_x = 710
    else:
        start_x = 1024 if y < 730 else 740

    # Ensure start_x doesn't touch chopsticks
    start_x = max(705, start_x)
    
    # We want smooth transition from start_x - 15 to start_x + 5
    trans_start = max(690, start_x - 15)
    trans_end = min(1024, start_x + 5)
    
    # Alpha = 0 before trans_start, ramp to 1 at trans_end, 1 to 1024
    offset_start = trans_start - 690
    offset_end = trans_end - 690
    
    if offset_end > offset_start:
        ramp = np.linspace(0.0, 1.0, offset_end - offset_start)
        paper_mask[y_idx, offset_start:offset_end] = ramp
        paper_mask[y_idx, offset_end:] = 1.0

# Apply the reconstruction using paper_mask
orig_block = arr[710:1024, 690:1024, :].astype(float)
blended_block = (1.0 - paper_mask[:, :, np.newaxis]) * orig_block + paper_mask[:, :, np.newaxis] * reconstructed

# Also ensure Line 3 (y=782..786) is cleanly drawn all the way across
for y in range(782, 787):
    y_idx = y - 710
    # Line 3 profile from x=650
    blended_block[y_idx, :, :] = arr[y, 650, :]

arr[710:1024, 690:1024, :] = np.clip(blended_block, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
crop_paper = res.crop((650, 680, 1024, 1024))
crop_paper.save("scratch/test_feather_paper.jpg")

res.save("scratch/test_full_cleaned2.jpg")
print("Saved test_feather_paper.jpg and test_full_cleaned2.jpg")
