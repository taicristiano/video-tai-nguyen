import numpy as np
from PIL import Image, ImageFilter

thumb_path = "resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/05_THUMBNAILS/Thumbnail_Template_1280x720_READY.jpg"
logo_path = "resources/hay-va-dep/HAY_DEP_ALL_READY_COMPLETE/HAY_DEP_ALL_MEDIA_READY/01_LOGO_AVATAR/Logo_Full_Horizontal_With_Slogan.png"
out_path = "public/assets/human-insight/brand/outro-9-16.png"

# 1. Load and clean thumbnail desk scene
thumb = Image.open(thumb_path).convert("RGB")

# Seamless paper patch
paper_sample = thumb.crop((1045, 60, 1125, 115))
thumb.paste(paper_sample, (1040, 118))
thumb.paste(paper_sample, (1040, 170))
crop_seam = thumb.crop((1035, 114, 1128, 228)).filter(ImageFilter.GaussianBlur(radius=2.0))
thumb.paste(crop_seam, (1035, 114))

# 2. Crop desk scene (x=530, y=0, w=750, h=720) and scale to 1080x1036
desk_crop = thumb.crop((530, 0, 1280, 720)).resize((1080, 1036), Image.Resampling.LANCZOS)

# 3. Create 1080x1920 base canvas (#F6F1E8)
base = Image.new("RGBA", (1080, 1920), (246, 241, 232, 255))

# 4. Create feather mask for desk top (top 240px gradient)
desk_rgba = desk_crop.convert("RGBA")
desk_arr = np.array(desk_rgba)
alpha_grad = np.ones((1036, 1080), dtype=np.float32)
feather_h = 240
for y in range(feather_h):
    alpha_grad[y, :] = y / feather_h
desk_arr[:, :, 3] = (desk_arr[:, :, 3].astype(np.float32) * alpha_grad).astype(np.uint8)
desk_feathered = Image.fromarray(desk_arr)

# Paste desk at y=884
base.paste(desk_feathered, (0, 884), desk_feathered)

# 5. Clean and recolor Logo
logo = Image.open(logo_path).convert("RGBA")
logo_arr = np.array(logo)

# Find beige pixels in & and . (R > 175, G > 165, B > 155, A > 30)
mask_beige = (logo_arr[:, :, 0] > 175) & (logo_arr[:, :, 1] > 165) & (logo_arr[:, :, 2] > 155) & (logo_arr[:, :, 3] > 30)

# Exact deep sage green matching HAY & ĐẸP: [65, 79, 55]
logo_arr[mask_beige, 0] = 65
logo_arr[mask_beige, 1] = 79
logo_arr[mask_beige, 2] = 55

clean_logo = Image.fromarray(logo_arr)

# Scale logo to width 860px
w_orig, h_orig = clean_logo.size
scale_factor = 860.0 / w_orig
new_h = int(round(h_orig * scale_factor))
clean_logo_scaled = clean_logo.resize((860, new_h), Image.Resampling.LANCZOS)

# Center logo horizontally at y=520
logo_x = (1080 - 860) // 2
logo_y = 520
base.paste(clean_logo_scaled, (logo_x, logo_y), clean_logo_scaled)

base.save(out_path, "PNG")
print("Successfully generated clean outro-9-16.png at:", out_path)
