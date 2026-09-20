from PIL import Image
import numpy as np

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
arr = np.array(img)

# Look at block y=160..200, x=450..550
block = arr[160:200, 450:550, :]
print("Block shape:", block.shape)
print("RGB mean:", np.mean(block, axis=(0, 1)))
print("RGB std:", np.std(block, axis=(0, 1)))
