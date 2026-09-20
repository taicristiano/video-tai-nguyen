from PIL import Image

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
c = img.crop((850, 350, 1024, 730))
c.save("scratch/crop_right_middle.jpg")
print("Saved crop_right_middle.jpg")
