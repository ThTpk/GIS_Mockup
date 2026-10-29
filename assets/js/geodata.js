/* ============================================================
   GeoCore GIS — ข้อมูลเชิงพื้นที่ตัวอย่าง (สังเคราะห์)
   สร้างโครงข่ายถนนและทรัพย์สินสมมุติ ไม่อ้างอิงพื้นที่จริงของหน่วยงานใด
   ============================================================ */

const CENTER = [12.8520, 101.2460];

/* ตัวสุ่มแบบกำหนดค่าเริ่มต้นได้ เพื่อให้ผลลัพธ์คงที่ทุกครั้ง */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const R = rng(20691026);

const SURFACES = ['concrete', 'asphalt', 'laterite', 'paving_block'];
const SURFACE_TH = { concrete: 'คอนกรีตเสริมเหล็ก', asphalt: 'ลาดยางแอสฟัลต์', laterite: 'ลูกรัง', paving_block: 'บล็อกปูทาง' };
const AGENCY_PICK = ['อบต.', 'อบต.', 'อบต.', 'อบจ.', 'ทช.', 'ทล.', 'เอกชน', 'รอยืนยัน'];
const CLASS_TH = { highway: 'ทางหลวง', main: 'ถนนสายหลัก', secondary: 'ถนนสายรอง', soi: 'ซอย' };

/* ---------- ถนน: โครงข่ายกริดบิดเบี้ยวเล็กน้อย ---------- */
function buildRoads() {
  const feats = [];
  const n = 7, span = 0.052;
  let id = 100;
  for (let i = 0; i < n; i++) {              /* แนวตะวันออก–ตะวันตก */
    const lat = CENTER[0] - span / 2 + (i * span) / (n - 1);
    const pts = [];
    for (let j = 0; j <= 10; j++) {
      pts.push([lat + (R() - 0.5) * 0.0026, CENTER[1] - span / 2 + (j * span) / 10]);
    }
    feats.push(mkRoad(++id, pts, i === 3 ? 'highway' : i % 2 ? 'secondary' : 'main'));
  }
  for (let i = 0; i < n; i++) {              /* แนวเหนือ–ใต้ */
    const lng = CENTER[1] - span / 2 + (i * span) / (n - 1);
    const pts = [];
    for (let j = 0; j <= 10; j++) {
      pts.push([CENTER[0] - span / 2 + (j * span) / 10, lng + (R() - 0.5) * 0.0026]);
    }
    feats.push(mkRoad(++id, pts, i === 2 ? 'main' : 'secondary'));
  }
  for (let k = 0; k < 24; k++) {             /* ซอยสั้น */
    const lat = CENTER[0] - span / 2 + R() * span;
    const lng = CENTER[1] - span / 2 + R() * span;
    const d = 0.0032 + R() * 0.004;
    const pts = R() > .5 ? [[lat, lng], [lat, lng + d]] : [[lat, lng], [lat + d, lng]];
    feats.push(mkRoad(++id, pts, 'soi'));
  }
  return feats;
}
function mkRoad(id, pts, cls) {
  const surf = cls === 'highway' ? 'asphalt' : SURFACES[Math.floor(R() * SURFACES.length)];
  const owner = cls === 'highway' ? 'ทล.' : cls === 'main' ? (R() > .5 ? 'อบจ.' : 'ทช.') : AGENCY_PICK[Math.floor(R() * AGENCY_PICK.length)];
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dy = (pts[i][0] - pts[i - 1][0]) * 110574;
    const dx = (pts[i][1] - pts[i - 1][1]) * 108550;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return {
    type: 'Feature',
    properties: {
      layer: 'L01',
      code: 'RD-0' + id,
      name: cls === 'highway' ? 'ทางหลวงผ่านพื้นที่' : cls === 'main' ? 'ถนนสายหลักหมายเลข ' + (id - 100)
        : cls === 'secondary' ? 'ถนนสายรองหมายเลข ' + (id - 100) : 'ซอยชุมชน ' + (id - 100),
      road_class: cls, class_th: CLASS_TH[cls],
      surface: surf, surface_th: SURFACE_TH[surf],
      length_m: Math.round(len),
      width_m: cls === 'highway' ? 12 : cls === 'main' ? 6 : cls === 'secondary' ? 5 : 4,
      condition: ['ดี', 'ดี', 'พอใช้', 'ต้องซ่อม'][Math.floor(R() * 4)],
      owner, maintainer: owner === 'รอยืนยัน' ? 'รอยืนยัน' : (R() > .85 ? 'อบต.' : owner),
      confirm: owner === 'รอยืนยัน' ? 'pending' : (R() > .93 ? 'conflict' : 'confirmed'),
      surveyed_on: '2569-0' + (7 + Math.floor(R() * 3)) + '-' + String(1 + Math.floor(R() * 28)).padStart(2, '0'),
      source: R() > .5 ? 'สำรวจภาคสนาม (RTK GNSS)' : 'ดิจิไทซ์จากภาพถ่ายทางอากาศ 2568'
    },
    geometry: { type: 'LineString', coordinates: pts.map(p => [p[1], p[0]]) }
  };
}

