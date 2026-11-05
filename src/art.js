/* ECB: OUTBREAK — card illustrations. Hand-built layered vector art on a 160×86 canvas, ground line at y=72.
   Symbols are drawn as backlit silhouettes: a dark base (inherited fill) with lit panels, glass and rim light.
   Detail tones use CSS variables so the rim-light copy of each symbol can flatten them to the accent colour. */
const ART = (function () {
'use strict';
const PAL = {
  COMBAT:   { top:'#120e0d', hz:'#6a2f1c', acc:'#ff8a4c' },
  FIRES:    { top:'#140f09', hz:'#7a4a14', acc:'#ffc062' },
  AIR:      { top:'#0a1216', hz:'#22576a', acc:'#9be2f7' },
  INTEL:    { top:'#100e17', hz:'#3f3266', acc:'#cdb8ff' },
  RESEARCH: { top:'#0a1412', hz:'#1d5a4c', acc:'#8ff0d0' },
  MEDICAL:  { top:'#0d130d', hz:'#33592e', acc:'#bdf2ad' },
  LOGISTICS:{ top:'#12110c', hz:'#5c5032', acc:'#f0dea8' },
  CIVIL:    { top:'#0a1313', hz:'#1f5450', acc:'#98ebe2' },
  COMMAND:  { top:'#131108', hz:'#665518', acc:'#ffe28a' },
  CURE:     { top:'#08130f', hz:'#1f6a48', acc:'#86ffc0' },
};
const INK = '#05080a', MID = '#0f171a', RED = '#ff4a3a', FIRE = '#ffb347';

// ---------------------------------------------------------------- detail helpers
const V = { d0:'#010203', d2:'#0b1316', d3:'#111c20', d4:'#1a282d', d5:'#25373e', z1:'#33130f', z2:'#5c1712', lt:'#ffe7a3', rl:'#ff4a3a', wm:'#ffcf7a', cm:'#1b281e', cn:'#29261b' };
const VK = Object.keys(V);
const RIMVARS = VK.map(k => `--${k}:var(--acc)`).join(';');
const n2 = v => +(+v).toFixed(2);
const F = (k, op) => `style="fill:var(--${k},${V[k]})"${op != null ? ` opacity="${op}"` : ''}`;
const S = (k, w, op) => `fill="none" style="stroke:var(--${k},${V[k]})" stroke-width="${w}"${op != null ? ` opacity="${op}"` : ''}`;
const A = op => `style="fill:var(--acc)" opacity="${op}"`;
const AS = (w, op) => `fill="none" style="stroke:var(--acc)" stroke-width="${w}" opacity="${op}" stroke-linecap="round"`;
const CS = w => `fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

function wheel(cx, cy, r, o = {}) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" ${F('d0')}/>`;
  s += o.tread ? `<circle cx="${cx}" cy="${cy}" r="${n2(r * .9)}" ${S('d2', n2(r * .2))} stroke-dasharray="${n2(r * .3)} ${n2(r * .2)}"/><circle cx="${cx}" cy="${cy}" r="${r}" ${S('d3', n2(r * .08))} stroke-dasharray="${n2(r * .3)} ${n2(r * .2)}"/>` : `<circle cx="${cx}" cy="${cy}" r="${n2(r * .86)}" ${S('d2', n2(r * .16))} stroke-dasharray="${n2(r * .22)} ${n2(r * .16)}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${n2(r * .6)}" ${F('d3')}/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${n2(r * .42)}" ${F('d2')}/>`;
  const n = o.lugs || 6;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; s += `<circle cx="${n2(cx + Math.cos(a) * r * .3)}" cy="${n2(cy + Math.sin(a) * r * .3)}" r="${n2(r * .06)}" ${F('d5')}/>`; }
  s += `<circle cx="${cx}" cy="${cy}" r="${n2(r * .13)}" ${F('d5')}/>`;
  s += `<path d="M${n2(cx - r * .78)} ${n2(cy - r * .6)} A${r} ${r} 0 0 1 ${n2(cx + r * .78)} ${n2(cy - r * .6)}" ${AS(n2(r * .08), .38)}/>`;
  return s;
}
function roadWheel(cx, cy, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" ${F('d3')}/><circle cx="${cx}" cy="${cy}" r="${n2(r * .76)}" ${F('d2')}/>`;
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3; s += `<circle cx="${n2(cx + Math.cos(a) * r * .48)}" cy="${n2(cy + Math.sin(a) * r * .48)}" r="${n2(r * .1)}" ${F('d0')}/>`; }
  return s + `<circle cx="${cx}" cy="${cy}" r="${n2(r * .24)}" ${F('d5')}/><path d="M${n2(cx - r * .7)} ${n2(cy - r * .7)} A${r} ${r} 0 0 1 ${n2(cx + r * .7)} ${n2(cy - r * .7)}" ${AS(n2(r * .1), .35)}/>`;
}
function runGear(x0, x1, h, n, r) {
  const rr = h / 2;
  let s = `<path d="M${x0 + rr} 0 L${x1 - rr} 0 A${rr} ${rr} 0 0 0 ${x1 - rr} ${-h} L${x0 + rr} ${-h} A${rr} ${rr} 0 0 0 ${x0 + rr} 0 Z" ${F('d0')}/>`;
  s += `<path d="M${x0 + rr + .6} -.4 L${x1 - rr - .6} -.4" ${S('d3', .7)} stroke-dasharray=".7 .55"/>`;
  s += `<path d="M${x0 + rr} -1 L${x1 - rr} -1 A${rr - 1} ${rr - 1} 0 0 0 ${x1 - rr} ${-h + 1} L${x0 + rr} ${-h + 1} A${rr - 1} ${rr - 1} 0 0 0 ${x0 + rr} -1 Z"/>`;
  s += `<circle cx="${x1 - rr}" cy="${-rr}" r="${n2(rr * .8)}" ${F('d3')}/><circle cx="${x1 - rr}" cy="${-rr}" r="${n2(rr * .8)}" ${S('d0', .5)} stroke-dasharray=".5 .5"/><circle cx="${x1 - rr}" cy="${-rr}" r="${n2(rr * .28)}" ${F('d5')}/>`;
  s += `<circle cx="${x0 + rr}" cy="${-rr}" r="${n2(rr * .7)}" ${F('d3')}/><circle cx="${x0 + rr}" cy="${-rr}" r="${n2(rr * .25)}" ${F('d5')}/>`;
  for (let i = 0; i < n; i++) { const cx = x0 + rr * 2.1 + (x1 - x0 - rr * 4.2) * (i / Math.max(1, n - 1)); s += roadWheel(n2(cx), n2(-r - .45), r); }
  return s;
}

// deterministic generator for skylines and scatter
function lcg(seed) { let x = seed; return () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
function skyline(seed, minH, maxH, ruin) {
  const r = lcg(seed); let x = -2, d = 'M-2 0'; const win = [], warm = [], top = [], edge = [];
  while (x < 162) {
    const w = 6 + Math.floor(r() * 12), h = minH + Math.floor(r() * (maxH - minH));
    if (ruin) {
      d += ` V${-h} L${n2(x + w * .25)} ${n2(-h - 2 - r() * 5)} L${n2(x + w * .45)} ${n2(-h + 3 + r() * 3)} L${n2(x + w * .7)} ${n2(-h - r() * 4)} L${n2(x + w * .85)} ${n2(-h + 2)} L${x + w} ${n2(-h + 1 + r() * 4)}`;
      // exposed floor slabs and rebar
      for (let fy = -h + 5; fy < -4; fy += 4 + Math.floor(r() * 3)) if (r() < .35) top.push(`<rect x="${n2(x + w - .4)}" y="${fy}" width="${n2(1.2 + r() * 2.2)}" height=".5"/>`);
      if (r() < .4) top.push(`<path d="M${n2(x + w * .3)} ${n2(-h - 1)} l${n2(r() * 2 - 1)} ${n2(-2 - r() * 3)}" fill="none" stroke="currentColor" stroke-width=".3"/>`);
    } else {
      d += ` V${-h}`;
      const roll = r();
      if (roll < .18) d += ` H${n2(x + w / 2 - 1)} V${-h - 4 - Math.floor(r() * 4)} H${n2(x + w / 2 + 1)} V${-h}`;
      else if (roll < .32) d += ` H${n2(x + 1.5)} V${-h - 2} H${n2(x + w - 1.5)} V${-h}`;
      else if (roll < .42) top.push(`<rect x="${n2(x + w * .6)}" y="${-h - 3}" width="2.4" height="2.2" rx=".5"/><rect x="${n2(x + w * .6 + .3)}" y="${-h - .8}" width=".3" height=".8"/><rect x="${n2(x + w * .6 + 1.8)}" y="${-h - .8}" width=".3" height=".8"/>`);
      if (r() < .3) top.push(`<rect x="${n2(x + 1 + r() * (w - 3))}" y="${-h - 1.2}" width="1.6" height="1.2"/>`);
      if (r() < .22) top.push(`<rect x="${n2(x + w * .3)}" y="${-h - 6}" width=".25" height="6"/>`);
      d += ` H${x + w}`;
      edge.push(`<rect x="${n2(x)}" y="${-h}" width=".35" height="${h}"/>`);
    }
    for (let wy = -h + 3; wy < -3; wy += 3.2) for (let wx = x + 1.4; wx < x + w - 1.4; wx += 2.6) {
      const q = r();
      if (q < (ruin ? .035 : .12)) win.push(`<rect x="${n2(wx)}" y="${n2(wy)}" width="1.1" height="1.4"/>`);
      else if (q < (ruin ? .06 : .16)) warm.push(`<rect x="${n2(wx)}" y="${n2(wy)}" width="1.1" height="1.4"/>`);
    }
    x += w;
  }
  d += ' V0 Z';
  return { d, win: win.join(''), warm: warm.join(''), top: top.join(''), edge: edge.join('') };
}
const SK0 = skyline(5, 22, 58), SK1 = skyline(7, 10, 34), SK2 = skyline(31, 14, 46), RU0 = skyline(3, 16, 44, true), RU1 = skyline(11, 8, 30, true), RU2 = skyline(57, 12, 40, true);

function scatter(seed, n, y0, y1, kind) {
  const r = lcg(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = n2(r() * 162 - 1), y = n2(y0 + r() * (y1 - y0)), w = n2(.6 + r() * 2.2);
    if (kind === 'rubble') s += `<path d="M${x} ${y} l${n2(w * .4)} ${n2(-w * .5)} l${n2(w * .6)} ${n2(w * .2)} l${n2(-w * .2)} ${n2(w * .3)} Z" ${F(r() < .5 ? 'd3' : 'd4')}/>`;
    else if (kind === 'grass') s += `<path d="M${x} ${y} l.3 ${n2(-1 - r() * 1.6)} l.3 ${n2(1 + r() * 1.2)} l.4 ${n2(-.8 - r() * 1.4)} l.3 ${n2(1)} Z" fill="${INK}"/>`;
    else s += `<rect x="${x}" y="${y}" width="${w}" height=".35" ${F('d3')}/>`;
  }
  return s;
}
function trees(seed, x0, x1, y, n, s, kind) {
  const r = lcg(seed); let o = '';
  for (let i = 0; i < n; i++) {
    const x = n2(x0 + (x1 - x0) * (i / Math.max(1, n - 1)) + (r() - .5) * 4), sc = n2(s * (.7 + r() * .5));
    const k = kind || (r() < .5 ? 'pine' : 'oak');
    o += `<use href="#s-${k}" transform="translate(${x} ${y}) scale(${sc})"/>`;
  }
  return o;
}
function sandbags() {
  let s = '';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) {
    const x = -14 + i * 5 + row * 2.5, y = -3.3 - row * 3.1;
    s += `<rect x="${x}" y="${n2(y)}" width="5.2" height="3.3" rx="1.6"/><path d="M${x + .8} ${n2(y + .7)} Q${x + 2.6} ${n2(y + .1)} ${x + 4.4} ${n2(y + .7)}" ${AS(.35, .4)}/><rect x="${x + .3}" y="${n2(y + 1.3)}" width=".5" height=".8" rx=".2" ${F('d4')}/><rect x="${x + 4.4}" y="${n2(y + 1.3)}" width=".5" height=".8" rx=".2" ${F('d4')}/><rect x="${x + .9}" y="${n2(y + 2.3)}" width="3.4" height=".4" ${F('d0', .7)}/>`;
  }
  return s;
}
function glass(d, op = .42) { return `<path d="${d}" ${A(op)}/>`; }

