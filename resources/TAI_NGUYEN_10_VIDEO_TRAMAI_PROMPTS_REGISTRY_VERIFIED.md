# TÀI NGUYÊN. — 10 VIDEO ĐẦU CHO TRẠM AI

> Cách dùng: copy nguyên từng block `/gen-video ...` vào Trạm AI.  
> Template chính dùng cho batch test đầu tiên: `creative/free-style-sfx`  
> Style chung: video dọc 9:16, 40–50 giây, dark cinematic, chữ trắng, electric blue, diagram/data-flow rõ, giọng nam trung tính, không intro dài.  
> Kết video: `TÀI NGUYÊN. — Hiểu từ nguyên lý.`

> **Registry verified:** `creative/free-style-sfx` là template ID có thật trong `registry.ts`, behavior `creative`, tỷ lệ `9:16`, có background music và transition SFX.  
> Không dùng `creative/spatial-flow-sfx` vì template ID đó không có trong registry hiện tại.  
> Với các video evergreen/explainer, ưu tiên `creative/free-style-sfx`; chỉ test `news/tech-dark` hoặc `news/business-terminal-dark` khi muốn cố ý tạo cảm giác bản tin.

---

## VIDEO 01 — TikTok biết bạn thích gì bằng cách nào?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, phong cách dark cinematic technology editorial, chữ trắng và electric blue.

Tiêu đề: TikTok biết bạn thích gì bằng cách nào?

Nội dung voice-over:

Bạn không cần bấm Like để TikTok biết bạn có thể thích một video.

Ngay từ lúc bạn xem, hệ thống đã nhận được nhiều tín hiệu: bạn xem bao lâu, có lướt qua ngay không, có xem lại, mở bình luận, chia sẻ hay tìm thêm nội dung tương tự.

Từ những tín hiệu đó, hệ thống ước tính nhóm nội dung nào có khả năng khiến bạn xem tiếp.

Sau đó, TikTok thử đưa thêm những video có đặc điểm gần với thứ bạn vừa quan tâm.

Nếu bạn tiếp tục xem, tín hiệu càng rõ hơn. Nếu bạn lướt qua, hệ thống lại điều chỉnh.

Vì vậy, For You không chỉ học từ thứ bạn bấm Like.

Nó học từ cách bạn xem.

Kết: Nhưng một video mới được TikTok chọn để thử với nhóm người xem đầu tiên bằng cách nào?

Visual: smartphone feed, watch time, skip, replay, comment, share, search, user behavior signals, nodes, recommendation flow. Không dùng hình robot hoặc não AI sáo rỗng.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 02 — Quẹt thẻ 100.000đ, tiền đi đâu?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, dark cinematic, visual dạng transaction flow.

Tiêu đề: Bạn quẹt thẻ 100.000đ. Tiền đi đâu?

Nội dung voice-over:

Bạn vừa quẹt thẻ 100.000 đồng.

Hai giây sau, máy báo: thanh toán thành công.

Nhưng tiền chưa chạy thẳng từ thẻ của bạn sang tài khoản cửa hàng.

Đầu tiên, máy POS gửi yêu cầu đến đơn vị xử lý thanh toán của cửa hàng.

Yêu cầu tiếp tục đi qua mạng lưới thẻ, rồi đến ngân hàng phát hành thẻ của bạn.

Ngân hàng kiểm tra những thứ như trạng thái thẻ, hạn mức và khả năng chấp nhận giao dịch.

Nếu được duyệt, tín hiệu chấp thuận đi ngược trở lại máy POS.

Thứ xảy ra trong vài giây chủ yếu là quá trình xin phép giao dịch.

Việc đối soát và chuyển tiền thực tế có thể diễn ra sau đó.

Vì vậy: quẹt thẻ hai giây không có nghĩa tiền đã hoàn tất hành trình trong hai giây.

Kết: Vậy QR ngân hàng khác quy trình này ở đâu?

Visual flow: Card → POS → Acquirer/Processor → Card Network → Issuing Bank → Approval → POS. Sau đó thêm lớp Settlement diễn ra phía sau.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 03 — Google tìm kiếm nhanh như vậy bằng cách nào?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, dark editorial, visual crawler-index-query-ranking.

