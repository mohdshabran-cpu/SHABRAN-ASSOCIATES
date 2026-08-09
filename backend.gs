/* ============================================================
   SHABRAN ASSOCIATES — Backend (Google Apps Script)
   ------------------------------------------------------------
   Fungsi:
   1. Terima tempahan konsultasi (RM250)
   2. Simpan dalam Google Sheet (database)
   3. Hantar notifikasi email ke pemilik firma (mohdshabran@gmail.com)
   4. Hantar pengesahan email ke klien bila peguam sahkan/tolak
   5. Kawalan tarikh cuti / slot ditempah

   CARA PASANG:
   A) Buka https://script.google.com
   B) "New Project" -> tampal SEMUA kod ini -> ganti URL di bawah
   C) Save -> Deploy -> New deployment -> Web app
      - Execute as: "Me (mohdshabran@gmail.com)"
      - Who has access: "Anyone"
   D) Salin URL "Web app" -> tampal dalam js/config.js (scriptUrl)
   E) Nota: Kali pertama run, benarkan kebenaran Gmail + Sheets.
   ============================================================ */

/******************** KONFIGURASI ********************/
var CONFIG = {
  OWNER_EMAIL: "mohdshabran@gmail.com",      /* email penerima notifikasi tempahan baru */
  ADMIN_PASSWORD: "shabran2026",             /* kata laluan admin (sila tukar!) */
  FEE: 250,                                  /* yuran konsultasi RM */
  FEE_DESC: "Konsultasi Syarie (1 sesi / 45 minit)",
  FIRM_NAME: "Shabran Associates",
  FIRM_ADDRESS: "No. 2, Simpang 3, Lorong Bulud, Kg Likas, 89450 Kota Kinabalu, Sabah",
  FIRM_PHONE: "012-8199296",
  TIME_SLOTS: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  CLOSED_DAYS: [0],                          /* 0 = Ahad */
  SHEET_BOOKINGS: "bookings",
  SHEET_BLOCKED: "blocked"
};

var SS = (function () {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) { /* skrip kendiri (standalone) */ }
  var dbName = "Shabran Associates - Database";
  var it = DriveApp.getFilesByName(dbName);
  if (it.hasNext()) return SpreadsheetApp.openById(it.next().getId());
  return SpreadsheetApp.create(dbName);
})();

/******************** UTILS ********************/
function getSheet_(name, headers) {
  var sh = SS.getSheetByName(name);
  if (!sh) {
    sh = SS.insertSheet(name);
    if (headers) sh.appendRow(headers);
  }
  return sh;
}

function initSheets_() {
  getSheet_(CONFIG.SHEET_BOOKINGS, ["ref", "date", "time", "name", "ic", "phone", "email", "category", "description", "bank", "payDate", "payRef", "amount", "status", "rejectReason", "created"]);
  getSheet_(CONFIG.SHEET_BLOCKED, ["date", "reason", "created"]);
}

function todayKey_(d) {
  var pad = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function fmtMY_(key) {
  var MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
  var p = String(key).split("-");
  if (p.length !== 3) return key;
  return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowsToBookings_(rows) {
  if (!rows || rows.length < 2) return [];
  var headers = rows[0];
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var o = {};
    for (var j = 0; j < headers.length; j++) o[headers[j]] = r[j] === undefined ? "" : r[j];
    out.push(o);
  }
  return out;
}

function findBooking_(sh, ref) {
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(ref).toUpperCase()) {
      var o = {};
      for (var j = 0; j < headers.length; j++) o[headers[j]] = data[i][j] === undefined ? "" : data[i][j];
      o.row = i + 1;
      return o;
    }
  }
  return null;
}

function updateRow_(sh, row, key, val) {
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var col = headers.indexOf(key) + 1;
  if (col > 0) sh.getRange(row, col).setValue(val);
}

