// ============================================
// TECHPRO – TAP MIDDLEWARE v9.1
// Cap nhat: 24/05/2026
// ============================================

// ⚠️ KHÔNG ghi credential trực tiếp vào code.
// Vào Apps Script > Project Settings > Script Properties và tạo các key sau:
//   TAP_PARTNER_ID, TAP_AID, TAP_FP,
//   LARK_APP_ID, LARK_APP_SECRET, LARK_APP_TOKEN, LARK_TABLE_ID
const _P = PropertiesService.getScriptProperties();

const PARTNER = {
  BASE_URL:   "https://api-partner-sg.tiktokshop.com",
  PARTNER_ID: _P.getProperty("TAP_PARTNER_ID"),
  AID:        _P.getProperty("TAP_AID"),
  FP:         _P.getProperty("TAP_FP")
};

const LARK = {
  API_BASE:   "https://open.larksuite.com",
  APP_ID:     _P.getProperty("LARK_APP_ID"),
  APP_SECRET: _P.getProperty("LARK_APP_SECRET"),
  APP_TOKEN:  _P.getProperty("LARK_APP_TOKEN"),
  TABLE_ID:   _P.getProperty("LARK_TABLE_ID")
};

// ============================================================
// BUOC 1: CAP NHAT COOKIE MOI
// Lay tu: DevTools > Network > request list?user_language
// Copy toan bo gia tri "cookie:" trong Request Headers
// ============================================================
function saveCookies() {
  const cookies = "DAN_TOAN_BO_COOKIE_VAO_DAY"; // lấy từ DevTools, KHÔNG commit giá trị thật
  PropertiesService.getScriptProperties().setProperty("TAP_COOKIES", cookies);
  Logger.log("Cookie saved — length: " + cookies.length);
}

// ============================================================
// BUOC 2: CAP NHAT MS TOKEN MOI (het han ~1 gio)
// Lay tu: DevTools > Network > request list?user_language > URL > copy msToken=XXXX
// ============================================================
function saveMsToken() {
  const msToken = "DAN_MS_TOKEN_VAO_DAY"; // lấy cùng request với cookie, KHÔNG commit giá trị thật
  PropertiesService.getScriptProperties().setProperty("MS_TOKEN", msToken);
  Logger.log("msToken saved: " + msToken.substring(0, 30) + "...");
}

function getCookies() { return PropertiesService.getScriptProperties().getProperty("TAP_COOKIES") || ""; }
function getMsToken() { return PropertiesService.getScriptProperties().getProperty("MS_TOKEN") || ""; }
function parseNum(v) { if (!v || v === "--") return 0; return parseInt(String(v).replace(/\./g,""),10)||0; }

// ============================================================
// LARK TOKEN
// ============================================================
function getLarkAccessToken() {
  const res = UrlFetchApp.fetch(LARK.API_BASE + "/open-apis/auth/v3/tenant_access_token/internal", {
    method:"POST", headers:{"Content-Type":"application/json"},
    payload:JSON.stringify({app_id:LARK.APP_ID, app_secret:LARK.APP_SECRET}),
    muteHttpExceptions:true
  });
  const data = JSON.parse(res.getContentText());
  if (data.code !== 0) { Logger.log("Lark token loi: " + data.msg); return null; }
  Logger.log("Lark token OK");
  return data.tenant_access_token;
}

// ============================================================
// DOC TOAN BO RECORDS TU LARK
// ============================================================
function getAllLarkRecords(larkToken) {
  const all = [];
  let pt = null;
  do {
    let url = LARK.API_BASE + "/open-apis/bitable/v1/apps/" + LARK.APP_TOKEN + "/tables/" + LARK.TABLE_ID + "/records?page_size=500";
    if (pt) url += "&page_token=" + pt;
    const res = UrlFetchApp.fetch(url, {method:"GET", headers:{"Authorization":"Bearer "+larkToken}, muteHttpExceptions:true});
    const data = JSON.parse(res.getContentText());
    if (data.code !== 0) { Logger.log("Doc Lark loi: " + data.msg); return null; }
    (data.data.items||[]).forEach(function(item) {
      var idKenh = String(item.fields["ID kênh"]||item.fields["ID kenh"]||"").trim().replace("@","");
      var cf = item.fields["ID Camp"], idCamp = "";
      if (cf) { idCamp = Array.isArray(cf)&&cf[0]&&cf[0].text ? String(cf[0].text).trim() : String(cf).trim(); }
      all.push({record_id:item.record_id, id_kenh:idKenh, id_camp:idCamp});
    });
    pt = data.data.has_more ? data.data.page_token : null;
    Logger.log("Da doc: " + all.length + " records");
  } while (pt);
  return all;
}

