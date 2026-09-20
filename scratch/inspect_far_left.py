from PIL import Image

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
c = img.crop((0, 700, 200, 1024))
c.save("scratch/crop_far_left.jpg")
print("Saved crop_far_left.jpg")
