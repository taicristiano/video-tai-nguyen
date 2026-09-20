from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# For y in range 710..900, find max x of chopstick outline and min x of paper outline
for y in range(715, 850, 10):
    row = arr[y, 650:780, :]
    # dark outline pixels
    dark_xs = np.where((row[:, 0] < 60) & (row[:, 1] < 60) & (row[:, 2] < 60))[0] + 650
    # light paper pixels
    paper_xs = np.where((row[:, 0] > 220) & (row[:, 1] > 220) & (row[:, 2] > 220))[0] + 650
    
    chopstick_dark = [x for x in dark_xs if x < 725]
    paper_dark = [x for x in dark_xs if x >= 705 and (len(paper_xs) > 0 and x <= min(paper_xs))]
    print(f"y={y}: chopstick dark xs={chopstick_dark[:3]}, paper dark xs={paper_dark[:3] if paper_dark else 'none'}")