// ============================================================
// GOM UNIQUE CAMPAIGN IDS TU LARK
// ============================================================
function getUniqueCampaignIdsFromLark() {
  const larkToken = getLarkAccessToken();
  if (!larkToken) return [];
  const records = getAllLarkRecords(larkToken);
  if (!records) return [];
  const ids = {};
  records.forEach(function(r) { if (r.id_camp) ids[r.id_camp] = true; });
  const arr = Object.keys(ids);
  Logger.log("Unique campaign IDs tu Lark: " + arr.length);
  return arr;
}

// ============================================================
// TAP — GOI API 1 TRANG
// ============================================================
function _fetchPage(searchParams, curPage) {
  const cookies = getCookies(), msToken = getMsToken();
  if (!cookies || cookies.length < 50 || !msToken) { Logger.log("Chua co cookie/token"); return null; }
  const url = PARTNER.BASE_URL + "/api/v1/affiliate/partner/sample/records/list"
    + "?user_language=vi-VN&partner_id=" + PARTNER.PARTNER_ID + "&aid=" + PARTNER.AID
    + "&app_name=i18n_ecom_alliance&device_id=0&fp=" + PARTNER.FP
    + "&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080"
    + "&browser_language=vi&browser_platform=Win32&browser_name=Mozilla"
    + "&browser_version=5.0+(Windows+NT+10.0%3B+Win64%3B+x64)+AppleWebKit%2F537.36+(KHTML,+like+Gecko)+Chrome%2F141.0.0.0+Safari%2F537.36"
    + "&browser_online=true&timezone_name=Asia%2FBangkok&msToken=" + msToken;
  try {
    const res = UrlFetchApp.fetch(url, {
      method:"POST",
      headers:{"Cookie":cookies,"Content-Type":"application/json","Accept":"application/json, text/plain, */*","Origin":"https://partner.tiktokshop.com","Referer":"https://partner.tiktokshop.com/"},
      payload:JSON.stringify({search_params:searchParams, cur_page:curPage, order_params:[{"order_key":9,"order_type":2}], page_size:50}),
      muteHttpExceptions:true
    });
    const raw = res.getContentText();
    if (raw.trim().charAt(0)==="<") { Logger.log("Cookie het han"); return null; }
    const json = JSON.parse(raw);
    return json;
  } catch(e) { Logger.log("Error: "+e.message); return null; }
}

// ============================================================
// LUU KOC VAO CACHE (MERGE, KHONG XOA DU LIEU CU)
// ============================================================
function _mergeKOCsToCache(allRecords) {
  const props = PropertiesService.getScriptProperties();
  const existingIdxStr = props.getProperty("KOC_CACHE_INDEX");
  const existingIds = existingIdxStr ? JSON.parse(existingIdxStr) : [];
  const existingSet = {};
  existingIds.forEach(function(id) { existingSet[id] = true; });
  const newIds = Object.keys(allRecords);
  newIds.forEach(function(cid) {
    // Merge voi data cu neu co
    const oldStr = props.getProperty("KOC_" + cid);
    const oldKOCs = oldStr ? JSON.parse(oldStr) : [];
    const oldMap = {};
    oldKOCs.forEach(function(k) { if(k.user_name) oldMap[k.user_name.toLowerCase()] = k; });
    // Ghi de voi data moi
    Object.values(allRecords[cid]).forEach(function(k) {
      if(k.user_name) oldMap[k.user_name.toLowerCase()] = k;
    });
    props.setProperty("KOC_" + cid, JSON.stringify(Object.values(oldMap)));
    existingSet[cid] = true;
  });
  const allIds = Object.keys(existingSet);
  props.setProperty("KOC_CACHE_INDEX", JSON.stringify(allIds));
  Logger.log("Cache merged — tong: " + allIds.length + " campaigns");
  return allIds.length;
}