/******************** EMAIL ********************/
function sendMail_(to, subject, html) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function emailShell_(inner) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2d9c0;border-radius:12px;overflow:hidden">' +
    '<div style="background:#0d0d0d;color:#e3c878;padding:22px 28px">' +
    '<h2 style="margin:0;font-size:22px">' + CONFIG.FIRM_NAME + '</h2>' +
    '<div style="font-size:11px;letter-spacing:2px;color:#c9a24b">PEGUAM SYARIE &bull; KOTA KINABALU, SABAH</div>' +
    '</div>' +
    '<div style="padding:26px 28px;color:#22302b;font-size:14px;line-height:1.8">' + inner + '</div>' +
    '<div style="background:#f6f0e1;padding:16px 28px;font-size:11.5px;color:#6b6f66;line-height:1.7">' +
    CONFIG.FIRM_NAME + ' &bull; ' + CONFIG.FIRM_ADDRESS + '<br>Tel: ' + CONFIG.FIRM_PHONE + ' &bull; ' + CONFIG.OWNER_EMAIL +
    '</div></div>';
}

function bookingTableHtml_(b) {
  return '<table style="width:100%;border-collapse:collapse;font-size:13.5px">' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold;width:38%">Rujukan Tempahan</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.ref + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Nama</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.name + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">No. K/P</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.ic + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Telefon</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.phone + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Email</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.email + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Tarikh Sesi</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + fmtMY_(b.date) + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Masa</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + b.time + ' (45 minit)</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Kategori</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + (b.category || "-") + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Bank</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + (b.bank || "-") + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Tarikh Bayaran</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + fmtMY_(b.payDate || "-") + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Rujukan Transaksi</td><td style="padding:8px 10px;border-bottom:1px solid #eee">' + (b.payRef || "-") + '</td></tr>' +
    '<tr><td style="padding:8px 10px;background:#f6f0e1;font-weight:bold">Jumlah</td><td style="padding:8px 10px"><b>RM' + (Number(b.amount) || CONFIG.FEE).toFixed(2) + '</b></td></tr>' +
    '</table>';
}

/******************** TINDAKAN: TEMPAHAN ********************/
function createBooking_(b) {
  var sh = getSheet_(CONFIG.SHEET_BOOKINGS);
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) === String(b.date) && String(r[2]) === String(b.time) && String(r[13]) !== "REJECTED") {
      return json_({ ok: false, error: "SLOT_TAKEN" });
    }
    if (String(r[3]).toUpperCase() === String(b.name).toUpperCase() && String(r[1]) === String(b.date)) {
      return json_({ ok: false, error: "DUPLICATE" });
    }
  }

  b.created = new Date().toISOString();
  b.amount = b.amount || CONFIG.FEE;

  sh.appendRow([
    b.ref, b.date, b.time, b.name, b.ic, b.phone, b.email, b.category, b.description,
    b.bank, b.payDate, b.payRef, b.amount, b.status || "PENDING", "", b.created
  ]);

  /* Email 1: notifikasi kepada peguam */
  sendMail_(CONFIG.OWNER_EMAIL,
    "[Tempahan Baru] " + b.ref + " - " + b.name,
    emailShell_(
      '<h3 style="margin:0 0 6px;color:#0d0d0d">Tempahan Baru Diterima</h3>' +
      '<p style="margin:0 0 18px;color:#6b6f66">Sila semak dan sahkan bayaran sebelum mengesahkan tempahan.</p>' +
      bookingTableHtml_(b) +
      '<p style="margin-top:20px"><a href="https://docs.google.com/spreadsheets/d/' + SS.getId() + '/edit" style="background:#0d0d0d;color:#e3c878;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Buka Google Sheet Tempahan</a></p>'
    ));

  /* Email 2: akuan kepada klien */
  sendMail_(b.email,
    "Pengakuan Tempahan - " + b.ref + " | Shabran Associates",
    emailShell_(
      '<h3 style="margin:0 0 6px;color:#0d0d0d">Assalamualaikum ' + b.name + ',</h3>' +
      '<p style="margin:0 0 18px">Terima kasih kerana menempah sesi konsultasi bersama kami. Butiran tempahan anda:</p>' +
      bookingTableHtml_(b) +
      '<p style="margin-top:18px"><b>Status bayaran:</b> Menunggu pengesahan oleh pihak firma (biasanya dalam 24 jam bekerja).</p>' +
      '<p style="margin:0">Anda akan dimaklumkan melalui email sebaik sahaja tempahan disahkan. <b>Sila semak folder spam sekiranya email tidak diterima.</b></p>'
    ));

  return json_({ ok: true, ref: b.ref });
}

