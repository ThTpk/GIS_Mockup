/* ============================================================
   GeoCore GIS — Mock data & shared constants
   ข้อมูลตัวอย่างทั้งหมดเป็นข้อมูลสมมุติ ใช้เพื่อการนำเสนอเท่านั้น
   ============================================================ */

const APP = {
  name: 'GeoCore GIS',
  tagline: 'ระบบสารสนเทศภูมิศาสตร์เพื่อการบริหารจัดการพื้นที่',
  version: '1.0 (Mockup)',
  db: 'PostgreSQL 16 + PostGIS 3.4',
  srid: 'EPSG:4326 (จัดเก็บ) / EPSG:32647 (คำนวณระยะ UTM Zone 47N)'
};

/* ---------- กลุ่มผู้ใช้งาน (User Groups) ---------- */
const ROLES = {
  viewer: {
    code: 'viewer',
    name: 'ผู้อ่านข้อมูล',
    en: 'Data Viewer',
    color: 'var(--s3)',
    desc: 'ดูแผนที่ ค้นหา และส่งออกรายงานได้ แต่แก้ไขข้อมูลไม่ได้',
    can: ['อ่านทุกชั้นข้อมูลที่ได้รับสิทธิ์', 'ค้นหา/กรอง/วัดระยะบนแผนที่', 'ส่งออกแผนที่ PDF และตาราง CSV', 'ดูพจนานุกรมข้อมูลและ Metadata'],
    cannot: ['เพิ่ม/แก้ไข/ลบรายการข้อมูล', 'อนุมัติข้อมูล', 'จัดการผู้ใช้งาน']
  },
  editor: {
    code: 'editor',
    name: 'ผู้ป้อนข้อมูล',
    en: 'Data Entry / Surveyor',
    color: 'var(--s2)',
    desc: 'บันทึกและแก้ไขข้อมูลที่ตนรับผิดชอบ เห็นเฉพาะงานของตนเองและชั้นข้อมูลที่ได้รับมอบหมาย',
    can: ['สร้างรายการใหม่และวาดรูปทรง', 'แก้ไขรายการสถานะ "ร่าง" ของตนเอง', 'แนบภาพถ่ายและพิกัดภาคสนาม', 'ส่งข้อมูลเข้าคิวตรวจสอบ'],
    cannot: ['ดูภาพรวมทั้งฐานข้อมูลและรายงานผู้บริหาร', 'ส่งออกชุดข้อมูลทั้งชั้น', 'อนุมัติข้อมูลของตนเอง', 'จัดการผู้ใช้งาน']
  },
  both: {
    code: 'both',
    name: 'ผู้ใช้งานทั้งสองสิทธิ์',
    en: 'Contributor / Reviewer',
    color: 'var(--s1)',
    desc: 'อ่านและบันทึกข้อมูลได้ทั้งหมด พร้อมสิทธิ์ตรวจสอบและอนุมัติข้อมูลของผู้อื่น',
    can: ['สิทธิ์ทั้งหมดของผู้อ่านข้อมูลและผู้ป้อนข้อมูล', 'ตรวจสอบและอนุมัติ/ตีกลับรายการ', 'เรียกการตรวจคุณภาพข้อมูล (QA/QC)', 'ส่งออกและจัดชุดเผยแพร่'],
    cannot: ['จัดการผู้ใช้งานและสิทธิ์', 'ตั้งค่าระบบและกฎการตรวจคุณภาพ']
  },
  admin: {
    code: 'admin',
    name: 'ผู้ดูแลระบบ',
    en: 'Administrator',
    color: 'var(--s7)',
    desc: 'ดูแลผู้ใช้งาน สิทธิ์ ทะเบียนชั้นข้อมูล กฎการตรวจคุณภาพ และการสำรองข้อมูล',
    can: ['สิทธิ์ทั้งหมดในระบบ', 'จัดการผู้ใช้งานและกลุ่มสิทธิ์', 'ตั้งค่าทะเบียนชั้นข้อมูลและกฎ QA/QC', 'กำหนดชุดเผยแพร่และการสำรองข้อมูล'],
    cannot: ['— (จำกัดด้วยการบันทึก Audit Log ทุกการกระทำ)']
  }
};

