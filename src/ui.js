/* ECB: OUTBREAK — interface */
(function () {
'use strict';
const E = ECB, MD = MAPDATA;
const SAVE_KEY = 'ecb_outbreak_save_v1', META_KEY = 'ecb_outbreak_meta_v1';
let S = null, sel = null, tab = 'brigade', pendingSitrep = null, toastT = null;
let view = { x:0, y:0, w:MD.W, h:MD.H };
const titleOpts = { cmd:'mech', diff:'recruit', seed:'' };
const $ = (q, el) => (el || document).querySelector(q);
const $$ = (q, el) => [...(el || document).querySelectorAll(q)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const NS = 'http://www.w3.org/2000/svg';
function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function get(k) { try { const t = localStorage.getItem(k); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }
function meta() { return Object.assign({ runs:0, wins:0, best:0, maxWeeks:0 }, get(META_KEY) || {}); }

const SHORT = { CAN:'Canada', USW:'US West', USE:'US East', MEX:'Central America', CAR:'Caribbean', SAN:'Andes', BRA:'Brazil', SCO:'S. Cone', WEU:'W. Europe', CEU:'C. Europe', SEU:'Med.', NOR:'Nordic', EEU:'E. Europe', RUS:'Russia', SIB:'Siberia', MDE:'Mid. East', NAF:'N. Africa', WAF:'W. Africa', CAF:'C. Africa', EAF:'E. Africa', SAF:'S. Africa', CAS:'C. Asia', SAS:'S. Asia', CHN:'China', EAS:'Japan/Korea/Taiwan', SEA:'SE Asia', IDN:'Indonesia', AUS:'Australia' };
const LOFF = { CEU:[-5,0], EEU:[6,0], SEU:[2,2], WEU:[-3,0], CAR:[6,2], NOR:[-4,0] };
const ICON = {
  COMBAT:'<path d="M2 10l6-6 6 6M2 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2"/>',
  FIRES:'<circle cx="8" cy="8" r="3" fill="currentColor"/><path d="M8 0v3M8 13v3M0 8h3M13 8h3M2.3 2.3l2.1 2.1M11.6 11.6l2.1 2.1M2.3 13.7l2.1-2.1M11.6 4.4l2.1-2.1" stroke="currentColor" stroke-width="1.6"/>',
  AIR:'<path d="M0 4h16M8 4v3M4 7h8l-1.5 5h-5z M6 12l-2 3M10 12l2 3" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  INTEL:'<path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="2.2" fill="currentColor"/>',
  RESEARCH:'<path d="M5.5 1h5M7 1v5L2.5 14.5h11L9 6V1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 11h7l1.5 3h-10z" fill="currentColor"/>',
  MEDICAL:'<path d="M6 1.5h4v4.5h4.5v4H10v4.5H6V10H1.5V6H6z" fill="currentColor"/>',
  LOGISTICS:'<path d="M1.5 4.5L8 1.5l6.5 3v7L8 14.5l-6.5-3z M1.5 4.5L8 7.5l6.5-3 M8 7.5v7" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  CIVIL:'<path d="M1.5 8L8 1.5 14.5 8v6.5h-13z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 14.5v-4h4v4" fill="currentColor"/>',
  CURE:'<path d="M8 1.2C8 1.2 3 7 3 10.2a5 5 0 0 0 10 0C13 7 8 1.2 8 1.2z" fill="currentColor"/><path d="M6.4 10.4h3.2M8 8.8v3.2" stroke="#05080a" stroke-width="1.3"/>',
  COMMAND:'<path d="M8 1l2.1 4.7 5 .4-3.8 3.3 1.2 5L8 11.8 3.5 14.4l1.2-5L.9 6.1l5-.4z" fill="currentColor"/>',
};
const KIND_COLOR = { COMBAT:'var(--t-combat)', FIRES:'var(--t-fires)', AIR:'var(--t-air)', INTEL:'var(--t-intel)', RESEARCH:'var(--t-research)', MEDICAL:'var(--t-medical)', LOGISTICS:'var(--t-logistics)', CIVIL:'var(--t-civil)', COMMAND:'var(--t-command)', CURE:'var(--t-cure)' };

// ------------------------------------------------------------- formatting
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function dateOf(turn) { const d = new Date(Date.UTC(2027, 3, 12) + (turn - 1) * 7 * 864e5); return `${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }
function fmtPop(m) { if (m >= 1000) return (m / 1000).toFixed(2) + 'B'; if (m >= 10) return Math.round(m) + 'M'; if (m >= 1) return m.toFixed(1) + 'M'; if (m >= .001) return Math.round(m * 1000) + 'K'; return m > 0 ? '<1K' : '0'; }
function fmtPct(f) { if (f <= 0) return '0%'; if (f < .001) return '<0.1%'; if (f < .1) return (f * 100).toFixed(1) + '%'; return Math.round(f * 100) + '%'; }
const lerp = (a, b, t) => a + (b - a) * t;
function hex2rgb(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
const STOPS = [[0,'#7d7536'],[.3,'#c98a2c'],[.6,'#d4472f'],[1,'#8e1b1f']];
function infColor(z) {
  const t = Math.max(0, Math.min(1, Math.log10(z / .0002) / Math.log10(.5 / .0002)));
  for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) { const [t0, c0] = STOPS[i-1], [t1, c1] = STOPS[i]; const u = (t - t0) / (t1 - t0); const a = hex2rgb(c0), b = hex2rgb(c1); return `rgb(${Math.round(lerp(a[0],b[0],u))},${Math.round(lerp(a[1],b[1],u))},${Math.round(lerp(a[2],b[2],u))})`; }
  return STOPS[STOPS.length-1][1];
}
const RESTORED = '#3f9a68';
function mix(a, b, t) { const x = hex2rgb(a), y = hex2rgb(b); return `rgb(${Math.round(lerp(x[0],y[0],t))},${Math.round(lerp(x[1],y[1],t))},${Math.round(lerp(x[2],y[2],t))})`; }
function regionFill(rs) {
  if (rs.restored) return RESTORED;
  if (rs.fallen) return '#3a1012';
  if (rs.z <= 0) return rs.vax > 0 ? mix(rs.h < .999 ? '#34463c' : '#2b3d3a', '#2f7352', Math.min(1, rs.vax * 1.2)) : rs.h < .999 ? '#34463c' : '#2b3d3a';
  return infColor(rs.z);
}

// ------------------------------------------------------------- toast
function toast(msg, err) {
  const box = $('#toast'); if (!box) return;
  const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg; box.appendChild(d);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => d.remove(), 3600);
}

// ------------------------------------------------------------- modal
function openModal(html, cls, onKey) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="dlg ${cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  m._key = onKey; const f = m.querySelector('button:not([disabled])'); if (f) setTimeout(() => f.focus({ preventScroll:true }), 30);
  TUT.sync();
  return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); TUT.sync(); }

// ------------------------------------------------------------- map
let mapBuilt = false;
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function buildMap() {
  const svg = $('#map'); svg.setAttribute('viewBox', `0 0 ${MD.W} ${MD.H}`); svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id:'hatch', width:4, height:4, patternUnits:'userSpaceOnUse', patternTransform:'rotate(45)' }, defs);
  el('line', { x1:0, y1:0, x2:0, y2:4, stroke:'#ff5a4a', 'stroke-width':1.1, opacity:.55 }, pat);
  const glow = el('radialGradient', { id:'glow' }, defs); el('stop', { offset:'0', 'stop-color':'#5cb6d4', 'stop-opacity':'.55' }, glow); el('stop', { offset:'1', 'stop-color':'#5cb6d4', 'stop-opacity':'0' }, glow);
  el('path', { d:MD.outline, fill:'#0f1a1e', stroke:'#1d2c31', 'stroke-width':.8 }, svg);
  el('path', { d:MD.grat, fill:'none', stroke:'#172429', 'stroke-width':.4 }, svg);
  const gR = el('g', { id:'g-reg' }, svg), gH = el('g', { id:'g-hatch' }, svg);
  el('g', { id:'g-sel', 'pointer-events':'none' }, svg);
  el('g', { id:'g-route' }, svg); el('g', { id:'g-arcs' }, svg); el('g', { id:'g-lbl' }, svg); el('g', { id:'g-mk' }, svg); el('g', { id:'g-brig' }, svg);
  for (const r of E.REGIONS) {
    const p = el('path', { d:MD.regions[r.id].d, class:'rg', 'data-id':r.id, tabindex:'-1' }, gR);
    const t = el('title', {}, p); t.textContent = r.name;
    p.addEventListener('click', ev => { if (dragMoved) return; selectRegion(r.id); });
    el('path', { d:MD.regions[r.id].d, class:'hatch', fill:'url(#hatch)', 'data-id':r.id, opacity:0 }, gH);
  }
  const gL = $('#g-lbl');
  for (const r of E.REGIONS) {
    const o = LOFF[r.id] || [0,0]; const x = r.a[0] + o[0], y = r.a[1] + o[1];
    const g = el('g', { 'data-id':r.id }, gL);
    const t1 = el('text', { x, y, 'text-anchor':'middle', class:'rlabel' }, g); t1.textContent = SHORT[r.id];
    const t2 = el('text', { x, y:y + 7.5, 'text-anchor':'middle', class:'rpct' }, g); t2.textContent = '';
  }
  setupPanZoom(svg);
  mapBuilt = true;
}
function anchor(id) { return E.RD[id].a; }
function renderMap() {
  if (!mapBuilt) buildMap();
  const svg = $('#map');
  const compact = svg.getBoundingClientRect().width < 640 && view.w > 600;
  for (const p of $$('#g-reg .rg')) {
    const id = p.dataset.id, rs = S.regions[id];
    p.setAttribute('fill', regionFill(rs));
    p.classList.toggle('sel', id === sel); p.classList.toggle('theater', id === S.b.loc && id !== sel);
    p.querySelector('title').textContent = `${E.RD[id].name} — ${E.status(rs)}, ${fmtPct(rs.z)} infected${rs.stab > 0 ? ', stabilized' : ''}`;
  }
  for (const h of $$('#g-hatch .hatch')) h.setAttribute('opacity', S.regions[h.dataset.id].fallen ? 1 : 0);
  // selection + theater outlines on their own layer so neighboring land never covers them
  const gS = $('#g-sel'); gS.innerHTML = '';
  if (S.b.loc !== sel) el('path', { d:MD.regions[S.b.loc].d, class:'selhl th' }, gS);
  if (sel) el('path', { d:MD.regions[sel].d, class:'selhl' }, gS);
  for (const g of $$('#g-lbl g')) {
    const id = g.dataset.id, rs = S.regions[id];
    const show = !compact || id === sel || id === S.b.loc;
    g.style.display = show ? '' : 'none';
    const [t1, t2] = g.children; const k = compact ? 2.3 : 1;
    t1.setAttribute('font-size', 6.6 * k); t2.setAttribute('font-size', 6.2 * k);
    t2.setAttribute('y', +t1.getAttribute('y') + 7.5 * k);
    t2.textContent = rs.restored ? '✓ RESTORED' : rs.fallen ? 'FALLEN' : rs.z > 0 ? fmtPct(rs.z) : S.phase === 'restore' ? `${Math.round((rs.vax || 0) * 100)}% covered` : '';
    t2.setAttribute('class', 'rpct' + (rs.restored ? ' ok' : rs.z > 0 || rs.fallen ? '' : ' zero'));
  }
  // markers: labs + safe zones
  const gM = $('#g-mk'); gM.innerHTML = '';
  for (const l of S.labs) {
    const [x, y] = anchor(l.region); const o = LOFF[l.region] || [0,0]; const lg = $(`#g-lbl g[data-id="${l.region}"]`); let hw = 14; try { hw = lg.children[0].getComputedTextLength() / 2; } catch (e) {} const lk = (lg && lg.children[0].getAttribute('font-size') / 6.6) || 1; const lx = x + o[0] + hw + 5 * lk, ly = y + o[1] - 2.2 * lk;
    const g = el('g', { class:'lab', transform:`translate(${lx},${ly}) scale(${lk})` }, gM);
    el('polygon', { points:'0,-4 3.5,-2 3.5,2 0,4 -3.5,2 -3.5,-2', fill: l.active ? '#5fc4a8' : '#3b4744', stroke:'#0b1214', 'stroke-width':.8 }, g);
    if (l.active) el('circle', { r:1.2, fill:'#0b1214' }, g); else el('path', { d:'M-2.2 -2.2L2.2 2.2M2.2 -2.2L-2.2 2.2', stroke:'#ff6a5e', 'stroke-width':1 }, g);
    const t = el('title', {}, g); t.textContent = l.name + (l.active ? '' : ' (lost)');
  }
  for (const r of E.REGIONS) {
    const rs = S.regions[r.id]; if (!(rs.stab > 0) || rs.fallen) continue;
    const [x, y] = r.a; const o = LOFF[r.id] || [0,0]; const lg = $(`#g-lbl g[data-id="${r.id}"]`); let hw = 14; try { hw = lg.children[0].getComputedTextLength() / 2; } catch (e) {}
    const lk = (lg && lg.children[0].getAttribute('font-size') / 6.6) || 1; const hasLab = S.labs.some(l => l.region === r.id);
    const g5 = el('g', { class:'stabmk', transform:`translate(${x + o[0] + hw + (hasLab ? 13 : 5) * lk},${y + o[1] - 2.2 * lk}) scale(${lk})` }, gM);
    el('path', { d:'M0 -3.6 L3 -2.4 L3 .4 Q3 2.6 0 3.8 Q-3 2.6 -3 .4 L-3 -2.4 Z', fill:'#a9c9ff', stroke:'#0b1214', 'stroke-width':.8 }, g5); el('path', { d:'M-1.4 .1 L-.3 1.3 L1.6 -1.2', fill:'none', stroke:'#0b1214', 'stroke-width':.8 }, g5);
    const t5 = el('title', {}, g5); t5.textContent = `${r.name}: stabilized` + (E.presentIn(S, r.id) ? '' : `, ${rs.stab} weeks left`);
  }
  const lblBox = id => { const g = $(`#g-lbl g[data-id="${id}"]`); let hw = 14, hw2 = 0; const lk = (g && g.children[0].getAttribute('font-size') / 6.6) || 1;
    try { hw = g.children[0].getComputedTextLength() / 2; hw2 = g.children[1].textContent ? g.children[1].getComputedTextLength() / 2 : 0; } catch (e) {} return { hw, hw2, lk, shown:!g || g.style.display !== 'none' }; };
  for (const r of E.REGIONS) {
    const sz = S.regions[r.id].sz; if (!sz) continue; const [x, y] = r.a; const o = LOFF[r.id] || [0,0]; const L = lblBox(r.id);
    const g3 = el('g', { class:'szmk', transform:`translate(${x + o[0] - L.hw - 2 * L.lk},${y + o[1] - 2.3 * L.lk}) scale(${L.lk})` }, gM);
    for (let i = 0; i < sz; i++) el('rect', { x:-3.6 - i * 4.2, y:-1.6, width:3.2, height:3.2, rx:.6, fill:'#7fc28c', stroke:'#0b1214', 'stroke-width':.5 }, g3);
    const t3 = el('title', {}, g3); t3.textContent = `Safe zones: ${sz}/3`;
  }
  for (const r of E.REGIONS) {
    const wk = E.worksIn(S, r.id); if (!wk.length) continue; const [x, y] = r.a; const o = LOFF[r.id] || [0,0]; const L = lblBox(r.id);
    const g4 = el('g', { class:'works', transform:`translate(${x + o[0] - Math.max(L.hw2, 6 * L.lk) - 5.5 * L.lk},${y + o[1] + 4.4 * L.lk}) scale(${L.lk})` }, gM);
    wk.forEach((k, i) => el('rect', { x:-i * 4.2, y:0, width:3.2, height:3.2, transform:`rotate(45 ${-i * 4.2 + 1.6} 1.6)`, fill:'#f0a53a', stroke:'#0b1214', 'stroke-width':.5 }, g4));
    const t4 = el('title', {}, g4); t4.textContent = 'Field works: ' + wk.map(k => E.WORKS[k].name).join(', ');
  }
  // spread arcs from last report
  const gA = $('#g-arcs'); gA.innerHTML = '';
  const sp = (S.lastReport && S.lastReport.turn === S.turn - 1) ? S.lastReport.spread : [];
  for (const [a, b] of sp) {
    const [x1, y1] = anchor(a), [x2, y2] = anchor(b); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const dx = x2 - x1, dy = y2 - y1; const len = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / len * len * .25, cy = my + dx / len * len * .25 - 6;
    el('path', { d:`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, class:'arc anim' }, gA);
    el('circle', { cx:x2, cy:y2, r:2.2, fill:'#e2483b' }, gA);
  }
  // route preview
  const gRt = $('#g-route'); gRt.innerHTML = '';
  if (sel && sel !== S.b.loc) { const [x1, y1] = anchor(S.b.loc), [x2, y2] = anchor(sel); el('path', { d:`M${x1},${y1 - 12} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 30} ${x2},${y2 - 6}`, class:'route' }, gRt); }
  // brigade
  const gB = $('#g-brig'); gB.innerHTML = '';
  const [bx, by] = anchor(S.b.loc); const k = compact ? 2 : 1;
  const g = el('g', { class:'brig', transform:`translate(${bx},${by - 13 * k}) scale(${k})` }, gB);
  el('circle', { r:11, fill:'url(#glow)', class:'pulse' }, g);
  el('rect', { x:-9, y:-6, width:18, height:12, fill:'#5cb6d4', stroke:'#06222c', 'stroke-width':1.2, rx:.8 }, g);
  el('path', { d:'M-9 -6L9 6M9 -6L-9 6', stroke:'#06222c', 'stroke-width':1 }, g);
  el('ellipse', { rx:5.2, ry:2.6, fill:'none', stroke:'#06222c', 'stroke-width':1 }, g);
  el('path', { d:'M-2 -11.5L2 -7.5M2 -11.5L-2 -7.5', stroke:'#5cb6d4', 'stroke-width':1.3 }, g);
  const bt = el('title', {}, g); bt.textContent = 'Expeditionary Combat Brigade';
  if (S.b.tf) {
    const [tx, ty] = anchor(S.b.tf.loc);
    const g2 = el('g', { class:'tfmk', transform:`translate(${tx + 2},${ty - 12 * k}) scale(${k * .75})` }, gB);
    el('rect', { x:-8, y:-5.5, width:16, height:11, fill:'#0b1214', stroke:'#8fd3ea', 'stroke-width':1.4, rx:.8 }, g2);
    el('path', { d:'M-8 -5.5L8 5.5M8 -5.5L-8 5.5', stroke:'#8fd3ea', 'stroke-width':1 }, g2);
    el('path', { d:'M-2.2 -10.5V-7.2M2.2 -10.5V-7.2', stroke:'#8fd3ea', 'stroke-width':1.3 }, g2);
    const t2 = el('title', {}, g2); t2.textContent = `Task Force: ${E.UNITS[S.b.tf.bn].name}`;
  }
  for (const [cid, cn] of Object.entries(E.CHOKE)) {
    const lg = $(`#g-lbl g[data-id="${cid}"]`); if (!lg || lg.style.display === 'none') continue;
    const [cx, cy] = anchor(cid); const o = LOFF[cid] || [0,0]; let hw = 14; try { hw = lg.children[0].getComputedTextLength() / 2; } catch (e) {}
    const lk = (+lg.children[0].getAttribute('font-size') / 6.6) || 1; const lost = S.regions[cid].fallen;
    const g3 = el('g', { transform:`translate(${cx + o[0] - hw - 5 * lk},${cy + o[1] - 2.2 * lk}) scale(${lk})`, class:'choke' }, gM);
    el('circle', { r:3.4, fill:'#0b1214', stroke: lost ? '#ff6a5e' : '#f0a53a', 'stroke-width':.8 }, g3);
    el('path', { d:'M0 -2.2V2M-1.6 .6Q0 2.6 1.6 .6M-1.2 -1H1.2', stroke: lost ? '#ff6a5e' : '#f0a53a', 'stroke-width':.6, fill:'none' }, g3);
    const t3 = el('title', {}, g3); t3.textContent = `${cn}${lost ? ' (lost)' : ''}`;
  }
  svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
}
let dragMoved = false;
function setupPanZoom(svg) {
  let drag = null;
  svg.addEventListener('pointerdown', e => { drag = { x:e.clientX, y:e.clientY, vx:view.x, vy:view.y }; dragMoved = false; });
  window.addEventListener('pointermove', e => {
    if (!drag) return; const r = svg.getBoundingClientRect(); const sx = view.w / r.width;
    const dx = (e.clientX - drag.x) * sx, dy = (e.clientY - drag.y) * sx;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 5) dragMoved = true;
    if (dragMoved && view.w < MD.W) { view.x = clampV(drag.vx - dx, MD.W - view.w); view.y = clampV(drag.vy - dy, MD.H - view.h); svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`); }
  });
  window.addEventListener('pointerup', () => { if (drag && dragMoved) requestAnimationFrame(placeRegionCard); drag = null; setTimeout(() => dragMoved = false, 0); });
  svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height; zoom(e.deltaY < 0 ? .8 : 1.25, fx, fy); }, { passive:false });
}
const clampV = (v, max) => Math.max(0, Math.min(Math.max(0, max), v));
function zoom(f, fx = .5, fy = .5) {
  const nw = Math.max(MD.W / 5, Math.min(MD.W, view.w * f)), nh = nw * MD.H / MD.W;
  view.x = clampV(view.x + (view.w - nw) * fx, MD.W - nw); view.y = clampV(view.y + (view.h - nh) * fy, MD.H - nh); view.w = nw; view.h = nh;
  renderMap(); requestAnimationFrame(placeRegionCard);
}
function zoomTo(id) { const [x, y] = anchor(id); const nw = MD.W / 2.5, nh = nw * MD.H / MD.W; view = { x:clampV(x - nw / 2, MD.W - nw), y:clampV(y - nh / 2, MD.H - nh), w:nw, h:nh }; renderMap(); }

// ------------------------------------------------------------- shell
function shell() {
  $('#root').innerHTML = `
  <div id="app">
    <header class="hdr">
      <div class="brand"><span class="logo">ECB</span><span class="sub">OUTBREAK</span></div>
      <div class="week"><span class="lbl" id="h-season">Week</span><span class="w mono" id="h-week"></span></div>
      <div class="stats" id="h-stats"></div>
      <div class="cure" id="h-cure"></div>
      <button class="hbtn snd" id="b-snd" aria-label="Sound on or off"></button><button class="hbtn" id="b-menu" aria-label="Menu">Menu</button>
    </header>
    <div class="main">
      <div class="mapcol">
        <div class="mapwrap">
          <svg id="map" role="img" aria-label="World map of the outbreak"></svg>
          <div class="ov ov-legend" id="legend"></div>
          <div class="ov ov-zoom"><button id="z-in" aria-label="Zoom in">+</button><button id="z-out" aria-label="Zoom out">−</button><button id="z-reset" aria-label="Reset zoom">ALL</button></div>
        </div>
        <div class="ov ov-dir" id="dir"></div>
        <div class="ov ov-region" id="reg"></div>
      </div>
      <aside class="side">
        <div class="tabs" role="tablist">
          <button role="tab" data-tab="brigade">Brigade</button><button role="tab" data-tab="regions">Regions</button><button role="tab" data-tab="threat">Threat</button><button role="tab" data-tab="log">Log</button>
        </div>
        <div class="tabbody" id="tabbody"></div>
      </aside>
    </div>
    <footer class="handbar">
      <div class="cpbox"><span class="lbl">Command points</span><div class="pips" id="pips"></div><div class="deckinfo" id="deckinfo"></div><div class="wk" id="wk"></div></div>
      <div class="hand" id="hand" aria-label="Your orders"></div>
      <div class="endbox"><button class="btn endbtn" id="b-end">END WEEK</button><div class="endhint" id="endhint"></div></div>
    </footer>
  </div>
  <div id="toast" aria-live="polite"></div>`;
  mapBuilt = false;
  $('#b-end').onclick = doEndTurn;
  $('#b-menu').onclick = showMenu; sndBtn(); $('#b-snd').onclick = () => { SFX.setMuted(!SFX.isMuted()); sndBtn(); if (!SFX.isMuted()) SFX.play('click'); };
  $('#z-in').onclick = () => zoom(.7); $('#z-out').onclick = () => zoom(1.4); $('#z-reset').onclick = () => { view = { x:0, y:0, w:MD.W, h:MD.H }; renderMap(); requestAnimationFrame(placeRegionCard); };
  for (const b of $$('.tabs button')) b.onclick = () => { tab = b.dataset.tab; renderSide(); };
  renderLegend();
}
function renderLegend() {
  const L = $('#legend'); if (!L) return; const ph = S && S.phase === 'restore' ? 'r' : 'o'; if (L.dataset.ph === ph) return; L.dataset.ph = ph;
  L.innerHTML = (ph === 'r' ? `<span><i class="sw" style="background:${RESTORED}"></i>Restored</span>` : '') + [['#2b3d3a','Clear'],[infColor(.0004),'<0.1%'],[infColor(.01),'1%'],[infColor(.06),'6%'],[infColor(.3),'30%+'],['#3a1012','Fallen']].map(([c, t]) => `<span><i class="sw" style="background:${c}"></i>${t}</span>`).join('') + '<span><i class="sw" style="background:#5fc4a8;border-radius:50%"></i>Lab</span><span><i class="sw" style="background:#7fc28c"></i>Safe zone</span><span><i class="sw sh"></i>Stable</span>';
}

function render() {
  if (!S || !$('#app')) return;
  renderHeader(); renderLegend(); renderMap(); renderDirective(); renderRegion(); renderSide(); renderHand(); TUT.sync();
}
function renderHeader() {
  $('#h-week').textContent = String(S.turn).padStart(2, '0') + ' · ' + dateOf(S.turn);
  const sn = E.seasonOf('N', E.monthOf(S.turn)); $('#h-season').textContent = `${S.camp ? `Op ${S.camp.op}/${S.camp.len} · ` : ''}Week · ${sn} in the north`;
  const sv = E.survivors(S), z = E.infected(S), d = E.dead(S), prev = S.history[S.history.length - 2];
  const dS = prev ? sv - prev.h : 0;
  $('#h-stats').innerHTML = `
    <div class="stat"><span class="lbl">Survivors</span><span class="v mono">${fmtPop(sv)}${dS < -0.5 ? ` <small style="color:var(--hostile);font-size:11px">▼${fmtPop(-dS)}</small>` : ''}</span></div>
    <div class="stat"><span class="lbl">Infected</span><span class="v mono bad">${fmtPop(z)}</span></div>
    <div class="stat"><span class="lbl">Dead</span><span class="v mono">${fmtPop(d)}</span></div>
    <div class="stat"><span class="lbl">Fallen</span><span class="v mono ${E.fallenCount(S) ? 'bad' : ''}">${E.fallenCount(S)}/${E.REGIONS.length}</span></div>
    <div class="stat"><span class="lbl">Labs</span><span class="v mono">${E.activeLabs(S).length}/${S.labs.length}</span></div>`;
  const r = Math.min(100, S.research);
  if (S.phase === 'restore') {
    const n = E.restoredCount(S), N = E.REGIONS.length, left = S.restoreEnd - S.turn + 1;
    $('#h-cure').innerHTML = `<div class="row"><span class="lbl" style="color:var(--t-cure)">Restored · ${left > 1 ? left + ' wks left' : 'final week'}</span><span class="mono" style="color:var(--t-cure)">${n}/${N}</span></div><div class="bar" title="Average cure coverage ${Math.round(E.avgVax(S) * 100)}%"><i style="width:${n / N * 100}%;background:linear-gradient(90deg,#2f7352,var(--t-cure))"></i></div>`;
  } else $('#h-cure').innerHTML = `<div class="row"><span class="lbl">Cure research</span><span class="mono">${r.toFixed(1)}%</span></div><div class="bar"><i style="width:${r}%"></i></div>`;
}
function renderDirective() {
  const d = S.directive, box = $('#dir');
  if (!d) { box.innerHTML = `<span class="lbl">HQ directive</span><div class="note" style="margin-top:3px">${S.turn < S.nextDirective ? `New orders from higher command in week ${S.nextDirective}.` : 'Awaiting orders.'}</div>`; return; }
  const left = d.deadline - S.turn;
  box.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px"><span class="lbl">HQ directive</span><span class="dl">${left <= 0 ? 'DUE THIS WEEK' : left + (left === 1 ? ' WEEK' : ' WEEKS') + ' LEFT'}</span></div><div class="t">${esc(d.text)}</div><div class="rw">Reward: ${esc(d.reward)} + a new card</div>`;
}
// the region box can shrink to its title bar, and it moves to whichever bottom corner hides less of the map
let regMin = (() => { try { return localStorage.getItem('ecb_regmin') === '1'; } catch (e) { return false; } })(), regSide = 'right';
function setRegMin(v) { regMin = !!v; try { localStorage.setItem('ecb_regmin', regMin ? '1' : '0'); } catch (e) {} }
function regToggle(mini) { return `<button class="reg-tog" id="b-regmin" aria-expanded="${!mini}" aria-label="${mini ? 'Show region details' : 'Shrink the region box'}" title="${mini ? 'Show details' : 'Shrink'}">${mini ? '▴' : '▾'}</button>`; }
function placeRegionCard() {
  const card = $('#reg'), col = $('.mapcol'), svg = $('#map'); if (!card || !col || !svg || !S) return;
  if (window.innerWidth <= 820) { col.classList.remove('reg-left'); card.style.maxHeight = ''; return; }
  const cr = card.getBoundingClientRect(), mr = col.getBoundingClientRect(); const ctm = svg.getScreenCTM(); if (!cr.width || !ctm) return;
  const w = cr.width, h = cr.height;
  const R = { l:mr.right - 10 - w, r:mr.right - 10, t:mr.bottom - 10 - h, b:mr.bottom - 10 }, L = { l:mr.left + 10, r:mr.left + 10 + w, t:R.t, b:R.b };
  const shown = sel || S.b.loc;
  const boxes = E.REGIONS.map(r => { const p = $(`#g-reg path[data-id="${r.id}"]`); return p ? p.getBoundingClientRect() : null; });
  const cost = B => E.REGIONS.reduce((c, r, i) => { const pr = boxes[i]; if (!pr) return c;
    const ow = Math.max(0, Math.min(pr.right, B.r) - Math.max(pr.left, B.l)), oh = Math.max(0, Math.min(pr.bottom, B.b) - Math.max(pr.top, B.t));
    const frac = ow * oh / Math.max(1, pr.width * pr.height);
    const ax = ctm.a * r.a[0] + ctm.c * r.a[1] + ctm.e, ay = ctm.b * r.a[0] + ctm.d * r.a[1] + ctm.f; const inA = ax > B.l && ax < B.r && ay > B.t && ay < B.b ? 1 : 0;
    const rs = S.regions[r.id]; const wgt = r.id === shown ? 8 : (r.id === S.b.loc || (S.b.tf && S.b.tf.loc === r.id)) ? 3 : (E.labIn(S, r.id) ? 2 : 0) + (rs.z > 0 && !rs.fallen ? 1.5 : 1);
    return c + wgt * (.6 * inA + .4 * frac); }, 0);
  const cR = cost(R), cL = cost(L);
  if (regSide === 'right' && cL + .4 < cR) regSide = 'left'; else if (regSide === 'left' && cR + .4 < cL) regSide = 'right';
  col.classList.toggle('reg-left', regSide === 'left');
  if (regSide === 'left') { const d = $('#dir'); const db = d ? d.getBoundingClientRect().bottom : mr.top; card.style.maxHeight = Math.max(120, mr.bottom - 10 - db - 10) + 'px'; } else card.style.maxHeight = '';
}
function renderRegion() {
  const id = sel || S.b.loc; const rd = E.RD[id], rs = S.regions[id]; const st = E.status(rs);
  const mini = regMin && window.innerWidth > 820; const regEl = $('#reg'); regEl.classList.toggle('min', mini);
  if (mini) {
    regEl.innerHTML = `<div class="reg-h"><div class="n">${esc(rd.name)}</div><span class="chips">${rs.stab > 0 ? '<span class="chip st-Stable">Stable</span>' : ''}<span class="chip st-${st}">${st}</span>${regToggle(true)}</span></div>`;
    $('#b-regmin').onclick = () => { setRegMin(false); renderRegion(); };
    regEl.querySelector('.reg-h .n').onclick = () => { setRegMin(false); renderRegion(); };
    requestAnimationFrame(placeRegionCard); return;
  }
  const lab = S.labs.find(l => l.region === id);
  const isHere = id === S.b.loc;
  let act = '';
  if (isHere) act = `<span class="here">◆ ECB deployed here</span><span class="note">· ${E.POSTURES[S.b.posture].name} posture</span>`;
  else { const c = E.deployCost(S, id); const ok = E.canDeploy(S, id); act = `<button class="btn" id="b-deploy" ${ok === true ? '' : 'disabled'}>Deploy here</button><span class="note">${c.cp} CP · ${c.fuel} fuel · ${c.hops} ${c.hops === 1 ? 'hop' : 'hops'}${ok === true ? '' : '<br><span style="color:#ff8a7e">' + esc(ok) + '</span>'}</span>`; }
  const h = rs.h, z = rs.z, dd = rs.d;
  $('#reg').innerHTML = `
    <div class="reg-h"><div><div class="n">${esc(rd.name)}</div><div class="note">${fmtPop(rd.pop)} people · ${rd.clim} · ${rd.base ? 'allied base' : 'no allied base'}</div></div><span class="chips">${rs.stab > 0 ? '<span class="chip st-Stable">Stable</span>' : ''}<span class="chip st-${st}">${st}</span>${regToggle(false)}</span></div>
    <div class="popbar" title="Healthy / infected / dead"><i style="width:${h * 100}%;background:#6fa58a"></i><i style="width:${z * 100}%;background:#e2483b"></i><i style="width:${dd * 100}%;background:#3c4446"></i></div>
    <dl class="kv">
      <dt>Healthy</dt><dd>${fmtPop(h * rd.pop)} (${fmtPct(h)})</dd>
      <dt>Infected</dt><dd style="color:${z > 0 ? '#ff9a8e' : ''}">${fmtPop(z * rd.pop)} (${fmtPct(z)})</dd>
      <dt>Dead</dt><dd>${fmtPop(dd * rd.pop)}</dd>
      <dt>Civil order</dt><dd>${Math.round(rs.order)}/100</dd>
      ${hnRow(rs, id)}
      <dt>Quarantine</dt><dd>${Math.round(rs.quar * 100)}%</dd>
      <dt>Containment</dt><dd>${Math.round(rs.contain * 100)}%</dd>
      ${rs.stab > 0 ? `<dt>Stability</dt><dd style="color:var(--stab)">Stabilized · ${E.presentIn(S, id) ? 'holding while you are here' : rs.stab + (rs.stab === 1 ? ' week' : ' weeks') + ' left'}</dd>` : ''}
      ${S.phase === 'restore' ? `<dt>Cure coverage</dt><dd style="color:var(--t-cure)">${Math.round((rs.vax || 0) * 100)}%</dd>` : ''}
      ${rs.sz ? `<dt>Safe zones</dt><dd>${rs.sz}/3</dd>` : ''}
      ${rs.safe > .0001 ? `<dt>In secured camps</dt><dd>${fmtPop(rs.safe * rd.pop)}</dd>` : ''}
      ${lab ? `<dt>Lab</dt><dd style="color:${lab.active ? 'var(--t-research)' : '#ff8a7e'}">${esc(lab.name)}${lab.active ? '' : ' (lost)'}</dd>` : ''}
      ${id === S.pz ? `<dt>Origin</dt><dd style="color:#ff9a8e">Patient zero</dd>` : ''}
      ${E.CHOKE[id] ? `<dt>Strategic</dt><dd style="color:${rs.fallen ? '#ff8a7e' : 'var(--amber)'}">${esc(E.CHOKE[id])}${rs.fallen ? ' (lost)' : ''}</dd>` : ''}
      <dt>Season</dt><dd>${seasonText(id)}</dd>
      ${E.worksIn(S, id).length ? `<dt>Field works</dt><dd style="color:var(--amber)">${E.worksIn(S, id).map(k => esc(E.WORKS[k].name)).join(', ')}</dd>` : ''}
      ${S.b.eng && S.b.eng.loc === id ? `<dt>Building</dt><dd>${esc(E.WORKS[S.b.eng.id].name)} ${S.b.eng.prog}/${E.WORKS[S.b.eng.id].weeks}</dd>` : ''}
    </dl>
    ${S.phase === 'restore' && !rs.restored ? restoreChecklist(rs) : S.phase !== 'restore' ? stabChecklist(rs, id) : ''}
    <div class="reg-act">${act}</div>
    ${tfBlock(id, isHere)}
    ${E.CHOKE[id] && !rs.fallen ? `<div class="note" style="margin-top:8px">If ${esc(rd.name)} falls, the ${esc(E.CHOKE[id])} closes and every resupply shrinks ${Math.round(E.CHOKE_LOSS * 100)}%.</div>` : ''}`;
  $('#b-regmin').onclick = () => { setRegMin(true); renderRegion(); };
  requestAnimationFrame(placeRegionCard);
  const tb = $('#b-tf'); if (tb) tb.onclick = () => { const from = S.b.tf ? S.b.tf.loc : S.b.loc; const r = E.sendTF(S, id); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play('convoy'); fxConvoy(from, id, '#8fd3ea'); } };
  const tm = $('#b-tfmove'); if (tm) tm.onclick = showTFPicker;
  const rb = $('#b-recall'); if (rb) rb.onclick = () => { const from = S.b.tf && S.b.tf.loc; const r = E.recallTF(S); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play('convoy'); fxConvoy(from, S.b.loc, '#8fd3ea'); } };
  const b = $('#b-deploy'); if (b) b.onclick = () => { const from = S.b.loc; const r = E.deploy(S, id); toast(r.msg, !r.ok); if (r.ok) { sel = null; } flow(); if (r.ok) { SFX.play('convoy'); fxConvoy(from, id); } };
}
function seasonText(id) {
  const se = E.seasonOf(E.HEMI[id], E.monthOf(S.turn)); const m = E.seasonMult(S, id);
  if (se === 'tropical') return 'Tropical, no winter';
  return se[0].toUpperCase() + se.slice(1) + (m < 1 ? ` · infected slowed ${Math.round((1 - m) * 100)}%` : m > 1 ? ` · infected +${Math.round((m - 1) * 100)}%` : '');
}
function tfBlock(id, isHere) {
  const tf = S.b.tf;
  if (tf && tf.loc === id) { const c = E.recallCost(S); const ok = E.canRecallTF(S); return `<div class="reg-act tfline"><span class="here" style="color:#8fd3ea">◇ Task Force: ${esc(E.UNITS[tf.bn].name)} · ${Math.round(S.b.u[tf.bn] * 100)}%</span><button class="btn sm" id="b-tfmove">Redeploy</button><button class="btn ghost sm" id="b-recall" ${ok === true ? '' : 'disabled'}>Recall</button><span class="note">Recall: ${c.cp} CP · ${c.fuel} fuel</span></div>`; }
  if (isHere) return '';
  const ok = E.canSendTF(S, id), c = E.tfCost(S, id), bn = E.tfCandidate(S);
  return `<div class="reg-act tfline"><button class="btn ghost sm" id="b-tf" ${ok === true ? '' : 'disabled'}>${tf ? 'Move Task Force here' : 'Send Task Force'}</button><span class="note">${esc(E.UNITS[bn].name)} · ${c.cp} CP · ${c.fuel} fuel${ok === true ? '' : '<br><span style="color:#ff8a7e">' + esc(ok) + '</span>'}</span></div>`;
}
function showTFPicker() {
  const tf = S.b.tf; const from = tf ? tf.loc : S.b.loc;
  const list = E.REGIONS.filter(r => r.id !== S.b.loc && (!tf || r.id !== tf.loc) && E.hops(from, r.id) <= E.TF_RANGE)
    .map(r => ({ r, rs:S.regions[r.id], ok:E.canSendTF(S, r.id), c:E.tfCost(S, r.id) }))
    .sort((a, b) => (b.ok === true) - (a.ok === true) || (E.labIn(S, b.r.id) ? 1 : 0) - (E.labIn(S, a.r.id) ? 1 : 0) || b.rs.z - a.rs.z);
  const bn = E.tfCandidate(S);
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:#8fd3ea">Task Force · ${esc(E.UNITS[bn].name)}${tf ? ` · now in ${esc(E.RD[tf.loc].name)}` : ''}</div><h2>${tf ? 'Redeploy the Task Force' : 'Send a Task Force'}</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><p class="note" style="font-size:14px">${tf ? 'Move the Task Force straight to another region. No need to recall it first. Each move costs 1 Command Point and fuel.' : 'Detach your strongest battalion to guard another region. Each move costs 1 Command Point and fuel.'} Regions with a lab are listed first.</p>
    <div class="rlist">${list.map(({ r, rs, ok, c }) => `<button class="rrow tfp" data-id="${r.id}" ${ok === true ? '' : 'disabled'}><i class="dot" style="background:${regionFill(rs)}"></i><span>${esc(r.name)}${E.labIn(S, r.id) ? ' <span style="color:var(--t-research)">⬢</span>' : ''}<span class="note" style="display:block">${ok === true ? `${c.cp} CP · ${c.fuel} fuel · ${c.hops} ${c.hops === 1 ? 'hop' : 'hops'}` : esc(ok)}</span></span><span class="chip st-${E.status(rs)}" style="font-size:9px">${E.status(rs)}</span><span class="mono">${rs.fallen ? '—' : fmtPct(rs.z)}</span></button>`).join('') || '<p class="note">No regions in range.</p>'}</div></div>`, 'wide');
  $('#b-x', m).onclick = closeModal;
  for (const x of $$('.tfp', m)) x.onclick = () => { const id = x.dataset.id, fromNow = S.b.tf ? S.b.tf.loc : S.b.loc; const r = E.sendTF(S, id); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play('convoy'); fxConvoy(fromNow, id, '#8fd3ea'); } };
}
function restoreChecklist(rs) {
  const Q = E.RESTORE_REQ; const row = (ok, t) => `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : '○'}</span>${t}</li>`;
  if (rs.fallen) return `<ul class="check"><li class="hd">To reclaim this fallen region</li>${row(rs.z < .1, `Infected under 10% (now ${fmtPct(rs.z)})`)}</ul>`;
  return `<ul class="check"><li class="hd">To restore this region</li>${row(rs.z < Q.z, `Infected under 0.5% (now ${fmtPct(rs.z)})`)}${row(rs.order >= Q.order, `Civil order 50+ (now ${Math.round(rs.order)})`)}${row((rs.vax || 0) >= Q.vax, `Cure coverage 50%+ (now ${Math.round((rs.vax || 0) * 100)}%)`)}</ul>`;
}
const HN_COL = { Strong:'#7fc28c', Holding:'#a9c98f', Strained:'#e8c547', Breaking:'#ff9a5e', Collapsed:'#ff6a5e' };
function hnRow(rs, id) {
  const v = rs.hn == null ? 1 : rs.hn; const lb = rs.fallen ? 'Collapsed' : E.hnLabel(v); const bol = rs.fallen ? 1 : E.hnBolster(S, id);
  return `<dt title="The region's own army and police. They do most of the fighting.">Host forces</dt><dd style="color:${HN_COL[lb]}">${lb} · ${Math.round(v * 100)}%${bol > 1.001 ? ` <span style="color:var(--friend);white-space:nowrap" title="Your brigade makes them fight harder">+${Math.round((bol - 1) * 100)}% ECB</span>` : ''}</dd>`;
}
function stabChecklist(rs, id) {
  if (rs.fallen || rs.stab > 0) return '';
  if (rs.z <= 0 && rs.contain < .005) return '';
  const Q = E.STAB; const row = (ok, t) => `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : '○'}</span>${t}</li>`;
  return `<ul class="check stab"><li class="hd">To stabilize this region</li>${row(rs.contain >= Q.contain, `Containment ${Math.round(Q.contain * 100)}%+ (now ${Math.round(rs.contain * 100)}%)`)}${row(rs.quar >= Q.quar, `Quarantine ${Math.round(Q.quar * 100)}%+ (now ${Math.round(rs.quar * 100)}%)`)}${row(rs.z < Q.z, `Infected under ${Math.round(Q.z * 100)}% (now ${fmtPct(rs.z)})`)}<li class="nt">A stable region holds on its own for about ${Q.weeks} weeks after you leave.</li></ul>`;
}
function meter(label, v, max, color, fmt) { return `<div class="meter"><div class="top"><span>${label}</span><span class="mono">${fmt ? fmt(v) : Math.round(v)}</span></div><div class="bar"><i style="width:${Math.max(0, Math.min(100, v / max * 100))}%;background:${color}"></i></div></div>`; }
function renderSide() {
  for (const b of $$('.tabs button')) b.setAttribute('aria-selected', b.dataset.tab === tab);
  const body = $('#tabbody'); const b = S.b;
  if (tab === 'brigade') {
    const cmd = E.CMD[S.cmd]; const p = E.personnel(S); const flow = E.supplyFlow(S);
    const unitRows = Object.keys(E.UNITS).map(k => { const v = b.u[k]; const col = v > .7 ? 'var(--friend)' : v > .4 ? 'var(--warn)' : 'var(--hostile)';
      if (E.BNS.includes(k)) { const vt = E.vetOf(S, k), ri = E.rankIdx(vt.xp), RK = E.RANKS, nx = RK[ri + 1], tr = E.TRAITS[vt.cdr.trait] || {}; const isTF = b.tf && b.tf.bn === k;
        return `<div class="unit bn"><span>${E.UNITS[k].name}${isTF ? ` <span class="tfb">TASK FORCE · ${esc(SHORT[b.tf.loc])}</span>` : ''}<span class="sub">${esc(vt.cdr.name)} · <span class="trait-t" title="${esc(tr.text || '')}">${esc(tr.name || '')}</span> <span class="faint">(${esc(tr.text || '')})</span></span><span class="rank r${ri}" title="${nx ? `${Math.floor(vt.xp)} of ${nx.xp} XP to ${nx.name}` : 'Top rank'}">${'★'.repeat(ri)}${'☆'.repeat(3 - ri)} ${RK[ri].name}</span><span class="xp"><i style="width:${nx ? Math.min(100, (vt.xp - RK[ri].xp) / (nx.xp - RK[ri].xp) * 100) : 100}%"></i></span></span><span class="bar"><i style="width:${v * 100}%;background:${col}"></i></span><span class="mono">${Math.round(v * 100)}%</span></div>`; }
      return `<div class="unit"><span>${E.UNITS[k].name}<span class="sub">${E.UNITS[k].sub}</span></span><span class="bar"><i style="width:${v * 100}%;background:${col}"></i></span><span class="mono">${Math.round(v * 100)}%</span></div>`; }).join('');
    const rc = b.tf ? E.recallCost(S) : null;
    const tfSec = `<div class="sec"><span class="lbl">Task Force</span>${b.tf ? `<div style="font-size:13px">${E.UNITS[b.tf.bn].name} is operating in <b>${esc(E.RD[b.tf.loc].name)}</b> (since week ${b.tf.since}). It contains the outbreak, kills infected and gains experience there on its own.${E.hasD(S, 'mission') ? '' : ' Upkeep: 2 supply and 1 fuel a week.'}</div><div class="reg-act"><button class="btn sm" id="b-tfpick">Redeploy Task Force</button><button class="btn ghost sm" id="b-recall2" ${E.canRecallTF(S) === true ? '' : 'disabled'}>Recall to main body</button><span class="note">Recall: ${rc.cp} CP · ${rc.fuel} fuel</span></div>` : '<div class="note">Detach one battalion to guard a second region. It fights and contains the outbreak there on its own, but your main body is a third weaker while it is away.</div><div class="reg-act"><button class="btn sm" id="b-tfpick">Send a Task Force</button></div>'}</div>`;
    const docSec = `<div class="sec"><span class="lbl">Doctrine</span>${(S.doct || []).length ? S.doct.map(id => `<div class="doc"><b>${esc(E.DOCTRINES[id].name)}</b><span>${esc(E.DOCTRINES[id].text)}</span></div>`).join('') : '<div class="note">No doctrines yet.</div>'}<div class="note" style="margin-top:4px">Next Promotion Board: week ${S.nextBoard}.</div></div>`;
    const lost = E.chokesLost(S);
    const supSec = `<div class="sec"><span class="lbl">Supply lines</span><div class="chips">${Object.entries(E.CHOKE).map(([id, n]) => `<span class="en ${S.regions[id].fallen ? 'off' : ''}" title="${esc(E.RD[id].name)}">${esc(n)}</span>`).join('')}</div><div class="note" style="margin-top:5px">${lost.length ? `${lost.length} chokepoint${lost.length > 1 ? 's' : ''} lost: resupply −${Math.round(lost.length * E.CHOKE_LOSS * 100)}%.` : `Each chokepoint lost shrinks every resupply by ${Math.round(E.CHOKE_LOSS * 100)}%.`}</div></div>`;
    body.innerHTML = `
      <div class="sec"><div class="cmdline"><span class="nm">${esc(cmd.name)}</span><span class="lbl">${esc(cmd.title)} · ${E.DIFFS[S.diff].name}</span></div>
        <div style="display:flex;align-items:baseline;gap:8px;margin-top:4px"><span class="pers">${p.toLocaleString()}</span><span class="note">of ${E.NOMINAL_TOTAL.toLocaleString()} personnel · ${S.stats.kia.toLocaleString()} lost</span></div></div>
      <div class="sec"><span class="lbl">Posture</span><div class="posture">${Object.entries(E.POSTURES).map(([k, v]) => `<button data-p="${k}" aria-pressed="${b.posture === k}">${v.name}</button>`).join('')}</div><div class="note" style="margin-top:5px">${E.POSTURES[b.posture].text} Uses ${E.POSTURES[b.posture].ammo} ammo, ${E.POSTURES[b.posture].fuel} fuel, ${E.POSTURES[b.posture].supply} supply a week.</div></div>
      <div class="sec"><span class="lbl">Stocks</span><div class="meters">
        ${meter('Supply', b.supply, 100, b.supply < 15 ? 'var(--hostile)' : 'var(--t-logistics)')}${meter('Ammo', b.ammo, 100, b.ammo < 12 ? 'var(--hostile)' : 'var(--t-fires)')}
        ${meter('Fuel', b.fuel, 100, b.fuel < 12 ? 'var(--hostile)' : 'var(--t-air)')}${meter('Med', b.med, 50, b.med < 6 ? 'var(--hostile)' : 'var(--t-medical)')}
      </div><div class="note" style="margin-top:6px">Weekly resupply here: about +${Math.round(12 * flow)} supply, +${Math.round(12 * flow)} ammo, +${Math.round(9 * flow)} fuel.</div></div>
      <div class="sec"><span class="lbl">Condition</span><div class="meters">
        ${meter('Morale', b.morale, 100, b.morale < 25 ? 'var(--hostile)' : b.morale < 50 ? 'var(--warn)' : 'var(--good)')}${meter('Command trust', b.trust, 100, b.trust < 20 ? 'var(--hostile)' : 'var(--amber)')}
        ${meter('Exposure', b.exposure, 100, b.exposure > 70 ? 'var(--hostile)' : b.exposure > 40 ? 'var(--warn)' : '#8d9e99')}${meter('Combat power', E.man(S) * E.eff(S) * 100, 100, 'var(--friend)')}
      </div><div class="note" style="margin-top:6px">${b.exposure > 70 ? '<b style="color:#ff8a7e">Exposure is critical.</b> At 100 an outbreak hits the brigade.' : 'Exposure builds while fighting in infected regions. At 100 the brigade has an outbreak.'}</div></div>
      ${tfSec}${docSec}
      <div class="sec"><span class="lbl">Order of battle</span><div class="units">${unitRows}</div>
        <div class="helos"><span>ATTACK ${b.helo.attack}/${b.heloMax.attack}</span><span>MULTIROLE ${b.helo.multi}/${b.heloMax.multi}</span><span>HEAVY ${b.helo.heavy}/${b.heloMax.heavy}</span><span>UAS ${Math.round(b.uas * 100)}%</span><span>AIR READY ${Math.round(b.air)}%</span></div></div>
      <div class="sec"><span class="lbl">Companies</span><div class="chips">${Object.entries(E.ENABLERS).map(([k, n]) => `<span class="en ${b.en[k] ? '' : 'off'}">${n}</span>`).join('')}</div></div>${supSec}`;
    const tp = $('#b-tfpick', body); if (tp) tp.onclick = showTFPicker;
    const r2 = $('#b-recall2', body); if (r2) r2.onclick = () => { const from = S.b.tf && S.b.tf.loc; const r = E.recallTF(S); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play('convoy'); fxConvoy(from, S.b.loc, '#8fd3ea'); } };
    for (const x of $$('.posture button', body)) x.onclick = () => { E.setPosture(S, x.dataset.p); save(); render(); };
  } else if (tab === 'regions') {
    const list = E.REGIONS.map(r => ({ r, rs:S.regions[r.id] })).sort((a, c) => (S.phase === 'restore' ? (a.rs.restored - c.rs.restored) : 0) || (c.rs.fallen - a.rs.fallen) || (c.rs.z - a.rs.z) || (c.r.pop - a.r.pop));
    body.innerHTML = `<div class="sec"><span class="lbl">All regions · tap to inspect</span><div class="rlist">${list.map(({ r, rs }) => `<button class="rrow ${r.id === (sel || S.b.loc) ? 'sel' : ''}" data-id="${r.id}"><i class="dot" style="background:${regionFill(rs)}"></i><span>${esc(r.name)}${r.id === S.b.loc ? ' <span style="color:var(--friend)">◆</span>' : ''}${E.labIn(S, r.id) ? ' <span style="color:var(--t-research)">⬢</span>' : ''}${rs.stab > 0 ? ' <i class="sw sh" title="Stabilized"></i>' : ''}</span><span class="chip st-${E.status(rs)}" style="font-size:9px">${E.status(rs)}</span><span class="mono">${S.phase === 'restore' ? (rs.restored ? '✓' : `${Math.round((rs.vax || 0) * 100)}% covered`) : rs.fallen ? '—' : fmtPct(rs.z)}</span></button>`).join('')}</div></div>`;
    for (const x of $$('.rrow', body)) x.onclick = () => selectRegion(x.dataset.id, true);
  } else if (tab === 'threat') {
    const P = S.path; const rate = v => v < .95 ? 'Low' : v < 1.1 ? 'Moderate' : v < 1.3 ? 'High' : 'Extreme';
    body.innerHTML = `
      <div class="sec"><span class="lbl">Pathogen</span><div style="font-size:18px;font-weight:700">${esc(P.name)}</div><div class="note mono">${esc(P.code)} · origin ${esc(E.RD[S.pz].name)}</div></div>
      <div class="sec"><div class="rating"><span>Infectivity</span><span class="mono">${rate(P.inf / 1.25)}</span><span>Aggression</span><span class="mono">${rate(P.aggr)}</span><span>Resilience</span><span class="mono">${rate(P.resil)}</span><span>Spread between regions</span><span class="mono">${rate(P.spread)}</span><span>Cold tolerance</span><span class="mono">${P.coldTol > .95 ? 'Full' : rate(P.coldTol + .3)}</span></div></div>
      <div class="sec"><span class="lbl">Mutations</span>${P.traits.length ? P.traits.map(t => `<span class="trait">${esc(t)}</span>`).join('') : '<div class="note">None detected yet.</div>'}<div class="note">${S.phase === 'restore' ? 'The cure stopped further mutations.' : `Next mutation expected around week ${S.nextMutation}.`}</div></div>
      <div class="sec"><span class="lbl">World population over time</span>${trendSVG()}</div>
      <div class="sec"><span class="lbl">Research labs</span><div class="rlist">${S.labs.map(l => `<button class="rrow" data-id="${l.region}"><i class="dot" style="background:${l.active ? '#5fc4a8' : '#3b4744'}"></i><span>${esc(l.name)}</span><span class="note">${esc(SHORT[l.region])}</span><span class="mono" style="color:${l.active ? 'var(--t-research)' : '#ff8a7e'}">${l.active ? 'ACTIVE' : 'LOST'}</span></button>`).join('')}</div><div class="note" style="margin-top:6px">${S.phase === 'restore' ? 'Labs now produce cure doses. Regions with a lab get covered twice as fast. Every lost lab slows distribution.' : `Labs research faster in calm regions, and faster still with the ECB on site. Lab efficiency ×${S.know.toFixed(2)}.`}</div></div>`;
    for (const x of $$('.rrow', body)) x.onclick = () => selectRegion(x.dataset.id, true);
  } else {
    const rep = S.lastReport;
    body.innerHTML = `<div class="sec"><span class="lbl">This week</span><div class="log">${S.log.length ? S.log.map(t => `<div>${esc(t)}</div>`).join('') : '<div>No actions yet this week.</div>'}</div></div>
      ${rep ? `<div class="sec"><span class="lbl">Week ${rep.turn} report</span><div class="log">${rep.items.map(i => `<div class="${i.k}">${esc(i.t)}</div>`).join('')}</div></div>` : ''}`;
  }
}
function trendSVG() {
  const H = S.history; const W = 320, Ht = 130, pl = 34, pr = 10, pt = 10, pb = 22;
  const n = Math.max(2, H.length); const X = i => pl + (W - pl - pr) * (i / (n - 1));
  const max = 8200; const Y = v => pt + (Ht - pt - pb) * (1 - v / max);
  const line = (k, f) => H.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(f ? f(p) : p[k]).toFixed(1)}`).join('');
  const last = H[H.length - 1];
  const grid = [0, 2000, 4000, 6000, 8000].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#22323a" stroke-width="1"/><text x="${pl - 5}" y="${Y(v) + 3}" text-anchor="end">${v / 1000}B</text>`).join('');
  return `<svg class="trend" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Survivors, infected and dead over time">${grid}
    <path d="${line('h')}" fill="none" stroke="#6fa58a" stroke-width="2"/><path d="${line('z')}" fill="none" stroke="#e2483b" stroke-width="2"/><path d="${line('d')}" fill="none" stroke="#8d9e99" stroke-width="1.5" stroke-dasharray="3 2"/>
    <circle cx="${X(H.length - 1)}" cy="${Y(last.h)}" r="3" fill="#6fa58a"/><circle cx="${X(H.length - 1)}" cy="${Y(last.z)}" r="3" fill="#e2483b"/>
    <text x="${pl}" y="${Ht - 6}">W1</text><text x="${W - pr}" y="${Ht - 6}" text-anchor="end">W${last.t}</text>
    <text x="${(pl + W - pr) / 2}" y="${Ht - 6}" text-anchor="middle"><tspan fill="#6fa58a">■ survivors</tspan>  <tspan fill="#e2483b">■ infected</tspan>  <tspan fill="#8d9e99">■ dead</tspan></text></svg>`;
}
function cardHTML(id, opts) {
  opts = opts || {}; const c = E.def(id); if (!c) return ''; const cost = E.costOf(id), up = E.isUp(id);
  let txt = ''; try { txt = c.text(S); } catch (e) { txt = ''; }
  const why = opts.why && opts.why !== true ? opts.why : '';
  const res = Object.entries(c.res).map(([k, v]) => `<span class="${S && S.b[k] < v ? 'short' : ''}">${k.toUpperCase()} ${v}</span>`).join('');
  return `<button class="card t-${c.type} ${why ? 'no' : ''} ${up ? 'up' : ''} ${opts.cls || ''}" ${opts.attr || ''} aria-label="${esc(E.cardName(id))}, costs ${cost} command points${why ? '. Unavailable: ' + esc(why) : ''}">
    <div class="art-wrap">${ART.svg(E.baseId(id), c.type)}<span class="ty"><svg viewBox="0 0 16 16" aria-hidden="true">${ICON[c.type]}</svg>${c.type}</span><span class="cost ${cost === 0 ? 'z' : ''}">${cost}${up ? '<sup>+</sup>' : ''}</span></div>
    <div class="nm">${esc(E.cardName(id))}</div><div class="un">${esc(c.unit || '')}</div>
    <div class="tx">${txt}</div><div class="rs">${res}</div>${c.exhaust ? '<span class="ex">ONE USE</span>' : ''}${why ? `<span class="why">${esc(why)}</span>` : ''}</button>`;
}
function renderHand() {
  const max = Math.max(E.cpMax(S), S.cp);
  $('#pips').innerHTML = Array.from({ length:max }, (_, i) => `<span class="pip ${i < S.cp ? 'on' : ''}"></span>`).join('') + `<span class="mono" style="margin-left:6px;font-size:13px">${S.cp}</span>`;
  const nb = (S.deck.burned || []).length;
  $('#deckinfo').innerHTML = `Draw ${S.deck.draw.length} · Discard ${S.deck.discard.length}${nb ? ` · Burned ${nb}` : ''} · <button id="b-deck">Deck (${E.deckList(S).length})</button>`;
  $('#b-deck').onclick = () => showDeck(false);
  const hand = $('#hand');
  hand.innerHTML = S.deck.hand.map((id, i) => { const cb = E.canBurn(S, i); const nm = esc(E.cardName(id));
    return `<div class="slot">${cardHTML(id, { why:E.canPlay(S, i), attr:`data-i="${i}"` })}<button class="burn" data-b="${i}" ${cb === true ? '' : 'disabled'} title="${cb === true ? `Burn ${nm}: discard it now and draw a fresh card next week` : esc(cb)}" aria-label="Burn ${nm}: discard it and draw a fresh card next week"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15.5c-3.3 0-5.5-2.2-5.5-5.1 0-2.7 2-4.3 2.9-6.6.4 1.3 1.1 2.1 1.9 2.4C7.4 4.1 7.9 1.9 9.7.5c-.1 2.6 1.6 3.8 2.8 5.6.8 1.2 1 2.4 1 3.6 0 3.3-2.3 5.8-5.5 5.8z" fill="currentColor"/><path d="M8 15c-1.6 0-2.7-1.1-2.7-2.6 0-1.4 1.1-2.2 1.6-3.3.3.7.8 1 1.3 1.1.1-1.2.6-2 1.4-2.6 0 1.3.8 2 1.4 2.9.3.5.4 1 .4 1.6C11.4 13.8 10 15 8 15z" fill="#ffd36b"/></svg><span class="bl">Burn?</span></button></div>`; }).join('');
  for (const b of $$('.card', hand)) b.onclick = () => playIdx(+b.dataset.i, b);
  for (const b of $$('.burn', hand)) b.onclick = e => { e.stopPropagation(); burnIdx(+b.dataset.b, b); };
  const playable = S.deck.hand.some((_, i) => E.canPlay(S, i) === true);
  renderTasks();
  const freeT = [!S.b.ato && Object.keys(E.SORTIES).some(k => E.canSortie(S, k) === true) ? 'air tasking' : '', !S.b.engUsed && Object.keys(E.WORKS).some(k => E.canBuild(S, k) === true) ? 'engineers' : ''].filter(Boolean);
  $('#endhint').textContent = S.cureChoice ? 'Decide what to do with the cure' : S.crisis ? 'Resolve the crisis first' : playable ? `${S.cp} CP left · cards still playable` : freeT.length ? `Free this week: ${freeT.join(' and ')}` : 'Ready to end the week';
  $('#b-end').disabled = !!(S.over || S.crisis || S.pendingReward || S.cureChoice || S.pendingDoctrine);
}
const half = v => v === 0 ? '0' : (Math.floor(v) || '') + (v % 1 ? '½' : '');

// ------------------------------------------------------------- weekly tasking: Air Tasking Order + Engineers
const IC_AIR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 7.2h9.6l2.6-2.2h1.6l-1.5 2.4 1.5 2.4h-1.6l-2.6-2.2H1z" fill="currentColor"/><path d="M2 4.2h12" stroke="currentColor" stroke-width="1.1"/><path d="M7.6 4.2v3" stroke="currentColor" stroke-width="1"/><path d="M3.6 9.6l-.6 2.2M9 9.6l.6 2.2" stroke="currentColor" stroke-width="1"/></svg>';
const IC_ENG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14l6.2-6.2M9.4 2.2a3.4 3.4 0 0 0 4.4 4.4l-1.6 1.6-2.8-2.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M1.5 12.5l2 2 2.2-2.2-2-2z" fill="currentColor"/></svg>';
function renderTasks() {
  const w = $('#wk'); if (!w || !S) return; const b = S.b; const eg = b.eng;
  const engNow = eg ? `${esc(E.WORKS[eg.id].name)} ${eg.prog}/${E.WORKS[eg.id].weeks}` : '';
  w.innerHTML = `<button class="wkb ${b.ato ? 'done' : ''}" id="b-ato" title="Air Tasking Order: one free aviation mission a week">${IC_AIR}<span class="wl">Air tasking</span><span class="ws">${b.ato ? '✓ ' + esc(E.SORTIES[b.ato].name) : `Ready · ${Math.round(b.air)}%`}</span></button>`
    + `<button class="wkb ${b.engUsed ? 'done' : ''}" id="b-eng" title="Engineers: build field works where the brigade is">${IC_ENG}<span class="wl">Engineers</span><span class="ws">${b.engUsed ? '✓ ' + (engNow || 'Built') : engNow ? engNow : 'Ready'}</span></button>`;
  $('#b-ato').onclick = showAirTasking; $('#b-eng').onclick = showEngineers;
}
function taskRow(art, kind, name, unit, text, cost, ok, attr) {
  return `<button class="opt task" ${attr} ${ok === true ? '' : 'disabled'}><span class="thumb">${ART.svg(art, kind)}</span><span><span class="ol">${esc(name)}</span> <span class="tu">${esc(unit)}</span><div class="of">${text}</div><div class="tc mono">${cost}</div>${ok === true ? '' : `<div class="of"><span class="why">Unavailable: ${esc(ok)}</span></div>`}</span></button>`;
}
function showAirTasking() {
  const b = S.b; const regen = 12 + (b.en.maint ? 4 : 0) + (E.hasD(S, 'rotary') ? 4 : 0);
  const rows = Object.entries(E.SORTIES).map(([id, o]) => { const ok = E.canSortie(S, id); let t = ''; try { t = o.text(S); } catch (e) {}
    const cost = [...Object.entries(o.res).map(([k, v]) => `${v} ${k}`), o.rdy > 0 ? `−${o.rdy}% readiness` : `+${-o.rdy}% readiness`].join(' · ');
    return taskRow(o.art, o.kind, o.name, o.unit, esc(t), cost, ok, `data-s="${id}"`); }).join('');
  const m = openModal(`<div class="crisis-art">${ART.svg('ato', 'AIR', '', true)}</div><div class="dlg-h"><div><div class="k" style="color:var(--t-air)">Air Tasking Order · Week ${S.turn}</div><h2>Task the Aviation Group</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><p>Fly <b>one mission a week</b>. It costs no Command Points, only fuel, ammo and air readiness. Readiness recovers ${regen}% every week, and Stand Down restores more. Flying below 40% readiness is riskier.</p>
    <div class="meters" style="margin:8px 0 4px">${meter('Air readiness', b.air, 100, b.air < 40 ? 'var(--hostile)' : 'var(--t-air)', v => Math.round(v) + '%')}</div>
    <div class="helos" style="margin-bottom:10px"><span>ATTACK ${b.helo.attack}/${b.heloMax.attack}</span><span>MULTIROLE ${b.helo.multi}/${b.heloMax.multi}</span><span>HEAVY ${b.helo.heavy}/${b.heloMax.heavy}</span><span>UAS ${Math.round(b.uas * 100)}%</span></div>
    ${b.ato ? `<p class="note" style="font-size:14px">Already flown this week: <b>${esc(E.SORTIES[b.ato].name)}</b>. The Aviation Group is ready again next week.</p>` : ''}
    <div class="opts">${rows}</div></div>`, 'wide', k => { const id = Object.keys(E.SORTIES)[+k - 1]; if (id && E.canSortie(S, id) === true) fly(id); });
  const fly = id => { const tgt = id === 'strike' ? E.airWorst(S) : S.b.loc, from = S.b.loc; const r = E.flySortie(S, id); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play(id === 'isr' ? 'drone' : 'rotor'); fxHelo(from, tgt, id); TUT.ev('ato'); } };
  $('#b-x', m).onclick = closeModal;
  for (const x of $$('.opt.task', m)) x.onclick = () => fly(x.dataset.s);
}
function showEngineers() {
  const b = S.b, rd = E.RD[b.loc]; const built = E.worksIn(S, b.loc); const eg = b.eng;
  const rows = Object.entries(E.WORKS).map(([id, w]) => { const ok = E.canBuild(S, id); const cont = eg && eg.loc === b.loc && eg.id === id;
    const cost = `${Object.entries(w.res).map(([k, v]) => `${v} ${k}`).join(' · ')} per week · ${w.weeks} weeks${cont ? ` · ${eg.prog} done` : ''}`;
    return taskRow(w.art, w.kind, (cont ? 'Continue: ' : '') + w.name, built.includes(id) ? 'Built here' : cont ? `${w.weeks - eg.prog} more ${w.weeks - eg.prog === 1 ? 'week' : 'weeks'}` : `${w.weeks} weeks of work`, esc(w.text), cost, ok, `data-w="${id}"`); }).join('');
  const elsewhere = eg && eg.loc !== b.loc ? `<p class="note" style="font-size:14px">Unfinished: <b>${esc(E.WORKS[eg.id].name)}</b> in ${esc(E.RD[eg.loc].name)} (${eg.prog} of ${E.WORKS[eg.id].weeks} weeks). Starting work here abandons it.</p>` : '';
  const m = openModal(`<div class="crisis-art">${ART.svg('eng', 'COMBAT', '', true)}</div><div class="dlg-h"><div><div class="k" style="color:var(--t-combat)">Engineers · Week ${S.turn}</div><h2>Field works in ${esc(rd.name)}</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><p>Your engineer platoons can do <b>one week of work</b> on a project where the main body is deployed. It costs no Command Points, only supplies. Finished works keep helping after you leave, until the region falls.</p>
    <p class="note" style="font-size:14px">Built here: ${built.length ? built.map(k => `<b>${esc(E.WORKS[k].name)}</b>`).join(', ') : 'nothing yet'}. Engineer strength ${Math.round(E.engCrew(S) * 100)}%.</p>${elsewhere}
    ${b.engUsed ? '<p class="note" style="font-size:14px">The engineers already worked this week.</p>' : ''}
    <div class="opts">${rows}</div></div>`, 'wide', k => { const id = Object.keys(E.WORKS)[+k - 1]; if (id && E.canBuild(S, id) === true) go(id); });
  const go = id => { const loc = S.b.loc; const r = E.buildWork(S, id); toast(r.msg, !r.ok); flow(); if (r.ok) { SFX.play('clank'); if (/finished/.test(r.msg)) { setTimeout(() => SFX.play('chime'), 650); fxPulse(loc, '#f0a53a', 2); } TUT.ev('eng'); } };
  $('#b-x', m).onclick = closeModal;
  for (const x of $$('.opt.task', m)) x.onclick = () => go(x.dataset.w);
}
let burnArm = null;
function burnIdx(i, btn) {
  const ok = E.canBurn(S, i); if (ok !== true) { toast(ok, true); return; }
  if (!btn.classList.contains('arm')) {
    for (const x of $$('#hand .burn.arm')) x.classList.remove('arm');
    btn.classList.add('arm'); clearTimeout(burnArm); burnArm = setTimeout(() => btn.classList.remove('arm'), 3500); return;
  }
  clearTimeout(burnArm);
  const card = btn.parentElement.querySelector('.card');
  const go = () => { const r = E.burnCard(S, i); toast(r.msg, !r.ok); if (r.ok) SFX.play('whoosh'); flow(); };
  if (card && !matchMedia('(prefers-reduced-motion: reduce)').matches) { card.classList.add('burnt'); btn.remove(); setTimeout(go, 320); } else go();
}
function playIdx(i, elmt) {
  const ok = E.canPlay(S, i); if (ok !== true) { toast(ok, true); return; }
  const id = S.deck.hand[i], loc = S.b.loc;
  const go = () => { const r = E.playCard(S, i); toast(r.msg, !r.ok); flow(); if (r.ok) { const c = E.def(id); SFX.card(c.type, E.baseId(id)); fxCard(c.type, E.baseId(id), loc); TUT.ev('card'); } };
  if (elmt && !matchMedia('(prefers-reduced-motion: reduce)').matches) { elmt.classList.add('fly'); setTimeout(go, 220); } else go();
}
function selectRegion(id, focus) { sel = id === S.b.loc ? null : id; if (regMin) setRegMin(false); if (focus && window.innerWidth > 820) {} render(); if (window.innerWidth <= 820 && focus) { const r = $('#reg'); if (r) r.scrollIntoView({ behavior:'smooth', block:'center' }); } }

