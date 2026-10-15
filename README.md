# Booking API App — TechPro Team Booking KOC

Kho tài liệu và mã nguồn của dự án **Team Booking KOC** (TechPro Studio): quy trình, cấu trúc dữ liệu Lark Base, KPI, logic đối soát, roadmap và hệ thống đồng bộ dữ liệu TikTok Affiliate Partner (TAP) → Lark Base.

> ⚠️ Repo đang để **public**. Không commit credential (App Secret, cookie, msToken, ID base). Toàn bộ khóa được lưu trong Script Properties / file `.env` (đã bị `.gitignore` chặn). Xem `.env.example`.

## Mục tiêu

- Chuẩn hóa quy trình Booking KOC: nhận job → chọn KOC → liên hệ → gửi mẫu → theo dõi video → đo GMV/đơn → đối soát
- Quản lý chiến dịch, KOC, nhân sự booking trên Lark Base/Lark Sheet
- Dashboard hiệu quả chiến dịch và hiệu suất nhân sự
- Tự động hóa đồng bộ dữ liệu TAP/TikTok → Lark
- Biến Team Booking thành bộ phận có quy trình, KPI rõ ràng, nhân bản được

## Cấu trúc repo

```
docs/
  00-tong-quan-du-an.md          Bối cảnh, mục tiêu, thuật ngữ, bản đồ tài liệu
  01-dich-vu-va-thi-truong.md    Gói dịch vụ, bảng giá tham chiếu, tier KOC, thị trường
  02-quy-trinh-sop.md            Quy trình 9 bước, SOP theo vai trò, checklist brief
  03-cau-truc-lark-base.md       Bảng, field, kiểu dữ liệu, công thức, view, dashboard
  04-kpi-va-doi-soat.md          KPI, logic chốt số, ví dụ 10tr/100 KOC/50%
  05-rui-ro-va-roadmap.md        Rủi ro, roadmap 30 ngày/3/6 tháng, trạng thái tự động hóa
  06-he-thong-dong-bo-tap-lark.md Kiến trúc sync, hàm, thứ tự chạy, mapping field
  07-bai-hoc-ky-thuat.md         Gotcha TAP auth, Lark Base, Apps Script
  08-prompt-va-quy-chuan-claude.md Prompt tổng & format đầu ra
  09-tapkoc-phan-mem.md          Dự án phần mềm TAPKOC
apps-script/
  TechPro_TAP_Middleware_v9.1.js Middleware Google Apps Script (đã gỡ credential)
.env.example                     Danh sách biến cấu hình cần thiết
package.json                     Khung Node.js middleware cho giai đoạn sau
```

## Bắt đầu nhanh

1. Đọc `docs/00-tong-quan-du-an.md`.
2. Dựng Lark Base theo `docs/03-cau-truc-lark-base.md`.
3. Áp logic chốt số theo `docs/04-kpi-va-doi-soat.md`.
4. Cài sync: tạo Apps Script, dán `apps-script/TechPro_TAP_Middleware_v9.1.js`, khai báo Script Properties theo `.env.example`, chạy theo `docs/06`.

## Module

1. Campaign Management · 2. KOC Management · 3. Video Tracking · 4. GMV & Order Tracking · 5. Report Dashboard · 6. Lark Sync · 7. API Integration
