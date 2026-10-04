/* สัปดาห์ที่ 3 · E2 : หลักฐานที่สนับสนุนทฤษฎีบิกแบง (กิจกรรมพล็อตความเร็วกับระยะทางของกาแล็กซี)
   วิธีเพิ่มสื่อ: วางไฟล์ไว้ในโฟลเดอร์ weeks/w03/ แล้วเพิ่ม 1 บรรทัดในรายการด้านล่าง (ดูตัวอย่างใน weeks/w01/items.js)
   type ที่ใช้ได้: slides | worksheet | sim | activity | video | link | doc
   ห้ามวางเฉลย ข้อสอบ หรือข้อมูลนักเรียนในโฟลเดอร์ weeks/ */
ESJ.week(3, [
  { type: "sim",       code: "E2", title: "สถานการณ์จำลอง นักสืบหลักฐานบิกแบง (ภารกิจ A B C)", file: "e2-sim-evidence.html", note: "ใช้คู่กับใบงาน E2 · เปิดบนมือถือหรือคอมพิวเตอร์ได้", qr: "qr-e2-sim.png" },
  { type: "activity",  code: "E2", title: "ส่งข้อมูลออนไลน์ E2 สถานีกราฟฮับเบิล (Apps Script)", url: "https://script.google.com/macros/s/AKfycbzkzpoUhpadTIDDmsqQ8qlfV2JWanfKlfkibk_ZQLTE-4V0IR_otSDdPBw7PG_FxFLxzg/exec?a=E2", note: "ส่งความเร็ว 6 ค่า ดูกราฟรวมของห้อง · เปิดรับเฉพาะช่วงที่ครูกำหนด · ไม่มีผลต่อคะแนน", qr: "qr-e2-activity.png" },
  { type: "worksheet", code: "E2", title: "ใบงาน E2 นักสืบหลักฐานบิกแบง (1 แผ่น 2 หน้า)", file: "e2-worksheet.pdf", note: "4 คะแนน · ส่งครบ 2 หน้า = เต็ม · พิมพ์หน้า-หลัง" },
  { type: "slides",    title: "สไลด์ สัปดาห์ที่ 3 E2 หลักฐานบิกแบง", file: "w03-slides-e2-evidence.pdf", note: "24 หน้า · คาบคู่และคาบเดี่ยว" }
]);