const M8W = [-21.4, -12.5, 9.4, 18.3];
// ---------------------------------------------------------------- MCV family, drawn after the ECB reference sheets
// Tracked chassis with a faceted wedge nose, bolted applique panels, side skirts, LED light bars on the glacis,
// digital camouflage blocks, stowage and whip antennas. MCV-UL is the 8x8 wheeled member.
function camo(seed, boxes) {
  const r = lcg(seed); let s = '';
  for (const [x0, x1, y0, y1, n] of boxes) for (let i = 0; i < n; i++) {
    const w = n2(1.6 + r() * 3.6), h = n2(1 + r() * 2), x = n2(x0 + r() * Math.max(0, x1 - x0 - w)), y = n2(y0 + r() * Math.max(0, y1 - y0 - h));
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${F(r() < .5 ? 'cm' : 'cn', .75)}/>`;
  }
  return s;
}
function tracks(x0, x1, h, n, r) {
  const rr = h / 2; const loop = (a, b, c) => `M${x0 + rr} ${-a} L${x1 - rr} ${-a} A${c} ${c} 0 0 0 ${x1 - rr} ${-b} L${x0 + rr} ${-b} A${c} ${c} 0 0 0 ${x0 + rr} ${-a} Z`;
  let s = `<path d="${loop(0, h, rr)}" ${F('d0')}/><path d="${loop(.35, h - .35, rr - .35)}" ${S('d3', .55)} stroke-dasharray=".7 .5"/><path d="${loop(1.2, h - 1.2, rr - 1.2)}"/>`;
  const sx = x1 - rr, ix = x0 + rr;
  s += `<circle cx="${sx}" cy="${-rr}" r="${n2(rr * .78)}" ${F('d3')}/><circle cx="${sx}" cy="${-rr}" r="${n2(rr * .78)}" ${S('d0', .55)} stroke-dasharray=".55 .45"/><circle cx="${sx}" cy="${-rr}" r="${n2(rr * .32)}" ${F('d5')}/>`;
  s += `<circle cx="${ix}" cy="${-rr}" r="${n2(rr * .68)}" ${F('d3')}/><circle cx="${ix}" cy="${-rr}" r="${n2(rr * .45)}" ${F('d2')}/><circle cx="${ix}" cy="${-rr}" r="${n2(rr * .2)}" ${F('d5')}/>`;
  const a = x0 + 2 * rr + r * .3, b = x1 - 2 * rr - r * .3;
  for (let i = 0; i < n; i++) s += roadWheel(n2(a + (b - a) * i / Math.max(1, n - 1)), n2(-r - .45), r);
  return s;
}
function hullT(p) {
  const { rx, dx, nx, ny, dy, sy, sb, sfx, seed } = p; let s = '';
  s += `<path d="M${rx} ${n2(sy + .2)} L${n2(rx - .6)} ${n2(dy + 2.2)} L${n2(rx + 1.8)} ${dy} L${dx} ${dy} L${n2(nx - 2.4)} ${n2(ny - 2.4)} L${nx} ${ny} L${n2(nx - 1.6)} ${n2(ny + 3)} L${n2(nx - 4.4)} ${n2(ny + 5.6)} L${n2(sfx - 2.8)} ${sb} L${n2(rx + .2)} ${sb} Z"/>`;
  const k = Math.round((dx - rx) / 9.5), pw = (dx - .6 - (rx + .8)) / k;
  s += `<g ${F('d2')}>${Array.from({ length:k }, (_, i) => `<rect x="${n2(rx + .8 + i * pw)}" y="${n2(dy + .8)}" width="${n2(pw - .45)}" height="${n2(sy - dy - 1.4)}"/>`).join('')}<path d="M${n2(dx + .4)} ${n2(dy + 1.4)} L${n2(nx - 4.6)} ${n2(sy - .6)} L${n2(dx + .4)} ${n2(sy - .6)} Z"/></g>`;
  s += `<path d="M${n2(rx + .8)} ${n2(dy + 1.05)} H${n2(dx - .6)}" ${S('d4', .5)}/>`;
  s += `<path d="M${dx} ${dy} L${n2(nx - 2.4)} ${n2(ny - 2.4)} L${n2(nx - 3.4)} ${n2(ny - 1.5)} L${n2(dx - .3)} ${n2(dy + 1)} Z" ${F('d3')}/>`;
  s += `<path d="M${n2(rx + .2)} ${sb} L${n2(sfx - 2.8)} ${sb} L${sfx} ${n2(sb - 3)} L${sfx} ${sy} L${n2(rx + .2)} ${sy} Z" ${F('d2')}/>`;
  const sk = Math.round((sfx - rx) / 9), sw = (sfx - rx) / sk;
  s += `<path d="${Array.from({ length:sk - 1 }, (_, i) => `M${n2(rx + sw * (i + 1))} ${n2(sy + .2)} V${n2(sb - .2)}`).join(' ')}" ${S('d0', .35)}/>`;
  s += `<path d="M${n2(rx + .2)} ${n2(sy + .25)} H${sfx}" ${S('d4', .4)}/><path d="M${n2(rx + .2)} ${n2(sb - .25)} H${n2(sfx - 3)}" ${S('d0', .5)}/>`;
  s += camo(seed, [[rx + 1, dx - 1, dy + 1, sy - .8, 7], [rx + 1, sfx - 4, sy + .5, sb - .6, 6]]);
  s += `<path d="M${n2(rx + 1.2)} ${n2(dy + 1.9)} H${n2(dx - 1)} M${n2(rx + 1.2)} ${n2(sy - 1.1)} H${n2(dx - 1)} M${n2(rx + 1)} ${n2(sy + 1.1)} H${n2(sfx - 1)} M${n2(rx + 1)} ${n2(sb - 1.1)} H${n2(sfx - 4)}" ${S('d5', .34)} stroke-dasharray=".01 1.8" stroke-linecap="round"/>`;
  const ang = Math.atan2(ny - 2.4 - dy, nx - 2.4 - dx) * 180 / Math.PI, lx = dx + .8 * (nx - 2.4 - dx), ly = dy + .8 * (ny - 2.4 - dy);
  s += `<g transform="translate(${n2(lx)} ${n2(ly + .6)}) rotate(${n2(ang)})"><circle r="1.9" ${F('lt', .18)}/><rect x="-1.5" y="-.36" width="3" height=".72" rx=".3" ${F('lt', .95)}/><rect x="-1.4" y=".6" width="2.8" height=".4" ${F('d5')}/></g>`;
  s += `<circle cx="${n2(nx - 2.8)}" cy="${n2(ny + 2.3)}" r=".8" ${S('d5', .4)}/><rect x="${n2(nx - 2.2)}" y="${n2(ny + .5)}" width="1.2" height=".55" ${F('lt', .8)}/>`;
  s += `<path d="M${n2(rx + .4)} ${n2(dy + 2.6)} V${n2(sy - .4)}" ${S('d4', .3)}/><rect x="${n2(rx - .8)}" y="${n2(dy + 3.2)}" width=".6" height="1.5" ${F('rl', .85)}/>`;
  s += `<rect x="${n2(rx + 1)}" y="${n2(dy - 2.2)}" width="6" height="2.2" ${F('d2')}/><path d="M${n2(rx + 1.2)} ${n2(dy - 1.2)} H${n2(rx + 6.8)}" ${S('d4', .25)}/>`;
  s += `<g ${F('d3')}><rect x="${n2(rx + 9)}" y="${n2(dy - .9)}" width="5" height=".9"/><rect x="${n2(rx + 17)}" y="${n2(dy - .9)}" width="4.4" height=".9"/></g><rect x="${n2(dx - 3.6)}" y="${n2(dy - 1.6)}" width="2.6" height="1.6" ${F('d2')}/><rect x="${n2(dx - 1.3)}" y="${n2(dy - 1.3)}" width=".5" height=".8" ${A(.7)}/>`;
  s += `<rect x="${n2(rx + 3)}" y="${n2(dy - 19)}" width=".28" height="17"/><rect x="${n2(rx + 5.4)}" y="${n2(dy - 14)}" width=".28" height="12"/><circle cx="${n2(rx + 3.14)}" cy="${n2(dy - 19)}" r=".42"/>`;
  s += `<path d="M${n2(rx + 1.8)} ${dy} L${dx} ${dy} L${n2(nx - 2.4)} ${n2(ny - 2.4)} L${nx} ${ny}" ${AS(.45, .5)}/>`;
  return s;
}
const HM = { rx:-31.6, dx:13.6, nx:33.2, ny:-12.2, dy:-21.2, sy:-13.8, sb:-7, sfx:28.2, seed:5 };
const HH = { rx:-34.6, dx:14.6, nx:35.2, ny:-13, dy:-22.8, sy:-14.6, sb:-7.6, sfx:30.4, seed:9 };
// small remote weapon station: x,y = base left / deck height
function rws(x, y, flip) { return `<rect x="${x}" y="${n2(y - 1.8)}" width="4.6" height="1.8"/><rect x="${n2(x + .8)}" y="${n2(y - 3.3)}" width="2.4" height="1.6" ${F('d2')}/><rect x="${n2(x + 2.8)}" y="${n2(y - 3)}" width=".5" height=".9" ${A(.8)}/><rect x="${n2(x + 4.4)}" y="${n2(y - 1.4)}" width="5.4" height=".5"/>`; }
// turret for the medium chassis (deck y=-21.2)
const MT_BODY = `<path d="M-7.2 -21 L-6.4 -22.6 L14.6 -22.6 L15.6 -21 Z" ${F('d2')}/><path d="M-6.6 -22.4 L-5.4 -27.6 L8.4 -28.2 L15.2 -25 L15.8 -22.4 Z"/><path d="M-4.8 -26.8 L8 -27.3 L14.2 -24.6 L14.6 -23.2 L-5.2 -23.2 Z" ${F('d3')}/>${camo(21, [[-4.4, 12, -26.6, -23.4, 4]])}<path d="M-4.4 -24 H13.6" ${S('d5', .32)} stroke-dasharray=".01 1.6" stroke-linecap="round"/><path d="M-5.4 -27.6 L8.4 -28.2 L15.2 -25" ${AS(.4, .55)}/>`;
const SENSOR = (x, y) => `<rect x="${n2(x + 3)}" y="${n2(y + 0)}" width="1.2" height="2.8" ${F('d2')}/><path d="M${x} ${n2(y - 3.8)} L${n2(x + 7.2)} ${n2(y - 3.8)} L${n2(x + 7.8)} ${y} L${x} ${y} Z"/><rect x="${n2(x + .6)}" y="${n2(y - 3.2)}" width="6" height="2.6" ${F('d3')}/><rect x="${n2(x + 7)}" y="${n2(y - 3.2)}" width=".8" height="1.1" ${A(.85)}/><rect x="${n2(x + 7.2)}" y="${n2(y - 1.6)}" width=".6" height=".9" ${A(.85)}/><path d="M${x} ${n2(y - 3.8)} H${n2(x + 7.2)}" ${AS(.35, .6)}/>`;
const UL = `<path d="M-30.6 -8.6 L-30.6 -18.2 L-29.4 -20.2 L13.4 -20.2 L28.6 -13.8 L31.2 -11.8 L29.8 -8 L24 -6.2 L-25.4 -6.2 Z"/>
<g ${F('d2')}><rect x="-29.8" y="-19.1" width="9.2" height="9.9"/><rect x="-20.2" y="-19.1" width="11.6" height="9.9"/><rect x="-8.2" y="-19.1" width="12.2" height="9.9"/><rect x="4.4" y="-19.1" width="8.4" height="9.9"/><path d="M13.2 -19.1 L13.5 -19.1 L27.6 -13.3 L27.6 -9.2 L13.2 -9.2 Z"/></g>
<path d="M13.4 -20.2 L28.6 -13.8 L27.6 -13 L13.1 -19.2 Z" ${F('d3')}/><rect x="-29.8" y="-19.1" width="42.6" height=".5" ${F('d4')}/>${camo(13, [[-29, 12, -18.6, -10.2, 12]])}
<rect x="-29.8" y="-9.6" width="57.4" height=".5" ${F('d0')}/>
<path d="M-29.2 -17.9 H12 M-29.2 -10.6 H26" ${S('d5', .34)} stroke-dasharray=".01 1.8" stroke-linecap="round"/>
<rect x="-6.4" y="-18" width="5.6" height="7.6" ${S('d0', .35)}/><rect x="-4.6" y="-16.8" width="2" height="1" ${A(.5)}/>
<path d="M-30.6 -17.4 V-9.2" ${S('d4', .35)}/><rect x="-31" y="-16.8" width=".6" height="1.5" ${F('rl', .85)}/>
<g transform="translate(25 -15.4) rotate(22.7)"><circle r="1.9" ${F('lt', .18)}/><rect x="-1.5" y="-.36" width="3" height=".72" rx=".3" ${F('lt', .95)}/></g><circle cx="29.6" cy="-9.8" r=".8" ${S('d5', .4)}/><rect x="28.8" y="-11.6" width="1.2" height=".5" ${F('lt', .8)}/>
<g ${F('d3')}><rect x="-24.4" y="-21" width="5.4" height=".9"/><rect x="-15.4" y="-21" width="4.6" height=".9"/></g><rect x="-29.6" y="-22" width="4.6" height="1.9" ${F('d2')}/>
<rect x="-27.6" y="-38.2" width=".28" height="18"/><rect x="-25.6" y="-33.6" width=".28" height="13.4"/><circle cx="-27.46" cy="-38.2" r=".42"/>
<path d="M-29.4 -20.2 L13.4 -20.2 L28.6 -13.8 L31.2 -11.8" ${AS(.45, .5)}/>
${M8W.map(x => `<path d="M${n2(x - 5.6)} -6 L${n2(x - 4.4)} -9.4 L${n2(x + 4.4)} -9.4 L${n2(x + 5.6)} -6 Z" ${F('d0')}/>`).join('')}
${M8W.map(x => wheel(x, -4.6, 4.6, { lugs:8, tread:1 })).join('')}`;

const VEH = `
<g id="h-mm">${tracks(-30, 29, 10.4, 6, 3.5)}${hullT(HM)}</g>
<g id="h-mh">${tracks(-33, 31, 11, 7, 3.3)}${hullT(HH)}</g>
<g id="h-ul">${UL}</g>
<g id="s-ifv"><use href="#h-mm"/>${MT_BODY}
<rect x="15.4" y="-26" width="2.6" height="3.2" ${F('d2')}/><rect x="17.8" y="-25.5" width="4.6" height="1.9"/><rect x="22.2" y="-25.1" width="13.2" height="1.1"/><rect x="35" y="-25.55" width="3" height="2" ${F('d3')}/><rect x="36.2" y="-25.55" width=".4" height="2" ${F('d0')}/><rect x="16.4" y="-23.4" width="3.2" height=".6"/><path d="M17.8 -25.5 H35" ${AS(.25, .4)}/>
${SENSOR(-2.4, -30.6)}<rect x="9.4" y="-30" width="4" height="2"/><rect x="12.9" y="-29.6" width=".7" height="1" ${A(.8)}/>
<path d="M-8.4 -30.6 L.4 -30.8 L.4 -28 L-8.4 -27.8 Z" ${F('d2')}/><rect x="-.2" y="-30.6" width=".8" height="2.6" ${A(.35)}/><path d="M-8.2 -30.6 H.2" ${AS(.3, .45)}/>
<g ${F('d3')}><rect x="10.6" y="-28.4" width="2" height=".7" transform="rotate(-30 10.6 -28.4)"/><rect x="11" y="-27.4" width="2" height=".7" transform="rotate(-30 11 -27.4)"/></g>
${rws(-17, -21.2)}
</g>
<g id="s-ad"><use href="#h-mm"/>
<path d="M-7.2 -21 L-6.4 -22.6 L14.6 -22.6 L15.6 -21 Z" ${F('d2')}/><path d="M-6.6 -22.4 L-5.6 -26.8 L8 -27.2 L14.4 -24.6 L15 -22.4 Z"/><path d="M-4.8 -26 L7.6 -26.4 L13.6 -24.2 L13.8 -23.2 L-5.2 -23.2 Z" ${F('d3')}/>${camo(23, [[-4.4, 12, -25.8, -23.4, 3]])}
<rect x="14.6" y="-25.6" width="2.2" height="2.8" ${F('d2')}/><rect x="16.6" y="-25.1" width="4.2" height="1.7"/><rect x="20.6" y="-24.7" width="7.4" height="1"/><rect x="27.6" y="-25" width="2" height="1.6" ${F('d3')}/>
<g transform="rotate(-14 -1 -28)"><rect x="-3.4" y="-28.6" width="3" height="2.4"/><rect x="-10.6" y="-34.6" width="15.4" height="5.8" rx=".6" ${F('d2')}/>${camo(29, [[-10, 4, -34, -29.4, 3]])}<rect x="-10.6" y="-34.6" width="15.4" height=".55" ${A(.45)}/><path d="M-9.6 -31.7 H4" ${S('d0', .3)}/><rect x="4.4" y="-34.2" width="1.1" height="5" ${F('d3')}/><circle cx="4.95" cy="-33.1" r=".62" ${A(.75)}/><circle cx="4.95" cy="-30.4" r=".62" ${A(.75)}/></g>
<rect x="-6.4" y="-36.4" width=".9" height="9"/><path d="M-10.2 -41.4 L-2.6 -40.2 L-2.8 -36 L-10.4 -37.2 Z" ${F('d2')}/><path d="M-9.8 -40.8 L-3 -39.7" ${AS(.3, .55)}/><path d="M-9.9 -39.4 L-3 -38.3 M-10 -38.2 L-3.1 -37.1" ${S('d4', .2)}/>
<circle cx="10" cy="-28.6" r="1.6"/><circle cx="10.8" cy="-28.6" r=".65" ${A(.85)}/><rect x="9.2" y="-27.2" width="1.6" height="1"/>
${rws(-17, -21.2)}
</g>
<g id="s-mf"><use href="#h-mm"/>
<path d="M-9 -21 L-8.2 -22.8 L13 -22.8 L14 -21 Z" ${F('d2')}/><path d="M-8.4 -22.6 L-7.4 -27.4 L9.4 -27.8 L13.8 -25 L14 -22.6 Z"/><path d="M-6.8 -26.6 L9 -27 L12.8 -24.8 L13 -23.4 L-7.2 -23.4 Z" ${F('d3')}/>${camo(31, [[-6.6, 11, -26.4, -23.6, 4]])}<path d="M-7.4 -27.4 L9.4 -27.8 L13.8 -25" ${AS(.4, .55)}/>
<g transform="rotate(-52 6 -27)"><rect x="5" y="-29.4" width="17" height="2.5"/><rect x="5" y="-26.6" width="16" height="2.5" ${F('d2')}/><rect x="21.4" y="-29.9" width="2.6" height="3.5" ${F('d3')}/><rect x="20.4" y="-27.1" width="2.6" height="3.5" ${F('d3')}/><path d="M5 -29.4 H21.4" ${AS(.3, .5)}/></g>
<rect x="3.4" y="-29" width="5" height="3.8" ${F('d2')}/><rect x="-4.6" y="-30.4" width="3.6" height="2.4"/><rect x="-1.6" y="-30" width=".6" height="1" ${A(.8)}/>
${rws(-17, -21.2)}
</g>
<g id="s-mc"><use href="#h-mm"/>
<rect x="-2" y="-23.4" width="9" height="2.2" ${F('d2')}/><path d="M-1.4 -23.4 L-.8 -26 L6 -26 L7.6 -23.4 Z"/><rect x="7.4" y="-25.2" width="7" height=".7"/>${SENSOR(.4, -26)}
<rect x="-14.4" y="-30" width="1.6" height="8.8" ${F('d2')}/><rect x="-14.1" y="-40" width="1" height="10.2"/><rect x="-13.9" y="-44" width=".6" height="4"/><path d="M-17.4 -48 L-9.6 -48 L-9.2 -44.2 L-17.4 -44.2 Z"/><rect x="-16.8" y="-47.4" width="6.6" height="2.6" ${F('d3')}/><rect x="-10" y="-47.2" width=".8" height="1.1" ${A(.85)}/><path d="M-17.4 -48 H-9.6" ${AS(.35, .6)}/>
<rect x="-6.2" y="-38" width="1" height="16.8"/><path d="M-8.8 -43 L-2.6 -43 L-2.6 -38 L-8.8 -38 Z" ${F('d2')}/><path d="M-8.4 -41.4 H-3 M-8.4 -39.6 H-3" ${S('d4', .25)}/><circle cx="-5.7" cy="-43.6" r=".5" fill="#ff4a3a"/>
<rect x="-22" y="-24" width="6" height="2.8" ${F('d2')}/><path d="M-21.4 -23.1 H-16.6 M-21.4 -22.2 H-16.6" ${S('d0', .3)}/><rect x="10" y="-34" width=".28" height="12.8"/>
</g>
<g id="s-sp"><use href="#h-mh"/>
<path d="M-24 -22.6 L-23 -24.4 L13.6 -24.4 L14.6 -22.6 Z" ${F('d2')}/>
<path d="M-25.6 -24.2 L-25.8 -33.6 L-22.8 -35.6 L4.6 -35.6 L13.4 -31 L14.6 -24.2 Z"/><path d="M-24.4 -33 L-22.2 -34.6 L4.2 -34.6 L12.4 -30.6 L13.2 -25.2 L-24.4 -25.2 Z" ${F('d3')}/>${camo(41, [[-23.6, 11, -34, -25.8, 7]])}
<g ${F('d2')}><rect x="-22.6" y="-28.6" width="9" height="3"/><rect x="-12" y="-28.6" width="7" height="3"/><rect x="-29.6" y="-33.4" width="4.2" height="9.6"/></g><path d="M-29.4 -30.6 H-25.6 M-29.4 -27.8 H-25.6" ${S('d4', .25)}/>
<rect x="-2.6" y="-33" width="7" height="7.4" ${S('d0', .35)}/><path d="M-24 -32.2 H11.4 M-24 -26 H12.8" ${S('d5', .32)} stroke-dasharray=".01 1.7" stroke-linecap="round"/><path d="M-22.8 -35.6 L4.6 -35.6 L13.4 -31" ${AS(.45, .55)}/>
${rws(-12.6, -35.6)}<rect x="-24.2" y="-50" width=".28" height="14.4"/><rect x="-21.8" y="-46" width=".28" height="10.4"/><circle cx="-24.06" cy="-50" r=".42"/>
<g transform="rotate(-16 14 -29.6)"><rect x="12.6" y="-32.2" width="4.4" height="5.2" ${F('d2')}/><rect x="16.8" y="-30.5" width="40" height="2"/><rect x="16.8" y="-32.4" width="10" height="1" ${F('d3')}/><rect x="30" y="-31.2" width="7.6" height="3.4" rx="1.4"/><rect x="56" y="-31.6" width="5.4" height="3.8" ${F('d3')}/><rect x="57.6" y="-31.6" width=".55" height="3.8" ${F('d0')}/><rect x="59.4" y="-31.6" width=".55" height="3.8" ${F('d0')}/><path d="M16.8 -30.5 H56 M30.4 -31.2 H37.2" ${AS(.3, .45)}/></g>
</g>
<g id="s-dozer"><use href="#h-mh"/>
${rws(-6, -22.8)}<rect x="-26" y="-25.4" width="10" height="2.6" ${F('d2')}/><path d="M-25.4 -24.1 H-16.6" ${S('d4', .25)}/>
<path d="M22 -12.6 L37.4 -8 L37.4 -5.6 L22 -10.4 Z" ${F('d2')}/><path d="M20 -19.4 L37.6 -18.8 L37.6 -17.4 L20 -18 Z" ${F('d3')}/><rect x="18.8" y="-20.6" width="2.6" height="2.6" rx=".6" ${F('d2')}/>
<path d="M36.2 .4 L37 -21.8 Q43.4 -20 45.2 -13.4 Q45.8 -6.2 44.2 .4 Z"/>${camo(47, [[37.6, 43, -19, -2, 4]])}
<path d="M37.8 -18.6 Q41.8 -17 43.6 -12.4 M37.8 -12.4 Q41.6 -11 43.4 -6.8 M37.6 -6.4 Q41 -5.2 42.8 -2" ${S('d3', .45)}/><path d="M37 -21.8 Q43.4 -20 45.2 -13.4" ${AS(.5, .55)}/><path d="M36.2 .4 L44.2 .4 L44.4 -1 L36.3 -1 Z" ${F('d4')}/>
</g>
<g id="s-hr"><use href="#h-mh"/>
<rect x="-8" y="-26.4" width="10" height="3.6" ${F('d2')}/><path d="M-6 -26.4 L-5.4 -30 L2 -30 L3.4 -26.4 Z"/><rect x="-4.4" y="-29.4" width="4.6" height="2.4" ${A(.32)}/><circle cx="0" cy="-30.6" r=".55" ${F('wm', .95)}/><circle cx="0" cy="-30.6" r="1.4" ${F('wm', .25)}/>
<path d="M-2 -28 L28 -46 L29.4 -44 L-.4 -26 Z"/><path d="M-.6 -27.4 L27.6 -44.6" ${AS(.35, .5)}/><path d="M26 -45 L33.2 -49.4 L34.2 -48 L27.4 -43.6 Z" ${F('d2')}/><path d="M2 -25 L14 -37 L15.4 -35.6 L3.4 -24 Z" ${F('d3')}/>
<path d="M33.7 -48.6 V-31" fill="none" stroke="currentColor" stroke-width=".3"/><rect x="32.6" y="-31.2" width="2.2" height="2.2"/><path d="M33.7 -29 Q35.2 -27.4 33.7 -26.4 Q32.6 -26 32.4 -27" fill="none" stroke="currentColor" stroke-width=".45"/>
<circle cx="-26" cy="-25" r="1.7" ${F('d3')}/><circle cx="-26" cy="-25" r=".6" ${F('d5')}/><path d="M-34 -10 L-38.4 -1.4 L-36.2 -.4 L-32.6 -6.6 Z"/>
</g>
<g id="s-hw"><use href="#h-mh"/>
<path d="M-12.6 -22.6 L-11.6 -24.4 L14.6 -24.4 L15.6 -22.6 Z" ${F('d2')}/><path d="M-12 -24.2 L-11 -29.4 L9 -29.8 L15 -26.6 L15.6 -24.2 Z"/><path d="M-10.2 -28.6 L8.6 -29 L14 -26.2 L14.4 -25 L-10.6 -25 Z" ${F('d3')}/>${camo(51, [[-10, 12, -28.4, -25.4, 4]])}<path d="M-11 -29.4 L9 -29.8 L15 -26.6" ${AS(.4, .55)}/>
<rect x="15.2" y="-27.6" width="2.2" height="2.6" ${F('d2')}/><rect x="17.2" y="-27.1" width="10" height="1"/><rect x="27" y="-27.4" width="2" height="1.6" ${F('d3')}/>
<g transform="rotate(-8 -4 -31)"><rect x="-12.4" y="-39.8" width="16.6" height="3" ${F('d3')}/><rect x="-13" y="-36.6" width="17.4" height="5.6" rx=".6" ${F('d2')}/>${camo(53, [[-12.4, 3, -36, -31.6, 3]])}<rect x="-13" y="-36.6" width="17.4" height=".55" ${A(.45)}/><path d="M-12 -33.8 H4" ${S('d0', .3)}/><rect x="4.2" y="-36.2" width="1.1" height="4.8" ${F('d3')}/><circle cx="4.75" cy="-35" r=".62" ${A(.75)}/><circle cx="4.75" cy="-32.6" r=".62" ${A(.75)}/><rect x="-1.4" y="-31.4" width="2.6" height="2.4"/></g>
${SENSOR(7, -29.8)}${rws(-26, -22.8)}
</g>
<g id="s-ul"><use href="#h-ul"/>
<path d="M-4.6 -20 L-4 -21.4 L9.6 -21.4 L10.4 -20 Z" ${F('d2')}/><path d="M-4 -21.2 L-3.2 -25.2 L6.4 -25.6 L10.6 -23.4 L11 -21.2 Z"/><path d="M-2.6 -24.4 L6 -24.8 L9.8 -23 L10 -22 L-3 -22 Z" ${F('d3')}/><path d="M-3.2 -25.2 L6.4 -25.6 L10.6 -23.4" ${AS(.4, .55)}/>
<rect x="10.6" y="-24.2" width="2" height="2.4" ${F('d2')}/><rect x="12.4" y="-23.6" width="13" height=".95"/><rect x="25" y="-23.9" width="2.2" height="1.5" ${F('d3')}/>
${SENSOR(-1.2, -27.4)}<path d="M-5.4 -27.4 L.6 -27.6 L.6 -25.4 L-5.4 -25.2 Z" ${F('d2')}/>
</g>
<g id="s-truck">
<rect x="-21.6" y="-7.6" width="43.4" height="1.6" ${F('d0')}/>
<path d="M-21.6 -7 L-21.6 -11.4 L9 -11.4 L9 -7 Z"/><path d="M-21 -9.2 H8.4" ${S('d3', .35)}/><path d="M-14 -11.2 V-7.2 M-6.4 -11.2 V-7.2 M1.2 -11.2 V-7.2" ${S('d3', .3)}/>
<path d="M-21.6 -11.2 L-21.6 -16.4 Q-6.4 -17.6 9 -16.4 L9 -11.2 Z" ${F('d2')}/>
<path d="M-14 -17 V-11.4 M-6.4 -17.2 V-11.4 M1.2 -17 V-11.4" ${S('d0', .35)}/>
<path d="M-21 -11.8 L-17.4 -14.6 L-14 -11.8 L-10.2 -14.6 L-6.4 -11.8 L-2.6 -14.6 L1.2 -11.8 L5 -14.6 L8.6 -11.8" ${S('d4', .25)}/>
<path d="M-21.6 -16.4 Q-6.4 -17.6 9 -16.4" ${AS(.45, .5)}/>
<path d="M9.6 -6.4 L9.6 -17 L10.6 -18 L17.8 -18 L20 -14.8 L20.6 -10.8 L22 -10 L22 -6.4 Z"/>
<path d="M10.6 -17 L17.4 -17 L19 -14.6 L19.4 -7.4 L10.6 -7.4 Z" ${F('d3')}/>
${glass('M11.8 -16.4 L17 -16.4 L18.6 -13.6 L11.8 -13.6 Z', .45)}<path d="M13 -16 L14.6 -14" ${AS(.3, .6)}/>
<path d="M11 -12.6 H18.8 M18.9 -16 V-7.6" ${S('d0', .3)}/><rect x="16.6" y="-11.8" width="1.4" height=".4" ${F('d5')}/>
<rect x="20" y="-17.2" width=".5" height="2.8" ${F('d2')}/><rect x="20.6" y="-7.2" width="2" height="1.7" ${F('d2')}/><rect x="21.3" y="-9.8" width=".7" height=".9" ${F('lt', .9)}/>
<path d="M20.4 -13 L21.8 -10.4" ${S('d4', .3)}/><rect x="11.6" y="-6.9" width="4.2" height=".6" ${F('d3')}/><rect x="1.6" y="-7.4" width="6.4" height="1.9" rx=".8" ${F('d3')}/>
<path d="M12.2 -18 L12.6 -19.4 L17 -19.4 L17.4 -18 Z" ${F('d2')}/><rect x="13.6" y="-20.4" width="7.6" height=".7"/><rect x="13.2" y="-21.2" width="2.8" height="1.6"/>
<rect x="-21.8" y="-10.6" width=".5" height="1.2" ${F('rl', .8)}/><path d="M-21.6 -6.2 V-3" ${S('d2', 1)}/>
${wheel(15.8, -3.3, 3.3)}${wheel(-15.6, -3.3, 3.3)}${wheel(-8.4, -3.3, 3.3)}
</g>
<g id="s-tanker">
<rect x="-21.8" y="-7.6" width="44.4" height="1.6" ${F('d0')}/>
<rect x="-21.6" y="-15.6" width="30.6" height="9.4" rx="4.4" ${F('d2')}/>
<rect x="-20.6" y="-10.4" width="28.6" height="3.8" rx="1.9" ${F('d0', .45)}/>
<path d="M-17.4 -15.5 H4.6" ${AS(.5, .55)}/>
<g ${F('d0')}><rect x="-14.6" y="-15.6" width=".6" height="9.4"/><rect x="-5.8" y="-15.6" width=".6" height="9.4"/><rect x="2.8" y="-15.6" width=".6" height="9.4"/></g>
<path d="M-19 -17.8 H6 M-19 -17.8 V-15.6 M-7 -17.8 V-15.6 M6 -17.8 V-15.6" ${S('d3', .3)}/>
<g ${F('d3')}><rect x="-12.4" y="-16.5" width="3" height=".9"/><rect x="-2.6" y="-16.5" width="3" height=".9"/></g>
<rect x="-4.8" y="-13" width="3.8" height="2.8" ${A(.22)}/><path d="M-2.9 -12.8 L-1.7 -11.6 L-2.9 -10.4 L-4.1 -11.6 Z" ${F('rl', .55)}/>
<circle cx="-19.6" cy="-9.4" r="1.7" ${F('d3')}/><circle cx="-19.6" cy="-9.4" r=".6" ${F('d5')}/>
<path d="M9.6 -6.4 L9.6 -16.4 L10.4 -17.2 L17 -17.2 L19.4 -13.2 L22.2 -12.6 L22.6 -6.4 Z"/>
<path d="M10.6 -16.4 L16.6 -16.4 L18.4 -13 L18.8 -7.4 L10.6 -7.4 Z" ${F('d3')}/>
${glass('M11.6 -15.8 L16.2 -15.8 L17.8 -13 L11.6 -13 Z', .45)}<path d="M12.6 -15.4 L14 -13.6" ${AS(.3, .6)}/>
<path d="M10.8 -12 H18.4 M18.5 -15 V-7.6" ${S('d0', .3)}/><rect x="9.8" y="-20.2" width=".9" height="3.6" ${F('d2')}/>
<rect x="19.6" y="-16.4" width=".5" height="2.6" ${F('d2')}/><rect x="21.2" y="-7.2" width="1.8" height="1.6" ${F('d2')}/><rect x="21.8" y="-10.4" width=".7" height=".9" ${F('lt', .9)}/><rect x="-22" y="-10" width=".5" height="1.2" ${F('rl', .8)}/>
${wheel(17.6, -3.1, 3.1)}${wheel(11, -3.1, 3.1)}${wheel(-10.6, -3.1, 3.1)}${wheel(-17.2, -3.1, 3.1)}
</g>
<g id="s-pickup">
<path d="M-15.2 -3.4 L-15.4 -8.6 L1.4 -8.6 L4.4 -13.8 L11.8 -13.8 L14.8 -9.2 L17.8 -8.4 L18.4 -5.4 L18 -3.4 Z"/>
<path d="M-14.6 -8 L14.4 -8 L17.4 -7.6 L17.6 -4.6 L-14.6 -4.6 Z" ${F('d3')}/><path d="M-15.4 -8.6 H1.4 L4.4 -13.8 H11.8 L14.8 -9.2" ${AS(.4, .5)}/>
${glass('M5.2 -13 L11.2 -13 L13.6 -9.4 L5.2 -9.4 Z', .45)}<rect x="8.2" y="-13" width=".6" height="3.6"/><path d="M8.6 -8.6 V-4.6 M2 -8.4 V-4.6" ${S('d0', .3)}/><rect x="6" y="-7.6" width="1.2" height=".4" ${F('d5')}/>
<rect x="17.4" y="-4.8" width="1.6" height="1.5" ${F('d2')}/><rect x="17.8" y="-7.8" width=".7" height=".8" ${F('lt', .9)}/><rect x="-15.6" y="-7.6" width=".5" height="1.2" ${F('rl', .8)}/>
<path d="M-12.6 -3.4 A3.8 3.8 0 0 1 -5 -3.4 Z" ${F('d0')}/><path d="M7.6 -3.4 A3.8 3.8 0 0 1 15.2 -3.4 Z" ${F('d0')}/>
${wheel(-8.8, -2.8, 2.8)}${wheel(11.4, -2.8, 2.8)}
<rect x="-6.6" y="-14.2" width="1" height="5.8" ${F('d2')}/><rect x="-10.4" y="-15.6" width="9.6" height="1.3"/><rect x="-.8" y="-15.2" width="7.6" height=".5"/><rect x="6.4" y="-15.4" width="1.2" height=".9"/><path d="M-3 -17.8 L-1.6 -17.8 L-1.6 -13.8 L-3 -13.8 Z" ${F('d3')}/><rect x="-8.6" y="-14.4" width="2" height="1.4" ${F('d3')}/>
</g>
<g id="s-bus">
<path d="M-23 -3.2 L-23 -17.8 L19.6 -17.8 Q23.4 -17.6 23.8 -13 L23.8 -3.2 Z"/>
<rect x="-22.4" y="-8.6" width="45.6" height="4.8" ${F('d3')}/><rect x="-22.4" y="-9.4" width="45.6" height=".6" ${A(.3)}/>
<g ${A(.4)}>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${n2(-20.8 + i * 5.3)}" y="-16.4" width="4.4" height="5"/>`).join('')}</g>
<path d="M-20 -16 L-18.6 -12" ${AS(.3, .5)}/><path d="M-4.2 -16 L-2.8 -12" ${AS(.3, .5)}/>
<rect x="17.8" y="-16.4" width="3.4" height="12.6" ${F('d2')}/><rect x="18.2" y="-15.8" width="1.2" height="6" ${A(.3)}/><rect x="19.6" y="-15.8" width="1.2" height="6" ${A(.3)}/>
${glass('M21.6 -16.6 Q23 -16.2 23.2 -13 L23.2 -10.4 L21.6 -10.4 Z', .5)}
<rect x="-8" y="-19" width="10" height="1.2" ${F('d2')}/><rect x="18.4" y="-17.4" width="3.4" height=".9" ${F('lt', .7)}/>
<rect x="23.2" y="-6" width=".8" height="1" ${F('lt', .9)}/><rect x="-23.4" y="-6.4" width=".6" height="1.4" ${F('rl', .8)}/><path d="M-23 -17.8 H19.6 Q23.4 -17.6 23.8 -13" ${AS(.4, .5)}/>
<path d="M-18.6 -3.2 A4.2 4.2 0 0 1 -10.2 -3.2 Z" ${F('d0')}/><path d="M10.8 -3.2 A4.2 4.2 0 0 1 19.2 -3.2 Z" ${F('d0')}/>
${wheel(-14.4, -3, 3)}${wheel(15, -3, 3)}
</g>
<g id="s-car">
<path d="M-9.8 -.8 L-9.6 -3.6 L-5.8 -4.6 L-3.4 -7.4 L4 -7.4 L6.6 -4.6 L9.6 -4 L10 -.8 Z"/>
${glass('M-2.8 -6.8 L.2 -6.8 L.2 -4.8 L-4.6 -4.8 Z', .38)}${glass('M1 -6.8 L3.6 -6.8 L5.6 -4.8 L1 -4.8 Z', .38)}
<path d="M-9.4 -2.8 H9.6" ${S('d4', .3)}/><path d="M-5.8 -4.6 L-3.4 -7.4 H4 L6.6 -4.6" ${AS(.35, .45)}/><rect x="9.2" y="-3.4" width=".6" height=".7" ${F('lt', .7)}/>
${wheel(-5.6, 0, 2)}${wheel(5.8, 0, 2)}
</g>
<g id="s-apache">
<ellipse cx="1" cy="-14.2" rx="31" ry="1.3" ${A(.07)}/><rect x="-30" y="-14.6" width="62" height=".8"/><rect x="-30" y="-14.6" width="3" height=".8" ${F('d5')}/><rect x="29" y="-14.6" width="3" height=".8" ${F('d5')}/>
<ellipse cx=".6" cy="-17.6" rx="3.1" ry="1.9"/><path d="M-2.4 -18.4 Q.6 -20.2 3.6 -18.4" ${AS(.35, .55)}/><rect x="-.3" y="-16" width="1.6" height="5.6"/><rect x="-1.4" y="-15.2" width="3.8" height="1.4" ${F('d2')}/>
<path d="M-13.6 -2.6 L-13 -7.6 L-4 -8.8 L2 -8.6 L10 -6.6 L17.6 -4.4 L21.6 -2.4 L21.2 .4 L16 1.8 L4 2.2 L-6 1.4 Z"/>
<path d="M-12.4 -6.8 L-3.6 -8 L1.8 -7.8 L9.6 -5.8 L16.8 -3.6 L20.4 -1.8 L20 .2 L-12 .2 Z" ${F('d2')}/>
<path d="M-9.6 -9.8 Q-6 -12.4 2.6 -12 L7.6 -10 L8 -8.4 L-10.2 -8.2 Z"/>
<path d="M-4.6 -8.8 L-3.6 -11.6 L2.4 -11.6 L5.6 -8.2 Z" ${A(.42)}/><path d="M5.2 -7.4 L6.4 -9.6 L11 -9.4 L15.4 -5.6 Z" ${A(.42)}/>
<path d="M-1 -11.6 L-.4 -8.6 M8.6 -9.4 L9.6 -6.6 M-3.6 -11.6 L2.4 -11.6" ${S('d0', .4)}/><path d="M-2.6 -11.2 L-1 -9.4 M7 -9.2 L8.2 -7.6" ${AS(.3, .65)}/>
<path d="M-11 -8 L-2 -8.4 L-1 -5.4 L-11.4 -5 Z" ${F('d3')}/><path d="M-14.4 -7.6 L-11 -8 L-11.4 -5 L-14.8 -5.2 Z" ${F('d0')}/><rect x="-2.4" y="-7.8" width="1.4" height="2.2" ${A(.25)}/>
<rect x="-7" y="-2.2" width="15" height="1.2" ${F('d3')}/><rect x="-4.4" y="-1.2" width="1.2" height="1.4"/><rect x="3.8" y="-1.2" width="1.2" height="1.4"/>
<g ${F('d2')}><rect x="-7.6" y=".2" width="8" height=".9" rx=".4"/><rect x="-7.6" y="1.3" width="8" height=".9" rx=".4"/></g><path d="M.4 .2 L1.4 .65 L.4 1.1 Z M.4 1.3 L1.4 1.75 L.4 2.2 Z" ${A(.5)}/>
<rect x="2.2" y="-.1" width="6.4" height="2.8" rx="1.1"/><g ${A(.4)}><circle cx="8.2" cy=".6" r=".45"/><circle cx="8.2" cy="1.8" r=".45"/></g>
<circle cx="21.8" cy="-.4" r="2" ${F('d2')}/><rect x="22.6" y="-1.2" width="1.4" height="1.6" ${A(.7)}/><circle cx="20.6" cy="-3.6" r="1" ${F('d3')}/><circle cx="21.1" cy="-3.6" r=".4" ${A(.7)}/>
<circle cx="14.6" cy="2" r="1.3"/><rect x="15" y="2.3" width="6.4" height=".55"/>
<path d="M6.4 1.8 L5.4 4.2" ${CS(.6)}/><path d="M-1 1.4 L-1.6 3.8" ${CS(.5)}/>${wheel(5.2, 4.6, 1.5, { lugs: 4 })}
<path d="M-13 -6.8 L-38 -4.4 L-38.4 -2.6 L-13.2 -2.8 Z"/><path d="M-13 -6.8 L-38 -4.4" ${AS(.35, .45)}/><rect x="-30" y="-4.6" width="2" height="1.6" ${F('d3')}/>
<path d="M-36.4 -4 L-41 -13.8 L-38.6 -14 L-34.6 -4.4 Z"/><path d="M-41 -13.8 L-38.6 -14" ${AS(.4, .5)}/>
<circle cx="-39.8" cy="-11.4" r="4.4" ${A(.07)}/><g transform="translate(-39.8 -11.4)"><rect x="-4.4" y="-.3" width="8.8" height=".6" transform="rotate(55)"/><rect x="-4.4" y="-.3" width="8.8" height=".6" transform="rotate(-35)"/><circle r=".8" ${F('d4')}/></g>
<rect x="-41" y="-2.8" width="7.2" height="1" ${F('d2')}/><path d="M-37.6 -2.6 L-38 -.6" ${CS(.45)}/><circle cx="-38" cy="-.2" r=".9" ${F('d0')}/>
<path d="M-9 -12 L-8.4 -13.6" ${CS(.3)}/><rect x="-3" y="-12.4" width="2.2" height=".8" ${F('d3')}/>
</g>
<g id="s-hawk">
<ellipse cx="0" cy="-17.2" rx="33" ry="1.3" ${A(.07)}/><rect x="-33" y="-17.6" width="66" height=".8"/><rect x="-33" y="-17.6" width="3" height=".8" ${F('d5')}/><rect x="30" y="-17.6" width="3" height=".8" ${F('d5')}/>
<rect x="-.5" y="-17.2" width="1.6" height="3.6"/><rect x="-1.8" y="-18.8" width="4" height="1.6" ${F('d2')}/>
<path d="M-13 -12.4 Q-9 -15.4 0 -15.4 L6 -14.8 Q10.4 -14.2 12.4 -12.4 Z"/><path d="M-9 -14.6 Q-4 -15.6 2 -15.4" ${AS(.35, .5)}/><path d="M-10.4 -14.2 L-6 -14.6 L-6 -13 L-10.6 -12.8 Z" ${F('d0')}/><rect x="4" y="-14.6" width="2.4" height="1.4" ${A(.25)}/>
<path d="M-15 -10.6 L-46 -8.4 L-46.2 -6.6 L-15 -4.8 Z"/><path d="M-15 -10.6 L-46 -8.4" ${AS(.35, .45)}/>
<path d="M-14.6 -12.6 L11 -12.6 Q16 -12 18.4 -9 L21.4 -5.2 Q22.4 -2.4 20 -.8 L-8 -.8 Q-12 -1 -13.6 -3.6 L-15.4 -6 Z"/>
<path d="M-13.6 -11.8 L10.6 -11.8 Q14.6 -11.2 17 -8.6 L19.4 -5.2 L19.6 -1.6 L-8 -1.6 Q-11.6 -1.8 -12.8 -3.8 L-14.2 -6 Z" ${F('d2')}/>
${glass('M11.2 -12 Q15.6 -11.4 18 -8.8 L20.6 -5.6 L14.6 -5.8 L11 -8.4 Z', .45)}<path d="M14.4 -11.2 L14.6 -5.8 M11 -8.4 L20.6 -5.6" ${S('d0', .35)}/><path d="M12.6 -11.2 L16.4 -8.4" ${AS(.3, .65)}/>
${glass('M6.6 -11.4 L10.2 -11.4 L10.2 -7.6 L6.6 -7.6 Z', .32)}${glass('M-6.6 -11.2 L-1.6 -11.2 L-1.6 -7.6 L-6.6 -7.6 Z', .3)}${glass('M-.6 -11.2 L4.6 -11.2 L4.6 -7.6 L-.6 -7.6 Z', .3)}
<rect x="-7.4" y="-11.8" width="12.8" height="10" ${S('d0', .35)}/><path d="M-7 -6.4 H5" ${S('d4', .25)}/>
<rect x="1.8" y="-8.6" width="5.4" height=".55"/><rect x="1.8" y="-9.2" width="1.8" height="1.4"/>
<path d="M11 -12.6 L14.4 -14.2 M20.8 -1.2 L23 -.4" ${CS(.3)}/>
<path d="M-44 -8 L-47.6 -17.2 L-45 -17.4 L-41.4 -8.4 Z"/><path d="M-47.6 -17.2 L-45 -17.4" ${AS(.4, .5)}/>
<circle cx="-47.8" cy="-13.4" r="4.2" ${A(.07)}/><g transform="translate(-47.8 -13.4)"><rect x="-4.2" y="-.3" width="8.4" height=".6" transform="rotate(50)"/><rect x="-4.2" y="-.3" width="8.4" height=".6" transform="rotate(-40)"/><circle r=".8" ${F('d4')}/></g>
<rect x="-47.2" y="-6.6" width="7.6" height=".9" ${F('d2')}/>
<path d="M9.4 -1 L8.6 1.4" ${CS(.6)}/>${wheel(8.4, 2.2, 1.6, { lugs: 4 })}<path d="M-34 -5 L-34.4 -1.8" ${CS(.45)}/><circle cx="-34.4" cy="-1.4" r=".9" ${F('d0')}/>
<rect x="18.6" y="-4" width=".8" height=".6" ${F('rl', .9)}/>
</g>
<g id="s-chinook">
<ellipse cx="-27" cy="-21.4" rx="21" ry="1.2" ${A(.07)}/><ellipse cx="29" cy="-17.4" rx="21" ry="1.2" ${A(.07)}/>
<rect x="-48" y="-21.8" width="42" height=".8"/><rect x="8" y="-17.8" width="42" height=".8"/><g ${F('d5')}><rect x="-48" y="-21.8" width="2.6" height=".8"/><rect x="-8.6" y="-21.8" width="2.6" height=".8"/><rect x="8" y="-17.8" width="2.6" height=".8"/><rect x="47.4" y="-17.8" width="2.6" height=".8"/></g>
<rect x="-28.4" y="-23" width="3" height="1.6" ${F('d2')}/><rect x="27.6" y="-19" width="3" height="1.6" ${F('d2')}/>
<path d="M-36.4 -11.6 L-33.6 -21 L-21.2 -21 L-18.8 -11.6 Z"/><path d="M-35 -13 L-33 -19.6 L-22.4 -19.6 L-20.6 -13 Z" ${F('d2')}/><path d="M-33.6 -21 L-21.2 -21" ${AS(.4, .5)}/>
<rect x="-39.2" y="-16.4" width="12.6" height="3.4" rx="1.6" ${F('d3')}/><rect x="-27.4" y="-16" width="1.4" height="2.6" ${A(.3)}/><rect x="-40" y="-16" width="1.4" height="2.6" ${F('d0')}/>
<path d="M18 -11.8 L20.6 -17.4 L30.4 -17.4 L30.2 -11.8 Z"/><path d="M20.6 -17.4 L30.4 -17.4" ${AS(.4, .5)}/>
<path d="M-34 -12 L22 -12 Q28 -11.6 31 -8.4 L33 -4.4 Q33.6 -1.2 30 .6 L-28 .6 L-33 -2.4 L-36.4 -9 Z"/>
<path d="M-33 -11.2 L21.6 -11.2 Q27 -10.8 29.8 -8 L31.8 -4.4 L31.8 -.4 L-27.6 -.4 L-32 -2.8 L-35.2 -9 Z" ${F('d2')}/>
<path d="M-34 -12 L22 -12 Q28 -11.6 31 -8.4" ${AS(.4, .5)}/>
<g ${A(.38)}>${[-22, -16, -10, -4, 2, 8, 14].map(x => `<circle cx="${x}" cy="-8.4" r="1.1"/>`).join('')}</g>
${glass('M22.4 -11.4 Q27.6 -10.8 30.4 -8 L31.8 -5 L25.6 -5.2 L22.4 -8.4 Z', .45)}<path d="M26 -10.8 L25.8 -5.2" ${S('d0', .35)}/><path d="M23.6 -10.6 L27 -7.6" ${AS(.3, .65)}/>
<rect x="16" y="-10.6" width="3.2" height="7" ${S('d0', .35)}/><path d="M-33.4 -9.6 L-30 -1.4" ${S('d0', .35)}/>
<path d="M-24 -1.2 L14 -1.2 L15.6 1.6 L-25.2 1.6 Z" ${F('d3')}/><path d="M-24 -1.2 H14" ${AS(.3, .4)}/>
${wheel(17.4, 3.4, 1.5, { lugs: 4 })}${wheel(20.2, 3.4, 1.5, { lugs: 4 })}${wheel(-23.4, 3.4, 1.5, { lugs: 4 })}<rect x="30.4" y="-3.4" width=".8" height=".6" ${F('rl', .9)}/>
</g>
<g id="s-uav">
<path d="M-36 -.6 L-3 -2.2 L3 -2.2 L36 -.6 L36 1 L3 2.2 L-3 2.2 L-36 1 Z"/><path d="M-35 1 L-20 1.6 M20 1.6 L35 1" ${S('d4', .35)}/><path d="M-36 -.6 L-3 -2.2 L3 -2.2 L36 -.6" ${AS(.35, .5)}/>
<path d="M-2.6 -11 Q0 -15.4 2.6 -11 L2.9 6 L1.4 10 L-1.4 10 L-2.9 6 Z"/><path d="M-1.8 -11.8 Q0 -14.4 1.8 -11.8 L2 4 L-2 4 Z" ${F('d2')}/>
<path d="M-1 7.6 L-9 12.8 L-8 14 L0 9.6 L8 14 L9 12.8 L1 7.6 Z"/><ellipse cx="0" cy="10.8" rx="4.2" ry=".55" ${A(.3)}/>
<circle cx="0" cy="-8.6" r="1.7" ${F('d3')}/><circle cx=".3" cy="-8.4" r=".7" ${A(.85)}/>
<g ${F('d3')}><rect x="-10.4" y="-.8" width="1" height="5.4" rx=".4"/><rect x="9.4" y="-.8" width="1" height="5.4" rx=".4"/></g>
<circle cx="-35.6" cy=".2" r=".5" ${F('rl', .9)}/><circle cx="35.6" cy=".2" r=".5" ${A(.9)}/>
</g>
<g id="s-quad">
<rect x="-3.4" y="-1.8" width="6.8" height="3.4" rx="1.2"/><rect x="-2.6" y="-1.2" width="5.2" height="1" rx=".4" ${F('d3')}/>
<path d="M-9.4 -3 L9.4 3 M-9.4 3 L9.4 -3" stroke="currentColor" stroke-width="1"/>
<g>${[[-9.4, -3], [9.4, -3], [-9.4, 3], [9.4, 3]].map(([x, y]) => `<rect x="${x - .9}" y="${y - 1.4}" width="1.8" height="1.6" rx=".4"/><ellipse cx="${x}" cy="${y - 1.6}" rx="4.4" ry=".9" ${A(.22)}/><rect x="${x - 4}" y="${y - 1.9}" width="8" height=".45"/>`).join('')}</g>
<circle cx="0" cy="2.4" r="1.1" ${F('d3')}/><circle cx=".3" cy="2.6" r=".5" style="fill:#ff4a3a"/><path d="M-2.6 1.6 L-3.4 4.2 M2.6 1.6 L3.4 4.2" ${CS(.35)}/>
</g>
<g id="s-jet">
<path d="M-20.4 -.8 L-6 -1.8 L10 -1.8 L18 -.6 L23 .4 L18 1.8 L-16 2 Z"/><path d="M-19.6 1.2 L18 1.2" ${S('d2', 1)}/><path d="M-6 -1.8 L10 -1.8 L18 -.6 L23 .4" ${AS(.35, .5)}/>
${glass('M11 -1.8 Q13.6 -4 16.4 -1.4 Z', .55)}<rect x="22.6" y=".1" width="2.2" height=".5" ${F('d3')}/>
<path d="M-14.6 -5.2 L-4.4 -5.2 L-2.6 -4 L-4.4 -2.6 L-14.6 -2.8 Z" ${F('d2')}/><circle cx="-3.4" cy="-3.9" r="1.1" ${F('d0')}/><path d="M-14.6 -5.2 H-4.4" ${AS(.3, .5)}/><rect x="-11" y="-2.8" width="1.6" height="1"/>
<path d="M-16.6 -1.6 L-21.4 -9.8 L-18.4 -9.8 L-14.4 -2 Z"/><path d="M-15 -1.6 L-18.6 -8.2 L-16.4 -8.2 L-13.4 -2 Z" ${F('d3')}/><rect x="-23" y="-1.4" width="8" height=".8"/>
<path d="M-4 1.2 L-12.4 9 L-6.4 9 L6 1.6 Z"/><path d="M-12.4 9 L-6.4 9" ${AS(.35, .5)}/>
<g ${F('d2')}><rect x="-6.4" y="4.2" width="4" height="1.1" rx=".5"/><rect x="-9.4" y="6.6" width="3.6" height="1.1" rx=".5"/><rect x="-1.8" y="2.4" width="4" height="1.1" rx=".5"/></g>
</g>
<g id="s-plane">
<path d="M-26 -5.8 L18 -6.6 Q26 -6.4 29.4 -2.6 Q28.6 .4 24 1 L-14 1.6 Q-20 1 -24 -1.6 Z"/><path d="M-30.8 -5 L-14 -6.2 L-14 -1 L-29 -3.6 Z"/>
<path d="M-24 -1.6 Q-20 .4 -14 .8 L24 .2 Q27.6 -.4 28.6 -2" ${S('d2', 1.2)}/><path d="M-26 -5.8 L18 -6.6 Q26 -6.4 29.4 -2.6" ${AS(.4, .5)}/>
<path d="M-25 -5.8 L-30.8 -19.6 L-26 -19.6 L-17.4 -6 Z"/><path d="M-26.8 -9 L-29.6 -17.8 L-27.2 -17.8 L-22.4 -8.6 Z" ${F('d2')}/><path d="M-30.8 -19.6 L-26 -19.6" ${AS(.4, .5)}/><rect x="-32" y="-5.6" width="11" height="1" ${F('d2')}/>
${glass('M20 -6.2 L24.6 -5.8 L26.8 -3.8 L21 -4 Z', .5)}<path d="M22.4 -6 L22.6 -4" ${S('d0', .35)}/>
<rect x="-9" y="-8" width="20" height="1.4" ${F('d2')}/><rect x="1.2" y="-8.8" width="10.6" height="2.6" rx="1.1"/><ellipse cx="12.4" cy="-7.5" rx=".7" ry="5" ${A(.22)}/><rect x="-6" y="-9.2" width="9" height="2.2" rx="1" ${F('d3')}/><ellipse cx="3.4" cy="-8.1" rx=".6" ry="4.2" ${A(.15)}/>
<g ${A(.38)}>${[-12, -8, -4, 0, 4, 8, 12].map(x => `<rect x="${x}" y="-4.6" width="1.2" height="1.2" rx=".4"/>`).join('')}</g>
<path d="M-6.6 .6 L8 .4 L9 2.2 L-7.4 2.4 Z" ${F('d3')}/><rect x="-21.4" y="-4.6" width="1.6" height="3" ${S('d0', .3)}/><rect x="28.6" y="-2.8" width=".7" height=".6" ${F('rl', .9)}/>
</g>
<g id="s-ship">
<path d="M-40 -1 L-38 -7.6 L34 -7.6 L41.6 -12.6 L39.6 -4 L36 0 L-38 0 Z"/><path d="M-39 -3.6 L37.6 -3.6" ${S('d2', 2.4)}/><path d="M-39.4 -1.2 H37" fill="none" style="stroke:var(--rl,#ff4a3a)" stroke-width=".6" opacity=".35"/>
<path d="M-38 -7.6 L34 -7.6 L41.6 -12.6" ${AS(.45, .5)}/>
<g ${S('d3', .25)}><path d="M-26 -7.2 V-.6 M-10 -7.2 V-.6 M6 -7.2 V-.6 M22 -7.2 V-.6"/></g>
<rect x="-35" y="-16.4" width="12.4" height="8.8" ${F('d2')}/><rect x="-36.4" y="-20" width="15.2" height="3.8"/><g ${A(.6)}>${[0, 1, 2, 3, 4].map(i => `<rect x="${n2(-35.6 + i * 2.8)}" y="-19.2" width="1.8" height="1.4"/>`).join('')}</g>
<g ${A(.35)}>${[0, 1, 2, 3].map(i => `<rect x="${n2(-34 + i * 3)}" y="-14.6" width="1.4" height="1.2"/><rect x="${n2(-34 + i * 3)}" y="-11.4" width="1.4" height="1.2"/>`).join('')}</g>
<rect x="-31" y="-24.6" width="4.6" height="4.8" ${F('d3')}/><rect x="-31" y="-23.4" width="4.6" height=".8" ${A(.45)}/><rect x="-24.4" y="-26" width=".4" height="6"/><rect x="-26.4" y="-25" width="4.4" height=".5"/>
${(() => { let s = ''; const cols = ['d2', 'd3', 'd4']; let i = 0; for (let x = -20; x < 30; x += 6.6) { const tiers = 1 + (i * 7 % 3); for (let t = 0; t < tiers; t++) s += `<rect x="${n2(x)}" y="${n2(-10.4 - t * 2.8)}" width="6.2" height="2.6" ${F(cols[(i + t) % 3])}/><path d="M${n2(x + 1.2)} ${n2(-10.2 - t * 2.8)} V${n2(-8 - t * 2.8)} M${n2(x + 3.1)} ${n2(-10.2 - t * 2.8)} V${n2(-8 - t * 2.8)} M${n2(x + 5)} ${n2(-10.2 - t * 2.8)} V${n2(-8 - t * 2.8)}" ${S('d0', .25)}/>`; i++; } return s; })()}
<path d="M-14 -7.6 V-22 L2 -14.4 M14.6 -7.6 V-21 L28 -14" ${CS(.5)}/><path d="M2 -14.4 V-11 M28 -14 V-11" ${CS(.2)}/>
<g ${A(.6)}>${[-30, -22, -14, -6, 2, 10, 18, 26].map(x => `<circle cx="${x}" cy="-5.4" r=".4"/>`).join('')}</g><circle cx="40" cy="-11" r=".5" ${F('rl', .9)}/>
</g>`;

// ---------------------------------------------------------------- people
const PEOPLE = `
<g id="s-soldier">
<path d="M1 -7.4 L3.1 -4 L2.9 -1" ${CS(1.7)}/><path d="M-.5 -7.4 L-.9 -4 L-2.5 -1" ${CS(1.7)}/>
<path d="M2.1 -1.4 L3.8 -1.4 L5.2 -.4 L5.2 0 L1.9 0 Z"/><path d="M-3.4 -1.4 L-1.7 -1.4 L-.9 -.3 L-.9 0 L-3.7 0 Z"/>
<rect x="2.5" y="-4.6" width="1.3" height="1.1" rx=".35" ${F('d3')}/><rect x="-1.6" y="-4.6" width="1.3" height="1.1" rx=".35" ${F('d3')}/><rect x="1.4" y="-6.6" width="1.3" height="1.5" ${F('d2')}/>
<path d="M-1.4 -13.6 L2.7 -13.8 L3.6 -12.4 L3.4 -7.6 L-1.1 -7.4 L-1.8 -10.6 Z"/>
<path d="M-.6 -13 L2.5 -13.2 L3 -12.2 L2.8 -8.2 L-.4 -8 Z" ${F('d2')}/><g ${F('d3')}><rect x="2" y="-11.6" width="1.2" height="1.4" rx=".2"/><rect x="2" y="-9.8" width="1.2" height="1.4" rx=".2"/><rect x=".5" y="-11.6" width="1.2" height="1.4" rx=".2"/></g>
<path d="M-3.9 -13.3 L-1.4 -13.6 L-1.1 -8.8 L-3.9 -9 Q-4.4 -11 -3.9 -13.3 Z" ${F('d2')}/><path d="M-3.6 -11.2 H-1.4 M-3.7 -10 H-1.3" ${S('d0', .3)}/>
<rect x="-1.4" y="-7.9" width="5.2" height=".8" ${F('d3')}/>
<path d="M-1.4 -13.6 L2.7 -13.8 L3.6 -12.4" ${AS(.35, .5)}/>
<rect x=".5" y="-14.4" width="1.3" height="1"/>
<path d="M-.5 -16.4 Q-.9 -14.6 .3 -13.8 L2.2 -13.5 L2.8 -14 L3.3 -14.1 L3.1 -14.6 L3.7 -15.2 L3.3 -16.4 Z"/>
<path d="M-1.1 -15.9 Q-1 -18.9 1.5 -19 Q4 -18.9 4 -16.4 L4.1 -15.9 Z"/><rect x="-1.1" y="-16.6" width="5.2" height=".45" ${F('d3')}/><rect x="3.6" y="-18" width=".9" height="1.2" ${F('d3')}/><rect x="-1.8" y="-17.4" width=".8" height="1.4" ${F('d2')}/>
<path d="M-.5 -18 Q1.4 -19.6 3.4 -18.2" ${AS(.4, .6)}/><path d="M3.2 -15.2 L3.7 -15.2" ${AS(.3, .6)}/>
<path d="M2.3 -12.6 L4.5 -10.6 L6.8 -11.6" ${CS(1.15)}/>
<path d="M-.2 -12.8 L2.2 -12.6 L2.2 -11.2 L-.2 -10.8 Z"/><rect x="2.2" y="-12.8" width="3.4" height="1.3"/><path d="M3.4 -11.6 L4.6 -11.6 L4.4 -9 L3.4 -9.2 Z"/><path d="M2.4 -11.5 L3.2 -11.5 L2.8 -9.8 L2.2 -9.9 Z"/>
<rect x="5.6" y="-12.7" width="4.2" height="1.1" ${F('d2')}/><rect x="9.8" y="-12.35" width="2.4" height=".5"/><rect x="2.6" y="-14" width="2.4" height="1.1"/><rect x="4.6" y="-13.8" width=".5" height=".7" ${A(.85)}/><rect x="7" y="-13.4" width="1.4" height=".7" ${F('d3')}/>
<path d="M.4 -12.8 L.2 -10.2 L2.8 -10.8" ${CS(1.15)}/>
</g>
<g id="s-kneel">
<path d="M.4 -5.2 L-3 -1 L-6 -.6" ${CS(1.9)}/><path d="M.8 -5 L4.6 -5.2 L4.4 -1" ${CS(1.9)}/>
<path d="M3.6 -1.4 L5.4 -1.4 L6.6 -.3 L6.6 0 L3.4 0 Z"/><path d="M-7 -1.2 L-5.2 -1.4 L-5 0 L-7.2 0 Z"/><rect x="-4.2" y="-1.6" width="1.6" height="1.5" rx=".4" ${F('d3')}/><rect x="3.8" y="-6.4" width="1.5" height="1.6" rx=".4" ${F('d3')}/>
<path d="M-1.4 -10.8 L3.2 -11 L4 -9.4 L3.4 -4.8 L-1.2 -4.6 L-1.8 -7.6 Z"/><path d="M-.6 -10.2 L2.8 -10.4 L3.2 -9.2 L2.8 -5.6 L-.4 -5.4 Z" ${F('d2')}/>
<g ${F('d3')}><rect x="2.2" y="-8.8" width="1.2" height="1.4"/><rect x="2.2" y="-7.1" width="1.2" height="1.4"/></g>
<path d="M-3.8 -10.6 L-1.2 -10.8 L-.8 -6.2 L-3.8 -6.4 Q-4.4 -8.4 -3.8 -10.6 Z" ${F('d2')}/>
<rect x="1.2" y="-12" width="1.4" height="1.4"/><circle cx="2.4" cy="-12.6" r="1.7"/>
<path d="M-.6 -12.8 Q-.6 -16.4 2.4 -16.4 Q5.4 -16.4 5.4 -13.2 L5.6 -12.6 L-.6 -12.6 Z"/><rect x="-.6" y="-13.7" width="6.2" height=".5" ${F('d3')}/><rect x="5" y="-15.2" width="1" height="1.4" ${F('d3')}/><path d="M0 -15.2 Q2.2 -17 4.6 -15.4" ${AS(.4, .6)}/>
<path d="M3 -10 L5.6 -8.6 L8 -9.8" ${CS(1.2)}/>
<path d="M1 -10.8 L3.2 -10.6 L3.2 -9.2 L1 -8.8 Z"/><rect x="3.2" y="-10.8" width="3.4" height="1.3"/><path d="M4.4 -9.6 L5.6 -9.6 L5.4 -7 L4.4 -7.2 Z"/>
<rect x="6.6" y="-10.7" width="4.2" height="1.1" ${F('d2')}/><rect x="10.8" y="-10.35" width="2.2" height=".5"/><rect x="3.6" y="-12" width="2.4" height="1.1"/><rect x="5.6" y="-11.8" width=".5" height=".7" ${A(.85)}/>
<path d="M1.4 -10.6 L1.2 -8.2 L3.8 -8.8" ${CS(1.2)}/>
</g>
<g id="s-prone">
<path d="M-12 -.8 L-3 -1.4" ${CS(1.7)}/><path d="M-11.6 -2 L-3 -1.8" ${CS(1.5)}/><path d="M-13.2 -2.8 L-11.8 -2.6 L-11.6 -.2 L-12.8 0 Z"/><path d="M-13.4 -1.6 L-12 -1.4 L-11.8 .4 L-13 .4 Z"/>
<path d="M-4 -.2 L6.6 -1.2 L7.6 -3.8 L-3.6 -3.2 Z"/><path d="M-2.6 -1 L5.8 -1.8 L6.4 -3.2 L-2.6 -2.8 Z" ${F('d2')}/><path d="M-2 -5 L3.6 -5.2 L3.8 -3.4 L-2.2 -3.2 Z" ${F('d2')}/><path d="M-3.6 -3.2 L7.6 -3.8" ${AS(.35, .5)}/>
<circle cx="9.2" cy="-3.8" r="1.6"/><path d="M6.8 -3.6 Q7 -6.8 9.6 -6.8 Q12.2 -6.6 12 -4 L12.2 -3.6 Z"/><rect x="11.4" y="-6.4" width=".9" height="1.2" ${F('d3')}/><path d="M7.6 -6 Q9.6 -7.4 11.4 -6" ${AS(.4, .6)}/>
<path d="M6 -2.6 L7.4 -.4 L10 -2.4" ${CS(1.1)}/><path d="M8.4 -3 L11 -.6 L13.8 -2.8" ${CS(1.1)}/>
<rect x="8.6" y="-3.9" width="4.6" height="1.2"/><rect x="13.2" y="-3.8" width="5" height="1" ${F('d2')}/><rect x="18.2" y="-3.5" width="3.8" height=".5"/><rect x="10.6" y="-5.6" width="3.4" height="1.4"/><rect x="13.6" y="-5.4" width=".5" height=".9" ${A(.85)}/><path d="M11.4 -2.8 L11 -1.2" ${CS(.8)}/>
<path d="M17 -3 L15.8 0 M17.4 -3 L18.6 0" ${CS(.35)}/>
</g>
<g id="s-cheer">
<path d="M1 -7.4 L2.4 -4 L2.2 -1" ${CS(1.9)}/><path d="M-.6 -7.4 L-1.2 -4 L-2.4 -1" ${CS(1.9)}/>
<path d="M1.4 -1.4 L3.2 -1.4 L4.6 -.4 L4.6 0 L1.2 0 Z"/><path d="M-3.4 -1.4 L-1.6 -1.4 L-.8 -.3 L-.8 0 L-3.7 0 Z"/>
<path d="M-1.8 -13.6 L2.8 -13.8 L3.6 -12.2 L3.4 -7.4 L-1.4 -7.2 L-2.2 -10.4 Z"/><path d="M-.8 -13 L2.6 -13.2 L3 -12 L2.8 -8.2 L-.6 -8 Z" ${F('d2')}/>
<path d="M-4.2 -13.2 L-1.6 -13.6 L-1.2 -8.6 L-4.2 -8.8 Q-4.8 -11 -4.2 -13.2 Z" ${F('d2')}/>
<rect x=".2" y="-15" width="1.4" height="1.4"/><circle cx="1" cy="-15.6" r="1.7"/><path d="M-1.8 -15.8 Q-1.8 -19.4 1.2 -19.4 Q4.2 -19.4 4.2 -16.2 L4.4 -15.6 L-1.8 -15.6 Z"/><rect x="-1.8" y="-16.7" width="6.2" height=".5" ${F('d3')}/><path d="M-1.2 -18.2 Q1 -20 3.4 -18.4" ${AS(.4, .6)}/>
<path d="M2 -12.6 L4.2 -16.4 L5 -19.8" ${CS(1.2)}/><path d="M-.4 -12.6 L-2.6 -10.4 L-1.8 -8.4" ${CS(1.2)}/>
<rect x="-1.4" y="-21.6" width="11" height="1.2"/><rect x="9.6" y="-21.25" width="1.8" height=".5"/><rect x="1.4" y="-22.8" width="2.4" height="1.2"/><path d="M5 -20.6 L5.8 -18.6 L6.6 -18.8 L6 -20.6 Z"/>
<path d="M-2.2 -13.6 L2.8 -13.8" ${AS(.35, .5)}/>
</g>
<g id="s-officer">
<path d="M.8 -7.2 L1.6 -3.6 L1.6 -1" ${CS(1.8)}/><path d="M-.6 -7.2 L-1 -3.6 L-1.4 -1" ${CS(1.8)}/>
<path d="M.8 -1.4 L2.6 -1.4 L3.8 -.4 L3.8 0 L.6 0 Z"/><path d="M-2.4 -1.4 L-.6 -1.4 L.2 -.3 L.2 0 L-2.7 0 Z"/><rect x="-2.6" y="-6.6" width="1.4" height="2.4" rx=".4" ${F('d3')}/>
<path d="M-2 -13.6 L2.6 -13.8 L3.4 -12.4 L3.2 -7 L-1.8 -6.8 L-2.4 -10.4 Z"/><path d="M-1.2 -13 L2.4 -13.2 L2.8 -12 L2.6 -7.8 L-1 -7.6 Z" ${F('d2')}/><g ${F('d3')}><rect x="-.6" y="-12.2" width="1.3" height="1.2"/><rect x="1.4" y="-12.2" width="1.2" height="1.2"/></g>
<rect x="-1.8" y="-7.6" width="5" height=".7" ${F('d3')}/>
<rect x="-.2" y="-15" width="1.4" height="1.4"/><circle cx=".6" cy="-15.6" r="1.7"/>
<path d="M-1.8 -15.8 L-1.6 -17.8 Q.6 -18.6 3.2 -18 L3.4 -16.6 L5.4 -16.2 L5.4 -15.7 L-1.8 -15.5 Z"/><path d="M-1.6 -17.8 Q.6 -18.6 3.2 -18" ${AS(.4, .6)}/>
<path d="M1.6 -12.8 L5.2 -14.4 L9 -16" ${CS(1.2)}/><path d="M9 -16 L10.4 -16.6" ${CS(.5)}/>
<path d="M-.4 -12.6 L-1.4 -10 L.8 -9" ${CS(1.2)}/><rect x=".4" y="-10.6" width="2.6" height="3.2" rx=".3"/><rect x=".8" y="-10.2" width="1.8" height="2.4" ${A(.6)}/>
<path d="M-2 -13.6 L2.6 -13.8" ${AS(.35, .5)}/>
</g>
<g id="s-zombie">
<path d="M-.4 -6.2 L-2.6 -3.2 L-3.8 -.4" ${CS(1.45)}/><path d="M1.5 -6.2 L3.1 -3 L5.1 -.6" ${CS(1.35)}/>
<path d="M-5 -1 L-3.2 -1.2 L-2.8 0 L-5.4 0 Z"/><path d="M4.4 -1.2 L6 -.8 L6 0 L4.2 0 Z"/>
<path d="M-3.4 -4 L-2.4 -2.8 L-1.6 -4 M2.1 -4.2 L3.4 -3 L3.7 -4.6" ${S('z1', .4)}/>
<path d="M-2.8 -12 L1.4 -12.6 Q3 -9.6 2.6 -6.4 L-1.4 -6 Q-2.4 -8.6 -2.8 -12 Z"/>
<path d="M-1.6 -6.4 L-.9 -5.1 L-.2 -6.2 L.7 -4.7 L1.4 -6 L2.2 -4.9 L2.7 -6.4 Z"/>
<path d="M-1.4 -10.8 L.8 -11.2 L1.5 -9.4 L.4 -8.2 L-.9 -8.8 Z" ${F('z1', .9)}/>
<path d="M-1 -10.2 Q.1 -9.9 1 -10.3 M-.8 -9.2 Q.2 -8.9 1.1 -9.3" ${S('z2', .35)}/><path d="M1.3 -11.2 L2 -9.6 L1.4 -9.2 Z" ${F('z2', .9)}/>
<path d="M-2 -11.6 L-6.4 -11.2 L-10.2 -12" ${CS(1.05)}/><path d="M-10.2 -12 L-11.6 -12.8 M-10.2 -12 L-11.8 -11.8 M-10.2 -12 L-11.2 -11" ${CS(.32)}/>
<path d="M-1.1 -10.6 L-5.4 -9.4 L-9.2 -8.6" ${CS(.95)}/><path d="M-9.2 -8.6 L-10.6 -9.2 M-9.2 -8.6 L-10.6 -8.2" ${CS(.3)}/>
<path d="M-5.2 -11.9 L-5.8 -10.7 L-6.6 -11.8 Z M-4.4 -10.2 L-4.8 -8.9 L-5.6 -9.9 Z"/><rect x="-7.6" y="-11.9" width="1" height=".5" ${F('z2', .8)}/>
<path d="M-2.2 -12.2 L-2.8 -11.4 L-3.8 -12" ${CS(.8)}/>
<path d="M-1.8 -14.6 Q-2.2 -16 -3.6 -15.6 Q-5.2 -15.4 -5.4 -13.8 Q-5.6 -12.6 -4.8 -12.2 L-4.2 -11.6 L-3.2 -12 L-2 -12.6 Z"/>
<path d="M-4.6 -15 Q-5.8 -14.8 -6.2 -13.4 M-3.4 -15.6 Q-4.2 -16.4 -5 -16" ${CS(.28)}/>
<path d="M-5 -12.6 L-3.8 -12.4" ${S('z2', .4)}/><circle cx="-4.4" cy="-14" r=".7" fill="#ff3a2a" opacity=".18"/><circle cx="-4.4" cy="-14" r=".38" style="fill:#ff3a2a"/>
<path d="M-4.8 -15.4 Q-3 -16.2 -1.8 -14.6" ${AS(.35, .45)}/><path d="M-2.8 -12 L1.4 -12.6" ${AS(.3, .4)}/>
</g>
<g id="s-civ">
<path d="M.6 -6 L1.2 -3 L1.4 -.8" ${CS(1.6)}/><path d="M-.6 -6 L-1 -3 L-1.6 -.8" ${CS(1.6)}/><path d="M.6 -1.2 L2.4 -1.2 L3.2 -.3 L3.2 0 L.4 0 Z"/><path d="M-2.6 -1.2 L-.8 -1.2 L-.4 0 L-2.8 0 Z"/>
<path d="M-2 -12.8 L2.2 -12.8 L2.8 -5.8 L-2.6 -5.8 Z"/><path d="M-1.3 -12.2 L1.7 -12.2 L2.1 -6.5 L-1.8 -6.5 Z" ${F('d2')}/><path d="M.2 -12.2 V-6.5" ${S('d0', .3)}/>
<path d="M-3.8 -12.4 L-1.9 -12.6 L-1.9 -7.8 L-4 -8 Q-4.4 -10 -3.8 -12.4 Z" ${F('d3')}/>
<rect x="-.6" y="-13.6" width="1.2" height="1"/><circle cx=".2" cy="-15" r="1.75"/><path d="M-1.6 -15.2 Q-1.6 -17.2 .4 -17.1 Q2 -17 2 -15.6 L1 -16 L-.6 -15.8 Z" ${F('d2')}/>
<path d="M1.9 -12.2 L2.9 -9 L2.6 -6.6" ${CS(1)}/><path d="M-1.6 -12.2 L-2.4 -9.2 L-2 -7" ${CS(1)}/>
<path d="M-2 -12.8 L2.2 -12.8" ${AS(.35, .45)}/><path d="M-1.6 -16.8 Q.2 -17.8 1.6 -16.6" ${AS(.35, .5)}/>
</g>
<g id="s-civ2">
<path d="M.4 -6 L.8 -3 L1 -.8" ${CS(1.3)}/><path d="M-.6 -6 L-.8 -3 L-1.2 -.8" ${CS(1.3)}/><path d="M.4 -1 L2 -1 L2.4 0 L.2 0 Z"/><path d="M-2 -1 L-.6 -1 L-.4 0 L-2.2 0 Z"/>
<path d="M-2.2 -12.6 L2.4 -12.6 L3.8 -4.8 L-3.6 -4.8 Z"/><path d="M-1.4 -12 L1.8 -12 L2.8 -5.6 L-2.6 -5.6 Z" ${F('d2')}/><path d="M-2.4 -9.4 H2.8" ${S('d3', .5)}/>
<circle cx="0" cy="-14.8" r="1.8"/><path d="M-2 -14.6 Q-2.2 -17.4 0 -17.2 Q2.4 -17.2 2 -14.4 L2.4 -11.6 L1.2 -12.4 L1 -14.6 L-1.2 -14.6 L-1.6 -12 L-2.6 -12.2 Z" ${F('d2')}/>
<path d="M2 -12 L3.6 -9 L4.2 -7.4" ${CS(1)}/><rect x="3.2" y="-7.6" width="3.4" height="4.4" rx=".6" ${F('d3')}/><rect x="4.2" y="-8.4" width="1.4" height=".9" rx=".3" ${S('d4', .3)}/>
<path d="M-1.8 -12 L-2.6 -8.6" ${CS(1)}/><path d="M-1.6 -16.8 Q0 -17.8 1.6 -16.8" ${AS(.35, .5)}/>
</g>
<g id="s-civ3">
<path d="M.6 -6 L1 -3 L1.2 -.8" ${CS(1.6)}/><path d="M-.6 -6 L-1 -3 L-1.4 -.8" ${CS(1.6)}/><path d="M.6 -1.2 L2.4 -1.2 L3 0 L.4 0 Z"/><path d="M-2.4 -1.2 L-.8 -1.2 L-.4 0 L-2.6 0 Z"/>
<path d="M-2.8 -12.8 L2.6 -12.8 L3.4 -5.4 L-3.2 -5.4 Z"/><path d="M-2 -12.2 L2 -12.2 L2.6 -6.2 L-2.4 -6.2 Z" ${F('d2')}/>
<path d="M-2.4 -15 Q-2.4 -18 .2 -18 Q2.8 -18 2.6 -15 L2.4 -12.6 L-2.6 -12.6 Z"/><circle cx=".4" cy="-14.8" r="1.5" ${F('d3')}/>
<path d="M2.2 -12 L3.6 -9.4 L1.4 -8.2 M-2 -12 L-2.2 -9 L.4 -8.4" ${CS(1.05)}/><ellipse cx="2" cy="-9.4" rx="2.4" ry="1.8" ${F('d3')}/><circle cx="3.6" cy="-10.6" r=".9" ${F('d2')}/>
<path d="M-2.4 -17 Q.2 -18.6 2.4 -16.8" ${AS(.35, .5)}/>
</g>
<g id="s-robe">
<path d="M-2.8 -13.4 Q-3.6 -18 0 -18.4 Q3.6 -18 2.8 -13.4 L4.4 -2 L5.2 0 L-5.2 0 L-4.2 -2 Z"/>
<path d="M-1.8 -13.6 Q-2.4 -17 0 -17.2 Q2 -17 1.8 -14.4 L2.8 -2.4 L-3 -2.4 Z" ${F('d2')}/><path d="M-3.6 0 L-3 -1.4 L-2.2 0 M-.6 0 L0 -1.6 L.6 0 M2.2 0 L2.8 -1.4 L3.4 0" ${S('d0', .4)}/>
<path d="M-.8 -16.4 Q.4 -15 1.6 -16 L1.4 -14.2 L-.6 -14.2 Z" ${F('d0')}/><circle cx=".7" cy="-15.2" r=".3" ${F('wm', .9)}/>
<path d="M-3.4 -8.2 Q0 -7.4 3.6 -8.4" ${S('d4', .5)}/><path d="M.6 -8 L.2 -5.4 M1.2 -8 L1.6 -5.6" ${S('d4', .35)}/>
<path d="M2 -12.4 L4.8 -14.6 L6.2 -15.4" ${CS(1.1)}/><rect x="6" y="-20" width=".6" height="20" ${F('d3')}/><path d="M-3 -18 Q0 -19 3 -17.6" ${AS(.4, .5)}/>
</g>`;

// ---------------------------------------------------------------- props and structures
const PROPS = `
<g id="s-tent">
<path d="M-15.4 0 L-14.6 -7.4 L14.6 -7.4 L15.4 0 Z"/><path d="M-14.6 -7.2 L-11 -12.8 L11 -12.8 L14.6 -7.2 Z" ${F('d2')}/><path d="M-11 -12.8 L11 -12.8" ${AS(.45, .55)}/><path d="M-14.6 -7.4 H14.6" ${S('d4', .4)}/>
<path d="M-7.4 -12.6 L-8.4 -7.4 M-2.4 -12.6 L-2.8 -7.4 M2.4 -12.6 L2.8 -7.4 M7.4 -12.6 L8.4 -7.4 M-8.4 -7.2 L-8.6 0 M-2.8 -7.2 L-2.9 0 M2.8 -7.2 L2.9 0 M8.4 -7.2 L8.6 0" ${S('d0', .3)}/>
<rect x="-6.6" y="-5.6" width="3.2" height="2.2" ${F('wm', .45)}/><rect x="4.2" y="-5.6" width="3.2" height="2.2" ${F('wm', .45)}/><path d="M-3 0 L-3 -5.8 L3 -5.8 L3 0 Z" ${A(.32)}/><path d="M-3 -5.8 L-1.4 0 L-3 0 Z" ${F('d2')}/>
<rect x="9.8" y="-15" width="1" height="2.4" ${F('d3')}/><path d="M-15 -7 L-18.6 0 M15 -7 L18.6 0" ${CS(.2)}/>
</g>
<g id="s-redx"><circle r="4.2" fill="#f2efe6" opacity=".9"/><rect x="-1" y="-3" width="2" height="6" fill="#e0382a"/><rect x="-3" y="-1" width="6" height="2" fill="#e0382a"/></g>
<g id="s-barrier"><path d="M-6 0 L-5.4 -1.6 L-3 -2.8 L-2.6 -5.2 L2.6 -5.2 L3 -2.8 L5.4 -1.6 L6 0 Z"/><path d="M-2.4 -5 L2.4 -5 L2.8 -2.8 L-2.8 -2.8 Z" ${F('d3')}/><rect x="-1.6" y="-4.2" width="3.2" height=".7" ${A(.4)}/><rect x="-3.6" y="-1" width="1.4" height=".9" ${F('d0')}/><rect x="2.2" y="-1" width="1.4" height=".9" ${F('d0')}/><path d="M-2.6 -5.2 H2.6" ${AS(.35, .5)}/></g>
<g id="s-sandbag">${sandbags()}</g>
<g id="s-wire"><rect x="-20" y="-8.6" width=".8" height="8.6"/><rect x="-.4" y="-8.6" width=".8" height="8.6"/><rect x="19.2" y="-8.6" width=".8" height="8.6"/>
${[-17.4, -12.2, -7, -1.8, 3.4, 8.6, 13.8].map(x => `<ellipse cx="${x + 2.6}" cy="-4" rx="3.3" ry="3.9" fill="none" stroke="currentColor" stroke-width=".5"/>`).join('')}
<path d="M-20 -4 H20" fill="none" stroke="currentColor" stroke-width=".3"/><g ${A(.45)}>${[-16, -10, -4, 2, 8, 14].map(x => `<circle cx="${x}" cy="-7.6" r=".3"/>`).join('')}</g></g>
<g id="s-fence"><rect x="-20" y="-15" width="40" height="15" fill="none" stroke="currentColor" stroke-width=".6"/>
<path d="M-20 -15 L-5 0 M-12 -15 L3 0 M-4 -15 L11 0 M4 -15 L19 0 M12 -15 L20 -7 M-20 -7 L-13 0 M20 -15 L5 0 M12 -15 L-3 0 M4 -15 L-11 0 M-4 -15 L-19 0 M-12 -15 L-20 -7 M20 -7 L13 0" stroke="currentColor" stroke-width=".28" fill="none" opacity=".85"/>
<g><rect x="-21" y="-17.6" width="1.4" height="17.6"/><rect x="-.7" y="-17.6" width="1.4" height="17.6"/><rect x="19.6" y="-17.6" width="1.4" height="17.6"/><rect x="-21" y="-15.6" width="42" height=".8"/></g>
<path d="M-20.3 -17.6 L-22.6 -20 M-.0 -17.6 L-2.3 -20 M20.3 -17.6 L18 -20" ${CS(.5)}/>
${[-21, -15, -9, -3, 3, 9, 15].map(x => `<ellipse cx="${x + 2}" cy="-19.4" rx="2.4" ry="1.6" fill="none" stroke="currentColor" stroke-width=".35"/>`).join('')}
<rect x="-12" y="-9" width="5" height="3" ${A(.35)}/><path d="M-21 -15.6 H21" ${AS(.3, .45)}/></g>
<g id="s-tower"><path d="M-5.4 0 L-3.2 -16.6 L-2 -16.6 L-3.8 0 Z M5.4 0 L3.2 -16.6 L2 -16.6 L3.8 0 Z"/><path d="M-4.6 -5 L4.6 -10 M4.6 -5 L-4.6 -10 M-4.1 -11 L3.9 -15.4 M4.1 -11 L-3.9 -15.4" stroke="currentColor" stroke-width=".45" fill="none"/>
<path d="M-1.4 0 L-1 -16 M1.4 0 L1 -16 M-1.3 -3 H1.3 M-1.2 -6 H1.2 M-1.2 -9 H1.2 M-1.1 -12 H1.1" ${S('d3', .3)}/>
<path d="M-6 -16.4 H6 V-22.2 H-6 Z"/><rect x="-5.2" y="-19.2" width="10.4" height="2.4" ${F('d2')}/><path d="M-5.2 -19 H5.2" ${S('d0', .3)} stroke-dasharray="1.6 .3"/><rect x="-4.6" y="-21.6" width="9.2" height="1.6" ${F('d0')}/><rect x="1" y="-21.4" width="2.6" height="1.2" ${F('wm', .5)}/>
<path d="M-7.4 -22.2 H7.4 L5.4 -25.2 H-5.4 Z"/><path d="M-5.4 -25.2 H5.4 L7.4 -22.2" ${AS(.4, .5)}/><rect x="-.2" y="-27.6" width=".3" height="2.4"/>
<circle cx="6" cy="-19.6" r="1.4" ${F('d3')}/><circle cx="6.5" cy="-19.6" r=".8" ${F('lt', .95)}/></g>
<g id="s-mast"><path d="M-3.4 0 L-.5 -42 L.5 -42 L3.4 0 L2.4 0 L0 -35 L-2.4 0 Z"/>
<path d="M-2.9 -2 L2.6 -7 L-2.4 -12 L2.2 -17 L-1.9 -22 L1.7 -27 L-1.3 -32 L1 -37 M2.9 -2 L-2.6 -7 L2.4 -12 L-2.2 -17 L1.9 -22 L-1.7 -27 L1.3 -32 L-1 -37" stroke="currentColor" stroke-width=".4" fill="none"/>
<rect x="-2.4" y="-31" width="1.2" height="3.6" ${F('d3')}/><rect x="1.2" y="-31" width="1.2" height="3.6" ${F('d3')}/><path d="M-1.2 -24 Q-3.6 -22 -1.2 -20 Z"/><path d="M1.2 -16 Q3.8 -14 1.2 -12 Z"/>
<path d="M-.4 -38 L-9 0 M.4 -38 L9 0" ${CS(.15)} opacity=".6"/><circle cx="0" cy="-42.6" r="1.1" fill="#ff4a3a"/><circle cx="0" cy="-42.6" r="2.4" fill="#ff4a3a" opacity=".2"/><circle cx="0" cy="-22" r=".5" fill="#ff4a3a"/></g>
<g id="s-dish"><rect x="-5" y="-1.6" width="10" height="1.6" ${F('d2')}/><path d="M-4 -1.6 L-1 -7 L1 -7 L4 -1.6" ${CS(.6)}/>
<path d="M-7.6 -14.2 Q-4 -2.8 8.4 -9.6 Q2 -9.6 -7.6 -14.2 Z"/><path d="M-6.6 -13 Q-3.2 -4.6 6.6 -9.4 Q1.4 -9.8 -6.6 -13 Z" ${F('d3')}/><path d="M-7.6 -14.2 Q-4 -2.8 8.4 -9.6" ${AS(.4, .55)}/>
<path d="M.4 -9.4 L3.6 -15" ${CS(.5)}/><path d="M-4.6 -11.4 L3.6 -15" ${CS(.25)}/><rect x="2.8" y="-16.2" width="1.8" height="1.6" ${F('d3')}/><circle cx="-4.2" cy="-.8" r=".4" ${A(.8)}/></g>
<g id="s-pylon"><path d="M-7 0 L-1 -38 L1 -38 L7 0 L5 0 L0 -32 L-5 0 Z"/><path d="M-6 -2 L4.8 -8 L-4.8 -14 L3.6 -20 L-3.4 -26 L2.4 -31 M6 -2 L-4.8 -8 L4.8 -14 L-3.6 -20 L3.4 -26 L-2.4 -31" stroke="currentColor" stroke-width=".4" fill="none"/>
<rect x="-11" y="-34.4" width="22" height="1.2"/><rect x="-8" y="-27.2" width="16" height="1.2"/><path d="M-11 -33.2 L-4 -30 M11 -33.2 L4 -30 M-8 -26 L-3 -23.4 M8 -26 L3 -23.4" stroke="currentColor" stroke-width=".4" fill="none"/>
${[-10.4, 10.4, -7.4, 7.4].map((x, i) => `<rect x="${x - .3}" y="${i < 2 ? -33.4 : -26.2}" width=".6" height="2.4" ${F('d4')}/>`).join('')}<rect x="-.4" y="-41" width=".8" height="3"/></g>
<g id="s-lab"><path d="M-26 0 V-20 H-9 V-27 H9 V-20 H26 V0 Z"/><path d="M-25.2 -19.2 H-9.8 V-1 H-25.2 Z M9.8 -19.2 H25.2 V-1 H9.8 Z" ${F('d2')}/><rect x="-8.2" y="-26.2" width="16.4" height="25.4" ${F('d3')}/>
<g ${A(.5)}>${[-23, -19.4, -15.8, -12.2, 11.4, 15, 18.6, 22.2].map(x => `<rect x="${x}" y="-17" width="2.4" height="2"/><rect x="${x}" y="-12" width="2.4" height="2"/>`).join('')}</g>
<g ${F('wm', .4)}><rect x="-19.4" y="-7" width="2.4" height="2"/><rect x="15" y="-7" width="2.4" height="2"/></g><g ${A(.55)}><rect x="-6" y="-17" width="12" height="1.6"/><rect x="-6" y="-12" width="12" height="1.6"/></g>
<rect x="-3.4" y="-7" width="6.8" height="7" ${A(.5)}/><rect x="-5" y="-8" width="10" height="1" ${F('d4')}/>
<path d="M0 -25.6 L3.4 -23.8 V-20.2 L0 -18.4 L-3.4 -20.2 V-23.8 Z" ${A(.9)}/><circle cy="-22" r="1.2" fill="${INK}"/>
<g ${F('d2')}><rect x="-22" y="-21.6" width="5" height="1.6"/><rect x="14" y="-21.6" width="6" height="1.6"/><rect x="-6" y="-28.6" width="3" height="1.6"/></g><rect x="5" y="-33" width=".4" height="6"/><circle cx="5.2" cy="-33" r=".5" fill="#ff4a3a"/>
<path d="M-26 -20 H-9 V-27 H9 V-20 H26" ${AS(.4, .5)}/></g>
<g id="s-hosp"><path d="M-20 0 V-30 H20 V0 Z"/><rect x="-19.2" y="-29.2" width="38.4" height="28.4" ${F('d2')}/>
<g ${A(.45)}>${[-25, -20, -15, -10].map(y => [-17, -12.6, -8.2, 5.2, 9.6, 14].map(x => `<rect x="${x}" y="${y}" width="3" height="2.6"/>`).join('')).join('')}</g>
<g ${F('wm', .4)}><rect x="-12.6" y="-20" width="3" height="2.6"/><rect x="9.6" y="-15" width="3" height="2.6"/></g>
<rect x="-4" y="-27.4" width="8" height="8" rx="1" fill="#f2efe6" opacity=".9"/><rect x="-1.2" y="-26.4" width="2.4" height="6" fill="#e0382a"/><rect x="-3" y="-24.6" width="6" height="2.4" fill="#e0382a"/>
<path d="M-6 -6 H6 L7.4 -4.4 H-7.4 Z" ${F('d3')}/><rect x="-3" y="-4.4" width="6" height="4.4" ${A(.5)}/><path d="M-20 -30 H20" ${AS(.45, .55)}/><rect x="12" y="-33" width="5" height="3" ${F('d2')}/></g>
<g id="s-house"><path d="M-8 0 V-9 L0 -15 L8 -9 V0 Z"/><path d="M-9 -8.4 L0 -15.6 L9 -8.4 L8.6 -7.8 L0 -14.6 L-8.6 -7.8 Z" ${F('d3')}/><rect x="4" y="-15" width="1.8" height="4"/><rect x="-6" y="-7" width="3.4" height="3" ${A(.5)}/><path d="M-4.3 -7 V-4" ${S('d0', .3)}/><rect x="1.4" y="-6" width="3" height="6" ${F('d2')}/><path d="M-9 -8.4 L0 -15.6 L9 -8.4" ${AS(.4, .5)}/></g>
<g id="s-wall">${[-24, -16, -8, 0, 8, 16].map(x => `<path d="M${x + .2} 0 L${x + .2} -1.6 L${x + 1.6} -2.4 L${x + 2} -13.4 L${x + 6} -13.4 L${x + 6.4} -2.4 L${x + 7.8} -1.6 L${x + 7.8} 0 Z"/><path d="M${x + 2.6} -12.8 L${x + 5.4} -12.8 L${x + 5.6} -3 L${x + 2.4} -3 Z" ${F('d2')}/><path d="M${x + 2} -13.4 H${x + 6}" ${AS(.4, .55)}/><circle cx="${x + 4}" cy="-11.6" r=".5" ${F('d0')}/>`).join('')}
${[-23, -17, -11, -5, 1, 7, 13, 19].map(x => `<ellipse cx="${x + 2}" cy="-14.8" rx="2.6" ry="1.5" fill="none" stroke="currentColor" stroke-width=".35"/>`).join('')}<rect x="-14.4" y="-9" width="4.8" height="2.6" ${A(.3)}/></g>
<g id="s-gate"><path d="M-17 0 V-12.6 H-6 V0 Z"/><rect x="-16.2" y="-11.8" width="9.4" height="11" ${F('d2')}/><rect x="-14.8" y="-10.8" width="6.6" height="4" ${A(.5)}/><path d="M-11.5 -10.8 V-6.8" ${S('d0', .3)}/><rect x="-14.8" y="-5.6" width="3" height="5.6" ${F('d3')}/>
<path d="M-18.2 -12.6 H-4.8 L-6.8 -16 H-16.2 Z"/><path d="M-16.2 -16 H-6.8" ${AS(.4, .55)}/><circle cx="-7.6" cy="-14.2" r=".7" fill="#ff4a3a"/>
<rect x="-4.6" y="-7.4" width="2.2" height="7.4"/><circle cx="-3.5" cy="-7.6" r="1.1"/>
<g><rect x="-2.6" y="-7.4" width="5" height="1.6" fill="#e8e2d0"/><rect x="2.4" y="-7.4" width="5" height="1.6" fill="#e0382a"/><rect x="7.4" y="-7.4" width="5" height="1.6" fill="#e8e2d0"/><rect x="12.4" y="-7.4" width="5" height="1.6" fill="#e0382a"/><rect x="17.4" y="-7.4" width="4.6" height="1.6" fill="#e8e2d0"/></g>
<rect x="20.8" y="-5" width="1.2" height="5"/><use href="#s-barrier" transform="translate(6 0) scale(.9)"/><use href="#s-barrier" transform="translate(16 0) scale(.9)"/></g>
<g id="s-flask"><path d="M-2.2 -15 H2.2 V-9.4 L7.4 0 H-7.4 L-2.2 -9.4 Z"/><path d="M-4.8 -4.4 H4.8 L7.4 0 H-7.4 Z" style="fill:var(--acc)"/><rect x="-3" y="-16" width="6" height="1.4"/><path d="M-1.2 -14 V-9 L-4.6 -2.6" fill="none" stroke="#fff" stroke-width=".5" opacity=".35"/><circle cx="1.6" cy="-2.4" r=".5" fill="#fff" opacity=".6"/><circle cx="-1" cy="-1.4" r=".35" fill="#fff" opacity=".5"/></g>
<g id="s-vial"><rect x="-1.6" y="-10" width="3.2" height="10" rx="1.4"/><rect x="-1.2" y="-5.4" width="2.4" height="5" rx="1" style="fill:var(--acc)"/><rect x="-1.9" y="-11.2" width="3.8" height="1.6" rx=".4" ${F('d3')}/><rect x="-.9" y="-9" width=".5" height="7.6" fill="#fff" opacity=".4"/></g>
<g id="s-micro"><rect x="-8" y="-2" width="16" height="2"/><path d="M-4 -2 L-4 -5 Q-6 -12 0 -16 L2 -14 Q-2 -11 -1 -5 L-1 -2 Z"/><path d="M-1 -18 L6 -12 L4.6 -10.6 L-2.4 -16.6 Z"/><rect x="-5" y="-8" width="10" height="1.2"/><rect x="4.2" y="-11" width="1.6" height="2.6" ${F('d3')}/><circle cx="1" cy="-7.4" r=".6" ${A(.9)}/><path d="M-1 -18 L-2.6 -19.6" ${CS(.8)}/><path d="M-3.4 -5 Q-5.4 -11 0 -15.2" ${AS(.35, .5)}/></g>
<g id="s-dna" fill="none" stroke="var(--acc)" stroke-width="1.2" style="stroke:var(--acc)"><path d="M-4 0 C4 -5 4 -9 0 -12 C-4 -15 -4 -19 4 -24 M4 0 C-4 -5 -4 -9 0 -12 C4 -15 4 -19 -4 -24"/><path d="M-2.6 -3 H2.6 M-2.4 -9 H2.4 M-2.4 -15 H2.4 M-2.6 -21 H2.6" stroke-width=".6" opacity=".7"/></g>
<g id="s-bio" fill="none" style="stroke:var(--acc)" stroke-width="1.4"><circle cx="0" cy="-4.6" r="4.4"/><circle cx="4" cy="2.3" r="4.4"/><circle cx="-4" cy="2.3" r="4.4"/><circle cx="0" cy="0" r="2" stroke-width="1"/><circle cx="0" cy="0" r="6.4" stroke-width="1.6" stroke-dasharray="4 2.7"/></g>
<g id="s-burst"><path d="M0 -12 L2.6 -4.4 L10 -7.6 L5 -1 L12 2.2 L4.4 3.2 L6.6 10 L0 5 L-6.6 10 L-4.4 3.2 L-12 2.2 L-5 -1 L-10 -7.6 L-2.6 -4.4 Z" fill="${FIRE}" opacity=".95"/><path d="M0 -7 L1.8 -2.4 L6 -3.6 L3 0 L6 3.4 L1.2 2.4 L0 6 L-1.2 2.4 L-6 3.4 L-3 0 L-6 -3.6 L-1.8 -2.4 Z" fill="#ffe08a"/><circle r="2.6" fill="#fffbe6"/><g fill="${FIRE}"><circle cx="9" cy="-10" r=".6"/><circle cx="-11" cy="-5" r=".5"/><circle cx="12" cy="6" r=".5"/><circle cx="-8" cy="9" r=".45"/></g></g>
<g id="s-flame"><path d="M0 0 C-7.4 -3 -6.4 -10.4 -2 -15.6 C-2.2 -11.6 1 -10.6 1 -13.6 C7.4 -8.4 7.4 -2 0 0 Z" fill="#e8501c"/><path d="M0 0 C-5 -2.2 -4.6 -7.6 -1.4 -11 C-1 -8 1.6 -7.6 1.8 -9.8 C5.2 -6 4.8 -1.6 0 0 Z" fill="#ff8a2a"/><path d="M0 0 C-3 -2 -3 -6 -1 -8 C0 -6 2 -6 2 -7 C4 -4 3 -1 0 0 Z" fill="#ffd36b"/><path d="M-.2 -.4 C-1.4 -1.6 -1.2 -3.4 0 -4.6 C.8 -3.4 1.4 -2 -.2 -.4 Z" fill="#fff3c4"/></g>
<g id="s-chute"><path d="M-12 -30 Q0 -45 12 -30 Q9 -32.4 6 -30 Q3 -32.4 0 -30 Q-3 -32.4 -6 -30 Q-9 -32.4 -12 -30 Z" style="fill:var(--acc)" opacity=".9"/><path d="M-6 -30 Q-5 -40 0 -41 M6 -30 Q5 -40 0 -41 M0 -30 V-41" fill="none" stroke="#000" stroke-width=".35" opacity=".3"/><path d="M-12 -30 L-3.6 -16 M12 -30 L3.6 -16 M-6 -30 L-2 -16 M6 -30 L2 -16" stroke="currentColor" stroke-width=".4" fill="none"/>
<rect x="-4.6" y="-16" width="9.2" height="7.6" rx=".6"/><rect x="-4" y="-15.4" width="8" height="6.4" ${F('d3')}/><path d="M-4.6 -12.4 H4.6 M0 -16 V-8.4" ${AS(.5, .55)}/><rect x="-4.6" y="-9" width="9.2" height=".9" ${F('d2')}/></g>
<g id="s-crate"><rect x="-5" y="-8" width="10" height="8"/><rect x="-4.3" y="-7.3" width="8.6" height="6.6" ${F('d2')}/><path d="M-4.3 -4.6 H4.3 M-4.3 -2 H4.3" ${S('d0', .35)}/><path d="M-4.3 -7.3 L4.3 -.7" ${S('d3', .7)}/><rect x="-3" y="-6.4" width="4.4" height=".7" ${A(.45)}/><path d="M-5 -8 H5" ${AS(.4, .5)}/></g>
<g id="s-drum"><rect x="-2.6" y="-8" width="5.2" height="8" rx="1"/><rect x="-2" y="-7.6" width="4" height="7.2" rx=".6" ${F('d2')}/><rect x="-2.6" y="-5.6" width="5.2" height=".6" ${A(.4)}/><rect x="-2.6" y="-2.6" width="5.2" height=".6" ${A(.4)}/><rect x="-1.4" y="-8.6" width="1" height=".6" ${F('d3')}/><rect x="-1.4" y="-7.2" width=".5" height="6.4" fill="#fff" opacity=".12"/></g>
<g id="s-shield"><path d="M0 -17 L9 -13.6 V-6 Q9 2 0 5 Q-9 2 -9 -6 V-13.6 Z" fill="none" style="stroke:var(--acc)" stroke-width="1.6"/><path d="M0 -13 L5.4 -10.8 V-6 Q5.4 -.4 0 1.6 Q-5.4 -.4 -5.4 -6 V-10.8 Z" style="fill:var(--acc)" opacity=".35"/><path d="M0 -10 L1.2 -6.6 L4.6 -6.6 L1.8 -4.6 L2.8 -1.2 L0 -3.2 L-2.8 -1.2 L-1.8 -4.6 L-4.6 -6.6 L-1.2 -6.6 Z" style="fill:var(--acc)" opacity=".8"/></g>
<g id="s-star"><path d="M0 -10 L2.4 -3.2 L9.5 -3.1 L3.8 1.2 L5.9 8.1 L0 4 L-5.9 8.1 L-3.8 1.2 L-9.5 -3.1 L-2.4 -3.2 Z"/></g>
<g id="s-reticle" fill="none" style="stroke:var(--acc)" stroke-width=".9"><circle r="11"/><circle r="5" stroke-width=".5" opacity=".6"/><path d="M-15 0 H-6 M6 0 H15 M0 -15 V-6 M0 6 V15"/><path d="M-8 -11 L-11 -11 L-11 -8 M8 -11 L11 -11 L11 -8 M-8 11 L-11 11 L-11 8 M8 11 L11 11 L11 8" stroke-width=".6" opacity=".7"/><circle r=".9" style="fill:#ff4a3a;stroke:none"/></g>
<g id="s-gear"><path d="M-1.4 -9 H1.4 L2 -6.6 L4.2 -5.6 L6.4 -7 L8.2 -5 L6.8 -2.8 L7.6 -.6 L10 0 V2.6 L7.6 3.2 L6.6 5.4 L8 7.6 L6 9.4 L3.8 8 L1.6 9 L1.2 11.4 H-1.4 L-2 9 L-4.2 8 L-6.4 9.4 L-8.2 7.6 L-6.8 5.4 L-7.8 3.2 L-10 2.6 V0 L-7.6 -.6 L-6.8 -2.8 L-8.2 -5 L-6.4 -7 L-4.2 -5.6 L-2 -6.6 Z M0 -2 A3.4 3.4 0 1 0 0.01 -2 Z" fill-rule="evenodd" style="fill:var(--acc)" opacity=".9"/></g>
<g id="s-wrench"><path d="M-9 7 L3 -5 Q2 -10 7 -11 L4.4 -8 L5.6 -5.6 L8 -4.6 L11 -7 Q10.6 -2 5 -3 L-7 9 Z" style="fill:var(--acc)" opacity=".9"/></g>
<g id="s-syringe"><g transform="rotate(-35)"><rect x="-12" y="-2.4" width="18" height="4.8" rx="1" fill="#d9e6e2" opacity=".9"/><rect x="-6" y="-1.6" width="11" height="3.2" style="fill:var(--acc)"/><path d="M-4 -1.6 V1.6 M-1 -1.6 V-.2 M2 -1.6 V1.6" stroke="#05080a" stroke-width=".3" opacity=".5"/><rect x="6" y="-.6" width="9" height="1.2" fill="#d9e6e2"/><rect x="-17" y="-.8" width="5" height="1.6" fill="#d9e6e2"/><rect x="-18" y="-3.4" width="1.6" height="6.8" fill="#d9e6e2"/><rect x="5.4" y="-3" width="1" height="6" fill="#d9e6e2"/></g></g>
<g id="s-map"><rect x="-26" y="-16" width="52" height="32" rx="1.5" fill="#0c1a1c" style="stroke:var(--acc)" stroke-width=".7"/><path d="M-26 -8 H26 M-26 0 H26 M-26 8 H26 M-13 -16 V16 M0 -16 V16 M13 -16 V16" style="stroke:var(--acc)" stroke-width=".25" opacity=".4"/>
<path d="M-22 -10 Q-18 -14 -12 -12 Q-8 -8 -12 -4 Q-16 0 -20 -2 Z M-4 -12 Q2 -14 8 -11 Q12 -6 6 -3 Q0 -2 -2 -6 Z M10 2 Q16 0 22 4 Q22 10 14 11 Q8 8 10 2 Z M-18 4 Q-12 3 -10 8 Q-14 12 -20 10 Z" style="fill:var(--acc)" opacity=".16"/>
<path d="M-20 10 Q-14 -6 -2 -4 Q8 -2 12 -10" fill="none" style="stroke:var(--acc)" stroke-width="1.4"/><path d="M12 -10 L8 -9 L11 -6 Z" style="fill:var(--acc)"/><circle cx="16" cy="6" r="2" fill="#ff4a3a"/><circle cx="16" cy="6" r="3.6" fill="#ff4a3a" opacity=".2"/><circle cx="20" cy="2" r="1.4" fill="#ff4a3a"/><circle cx="18" cy="10" r="1.2" fill="#ff4a3a"/><rect x="-21" y="7.6" width="5" height="3.4" fill="#5cb6d4"/></g>
<g id="s-clock"><circle r="10" fill="none" style="stroke:var(--acc)" stroke-width="1.6"/><path d="M0 0 V-7 M0 0 L5 3" style="stroke:var(--acc)" stroke-width="1.4"/><g style="fill:var(--acc)">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = i / 12 * Math.PI * 2; return `<circle cx="${n2(Math.sin(a) * 8)}" cy="${n2(-Math.cos(a) * 8)}" r="${i % 3 ? .35 : .7}"/>`; }).join('')}</g><rect x="-2" y="-14" width="4" height="2.6" style="fill:var(--acc)"/><path d="M-7 -11 L-9 -13" style="stroke:var(--acc)" stroke-width="1.2"/></g>
<g id="s-mortar"><rect x="-6" y="-1.2" width="10" height="1.2" ${F('d2')}/><path d="M-5.4 -1.2 L-3.4 -2.6 L1.6 -2.6 L3.4 -1.2 Z"/>
<path d="M-1.4 -1.6 L8.4 -16.4 L10.4 -15.2 L.8 -.4 Z"/><path d="M-.6 -1.8 L8.6 -15.6" ${AS(.35, .5)}/><rect x="7.6" y="-17.4" width="3.4" height="1.6" rx=".4" transform="rotate(-56 9.3 -16.6)" ${F('d3')}/>
<path d="M5.8 -8.8 L3 0 L4.2 0 L6.4 -6.8 L8.8 0 L10 0 Z"/><rect x="4.2" y="-10.4" width="3" height="1.6" ${F('d3')}/><rect x="2.6" y="-12" width="2.2" height="1.6" ${F('d2')}/><rect x="3.6" y="-11.6" width=".6" height=".6" ${A(.85)}/></g>
<g id="s-cage" fill="none" stroke="currentColor" stroke-width=".9"><rect x="-10" y="-22" width="20" height="22"/><path d="M-6 -22 V0 M-2 -22 V0 M2 -22 V0 M6 -22 V0 M-10 -11 H10"/><path d="M-11 -22.6 H11 M-11 .4 H11" stroke-width="1.4"/><rect x="7.4" y="-12.4" width="2" height="2.4" fill="currentColor" stroke="none"/></g>
<g id="s-mush"><path d="M-3.6 0 Q-2 -14 -4.6 -21 Q-15 -21 -15 -28 Q-15 -37 0 -37 Q15 -37 15 -28 Q15 -21 4.6 -21 Q2 -14 3.6 0 Z"/><path d="M-13 -28 Q-12 -35 -4 -35.6 Q-8 -32 -6 -28 Q-10 -25 -13 -28 Z M2 -35.4 Q10 -35 12.6 -29 Q8 -30 6 -33 Z" fill="#ffe6b0" opacity=".55"/><path d="M-15 -27 Q-8 -22 0 -22.6 Q8 -22 15 -27 Q14 -21 4.6 -21 L-4.6 -21 Q-14 -21 -15 -27 Z" fill="#b8481a" opacity=".5"/><path d="M-1.6 -18 Q-.6 -9 -2 0" fill="none" stroke="#ffe6b0" stroke-width=".8" opacity=".5"/><ellipse cx="0" cy="-15" rx="10" ry="1.6" fill="none" stroke="#ffe6b0" stroke-width=".8" opacity=".4"/></g>
<g id="s-flag"><rect x="-.6" y="-26" width="1.2" height="26"/><circle cx="0" cy="-26.4" r=".9"/><path d="M.6 -25.4 Q6 -28 11 -25 Q16 -22 21 -24 V-15 Q16 -13 11 -16 Q6 -19 .6 -16.4 Z" style="fill:var(--acc)"/><path d="M.6 -22.4 Q6 -25 11 -22 Q16 -19 21 -21 M.6 -19.4 Q6 -22 11 -19 Q16 -16 21 -18" fill="none" stroke="#000" stroke-width=".9" opacity=".22"/><path d="M.6 -25.4 Q4 -27 7.4 -26.2 V-20.2 Q4 -21.4 .6 -20.2 Z" fill="#000" opacity=".25"/><path d="M11 -25 Q13 -24 15 -23.4 V-14.6 Q13 -15 11 -16 Z" fill="#fff" opacity=".12"/></g>
<g id="s-lamp"><circle r="2" fill="#fff3c4"/><circle r="4.4" fill="#fff3c4" opacity=".18"/></g>
<g id="s-pine"><rect x="-.4" y="-2.6" width=".8" height="2.6"/><path d="M0 -16 L-2.4 -11 L-1.2 -11 L-3.6 -6.4 L-2 -6.4 L-4.8 -2.4 L4.8 -2.4 L2 -6.4 L3.6 -6.4 L1.2 -11 L2.4 -11 Z"/></g>
<g id="s-oak"><rect x="-.5" y="-5" width="1" height="5"/><circle cx="0" cy="-8" r="3.6"/><circle cx="-2.6" cy="-6.4" r="2.6"/><circle cx="2.8" cy="-6.6" r="2.6"/><circle cx="1" cy="-10.6" r="2.4"/></g>
<g id="s-snowpine"><rect x="-.4" y="-2.6" width=".8" height="2.6"/><path d="M0 -16 L-2.4 -11 L-1.2 -11 L-3.6 -6.4 L-2 -6.4 L-4.8 -2.4 L4.8 -2.4 L2 -6.4 L3.6 -6.4 L1.2 -11 L2.4 -11 Z"/><path d="M0 -16 L-1.6 -12.6 L1.6 -12.6 Z M-2.6 -9 L-1 -10.2 L1 -10.2 L2.6 -9 Z M-3.8 -4.6 L-1.8 -6 L1.8 -6 L3.8 -4.6 Z" fill="#dfe8e6" opacity=".55"/></g>
<g id="s-pole"><rect x="-.35" y="-22" width=".7" height="22"/><rect x="-3" y="-20.6" width="6" height=".6"/><g ${F('d4')}><rect x="-2.8" y="-21.4" width=".5" height=".8"/><rect x="2.3" y="-21.4" width=".5" height=".8"/></g></g>
<g id="s-slamp"><rect x="-.3" y="-18" width=".6" height="18"/><path d="M0 -18 Q2 -19.4 4 -18.4" fill="none" stroke="currentColor" stroke-width=".5"/><rect x="3" y="-18.6" width="2.2" height=".8" rx=".3"/><circle cx="4.1" cy="-17.4" r="1" fill="#ffe7a3" opacity=".85"/><path d="M4.1 -17.4 L0 0 L8.4 0 Z" fill="#ffe7a3" opacity=".05"/></g>
<g id="s-rubble"><path d="M-9 0 L-7 -2.4 L-4.6 -1.8 L-3 -4 L-.4 -3.2 L1.6 -5 L4 -3 L6.4 -3.6 L9 0 Z"/><path d="M-3 -4 L-.4 -3.2 L1.6 -5" ${AS(.35, .45)}/><path d="M-1 -3.6 L-2.4 -7 M3 -3.8 L4.6 -6.4" fill="none" stroke="currentColor" stroke-width=".3"/><rect x="5" y="-2.8" width="2.6" height="1.4" transform="rotate(-18 5 -2.8)" ${F('d3')}/></g>
<g id="s-screen"><rect x="-9" y="-6" width="18" height="11" rx=".6"/><rect x="-8.2" y="-5.2" width="16.4" height="9.4" ${A(.22)}/><path d="M-7 2 L-4 -1 L-1 1 L3 -3 L7 -1" ${AS(.4, .8)}/><g ${A(.35)}><rect x="-7" y="-4.2" width="5" height=".6"/><rect x="-7" y="-3" width="3" height=".6"/></g><rect x="-.6" y="5" width="1.2" height="2"/></g>`;

const DEFS = VEH + PEOPLE + PROPS + `
<g id="s-gtex">${scatter(21, 26, 73.2, 85, 'rubble')}${scatter(23, 14, 74, 84, 'line')}</g>
<g id="s-sky0"><path d="${SK0.d}"/></g>
<g id="s-sky1"><path d="${SK1.d}"/><g fill="#000" opacity=".2">${SK1.top}</g></g>
<g id="s-sky2"><path d="${SK2.d}"/><g>${SK2.top}</g><g style="fill:var(--acc)" opacity=".18">${SK2.edge}</g><g style="fill:var(--acc)" opacity=".55">${SK2.win}</g><g fill="${V.wm}" opacity=".45">${SK2.warm}</g></g>
<g id="s-ru0"><path d="${RU0.d}"/></g>
<g id="s-ru1"><path d="${RU1.d}"/><g>${RU1.top}</g></g>
<g id="s-ru2"><path d="${RU2.d}"/><g>${RU2.top}</g><g style="fill:var(--acc)" opacity=".4">${RU2.win}</g><g fill="#ff8a3a" opacity=".55">${RU2.warm}</g></g>
${Object.entries(PAL).map(([k, p]) => `<linearGradient id="sky-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset=".5" stop-color="${p.top}" stop-opacity="1"/><stop offset=".83" stop-color="${p.hz}"/><stop offset="1" stop-color="${p.hz}"/></linearGradient><radialGradient id="glw-${k}"><stop offset="0" stop-color="${p.acc}" stop-opacity=".75"/><stop offset=".4" stop-color="${p.acc}" stop-opacity=".25"/><stop offset="1" stop-color="${p.acc}" stop-opacity="0"/></radialGradient><linearGradient id="beam-${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.acc}" stop-opacity=".55"/><stop offset="1" stop-color="${p.acc}" stop-opacity="0"/></linearGradient><linearGradient id="haze-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.hz}" stop-opacity="0"/><stop offset="1" stop-color="${p.acc}" stop-opacity=".16"/></linearGradient>`).join('')}
<radialGradient id="glw-fire"><stop offset="0" stop-color="#fff1b8" stop-opacity=".95"/><stop offset=".3" stop-color="#ff9a3a" stop-opacity=".6"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="glw-red"><stop offset="0" stop-color="#ff4a3a" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a3a" stop-opacity="0"/></radialGradient>
<radialGradient id="glw-moon"><stop offset="0" stop-color="#f2f4ea" stop-opacity=".9"/><stop offset=".22" stop-color="#f2f4ea" stop-opacity=".8"/><stop offset=".26" stop-color="#cfe0e0" stop-opacity=".18"/><stop offset="1" stop-color="#cfe0e0" stop-opacity="0"/></radialGradient>
<radialGradient id="glw-sun"><stop offset="0" stop-color="#fff6d8" stop-opacity="1"/><stop offset=".25" stop-color="#ffd27a" stop-opacity=".9"/><stop offset=".3" stop-color="#ffb347" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="smk" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2a3438" stop-opacity=".7"/><stop offset=".7" stop-color="#1c2427" stop-opacity=".45"/><stop offset="1" stop-color="#1c2427" stop-opacity="0"/></radialGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1012"/><stop offset=".35" stop-color="${INK}"/><stop offset="1" stop-color="#020304"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<pattern id="scan" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height=".5" fill="#fff" opacity=".035"/></pattern>
<pattern id="dither" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".35" fill="#fff" opacity=".05"/></pattern>`;

function sprite() { return `<svg id="art-sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${DEFS}</defs></svg>`; }