Tiêu đề: Google tìm kiếm nhanh như vậy bằng cách nào?

Nội dung voice-over:

Google không chạy đi tìm cả Internet mỗi khi bạn bấm Search.

Phần lớn công việc đã xảy ra từ trước.

Các hệ thống thu thập dữ liệu của Google liên tục phát hiện và đọc những trang web mà chúng có thể truy cập.

Thông tin phù hợp được xử lý và đưa vào một kho chỉ mục khổng lồ — giống như mục lục của Internet.

Khi bạn gõ một câu hỏi, Google chủ yếu tìm trong chỉ mục đó.

Sau đó, hệ thống cố xác định những trang nào liên quan nhất với truy vấn của bạn và sắp xếp chúng theo rất nhiều tín hiệu khác nhau.

Cuối cùng, kết quả được gửi về màn hình trong tích tắc.

Vì vậy, Google Search không bắt đầu từ Internet.

Nó bắt đầu từ bản đồ Internet mà Google đã xây dựng trước đó.

Kết: Nhưng Google quyết định trang nào đứng số một bằng cách nào?

Visual: Web pages → crawler → processing → index → user query → ranking → search results.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 04 — Freeship nhưng shipper vẫn được trả tiền. Ai trả?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, business explainer, dark cinematic, money-flow visualization.

Tiêu đề: Freeship nhưng shipper vẫn được trả tiền. Ai trả?

Nội dung voice-over:

Bạn đặt một đơn hàng và thấy phí vận chuyển bằng 0.

Nhưng shipper chắc chắn không chạy miễn phí.

Vậy tiền ship đến từ đâu?

Thực tế, “freeship” thường là một chương trình trợ giá.

Một phần chi phí có thể được nền tảng chi từ ngân sách marketing.

Một phần có thể đến từ người bán thông qua phí tham gia chương trình, hoa hồng hoặc các cơ chế khuyến mại khác.

Và đôi khi ưu đãi chỉ áp dụng khi đơn hàng đạt điều kiện nhất định.

Nói cách khác, chi phí vận chuyển vẫn tồn tại.

Chỉ là người mua không nhìn thấy nó ở dòng “phí ship”.

Freeship không có nghĩa logistics miễn phí.

Nó là cách chia lại chi phí để khiến quyết định mua hàng trở nên dễ hơn.

Kết: Vậy sàn thương mại điện tử kiếm tiền từ một đơn hàng bằng cách nào?

Visual: Buyer → Order → Platform subsidy + Seller contribution → Logistics → Shipper. Dùng biểu đồ tiền chảy, không gán một tỷ lệ cố định.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 05 — Internet từ Việt Nam sang Mỹ đi đường nào?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, cinematic global network, bản đồ và tuyến cáp biển.

Tiêu đề: Internet từ Việt Nam sang Mỹ đi đường nào?

Nội dung voice-over:

Khi bạn mở một website đặt máy chủ ở Mỹ, dữ liệu thường không bay qua vệ tinh.

Phần lớn hành trình của nó đi bằng cáp quang.

Từ điện thoại hoặc máy tính, dữ liệu đi qua mạng của nhà cung cấp Internet.

Sau đó, nó được chuyển đến các tuyến quốc tế, có thể đi qua trạm cập bờ cáp biển và các điểm trung chuyển trong khu vực.

Từ đó, những gói dữ liệu tiếp tục chạy qua mạng cáp quang dưới biển và trên đất liền cho tới trung tâm dữ liệu chứa dịch vụ bạn đang truy cập.

Đường đi không phải lúc nào cũng giống nhau.

Các mạng có thể chọn tuyến khác tùy kết nối, tải và tình trạng hệ thống.

Vì vậy, Internet toàn cầu thực chất là một mạng lưới khổng lồ nối với nhau bằng… rất nhiều sợi cáp.

Kết: Vậy chỉ một tuyến cáp gặp sự cố có thể làm Internet chậm đến mức nào?