// ------------------------------------------------------------- sound button + map effects
let crisisSnd = null, rewardSnd = null, fxQ = [], fxBusy = false;
const IC_SND_ON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.6 3.6a6 6 0 0 1 0 8.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
const IC_SND_OFF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
function sndBtn() { const b = $('#b-snd'); if (!b) return; const off = SFX.isMuted(); b.innerHTML = off ? IC_SND_OFF : IC_SND_ON; b.setAttribute('aria-pressed', String(!off)); b.title = off ? 'Sound is off' : 'Sound is on'; }
const RMO = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxG() { const svg = $('#map'); if (!svg) return null; let g = svg.querySelector('#g-fx'); if (!g) g = el('g', { id:'g-fx', 'pointer-events':'none' }, svg); return g; }
function fxK() { const svg = $('#map'); const w = svg ? svg.getBoundingClientRect().width : 0; return w ? view.w / w : 1; }  // map units per screen pixel
function tween(ms, step, done) { const t0 = performance.now(); const f = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); step(p); if (p < 1) requestAnimationFrame(f); else if (done) done(); }; requestAnimationFrame(f); }
const ease = p => 1 - Math.pow(1 - p, 3);
function fxFlash(id, n, big) {
  const g = fxG(); if (!g || RMO() || !id) return; const [x, y] = anchor(id); const k = fxK();
  for (let i = 0; i < (n || 6); i++) setTimeout(() => {
    const cx = x + (Math.random() - .5) * 38 * k, cy = y + (Math.random() - .5) * 22 * k, R = (big ? 16 : 9) * k;
    const c = el('circle', { cx, cy, r:0, fill:big ? '#ff9a3a' : '#ffd27a' }, g), c2 = el('circle', { cx, cy, r:0, fill:'#fff6d8' }, g);
    tween(big ? 650 : 420, p => { c.setAttribute('r', R * ease(p)); c.setAttribute('opacity', 1 - p); c2.setAttribute('r', R * .45 * (1 - p)); }, () => { c.remove(); c2.remove(); });
  }, i * (big ? 170 : 90) + Math.random() * 60);
}
function fxPulse(id, color, rings) {
  const g = fxG(); if (!g || RMO() || !id) return; const [x, y] = anchor(id); const k = fxK();
  for (let i = 0; i < (rings || 2); i++) setTimeout(() => {
    const c = el('circle', { cx:x, cy:y, r:4 * k, fill:'none', stroke:color, 'stroke-width':3.5 * k }, g);
    tween(1400, p => { const e = ease(p); c.setAttribute('r', (4 + 46 * e) * k); c.setAttribute('stroke-width', 3.5 * k * (1 - p) + .3 * k); c.setAttribute('opacity', .95 * (1 - p)); }, () => c.remove());
  }, i * 420);
}
function curve(a, b, lift) { const [x1, y1] = anchor(a), [x2, y2] = anchor(b); return { x1, y1, x2, y2, cx:(x1 + x2) / 2, cy:Math.min(y1, y2) - (lift || 30) }; }
function qpt(c, p) { const u = 1 - p; return [u * u * c.x1 + 2 * u * p * c.cx + p * p * c.x2, u * u * c.y1 + 2 * u * p * c.cy + p * p * c.y2]; }
function fxConvoy(from, to, color) {
  const g = fxG(); if (!g || RMO() || !from || !to || from === to) return; const k = fxK(), c = curve(from, to, 22), col = color || '#5cb6d4';
  const trail = el('path', { d:`M${c.x1},${c.y1} Q${c.cx},${c.cy} ${c.x2},${c.y2}`, fill:'none', stroke:col, 'stroke-width':2.2 * k, 'stroke-dasharray':`${5 * k} ${4 * k}`, opacity:.8 }, g);
  const vs = [0, 1, 2].map(() => el('rect', { width:10 * k, height:6.5 * k, rx:1.6 * k, fill:col, stroke:'#06222c', 'stroke-width':1.2 * k }, g));
  tween(1800, p => { vs.forEach((v, i) => { const q = Math.max(0, Math.min(1, ease(p) - i * .07)); const [x, y] = qpt(c, q); v.setAttribute('x', x - 5 * k); v.setAttribute('y', y - 3.2 * k); }); },
    () => tween(450, p => { trail.setAttribute('opacity', .75 * (1 - p)); vs.forEach(v => v.setAttribute('opacity', 1 - p)); }, () => { trail.remove(); vs.forEach(v => v.remove()); }));
}
function fxHelo(from, to, kind) {
  const g = fxG(); if (!g || RMO() || !to) return; const k = fxK();
  const h = el('g', {}, g);
  if (kind === 'isr') { el('path', { d:'M-7 0 H7 M0 -2.4 V3 M-2.4 3 H2.4', stroke:'#cdb8ff', 'stroke-width':1.3, fill:'none', 'stroke-linecap':'round' }, h); }
  else { const heavy = kind === 'lift'; el('ellipse', { rx:heavy ? 5.4 : 4.2, ry:1.7, fill:'#8fd3ea', stroke:'#06222c', 'stroke-width':.5 }, h); el('path', { d:`M${heavy ? -5 : -4} 0 L-9.5 -.4`, stroke:'#8fd3ea', 'stroke-width':1 }, h); el('line', { x1:-6.5, y1:-2.4, x2:6.5, y2:-2.4, stroke:'#e6f7fc', 'stroke-width':.7 }, h); if (heavy) el('line', { x1:-9, y1:-2.6, x2:-1, y2:-2.6, stroke:'#e6f7fc', 'stroke-width':.7 }, h); }
  let c; const [tx, ty] = anchor(to);
  if (kind === 'lift') c = { x1:tx - 110, y1:ty - 70, x2:tx, y2:ty - 8, cx:tx - 50, cy:ty - 80 };
  else if (!from || from === to) c = { x1:tx - 8, y1:ty - 10, x2:tx + 5, y2:ty - 6, cx:tx + 34, cy:ty - 44 };
  else c = curve(from, to, 34);
  const hs = 2.3 * k; const place = (x, y, dir) => h.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(hs * dir).toFixed(3)},${hs.toFixed(3)})`);
  place(c.x1, c.y1, 1);
  tween(1300, p => { const [x, y] = qpt(c, ease(p)); place(x, y, c.x2 >= c.x1 ? 1 : -1); }, () => {
    if (kind === 'strike') fxFlash(to, 7); else if (kind === 'isr') fxPulse(to, '#cdb8ff', 2); else if (kind === 'medevac') fxPulse(to, '#bdf2ad', 1); else if (kind === 'lift') fxPulse(to, '#f0dea8', 1);
    tween(1200, p => { const a = p * Math.PI * 2; place(c.x2 + Math.cos(a) * 16 * k, c.y2 - 8 * k + Math.sin(a) * 9 * k, -Math.sin(a) >= 0 ? 1 : -1); h.setAttribute('opacity', p > .7 ? ((1 - p) / .3).toFixed(2) : 1); }, () => h.remove());
  });
}
const CARD_FX = { COMBAT:l => fxFlash(l, 6), FIRES:l => fxFlash(l, 4, true), INTEL:l => fxPulse(l, '#cdb8ff', 1), RESEARCH:l => fxPulse(l, '#8ff0d0', 1), MEDICAL:l => fxPulse(l, '#bdf2ad', 1), CIVIL:l => fxPulse(l, '#98ebe2', 1), COMMAND:l => fxPulse(l, '#ffe28a', 1), CURE:l => fxPulse(l, '#86ffc0', 2), LOGISTICS:l => fxPulse(l, '#f0dea8', 1) };
function fxCard(type, id, loc) {
  if (type === 'AIR') { const kind = ['apache', 'cas', 'combined_arms', 'air_assault'].includes(id) ? 'strike' : ['airbridge', 'mass_vax'].includes(id) ? 'lift' : id === 'medevac' ? 'medevac' : 'fly'; return fxHelo(loc, loc, kind); }
  if (id === 'thermobaric' || id === 'firebreak') return fxFlash(loc, 6, true);
  (CARD_FX[type] || (() => {}))(loc);
}
function afterSitrep() {
  if (fxBusy) return; closeModal();
  if (fxQ.length && !RMO()) { const q = fxQ; fxQ = []; fxBusy = true; render(); q.forEach((f, i) => setTimeout(f, 80 + i * 160));
    let doneBeat = false; const fin = () => { if (doneBeat) return; doneBeat = true; clearTimeout(tm); document.removeEventListener('pointerdown', fin, true); document.removeEventListener('keydown', fin, true); fxBusy = false; flow(); TUT.ev('sitrep'); };
    const tm = setTimeout(fin, 1250); setTimeout(() => { document.addEventListener('pointerdown', fin, true); document.addEventListener('keydown', fin, true); }, 60); }
  else { fxQ = []; flow(); TUT.ev('sitrep'); }
}

// ------------------------------------------------------------- first-run tutorial (coach marks)
const TUT = (function () {
  const KEY = 'ecb_tut';
  const noModal = () => !$('#modal') && !!$('#app') && !fxBusy;
  const STEPS = [
    { id:'crisis', when:() => !!(S && S.crisis && $('#modal .opts')), target:'#modal .opts', place:'top', title:'A crisis', text:'Most weeks start with a crisis. Pick one of the choices. Each one says what it costs and what it does.', until:'crisis' },
    { id:'map', when:noModal, target:'.mapwrap', title:'The world map', text:'Red regions are infected. The blue marker is your brigade. Tap any region to see it up close.', next:'Next' },
    { id:'hand', when:noModal, target:'#hand', title:'Your orders', text:'These cards are your orders for the week. Tap one to play it. Each card costs Command Points, the amber dots on the left.', until:'card', next:'Skip' },
    { id:'ato', when:noModal, target:'#b-ato', title:'Air tasking (free)', text:'Once a week your helicopters can fly a mission for free. Tap Air Tasking and pick one.', until:'ato', next:'Skip' },
    { id:'eng', when:noModal, target:'#b-eng', title:'Engineers (free)', text:'Your engineers can also do one week of building where the brigade is. Tap Engineers and pick a project.', until:'eng', next:'Skip' },
    { id:'end', when:noModal, target:'#b-end', title:'End the week', text:'When you are done, press End Week. The outbreak spreads, the labs research, and you get a report.', until:'end' },
    { id:'sitrep', when:() => !!$('#modal #b-cont'), target:'#modal .sit-items', place:'top', title:'Situation report', text:'This is what happened this week: good news in green, bad news in red. Press Continue to see it on the map.', until:'sitrep' },
    { id:'region', when:noModal, target:'#reg', title:'Region card', text:'This card shows the region you picked, including its Host forces: the local army and police who do most of the fighting. Your brigade makes them fight harder. Pick another region on the map to move the brigade there or send a Task Force.', next:'Next' },
    { id:'posture', when:noModal, target:'.posture', pre:() => { if (tab !== 'brigade') { tab = 'brigade'; renderSide(); } }, title:'Posture', text:'Posture is what your troops do on their own every week. Assault kills more, Hold stops the spread, Relief saves civilians.', next:'Next' },
    { id:'dir', when:noModal, target:'#dir', title:'HQ directive', text:'Higher command gives you goals with a deadline. Finish them for a reward and a new card.', next:'Next' },
    { id:'done', when:noModal, target:null, title:'You are ready', text:'Keep the labs safe until cure research reaches 100%. Finish week 2 on your own. How to Play and these tips are in the Menu any time.', next:'Got it' },
  ];
  // one-time tips for things that only happen later in a run; each shows the first time it comes up
  const inDeck = cls => () => !!$('#modal .deckgrid .card.' + cls);
  const EXTRA = [
    { id:'dirnew', when:() => noModal() && !!(S && S.directive) && !!$('#dir .t'), target:'#dir', title:'New HQ directive', text:'This box shows what higher command wants and how many weeks you have. Do it before the deadline to earn Command Trust and a new card. If time runs out you lose Trust and Morale.' },
    { id:'reward', when:() => !!$('#modal .rewards'), target:'#modal .rewards', place:'top', title:() => S && S.pendingReward && S.pendingReward.reason === 'Directive complete' ? 'Directive complete' : 'New orders', text:'Tap one card to add it to your deck. Or use the buttons at the bottom: upgrade a card you already have, remove a weak card, or take a supply drop.' },
    { id:'remove', when:inDeck('rm'), target:'#modal .deckgrid', place:'top', title:'Remove a card', text:'Tap the card you want gone. It leaves your deck for good, so your better cards come up more often. Tap Back if you change your mind.' },
    { id:'upgrade', when:inDeck('upc'), target:'#modal .deckgrid', place:'top', title:'Upgrade a card', text:'Tap a card to make it cost 1 Command Point less for the rest of the run. Upgraded cards have a + after their name. Tap Back if you change your mind.' },
    { id:'stabhow', when:() => noModal() && !!S && S.turn >= 2 && !!$('#reg .check.stab'), target:'#reg .check.stab', title:'Stabilize a region', text:'Raise containment and quarantine here and keep the infection low. When all three are checked, the region holds on its own for a while, so you can move the brigade to the next trouble spot.' },
    { id:'stabbed', when:() => noModal() && !!S && E.REGIONS.some(r => S.regions[r.id].stab > 0), target:'.mapwrap', title:'Region stabilized', text:'The blue shield on the map marks a stable region. It keeps itself under control for about 6 weeks after you leave. Send the brigade where it is needed next, and come back before the time runs out.' },
    { id:'burn', when:() => noModal() && !!S && S.turn >= 3 && !!$('#hand .burn'), target:'#hand .burn', title:'Burn a card', text:'Cards you don\'t play stay in your hand for next week. Don\'t want one? Tap its flame button twice. It goes to the discard pile, and you draw a fresh card in its place next week.' },
  ];
  const XKEY = 'ecb_tips';
  let step = -1, box = null, hl = null, shownStep = -1, curX = null;
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const put = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  const seen = () => { try { return new Set(JSON.parse(localStorage.getItem(XKEY) || '[]')); } catch (e) { return new Set(); } };
  const markSeen = id => { const s2 = seen(); s2.add(id); try { localStorage.setItem(XKEY, JSON.stringify([...s2])); } catch (e) {} };
  function maybeStart() { const v = get(); if (v === 'done' || v === 'skip') return sync(); if (v != null && !isNaN(+v)) { step = +v; sync(); return; } if (S && S.turn <= 1) start(false); }
  function start(replay) { step = replay && !(S && S.crisis && $('#modal .opts')) ? 1 : 0; shownStep = -1; curX = null; if (replay) { try { localStorage.removeItem(XKEY); } catch (e) {} } put(String(step)); sync(); }
  function finish(skipAll) { step = -1; curX = null; put(skipAll === true ? 'skip' : 'done'); hide(); }
  function advance() { step++; shownStep = -1; if (step >= STEPS.length) return finish(); put(String(step)); sync(); }
  function closeX() { curX = null; shownStep = -1; hide(); sync(); }
  // which tip should be on screen right now: the guided tour first, then any one-time tip
  function current() {
    if (step >= 0) { const st = STEPS[step]; if (st && st.when()) { curX = null; return { st, key:'m' + step, label:`Tip ${step + 1} of ${STEPS.length}`, main:true }; } }
    if (get() === 'skip' || !S) return null;
    if (curX && !curX.when()) curX = null;
    if (!curX) { const sn = seen(); curX = EXTRA.find(x => !sn.has(x.id) && x.when()) || null; if (curX) markSeen(curX.id); }
    return curX ? { st:curX, key:'x' + curX.id, label:'New tip', main:false } : null;
  }
  function ev(name) { if (step < 0) return; const st = STEPS[step]; if (st && st.until === name) advance(); }
  function hide() { if (box) box.style.display = 'none'; if (hl) { hl.classList.remove('tut-hl'); hl = null; } }
  function sync() { requestAnimationFrame(draw); }
  function draw() {
    if (!S) return hide();
    const cur = current(); if (!cur) return hide();
    const st = cur.st;
    if (st.pre && shownStep !== cur.key) st.pre();
    const tgt = st.target ? document.querySelector(st.target) : null;
    if (!box) { box = document.createElement('div'); box.id = 'tut'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    if (shownStep !== cur.key) {
      const title = typeof st.title === 'function' ? st.title() : st.title;
      const nextLbl = cur.main ? st.next : 'Got it';
      box.innerHTML = `<div class="tut-k">${cur.label}</div><div class="tut-t">${title}</div><p>${st.text}</p><div class="tut-b">${nextLbl ? `<button class="btn sm" id="tut-next">${nextLbl}</button>` : ''}<button class="tut-skip" id="tut-skip">${cur.main ? 'Skip all tips' : 'Turn off tips'}</button></div><i class="tut-arrow"></i>`;
      box.querySelector('#tut-skip').onclick = () => finish(true); const nb = box.querySelector('#tut-next'); if (nb) nb.onclick = cur.main ? advance : closeX;
      if (tgt && window.innerWidth <= 820) { const r = tgt.getBoundingClientRect(); if (r.top < 60 || r.bottom > window.innerHeight - 60) tgt.scrollIntoView({ block:'center', behavior:'smooth' }); setTimeout(sync, 420); }
      shownStep = cur.key;
    }
    if (hl && hl !== tgt) hl.classList.remove('tut-hl'); hl = tgt; if (hl && st.target !== '.mapwrap') hl.classList.add('tut-hl');
    box.style.display = 'block';
    const vw = window.innerWidth, vh = window.innerHeight, bw = Math.min(330, vw - 24); box.style.width = bw + 'px';
    const bh = box.offsetHeight; const arrow = box.querySelector('.tut-arrow');
    if (!tgt) { box.style.left = (vw - bw) / 2 + 'px'; box.style.top = Math.max(12, (vh - bh) / 2) + 'px'; arrow.style.display = 'none'; return; }
    if (st.place === 'top') { const dlg = document.querySelector('#modal .dlg'); const dr = dlg ? dlg.getBoundingClientRect() : null; const wide = dr && dr.left > bw + 24; box.style.left = (wide ? Math.max(12, dr.left - bw - 16) : (vw - bw) / 2) + 'px'; box.style.top = (wide ? Math.max(12, dr.top + 40) : 10) + 'px'; arrow.style.display = 'none'; return; }
    const r = tgt.getBoundingClientRect(); let top, below;
    if (st.target === '.mapwrap') { top = Math.max(12, r.top + Math.min(r.height * .55, r.height - bh - 12)); below = null; }
    else if (r.bottom + bh + 18 < vh) { top = r.bottom + 12; below = true; }
    else if (r.top - bh - 18 > 0) { top = r.top - bh - 12; below = false; }
    else { top = Math.max(12, vh - bh - 12); below = null; }
    const cx = Math.min(Math.max(r.left + r.width / 2, 20), vw - 20); const left = Math.min(Math.max(12, cx - bw / 2), vw - bw - 12);
    box.style.left = left + 'px'; box.style.top = top + 'px';
    if (below === null) arrow.style.display = 'none'; else { arrow.style.display = 'block'; arrow.className = 'tut-arrow ' + (below ? 'up' : 'down'); arrow.style.left = Math.min(Math.max(14, cx - left), bw - 14) + 'px'; }
  }
  return { start, maybeStart, ev, sync, finish, active:() => step >= 0 || !!curX };
})();
window.addEventListener('scroll', () => TUT.sync(), { passive:true });

// ------------------------------------------------------------- flow
function save() { if (S && !S.over) put(SAVE_KEY, S); }
function flow() {
  render(); save(); closeModal();
  if (S.over) { if (!S.endFilm && introOn() && CINE.hasEnding(S)) { S.endFilm = true; save(); return CINE.ending(S, showGameOver); } return showGameOver(); }
  if (pendingSitrep) return showSitrep();
  if (S.cureChoice) return showCureChoice();
  if (S.pendingReward) return showReward();
  if (S.pendingDoctrine) return showBoard();
  if (S.crisis) return showCrisis();
}
function doEndTurn() {
  if (S.crisis) { showCrisis(); return; }
  const before = { loc:S.b.loc, tf:S.b.tf && S.b.tf.loc, z:S.regions[S.b.loc].z, tz:S.b.tf ? S.regions[S.b.tf.loc].z : 0, rest:E.REGIONS.filter(r => S.regions[r.id].restored).map(r => r.id) };
  const rep = E.endTurn(S); if (!rep) return;
  SFX.play(rep.fell.length ? 'alarm' : 'drum'); TUT.ev('end');
  if (before.z > .002) fxQ.push(() => fxFlash(before.loc, 6));
  if (before.tf && before.tz > .002) fxQ.push(() => fxFlash(before.tf, 4));
  for (const id of rep.fell) fxQ.push(() => fxPulse(id, '#ff4a3a', 3));
  const nowRest = E.REGIONS.filter(r => S.regions[r.id].restored && !before.rest.includes(r.id)).map(r => r.id);
  if (nowRest.length) { fxQ.push(() => SFX.play('chime')); for (const id of nowRest) fxQ.push(() => fxPulse(id, '#6fe0a0', 3)); }
  if (rep.stab && rep.stab.length) { fxQ.push(() => SFX.play('chime')); for (const id of rep.stab) fxQ.push(() => fxPulse(id, '#a9c9ff', 3)); }
  pendingSitrep = rep; sel = null; flow();
}
function showCrisis() {
  const e = E.EVENTS[S.crisis.id]; const opts = E.crisisOptions(S); const col = KIND_COLOR[e.kind] || 'var(--amber)';
  let text = ''; try { text = e.text(S, S.crisis.ctx); } catch (x) { text = ''; }
  const m = openModal(`<div class="crisis-art">${ART.svg(S.crisis.id, e.kind, '', true)}</div><div class="dlg-h"><div><div class="k" style="color:${col}">Crisis · ${e.kind} · Week ${S.turn}</div><h2>${esc(e.title)}</h2></div></div>
    <div class="dlg-b"><p>${text}</p><div class="opts">${opts.map(o => `<button class="opt" data-i="${o.i}" ${o.ok ? '' : 'disabled'}><span class="num">${o.i + 1}</span><span><span class="ol">${esc(o.label)}</span><div class="of">${esc(o.fx)}${o.ok ? '' : ` <span class="why">Unavailable: ${esc(o.why)}</span>`}</div></span></button>`).join('')}</div></div>`, '', k => { const n = +k - 1; const o = opts[n]; if (o && o.ok) choose(n); });
  const key = S.turn + ':' + S.crisis.id; if (crisisSnd !== key) { crisisSnd = key; SFX.play('radio'); }
  const choose = i => { const r = E.resolveCrisis(S, i); if (r.ok) { toast(r.msg); SFX.play('click'); TUT.ev('crisis'); } flow(); };
  for (const b of $$('.opt', m)) b.onclick = () => choose(+b.dataset.i);
  if (!opts.some(o => o.ok)) { S.crisis = null; flow(); }
}
function showCureChoice() {
  const sv = E.survivors(S), n = E.fallenCount(S);
  const m = openModal(`<div class="crisis-art">${ART.svg('cure', 'CURE', '', true)}</div><div class="dlg-h"><div><div class="k" style="color:var(--t-cure)">Victory · Week ${S.turn}</div><h2>Cure Synthesized</h2></div></div>
    <div class="dlg-b"><p>The labs have a working cure for <b>${esc(S.path.name)}</b>. You have already won. ${fmtPop(sv)} people survived, and ${n} ${n === 1 ? 'region has' : 'regions have'} fallen.</p>
      <p>You can end the run here, or lead <b>Phase II: Restoration</b>. You get ${E.RESTORE_WEEKS} more weeks to spread the cure, cure the infected, reclaim fallen regions and restore order. Every region you restore adds to your score.</p>
      <div class="opts">
        <button class="opt" id="c-go"><span class="num">1</span><span><span class="ol">Begin Restoration</span><div class="of">${E.RESTORE_WEEKS} more weeks. New cure and rebuilding orders join your deck. Trust +15, Morale +20.</div></span></button>
        <button class="opt" id="c-end"><span class="num">2</span><span><span class="ol">End the run here</span><div class="of">Take the victory and see your score.</div></span></button>
      </div></div>`, '', k => { if (k === '1') go(); if (k === '2') end(); });
  const go = () => { E.beginRestoration(S); toast('Phase II: Restoration has begun.'); tab = 'regions'; flow(); };
  const end = () => { E.endAtCure(S); flow(); };
  $('#c-go', m).onclick = go; $('#c-end', m).onclick = end;
}
function showSitrep() {
  const rep = pendingSitrep; pendingSitrep = null;
  const dh = rep.after.h - rep.before.h, dz = rep.after.z - rep.before.z, dr = rep.after.research - rep.before.research, dp = rep.after.pers - rep.before.pers;
  const items = [...rep.items].sort((a, b) => ({ bad:0, good:1, info:2 }[a.k] - { bad:0, good:1, info:2 }[b.k]));
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--amber)">Situation report · ${dateOf(rep.turn)}</div><h2>Week ${rep.turn} SITREP</h2></div></div>
    <div class="dlg-b"><div class="sit-top">
      <div class="stat"><span class="lbl">Survivors</span><span class="v mono ${dh < -1 ? 'bad' : ''}">${dh < 0 ? '−' : '+'}${fmtPop(Math.abs(dh))}</span></div>
      <div class="stat"><span class="lbl">Infected</span><span class="v mono ${dz > 0 ? 'bad' : 'good'}">${dz >= 0 ? '+' : '−'}${fmtPop(Math.abs(dz))}</span></div>
      ${rep.phase === 'restore' ? `<div class="stat"><span class="lbl">Regions restored</span><span class="v mono good">${rep.restoredAfter}/${E.REGIONS.length}${rep.restoredAfter > rep.restoredBefore ? ` <small>+${rep.restoredAfter - rep.restoredBefore}</small>` : ''}</span></div>` : `<div class="stat"><span class="lbl">Cure research</span><span class="v mono good">+${dr.toFixed(1)}%</span></div>`}
      <div class="stat"><span class="lbl">Brigade</span><span class="v mono ${dp < 0 ? 'bad' : ''}">${dp <= 0 ? '−' : '+'}${Math.abs(dp)}</span></div></div>
      <div class="sit-items">${items.map(i => `<div class="${i.k}">${esc(i.t)}</div>`).join('') || '<div>A quiet week.</div>'}</div></div>
    <div class="dlg-f"><button class="btn" id="b-cont">Continue</button></div>`, '', k => { if (k === 'Enter' || k === ' ') afterSitrep(); });
  $('#b-cont', m).onclick = afterSitrep;
}
function showReward() {
  const pr = S.pendingReward; if (rewardSnd !== S.turn) { rewardSnd = S.turn; SFX.play('chime'); }
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--good)">${esc(pr.reason)}</div><h2>Choose a new order</h2></div></div>
    <div class="dlg-b"><p class="note" style="font-size:14px">Higher command is sending reinforcements and new capabilities. Pick one card to add to your deck.</p><div class="rewards">${pr.options.map(id => cardHTML(id, { cls:'big', attr:`data-id="${id}"` })).join('')}</div></div>
    <div class="dlg-f"><button class="btn ghost" id="b-up">Upgrade a card instead</button><button class="btn ghost" id="b-rm">Remove a card instead</button><button class="btn ghost" id="b-sup">Take a supply drop (+15 supply, +10 ammo)</button></div>`, 'wide');
  for (const b of $$('.rewards .card', m)) b.onclick = () => { E.takeReward(S, b.dataset.id); toast(E.cardName(b.dataset.id) + ' added to your deck.'); flow(); };
  $('#b-sup', m).onclick = () => { E.takeReward(S, 'supply'); flow(); };
  $('#b-rm', m).onclick = () => showDeck(true);
  $('#b-up', m).onclick = () => showDeck('upgrade');
}
function showDeck(mode) {
  const upMode = mode === 'upgrade', rmMode = mode === true;
  let list = E.deckList(S).slice().sort((a, b) => E.def(a).type.localeCompare(E.def(b).type) || a.localeCompare(b));
  if (upMode) list = [...new Set(list.filter(E.canUpgrade))];
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--amber)">${rmMode ? 'Trim the deck' : upMode ? 'Upgrade' : 'Your deck'}</div><h2>${rmMode ? 'Remove one card' : upMode ? 'Upgrade one card' : list.length + ' orders'}</h2></div><button class="hbtn" id="b-x">${mode ? 'Back' : 'Close'}</button></div>
    <div class="dlg-b">${upMode ? '<p class="note" style="font-size:14px">An upgraded card costs 1 Command Point less, permanently. Pick one.</p>' : ''}<div class="deckgrid">${list.map(id => cardHTML(upMode ? id + '+' : id, { cls: rmMode ? 'rm' : upMode ? 'upc' : '', attr:`data-id="${id}"` })).join('') || '<p class="note">No cards can be upgraded right now.</p>'}</div>
    ${S.deck.exhausted.length ? `<p class="note" style="margin-top:12px">Used up: ${S.deck.exhausted.map(id => esc(E.cardName(id))).join(', ')}</p>` : ''}
    ${(S.deck.burned || []).length ? `<p class="note" style="margin-top:6px">Burned: ${S.deck.burned.map(id => esc(E.cardName(id))).join(', ')}</p>` : ''}</div>`, 'wide');
  $('#b-x', m).onclick = () => mode ? showReward() : closeModal();
  if (rmMode) for (const b of $$('.deckgrid .card', m)) b.onclick = () => { E.takeReward(S, 'remove:' + b.dataset.id); flow(); };
  else if (upMode) for (const b of $$('.deckgrid .card', m)) b.onclick = () => { E.takeReward(S, 'upgrade:' + b.dataset.id); toast(`${E.cardName(b.dataset.id)}+ now costs ${E.costOf(b.dataset.id + '+')}.`); flow(); };
  else for (const b of $$('.deckgrid .card', m)) b.onclick = () => {};
}
function showBoard() {
  const pd = S.pendingDoctrine;
  const m = openModal(`<div class="crisis-art">${ART.svg('rally', 'COMMAND', '', true)}</div><div class="dlg-h"><div><div class="k" style="color:var(--t-command)">Promotion Board · Week ${pd.week}</div><h2>Choose a doctrine</h2></div></div>
    <div class="dlg-b"><p>Your staff has earned a say in how this war is fought. Pick one doctrine. It lasts for the rest of the campaign.</p>
    <div class="opts">${pd.options.map((id, i) => `<button class="opt" data-d="${id}"><span class="num">${i + 1}</span><span><span class="ol">${esc(E.DOCTRINES[id].name)}</span><div class="of">${esc(E.DOCTRINES[id].text)}</div></span></button>`).join('')}</div>
    ${(S.doct || []).length ? `<p class="note" style="margin-top:12px">Already adopted: ${S.doct.map(id => esc(E.DOCTRINES[id].name)).join(', ')}</p>` : ''}</div>`, '', k => { const id = pd.options[+k - 1]; if (id) pickD(id); });
  const pickD = id => { const r = E.takeDoctrine(S, id); if (r.ok) toast(r.msg); flow(); };
  for (const b of $$('.opt', m)) b.onclick = () => pickD(b.dataset.d);
}
function showGameOver() {
  const o = S.over; const mt = meta();
  if (!S.recorded) { S.recorded = true; S.unlockedNow = mt.maxWeeks < 20 && S.turn >= 20; mt.runs++; if (o.win) mt.wins++; mt.best = Math.max(mt.best, o.score); mt.maxWeeks = Math.max(mt.maxWeeks, S.turn); put(META_KEY, mt); drop(SAVE_KEY); }
  const cpg = S.camp ? recordOp() : null;
  const sv = E.survivors(S);
  const unlockedNow = !!S.unlockedNow;
  const art = o.win ? ART.svg(S.phase === 'restore' ? 'restore_gov' : 'cure', S.phase === 'restore' ? 'CIVIL' : 'CURE', '', true) : ART.svg(o.title === 'Mutiny' ? 'mutiny' : o.title === 'Relieved of Command' ? 'inquiry' : 'horde', o.title === 'Mutiny' || o.title === 'Relieved of Command' ? 'COMMAND' : 'COMBAT', '', true);
  const m = openModal(`<div class="crisis-art">${art}</div><div class="dlg-h"><div><div class="k" style="color:${o.win ? 'var(--good)' : 'var(--hostile)'}">${o.win ? 'Victory' : 'Defeat'} · Week ${S.turn}</div><h2>${esc(o.title)}</h2></div></div>
    <div class="dlg-b"><p>${esc(o.text)}</p>
      <div class="sit-top">
        <div class="stat"><span class="lbl">Score</span><span class="v mono" style="color:var(--amber)">${o.score.toLocaleString()}</span></div>
        <div class="stat"><span class="lbl">Survivors</span><span class="v mono">${fmtPop(sv)}</span></div>
        ${S.phase === 'restore' ? `<div class="stat"><span class="lbl">Regions restored</span><span class="v mono" style="color:var(--t-cure)">${E.restoredCount(S)}/${E.REGIONS.length}</span></div>` : `<div class="stat"><span class="lbl">Cure research</span><span class="v mono">${Math.min(100, S.research).toFixed(0)}%</span></div>`}
        <div class="stat"><span class="lbl">Weeks</span><span class="v mono">${S.turn}</span></div>
        <div class="stat"><span class="lbl">Infected destroyed</span><span class="v mono">${fmtPop(S.stats.kills)}</span></div>
        <div class="stat"><span class="lbl">${S.phase === 'restore' ? 'Infected cured' : 'Civilians saved'}</span><span class="v mono">${fmtPop(S.phase === 'restore' ? (S.stats.cured || 0) : S.stats.saved)}</span></div>
        <div class="stat"><span class="lbl">Regions stabilized</span><span class="v mono" style="color:var(--stab)">${E.REGIONS.filter(r => S.regions[r.id].stabbed).length}</span></div>
        <div class="stat"><span class="lbl">Brigade losses</span><span class="v mono">${S.stats.kia.toLocaleString()}</span></div>
        <div class="stat"><span class="lbl">Best score</span><span class="v mono">${mt.best.toLocaleString()}</span></div>
      </div>
      <p class="note">${esc(E.CMD[S.cmd].name)} · ${E.DIFFS[S.diff].name} · seed <span class="mono">${esc(S.seed)}</span> · regions fallen ${E.fallenCount(S)} · directives ${S.stats.directivesWon} won, ${S.stats.directivesLost} failed</p>
      ${unlockedNow ? '<p style="color:var(--amber)">Lt. Gen. Frank Garrison (Hardliner) is now available as a commander.</p>' : ''}
    ${cpg ? `<p class="note" style="color:var(--amber)">Campaign · ${opName(cpg, S.camp.op)} · record ${cpg.wins}–${cpg.losses}${cpg.stage === 'over' ? ' · the campaign is over' : ''}</p>` : ''}</div>
    <div class="dlg-f">${CINE.hasEnding(S) ? '<button class="btn ghost" id="b-endfilm">Watch the ending</button>' : ''}<button class="btn ghost" id="b-look">Look at the map</button>${cpg ? `<button class="btn" id="b-camp">${cpg.stage === 'debrief' ? 'Continue the campaign' : 'Campaign results'}</button>` : '<button class="btn ghost" id="b-same">Retry same seed</button><button class="btn" id="b-new">New run</button>'}</div>`);
  $('#b-look', m).onclick = closeModal; const bef = $('#b-endfilm', m); if (bef) bef.onclick = () => { closeModal(); CINE.ending(S, showGameOver); };
  if (cpg) $('#b-camp', m).onclick = () => cpg.stage === 'debrief' ? showDebrief() : showCampaignEnd();
  else { $('#b-same', m).onclick = () => startGame({ cmd:S.cmd, diff:S.diff, seed:S.seed }); $('#b-new', m).onclick = showTitle; }
}
function showMenu() {
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--amber)">Seed ${esc(S.seed)} · progress saves every action</div><h2>Menu</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><div class="opts">
      <button class="opt" id="m-how"><span class="num">?</span><span><span class="ol">How to play</span><div class="of">Rules, cards and win conditions.</div></span></button>
      <button class="opt" id="m-film"><span class="num">▶</span><span><span class="ol">Replay the opening cinematic</span><div class="of">Watch this run's intro again.</div></span></button>
      <button class="opt" id="m-tut"><span class="num">i</span><span><span class="ol">Show the tutorial tips</span><div class="of">Walk through the basics again, step by step.</div></span></button>
      <button class="opt" id="m-snd"><span class="num">♪</span><span><span class="ol">Sound: ${SFX.isMuted() ? 'off' : 'on'}</span><div class="of">Gunfire, helicopters, radio and alarms. Tap to switch.</div></span></button>
      <button class="opt" id="m-oob"><span class="num">≡</span><span><span class="ol">Brigade order of battle</span><div class="of">What the ECB is made of.</div></span></button>
      <button class="opt" id="m-title"><span class="num">⌂</span><span><span class="ol">Title screen</span><div class="of">Your run stays saved. Continue it from the title screen.</div></span></button>
      <button class="opt" id="m-quit"><span class="num">×</span><span><span class="ol">${S.camp ? 'Abandon this operation' : 'Abandon this run'}</span><div class="of">${S.camp ? 'Ends the operation and the whole campaign.' : 'Ends the run now and counts it as a loss.'}</div></span></button>
    </div></div>`);
  $('#b-x', m).onclick = closeModal; $('#m-how', m).onclick = showHowTo; $('#m-film', m).onclick = () => { closeModal(); CINE.play(S, enterGame); }; $('#m-oob', m).onclick = showOOB; $('#m-tut', m).onclick = () => { closeModal(); TUT.start(true); }; $('#m-snd', m).onclick = () => { SFX.setMuted(!SFX.isMuted()); sndBtn(); $('#m-snd .ol', m).textContent = 'Sound: ' + (SFX.isMuted() ? 'off' : 'on'); if (!SFX.isMuted()) SFX.play('click'); }; $('#m-title', m).onclick = showTitle;
  $('#m-quit', m).onclick = () => { $('#m-quit', m).querySelector('.ol').textContent = 'Tap again to confirm'; $('#m-quit', m).onclick = () => { S.over = { win:false, title:'Run Abandoned', text:'You handed over command.' }; S.over.score = E.score(S); flow(); }; };
}
function howHTML() {
  return `<div class="howto"><ol>
    <li><b>Goal:</b> keep the world alive until the research labs finish a cure (the green bar at the top reaches 100%).</li>
    <li><b>Each week</b> your hand fills back up to 5 order cards and you get Command Points (the amber dots). Click a card to play it. Most cards act on the region where your brigade is deployed. Cards you don't play stay in your hand for next week.</li>
    <li><b>Crises</b> pop up most weeks. Pick one of the choices. Each choice shows what it costs.</li>
    <li><b>The map</b> shows every region's infection. Click a region to inspect it, then press <b>Deploy here</b> to move the brigade (costs Command Points and fuel).</li>
    <li><b>Host-nation forces</b> (Host forces on the region card) are each region's own army and police. They do most of the fighting everywhere. Where the brigade is deployed they fight 45% harder, 25% harder with a Task Force, and they wear down more slowly. Heavy infection grinds them down, and a badly infected region whose forces collapse falls. Train and Equip and Partner Force Liaison rebuild them.</li>
    <li><b>Two free jobs every week</b> (buttons under the Command Points): <b>Air tasking</b> flies one aviation mission (scout with drones, a gun run, MEDEVAC, heavy lift, or stand down to rest the crews), and <b>Engineers</b> put a week of work into a Barrier Line, Fire Base, Field Hospital or Supply Depot where the brigade is. Neither costs Command Points.</li>
    <li><b>Posture</b> sets what the brigade does on its own every week: Assault kills more, Hold contains the spread and mans checkpoints (quarantine up), Relief saves civilians.</li>
    <li><b>Stabilize regions, then move on.</b> Containment builds up week after week where your troops work, and fades slowly after they leave. Get a region to containment 50%+, quarantine 35%+ and infected under 3% and it becomes <b>Stabilized</b> (blue shield on the map). A stable region holds on its own for about ${E.STAB.weeks} weeks after you leave, so you can take the brigade to the next trouble spot. The region card shows a checklist. The first time each region is stabilized you get Trust +3 and score points.</li>
    <li><b>Press End Week.</b> The outbreak spreads, labs work, your stocks are resupplied, and you get a situation report.</li>
    <li><b>Phase II: Restoration.</b> When the cure is found you can stop and take the win, or keep going for ${E.RESTORE_WEEKS} more weeks. The cure spreads from the labs. Cure the infected, reclaim fallen regions and restore order. A region is restored when infected are under 0.5%, civil order is 50 or more, and cure coverage is 50% or more. Each restored region turns green and adds to your score.</li>
    <li><b>Protect the labs</b> (hexagon icons). Labs work faster in calm regions and with your brigade on site. Recover Tissue Samples speeds the cure.</li>
    <li><b>HQ directives</b> give you a goal with a deadline. Finish them for Trust and a new card. Every 4 weeks you also pick a new card.</li>
    <li><b>You lose if</b> survivors fall below 20%, the brigade is wiped out, Morale or Command Trust hits 0, or every lab is overrun.</li>
    <li><b>Watch Exposure.</b> Fighting in infected regions builds it. At 100 the brigade has an outbreak of its own. Decon and MEDEVAC cards bring it down.</li>
    <li><b>Battalions</b> each have a named commander with a trait (shown in the Brigade tab). They gain experience from fighting: Green, Blooded, Veteran, Elite. Higher ranks kill more and lose fewer soldiers. Commanders can be killed when their battalion takes heavy losses.</li>
    <li><b>Task Force:</b> click any region and press <b>Send Task Force</b> to detach your strongest battalion there. It fights on its own every week. Your main body is a third weaker while it is away. You can move it straight to another region any time (Redeploy Task Force in the Brigade tab, or Move Task Force here on a region card) without recalling it first. Recall it from the region card or the Brigade tab.</li>
    <li><b>Promotion Board:</b> every ${6} weeks you pick a permanent doctrine, such as stronger artillery, bigger resupply or extra cards each week.</li>
    <li><b>Upgrades:</b> when you get a new card, you can instead upgrade one you have. Upgraded cards cost 1 Command Point less.</li>
    <li><b>Seasons and chokepoints:</b> winter slows the infected in cold regions. Five regions hold strategic chokepoints (anchor icons): Panama, Suez, Malacca, Hormuz and the Bosporus. Each one that falls shrinks your resupply.</li>
    <li><b>Burn cards</b> you don't want with the flame button on a card in your hand (tap it twice). The card goes to the discard pile. It stays in your deck and comes back later, but its slot fills with a fresh card next week. To take a card out of your deck for good, use Remove a card on a reward screen.</li>
    <li><b>Shortcuts:</b> keys 1–9 play cards or pick crisis choices, A opens air tasking, G opens engineers, E ends the week.</li>
    <li><b>Sound and tips:</b> the speaker button at the top turns sound on or off. The Menu can replay the tutorial tips.</li>
    <li><b>Campaign mode</b> (Start campaign on the title screen): 3, 4 or 5 operations in a row with the same brigade. Your maneuver battalions keep their experience and commanders, lost soldiers are only partly replaced, doctrines stay adopted, and each outbreak is a bit more infectious. Between operations you pick a refit. A second failed operation, or the brigade being wiped out, mutinying or you being relieved, ends the campaign.</li>
    <li><b>Movies:</b> an opening movie plays when a run starts and an ending movie when it ends, different for each kind of win or loss. Turn both off on the title screen. Replay them from the Menu or the end screen.</li>
  </ol></div>`;
}
function showHowTo() { const m = openModal(`<div class="dlg-h"><h2>How to play</h2><button class="hbtn" id="b-x">Close</button></div><div class="dlg-b">${howHTML()}</div>`, 'wide'); $('#b-x', m).onclick = () => S && $('#app') ? closeModal() : closeModal(); }
function showOOB() {
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--friend)">Order of battle</div><h2>Expeditionary Combat Brigade</h2></div><button class="hbtn" id="b-x">Close</button></div><div class="dlg-b">
    <p>A self-sufficient mechanized brigade built like a giant Marine Expeditionary Unit. About 4,800 personnel on the Modular Combat Vehicle family.</p>
    <div class="oob">EXPEDITIONARY COMBAT BRIGADE
├── Brigade HQ (MCV-C)
├── 1st / 2nd / 3rd Maneuver Bn  (MCV-M/I, 12-person squads)
│   ├── 3 maneuver companies (2 standard + 1 specialized platoon)
│   └── 4th Support Co: 120mm Indirect Fire (MCV-M/F), Engineer,
│       Heavy Weapons, Scout (snipers, QRF squads)
├── Artillery Bn (MCV-H/155)
├── Air Defense Bn (MCV-M/A)
├── Aviation Group: 4 attack, 5 multirole, 2 heavy helicopters
│   └── UAS Squadron (Tier 1 / 2 / 3)
├── Aviation Security Co (air assault QRF)
├── Transportation Group (general + armored transport)
└── Brigade Support: Medical, Maintenance, Intelligence, Signal,
    Electronic Warfare, CBRN, EOD, Military Police</div></div>`, 'wide');
  $('#b-x', m).onclick = closeModal;
}

