# 04 — KPI & Logic đối soát / chốt số

## 1. Bộ KPI chuẩn

| Nhóm | KPI | Công thức | Mục tiêu quản trị |
|---|---|---|---|
| Nhân sự | Hiệu suất Booking cá nhân | Giá trị 1 KOC = Giá trị HĐ ÷ Số KOC khách book. Hiệu suất = Σ giá trị KOC **hợp lệ & được ghi nhận** mà nhân sự book | Đo đóng góp theo giá trị, không chỉ số lượng |
| Chiến dịch | Tỷ lệ KOC chốt / target | Số KOC chốt hợp lệ ÷ Số KOC cam kết | Job thiếu hay vượt |
| Chiến dịch | Tỷ lệ đăng đúng hạn | Số KOC/video đăng đúng deadline ÷ Tổng phải đăng | Tiến độ & uy tín |
| Chất lượng | Tỷ lệ QC pass lần 1 | Video pass lần đầu ÷ Tổng video gửi QC | Chất lượng brief & KOC |
| KOC | GMV/KOC | Tổng GMV ÷ Số KOC đã đăng | Lọc KOC chuyển đổi thật |
| KOC | % KOC có đơn | KOC phát sinh đơn ÷ KOC đã đăng | Không ảo bởi view/follower |
| Vận hành | Tỷ lệ sản phẩm ra video | Số mẫu có video ÷ Số mẫu đã gửi | Chống thất thoát mẫu (Free Cast) |
| Đối soát | Chốt số | Chỉ ghi nhận khi **đủ thanh toán + KOC hợp lệ hoàn thành** | Tránh ghi nhận ảo |

## 2. Logic chốt số

```
Giá trị 1 KOC              = Giá trị HĐ / Số KOC cam kết
Số KOC được phép ghi nhận  = ROUNDDOWN(Số KOC cam kết × MIN(% đã thanh toán, 100%))
Số KOC ghi nhận            = MIN(Số KOC hợp lệ đã đăng, Số KOC được phép ghi nhận)
Giá trị ghi nhận job       = Số KOC ghi nhận × Giá trị 1 KOC
```

Phân bổ cho nhân sự: sắp KOC hợp lệ theo **ngày đăng (sớm trước)**; chỉ N dòng đầu (N = Số KOC ghi nhận) được gắn "Được ghi nhận". Phần còn lại = "Chờ thanh toán" hoặc "Vượt — không ghi nhận".

## 3. Ví dụ: Job 10 triệu / 100 KOC / thanh toán 50%

| Thông số | Giá trị |
|---|---|
| Giá trị HĐ | 10.000.000đ |
| Số KOC cam kết | 100 |
| Giá trị 1 KOC | **100.000đ** |
| Đã thanh toán | 5.000.000đ (50%) |
| Số KOC được phép ghi nhận | 100 × 50% = **50** |

| Kịch bản | KOC hợp lệ đã đăng | Ghi nhận | Giá trị ghi nhận | Xử lý |
|---|---|---|---|---|
| A — chưa đủ | 30 | 30 | 3.000.000đ | Bình thường |
| B — đủ phần đã trả | 50 | 50 | 5.000.000đ | Đủ trần, nhắc SA thu đợt 2 |
| C — book vượt phần đã trả | 80 | 50 | 5.000.000đ | 30 KOC "Chờ thanh toán"; khi khách trả 100% → ghi nhận thêm |
| D — book vượt hợp đồng | 120 | 50 (tối đa 100 khi trả đủ) | ≤ 10.000.000đ | 20 KOC "Vượt — không ghi nhận"; Leader quyết định tính bù hay chuyển job khác |

Phân bổ cá nhân (kịch bản C): Nhân sự A có 35 KOC hợp lệ, B có 45. Sắp theo ngày đăng, 50 KOC đầu gồm 22 của A, 28 của B → A = 2.200.000đ, B = 2.800.000đ.

## 4. Điều kiện "KOC hợp lệ"
1. Có dòng trong Booking KOC đúng Mã Job.
2. Đã đăng video/live, có link.
3. Đúng sản phẩm/brief (pass QC với gói yêu cầu).
4. Không trùng KOC trong cùng job.
