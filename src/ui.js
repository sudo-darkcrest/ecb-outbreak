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

const SHORT = { CAN:'Canada', USW:'US West', USE:'US East', MEX:'Mexico', CAR:'Caribbean', SAN:'Andes', BRA:'Brazil', SCO:'S. Cone', WEU:'W. Europe', CEU:'C. Europe', SEU:'Med.', NOR:'Nordic', EEU:'E. Europe', RUS:'Russia', SIB:'Siberia', MDE:'Mid. East', NAF:'N. Africa', WAF:'W. Africa', CAF:'C. Africa', EAF:'E. Africa', SAF:'S. Africa', CAS:'C. Asia', SAS:'S. Asia', CHN:'China', EAS:'Japan/Korea', SEA:'SE Asia', IDN:'Indonesia', AUS:'Australia' };
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
  return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }

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
    p.querySelector('title').textContent = `${E.RD[id].name} — ${E.status(rs)}, ${fmtPct(rs.z)} infected`;
  }
  for (const h of $$('#g-hatch .hatch')) h.setAttribute('opacity', S.regions[h.dataset.id].fallen ? 1 : 0);
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
    const sz = S.regions[r.id].sz; if (!sz) continue; const [x, y] = r.a; const o = LOFF[r.id] || [0,0];
    for (let i = 0; i < sz; i++) el('rect', { x:x + o[0] - 14 - i * 4.2, y:y + o[1] - 5, width:3.2, height:3.2, rx:.6, fill:'#7fc28c', stroke:'#0b1214', 'stroke-width':.5 }, gM);
  }
  for (const r of E.REGIONS) {
    const wk = E.worksIn(S, r.id); if (!wk.length) continue; const [x, y] = r.a; const o = LOFF[r.id] || [0,0];
    const g4 = el('g', { class:'works', transform:`translate(${x + o[0] - 13},${y + o[1] + 3})` }, gM);
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
  window.addEventListener('pointerup', () => { drag = null; setTimeout(() => dragMoved = false, 0); });
  svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height; zoom(e.deltaY < 0 ? .8 : 1.25, fx, fy); }, { passive:false });
}
const clampV = (v, max) => Math.max(0, Math.min(Math.max(0, max), v));
function zoom(f, fx = .5, fy = .5) {
  const nw = Math.max(MD.W / 5, Math.min(MD.W, view.w * f)), nh = nw * MD.H / MD.W;
  view.x = clampV(view.x + (view.w - nw) * fx, MD.W - nw); view.y = clampV(view.y + (view.h - nh) * fy, MD.H - nh); view.w = nw; view.h = nh;
  renderMap();
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
      <button class="hbtn" id="b-menu" aria-label="Menu">Menu</button>
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
  $('#b-menu').onclick = showMenu;
  $('#z-in').onclick = () => zoom(.7); $('#z-out').onclick = () => zoom(1.4); $('#z-reset').onclick = () => { view = { x:0, y:0, w:MD.W, h:MD.H }; renderMap(); };
  for (const b of $$('.tabs button')) b.onclick = () => { tab = b.dataset.tab; renderSide(); };
  renderLegend();
}
function renderLegend() {
  const L = $('#legend'); if (!L) return; const ph = S && S.phase === 'restore' ? 'r' : 'o'; if (L.dataset.ph === ph) return; L.dataset.ph = ph;
  L.innerHTML = (ph === 'r' ? `<span><i class="sw" style="background:${RESTORED}"></i>Restored</span>` : '') + [['#2b3d3a','Clear'],[infColor(.0004),'<0.1%'],[infColor(.01),'1%'],[infColor(.06),'6%'],[infColor(.3),'30%+'],['#3a1012','Fallen']].map(([c, t]) => `<span><i class="sw" style="background:${c}"></i>${t}</span>`).join('') + '<span><i class="sw" style="background:#5fc4a8;border-radius:50%"></i>Lab</span><span><i class="sw" style="background:#7fc28c"></i>Safe zone</span>';
}

