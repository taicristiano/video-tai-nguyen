from PIL import Image, ImageFilter
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
# Let's create an exact binary mask for the paper area
# Polygon vertices defining the paper stack:
# Top-left corner: (x=718, y=753)
# Top-right corner: (x=1024, y=728)
# Mid-left bend: (x=703, y=800)
# Bottom-left: (x=778, y=1024)
# Bottom-right: (x=1024, y=1024)

from PIL import ImageDraw

mask_img = Image.new('L', (1024, 1024), 0)
draw = ImageDraw.Draw(mask_img)

poly = [
    (716, 750),
    (1024, 725),
    (1024, 1024),
    (776, 1024),
    (701, 800)
]
draw.polygon(poly, fill=255)

# Slightly blur mask for smooth feathered anti-aliasing (radius = 2.5)
feathered_mask = mask_img.filter(ImageFilter.GaussianBlur(radius=2.5))
mask_arr = np.array(feathered_mask).astype(float) / 255.0

# Synthesize replacement wood block for the whole 1024x1024 canvas
# 1) Base wood everywhere is [253, 186, 117]
replacement = np.full((1024, 1024, 3), [253, 186, 117], dtype=float)

# 2) For Plank 3 (y >= 787), take the hand-drawn wood grain from clean source on left (x: 50..350, y: 787..1024)
plank3_source = arr[787:1024, 50:350, :].astype(float)
# Tile across the width of the paper (x = 700..1024)
tiled_plank3 = np.tile(plank3_source, (1, 2, 1))[:, :1024 - 700, :]
replacement[787:1024, 700:1024, :] = tiled_plank3

# 3) In Plank 2 (y < 782), draw the grain line at y ≈ 769 if needed, or let's sample Plank 2 from x=100
plank2_source = arr[715:782, 50:350, :].astype(float)
tiled_plank2 = np.tile(plank2_source, (1, 2, 1))[:, :1024 - 700, :]
replacement[715:782, 700:1024, :] = tiled_plank2

# 4) Divider Line 3 (y = 782..787)
# Crisp horizontal line sampled from x=650
line3_prof = arr[782:788, 650, :]
for dy in range(6):
    y = 782 + dy
    replacement[y, 700:1024, :] = line3_prof[dy, :]

# Composite replacement onto arr using mask_arr
composite = (1.0 - mask_arr[:, :, np.newaxis]) * arr.astype(float) + mask_arr[:, :, np.newaxis] * replacement
arr = np.clip(composite, 0, 255).astype(np.uint8)

res = Image.fromarray(arr)
# Save inspection crop
res.crop((600, 650, 1024, 1024)).save("scratch/crop_test_poly_paper.jpg")
res.save("scratch/test_poly_cleaned.jpg")
print("Saved crop_test_poly_paper.jpg and test_poly_cleaned.jpg")
