/* ECB: OUTBREAK — opening cinematic. Built from the current run: origin, pathogen, commander, staging base. */
const CINE = (function () {
'use strict';
const E = ECB, MD = MAPDATA;
let ac = null, master = null, muted = false, timers = [], done = null, root = null, droneNodes = null, nbuf = null;
const M = E.M;
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
try { muted = localStorage.getItem('ecb_mute') === '1'; } catch (e) {}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function dayBefore(days) { const d = new Date(Date.UTC(2027, 3, 12) - days * 864e5); return `${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }

// ---------------------------------------------------------------- sound (synthesized, no files)
function audioOn() {
  if (ac) return;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : .22; master.connect(ac.destination);
    nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } catch (e) { ac = null; }
}
function setMuted(m) { muted = m; try { localStorage.setItem('ecb_mute', m ? '1' : '0'); } catch (e) {} if (master) master.gain.setTargetAtTime(m ? 0 : .22, ac.currentTime, .05); }
function noise(dur, type, freq, gain, at) {
  if (!ac) return; const t = ac.currentTime + (at || 0);
  const src = ac.createBufferSource(); src.buffer = nbuf; src.loop = true;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = .8;
  const g = ac.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + dur + .05);
}
function thump(at, f0, f1, gain, dur) {
  if (!ac) return; const t = ac.currentTime + (at || 0);
  const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .05);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .1);
}
const tick = () => noise(.018, 'highpass', 2800, .12);
const staticBurst = (d) => noise(d || .35, 'bandpass', 1700, .35);
const heartbeat = () => { thump(0, 62, 38, .9, .22); thump(.24, 52, 34, .7, .22); };
const boom = () => { thump(0, 95, 26, 1.3, 1.6); noise(1.8, 'lowpass', 700, .9); };
function drone() {
  if (!ac) return; const t = ac.currentTime;
  const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + 3);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360;
  const mk = (type, f, det) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det || 0; o.connect(lp); o.start(); return o; };
  const os = [mk('sawtooth', 55), mk('sawtooth', 82.4, 7), mk('sine', 27.5)];
  const lfo = ac.createOscillator(); lfo.frequency.value = .12; const lg = ac.createGain(); lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); os.push(lfo);
  lp.connect(g); g.connect(master); droneNodes = { g, os };
}
function riser(dur) {
  if (!ac) return; const t = ac.currentTime;
  const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(330, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + dur * .9); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .1);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .2);
}
function audioOff() {
  if (!ac) return; const a = ac; const t = a.currentTime;
  try { master.gain.setTargetAtTime(0, t, .25); } catch (e) {}
  setTimeout(() => { try { a.close(); } catch (e) {} }, 1200);
  ac = null; master = null; droneNodes = null;
}

// ---------------------------------------------------------------- timeline helpers
const at = (ms, fn) => timers.push(setTimeout(fn, ms));
function type(el, text, cps, sfx) {
  if (!el) return; el.textContent = ''; let i = 0; const step = 1000 / (cps || 40);
  const iv = setInterval(() => { if (!root) return clearInterval(iv); i++; el.textContent = text.slice(0, i); if (sfx && text[i - 1] && text[i - 1] !== ' ' && i % 2) tick(); if (i >= text.length) clearInterval(iv); }, step);
  timers.push(iv);
}
const show = id => { const x = root && root.querySelector('#' + id); if (x) x.classList.add('on'); return x; };
const hide = id => { const x = root && root.querySelector('#' + id); if (x) { x.classList.remove('on'); x.classList.add('off'); } };

function mapSVG(pz, live) {
  let s = `<svg class="cine-map" viewBox="0 0 ${MD.W} ${MD.H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${MD.outline}" fill="#070d10" stroke="#16242a"/><path d="${MD.grat}" fill="none" stroke="#10191d" stroke-width=".5"/>`;
  for (const r of E.REGIONS) s += `<path d="${MD.regions[r.id].d}" data-id="${r.id}" class="cm-r${live.includes(r.id) ? ' pz' : ''}" fill="${live.includes(r.id) ? '#d4472f' : '#15211f'}" stroke="#05090b" stroke-width=".6"/>`;
  const [x, y] = E.RD[pz].a;
  s += `<g id="cm-arcs"></g><circle cx="${x}" cy="${y}" r="6" fill="#ff4a3a" class="cm-pulse"/><circle cx="${x}" cy="${y}" r="2.4" fill="#fff1e0"/></svg>`;
  return s;
}
function spreadRing(ids, from, color, delay) {
  ids.forEach((id, i) => at(delay + i * 260, () => {
    if (!root) return; const p = root.querySelector(`.cm-r[data-id="${id}"]`); if (p) p.setAttribute('fill', color);
    const g = root.querySelector('#cm-arcs'); if (!g) return;
    const [x1, y1] = E.RD[from].a, [x2, y2] = E.RD[id].a; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * .25;
    const a = document.createElementNS('http://www.w3.org/2000/svg', 'path'); a.setAttribute('d', `M${x1},${y1} Q${mx},${my} ${x2},${y2}`); a.setAttribute('class', 'cm-arc'); g.appendChild(a);
    noise(.08, 'bandpass', 900 + i * 80, .08);
  }));
}

// ---------------------------------------------------------------- the film
function play(S, onDone) {
  stop(true);
  done = onDone; audioOn(); drone();
  const pzN = E.RD[S.pz].name, start = E.RD[S.b.loc].name, cmd = E.CMD[S.cmd];
  const live = E.REGIONS.filter(r => S.regions[r.id].z > 0).map(r => r.id); if (!live.includes(S.pz)) live.unshift(S.pz);
  const liveNames = live.map(id => E.RD[id].name).join(' AND ');
  const cases = live.reduce((a, id) => a + S.regions[id].z * E.RD[id].pop, 0);
  const n1 = E.neighbors(S.pz).filter(id => !live.includes(id)), n2 = [...new Set(n1.flatMap(id => E.neighbors(id)))].filter(id => !live.includes(id) && !n1.includes(id)).slice(0, 8);
  const n3 = [...new Set(n2.flatMap(id => E.neighbors(id)))].filter(id => !live.includes(id) && !n1.includes(id) && !n2.includes(id)).slice(0, 8);
  const projDead = (3.9 + Math.min(1.8, (S.path.inf - 1) * 3 + S.path.spread - .9)).toFixed(1);
  root = document.createElement('div'); root.className = 'cine' + (RM() ? ' rm' : ''); root.id = 'cine'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Opening cinematic');
  root.innerHTML = `
    <div class="cs" id="cs1"><div class="cs-art dim">${ART.svg('hospital', 'MEDICAL', 'cine-art', true)}</div><div class="alarm"></div>
      <div class="cs-text center"><div class="c-meta mono" id="t1a"></div><div class="c-big" id="t1b"></div><p class="c-line" id="t1c"></p><p class="c-line" id="t1d"></p></div></div>
    <div class="cs" id="cs2">${mapSVG(S.pz, live)}<div class="c-day mono" id="t2a"></div><div class="c-sub mono" id="t2b"></div><div class="proj-stamp mono" id="stamp">WHO MODEL · IF NOTHING IS DONE</div><div class="ticker"><span id="tick">BREAKING · WHO CONFIRMS AN UNKNOWN PATHOGEN IN ${esc(liveNames.toUpperCase())} · DESIGNATED ${esc(S.path.code)} “${esc(S.path.name.toUpperCase())}” · QUARANTINE DECLARED · NO CASES CONFIRMED ANYWHERE ELSE · YET · </span></div></div>
    <div class="cs" id="cs3"><div class="cs-art" id="p3"></div><div class="cs-text low"><div class="c-tag mono" id="t3t"></div><p class="c-cap" id="t3"></p></div></div>
    <div class="cs" id="cs3b"><div class="cs-text center"><p class="c-cap" id="t3b" style="max-width:26ch"></p></div></div>
    <div class="cs" id="cs4"><div class="cs-art" id="p4">${ART.svg('convoy', 'LOGISTICS', 'cine-art', true)}</div><div class="cs-text low left"><div class="c-big" id="t4a"></div><ul class="c-list" id="t4b"></ul></div></div>
    <div class="cs" id="cs5"><div class="dossier"><div class="c-meta mono">COMMANDING OFFICER</div><div class="c-name" id="t5a"></div><div class="c-meta mono" id="t5b"></div><div class="c-rule"></div><div class="c-meta mono" id="t5c"></div><p class="c-orders" id="t5d"></p></div></div>
    <div class="cs" id="cs6"><div class="slam"><div class="s-ecb">ECB</div><div class="s-out">OUTBREAK</div><div class="s-sub mono">${esc(S.path.name.toUpperCase())} · ${esc(S.path.code)}</div></div></div>
    <div class="bars"></div><div class="grain"></div>
    <div class="cine-ui"><button id="cine-mute" class="cine-btn">${muted ? 'Sound off' : 'Sound on'}</button><button id="cine-skip" class="cine-btn">Skip ›</button></div>`;
  document.body.appendChild(root);
  root.querySelector('#cine-skip').onclick = () => stop();
  root.querySelector('#cine-mute').onclick = e => { setMuted(!muted); e.target.textContent = muted ? 'Sound off' : 'Sound on'; };
  setTimeout(() => root && root.querySelector('#cine-skip').focus({ preventScroll:true }), 50);

  // 1 · the hospital
  show('cs1'); heartbeat(); const hb = setInterval(() => root && heartbeat(), 1150); timers.push(hb);
  at(400, () => type(root.querySelector('#t1a'), `${dayBefore(16)} · 03:47 LOCAL`, 38, true));
  at(1500, () => type(root.querySelector('#t1b'), pzN.toUpperCase(), 22, true));
  at(2900, () => type(root.querySelector('#t1c'), 'A patient in a city hospital bites three nurses.', 46, true));
  at(4500, () => type(root.querySelector('#t1d'), 'By morning, all four are dead. By noon, they are walking.', 46, true));
  // 2 · the map
  // 2 · the map: what is true today, then what the model says will happen
  const setDay = (t, sub) => { if (!root) return; const d = root.querySelector('#t2a'), b = root.querySelector('#t2b'); if (d) d.textContent = t; if (b && sub != null) b.textContent = sub; };
  at(6900, () => { clearInterval(hb); hide('cs1'); show('cs2'); staticBurst(.4); type(root.querySelector('#t2a'), 'DAY 16 · TODAY', 24); });
  at(7700, () => type(root.querySelector('#t2b'), `CONFIRMED: ${liveNames.toUpperCase()} · ${M(cases)} CASES`, 44));
  at(9300, () => { if (!root) return; root.querySelector('#cs2').classList.add('proj'); root.querySelector('#stamp').classList.add('on'); staticBurst(.3); thump(0, 70, 40, .6, .3); setDay('DAY 30 · PROJECTED', ''); });
  spreadRing(n1, S.pz, '#c98a2c', 9600);
  at(10900, () => setDay('DAY 60 · PROJECTED'));
  spreadRing(n2, n1[0] || S.pz, '#a8402c', 11000);
  at(12500, () => setDay('DAY 120 · PROJECTED'));
  spreadRing(n3, n2[0] || n1[0] || S.pz, '#6e2318', 12600);
  at(13600, () => type(root.querySelector('#t2b'), `PROJECTED DEATHS: ${projDead} BILLION`, 40, true));
  // 3 · the collapse the model predicts
  const panels = [['horde', 'COMBAT', 'PROJECTED · DAY 60', 'The bitten will outnumber the living in whole cities.'], ['refugees', 'CIVIL', 'PROJECTED · DAY 90', 'Millions will flee onto the highways. The infected will follow.'], ['helo_down', 'AIR', 'PROJECTED · DAY 120', 'Armies will break. Governments will go silent.']];
  panels.forEach(([k, kind, tag, txt], i) => at(15400 + i * 2500, () => {
    if (!root) return; if (i === 0) { hide('cs2'); show('cs3'); }
    const p = root.querySelector('#p3'); p.innerHTML = ART.svg(k, kind, 'cine-art kb', true); staticBurst(.25);
    root.querySelector('#t3t').textContent = tag; type(root.querySelector('#t3'), txt, 52);
  }));
  at(23000, () => { hide('cs3'); show('cs3b'); type(root.querySelector('#t3b'), 'This is what we are fighting to prevent.', 30, true); });
  // 4 · the brigade
  at(25600, () => { hide('cs3b'); show('cs4'); riser(4.2); type(root.querySelector('#t4a'), 'ONE FORCE IS READY.', 26, true); });
  ['EXPEDITIONARY COMBAT BRIGADE', '4,800 SOLDIERS · THREE MECHANIZED BATTALIONS', '155MM ARTILLERY · AIR DEFENSE · 11 HELICOPTERS', 'DRONES · ENGINEERS · CBRN · FIELD HOSPITALS'].forEach((t, i) => at(26900 + i * 650, () => {
    if (!root) return; const li = document.createElement('li'); li.textContent = t; root.querySelector('#t4b').appendChild(li); thump(0, 140, 90, .25, .12);
  }));
  at(28700, () => { const p = root && root.querySelector('#p4'); if (p) p.innerHTML = ART.svg('airbridge', 'AIR', 'cine-art kb', true); });
  // 5 · the commander
  at(30600, () => { hide('cs4'); show('cs5'); staticBurst(.2); type(root.querySelector('#t5a'), cmd.name, 30, true); });
  at(31900, () => type(root.querySelector('#t5b'), `"${cmd.title.toUpperCase()}" · ${E.DIFFS[S.diff].name.toUpperCase()}`, 40));
  at(32800, () => type(root.querySelector('#t5c'), `STAGING AT ${start.toUpperCase()}`, 40, true));
  at(33900, () => type(root.querySelector('#t5d'), 'Orders: stop the projection. Hold the line until the labs find a cure.', 42, true));
  // 6 · title
  at(37400, () => { hide('cs5'); show('cs6'); boom(); if (droneNodes) droneNodes.g.gain.setTargetAtTime(.25, ac.currentTime, .4); });
  at(41400, () => stop());
}
function stop(silent) {
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
  if (droneNodes) { try { const t = ac.currentTime; droneNodes.g.gain.setTargetAtTime(0, t, .3); droneNodes.os.forEach(o => o.stop(t + 1.2)); } catch (e) {} droneNodes = null; }
  const r = root; root = null;
  if (r) { r.classList.add('out'); setTimeout(() => r.remove(), silent ? 0 : 600); }
  if (!silent) { audioOff(); const d = done; done = null; if (d) setTimeout(d, silent ? 0 : 250); }
}
const active = () => !!root;
return { play, stop, active };
})();
