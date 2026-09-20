from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Crop the region around x=680..1024, y=690..810
c = img.crop((680, 690, 1024, 810))
c.save("scratch/crop_paper_top.jpg")
print("Saved crop_paper_top.jpg")
