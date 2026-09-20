from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Check the small bowl shadow in region y=650..740, x=800..1024
c = img.crop((800, 650, 1024, 750))
c.save("scratch/crop_small_bowl_shadow.jpg")
print("Saved crop_small_bowl_shadow.jpg")