// ---------------------------------------------------------------- scene items
// ['u', sym, x, y, scale, opts]  opts: f flip, o opacity, c color(acc|fire|red|mid|far|light|hex), r rotate
const NORIM = /^(sky|ru|pine|oak|snowpine|pole|slamp|rubble|screen)/;
function U(sym, x, y, s = 1, o = {}) {
  if (sym === 'zombie' && !o.c) o = Object.assign({ c:'#180807' }, o);
  const col = o.c === 'acc' ? 'var(--acc)' : o.c === 'fire' ? FIRE : o.c === 'red' ? RED : o.c === 'mid' ? MID : o.c === 'light' ? '#e8efe9' : o.c || INK;
  const rk = Math.min(s, 1.3); const tf = (dx, dy) => `translate(${n2(+x + dx * rk)} ${n2(+y + dy * rk)})${o.r ? ` rotate(${o.r})` : ''} scale(${o.f ? -s : s} ${s})`;
  const solid = !o.c || o.c === '#180807' || o.c === INK;
  const rim = solid && o.o == null && o.rim !== false && !NORIM.test(sym) ? `<use href="#s-${sym}" transform="${tf(-.42, -.5)}" style="fill:var(--acc);color:var(--acc);${RIMVARS}" opacity="${sym === 'zombie' ? .38 : .55}"/>` : '';
  const flat = o.c === 'acc' ? `fill:var(--acc);color:var(--acc);${RIMVARS}` : '';
  return rim + `<use href="#s-${sym}" transform="${tf(0, 0)}" fill="${col}" color="${col}" style="${flat}"${o.o != null ? ` opacity="${o.o}"` : ''}/>`;
}
const CIVS = ['civ', 'civ2', 'civ3'];
function item(it, k) {
  const t = it[0];
  if (t === 'u') return U(it[1], it[2], it[3], it[4], it[5]);
  if (t === 'g') { const id = it[4] ? `glw-${it[4]}` : `glw-${k}`; return `<circle cx="${it[1]}" cy="${it[2]}" r="${it[3]}" fill="url(#${id})"/>`; }
  if (t === 'tr') return `<line x1="${it[1]}" y1="${it[2]}" x2="${it[3]}" y2="${it[4]}" stroke="${it[5] || '#ffd890'}" stroke-width="1.8" opacity=".22"/><line x1="${it[1]}" y1="${it[2]}" x2="${it[3]}" y2="${it[4]}" stroke="${it[5] || '#fff0c0'}" stroke-width=".55"/><circle cx="${it[1]}" cy="${it[2]}" r="1.4" fill="#fff0c0" opacity=".5"/>`;
  if (t === 'beam') { const [x, y, a, len, w] = it.slice(1); const r = a * Math.PI / 180; const ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len; const px = -Math.sin(r) * w, py = Math.cos(r) * w; return `<polygon points="${x},${y} ${(ex + px).toFixed(1)},${(ey + py).toFixed(1)} ${(ex - px).toFixed(1)},${(ey - py).toFixed(1)}" fill="url(#beam-${k})" style="mix-blend-mode:screen"/>`; }
  if (t === 'line') return `<line x1="${it[1]}" y1="${it[2]}" x2="${it[3]}" y2="${it[4]}" stroke="${it[6] || INK}" stroke-width="${it[5] || .5}"/>`;
  if (t === 'arc') { const [x1, y1, x2, y2, h] = it.slice(1); return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - h} ${x2} ${y2}" fill="none" stroke="var(--acc)" style="stroke:var(--acc)" stroke-width=".7" stroke-dasharray="2 1.6" opacity=".85"/>`; }
  if (t === 'smoke') { const [x, y, s] = it.slice(1); let o = ''; const pts = [[0, 0, 5], [4, -5, 6], [-3, -9, 6.4], [3, -14, 7.2], [-2, -20, 8.4], [5, -25, 8], [0, -31, 9]]; for (const [dx, dy, r] of pts) o += `<circle cx="${n2(x + dx * s)}" cy="${n2(y + dy * s)}" r="${n2(r * s)}" fill="url(#smk)"/>`; return o; }
  if (t === 'stars') { let o = ''; const r = lcg(it[1] || 3); for (let i = 0; i < 30; i++) o += `<circle cx="${(r() * 160).toFixed(1)}" cy="${(r() * 40).toFixed(1)}" r="${(r() * .5 + .2).toFixed(2)}" fill="#fff" opacity="${(r() * .5 + .2).toFixed(2)}"/>`; return o; }
  if (t === 'snow') { let o = ''; const r = lcg(9); for (let i = 0; i < 70; i++) o += `<circle cx="${(r() * 160).toFixed(1)}" cy="${(r() * 86).toFixed(1)}" r="${(r() * .6 + .3).toFixed(2)}" fill="#eef4f2" opacity="${(r() * .5 + .3).toFixed(2)}"/>`; return o; }
  if (t === 'rays') { const [x, y] = it.slice(1); let o = ''; for (let i = 0; i < 9; i++) { const a = (-160 + i * 17.5) * Math.PI / 180; o += `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * 90).toFixed(1)}" y2="${(y + Math.sin(a) * 90).toFixed(1)}" stroke="var(--acc)" style="stroke:var(--acc)" stroke-width="3" opacity=".06"/>`; } return o; }
  if (t === 'waves') { const [x, y, n] = it.slice(1); let o = ''; for (let i = 1; i <= (n || 3); i++) o += `<path d="M${x - 4 * i} ${y - 3 * i} A${5 * i} ${5 * i} 0 0 1 ${x + 4 * i} ${y - 3 * i}" fill="none" style="stroke:var(--acc)" stroke-width=".9" opacity="${1 - i * .22}"/>`; return o; }
  if (t === 'rect') return `<rect x="${it[1]}" y="${it[2]}" width="${it[3]}" height="${it[4]}" fill="${it[5] || INK}"${it[6] != null ? ` opacity="${it[6]}"` : ''}/>`;
  if (t === 'bg') return bg(it[1], k);
  if (t === 'horde') { const [x0, x1, y, n, s] = it.slice(1); let o = ''; const r = lcg(x0 * 7 + n); for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i / Math.max(1, n - 1)) + (r() - .5) * 4; const sc = (s || 1) * (.75 + r() * .4); o += U('zombie', x.toFixed(1), y, sc, { f: it[6] ? 1 : 0, o: i % 2 ? .82 : undefined }); } return o; }
  if (t === 'crowd') { const [x0, x1, y, n, s] = it.slice(1); let o = ''; const r = lcg(x0 * 3 + n); for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i / Math.max(1, n - 1)) + (r() - .5) * 3; const kid = r() < .2; const sc = (s || 1) * (kid ? .62 : .8 + r() * .3); const v = kid ? 'civ' : CIVS[Math.floor(r() * 3)]; o += U(v, x.toFixed(1), y, sc, { f: r() < .5 ? 1 : 0 }); } return o; }
  return '';
}
// ground strip with texture
const GND = `<rect x="0" y="72" width="160" height="14" fill="url(#gnd)"/><rect x="0" y="72" width="160" height=".5" fill="var(--acc)" style="fill:var(--acc)" opacity=".2"/><use href="#s-gtex"/>`;
const ROAD = `<path d="M0 76.6 H160" stroke="var(--acc)" style="stroke:var(--acc)" stroke-width=".35" stroke-dasharray="5 4" opacity=".16"/><rect x="0" y="72.5" width="160" height=".6" fill="#000" opacity=".5"/>`;
const BG = {
  city: () => `<rect x="0" y="40" width="160" height="32" fill="url(#haze-K)"/>` + U('sky0', 0, 72, .9, { o:.1 }) + U('sky1', 0, 72, .95, { o:.22 }) + U('sky2', 0, 72, .62, { c:MID, o:.62 }) + `<use href="#s-slamp" transform="translate(4 72) scale(1)" fill="${INK}" color="${INK}"/><use href="#s-slamp" transform="translate(150 72) scale(-1 1)" fill="${INK}" color="${INK}"/>` + GND + ROAD,
  ruins: () => `<rect x="0" y="40" width="160" height="32" fill="url(#haze-K)"/>` + U('ru0', 0, 72, .9, { o:.1 }) + U('ru1', 0, 72, .95, { o:.22 }) + U('ru2', 0, 72, .6, { c:MID, o:.64 }) + `<circle cx="34" cy="44" r="7" fill="url(#smk)" opacity=".7"/><circle cx="30" cy="36" r="8" fill="url(#smk)" opacity=".5"/><circle cx="36" cy="27" r="9" fill="url(#smk)" opacity=".35"/><circle cx="128" cy="46" r="6" fill="url(#smk)" opacity=".6"/><circle cx="132" cy="38" r="7.4" fill="url(#smk)" opacity=".4"/>` + GND + `<use href="#s-rubble" transform="translate(12 73) scale(1)" fill="${INK}" color="${INK}"/><use href="#s-rubble" transform="translate(150 73) scale(-.8 .8)" fill="${INK}" color="${INK}"/>`,
  farcity: () => `<rect x="0" y="44" width="160" height="28" fill="url(#haze-K)"/>` + U('sky0', 0, 72, .55, { o:.12 }) + U('sky1', 0, 72, .6, { o:.25 }) + `<path d="M0 69 Q40 66 80 69 T160 68 V72 H0 Z" fill="${MID}" opacity=".7"/>` + GND,
  field: () => `<rect x="0" y="46" width="160" height="26" fill="url(#haze-K)"/><path d="M0 62 Q30 54 60 60 T120 58 T160 60 V86 H0 Z" fill="${MID}" opacity=".7"/><g fill="${MID}" opacity=".8">${trees(41, 4, 156, 61, 14, .55, 'oak')}</g>` + `<g fill="${INK}" color="${INK}">${[18, 66, 114].map(x => `<use href="#s-pole" transform="translate(${x} 70) scale(.7)"/>`).join('')}</g><path d="M18 55.6 Q42 58 66 55.6 Q90 58 114 55.6 Q138 58 162 55.6" fill="none" stroke="${INK}" stroke-width=".25"/>` + `<path d="M0 70 Q40 64 80 69 T160 67 V86 H0 Z" fill="url(#gnd)"/><path d="M0 70 Q40 64 80 69 T160 67" fill="none" style="stroke:var(--acc)" stroke-width=".4" opacity=".18"/>${scatter(29, 40, 68.4, 72, 'grass')}${scatter(31, 14, 74, 85, 'rubble')}`,
  hills: () => `<rect x="0" y="40" width="160" height="32" fill="url(#haze-K)"/><path d="M0 52 L22 40 L40 50 L60 36 L84 50 L110 40 L136 52 L160 44 V86 H0 Z" fill="${MID}" opacity=".45"/><path d="M0 58 L18 46 L34 56 L52 40 L72 54 L94 44 L118 58 L138 48 L160 56 V86 H0 Z" fill="${MID}" opacity=".75"/><g fill="${MID}">${trees(43, 0, 160, 63, 18, .6, 'pine')}</g>` + `<path d="M0 70 Q40 62 80 68 T160 66 V86 H0 Z" fill="url(#gnd)"/><path d="M0 70 Q40 62 80 68 T160 66" fill="none" style="stroke:var(--acc)" stroke-width=".4" opacity=".18"/><g fill="${INK}">${trees(47, 2, 30, 70, 3, .9, 'pine')}${trees(49, 140, 158, 68, 2, .85, 'pine')}</g>${scatter(33, 30, 68, 71, 'grass')}`,
  desert: () => `<rect x="0" y="46" width="160" height="26" fill="url(#haze-K)"/><path d="M8 62 V54 Q8 52 12 52 H30 Q34 52 34 54 V62 Z M112 62 V56 Q112 54 116 54 H128 Q131 54 131 56 V62 Z" fill="#2a1d10" opacity=".55"/><path d="M0 66 Q40 58 70 64 T130 60 T160 64 V86 H0 Z" fill="#2a1d10" opacity=".85"/><path d="M30 61 Q50 59 70 64 M110 60 Q125 58 140 61" fill="none" style="stroke:var(--acc)" stroke-width=".3" opacity=".25"/>` + `<path d="M0 72 Q50 66 100 71 T160 70 V86 H0 Z" fill="url(#gnd)"/><path d="M0 72 Q50 66 100 71 T160 70" fill="none" style="stroke:var(--acc)" stroke-width=".4" opacity=".2"/>${scatter(37, 18, 74, 85, 'rubble')}<path d="M150 72 L150 64 M150 67 L146 63 M150 66 L153 62" fill="none" stroke="${INK}" stroke-width=".6"/>`,
  snow: () => `<path d="M0 64 L22 50 L40 60 L60 46 L84 60 L110 48 L134 60 L160 52 V86 H0 Z" fill="#b9c7c6" opacity=".22"/><g fill="#26343a" opacity=".9">${trees(51, 0, 160, 66, 16, .6, 'snowpine')}</g><rect x="0" y="72" width="160" height="14" fill="#cfdad8"/><rect x="0" y="72" width="160" height="2" fill="#e9f0ee"/><path d="M0 74 Q30 72.6 60 74.4 T120 74 T160 74.6" fill="none" stroke="#9fb0ae" stroke-width=".5" opacity=".6"/>`,
  sea: () => `<path d="M0 64 Q12 61 26 63 L30 66 H0 Z" fill="${MID}" opacity=".6"/><rect x="0" y="66" width="160" height="20" fill="#061014"/><rect x="0" y="66" width="160" height=".5" style="fill:var(--acc)" opacity=".3"/>${[68, 70.4, 73, 76, 79.6, 83].map((y, i) => `<path d="M${6 + i * 19} ${y} q4 -1 8 0 t8 0" fill="none" style="stroke:var(--acc)" stroke-width=".4" opacity="${.32 - i * .03}"/><path d="M${90 - i * 11} ${y + 1} q3 -.8 6 0" fill="none" style="stroke:var(--acc)" stroke-width=".3" opacity="${.22 - i * .02}"/>`).join('')}`,
  room: () => `<rect width="160" height="86" fill="#0a1214" opacity=".8"/><g ${S('d3', .4)}>${[20, 46, 72, 98, 124, 150].map(x => `<path d="M${x} 0 V60"/>`).join('')}</g><rect x="0" y="4" width="160" height="1.2" style="fill:var(--acc)" opacity=".18"/><g fill="${INK}" color="${INK}">${[[22, 22], [138, 22]].map(([x, y]) => `<use href="#s-screen" transform="translate(${x} ${y}) scale(1)"/>`).join('')}</g><path d="M0 60 H160" stroke="var(--acc)" style="stroke:var(--acc)" stroke-width=".4" opacity=".3"/><rect x="0" y="62" width="160" height="10" fill="#070c0e"/><rect x="0" y="62" width="160" height=".5" style="fill:var(--acc)" opacity=".18"/><rect x="0" y="72" width="160" height="14" fill="${INK}"/>`,
};
function bg(v, k) {
  const f = BG[v];
  return f ? f().replace(/haze-K/g, `haze-${k}`) : GND;
}

