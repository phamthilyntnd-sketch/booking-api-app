# 00 — Tổng quan dự án Team Booking KOC

> TechPro Studio (TechPro Holding) · Cập nhật: 15/10/2026

## 1. Team Booking là gì

Team Booking là khối vận hành chịu trách nhiệm **tìm, lọc, deal, điều phối và theo dõi KOC/Creator** cho các chiến dịch TikTok Shop/TAP của khách hàng TechPro. Vai trò không dừng ở việc "book cho đủ số lượng", mà phải tạo ra hệ thống KOC **đo được hiệu quả** theo link, video, GMV, đơn hàng, tỷ lệ đăng đúng hạn và khả năng tái sử dụng nội dung cho Ads.

**Định vị:** Team Booking là khối tạo **traffic + trust + data** cho chiến dịch TikTok Shop — không phải bộ phận hành chính book người.

## 2. Mục tiêu dự án

| # | Mục tiêu | Nội dung |
|---|---|---|
| 1 | Chuẩn hóa quy trình | Nhận job → chọn KOC → liên hệ → gửi mẫu → theo dõi video → đo GMV/đơn → đối soát |
| 2 | Hệ thống quản lý | Lark Base/Lark Sheet theo dõi từng chiến dịch, từng KOC, từng nhân sự, từng job |
| 3 | Dashboard | Đo hiệu quả chiến dịch và hiệu suất nhân sự booking |
| 4 | Tự động hóa | Giảm nhập tay, hướng tới API TikTok/TAP/Lark |
| 5 | Nhân bản | Quy trình rõ, KPI rõ, có thể nhân bản và mở rộng thành business unit |

Theo trục:

- **Kinh doanh:** tăng doanh thu Booking KOC, hỗ trợ gói Video/Studio/Ads/Ops, bán chiến dịch trọn gói.
- **Vận hành:** Sale nhận brief → Booking shortlist KOC → khách duyệt → gửi mẫu → KOC quay/đăng → tracking → báo cáo → đối soát.
- **Dữ liệu:** gom toàn bộ về Lark Base để nhìn được từng job, KOC, video, kết quả kinh doanh.
- **Mở rộng:** đào tạo nhân sự mới, giảm phụ thuộc leader, dashboard quản trị chuẩn SaaS nội bộ.

## 3. Thuật ngữ bắt buộc thống nhất

| Thuật ngữ | Định nghĩa |
|---|---|
| **Mã Job Sale** | Mã job từ bảng Sale Booking — khóa đồng bộ toàn bộ quy trình |
| **Mã Job Booking** | Mã job trong bảng Booking KOC — **bắt buộc trùng** Mã Job Sale |
| **D camp / ID Camp** | Mã chiến dịch trên hệ thống TAP |
| **File khách** | File/bảng riêng theo từng khách hàng |
| **Booking KOC** | Mỗi KOC trong một job = **1 dòng dữ liệu** |
| **Giá trị 1 KOC** | Giá trị hợp đồng ÷ Số lượng KOC cần book |
| **Hiệu suất cá nhân** | Tổng giá trị các KOC hợp lệ mà nhân sự đó book thành công |
| **Chốt số đối soát** | Chỉ ghi nhận khi **đồng thời** đủ điều kiện thanh toán của khách **và** KOC/video đã hoàn thành |
| **SA** | Sale Account |
| **KOCM** | KOC Manager / nhân sự Booking |
| **COM** | Content/Communication — QC nội dung |

## 4. Danh mục tài liệu nguồn đã tổng hợp

| Tài liệu / nguồn | Thông tin chính | Cách dùng |
|---|---|---|
| QUY TRÌNH LÀM VIỆC - TAP 2025 | 2 gói Booking, quy trình nội bộ SA/KOCM, kịch bản tư vấn sale, kịch bản liên hệ KOC | Nguồn gốc SOP, training sale, prompt tư vấn, prompt quản lý KOC |
| De_xuat_hang_muc_trien_khai_TechPro_Studio | Logic Video - Booking KOC - Ads; ngân sách mẫu 50tr Video + 50tr Booking; tiến độ 30 ngày | Proposal, kế hoạch khách hàng, dashboard theo chiến dịch |
| TechPro_Operating_Checklist_Pro | Checklist vận hành shop, KPI daily/weekly/monthly; hạng mục Booking, Content, Ads, Shop | Khung quản trị team và Lark Base/Lark Sheet |
| Dữ liệu trao đổi dự án Team Booking | Bảng Sale Booking, Booking KOC, mã Job, logic đối soát, hiệu suất, dashboard SaaS | Thiết kế database, công thức, automation |
| Thông tin thị trường 2025-2026 | Social commerce, affiliate, creator commerce, yêu cầu tracking minh bạch | Chiến lược thị trường, định vị dịch vụ |
| Hệ thống sync TAP → Lark (Apps Script) | Code middleware v9.1, bài học kỹ thuật, logic khớp dữ liệu | Xem `06`, `07` và thư mục `apps-script/` |

## 5. Bản đồ tài liệu trong repo

| File | Nội dung |
|---|---|
| `01-dich-vu-va-thi-truong.md` | Gói dịch vụ, bảng giá tham chiếu, xu hướng thị trường |
| `02-quy-trinh-sop.md` | Quy trình 9 bước + SOP theo vai trò |
| `03-cau-truc-lark-base.md` | Bảng, field, kiểu dữ liệu, công thức, view, dashboard |
| `04-kpi-va-doi-soat.md` | KPI, công thức, logic chốt số + ví dụ 10tr/100 KOC/50% |
| `05-rui-ro-va-roadmap.md` | Rủi ro đang gặp + roadmap 30 ngày / 3 / 6 tháng |
| `06-he-thong-dong-bo-tap-lark.md` | Kiến trúc sync TAP → Lark, thứ tự chạy, hiện trạng |
| `07-bai-hoc-ky-thuat.md` | Gotcha TAP auth, Lark Base, Apps Script |
| `08-prompt-va-quy-chuan-claude.md` | Prompt tổng, format đầu ra, project instructions |
| `09-tapkoc-phan-mem.md` | Dự án phần mềm TAPKOC |
