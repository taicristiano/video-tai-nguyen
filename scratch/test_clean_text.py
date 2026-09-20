from PIL import Image, ImageFilter

thumb_path = "resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/05_THUMBNAILS/Thumbnail_Template_1280x720_READY.jpg"
thumb = Image.open(thumb_path).convert("RGB")

# Clean paper patch from (1040, 60, 1120, 115) - size 80x55
paper_sample = thumb.crop((1040, 60, 1120, 115))

# Paste first block for "Sống Đẹp Hơn" (y: 118..173)
thumb.paste(paper_sample, (1040, 118))
# Paste second block for "Mỗi Ngày —" (y: 170..225)
thumb.paste(paper_sample, (1040, 170))

# Soft blur on the seam
crop_seam = thumb.crop((1038, 116, 1122, 226)).filter(ImageFilter.GaussianBlur(radius=1.2))
thumb.paste(crop_seam, (1038, 116))

crop_check = thumb.crop((1000, 100, 1180, 260))
crop_check.save("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_clean_frame.jpg")
print("Saved tmp_clean_frame.jpg")