Visual: Vietnam device → ISP → landing station → submarine cable → regional hub → US data center. Map rõ, không mô tả một tuyến duy nhất là bắt buộc.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 06 — GPS biết bạn đang đứng ở đâu bằng cách nào?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, spatial satellite visualization, dark blue technology style.

Tiêu đề: GPS biết bạn đang đứng ở đâu bằng cách nào?

Nội dung voice-over:

Điện thoại không cần hỏi Google bạn đang đứng ở đâu.

GPS có thể tự tính vị trí bằng tín hiệu từ vệ tinh.

Mỗi vệ tinh liên tục phát đi thông tin về thời gian và vị trí của chính nó.

Điện thoại nhận các tín hiệu đó và ước tính chúng đã mất bao lâu để tới nơi.

Biết thời gian truyền, thiết bị có thể ước tính khoảng cách tới từng vệ tinh.

Với tín hiệu từ ít nhất bốn vệ tinh, máy có thể giải bài toán vị trí ba chiều và đồng thời hiệu chỉnh sai lệch thời gian của đồng hồ trong thiết bị.

Trong thực tế, điện thoại còn có thể kết hợp thêm Wi‑Fi, mạng di động và cảm biến để định vị nhanh hoặc ổn định hơn.

Nhưng nguyên lý cốt lõi của GPS là:

đo thời gian,
suy ra khoảng cách,
rồi tìm điểm giao.

Kết: Tại sao GPS vẫn có thể sai vài mét?

Visual: 4 satellites → timestamp signals → distance spheres → phone position. Thêm Wi‑Fi/cell hỗ trợ ở cuối.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 07 — App miễn phí kiếm tiền từ đâu?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, business model flow, dark editorial.

Tiêu đề: App miễn phí không thu bạn một đồng thì kiếm tiền ở đâu?

Nội dung voice-over:

Một ứng dụng miễn phí không có nghĩa doanh nghiệp đứng sau nó không kiếm tiền.

Có nhiều mô hình khác nhau.

Một số app kiếm tiền từ quảng cáo.

Một số cho bạn dùng miễn phí tính năng cơ bản rồi bán gói Premium.

Game có thể bán vật phẩm, nội dung hoặc giao dịch trong ứng dụng.

Marketplace có thể thu phí từ người bán hoặc nhận hoa hồng trên giao dịch.

Một số sản phẩm miễn phí cho người dùng cá nhân nhưng bán phiên bản doanh nghiệp cho công ty.

Và có những app được dùng để kéo người dùng vào cả một hệ sinh thái sản phẩm lớn hơn.

Điểm quan trọng là:

“Bạn không trả tiền” không đồng nghĩa với “không có mô hình kinh doanh”.

Câu hỏi đúng phải là:

Ai đang trả tiền — và họ trả để nhận giá trị gì?

Kết: Vậy Facebook và Google kiếm tiền từ người dùng miễn phí thế nào?

Visual: Free User ở giữa → Ads / Premium / In-app purchase / Commission / Enterprise / Ecosystem.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 08 — Vì sao AI cần GPU thay vì chỉ dùng CPU?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, technical comparison visualization, dark tech.

Tiêu đề: Vì sao AI cần GPU thay vì chỉ dùng CPU?

Nội dung voice-over:

CPU rất mạnh.

Vậy tại sao AI hiện đại lại cần cả cụm GPU?

CPU được thiết kế để xử lý nhiều loại công việc khác nhau và rất giỏi những tác vụ cần logic phức tạp, nhánh rẽ và xử lý tuần tự.

GPU thì khác.

Nó có rất nhiều đơn vị tính toán có thể thực hiện một lượng lớn phép tính song song.

Mà AI hiện đại phải thực hiện khối lượng khổng lồ các phép toán trên ma trận và tensor.

Đó chính là kiểu bài toán mà GPU làm rất hiệu quả.

Thêm vào đó, GPU hiện đại có băng thông bộ nhớ cao và nhiều phần cứng chuyên dụng cho phép toán AI.

Vì vậy, CPU không “yếu hơn” GPU.

Chúng được tối ưu cho những kiểu công việc khác nhau.

Kết: Vậy một model AI thực sự làm gì bên trong GPU?

