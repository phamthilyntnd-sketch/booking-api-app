# 06 — Hệ thống đồng bộ TAP → Lark Base

## 1. Kiến trúc

```
TikTok Affiliate Partner (partner.tiktokshop.com)
   │  POST /api/v1/affiliate/partner/sample/records/list
   │  (cookie + msToken lấy từ trình duyệt)
   ▼
Google Apps Script (middleware)
   │  PropertiesService: credential, cache TAP_KOC_0..N, checkpoint
   ▼
Lark Open API (open.larksuite.com) — bitable batch_update
   ▼
Lark Base "TEAM BOOKING – NĂM 2026" → Booking KOC / KOC Master Data
```

Lịch sử: thiết kế schema tay → Lark automation → Apps Script middleware. Đã bỏ: n8n, Python script, OAuth/ISV chính thức (chưa được duyệt). Repo này còn khung Node.js (`package.json`) cho giai đoạn middleware server sau này.

## 2. Code

| File | Mô tả |
|---|---|
| `apps-script/TechPro_TAP_Middleware_v9.1.js` | Bản v9.1 (24/05/2026): sync Followers + GMV, KOC Master Data, Web App nhận token |
| `TechPro_StatusOnly_v2_FINAL.js` (chưa có trong repo) | Bản mới nhất: sync trạng thái mẫu, trạng thái video, số bài, số live, hạn đơn vào bảng production. **Không** sync Followers/GMV. Cần bổ sung file này vào repo |

## 3. Cài đặt Script Properties (bắt buộc)

`TAP_PARTNER_ID`, `TAP_AID`, `TAP_FP`, `LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_APP_TOKEN`, `LARK_TABLE_ID`. Cookie và msToken lưu runtime ở `TAP_COOKIES`, `MS_TOKEN`. Xem `.env.example`.

## 4. Các hàm & thứ tự chạy

| Hàm | Việc |
|---|---|
| `step1_SaveCookies` / `saveCookies` | Lưu cookie (`ttwid`, `odin_tt`, `sessionid`…) |
| `step2_SaveMsToken` / `saveMsToken` | Lưu msToken (hết hạn ~1h) |
| `step3a_FetchByTabs` | Lấy dữ liệu 6 tab trạng thái, checkpoint `STEP3A_CP`. Chạy lại tới khi log "XONG TOAN BO 6 TABS" |
| `step3b_FetchByCampaign` | Lấy toàn bộ không filter (lịch sử), checkpoint `STEP3B_CP` |
| `step4_UpdateLark` | Ghi vào Lark (PATCH batch 500, nghỉ 300ms) |
| `step5a_ListTables` / `step5_UpdateKOCMaster` | Liệt kê bảng / cập nhật KOC Master Data |
| `checkCache`, `resetCheckpoints`, `debugMatchRate`, `debugFieldNames` | Tiện ích debug |

**Thứ tự:** `debugFieldNames` (khi đổi bảng) → step1 → step2 → step3a (chạy lặp tới khi xong) → (step3b nếu cần lịch sử) → step4.
Production: chạy bằng trigger, mục tiêu sync toàn bộ lúc **6h sáng hằng ngày**.

## 5. Logic khớp

```js
key = campaign_id + "|" + username.toLowerCase()
// Lark: ID Camp (rich text → field[0].text) + ID kênh
// TAP:  campaign_info.campaign_id + creator_info.user_name
```

Tỷ lệ khớp từng chỉ ~14% vì chạy step4 khi step3a chưa xong 6 tab.

## 6. Field lấy được từ TAP

| Cấp | Field | Map sang Lark |
|---|---|---|
| creator_info | `follower_num` | Followers |
| | `cl_pay_gmv_30d` | GMV |
| | `video_publish_cnt_30d` | Video 30D |
| | `video_avg_view_cnt` | Avg View |
| | `post_rate` | Post Rate % |
| | `is_fast_growing` | Tăng trưởng nhanh |
| | `nick_name` / `user_name` / `id` | Tên KOC / ID kênh / TikTok ID |
| record | `video_count` | Tổng video trong campaign |
| | `is_posted` | Đã đăng |
| | `sample_status` | Trạng thái mẫu (10 = chờ xét…) |
| | `apply_id` | Apply ID |

## 7. Xử lý lỗi nhanh

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `code=10000` (response chỉ có code) | Cookie/msToken hết hạn hoặc lấy từ 2 request khác nhau | Lấy lại **cả hai** từ cùng 1 request |
| Khớp 0 record | Cache trống | Chạy step3 ngay sau step1+2 |
| Khớp thấp | step3a chưa xong 6 tab | Chạy step3a tới khi log hoàn tất, thêm step3b |
| `RolePermNotAllow` | App Lark thiếu quyền bảng | Cấp quyền app cho base/bảng |
| Không tìm thấy field | Tên field tiếng Việt lệch NFC/NFD | `debugFieldNames()` rồi sửa map |