// ============================================================
// STEP 3A: LAY KOC TU TAT CA TRANG THAI (ACTIVE)
// Chay dau tien — lay KOC dang active
// ============================================================
function fetchActiveKOCs() {
  Logger.log("=== STEP 3A: KOC ACTIVE ===");
  const allRecords = {};
  [0,1,2,3,4,5].forEach(function(tabVal) {
    let page = 1, total = 9999;
    while (page * 50 <= total + 50) {
      Utilities.sleep(300);
      const json = _fetchPage([{"search_key":28,"search_type":1,"value":String(tabVal)}], page);
      if (!json || json.code !== 0 || !json.data) { Logger.log("Tab "+tabVal+" p"+page+": stop"); break; }
      total = json.data.total || 0;
      const recs = json.data.sample_records || [];
      if (!recs.length) break;
      recs.forEach(function(r) {
        const cid = r.campaign_info&&r.campaign_info.campaign_id;
        const crid = r.creator_info&&r.creator_info.id;
        if (!cid||!crid) return;
        if (!allRecords[cid]) allRecords[cid] = {};
        allRecords[cid][crid] = {
          campaign_id:cid, campaign_name:r.campaign_info.name||"",
          creator_id:crid, user_name:r.creator_info.user_name||"",
          follower:r.creator_info.follower_num||"0",
          gmv_30d:r.creator_info.cl_pay_gmv_30d||"0",
          video_30d:r.creator_info.video_publish_cnt_30d||"0",
          video_count:r.video_count||0, is_posted:r.is_posted||false,
          sample_status:r.sample_status||0
        };
      });
      Logger.log("Tab "+tabVal+" p"+page+"/"+Math.ceil(total/50)+" -> "+recs.length+" recs");
      if (recs.length < 50) break;
      page++; if (page > 80) break;
    }
  });
  const n = Object.keys(allRecords).length;
  if (n === 0) { Logger.log("0 campaigns — msToken het han!"); return; }
  Logger.log("Active: "+n+" campaigns");
  _mergeKOCsToCache(allRecords);
}

// ============================================================
// STEP 3B: LAY KOC TU TAT CA RECORD (KHONG LOC STATUS)
// Chay sau step 3a — lay toan bo lich su bao gom completed/canceled
// Khoang 4-5 phut — de chay, khong can can thiep
// ============================================================
function fetchAllHistoricalKOCs() {
  Logger.log("=== STEP 3B: KOC LICH SU (KO LOC) ===");
  const allRecords = {};
  let page = 1, total = 9999;
  while (page * 50 <= total + 50) {
    Utilities.sleep(350);
    // Goi KHONG co filter — lay tat ca records
    const json = _fetchPage([], page);
    if (!json || json.code !== 0 || !json.data) {
      Logger.log("Loi o trang " + page + " — dung lai");
      break;
    }
    total = json.data.total || 0;
    const recs = json.data.sample_records || [];
    if (!recs.length) { Logger.log("Het records o trang " + page); break; }
    recs.forEach(function(r) {
      const cid = r.campaign_info&&r.campaign_info.campaign_id;
      const crid = r.creator_info&&r.creator_info.id;
      if (!cid||!crid) return;
      if (!allRecords[cid]) allRecords[cid] = {};
      allRecords[cid][crid] = {
        campaign_id:cid, campaign_name:r.campaign_info.name||"",
        creator_id:crid, user_name:r.creator_info.user_name||"",
        follower:r.creator_info.follower_num||"0",
        gmv_30d:r.creator_info.cl_pay_gmv_30d||"0",
        video_30d:r.creator_info.video_publish_cnt_30d||"0",
        video_count:r.video_count||0, is_posted:r.is_posted||false,
        sample_status:r.sample_status||0
      };
    });
    Logger.log("Trang "+page+"/"+Math.ceil(total/50)+" -> "+recs.length+" recs | Tong campaigns: "+Object.keys(allRecords).length);
    if (recs.length < 50) break;
    page++; if (page > 200) { Logger.log("Dat gioi han 200 trang"); break; }
  }
  const n = Object.keys(allRecords).length;
  Logger.log("Historical: "+n+" campaigns");
  if (n === 0) { Logger.log("0 campaigns — msToken het han!"); return; }
  _mergeKOCsToCache(allRecords);
  Logger.log("XONG step3b — san sang chay step4");
}

// ============================================================
// BUILD LOOKUP MAP
// ============================================================
function buildKOCLookupMap() {
  const idxStr = PropertiesService.getScriptProperties().getProperty("KOC_CACHE_INDEX");
  if (!idxStr) { Logger.log("Chua co cache. Chay step3a truoc."); return null; }
  const map = {};
  JSON.parse(idxStr).forEach(function(cid) {
    const kocs = JSON.parse(PropertiesService.getScriptProperties().getProperty("KOC_"+cid)||"[]");
    kocs.forEach(function(k) { if(k.user_name) map[cid+"|"+k.user_name.toLowerCase()] = k; });
  });
  Logger.log("Lookup map: " + Object.keys(map).length + " entries");
  return map;
}

