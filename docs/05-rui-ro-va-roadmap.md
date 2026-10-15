# 05 — Rủi ro & Roadmap

## 1. Rủi ro đang xử lý

| Rủi ro | Hiện tượng | Hướng xử lý |
|---|---|---|
| Book vượt số lượng | Booking làm nhiều hơn số KOC trong HĐ hoặc phần đã thanh toán | Giới hạn ghi nhận theo Mã Job + Số KOC được phép ghi nhận |
| Khách mới thanh toán 50% | Team đã book đủ/vượt nhưng chưa đủ điều kiện đối soát | Ghi nhận theo tỷ lệ tiền đã thu hoặc mốc nghiệm thu |
| Thiếu liên kết Sale Booking ↔ Booking KOC | Mã job không đồng nhất | Bắt buộc Mã Job Sale = Mã Job Booking; field Link thay vì gõ tay |
| KOC đăng thiếu/trễ | Không đạt cam kết video/ngày/tuần | View Trễ hạn, cảnh báo, cơ chế bổ sung KOC |
| Không đo được hiệu quả | Có link nhưng thiếu view/đơn/GMV/ROI | Bảng Video/Performance; sync TAP/API hoặc import staging |
| Sale hỏi nhiều vì chưa hiểu dịch vụ | Không nắm gói, điều kiện | Training sale + FAQ + kịch bản + checklist brief |
| Khó nhân bản team | Leader xử lý thủ công nhiều | SOP theo vai trò, dashboard năng suất, KOC Master Data |
| Phụ thuộc cookie/msToken TAP | msToken hết hạn ~1h, cookie ~3 ngày; sync gãy khi quên refresh | Bookmarklet/webhook cập nhật token; chờ duyệt app chính thức "TechPro Creative" |

## 2. Roadmap

| Giai đoạn | Mục tiêu | Việc cần làm | Kết quả |
|---|---|---|---|
| 0–30 ngày | Chuẩn hóa nền | Chốt SOP, field Lark Base, brief, mẫu báo cáo, công thức hiệu suất | Mọi job có mã, owner, trạng thái, số KOC, deadline, điều kiện đối soát |
| Tháng 2–3 | Tăng năng suất, giảm lỗi | Dashboard Booking, daily tracker, cảnh báo trễ, thư viện & scoring KOC, training | Leader nhìn tiến độ theo ngày; nhân sự mới làm theo quy trình |
| Tháng 3–4 | Liên kết Content/Ads/Ops | Phân loại KOC/video có đơn, có traffic, chạy Ads; vòng lặp test–scale–retarget | Booking thành nguồn dữ liệu scale doanh số |
| Tháng 4–6 | Tự động hóa dữ liệu | Kết nối TAP/TikTok API; import GMV/order/video theo lịch (6h sáng hằng ngày) | Giảm nhập tay, báo cáo nhanh, quản lý nhiều khách |
| Sau 6 tháng | Nhân bản & đóng gói | Tier dịch vụ, SLA, thưởng phạt KOC/nhân sự, chuẩn proposal/hợp đồng; phát triển phần mềm TAPKOC | Business unit có năng lực scale và lợi nhuận riêng |

## 3. Trạng thái tự động hóa (tại 15/10/2026)

- ✅ Sync trạng thái mẫu/video/số bài/số live từ TAP → Booking KOC (production) bằng Apps Script.
- ✅ Sync Followers + GMV đã chạy trên bảng bản sao (1.604 / 5.579 records khớp).
- ⏳ Chạy step3b (lịch sử) để tăng tỷ lệ khớp; xác minh tên field production bằng `debugFieldNames()`.
- ⏳ KOC Master Data: code xong, chưa xác nhận đã chạy.
- ⏳ Thêm fields Video 30D, Post Rate, Avg View.
- ⏳ App chính thức TAP "TechPro Creative" đang chờ duyệt.
