/* ============================================================
   GeoCore GIS — App shell
   สร้างแถบด้านบน เมนูข้าง ตัวสลับกลุ่มสิทธิ์ และธีมสว่าง/มืด
   ============================================================ */

/* ---------- theme ---------- */
const THEME_KEY = 'geocore.theme';
function setTheme(t) {
  if (t === 'auto') { document.documentElement.removeAttribute('data-theme'); localStorage.removeItem(THEME_KEY); }
  else { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); }
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    el.innerHTML = currentTheme() === 'dark' ? icon('sun') : icon('moon');
  });
}
function currentTheme() {
  const s = document.documentElement.getAttribute('data-theme');
  if (s) return s;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

/* ---------- role ---------- */
const ROLE_KEY = 'geocore.role';
function currentRole() { return localStorage.getItem(ROLE_KEY) || 'both'; }
function setRole(r) {
  localStorage.setItem(ROLE_KEY, r);
  document.body.setAttribute('data-role', r);
  paintRolePill();
  toast(`สลับเป็นกลุ่มสิทธิ์: ${ROLES[r].name}`, 'check');
  document.dispatchEvent(new CustomEvent('rolechange', { detail: r }));
}
function paintRolePill() {
  const r = ROLES[currentRole()];
  document.querySelectorAll('[data-role-pill]').forEach(el => {
    el.innerHTML = `<span class="sw" style="background:${r.color}"></span><span class="nowrap">${r.name}</span>`;
    el.setAttribute('title', `${r.en} — ${r.desc}`);
  });
  document.querySelectorAll('[data-role-avatar]').forEach(el => {
    el.textContent = r.name.slice(0, 2);
    el.style.background = r.color;
  });
}

/* ---------- toast ---------- */
function toast(msg, ic) {
  let wrap = document.querySelector('.toastwrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toastwrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon(ic || 'info')}<span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .25s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 260); }, 2400);
}

/* ---------- modal ---------- */
function modal(title, bodyHTML, footHTML) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
    <header><strong style="flex:1">${title}</strong>
      <button class="iconbtn" data-close aria-label="ปิด">${icon('x')}</button></header>
    <div class="body">${bodyHTML}</div>
    ${footHTML ? `<footer>${footHTML}</footer>` : ''}
  </div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  return { el: bg, close };
}

/* ---------- shell render ---------- */
function renderShell(activeHref) {
  const body = document.body;
  body.setAttribute('data-role', currentRole());

  /* topbar */
  const top = document.createElement('header');
  top.className = 'topbar';
  top.innerHTML = `
    <button class="iconbtn hamburger" data-nav-toggle aria-label="เปิดเมนู">${icon('menu')}</button>
    <a class="brand" href="index.html">
      <span class="mark">${icon('map')}</span>
      <span class="brand-txt">${APP.name}<small>Local Government GIS</small></span>
    </a>
    <div class="topbar-spacer"></div>
    <div class="globalsearch">
      ${icon('search')}
      <input type="search" placeholder="ค้นหารายการ ถนน พิกัด หรือรหัสข้อมูล…" aria-label="ค้นหาทั้งระบบ" data-gsearch>
    </div>
    <button class="pill-role" data-role-pill data-role-switch aria-label="สลับกลุ่มสิทธิ์"></button>
    <button class="iconbtn" data-theme-toggle aria-label="สลับธีมสว่าง/มืด"><span data-theme-icon></span></button>
    <button class="iconbtn" data-notif aria-label="การแจ้งเตือน">${icon('bell')}</button>
    <span class="avatar" data-role-avatar title="บัญชีผู้ใช้"></span>`;

  /* sidebar */
  const side = document.createElement('nav');
  side.className = 'sidebar';
  side.setAttribute('aria-label', 'เมนูหลัก');
  side.innerHTML = NAV.map(g => `
    <div class="nav-group">
      <div class="nav-label">${g.label}</div>
      ${g.items.map(i => `<a class="nav-item${i.href === activeHref ? ' active' : ''}" href="${i.href}">
        ${icon(i.icon)}<span>${i.text}</span>${i.tag ? `<span class="tag">${i.tag}</span>` : ''}</a>`).join('')}
    </div>`).join('') + `
    <div class="nav-group" style="padding:0 10px">
      <div class="xsmall muted" style="border-top:1px solid var(--line);padding-top:12px;line-height:1.5">
        ${APP.name} ${APP.version}<br>${APP.db}<br>
        <span style="color:var(--ink-3)">ข้อมูลตัวอย่างเพื่อการนำเสนอ</span>
      </div>
    </div>`;

  const shell = document.createElement('div');
  shell.className = 'shell';
  const content = document.querySelector('main.content') || document.createElement('main');
  content.className = 'content';

  body.insertBefore(top, body.firstChild);
  shell.appendChild(side);
  shell.appendChild(content);
  body.appendChild(shell);

  /* wiring */
  top.querySelector('[data-nav-toggle]').addEventListener('click', () => body.classList.toggle('nav-open'));
  body.addEventListener('click', e => {
    if (body.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('[data-nav-toggle]'))
      body.classList.remove('nav-open');
  });
  top.querySelector('[data-theme-toggle]').addEventListener('click', () =>
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
  top.querySelector('[data-role-switch]').addEventListener('click', openRoleSwitcher);
  top.querySelector('[data-notif]').addEventListener('click', () => modal('การแจ้งเตือน',
    `<ul class="tl">
      <li class="now"><div class="tt">ข้อค้นพบ QC ระดับวิกฤต 2 รายการ</div><div class="td">ชั้นข้อมูล L05 — ฟิลด์บังคับว่าง · 29 ต.ค. 2569 07:58</div></li>
      <li class="now"><div class="tt">รายการรอตรวจสอบ 7 รายการ</div><div class="td">มอบหมายให้ ปิยะนุช ส. · เกิน SLA 1 รายการ</div></li>
      <li class="done"><div class="tt">ชุดเผยแพร่ v2026.10 สร้างสำเร็จ</div><div class="td">ตัดชั้นข้อมูล L03 และฟิลด์อ่อนไหว 6 ฟิลด์ · 28 ต.ค. 2569</div></li>
      <li class="done"><div class="tt">สำรองข้อมูลรายวันสำเร็จ</div><div class="td">ขนาด 4.8 GB · เก็บไว้ 30 รุ่น · 29 ต.ค. 2569 02:00</div></li>
    </ul>`,
    `<button class="btn" data-close>ปิด</button>`));
  const gs = top.querySelector('[data-gsearch]');
  gs.addEventListener('keydown', e => {
    if (e.key === 'Enter' && gs.value.trim()) { toast(`ค้นหา “${gs.value.trim()}” — พบ 14 รายการใน 4 ชั้นข้อมูล`, 'search'); }
  });

  setTheme(localStorage.getItem(THEME_KEY) || 'auto');
  paintRolePill();
  return content;
}

function openRoleSwitcher() {
  const cur = currentRole();
  const cards = Object.values(ROLES).map(r => `
    <label class="check" style="border:1px solid ${r.code === cur ? 'var(--accent)' : 'var(--line)'};
      border-radius:var(--r-md);padding:11px 12px;margin-bottom:9px;align-items:flex-start;
      background:${r.code === cur ? 'var(--accent-wash)' : 'var(--surface-1)'}">
      <input type="radio" name="role" value="${r.code}" ${r.code === cur ? 'checked' : ''}>
      <span>
        <span style="display:flex;align-items:center;gap:7px;font-weight:650">
          <span style="width:8px;height:8px;border-radius:50%;background:${r.color}"></span>${r.name}
          <span class="xsmall muted">${r.en}</span></span>
        <span class="small dim" style="display:block;margin-top:3px">${r.desc}</span>
      </span></label>`).join('');
  const m = modal('สลับกลุ่มสิทธิ์ผู้ใช้งาน',
    `<p class="small dim mb16">หน้าจอตัวอย่างนี้เปลี่ยนสิทธิ์ได้ทันทีเพื่อแสดงความแตกต่างของแต่ละกลุ่ม
     ปุ่มและเมนูที่เกินสิทธิ์จะถูกซ่อนหรือปิดการใช้งาน</p>${cards}`,
    `<button class="btn" data-close>ยกเลิก</button><button class="btn btn-primary" data-apply>ใช้กลุ่มสิทธิ์นี้</button>`);
  m.el.querySelector('[data-apply]').addEventListener('click', () => {
    const v = m.el.querySelector('input[name=role]:checked').value;
    m.close(); setRole(v);
  });
}

/* ---------- small helpers ---------- */
function pageHead({ crumbs, title, badge, sub, actions }) {
  return `
  ${crumbs ? `<div class="crumbs">${crumbs.map((c, i) => i ? `<span>/</span>${c}` : c).join('')}</div>` : ''}
  <div class="page-head">
    <div class="t">
      <h1>${title}${badge ? ` ${badge}` : ''}</h1>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
    </div>
    ${actions ? `<div class="page-actions">${actions}</div>` : ''}
  </div>`;
}

function badge(text, kind) { return `<span class="badge${kind ? ' badge-' + kind : ''}">${text}</span>`; }
function fmt(n) { return n.toLocaleString('th-TH'); }

function symbolSwatch(l) {
  if (l.sym === 'line')  return `<span class="sym-ln" style="background:${l.color}"></span>`;
  if (l.sym === 'poly')  return `<span class="sym-pg" style="background:${l.color};border:1.5px solid ${l.color}"></span>`;
  if (l.sym === 'mixed') return `<span class="sym-pt" style="background:${l.color};border-radius:3px"></span>`;
  return `<span class="sym-pt" style="background:${l.color}"></span>`;
}

/* tabs */
function initTabs(root) {
  (root || document).querySelectorAll('[data-tabs]').forEach(tabsEl => {
    const btns = [...tabsEl.querySelectorAll('button')];
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-selected', String(x === b)));
      const scope = tabsEl.closest('[data-tabscope]') || document;
      scope.querySelectorAll('.tabpanel').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    }));
  });
}