// ============================================================
// STEP 4: UPDATE LARK BASE
// ============================================================
function updateKOCDataByIDCamp() {
  const larkToken = getLarkAccessToken();
  if (!larkToken) return;
  const kocMap = buildKOCLookupMap();
  if (!kocMap) return;
  Logger.log("Dang doc Lark Base...");
  const records = getAllLarkRecords(larkToken);
  if (!records) return;
  Logger.log("Tong records: " + records.length);
  records.slice(0,3).forEach(function(r,i){ Logger.log("  Record "+(i+1)+": ["+r.id_kenh+"] camp=["+r.id_camp+"]"); });
  const batch = [];
  let matched = 0, notFound = 0;
  records.forEach(function(rec) {
    if (!rec.id_camp||!rec.id_kenh) { notFound++; return; }
    const koc = kocMap[rec.id_camp+"|"+rec.id_kenh.toLowerCase()];
    if (!koc) { notFound++; return; }
    matched++;
    batch.push({record_id:rec.record_id, fields:{"Followers":parseFloat(koc.follower)||0, "GMV":parseFloat(koc.gmv_30d)||0}});
  });
  Logger.log("Khop: "+matched+" | Khong khop: "+notFound);
  if (!batch.length) { Logger.log("Khong co record de update"); return; }
  const url = LARK.API_BASE+"/open-apis/bitable/v1/apps/"+LARK.APP_TOKEN+"/tables/"+LARK.TABLE_ID+"/records/batch_update";
  let updated = 0;
  for (var i = 0; i < batch.length; i += 500) {
    const b = batch.slice(i, i+500);
    const res = UrlFetchApp.fetch(url, {method:"POST", headers:{"Authorization":"Bearer "+larkToken,"Content-Type":"application/json"}, payload:JSON.stringify({records:b}), muteHttpExceptions:true});
    const r = JSON.parse(res.getContentText());
    if (r.code !== 0) { Logger.log("Update loi: "+r.msg); return; }
    updated += b.length;
    Logger.log("Da update: "+updated+"/"+batch.length);
    Utilities.sleep(300);
  }
  Logger.log("XONG — Da update " + updated + " records tren Lark Base!");
}

// ============================================================
// WEB APP
// ============================================================
function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (req.action==="update_ms_token"&&req.token) { PropertiesService.getScriptProperties().setProperty("MS_TOKEN",req.token); return ContentService.createTextOutput(JSON.stringify({ok:true,msg:"msToken updated!"})).setMimeType(ContentService.MimeType.JSON); }
    if (req.action==="update_cookie"&&req.cookie) { PropertiesService.getScriptProperties().setProperty("TAP_COOKIES",req.cookie); return ContentService.createTextOutput(JSON.stringify({ok:true,msg:"Cookie updated!"})).setMimeType(ContentService.MimeType.JSON); }
    return ContentService.createTextOutput(JSON.stringify({ok:false})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) { return ContentService.createTextOutput(JSON.stringify({error:err.message})).setMimeType(ContentService.MimeType.JSON); }
}

// ============================================================
// CHAY THEO THU TU
// ============================================================
function step1_SaveCookies()       { saveCookies();            }
function step2_SaveMsToken()       { saveMsToken();            }
function step3a_FetchActiveKOCs()  { fetchActiveKOCs();        }   // ~2 phut
function step3b_FetchHistorical()  { fetchAllHistoricalKOCs(); }   // ~4-5 phut
function step4_UpdateLark()        { updateKOCDataByIDCamp();  }
function checkCache() {
  const idx = PropertiesService.getScriptProperties().getProperty("KOC_CACHE_INDEX");
  if (!idx) { Logger.log("Cache trong"); return; }
  const ids = JSON.parse(idx);
  let total = 0;
  ids.forEach(function(cid) {
    const k = JSON.parse(PropertiesService.getScriptProperties().getProperty("KOC_"+cid)||"[]");
    total += k.length;
  });
  Logger.log("Cache: " + ids.length + " campaigns, " + total + " KOC");
}

// ============================================================
// KOC MASTER DATA
// ============================================================

