from PIL import Image
import numpy as np

logo = Image.open("resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/01_LOGO_AVATAR/Logo_Full_Horizontal_With_Slogan.png").convert("RGBA")
arr = np.array(logo)

# Find unique colors or inspect the green vs beige
# Green is roughly R: 45..65, G: 65..90, B: 45..65
# Beige is roughly R: 220..250, G: 215..245, B: 200..235, A > 20

mask_beige = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 170) & (arr[:, :, 2] > 160) & (arr[:, :, 3] > 30)
print("Beige pixel count in logo:", np.sum(mask_beige))

# Target green from HAY
mask_green = (arr[:, :, 0] < 80) & (arr[:, :, 1] > 60) & (arr[:, :, 1] < 100) & (arr[:, :, 2] < 80) & (arr[:, :, 3] > 200)
avg_green = arr[mask_green].mean(axis=0)
print("Average green RGBA:", avg_green)
