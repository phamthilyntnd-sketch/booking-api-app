# 03 — Cấu trúc dữ liệu Lark Base

Base thực tế: **TEAM BOOKING – NĂM 2026** (domain `larksuite.com`). ID base/bảng thật được lưu trong Script Properties, không ghi trong repo.

| Bảng | Vai trò | Quy mô hiện tại |
|---|---|---|
| Sale Booking / 01_Dashboard | Bảng gốc: job, hợp đồng, thanh toán, trạng thái | — |
| **Booking KOC** (production) | Mỗi KOC trong 1 job = 1 dòng; bảng vận hành chính | ~17.500 bản ghi |
| Bản sao Booking KOC | Bảng test cho sync | ~5.580 bản ghi |
| Video / Content | Video KOC & video Studio | — |
| Payment / Đối soát | Điều kiện ghi nhận doanh thu/hiệu suất | — |
| KOC Master Data | Kho creator tái sử dụng + scoring | Code sync đã viết |

Khóa liên kết: **Mã Job Sale = Mã Job Booking**; khớp với TAP bằng `ID Camp + "|" + ID kênh (lowercase)`.

---

## 1. Sale Booking

| Field | Kiểu | Ghi chú / công thức |
|---|---|---|
| Mã Job Sale | Text (primary) | Quy ước: `KH-YYMM-STT` |
| Khách hàng | Text / Link KH | |
| Gói dịch vụ | Single select | Free Cast / Theo yêu cầu / Kết hợp |
| Giá trị hợp đồng | Number (VNĐ) | |
| Số KOC cam kết | Number | |
| Tiền đã thu | Number | |
| % Thanh toán | Formula | `[Tiền đã thu] / [Giá trị hợp đồng]` |
| Giá trị 1 KOC | Formula | `[Giá trị hợp đồng] / [Số KOC cam kết]` |
| Số KOC được phép ghi nhận | Formula | `ROUNDDOWN([Số KOC cam kết] * MIN([% Thanh toán],1), 0)` |
| Số KOC đã chốt | Lookup/Count | Đếm dòng Booking KOC theo Mã Job, trạng thái "Đã chốt" trở lên |
| Số KOC đã đăng | Lookup/Count | Trạng thái "Đã đăng" |
| Tiến độ | Formula | `[Số KOC đã đăng] / [Số KOC cam kết]` |
| Vượt số lượng | Formula | `IF([Số KOC đã chốt] > [Số KOC cam kết], "⚠ Vượt", "OK")` |
| D camp | Text | ID chiến dịch TAP |
| File khách | URL | |
| Ngày bắt đầu / Deadline | Date | |
| SA phụ trách | Person | |
| Trạng thái job | Single select | Mới / Đang triển khai / Hoàn thành / Đã đối soát |
| Trạng thái đối soát | Single select | Chưa / Chốt 1 phần / Chốt đủ |

## 2. Booking KOC

| Field | Kiểu | Ghi chú |
|---|---|---|
| Mã Job Booking | Link → Sale Booking | Bắt buộc trùng Mã Job Sale |
| ID Camp | Text (rich text) | Khi đọc API phải lấy `field[0].text` |
| ID kênh | Text | username TikTok |
| Link kênh | Formula | `"https://www.tiktok.com/@" & [ID kênh]` |
| Tên KOC | Text | |
| Ngành hàng | Single select | |
| Người phụ trách booking | Person | |
| Tình trạng liên hệ | Single select | Chưa liên hệ / Đã mời / Đã chốt / Từ chối |
| Tình trạng mẫu | Single select | Sync từ TAP (`sample_status`) |
| Ngày gửi / nhận mẫu | Date | |
| Deadline đăng | Date | |
| Ngày đăng video | Date | |
| Tình trạng video / Đã đăng | Select / Checkbox | Sync từ TAP (`is_posted`, `video_count`) |
| Số bài đăng / Số phiên live | Number | Sync từ TAP |
| Link video | URL | |
| Followers, GMV | Number | Sync từ TAP (`follower_num`, `cl_pay_gmv_30d`) |
| Đơn hàng, Doanh thu | Number | |
| Đúng hạn | Formula | `IF(AND([Ngày đăng video]<>"", [Ngày đăng video]<=[Deadline đăng]), 1, 0)` |
| Hợp lệ | Formula | `IF([Tình trạng video]="Đã đăng", 1, 0)` |
| Giá trị KOC | Lookup | Giá trị 1 KOC từ Sale Booking |
| Thứ tự trong job | Number (automation/script) | Để chặn ghi nhận vượt số lượng |
| Trạng thái đối soát | Single select | Chưa / Được ghi nhận / Vượt — không ghi nhận |

## 3. Video / Performance
Mã Job · Creator · Link video · Ngày đăng · Livestream (checkbox) · View · Click · Đơn · GMV · Doanh thu gộp · ROI (`[GMV]/[Chi phí]`) · Trạng thái chạy Ads.

## 4. Payment / Đối soát
Mã Job · Tổng hợp đồng · Tiền đã thu · Tỷ lệ được ghi nhận · Số KOC hợp lệ · **Số KOC ghi nhận** = `MIN([Số KOC hợp lệ], [Số KOC được phép ghi nhận])` · **Giá trị hiệu suất** = `[Số KOC ghi nhận] * [Giá trị 1 KOC]`.

## 5. KOC Master Data

| Field | Nguồn | Ý nghĩa |
|---|---|---|
| ID kênh (primary) | TAP | username |
| Tên KOC | TAP | `nick_name` |
| TikTok ID | TAP | `id` |
| Link kênh | Tự tạo | tiktok.com/@username |
| Followers | TAP | `follower_num` |
| GMV 30D | TAP | `cl_pay_gmv_30d` |
| Video 30D | TAP | `video_publish_cnt_30d` |
| Avg View | TAP | `video_avg_view_cnt` |
| Post Rate % | TAP | `post_rate` |
| Tier | Tính | Theo bảng tier ở `01` |
| Số campaigns / Tổng video | Tính | Lịch sử hợp tác |
| Ngành mạnh, Giá tham chiếu, Điểm uy tín | Nhập tay | Dùng cho scoring |

## 6. View cần tạo
- **Booking KOC:** Theo nhân sự · Trễ hạn (deadline < hôm nay & chưa đăng) · Chờ mẫu · Đã đăng tuần này · Vượt số lượng.
- **Sale Booking:** Job đang chạy · Job chưa thanh toán đủ · Job sắp hết hạn (≤ 3 ngày).

## 7. Dashboard
| Khối | Chỉ số |
|---|---|
| Chiến dịch | Tổng job, KOC cam kết / chốt / đăng, tiến độ từng job, GMV, đơn |
| KOC | GMV/KOC, % KOC có đơn, top KOC theo GMV |
| Nhân sự | Số KOC chốt, hiệu suất (VNĐ), % đúng hạn theo người |
| Đối soát | Giá trị được ghi nhận vs chưa đủ điều kiện, job vượt số lượng |
| Tài chính | Doanh thu hợp đồng, tiền đã thu, công nợ |