// Tim TABLE_ID cua bang KOC Master Data
function findKOCMasterTableId() {
  const larkToken = getLarkAccessToken();
  if (!larkToken) return null;
  const res = UrlFetchApp.fetch(
    LARK.API_BASE + "/open-apis/bitable/v1/apps/" + LARK.APP_TOKEN + "/tables",
    { method:"GET", headers:{"Authorization":"Bearer "+larkToken}, muteHttpExceptions:true }
  );
  const data = JSON.parse(res.getContentText());
  if (data.code !== 0) { Logger.log("Loi lay danh sach bang: " + data.msg); return null; }
  const tables = data.data.items || [];
  Logger.log("=== DANH SACH BANG ===");
  tables.forEach(function(t) { Logger.log(t.table_id + " — " + t.name); });
  const master = tables.find(function(t) { return t.name.toLowerCase().includes("master") || t.name.toLowerCase().includes("koc master"); });
  if (master) { Logger.log("Tim thay: " + master.table_id + " — " + master.name); return master.table_id; }
  Logger.log("Khong tim thay bang KOC Master — can tao thu cong trong Lark");
  return null;
}

// Phan loai tier theo so follower
function classifyTier(follower) {
  const f = parseFloat(follower) || 0;
  if (f >= 1000000) return "Mega (1M+)";
  if (f >= 500000)  return "Macro lớn (500K-1M)";
  if (f >= 100000)  return "Macro (100K-500K)";
  if (f >= 50000)   return "Micro lớn (50K-100K)";
  if (f >= 10000)   return "Micro (10K-50K)";
  if (f >= 1000)    return "Nano (1K-10K)";
  return "Nano nhỏ (<1K)";
}

// Xay dung KOC Master tu cache
function buildKOCMasterData() {
  Logger.log("=== XAY DUNG KOC MASTER DATA ===");
  const props = PropertiesService.getScriptProperties();
  const idxStr = props.getProperty("KOC_CACHE_INDEX");
  if (!idxStr) { Logger.log("Cache trong — chay step3a + step3b truoc"); return {}; }

  const masterMap = {};  // key: username

  JSON.parse(idxStr).forEach(function(cid) {
    const kocs = JSON.parse(props.getProperty("KOC_" + cid) || "[]");
    kocs.forEach(function(k) {
      if (!k.user_name) return;
      const key = k.user_name.toLowerCase();
      if (!masterMap[key]) {
        masterMap[key] = {
          id_kenh:       k.user_name,
          ten_koc:       k.nick_name || "",
          tiktok_id:     k.creator_id || "",
          link_kenh:     "https://www.tiktok.com/@" + k.user_name,
          followers:     parseFloat(k.follower) || 0,
          gmv_30d:       parseFloat(k.gmv_30d) || 0,
          video_30d:     parseInt(k.video_30d) || 0,
          post_rate:     parseFloat(k.post_rate) || 0,
          tier:          classifyTier(k.follower),
          campaigns:     [],
          tong_video:    0,
          da_dang:       false,
          last_status:   k.sample_status || 0
        };
      }
      // Merge: lay followers/GMV moi nhat (lon hon)
      const m = masterMap[key];
      if ((parseFloat(k.follower)||0) > m.followers) {
        m.followers = parseFloat(k.follower) || 0;
        m.tier      = classifyTier(k.follower);
      }
      if ((parseFloat(k.gmv_30d)||0) > 0) m.gmv_30d = parseFloat(k.gmv_30d) || 0;
      if ((parseInt(k.video_30d)||0) > 0) m.video_30d = parseInt(k.video_30d);
      if ((parseFloat(k.post_rate)||0) > 0) m.post_rate = parseFloat(k.post_rate);

      // Tich luy: campaigns, video, da dang
      if (cid && !m.campaigns.includes(cid)) m.campaigns.push(cid);
      m.tong_video += (k.video_count || 0);
      if (k.is_posted) m.da_dang = true;
    });
  });

  const list = Object.values(masterMap);
  Logger.log("KOC Master: " + list.length + " KOC unique");

  // Thong ke theo tier
  const tiers = {};
  list.forEach(function(k) { tiers[k.tier] = (tiers[k.tier]||0) + 1; });
  Object.keys(tiers).sort().forEach(function(t) { Logger.log("  " + t + ": " + tiers[t]); });

  return masterMap;
}