const PERMISSIONS = [
  { g: 'แผนที่และการค้นหา', p: 'ดูแผนที่และชั้นข้อมูล',            viewer: 'full', editor: 'own',  both: 'full', admin: 'full' },
  { g: 'แผนที่และการค้นหา', p: 'ค้นหา กรอง และวัดระยะ',            viewer: 'full', editor: 'full', both: 'full', admin: 'full' },
  { g: 'แผนที่และการค้นหา', p: 'เปิดดูตารางข้อมูล (Attribute)',     viewer: 'full', editor: 'own',  both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'สร้างรายการใหม่',                 viewer: 'no',   editor: 'full', both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'แก้ไขรายการของตนเอง (ร่าง)',       viewer: 'no',   editor: 'full', both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'แก้ไขรายการของผู้อื่น',            viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'ลบ/ยกเลิกใช้งานรายการ',           viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'แนบภาพถ่ายและไฟล์หลักฐาน',         viewer: 'no',   editor: 'full', both: 'full', admin: 'full' },
  { g: 'การบันทึกข้อมูล',   p: 'สำรวจภาคสนามบนมือถือ (Offline)',   viewer: 'no',   editor: 'full', both: 'full', admin: 'full' },
  { g: 'ตรวจสอบและคุณภาพ',  p: 'ส่งข้อมูลเข้าคิวตรวจสอบ',          viewer: 'no',   editor: 'full', both: 'full', admin: 'full' },
  { g: 'ตรวจสอบและคุณภาพ',  p: 'อนุมัติ / ตีกลับรายการ',           viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ตรวจสอบและคุณภาพ',  p: 'เรียกการตรวจคุณภาพ (QC Run)',      viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ตรวจสอบและคุณภาพ',  p: 'แก้ไขกฎการตรวจคุณภาพ',            viewer: 'no',   editor: 'no',   both: 'no',   admin: 'full' },
  { g: 'ส่งออกและเผยแพร่',  p: 'ส่งออกแผนที่ PDF / ตาราง CSV',     viewer: 'full', editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ส่งออกและเผยแพร่',  p: 'ส่งออก GeoPackage / QGIS Project', viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ส่งออกและเผยแพร่',  p: 'จัดชุดเผยแพร่สาธารณะ',            viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ระบบและผู้ใช้งาน',  p: 'ดู Audit Log',                    viewer: 'no',   editor: 'no',   both: 'full', admin: 'full' },
  { g: 'ระบบและผู้ใช้งาน',  p: 'จัดการผู้ใช้งานและสิทธิ์',         viewer: 'no',   editor: 'no',   both: 'no',   admin: 'full' },
  { g: 'ระบบและผู้ใช้งาน',  p: 'ตั้งค่าทะเบียนชั้นข้อมูล',         viewer: 'no',   editor: 'no',   both: 'no',   admin: 'full' },
  { g: 'ระบบและผู้ใช้งาน',  p: 'สำรองและกู้คืนฐานข้อมูล',          viewer: 'no',   editor: 'no',   both: 'no',   admin: 'full' }
];

/* ---------- หน่วยงาน (Agencies) ---------- */
const AGENCIES = [
  { id: 1, code: 'PAO',     name: 'องค์การบริหารส่วนจังหวัด',          abbr: 'อบจ.' },
  { id: 2, code: 'DRR',     name: 'กรมทางหลวงชนบท',                   abbr: 'ทช.' },
  { id: 3, code: 'SAO',     name: 'องค์การบริหารส่วนตำบล (เจ้าของระบบ)', abbr: 'อบต.' },
  { id: 4, code: 'DOH',     name: 'กรมทางหลวง / แขวงทางหลวง',          abbr: 'ทล.' },
  { id: 5, code: 'PWA',     name: 'การประปาส่วนภูมิภาค',               abbr: 'กปภ.' },
  { id: 6, code: 'PEA',     name: 'การไฟฟ้าส่วนภูมิภาค',               abbr: 'กฟภ.' },
  { id: 7, code: 'PRIVATE', name: 'เอกชน / นิติบุคคลหมู่บ้านจัดสรร',    abbr: 'เอกชน' },
  { id: 8, code: 'UNKNOWN', name: 'ยังยืนยันผู้รับผิดชอบไม่ได้',        abbr: 'รอยืนยัน' }
];

/* ---------- ทะเบียนชั้นข้อมูล (Layer Registry) ---------- */
const LAYERS = [
  { code: 'L01', table: 'gis.road', name: 'ถนน', en: 'Roads', geom: 'MultiLineString', color: 'var(--s1)', sym: 'line',
    count: 1284, qty: '482.6 กม.', complete: 96, status: 'approved', src: 'สำรวจภาคสนาม + ภาพถ่ายทางอากาศ', updated: '2026-10-21', group: 'โครงสร้างพื้นฐาน', isNew: true,
    note: 'จำแนกเจ้าของทรัพย์สินและผู้บำรุงรักษาแยกกัน พร้อมสถานะการยืนยัน' },
  { code: 'L02', table: 'gis.street_light', name: 'ไฟส่องสว่าง', en: 'Street Lights', geom: 'Point', color: 'var(--s4)', sym: 'point',
    count: 3642, qty: '3,642 จุด', complete: 93, status: 'approved', src: 'สำรวจภาคสนาม (GNSS)', updated: '2026-10-19', group: 'โครงสร้างพื้นฐาน', isNew: true,
    note: 'บันทึกประเภทอุปกรณ์ สถานะใช้งาน และวันที่สำรวจ' },
  { code: 'L03', table: 'gis.cctv', name: 'กล้องโทรทัศน์วงจรปิด', en: 'CCTV', geom: 'Point', color: 'var(--s7)', sym: 'point',
    count: 218, qty: '218 กล้อง', complete: 88, status: 'review', src: 'สำรวจภาคสนาม + ทะเบียนทรัพย์สิน', updated: '2026-10-24', group: 'โครงสร้างพื้นฐาน', isNew: true,
    note: 'ไม่จัดเก็บรหัสผ่าน IP หรือข้อมูลเชื่อมต่อ — ชั้นข้อมูลนี้ไม่อยู่ในชุดเผยแพร่สาธารณะ' },
  { code: 'L04', table: 'gis.bridge', name: 'สะพาน', en: 'Bridges', geom: 'Point', color: 'var(--s2)', sym: 'point',
    count: 47, qty: '47 แห่ง', complete: 100, status: 'approved', src: 'สำรวจภาคสนาม', updated: '2026-10-15', group: 'โครงสร้างพื้นฐาน', isNew: true,
    note: 'สภาพจากการสำรวจเบื้องต้น ไม่ใช้แทนการตรวจโครงสร้างโดยวิศวกร' },
  { code: 'L05', table: 'gis.water_facility / water_pipe / water_body', name: 'แหล่งน้ำและระบบประปา', en: 'Water Supply', geom: 'Point / Line / Polygon', color: 'var(--s3)', sym: 'mixed',
    count: 512, qty: '86 จุด · 128.4 กม. · 34 แหล่ง', complete: 79, status: 'draft', src: 'สำรวจ + ข้อมูล กปภ./อบต.', updated: '2026-10-25', group: 'สาธารณูปโภค', isNew: true,
    note: 'แหล่งน้ำ จุดผลิต/จ่ายน้ำ ถังเก็บน้ำ และแนวท่อที่ตรวจสอบได้' },
  { code: 'L06', table: 'gis.drainage_line / drainage_issue', name: 'ทางระบายน้ำและจุดปัญหาน้ำเสีย', en: 'Drainage & Issues', geom: 'Line / Point', color: 'var(--s5)', sym: 'mixed',
    count: 936, qty: '214.8 กม. · 132 จุดปัญหา', complete: 84, status: 'review', src: 'สำรวจภาคสนาม + แจ้งเหตุประชาชน', updated: '2026-10-23', group: 'สาธารณูปโภค', isNew: true,
    note: 'จุดน้ำท่วม/น้ำเสีย พร้อมข้อมูลประกอบการจัดลำดับการแก้ไข' },
  { code: 'L07', table: 'gis.public_space / community_landmark', name: 'พื้นที่สาธารณะและจุดอัตลักษณ์ชุมชน', en: 'Public Space & Landmarks', geom: 'Polygon / Point', color: 'var(--s6)', sym: 'mixed',
    count: 164, qty: '96 แปลง · 68 จุด', complete: 91, status: 'approved', src: 'สำรวจ + เวทีประชาคม', updated: '2026-10-18', group: 'พื้นที่และการใช้ประโยชน์', isNew: true,
    note: 'ประเภท การใช้ประโยชน์ ผู้ดูแล และศักยภาพเชื่อมโยงกิจกรรมชุมชน' },
  { code: 'L08', table: 'gis.admin_boundary / boundary_discrepancy', name: 'แนวเขตพื้นที่ศึกษาและพื้นที่คลาดเคลื่อน', en: 'Boundary & Discrepancy', geom: 'MultiPolygon', color: 'var(--s8)', sym: 'poly',
    count: 29, qty: '9 แนวเขต · 20 พื้นที่คลาดเคลื่อน', complete: 100, status: 'review', src: 'ประกาศกระทรวง + แนวเขตจัดเก็บจริง', updated: '2026-10-26', group: 'พื้นที่และการใช้ประโยชน์', isNew: true,
    note: 'แยกสถานะและแหล่งข้อมูลของแต่ละแนวเขตอย่างชัดเจน' },
  { code: 'L09', table: 'gis.land_parcel', name: 'แนวเขตที่ดิน', en: 'Land Parcels', geom: 'MultiPolygon', color: 'var(--ink-3)', sym: 'poly',
    count: 18420, qty: '18,420 แปลง', complete: 100, status: 'approved', src: 'ชั้นข้อมูลเดิมขององค์กร (เชื่อมโยง)', updated: '2026-09-30', group: 'ชั้นข้อมูลเดิม', isNew: false,
    note: 'ชั้นข้อมูลเดิม — เชื่อมโยงด้วยคีย์ parcel_no ไม่จัดทำซ้ำ' },
  { code: 'L10', table: 'gis.building', name: 'สิ่งปลูกสร้าง', en: 'Buildings', geom: 'MultiPolygon', color: 'var(--ink-2)', sym: 'poly',
    count: 12905, qty: '12,905 หลัง', complete: 100, status: 'approved', src: 'ชั้นข้อมูลเดิมขององค์กร (เชื่อมโยง)', updated: '2026-09-30', group: 'ชั้นข้อมูลเดิม', isNew: false,
    note: 'ชั้นข้อมูลเดิม — เชื่อมโยงกับทะเบียนภาษีที่ดินและสิ่งปลูกสร้าง' }
];

const STATUS_LABEL = {
  approved: { t: 'อนุมัติแล้ว', c: 'badge-good' },
  review:   { t: 'รอตรวจสอบ',  c: 'badge-warning' },
  draft:    { t: 'ร่าง',        c: 'badge-outline' },
  rejected: { t: 'ตีกลับ',      c: 'badge-critical' },
  retired:  { t: 'ยกเลิกใช้งาน', c: 'badge-outline' }
};

const CONFIRM_LABEL = {
  confirmed: { t: 'ยืนยันแล้ว', c: 'badge-good' },
  pending:   { t: 'รอยืนยัน',   c: 'badge-warning' },
  conflict:  { t: 'ข้อมูลขัดแย้ง', c: 'badge-critical' },
  unknown:   { t: 'ไม่ทราบ',    c: 'badge-outline' }
};

/* ---------- ตัวอย่างรายการถนน ---------- */
const ROADS = [
  { code: 'RD-0101', name: 'ถนนสายหลักกลางตำบล', cls: 'ถนนสายหลัก', surf: 'คอนกรีตเสริมเหล็ก', len: 4820, wid: 6.0, cond: 'ดี',       owner: 'อบจ.',   maint: 'อบจ.',   confirm: 'confirmed', status: 'approved', village: 'หมู่ 1', date: '2026-09-12' },
  { code: 'RD-0102', name: 'ถนนเลียบคลองส่งน้ำสายที่ 2', cls: 'ถนนสายรอง', surf: 'ลาดยางแอสฟัลต์', len: 3140, wid: 5.0, cond: 'พอใช้',   owner: 'ทช.',    maint: 'ทช.',    confirm: 'confirmed', status: 'approved', village: 'หมู่ 2', date: '2026-09-14' },
  { code: 'RD-0117', name: 'ซอยชุมชนร่วมใจ 4', cls: 'ซอย',         surf: 'คอนกรีตเสริมเหล็ก', len: 620,  wid: 4.0, cond: 'ดี',       owner: 'อบต.',   maint: 'อบต.',   confirm: 'confirmed', status: 'approved', village: 'หมู่ 3', date: '2026-09-18' },
  { code: 'RD-0134', name: 'ถนนเข้าพื้นที่เกษตรโซนตะวันออก', cls: 'ถนนสายรอง', surf: 'ลูกรัง',    len: 2270, wid: 4.5, cond: 'ต้องซ่อม', owner: 'อบต.',   maint: 'อบต.',   confirm: 'pending',   status: 'review',   village: 'หมู่ 5', date: '2026-10-02' },
  { code: 'RD-0145', name: 'ทางหลวงผ่านพื้นที่ (ช่วง กม. 12+400)', cls: 'ทางหลวง', surf: 'ลาดยางแอสฟัลต์', len: 5600, wid: 12.0, cond: 'ดี',  owner: 'ทล.',    maint: 'ทล.',    confirm: 'confirmed', status: 'approved', village: 'หมู่ 1', date: '2026-09-20' },
  { code: 'RD-0158', name: 'ถนนภายในหมู่บ้านจัดสรรสวนทอง', cls: 'ซอย',      surf: 'คอนกรีตเสริมเหล็ก', len: 1480, wid: 6.0, cond: 'ดี',   owner: 'เอกชน', maint: 'เอกชน', confirm: 'confirmed', status: 'approved', village: 'หมู่ 6', date: '2026-09-25' },
  { code: 'RD-0163', name: 'ซอยริมคลองสาธารณะ 7', cls: 'ซอย',      surf: 'ลูกรัง',          len: 410,  wid: 3.5, cond: 'ต้องซ่อม', owner: 'รอยืนยัน', maint: 'รอยืนยัน', confirm: 'conflict', status: 'review', village: 'หมู่ 7', date: '2026-10-08' },
  { code: 'RD-0171', name: 'ถนนเชื่อมเขตตำบลข้างเคียง', cls: 'ถนนสายรอง', surf: 'ลาดยางแอสฟัลต์', len: 1960, wid: 5.5, cond: 'พอใช้', owner: 'อบจ.', maint: 'อบต.', confirm: 'pending', status: 'review', village: 'หมู่ 8', date: '2026-10-11' },
  { code: 'RD-0182', name: 'ซอยหลังตลาดชุมชน', cls: 'ซอย',        surf: 'คอนกรีตเสริมเหล็ก', len: 340,  wid: 3.0, cond: 'ดี',     owner: 'อบต.', maint: 'อบต.', confirm: 'confirmed', status: 'draft', village: 'หมู่ 4', date: '2026-10-22' },
  { code: 'RD-0190', name: 'ถนนทางเข้าศูนย์พัฒนาเด็กเล็ก', cls: 'ซอย', surf: 'คอนกรีตเสริมเหล็ก', len: 280, wid: 4.0, cond: 'ดี',  owner: 'อบต.', maint: 'อบต.', confirm: 'confirmed', status: 'draft', village: 'หมู่ 2', date: '2026-10-24' }
];

/* ---------- ตัวอย่างไฟส่องสว่าง ---------- */
const LIGHTS = [
  { code: 'SL-00412', type: 'โคมไฟ LED 100W', pole: 'เสาคอนกรีต', road: 'RD-0101', status: 'ใช้งานได้',   owner: 'อบต.', date: '2026-09-12', lat: 12.8412, lng: 101.2238 },
  { code: 'SL-00413', type: 'โคมไฟ LED 100W', pole: 'เสาคอนกรีต', road: 'RD-0101', status: 'ชำรุด',       owner: 'อบต.', date: '2026-09-12', lat: 12.8415, lng: 101.2244 },
  { code: 'SL-00598', type: 'โคมไฟโซลาร์เซลล์', pole: 'เสาเหล็กชุบ', road: 'RD-0134', status: 'ใช้งานได้', owner: 'อบต.', date: '2026-10-02', lat: 12.8471, lng: 101.2390 },
  { code: 'SL-00611', type: 'โคมไฟ HPS 250W', pole: 'เสาไฟฟ้า',    road: 'RD-0145', status: 'ใช้งานได้',   owner: 'กฟภ.', date: '2026-09-20', lat: 12.8352, lng: 101.2175 },
  { code: 'SL-00742', type: 'โคมไฟ LED 150W', pole: 'เสาสูงกิ่งคู่', road: 'RD-0102', status: 'รอซ่อม',    owner: 'อบจ.', date: '2026-09-14', lat: 12.8498, lng: 101.2301 }
];

/* ---------- ผู้ใช้งานตัวอย่าง ---------- */
const USERS = [
  { id: 'U-001', name: 'สมชาย ว.', unit: 'กองช่าง',             role: 'admin',  email: 'admin@example.go.th',     last: '2026-10-29 08:12', active: true,  layers: 'ทุกชั้นข้อมูล' },
  { id: 'U-014', name: 'ปิยะนุช ส.', unit: 'กองช่าง',            role: 'both',   email: 'piyanuch@example.go.th',  last: '2026-10-29 07:55', active: true,  layers: 'L01–L08' },
  { id: 'U-021', name: 'ธนากร ค.', unit: 'กองช่าง (สำรวจ)',      role: 'editor', email: 'thanakorn@example.go.th', last: '2026-10-28 16:40', active: true,  layers: 'L01, L02, L04' },
  { id: 'U-022', name: 'อรทัย พ.', unit: 'กองช่าง (สำรวจ)',      role: 'editor', email: 'orathai@example.go.th',   last: '2026-10-28 15:02', active: true,  layers: 'L05, L06' },
  { id: 'U-030', name: 'ณัฐวุฒิ ร.', unit: 'กองสาธารณสุข',        role: 'editor', email: 'nattawut@example.go.th',  last: '2026-10-27 11:21', active: true,  layers: 'L06, L07' },
  { id: 'U-041', name: 'วราภรณ์ จ.', unit: 'กองคลัง',             role: 'viewer', email: 'waraporn@example.go.th',  last: '2026-10-29 09:03', active: true,  layers: 'L09, L10' },
  { id: 'U-042', name: 'ศิริพร ม.', unit: 'สำนักปลัด',           role: 'viewer', email: 'siriporn@example.go.th',  last: '2026-10-26 13:47', active: true,  layers: 'L01–L10 (อ่าน)' },
  { id: 'U-050', name: 'ผู้บริหาร (ผอ.กองช่าง)', unit: 'ผู้บริหาร', role: 'viewer', email: 'director@example.go.th', last: '2026-10-29 08:30', active: true,  layers: 'ทุกชั้นข้อมูล (อ่าน)' },
  { id: 'U-061', name: 'ที่ปรึกษาโครงการ', unit: 'ผู้รับจ้าง',     role: 'both',   email: 'consultant@vendor.co.th', last: '2026-10-29 06:10', active: true,  layers: 'L01–L08 (หมดอายุ 28 ก.พ. 2570)' },
  { id: 'U-073', name: 'นักศึกษาฝึกงาน A', unit: 'กองช่าง',       role: 'editor', email: 'intern.a@example.go.th',  last: '2026-09-30 10:15', active: false, layers: 'L02 (ระงับการใช้งาน)' }
];

/* ---------- กฎการตรวจคุณภาพ (QA/QC) ---------- */
const QC_RULES = [
  { id: 'QC-01', cat: 'ความครบถ้วน',    name: 'ฟิลด์บังคับต้องไม่ว่าง',              scope: 'ทุกชั้นข้อมูล', sev: 'critical', sql: 'feature_code IS NULL OR surveyed_on IS NULL OR source_ref IS NULL' },
  { id: 'QC-02', cat: 'ความไม่ซ้ำ',     name: 'รหัสรายการ (feature_code) ต้องไม่ซ้ำ',  scope: 'ทุกชั้นข้อมูล', sev: 'critical', sql: 'COUNT(*) OVER (PARTITION BY feature_code) > 1' },
  { id: 'QC-03', cat: 'เรขาคณิต',      name: 'รูปทรงต้องถูกต้อง (ST_IsValid)',        scope: 'ทุกชั้นข้อมูล', sev: 'critical', sql: 'NOT ST_IsValid(geom)' },
  { id: 'QC-04', cat: 'เรขาคณิต',      name: 'พิกัดต้องอยู่ในขอบเขตพื้นที่ศึกษา',      scope: 'ทุกชั้นข้อมูล', sev: 'serious',  sql: 'NOT ST_Within(geom, (SELECT geom FROM gis.admin_boundary WHERE is_reference))' },
  { id: 'QC-05', cat: 'เรขาคณิต',      name: 'จุดซ้ำตำแหน่ง (ระยะ < 1 ม.)',          scope: 'L02, L03, L04', sev: 'warning',  sql: 'ST_DWithin(a.geom::geography, b.geom::geography, 1)' },
  { id: 'QC-06', cat: 'ความสัมพันธ์',   name: 'ทรัพย์สินต้องอ้างอิงถนนที่มีอยู่จริง',   scope: 'L02, L03, L04', sev: 'serious',  sql: 'road_uid NOT IN (SELECT feature_uid FROM gis.road)' },
  { id: 'QC-07', cat: 'ความสัมพันธ์',   name: 'ทรัพย์สินต้องอยู่ห่างแนวถนนไม่เกิน 25 ม.', scope: 'L02, L03',    sev: 'warning',  sql: 'ST_Distance(p.geom::geography, r.geom::geography) > 25' },
  { id: 'QC-08', cat: 'เรขาคณิต',      name: 'เส้นถนนต้องเชื่อมต่อกัน (ไม่มีช่องว่าง > 2 ม.)', scope: 'L01',   sev: 'warning',  sql: 'ST_Distance(ST_EndPoint(a.geom), ST_StartPoint(b.geom)) BETWEEN 0 AND 2' },
  { id: 'QC-09', cat: 'ค่าในโดเมน',    name: 'ค่ารหัสต้องอยู่ในตารางอ้างอิง',          scope: 'ทุกชั้นข้อมูล', sev: 'serious',  sql: 'surface_code NOT IN (SELECT code FROM ref.road_surface)' },
  { id: 'QC-10', cat: 'ความสอดคล้อง',  name: 'วันที่สำรวจต้องไม่เป็นอนาคต',           scope: 'ทุกชั้นข้อมูล', sev: 'serious',  sql: 'surveyed_on > CURRENT_DATE' },
  { id: 'QC-11', cat: 'การกำกับข้อมูล', name: 'ต้องระบุเจ้าของหรือสถานะรอยืนยัน',      scope: 'L01–L08',      sev: 'serious',  sql: 'owner_agency_id IS NULL AND confirm_status_code <> \'pending\'' },
  { id: 'QC-12', cat: 'ความปลอดภัย',   name: 'ชั้นข้อมูลอ่อนไหวต้องไม่ติดธงเผยแพร่',   scope: 'L03',          sev: 'critical', sql: 'layer_code = \'L03\' AND is_public = TRUE' }
];

const QC_FINDINGS = [
  { rule: 'QC-11', layer: 'L01', feature: 'RD-0163', sev: 'serious',  msg: 'ไม่ระบุเจ้าของทรัพย์สิน และสถานะไม่ใช่ "รอยืนยัน"', assignee: 'ธนากร ค.', state: 'open' },
  { rule: 'QC-07', layer: 'L02', feature: 'SL-00742', sev: 'warning',  msg: 'ระยะห่างจากแนวถนน RD-0102 เท่ากับ 38.4 ม. (เกิน 25 ม.)', assignee: 'ธนากร ค.', state: 'open' },
  { rule: 'QC-01', layer: 'L05', feature: 'WF-00031', sev: 'critical', msg: 'ฟิลด์ source_ref ว่าง', assignee: 'อรทัย พ.', state: 'open' },
  { rule: 'QC-01', layer: 'L05', feature: 'WP-00118', sev: 'critical', msg: 'ฟิลด์ surveyed_on ว่าง', assignee: 'อรทัย พ.', state: 'open' },
  { rule: 'QC-05', layer: 'L02', feature: 'SL-00413', sev: 'warning',  msg: 'จุดซ้ำตำแหน่งกับ SL-00412 (ระยะ 0.6 ม.)', assignee: 'ธนากร ค.', state: 'fixing' },
  { rule: 'QC-04', layer: 'L06', feature: 'DI-00097', sev: 'serious',  msg: 'พิกัดอยู่นอกแนวเขตอ้างอิง 14.2 ม. — อยู่ในพื้นที่คลาดเคลื่อน BD-07', assignee: 'ณัฐวุฒิ ร.', state: 'open' },
  { rule: 'QC-08', layer: 'L01', feature: 'RD-0134', sev: 'warning',  msg: 'ปลายเส้นไม่เชื่อมกับ RD-0101 (ช่องว่าง 1.8 ม.)', assignee: 'ธนากร ค.', state: 'fixed' },
  { rule: 'QC-09', layer: 'L06', feature: 'DL-00412', sev: 'serious',  msg: 'ค่า drain_type_code = "OPEN2" ไม่อยู่ในตารางอ้างอิง', assignee: 'อรทัย พ.', state: 'fixed' }
];

/* ---------- พื้นที่คลาดเคลื่อนของแนวเขต ---------- */
const BOUNDARY = [
  { code: 'BD-01', side: 'เขตติดต่อทิศเหนือ',   area: 18.42, type: 'พื้นที่ซ้อนทับ', ref: 'ประกาศกระทรวงฯ พ.ศ. 2539', actual: 'แนวเขตจัดเก็บภาษี', parcels: 142, bld: 96,  status: 'conflict', note: 'เก็บภาษีซ้อนกับองค์กรข้างเคียง 3 ราย' },
  { code: 'BD-02', side: 'เขตติดต่อทิศตะวันออก', area: 6.10,  type: 'พื้นที่ขาด',    ref: 'ประกาศกระทรวงฯ พ.ศ. 2539', actual: 'แนวเขตจัดเก็บภาษี', parcels: 51,  bld: 28,  status: 'pending',  note: 'อยู่ระหว่างประสานขอข้อมูลแนวเขตจากหน่วยงานข้างเคียง' },
  { code: 'BD-03', side: 'เขตติดต่อทิศใต้',     area: 2.74,  type: 'พื้นที่ซ้อนทับ', ref: 'แผนที่ภาพถ่ายทางอากาศ',    actual: 'แนวเขตจัดเก็บภาษี', parcels: 19,  bld: 12,  status: 'resolved', note: 'ตกลงใช้แนวคลองสาธารณะเป็นแนวอ้างอิง (บันทึกการประชุม 12 ต.ค. 2569)' },
  { code: 'BD-07', side: 'เขตติดต่อทิศตะวันตก', area: 11.35, type: 'แนวเขตไม่ตรงกัน', ref: 'ประกาศกระทรวงฯ พ.ศ. 2539', actual: 'ภาพถ่ายทางอากาศ 2568', parcels: 88, bld: 61, status: 'conflict', note: 'แนวเขตตามประกาศตัดผ่านอาคาร 7 หลัง' }
];

/* ---------- ตัวชี้วัดและการติดตาม ---------- */
const KPIS = [
  { code: 'KPI-01', name: 'ความครบถ้วนของฟิลด์บังคับ',        unit: '%',  target: 100, value: 97.4, trend: +1.8, cycle: 'รายเดือน', owner: 'กองช่าง' },
  { code: 'KPI-02', name: 'สัดส่วนรายการที่ยืนยันเจ้าของแล้ว',  unit: '%',  target: 95,  value: 91.2, trend: +4.1, cycle: 'รายเดือน', owner: 'กองช่าง' },
  { code: 'KPI-03', name: 'จำนวนข้อค้นพบ QC ระดับวิกฤตคงค้าง',  unit: 'รายการ', target: 0, value: 2, trend: -5, cycle: 'รายสัปดาห์', owner: 'ผู้ดูแลระบบ' },
  { code: 'KPI-04', name: 'ระยะเวลาเฉลี่ยในการอนุมัติข้อมูล',   unit: 'วัน', target: 3, value: 2.4, trend: -0.6, cycle: 'รายเดือน', owner: 'กองช่าง' },
  { code: 'KPI-05', name: 'ไฟส่องสว่างที่ใช้งานได้',           unit: '%',  target: 95,  value: 92.6, trend: +0.9, cycle: 'รายเดือน', owner: 'กองช่าง' },
  { code: 'KPI-06', name: 'จุดปัญหาน้ำเสียที่แก้ไขแล้ว',        unit: '%',  target: 60,  value: 43.9, trend: +7.4, cycle: 'รายไตรมาส', owner: 'กองสาธารณสุข' },
  { code: 'KPI-07', name: 'ความถี่การสำรองข้อมูลสำเร็จ',       unit: '%',  target: 100, value: 100,  trend: 0,   cycle: 'รายวัน',  owner: 'ผู้ดูแลระบบ' },
  { code: 'KPI-08', name: 'เจ้าหน้าที่ผ่านการอบรมใช้งานระบบ',   unit: 'คน', target: 30,  value: 32,   trend: +15, cycle: 'รายปี',   owner: 'สำนักปลัด' }
];

/* ---------- Audit log ---------- */
const AUDIT = [
  { ts: '2026-10-29 09:14:22', user: 'ปิยะนุช ส.', role: 'both',   act: 'APPROVE', obj: 'gis.road / RD-0171', detail: 'อนุมัติรายการ · เปลี่ยน record_status: submitted → approved', ip: '10.12.4.31' },
  { ts: '2026-10-29 08:52:10', user: 'ธนากร ค.',  role: 'editor', act: 'UPDATE',  obj: 'gis.street_light / SL-00413', detail: 'status_code: active → damaged · แนบภาพถ่าย 2 ไฟล์', ip: '10.12.9.77' },
  { ts: '2026-10-29 08:40:03', user: 'ธนากร ค.',  role: 'editor', act: 'CREATE',  obj: 'gis.street_light / SL-00743', detail: 'สร้างรายการใหม่จากแอปสำรวจ (sync offline 4 รายการ)', ip: '10.12.9.77' },
  { ts: '2026-10-29 08:30:55', user: 'ผู้บริหาร',  role: 'viewer', act: 'EXPORT',  obj: 'แผนที่ภาพรวม (PDF A3)', detail: 'ส่งออกแผนที่ 1 ไฟล์ · ชั้นข้อมูล L01, L02, L04', ip: '10.12.1.5' },
  { ts: '2026-10-29 07:58:41', user: 'ปิยะนุช ส.', role: 'both',   act: 'QC_RUN',  obj: 'QC Run #184', detail: 'ตรวจคุณภาพ 10 ชั้นข้อมูล · พบ 8 ข้อค้นพบ (2 critical)', ip: '10.12.4.31' },
  { ts: '2026-10-28 17:22:19', user: 'ปิยะนุช ส.', role: 'both',   act: 'REJECT',  obj: 'gis.road / RD-0163', detail: 'ตีกลับ · เหตุผล: ไม่ระบุเจ้าของทรัพย์สินและไม่มีหลักฐานอ้างอิง', ip: '10.12.4.31' },
  { ts: '2026-10-28 16:40:08', user: 'ธนากร ค.',  role: 'editor', act: 'SUBMIT',  obj: 'gis.road / RD-0182', detail: 'ส่งเข้าคิวตรวจสอบ', ip: '10.12.9.77' },
  { ts: '2026-10-28 14:05:33', user: 'สมชาย ว.',  role: 'admin',  act: 'GRANT',   obj: 'ผู้ใช้งาน U-061', detail: 'ให้สิทธิ์กลุ่ม both · ชั้นข้อมูล L01–L08 · หมดอายุ 2027-02-28', ip: '10.12.1.9' },
  { ts: '2026-10-28 11:12:47', user: 'สมชาย ว.',  role: 'admin',  act: 'PUBLISH', obj: 'ชุดเผยแพร่สาธารณะ v2026.10', detail: 'สร้างชุดเผยแพร่ · ตัด L03 และฟิลด์ข้อมูลส่วนบุคคล 6 ฟิลด์', ip: '10.12.1.9' },
  { ts: '2026-10-28 09:34:02', user: 'อรทัย พ.',  role: 'editor', act: 'DELETE',  obj: 'gis.water_pipe / WP-00117', detail: 'ยกเลิกใช้งาน (soft delete) · เหตุผล: บันทึกซ้ำกับ WP-00118', ip: '10.12.9.81' }
];

/* ---------- รายการ API ---------- */
const API_GROUPS = [
  {
    g: 'Authentication & Session', base: '/api/v1/auth', icon: 'lock',
    desc: 'ยืนยันตัวตนด้วย OAuth 2.0 / OIDC คืนค่า JWT access token (อายุ 30 นาที) และ refresh token',
    eps: [
      { m: 'POST',   p: '/auth/login',          d: 'เข้าสู่ระบบด้วยชื่อผู้ใช้/รหัสผ่าน หรือ SSO',       role: 'สาธารณะ' },
      { m: 'POST',   p: '/auth/refresh',        d: 'ต่ออายุ access token ด้วย refresh token',          role: 'ผู้เข้าสู่ระบบ' },
      { m: 'POST',   p: '/auth/logout',         d: 'ยกเลิก session และเพิกถอน refresh token',          role: 'ผู้เข้าสู่ระบบ' },
      { m: 'GET',    p: '/auth/me',             d: 'ข้อมูลผู้ใช้ปัจจุบัน กลุ่มสิทธิ์ และชั้นข้อมูลที่เข้าถึงได้', role: 'ผู้เข้าสู่ระบบ' },
      { m: 'POST',   p: '/auth/change-password',d: 'เปลี่ยนรหัสผ่านของตนเอง',                        role: 'ผู้เข้าสู่ระบบ' }
    ]
  },
  {
    g: 'Users & Roles', base: '/api/v1/users', icon: 'users',
    desc: 'จัดการผู้ใช้งาน กลุ่มสิทธิ์ และขอบเขตชั้นข้อมูลที่แต่ละผู้ใช้เข้าถึงได้',
    eps: [
      { m: 'GET',    p: '/users',                      d: 'รายการผู้ใช้งาน (กรองตามกลุ่มสิทธิ์/หน่วยงาน/สถานะ)', role: 'admin' },
      { m: 'POST',   p: '/users',                      d: 'สร้างผู้ใช้งานใหม่',                          role: 'admin' },
      { m: 'GET',    p: '/users/{userId}',             d: 'รายละเอียดผู้ใช้งาน',                         role: 'admin' },
      { m: 'PATCH',  p: '/users/{userId}',             d: 'แก้ไขข้อมูลผู้ใช้งาน',                        role: 'admin' },
      { m: 'DELETE', p: '/users/{userId}',             d: 'ระงับการใช้งาน (soft disable)',               role: 'admin' },
      { m: 'PUT',    p: '/users/{userId}/roles',       d: 'กำหนดกลุ่มสิทธิ์ (viewer / editor / both / admin)', role: 'admin' },
      { m: 'PUT',    p: '/users/{userId}/layer-scope', d: 'กำหนดชั้นข้อมูลและขอบเขตพื้นที่ที่เข้าถึงได้',  role: 'admin' },
      { m: 'GET',    p: '/roles',                      d: 'รายการกลุ่มสิทธิ์และสิทธิ์ย่อยทั้งหมด',        role: 'ทุกกลุ่ม' }
    ]
  },
  {
    g: 'Layer Registry & Metadata', base: '/api/v1/layers', icon: 'layers',
    desc: 'ทะเบียนชั้นข้อมูล โครงสร้างฟิลด์ (data dictionary) สัญลักษณ์ และ Metadata ตาม ISO 19115',
    eps: [
      { m: 'GET',    p: '/layers',                        d: 'รายการชั้นข้อมูลทั้งหมดพร้อมจำนวนรายการและสถานะ', role: 'ทุกกลุ่ม' },
      { m: 'GET',    p: '/layers/{layerCode}',            d: 'รายละเอียดชั้นข้อมูล 1 ชั้น',                 role: 'ทุกกลุ่ม' },
      { m: 'POST',   p: '/layers',                        d: 'ขึ้นทะเบียนชั้นข้อมูลใหม่',                   role: 'admin' },
      { m: 'PATCH',  p: '/layers/{layerCode}',            d: 'แก้ไขทะเบียนชั้นข้อมูล',                      role: 'admin' },
      { m: 'GET',    p: '/layers/{layerCode}/fields',     d: 'พจนานุกรมข้อมูลระดับฟิลด์ของชั้นข้อมูล',       role: 'ทุกกลุ่ม' },
      { m: 'GET',    p: '/layers/{layerCode}/metadata',   d: 'Metadata ตามมาตรฐาน ISO 19115 / มาตรฐาน DGA', role: 'ทุกกลุ่ม' },
      { m: 'PUT',    p: '/layers/{layerCode}/metadata',   d: 'ปรับปรุง Metadata',                          role: 'both, admin' },
      { m: 'GET',    p: '/layers/{layerCode}/style',      d: 'รูปแบบสัญลักษณ์ (SLD / JSON style)',          role: 'ทุกกลุ่ม' },
      { m: 'GET',    p: '/layers/{layerCode}/extent',     d: 'ขอบเขตเชิงพื้นที่ (bbox) ของชั้นข้อมูล',       role: 'ทุกกลุ่ม' }
    ]
  },
  {
    g: 'Features (ข้อมูลเชิงพื้นที่)', base: '/api/v1/layers/{layerCode}/features', icon: 'pin',
    desc: 'อ่าน/เขียนรายการข้อมูลแบบรวมศูนย์ รองรับ GeoJSON, การกรองด้วย CQL2 และการแบ่งหน้า',
    eps: [
      { m: 'GET',    p: '/layers/{layerCode}/features',            d: 'ค้นรายการ (bbox, filter, sort, page) คืนค่า GeoJSON FeatureCollection', role: 'viewer, both, admin' },
      { m: 'POST',   p: '/layers/{layerCode}/features',            d: 'สร้างรายการใหม่ (สถานะเริ่มต้น draft)',      role: 'editor, both, admin' },
      { m: 'GET',    p: '/layers/{layerCode}/features/{featureId}',d: 'อ่านรายการเดียวพร้อมรูปทรงและไฟล์แนบ',       role: 'viewer, both, admin' },
      { m: 'PATCH',  p: '/layers/{layerCode}/features/{featureId}',d: 'แก้ไขบางฟิลด์ (ใช้ If-Match ป้องกันเขียนทับ)', role: 'editor, both, admin' },
      { m: 'PUT',    p: '/layers/{layerCode}/features/{featureId}/geometry', d: 'แก้ไขรูปทรงเชิงพื้นที่',          role: 'editor, both, admin' },
      { m: 'DELETE', p: '/layers/{layerCode}/features/{featureId}',d: 'ยกเลิกใช้งานรายการ (soft delete)',           role: 'both, admin' },
      { m: 'GET',    p: '/layers/{layerCode}/features/{featureId}/history', d: 'ประวัติการแก้ไขทุกเวอร์ชันของรายการ', role: 'both, admin' },
      { m: 'POST',   p: '/layers/{layerCode}/features/bulk',       d: 'นำเข้าหลายรายการในครั้งเดียว (สูงสุด 500)',   role: 'both, admin' },
      { m: 'POST',   p: '/layers/{layerCode}/features/validate',   d: 'ตรวจสอบข้อมูลก่อนบันทึก (dry-run)',          role: 'editor, both, admin' }
    ]
  },
  {
    g: 'Workflow (ตรวจสอบ/อนุมัติ)', base: '/api/v1/workflow', icon: 'check',
    desc: 'กระบวนการ ร่าง → ส่งตรวจ → อนุมัติ/ตีกลับ พร้อมบันทึกเหตุผลและผู้กระทำ',
    eps: [
      { m: 'GET',    p: '/workflow/queue',                   d: 'คิวรายการที่รอตรวจสอบของผู้ใช้ปัจจุบัน',  role: 'both, admin' },
      { m: 'POST',   p: '/workflow/{featureId}/submit',       d: 'ส่งรายการเข้าคิวตรวจสอบ',                role: 'editor, both, admin' },
      { m: 'POST',   p: '/workflow/{featureId}/approve',      d: 'อนุมัติรายการ',                        role: 'both, admin' },
      { m: 'POST',   p: '/workflow/{featureId}/reject',       d: 'ตีกลับรายการพร้อมเหตุผล',               role: 'both, admin' },
      { m: 'POST',   p: '/workflow/batch-approve',            d: 'อนุมัติหลายรายการพร้อมกัน',             role: 'both, admin' },
      { m: 'GET',    p: '/workflow/{featureId}/comments',     d: 'ความเห็นประกอบการตรวจสอบ',              role: 'editor, both, admin' },
      { m: 'POST',   p: '/workflow/{featureId}/comments',     d: 'เพิ่มความเห็น',                        role: 'editor, both, admin' }
    ]
  },
  {
    g: 'Spatial Analysis', base: '/api/v1/spatial', icon: 'target',
    desc: 'การวิเคราะห์เชิงพื้นที่ที่ประมวลผลด้วยฟังก์ชัน PostGIS ฝั่งฐานข้อมูล',
    eps: [
      { m: 'GET',  p: '/spatial/nearby',             d: 'ค้นรายการใกล้พิกัดที่กำหนด (ST_DWithin)',               role: 'viewer, both, admin' },
      { m: 'POST', p: '/spatial/intersect',          d: 'หารายการที่ตัดกับรูปทรงที่ส่งมา (ST_Intersects)',        role: 'viewer, both, admin' },
      { m: 'POST', p: '/spatial/buffer',             d: 'สร้างพื้นที่กันชนรอบรายการที่เลือก (ST_Buffer)',          role: 'viewer, both, admin' },
      { m: 'GET',  p: '/spatial/roads/{roadId}/assets', d: 'ทรัพย์สินทั้งหมดบนถนนสายที่เลือก (ไฟ/CCTV/สะพาน)',   role: 'viewer, both, admin' },
      { m: 'GET',  p: '/spatial/coverage/lighting',  d: 'วิเคราะห์ความครอบคลุมไฟส่องสว่างต่อความยาวถนน',          role: 'viewer, both, admin' },
      { m: 'GET',  p: '/spatial/boundary/discrepancy', d: 'พื้นที่คลาดเคลื่อนระหว่างแนวเขตอ้างอิงกับแนวเขตจัดเก็บ', role: 'viewer, both, admin' },
      { m: 'POST', p: '/spatial/measure',            d: 'คำนวณระยะทาง/พื้นที่จากรูปทรงที่วาดบนแผนที่',            role: 'ทุกกลุ่ม' },
      { m: 'GET',  p: '/spatial/parcels/{parcelNo}/features', d: 'รายการข้อมูลทั้งหมดในแปลงที่ดินที่ระบุ',       role: 'viewer, both, admin' }
    ]
  },
  {
    g: 'Map Services & Tiles', base: '/api/v1/tiles', icon: 'map',
    desc: 'บริการแผนที่สำหรับการแสดงผล รองรับ Vector Tile (MVT) และมาตรฐาน OGC',
    eps: [
      { m: 'GET', p: '/tiles/{layerCode}/{z}/{x}/{y}.pbf', d: 'Vector tile (ST_AsMVT) สำหรับแสดงผลบนเว็บ/มือถือ', role: 'viewer, both, admin' },
      { m: 'GET', p: '/tiles/{layerCode}/tilejson',         d: 'TileJSON metadata ของชั้นข้อมูล',               role: 'viewer, both, admin' },
      { m: 'GET', p: '/ogc/collections',                    d: 'OGC API — Features: รายการ collection',          role: 'viewer, both, admin' },
      { m: 'GET', p: '/ogc/collections/{id}/items',         d: 'OGC API — Features: รายการข้อมูลในรูปแบบ GeoJSON', role: 'viewer, both, admin' },
      { m: 'GET', p: '/ows/wms',                            d: 'WMS 1.3.0 (GetMap, GetFeatureInfo) สำหรับ QGIS/ArcGIS', role: 'viewer, both, admin' },
      { m: 'GET', p: '/ows/wfs',                            d: 'WFS 2.0.0 สำหรับดึงข้อมูลเข้าโปรแกรม GIS',       role: 'viewer, both, admin' },
      { m: 'GET', p: '/basemaps',                           d: 'รายการแผนที่ฐานที่ติดตั้งไว้',                   role: 'ทุกกลุ่ม' }
    ]
  },
  {
    g: 'Field Survey & Attachments', base: '/api/v1/survey', icon: 'mobile',
    desc: 'รองรับการสำรวจภาคสนามบนมือถือ ทำงานออฟไลน์ และซิงก์ข้อมูลพร้อมภาพถ่าย',
    eps: [
      { m: 'POST', p: '/survey/sessions',                  d: 'เปิดรอบการสำรวจใหม่ (ระบุชั้นข้อมูลและพื้นที่)',  role: 'editor, both, admin' },
      { m: 'GET',  p: '/survey/sessions/{sessionId}',       d: 'สถานะและสรุปผลของรอบการสำรวจ',                 role: 'editor, both, admin' },
      { m: 'POST', p: '/survey/sync',                       d: 'ซิงก์ข้อมูลที่บันทึกออฟไลน์เป็นชุด (idempotent)', role: 'editor, both, admin' },
      { m: 'GET',  p: '/survey/packages/{layerCode}',       d: 'ดาวน์โหลดชุดข้อมูลและแผนที่ฐานสำหรับใช้ออฟไลน์', role: 'editor, both, admin' },
      { m: 'POST', p: '/features/{featureId}/attachments',  d: 'แนบภาพถ่าย/ไฟล์หลักฐาน (multipart, สูงสุด 15 MB)', role: 'editor, both, admin' },
      { m: 'GET',  p: '/features/{featureId}/attachments',  d: 'รายการไฟล์แนบของรายการ',                       role: 'viewer, both, admin' },
      { m: 'DELETE',p: '/attachments/{attachmentId}',       d: 'ลบไฟล์แนบ',                                   role: 'both, admin' }
    ]
  },
  {
    g: 'Quality Control', base: '/api/v1/qc', icon: 'shield',
    desc: 'ตรวจคุณภาพข้อมูลตามกฎที่กำหนด และติดตามการแก้ไขข้อค้นพบ',
    eps: [
      { m: 'GET',  p: '/qc/rules',                  d: 'รายการกฎการตรวจคุณภาพทั้งหมด',           role: 'ทุกกลุ่ม' },
      { m: 'POST', p: '/qc/rules',                  d: 'เพิ่มกฎการตรวจคุณภาพ',                   role: 'admin' },
      { m: 'PATCH',p: '/qc/rules/{ruleId}',         d: 'แก้ไข/ปิดใช้งานกฎ',                      role: 'admin' },
      { m: 'POST', p: '/qc/runs',                   d: 'เรียกการตรวจคุณภาพ (ระบุชั้นข้อมูลและกฎ)', role: 'both, admin' },
      { m: 'GET',  p: '/qc/runs',                   d: 'ประวัติการตรวจคุณภาพ',                   role: 'both, admin' },
      { m: 'GET',  p: '/qc/runs/{runId}',           d: 'สรุปผลการตรวจ 1 รอบ',                   role: 'both, admin' },
      { m: 'GET',  p: '/qc/runs/{runId}/findings',  d: 'รายการข้อค้นพบพร้อมพิกัดและระดับความรุนแรง', role: 'both, admin' },
      { m: 'PATCH',p: '/qc/findings/{findingId}',   d: 'ปรับสถานะข้อค้นพบ (open/fixing/fixed/waived)', role: 'editor, both, admin' },
      { m: 'GET',  p: '/qc/runs/{runId}/report',    d: 'ดาวน์โหลดรายงานผลตรวจคุณภาพ (PDF/XLSX)',   role: 'both, admin' }
    ]
  },
  {
    g: 'Export & Publication', base: '/api/v1/exports', icon: 'download',
    desc: 'ส่งออกข้อมูลตามรูปแบบส่งมอบ และจัดชุดเผยแพร่ที่ตัดข้อมูลอ่อนไหวออก',
    eps: [
      { m: 'POST', p: '/exports',                       d: 'สร้างงานส่งออก (gpkg, qgs, shp, geojson, xlsx, csv, pdf)', role: 'ตามกลุ่มสิทธิ์' },
      { m: 'GET',  p: '/exports',                       d: 'รายการงานส่งออกและสถานะ',                   role: 'ตามกลุ่มสิทธิ์' },
      { m: 'GET',  p: '/exports/{exportId}',            d: 'สถานะงานส่งออก (queued/running/done/failed)', role: 'ตามกลุ่มสิทธิ์' },
      { m: 'GET',  p: '/exports/{exportId}/download',   d: 'ดาวน์โหลดไฟล์ผลลัพธ์ (ลิงก์หมดอายุ 24 ชม.)', role: 'ตามกลุ่มสิทธิ์' },
      { m: 'GET',  p: '/exports/{exportId}/manifest',   d: 'บัญชีไฟล์และรุ่นข้อมูลของชุดส่งมอบ',          role: 'ตามกลุ่มสิทธิ์' },
      { m: 'GET',  p: '/publications',                  d: 'รายการชุดเผยแพร่ทั้งหมด',                   role: 'ทุกกลุ่ม' },
      { m: 'POST', p: '/publications',                  d: 'สร้างชุดเผยแพร่ตามโปรไฟล์ที่กำหนด',         role: 'both, admin' },
      { m: 'GET',  p: '/publications/{pubId}/diff',     d: 'เปรียบเทียบความต่างจากชุดเผยแพร่รุ่นก่อน',    role: 'both, admin' },
      { m: 'GET',  p: '/publication-profiles',          d: 'โปรไฟล์การเผยแพร่ (ฟิลด์/ชั้นข้อมูลที่ถูกตัด)', role: 'both, admin' }
    ]
  },
  {
    g: 'Dashboard & Monitoring', base: '/api/v1/analytics', icon: 'chart',
    desc: 'ตัวเลขสรุปสำหรับหน้าแดชบอร์ด ตัวชี้วัด และรอบการทบทวนแผน',
    eps: [
      { m: 'GET',  p: '/analytics/summary',          d: 'ตัวเลขสรุปภาพรวมสำหรับหน้าแดชบอร์ด',  role: 'viewer, both, admin' },
      { m: 'GET',  p: '/analytics/layer-health',     d: 'ความครบถ้วนและคุณภาพรายชั้นข้อมูล',   role: 'viewer, both, admin' },
      { m: 'GET',  p: '/analytics/by-agency',        d: 'สรุปทรัพย์สินจำแนกตามหน่วยงานรับผิดชอบ', role: 'viewer, both, admin' },
      { m: 'GET',  p: '/analytics/by-village',       d: 'สรุปรายหมู่บ้าน/เขตการปกครองย่อย',     role: 'viewer, both, admin' },
      { m: 'GET',  p: '/kpis',                       d: 'ตัวชี้วัดและค่าเทียบเป้าหมาย',         role: 'viewer, both, admin' },
      { m: 'POST', p: '/kpis/{kpiCode}/values',      d: 'บันทึกค่าตัวชี้วัดรอบใหม่',            role: 'both, admin' },
      { m: 'GET',  p: '/review-cycles',              d: 'รอบการทบทวนแผนและผู้รับผิดชอบปรับปรุงข้อมูล', role: 'ทุกกลุ่ม' }
    ]
  },
  {
    g: 'Citizen Input', base: '/api/v1/proposals', icon: 'chat',
    desc: 'รับข้อเสนอและข้อร้องเรียนจากประชาชน พร้อมเชื่อมโยงพิกัดและชั้นข้อมูลที่เกี่ยวข้อง',
    eps: [
      { m: 'GET',  p: '/proposals',                   d: 'รายการข้อเสนอ/ข้อร้องเรียน (กรองตามพื้นที่และประเด็น)', role: 'viewer, both, admin' },
      { m: 'POST', p: '/proposals',                   d: 'ส่งข้อเสนอใหม่พร้อมพิกัดและภาพถ่าย',        role: 'สาธารณะ (reCAPTCHA)' },
      { m: 'GET',  p: '/proposals/{proposalId}',      d: 'รายละเอียดข้อเสนอและสถานะดำเนินการ',        role: 'viewer, both, admin' },
      { m: 'PATCH',p: '/proposals/{proposalId}',      d: 'ปรับสถานะและผู้รับผิดชอบ',                 role: 'both, admin' },
      { m: 'POST', p: '/proposals/{proposalId}/link', d: 'เชื่อมโยงข้อเสนอกับรายการข้อมูลหรือโครงการ', role: 'both, admin' },
      { m: 'GET',  p: '/proposals/heatmap',           d: 'ความหนาแน่นข้อเสนอเชิงพื้นที่ (hex grid)',   role: 'viewer, both, admin' }
    ]
  },
  {
    g: 'Audit & System', base: '/api/v1/system', icon: 'gear',
    desc: 'บันทึกการใช้งาน การสำรองข้อมูล และสถานะระบบ',
    eps: [
      { m: 'GET',  p: '/audit-logs',            d: 'บันทึกการใช้งานทั้งระบบ (กรองตามผู้ใช้/การกระทำ/ช่วงเวลา)', role: 'both, admin' },
      { m: 'GET',  p: '/audit-logs/export',     d: 'ส่งออกบันทึกการใช้งาน (CSV)',             role: 'admin' },
      { m: 'GET',  p: '/system/health',          d: 'สถานะระบบ ฐานข้อมูล และบริการแผนที่',      role: 'ทุกกลุ่ม' },
      { m: 'GET',  p: '/system/backups',         d: 'ประวัติการสำรองข้อมูล',                   role: 'admin' },
      { m: 'POST', p: '/system/backups',         d: 'สั่งสำรองข้อมูลทันที',                    role: 'admin' },
      { m: 'GET',  p: '/system/reference/{set}', d: 'ตารางค่าอ้างอิง (หน่วยงาน ผิวทาง ประเภทไฟ ฯลฯ)', role: 'ทุกกลุ่ม' },
      { m: 'GET',  p: '/system/version',         d: 'รุ่นของระบบ ฐานข้อมูล และชุดข้อมูล',       role: 'ทุกกลุ่ม' }
    ]
  }
];

/* ---------- ชุดฟิลด์มาตรฐาน (Core attribute set) ---------- */
const CORE_FIELDS = [
  { f: 'feature_uid',           t: 'uuid',           n: 'NOT NULL, PK',  d: 'รหัสภายในระบบ สร้างด้วย gen_random_uuid()', ex: '8f1c…a42e' },
  { f: 'feature_code',          t: 'varchar(32)',    n: 'NOT NULL, UQ',  d: 'รหัสรายการที่มนุษย์อ่านได้ ไม่ซ้ำทั้งชั้นข้อมูล (TOR 4.6(5))', ex: 'RD-0101' },
  { f: 'layer_code',            t: 'varchar(8)',     n: 'NOT NULL, FK',  d: 'รหัสชั้นข้อมูล → ref.layer_registry', ex: 'L01' },
  { f: 'name_th',               t: 'varchar(255)',   n: '',              d: 'ชื่อรายการภาษาไทย', ex: 'ถนนสายหลักกลางตำบล' },
  { f: 'description',           t: 'text',           n: '',              d: 'คำอธิบายข้อมูลประกอบรายการ', ex: '—' },
  { f: 'owner_agency_id',       t: 'smallint',       n: 'FK',            d: 'เจ้าของทรัพย์สิน → ref.agency', ex: '1' },
  { f: 'maintainer_agency_id',  t: 'smallint',       n: 'FK',            d: 'ผู้บำรุงรักษา (แยกจากเจ้าของ ตาม TOR 4.6(2))', ex: '3' },
  { f: 'confirm_status_code',   t: 'varchar(16)',    n: "NOT NULL DEFAULT 'pending', FK", d: 'สถานะการยืนยันผู้รับผิดชอบ: confirmed / pending / conflict / unknown', ex: 'confirmed' },
  { f: 'source_ref',            t: 'text',           n: 'NOT NULL',      d: 'แหล่งข้อมูล/หลักฐานอ้างอิง (เลขที่หนังสือ ชื่อไฟล์ ภาพถ่าย)', ex: 'บันทึก กช.123/2569' },
  { f: 'source_type_code',      t: 'varchar(24)',    n: 'NOT NULL, FK',  d: 'ประเภทแหล่งข้อมูล: field_survey / aerial / agency_doc / citizen_report / legacy', ex: 'field_survey' },
  { f: 'surveyed_on',           t: 'date',           n: 'NOT NULL',      d: 'วันที่สำรวจหรือวันที่ข้อมูลมีผล', ex: '2026-09-12' },
  { f: 'positional_accuracy_m', t: 'numeric(5,2)',   n: '',              d: 'ความแม่นยำตำแหน่งเป้าหมาย (เมตร) ตามที่ระบุในรายงานเริ่มต้น', ex: '1.50' },
  { f: 'record_status_code',    t: 'varchar(16)',    n: "NOT NULL DEFAULT 'draft'", d: 'สถานะรายการ: draft / submitted / approved / rejected / retired', ex: 'approved' },
  { f: 'sensitivity_code',      t: 'varchar(16)',    n: "NOT NULL DEFAULT 'internal'", d: 'ชั้นความลับ: public / internal / confidential / restricted', ex: 'internal' },
  { f: 'is_public',             t: 'boolean',        n: 'NOT NULL DEFAULT false', d: 'อยู่ในชุดเผยแพร่สาธารณะหรือไม่ (TOR 4.6(7))', ex: 'true' },
  { f: 'geom',                  t: 'geometry(…,4326)', n: 'NOT NULL',    d: 'รูปทรงเชิงพื้นที่ จัดเก็บใน EPSG:4326 มี GiST index', ex: '—' },
  { f: 'created_at',            t: 'timestamptz',    n: 'NOT NULL DEFAULT now()', d: 'เวลาที่สร้างรายการ', ex: '2026-09-12 10:22+07' },
  { f: 'created_by',            t: 'uuid',           n: 'NOT NULL, FK',  d: 'ผู้สร้างรายการ → app.user_account', ex: 'U-021' },
  { f: 'updated_at',            t: 'timestamptz',    n: 'NOT NULL DEFAULT now()', d: 'เวลาที่ปรับปรุงล่าสุด (trigger)', ex: '2026-10-21 14:08+07' },
  { f: 'updated_by',            t: 'uuid',           n: 'FK',            d: 'ผู้ปรับปรุงล่าสุด', ex: 'U-014' },
  { f: 'version_no',            t: 'integer',        n: 'NOT NULL DEFAULT 1', d: 'เลขรุ่นของรายการ ใช้กับ optimistic locking (ETag)', ex: '3' }
];

/* ---------- พจนานุกรมข้อมูลรายชั้น ---------- */
const DICT = [
  { code: 'L01', table: 'gis.road', geom: 'MultiLineString, 4326', pk: 'feature_uid',
    fields: [
      { f: 'road_class_code',   t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'ชั้นทาง: highway / main / secondary / soi / farm_road', ex: 'main' },
      { f: 'surface_code',      t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'ผิวทาง: concrete / asphalt / laterite / earth / paving_block', ex: 'concrete' },
      { f: 'condition_code',    t: 'varchar(16)',  n: 'FK',           d: 'สภาพจากการสำรวจ: good / fair / poor / needs_repair', ex: 'good' },
      { f: 'length_m',          t: 'numeric(10,2)',n: 'GENERATED',    d: 'ความยาว (ม.) คำนวณจาก ST_Length(geom::geography)', ex: '4820.00' },
      { f: 'width_m',           t: 'numeric(5,2)', n: '',             d: 'ความกว้างผิวทางเฉลี่ย (ม.)', ex: '6.00' },
      { f: 'start_point_desc',  t: 'varchar(255)', n: '',             d: 'คำบรรยายจุดเริ่มต้น', ex: 'สามแยกหน้าวัด' },
      { f: 'end_point_desc',    t: 'varchar(255)', n: '',             d: 'คำบรรยายจุดสิ้นสุด', ex: 'สะพานคลองกลาง' },
      { f: 'village_code',      t: 'varchar(16)',  n: 'FK',           d: 'หมู่บ้าน/เขตปกครองย่อยที่ถนนผ่าน (หลักค่าแรก)', ex: 'M01' },
      { f: 'row_width_m',       t: 'numeric(5,2)', n: '',             d: 'ความกว้างเขตทาง (ม.) หากตรวจสอบได้', ex: '12.00' },
      { f: 'has_drainage',      t: 'boolean',      n: 'DEFAULT false',d: 'มีรางระบายน้ำสองข้างทางหรือไม่', ex: 'true' },
      { f: 'ownership_note',    t: 'text',         n: '',             d: 'บันทึกกรณีเจ้าของและผู้บำรุงรักษาไม่ตรงกัน หรือรอยืนยัน', ex: 'อบจ. เป็นเจ้าของ อบต. ดูแลตาม MOU' }
    ]},
  { code: 'L02', table: 'gis.street_light', geom: 'Point, 4326', pk: 'feature_uid',
    fields: [
      { f: 'light_type_code',  t: 'varchar(16)', n: 'NOT NULL, FK', d: 'ประเภทอุปกรณ์: led / hps / solar / fluorescent', ex: 'led' },
      { f: 'wattage',          t: 'smallint',    n: '',             d: 'กำลังไฟ (วัตต์)', ex: '100' },
      { f: 'pole_type_code',   t: 'varchar(16)', n: 'FK',           d: 'ประเภทเสา: concrete / steel / high_mast / utility_pole', ex: 'concrete' },
      { f: 'arm_count',        t: 'smallint',    n: 'DEFAULT 1',    d: 'จำนวนกิ่งโคม', ex: '1' },
      { f: 'status_code',      t: 'varchar(16)', n: 'NOT NULL, FK', d: 'สถานะใช้งาน: active / damaged / pending_repair / removed', ex: 'active' },
      { f: 'road_uid',         t: 'uuid',        n: 'FK',           d: 'ถนนที่ติดตั้ง → gis.road', ex: 'RD-0101' },
      { f: 'chainage_m',       t: 'numeric(10,2)',n: '',            d: 'ระยะตามแนวถนนจากจุดเริ่มต้น (ม.)', ex: '320.50' },
      { f: 'power_source_code',t: 'varchar(16)', n: 'FK',           d: 'แหล่งจ่ายไฟ: grid / solar / hybrid', ex: 'grid' },
      { f: 'last_repair_on',   t: 'date',        n: '',             d: 'วันที่ซ่อมบำรุงครั้งล่าสุด', ex: '2026-06-18' }
    ]},
  { code: 'L03', table: 'gis.cctv', geom: 'Point, 4326', pk: 'feature_uid',
    note: 'ชั้นข้อมูลอ่อนไหว — sensitivity_code = confidential และถูกตัดออกจากชุดเผยแพร่สาธารณะทุกรุ่น ห้ามจัดเก็บรหัสผ่าน IP หรือข้อมูลเชื่อมต่อ (TOR 4.6(1) ข้อ 3)',
    fields: [
      { f: 'camera_type_code', t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'ประเภทกล้อง: fixed / ptz / dome / anpr', ex: 'fixed' },
      { f: 'status_code',      t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'สถานะใช้งาน: active / offline / damaged / removed', ex: 'active' },
      { f: 'view_azimuth_deg', t: 'smallint',     n: 'CHECK 0–359',  d: 'ทิศทางกล้องชี้ (องศาจากทิศเหนือ) ที่ตรวจสอบได้', ex: '135' },
      { f: 'view_range_m',     t: 'numeric(6,2)', n: '',             d: 'ระยะครอบคลุมโดยประมาณ (ม.)', ex: '45.00' },
      { f: 'mount_height_m',   t: 'numeric(4,2)', n: '',             d: 'ความสูงจุดติดตั้ง (ม.)', ex: '6.50' },
      { f: 'road_uid',         t: 'uuid',         n: 'FK',           d: 'ถนน/จุดอ้างอิงที่ติดตั้ง', ex: 'RD-0101' },
      { f: 'install_year',     t: 'smallint',     n: '',             d: 'ปีที่ติดตั้ง (พ.ศ.)', ex: '2566' }
    ]},
  { code: 'L04', table: 'gis.bridge', geom: 'Point, 4326', pk: 'feature_uid',
    fields: [
      { f: 'structure_code',   t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'ประเภทโครงสร้าง: rc_slab / rc_girder / box_culvert / steel / timber', ex: 'rc_girder' },
      { f: 'span_length_m',    t: 'numeric(6,2)', n: '',             d: 'ความยาวสะพาน (ม.)', ex: '18.00' },
      { f: 'deck_width_m',     t: 'numeric(5,2)', n: '',             d: 'ความกว้างสะพาน (ม.)', ex: '7.00' },
      { f: 'load_limit_ton',   t: 'numeric(5,1)', n: '',             d: 'น้ำหนักบรรทุกจำกัดตามป้าย (ตัน) หากมี', ex: '21.0' },
      { f: 'condition_code',   t: 'varchar(16)',  n: 'FK',           d: 'สภาพจากการสำรวจเบื้องต้น: good / fair / poor / unsafe', ex: 'fair' },
      { f: 'road_uid',         t: 'uuid',         n: 'FK',           d: 'ถนนที่สะพานอยู่บน', ex: 'RD-0102' },
      { f: 'chainage_m',       t: 'numeric(10,2)',n: '',             d: 'ตำแหน่งบนถนน (ม. จากจุดเริ่มต้น)', ex: '1240.00' },
      { f: 'crosses_feature',  t: 'varchar(255)', n: '',             d: 'สิ่งที่สะพานข้าม (คลอง/ลำราง/ถนน)', ex: 'คลองส่งน้ำสายที่ 2' },
      { f: 'inspection_note',  t: 'text',         n: '',             d: 'ข้อสังเกตจากการสำรวจ (ไม่ใช่ผลตรวจโครงสร้างทางวิศวกรรม)', ex: 'พบรอยแตกร้าวที่ราวสะพาน' }
    ]},
  { code: 'L05', table: 'gis.water_facility', geom: 'Point, 4326', pk: 'feature_uid',
    note: 'ชั้นข้อมูลนี้ประกอบด้วย 3 ตาราง: water_facility (จุด) · water_pipe (แนวท่อ) · water_body (แหล่งน้ำ)',
    fields: [
      { f: 'facility_type_code', t: 'varchar(24)',  n: 'NOT NULL, FK', d: 'ประเภท: intake / treatment / pump / tank / standpipe / well', ex: 'tank' },
      { f: 'capacity_m3',       t: 'numeric(10,2)', n: '',            d: 'ความจุหรือกำลังผลิต (ลบ.ม. หรือ ลบ.ม./วัน)', ex: '120.00' },
      { f: 'status_code',       t: 'varchar(16)',   n: 'NOT NULL, FK',d: 'สถานะ: active / inactive / under_repair / abandoned', ex: 'active' },
      { f: 'service_village',   t: 'varchar(128)',  n: '',            d: 'พื้นที่บริการ (รายการหมู่บ้าน)', ex: 'หมู่ 1, 2, 5' },
      { f: 'household_served',  t: 'integer',       n: '',            d: 'จำนวนครัวเรือนที่ได้รับบริการ (ประมาณการ)', ex: '248' },
      { f: 'operator_agency_id',t: 'smallint',      n: 'FK',          d: 'ผู้ดำเนินการระบบ → ref.agency', ex: '3' }
    ]},
  { code: 'L06', table: 'gis.drainage_issue', geom: 'Point, 4326', pk: 'feature_uid',
    note: 'คู่กับ gis.drainage_line (LineString) สำหรับแนวคูคลองและทางระบายน้ำ',
    fields: [
      { f: 'issue_type_code',  t: 'varchar(24)', n: 'NOT NULL, FK', d: 'ประเภทปัญหา: flooding / wastewater / blockage / odor / erosion', ex: 'flooding' },
      { f: 'severity_code',    t: 'varchar(16)', n: 'NOT NULL, FK', d: 'ระดับความรุนแรง: low / medium / high / critical', ex: 'high' },
      { f: 'frequency_code',   t: 'varchar(16)', n: 'FK',           d: 'ความถี่: every_rain / seasonal / occasional / permanent', ex: 'every_rain' },
      { f: 'affected_household',t: 'integer',    n: '',             d: 'จำนวนครัวเรือนที่ได้รับผลกระทบ', ex: '34' },
      { f: 'priority_rank',    t: 'smallint',    n: '',             d: 'ลำดับการแก้ไขที่จัดโดยคณะทำงาน', ex: '4' },
      { f: 'proposal_uid',     t: 'uuid',        n: 'FK',           d: 'ข้อเสนอประชาชนที่เกี่ยวข้อง → app.citizen_proposal', ex: 'CP-0188' },
      { f: 'resolved_on',      t: 'date',        n: '',             d: 'วันที่แก้ไขแล้วเสร็จ', ex: 'NULL' }
    ]},
  { code: 'L07', table: 'gis.public_space', geom: 'MultiPolygon, 4326', pk: 'feature_uid',
    note: 'คู่กับ gis.community_landmark (Point) สำหรับจุดอัตลักษณ์ชุมชน',
    fields: [
      { f: 'space_type_code',  t: 'varchar(24)',   n: 'NOT NULL, FK', d: 'ประเภท: park / sport_field / temple_ground / market / learning_center / green_area', ex: 'park' },
      { f: 'area_sqm',         t: 'numeric(12,2)', n: 'GENERATED',    d: 'พื้นที่ (ตร.ม.) จาก ST_Area(geom::geography)', ex: '4820.50' },
      { f: 'current_use',      t: 'varchar(255)',  n: '',             d: 'การใช้ประโยชน์ปัจจุบัน', ex: 'ลานกีฬาและตลาดนัดชุมชนวันเสาร์' },
      { f: 'caretaker_note',   t: 'varchar(255)',  n: '',             d: 'ผู้ดูแลพื้นที่', ex: 'คณะกรรมการหมู่บ้าน หมู่ 3' },
      { f: 'all_age_facility', t: 'boolean',       n: 'DEFAULT false',d: 'มีสิ่งอำนวยความสะดวกรองรับทุกช่วงวัยหรือไม่', ex: 'true' },
      { f: 'identity_potential',t: 'text',         n: '',             d: 'ศักยภาพเชื่อมโยงพื้นที่เกษตรหรือกิจกรรมชุมชน', ex: 'เชื่อมเส้นทางปั่นจักรยานเลียบคลอง' }
    ]},
  { code: 'L08', table: 'gis.boundary_discrepancy', geom: 'MultiPolygon, 4326', pk: 'feature_uid',
    note: 'คู่กับ gis.admin_boundary (MultiPolygon) ที่เก็บแนวเขตแต่ละแหล่งแยกรายการ พร้อมธง is_reference',
    fields: [
      { f: 'discrepancy_type_code', t: 'varchar(24)',  n: 'NOT NULL, FK', d: 'ประเภท: overlap / gap / misalignment', ex: 'overlap' },
      { f: 'reference_boundary_uid',t: 'uuid',         n: 'NOT NULL, FK', d: 'แนวเขตตามเอกสารอ้างอิง → gis.admin_boundary', ex: 'AB-001' },
      { f: 'actual_boundary_uid',   t: 'uuid',         n: 'NOT NULL, FK', d: 'แนวเขตจัดเก็บที่ใช้งานจริง → gis.admin_boundary', ex: 'AB-004' },
      { f: 'area_rai',              t: 'numeric(12,2)',n: 'GENERATED',    d: 'พื้นที่ต่างกัน (ไร่)', ex: '18.42' },
      { f: 'parcel_count',          t: 'integer',      n: '',             d: 'จำนวนแปลงที่ดินที่อยู่ในพื้นที่คลาดเคลื่อน', ex: '142' },
      { f: 'building_count',        t: 'integer',      n: '',             d: 'จำนวนสิ่งปลูกสร้างที่ได้รับผลกระทบ', ex: '96' },
      { f: 'resolution_status_code',t: 'varchar(16)',  n: 'NOT NULL, FK', d: 'สถานะ: conflict / pending / resolved', ex: 'conflict' },
      { f: 'coordination_evidence', t: 'text',         n: '',             d: 'หลักฐานการประสานหน่วยงาน (เลขที่หนังสือ/บันทึกการประชุม)', ex: 'บันทึกการประชุม 12 ต.ค. 2569' }
    ]},
  { code: 'L09', table: 'gis.land_parcel', geom: 'MultiPolygon, 4326', pk: 'feature_uid',
    note: 'ชั้นข้อมูลเดิม — เชื่อมโยงด้วย parcel_no ไม่จัดทำซ้ำ ใช้เพื่อการบริหารจัดการ ไม่ใช้แทนการรังวัดรับรองกรรมสิทธิ์',
    fields: [
      { f: 'parcel_no',       t: 'varchar(32)',   n: 'NOT NULL, UQ', d: 'เลขที่แปลง/เลขที่โฉนดตามทะเบียนเดิม', ex: '12345' },
      { f: 'land_use_code',   t: 'varchar(24)',   n: 'FK',           d: 'ประเภทการใช้ที่ดินตามทะเบียนภาษี', ex: 'residential' },
      { f: 'area_rai',        t: 'numeric(12,3)', n: '',             d: 'เนื้อที่ (ไร่-งาน-วา แปลงเป็นไร่ทศนิยม)', ex: '2.375' },
      { f: 'tax_account_ref', t: 'varchar(32)',   n: '',             d: 'รหัสอ้างอิงทะเบียนภาษีที่ดินและสิ่งปลูกสร้าง', ex: 'TX-2569-00412' }
    ]},
  { code: 'L10', table: 'gis.building', geom: 'MultiPolygon, 4326', pk: 'feature_uid',
    note: 'ชั้นข้อมูลเดิม — ไม่จัดเก็บชื่อ-ที่อยู่เจ้าของในชั้นเชิงพื้นที่ ข้อมูลส่วนบุคคลอยู่ในระบบทะเบียนภาษีและเข้าถึงตามสิทธิ์ (PDPA)',
    fields: [
      { f: 'building_no',      t: 'varchar(32)',  n: 'NOT NULL, UQ', d: 'รหัสสิ่งปลูกสร้างตามทะเบียนเดิม', ex: 'BLD-004120' },
      { f: 'parcel_uid',       t: 'uuid',         n: 'FK',           d: 'แปลงที่ดินที่ตั้งอยู่ → gis.land_parcel', ex: 'LP-012345' },
      { f: 'building_type_code',t: 'varchar(24)', n: 'FK',           d: 'ประเภทอาคาร: house / shophouse / factory / public / religious', ex: 'house' },
      { f: 'storey_count',     t: 'smallint',     n: '',             d: 'จำนวนชั้น', ex: '2' },
      { f: 'floor_area_sqm',   t: 'numeric(10,2)',n: '',             d: 'พื้นที่ใช้สอย (ตร.ม.)', ex: '142.00' },
      { f: 'house_no_masked',  t: 'varchar(16)',  n: '',             d: 'บ้านเลขที่แบบปิดบังบางส่วนสำหรับชุดเผยแพร่', ex: '1xx/x' }
    ]}
];

/* ---------- ตารางระบบ (System tables) ---------- */
const SYS_TABLES = [
  { s: 'app', t: 'user_account',        d: 'ผู้ใช้งานระบบ เชื่อมกับ OIDC subject ไม่เก็บรหัสผ่านแบบ plain text', rows: '~60' },
  { s: 'app', t: 'role',                d: 'กลุ่มสิทธิ์ 4 กลุ่ม: viewer / editor / both / admin', rows: '4' },
  { s: 'app', t: 'permission',          d: 'สิทธิ์ย่อยแยกตามการกระทำและทรัพยากร', rows: '~40' },
  { s: 'app', t: 'role_permission',     d: 'ตารางเชื่อมกลุ่มสิทธิ์กับสิทธิ์ย่อย', rows: '~90' },
  { s: 'app', t: 'user_role',           d: 'ตารางเชื่อมผู้ใช้กับกลุ่มสิทธิ์ (รองรับวันหมดอายุสิทธิ์)', rows: '~70' },
  { s: 'app', t: 'user_layer_scope',    d: 'ขอบเขตชั้นข้อมูลและพื้นที่ที่ผู้ใช้แต่ละคนเข้าถึงได้', rows: '~180' },
  { s: 'app', t: 'citizen_proposal',    d: 'ข้อเสนอ/ข้อร้องเรียนจากประชาชน พร้อมพิกัด (Point, 4326)', rows: '~1,200' },
  { s: 'app', t: 'attachment',          d: 'ไฟล์แนบ เก็บ metadata ในฐานข้อมูล ตัวไฟล์อยู่บน object storage', rows: '~8,400' },
  { s: 'app', t: 'survey_session',      d: 'รอบการสำรวจภาคสนาม ผู้สำรวจ อุปกรณ์ และความแม่นยำที่ใช้', rows: '~210' },
  { s: 'app', t: 'export_job',          d: 'งานส่งออกข้อมูลและสถานะ', rows: '~900' },
  { s: 'app', t: 'publication',         d: 'ชุดเผยแพร่แต่ละรุ่น พร้อมบัญชีไฟล์และรุ่นข้อมูล', rows: '~12' },
  { s: 'app', t: 'publication_profile', d: 'โปรไฟล์การเผยแพร่: ชั้นข้อมูล/ฟิลด์ที่ถูกตัดออก', rows: '3' },
  { s: 'qc',  t: 'qc_rule',             d: 'กฎการตรวจคุณภาพ พร้อมนิพจน์ SQL และระดับความรุนแรง', rows: '12' },
  { s: 'qc',  t: 'qc_run',              d: 'รอบการตรวจคุณภาพและสรุปผล', rows: '~190' },
  { s: 'qc',  t: 'qc_finding',          d: 'ข้อค้นพบรายรายการ พร้อมพิกัดและสถานะการแก้ไข', rows: '~3,100' },
  { s: 'audit',t: 'change_log',         d: 'บันทึกทุกการเปลี่ยนแปลงระดับแถว (trigger) เก็บค่าก่อน/หลังเป็น JSONB', rows: '~142,000' },
  { s: 'audit',t: 'access_log',         d: 'บันทึกการเข้าถึง การส่งออก และการเผยแพร่', rows: '~86,000' },
  { s: 'plan', t: 'kpi_indicator',      d: 'ตัวชี้วัดการติดตามแผนและข้อมูล', rows: '8' },
  { s: 'plan', t: 'kpi_value',          d: 'ค่าตัวชี้วัดแต่ละรอบ', rows: '~320' },
  { s: 'plan', t: 'project',            d: 'แผนงาน/โครงการที่อ้างอิงพื้นที่ในฐานข้อมูล GIS', rows: '~45' },
  { s: 'plan', t: 'project_feature',    d: 'ตารางเชื่อมโครงการกับรายการข้อมูลเชิงพื้นที่', rows: '~380' },
  { s: 'ref', t: 'layer_registry',      d: 'ทะเบียนชั้นข้อมูล 10 ชั้น พร้อม Metadata และสัญลักษณ์', rows: '10' },
  { s: 'ref', t: 'agency',              d: 'หน่วยงานเจ้าของ/ผู้บำรุงรักษา', rows: '8' },
  { s: 'ref', t: 'village',             d: 'หมู่บ้าน/เขตการปกครองย่อย', rows: '8' },
  { s: 'ref', t: 'code_domain',         d: 'ตารางค่าอ้างอิงรวม (domain) สำหรับทุกฟิลด์รหัส', rows: '~140' }
];

/* ---------- Metadata (ISO 19115) ---------- */
const META_FIELDS = [
  { k: 'ชื่อชุดข้อมูล (Title)',            v: 'ชั้นข้อมูลถนนในเขตพื้นที่รับผิดชอบ' },
  { k: 'รหัสชุดข้อมูล (Identifier)',       v: 'L01 · urn:geocore:layer:road:2026.10' },
  { k: 'บทคัดย่อ (Abstract)',             v: 'แนวเส้นถนนทุกสายในเขตพื้นที่ จำแนกชั้นทาง ผิวทาง สภาพ และหน่วยงานเจ้าของ/ผู้บำรุงรักษา พร้อมแหล่งอ้างอิงและสถานะการยืนยัน' },
  { k: 'วัตถุประสงค์ (Purpose)',          v: 'ใช้เพื่อการบริหารจัดการและวางแผนพัฒนาพื้นที่ ไม่ใช้แทนการรังวัดรับรองกรรมสิทธิ์ที่ดิน' },
  { k: 'ผู้รับผิดชอบข้อมูล (Custodian)',   v: 'กองช่าง — ฝ่ายโครงสร้างพื้นฐาน' },
  { k: 'ระบบพิกัด (Reference System)',     v: 'EPSG:4326 (WGS 84) · คำนวณระยะด้วย EPSG:32647' },
  { k: 'ความแม่นยำตำแหน่ง (Accuracy)',    v: '≤ 1.5 ม. (RTK GNSS) · เส้นที่ดิจิไทซ์จากภาพถ่าย ≤ 3.0 ม.' },
  { k: 'มาตราส่วนอ้างอิง (Scale)',        v: '1:4,000' },
  { k: 'ขอบเขตเชิงพื้นที่ (Extent)',       v: 'bbox 101.1842, 12.8014, 101.3127, 12.8906' },
  { k: 'ช่วงเวลาข้อมูล (Temporal)',        v: '2569-07-01 ถึง 2569-10-21' },
  { k: 'รอบการปรับปรุง (Maintenance)',     v: 'ทุก 6 เดือน หรือเมื่อมีการก่อสร้าง/ถ่ายโอนภารกิจ' },
  { k: 'ชั้นความลับ (Classification)',      v: 'Internal — ชุดเผยแพร่สาธารณะตัดฟิลด์ ownership_note และ source_ref' },
  { k: 'เงื่อนไขการใช้ (Use Constraints)',  v: 'เผยแพร่ภายใต้เงื่อนไขที่ผู้ว่าจ้างกำหนด · อ้างอิงแหล่งที่มาทุกครั้ง' },
  { k: 'รูปแบบการส่งมอบ (Distribution)',   v: 'GeoPackage · QGIS Project · GeoJSON · XLSX/CSV · PDF Map' },
  { k: 'รุ่นข้อมูล (Version)',             v: 'v2026.10 (ปรับปรุง 21 ต.ค. 2569)' },
  { k: 'สายข้อมูล (Lineage)',             v: 'สำรวจภาคสนาม RTK GNSS + ดิจิไทซ์จากภาพถ่ายทางอากาศ 2568 + ทะเบียนทรัพย์สินหน่วยงาน' }
];

/* ---------- ไอคอน (inline SVG paths, stroke-based 24x24) ---------- */
const ICONS = {
  home:     '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  map:      '<path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6l6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
  layers:   '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  chart:    '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
  table:    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
  pencil:   '<path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
  mobile:   '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  check:    '<path d="m4 12 5 5L20 6"/>',
  shield:   '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
  target:   '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/>',
  tag:      '<path d="M3 11V5a2 2 0 0 1 2-2h6l10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  users:    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M18 20c0-2.4-.9-4-2.5-4.6"/>',
  history:  '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  gauge:    '<path d="M12 14l4-4"/><path d="M4 19a9 9 0 1 1 16 0"/>',
  db:       '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  book:     '<path d="M4 4h7v16H4z"/><path d="M13 4h7v16h-7z"/>',
  plug:     '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0V8Z"/><path d="M12 17v5"/>',
  code:     '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/>',
  lock:     '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  pin:      '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  chat:     '<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12Z"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  search:   '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.5-4.5"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:     '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  info:     '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  warn:     '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
  x:        '<path d="M6 6l12 12M18 6 6 18"/>',
  save:     '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-6h8v6"/>',
  filter:   '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  zoomin:   '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-4.5-4.5"/>',
  ruler:    '<path d="M3 15 15 3l6 6L9 21l-6-6Z"/><path d="m7 11 2 2M11 7l2 2"/>',
  bell:     '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  upload:   '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
  file:     '<path d="M6 2h7l5 5v15H6z"/><path d="M13 2v5h5"/>',
  globe:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  palette:  '<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3-3.5 3H16a2 2 0 0 0-1 3.7c.4.9-.2 2.3-3 2.3Z"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/>'
};

/* width/height เป็น presentation attribute เพื่อให้กฎ CSS ที่เจาะจงกว่าเขียนทับได้
   ไอคอนที่ไม่มีกฎ CSS กำหนดขนาดจึงได้ขนาดเท่าตัวอักษรโดยอัตโนมัติ */
function icon(name, cls) {
  return `<svg viewBox="0 0 24 24" width="1.05em" height="1.05em" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"${cls ? ` class="${cls}"` : ''}
    style="flex:0 0 auto;vertical-align:-0.16em" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
}

/* ---------- โครงสร้างเมนู ---------- */
const NAV = [
  { label: 'ภาพรวม', items: [
    { href: 'index.html',           icon: 'home',   text: 'หน้าแรกของระบบ' },
    { href: 'dashboard.html',       icon: 'gauge',  text: 'แดชบอร์ดผู้บริหาร' }
  ]},
  { label: 'การใช้งานข้อมูล', items: [
    { href: 'map.html',             icon: 'map',    text: 'แผนที่และชั้นข้อมูล' },
    { href: 'layers.html',          icon: 'layers', text: 'ทะเบียนชั้นข้อมูล', tag: '10' },
    { href: 'attribute-table.html', icon: 'table',  text: 'ตารางข้อมูล' },
    { href: 'boundary.html',        icon: 'target', text: 'วิเคราะห์แนวเขต' }
  ]},
  { label: 'การบันทึกข้อมูล', items: [
    { href: 'data-entry.html',      icon: 'pencil', text: 'บันทึก/แก้ไขข้อมูล' },
    { href: 'mobile-survey.html',   icon: 'mobile', text: 'สำรวจภาคสนาม (มือถือ)' },
    { href: 'review.html',          icon: 'check',  text: 'คิวตรวจสอบและอนุมัติ', tag: '7' },
    { href: 'qc.html',              icon: 'shield', text: 'ตรวจคุณภาพข้อมูล' }
  ]},
  { label: 'ส่งมอบและกำกับดูแล', items: [
    { href: 'export.html',          icon: 'download', text: 'ส่งออกและเผยแพร่' },
    { href: 'metadata.html',        icon: 'tag',      text: 'Metadata ชุดข้อมูล' },
    { href: 'monitoring.html',      icon: 'chart',    text: 'ตัวชี้วัดและการติดตาม' },
    { href: 'users.html',           icon: 'users',    text: 'ผู้ใช้งานและสิทธิ์' },
    { href: 'audit-log.html',       icon: 'history',  text: 'บันทึกการใช้งาน' }
  ]},
  { label: 'เอกสารออกแบบระบบ', items: [
    { href: 'db-design.html',       icon: 'db',      text: 'การออกแบบฐานข้อมูล' },
    { href: 'data-dictionary.html', icon: 'book',    text: 'พจนานุกรมข้อมูล' },
    { href: 'api-list.html',        icon: 'plug',    text: 'รายการ API' },
    { href: 'api-spec.html',        icon: 'code',    text: 'ข้อกำหนด API (Spec)' },
    { href: 'design-system.html',   icon: 'palette', text: 'ระบบการออกแบบ' }
  ]}
];