function confirmBooking_(ref, pass) {
  if (pass !== CONFIG.ADMIN_PASSWORD) return json_({ ok: false, error: "AUTH_FAILED" });
  var sh = getSheet_(CONFIG.SHEET_BOOKINGS);
  var b = findBooking_(sh, ref);
  if (!b) return json_({ ok: false, error: "NOT_FOUND" });

  updateRow_(sh, b.row, "status", "CONFIRMED");
  b.status = "CONFIRMED";

  sendMail_(CONFIG.OWNER_EMAIL,
    "[Disahkan] " + ref,
    emailShell_('<p style="margin:0">Tempahan <b>' + ref + '</b> (' + b.name + ') telah <b style="color:#2e7d4f">disahkan</b>. Klien telah dimaklumkan melalui email.</p>'));

  sendMail_(b.email,
    "Tempahan Disahkan - " + ref + " | Shabran Associates",
    emailShell_(
      '<h3 style="margin:0 0 6px;color:#0d0d0d">Assalamualaikum ' + b.name + ',</h3>' +
      '<p style="margin:0 0 18px">Alhamdulillah, tempahan sesi konsultasi anda telah <b style="color:#2e7d4f">DISAHKAN</b>.</p>' +
      bookingTableHtml_(b) +
      '<p style="margin-top:18px"><b>Lokasi:</b><br>' + CONFIG.FIRM_ADDRESS + '</p>' +
      '<p style="margin:6px 0 0"><b>Peringatan:</b> Sila hadir 10 minit lebih awal. Sekiranya perlu menangguhkan sesi, maklumkan kami segera melalui ' + CONFIG.OWNER_EMAIL + '.</p>'
    ));

  return json_({ ok: true });
}

function rejectBooking_(ref, pass, reason) {
  if (pass !== CONFIG.ADMIN_PASSWORD) return json_({ ok: false, error: "AUTH_FAILED" });
  var sh = getSheet_(CONFIG.SHEET_BOOKINGS);
  var b = findBooking_(sh, ref);
  if (!b) return json_({ ok: false, error: "NOT_FOUND" });

  updateRow_(sh, b.row, "status", "REJECTED");
  updateRow_(sh, b.row, "rejectReason", reason || "");
  b.status = "REJECTED";
  b.rejectReason = reason || "";

  sendMail_(CONFIG.OWNER_EMAIL,
    "[Ditolak] " + ref,
    emailShell_('<p style="margin:0">Tempahan <b>' + ref + '</b> (' + b.name + ') telah <b style="color:#b3423c">ditolak</b>.<br>Sebab: ' + (reason || "-") + '</p>'));

  sendMail_(b.email,
    "Makluman Tempahan - " + ref + " | Shabran Associates",
    emailShell_(
      '<h3 style="margin:0 0 6px;color:#0d0d0d">Assalamualaikum ' + b.name + ',</h3>' +
      '<p style="margin:0 0 12px">Dengan hormatnya, tempahan konsultasi anda <b style="color:#b3423c">tidak dapat disahkan</b> atas sebab berikut:</p>' +
      '<div style="background:#fbe6e4;border:1px solid #eec4c0;border-radius:8px;padding:14px 16px;color:#8a312c">' + (reason || "Bayaran tidak dapat disahkan.") + '</div>' +
      '<p style="margin:16px 0 0">Sekiranya anda telah membuat bayaran, sila hubungi kami untuk penyelesaian lanjut melalui ' + CONFIG.OWNER_EMAIL + ' atau telefon ' + CONFIG.FIRM_PHONE + '.</p>'
    ));

  return json_({ ok: true });
}

