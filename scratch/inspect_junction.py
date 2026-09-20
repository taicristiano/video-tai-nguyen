from PIL import Image

img = Image.open("scratch/production-smoke/video001/assets/shot-08-vb2.jpg")

# The chopsticks run from bottom-left to top-right.
# Let's crop the junction around x: 680..760, y: 700..800
junction = img.crop((680, 700, 760, 800))
junction.save("scratch/chopstick_paper_junction.jpg")
print("Saved chopstick_paper_junction.jpg")
