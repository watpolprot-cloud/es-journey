/* =====================================================================
   ES Journey · ประกาศและลิงก์กลาง (ครูหรือ Claude แก้ได้)
   ---------------------------------------------------------------------
   announce : ประกาศบนหน้าแรก (เพิ่มบรรทัดบนสุด = ใหม่สุด) ไม่ต้องการแสดง ใส่ // ข้างหน้า
   links    : ปุ่มลิงก์ที่ใช้ทั้งภาค (Apps Script กลาง สอบกลางภาค ฯลฯ)
              ยังไม่มีลิงก์ ให้ใส่ url: "" ปุ่มจะแสดงเป็น "เร็ว ๆ นี้"
   ===================================================================== */
window.ESJ = window.ESJ || {};

ESJ.site = {
  announce: [
    { date: "26 ต.ค. 2569", text: "ยินดีต้อนรับนักบินใหม่สู่ ES Journey ภารกิจ 20 สัปดาห์ สำรวจโลกและอวกาศ" }
  ],
  links: [
    { title: "ลงทะเบียนนักบิน (แบบสอบถามรู้จักนักเรียน)", url: "https://script.google.com/macros/s/AKfycbzkzpoUhpadTIDDmsqQ8qlfV2JWanfKlfkibk_ZQLTE-4V0IR_otSDdPBw7PG_FxFLxzg/exec", note: "สัปดาห์ที่ 1 · เปิดรับเฉพาะในคาบ" },
    { title: "ส่งกิจกรรมออนไลน์ (Apps Script)", url: "https://script.google.com/macros/s/AKfycbzkzpoUhpadTIDDmsqQ8qlfV2JWanfKlfkibk_ZQLTE-4V0IR_otSDdPBw7PG_FxFLxzg/exec", note: "หน้าแรกเลือกกิจกรรม · เลือกรหัสงานให้ตรงกับที่ครูบอก" },
    { title: "สอบกลางภาคออนไลน์", url: "", note: "เปิดสัปดาห์ที่ 9 · สอบซ้ำได้ไม่จำกัด" }
  ]
};