/******************** TINDAKAN: TARIKH CUTI ********************/
function blockDate_(date, reason, pass) {
  if (pass !== CONFIG.ADMIN_PASSWORD) return json_({ ok: false, error: "AUTH_FAILED" });
  var sh = getSheet_(CONFIG.SHEET_BLOCKED);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(date)) return json_({ ok: true });
  }
  sh.appendRow([date, reason || "", new Date().toISOString()]);
  return json_({ ok: true });
}

function unblockDate_(date, pass) {
  if (pass !== CONFIG.ADMIN_PASSWORD) return json_({ ok: false, error: "AUTH_FAILED" });
  var sh = getSheet_(CONFIG.SHEET_BLOCKED);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(date)) {
      sh.deleteRow(i + 1);
      return json_({ ok: true });
    }
  }
  return json_({ ok: false, error: "NOT_FOUND" });
}

/******************** API: GET ********************/
function getAvailability_() {
  var shB = getSheet_(CONFIG.SHEET_BOOKINGS);
  var shK = getSheet_(CONFIG.SHEET_BLOCKED);

  var blocked = [];
  var bData = shK.getDataRange().getValues();
  for (var i = 1; i < bData.length; i++) if (bData[i][0]) blocked.push(String(bData[i][0]));

  var booked = {};
  var data = shB.getDataRange().getValues();
  for (var j = 1; j < data.length; j++) {
    var d = String(data[j][1]);
    var t = String(data[j][2]);
    var st = String(data[j][13]);
    if (d && t && st !== "REJECTED") {
      if (!booked[d]) booked[d] = [];
      if (booked[d].indexOf(t) === -1) booked[d].push(t);
    }
  }
  return json_({ ok: true, blocked: blocked, booked: booked });
}

function getBlocked_() {
  var shK = getSheet_(CONFIG.SHEET_BLOCKED);
  var data = shK.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) out.push({ date: String(data[i][0]), reason: String(data[i][1] || "") });
  }
  return json_({ ok: true, blocked: out });
}

function getBooking_(ref) {
  var sh = getSheet_(CONFIG.SHEET_BOOKINGS);
  var b = findBooking_(sh, ref);
  if (!b) return json_({ ok: false, error: "NOT_FOUND" });
  delete b.row;
  return json_({ ok: true, booking: b });
}

function getBookings_(pass) {
  if (pass !== CONFIG.ADMIN_PASSWORD) return json_({ ok: false, error: "AUTH_FAILED" });
  var sh = getSheet_(CONFIG.SHEET_BOOKINGS);
  var rows = sh.getDataRange().getValues();
  var list = rowsToBookings_(rows);
  list.forEach(function (b) { delete b.row; });
  return json_({ ok: true, bookings: list });
}

function verify_(pass) {
  return json_({ ok: pass === CONFIG.ADMIN_PASSWORD });
}

/******************** ENTRY POINT ********************/
function doGet(e) {
  return doHandle_(e.parameter);
}

function doPost(e) {
  var payload = {};
  try {
    if (e.postData && e.postData.contents) payload = JSON.parse(e.postData.contents);
  } catch (err) {
    payload = {};
  }
  return doHandle_(payload);
}

function doHandle_(p) {
  initSheets_();
  var action = p.action || "";

  try {
    switch (action) {
      case "createBooking":  return createBooking_(p);
      case "confirmBooking": return confirmBooking_(p.ref, p.password);
      case "rejectBooking":  return rejectBooking_(p.ref, p.password, p.reason);
      case "blockDate":      return blockDate_(p.date, p.reason, p.password);
      case "unblockDate":    return unblockDate_(p.date, p.password);
      case "getAvailability":return getAvailability_();
      case "getBlocked":     return getBlocked_();
      case "getBooking":     return getBooking_(p.ref);
      case "getBookings":    return getBookings_(p.password);
      case "verify":         return verify_(p.password);
      default:
        return json_({ ok: false, error: "UNKNOWN_ACTION" });
    }
  } catch (e) {
    return json_({ ok: false, error: "SERVER_ERROR", detail: String(e) });
  }
}
