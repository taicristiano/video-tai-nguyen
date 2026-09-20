from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# For each row y in 710..1024:
# Find chopstick x extent:
# Chopstick is in x < 750, has wood/brown or black colors
# Paper is white (R>220, G>220, B>220) and has a black border (R<60, G<60, B<60)
for y in range(710, 1024, 15):
    # Find all paper pixels: in x > 680, white pixels or black border pixels associated with paper
    # A pixel belongs to paper if it's white or within the paper polygon
    paper_pixels = np.where((arr[y, 680:, 0] > 220) & (arr[y, 680:, 1] > 220) & (arr[y, 680:, 2] > 220))[0] + 680
    if len(paper_pixels) > 0:
        paper_x_start = np.min(paper_pixels)
        # Find paper border: pixels just before paper_x_start with dark color
        border_cand = np.where(np.mean(arr[y, max(680, paper_x_start - 10):paper_x_start, :], axis=1) < 80)[0]
        if len(border_cand) > 0:
            paper_bound = max(680, paper_x_start - 10) + np.min(border_cand)
        else:
            paper_bound = paper_x_start
    else:
        paper_bound = 1024

    # Find chopstick pixels in this row
    chopstick_pixels = np.where((arr[y, :720, 0] < 80) & (arr[y, :720, 1] < 80))[0]
    # Filter chopstick: exclude divider lines
    chopstick_xs = [x for x in chopstick_pixels if x > 500]
    chop_bound = max(chopstick_xs) if len(chopstick_xs) > 0 else 0
    print(f"y={y}: Chopstick right={chop_bound}, Paper left={paper_bound}, Gap={paper_bound - chop_bound}px")
