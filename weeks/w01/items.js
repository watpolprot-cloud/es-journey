/* สัปดาห์ที่ 1 · ปฐมนิเทศ ES Journey
   วิธีเพิ่มสื่อ: วางไฟล์ไว้ในโฟลเดอร์ weeks/w01/ แล้วเพิ่ม 1 บรรทัดในรายการด้านล่าง
   type ที่ใช้ได้: slides | worksheet | sim | activity | video | link | doc
   ใช้ file: "ชื่อไฟล์" สำหรับไฟล์ในโฟลเดอร์นี้ หรือ url: "https://..." สำหรับลิงก์ภายนอก
   เฉลยใบงานขึ้นได้เมื่อจบสัปดาห์และครูสั่งเท่านั้น (type: "key") · ห้ามวางข้อสอบหรือข้อมูลนักเรียนในโฟลเดอร์ weeks/ */
ESJ.week(1, [
  { type: "activity",  title: "ลงทะเบียนนักบิน : แบบสอบถามรู้จักนักเรียน", url: "https://script.google.com/macros/s/AKfycbzkzpoUhpadTIDDmsqQ8qlfV2JWanfKlfkibk_ZQLTE-4V0IR_otSDdPBw7PG_FxFLxzg/exec", note: "ภารกิจ 01 · 5 ด่าน ประมาณ 15 นาที · เปิดรับเฉพาะในคาบ", qr: "qr-intro-survey.png" },
  { type: "slides",    title: "สไลด์ สัปดาห์ที่ 1 ปฐมนิเทศ ES Journey", file: "w01-slides-orientation.pdf", note: "32 หน้า · คาบคู่และคาบเดี่ยว · มีเรื่องผู้ช่วยตรวจ AI" },
  { type: "worksheet", code: "ES00", title: "ใบงาน ES00 บัตรผ่านนักบิน (1 แผ่น 2 หน้า)", file: "ws00-pilot-pass.pdf", note: "ไม่มีคะแนน · พิมพ์หน้า-หลัง · ฝึกกรอกหัวกระดาษก่อนเริ่ม E1" },
  { type: "key",       code: "ES00", title: "เฉลย ES00 บัตรผ่านนักบิน (1 แผ่น 2 หน้า)", file: "es00-answer-key.pdf", note: "เปิดเฉลย 2 พ.ย. 2569 · ใช้ตรวจทานตัวเองและดูตัวอย่างการฝนเลขประจำตัวที่ถูกต้อง" }
]);
