from PIL import Image

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")

# Let's save crops to scratch to inspect details
# 1. Upper bowl region
upper_crop = img.crop((600, 60, 920, 350))
upper_crop.save("scratch/crop_upper_bowl.jpg")

# 2. Lower bowl and chopsticks region
lower_crop = img.crop((500, 480, 920, 900))
lower_crop.save("scratch/crop_lower_bowl.jpg")

# 3. White sheet at bottom right
sheet_crop = img.crop((680, 700, 1024, 1024))
sheet_crop.save("scratch/crop_white_sheet.jpg")

print("Saved crops for inspection")
