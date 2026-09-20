from PIL import Image

img = Image.open("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_candidates/shot12_cand1.jpg")
# In 1024x1024, the boy is in the bottom left sitting at table
# Let us crop x: 50..300, y: 530..800
c = img.crop((60, 540, 280, 760))
c.save("videos/phan-1-2026-09-18-co-nhung-bua-com-sau-nay-moi-hieu/qa/tmp_faces/test_boy12.jpg")
print("Saved test_boy12.jpg")
