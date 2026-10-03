/* ES Journey · ตัวแสดงผลหน้าเว็บ (ไม่ต้องแก้ไฟล์นี้เมื่อเพิ่มสื่อหรืออัปเดตคะแนน) */
window.ESJ = window.ESJ || {};
(function (ESJ) {
  "use strict";
  ESJ.weekItems = {};
  ESJ.week = function (n, items) { ESJ.weekItems[n] = (items || []).filter(Boolean); };
  ESJ.scores = function (data) { ESJ.scoreData = data; };

  var TYPE = {
    slides: "สไลด์", worksheet: "ใบงาน", sim: "สถานการณ์จำลอง", activity: "กิจกรรมออนไลน์",
    video: "วีดิทัศน์", link: "ลิงก์", doc: "เอกสาร"
  };
  var C, S, $app;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function roomKey(r) { return r.replace("/", "-"); }
  function roomFromKey(k) { return k.replace("-", "/"); }
  function weekOf(code) { for (var i = 0; i < C.weeks.length; i++) if (C.weeks[i].task === code) return C.weeks[i].week; return 99; }
  function taskOf(code) { for (var i = 0; i < C.tasks.length; i++) if (C.tasks[i].code === code) return C.tasks[i]; return null; }
  function unitOf(id) { for (var i = 0; i < C.units.length; i++) if (C.units[i].id === id) return C.units[i]; return null; }
  function itemsOf(w) { return ESJ.weekItems[w] || []; }

  /* สัปดาห์ปัจจุบันตามปฏิทิน: 0 = ก่อนเปิดภาค, 21 = หลังจบภาค */
  function calWeek() {
    if (C.forceWeek) return C.forceWeek;
    var p = C.startDate.split("-"), start = new Date(+p[0], +p[1] - 1, +p[2]);
    var d = Math.floor((new Date() - start) / 86400000);
    if (d < 0) return 0;
    return Math.min(21, Math.floor(d / 7) + 1);
  }
  function wkClass(w) {
    var u = w.task === "MID" || w.task === "FINAL" ? "ex" : "u" + w.unit;
    return u;
  }
  function taskLabel(w) {
    if (w.task === "MID") return "กลางภาค";
    if (w.task === "FINAL") return "ปลายภาค";
    return w.task || "ปฐมนิเทศ";
  }
  function planetOf(w) {
    if (w.task === "MID") return "assets/img/planet-saturn.png";
    if (w.task === "FINAL") return "assets/img/planet-sun.png";
    if (!w.unit) return "assets/img/planet-moon.png";
    return unitOf(w.unit).planet;
  }

  /* ---------- คำนวณผลรายคน ---------- */
  function analyse(st) {
    var asOf = S.asOfWeek || 0, r = { half1: 0, half2: 0, due: 0, ok: 0, pending: [], future: 0, rows: [] };
    C.tasks.forEach(function (t) {
      var wk = weekOf(t.code), v = st.done && st.done[t.code], state;
      if (v === 1 || v === true) state = "ok";
      else if (v === "p") state = "part";
      else if (wk < asOf) state = "miss";
      else if (wk === asOf) state = "now";
      else state = "na";
      if (state === "ok") { r[t.half === 1 ? "half1" : "half2"] += t.pts; }
      if (wk <= asOf || state === "ok" || state === "part") {
        if (state !== "now" || v) r.due += 1;
        if (state === "ok") r.ok += 1;
      }
      if (state === "miss" || state === "part") r.pending.push(t);
      if (state === "na" || state === "now") r.future += t.pts;
      r.rows.push({ t: t, wk: wk, state: state });
    });
    var mid = st.mid ? st.mid.best : null, fin = st.final;
    r.mid = mid; r.fin = fin;
    var proj = r.half1 + r.half2 + r.future + (mid != null ? mid : C.risk.assumeMid) + (fin != null ? fin : C.risk.assumeFinal);
    r.total = r.half1 + r.half2 + (mid || 0) + (fin || 0);
    r.risk = r.pending.length > 0 && proj < C.risk.passLine;
    r.pct = r.due ? Math.round(r.ok * 100 / r.due) : 0;
    return r;
  }
  var CELL = { ok: ["ok", "ส่ง"], part: ["part", "ไม่ครบ"], miss: ["miss", "ค้าง"], now: ["now", "กำลังทำ"], na: ["na", "–"] };
  var STATE_TXT = { ok: "ส่งแล้ว", part: "ส่งแล้ว ยังไม่ครบทุกส่วน", miss: "ค้างส่ง", now: "สัปดาห์นี้", na: "ยังไม่ถึงกำหนด" };

  function sampleNote() {
    return S && S.sample ? '<div class="sample">ตอนนี้เป็นข้อมูลตัวอย่าง ชื่อนักเรียนเป็นชื่อสมมติ เพื่อดูหน้าตาเว็บเท่านั้น เมื่อเปิดภาคเรียนครูจะอัปเดตเป็นข้อมูลจริง</div>' : "";
  }
  function updatedNote() {
    return S ? '<p class="muted" style="font-size:14px;margin-top:10px">ข้อมูลการส่งงานอัปเดต ' + esc(S.updated) + (S.asOfWeek ? " · นับงานถึงสัปดาห์ที่ " + S.asOfWeek : "") + "</p>" : "";
  }

  /* ---------- ชิ้นส่วนที่ใช้ซ้ำ ---------- */
  function track(now) {
    var h = '<div class="track">';
    C.weeks.forEach(function (w) {
      var cls = wkClass(w) + (w.week === now ? " now" : (w.week < now ? " past" : ""));
      h += '<a class="' + cls + '" href="#/week/' + w.week + '" title="สัปดาห์ที่ ' + w.week + " " + esc(w.title) + '">' + w.week + "</a>";
    });
    return h + '</div><div class="track-legend"><span class="l1">หน่วย 1 โลกในเอกภพ</span><span class="l2">หน่วย 2 การเปลี่ยนแปลงภายในโลก</span><span class="l3">หน่วย 3 ลมฟ้าอากาศ</span><span class="l4">สอบ</span></div>';
  }
  function itemHTML(it, w) {
    var href = it.url || (it.file ? "weeks/w" + pad(w) + "/" + encodeURI(it.file) : "");
    var label = TYPE[it.type] || "สื่อ";
    var h = '<div class="item"><span class="t ' + esc(it.type) + '">' + esc(label) + (it.code ? " " + esc(it.code) : "") + "</span><div><b>" + esc(it.title) + "</b>";
    if (it.note) h += '<span class="n">' + esc(it.note) + "</span>";
    if (it.qr) h += '<br><img class="qr" src="weeks/w' + pad(w) + "/" + encodeURI(it.qr) + '" alt="QR code ' + esc(it.title) + '">';
    h += "</div>";
    h += href ? '<a class="btn" href="' + esc(href) + '" target="_blank" rel="noopener">เปิด</a>' : '<span class="btn off">เร็ว ๆ นี้</span>';
    return h + "</div>";
  }
  function itemsBlock(w) {
    var its = itemsOf(w);
    if (!its.length) return '<div class="empty">ครูกำลังเตรียมใบงานและสื่อของสัปดาห์นี้</div>';
    return '<div class="items">' + its.map(function (it) { return itemHTML(it, w); }).join("") + "</div>";
  }

  /* ---------- หน้า: ศูนย์ควบคุม ---------- */
  function pageHome() {
    var cw = calWeek(), show = Math.max(1, Math.min(20, cw || 1)), w = C.weeks[show - 1];
    var lead = cw === 0 ? "ภารกิจแรก (เปิดภาค 26 ต.ค. 2569)" : (cw > 20 ? "ภารกิจสุดท้าย" : "ภารกิจสัปดาห์นี้");
    var h = sampleNote();
    h += '<section class="hero"><img class="p1" src="assets/img/planet-earth.png" alt=""><img class="p2" src="assets/img/planet-moon.png" alt="">' +
      '<div class="kicker">' + esc(C.term) + " · " + esc(C.code) + "</div><h1>ES JOURNEY</h1>" +
      '<div class="sub">ภารกิจ 20 สัปดาห์ สำรวจโลกและอวกาศ</div>' +
      '<p class="meta">ทุกคนคือนักบินอวกาศ ครูคือศูนย์ควบคุมภารกิจ ทำใบงานทุกสัปดาห์ให้ครบ ภารกิจของเราไม่แข่งกัน แต่ไปถึงปลายทางด้วยกัน</p>' +
      '<span class="pill">' + (cw === 0 ? "นับถอยหลังสู่สัปดาห์ที่ 1" : cw > 20 ? "จบภาคเรียน" : "ตอนนี้ สัปดาห์ที่ " + cw + " จาก 20") + "</span>" +
      track(cw) + "</section>";

    h += '<div class="grid g2 sec" style="align-items:start">';
    h += '<section class="panel"><div class="kicker">' + lead + '</div><div class="now-card" style="margin-top:10px"><img src="' + planetOf(w) + '" alt="">' +
      '<div><div class="wk-no">สัปดาห์ที่ ' + w.week + " · " + esc(w.dates) + '</div><h2 style="font-size:24px;margin:4px 0 4px">' + esc(w.title) + '</h2><p class="muted" style="margin:0 0 8px;font-size:15px">' + esc(w.topic) + "</p>" +
      '<span class="code ' + wkClass(w) + '">' + esc(taskLabel(w)) + "</span>" +
      (taskOf(w.task) && taskOf(w.task).capstone ? ' <span class="cap">ภารกิจปลายทาง</span>' : "") +
      '<div style="margin-top:6px"><a href="#/week/' + w.week + '">ดูรายละเอียดสัปดาห์นี้</a></div></div></div>' + itemsBlock(w.week) + "</section>";

    h += '<div class="grid">';
    h += '<section class="panel"><div class="kicker">ประกาศจากศูนย์ควบคุม</div>' +
      (ESJ.site && ESJ.site.announce || []).map(function (a) { return '<div class="ann"><small>' + esc(a.date) + "</small><div>" + esc(a.text) + "</div></div>"; }).join("") + "</section>";
    h += '<section class="panel"><div class="kicker">ลิงก์ภารกิจ</div><div class="links" style="margin-top:10px">' +
      (ESJ.site && ESJ.site.links || []).map(function (l) {
        return '<div class="link-row"><div>' + esc(l.title) + "<small>" + esc(l.note) + "</small></div>" +
          (l.url ? '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">เปิด</a>' : '<span class="btn off">เร็ว ๆ นี้</span>') + "</div>";
      }).join("") + "</div></section>";
    h += "</div></div>";

    h += '<section class="sec"><div class="sec-h"><h2>ความคืบหน้าของแต่ละห้อง</h2><span class="muted">คลิกห้องเพื่อดูการส่งงานรายคน</span></div><div class="grid g3 rooms">';
    C.rooms.forEach(function (r) {
      var list = (S && S.rooms[r]) || [], due = 0, ok = 0;
      list.forEach(function (st) { var a = analyse(st); due += a.due; ok += a.ok; });
      var p = due ? Math.round(ok * 100 / due) : 0;
      h += '<a href="#/room/' + roomKey(r) + '"><div class="rn">ม.' + r + '</div><div class="muted">' + esc(C.roomInfo[r]) + " · " + list.length + " คน</div>" +
        '<div class="bar"><i style="width:' + p + '%"></i></div><div style="margin-top:6px;font-size:15px">ส่งงานแล้ว <b class="pct">' + p + "%</b> ของงานที่ถึงกำหนด</div></a>";
    });
    h += "</div>" + updatedNote() + "</section>";
    return h;
  }

  /* ---------- หน้า: แผนที่ภารกิจ ---------- */
  function pageMap() {
    var cw = calWeek();
    var h = '<div class="sec-h"><div><div class="kicker">MISSION MAP · 20 WEEKS</div><h1 style="font-size:clamp(28px,5vw,40px)">แผนที่ภารกิจ 20 สัปดาห์</h1></div></div>' +
      '<p class="muted" style="margin-top:0">สัปดาห์ละ 3 คาบ : คาบคู่ทำใบงานหรือกิจกรรม 1 ชิ้น และคาบเดี่ยวสำหรับบรรยาย ทบทวน และตามงานค้าง · วันและคาบจริงเป็นไปตามตารางสอนของโรงเรียน</p>' + track(cw);
    var groups = [{ key: "u0", title: "เตรียมความพร้อม", en: "LAUNCH PREP", img: "assets/img/planet-moon.png", ws: [1] }];
    C.units.forEach(function (u) {
      groups.push({ key: "u" + u.id, title: "หน่วยที่ " + u.id + " " + u.name, en: u.en, img: u.planet,
        ws: C.weeks.filter(function (w) { return w.unit === u.id; }).map(function (w) { return w.week; }) });
    });
    groups.push({ key: "u0", title: "สอบปลายภาค", en: "FINAL · PROT EXAM", img: "assets/img/planet-sun.png", ws: [20] });
    groups.forEach(function (g) {
      h += '<section class="unit ' + g.key + '"><div class="unit-h"><img src="' + g.img + '" alt=""><div><div class="kicker">' + esc(g.en) + "</div><h2>" + esc(g.title) + '</h2></div></div><div class="path">';
      g.ws.forEach(function (n) {
        var w = C.weeks[n - 1], t = taskOf(w.task), cnt = itemsOf(n).length;
        h += '<a class="stop' + (n === cw ? " now" : n < cw ? " past" : "") + '" href="#/week/' + n + '">' +
          '<div class="wk">สัปดาห์<b>' + n + '</b></div><div><div class="tp"><b>' + esc(w.title) + '</b></div><div class="dt">' + esc(w.topic) + '</div><div class="dt">' + esc(w.dates) + (w.note ? " · " + esc(w.note) : "") + "</div></div>" +
          '<div class="side"><span class="code ' + wkClass(w) + '">' + esc(taskLabel(w)) + "</span>" + (t && t.capstone ? '<span class="cap">ภารกิจปลายทาง</span>' : "") +
          '<span class="cnt">' + (cnt ? "สื่อ " + cnt + " รายการ" : "รอสื่อ") + "</span></div></a>";
      });
      h += "</div></section>";
    });
    return h;
  }

  /* ---------- หน้า: สัปดาห์ ---------- */
  function pageWeek(n) {
    n = Math.max(1, Math.min(20, parseInt(n, 10) || 1));
    var w = C.weeks[n - 1], t = taskOf(w.task), u = unitOf(w.unit), cw = calWeek();
    var h = '<div class="panel"><div class="wk-head"><div><div class="kicker">' + (u ? esc(u.en) : w.task === "FINAL" ? "FINAL EXAM" : "LAUNCH PREP") + " · WEEK " + pad(n) + "</div>" +
      "<h1>สัปดาห์ที่ " + n + " : " + esc(w.title) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(w.topic) + "</p>" + '<div style="margin-top:10px"><span class="code ' + wkClass(w) + '">' + esc(taskLabel(w)) + "</span> " +
      (t && t.capstone ? '<span class="cap">ภารกิจปลายทาง</span> ' : "") + (n === cw ? '<span class="cap">สัปดาห์นี้</span>' : "") + "</div></div>" +
      '<img src="' + planetOf(w) + '" alt=""></div><div class="facts">' +
      '<div class="fact"><small>วันที่</small>' + esc(w.dates) + "</div>" +
      '<div class="fact"><small>หน่วยการเรียนรู้</small>' + (u ? "หน่วยที่ " + u.id + " " + esc(u.name) : esc(w.note || "–")) + "</div>";
    if (t) {
      h += '<div class="fact"><small>งานเก็บคะแนน</small>' + esc(t.code) + " " + esc(t.title) + "</div>" +
        '<div class="fact"><small>ตัวชี้วัด · คะแนน</small>' + esc(t.kpi) + " · " + t.pts + " คะแนน</div>";
    } else if (w.task === "MID") {
      h += '<div class="fact"><small>สอบกลางภาค</small>ออนไลน์ 20 ข้อ 20 คะแนน หน่วยที่ 1 · ส่งแล้วเห็นเฉลยทันที สอบซ้ำได้ไม่จำกัด ใช้คะแนนสูงสุด</div>';
    } else if (w.task === "FINAL") {
      h += '<div class="fact"><small>สอบปลายภาค</small>PROT EXAM 20 ข้อ 30 นาที 20 คะแนน · ตัวชี้วัดปลายทาง 10 ตัว</div>';
    }
    h += "</div>";
    if (t) h += '<p class="muted" style="margin:14px 0 0;font-size:15px">' + (t.capstone ? "ภารกิจปลายทาง : ต้องทำให้ครบทุกส่วนจึงได้คะแนนเต็ม" : "ใบงานทั่วไป : ส่งงาน = ได้คะแนนเต็ม") + " · ส่งย้อนหลังได้ถึงวันสุดท้ายก่อนตัดสินผล ไม่หักคะแนน</p>";
    h += '</div><section class="sec"><div class="sec-h"><h2>ใบงานและสื่อการเรียนรู้</h2></div>' + itemsBlock(n) + "</section>";
    h += '<div class="pager">' + (n > 1 ? '<a class="btn ghost" href="#/week/' + (n - 1) + '">สัปดาห์ที่ ' + (n - 1) + "</a>" : "<span></span>") +
      '<a class="btn ghost" href="#/map">แผนที่ภารกิจ</a>' + (n < 20 ? '<a class="btn ghost" href="#/week/' + (n + 1) + '">สัปดาห์ที่ ' + (n + 1) + "</a>" : "<span></span>") + "</div>";
    return h;
  }

  /* ---------- หน้า: ห้องเรียน ---------- */
  var roomFilter = "all", roomQuery = "";
  function pageRoom(key) {
    var r = roomFromKey(key), list = (S && S.rooms[r]) || [];
    if (C.rooms.indexOf(r) < 0) return pageMissing();
    var asOf = S ? S.asOfWeek : 0;
    var shown = C.tasks.filter(function (t) { return weekOf(t.code) <= asOf; });
    var A = list.map(function (st) { return { st: st, a: analyse(st) }; });
    var allDone = A.filter(function (x) { return !x.a.pending.length; }).length;
    var pend = A.reduce(function (s, x) { return s + x.a.pending.length; }, 0);
    var risk = A.filter(function (x) { return x.a.risk; }).length;

    var h = sampleNote() + '<div class="sec-h"><div><div class="kicker">CREW ROSTER · ' + esc(C.roomInfo[r]) + '</div><h1 style="font-size:clamp(28px,5vw,40px)">ห้อง ม.' + r + "</h1></div></div>";
    h += '<div class="stats"><div class="stat"><b>' + list.length + '</b><small>นักบินในห้อง</small></div>' +
      '<div class="stat ok"><b>' + allDone + '</b><small>ส่งครบทุกงานที่ถึงกำหนด</small></div>' +
      '<div class="stat warn"><b>' + pend + '</b><small>งานค้างรวมทั้งห้อง</small></div>' +
      '<div class="stat err"><b>' + risk + '</b><small>เสี่ยงติด ร</small></div></div>';

    h += '<section class="sec"><div class="sec-h"><h2>ความคืบหน้าภารกิจของห้อง</h2><span class="muted">ร้อยละของนักเรียนที่ส่งงานแล้ว</span></div><div class="mbars">';
    if (!shown.length) h += '<div class="empty">ยังไม่มีงานที่ถึงกำหนด</div>';
    shown.forEach(function (t) {
      var ok = list.filter(function (st) { var v = st.done && st.done[t.code]; return v === 1 || v === true; }).length;
      var p = list.length ? Math.round(ok * 100 / list.length) : 0;
      h += '<div class="mbar' + (weekOf(t.code) === asOf ? " now" : "") + '"><div class="row"><b>' + t.code + "</b><span>" + ok + "/" + list.length + '</span></div><div class="bar"><i style="width:' + p + '%"></i></div></div>';
    });
    if (shown.length && list.length && list[0].mid !== undefined && asOf >= 9) {
      var took = list.filter(function (st) { return st.mid; }).length, p2 = Math.round(took * 100 / list.length);
      h += '<div class="mbar"><div class="row"><b>กลางภาค</b><span>สอบแล้ว ' + took + "/" + list.length + '</span></div><div class="bar"><i style="width:' + p2 + '%"></i></div></div>';
    }
    h += "</div></section>";

    h += '<section class="sec"><div class="sec-h"><h2>การส่งงานรายคน</h2><span class="muted">เรียงตามเลขที่ คลิกชื่อเพื่อดูรายละเอียด</span></div>' +
      '<div class="tools" id="tools"><button class="chip" data-f="all">ทั้งหมด</button><button class="chip" data-f="pend">มีงานค้าง</button><button class="chip" data-f="risk">เสี่ยงติด ร</button>' +
      '<input class="search" id="q" type="search" placeholder="ค้นหาชื่อหรือเลขที่" value="' + esc(roomQuery) + '"></div>' +
      '<div class="tablewrap"><table class="roster"><thead><tr><th class="no">เลขที่</th><th class="nm">ชื่อ-นามสกุล</th>' +
      shown.map(function (t) { return '<th class="' + (weekOf(t.code) === asOf ? "cur" : "") + '">' + t.code + "</th>"; }).join("") +
      (asOf >= 9 ? "<th>กลางภาค</th>" : "") + "<th>ส่งแล้ว</th><th>สถานะ</th></tr></thead><tbody id=\"rows\">";
    A.forEach(function (x) {
      var st = x.st, a = x.a;
      h += '<tr data-p="' + (a.pending.length ? 1 : 0) + '" data-r="' + (a.risk ? 1 : 0) + '" data-s="' + esc(st.no + " " + st.name) + '"><td class="no">' + st.no + '</td><td class="nm"><a href="#/student/' + key + "/" + st.no + '">' + esc(st.name) + "</a></td>";
      a.rows.forEach(function (rw) {
        if (rw.wk > asOf) return;
        var c = CELL[rw.state];
        h += '<td><span class="c ' + c[0] + '">' + c[1] + "</span></td>";
      });
      if (asOf >= 9) h += "<td>" + (st.mid ? st.mid.best : '<span class="c miss">ยังไม่สอบ</span>') + "</td>";
      h += '<td class="pct">' + a.pct + "%</td><td>" + (a.risk ? '<span class="risk">เสี่ยงติด ร</span>' : a.pending.length ? '<span class="c miss">ค้าง ' + a.pending.length + "</span>" : '<span class="c ok">ครบ</span>') + "</td></tr>";
    });
    h += "</tbody></table></div>" +
      '<div class="legend"><span><span class="c ok">ส่ง</span> ส่งแล้ว</span><span><span class="c miss">ค้าง</span> ยังไม่ส่ง</span><span><span class="c part">ไม่ครบ</span> ภารกิจปลายทางยังไม่ครบทุกส่วน</span><span><span class="c now">กำลังทำ</span> งานของสัปดาห์นี้</span></div>' +
      '<p class="muted" style="font-size:14px">ไม่มีการจัดอันดับ ตารางนี้ให้เพื่อนช่วยเตือนเพื่อนตามงาน ส่งย้อนหลังได้ทุกงานโดยไม่หักคะแนน</p>' + updatedNote() + "</section>";
    return h;
  }
  function bindRoom() {
    var tools = document.getElementById("tools"); if (!tools) return;
    function apply() {
      Array.prototype.forEach.call(tools.querySelectorAll(".chip"), function (b) { b.classList.toggle("on", b.getAttribute("data-f") === roomFilter); });
      var q = roomQuery.trim();
      Array.prototype.forEach.call(document.querySelectorAll("#rows tr"), function (tr) {
        var ok = (roomFilter === "all" || (roomFilter === "pend" && tr.getAttribute("data-p") === "1") || (roomFilter === "risk" && tr.getAttribute("data-r") === "1")) &&
          (!q || tr.getAttribute("data-s").indexOf(q) >= 0);
        tr.style.display = ok ? "" : "none";
      });
    }
    tools.addEventListener("click", function (e) { var f = e.target.getAttribute && e.target.getAttribute("data-f"); if (f) { roomFilter = f; apply(); } });
    document.getElementById("q").addEventListener("input", function (e) { roomQuery = e.target.value; apply(); });
    apply();
  }

  /* ---------- หน้า: รายคน ---------- */
  function pageStudent(key, no) {
    var r = roomFromKey(key), list = (S && S.rooms[r]) || [], st = null, idx = -1;
    for (var i = 0; i < list.length; i++) if (String(list[i].no) === String(no)) { st = list[i]; idx = i; }
    if (!st) return pageMissing();
    var a = analyse(st), circ = 2 * Math.PI * 80, off = circ * (1 - a.pct / 100);
    var h = sampleNote() + '<div class="panel me"><div><div class="callsign">นักบิน ES-' + r.replace("4/", "4") + "-" + pad(st.no) + '</div><h1>' + esc(st.name) + '</h1><div class="muted">ห้อง ม.' + r + " เลขที่ " + st.no + " · " + esc(C.roomInfo[r]) + "</div>" +
      (a.risk ? '<p style="margin:12px 0 0"><span class="risk">เสี่ยงติด ร</span> <span class="muted">มีงานค้างและคะแนนรวมอาจไม่ถึง 70 รีบตามส่งงานได้เลย</span></p>' : "") + "</div>" +
      '<div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="16"/>' +
      '<circle cx="100" cy="100" r="80" fill="none" stroke="url(#gr)" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<defs><linearGradient id="gr"><stop offset="0" stop-color="#4FD8FF"/><stop offset="1" stop-color="#A77BFF"/></linearGradient></defs></svg>' +
      '<div class="lbl"><b>' + a.pct + '%</b><small>ส่งแล้ว ' + a.ok + "/" + a.due + "<br>งานที่ถึงกำหนด</small></div></div></div>";

    h += '<section class="sec"><div class="sec-h"><h2>คะแนนสะสม</h2><span class="muted">4 ช่องตามที่กรอกในระบบของโรงเรียน</span></div><div class="grid g4 scores">' +
      '<div class="sc"><small>คะแนนเก็บก่อนกลางภาค</small><b>' + a.half1 + " <span>/ 30</span></b></div>" +
      '<div class="sc"><small>สอบกลางภาค (ครั้งที่ดีที่สุด)</small><b>' + (a.mid != null ? a.mid : "–") + " <span>/ 20</span></b>" + (st.mid ? '<small>สอบแล้ว ' + st.mid.tries + " ครั้ง</small>" : "<small>ยังไม่ได้สอบ</small>") + "</div>" +
      '<div class="sc"><small>คะแนนเก็บหลังกลางภาค</small><b>' + a.half2 + " <span>/ 30</span></b></div>" +
      '<div class="sc"><small>สอบปลายภาค</small><b>' + (a.fin != null ? a.fin : "–") + " <span>/ 20</span></b></div></div></section>";

    if (a.pending.length) {
      h += '<section class="sec todo"><h2 style="font-size:20px">งานที่ต้องตามส่ง ' + a.pending.length + " งาน</h2><ul>" +
        a.pending.map(function (t) { return "<li><b>" + t.code + "</b> " + esc(t.title) + ' <a href="#/week/' + weekOf(t.code) + '">ดาวน์โหลดใบงาน</a></li>'; }).join("") +
        '</ul><div class="muted" style="font-size:15px">ส่งย้อนหลังได้ถึงวันสุดท้ายก่อนตัดสินผล ไม่หักคะแนน ไม่จำกัดครั้ง</div></section>';
    } else if (a.due) {
      h += '<section class="sec done-all"><h2 style="font-size:20px;color:var(--ok)">ภารกิจครบทุกงานที่ถึงกำหนดแล้ว</h2><div class="muted">เดินทางต่อได้เลย นักบิน</div></section>';
    }

    h += '<section class="sec"><div class="sec-h"><h2>บันทึกภารกิจ</h2></div>';
    C.units.forEach(function (u) {
      h += '<h3 style="margin:16px 0 8px;color:var(--' + u.color + ')">หน่วยที่ ' + u.id + " " + esc(u.name) + '</h3><div class="tasks">';
      a.rows.filter(function (rw) { return taskOf(rw.t.code) && C.weeks[rw.wk - 1].unit === u.id; }).forEach(function (rw) {
        var c = CELL[rw.state];
        h += '<div class="trow"><span class="code u' + u.id + '">' + rw.t.code + '</span><div class="tt">' + esc(rw.t.title) + (rw.t.capstone ? ' <span class="cap">ภารกิจปลายทาง</span>' : "") +
          "<small>สัปดาห์ที่ " + rw.wk + " · " + rw.t.pts + ' คะแนน</small></div><span class="c ' + c[0] + '">' + STATE_TXT[rw.state] + "</span></div>";
      });
      h += "</div>";
    });
    h += "</section>";
    var prev = list[idx - 1], next = list[idx + 1];
    h += '<div class="pager">' + (prev ? '<a class="btn ghost" href="#/student/' + key + "/" + prev.no + '">เลขที่ ' + prev.no + "</a>" : "<span></span>") +
      '<a class="btn ghost" href="#/room/' + key + '">กลับไปห้อง ม.' + r + "</a>" +
      (next ? '<a class="btn ghost" href="#/student/' + key + "/" + next.no + '">เลขที่ ' + next.no + "</a>" : "<span></span>") + "</div>" + updatedNote();
    return h;
  }

  /* ---------- หน้า: กติกา ---------- */
  function pageRules() {
    var grades = [["80–100", "4"], ["75–79", "3.5"], ["70–74", "3"], ["65–69", "2.5"], ["60–64", "2"], ["55–59", "1.5"], ["50–54", "1"], ["0–49", "0"]];
    return '<div class="kicker">MISSION RULES</div><h1 style="font-size:clamp(28px,5vw,40px)">กติกาภารกิจ</h1>' +
      '<section class="sec panel"><h2 style="font-size:22px;margin-bottom:12px">คะแนน 100 แบ่งเป็น 4 ช่อง</h2><div class="split">' +
      '<div style="flex:30;background:var(--violet)">เก็บก่อนกลางภาค<br>30</div><div style="flex:20;background:var(--gold)">กลางภาค<br>20</div>' +
      '<div style="flex:30;background:var(--orange)">เก็บหลังกลางภาค<br>30</div><div style="flex:20;background:var(--cyan)">ปลายภาค<br>20</div></div>' +
      '<ul class="rules"><li><b>ใบงานและกิจกรรมทั่วไป : ส่ง = ได้คะแนนเต็ม</b> สืบค้นจากแหล่งต่าง ๆ รวมถึง AI ได้ เพราะเป้าหมายคือได้อ่าน ได้คิด และได้เรียนรู้</li>' +
      "<li><b>ภารกิจปลายทาง 7 ชิ้น</b> (E6 E7 G4 G5 A3 A4 A5) ต้องทำให้ครบทุกส่วนจึงได้คะแนนเต็ม</li>" +
      "<li><b>ส่งย้อนหลังได้</b> ถึงวันสุดท้ายก่อนตัดสินผล ไม่หักคะแนน ไม่จำกัดครั้ง</li>" +
      "<li><b>สอบกลางภาค</b> ออนไลน์ 20 ข้อ (หน่วยที่ 1) กดส่งแล้วเห็นเฉลยละเอียดทันที สอบใหม่ได้ไม่จำกัด ใช้คะแนนครั้งที่สูงที่สุด</li>" +
      "<li><b>สอบปลายภาค</b> ระบบ PROT EXAM 20 ข้อ 30 นาที ผลสอบแก้ไขไม่ได้ทุกกรณี</li>" +
      "<li><b>ใบงานกระดาษ</b> ต้องเขียนชื่อ ห้อง เลขที่ และฝนเลขประจำตัว 5 หลักบนหัวกระดาษทุกครั้ง</li></ul></section>" +
      '<div class="grid g2 sec" style="align-items:start"><section class="panel"><h2 style="font-size:22px">เกณฑ์ ร (รอการตัดสิน)</h2><ul class="rules">' +
      "<li>มีงานค้าง <b>และ</b> คะแนนรวมต่ำกว่า 70 → ได้ ร</li><li>ตามส่งงานครบแล้ว คำนวณคะแนนใหม่ ได้เกรดตามคะแนนจริง</li><li>มีงานค้างแต่คะแนนรวมตั้งแต่ 70 ขึ้นไป → ได้เกรดตามคะแนน</li>" +
      "<li>เวลาเรียนต้องไม่น้อยกว่าร้อยละ 80</li></ul>" +
      '<p class="muted" style="font-size:15px">ป้าย <span class="risk">เสี่ยงติด ร</span> บนเว็บเป็นการเตือนล่วงหน้า ขึ้นเมื่อมีงานค้างและคะแนนที่คาดว่าจะได้ (คิดกลางภาคและปลายภาคอย่างละ ' + C.risk.assumeFinal + " คะแนนถ้ายังไม่ได้สอบ) ต่ำกว่า " + C.risk.passLine + " ตามส่งงานแล้วป้ายจะหายไป</p></section>" +
      '<section class="panel"><h2 style="font-size:22px;margin-bottom:10px">เกณฑ์ระดับผลการเรียน</h2><table class="grade"><tr><th>คะแนน</th><th>เกรด</th></tr>' +
      grades.map(function (g) { return "<tr><td>" + g[0] + "</td><td>" + g[1] + "</td></tr>"; }).join("") + "</table></section></div>" +
      '<section class="sec panel"><h2 style="font-size:22px">ข้อมูลบนเว็บนี้</h2><p class="muted" style="margin:6px 0 0">แสดงเฉพาะเลขที่ ชื่อ-นามสกุล และสถานะการส่งงาน ไม่แสดงเลขประจำตัวนักเรียน ไม่มีรูปนักเรียน และไม่มีการจัดอันดับ</p></section>';
  }
  function pageMissing() {
    return '<div class="panel" style="text-align:center;padding:40px"><h1 style="font-size:28px">ไม่พบหน้านี้</h1><p class="muted">สัญญาณหาย ลองกลับไปที่ศูนย์ควบคุม</p><a class="btn" href="#/">ศูนย์ควบคุม</a></div>';
  }

  /* ---------- ตัวเลือกหน้า ---------- */
  function route() {
    var p = (location.hash || "#/").replace(/^#\/?/, "").split("/"), h, nav = p[0] || "home";
    if (!p[0]) h = pageHome();
    else if (p[0] === "map") h = pageMap();
    else if (p[0] === "week") { h = pageWeek(p[1]); nav = "map"; }
    else if (p[0] === "room") { h = pageRoom(p[1] || "4-8"); nav = "room/" + (p[1] || "4-8"); }
    else if (p[0] === "student") { h = pageStudent(p[1], p[2]); nav = "room/" + p[1]; }
    else if (p[0] === "rules") h = pageRules();
    else h = pageMissing();
    $app.innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) { a.classList.toggle("on", a.getAttribute("data-r") === nav); });
    if (p[0] === "room") bindRoom();
    window.scrollTo(0, 0);
  }
  ESJ.start = function () {
    C = ESJ.course; S = ESJ.scoreData || { rooms: {}, asOfWeek: 0, updated: "-" };
    $app = document.getElementById("app");
    window.addEventListener("hashchange", route);
    route();
  };
})(window.ESJ);
