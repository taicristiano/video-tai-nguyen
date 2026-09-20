from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Let's inspect the paper boundary:
# For each row y in 710..1024, find the first x from left where paper begins
paper_starts = []
for y in range(710, 1024):
    row = arr[y, 680:, :]
    # Paper is white (R>220, G>220, B>220)
    white_indices = np.where((row[:, 0] > 220) & (row[:, 1] > 220) & (row[:, 2] > 220))[0]
    if len(white_indices) > 0:
        w_first = white_indices[0] + 680
        # Check border just before white
        dark_before = np.where(np.mean(arr[y, max(680, w_first-15):w_first, :], axis=1) < 80)[0]
        if len(dark_before) > 0:
            b_first = max(680, w_first-15) + dark_before[0]
        else:
            b_first = w_first
        paper_starts.append((y, b_first, w_first))
    else:
        # Check if border is present
        pass

print(f"Total rows with paper: {len(paper_starts)}")
print("First row:", paper_starts[0])
print("Row at y=750:", [p for p in paper_starts if p[0] == 750])
print("Row at y=800:", [p for p in paper_starts if p[0] == 800])
print("Row at y=900:", [p for p in paper_starts if p[0] == 900])
print("Row at y=1000:", [p for p in paper_starts if p[0] == 1000])