function render() {
  if (!S || !$('#app')) return;
  renderHeader(); renderLegend(); renderMap(); renderDirective(); renderRegion(); renderSide(); renderHand();
}
function renderHeader() {
  $('#h-week').textContent = String(S.turn).padStart(2, '0') + ' · ' + dateOf(S.turn);
  const sn = E.seasonOf('N', E.monthOf(S.turn)); $('#h-season').textContent = `Week · ${sn} in the north`;
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
function renderRegion() {
  const id = sel || S.b.loc; const rd = E.RD[id], rs = S.regions[id]; const st = E.status(rs);
  const lab = S.labs.find(l => l.region === id);
  const isHere = id === S.b.loc;
  let act = '';
  if (isHere) act = `<span class="here">◆ ECB deployed here</span><span class="note">· ${E.POSTURES[S.b.posture].name} posture</span>`;
  else { const c = E.deployCost(S, id); const ok = E.canDeploy(S, id); act = `<button class="btn" id="b-deploy" ${ok === true ? '' : 'disabled'}>Deploy here</button><span class="note">${c.cp} CP · ${c.fuel} fuel · ${c.hops} ${c.hops === 1 ? 'hop' : 'hops'}${ok === true ? '' : '<br><span style="color:#ff8a7e">' + esc(ok) + '</span>'}</span>`; }
  const h = rs.h, z = rs.z, dd = rs.d;
  $('#reg').innerHTML = `
    <div class="reg-h"><div><div class="n">${esc(rd.name)}</div><div class="note">${fmtPop(rd.pop)} people · ${rd.clim} · ${rd.base ? 'allied base' : 'no allied base'}</div></div><span class="chip st-${st}">${st}</span></div>
    <div class="popbar" title="Healthy / infected / dead"><i style="width:${h * 100}%;background:#6fa58a"></i><i style="width:${z * 100}%;background:#e2483b"></i><i style="width:${dd * 100}%;background:#3c4446"></i></div>
    <dl class="kv">
      <dt>Healthy</dt><dd>${fmtPop(h * rd.pop)} (${fmtPct(h)})</dd>
      <dt>Infected</dt><dd style="color:${z > 0 ? '#ff9a8e' : ''}">${fmtPop(z * rd.pop)} (${fmtPct(z)})</dd>
      <dt>Dead</dt><dd>${fmtPop(dd * rd.pop)}</dd>
      <dt>Civil order</dt><dd>${Math.round(rs.order)}/100</dd>
      <dt>Quarantine</dt><dd>${Math.round(rs.quar * 100)}%</dd>
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
    ${S.phase === 'restore' && !rs.restored ? restoreChecklist(rs) : ''}
    <div class="reg-act">${act}</div>
    ${tfBlock(id, isHere)}
    ${E.CHOKE[id] && !rs.fallen ? `<div class="note" style="margin-top:8px">If ${esc(rd.name)} falls, the ${esc(E.CHOKE[id])} closes and every resupply shrinks ${Math.round(E.CHOKE_LOSS * 100)}%.</div>` : ''}`;
  const tb = $('#b-tf'); if (tb) tb.onclick = () => { const r = E.sendTF(S, id); toast(r.msg, !r.ok); flow(); };
  const rb = $('#b-recall'); if (rb) rb.onclick = () => { const r = E.recallTF(S); toast(r.msg, !r.ok); flow(); };
  const b = $('#b-deploy'); if (b) b.onclick = () => { const r = E.deploy(S, id); toast(r.msg, !r.ok); if (r.ok) { sel = null; } flow(); };
}
function seasonText(id) {
  const se = E.seasonOf(E.HEMI[id], E.monthOf(S.turn)); const m = E.seasonMult(S, id);
  if (se === 'tropical') return 'Tropical, no winter';
  return se[0].toUpperCase() + se.slice(1) + (m < 1 ? ` · infected slowed ${Math.round((1 - m) * 100)}%` : m > 1 ? ` · infected +${Math.round((m - 1) * 100)}%` : '');
}
function tfBlock(id, isHere) {
  const tf = S.b.tf;
  if (tf && tf.loc === id) { const c = E.recallCost(S); const ok = E.canRecallTF(S); return `<div class="reg-act tfline"><span class="here" style="color:#8fd3ea">◇ Task Force: ${esc(E.UNITS[tf.bn].name)} · ${Math.round(S.b.u[tf.bn] * 100)}%</span><button class="btn ghost sm" id="b-recall" ${ok === true ? '' : 'disabled'}>Recall</button><span class="note">${c.cp} CP · ${c.fuel} fuel</span></div>`; }
  if (isHere) return '';
  const ok = E.canSendTF(S, id), c = E.tfCost(S, id), bn = E.tfCandidate(S);
  return `<div class="reg-act tfline"><button class="btn ghost sm" id="b-tf" ${ok === true ? '' : 'disabled'}>${tf ? 'Move Task Force here' : 'Send Task Force'}</button><span class="note">${esc(E.UNITS[bn].name)} · ${c.cp} CP · ${c.fuel} fuel${ok === true ? '' : '<br><span style="color:#ff8a7e">' + esc(ok) + '</span>'}</span></div>`;
}
function restoreChecklist(rs) {
  const Q = E.RESTORE_REQ; const row = (ok, t) => `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : '○'}</span>${t}</li>`;
  if (rs.fallen) return `<ul class="check"><li class="hd">To reclaim this fallen region</li>${row(rs.z < .1, `Infected under 10% (now ${fmtPct(rs.z)})`)}</ul>`;
  return `<ul class="check"><li class="hd">To restore this region</li>${row(rs.z < Q.z, `Infected under 0.5% (now ${fmtPct(rs.z)})`)}${row(rs.order >= Q.order, `Civil order 50+ (now ${Math.round(rs.order)})`)}${row((rs.vax || 0) >= Q.vax, `Cure coverage 50%+ (now ${Math.round((rs.vax || 0) * 100)}%)`)}</ul>`;
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
    const tfSec = `<div class="sec"><span class="lbl">Task Force</span>${b.tf ? `<div style="font-size:13px">${E.UNITS[b.tf.bn].name} is operating in <b>${esc(E.RD[b.tf.loc].name)}</b> (since week ${b.tf.since}). It contains the outbreak, kills infected and gains experience there on its own.${E.hasD(S, 'mission') ? '' : ' Upkeep: 2 supply and 1 fuel a week.'}</div><div class="reg-act"><button class="btn ghost sm" id="b-recall2" ${E.canRecallTF(S) === true ? '' : 'disabled'}>Recall to main body</button><span class="note">${rc.cp} CP · ${rc.fuel} fuel</span></div>` : '<div class="note">Detach one battalion to guard a second region. Pick a region on the map and press <b>Send Task Force</b>. It fights and contains the outbreak there on its own, but your main body is a third weaker while it is away.</div>'}</div>`;
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
      <div class="sec"><span class="lbl">Enablers</span><div class="chips">${Object.entries(E.ENABLERS).map(([k, n]) => `<span class="en ${b.en[k] ? '' : 'off'}">${n}</span>`).join('')}</div></div>${supSec}`;
    const r2 = $('#b-recall2', body); if (r2) r2.onclick = () => { const r = E.recallTF(S); toast(r.msg, !r.ok); flow(); };
    for (const x of $$('.posture button', body)) x.onclick = () => { E.setPosture(S, x.dataset.p); save(); render(); };
  } else if (tab === 'regions') {
    const list = E.REGIONS.map(r => ({ r, rs:S.regions[r.id] })).sort((a, c) => (S.phase === 'restore' ? (a.rs.restored - c.rs.restored) : 0) || (c.rs.fallen - a.rs.fallen) || (c.rs.z - a.rs.z) || (c.r.pop - a.r.pop));
    body.innerHTML = `<div class="sec"><span class="lbl">All regions · tap to inspect</span><div class="rlist">${list.map(({ r, rs }) => `<button class="rrow ${r.id === (sel || S.b.loc) ? 'sel' : ''}" data-id="${r.id}"><i class="dot" style="background:${regionFill(rs)}"></i><span>${esc(r.name)}${r.id === S.b.loc ? ' <span style="color:var(--friend)">◆</span>' : ''}${E.labIn(S, r.id) ? ' <span style="color:var(--t-research)">⬢</span>' : ''}</span><span class="chip st-${E.status(rs)}" style="font-size:9px">${E.status(rs)}</span><span class="mono">${S.phase === 'restore' ? (rs.restored ? '✓' : `${Math.round((rs.vax || 0) * 100)}% covered`) : rs.fallen ? '—' : fmtPct(rs.z)}</span></button>`).join('')}</div></div>`;
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
  $('#pips').innerHTML = Array.from({ length:max }, (_, i) => `<span class="pip ${i < S.cp ? 'on' : ''}"></span>`).join('') + (S.burnBank ? '<span class="pip half" title="½ Command Point banked from burning"></span>' : '') + `<span class="mono" style="margin-left:6px;font-size:13px">${S.cp}${S.burnBank ? ' + ½' : ''}</span>`;
  const nb = (S.deck.burned || []).length;
  $('#deckinfo').innerHTML = `Draw ${S.deck.draw.length} · Discard ${S.deck.discard.length}${nb ? ` · Burned ${nb}` : ''} · <button id="b-deck">Deck (${E.deckList(S).length})</button>`;
  $('#b-deck').onclick = () => showDeck(false);
  const hand = $('#hand');
  hand.innerHTML = S.deck.hand.map((id, i) => { const cb = E.canBurn(S, i), v = half(E.burnValue(id)); const nm = esc(E.cardName(id));
    return `<div class="slot">${cardHTML(id, { why:E.canPlay(S, i), attr:`data-i="${i}"` })}<button class="burn" data-b="${i}" ${cb === true ? '' : 'disabled'} title="${cb === true ? `Burn ${nm}: remove it from your deck for +${v} CP` : esc(cb)}" aria-label="Burn ${nm} for ${v} command points"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15.5c-3.3 0-5.5-2.2-5.5-5.1 0-2.7 2-4.3 2.9-6.6.4 1.3 1.1 2.1 1.9 2.4C7.4 4.1 7.9 1.9 9.7.5c-.1 2.6 1.6 3.8 2.8 5.6.8 1.2 1 2.4 1 3.6 0 3.3-2.3 5.8-5.5 5.8z" fill="currentColor"/><path d="M8 15c-1.6 0-2.7-1.1-2.7-2.6 0-1.4 1.1-2.2 1.6-3.3.3.7.8 1 1.3 1.1.1-1.2.6-2 1.4-2.6 0 1.3.8 2 1.4 2.9.3.5.4 1 .4 1.6C11.4 13.8 10 15 8 15z" fill="#ffd36b"/></svg><span class="bl">Burn? +${v} CP</span></button></div>`; }).join('');
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
  const fly = id => { const r = E.flySortie(S, id); toast(r.msg, !r.ok); flow(); };
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
  const go = id => { const r = E.buildWork(S, id); toast(r.msg, !r.ok); flow(); };
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
  const go = () => { const r = E.burnCard(S, i); toast(r.msg, !r.ok); flow(); };
  if (card && !matchMedia('(prefers-reduced-motion: reduce)').matches) { card.classList.add('burnt'); btn.remove(); setTimeout(go, 320); } else go();
}
function playIdx(i, elmt) {
  const ok = E.canPlay(S, i); if (ok !== true) { toast(ok, true); return; }
  const go = () => { const r = E.playCard(S, i); toast(r.msg, !r.ok); flow(); };
  if (elmt && !matchMedia('(prefers-reduced-motion: reduce)').matches) { elmt.classList.add('fly'); setTimeout(go, 220); } else go();
}
function selectRegion(id, focus) { sel = id === S.b.loc ? null : id; if (focus && window.innerWidth > 820) {} render(); if (window.innerWidth <= 820 && focus) { const r = $('#reg'); if (r) r.scrollIntoView({ behavior:'smooth', block:'center' }); } }

// ------------------------------------------------------------- flow
function save() { if (S && !S.over) put(SAVE_KEY, S); }
function flow() {
  render(); save(); closeModal();
  if (S.over) return showGameOver();
  if (pendingSitrep) return showSitrep();
  if (S.cureChoice) return showCureChoice();
  if (S.pendingReward) return showReward();
  if (S.pendingDoctrine) return showBoard();
  if (S.crisis) return showCrisis();
}
function doEndTurn() {
  if (S.crisis) { showCrisis(); return; }
  const rep = E.endTurn(S); if (!rep) return;
  pendingSitrep = rep; sel = null; flow();
}
function showCrisis() {
  const e = E.EVENTS[S.crisis.id]; const opts = E.crisisOptions(S); const col = KIND_COLOR[e.kind] || 'var(--amber)';
  let text = ''; try { text = e.text(S, S.crisis.ctx); } catch (x) { text = ''; }
  const m = openModal(`<div class="crisis-art">${ART.svg(S.crisis.id, e.kind, '', true)}</div><div class="dlg-h"><div><div class="k" style="color:${col}">Crisis · ${e.kind} · Week ${S.turn}</div><h2>${esc(e.title)}</h2></div></div>
    <div class="dlg-b"><p>${text}</p><div class="opts">${opts.map(o => `<button class="opt" data-i="${o.i}" ${o.ok ? '' : 'disabled'}><span class="num">${o.i + 1}</span><span><span class="ol">${esc(o.label)}</span><div class="of">${esc(o.fx)}${o.ok ? '' : ` <span class="why">Unavailable: ${esc(o.why)}</span>`}</div></span></button>`).join('')}</div></div>`, '', k => { const n = +k - 1; const o = opts[n]; if (o && o.ok) choose(n); });
  const choose = i => { const r = E.resolveCrisis(S, i); if (r.ok) toast(r.msg); flow(); };
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
    <div class="dlg-f"><button class="btn" id="b-cont">Continue</button></div>`, '', k => { if (k === 'Enter' || k === ' ') flow(); });
  $('#b-cont', m).onclick = flow;
}
function showReward() {
  const pr = S.pendingReward;
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
        <div class="stat"><span class="lbl">Brigade losses</span><span class="v mono">${S.stats.kia.toLocaleString()}</span></div>
        <div class="stat"><span class="lbl">Best score</span><span class="v mono">${mt.best.toLocaleString()}</span></div>
      </div>
      <p class="note">${esc(E.CMD[S.cmd].name)} · ${E.DIFFS[S.diff].name} · seed <span class="mono">${esc(S.seed)}</span> · regions fallen ${E.fallenCount(S)} · directives ${S.stats.directivesWon} won, ${S.stats.directivesLost} failed</p>
      ${unlockedNow ? '<p style="color:var(--amber)">Lt. Gen. Frank Garrison (Hardliner) is now available as a commander.</p>' : ''}</div>
    <div class="dlg-f"><button class="btn ghost" id="b-look">Look at the map</button><button class="btn ghost" id="b-same">Retry same seed</button><button class="btn" id="b-new">New run</button></div>`);
  $('#b-look', m).onclick = closeModal;
  $('#b-same', m).onclick = () => startGame({ cmd:S.cmd, diff:S.diff, seed:S.seed });
  $('#b-new', m).onclick = showTitle;
}
function showMenu() {
  const m = openModal(`<div class="dlg-h"><div><div class="k" style="color:var(--amber)">Seed ${esc(S.seed)} · progress saves every action</div><h2>Menu</h2></div><button class="hbtn" id="b-x">Close</button></div>
    <div class="dlg-b"><div class="opts">
      <button class="opt" id="m-how"><span class="num">?</span><span><span class="ol">How to play</span><div class="of">Rules, cards and win conditions.</div></span></button>
      <button class="opt" id="m-film"><span class="num">▶</span><span><span class="ol">Replay the opening cinematic</span><div class="of">Watch this run's intro again.</div></span></button>
      <button class="opt" id="m-oob"><span class="num">≡</span><span><span class="ol">Brigade order of battle</span><div class="of">What the ECB is made of.</div></span></button>
      <button class="opt" id="m-title"><span class="num">⌂</span><span><span class="ol">Title screen</span><div class="of">Your run stays saved. Continue it from the title screen.</div></span></button>
      <button class="opt" id="m-quit"><span class="num">×</span><span><span class="ol">Abandon this run</span><div class="of">Ends the run now and counts it as a loss.</div></span></button>
    </div></div>`);
  $('#b-x', m).onclick = closeModal; $('#m-how', m).onclick = showHowTo; $('#m-film', m).onclick = () => { closeModal(); CINE.play(S, enterGame); }; $('#m-oob', m).onclick = showOOB; $('#m-title', m).onclick = showTitle;
  $('#m-quit', m).onclick = () => { $('#m-quit', m).querySelector('.ol').textContent = 'Tap again to confirm'; $('#m-quit', m).onclick = () => { S.over = { win:false, title:'Run Abandoned', text:'You handed over command.' }; S.over.score = E.score(S); flow(); }; };
}
function howHTML() {
  return `<div class="howto"><ol>
    <li><b>Goal:</b> keep the world alive until the research labs finish a cure (the green bar at the top reaches 100%).</li>
    <li><b>Each week</b> you draw 5 order cards and get Command Points (the amber dots). Click a card to play it. Most cards act on the region where your brigade is deployed.</li>
    <li><b>Crises</b> pop up most weeks. Pick one of the choices. Each choice shows what it costs.</li>
    <li><b>The map</b> shows every region's infection. Click a region to inspect it, then press <b>Deploy here</b> to move the brigade (costs Command Points and fuel).</li>
    <li><b>Two free jobs every week</b> (buttons under the Command Points): <b>Air tasking</b> flies one aviation mission (scout with drones, a gun run, MEDEVAC, heavy lift, or stand down to rest the crews), and <b>Engineers</b> put a week of work into a Barrier Line, Fire Base, Field Hospital or Supply Depot where the brigade is. Neither costs Command Points.</li>
    <li><b>Posture</b> sets what the brigade does on its own every week: Assault kills more, Hold contains the spread, Relief saves civilians.</li>
    <li><b>Press End Week.</b> The outbreak spreads, labs work, your stocks are resupplied, and you get a situation report.</li>
    <li><b>Phase II: Restoration.</b> When the cure is found you can stop and take the win, or keep going for ${E.RESTORE_WEEKS} more weeks. The cure spreads from the labs. Cure the infected, reclaim fallen regions and restore order. A region is restored when infected are under 0.5%, civil order is 50 or more, and cure coverage is 50% or more. Each restored region turns green and adds to your score.</li>
    <li><b>Protect the labs</b> (hexagon icons). Labs work faster in calm regions and with your brigade on site. Recover Tissue Samples speeds the cure.</li>
    <li><b>HQ directives</b> give you a goal with a deadline. Finish them for Trust and a new card. Every 4 weeks you also pick a new card.</li>
    <li><b>You lose if</b> survivors fall below 20%, the brigade is wiped out, Morale or Command Trust hits 0, or every lab is overrun.</li>
    <li><b>Watch Exposure.</b> Fighting in infected regions builds it. At 100 the brigade has an outbreak of its own. Decon and MEDEVAC cards bring it down.</li>
    <li><b>Battalions</b> each have a named commander with a trait (shown in the Brigade tab). They gain experience from fighting: Green, Blooded, Veteran, Elite. Higher ranks kill more and lose fewer soldiers. Commanders can be killed when their battalion takes heavy losses.</li>
    <li><b>Task Force:</b> click any region and press <b>Send Task Force</b> to detach your strongest battalion there. It fights on its own every week. Your main body is a third weaker while it is away. Recall it from the region card or the Brigade tab.</li>
    <li><b>Promotion Board:</b> every ${6} weeks you pick a permanent doctrine, such as stronger artillery, bigger resupply or extra cards each week.</li>
    <li><b>Upgrades:</b> when you get a new card, you can instead upgrade one you have. Upgraded cards cost 1 Command Point less.</li>
    <li><b>Seasons and chokepoints:</b> winter slows the infected in cold regions. Five regions hold strategic chokepoints (anchor icons): Panama, Suez, Malacca, Hormuz and the Bosporus. Each one that falls shrinks your resupply.</li>
    <li><b>Burn cards</b> you don't want with the flame button on a card in your hand (tap it twice). The card leaves your deck for good and you get back half its cost in Command Points right away. Halves are saved until they add up to a whole point, so burning two 1-cost cards gives you 1 point. Your deck can't go below ${E.MIN_DECK} cards.</li>
    <li><b>Shortcuts:</b> keys 1–9 play cards or pick crisis choices, A opens air tasking, G opens engineers, E ends the week.</li>
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
function showTitle() {
  closeModal(); const sv = get(SAVE_KEY); const mt = meta();
  const hardOK = mt.maxWeeks >= 20;
  if (titleOpts.cmd === 'hard' && !hardOK) titleOpts.cmd = 'mech';
  $('#root').innerHTML = `<div class="title"><div class="title-in">
    <div class="t-hero"><div><div class="t-logo">ECB<span>OUTBREAK</span></div>
      <p class="t-tag">A plague is loose and the dead are walking. You command the <b>Expeditionary Combat Brigade</b>: 4,800 soldiers, a fleet of modular combat vehicles, eleven helicopters and a drone squadron. Draw orders, make hard calls, and hold the world together until the labs finish a cure.</p>
      <div class="t-go">${sv && !sv.over ? `<button class="btn" id="t-cont">Continue week ${sv.turn}</button>` : ''}<button class="btn ${sv && !sv.over ? 'ghost' : ''}" id="t-start">${sv && !sv.over ? 'New run' : 'Start run'}</button><button class="btn ghost" id="t-how">How to play</button><button class="btn ghost" id="t-film">Watch intro</button></div>
      <label class="t-chk" for="t-intro"><input type="checkbox" id="t-intro" ${introOn() ? 'checked' : ''}> Play the opening cinematic when a run starts</label></div>
      <div>${titleMap()}</div></div>
    <div class="t-sec"><h3>Choose your commander</h3><div class="cmds">${E.COMMANDERS.map(c => { const locked = c.unlock && !hardOK; return `<button class="cmd" data-c="${c.id}" aria-pressed="${titleOpts.cmd === c.id}" ${locked ? 'disabled' : ''}><span class="tt">${esc(c.title)}</span><span class="nm">${esc(c.name)}</span><span class="bl">${esc(locked ? 'Locked. ' + c.unlock + ' to unlock.' : c.blurb)}</span></button>`; }).join('')}</div></div>
    <div class="t-sec t-row"><label><span class="lbl">Difficulty</span><div class="seg" id="t-diff">${Object.entries(E.DIFFS).map(([k, d]) => `<button data-d="${k}" aria-pressed="${titleOpts.diff === k}">${d.name}</button>`).join('')}</div></label>
      <label for="t-seed"><span class="lbl">Seed (optional)</span><input id="t-seed" placeholder="random" value="${esc(titleOpts.seed)}" maxlength="16" autocomplete="off"></label></div>
    <div class="note" id="t-diffnote" style="margin-top:8px"></div>
    <div class="records"><span>Runs <span class="mono">${mt.runs}</span></span><span>Cures found <span class="mono">${mt.wins}</span></span><span>Best score <span class="mono">${mt.best.toLocaleString()}</span></span><span>Longest run <span class="mono">${mt.maxWeeks} weeks</span></span></div>
  </div></div>`;
  const notes = { recruit:'Recruit: start here. Slower pathogen, stronger resupply, faster labs.', veteran:'Veteran: the intended challenge.', nightmare:'Nightmare: two outbreak origins, weak supply lines, faster pathogen. Score ×1.5.' };
  const upd = () => { $('#t-diffnote').textContent = notes[titleOpts.diff]; };
  upd();
  for (const b of $$('.cmd')) b.onclick = () => { titleOpts.cmd = b.dataset.c; for (const x of $$('.cmd')) x.setAttribute('aria-pressed', x === b); };
  for (const b of $$('#t-diff button')) b.onclick = () => { titleOpts.diff = b.dataset.d; for (const x of $$('#t-diff button')) x.setAttribute('aria-pressed', x === b); upd(); };
  $('#t-seed').oninput = e => titleOpts.seed = e.target.value.trim();
  $('#t-start').onclick = () => startGame({ cmd:titleOpts.cmd, diff:titleOpts.diff, seed:titleOpts.seed || undefined });
  $('#t-how').onclick = showHowTo;
  $('#t-intro').onchange = e => { try { localStorage.setItem('ecb_intro', e.target.checked ? '1' : '0'); } catch (x) {} };
  $('#t-film').onclick = () => { const demo = E.newGame({ cmd:titleOpts.cmd, diff:titleOpts.diff, seed:titleOpts.seed || undefined }); CINE.play(demo, showTitle); };
  const c = $('#t-cont'); if (c) c.onclick = () => { S = E.migrate(sv); enterGame(); };
}
function introOn() { try { return localStorage.getItem('ecb_intro') !== '0'; } catch (e) { return true; } }
function startGame(opts) { S = E.newGame(opts); pendingSitrep = null; sel = null; tab = 'brigade'; view = { x:0, y:0, w:MD.W, h:MD.H }; closeModal(); if (introOn() && !opts.noIntro) CINE.play(S, enterGame); else enterGame(); }
function enterGame() { closeModal(); shell(); flow(); }

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
let rt = null; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S && $('#app')) renderMap(); }, 120); });

// ------------------------------------------------------------- boot (with live-update support)
try { window.claude?.hot?.snapshot?.(() => ({ S, sel, tab, inGame: !!$('#app') })); } catch (e) {}
try { if (!document.getElementById('art-sprite')) document.body.insertAdjacentHTML('afterbegin', ART.sprite()); } catch (e) {}
function boot(data) {
  if (data && data.S && data.inGame) { S = E.migrate(data.S); sel = data.sel || null; tab = data.tab || 'brigade'; enterGame(); }
  else showTitle();
}
try { window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {}); } catch (e) { boot({}); }
window.__ECB = { get S() { return S; }, E, flow: () => flow() };
})();
