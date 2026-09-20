from PIL import Image

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")
wood_plank1 = img.crop((100, 76, 500, 343))
wood_plank1.save("scratch/wood_plank1_sample.jpg")

wood_plank2 = img.crop((50, 352, 200, 780))
wood_plank2.save("scratch/wood_plank2_sample.jpg")

wood_plank3 = img.crop((50, 790, 450, 1024))
wood_plank3.save("scratch/wood_plank3_sample.jpg")

print("Saved wood samples")
