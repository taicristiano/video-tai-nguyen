from PIL import Image

img = Image.open("scratch/test_poly_cleaned.jpg")
c = img.crop((660, 720, 760, 800))
c.save("scratch/crop_junction_poly.jpg")

c_right = img.crop((940, 710, 1024, 780))
c_right.save("scratch/crop_right_poly.jpg")
print("Saved junction and right crops")