// ---------------------------------------------------------------- compositions
const SC = {
  // ===== starter
  clear_hold: [['bg','ruins'],['g',122,60,36],['u','kneel',18,72,1.75],['u','soldier',44,72,1.65],['tr',60,53,108,55],['tr',38,55,124,57],['u','burst',112,55,.45],['horde',104,154,72,4,1.6]],
  fire_mission: [['bg','field'],['g',138,62,30,'fire'],['u','burst',138,64,.85],['u','burst',152,67,.5],['smoke',140,60,.8],['arc',102,20,138,62,10],['u','sp',34,70,1.15],['g',103,20,14,'fire'],['u','burst',103,20,.5],['smoke',106,16,.45]],
  uas_recon: [['stars',5],['bg','city'],['beam',82,22,90,52,20],['u','uav',82,16,1.1],['u','reticle',96,58,1.25],['horde',86,110,72,3,1.3]],
  convoy: [['bg','desert'],['g',140,30,30,'sun'],['u','ifv',24,73,.92],['u','truck',82,73,1.12],['u','tanker',136,73,1.12],['smoke',4,70,.5]],
  aid_station: [['bg','field'],['g',84,48,34],['u','tent',86,72,2.2],['u','redx',86,51,1.7],['u','soldier',34,72,1.45],['rect',112,63,24,2.6],['u','kneel',146,72,1.35,{f:1}]],
  evac: [['bg','city'],['u','bus',108,73,1.4],['crowd',14,64,72,5,1.3],['u','soldier',152,72,1.3,{f:1}]],
  checkpoint: [['bg','city'],['u','gate',40,72,2.1],['crowd',98,136,72,4,1.25],['u','tower',152,72,1.3],['beam',157,48,168,80,18]],
  dig_in: [['bg','ruins'],['u','sandbag',52,72,1.7],['u','kneel',42,59,1.4],['u','kneel',62,59,1.4],['u','wire',118,72,1.25],['horde',140,156,72,2,1.5]],
  samples: [['bg','ruins'],['g',82,56,30],['u','zombie',110,72,1.7,{r:-84}],['u','kneel',74,72,1.75],['u','vial',94,56,1.3,{c:'light'}],['g',94,51,10],['u','bio',138,26,1.5,{o:.55}]],
  // ===== combat
  mech_sweep: [['bg','ruins'],['g',140,60,26,'fire'],['u','ifv',48,72,1.35],['tr',100,38,140,58],['u','burst',140,58,.5],['horde',124,156,72,3,1.45],['smoke',10,66,.7]],
  hw_platoon: [['bg','ruins'],['u','hw',46,72,1.15],['g',53,32,9,'fire'],['tr',53,32,148,60],['tr',53,34,138,62],['horde',118,156,72,4,1.4]],
  snipers: [['bg','city'],['rect',0,44,58,28],['u','prone',26,44,1.65],['u','reticle',118,50,1.6],['u','zombie',118,72,1.7],['horde',144,158,72,2,1.25]],
  combined_arms: [['bg','ruins'],['u','apache',108,26,.95],['tr',120,28,140,62],['g',138,64,26,'fire'],['u','burst',140,64,.7],['u','sp',30,72,.9],['u','ifv',108,73,.88]],
  linebacker: [['bg','field'],['u','ad',44,72,1.45],['g',87,36,9,'fire'],['tr',87,36,150,56],['tr',87,37,144,60],['u','burst',146,58,.45],['horde',118,156,72,3,1.45]],
  qrf: [['bg','city'],['u','ul',124,73,1.1],['u','soldier',22,72,1.5],['u','soldier',44,72,1.5],['u','soldier',66,72,1.5],['line',2,58,14,58,.7,'var(--acc)'],['line',0,63,10,63,.7,'var(--acc)']],
  obstacles: [['bg','ruins'],['u','dozer',36,72,1.05],['u','barrier',100,72,1.4],['u','wire',128,72,1.2],['horde',146,158,72,2,1.4]],
  breach: [['bg','ruins'],['u','dozer',40,72,1.25],['u','car',108,72,1.4,{r:-14}],['u','car',134,68,1.3,{r:172}],['smoke',118,64,.7]],
  // ===== fires
  mortars: [['bg','hills'],['u','mf',46,71,1.2],['u','kneel',98,71,1.3,{f:1}],['g',66,22,9,'fire'],['arc',66,22,138,62,14],['u','burst',138,62,.5],['u','burst',152,65,.38]],
  thermobaric: [['bg','ruins'],['g',96,48,60,'fire'],['g',96,52,30,'fire'],['u','burst',96,52,1.8],['smoke',100,40,1.3],['u','ru2',0,72,.8,{o:.95}],['rect',0,72,160,14]],
  firebreak: [['bg','city'],['g',80,64,60,'fire'],['u','flame',24,72,1.8],['u','flame',50,72,2.3],['u','flame',78,72,1.9],['u','flame',104,72,2.4],['u','flame',130,72,1.8],['u','flame',152,72,2.1],['smoke',60,50,1.2],['smoke',112,48,1.1]],
  fpf: [['bg','ruins'],['g',118,64,44,'fire'],['u','burst',104,66,.65],['u','burst',124,64,.75],['u','burst',146,66,.6],['u','sandbag',40,72,1.6],['u','kneel',30,59,1.4],['u','kneel',52,59,1.4]],
  // ===== air
  apache: [['bg','ruins'],['u','apache',62,28,1.55],['tr',70,32,124,66],['tr',68,33,110,68],['g',120,66,22,'fire'],['u','burst',124,66,.6],['u','burst',110,68,.45],['horde',134,156,72,2,1.4]],
  medevac: [['bg','field'],['g',86,30,34],['u','hawk',90,30,1.5],['u','redx',92,22,1],['u','soldier',54,72,1.4],['u','soldier',118,72,1.4,{f:1}],['rect',56,56,60,3],['line',90,33,90,56,.4,'#9fb']],
  airbridge: [['bg','hills'],['g',80,30,30],['u','chinook',80,26,1.35],['line',80,29,74,56,.5,'#d8d0a8'],['line',80,29,86,56,.5,'#d8d0a8'],['u','crate',80,64,1.9]],
  air_assault: [['bg','city'],['u','hawk',64,22,1.25],['line',62,24,62,48,.5,'#cfc8a8'],['u','soldier',62,50,1.05],['u','soldier',26,72,1.45],['u','kneel',92,72,1.45],['tr',108,62,146,64],['horde',142,158,72,2,1.4]],
  rooftop: [['bg','city'],['rect',46,40,82,32],['g',96,18,28],['u','hawk',96,16,1.35],['line',94,19,94,40,.5,'#cfc8a8'],['crowd',58,114,40,4,1.2]],
  redeploy: [['bg','field'],['u','chinook',56,20,1.15],['u','ifv',32,73,1.05],['u','truck',94,73,1.1],['u','truck',140,73,1.1],['line',0,58,12,58,.7,'var(--acc)'],['line',0,63,8,63,.7,'var(--acc)']],
  cas: [['bg','ruins'],['u','jet',100,18,1.9],['line',160,17,124,18,1,'#d9e6e2'],['g',62,64,40,'fire'],['u','burst',46,66,.7],['u','burst',68,63,.9],['u','burst',90,66,.6],['smoke',66,58,1],['horde',112,150,72,3,1.35]],
  // ===== intel
  endurance_uas: [['stars',8],['g',26,16,16,'moon'],['bg','field'],['u','uav',106,22,1.25],['u','dish',40,70,2],['waves',42,46,3],['u','mast',138,70,1.05]],
  sigint: [['stars',2],['bg','city'],['u','mast',54,72,1.5],['waves',54,8,4],['u','dish',112,72,2.1],['waves',118,38,3]],
  pattern: [['bg','room'],['u','map',84,36,2],['u','officer',146,72,1.5,{f:1}],['u','soldier',18,72,1.4]],
  patient_zero: [['bg','room'],['u','map',72,38,1.85],['u','reticle',110,48,.9],['u','flask',144,72,1.8],['u','bio',20,26,1.3,{o:.6}]],
  // ===== research / medical
  escort: [['bg','farcity'],['u','lab',122,72,1.4],['u','soldier',16,72,1.45],['u','civ',38,72,1.45],['u','civ',54,72,1.35],['u','soldier',74,72,1.45]],
  decon: [['bg','field'],['u','tent',110,72,2.1],['u','bio',110,40,1.1],['u','soldier',58,72,1.55],['rect',22,36,4,36],['line',26,40,52,54,.5,'var(--acc)'],['line',26,44,54,58,.5,'var(--acc)'],['line',26,48,50,62,.5,'var(--acc)']],
  specimen: [['bg','room'],['g',80,54,32,'red'],['u','cage',80,72,2.1],['u','zombie',82,72,1.75],['u','soldier',30,72,1.5],['u','soldier',132,72,1.5,{f:1}]],
  fst: [['bg','field'],['g',80,50,42,'fire'],['u','tent',80,72,2.6],['u','redx',80,48,1.8],['u','soldier',26,72,1.45],['u','soldier',136,72,1.45,{f:1}]],
  prophylaxis: [['bg','field'],['g',104,34,32],['u','syringe',104,36,2.2],['u','vial',24,72,2.2,{c:'light'}],['u','vial',40,72,2.2,{c:'light'}],['u','vial',56,72,2.2,{c:'light'}],['u','soldier',146,72,1.45,{f:1}]],
  // ===== logistics
  forage: [['bg','ruins'],['u','truck',122,73,1.4],['u','soldier',26,72,1.45],['u','crate',40,57,1.1],['u','soldier',60,72,1.45],['u','crate',74,57,1.1],['u','drum',90,72,1.5]],
  requisition: [['bg','farcity'],['u','crate',34,72,2.5],['u','crate',60,72,2.5],['u','crate',47,52,2.5],['u','star',47,42,.75,{c:'acc'}],['u','truck',126,73,1.35]],
  fuel_point: [['bg','desert'],['g',140,28,26,'sun'],['u','tanker',44,73,1.4],['u','ifv',128,72,1.15,{f:1}],['line',75,64,100,62,1,'#05080a'],['u','drum',90,72,1.4],['u','drum',98,72,1.4]],
  maint: [['bg','field'],['g',92,46,34,'fire'],['u','hr',44,72,1.0],['u','ifv',126,72,.8,{r:-5}],['smoke',132,56,.55],['u','kneel',96,72,1.15],['u','wrench',150,22,.9],['u','gear',18,20,.9]],
  cache: [['bg','sea'],['g',26,56,28,'sun'],['u','ship',110,66,1.35],['u','crate',22,72,1.8],['u','crate',40,72,1.8],['u','crate',31,57.6,1.8]],
  // ===== civil
  safe_zone: [['bg','farcity'],['g',80,58,42],['u','wall',46,72,1.7],['u','wall',114,72,1.7],['u','tower',12,72,1.4],['u','tower',148,72,1.4],['u','shield',80,38,1.6]],
  martial_law: [['stars',4],['bg','city'],['u','tower',34,72,1.4],['u','tower',126,72,1.4],['beam',41,45,50,60,14],['beam',133,45,130,60,14],['u','soldier',68,72,1.55],['u','soldier',92,72,1.55,{f:1}]],
  psa: [['bg','city'],['u','mast',80,72,1.55],['waves',80,4,4],['crowd',12,60,72,4,1.25],['crowd',100,148,72,4,1.25]],
  partner: [['bg','farcity'],['g',80,50,24],['u','soldier',68,72,1.9],['u','soldier',94,72,1.9,{f:1}],['u','ul',22,73,.8,{o:.75}],['u','pickup',140,73,1.1,{o:.8,f:1}]],
  borders: [['bg','field'],['horde',14,60,72,4,1.15,1],['u','fence',36,72,1.45],['u','fence',94,72,1.45],['u','tower',142,72,1.45]],
  refugee_camp: [['bg','field'],['g',80,56,42],['u','tent',26,72,1.3],['u','tent',66,72,1.55],['u','tent',110,72,1.3],['u','tent',146,72,1.2],['crowd',44,128,72,4,1.15]],
  // ===== command
  rally: [['bg','field'],['rays',80,56],['u','ifv',80,72,1.35],['u','cheer',58,44,1.3],['u','cheer',22,72,1.5],['u','cheer',138,72,1.5,{f:1}]],
  intent: [['bg','room'],['u','map',88,34,1.9],['u','officer',26,72,1.7],['u','soldier',148,72,1.4,{f:1}]],
  reinforce: [['bg','field'],['u','plane',100,32,1.6],['u','soldier',14,72,1.35],['u','soldier',32,72,1.35],['u','soldier',50,72,1.35],['u','soldier',68,72,1.35],['u','soldier',86,72,1.35]],
  overwatch: [['stars',6],['g',134,18,18,'moon'],['bg','hills'],['rect',0,56,76,16],['u','prone',30,56,1.55],['u','kneel',62,56,1.4],['horde',118,154,72,3,1.1]],
  hq_report: [['bg','room'],['g',64,58,24],['u','tent',66,72,2.5],['u','mast',118,72,1.25],['u','dish',144,72,1.6],['u','officer',22,72,1.6]],
  tempo: [['bg','field'],['u','clock',120,32,2.1],['u','soldier',20,72,1.5],['u','soldier',42,72,1.5],['u','soldier',64,72,1.5],['line',0,58,8,58,.7,'var(--acc)'],['line',0,63,6,63,.7,'var(--acc)']],
  // ===== phase II: restoration
  cure_convoy: [['bg','field'],['g',142,30,26,'sun'],['u','truck',44,73,1.35],['u','flask',40,66,.75,{c:'acc'}],['u','truck',108,73,1.35],['u','flask',104,66,.75,{c:'acc'}],['u','soldier',150,72,1.25,{f:1}]],
  field_cure: [['bg','ruins'],['g',96,50,34],['u','kneel',58,72,1.75],['u','syringe',84,52,.9],['u','civ',104,72,1.65,{f:1}],['u','zombie',138,72,1.45,{o:.6}]],
  mass_vax: [['bg','city'],['g',76,30,30],['u','chinook',76,32,1.2],['u','chute',120,62,.85],['u','chute',34,66,.75],['crowd',56,104,72,4,1.2]],
  cure_aerosol: [['bg','city'],['g',84,46,50],['beam',84,32,90,40,44],['u','hawk',84,30,1.25],['crowd',14,64,72,4,1.2],['crowd',108,152,72,4,1.2]],
  rebuild_grid: [['bg','city'],['g',80,30,34],['u','pylon',38,72,1.45],['u','pylon',122,72,1.45],['line',24,22,108,22,.5,'#bcd'],['line',28,31,112,31,.5,'#bcd'],['u','soldier',66,72,1.4],['u','truck',96,73,.95]],
  restore_gov: [['bg','city'],['rays',80,44],['u','lab',80,72,1.35],['u','flag',80,37,.8],['crowd',8,52,72,4,1.25],['crowd',110,154,72,4,1.25]],
  reopen_trade: [['bg','sea'],['g',28,52,28,'sun'],['u','ship',112,66,1.3],['u','truck',36,73,1.1],['u','crate',66,72,1.4],['u','crate',80,72,1.4]],
  census: [['bg','field'],['u','tent',132,72,1.5],['u','officer',54,72,1.6],['rect',58,52,6,4.6,'#e8e2d0'],['crowd',72,108,72,4,1.25],['crowd',6,40,72,3,1.2]],
  reclaim: [['bg','ruins'],['u','flag',8,72,1.2],['u','ifv',50,72,1.1],['u','soldier',104,72,1.45],['tr',116,55,140,62],['horde',130,156,72,2,1.4]],
  cure: [['bg','city'],['rays',80,52],['g',80,44,56],['u','vial',80,60,3.4,{c:'light'}],['crowd',4,60,72,5,1.25],['crowd',100,156,72,5,1.25]],
  hoarding: [['bg','room'],['u','crate',58,72,2.3],['u','crate',82,72,2.3],['u','flask',70,54,1.2,{c:'acc'}],['u','officer',22,72,1.6],['u','soldier',136,72,1.55,{f:1}]],
  holdout: [['bg','desert'],['u','flag',22,72,1.3],['u','officer',74,72,2],['u','soldier',48,72,1.45,{c:'#0a0d0e'}],['u','pickup',130,73,1.45]],
  distrust: [['bg','city'],['crowd',10,122,72,8,1.3],['u','syringe',122,34,1.6],['u','soldier',148,72,1.35,{f:1}]],
  waking: [['bg','ruins'],['rays',96,44],['g',96,48,46],['u','zombie',18,72,1.35,{o:.55}],['u','zombie',36,72,1.3,{o:.7}],['crowd',56,154,72,7,1.3]],
  reunion: [['bg','field'],['g',90,40,40,'sun'],['u','soldier',74,72,1.75],['u','civ',94,72,1.6,{f:1}],['u','civ',108,72,1.05,{f:1}],['u','ul',26,73,.85,{o:.8}]],
  relapse: [['bg','ruins'],['g',100,56,52,'red'],['horde',70,158,72,7,1.4],['u','soldier',20,72,1.45],['u','kneel',42,72,1.45]],
  rotation: [['bg','field'],['u','plane',92,44,1.7],['u','soldier',16,72,1.35],['u','soldier',32,72,1.35],['u','soldier',48,72,1.35],['u','soldier',134,72,1.35,{f:1}],['u','soldier',150,72,1.35,{f:1}]],
  tribunal: [['bg','room'],['rect',30,56,100,4],['u','officer',50,56,1.45],['u','officer',80,56,1.45],['u','officer',110,56,1.45,{f:1}],['u','shield',142,40,1.1]],
  // ===== field works
  w_barrier: [['bg','field'],['u','dozer',32,72,.9],['u','wall',106,72,1.05],['u','wire',150,72,.75],['horde',156,160,72,1,1.2]],
  w_firebase: [['bg','hills'],['g',105,28,9,'fire'],['u','sp',46,70,1.0],['u','sandbag',124,72,1.5],['u','kneel',118,59,1.2,{f:1}],['u','tower',152,72,1.05],['arc',106,28,162,52,10]],
  w_hospital: [['bg','field'],['g',96,52,40],['u','tent',64,72,1.6],['u','tent',118,72,1.6],['u','redx',92,48,1.5],['u','hawk',38,24,.7],['u','soldier',150,72,1.3,{f:1}],['u','civ',92,72,1.3]],
  w_depot: [['bg','farcity'],['u','crate',20,72,2],['u','crate',40,72,2],['u','crate',30,56,2],['u','drum',58,72,1.6],['u','drum',65,72,1.6],['u','tanker',106,73,1.1],['u','tent',146,72,1]],
  ato: [['bg','hills'],['g',80,30,30],['u','apache',40,38,.72],['u','hawk',118,32,.72],['u','chinook',82,56,.52,{o:.72}]],
  eng: [['bg','field'],['u','dozer',40,72,1.05],['u','sandbag',118,72,1.35],['u','soldier',146,72,1.3,{f:1}]],
  // ===== crises
  warno: [['stars',1],['bg','farcity'],['g',132,64,44,'red'],['u','mast',36,72,1.3],['waves',36,15,3],['u','officer',66,72,1.6],['u','mc',118,72,.95]],
  refugees: [['bg','city'],['u','gate',36,72,2],['crowd',72,156,72,8,1.25],['u','soldier',8,72,1.35]],
  bitten: [['stars',4],['g',124,20,16,'moon'],['bg','ruins'],['g',70,56,14,'red'],['u','kneel',70,72,2.1],['u','zombie',132,72,1.3,{o:.55}],['u','zombie',150,72,1.2,{o:.45}]],
  warlord: [['bg','desert'],['u','pickup',122,73,1.7],['u','officer',58,72,1.8],['u','soldier',30,72,1.4],['u','soldier',86,72,1.4,{f:1}]],
  airdrop: [['bg','ruins'],['g',96,36,26],['u','chute',96,66,1.1],['horde',70,150,72,5,1.3],['u','plane',30,14,.8,{o:.7}]],
  militia: [['bg','city'],['u','pickup',124,73,1.5],['u','soldier',30,72,1.45,{c:'#0a0d0e'}],['u','civ',50,72,1.5],['u','soldier',72,72,1.45,{c:'#0a0d0e'}]],
  nuke: [['bg','farcity'],['g',100,40,70,'fire'],['u','mush',100,70,1.45,{c:'#ffb347',o:.95}],['g',100,34,32,'fire'],['u','soldier',22,72,1.5],['u','soldier',42,72,1.5]],
  horde: [['bg','ruins'],['g',80,58,64,'red'],['horde',10,156,66,12,1.0],['horde',2,158,72,10,1.5]],
  helo_down: [['bg','ruins'],['g',72,62,42,'fire'],['u','hawk',74,66,1.45,{r:16}],['u','flame',66,64,1.5],['smoke',76,56,1.3],['horde',124,156,72,3,1.4]],
  press: [['bg','city'],['g',58,52,18,'moon'],['u','civ',58,72,1.7],['rect',61,49,6,4.4],['u','soldier',100,72,1.6,{f:1}],['u','ul',140,73,.8]],
  water: [['bg','field'],['u','tanker',54,73,1.45],['u','bio',124,34,1.8],['u','drum',112,72,1.6],['u','drum',122,72,1.6]],
  ship: [['stars',7],['bg','sea'],['g',86,56,34],['u','ship',86,66,1.7]],
  allied: [['bg','ruins'],['g',122,60,40,'fire'],['u','ifv',124,72,1.1,{f:1}],['u','flame',124,56,1.4],['u','soldier',28,72,1.4,{f:1}],['u','soldier',50,72,1.4,{f:1}],['u','soldier',72,72,1.4,{f:1}]],
  cult: [['stars',3],['bg','ruins'],['g',80,60,44,'fire'],['u','robe',44,72,1.7],['u','robe',68,72,1.7],['u','robe',92,72,1.7],['u','robe',116,72,1.7],['u','flame',54,45,.7],['u','flame',126,45,.7]],
  vaccine: [['bg','room'],['g',84,38,32],['u','syringe',86,38,2.3],['u','vial',30,72,2.3,{c:'light'}],['u','micro',136,72,2]],
  grid: [['stars',2],['bg','city'],['u','pylon',44,72,1.35],['u','pylon',122,72,1.35],['line',31,26,108,26,.5,'#9aa'],['line',34,35,112,35,.5,'#9aa'],['u','burst',84,26,.5]],
  looters: [['stars',5],['bg','city'],['u','crate',106,72,2],['u','crate',126,72,2],['u','crate',116,56,2],['crowd',18,90,72,5,1.35]],
  signal: [['bg','ruins'],['u','mast',104,72,1.3],['waves',104,15,3],['horde',14,70,72,3,1.3]],
  letters: [['stars',8],['g',126,20,16,'moon'],['bg','field'],['g',66,60,18,'fire'],['u','kneel',62,72,2.1],['rect',72,50,7,5,'#e8e2d0'],['u','lamp',88,60,.7]],
  reservists: [['bg','field'],['u','plane',64,50,1.9],['u','soldier',104,72,1.4,{f:1}],['u','soldier',122,72,1.4,{f:1}],['u','soldier',140,72,1.4,{f:1}]],
  smugglers: [['stars',6],['bg','city'],['g',112,60,14,'fire'],['u','tanker',94,73,1.5],['u','civ',32,72,1.5],['u','civ',148,72,1.4,{f:1}]],
  armory: [['bg','ruins'],['u','lab',88,72,1.4],['u','star',88,48,.7,{c:'acc'}],['horde',10,40,72,3,1.3,1],['horde',134,156,72,2,1.3]],
  hospital: [['bg','ruins'],['u','hosp',80,72,1.6],['horde',10,40,72,3,1.3,1],['horde',122,154,72,3,1.3]],
  cold_front: [['bg','snow'],['snow'],['u','ifv',60,72,1.4],['u','soldier',118,72,1.45],['u','soldier',138,72,1.45]],
  heat: [['bg','desert'],['g',112,28,46,'sun'],['u','soldier',36,72,1.6],['u','soldier',60,72,1.6],['u','ifv',126,73,1.0]],
  defector: [['stars',3],['bg','field'],['u','fence',102,72,1.3],['u','tower',142,72,1.45],['beam',149,44,170,70,18],['u','cheer',54,72,1.6,{c:'#05080a'}]],
  drones: [['bg','field'],['u','quad',54,26,1.4],['u','quad',86,20,1.1],['u','quad',118,28,1.25],['tr',54,28,70,62],['u','truck',80,73,1.3],['u','burst',72,62,.7],['smoke',76,58,.8]],
  sabotage: [['bg','ruins'],['g',76,62,42,'fire'],['u','truck',74,73,1.35,{r:-6}],['u','flame',72,58,1.5],['smoke',80,52,1.1],['u','gear',134,26,1.1,{o:.55}]],
  outbreak_ranks: [['bg','field'],['g',84,54,52,'red'],['u','tent',132,72,1.6],['u','soldier',28,72,1.5],['u','soldier',50,72,1.5],['u','zombie',90,72,1.6],['u','bio',86,24,1.4]],
  lab_siege: [['bg','farcity'],['u','lab',80,72,1.6],['horde',4,30,72,3,1.25,1],['horde',130,156,72,3,1.25],['u','hawk',124,34,.75]],
  mutiny: [['stars',6],['bg','field'],['g',80,64,26,'fire'],['u','flame',80,72,1.1],['u','kneel',54,72,1.5],['u','kneel',106,72,1.5,{f:1}],['u','soldier',28,72,1.45]],
  inquiry: [['bg','room'],['rect',30,56,100,4],['u','officer',48,56,1.4],['u','officer',80,56,1.4],['u','officer',112,56,1.4,{f:1}],['u','star',80,30,1,{c:'acc'}]],
  mutation: [['bg','room'],['g',76,40,42,'red'],['u','dna',76,66,2.0],['u','zombie',132,72,1.75],['u','bio',28,32,1.5]],
};
const FALLBACK = { CURE:'cure_convoy', COMBAT:'clear_hold', FIRES:'fire_mission', AIR:'apache', INTEL:'uas_recon', RESEARCH:'samples', MEDICAL:'aid_station', LOGISTICS:'convoy', CIVIL:'evac', COMMAND:'intent' };

function svg(key, kind, cls, big) {
  const k = PAL[kind] ? kind : 'COMMAND';
  const items = SC[key] || SC[FALLBACK[k]];
  const vb = big ? '0 0 160 78' : '0 0 160 86', par = big ? 'xMidYMax slice' : 'xMidYMid slice';
  let s = `<svg class="art ${cls || ''}" viewBox="${vb}" preserveAspectRatio="${par}" aria-hidden="true" focusable="false" style="--acc:${PAL[k].acc}"><rect width="160" height="86" fill="url(#sky-${k})"/>`;
  for (const it of items) s += item(it, k);
  return s + (big ? '' : `<rect width="160" height="86" fill="url(#dither)"/><rect width="160" height="86" fill="url(#scan)"/>`) + `<rect width="160" height="86" fill="url(#vig)"/></svg>`;
}
return { sprite, svg, PAL, has: key => !!SC[key], keys: () => Object.keys(SC) };
})();
