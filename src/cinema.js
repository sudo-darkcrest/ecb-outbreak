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
function tone(at, f, dur, gain, type, f2) {
  if (!ac) return; const t = ac.currentTime + (at || 0);
  const o = ac.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(.08, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
}
const tick = () => noise(.018, 'highpass', 2800, .12);
const staticBurst = (d) => noise(d || .35, 'bandpass', 1700, .35);
const heartbeat = () => { thump(0, 62, 38, .9, .22); thump(.24, 52, 34, .7, .22); };
const boom = () => { thump(0, 95, 26, 1.3, 1.6); noise(1.8, 'lowpass', 700, .9); };
// ambient beds for the different opening scenes: [sound, repeat every ms]
const AMB = {
  heart:  [heartbeat, 1150],
  klaxon: [() => { tone(0, 880, .28, .16, 'square'); tone(.32, 660, .28, .16, 'square'); }, 1250],
  static: [() => staticBurst(.22), 1900],
  jet:    [() => { noise(2.6, 'bandpass', 2400, .22); tone(0, 520, 2.6, .05, 'sawtooth', 760); thump(0, 60, 40, .35, 1.4); }, 0],
  wind:   [() => { noise(3.4, 'lowpass', 420, .55); noise(3.4, 'bandpass', 900, .08); }, 3300],
  horn:   [() => { tone(0, 73, 2.2, .5, 'sawtooth'); tone(0, 110, 2.2, .25, 'sawtooth'); noise(2.2, 'lowpass', 300, .2); }, 3600],
};
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

// ---------------------------------------------------------------- scenarios: each run gets its own version of the film
const OPENERS = [
  { art:['hospital', 'MEDICAL'], amb:'heart', lines:['A patient in a city hospital bites three nurses.', 'By morning, all four are dead. By noon, they are walking.'] },
  { art:['cine_flight', 'AIR'], amb:'jet', lines:['A cargo flight lands with its whole crew unconscious.', 'When the medics open the hatch, the crew is already awake.'] },
  { art:['cine_lab', 'RESEARCH'], amb:'klaxon', lines:['A containment alarm sounds at a remote research station.', 'The door log says it was opened from the inside.'] },
  { art:['cine_camp', 'CIVIL'], amb:'wind', lines:['A fever sweeps through a crowded refugee camp.', 'On the third night, the sick stop sleeping.'] },
  { art:['ship', 'LOGISTICS'], amb:'horn', lines:['A container ship drifts into port with no one at the helm.', 'Harbor police board her at dawn. They do not come back out.'] },
  { art:['checkpoint', 'COMBAT'], amb:'static', lines:['A border post radios in: a riot at the gate.', 'Then the radio goes quiet. The cameras keep running.'] },
];
const SOURCES = [['WHO', 'WHO MODEL · UNCHECKED SPREAD'], ['CDC', 'CDC FORECAST · NO CONTAINMENT'], ['PENTAGON', 'PENTAGON RED TEAM · WORST CASE'], ['NATO', 'NATO PLANNING CELL · NO INTERVENTION']];
const PANELS = [
  [['horde', 'COMBAT', 'The bitten will outnumber the living in whole cities.'], ['looters', 'CIVIL', 'Stores will empty in a day. Then the looting starts.'], ['grid', 'LOGISTICS', 'The power grid will fail, one city at a time.'], ['hospital', 'MEDICAL', 'Hospitals will lock their doors.']],
  [['refugees', 'CIVIL', 'Millions will flee onto the highways. The infected will follow.'], ['borders', 'CIVIL', 'Borders will close with families on the wrong side.'], ['signal', 'INTEL', 'Emergency broadcasts will loop for days. Then they will stop.'], ['water', 'LOGISTICS', 'Water plants will go dark. The taps will run dry.']],
  [['helo_down', 'AIR', 'Armies will break. Governments will go silent.'], ['nuke', 'FIRES', 'Someone will try a nuclear firebreak. It will not work.'], ['lab_siege', 'RESEARCH', 'The last labs will be overrun before they finish a cure.'], ['cult', 'CIVIL', 'The few survivors left will stop waiting for rescue.']],
];
const TURNS = ['This is what we are fighting to prevent.', 'None of this has happened yet.', 'This future is not written yet.', 'This is the worst case. We do not have to live it.'];
const READY = ['ONE FORCE IS READY.', 'ONE FORCE CAN STILL MOVE.', 'ONE BRIGADE IS ALREADY LOADED.'];
const ROLL = [['convoy', 'LOGISTICS', 'airbridge', 'AIR'], ['mech_sweep', 'COMBAT', 'apache', 'AIR'], ['redeploy', 'AIR', 'linebacker', 'COMBAT'], ['qrf', 'COMBAT', 'air_assault', 'AIR']];
const ORDERS = ['Orders: stop the projection. Hold the line until the labs find a cure.', 'Orders: get there first. Keep the labs alive until the cure is ready.', 'Orders: buy the scientists time, whatever it costs.', 'Orders: contain it, protect the labs, and do not let the map turn red.', 'Orders: reinforce the local forces wherever they break. Keep the labs alive until the cure is ready.'];
// pick one version of every beat from the run's seed, and never open the same way twice in a row
function scenario(S, peek) {
  let h = 2166136261 >>> 0; const str = String(S.seed) + ':film'; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const r = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const pick = a => a[Math.floor(r() * a.length)];
  let oi = Math.floor(r() * OPENERS.length), last = null;
  try { last = JSON.parse(localStorage.getItem('ecb_film') || 'null'); } catch (e) {}
  if (last && last.seed === S.seed) oi = last.o;
  else if (last && last.o === oi) oi = (oi + 1 + Math.floor(r() * (OPENERS.length - 1))) % OPENERS.length;
  if (!peek) { try { localStorage.setItem('ecb_film', JSON.stringify({ seed:S.seed, o:oi })); } catch (e) {} }
  const hh = String(Math.floor(r() * 24)).padStart(2, '0'), mm = String(Math.floor(r() * 60)).padStart(2, '0');
  return { open:OPENERS[oi], oi, time:`${hh}:${mm}`, day:12 + Math.floor(r() * 9), src:pick(SOURCES), panels:PANELS.map(pick), turn:pick(TURNS), ready:pick(READY), roll:pick(ROLL), orders:pick(ORDERS) };
}

// ---------------------------------------------------------------- the film
function play(S, onDone) {
  try { muted = localStorage.getItem('ecb_mute') === '1'; } catch (e) {}
  stop(true);
  done = onDone; audioOn(); drone();
  const pzN = E.RD[S.pz].name, start = E.RD[S.b.loc].name, cmd = E.CMD[S.cmd];
  const live = E.REGIONS.filter(r => S.regions[r.id].z > 0).map(r => r.id); if (!live.includes(S.pz)) live.unshift(S.pz);
  const liveNames = live.map(id => E.RD[id].name).join(' AND ');
  const cases = live.reduce((a, id) => a + S.regions[id].z * E.RD[id].pop, 0);
  const n1 = E.neighbors(S.pz).filter(id => !live.includes(id)), n2 = [...new Set(n1.flatMap(id => E.neighbors(id)))].filter(id => !live.includes(id) && !n1.includes(id)).slice(0, 8);
  const n3 = [...new Set(n2.flatMap(id => E.neighbors(id)))].filter(id => !live.includes(id) && !n1.includes(id) && !n2.includes(id)).slice(0, 8);
  const projDead = (3.9 + Math.min(1.8, (S.path.inf - 1) * 3 + S.path.spread - .9)).toFixed(1);
  const V = scenario(S);
  root = document.createElement('div'); root.className = 'cine' + (RM() ? ' rm' : ''); root.id = 'cine'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Opening cinematic');
  root.innerHTML = `
    <div class="cs" id="cs1"><div class="cs-art dim">${ART.svg(V.open.art[0], V.open.art[1], 'cine-art kb', true)}</div><div class="alarm"></div>
      <div class="cs-text center"><div class="c-meta mono" id="t1a"></div><div class="c-big" id="t1b"></div><p class="c-line" id="t1c"></p><p class="c-line" id="t1d"></p></div></div>
    <div class="cs" id="cs2">${mapSVG(S.pz, live)}<div class="c-day mono" id="t2a"></div><div class="c-sub mono" id="t2b"></div><div class="proj-stamp mono" id="stamp">${V.src[1]}</div><div class="ticker"><span id="tick">BREAKING · ${V.src[0] === 'WHO' || V.src[0] === 'CDC' ? V.src[0] + ' CONFIRMS' : 'HEALTH OFFICIALS CONFIRM'} AN UNKNOWN PATHOGEN IN ${esc(liveNames.toUpperCase())} · DESIGNATED ${esc(S.path.code)} “${esc(S.path.name.toUpperCase())}” · QUARANTINE DECLARED · NO CASES CONFIRMED ANYWHERE ELSE · YET · </span></div></div>
    <div class="cs" id="cs3"><div class="cs-art" id="p3"></div><div class="cs-text low"><div class="c-tag mono" id="t3t"></div><p class="c-cap" id="t3"></p></div></div>
    <div class="cs" id="cs3b"><div class="cs-text center"><p class="c-cap" id="t3b" style="max-width:26ch"></p></div></div>
    <div class="cs" id="cs4"><div class="cs-art" id="p4">${ART.svg(V.roll[0], V.roll[1], 'cine-art', true)}</div><div class="cs-text low left"><div class="c-big" id="t4a"></div><ul class="c-list" id="t4b"></ul></div></div>
    <div class="cs" id="cs5"><div class="dossier"><div class="c-meta mono">COMMANDING OFFICER</div><div class="c-name" id="t5a"></div><div class="c-meta mono" id="t5b"></div><div class="c-rule"></div><div class="c-meta mono" id="t5c"></div><p class="c-orders" id="t5d"></p></div></div>
    <div class="cs" id="cs6"><div class="slam"><div class="s-ecb">ECB</div><div class="s-out">OUTBREAK</div><div class="s-sub mono">${esc(S.path.name.toUpperCase())} · ${esc(S.path.code)}</div></div></div>
    <div class="bars"></div><div class="grain"></div>
    <div class="cine-ui"><button id="cine-mute" class="cine-btn">${muted ? 'Sound off' : 'Sound on'}</button><button id="cine-skip" class="cine-btn">Skip ›</button></div>`;
  document.body.appendChild(root);
  root.querySelector('#cine-skip').onclick = () => stop();
  root.querySelector('#cine-mute').onclick = e => { setMuted(!muted); e.target.textContent = muted ? 'Sound off' : 'Sound on'; };
  setTimeout(() => root && root.querySelector('#cine-skip').focus({ preventScroll:true }), 50);

  // 1 · the first case (one of several openings)
  show('cs1'); const [ambF, ambEvery] = AMB[V.open.amb] || AMB.heart; ambF(); const hb = ambEvery ? setInterval(() => root && ambF(), ambEvery) : 0; if (hb) timers.push(hb);
  at(400, () => type(root.querySelector('#t1a'), `${dayBefore(V.day)} · ${V.time} LOCAL`, 38, true));
  at(1500, () => type(root.querySelector('#t1b'), pzN.toUpperCase(), 22, true));
  at(2900, () => type(root.querySelector('#t1c'), V.open.lines[0], 46, true));
  at(4500, () => type(root.querySelector('#t1d'), V.open.lines[1], 46, true));
  // 2 · the map
  // 2 · the map: what is true today, then what the model says will happen
  const setDay = (t, sub) => { if (!root) return; const d = root.querySelector('#t2a'), b = root.querySelector('#t2b'); if (d) d.textContent = t; if (b && sub != null) b.textContent = sub; };
  at(6900, () => { clearInterval(hb); hide('cs1'); show('cs2'); staticBurst(.4); type(root.querySelector('#t2a'), `DAY ${V.day} · TODAY`, 24); });
  at(7700, () => type(root.querySelector('#t2b'), `CONFIRMED: ${liveNames.toUpperCase()} · ${M(cases)} CASES`, 44));
  at(9300, () => { if (!root) return; root.querySelector('#cs2').classList.add('proj'); root.querySelector('#stamp').classList.add('on'); staticBurst(.3); thump(0, 70, 40, .6, .3); setDay('DAY 30 · PROJECTED', ''); });
  spreadRing(n1, S.pz, '#c98a2c', 9600);
  at(10900, () => setDay('DAY 60 · PROJECTED'));
  spreadRing(n2, n1[0] || S.pz, '#a8402c', 11000);
  at(12500, () => setDay('DAY 120 · PROJECTED'));
  spreadRing(n3, n2[0] || n1[0] || S.pz, '#6e2318', 12600);
  at(13600, () => type(root.querySelector('#t2b'), `PROJECTED DEATHS: ${projDead} BILLION`, 40, true));
  // 3 · the collapse the model predicts
  const panels = V.panels.map((p, i) => [p[0], p[1], `PROJECTED · DAY ${[60, 90, 120][i]}`, p[2]]);
  panels.forEach(([k, kind, tag, txt], i) => at(15400 + i * 2500, () => {
    if (!root) return; if (i === 0) { hide('cs2'); show('cs3'); }
    const p = root.querySelector('#p3'); p.innerHTML = ART.svg(k, kind, 'cine-art kb', true); staticBurst(.25);
    root.querySelector('#t3t').textContent = tag; type(root.querySelector('#t3'), txt, 52);
  }));
  at(23000, () => { hide('cs3'); show('cs3b'); type(root.querySelector('#t3b'), V.turn, 30, true); });
  // 4 · the brigade
  at(25600, () => { hide('cs3b'); show('cs4'); riser(4.2); type(root.querySelector('#t4a'), V.ready, 26, true); });
  ['EXPEDITIONARY COMBAT BRIGADE', '4,800 SOLDIERS · THREE MECHANIZED BATTALIONS', '155MM ARTILLERY · AIR DEFENSE · 11 HELICOPTERS', 'DRONES · ENGINEERS · CBRN · FIELD HOSPITALS'].forEach((t, i) => at(26900 + i * 650, () => {
    if (!root) return; const li = document.createElement('li'); li.textContent = t; root.querySelector('#t4b').appendChild(li); thump(0, 140, 90, .25, .12);
  }));
  at(28700, () => { const p = root && root.querySelector('#p4'); if (p) p.innerHTML = ART.svg(V.roll[2], V.roll[3], 'cine-art kb', true); });
  // 5 · the commander
  at(30600, () => { hide('cs4'); show('cs5'); staticBurst(.2); type(root.querySelector('#t5a'), cmd.name, 30, true); });
  at(31900, () => type(root.querySelector('#t5b'), `"${cmd.title.toUpperCase()}" · ${E.DIFFS[S.diff].name.toUpperCase()}`, 40));
  at(32800, () => type(root.querySelector('#t5c'), `STAGING AT ${start.toUpperCase()}`, 40, true));
  at(33900, () => type(root.querySelector('#t5d'), V.orders, 42, true));
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
return { play, stop, active, scenario };
})();