/* donut chart (SVG) — segments: [{label, value, color}] */
function donut(segments, centerBig, centerSmall, size = 132) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 52, c = 2 * Math.PI * r, cx = 66, cy = 66;
  let off = 0;
  const arcs = segments.map(s => {
    const len = (s.value / total) * c;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}"
      stroke-width="15" stroke-dasharray="${Math.max(len - 2, 0)} ${c - Math.max(len - 2, 0)}"
      stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"></circle>`;
    off += len; return el;
  }).join('');
  return `<div class="donut" style="width:${size}px;height:${size}px;flex-basis:${size}px">
    <svg viewBox="0 0 132 132" width="100%" height="100%" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="15"></circle>
      ${arcs}</svg>
    <div class="ctr"><div><b>${centerBig}</b><span>${centerSmall}</span></div></div></div>`;
}

function legendRow(segments, totalFmt) {
  return `<div class="legend">${segments.map(s => `<span class="li">
    <span class="sw" style="background:${s.color}"></span>${s.label}
    <b class="num" style="font-weight:650">${totalFmt ? fmt(s.value) : s.value}</b></span>`).join('')}</div>`;
}

/* horizontal bars with direct value labels (relief rule) */
function barChart(rows, unit) {
  const max = Math.max(...rows.map(r => r.value)) || 1;
  return `<div class="bars">${rows.map(r => `<div class="b">
    <span class="lb" title="${r.label}">${r.label}</span>
    <span class="trk"><i class="fil" style="width:${(r.value / max * 100).toFixed(1)}%;background:${r.color || 'var(--s1)'};display:block;height:100%;border-radius:5px"></i></span>
    <span class="vl">${typeof r.value === 'number' ? fmt(r.value) : r.value}${unit || ''}</span>
  </div>`).join('')}</div>`;
}