// ------------------------------------------------------------- title
function titleMap() {
  let s = `<svg class="t-map" viewBox="0 0 ${MD.W} ${MD.H}" aria-hidden="true"><defs><radialGradient id="tg"><stop offset="0" stop-color="#e2483b" stop-opacity=".9"/><stop offset="1" stop-color="#e2483b" stop-opacity="0"/></radialGradient></defs><path d="${MD.grat}" fill="none" stroke="#172429" stroke-width=".6"/>`;
  const hot = { WAF:.8, CAF:.6, NAF:.35, EAF:.5, MDE:.25, SEU:.15, SAF:.2 };
  for (const r of E.REGIONS) s += `<path d="${MD.regions[r.id].d}" fill="${hot[r.id] ? infColor(hot[r.id] * .2) : '#1d2b2a'}" stroke="#0c1316" stroke-width=".6"/>`;
  for (const [id, v] of Object.entries(hot)) { const [x, y] = E.RD[id].a; s += `<circle cx="${x}" cy="${y}" r="${30 * v + 10}" fill="url(#tg)" opacity=".5"/>`; }
  return s + '</svg>';
}
// ------------------------------------------------------------- campaign
const CAMP_KEY = 'ecb_campaign_v1';
const camp = () => get(CAMP_KEY);
const campActive = c => !!(c && (c.stage === 'play' || c.stage === 'debrief'));
const opName = (c, n) => `Operation ${n} of ${c.len}`;
function newCampaign(len) {
  const id = (titleOpts.seed || Math.floor(Math.random() * 1e9).toString(36).toUpperCase()).slice(0, 12);
  const c = { v:1, id, len, cmd:titleOpts.cmd, diff:titleOpts.diff, op:1, stage:'play', results:[], fallen:[], carry:null, wins:0, losses:0, outcome:null };
  put(CAMP_KEY, c); startOp(c);
}
function startOp(c) { startGame({ cmd:c.cmd, diff:c.diff, seed:`${c.id}-${c.op}`, camp:{ id:c.id, op:c.op, len:c.len }, carry:c.carry }); }
// called when an operation ends: log it, decide whether the campaign goes on, and work out what carries over
function recordOp() {
  const c = camp(); if (!S || !S.camp || !c || c.id !== S.camp.id) return c;
  if (S.campRecorded || c.op !== S.camp.op || c.stage !== 'play') return c;
  S.campRecorded = true; const o = S.over;
  c.results.push({ op:c.op, title:o.title, win:!!o.win, score:o.score || 0, weeks:S.turn, kia:S.stats.kia || 0, path:S.path.name, pz:E.RD[S.pz].name, refit:c.carry && c.carry.refit || null });
  if (o.win) c.wins++; else c.losses++;
  for (const f of (S.stats.fallenCdrs || [])) c.fallen.push(Object.assign({ op:c.op }, f));
  const goesOn = E.campaignGoesOn(o, c.losses);
  if (goesOn && c.op < c.len) { c.stage = 'debrief'; c.carry = E.campaignCarry(S); }
  else {
    c.stage = 'over'; c.outcome = o.title === 'Run Abandoned' ? 'abandoned' : !goesOn ? 'failed' : c.losses ? 'complete' : 'victory';
    c.score = Math.round(c.results.reduce((a, r) => a + r.score, 0) * (c.outcome === 'victory' ? E.CAMPAIGN.bonus : 1));
    const mt = meta(); mt.camps = (mt.camps || 0) + 1; if (c.outcome === 'victory' || c.outcome === 'complete') mt.campWins = (mt.campWins || 0) + 1; mt.bestCamp = Math.max(mt.bestCamp || 0, c.score); put(META_KEY, mt);
  }
  put(CAMP_KEY, c); return c;
}
function opRows(c) {
  return `<div class="oprows">${Array.from({ length:c.len }, (_, i) => { const r = c.results[i];
    return r ? `<div class="oprow ${r.win ? 'w' : 'l'}"><span class="mono">OP ${r.op}</span><span><b>${esc(r.title)}</b><br><span class="note">${esc(r.path)} from ${esc(r.pz)} · ${r.weeks} weeks · ${r.kia.toLocaleString()} lost</span></span><span class="mono">${r.score.toLocaleString()}</span></div>`
      : `<div class="oprow next"><span class="mono">OP ${i + 1}</span><span class="note">${i === c.results.length && c.stage !== 'over' ? 'Next' : 'Not played'}</span><span></span></div>`; }).join('')}</div>`;
}
function memorialHTML(c) {
  if (!c.fallen.length) return '';
  return `<div class="sec"><span class="lbl">In memory</span><ul class="memlist">${c.fallen.map(f => `<li>${esc(f.name)} <span class="note">· ${esc(f.unit)} · Op ${f.op}, week ${f.week}</span></li>`).join('')}</ul></div>`;
}
function carryHTML(c) {
  const k = c.carry; if (!k) return '';
  const bns = E.BNS.map(b => { const v = k.vet[b]; const rk = E.RANKS[E.rankIdxOf(v.xp)]; const tr = E.TRAITS[v.cdr.trait];
    return `<div class="crow"><span><b>${esc(E.UNITS[b].name)}</b><br><span class="note">${esc(v.cdr.name)} · ${esc(tr ? tr.name : '')}</span></span><span class="mono">${rk.name}<br><span class="note">${Math.round(v.xp)} XP</span></span><span class="mono">${Math.round(k.u[b] * 100)}%</span></div>`; }).join('');
  const others = Object.keys(k.u).filter(u => !E.BNS.includes(u)); const lowest = Math.min(...others.map(u => k.u[u]));
  const hl = Object.keys(k.heloMax).map(h => `${k.helo[h]}/${k.heloMax[h]} ${({ attack:'attack', multi:'multirole', heavy:'heavy' })[h]}`).join(' · ');
  return `<div class="sec"><span class="lbl">Your brigade going into ${opName(c, c.op + 1)}</span>
    <div class="crows"><div class="crow hd"><span>Battalion</span><span>Rank</span><span>Strength</span></div>${bns}</div>
    <p class="note" style="margin-top:6px">Other units at ${Math.round(lowest * 100)}% or better. Helicopters: ${hl}. Starting Trust ${k.trust}, Morale ${k.morale}.</p>
    <p class="note">Doctrines kept: ${k.doct.length ? k.doct.map(d => esc(E.DOCTRINES[d].name)).join(', ') : 'none yet'}.</p>
    <p class="note" style="color:#ff9a8e">The next outbreak is ${Math.round(E.CAMPAIGN.escal * c.op * 100)}% more infectious than the first.</p></div>`;
}
function showDebrief() {
  const c = camp(); if (!c || c.stage !== 'debrief') return showTitle();
  const last = c.results[c.results.length - 1];
  // three refit options, picked from the campaign seed so they don't change on reload
  let h = 7; for (const ch of c.id + c.op) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const ids = Object.keys(E.REFITS).sort((a, b) => ((h ^ a.length * 2654435761) % 97) - ((h ^ b.length * 2654435761) % 97) || a.localeCompare(b));
  const pickIds = []; for (let i = 0; pickIds.length < 3 && i < 20; i++) { const id = ids[(h + i * 7) % ids.length]; if (!pickIds.includes(id)) pickIds.push(id); }
  const m = openModal(`<div class="crisis-art">${ART.svg(last.win ? 'rotation' : 'cine_memorial', last.win ? 'LOGISTICS' : 'COMMAND', '', true)}</div>
    <div class="dlg-h"><div><div class="k" style="color:var(--amber)">Campaign · ${opName(c, c.op)} · record ${c.wins}–${c.losses}</div><h2>Between operations</h2></div></div>
    <div class="dlg-b">${opRows(c)}${carryHTML(c)}${memorialHTML(c)}
      <div class="sec"><span class="lbl">Refit before the next deployment · pick one</span><div class="opts">${pickIds.map((id, i) => `<button class="opt" data-r="${id}"><span class="num">${i + 1}</span><span><span class="ol">${esc(E.REFITS[id].name)}</span><div class="of">${esc(E.REFITS[id].text)}</div></span></button>`).join('')}</div></div>
      ${c.losses ? `<p class="note" style="color:#ff9a8e">One more failed operation ends the campaign.</p>` : ''}</div>`, 'wide', k => { const id = pickIds[+k - 1]; if (id) go(id); });
  const go = id => { const c2 = camp(); c2.carry = E.applyRefit(c2.carry, id); c2.op++; c2.stage = 'play'; put(CAMP_KEY, c2); toast(`${E.REFITS[id].name}. ${opName(c2, c2.op)} begins.`); startOp(c2); };
  for (const b of $$('.opt[data-r]', m)) b.onclick = () => go(b.dataset.r);
}
function showCampaignEnd() {
  const c = camp(); if (!c) return showTitle();
  const T = { victory:['Campaign won', 'Every operation succeeded. Score ×' + E.CAMPAIGN.bonus + '.', 'var(--good)'], complete:['Campaign complete', `${c.wins} of ${c.len} operations succeeded.`, 'var(--good)'], failed:['Campaign lost', 'The campaign ended early.', 'var(--hostile)'], abandoned:['Campaign abandoned', 'You handed over command.', 'var(--hostile)'] }[c.outcome] || ['Campaign over', '', 'var(--amber)'];
  const weeks = c.results.reduce((a, r) => a + r.weeks, 0), kia = c.results.reduce((a, r) => a + r.kia, 0);
  const m = openModal(`<div class="crisis-art">${ART.svg(c.outcome === 'victory' || c.outcome === 'complete' ? 'cine_home' : 'cine_memorial', c.outcome === 'victory' || c.outcome === 'complete' ? 'CIVIL' : 'COMMAND', '', true)}</div>
    <div class="dlg-h"><div><div class="k" style="color:${T[2]}">Campaign · ${c.len} operations · ${esc(E.CMD[c.cmd].name)} · ${E.DIFFS[c.diff].name}</div><h2>${T[0]}</h2></div></div>
    <div class="dlg-b"><p>${esc(T[1])}</p>
      <div class="sit-top"><div class="stat"><span class="lbl">Campaign score</span><span class="v mono" style="color:var(--amber)">${(c.score || 0).toLocaleString()}</span></div>
        <div class="stat"><span class="lbl">Record</span><span class="v mono">${c.wins}–${c.losses}</span></div><div class="stat"><span class="lbl">Weeks</span><span class="v mono">${weeks}</span></div>
        <div class="stat"><span class="lbl">Brigade losses</span><span class="v mono">${kia.toLocaleString()}</span></div><div class="stat"><span class="lbl">Best campaign</span><span class="v mono">${(meta().bestCamp || 0).toLocaleString()}</span></div></div>
      ${opRows(c)}${memorialHTML(c)}</div>
    <div class="dlg-f"><button class="btn" id="b-ctitle">Title screen</button></div>`, 'wide');
  $('#b-ctitle', m).onclick = () => { const c2 = camp(); if (c2) { c2.stage = 'archived'; put(CAMP_KEY, c2); } showTitle(); };
}
function showCampaignStart() {
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--amber)">${esc(E.CMD[titleOpts.cmd].name)} · ${E.DIFFS[titleOpts.diff].name}</div><h2>Start a campaign</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><ul class="clist">
      <li>Fight several outbreaks in a row with the same brigade and commander.</li>
      <li>Your three maneuver battalions keep their <b>experience and commanders</b>. Lost soldiers are only partly replaced, so losses carry over.</li>
      <li><b>Doctrines</b> you adopt stay for the whole campaign. Lost helicopters come back one at a time.</li>
      <li>Between operations you pick one refit: replacements, training, new airframes, political capital or stocks.</li>
      <li>Each new outbreak is 5% more infectious than the last.</li>
      <li>The campaign ends early if the brigade is wiped out, mutinies or you are relieved, or after a second failed operation. Win every operation for a ×${E.CAMPAIGN.bonus} campaign score.</li></ul>
      <div class="opts">${E.CAMPAIGN.lens.map((n, i) => `<button class="opt" data-n="${n}"><span class="num">${n}</span><span><span class="ol">${n} operations</span><div class="of">${['A short campaign, about an evening.', 'A full tour.', 'The long war.'][i]}</div></span></button>`).join('')}</div></div>`, '', k => { const n = E.CAMPAIGN.lens[+k - 1]; if (n) newCampaign(n); });
  $('#b-x', m).onclick = closeModal;
  for (const b of $$('.opt[data-n]', m)) b.onclick = () => newCampaign(+b.dataset.n);
}
function showTitle() {
  closeModal(); const sv = get(SAVE_KEY); const mt = meta(); const cp = camp();
  const hardOK = mt.maxWeeks >= 20;
  if (titleOpts.cmd === 'hard' && !hardOK) titleOpts.cmd = 'mech';
  $('#root').innerHTML = `<div class="title"><div class="title-in">
    <div class="t-hero"><div><div class="t-logo">ECB<span>OUTBREAK</span></div>
      <p class="t-tag">A plague is loose and the dead are walking. You command the <b>Expeditionary Combat Brigade</b>: 4,800 soldiers, a fleet of modular combat vehicles, eleven helicopters and a drone squadron. You don't fight alone: every region's own army and police do most of the fighting. The ECB moves fast, reinforces them where they are breaking, and brings the specialists they lack. Draw orders, make hard calls, and hold the world together until the labs finish a cure.</p>
      <div class="t-go">${campActive(cp) ? `<button class="btn" id="t-camp-cont">Continue campaign · ${cp.stage === 'debrief' ? `Op ${cp.op} of ${cp.len} done` : `Op ${cp.op} of ${cp.len}${sv && !sv.over && sv.camp && sv.camp.id === cp.id ? ` · week ${sv.turn}` : ''}`}</button><button class="btn ghost" id="t-camp-quit">Abandon campaign</button>`
        : `${sv && !sv.over ? `<button class="btn" id="t-cont">Continue week ${sv.turn}</button>` : ''}<button class="btn ${sv && !sv.over ? 'ghost' : ''}" id="t-start">${sv && !sv.over ? 'New run' : 'Start run'}</button><button class="btn ghost" id="t-camp">Start campaign</button>`}<button class="btn ghost" id="t-how">How to play</button><button class="btn ghost" id="t-film">Watch intro</button></div>
      <label class="t-chk" for="t-intro"><input type="checkbox" id="t-intro" ${introOn() ? 'checked' : ''}> Play the opening and ending movies</label></div>
      <div>${titleMap()}</div></div>
    <div class="t-sec"><h3>Choose your commander</h3><div class="cmds">${E.COMMANDERS.map(c => { const locked = c.unlock && !hardOK; return `<button class="cmd" data-c="${c.id}" aria-pressed="${titleOpts.cmd === c.id}" ${locked ? 'disabled' : ''}><span class="tt">${esc(c.title)}</span><span class="nm">${esc(c.name)}</span><span class="bl">${esc(locked ? 'Locked. ' + c.unlock + ' to unlock.' : c.blurb)}</span></button>`; }).join('')}</div></div>
    <div class="t-sec t-row"><label><span class="lbl">Difficulty</span><div class="seg" id="t-diff">${Object.entries(E.DIFFS).map(([k, d]) => `<button data-d="${k}" aria-pressed="${titleOpts.diff === k}">${d.name}</button>`).join('')}</div></label>
      <label for="t-seed"><span class="lbl">Seed (optional)</span><input id="t-seed" placeholder="random" value="${esc(titleOpts.seed)}" maxlength="16" autocomplete="off"></label></div>
    <div class="note" id="t-diffnote" style="margin-top:8px"></div>
    <div class="records"><span>Runs <span class="mono">${mt.runs}</span></span><span>Cures found <span class="mono">${mt.wins}</span></span><span>Best score <span class="mono">${mt.best.toLocaleString()}</span></span><span>Longest run <span class="mono">${mt.maxWeeks} weeks</span></span>${mt.camps ? `<span>Campaigns <span class="mono">${mt.campWins || 0}/${mt.camps}</span></span><span>Best campaign <span class="mono">${(mt.bestCamp || 0).toLocaleString()}</span></span>` : ''}</div>
  </div></div>`;
  const notes = { recruit:'Recruit: start here. Slower pathogen, stronger resupply, faster labs.', veteran:'Veteran: the intended challenge.', nightmare:'Nightmare: two outbreak origins, weak supply lines, faster pathogen. Score ×1.5.' };
  const upd = () => { $('#t-diffnote').textContent = notes[titleOpts.diff]; };
  upd();
  for (const b of $$('.cmd')) b.onclick = () => { titleOpts.cmd = b.dataset.c; for (const x of $$('.cmd')) x.setAttribute('aria-pressed', x === b); };
  for (const b of $$('#t-diff button')) b.onclick = () => { titleOpts.diff = b.dataset.d; for (const x of $$('#t-diff button')) x.setAttribute('aria-pressed', x === b); upd(); };
  $('#t-seed').oninput = e => titleOpts.seed = e.target.value.trim();
  const ts = $('#t-start'); if (ts) ts.onclick = () => startGame({ cmd:titleOpts.cmd, diff:titleOpts.diff, seed:titleOpts.seed || undefined });
  const tc = $('#t-camp'); if (tc) tc.onclick = showCampaignStart;
  const tcc = $('#t-camp-cont'); if (tcc) tcc.onclick = () => { const c2 = camp(); if (c2.stage === 'debrief') return showDebrief(); if (sv && !sv.over && sv.camp && sv.camp.id === c2.id && sv.camp.op === c2.op) { S = E.migrate(sv); enterGame(); } else startOp(c2); };
  const tcq = $('#t-camp-quit'); if (tcq) tcq.onclick = () => { if (!tcq.classList.contains('arm')) { tcq.classList.add('arm'); tcq.textContent = 'Tap again to abandon'; return; }
    const c2 = camp(); c2.stage = 'over'; c2.outcome = 'abandoned'; c2.score = c2.results.reduce((a, r) => a + r.score, 0); put(CAMP_KEY, c2); if (sv && sv.camp && sv.camp.id === c2.id) drop(SAVE_KEY); showCampaignEnd(); };
  $('#t-how').onclick = showHowTo;
  $('#t-intro').onchange = e => { try { localStorage.setItem('ecb_intro', e.target.checked ? '1' : '0'); } catch (x) {} };
  $('#t-film').onclick = () => { const demo = E.newGame({ cmd:titleOpts.cmd, diff:titleOpts.diff, seed:titleOpts.seed || undefined }); CINE.play(demo, showTitle); };
  const c = $('#t-cont'); if (c) c.onclick = () => { S = E.migrate(sv); enterGame(); };
}
function introOn() { try { return localStorage.getItem('ecb_intro') !== '0'; } catch (e) { return true; } }
function startGame(opts) { S = E.newGame(opts); pendingSitrep = null; sel = null; tab = 'brigade'; view = { x:0, y:0, w:MD.W, h:MD.H }; closeModal(); if (introOn() && !opts.noIntro) CINE.play(S, enterGame); else enterGame(); }
function enterGame() { closeModal(); shell(); flow(); TUT.maybeStart(); }

document.addEventListener('pointerdown', () => SFX.unlock(), { once:true });
window.addEventListener('resize', () => TUT.sync());
// ------------------------------------------------------------- keys
document.addEventListener('keydown', e => {
  if (CINE.active()) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); CINE.stop(); } return; }
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const m = $('#modal');
  if (m) { if (m._key && /^([1-9]|Enter| )$/.test(e.key)) { e.preventDefault(); m._key(e.key); } if (e.key === 'Escape' && !S?.crisis && !S?.pendingReward && !pendingSitrep && !(S && S.over)) closeModal(); return; }
  if (!S || !$('#app')) return;
  if (/^[1-9]$/.test(e.key)) { const i = +e.key - 1; const cards = $$('#hand .card'); if (cards[i]) playIdx(i, cards[i]); }
  else if (e.key === 'e' || e.key === 'E') doEndTurn();
  else if ((e.key === 'a' || e.key === 'A') && !S.over) showAirTasking();
  else if ((e.key === 'g' || e.key === 'G') && !S.over) showEngineers();
});
let rt = null; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S && $('#app')) { renderMap(); placeRegionCard(); } }, 120); });

// ------------------------------------------------------------- boot (with live-update support)
try { window.claude?.hot?.snapshot?.(() => ({ S, sel, tab, inGame: !!$('#app') })); } catch (e) {}
try { if (!document.getElementById('art-sprite')) document.body.insertAdjacentHTML('afterbegin', ART.sprite()); } catch (e) {}
function boot(data) {
  if (data && data.S && data.inGame) { S = E.migrate(data.S); sel = data.sel || null; tab = data.tab || 'brigade'; enterGame(); }
  else showTitle();
}
try { window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {}); } catch (e) { boot({}); }
window.__ECB = { get S() { return S; }, E, flow: () => flow(), render: () => render(), clearSel: () => { sel = null; } };
})();
