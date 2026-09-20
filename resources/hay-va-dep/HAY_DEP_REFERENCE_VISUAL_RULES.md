# HAY & ĐẸP. REFERENCE VISUAL RULES

Tài liệu tổng hợp nguyên tắc thị giác biên tập (Editorial Visual Grammar) cho dòng video HAY & ĐẸP. (template human-insight/cinematic-light V2.1).

*Ghi chú context*: Trong working repository không chứa file reference video MP4 raw từ người dùng. Theo chỉ dẫn tại Mục 2 của PROMPT_GEMINI_HAY_DEP_V21_MACRO_COMPOSITION.md, các quy tắc dưới đây được chuẩn hóa trực tiếp từ bản đặc tả hợp đồng thị giác V2.1 để đảm bảo tính nhất quán và loại bỏ triệt để silhouette slideshow dạng card đóng khung.

---

## 1. Tần suất và Nhịp điệu Thay đổi Thị giác (Pacing & Rhythm)

- **Chu kỳ thị giác tiêu chuẩn (Normal narration)**: Thay đổi trạng thái thị giác mỗi **1.8 – 3.5 giây**.
- **Điểm dừng cảm xúc (Emotional hold)**: Giữ hình ảnh tĩnh/êm trong **3.5 – 4.8 giây**.
- **Ngưỡng tối đa**: Tuyệt đối không để một shot kéo dài quá **5.0 giây** mà không có visual state change (đổi góc nhìn, crop scale, composition, hoặc visual beat), trừ trường hợp câu hỏi mở hoặc outro.
- **Tiêu chuẩn  Visual State Change**: Phải là sự biến chuyển cấu trúc rõ rệt:
  - Đổi ảnh minh họa / semantic subject.
  - Chuyển shot scale (Wide → Medium → Close → Detail).
  - Đổi composition preset (Full-bleed vs Editorial split vs Detail insert vs Portrait focus).
  - Chuyển tiêu điểm (Focal point).
  *(Các dao động vi mô như pan 5px, scale 1.015, đổi chữ subtitle KHÔNG được tính là visual state change)*.

---

## 2. Chuỗi Shot Biên tập (Editorial Shot Sequence)

Tránh chuỗi hình ảnh đơn điệu bằng cách áp dụng cấu trúc điện ảnh đời thường:
`	ext
Wide establishing (Bối cảnh chung / bàn ăn / căn bếp)
→ Medium human / action (Nhân vật / tương tác gia đình / gắp thức ăn)
→ Close / detail (Chi tiết / bàn tay / bát cơm / ánh mắt)
→ Detail / object insert (Chiếc điện thoại đặt sang một bên / chiếc ghế trống)
→ Wide return (Trở lại bối cảnh rộng như một ký ức đọng lại)
`

- **Quy tắc chuyển tiếp**:
  - Không dùng 3 shot liên tiếp có cùng shot scale.
  - Không dùng nhiều hơn 2 beat liên tiếp có cùng composition preset.

---

## 3. Phân bổ Tỷ lệ Bố cục (Target Composition Mix)

Trong một video hoàn chỉnh thời lượng 45–75 giây:
- **Full-bleed (Toàn màn hình 1080x1920)**: **25% – 40%**. Mang lại sự đắm chìm, loại bỏ hoàn toàn viền card và bóng đổ. Bắt buộc có ít nhất 1 full-bleed trong 8 giây đầu tiên.
- **Editorial Split (Left / Right)**: **20% – 30%**. Tạo không gian thở bất đối xứng mang tính tạp chí cao cấp.
- **Portrait Focus**: **15% – 25%**. Tôn vinh chân dung và nhân vật trung tâm.
- **Detail Insert (Dải ngang tập trung chi tiết)**: **15% – 25%**. Đưa người xem đến gần các vật phẩm giàu cảm xúc. Có ít nhất 3 detail inserts trong video.
- **Tactile Paper Card**: **0% – 15%** (Tối đa 20%). Chỉ sử dụng khi mang tính hồi tưởng, nhật ký, bưu thiếp. Không dùng làm container mặc định.

---

## 4. Hành vi Tiêu đề và Định vị Phụ đề (Title & Subtitle Behavior)

- **Global Title**: Chỉ đóng vai trò mở đầu (Hook). Xuất hiện 0.0s – 0.4s, giữ ổn định đến 3.0s, mờ dần và biến mất hoàn toàn sau 3.7s (khung hình ~112). Sau đó, màn hình hoàn toàn dành cho ngôn ngữ thị giác và phụ đề biên tập.
- **Logo Mark HAY & ĐẸP.**: Hiện diện tinh tế, thanh mảnh ở góc trên, không tạo áp lực đóng khung header.
- **Phụ đề Thích ứng (Adaptive Subtitles)**:
  - elow-visual: Đặt tại ottom: 14% đối với các khung hình có khoảng trống phía dưới.
  - overlay-bottom: Đặt tại ottom: 10% với lớp phủ tương phản cực nhẹ cho ull-bleed hoặc khung lớn.
  - overlay-top: Đặt tại 	op: 18% khi visual tập trung ở nửa dưới.
  - hidden: Tắt trong outro hoặc các thẻ châm ngôn cô đọng.

---

## 5. Kỹ thuật Chuyển cảnh (Transition Dynamics)

- **Giữa các Scene**: Hard cut sạch sẽ (extraFrames = 0). Loại bỏ hoàn toàn hiện tượng chồng ảnh bóng ma (ghosting).
- **Giữa các Visual Beat trong Scene**: True crossfade đồng thời — lớp beat cũ mờ dần (1 → 0) trong khi lớp beat mới hiện dần (0 → 1) trên cùng một trục thời gian (6–8 khung hình).