// Upsert KOC Master vao Lark Base
function updateKOCMasterTable() {
  Logger.log("=== UPDATE KOC MASTER TABLE ===");
  const larkToken = getLarkAccessToken();
  if (!larkToken) return;

  // Tim table ID
  const masterTableId = findKOCMasterTableId();
  if (!masterTableId) {
    Logger.log("DUNG LAI: Can tao bang 'KOC Master Data' trong Lark truoc");
    Logger.log("Vao Lark Base -> Them bang moi -> dat ten 'KOC Master Data'");
    Logger.log("Sau do chay lai ham nay");
    return;
  }

  // Doc records hien co trong KOC Master
  Logger.log("Doc records hien co...");
  const existingMap = {};
  let pt = null;
  do {
    let url = LARK.API_BASE + "/open-apis/bitable/v1/apps/" + LARK.APP_TOKEN
      + "/tables/" + masterTableId + "/records?page_size=500";
    if (pt) url += "&page_token=" + pt;
    const res = UrlFetchApp.fetch(url, {method:"GET", headers:{"Authorization":"Bearer "+larkToken}, muteHttpExceptions:true});
    const data = JSON.parse(res.getContentText());
    if (data.code !== 0) { Logger.log("Doc loi: " + data.msg); break; }
    (data.data.items||[]).forEach(function(item) {
      const key = String(item.fields["ID kênh"]||item.fields["ID kenh"]||"").trim().toLowerCase();
      if (key) existingMap[key] = item.record_id;
    });
    pt = data.data.has_more ? data.data.page_token : null;
  } while (pt);
  Logger.log("Hien co " + Object.keys(existingMap).length + " records trong KOC Master");

  // Xay dung master data
  const masterMap = buildKOCMasterData();
  const list = Object.values(masterMap);
  if (!list.length) { Logger.log("Khong co du lieu — chay step3 truoc"); return; }

  // Tach create / update
  const toCreate = [], toUpdate = [];
  list.forEach(function(k) {
    const fields = {
      "ID kênh":          k.id_kenh,
      "Tên KOC":          k.ten_koc,
      "TikTok ID":        k.tiktok_id,
      "Link kênh":        k.link_kenh,
      "Followers":        k.followers,
      "GMV 30D":          k.gmv_30d,
      "Video 30D":        k.video_30d,
      "Post Rate (%)":    Math.round(parseFloat(k.post_rate) * 10) / 10,
      "Tier":             k.tier,
      "Số campaigns":     k.campaigns.length,
      "Tổng video":       k.tong_video,
      "Đã đăng":          k.da_dang
    };
    const key = k.id_kenh.toLowerCase();
    if (existingMap[key]) {
      toUpdate.push({ record_id: existingMap[key], fields: fields });
    } else {
      toCreate.push({ fields: fields });
    }
  });

  Logger.log("Can tao: " + toCreate.length + " | Can update: " + toUpdate.length);
  const baseUrl = LARK.API_BASE + "/open-apis/bitable/v1/apps/" + LARK.APP_TOKEN + "/tables/" + masterTableId;

  // Tao moi (batch 500)
  let created = 0;
  for (var i = 0; i < toCreate.length; i += 500) {
    const batch = toCreate.slice(i, i+500);
    const res = UrlFetchApp.fetch(baseUrl + "/records/batch_create", {
      method:"POST", headers:{"Authorization":"Bearer "+larkToken,"Content-Type":"application/json"},
      payload: JSON.stringify({records: batch}), muteHttpExceptions:true
    });
    const r = JSON.parse(res.getContentText());
    if (r.code !== 0) { Logger.log("Tao loi: " + r.msg + " | code: " + r.code); }
    else { created += batch.length; Logger.log("Da tao: " + created + "/" + toCreate.length); }
    Utilities.sleep(300);
  }

  // Cap nhat (batch 500)
  let updated = 0;
  for (var j = 0; j < toUpdate.length; j += 500) {
    const batch = toUpdate.slice(j, j+500);
    const res = UrlFetchApp.fetch(baseUrl + "/records/batch_update", {
      method:"POST", headers:{"Authorization":"Bearer "+larkToken,"Content-Type":"application/json"},
      payload: JSON.stringify({records: batch}), muteHttpExceptions:true
    });
    const r = JSON.parse(res.getContentText());
    if (r.code !== 0) { Logger.log("Update loi: " + r.msg + " | code: " + r.code); }
    else { updated += batch.length; Logger.log("Da update: " + updated + "/" + toUpdate.length); }
    Utilities.sleep(300);
  }

  Logger.log("XONG — Tao: " + created + " | Update: " + updated + " records trong KOC Master Data!");
}

function step5_UpdateKOCMaster() { updateKOCMasterTable(); }
function step5a_ListTables()     { findKOCMasterTableId(); }