Visual: CPU lane vs GPU massive parallel lanes → matrices/tensors → neural network compute. Không mô tả CPU vô dụng.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 09 — Google Maps biết đường đang tắc bằng cách nào?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, map data-flow visualization.

Tiêu đề: Google Maps biết đoạn đường phía trước đang tắc bằng cách nào?

Nội dung voice-over:

Google không cần đặt camera trên mọi con đường để biết chỗ nào đang tắc.

Một phần quan trọng đến từ dữ liệu di chuyển được tổng hợp từ các thiết bị đang tham gia hệ thống.

Nếu nhiều thiết bị trên cùng một đoạn đường đều di chuyển chậm hơn mức thường thấy, đó là một tín hiệu cho thấy giao thông đang ùn lại.

Hệ thống còn có thể kết hợp dữ liệu lịch sử, điều kiện đường, báo cáo sự cố và các nguồn dữ liệu giao thông khác tùy khu vực.

Từ đó, Maps ước tính tốc độ trên từng đoạn đường và dự đoán thời gian di chuyển.

Vì vậy, màu đỏ trên bản đồ không nhất thiết đến từ một camera nhìn thấy hàng xe.

Nó có thể được suy ra từ cách cả một dòng thiết bị đang di chuyển.

Kết: Maps dự đoán bạn sẽ tới nơi lúc mấy giờ bằng cách nào?

Visual: Many phones on road → aggregated movement → speed estimate → red/yellow/green traffic layer → ETA.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

## VIDEO 10 — Vì sao đứt cáp biển có thể làm Internet chậm?

```text
/gen-video --template creative/free-style-sfx Video dọc 9:16, khoảng 40–50 giây, geopolitical network map, submarine cables, rerouting.

Tiêu đề: Vì sao đứt cáp biển có thể làm Internet chậm?

Nội dung voice-over:

Internet không phụ thuộc vào chỉ một sợi cáp biển.

Nhưng khi một tuyến quan trọng gặp sự cố, một phần lưu lượng phải đi đường khác.

Hãy tưởng tượng một cao tốc bị đóng.

Xe không biến mất.

Chúng chuyển sang những tuyến còn lại.

Với Internet cũng vậy.

Dữ liệu được định tuyến qua các kết nối khác còn hoạt động.

Nếu các tuyến thay thế có ít dung lượng hơn, chúng dễ bị đông hơn.

Và nếu đường vòng dài hơn, độ trễ cũng có thể tăng.

Tuy nhiên, không phải cứ một tuyến cáp gặp sự cố là Internet của cả quốc gia sẽ chậm như nhau.

Mức ảnh hưởng phụ thuộc vào tuyến bị lỗi, dung lượng còn lại và khả năng dự phòng của các nhà mạng.

Đó là lý do Internet toàn cầu cần nhiều tuyến cáp song song.

Kết: Ai quyết định gói dữ liệu của bạn sẽ đi tuyến nào?

Visual: multiple submarine cable routes → one route fails → traffic reroutes → congestion/capacity → latency. Dùng ví dụ cao tốc minh họa.

Brand end card: TÀI NGUYÊN. — Hiểu từ nguyên lý.
```

---

# GỢI Ý THỨ TỰ RENDER

Render trước:

1. Video 01 — TikTok
2. Video 02 — Quẹt thẻ
3. Video 05 — Internet Việt Nam → Mỹ

Ba video này kiểm tra được ba dạng visual khác nhau:

- recommendation/data
- transaction flow
- global map/network

Nếu style ổn, render tiếp 07 video còn lại.

---

# BRAND RULE NHẮC TRẠM AI

Nếu cần thêm vào prompt khi kết quả bị lệch style:

```text
Không dùng intro dài.
Không dùng presenter ảo.
Không dùng robot hoặc não AI sáo rỗng.
Không dùng quá nhiều chữ trong một scene.
Ưu tiên diagram, map, node, line, flow và motion graphics.
Mỗi scene khoảng 2–5 giây.
Dùng logo TN. nhỏ, không che nội dung.
TÀI NGUYÊN. chỉ xuất hiện rõ ở end card.
```
