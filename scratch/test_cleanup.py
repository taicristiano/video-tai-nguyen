from PIL import Image
import numpy as np

# Load image
img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img).copy()

# Step 1: Upper bowl cleanup (already proven perfect)
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

# Step 2: Paper cleanup (lower-right corner)
# Let's find the paper boundary for each row y from 710 to 1024
# At each row y, paper starts at paper_x_start(y).
# Everything from paper_x_start(y) to 1024 should be replaced by extending the clean wood.

# Let's determine paper_x_start for each row y
for y in range(712, 1024):
    # Search from right to left in row y to find the leftmost paper pixel / border
    # Paper has white pixels (R>220, G>220, B>220) or border pixels
    # In x from 700 to 1024
    row = arr[y, 700:1024, :]
    # A pixel is paper if it's white or if it's inside the paper region
    # Look at brightness
    is_white = (row[:, 0] > 220) & (row[:, 1] > 220) & (row[:, 2] > 220)
    if np.any(is_white):
        first_white = np.where(is_white)[0][0] + 700
        # Check border 12px before first_white
        search_start = max(700, first_white - 12)
        border_cand = np.where(np.mean(arr[y, search_start:first_white, :], axis=1) < 80)[0]
        if len(border_cand) > 0:
            paper_x = search_start + np.min(border_cand)
        else:
            paper_x = first_white
    else:
        # Check if the paper black border is here
        dark_pixels = np.where(np.mean(row, axis=1) < 80)[0]
        if len(dark_pixels) > 0:
            paper_x = 700 + np.min(dark_pixels)
        else:
            continue

    # Safety: ensure paper_x is well to the right of the chopstick
    # For this row y, clean wood source should be around paper_x - 3
    # Clean wood source x:
    src_x = paper_x - 3
    # Target to fill: from paper_x to 1024
    # But wait! For y = 781..786, this is Divider Line 3!
    # For Divider Line 3, we want the line profile from x=690
    if 781 <= y <= 786:
        # Sample line from x=690
        arr[y, paper_x:1024, :] = arr[y, 690, :]
    else:
        # Base wood / grain line: extend from src_x
        # To avoid single-pixel noise, average src_x-3 to src_x
        src_val = np.mean(arr[y, max(670, src_x-3):src_x, :], axis=0)
        arr[y, paper_x:1024, :] = src_val.astype(np.uint8)

# Let's inspect the cleaned paper region
res = Image.fromarray(arr)
crop_paper = res.crop((650, 680, 1024, 1024))
crop_paper.save("scratch/test_cleanup_paper.jpg")

# Also save the full cleaned image
res.save("scratch/test_full_cleaned.jpg")
print("Saved test_cleanup_paper.jpg and test_full_cleaned.jpg")