/* ---------- จุดทรัพย์สินตามแนวถนน ---------- */
function pointsAlong(roads, layer, count, mk) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = roads[Math.floor(R() * roads.length)];
    const c = r.geometry.coordinates;
    const seg = Math.floor(R() * (c.length - 1));
    const t = R();
    const lng = c[seg][0] + (c[seg + 1][0] - c[seg][0]) * t + (R() - .5) * 0.00012;
    const lat = c[seg][1] + (c[seg + 1][1] - c[seg][1]) * t + (R() - .5) * 0.00012;
    out.push({
      type: 'Feature',
      properties: Object.assign({ layer, road: r.properties.code }, mk(i, r)),
      geometry: { type: 'Point', coordinates: [lng, lat] }
    });
  }
  return out;
}

function ring(lat, lng, w, h) {
  return [[[lng - w, lat - h], [lng + w, lat - h], [lng + w, lat + h], [lng - w, lat + h], [lng - w, lat - h]]];
}

const ROAD_FEATS = buildRoads();

const LIGHT_FEATS = pointsAlong(ROAD_FEATS, 'L02', 180, i => {
  const st = R();
  return {
    code: 'SL-00' + (400 + i),
    name: 'จุดไฟส่องสว่าง',
    light_type: ['โคมไฟ LED 100W', 'โคมไฟ LED 150W', 'โคมไฟโซลาร์เซลล์', 'โคมไฟ HPS 250W'][Math.floor(R() * 4)],
    pole: ['เสาคอนกรีต', 'เสาเหล็กชุบ', 'เสาไฟฟ้า', 'เสาสูงกิ่งคู่'][Math.floor(R() * 4)],
    status: st > .14 ? 'ใช้งานได้' : st > .06 ? 'รอซ่อม' : 'ชำรุด',
    owner: R() > .2 ? 'อบต.' : 'กฟภ.',
    surveyed_on: '2569-09-' + String(1 + Math.floor(R() * 28)).padStart(2, '0'),
    source: 'สำรวจภาคสนาม (GNSS)'
  };
});

const CCTV_FEATS = pointsAlong(ROAD_FEATS, 'L03', 38, i => ({
  code: 'CC-00' + (100 + i),
  name: 'กล้องโทรทัศน์วงจรปิด',
  camera_type: ['กล้องมุมคงที่ (Fixed)', 'กล้องหมุนส่าย (PTZ)', 'กล้องโดม (Dome)'][Math.floor(R() * 3)],
  status: R() > .12 ? 'ใช้งานได้' : 'ออฟไลน์',
  azimuth: Math.floor(R() * 360) + '°',
  range_m: (25 + Math.floor(R() * 40)) + ' ม.',
  owner: 'อบต.',
  sensitivity: 'ข้อมูลอ่อนไหว — ไม่อยู่ในชุดเผยแพร่',
  surveyed_on: '2569-10-' + String(1 + Math.floor(R() * 24)).padStart(2, '0'),
  source: 'ทะเบียนทรัพย์สิน + สำรวจภาคสนาม'
}));

