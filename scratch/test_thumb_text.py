from PIL import Image

thumb = Image.open("resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/05_THUMBNAILS/Thumbnail_Template_1280x720_READY.jpg")
c = thumb.crop((1000, 100, 1180, 260))
c.save("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_thumb_frame.jpg")
print("Saved tmp_thumb_frame.jpg")
