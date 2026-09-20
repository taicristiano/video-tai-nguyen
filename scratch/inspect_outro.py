from PIL import Image

img = Image.open("public/assets/human-insight/brand/outro-9-16.png").convert("RGB")
crop_print = img.crop((500, 900, 850, 1400))
crop_print.save("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_outro_print.jpg")
print("Saved tmp_outro_print.jpg")

crop_logo = img.crop((100, 550, 980, 900))
crop_logo.save("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_outro_logo.jpg")
print("Saved tmp_outro_logo.jpg")