const BRIDGE_FEATS = pointsAlong(ROAD_FEATS, 'L04', 14, i => ({
  code: 'BR-00' + (10 + i),
  name: 'สะพานข้ามคลอง ' + (i + 1),
  structure: ['คอนกรีตเสริมเหล็กแบบพื้น', 'คอนกรีตเสริมเหล็กแบบคาน', 'ท่อเหลี่ยม (Box Culvert)'][Math.floor(R() * 3)],
  span_m: (6 + Math.floor(R() * 24)) + ' ม.',
  width_m: (4 + Math.floor(R() * 5)) + ' ม.',
  condition: ['ดี', 'พอใช้', 'ต้องซ่อม'][Math.floor(R() * 3)],
  owner: R() > .4 ? 'อบต.' : 'ทช.',
  surveyed_on: '2569-08-' + String(1 + Math.floor(R() * 28)).padStart(2, '0'),
  source: 'สำรวจภาคสนาม'
}));

const WATER_FEATS = pointsAlong(ROAD_FEATS, 'L05', 26, i => ({
  code: 'WF-000' + (20 + i),
  name: ['ถังเก็บน้ำ', 'จุดจ่ายน้ำประปาหมู่บ้าน', 'บ่อบาดาล', 'โรงกรองน้ำ'][Math.floor(R() * 4)],
  facility_type: 'ระบบประปาหมู่บ้าน',
  capacity: (20 + Math.floor(R() * 180)) + ' ลบ.ม.',
  status: R() > .15 ? 'ใช้งานได้' : 'อยู่ระหว่างซ่อม',
  household: 40 + Math.floor(R() * 300),
  owner: R() > .3 ? 'อบต.' : 'กปภ.',
  surveyed_on: '2569-10-' + String(1 + Math.floor(R() * 24)).padStart(2, '0'),
  source: 'สำรวจ + ข้อมูลหน่วยงาน'
}));

const DRAIN_FEATS = pointsAlong(ROAD_FEATS, 'L06', 22, i => ({
  code: 'DI-000' + (80 + i),
  name: ['จุดน้ำท่วมซ้ำซาก', 'จุดน้ำเสียระบายลงคลอง', 'จุดอุดตันทางระบายน้ำ'][Math.floor(R() * 3)],
  issue_type: 'ปัญหาการระบายน้ำ',
  severity: ['ต่ำ', 'ปานกลาง', 'สูง', 'วิกฤต'][Math.floor(R() * 4)],
  frequency: ['ทุกครั้งที่ฝนตก', 'ตามฤดูกาล', 'เป็นครั้งคราว'][Math.floor(R() * 3)],
  household: 5 + Math.floor(R() * 60),
  owner: 'อบต.',
  surveyed_on: '2569-10-' + String(1 + Math.floor(R() * 24)).padStart(2, '0'),
  source: 'สำรวจ + แจ้งเหตุจากประชาชน'
}));

const PUBLIC_FEATS = [
  { n: 'สวนสาธารณะและลานกีฬาชุมชน', t: 'สวนสาธารณะ', a: 0.0030, b: 0.0022, dy: 0.012, dx: -0.013, use: 'ลานกีฬา ตลาดนัดวันเสาร์' },
  { n: 'ลานอเนกประสงค์หน้าที่ทำการ', t: 'ลานอเนกประสงค์', a: 0.0022, b: 0.0016, dy: -0.004, dx: 0.004, use: 'จัดกิจกรรมและประชาคม' },
  { n: 'พื้นที่สีเขียวริมคลอง',      t: 'พื้นที่สีเขียว', a: 0.0042, b: 0.0012, dy: -0.016, dx: -0.006, use: 'เส้นทางเดิน-ปั่นจักรยาน' },
  { n: 'ศูนย์การเรียนรู้ชุมชน',      t: 'ศูนย์การเรียนรู้', a: 0.0016, b: 0.0014, dy: 0.006, dx: 0.016, use: 'อบรมอาชีพและกิจกรรมผู้สูงอายุ' }
].map((p, i) => ({
  type: 'Feature',
  properties: {
    layer: 'L07', code: 'PS-00' + (10 + i), name: p.n, space_type: p.t, current_use: p.use,
    area_sqm: Math.round(p.a * 108550 * p.b * 110574 * 4),
    caretaker: 'คณะกรรมการหมู่บ้าน', all_age: R() > .4 ? 'มี' : 'ไม่มี',
    owner: 'อบต.', surveyed_on: '2569-09-18', source: 'สำรวจ + เวทีประชาคม'
  },
  geometry: { type: 'Polygon', coordinates: ring(CENTER[0] + p.dy, CENTER[1] + p.dx, p.a, p.b) }
}));