/* sparkline / line chart with crosshair tooltip */
function lineChart(series, opts = {}) {
  const w = 640, h = opts.height || 190, pad = { t: 12, r: 14, b: 26, l: 38 };
  const xs = series[0].points.length;
  const allV = series.flatMap(s => s.points.map(p => p.v));
  const min = opts.min !== undefined ? opts.min : Math.min(...allV) * 0.94;
  const max = opts.max !== undefined ? opts.max : Math.max(...allV) * 1.04;
  const X = i => pad.l + i * (w - pad.l - pad.r) / Math.max(xs - 1, 1);
  const Y = v => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const grid = [0, .25, .5, .75, 1].map(f => {
    const v = min + f * (max - min);
    return `<line x1="${pad.l}" y1="${Y(v)}" x2="${w - pad.r}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/>
            <text x="${pad.l - 7}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${v.toFixed(0)}</text>`;
  }).join('');
  const paths = series.map(s => {
    const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const dots = s.points.map((p, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.2"
      fill="${s.color}" stroke="var(--surface-1)" stroke-width="2"><title>${p.t}: ${p.v}</title></circle>`).join('');
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  }).join('');
  const labels = series[0].points.map((p, i) =>
    (xs > 8 && i % 2) ? '' : `<text x="${X(i)}" y="${h - 7}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${p.t}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block;overflow:visible" role="img"
    aria-label="${opts.aria || 'กราฟเส้น'}">${grid}${labels}${paths}</svg>`;
}

/* table view toggle for a chart (accessibility) */
function tableToggle(id, tableHTML) {
  return `<details class="acc mt16"><summary>ดูเป็นตารางข้อมูล</summary>
    <div class="acc-body" style="padding:0"><div class="table-wrap">${tableHTML}</div></div></details>`;
}
