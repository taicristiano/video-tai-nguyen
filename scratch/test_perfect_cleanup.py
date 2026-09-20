from PIL import Image
import numpy as np

# Load original
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
# Clean reference vertical slice from far left (x=100) where wood has no shadows/objects
clean_slice = arr[700:1024, 100, :].astype(float) # shape: (324, 3)

# Tile clean_slice across x = 700..1024
tiled_clean = np.tile(clean_slice[:, np.newaxis, :], (1, 1024 - 700, 1))

# For y in 700..735, the real wood in Plank 2 extends further right (past x=800).
# Let's see: the paper top edge is diagonal from (x=715, y=715) to (x=1024, y=730).
# So for each row y from 700 to 1024, we only blend starting where the paper starts (minus a small margin).

paper_mask = np.zeros((324, 324), dtype=float)

for y_idx, y in enumerate(range(700, 1024)):
    # Where does the paper start at row y?
    # At y=700..714: no paper!
    if y < 715:
        continue
    elif y <= 732:
        # Top diagonal edge: slopes from x=715 at y=715 to x=1024 at y=732
        # Slope: x = 715 + (y - 715) * (1024 - 715) / (732 - 715)
        px = 715 + int((y - 715) * (1024 - 715) / 17.0)
    elif y <= 800:
        # Left edge goes from x=715 at y=715 to x=705 at y=770..800
        px = 705
    else:
        # Left edge slopes from x=705 at y=800 down to x=780 at y=1024
        px = 705 + int((y - 800) * (780 - 705) / 224.0)

    # We want a smooth feather blend of 25 pixels ending at px + 10 (inside paper)
    # Start blending at px - 15 (in clean wood)
    blend_start = max(700, px - 15)
    blend_end = min(1024, px + 10)
    
    idx_start = blend_start - 700
    idx_end = blend_end - 700
    
    if idx_end > idx_start:
        ramp = np.linspace(0.0, 1.0, idx_end - idx_start)
        paper_mask[y_idx, idx_start:idx_end] = ramp
        paper_mask[y_idx, idx_end:] = 1.0

# Apply feather blend
orig_area = arr[700:1024, 700:1024, :].astype(float)
blended = (1.0 - paper_mask[:, :, np.newaxis]) * orig_area + paper_mask[:, :, np.newaxis] * tiled_clean

# Perfect Line 3 (y=783..786): ensure Line 3 is crisp and continuous all the way to x=1024
# Line 3 profile at x=100 has divider line at y=784..787
line3_profile = arr[782:788, 100, :]
for dy in range(6):
    y = 782 + dy
    y_idx = y - 700
    # Blend Line 3 continuously across x=700..1024
    blended[y_idx, :, :] = line3_profile[dy, :]

arr[700:1024, 700:1024, :] = np.clip(blended, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
# Save test crops
res.crop((600, 650, 1024, 1024)).save("scratch/crop_test_perfect_paper.jpg")
res.save("scratch/test_perfect_cleaned.jpg")
print("Saved crop_test_perfect_paper.jpg and test_perfect_cleaned.jpg")
