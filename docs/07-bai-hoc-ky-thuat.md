# 07 — Bài học kỹ thuật (đọc trước khi debug)

## TAP API authentication
- Cần **2 thành phần từ CÙNG một request** trình duyệt: header `cookie` (có `ttwid`, `odin_tt`, `sessionid`) + tham số URL `msToken`.
- msToken hết hạn ~1 giờ; cookie phiên hết hạn sau vài ngày (~3 ngày).
- Trang lấy đúng: `partner.tiktokshop.com/affiliate-campaign/sample-requests?tab=to_review`. Bấm 1 tab trạng thái → xuất hiện request `list?user_language=vi-VN`.
- Lấy msToken đầy đủ qua Payload → View source hoặc "Copy as cURL" (URL hiển thị trên DevTools hay bị cắt).
- Lấy cookie và msToken từ 2 request khác nhau → `code=10000` dù từng cái còn mới.
- `X-Bogus`, `_signature` là token fingerprint trình duyệt, không tái tạo được phía server → đã bỏ.
- Lọc tab: `search_key: 28`, `search_type: 1`, giá trị `"0"`–`"5"` = 6 tab. `search_params: []` = lấy toàn bộ (step3b). Giá trị 100/200 không tồn tại.

## Lark Base
- `batch_update` dùng **PATCH** (không phải PUT), batch 500, nghỉ 300ms.
- `ID Camp` là rich text array → lấy `field[0].text`.
- Tên field tiếng Việt có thể lệch chuẩn Unicode (NFC/NFD) → luôn chạy `debugFieldNames()`.
- Automation Lark không có IF/ELSE → tách 2 automation với điều kiện dừng ngược nhau.
- Lookup trên primary field: tạo field công thức copy để lookup được ở field không phải primary.
- `RolePermNotAllow` = thiếu quyền ở cấp bảng.
- Bảng ~175K records vẫn xử lý được với batch_update + checkpoint.

## Apps Script & scale
- Giới hạn chạy 6 phút → bắt buộc checkpoint/resume qua PropertiesService.
- Mỗi property ~9KB → cache theo khối (ví dụ 80 KOC/key: `TAP_KOC_0` … `TAP_KOC_N`).
- Lỗi `parseMoneySafe`: bỏ dấu thập phân làm giá trị phình 100× → cẩn thận số định dạng Việt Nam.
- Dán code mới phải **thay toàn bộ** hàm cũ — trùng tên hàm gây lỗi ngầm.

## Quy ước làm việc
- Giao code dạng **file hoàn chỉnh copy-paste**, không sửa từng đoạn.
- Debug: chạy hàm tiện ích trước (`debugFieldNames`, `checkCache`, `debugMatchRate`) rồi mới chạy bước dữ liệu.
- Ưu tiên giải pháp chạy được trong ngày; ưu tiên trigger tự động cho production.