const BOUNDARY_FEATS = BOUNDARY.map((b, i) => {
  const pos = [[0.028, 0.004], [0.006, 0.030], [-0.028, -0.008], [0.002, -0.031]][i];
  const sz = [[0.009, 0.004], [0.005, 0.004], [0.004, 0.003], [0.006, 0.005]][i];
  return {
    type: 'Feature',
    properties: {
      layer: 'L08', code: b.code, name: 'พื้นที่คลาดเคลื่อน ' + b.side,
      discrepancy_type: b.type, area_rai: b.area, parcels: b.parcels, buildings: b.bld,
      resolution: b.status, note: b.note, owner: 'อบต.', surveyed_on: '2569-10-26',
      source: b.ref + ' เทียบกับ ' + b.actual
    },
    geometry: { type: 'Polygon', coordinates: ring(CENTER[0] + pos[0], CENTER[1] + pos[1], sz[0], sz[1]) }
  };
});

const STUDY_AREA = {
  type: 'Feature',
  properties: { layer: 'L08', code: 'AB-001', name: 'แนวเขตพื้นที่ศึกษา (อ้างอิง)' },
  geometry: { type: 'Polygon', coordinates: ring(CENTER[0], CENTER[1], 0.034, 0.030) }
};

const GEO = {
  L01: { fc: { type: 'FeatureCollection', features: ROAD_FEATS },    kind: 'line' },
  L02: { fc: { type: 'FeatureCollection', features: LIGHT_FEATS },   kind: 'point' },
  L03: { fc: { type: 'FeatureCollection', features: CCTV_FEATS },    kind: 'point' },
  L04: { fc: { type: 'FeatureCollection', features: BRIDGE_FEATS },  kind: 'point' },
  L05: { fc: { type: 'FeatureCollection', features: WATER_FEATS },   kind: 'point' },
  L06: { fc: { type: 'FeatureCollection', features: DRAIN_FEATS },   kind: 'point' },
  L07: { fc: { type: 'FeatureCollection', features: PUBLIC_FEATS },  kind: 'poly' },
  L08: { fc: { type: 'FeatureCollection', features: [STUDY_AREA, ...BOUNDARY_FEATS] }, kind: 'poly' }
};

/* ป้ายชื่อฟิลด์สำหรับหน้าต่างแสดงรายละเอียด */
const PROP_LABEL = {
  code: 'รหัสรายการ', name: 'ชื่อ', class_th: 'ชั้นทาง', surface_th: 'ผิวทาง',
  length_m: 'ความยาว (ม.)', width_m: 'ความกว้าง (ม.)', condition: 'สภาพ',
  owner: 'เจ้าของทรัพย์สิน', maintainer: 'ผู้บำรุงรักษา', road: 'ถนนที่ติดตั้ง',
  light_type: 'ประเภทอุปกรณ์', pole: 'ประเภทเสา', status: 'สถานะใช้งาน',
  camera_type: 'ประเภทกล้อง', azimuth: 'ทิศทางครอบคลุม', range_m: 'ระยะครอบคลุม',
  structure: 'ประเภทโครงสร้าง', span_m: 'ความยาวสะพาน', facility_type: 'ประเภทระบบ',
  capacity: 'ความจุ', household: 'ครัวเรือนที่เกี่ยวข้อง', issue_type: 'ประเภทปัญหา',
  severity: 'ระดับความรุนแรง', frequency: 'ความถี่', space_type: 'ประเภทพื้นที่',
  current_use: 'การใช้ประโยชน์', area_sqm: 'พื้นที่ (ตร.ม.)', caretaker: 'ผู้ดูแล',
  all_age: 'สิ่งอำนวยความสะดวกทุกช่วงวัย', discrepancy_type: 'ลักษณะความคลาดเคลื่อน',
  area_rai: 'พื้นที่ (ไร่)', parcels: 'แปลงที่ดินที่กระทบ', buildings: 'สิ่งปลูกสร้างที่กระทบ',
  resolution: 'สถานะการยุติ', note: 'บันทึก', surveyed_on: 'วันที่สำรวจ', source: 'แหล่งข้อมูล',
  sensitivity: 'ชั้นความลับ'
};
