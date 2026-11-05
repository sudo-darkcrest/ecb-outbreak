/* ECB: OUTBREAK — game engine (pure logic, no DOM) */
'use strict';
const ECB = (function () {

// ---------------------------------------------------------------- static data
const START_POP = 8146;
const NOMINAL = { hq:150, bn1:650, bn2:650, bn3:650, art:420, ad:360, avn:380, avsec:260, trans:420, sup:860 };
const NOMINAL_TOTAL = 4800;
const UNITS = {
  hq:   { name:'Brigade HQ',            sub:'MCV-C command posts' },
  bn1:  { name:'1st Maneuver Bn',       sub:'MCV-M/I · 3 rifle cos + 4th Support Co' },
  bn2:  { name:'2nd Maneuver Bn',       sub:'MCV-M/I · 3 rifle cos + 4th Support Co' },
  bn3:  { name:'3rd Maneuver Bn',       sub:'MCV-M/I · 3 rifle cos + 4th Support Co' },
  art:  { name:'Artillery Bn',          sub:'MCV-H/155 self-propelled guns' },
  ad:   { name:'Air Defense Bn',        sub:'MCV-M/A point defense' },
  avn:  { name:'Aviation Group',        sub:'Helicopters + UAS Squadron' },
  avsec:{ name:'Aviation Security Co',  sub:'MCV-UL · Air assault QRF' },
  trans:{ name:'Transportation Group',  sub:'Cargo, fuel & armored transport' },
  sup:  { name:'Brigade Support',       sub:'Support companies' },
};
const ENABLERS = { med:'Medical', maint:'Maintenance', intel:'Intelligence', comms:'Signal', ew:'Electronic Warfare', cbrn:'CBRN', eod:'EOD', mp:'Military Police' };

const REGIONS = [
  { id:'CAN', name:'Canada & Greenland',       pop:41,   wealth:.90, dens:.60, clim:'cold',      hub:.5, base:false, a:[262,80] },
  { id:'USW', name:'US West',                  pop:85,   wealth:.95, dens:.90, clim:'temperate', hub:.8, base:true,  a:[213,128] },
  { id:'USE', name:'US East',                  pop:255,  wealth:.95, dens:1.1, clim:'temperate', hub:1,  base:true,  a:[272,134], lab:'Fort Detrick BSL-4' },
  { id:'MEX', name:'Central America', pop:184,  wealth:.50, dens:1.0, clim:'hot',       hub:.5, base:false, a:[226,186] },
  { id:'CAR', name:'Caribbean',                pop:43,   wealth:.40, dens:1.0, clim:'hot',       hub:.4, base:false, a:[285,190] },
  { id:'SAN', name:'Andean North',             pop:146,  wealth:.45, dens:.90, clim:'hot',       hub:.4, base:false, a:[302,262] },
  { id:'BRA', name:'Brazil',                   pop:212,  wealth:.55, dens:1.1, clim:'hot',       hub:.6, base:false, a:[354,292] },
  { id:'SCO', name:'Southern Cone',            pop:76,   wealth:.60, dens:.90, clim:'temperate', hub:.4, base:false, a:[326,368] },
  { id:'WEU', name:'Western Europe',           pop:241,  wealth:.95, dens:1.1, clim:'temperate', hub:1,  base:true,  a:[498,117], lab:'Porton Down' },
  { id:'CEU', name:'Central Europe',           pop:162,  wealth:.85, dens:1.0, clim:'temperate', hub:.8, base:true,  a:[537,96] },
  { id:'SEU', name:'Mediterranean & Balkans',  pop:111,  wealth:.70, dens:1.0, clim:'temperate', hub:.7, base:false, a:[559,118] },
  { id:'NOR', name:'Nordic & Baltic',          pop:34,   wealth:.95, dens:.60, clim:'cold',      hub:.5, base:false, a:[541,57] },
  { id:'EEU', name:'Eastern Europe',           pop:49,   wealth:.50, dens:.80, clim:'cold',      hub:.3, base:false, a:[575,96] },
  { id:'RUS', name:'Western Russia',           pop:110,  wealth:.60, dens:1.0, clim:'cold',      hub:.6, base:false, a:[604,76] },
  { id:'SIB', name:'Siberia & Far East',       pop:34,   wealth:.50, dens:.40, clim:'cold',      hub:.2, base:false, a:[756,62], lab:'VECTOR Koltsovo' },
  { id:'MDE', name:'Middle East',              pop:396,  wealth:.60, dens:1.1, clim:'hot',       hub:.9, base:true,  a:[626,163] },
  { id:'NAF', name:'North Africa',             pop:222,  wealth:.45, dens:1.1, clim:'hot',       hub:.5, base:false, a:[528,168] },
  { id:'WAF', name:'West Africa',              pop:457,  wealth:.30, dens:1.2, clim:'hot',       hub:.4, base:false, a:[497,211] },
  { id:'CAF', name:'Central Africa',           pop:179,  wealth:.20, dens:.90, clim:'hot',       hub:.2, base:false, a:[556,247] },
  { id:'EAF', name:'East Africa',              pop:423,  wealth:.30, dens:1.0, clim:'hot',       hub:.4, base:false, a:[598,235] },
  { id:'SAF', name:'Southern Africa',          pop:240,  wealth:.45, dens:.90, clim:'temperate', hub:.4, base:false, a:[568,322] },
  { id:'CAS', name:'Central Asia',             pop:129,  wealth:.40, dens:.60, clim:'cold',      hub:.3, base:false, a:[668,115] },
  { id:'SAS', name:'South Asia',               pop:1943, wealth:.40, dens:1.4, clim:'hot',       hub:.8, base:false, a:[713,180], lab:'NIV Pune' },
  { id:'CHN', name:'China',                    pop:1408, wealth:.65, dens:1.3, clim:'temperate', hub:1,  base:false, a:[772,141] },
  { id:'EAS', name:'Japan, Korea & Taiwan',    pop:224,  wealth:.95, dens:1.3, clim:'temperate', hub:.9, base:true,  a:[861,142], lab:'NIID Tokyo' },
  { id:'SEA', name:'Southeast Asia',           pop:295,  wealth:.50, dens:1.2, clim:'hot',       hub:.7, base:false, a:[780,205] },
  { id:'IDN', name:'Indonesia & Philippines',  pop:402,  wealth:.45, dens:1.2, clim:'hot',       hub:.6, base:false, a:[822,258] },
  { id:'AUS', name:'Australia & Oceania',      pop:45,   wealth:.90, dens:.60, clim:'temperate', hub:.6, base:true,  a:[866,342], lab:'Doherty Institute' },
];
const RD = {}; REGIONS.forEach(r => RD[r.id] = r);
// hemisphere for seasons (T = tropical, no winter)
const HEMI = { CAN:'N',USW:'N',USE:'N',MEX:'N',CAR:'T',SAN:'T',BRA:'S',SCO:'S',WEU:'N',CEU:'N',SEU:'N',NOR:'N',EEU:'N',RUS:'N',SIB:'N',MDE:'N',NAF:'N',WAF:'T',CAF:'T',EAF:'T',SAF:'S',CAS:'N',SAS:'T',CHN:'N',EAS:'N',SEA:'T',IDN:'T',AUS:'S' };
// strategic chokepoints: if the region falls, every resupply shrinks
const CHOKE = { MEX:'Panama Canal', NAF:'Suez Canal', SEA:'Strait of Malacca', MDE:'Strait of Hormuz', SEU:'Bosporus' };
const CHOKE_LOSS = .12;
const DOCTRINES = {
  fires:     { name:'Combined Arms Fires',     text:'Fires cards are 25% stronger.' },
  shock:     { name:'Shock Action',            text:'Combat cards are 15% stronger.' },
  airmobile: { name:'Air Mobility',            text:'Moving the brigade or a Task Force costs 1 Command Point less and 4 less fuel.' },
  logistics: { name:'Expeditionary Logistics', text:'Weekly resupply is 25% bigger.' },
  hearts:    { name:'Hearts and Minds',        text:'+3 civil order a week where the brigade operates. Rescues and evacuations save 25% more.' },
  cbrn:      { name:'CBRN Discipline',         text:'Exposure builds 25% slower.' },
  night:     { name:'Night Fighting',          text:'Brigade casualties are 15% lower.' },
  drill:     { name:'Battle Drill',            text:'Draw 6 cards a week instead of 5.' },
  staff:     { name:'Staff Excellence',        text:'+1 Command Point every week while Morale is 60 or higher.' },
  fieldmed:  { name:'Field Medicine',          text:'Maneuver battalions regain 3% strength every week.' },
  infoops:   { name:'Information Operations',  text:'+1 Command Trust a week. Trust losses are 25% smaller.' },
  forage:    { name:'Living Off the Land',     text:'+4 Supply and +3 Fuel every week.' },
  qm:        { name:'Quartermaster Corps',     text:'Supply, Ammo and Fuel stock up to 130. Med up to 65.' },
  rotary:    { name:'Rotary-Wing Doctrine',    text:'Air cards are 25% stronger. One lost helicopter is replaced now.' },
  science:   { name:'Science Liaison',         text:'Labs work 12% faster. After the cure, +3% cure coverage a week where the brigade operates.' },
  cadre:     { name:'Veteran Cadre',           text:'Battalions gain experience 50% faster.' },
  mission:   { name:'Mission Command',         text:'Task Forces are 50% more effective and cost no upkeep.' },
};
const BOARD_EVERY = 6;
const RANKS = [ { name:'Green', xp:0, kill:1, cas:1 }, { name:'Blooded', xp:25, kill:1.06, cas:.95 }, { name:'Veteran', xp:70, kill:1.12, cas:.88 }, { name:'Elite', xp:150, kill:1.2, cas:.8 } ];
const TRAITS = {
  aggressive: { name:'Aggressive',   text:'+10% kills, +10% casualties', kill:1.1, cas:1.1 },
  cautious:   { name:'Cautious',     text:'−15% casualties, −5% kills', kill:.95, cas:.85 },
  inspiring:  { name:'Inspiring',    text:'+1 Morale a week', morale:1 },
  tactician:  { name:'Tactician',    text:'+8% kills', kill:1.08 },
  lifesaver:  { name:'Lifesaver',    text:'Battalion regains 1.5% strength a week', regen:.015 },
  recon:      { name:'Recon-minded', text:'+4% kills, −10% exposure in the field', kill:1.04, expo:.9 },
  stubborn:   { name:'Stubborn',     text:'−10% casualties, +5% containment', cas:.9, contain:.05 },
  resourceful:{ name:'Resourceful',  text:'+2 Supply a week', supply:2 },
};
const CDR_FIRST = ['Mike','Dave','Chris','Jim','Tyler','Ben','Rob','Matt','Dan','Greg','Kevin','Josh','Ryan','Brian','Steve','Jake','Travis','Cole','Luis','Andre','Kyle','Nate','Bill','Scott','Sarah','Jen','Katie'];
const CDR_LAST = ['Sullivan','Kowalski','Patterson','Brooks','Carter','Hendricks','Russo','Whitaker','Holloway','Walsh','Callahan','Morales','Jennings','McAllister','Turner','Hayes','Reed','Bishop','Parker','Garcia','Coleman','Rhodes','Maddox','Fletcher','Lawson','Tate','Murphy','Kincaid'];
const BNS = ['bn1','bn2','bn3'];
const TF_RANGE = 5;

// [a, b, type L=land S=sea A=air, weight]
const LINKS = [
  ['CAN','USW','L',1],['CAN','USE','L',1],['USW','USE','L',1],['USW','MEX','L',1],['USE','MEX','L',.8],['MEX','SAN','L',.4],
  ['SAN','BRA','L',1],['SAN','SCO','L',.8],['BRA','SCO','L',1],
  ['WEU','CEU','L',1],['WEU','SEU','L',.8],['CEU','SEU','L',.8],['CEU','NOR','L',.6],['CEU','EEU','L',1],['SEU','EEU','L',.6],
  ['NOR','EEU','L',.6],['NOR','RUS','L',.6],['EEU','RUS','L',1],['SEU','MDE','L',.8],['RUS','SIB','L',.6],['RUS','CAS','L',.8],
  ['RUS','MDE','L',.5],['SIB','CAS','L',.4],['SIB','CHN','L',.5],['SIB','EAS','L',.2],['MDE','CAS','L',.6],['MDE','SAS','L',.6],
  ['MDE','NAF','L',.7],['NAF','WAF','L',.7],['NAF','CAF','L',.4],['NAF','EAF','L',.7],['WAF','CAF','L',1],['CAF','EAF','L',.8],
  ['CAF','SAF','L',.9],['EAF','SAF','L',.8],['CAS','SAS','L',.5],['CAS','CHN','L',.5],['SAS','CHN','L',.5],['SAS','SEA','L',.6],
  ['CHN','SEA','L',1],['CHN','EAS','L',.4],['SEA','IDN','L',.5],['IDN','AUS','L',.3],
  ['USE','CAR','S',1],['MEX','CAR','S',1],['SAN','CAR','S',.8],['WEU','NAF','S',.8],['SEU','NAF','S',.8],['WEU','NOR','S',.6],
  ['MDE','EAF','S',.8],['USW','SIB','S',.2],['EAS','SEA','S',.6],
  ['USE','WEU','A',1],['USW','EAS','A',1],['USW','CHN','A',.8],['USE','BRA','A',.6],['WEU','MDE','A',.8],['WEU','WAF','A',.6],
  ['WEU','SAS','A',.6],['MDE','SAS','A',.8],['WEU','CHN','A',.7],['RUS','CHN','A',.5],['WEU','SAF','A',.5],['CEU','USE','A',.6],
  ['SAS','SEA','A',.7],['IDN','CHN','A',.6],['AUS','SEA','A',.8],['AUS','USW','A',.5],['EAS','CHN','A',.9],['USE','EAS','A',.6],
];
const ADJ = {}; REGIONS.forEach(r => ADJ[r.id] = []);
LINKS.forEach(([a,b,t,w]) => { ADJ[a].push({ to:b, t, w }); ADJ[b].push({ to:a, t, w }); });

const DIFFS = {
  recruit:   { name:'Recruit',   inf:.88, res:1.2, sup:1.25, mult:.8,  pz:1 },
  veteran:   { name:'Veteran',   inf:1.0,   res:.9,  sup:1,    mult:1,   pz:1 },
  nightmare: { name:'Nightmare', inf:1.05, res:.88, sup:.85,   mult:1.5, pz:2 },
};

const COMMANDERS = [
  { id:'mech', name:'Col. Jack Harlan', title:'Armored Fist', blurb:'Mechanized doctrine. Maneuver and fires cards hit 15% harder.', extra:['mech_sweep','hw_platoon'] },
  { id:'avn',  name:'Col. Wyatt Dawson', title:'Sky Cavalry',   blurb:'Aviation doctrine. Starts with +1 attack and +1 multirole helicopter and extra fuel.', extra:['apache','medevac'] },
  { id:'civ',  name:'Col. Sarah Whitfield', title:'Shepherd',   blurb:'Civil-military doctrine. +15 Command Trust, evacuations save 30% more lives, and troops gain morale every week.', extra:['safe_zone','refugee_camp'] },
  { id:'cbrn', name:'Col. Tom Brennan', title:'Containment', blurb:'CBRN and science liaison. Exposure builds 30% slower. Starts with decon and prophylaxis orders.', extra:['decon','prophylaxis'] },
  { id:'hard', name:'Lt. Gen. Frank Garrison', title:'Hardliner',  blurb:'+1 Command Point every week, but Trust gains are cut by a quarter. Starts with the brutal options.', extra:['thermobaric','firebreak'], unlock:'Survive 20 weeks in any run' },
];
const CMD = {}; COMMANDERS.forEach(c => CMD[c.id] = c);
const STAGING = ['USE','USW','WEU','EAS','AUS','MDE'];
const PZ_CANDIDATES = ['WAF','CAF','EAF','SEA','SAN','BRA','SAS','CHN','MEX','IDN','CAS','NAF','MDE'];

const MUTATIONS = [
  { id:'sprint',  name:'Sprinters',          text:'The infected now run. Brigade casualties rise.',            fx:p => { p.aggr += .3; } },
  { id:'aero',    name:'Aerosol Shedding',   text:'Transmits without bites at close range. Faster local spread.', fx:p => { p.inf += .12; } },
  { id:'cold',    name:'Cold-Adapted',       text:'Cold climates no longer slow the infected.',                fx:p => { p.coldTol = 1; } },
  { id:'hard',    name:'Hardened Tissue',    text:'Ossified tissue. The infected take more to put down.',      fx:p => { p.resil += .2; } },
  { id:'carrier', name:'Silent Carriers',    text:'Symptom-free carriers slip past screening. Jumps regions more easily.', fx:p => { p.spread += .35; } },
  { id:'swarm',   name:'Swarm Behavior',     text:'Infected mass into hordes and press defenses together.',    fx:p => { p.aggr += .15; p.inf += .05; } },
];

// ---------------------------------------------------------------- rng
function hashSeed(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; }
function rnd(s) { s.rng = (s.rng + 0x6D2B79F5) | 0; let t = s.rng; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function rint(s, a, b) { return a + Math.floor(rnd(s) * (b - a + 1)); }
function pick(s, arr) { return arr[Math.floor(rnd(s) * arr.length)]; }
function shuffle(s, arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------- helpers
function hops(from, to, maxH = 6) {
  if (from === to) return 0;
  const seen = { [from]: 0 }; let q = [from];
  while (q.length) { const nq = []; for (const c of q) for (const e of ADJ[c]) if (seen[e.to] === undefined) { seen[e.to] = seen[c] + 1; if (e.to === to) return seen[e.to]; nq.push(e.to); } q = nq; if (seen[q[0]] > maxH) break; }
  return 99;
}
function neighbors(id) { return [...new Set(ADJ[id].map(e => e.to))]; }
const T = s => s.regions[s.b.loc];          // theater region state
const TD = s => RD[s.b.loc];                // theater static data
const hasD = (s, id) => !!(s.doct && s.doct.includes(id));
const tfBn = s => s.b.tf ? s.b.tf.bn : null;
const mainBns = s => BNS.filter(k => k !== tfBn(s));
// combat strength of the main body (a detached Task Force battalion doesn't count)
const man = s => mainBns(s).reduce((a, k) => a + s.b.u[k], 0) / 3;
const allMan = s => (s.b.u.bn1 + s.b.u.bn2 + s.b.u.bn3) / 3;
const rankIdx = xp => RANKS.reduce((a, r, i) => xp >= r.xp ? i : a, 0);
const vetOf = (s, k) => (s.b.vet && s.b.vet[k]) || { xp:0, cdr:{ name:'', trait:'tactician' } };
const traitOf = (s, k) => TRAITS[vetOf(s, k).cdr.trait] || {};
function vetKillOne(s, k) { return RANKS[rankIdx(vetOf(s, k).xp)].kill * (traitOf(s, k).kill || 1); }
function vetKill(s, keys) { keys = keys || mainBns(s); if (!keys.length) return 1; return keys.reduce((a, k) => a + vetKillOne(s, k), 0) / keys.length; }
function vetCas(s, k) { if (!BNS.includes(k)) return 1; return RANKS[rankIdx(vetOf(s, k).xp)].cas * (traitOf(s, k).cas || 1); }
function newCdr(s) { return { name:`Lt. Col. ${pick(s, CDR_FIRST)} ${pick(s, CDR_LAST)}`, trait:pick(s, Object.keys(TRAITS)) }; }
function gainXP(s, keys, amt, rep) {
  for (const k of keys) {
    const v = s.b.vet[k]; const before = rankIdx(v.xp); v.xp += amt * (hasD(s, 'cadre') ? 1.5 : 1); const after = rankIdx(v.xp);
    if (after > before) { const t = `${UNITS[k].name} is now ${RANKS[after].name.toUpperCase()} (${v.cdr.name}).`; if (rep) rep.items.push({ k:'good', t }); else s.log.push(t); add(s,'morale',2); }
  }
}
function monthOf(turn) { return new Date(Date.UTC(2027, 3, 12) + (turn - 1) * 7 * 864e5).getUTCMonth(); }
function seasonOf(hemi, m) { if (hemi === 'T') return 'tropical'; if (hemi === 'S') m = (m + 6) % 12; return m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn'; }
function seasonMult(s, rid) { const se = seasonOf(HEMI[rid], monthOf(s.turn)); const rd = RD[rid]; if (se === 'winter') return rd.clim === 'cold' ? .62 + .38 * s.path.coldTol : .86; if (se === 'summer') return 1.06; return 1; }
const chokesLost = s => Object.keys(CHOKE).filter(id => s.regions[id].fallen);
function eff(s) { const b = s.b; return (0.55 + b.morale / 220) * (b.ammo > 0 ? 1 : 0.4) * (b.supply > 0 ? 1 : 0.7); }
function scale(id) { return clamp(Math.pow(200 / RD[id].pop, 0.35), 0.45, 1.6); }
function personnel(s) { let p = 0; for (const k in NOMINAL) p += NOMINAL[k] * s.b.u[k]; return Math.round(p); }
function survivors(s) { let h = 0; for (const r of REGIONS) h += s.regions[r.id].h * r.pop; return h; }
function infected(s) { let z = 0; for (const r of REGIONS) z += s.regions[r.id].z * r.pop; return z; }
function dead(s) { let d = 0; for (const r of REGIONS) d += s.regions[r.id].d * r.pop; return d; }
function fallenCount(s) { return REGIONS.filter(r => s.regions[r.id].fallen).length; }
function worldFactor(s) { const sf = survivors(s) / START_POP; return clamp(Math.pow(sf, 1.5) * (1 - fallenCount(s) / REGIONS.length * 0.8), 0.2, 1); }
function activeLabs(s) { return s.labs.filter(l => l.active); }
function labIn(s, id) { return s.labs.find(l => l.active && l.region === id); }
const RESTORE_WEEKS = 20;
const RESTORE_REQ = { z:.005, order:50, vax:.5 };
function restoreReady(rs) { return !rs.fallen && rs.z < RESTORE_REQ.z && rs.order >= RESTORE_REQ.order && (rs.vax || 0) >= RESTORE_REQ.vax; }
function restoredCount(s) { return REGIONS.filter(r => s.regions[r.id].restored).length; }
function avgVax(s) { let v = 0, p = 0; for (const r of REGIONS) { v += (s.regions[r.id].vax || 0) * r.pop; p += r.pop; } return v / p; }
function status(rs) {
  if (rs.restored) return 'Restored';
  if (rs.fallen) return 'Fallen';
  if (rs.z <= 0) return 'Clear';
  if (rs.z < 0.002) return 'Contained';
  if (rs.z < 0.02) return 'Outbreak';
  if (rs.z < 0.1) return 'Epidemic';
  return 'Collapsing';
}
function caps(s) { const q = hasD(s, 'qm'); return { supply:q ? 130 : 100, ammo:q ? 130 : 100, fuel:q ? 130 : 100, med:q ? 65 : 50, morale:100, exposure:100, trust:100 }; }
function add(s, k, v) {
  const b = s.b; const cp = caps(s);
  if (k === 'trust' && v > 0 && s.cmd === 'hard') v = Math.ceil(v * .75);
  if (k === 'trust' && v < 0 && hasD(s, 'infoops')) v = v * .75;
  if (k === 'exposure' && v > 0 && hasD(s, 'cbrn')) v = v * .75;
  b[k] = clamp((b[k] || 0) + v, 0, cp[k] ?? 999);
}
function weakestBns(s, n) { return mainBns(s).sort((a, c) => s.b.u[a] - s.b.u[c]).slice(0, n); }
function heal(s, keys, amt) { for (const k of keys) s.b.u[k] = clamp(s.b.u[k] + amt, 0, 1); }
function cas(s, frac, keys) {
  const b = s.b; keys = keys || [pick(s, mainBns(s))];
  keys = keys.filter(k => k !== tfBn(s) || keys.length === 1);
  let mult = (b.en.med ? 0.8 : 1) * (1 - b.fort) * (hasD(s, 'night') ? .85 : 1);
  let tot = 0; for (const k of keys) { const loss = Math.min(b.u[k], frac * mult * vetCas(s, k)); b.u[k] -= loss; tot += loss * NOMINAL[k]; }
  s.stats.kia += Math.round(tot); return Math.round(tot);
}
function cmdKill(s, type) {
  let m = (s.cmd === 'mech' && (type === 'COMBAT' || type === 'FIRES')) ? 1.15 : 1;
  if (type === 'FIRES' && hasD(s, 'fires')) m *= 1.25;
  if (type === 'COMBAT' && hasD(s, 'shock')) m *= 1.15;
  if (type === 'AIR' && hasD(s, 'rotary')) m *= 1.25;
  if (type === 'COMBAT' || type === 'FIRES') m *= vetKill(s);
  return m;
}
// fraction of infected removed by an action in the theater
function kp(s, base, str, type, boost = true) {
  let f = base * str * eff(s) * scale(s.b.loc) * cmdKill(s, type) * (boost ? 1 + s.b.boost : 1);
  return clamp(f, 0, 0.6);
}
function doKill(s, f, rid) {
  const rs = s.regions[rid || s.b.loc]; const P = RD[rid || s.b.loc].pop;
  const k = rs.z * f; rs.z -= k; rs.d += k; s.stats.kills += k * P; return k * P;
}
function save(s, frac, rid) {
  rid = rid || s.b.loc; const rs = s.regions[rid];
  if (s.cmd === 'civ') frac *= 1.3;
  if (hasD(s, 'hearts')) frac *= 1.25;
  frac *= scale(rid);
  const exposed = Math.max(0, rs.h - rs.safe); const amt = exposed * clamp(frac, 0, 0.5);
  rs.safe += amt; const m = amt * RD[rid].pop; s.stats.saved += m; return m;
}
// civilian casualties in millions of people, capped at half the unprotected population
function civLoss(s, people) { const rs = T(s); const P = TD(s).pop; const l = Math.min(Math.max(0, rs.h - rs.safe) * .5, people / P); rs.h -= l; rs.d += l; s.stats.civLost = (s.stats.civLost || 0) + l * P; return l * P; }
// estimated number of infected removed by a kill fraction, as text
const est = (s, f) => M(T(s).z * TD(s).pop * f);
const ART_COLLATERAL = .1, THERMO_COLLATERAL = .5;
function contain(s, v, rid) { const rs = s.regions[rid || s.b.loc]; rs.contain = clamp(rs.contain + v, 0, 0.85); }
// Containment now lasts: it builds up week after week and fades slowly, faster once your troops leave.
// A region that reaches the STAB thresholds is Stabilized and holds on its own for a while.
const STAB = { contain:.5, quar:.35, z:.03, weeks:6, lose:.06, floor:.4 };
const presentIn = (s, id) => s.b.loc === id || !!(s.b.tf && s.b.tf.loc === id);
const canStabilize = rs => !rs.fallen && rs.contain >= STAB.contain && rs.quar >= STAB.quar && rs.z < STAB.z;
function settleControl(s, rep) {
  rep.stab = [];
  for (const r of REGIONS) { const rs = s.regions[r.id]; const here = presentIn(s, r.id); rs.stab = rs.stab || 0;
    if (rs.fallen) { if (rs.stab) { rs.stab = 0; rep.items.push({ k:'bad', t:`${r.name} fell. It is no longer stable.` }); } rs.contain *= .5; continue; }
    if (rs.stab > 0 && rs.z >= STAB.lose) { rs.stab = 0; rep.items.push({ k:'bad', t:`${r.name}: the infection broke through. The region is no longer stable.` }); }
    else if (!rs.stab && canStabilize(rs)) {
      rs.stab = STAB.weeks; rep.stab.push(r.id); s.stats.stabilized = (s.stats.stabilized || 0) + 1;
      const first = !rs.stabbed; rs.stabbed = true; if (first) { add(s,'trust',3); add(s,'morale',2); }
      rep.items.push({ k:'good', t:`${r.name} is stabilized. Local forces can hold it for about ${STAB.weeks} weeks after you leave.${first ? ' Trust +3, Morale +2.' : ''}` });
    } else if (rs.stab > 0) {
      if (here) rs.stab = STAB.weeks;
      else if (--rs.stab === 0) rep.items.push({ k:'info', t:`${r.name}: local forces are worn out. It is no longer stable and needs your troops again.` });
    }
    if (rs.stab > 0) rs.order = Math.min(100, rs.order + 2);
    const keep = here ? .78 : rs.stab > 0 ? .96 : .82;
    rs.contain = clamp(rs.contain * keep - rs.z * .3, rs.stab > 0 ? STAB.floor : 0, .85);
  }
}
const M = v => v >= 1000 ? (v / 1000).toFixed(2) + 'B' : v >= 1 ? v.toFixed(1) + 'M' : v >= .001 ? Math.round(v * 1000) + 'K' : v > 0 ? Math.max(1, Math.round(v * 1e6)).toLocaleString('en-US') : '0';
const pc = f => Math.round(f * 100) + '%';
function supplyFlow(s) {
  const b = s.b; const rs = T(s); const rd = TD(s);
  const access = rd.base && !rs.fallen ? 1 : 0.55 + 0.45 * rs.order / 100;
  return worldFactor(s) * (0.5 + b.trust / 200) * (0.4 + 0.6 * b.u.trans) * access * DIFFS[s.diff].sup * (1 - CHOKE_LOSS * chokesLost(s).length) * (hasD(s, 'logistics') ? 1.25 : 1);
}

// ---------------------------------------------------------------- cards
// text(s) returns html-ish string; play(s) returns log line; req(s) returns true or reason string
const CARDS = {};
function card(def) { CARDS[def.id] = Object.assign({ cost:1, res:{}, rarity:'common', req:() => true }, def); }
const reqUAS = s => s.b.uas > 0.15 || 'UAS squadron destroyed';
const reqMulti = s => s.b.helo.multi > 0 || 'No multirole helicopters left';
const reqInfect = s => T(s).z > 0.0005 || 'No infected in theater';

// --- starter
card({ id:'clear_hold', name:'Clear and Hold', type:'COMBAT', cost:1, res:{ ammo:6 }, rarity:'starter', unit:'Maneuver Bns · MCV-M/I',
  text:s => `Rifle companies sweep the sector. Kill <b>${pc(kp(s,.12,man(s),'COMBAT'))}</b> (about ${est(s,kp(s,.12,man(s),'COMBAT'))}) of infected in theater. Containment +10%.`,
  play:s => { const k = doKill(s, kp(s,.12,man(s),'COMBAT')); contain(s,.10); s.b.boost = 0; const c = cas(s, .004 + T(s).z * .03); return `Clear and Hold destroyed ${M(k)} infected. ${c} casualties.`; } });
card({ id:'fire_mission', name:'Fire Mission: 155mm', type:'FIRES', cost:1, res:{ ammo:10 }, rarity:'starter', unit:'Artillery Bn · MCV-H/155',
  text:s => { const f = kp(s,.16,s.b.u.art,'FIRES'); return `Massed 155mm fires. Kill <b>${pc(f)}</b> here (about <b>${est(s,f)}</b>). About ${M(T(s).z * TD(s).pop * f * ART_COLLATERAL)} civilians hit. Order −2.`; },
  play:s => { const k = doKill(s, kp(s,.16,s.b.u.art,'FIRES')); s.b.boost = 0; const cl = civLoss(s, k * ART_COLLATERAL); T(s).order = Math.max(0, T(s).order - 2); return `155mm fires destroyed ${M(k)} infected. ${M(cl)} civilians were caught in the blasts.`; } });
card({ id:'uas_recon', name:'UAS Recon', type:'INTEL', cost:0, rarity:'starter', unit:'UAS Squadron · Tier 1', req:reqUAS,
  text:s => `Draw 2 cards. Your next Combat, Fires or Air card this week is <b>+30%</b> stronger.`,
  play:s => { s.b.boost = Math.max(s.b.boost, .3); draw(s,2); return 'UAS recon drew 2 cards and marked targets.'; } });
card({ id:'convoy', name:'Armored Convoy', type:'LOGISTICS', cost:1, res:{ fuel:4 }, rarity:'starter', unit:'Transportation Group',
  text:s => { const f = clamp(supplyFlow(s)*1.6,.5,1.4); return `Push a protected convoy forward. +${Math.round(18*f)} Supply, +${Math.round(12*f)} Ammo, +${Math.round(4*f)} Med.`; },
  play:s => { const f = clamp(supplyFlow(s)*1.6,.5,1.4); add(s,'supply',Math.round(18*f)); add(s,'ammo',Math.round(12*f)); add(s,'med',Math.round(4*f)); return 'Armored convoy arrived with supplies.'; } });
card({ id:'aid_station', name:'Battalion Aid Station', type:'MEDICAL', cost:1, res:{ med:5 }, rarity:'starter', unit:'Medical',
  text:s => `Wounded return to duty. +6% strength to your two weakest maneuver battalions. Morale +3.`,
  play:s => { heal(s, weakestBns(s,2), .06); add(s,'morale',3); return 'Aid station returned wounded to duty.'; } });
card({ id:'evac', name:'Evacuate Civilians', type:'CIVIL', cost:2, res:{ fuel:6 }, rarity:'starter', unit:'Transportation Group + Maneuver Bns',
  text:s => `Move civilians to secured camps. Saves about <b>${M(Math.max(0,T(s).h-T(s).safe)*clamp(.03*scale(s.b.loc)*(s.cmd==='civ'?1.3:1),0,.5)*TD(s).pop)}</b>. Trust +2, Morale +3.`,
  play:s => { const m = save(s,.03); add(s,'trust',2); add(s,'morale',3); return `Evacuated ${M(m)} civilians to secured camps.`; } });
card({ id:'checkpoint', name:'Checkpoint Screening', type:'CIVIL', cost:1, rarity:'starter', unit:'Military Police + CBRN',
  text:s => `Screen traffic out of the region. Quarantine +15%. Exposure −8.`,
  play:s => { T(s).quar = clamp(T(s).quar + .15, 0, .95); add(s,'exposure',-8); return 'Checkpoints tightened the quarantine.'; } });
card({ id:'dig_in', name:'Fortify Position', type:'COMBAT', cost:1, res:{ supply:5 }, rarity:'starter', unit:'Engineer Platoons',
  text:s => `Berms, wire and fighting positions. Casualties −40% for 2 weeks. Containment +10%.`,
  play:s => { s.b.fort = Math.max(s.b.fort, .4); s.b.fortT = 2; contain(s,.10); return 'Engineers fortified the brigade positions.'; } });

// --- combat
card({ id:'mech_sweep', name:'Mechanized Sweep', type:'COMBAT', cost:2, res:{ ammo:12, fuel:6 }, unit:'Maneuver Bns · MCV-M/I',
  text:s => `A battalion-sized armored sweep. Kill <b>${pc(kp(s,.22,man(s),'COMBAT'))}</b> (about ${est(s,kp(s,.22,man(s),'COMBAT'))}) of infected in theater.`,
  play:s => { const k = doKill(s, kp(s,.22,man(s),'COMBAT')); s.b.boost = 0; const c = cas(s, .006 + T(s).z * .04); return `Mechanized sweep destroyed ${M(k)} infected. ${c} casualties.`; } });
card({ id:'hw_platoon', name:'Heavy Weapons Platoon', type:'COMBAT', cost:1, res:{ ammo:8 }, unit:'4th Support Co · MCV-H/HW',
  text:s => `Heavy weapons on overwatch. Kill <b>${pc(kp(s,.10,man(s),'COMBAT'))}</b> (about ${est(s,kp(s,.10,man(s),'COMBAT'))}). Casualties −20% this week.`,
  play:s => { const k = doKill(s, kp(s,.10,man(s),'COMBAT')); s.b.boost = 0; s.b.fort = Math.max(s.b.fort, .2); s.b.fortT = Math.max(s.b.fortT,1); return `Heavy weapons destroyed ${M(k)} infected.`; } });
card({ id:'snipers', name:'Scout Snipers', type:'COMBAT', cost:0, res:{ ammo:2 }, unit:'Scout Platoon · Sniper element',
  text:s => `Precision fire on infected leaders of the horde. Kill <b>${pc(kp(s,.04,man(s),'COMBAT'))}</b> (about ${est(s,kp(s,.04,man(s),'COMBAT'))}). Draw 1 card.`,
  play:s => { const k = doKill(s, kp(s,.04,man(s),'COMBAT')); s.b.boost = 0; draw(s,1); return `Snipers destroyed ${M(k)} infected.`; } });
card({ id:'combined_arms', name:'Combined Arms Assault', type:'COMBAT', cost:3, res:{ ammo:20, fuel:10 }, rarity:'rare', unit:'Full brigade',
  text:s => `Maneuver, fires and aviation in one blow. Kill <b>${pc(kp(s,.36,(man(s)*2+s.b.u.art)/3,'COMBAT'))}</b> (about ${est(s,kp(s,.36,(man(s)*2+s.b.u.art)/3,'COMBAT'))}). Heavy casualties.`,
  play:s => { const k = doKill(s, kp(s,.36,(man(s)*2+s.b.u.art)/3,'COMBAT')); s.b.boost = 0; const c = cas(s, .01 + T(s).z * .05, ['bn1','bn2','bn3']); return `Combined arms assault destroyed ${M(k)} infected. ${c} casualties.`; } });
card({ id:'linebacker', name:'Linebacker Direct Fire', type:'COMBAT', cost:1, res:{ ammo:10 }, unit:'Air Defense Bn · MCV-M/A', req:s => s.b.u.ad > .2 || 'Air Defense Bn too weak',
  text:s => `Air defense cannons depressed for ground fire. Kill <b>${pc(kp(s,.14,s.b.u.ad,'COMBAT'))}</b> (about ${est(s,kp(s,.14,s.b.u.ad,'COMBAT'))}).`,
  play:s => { const k = doKill(s, kp(s,.14,s.b.u.ad,'COMBAT')); s.b.boost = 0; return `MCV-M/A cannons destroyed ${M(k)} infected.`; } });
card({ id:'qrf', name:'Battalion QRF', type:'COMBAT', cost:0, unit:'QRF Squads', text:s => `Quick reaction squads plug gaps in the line. Containment +12%.`,
  play:s => { contain(s,.12); return 'QRF squads plugged gaps in the cordon.'; } });
card({ id:'obstacles', name:'Engineer Obstacle Belt', type:'COMBAT', cost:1, res:{ supply:8 }, rarity:'uncommon', unit:'Engineer Platoons · MCV-H/E',
  text:s => `Ditches, wire and blocked roads. Containment +20%. Quarantine +10%.`,
  play:s => { contain(s,.20); T(s).quar = clamp(T(s).quar + .1, 0, .95); return 'Engineers built an obstacle belt.'; } });
card({ id:'breach', name:'MCV-H/E Route Clearance', type:'COMBAT', cost:2, res:{ fuel:8 }, rarity:'uncommon', unit:'Heavy Engineering',
  text:s => `Bulldoze wrecks and reopen roads. Kill <b>${pc(kp(s,.10,man(s),'COMBAT'))}</b> (about ${est(s,kp(s,.10,man(s),'COMBAT'))}). Order +10.`,
  play:s => { const k = doKill(s, kp(s,.10,man(s),'COMBAT')); s.b.boost = 0; T(s).order = Math.min(100, T(s).order + 10); return `Route clearance reopened roads and destroyed ${M(k)} infected.`; } });
// --- fires
card({ id:'mortars', name:'120mm Mortar Barrage', type:'FIRES', cost:1, res:{ ammo:6 }, unit:'Indirect Fire Platoons · MCV-M/F',
  text:s => `Responsive battalion mortars. Kill <b>${pc(kp(s,.09,man(s),'FIRES'))}</b> (about ${est(s,kp(s,.09,man(s),'FIRES'))}). No collateral damage.`,
  play:s => { const k = doKill(s, kp(s,.09,man(s),'FIRES')); s.b.boost = 0; return `Mortars destroyed ${M(k)} infected.`; } });
card({ id:'thermobaric', name:'Thermobaric Strike', type:'FIRES', cost:2, res:{ ammo:15 }, rarity:'rare', unit:'Artillery Bn',
  text:s => { const f = kp(s,.32,s.b.u.art,'FIRES'); return `Burn out a district. Kill <b>${pc(f)}</b> here (about <b>${est(s,f)}</b>). About ${M(T(s).z * TD(s).pop * f * THERMO_COLLATERAL)} civilians die. Trust −6, Order −8.`; },
  play:s => { const k = doKill(s, kp(s,.32,s.b.u.art,'FIRES')); s.b.boost = 0; const cl = civLoss(s, k * THERMO_COLLATERAL); add(s,'trust',-6); T(s).order = Math.max(0,T(s).order-8); return `Thermobaric strike destroyed ${M(k)} infected. ${M(cl)} civilians died.`; } });
card({ id:'firebreak', name:'Firebreak', type:'FIRES', cost:2, res:{ supply:10, fuel:10 }, rarity:'rare', unit:'Engineers + Artillery',
  text:s => `Burn a dead zone around the region. Quarantine +50%, Containment +40%. About ${M(firebreakLoss(s))} civilians trapped in the burn zone. Trust −4, Morale −5.`,
  play:s => { T(s).quar = clamp(T(s).quar + .5, 0, .95); contain(s,.4); const cl = civLoss(s, firebreakLoss(s)); add(s,'trust',-4); add(s,'morale',-5); return `Firebreak sealed the region. ${M(cl)} civilians lost.`; } });
card({ id:'fpf', name:'Final Protective Fires', type:'FIRES', cost:1, res:{ ammo:12 }, rarity:'uncommon', unit:'Artillery + Mortars',
  text:s => `Pre-registered fires in front of the line. Kill <b>${pc(kp(s,.07,s.b.u.art,'FIRES'))}</b> (about ${est(s,kp(s,.07,s.b.u.art,'FIRES'))}). Casualties −50% this week.`,
  play:s => { const k = doKill(s, kp(s,.07,s.b.u.art,'FIRES')); s.b.boost = 0; s.b.fort = Math.max(s.b.fort,.5); s.b.fortT = Math.max(s.b.fortT,1); return `Protective fires destroyed ${M(k)} infected.`; } });
// --- air
const atkFrac = s => s.b.helo.attack / 4;
const firebreakLoss = s => Math.min(Math.max(0, T(s).h - T(s).safe) * .004, T(s).z * .3) * TD(s).pop;
card({ id:'apache', name:'Attack Helicopter Gun Run', type:'AIR', cost:1, res:{ ammo:8, fuel:4 }, unit:'Aviation Group · Attack helicopters', req:s => s.b.helo.attack > 0 || 'No attack helicopters left',
  text:s => `Rockets and 30mm on the horde. Kill <b>${pc(kp(s,.15,Math.min(1,atkFrac(s)),'AIR'))}</b> (about ${est(s,kp(s,.15,Math.min(1,atkFrac(s)),'AIR'))}). Small risk of losing an airframe.`,
  play:s => { const k = doKill(s, kp(s,.15,Math.min(1,atkFrac(s)),'AIR')); s.b.boost = 0; let x = ''; if (rnd(s) < .06 + T(s).z * .2) { s.b.helo.attack--; x = ' An attack helicopter was lost.'; } return `Gun run destroyed ${M(k)} infected.${x}`; } });
card({ id:'medevac', name:'MEDEVAC', type:'AIR', cost:1, res:{ fuel:4 }, unit:'Multirole helicopters', req:reqMulti,
  text:s => `Fly the wounded out fast. +8% strength to your weakest battalion. Exposure −5. Morale +4.`,
  play:s => { heal(s, weakestBns(s,1), .08); add(s,'exposure',-5); add(s,'morale',4); return 'MEDEVAC flights saved the wounded.'; } });
card({ id:'airbridge', name:'Heavy-Lift Airbridge', type:'AIR', cost:1, res:{ fuel:8 }, rarity:'uncommon', unit:'Heavy helicopters', req:s => s.b.helo.heavy > 0 || 'No heavy helicopters left',
  text:s => `Sling-load pallets from the rear. +${Math.round(14+6*s.b.helo.heavy)} Supply, +${Math.round(8+4*s.b.helo.heavy)} Ammo, +${4+2*s.b.helo.heavy} Med.`,
  play:s => { const h = s.b.helo.heavy; add(s,'supply',14+6*h); add(s,'ammo',8+4*h); add(s,'med',4+2*h); return 'Heavy-lift airbridge delivered supplies.'; } });
card({ id:'air_assault', name:'Air Assault', type:'AIR', cost:2, res:{ fuel:6 }, rarity:'uncommon', unit:'Aviation Security Co + multirole', req:s => (s.b.helo.multi >= 2 && s.b.u.avsec > .2) || 'Needs 2 multirole helicopters and the Aviation Security Co',
  text:s => { const t = worstNeighbor(s); return t ? `Strike the worst neighboring region (<b>${RD[t].name}</b>). Kill ${pc(kp(s,.14,s.b.u.avsec,'AIR'))} there and rescue civilians.` : 'Strike the worst-infected neighboring region and rescue civilians.'; },
  play:s => { const t = worstNeighbor(s); if (!t) return 'No neighboring targets.'; const f = kp(s,.14,s.b.u.avsec,'AIR') * scale(t) / scale(s.b.loc); const k = doKill(s, f, t); s.b.boost = 0; const m = save(s,.01,t); cas(s,.02,['avsec']); return `Air assault into ${RD[t].name} destroyed ${M(k)} infected and rescued ${M(m)}.`; } });
card({ id:'rooftop', name:'Rooftop Extraction', type:'AIR', cost:1, res:{ fuel:5 }, unit:'Multirole helicopters', req:reqMulti,
  text:s => `Pull survivors off rooftops. Saves about <b>${M(Math.max(0,T(s).h-T(s).safe)*clamp(.015*scale(s.b.loc)*(s.cmd==='civ'?1.3:1),0,.5)*TD(s).pop)}</b>. Trust +2, Morale +4.`,
  play:s => { const m = save(s,.015); add(s,'trust',2); add(s,'morale',4); return `Rooftop extractions rescued ${M(m)}.`; } });
card({ id:'redeploy', name:'Rapid Redeploy', type:'AIR', cost:0, unit:'Aviation Group + Transportation', text:s => `Your next redeploy this week costs 0 Command Points and half the fuel.`,
  play:s => { s.b.freeMove = true; return 'Movement orders staged for rapid redeployment.'; } });
card({ id:'cas', name:'Close Air Support', type:'AIR', cost:1, rarity:'uncommon', unit:'Theater air (borrowed)', req:s => s.b.trust >= 10 || 'Not enough Trust',
  text:s => `Call in higher command's jets. Kill <b>${pc(kp(s,.15,1,'AIR'))}</b> (about ${est(s,kp(s,.15,1,'AIR'))}). Trust −4.`,
  play:s => { const k = doKill(s, kp(s,.15,1,'AIR')); s.b.boost = 0; add(s,'trust',-4); return `Close air support destroyed ${M(k)} infected.`; } });
// --- intel
card({ id:'scout_screen', name:'MCV-L Scout Screen', type:'INTEL', cost:1, res:{ fuel:3 }, unit:'Scout Platoons · MCV-L',
  text:s => { const n = worstNeighbor(s); return `Light tracked scouts screen the roads around ${TD(s).name}. Containment +10% here${n ? ` and +6% in ${RD[n].name}` : ''}, and the brigade takes 15% less exposure this week.`; },
  play:s => { contain(s, .10); const n = worstNeighbor(s); if (n) contain(s, .06, n); s.b.expoShield = Math.max(s.b.expoShield, .15); return `MCV-L scouts screened ${TD(s).name}${n ? ` and the approaches from ${RD[n].name}` : ''}.`; } });
card({ id:'endurance_uas', name:'Tier 3 Endurance UAS', type:'INTEL', cost:0, unit:'UAS Squadron · Tier 3', req:reqUAS,
  text:s => `Long-duration surveillance. Draw 1 card. Research +0.5%.`,
  play:s => { draw(s,1); s.research += .5; return 'Endurance UAS fed data to the labs.'; } });
card({ id:'sigint', name:'SIGINT Intercept', type:'INTEL', cost:0, rarity:'uncommon', unit:'Intelligence · EW', exhaust:true,
  text:s => `Intercepted command traffic tells you where to be. Gain <b>+2 Command Points</b>. Removed after use.`,
  play:s => { s.cp += 2; return 'SIGINT intercept freed up command time.'; } });
card({ id:'pattern', name:'Pattern-of-Life Analysis', type:'INTEL', cost:1, unit:'Intelligence', text:s => `Know where the horde moves. Casualties −50% and Exposure gain −50% this week.`,
  play:s => { s.b.fort = Math.max(s.b.fort,.5); s.b.fortT = Math.max(s.b.fortT,1); s.b.expoShield = .5; return 'Analysts mapped the infected movement patterns.'; } });
card({ id:'patient_zero', name:'Trace Patient Zero', type:'RESEARCH', cost:2, rarity:'rare', unit:'Intelligence + CBRN',
  text:s => `Reconstruct the origin. Research <b>+${s.b.loc === s.pz ? 6 : 2.5}%</b> (more in the origin region). Labs work 5% faster.`,
  play:s => { const v = s.b.loc === s.pz ? 6 : 2.5; s.research += v; s.know = Math.min(1.5, s.know + .05); return `Origin trace added ${v}% research.`; } });
// --- research / medical
card({ id:'samples', name:'Recover Tissue Samples', type:'RESEARCH', cost:2, rarity:'starter', unit:'CBRN · Scout Platoon', req:s => T(s).z > .002 || 'Theater needs at least 0.2% infected',
  text:s => `Capture tissue from the infected. Research <b>+${(1 + Math.min(3, T(s).z * 8)).toFixed(1)}%</b>. Labs work 3% faster. Exposure +10.`,
  play:s => { const v = 1 + Math.min(3, T(s).z * 8); s.research += v; s.know = Math.min(1.5, s.know + .03); add(s,'exposure',10 * (s.cmd === 'cbrn' ? .7 : 1)); s.flags.samples++; return `Tissue samples added ${v.toFixed(1)}% research.`; } });
card({ id:'escort', name:'Escort Research Team', type:'RESEARCH', cost:1, unit:'Maneuver Bns', req:s => !!labIn(s, s.b.loc) || 'No lab in this region',
  text:s => `Secure the lab and its field teams. Research +2%. Order +10. Containment +10%.`,
  play:s => { s.research += 2; T(s).order = Math.min(100, T(s).order + 10); contain(s,.1); s.flags.samples++; return 'Research team escorted. +2% research.'; } });
card({ id:'decon', name:'CBRN Decon Line', type:'MEDICAL', cost:1, res:{ med:3 }, unit:'CBRN', text:s => `Full decontamination of the brigade. Exposure <b>−25</b>.`,
  play:s => { add(s,'exposure',-25); return 'Decon line cleared the brigade.'; } });
card({ id:'specimen', name:'Live Specimen Capture', type:'RESEARCH', cost:2, res:{ ammo:4 }, rarity:'rare', unit:'Scout Platoon · Snipers', req:reqInfect,
  text:s => `Capture a live infected for the labs. Research <b>+6%</b>. Exposure +20. Risk of casualties.`,
  play:s => { s.research += 6; s.know = Math.min(1.5, s.know + .03); add(s,'exposure',20 * (s.cmd === 'cbrn' ? .7 : 1)); s.flags.samples++; let x = ''; if (rnd(s) < .35) { const c = cas(s,.02); x = ` ${c} casualties.`; } return `Live specimen delivered. +6% research.${x}`; } });
card({ id:'fst', name:'Forward Surgical Team', type:'MEDICAL', cost:2, res:{ med:10 }, rarity:'uncommon', unit:'Medical', text:s => `Surgeons at the front. +10% strength to all three maneuver battalions.`,
  play:s => { heal(s, ['bn1','bn2','bn3'], .10); return 'Forward surgical team returned soldiers to duty.'; } });
card({ id:'prophylaxis', name:'Experimental Prophylaxis', type:'MEDICAL', cost:1, res:{ med:8 }, rarity:'uncommon', unit:'Medical + CBRN',
  text:s => `Untested antivirals for the troops. Exposure <b>−40</b>. 15% chance of side effects (−5% strength).`,
  play:s => { add(s,'exposure',-40); if (rnd(s) < .15) { cas(s,.05); return 'Prophylaxis cut exposure, but side effects hit a battalion.'; } return 'Prophylaxis cut brigade exposure.'; } });
// --- logistics
card({ id:'forage', name:'Forage and Salvage', type:'LOGISTICS', cost:1, unit:'Support Co', text:s => `Strip abandoned depots. +12 Supply, +8 Fuel, +4 Ammo. Morale −2.`,
  play:s => { add(s,'supply',12); add(s,'fuel',8); add(s,'ammo',4); add(s,'morale',-2); return 'Salvage teams stripped abandoned depots.'; } });
card({ id:'requisition', name:'Requisition Order', type:'LOGISTICS', cost:0, unit:'Brigade S4', text:s => `Pull priority on the supply chain. +15 Ammo, +10 Fuel. Trust −4.`,
  play:s => { add(s,'ammo',15); add(s,'fuel',10); add(s,'trust',-4); return 'Priority requisition approved.'; } });
card({ id:'fuel_point', name:'Forward Fuel Point', type:'LOGISTICS', cost:1, res:{ supply:4 }, unit:'Transportation Group · tankers', text:s => `Set up a forward refuel point. +25 Fuel.`,
  play:s => { add(s,'fuel',25); return 'Forward fuel point established.'; } });
card({ id:'maint', name:'Maintenance Surge', type:'LOGISTICS', cost:1, res:{ supply:6 }, rarity:'uncommon', unit:'Maintenance · MCV-H/R recovery',
  text:s => `Mechanics work around the clock. Repair 1 lost helicopter, bring an offline company back, +5% to Artillery, Air Defense and Transport.`,
  play:s => { const b = s.b; let r = []; const lost = ['multi','attack','heavy'].find(k => b.helo[k] < b.heloMax[k]); if (lost) { b.helo[lost]++; r.push('a helicopter'); } const off = Object.keys(ENABLERS).find(k => !b.en[k]); if (off) { b.en[off] = true; r.push(ENABLERS[off]); } heal(s,['art','ad','trans'],.05); return 'Maintenance surge restored ' + (r.length ? r.join(' and ') : 'vehicle readiness') + '.'; } });
card({ id:'cache', name:'Pre-Positioned Stocks', type:'LOGISTICS', cost:1, rarity:'rare', exhaust:true, unit:'Maritime prepositioning', text:s => `Open the prepositioned stocks. +30 Supply, +30 Ammo, +30 Fuel, +10 Med. Removed after use.`,
  play:s => { add(s,'supply',30); add(s,'ammo',30); add(s,'fuel',30); add(s,'med',10); return 'Pre-positioned stocks opened.'; } });
// --- civil
card({ id:'safe_zone', name:'Establish Safe Zone', type:'CIVIL', cost:2, res:{ supply:15 }, rarity:'uncommon', unit:'Engineers + Military Police', req:s => T(s).sz < 3 || 'This region already has 3 safe zones',
  text:s => `A permanent fortified zone (${T(s).sz}/3 here). Slows local spread for the rest of the game, raises Order, and saves about <b>${M(Math.max(0,T(s).h-T(s).safe)*clamp(.02*scale(s.b.loc)*(s.cmd==='civ'?1.3:1),0,.5)*TD(s).pop)}</b>.`,
  play:s => { T(s).sz++; T(s).order = Math.min(100, T(s).order + 10); const m = save(s,.02); add(s,'trust',2); return `Safe zone established. ${M(m)} civilians inside the wire.`; } });
card({ id:'martial_law', name:'Martial Law', type:'CIVIL', cost:1, unit:'Military Police', req:s => s.b.en.mp || 'Military Police offline',
  text:s => `Impose curfew and control movement. Order +20, Quarantine +20%. Trust −2, Morale −2.`,
  play:s => { T(s).order = Math.min(100, T(s).order + 20); T(s).quar = clamp(T(s).quar + .2, 0, .95); add(s,'trust',-2); add(s,'morale',-2); return 'Martial law declared.'; } });
card({ id:'psa', name:'Emergency Broadcast', type:'CIVIL', cost:1, unit:'Signal · Psychological operations', text:s => `Tell people to stay home and how to spot the bitten. Containment +15%, Order +5.`,
  play:s => { contain(s,.15); T(s).order = Math.min(100, T(s).order + 5); return 'Emergency broadcast reached the population.'; } });
card({ id:'partner', name:'Partner Force Liaison', type:'CIVIL', cost:1, unit:'Brigade HQ liaison officers', text:s => `Coordinate local police and army. Order +15. Kill <b>${pc(kp(s,.05,1,'CIVIL',false))}</b> (about ${est(s,kp(s,.05,1,'CIVIL',false))}).`,
  play:s => { T(s).order = Math.min(100, T(s).order + 15); const k = doKill(s, kp(s,.05,1,'CIVIL',false)); return `Partner forces engaged, destroying ${M(k)} infected.`; } });
card({ id:'borders', name:'Close the Borders', type:'CIVIL', cost:2, rarity:'uncommon', unit:'Brigade HQ', text:s => `Seal crossings. Quarantine +30% here and +15% in every neighboring region.`,
  play:s => { T(s).quar = clamp(T(s).quar + .3, 0, .95); for (const n of neighbors(s.b.loc)) s.regions[n].quar = clamp(s.regions[n].quar + .15, 0, .95); return 'Borders closed around the theater.'; } });
card({ id:'refugee_camp', name:'Refugee Processing Center', type:'CIVIL', cost:1, res:{ supply:8 }, unit:'Brigade Support', text:s => `Screen and shelter refugees. Saves about <b>${M(Math.max(0,T(s).h-T(s).safe)*clamp(.02*scale(s.b.loc)*(s.cmd==='civ'?1.3:1),0,.5)*TD(s).pop)}</b>. Exposure +5.`,
  play:s => { const m = save(s,.02); add(s,'exposure',5); return `Refugee center processed ${M(m)} civilians.`; } });
// --- command
card({ id:'rally', name:'Rally the Troops', type:'COMMAND', cost:1, unit:'Commander', text:s => `Walk the line. Morale <b>+12</b>.`, play:s => { add(s,'morale',12); return 'The commander rallied the troops.'; } });
card({ id:'intent', name:"Commander's Intent", type:'COMMAND', cost:1, unit:'Brigade HQ', text:s => `Clear orders, fast execution. Draw 3 cards.`, play:s => { draw(s,3); return 'Orders issued. Drew 3 cards.'; } });
card({ id:'reinforce', name:'Emergency Reinforcements', type:'COMMAND', cost:2, rarity:'rare', unit:'Higher command', text:s => `Replacements flown in. +20% strength to your weakest battalion and +8% to the others. Trust −6.`,
  play:s => { const w = weakestBns(s,3); heal(s,[w[0]],.2); heal(s,w.slice(1),.08); heal(s,['art','ad','avsec'],.05); add(s,'trust',-6); return 'Replacements arrived.'; } });
card({ id:'overwatch', name:'Overwatch', type:'COMMAND', cost:1, unit:'Brigade HQ', text:s => `Rotate units through rest and overwatch. Casualties −30% and Exposure gain −30% this week. Morale +3.`,
  play:s => { s.b.fort = Math.max(s.b.fort,.3); s.b.fortT = Math.max(s.b.fortT,1); s.b.expoShield = Math.max(s.b.expoShield,.3); add(s,'morale',3); return 'Units rotated through overwatch.'; } });
card({ id:'hq_report', name:'Brief Higher Command', type:'COMMAND', cost:1, unit:'Brigade HQ', text:s => `Make your case to the generals. Trust <b>+6</b>.`, play:s => { add(s,'trust',6); return 'Higher command briefed. Trust improved.'; } });
card({ id:'tempo', name:'Operational Tempo', type:'COMMAND', cost:0, rarity:'uncommon', unit:'Brigade HQ', text:s => `Push the staff hard. +1 Command Point. Morale −3.`, play:s => { s.cp += 1; add(s,'morale',-3); return 'The staff pushed the tempo.'; } });

// --- Phase II: Restoration
function vaccinate(s, v, rid) { const rs = s.regions[rid || s.b.loc]; const before = rs.vax || 0; rs.vax = clamp(before + v, 0, .98); return rs.vax - before; }
function cureInfected(s, f, rid) { rid = rid || s.b.loc; const rs = s.regions[rid]; const amt = rs.z * clamp(f, 0, .6); rs.z -= amt; rs.h += amt; const m = amt * RD[rid].pop; s.stats.cured = (s.stats.cured || 0) + m; return m; }
const vaxScale = id => clamp(scale(id), .6, 1.3);
const reqRestore = s => s.phase === 'restore' || 'Only after the cure is found';
card({ id:'cure_convoy', name:'Cure Distribution Convoy', type:'CURE', cost:1, res:{ fuel:4 }, phase:'restore', unit:'Transportation Group · armored transport', req:reqRestore,
  text:s => `Escort a convoy of cure doses. Cure coverage here <b>+${pc(.18 * vaxScale(s.b.loc))}</b> (now ${pc(T(s).vax || 0)}). Order +5.`,
  play:s => { const v = vaccinate(s, .18 * vaxScale(s.b.loc)); T(s).order = Math.min(100, T(s).order + 5); return `Cure convoy delivered. Coverage in ${TD(s).name} +${pc(v)}.`; } });
card({ id:'field_cure', name:'Field Cure Teams', type:'CURE', cost:1, res:{ med:5 }, phase:'restore', unit:'Medical · CBRN · Scout Platoons', req:s => (reqRestore(s) === true ? (T(s).z > .0002 || 'No infected here to cure') : reqRestore(s)),
  text:s => { const f = clamp(.1 * scale(s.b.loc), 0, .3); return `Dart and treat the infected. Turn <b>${pc(f)}</b> of infected here back into people (about <b>${est(s,f)}</b>). Exposure −5.`; },
  play:s => { const m = cureInfected(s, clamp(.1 * scale(s.b.loc), 0, .3)); add(s,'exposure',-5); return `Field cure teams brought ${M(m)} infected back.`; } });
card({ id:'mass_vax', name:'Mass Vaccination Airlift', type:'CURE', cost:2, res:{ fuel:8 }, rarity:'uncommon', phase:'restore', unit:'Aviation Group · heavy lift', req:s => (reqRestore(s) === true ? ((s.b.helo.heavy > 0 || s.b.helo.multi > 0) || 'No helicopters left') : reqRestore(s)),
  text:s => `Fly doses out across the theater. Cure coverage <b>+12%</b> here and <b>+8%</b> in every neighboring region.`,
  play:s => { vaccinate(s, .12); for (const n of neighbors(s.b.loc)) vaccinate(s, .08, n); return 'Vaccination airlift reached the whole theater.'; } });
card({ id:'cure_aerosol', name:'Cure Aerosol Release', type:'CURE', cost:2, res:{ med:10, fuel:6 }, rarity:'rare', phase:'restore', unit:'CBRN · multirole helicopters', req:s => (reqRestore(s) === true ? (T(s).z > .0002 || 'No infected here to cure') : reqRestore(s)),
  text:s => { const f = clamp(.22 * scale(s.b.loc), 0, .45); return `Spray the cure over infected districts. Turn <b>${pc(f)}</b> of infected here back into people (about <b>${est(s,f)}</b>).`; },
  play:s => { const m = cureInfected(s, clamp(.22 * scale(s.b.loc), 0, .45)); return `Cure aerosol brought ${M(m)} infected back.`; } });
card({ id:'rebuild_grid', name:'Rebuild Power and Water', type:'LOGISTICS', cost:1, res:{ supply:10 }, phase:'restore', unit:'Engineer Platoons · Signal', req:s => (reqRestore(s) === true ? (!T(s).fallen || 'Reclaim the region first') : reqRestore(s)),
  text:s => `Get the lights and the taps back on. Order <b>+15</b>.`, play:s => { T(s).order = Math.min(100, T(s).order + 15); return `Power and water restored in ${TD(s).name}.`; } });
card({ id:'restore_gov', name:'Restore Local Government', type:'CIVIL', cost:2, rarity:'uncommon', phase:'restore', unit:'Brigade HQ · Military Police', req:s => (reqRestore(s) === true ? ((!T(s).fallen && T(s).z < .05) || 'Infection here must be under 5%') : reqRestore(s)),
  text:s => `Hand authority back to civilian leaders. Order <b>+25</b>. Trust +4.`, play:s => { T(s).order = Math.min(100, T(s).order + 25); add(s,'trust',4); return `Civilian government restored in ${TD(s).name}.`; } });
card({ id:'reopen_trade', name:'Reopen Trade Routes', type:'LOGISTICS', cost:1, phase:'restore', unit:'Transportation Group', req:s => (reqRestore(s) === true ? (!T(s).fallen || 'Reclaim the region first') : reqRestore(s)),
  text:s => `Ports and highways open again. +20 Supply, +10 Fuel, +6 Med. Order +5.`, play:s => { add(s,'supply',20); add(s,'fuel',10); add(s,'med',6); T(s).order = Math.min(100, T(s).order + 5); return 'Trade routes reopened.'; } });
card({ id:'census', name:'Survivor Census', type:'CIVIL', cost:0, phase:'restore', unit:'Brigade Support · Military Police', req:reqRestore,
  text:s => `Register survivors and schedule their doses. Draw 1 card. Order +4, cure coverage +4%.`, play:s => { draw(s,1); T(s).order = Math.min(100, T(s).order + 4); vaccinate(s, .04); return 'Survivors registered for doses.'; } });
card({ id:'reclaim', name:'Reclamation Offensive', type:'COMBAT', cost:2, res:{ ammo:14, fuel:6 }, rarity:'uncommon', phase:'restore', unit:'Maneuver Bns · MCV-M/I', req:reqRestore,
  text:s => { const f = kp(s, T(s).fallen ? .34 : .24, man(s), 'COMBAT'); return `Retake the dead cities block by block. Kill <b>${pc(f)}</b> of infected here (about <b>${est(s,f)}</b>)${T(s).fallen ? ', extra strong in fallen regions' : ''}.`; },
  play:s => { const k = doKill(s, kp(s, T(s).fallen ? .34 : .24, man(s), 'COMBAT')); s.b.boost = 0; const c = cas(s, .006 + T(s).z * .03); return `Reclamation offensive destroyed ${M(k)} infected. ${c} casualties.`; } });

const STARTER = ['clear_hold','clear_hold','fire_mission','uas_recon','samples','convoy','aid_station','evac','checkpoint','dig_in'];
const POOL = Object.values(CARDS).filter(c => c.rarity !== 'starter' && !c.phase).map(c => c.id).concat(['clear_hold','evac','checkpoint','convoy']);
const RPOOL = Object.values(CARDS).filter(c => c.phase === 'restore' || (!c.phase && c.type !== 'RESEARCH' && c.rarity !== 'starter')).map(c => c.id).concat(['cure_convoy','field_cure','convoy']);
const REASSIGN = { samples:'cure_convoy', escort:'field_cure', specimen:'field_cure', patient_zero:'cure_aerosol' };

function worstNeighbor(s) { let best = null, bz = 0; for (const n of neighbors(s.b.loc)) { const z = s.regions[n].z; if (z > bz) { bz = z; best = n; } } return best; }

// ---------------------------------------------------------------- deck
function draw(s, n) {
  const d = s.deck;
  for (let i = 0; i < n; i++) {
    if (!d.draw.length) { if (!d.discard.length) return; d.draw = shuffle(s, d.discard); d.discard = []; }
    if (d.hand.length >= 10) return;
    d.hand.push(d.draw.pop());
  }
}
const baseId = id => (id && id.endsWith('+')) ? id.slice(0, -1) : id;
const isUp = id => !!id && id.endsWith('+');
const def = id => CARDS[baseId(id)];
const costOf = id => Math.max(0, (def(id) ? def(id).cost : 0) - (isUp(id) ? 1 : 0));
const canUpgrade = id => !isUp(id) && !!def(id) && def(id).cost >= 1;
const cardName = id => def(id).name + (isUp(id) ? '+' : '');
function canPlay(s, idx) {
  const id = s.deck.hand[idx]; const c = def(id); if (!c) return 'Unknown card';
  if (s.over) return 'Game over';
  if (s.crisis) return 'Resolve the crisis first';
  if (s.cureChoice) return 'Decide what to do with the cure first';
  if (costOf(id) > s.cp) return 'Not enough Command Points';
  for (const k in c.res) if (s.b[k] < c.res[k]) return 'Not enough ' + k;
  if (c.type === 'AIR' && s.b.fuel <= 0) return 'Aircraft grounded: no fuel';
  const r = c.req(s); if (r !== true) return r;
  return true;
}
function playCard(s, idx) {
  const ok = canPlay(s, idx); if (ok !== true) return { ok:false, msg:ok };
  const id = s.deck.hand.splice(idx, 1)[0]; const c = def(id);
  s.cp -= costOf(id); for (const k in c.res) s.b[k] -= c.res[k];
  const msg = c.play(s);
  if ((c.type === 'COMBAT' || c.type === 'FIRES') && T(s).z > .0005) gainXP(s, mainBns(s), .5);
  if (c.exhaust) s.deck.exhausted.push(id); else s.deck.discard.push(id);
  s.stats.cards++; s.log.push(msg);
  if (c.type === 'RESEARCH') s.flags.researchCards++;

  checkOver(s);
  return { ok:true, msg };
}

// ---------------------------------------------------------------- movement
function deployCost(s, to) {
  const h = hops(s.b.loc, to); if (h === 0) return null;
  let cp = h === 1 ? 1 : 2, fuel = 4 + 4 * h;
  if (hasD(s, 'airmobile')) { cp = Math.max(0, cp - 1); fuel = Math.max(0, fuel - 4); }
  if (s.b.freeMove) { cp = 0; fuel = Math.ceil(fuel / 2); }
  return { hops:h, cp, fuel };
}
function canDeploy(s, to) {
  if (s.over) return 'Game over'; if (s.crisis) return 'Resolve the crisis first'; if (s.cureChoice) return 'Decide what to do with the cure first';
  if (to === s.b.loc) return 'Already deployed here';
  if (s.b.moved) return 'The brigade already redeployed this week';
  const c = deployCost(s, to); if (c.hops > 5) return 'Too far';
  if (s.cp < c.cp) return 'Not enough Command Points'; if (s.b.fuel < c.fuel) return 'Not enough fuel';
  return true;
}
function deploy(s, to) {
  const ok = canDeploy(s, to); if (ok !== true) return { ok:false, msg:ok };
  const c = deployCost(s, to); s.cp -= c.cp; s.b.fuel -= c.fuel; s.b.loc = to; s.b.moved = true; s.b.freeMove = false; s.b.fort = 0; s.b.fortT = 0;
  if (s.b.tf && s.b.tf.loc === to) { s.log.push(`${UNITS[s.b.tf.bn].name} rejoined the main body.`); s.b.tf = null; }
  const msg = `The brigade redeployed to ${RD[to].name}.`; s.log.push(msg); return { ok:true, msg };
}
// ---- Task Force: detach one battalion to operate in a second region
function tfCandidate(s) { return s.b.tf ? s.b.tf.bn : BNS.slice().sort((a, c) => s.b.u[c] - s.b.u[a])[0]; }
function tfCost(s, to) { const from = s.b.tf ? s.b.tf.loc : s.b.loc; const h = hops(from, to); let cp = 1, fuel = 4 + 3 * h; if (hasD(s, 'airmobile')) { cp = 0; fuel = Math.max(0, fuel - 4); } return { hops:h, cp, fuel }; }
function canSendTF(s, to) {
  if (s.over) return 'Game over'; if (s.crisis) return 'Resolve the crisis first'; if (s.cureChoice) return 'Decide what to do with the cure first';
  if (to === s.b.loc) return 'The main body is already here';
  if (s.b.tf && s.b.tf.loc === to) return 'The Task Force is already here';
  const c = tfCost(s, to); if (c.hops > TF_RANGE) return 'Too far for a Task Force';
  const bn = tfCandidate(s); if (s.b.u[bn] < .25) return 'No battalion is strong enough to detach';
  if (!s.b.tf && mainBns(s).length < 3) return 'A Task Force is already detached';
  if (s.cp < c.cp) return 'Not enough Command Points'; if (s.b.fuel < c.fuel) return 'Not enough fuel';
  return true;
}
function sendTF(s, to) {
  const ok = canSendTF(s, to); if (ok !== true) return { ok:false, msg:ok };
  const c = tfCost(s, to); const bn = tfCandidate(s); s.cp -= c.cp; s.b.fuel -= c.fuel;
  const moved = !!s.b.tf; s.b.tf = { bn, loc:to, since:s.turn }; s.b.tfMoved = true;
  const msg = moved ? `Task Force ${UNITS[bn].name} moved to ${RD[to].name}.` : `${UNITS[bn].name} detached as a Task Force to ${RD[to].name}.`;
  s.log.push(msg); return { ok:true, msg };
}
function recallCost(s) { const h = s.b.tf ? hops(s.b.tf.loc, s.b.loc) : 0; return { hops:h, cp:hasD(s, 'airmobile') ? 0 : 1, fuel:Math.max(0, 3 * h - (hasD(s, 'airmobile') ? 4 : 0)) }; }
function canRecallTF(s) {
  if (!s.b.tf) return 'No Task Force detached'; if (s.over) return 'Game over'; if (s.crisis) return 'Resolve the crisis first'; if (s.cureChoice) return 'Decide what to do with the cure first';
  const c = recallCost(s); if (s.cp < c.cp) return 'Not enough Command Points'; if (s.b.fuel < c.fuel) return 'Not enough fuel'; return true;
}
function recallTF(s) {
  const ok = canRecallTF(s); if (ok !== true) return { ok:false, msg:ok };
  const c = recallCost(s); s.cp -= c.cp; s.b.fuel -= c.fuel; const bn = s.b.tf.bn; s.b.tf = null;
  const msg = `${UNITS[bn].name} rejoined the main body.`; s.log.push(msg); return { ok:true, msg };
}
const POSTURES = {
  assault: { name:'Assault', kill:.10, contain:.12, casM:1.5, ammo:7, fuel:5, supply:7, expo:1.3, text:'More kills, more casualties and ammo use.' },
  hold:    { name:'Hold',    kill:.04, contain:.28, casM:.7,  ammo:3, fuel:3, supply:6, expo:.8,  text:'Strong containment, fewer casualties. Mans checkpoints: quarantine +5% a week.' },
  relief:  { name:'Relief',  kill:.02, contain:.12, casM:1,   ammo:1, fuel:4, supply:8, expo:1.2, text:'Rescue civilians and restore order each week.' },
};
function setPosture(s, p) { if (POSTURES[p]) s.b.posture = p; }

// ---------------------------------------------------------------- weekly tasking: one air mission and one engineer job each week
const AIR_REGEN = 12;
function airWorst(s) { const tf = s.b.tf; if (tf && s.regions[tf.loc].z > T(s).z && !s.regions[tf.loc].fallen) return tf.loc; return s.b.loc; }
const SORTIES = {
  isr:    { name:'ISR Sweep', unit:'UAS Squadron', art:'uas_recon', kind:'INTEL', rdy:15, res:{ fuel:2 },
    text:s => `Drones map the infected in ${TD(s).name}. Containment +6% there, and the brigade takes 25% less exposure this week.`,
    req:s => s.b.uas > .15 || 'The UAS squadron is down',
    go:s => { contain(s, .06 * (.5 + .5 * s.b.uas)); s.b.expoShield = Math.max(s.b.expoShield, .25); return `ISR sweep over ${TD(s).name}: containment up, exposure down.`; } },
  strike: { name:'Gun Run', unit:'Attack helicopters', art:'apache', kind:'AIR', rdy:30, res:{ fuel:3, ammo:4 },
    text:s => { const r = airWorst(s); return `Attack helicopters hit the worst concentration${r === s.b.loc ? ` in ${TD(s).name}` : ` near the Task Force in ${RD[r].name}`}. About ${M(s.regions[r].z * RD[r].pop * airKillF(s, r))} infected destroyed. Small risk of losing an aircraft.`; },
    req:s => s.b.helo.attack <= 0 ? 'No attack helicopters left' : s.regions[airWorst(s)].z < .0003 ? 'No infected to hit here' : true,
    go:s => { const r = airWorst(s); const k = doKill(s, airKillF(s, r), r); let x = '';
      if (rnd(s) < (.03 + s.regions[r].z * .12) * (s.b.air < 40 ? 2 : 1)) { s.b.helo.attack--; x = ' One attack helicopter was lost.'; add(s,'morale',-3); }
      return `Gun run over ${RD[r].name} destroyed ${M(k)} infected.${x}`; } },
  medevac:{ name:'MEDEVAC Flights', unit:'Multirole helicopters', art:'medevac', kind:'MEDICAL', rdy:20, res:{ fuel:2, med:2 },
    text:s => `Fly the wounded to the rear. The weakest battalion recovers 3% strength${s.b.tf ? ' and the Task Force 1.5%' : ''}. Morale +2.`,
    req:s => s.b.helo.multi > 0 || 'No multirole helicopters left',
    go:s => { const w = weakestBns(s, 1); heal(s, w, .03); if (s.b.tf) heal(s, [s.b.tf.bn], .015); add(s,'morale',2); return `MEDEVAC flights brought ${w.length ? UNITS[w[0]].name : 'the brigade'} back up.`; } },
  lift:   { name:'Heavy Lift', unit:'Heavy helicopters', art:'airbridge', kind:'LOGISTICS', rdy:25, res:{ fuel:4 },
    text:s => `Heavy helicopters fly in +${8 + 3 * s.b.helo.heavy} Supply and +${4 + 2 * s.b.helo.heavy} Ammo.`,
    req:s => s.b.helo.heavy > 0 || 'No heavy helicopters left',
    go:s => { const h = s.b.helo.heavy; add(s,'supply',8 + 3 * h); add(s,'ammo',4 + 2 * h); return 'Heavy lift delivered supplies.'; } },
  rest:   { name:'Stand Down', unit:'Aviation Group', art:'maint', kind:'LOGISTICS', rdy:-35, res:{},
    text:() => 'Crews sleep and mechanics catch up. Air readiness +35 and Morale +1.',
    req:s => s.b.air < 100 || 'The fleet is already fully ready',
    go:s => { add(s,'morale',1); return 'The Aviation Group stood down for maintenance.'; } },
};
function airKillF(s, r) { return clamp(.07 * Math.min(1, s.b.helo.attack / 4) * eff(s) * scale(r) * cmdKill(s, 'AIR') * (.6 + .4 * s.b.u.avn) * (s.b.air < 40 ? .7 : 1), 0, .3); }
function canSortie(s, id) {
  const o = SORTIES[id]; if (!o) return 'Unknown mission';
  if (s.over) return 'Game over'; if (s.crisis) return 'Resolve the crisis first'; if (s.cureChoice) return 'Decide what to do with the cure first';
  if (s.b.ato) return 'The Aviation Group already flew this week';
  if (s.b.u.avn < .15) return 'The Aviation Group is shattered';
  const r = o.req(s); if (r !== true) return r;
  if (o.rdy > 0 && s.b.air < o.rdy) return `Needs ${o.rdy}% air readiness`;
  for (const k in o.res) if (s.b[k] < o.res[k]) return `Needs ${o.res[k]} ${k}`;
  return true;
}
function flySortie(s, id) {
  const ok = canSortie(s, id); if (ok !== true) return { ok:false, msg:ok };
  const o = SORTIES[id]; for (const k in o.res) s.b[k] -= o.res[k];
  s.b.air = clamp(s.b.air - o.rdy, 0, 100); s.b.ato = id;
  const msg = o.go(s); s.log.push(msg); return { ok:true, msg };
}
const WORKS = {
  barrier:  { name:'Barrier Line', weeks:2, res:{ supply:4 }, art:'w_barrier', kind:'COMBAT',
    text:'Walls, wire and ditches on every road out. Infection spreading out of this region drops 35%, and containment here is +4% every week.' },
  firebase: { name:'Fire Base', weeks:2, res:{ supply:3, ammo:3 }, art:'w_firebase', kind:'FIRES',
    text:'Dug-in guns shell the infected here every week, even after the brigade moves on.' },
  hospital: { name:'Field Hospital', weeks:3, res:{ supply:3, med:2 }, art:'w_hospital', kind:'MEDICAL',
    text:'While the brigade is here, battalions recover 1.5% a week, you get +2 Med a week and more civilians are saved.' },
  depot:    { name:'Supply Depot', weeks:3, res:{ supply:5 }, art:'w_depot', kind:'LOGISTICS',
    text:'Forward stockpiles: +3 Supply and +2 Fuel every week for as long as this region holds (two depots at most count).' },
};
function worksIn(s, rid) { const w = s.regions[rid].works; return w ? Object.keys(w).filter(k => w[k]) : []; }
function engCrew(s) { return clamp(.35 * s.b.u.avsec + .65 * (mainBns(s).reduce((a, k) => a + s.b.u[k], 0) / 3), 0, 1); }
function canBuild(s, id) {
  const w = WORKS[id]; if (!w) return 'Unknown project';
  if (s.over) return 'Game over'; if (s.crisis) return 'Resolve the crisis first'; if (s.cureChoice) return 'Decide what to do with the cure first';
  if (s.b.engUsed) return 'The engineers already worked this week';
  const rs = T(s); if (rs.fallen) return 'This region has fallen'; if (rs.z > .3) return 'Too many infected to build here';
  if (rs.works && rs.works[id]) return 'Already built here';
  if (engCrew(s) < .25) return 'Too few engineers left';
  for (const k in w.res) if (s.b[k] < w.res[k]) return `Needs ${w.res[k]} ${k}`;
  return true;
}
function buildWork(s, id) {
  const ok = canBuild(s, id); if (ok !== true) return { ok:false, msg:ok };
  const w = WORKS[id]; for (const k in w.res) s.b[k] -= w.res[k];
  const b = s.b; let lost = '';
  if (!b.eng || b.eng.loc !== b.loc || b.eng.id !== id) { if (b.eng && b.eng.prog > 0) lost = ` Work on the ${WORKS[b.eng.id].name} in ${RD[b.eng.loc].name} was abandoned.`; b.eng = { id, loc:b.loc, prog:0 }; }
  b.eng.prog++; b.engUsed = true;
  let msg;
  if (b.eng.prog >= w.weeks) { const rs = T(s); rs.works = rs.works || {}; rs.works[id] = true; b.eng = null; msg = `Engineers finished a ${w.name} in ${TD(s).name}.`; s.stats.works = (s.stats.works || 0) + 1; }
  else msg = `Engineers worked on a ${w.name} in ${TD(s).name} (${b.eng.prog} of ${w.weeks} weeks).`;
  msg += lost; s.log.push(msg); return { ok:true, msg };
}

// ---------------------------------------------------------------- events (crises)
const EVENTS = {};
function ev(def) { EVENTS[def.id] = Object.assign({ weight:1, cond:() => true, ctx:() => ({}) }, def); }
const safestNeighbor = s => { let best = null, bz = 9; for (const n of neighbors(s.b.loc)) { const r = s.regions[n]; if (!r.fallen && r.z < bz) { bz = r.z; best = n; } } return best; };

ev({ id:'warno', phase:'outbreak', title:'Warning Order', kind:'COMMAND', weight:0,
  text:(s) => `0400 Zulu. An unknown pathogen, now designated <b>${s.path.name}</b>, has been confirmed in <b>${RD[s.pz].name}</b>. The infected are violent and the bitten turn within hours. The Expeditionary Combat Brigade is placed under your command at ${RD[s.b.loc].name}. Higher command wants your initial posture.`,
  options:[
    { label:'Move now', fx:s => `Free redeploy to ${RD[s.pz].name}. Exposure +10, Trust +5.`, apply:s => { s.b.loc = s.pz; add(s,'exposure',10); add(s,'trust',5); return `The brigade deployed straight into ${RD[s.pz].name}.`; } },
    { label:'Load out first', fx:() => '+20 Supply, +20 Ammo, +15 Fuel.', apply:s => { add(s,'supply',20); add(s,'ammo',20); add(s,'fuel',15); return 'The brigade loaded out with extra stocks.'; } },
    { label:'Request more airframes', fx:() => '+1 multirole and +1 attack helicopter. Trust −5.', apply:s => { s.b.helo.multi++; s.b.heloMax.multi++; s.b.helo.attack++; s.b.heloMax.attack++; add(s,'trust',-5); return 'Two more helicopters attached to the Aviation Group.'; } },
  ] });
ev({ id:'refugees', title:'Refugee Column', kind:'CIVIL', cond:s => T(s).z > .002 && T(s).h > .3,
  text:s => `Thousands of civilians are massed at your checkpoint outside ${TD(s).name}. Some are coughing. A few have bandaged arms.`,
  options:[
    { label:'Open the gates', fx:() => 'Save civilians, Morale +6, Trust +2, Exposure +12.', apply:s => { const m = save(s,.008); add(s,'morale',6); add(s,'trust',2); add(s,'exposure',12); return `${M(m)} refugees let through.`; } },
    { label:'Screen them', fx:() => 'Costs 8 Med. Save fewer civilians, Exposure +4.', req:s => s.b.med >= 8 || 'Needs 8 Med', apply:s => { s.b.med -= 8; const m = save(s,.005); add(s,'exposure',4); return `${M(m)} refugees screened and admitted.`; } },
    { label:'Turn them away', fx:() => 'Morale −8, Trust −3.', apply:s => { add(s,'morale',-8); add(s,'trust',-3); return 'The column was turned away. The troops did not like it.'; } },
  ] });
ev({ id:'bitten', title:'Bitten', kind:'MEDICAL', cond:s => T(s).z > .005,
  ctx:s => ({ bn: pick(s,['bn1','bn2','bn3']) }),
  text:(s,c) => `A squad leader in the ${UNITS[c.bn].name} was bitten clearing a stairwell. He wants to lead his squad until he turns.`,
  options:[
    { label:'Isolate and monitor', fx:() => 'Exposure +4, Morale +3.', apply:s => { add(s,'exposure',4); add(s,'morale',3); return 'The sergeant was isolated under watch.'; } },
    { label:'Mercy protocol', fx:() => 'Morale −8, Exposure −6.', apply:s => { add(s,'morale',-8); add(s,'exposure',-6); return 'Protocol was followed. The squad took it hard.'; } },
    { label:'One last patrol', fx:s => `Kill ${pc(kp(s,.06,man(s),'COMBAT',false))} of infected. 35% risk: Exposure +25.`, apply:s => { const k = doKill(s, kp(s,.06,man(s),'COMBAT',false)); if (rnd(s) < .35) { add(s,'exposure',25); return `He took ${M(k)} infected with him, but turned inside the perimeter.`; } return `He led one last patrol, destroying ${M(k)} infected.`; } },
  ] });
ev({ id:'warlord', title:'The General Wants Fuel', kind:'COMMAND', cond:s => T(s).order < 70 && !T(s).fallen,
  text:s => `The ranking local commander in ${TD(s).name} will cooperate only if you hand over fuel and ammunition.`,
  options:[
    { label:'Pay him', fx:() => '−15 Fuel, −10 Ammo. Order +15.', req:s => (s.b.fuel >= 15 && s.b.ammo >= 10) || 'Needs 15 Fuel and 10 Ammo', apply:s => { s.b.fuel -= 15; s.b.ammo -= 10; T(s).order = Math.min(100, T(s).order + 15); return 'The local commander is cooperating.'; } },
    { label:'Refuse', fx:() => 'Order −12.', apply:s => { T(s).order = Math.max(0, T(s).order - 12); return 'Local forces withdrew their support.'; } },
    { label:'Arrest him', fx:() => 'Needs Military Police. Trust +8, Order −6, light casualties.', req:s => s.b.en.mp || 'Military Police offline', apply:s => { add(s,'trust',8); T(s).order = Math.max(0, T(s).order - 6); const c = cas(s,.01); return `MPs arrested the commander. ${c} casualties in the firefight.`; } },
  ] });
ev({ id:'airdrop', title:'Airdrop Off Target', kind:'LOGISTICS',
  text:s => `A resupply drop came down three kilometers off target, inside an infected district.`,
  options:[
    { label:'Recover it', fx:() => '+20 Supply, +15 Ammo. Exposure +6. Risk of casualties.', apply:s => { add(s,'supply',20); add(s,'ammo',15); add(s,'exposure',6); let x=''; if (rnd(s) < .4 + T(s).z) { x = ` ${cas(s,.012)} casualties.`; } return 'Pallets recovered.' + x; } },
    { label:'Write it off', fx:() => 'No effect.', apply:s => 'The drop was written off.' },
  ] });
ev({ id:'militia', title:'Civilian Militia', kind:'CIVIL', cond:s => !T(s).fallen && T(s).z > .001,
  text:s => `Armed volunteers in ${TD(s).name} offer to fight alongside the brigade.`,
  options:[
    { label:'Arm them', fx:s => `−12 Ammo. Order +12, kill ${pc(kp(s,.05,1,'CIVIL',false))}.`, req:s => s.b.ammo >= 12 || 'Needs 12 Ammo', apply:s => { s.b.ammo -= 12; T(s).order = Math.min(100,T(s).order+12); const k = doKill(s,kp(s,.05,1,'CIVIL',false)); return `The militia destroyed ${M(k)} infected.`; } },
    { label:'Use them as guides', fx:() => 'Order +5. +1 Command Point next week.', apply:s => { T(s).order = Math.min(100,T(s).order+5); s.b.cpNext += 1; return 'Local guides attached to the scouts.'; } },
    { label:'Decline', fx:() => 'No effect.', apply:() => 'The militia went its own way.' },
  ] });
ev({ id:'nuke', phase:'outbreak', title:'The Nuclear Option', kind:'COMMAND', weight:.6, once:true, cond:s => fallenCount(s) >= 2,
  ctx:s => { const f = REGIONS.filter(r => s.regions[r.id].fallen).sort((a,b) => s.regions[b.id].z*b.pop - s.regions[a.id].z*a.pop); return { r: f[0].id }; },
  text:(s,c) => `Higher command proposes tactical nuclear strikes on the largest hordes in fallen <b>${RD[c.r].name}</b>. They want your endorsement.`,
  options:[
    { label:'Endorse', fx:(s,c) => `Infected in ${RD[c.r].name} −60%, survivors there −40%. Order −6 worldwide. Trust +6, Morale −6.`, apply:(s,c) => { const r = s.regions[c.r]; const k = r.z*.6; r.z -= k; r.d += k; const h = r.h*.4; r.h -= h; r.d += h; r.safe = Math.min(r.safe, r.h); for (const x of REGIONS) s.regions[x.id].order = Math.max(0, s.regions[x.id].order - 6); add(s,'trust',6); add(s,'morale',-6); s.stats.kills += k*RD[c.r].pop; return `Strikes hit ${RD[c.r].name}. The world watched in horror.`; } },
    { label:'Oppose', fx:() => 'Trust −8, Morale +3.', apply:s => { add(s,'trust',-8); add(s,'morale',3); return 'You opposed the strikes. Higher command noted it.'; } },
  ] });
ev({ id:'horde', title:'Horde Inbound', kind:'COMBAT', weight:1.4, cond:s => T(s).z > .03,
  ctx:s => ({ n: safestNeighbor(s) }),
  text:s => `UAS feeds show a horde of hundreds of thousands moving on your positions in ${TD(s).name}.`,
  options:[
    { label:'Dig in', fx:() => '−10 Supply. Casualties −50% this week.', req:s => s.b.supply >= 10 || 'Needs 10 Supply', apply:s => { s.b.supply -= 10; s.b.fort = Math.max(s.b.fort,.5); s.b.fortT = Math.max(s.b.fortT,1); return 'The brigade dug in.'; } },
    { label:'Meet them head-on', fx:s => `−10 Ammo. Kill ${pc(kp(s,.12,man(s),'COMBAT',false))}, heavy casualties.`, req:s => s.b.ammo >= 10 || 'Needs 10 Ammo', apply:s => { s.b.ammo -= 10; const k = doKill(s,kp(s,.12,man(s),'COMBAT',false)); const c = cas(s,.025,['bn1','bn2','bn3']); return `The brigade broke the horde: ${M(k)} destroyed, ${c} casualties.`; } },
    { label:'Withdraw', fx:(s,c) => c.n ? `Free move to ${RD[c.n].name}.` : 'No safe neighbor.', req:(s,c) => !!c.n || 'Nowhere to go', apply:(s,c) => { s.b.loc = c.n; s.b.fort = 0; return `The brigade withdrew to ${RD[c.n].name}.`; } },
    { label:'Hold the line', fx:() => 'No cost. Casualties this week.', apply:s => { const c = cas(s,.02,['bn1','bn2','bn3']); return `The line held. ${c} casualties.`; } },
  ] });
ev({ id:'helo_down', title:'Helicopter Down', kind:'AIR', cond:s => s.b.helo.multi > 0,
  text:s => `A multirole helicopter went down in ${TD(s).name}. The crew is alive and surrounded.`,
  options:[
    { label:'Launch CSAR', fx:() => '−8 Fuel, −6 Ammo. The airframe is lost but the crew comes home. Morale +6.', req:s => (s.b.fuel >= 8 && s.b.ammo >= 6) || 'Needs 8 Fuel and 6 Ammo', apply:s => { s.b.fuel -= 8; s.b.ammo -= 6; s.b.helo.multi--; add(s,'morale',6); return 'CSAR brought the crew home.'; } },
    { label:'Abandon them', fx:() => 'Lose the helicopter. Morale −12.', apply:s => { s.b.helo.multi--; add(s,'morale',-12); return 'The crew was lost.'; } },
  ] });
ev({ id:'lost_patrol', title:'Scout Patrol Cut Off', kind:'INTEL', cond:s => s.turn > 2 && !!worstNeighbor(s) && s.regions[worstNeighbor(s)].z > .003,
  ctx:s => ({ n:worstNeighbor(s) }),
  text:(s,c) => `An MCV-L scout section probing ${RD[c.n].name} threw a track and is surrounded. Three crew and six scouts are holding inside the hull, and their sensor feed is still live.`,
  options:[
    { label:'Send the QRF', fx:() => '−6 Fuel, −5 Ammo. Some risk of casualties. Morale +5, and the scouts\' data gives Containment +8% here.', req:s => (s.b.fuel >= 6 && s.b.ammo >= 5) || 'Needs 6 Fuel and 5 Ammo',
      apply:s => { s.b.fuel -= 6; s.b.ammo -= 5; let x = ''; if (rnd(s) < .3) { cas(s, .01); x = ' The QRF took losses getting them out.'; } add(s,'morale',5); contain(s, .08); return 'The QRF pulled the scouts out.' + x; } },
    { label:'Gun run to break them out', fx:(s,c) => `Attack helicopters clear the way and destroy infected in ${RD[c.n].name}. −4 Fuel, −6 Ammo. Morale +3.`, req:s => (s.b.helo.attack > 0 && s.b.fuel >= 4 && s.b.ammo >= 6) || 'Needs an attack helicopter, 4 Fuel and 6 Ammo',
      apply:(s,c) => { s.b.fuel -= 4; s.b.ammo -= 6; const k = doKill(s, clamp(.04 * scale(c.n), 0, .2), c.n); add(s,'morale',3); return `Gun runs over ${RD[c.n].name} destroyed ${M(k)} infected and the scouts drove out.`; } },
    { label:'Tell them to bail out on foot', fx:() => 'The MCV-L is lost and some scouts don\'t make it. Morale −6, Supply −6.',
      apply:s => { add(s,'morale',-6); s.b.supply = Math.max(0, s.b.supply - 6); cas(s, .006); return 'The scouts escaped on foot. The MCV-L was lost.'; } },
  ] });
ev({ id:'press', title:'Embedded Journalist', kind:'COMMAND',
  text:s => `A war correspondent wants full access to brigade operations in ${TD(s).name}.`,
  options:[
    { label:'Full access', fx:() => '60%: Trust +8. 40%: Trust −6.', apply:s => { if (rnd(s) < .6) { add(s,'trust',8); return 'The story made the brigade look heroic.'; } add(s,'trust',-6); return 'The story focused on civilian deaths.'; } },
    { label:'Guided tour', fx:() => 'Trust +3. −1 Command Point next week.', apply:s => { add(s,'trust',3); s.b.cpNext -= 1; return 'A careful tour produced a careful story.'; } },
    { label:'Deny access', fx:() => 'Trust −2.', apply:s => { add(s,'trust',-2); return 'Access denied.'; } },
  ] });
ev({ id:'water', title:'Contaminated Water', kind:'MEDICAL',
  text:s => `Lab tests show the brigade's water source is contaminated with infected tissue.`,
  options:[
    { label:'Purify everything', fx:() => '−10 Supply.', req:s => s.b.supply >= 10 || 'Needs 10 Supply', apply:s => { s.b.supply -= 10; return 'Water purified.'; } },
    { label:'Ration bottled water', fx:() => 'Morale −6.', apply:s => { add(s,'morale',-6); return 'Water rationed.'; } },
    { label:'Risk it', fx:() => '50%: Exposure +20.', apply:s => { if (rnd(s) < .5) { add(s,'exposure',20); return 'Several soldiers fell sick.'; } return 'Nobody got sick. This time.'; } },
  ] });
ev({ id:'ship', title:'Cruise Ship Requests Port', kind:'CIVIL', cond:s => s.b.loc !== 'CAS',
  text:s => `A cruise ship with 3,000 aboard requests to dock in ${TD(s).name}. The captain says nobody is sick. Radio chatter says otherwise.`,
  options:[
    { label:'Board and screen', fx:() => 'Aviation Security Co boards. Trust +4, Exposure +10, light casualties.', apply:s => { add(s,'trust',4); add(s,'exposure',10); const c = cas(s,.01,['avsec']); s.stats.saved += 2.6/1000; return `Boarding team screened the passengers. ${c} casualties.`; } },
    { label:'Deny docking', fx:() => 'Morale −4.', apply:s => { add(s,'morale',-4); return 'The ship was turned away.'; } },
    { label:'Let them dock', fx:() => 'Trust +2. Infection in theater rises.', apply:s => { add(s,'trust',2); const r = T(s); const i = Math.min(r.h - r.safe, 0.0004 + r.z*.05); r.z += i; r.h -= i; return 'The ship docked. Some passengers were infected.'; } },
  ] });
ev({ id:'allied', title:'Allied Brigade Breaking', kind:'COMBAT', cond:s => !!allyNeighbor(s),
  ctx:s => ({ n: allyNeighbor(s) }),
  text:(s,c) => `A national army brigade in ${RD[c.n].name} is collapsing and asking for help.`,
  options:[
    { label:'Send a battalion', fx:(s,c) => `Casualties to one battalion. ${RD[c.n].name}: Order +20, infected −8%. Trust +8.`, apply:(s,c) => { const r = s.regions[c.n]; r.order = Math.min(100, r.order + 20); const k = r.z*.08; r.z -= k; r.d += k; add(s,'trust',8); const n = cas(s,.04); return `Relief force stabilized ${RD[c.n].name}. ${n} casualties.`; } },
    { label:'Absorb survivors', fx:(s,c) => `+8% strength to your weakest battalion. ${RD[c.n].name}: Order −10.`, apply:(s,c) => { heal(s, weakestBns(s,1), .08); s.regions[c.n].order = Math.max(0, s.regions[c.n].order - 10); return 'Survivors joined the brigade.'; } },
    { label:'Leave them', fx:() => 'Morale −4.', apply:s => { add(s,'morale',-4); return 'The brigade held its sector.'; } },
  ] });
ev({ id:'cult', title:'The Choir', kind:'CIVIL', cond:s => s.turn > 5 && !T(s).fallen,
  text:s => `A doomsday cult in ${TD(s).name} believes the infected are chosen. They are cutting fences and opening shelters.`,
  options:[
    { label:'Raid the compound', fx:() => '−4 Ammo, light casualties. Order +10.', apply:s => { add(s,'ammo',-4); const c = cas(s,.012); T(s).order = Math.min(100, T(s).order + 10); return `The compound was cleared. ${c} casualties.`; } },
    { label:'Negotiate', fx:() => '−8 Supply. Order +4.', req:s => s.b.supply >= 8 || 'Needs 8 Supply', apply:s => { s.b.supply -= 8; T(s).order = Math.min(100, T(s).order + 4); return 'An uneasy truce with the Choir.'; } },
    { label:'Ignore them', fx:() => 'Order −10. 30%: lose 15 Supply to sabotage.', apply:s => { T(s).order = Math.max(0, T(s).order - 10); if (rnd(s) < .3) { add(s,'supply',-15); return 'The Choir burned a supply dump.'; } return 'The Choir spread its message.'; } },
  ] });
ev({ id:'vaccine', phase:'outbreak', title:'Vaccine Candidate', kind:'RESEARCH', cond:s => s.research > 15,
  text:s => `A lab has shipped an untested vaccine candidate. There is enough for the brigade or for a full trial.`,
  options:[
    { label:'Inoculate the brigade', fx:() => 'Exposure drops to 0. 25%: side effects, −8% strength to all battalions.', apply:s => { s.b.exposure = 0; if (rnd(s) < .25) { cas(s,.08,['bn1','bn2','bn3']); return 'Exposure cleared, but side effects hit hard.'; } return 'Exposure cleared without side effects.'; } },
    { label:'Send it to the labs', fx:() => 'Research +4%.', apply:s => { s.research += 4; return 'Trial data added 4% research.'; } },
  ] });
ev({ id:'grid', title:'Grid Failure', kind:'LOGISTICS', cond:s => !T(s).fallen,
  text:s => `Power and civilian networks have collapsed across ${TD(s).name}.`,
  options:[
    { label:'Restore with Signal teams', fx:() => '−8 Supply. Order +5.', req:s => (s.b.supply >= 8 && s.b.en.comms) || 'Needs 8 Supply and Signal online', apply:s => { s.b.supply -= 8; T(s).order = Math.min(100,T(s).order+5); return 'Signal teams restored critical power and networks.'; } },
    { label:'Go dark', fx:() => '−1 Command Point next week. Order −6.', apply:s => { s.b.cpNext -= 1; T(s).order = Math.max(0,T(s).order-6); return 'The region went dark.'; } },
  ] });
ev({ id:'looters', title:'Depot Looted', kind:'LOGISTICS',
  text:s => `Hungry civilians are breaking into a brigade supply depot.`,
  options:[
    { label:'Warning shots', fx:() => 'Order −8. Keep the supplies.', apply:s => { T(s).order = Math.max(0,T(s).order-8); return 'The crowd scattered.'; } },
    { label:'Let them take it', fx:() => '−15 Supply. Order +6, Morale +3.', apply:s => { add(s,'supply',-15); T(s).order = Math.min(100,T(s).order+6); add(s,'morale',3); return 'The depot fed thousands.'; } },
  ] });
ev({ id:'signal', phase:'outbreak', title:'The Signal', kind:'INTEL', cond:s => s.turn > 4,
  text:s => `A looped radio broadcast is coming from deep inside a dead city: "We have a cure. Come get us."`,
  options:[
    { label:'Send a scout team', fx:() => '50%: Research +3% and survivors. 50%: ambush, casualties, Morale −6.', apply:s => { if (rnd(s) < .5) { s.research += 3; s.stats.saved += .2; return 'Scouts found a team of doctors and their data. +3% research.'; } const c = cas(s,.02); add(s,'morale',-6); return `It was a trap. ${c} casualties.`; } },
    { label:'Ignore it', fx:() => 'No effect.', apply:() => 'The broadcast kept looping.' },
  ] });
ev({ id:'letters', title:'News from Home', kind:'COMMAND', cond:s => s.turn > 6,
  text:s => `Soldiers are hearing that their hometowns are under siege. Families are begging for news.`,
  options:[
    { label:'Open a comms window', fx:() => '−1 Command Point next week. Morale +10.', apply:s => { s.b.cpNext -= 1; add(s,'morale',10); return 'Soldiers reached their families.'; } },
    { label:'Comms blackout', fx:() => 'Morale −6.', apply:s => { add(s,'morale',-6); return 'The blackout held, and so did the rumors.'; } },
  ] });
ev({ id:'reservists', title:'Reservists Offered', kind:'COMMAND', cond:s => allMan(s) < .9,
  text:s => `Higher command can fly in a battalion of hastily trained reservists as fillers.`,
  options:[
    { label:'Accept', fx:() => '+12% strength to all maneuver battalions. −12 Supply. Morale −3.', req:s => s.b.supply >= 12 || 'Needs 12 Supply', apply:s => { s.b.supply -= 12; heal(s,['bn1','bn2','bn3'],.12); for (const k of BNS) s.b.vet[k].xp *= .9; add(s,'morale',-3); return 'Reservists distributed across the battalions. Experience diluted a little.'; } },
    { label:'Decline', fx:() => 'Trust +3.', apply:s => { add(s,'trust',3); return 'You declined the reservists.'; } },
  ] });
ev({ id:'smugglers', title:'Smugglers', kind:'LOGISTICS',
  text:s => `Smugglers with a fuel truck and a warehouse of canned food want to trade.`,
  options:[
    { label:'Ammo for fuel', fx:() => '−12 Ammo, +20 Fuel.', req:s => s.b.ammo >= 12 || 'Needs 12 Ammo', apply:s => { s.b.ammo -= 12; add(s,'fuel',20); return 'Traded ammo for fuel.'; } },
    { label:'Med for food', fx:() => '−8 Med, +20 Supply.', req:s => s.b.med >= 8 || 'Needs 8 Med', apply:s => { s.b.med -= 8; add(s,'supply',20); return 'Traded medical stock for food.'; } },
    { label:'Arrest them', fx:() => 'Trust +4. Order −4.', apply:s => { add(s,'trust',4); T(s).order = Math.max(0,T(s).order-4); return 'Smugglers detained.'; } },
  ] });
ev({ id:'armory', title:'Abandoned Armory', kind:'LOGISTICS',
  text:s => `Scouts found an intact armory in ${TD(s).name}, surrounded by infected.`,
  options:[
    { label:'Clear it', fx:() => '+25 Ammo. 30%: light casualties.', apply:s => { add(s,'ammo',25); if (rnd(s) < .3) return `Armory cleared. ${cas(s,.01)} casualties.`; return 'Armory cleared without losses.'; } },
    { label:'Give it to the locals', fx:() => 'Order +12.', apply:s => { T(s).order = Math.min(100,T(s).order+12); return 'Local forces rearmed.'; } },
  ] });
ev({ id:'hospital', title:'Survivors in the Hospital', kind:'CIVIL', cond:s => T(s).z > .005,
  text:s => `Hundreds of patients and staff are barricaded inside a hospital in ${TD(s).name}.`,
  options:[
    { label:'Rescue them', fx:() => '−6 Fuel. Morale +8, Exposure +8, light casualties.', req:s => s.b.fuel >= 6 || 'Needs 6 Fuel', apply:s => { s.b.fuel -= 6; add(s,'morale',8); add(s,'exposure',8); const c = cas(s,.01); s.stats.saved += .0006; return `Hospital evacuated. ${c} casualties.`; } },
    { label:'Airdrop supplies', fx:() => '−10 Supply. Morale +3.', req:s => s.b.supply >= 10 || 'Needs 10 Supply', apply:s => { s.b.supply -= 10; add(s,'morale',3); return 'Supplies dropped on the hospital roof.'; } },
    { label:'Leave them', fx:() => 'Morale −8.', apply:s => { add(s,'morale',-8); return 'The hospital went silent two days later.'; } },
  ] });
ev({ id:'cold_front', title:'Arctic Front', kind:'LOGISTICS', cond:s => TD(s).clim === 'cold',
  text:s => `Temperatures in ${TD(s).name} have dropped to −30°C. The infected are slowing down. So are your vehicles.`,
  options:[
    { label:'Burn fuel for heat', fx:() => '−12 Fuel. Containment +20%.', req:s => s.b.fuel >= 12 || 'Needs 12 Fuel', apply:s => { s.b.fuel -= 12; contain(s,.2); return 'Heaters ran around the clock.'; } },
    { label:'Tough it out', fx:() => 'Morale −8, light casualties. Containment +20%.', apply:s => { add(s,'morale',-8); cas(s,.01); contain(s,.2); return 'Frostbite cases climbed.'; } },
  ] });
ev({ id:'heat', title:'Heat Casualties', kind:'MEDICAL', cond:s => TD(s).clim === 'hot',
  text:s => `It is 46°C in the shade and soldiers are fighting in full protective gear.`,
  options:[
    { label:'Push extra water', fx:() => '−10 Supply.', req:s => s.b.supply >= 10 || 'Needs 10 Supply', apply:s => { s.b.supply -= 10; return 'Water discipline held.'; } },
    { label:'Drop protective gear', fx:() => 'Exposure +12.', apply:s => { add(s,'exposure',12); return 'Soldiers fought in shirtsleeves.'; } },
    { label:'Night operations only', fx:() => '−1 Command Point next week. Morale +2.', apply:s => { s.b.cpNext -= 1; add(s,'morale',2); return 'The brigade switched to night operations.'; } },
  ] });
ev({ id:'defector', phase:'outbreak', title:'A Scientist Walks In', kind:'RESEARCH', cond:s => s.turn > 6,
  text:s => `A virologist walked up to your perimeter claiming she worked on the pathogen before the outbreak.`,
  options:[
    { label:'Fly her to a lab', fx:() => '−8 Fuel. Research +5%.', req:s => s.b.fuel >= 8 || 'Needs 8 Fuel', apply:s => { s.b.fuel -= 8; s.research += 5; return 'She is now at the bench. +5% research.'; } },
    { label:'Debrief her here', fx:() => 'Research +2%. Trust +3.', apply:s => { s.research += 2; add(s,'trust',3); return 'Her debrief went up the chain. +2% research.'; } },
  ] });
ev({ id:'drones', title:'Rogue Drones', kind:'AIR', cond:s => s.turn > 5,
  text:s => `A warlord's drone swarm is hitting your supply convoys.`,
  options:[
    { label:'Air Defense engages', fx:() => '−6 Ammo.', req:s => (s.b.u.ad > .2 && s.b.ammo >= 6) || 'Needs Air Defense Bn and 6 Ammo', apply:s => { s.b.ammo -= 6; return 'MCV-M/A batteries shot down the swarm.'; } },
    { label:'Absorb it', fx:() => '−15 Supply, light casualties to Transportation.', apply:s => { add(s,'supply',-15); cas(s,.04,['trans']); return 'Convoys took hits.'; } },
  ] });
ev({ id:'sabotage', title:'Company Knocked Out', kind:'LOGISTICS', cond:s => s.turn > 4,
  ctx:s => ({ e: pick(s, Object.keys(ENABLERS).filter(k => s.b.en[k])) || 'ew' }),
  text:(s,c) => `Infected overran a support area. The <b>${ENABLERS[c.e]} Company</b> lost its vehicles.`,
  options:[
    { label:'Rebuild now', fx:() => '−12 Supply. The company stays online.', req:s => s.b.supply >= 12 || 'Needs 12 Supply', apply:(s) => { s.b.supply -= 12; return 'The company was rebuilt from spares.'; } },
    { label:'Do without', fx:(s,c) => `The ${ENABLERS[c.e]} Company goes offline until a Maintenance Surge.`, apply:(s,c) => { s.b.en[c.e] = false; return `The ${ENABLERS[c.e]} Company is offline.`; } },
  ] });

// restoration-phase events
const leastCoveredNeighbor = s => { let best = null, bv = 9; for (const n of neighbors(s.b.loc)) { const r = s.regions[n]; if (!r.restored && (r.vax || 0) < bv) { bv = r.vax || 0; best = n; } } return best; };
ev({ id:'hoarding', title:'Cure Hoarding', kind:'CURE', phase:'restore', cond:s => !!leastCoveredNeighbor(s),
  ctx:s => ({ n: leastCoveredNeighbor(s) }),
  text:(s,c) => `Officials in ${TD(s).name} are sitting on a warehouse of cure doses while ${RD[c.n].name} next door goes without.`,
  options:[
    { label:'Broker a deal', fx:(s,c) => `−10 Supply. Cure coverage in ${RD[c.n].name} +20%.`, req:s => s.b.supply >= 10 || 'Needs 10 Supply', apply:(s,c) => { s.b.supply -= 10; vaccinate(s,.2,c.n); return `Doses released to ${RD[c.n].name}.`; } },
    { label:'Seize the warehouse', fx:() => 'Trust −6. Cure coverage here +25%.', apply:s => { add(s,'trust',-6); vaccinate(s,.25); return 'The brigade seized and distributed the doses.'; } },
    { label:'Stay out of it', fx:() => 'Morale −3.', apply:s => { add(s,'morale',-3); return 'The doses stayed in the warehouse.'; } },
  ] });
ev({ id:'holdout', title:'The Strongman Stays', kind:'COMMAND', phase:'restore', cond:s => !T(s).fallen,
  text:s => `The general who ran ${TD(s).name} through the outbreak refuses to hand power back to civilians.`,
  options:[
    { label:'Arrest him', fx:() => 'Needs Military Police. Light casualties. Order +15.', req:s => s.b.en.mp || 'Military Police offline', apply:s => { const c = cas(s,.015); T(s).order = Math.min(100, T(s).order + 15); return `He was arrested. ${c} casualties.`; } },
    { label:'Buy him out', fx:() => '−15 Fuel, −10 Ammo. Order +10.', req:s => (s.b.fuel >= 15 && s.b.ammo >= 10) || 'Needs 15 Fuel and 10 Ammo', apply:s => { s.b.fuel -= 15; s.b.ammo -= 10; T(s).order = Math.min(100, T(s).order + 10); return 'He retired to a villa with a full tank.'; } },
    { label:'Leave him in charge', fx:() => 'Order −10, Trust −3.', apply:s => { T(s).order = Math.max(0, T(s).order - 10); add(s,'trust',-3); return 'He is still in charge.'; } },
  ] });
ev({ id:'distrust', title:'Survivors Refuse the Cure', kind:'CIVIL', phase:'restore', cond:s => (T(s).vax || 0) < .9,
  text:s => `Rumors are spreading in ${TD(s).name} that the cure is poison. Lines at the dose stations are empty.`,
  options:[
    { label:'Take it on camera', fx:() => 'Morale +5. Cure coverage here +10%.', apply:s => { add(s,'morale',5); vaccinate(s,.1); return 'You took a dose live on air. The lines came back.'; } },
    { label:'Make it mandatory', fx:() => 'Order −10. Cure coverage here +18%.', apply:s => { T(s).order = Math.max(0, T(s).order - 10); vaccinate(s,.18); return 'Mandatory doses went ahead under guard.'; } },
    { label:'Give it time', fx:() => 'Cure coverage here +3%.', apply:s => { vaccinate(s,.03); return 'Slowly, people came around.'; } },
  ] });
ev({ id:'waking', title:'The Waking', kind:'CURE', phase:'restore', cond:s => T(s).z > .001,
  text:s => `A horde stopped in the middle of a street in ${TD(s).name}. Then they started crying. Thousands of newly cured people need food, water and care.`,
  options:[
    { label:'Shelter them', fx:s => `−15 Supply. Morale +8, Trust +4. Cures about ${est(s,.04)} more.`, req:s => s.b.supply >= 15 || 'Needs 15 Supply', apply:s => { s.b.supply -= 15; add(s,'morale',8); add(s,'trust',4); const m = cureInfected(s,.04); return `The brigade cared for ${M(m)} newly cured people.`; } },
    { label:'Hand them to local aid', fx:() => 'Order −6.', apply:s => { T(s).order = Math.max(0, T(s).order - 6); return 'Local aid groups were overwhelmed.'; } },
  ] });
ev({ id:'reunion', title:'Families Reunited', kind:'COMMAND', phase:'restore',
  text:s => `Survivor lists are going up on walls across ${TD(s).name}. Soldiers are finding names they know.`,
  options:[
    { label:'Let soldiers help', fx:() => '−1 Command Point next week. Morale +12, Trust +3.', apply:s => { s.b.cpNext -= 1; add(s,'morale',12); add(s,'trust',3); return 'Soldiers helped families find each other.'; } },
    { label:'Stay on mission', fx:() => 'No effect.', apply:() => 'The brigade stayed on mission.' },
  ] });
ev({ id:'relapse', title:'Holdout Horde', kind:'COMBAT', phase:'restore', cond:s => T(s).z > .0005 || T(s).fallen,
  text:s => `A pocket of infected that the cure can't reach is pushing out of a dead district in ${TD(s).name}.`,
  options:[
    { label:'Burn it out', fx:s => `−10 Ammo. Kill ${pc(kp(s,.15,man(s),'COMBAT',false))} of infected here.`, req:s => s.b.ammo >= 10 || 'Needs 10 Ammo', apply:s => { s.b.ammo -= 10; const k = doKill(s, kp(s,.15,man(s),'COMBAT',false)); return `The holdout horde was destroyed: ${M(k)}.`; } },
    { label:'Wall it off', fx:() => '−8 Supply. Quarantine +20%, Containment +25%.', req:s => s.b.supply >= 8 || 'Needs 8 Supply', apply:s => { s.b.supply -= 8; T(s).quar = clamp(T(s).quar + .2, 0, .95); contain(s,.25); return 'Engineers walled off the district.'; } },
    { label:'Let it break out', fx:() => 'Infection here rises.', apply:s => { const r = T(s); const i = Math.min(Math.max(0, r.h - r.safe) * (1 - (r.vax || 0)), .004); r.z += i; r.h -= i; return 'The horde broke into the suburbs.'; } },
  ] });
ev({ id:'rotation', title:'Rotation Home', kind:'COMMAND', phase:'restore', cond:s => allMan(s) < .85,
  text:s => `Higher command can fly your most worn-out battalion home and send a fresh one in its place.`,
  options:[
    { label:'Rotate them home', fx:s => `${UNITS[weakestBns(s,1)[0]].name} back to full strength, but Green with a new commander. −2 Command Points next week.`, apply:s => { const k = weakestBns(s,1)[0]; s.b.u[k] = 1; s.b.vet[k] = { xp:0, cdr:newCdr(s) }; s.b.cpNext -= 2; return `A fresh battalion under ${s.b.vet[k].cdr.name} replaced the ${UNITS[k].name}.`; } },
    { label:'Keep them here', fx:() => 'Morale −5, Trust +2.', apply:s => { add(s,'morale',-5); add(s,'trust',2); return 'The battalion stayed.'; } },
  ] });
ev({ id:'tribunal', title:'Civilian Deaths Inquiry', kind:'COMMAND', phase:'restore', once:true, cond:s => (s.stats.civLost || 0) > .3,
  text:s => `Investigators want to know about the ${M(s.stats.civLost || 0)} civilians killed in brigade strikes during the outbreak.`,
  options:[
    { label:'Testify openly', fx:() => 'Trust −5, Morale +5.', apply:s => { add(s,'trust',-5); add(s,'morale',5); return 'You testified. The record is public.'; } },
    { label:'Stonewall', fx:() => '50%: Trust −12. 50%: no effect.', apply:s => { if (rnd(s) < .5) { add(s,'trust',-12); return 'The press found the records.'; } return 'The inquiry stalled.'; } },
  ] });

// forced / priority events
ev({ id:'outbreak_ranks', title:'Outbreak in the Ranks', kind:'MEDICAL', weight:0,
  ctx:s => ({ bn: weakestBns(s,3).slice(-1)[0] }),
  text:(s,c) => `Exposure has reached critical levels. Soldiers in the ${UNITS[c.bn].name} are turning inside the perimeter.`,
  options:[
    { label:'Quarantine the battalion', fx:(s,c) => `${UNITS[c.bn].name} loses 30% strength. Exposure drops to 25.`, apply:(s,c) => { s.b.u[c.bn] = Math.max(0, s.b.u[c.bn] - .3); s.stats.kia += Math.round(.3*650); s.b.exposure = 25; add(s,'morale',-6); return `The ${UNITS[c.bn].name} was quarantined. Hundreds lost.`; } },
    { label:'Brigade-wide lockdown', fx:() => '−2 Command Points next week. Morale −12. Exposure drops to 40.', apply:s => { s.b.cpNext -= 2; add(s,'morale',-12); s.b.exposure = 40; return 'The brigade locked down.'; } },
    { label:'Mass decontamination', fx:() => '−20 Med. −6% strength to all battalions. Exposure drops to 30.', req:s => s.b.med >= 20 || 'Needs 20 Med', apply:s => { s.b.med -= 20; cas(s,.06,['bn1','bn2','bn3']); s.b.exposure = 30; return 'Mass decon contained the outbreak.'; } },
  ] });
ev({ id:'lab_siege', title:'Lab Under Siege', kind:'RESEARCH', weight:0,
  text:(s,c) => { const l = s.labs[c.lab]; return `<b>${l.name}</b> in ${RD[l.region].name} is about to be overrun. The scientists and their work must move now or be lost.`; },
  options:[
    { label:'Airlift to the brigade', fx:(s,c) => `−12 Fuel. Lab relocates to ${TD(s).name}. Research −2%.`, req:(s,c) => (s.b.fuel >= 12 && (s.b.helo.multi > 0 || s.b.helo.heavy > 0) && !T(s).fallen && T(s).z < .12 && s.b.loc !== s.labs[c.lab].region && !labIn(s, s.b.loc)) || 'Needs 12 Fuel, a helicopter and a safe theater without a lab', apply:(s,c) => { s.b.fuel -= 12; s.labs[c.lab].region = s.b.loc; s.research = Math.max(0, s.research - 2); return `${s.labs[c.lab].name} relocated to ${TD(s).name}.`; } },
    { label:'Evacuate to safest region', fx:(s,c) => { const t = safestLabHost(s, c.lab); return t ? `Lab relocates to ${RD[t].name}. Research −4%.` : 'No safe region available.'; }, req:(s,c) => !!safestLabHost(s,c.lab) || 'No safe region available', apply:(s,c) => { const t = safestLabHost(s,c.lab); s.labs[c.lab].region = t; s.research = Math.max(0, s.research - 4); return `${s.labs[c.lab].name} relocated to ${RD[t].name}.`; } },
    { label:'Hold in place', fx:() => 'The lab stays. If the region falls, it is lost.', apply:(s,c) => `${s.labs[c.lab].name} is holding in place.` },
  ] });
ev({ id:'mutiny', title:'Discipline Breaking Down', kind:'COMMAND', weight:0,
  text:s => `Morale is collapsing. Fights in the chow line, sleeping on watch, talk of desertion.`,
  options:[
    { label:'Stand down to rest', fx:() => '−2 Command Points next week. Morale +15.', apply:s => { s.b.cpNext -= 2; add(s,'morale',15); return 'The brigade stood down to rest.'; } },
    { label:'Address the troops', fx:() => '−1 Command Point next week. Morale +8.', apply:s => { s.b.cpNext -= 1; add(s,'morale',8); return 'You spoke to every company.'; } },
    { label:'Make an example', fx:() => 'Morale +6, Trust −6.', apply:s => { add(s,'morale',6); add(s,'trust',-6); return 'A court-martial restored order, for now.'; } },
  ] });
ev({ id:'inquiry', title:'Inspector General Inquiry', kind:'COMMAND', weight:0,
  text:s => `Higher command has lost confidence in your leadership. An Inspector General team has landed.`,
  options:[
    { label:'Comply fully', fx:() => '−1 Command Point next week. Trust +12.', apply:s => { s.b.cpNext -= 1; add(s,'trust',12); return 'The IG team left satisfied.'; } },
    { label:'Polish the report', fx:() => '70%: Trust +8. 30%: Trust −8.', apply:s => { if (rnd(s) < .7) { add(s,'trust',8); return 'The report landed well.'; } add(s,'trust',-8); return 'The IG saw through the report.'; } },
  ] });
ev({ id:'mutation', title:'Mutation Detected', kind:'RESEARCH', weight:0,
  text:(s,c) => { const m = MUTATIONS.find(x => x.id === c.m); return `Lab analysis confirms the pathogen has mutated: <b>${m.name}</b>. ${m.text}`; },
  options:[
    { label:'Rush samples to the labs', fx:() => 'Research +3%. The mutation takes full effect.', apply:(s,c) => { s.research += 3; applyMutation(s, c.m, 1); return 'Samples shipped. +3% research.'; } },
    { label:'Change tactics', fx:() => '−1 Command Point next week. The mutation is half as strong.', apply:(s,c) => { s.b.cpNext -= 1; applyMutation(s, c.m, .5); return 'New tactics blunted the mutation.'; } },
  ] });

function allyNeighbor(s) { for (const n of neighbors(s.b.loc)) { const r = s.regions[n]; if (!r.fallen && r.z > .05 && r.order < 60) return n; } return null; }
function safestLabHost(s, li) { let best = null, bz = 9; for (const r of REGIONS) { const rs = s.regions[r.id]; if (rs.fallen || labIn(s, r.id) || r.id === s.labs[li].region) continue; const sc = rs.z + (1 - rs.order/100) * .02; if (sc < bz) { bz = sc; best = r.id; } } return best; }
function applyMutation(s, id, strength) {
  const m = MUTATIONS.find(x => x.id === id); const before = Object.assign({}, s.path); m.fx(s.path);
  for (const k of ['inf','aggr','resil','coldTol','spread']) s.path[k] = before[k] + (s.path[k] - before[k]) * strength;
  s.path.traits.push(m.name);
}

function chooseCrisis(s) {
  const b = s.b;
  if (b.exposure >= 100) return { id:'outbreak_ranks', ctx:EVENTS.outbreak_ranks.ctx(s) };
  for (let i = 0; i < s.labs.length; i++) { const l = s.labs[i]; if (!l.active || l.sieged) continue; const r = s.regions[l.region]; if (!r.fallen && (r.order < 25 || r.z > .2)) { l.sieged = true; return { id:'lab_siege', ctx:{ lab:i } }; } }
  if (b.morale < 20 && !(s.cool.mutiny > s.turn - 4)) { s.cool.mutiny = s.turn; return { id:'mutiny', ctx:{} }; }
  if (b.trust < 15 && !(s.cool.inquiry > s.turn - 4)) { s.cool.inquiry = s.turn; return { id:'inquiry', ctx:{} }; }
  if (s.phase !== 'restore' && s.turn >= s.nextMutation) { const avail = MUTATIONS.filter(m => !s.path.traits.includes(m.name)); s.nextMutation = s.turn + rint(s, 6, 9); if (avail.length) return { id:'mutation', ctx:{ m: pick(s, avail).id } }; }
  if (rnd(s) > .8) return null;
  const pool = Object.values(EVENTS).filter(e => e.weight > 0 && (!e.phase || e.phase === (s.phase || 'outbreak')) && !(s.cool[e.id] > s.turn - 7) && !(e.once && s.cool[e.id]) && e.cond(s));
  if (!pool.length) return null;
  let tot = pool.reduce((a, e) => a + e.weight, 0), r = rnd(s) * tot;
  for (const e of pool) { r -= e.weight; if (r <= 0) { s.cool[e.id] = s.turn; return { id:e.id, ctx:e.ctx(s) }; } }
  return null;
}
function crisisOptions(s) {
  if (!s.crisis) return [];
  const e = EVENTS[s.crisis.id]; const c = s.crisis.ctx;
  return e.options.map((o, i) => { const r = o.req ? o.req(s, c) : true; return { i, label:o.label, fx:o.fx(s, c), ok:r === true, why:r === true ? '' : r }; });
}
function resolveCrisis(s, i) {
  if (!s.crisis) return { ok:false };
  const e = EVENTS[s.crisis.id]; const o = e.options[i]; const c = s.crisis.ctx;
  const r = o.req ? o.req(s, c) : true; if (r !== true) return { ok:false, msg:r };
  const msg = o.apply(s, c); s.log.push(e.title + ': ' + msg); s.crisis = null; checkOver(s);
  return { ok:true, msg };
}

// ---------------------------------------------------------------- directives
function makeDirective(s) {
  const opts = [];
  if (s.phase === 'restore') {
    const near = REGIONS.filter(r => hops(s.b.loc, r.id) <= 2);
    const fallen = REGIONS.filter(r => s.regions[r.id].fallen && hops(s.b.loc, r.id) <= 3).sort((a, b) => s.regions[a.id].z - s.regions[b.id].z)[0];
    if (fallen) opts.push({ type:'reclaim', region:fallen.id, len:6, text:`Reclaim fallen ${fallen.name}: get its infection under 12%.`, reward:'Trust +12, Morale +10' });
    const rest = near.filter(r => !s.regions[r.id].restored && !s.regions[r.id].fallen).sort((a, b) => s.regions[a.id].z - s.regions[b.id].z)[0];
    if (rest) opts.push({ type:'restore', region:rest.id, len:6, text:`Restore ${rest.name}: infected under 0.5%, order 50+, cure coverage 50%+.`, reward:'Trust +10, +10% to all battalions' });
    const low = near.filter(r => !s.regions[r.id].restored && (s.regions[r.id].vax || 0) < .45).sort((a, b) => (s.regions[a.id].vax || 0) - (s.regions[b.id].vax || 0))[0];
    if (low) opts.push({ type:'vax', region:low.id, len:4, text:`Raise cure coverage in ${low.name} to 60%.`, reward:'Trust +8, supply drop' });
    if (!opts.length) opts.push({ type:'evac', base:s.stats.saved, need:4, len:4, text:'Save 4M more civilians (evacuations, rescues, safe zones).', reward:'Trust +12, Morale +10' });
    const d = pick(s, opts); d.deadline = s.turn + d.len; d.issued = s.turn; return d;
  }
  const lab = activeLabs(s).filter(l => !s.regions[l.region].fallen && l.region !== s.b.loc).sort((a, b) => hops(s.b.loc, a.region) - hops(s.b.loc, b.region))[0];
  if (lab) opts.push({ type:'lab', region:lab.region, text:`Reinforce ${lab.name}: end a week with the brigade or a Task Force in ${RD[lab.region].name}.`, reward:'Research +4%, Trust +10' });
  opts.push({ type:'samples', base:s.flags.researchCards, text:'Get the labs fresh data: play a Research card.', reward:'Labs +6% faster, Trust +10' });
  opts.push({ type:'evac', base:s.stats.saved, need:4, text:'Save 4M more civilians (evacuations, rescues, safe zones).', reward:'Trust +12, Morale +10' });
  const near = REGIONS.filter(r => { const x = s.regions[r.id]; return !x.fallen && x.z > .004 && x.z < .3 && hops(s.b.loc, r.id) <= 2; }).sort((a, b) => s.regions[b.id].z - s.regions[a.id].z)[0];
  if (near) { const tz = s.regions[near.id].z * .6; opts.push({ type:'suppress', region:near.id, target:tz, text:`Cut infection in ${near.name} below ${(tz*100).toFixed(1)}%.`, reward:'Trust +12, +10% to all battalions' }); }
  const stb = REGIONS.filter(r => { const x = s.regions[r.id]; return !x.fallen && !x.stab && x.z > 0 && x.z < .12 && hops(s.b.loc, r.id) <= 2; }).sort((a, b) => s.regions[a.id].z - s.regions[b.id].z)[0];
  if (stb) opts.push({ type:'stabilize', region:stb.id, len:5, text:`Stabilize ${stb.name}: containment 50%+, quarantine 35%+, infected under 3%.`, reward:'Trust +10, Morale +6' });
  const hold = REGIONS.filter(r => { const x = s.regions[r.id]; return !x.fallen && x.z > .02 && hops(s.b.loc, r.id) <= 2; })[0];
  if (hold) opts.push({ type:'hold', region:hold.id, text:`Keep ${hold.name} from falling until the deadline.`, reward:'Trust +8, supply drop' });
  const d = pick(s, opts); d.deadline = s.turn + (d.len || 4); d.issued = s.turn; return d;
}
function checkDirective(s, rep, atDeadline) {
  const d = s.directive; if (!d) return;
  let ok = false;
  if (d.type === 'lab') ok = (s.b.loc === d.region || (s.b.tf && s.b.tf.loc === d.region)) && !s.regions[d.region].fallen;
  if (d.type === 'samples') ok = s.flags.researchCards > d.base;
  if (d.type === 'evac') ok = s.stats.saved - d.base >= d.need;
  if (d.type === 'suppress') ok = s.regions[d.region].z < d.target && !s.regions[d.region].fallen;
  if (d.type === 'hold') ok = atDeadline && !s.regions[d.region].fallen;
  if (d.type === 'stabilize') ok = s.regions[d.region].stab > 0;
  if (d.type === 'reclaim') ok = !s.regions[d.region].fallen;
  if (d.type === 'restore') ok = !!s.regions[d.region].restored;
  if (d.type === 'vax') ok = (s.regions[d.region].vax || 0) >= .6;
  if (ok) {
    if (d.type === 'reclaim') { add(s,'trust',12); add(s,'morale',10); }
    if (d.type === 'restore') { add(s,'trust',10); heal(s,['bn1','bn2','bn3'],.1); }
    if (d.type === 'vax') { add(s,'trust',8); add(s,'supply',20); add(s,'ammo',15); add(s,'fuel',15); }
    if (d.type === 'lab') { s.research += 4; add(s,'trust',10); }
    if (d.type === 'samples') { s.know = Math.min(1.5, s.know + .06); add(s,'trust',10); }
    if (d.type === 'evac') { add(s,'trust',12); add(s,'morale',10); }
    if (d.type === 'suppress') { add(s,'trust',12); heal(s,['bn1','bn2','bn3'],.1); }
    if (d.type === 'hold') { add(s,'trust',8); add(s,'supply',20); add(s,'ammo',15); add(s,'fuel',15); }
    if (d.type === 'stabilize') { add(s,'trust',10); add(s,'morale',6); }
    rep.items.push({ k:'good', t:`Directive complete: ${d.text} (${d.reward})` });
    s.stats.directivesWon++; s.directive = null; s.nextDirective = s.turn + 2;
    s.pendingReward = { reason:'Directive complete', options:rewardOptions(s) };
  } else if (atDeadline) {
    add(s,'trust',-12); add(s,'morale',-5);
    rep.items.push({ k:'bad', t:`Directive failed: ${d.text} Trust −12, Morale −5.` });
    s.stats.directivesLost++; s.directive = null; s.nextDirective = s.turn + 2;
  }
}
function rewardOptions(s) {
  const out = []; let guard = 0;
  while (out.length < 3 && guard++ < 200) {
    const r = rnd(s); const tier = r < .1 ? 'rare' : r < .4 ? 'uncommon' : 'common';
    const cand = (s.phase === 'restore' ? RPOOL : POOL).filter(id => (CARDS[id].rarity === tier || (tier === 'common' && CARDS[id].rarity === 'starter')) && !out.includes(id));
    if (cand.length) out.push(pick(s, cand));
  }
  return out;
}
function takeReward(s, choice) {
  const pr = s.pendingReward; if (!pr) return;
  if (choice === 'supply') { add(s,'supply',15); add(s,'ammo',10); s.log.push('Took a supply drop instead of a new card.'); }
  else if (typeof choice === 'string' && choice.startsWith('remove:')) { const id = choice.slice(7); for (const pile of ['draw','discard','hand']) { const i = s.deck[pile].indexOf(id); if (i >= 0) { s.deck[pile].splice(i, 1); break; } } s.log.push(`Removed ${cardName(id)} from the deck.`); }
  else if (typeof choice === 'string' && choice.startsWith('upgrade:')) { const id = choice.slice(8); if (!canUpgrade(id)) return; for (const pile of ['draw','discard','hand']) { const i = s.deck[pile].indexOf(id); if (i >= 0) { s.deck[pile][i] = id + '+'; break; } } s.log.push(`Upgraded ${cardName(id)}: it now costs ${costOf(id + '+')} Command Point${costOf(id + '+') === 1 ? '' : 's'}.`); }
  else if (pr.options.includes(choice)) { s.deck.discard.push(choice); s.log.push(`${CARDS[choice].name} added to the deck.`); }
  s.pendingReward = null;
}
function deckList(s) { return [...s.deck.draw, ...s.deck.discard, ...s.deck.hand]; }
function boardOptions(s) { const left = Object.keys(DOCTRINES).filter(id => !hasD(s, id)); shuffle(s, left); return left.slice(0, 3); }
function takeDoctrine(s, id) {
  const pd = s.pendingDoctrine; if (!pd || !pd.options.includes(id)) return { ok:false };
  (s.doct = s.doct || []).push(id); s.pendingDoctrine = null;
  if (id === 'rotary') { const lost = ['attack','multi','heavy'].find(k => s.b.helo[k] < s.b.heloMax[k]); if (lost) s.b.helo[lost]++; }
  const msg = `Promotion Board: the brigade adopts ${DOCTRINES[id].name}.`; s.log.push(msg); return { ok:true, msg };
}

// ---------------------------------------------------------------- burning cards
// Burn a card from your hand: it leaves the deck for good and returns half its cost as Command Points.
// Half points are banked until they add up to a whole point.
const MIN_DECK = 8;
const burnValue = id => (def(id) ? costOf(id) : 0) / 2;
function canBurn(s, idx) {
  if (s.over) return 'Game over';
  if (s.crisis) return 'Resolve the crisis first';
  if (s.cureChoice) return 'Decide what to do with the cure first';
  if (s.deck.hand[idx] == null) return 'No card there';
  if (deckList(s).length <= MIN_DECK) return `Your deck can't go below ${MIN_DECK} cards`;
  return true;
}
function burnCard(s, idx) {
  const ok = canBurn(s, idx); if (ok !== true) return { ok:false, msg:ok };
  const id = s.deck.hand.splice(idx, 1)[0]; const v = burnValue(id);
  (s.deck.burned = s.deck.burned || []).push(id);
  s.burnBank = (s.burnBank || 0) + v;
  const gain = Math.floor(s.burnBank + 1e-9); s.burnBank = Math.round((s.burnBank - gain) * 2) / 2; s.cp += gain;
  s.stats.burned = (s.stats.burned || 0) + 1;
  const name = cardName(id);
  const msg = gain ? `Burned ${name}. +${gain} Command Point${gain > 1 ? 's' : ''}${s.burnBank ? ', ½ banked' : ''}.`
    : v ? `Burned ${name}. ½ Command Point banked. Burn another card to make a whole point.`
    : `Burned ${name}. Zero-cost cards return no Command Points.`;
  s.log.push(msg);
  return { ok:true, msg, gain };
}

// ---------------------------------------------------------------- new game
function newGame(opts) {
  opts = opts || {};
  const seed = String(opts.seed || Math.floor(Math.random() * 1e9).toString(36).toUpperCase());
  const diff = DIFFS[opts.diff] ? opts.diff : 'veteran';
  const cmd = CMD[opts.cmd] ? opts.cmd : 'mech';
  const s = { v:1, seed, diff, cmd, rng:hashSeed(seed), turn:1, research:0, know:.7, travel:1, log:[], cool:{}, flags:{ samples:0, researchCards:0 },
    stats:{ kills:0, saved:0, kia:0, cards:0, directivesWon:0, directivesLost:0, fallen:0, cured:0, civLost:0, restored:0 }, phase:'outbreak', history:[], over:null, directive:null, nextDirective:3, pendingReward:null, crisis:null };
  const D = DIFFS[diff];
  const names = ['Morrow','Kessler','Halloran','Lazarus','Ashfall','Greywater','Nightjar','Saint Elmo','Cassius','Hollow Crown','Black Lantern','Juniper'];
  const kinds = ['Strain','Fever','Syndrome','Variant'];
  s.path = { name: pick(s,names) + ' ' + pick(s,kinds), code: 'HX-' + rint(s,2,9) + 'ABCDEFGHJK'[rint(s,0,9)],
    inf: (1.30 + rnd(s) * .16) * D.inf, aggr: .85 + rnd(s) * .35, resil: .9 + rnd(s) * .25, coldTol: .6 + rnd(s) * .3, spread: .9 + rnd(s) * .25, traits:[] };
  s.regions = {};
  for (const r of REGIONS) s.regions[r.id] = { h:1, z:0, d:0, safe:0, order:35 + 60 * r.wealth, quar:0, fallen:false, contain:0, stab:0, sz:0, seen:false, vax:0, restored:false };
  s.pz = pick(s, PZ_CANDIDATES);
  const seedRegion = (id, z) => { const r = s.regions[id]; r.z = z; r.h -= z; r.seen = true; };
  seedRegion(s.pz, .0015);
  if (D.pz > 1) { const far = PZ_CANDIDATES.filter(id => hops(id, s.pz) >= 3); seedRegion(pick(s, far), .0008); }
  s.labs = REGIONS.filter(r => r.lab).map(r => ({ name:r.lab, region:r.id, active:true, sieged:false }));
  const start = pick(s, STAGING.filter(x => x !== s.pz));
  s.b = { loc:start, posture:'hold', u:{ hq:1, bn1:1, bn2:1, bn3:1, art:1, ad:1, avn:1, avsec:1, trans:1, sup:1 },
    helo:{ attack:4, multi:5, heavy:2 }, heloMax:{ attack:4, multi:5, heavy:2 }, uas:1, en:{}, supply:60, ammo:60, fuel:60, med:30, morale:80, exposure:0, trust:60,
    fort:0, fortT:0, boost:0, expoShield:0, cpNext:0, moved:false, freeMove:false, air:100, ato:null, eng:null, engUsed:false };
  for (const k in ENABLERS) s.b.en[k] = true;
  s.b.vet = {}; for (const k of BNS) s.b.vet[k] = { xp:0, cdr:newCdr(s) };
  s.b.tf = null; s.doct = []; s.nextBoard = BOARD_EVERY; s.pendingDoctrine = null;
  if (cmd === 'avn') { s.b.helo.attack++; s.b.helo.multi++; s.b.heloMax.attack++; s.b.heloMax.multi++; s.b.fuel = 80; }
  if (cmd === 'civ') s.b.trust = 75;
  s.nextMutation = rint(s, 6, 9);
  s.nextSeed = rint(s, 4, 6);
  s.deck = { draw: shuffle(s, [...STARTER, ...CMD[cmd].extra]), hand:[], discard:[], exhausted:[], burned:[] };
  s.burnBank = 0;
  s.history.push(snapshot(s));
  startTurn(s);
  s.crisis = { id:'warno', ctx:{} };
  return s;
}
function cpMax(s) { const b = s.b; let c = 3; if (b.u.hq > .5 && b.en.comms) c++; if (b.morale < 25) c--; if (s.cmd === 'hard') c++; if (hasD(s, 'staff') && b.morale >= 60) c++; return Math.max(1, c); }
// bring older saves up to date
function migrate(s) {
  if (!s || !s.b) return s;
  if (!s.b.vet) { s.b.vet = {}; for (const k of BNS) s.b.vet[k] = { xp:0, cdr:newCdr(s) }; }
  if (s.b.tf === undefined) s.b.tf = null;
  if (!s.doct) s.doct = [];
  if (!s.nextBoard) s.nextBoard = Math.max(BOARD_EVERY, Math.ceil(s.turn / BOARD_EVERY) * BOARD_EVERY);
  if (s.pendingDoctrine === undefined) s.pendingDoctrine = null;
  if (!s.deck.burned) s.deck.burned = [];
  if (s.burnBank == null) s.burnBank = 0;
  if (s.b.air == null) { s.b.air = 100; s.b.ato = null; s.b.eng = null; s.b.engUsed = false; }
  for (const r of REGIONS) { const rs = s.regions[r.id]; if (rs && rs.stab == null) rs.stab = 0; }
  return s;
}
function startTurn(s) {
  const b = s.b;
  s.cp = Math.max(0, cpMax(s) + b.cpNext); b.cpNext = 0;
  b.moved = false; b.freeMove = false; b.boost = 0; b.expoShield = 0; b.tfMoved = false; b.ato = null; b.engUsed = false;
  s.log = [];
  draw(s, hasD(s, 'drill') ? 6 : 5);
  if (s.turn >= (s.nextBoard || 99) && !s.pendingDoctrine && Object.keys(DOCTRINES).some(id => !hasD(s, id))) { s.pendingDoctrine = { options:boardOptions(s), week:s.turn }; s.nextBoard = s.turn + BOARD_EVERY; }
  if (!s.directive && s.turn >= s.nextDirective) s.directive = makeDirective(s);
  if (s.turn > 1) s.crisis = chooseCrisis(s);
}
function snapshot(s) { return { t:s.turn, h:survivors(s), z:infected(s), d:dead(s), r:s.research, rs:restoredCount(s), v:avgVax(s) }; }

// ---------------------------------------------------------------- the cure: end here or begin Phase II
function beginRestoration(s) {
  if (!s.cureChoice) return;
  s.cureChoice = false; s.phase = 'restore'; s.restoreStart = s.turn; s.restoreEnd = s.turn + RESTORE_WEEKS; s.research = 100;
  for (const pile of ['draw','discard','hand']) s.deck[pile] = s.deck[pile].map(id => REASSIGN[baseId(id)] ? REASSIGN[baseId(id)] + (isUp(id) ? '+' : '') : id);
  s.deck.discard.push('cure_convoy','cure_convoy','field_cure','census');
  for (const l of activeLabs(s)) vaccinate(s, .15, l.region);
  add(s,'trust',15); add(s,'morale',20);
  s.directive = null; s.nextDirective = s.turn + 1;
  s.log.push('Phase II begins. Research teams reassigned to cure distribution. New orders added to the deck.');
  if (s.needStart) { s.needStart = false; s.pendingReward = { reason:'The cure is out', options:rewardOptions(s) }; startTurn(s); }
  else s.directive = makeDirective(s);
}
function endAtCure(s) {
  if (!s.cureChoice) return;
  s.cureChoice = false;
  s.over = { win:true, title:'Cure Synthesized', text:`The labs have a working cure for ${s.path.name}. You handed distribution to higher command and brought the brigade home.` };
  s.over.score = score(s);
}

// ---------------------------------------------------------------- end of week
function endTurn(s) {
  if (s.over || s.crisis || s.pendingReward || s.cureChoice || s.pendingDoctrine) return null;
  const RP = s.phase === 'restore';
  const seasonBefore = seasonOf('N', monthOf(s.turn));
  const rep = { phase:s.phase || 'outbreak', restoredBefore:restoredCount(s), vaxBefore:avgVax(s), turn:s.turn, items:[], spread:[], fell:[], before:{ h:survivors(s), z:infected(s), research:s.research, pers:personnel(s) } };
  const b = s.b, P = s.path, D = DIFFS[s.diff];
  const th = T(s), thd = TD(s), post = POSTURES[b.posture];
  const sMan = man(s), e = eff(s);

  // 1. brigade presence in theater
  if (!th.fallen || th.z > 0) {
    contain(s, post.contain * sMan * e + mainBns(s).reduce((a, k) => a + (traitOf(s, k).contain || 0), 0));
    if (hasD(s, 'hearts') && !th.fallen) th.order = Math.min(100, th.order + 3);
    if (b.posture === 'hold' && !th.fallen) th.quar = clamp(th.quar + .05 * e, 0, .95);
    if (th.z > 0) { const k = doKill(s, clamp(post.kill * sMan * e * scale(b.loc), 0, .5)); if (k > 0.001) rep.items.push({ k:'info', t:`Brigade operations in ${thd.name} destroyed ${M(k)} infected.` }); }
    if (b.posture === 'relief') { const m = save(s, .008); th.order = Math.min(100, th.order + 6); add(s,'morale',1); add(s,'trust',1); if (m > .001) rep.items.push({ k:'good', t:`Relief operations secured ${M(m)} civilians.` }); }
  }
  if (RP) { const v = vaccinate(s, (.07 + (b.posture === 'relief' ? .05 : 0)) * vaxScale(b.loc) * (.5 + .5 * b.u.trans)); if (v > .001) rep.items.push({ k:'good', t:`Brigade-escorted dose stations raised cure coverage in ${thd.name} by ${pc(v)}.` }); }
  for (const l of activeLabs(s)) if (l.region === b.loc) { th.order = Math.min(100, th.order + 3); }
  if (RP && hasD(s, 'science')) vaccinate(s, .03);
  // 1b. Task Force operations in its own region
  const tf = b.tf;
  if (tf) {
    const tr = s.regions[tf.loc]; const te = e * b.u[tf.bn] * (hasD(s, 'mission') ? 1.5 : 1);
    contain(s, .14 * te + (traitOf(s, tf.bn).contain || 0), tf.loc);
    if (tr.z > 0) { const k = doKill(s, clamp(.045 * te * scale(tf.loc) * vetKill(s, [tf.bn]), 0, .4), tf.loc); if (k > .001) rep.items.push({ k:'info', t:`Task Force ${UNITS[tf.bn].name} in ${RD[tf.loc].name} destroyed ${M(k)} infected.` }); }
    if (!tr.fallen) { tr.order = Math.min(100, tr.order + 2); tr.quar = clamp(tr.quar + .03, 0, .95); }
    if (RP) vaccinate(s, .03 * vaxScale(tf.loc), tf.loc);
  }

  // 1c. field works built by the engineers
  let fbK = 0;
  for (const r of REGIONS) { const rs = s.regions[r.id]; if (!rs.works || rs.fallen) continue;
    if (rs.works.barrier) contain(s, .04, r.id);
    if (rs.works.firebase && rs.z > 0) fbK += doKill(s, clamp(.014 * scale(r.id) * (.5 + .5 * b.u.art) * cmdKill(s, 'FIRES'), 0, .1), r.id); }
  if (fbK > .001) rep.items.push({ k:'info', t:`Fire bases shelled ${M(fbK)} infected.` });
  if (th.works && th.works.hospital && !th.fallen) { heal(s, mainBns(s), .015); add(s,'med',2); const m = save(s, .003); if (m > .01) rep.items.push({ k:'good', t:`The field hospital in ${thd.name} took in ${M(m)} civilians.` }); }
  // 2. world simulation
  s.travel = s.turn > 2 ? Math.max(.15, 1 - .035 * (s.turn - 2) - .6 * fallenCount(s) / REGIONS.length) : 1;
  const z0 = {}; for (const r of REGIONS) z0[r.id] = s.regions[r.id].z;
  for (const r of REGIONS) {
    const rs = s.regions[r.id];
    // quarantine drift (borders close as the world wakes up)
    if (s.turn > 3) { const tq = (rs.z > 0 ? .1 + .3 * r.wealth : .1 + .4 * r.wealth) * Math.min(1, (s.turn - 3) / 8); if (rs.quar < tq) rs.quar = Math.min(tq, rs.quar + .04); }
    if (rs.fallen) rs.quar = Math.max(0, rs.quar - .1);
    if (RP) {
      const labF = Math.max(.25, Math.sqrt(activeLabs(s).length / 6));
      let rate = .06 * labF * (rs.fallen ? .6 : .35 + .65 * rs.order / 100) * (labIn(s, r.id) ? 1.8 : 1) * D.res;
      vaccinate(s, rate, r.id);
      if (rs.z > 0) { const c = rs.z * (.04 + .12 * rs.vax); rs.z -= c; rs.h += c; s.stats.cured = (s.stats.cured || 0) + c * r.pop; }
    }
    if (rs.z <= 0) { if (rs.z < 0) rs.z = 0; rs.order = Math.min(35 + 60 * r.wealth + 5 * rs.sz + (RP ? 10 * rs.vax : 0), rs.order + 3 + 2 * r.wealth + (RP ? 4 * rs.vax : 0)); continue; }
    const ord = rs.order / 100;
    const clim = r.clim === 'cold' ? P.coldTol : r.clim === 'hot' ? 1.05 : 1;
    const exposed = Math.max(0, rs.h - rs.safe) * (1 - (rs.vax || 0));
    const beta = P.inf * r.dens * clim * seasonMult(s, r.id) * (1 - .35 * ord) * (1 - rs.contain) * (1 - .12 * rs.sz);
    const newInf = Math.min(exposed * .85, beta * rs.z * exposed);
    const eaten = Math.min(Math.max(0, exposed - newInf), newInf * .12 * P.aggr);
    const kill = rs.z * (.07 + .5 * ord * (.6 + .4 * r.wealth) + (RP ? .05 + .3 * rs.vax : 0)) / P.resil;
    const decay = rs.z * .03;
    rs.z = rs.z + newInf - kill - decay; rs.h -= newInf + eaten; rs.d += kill + decay + eaten;
    if (rs.h < 0) rs.h = 0; rs.safe = Math.min(rs.safe, rs.h);
    if (rs.z > .4) rs.safe *= .9;
    if (rs.z < 2e-6) { rs.d += rs.z; rs.z = 0; rep.items.push({ k:'good', t:`${r.name}: outbreak eradicated.` }); }
    const target = 35 + 60 * r.wealth + 5 * rs.sz + (RP ? 10 * rs.vax : 0);
    rs.order -= (rs.z * 160 + newInf * 250) * (1.15 - .45 * r.wealth);
    if (RP && !rs.fallen) rs.order += 1 + 4 * rs.vax;
    if (rs.z < .01) rs.order += 3 + 2 * r.wealth;
    rs.order += 2 * rs.sz;
    rs.order = clamp(rs.order, 0, target);
    if (rs.fallen) rs.order = 0;
  }
  // inter-region spread
  for (const r of REGIONS) {
    const src = s.regions[r.id]; const z = z0[r.id]; if (z <= 0) continue;
    for (const e2 of ADJ[r.id]) {
      const dst = s.regions[e2.to], dr = RD[e2.to];
      let w = e2.w * (e2.t === 'A' ? s.travel * (r.hub + dr.hub) / 2 * 1.2 : e2.t === 'S' ? .6 : 1);
      if (src.fallen && e2.t === 'A') w *= .3;
      if (src.works && src.works.barrier && !src.fallen) w *= .65;
      const pressure = z * w * (1 - .75 * src.quar) * (1 - .6 * dst.quar) * P.spread;
      if (z0[e2.to] <= 0 && dst.z <= 0) {
        if (dst.h > .01 && rnd(s) < 1 - Math.exp(-pressure * 25)) { dst.z = .0003; dst.h -= .0003; rep.spread.push([r.id, e2.to]); if (!dst.seen) { dst.seen = true; } rep.items.push({ k:'bad', t:`Outbreak confirmed in ${dr.name} (from ${r.name}).` }); }
      } else if (dst.z > 0) { const imp = Math.min(Math.max(0, dst.h - dst.safe), pressure * .01); dst.z += imp; dst.h -= imp; }
    }
  }
  // carriers that slipped out before the borders closed start new outbreaks elsewhere
  if (!RP && s.turn >= s.nextSeed) {
    const infectedN = REGIONS.filter(r => s.regions[r.id].z > 0).length;
    const cand = REGIONS.filter(r => s.regions[r.id].z <= 0 && !s.regions[r.id].fallen && hops(s.pz, r.id) >= 2);
    if (cand.length && infectedN < 14) {
      let tot = cand.reduce((a2, r) => a2 + r.hub * Math.sqrt(r.pop), 0), x = rnd(s) * tot, t = cand[0];
      for (const r of cand) { x -= r.hub * Math.sqrt(r.pop); if (x <= 0) { t = r; break; } }
      const ds = s.regions[t.id]; ds.z = .0006; ds.h -= .0006; ds.seen = true;
      const src = REGIONS.filter(r => z0[r.id] > 0).sort((p1, p2) => z0[p2.id] * p2.hub - z0[p1.id] * p1.hub)[0];
      if (src) rep.spread.push([src.id, t.id]);
      rep.items.push({ k:'bad', t:`Carriers who slipped through before the borders closed started a new outbreak in ${t.name}.` });
    }
    s.nextSeed = s.turn + rint(s, 7, 10);
  }
  // falls and reclaims
  for (const r of REGIONS) {
    const rs = s.regions[r.id];
    if (!rs.fallen && ((rs.z > .3 && rs.order < 12) || (rs.z > rs.h && rs.z > .05))) {
      rs.fallen = true; rs.order = 0; s.stats.fallen++; rep.fell.push(r.id);
      rep.items.push({ k:'bad', t:`${r.name} has FALLEN.` }); add(s,'morale', RP ? -.5 : -1.5);
      for (const l of s.labs) if (l.active && l.region === r.id) { l.active = false; rep.items.push({ k:'bad', t:`${l.name} was overrun. The lab is lost.` }); }
      if (rs.works && Object.keys(rs.works).length) { rs.works = {}; rep.items.push({ k:'bad', t:`The field works in ${r.name} were lost.` }); }
      if (b.eng && b.eng.loc === r.id) b.eng = null;
      if (CHOKE[r.id]) rep.items.push({ k:'bad', t:`The ${CHOKE[r.id]} is lost. Every resupply shrinks by ${Math.round(CHOKE_LOSS * 100)}%.` });
      if (b.tf && b.tf.loc === r.id) { cas(s, .1, [b.tf.bn]); rep.items.push({ k:'bad', t:`Task Force ${UNITS[b.tf.bn].name} was caught in the collapse of ${r.name}.` }); }
    } else if (rs.fallen && (RP ? rs.z < .1 : rs.z < .06 && rs.h > .1)) {
      rs.fallen = false; rs.order = Math.max(rs.order, RP ? 20 : 15); rep.items.push({ k:'good', t:`${r.name} has been reclaimed.` }); if (RP) { add(s,'morale',4); add(s,'trust',3); }
    }
    if (RP) {
      if (!rs.restored && restoreReady(rs)) { rs.restored = true; s.stats.restored++; rep.items.push({ k:'good', t:`${r.name} has been RESTORED.` }); add(s,'morale',1); add(s,'trust',1); }
      else if (rs.restored && (rs.fallen || rs.z > .03)) { rs.restored = false; rep.items.push({ k:'bad', t:`${r.name} relapsed. It is no longer restored.` }); }
    }
  }

  // 3. brigade attrition and upkeep (after the week's fighting)
  const tz = T(s).z;
  const lossFrac = (.003 + .11 * tz * P.aggr) * post.casM;
  const before = {}; for (const k of BNS) before[k] = b.u[k];
  let kia = cas(s, lossFrac, mainBns(s)) + cas(s, lossFrac * .35, ['hq','art','ad','avn','avsec','trans','sup']);
  const tfz = tf ? s.regions[tf.loc].z : 0;
  if (tf) kia += cas(s, (.003 + .11 * tfz * P.aggr) * .8, [tf.bn]);
  // experience from the week's fighting
  if (tz > .002) gainXP(s, mainBns(s), Math.min(9, 2 + 25 * tz) * (b.posture === 'assault' ? 1.3 : 1), rep);
  if (tf && tfz > .002) gainXP(s, [tf.bn], Math.min(9, 2 + 25 * tfz), rep);
  // battalion commanders can fall when their unit takes heavy losses
  for (const k of BNS) {
    if (before[k] - b.u[k] > .035 && rnd(s) < .22) {
      const v = b.vet[k]; const old = v.cdr.name; v.cdr = newCdr(s); v.xp *= .6; s.stats.cdrLost = (s.stats.cdrLost || 0) + 1; add(s,'morale',-3);
      rep.items.push({ k:'bad', t:`${old}, commanding the ${UNITS[k].name}, was killed in action. ${v.cdr.name} (${TRAITS[v.cdr.trait].name}) takes command.` });
    }
    const tr = traitOf(s, k); if (tr.regen) heal(s, [k], tr.regen); if (tr.morale) add(s,'morale', tr.morale); if (tr.supply) add(s,'supply', tr.supply);
  }
  if (hasD(s, 'fieldmed')) heal(s, BNS, .03);
  if (hasD(s, 'infoops')) add(s,'trust',1);
  if (hasD(s, 'forage')) { add(s,'supply',4); add(s,'fuel',3); }
  if (tf && b.u[tf.bn] < .12) { rep.items.push({ k:'bad', t:`Task Force ${UNITS[tf.bn].name} is too weak to fight on alone and rejoined the main body.` }); b.tf = null; }
  if (kia > 0) rep.items.push({ k: kia > 60 ? 'bad' : 'info', t:`Brigade losses this week: ${kia} personnel.` });
  const expoT = mainBns(s).reduce((a, k) => a + (traitOf(s, k).expo || 1), 0) / Math.max(1, mainBns(s).length);
  let expo = (70 * tz * post.expo * expoT + (tf ? 70 * tfz * .8 * .35 : 0)) * (b.en.cbrn ? .7 : 1) * (s.cmd === 'cbrn' ? .7 : 1) * (1 - b.expoShield) - 4;
  add(s, 'exposure', expo);
  b.supply -= post.supply; b.ammo -= post.ammo; b.fuel -= post.fuel; b.med -= Math.min(3, Math.ceil(kia / 40));
  if (b.tf && !hasD(s, 'mission')) { b.supply -= 2; b.fuel -= 1; }
  let mor = -.3 - kia / 35; if (tz < .02) mor += 1.5; if (s.cmd === 'civ') mor += 1; if (RP) mor += 1.5; if (b.supply <= 0) mor -= 8; else if (b.supply < 10) mor -= 2; add(s, 'morale', mor);
  if (b.supply <= 0) { cas(s, .01, ['bn1','bn2','bn3']); rep.items.push({ k:'bad', t:'Out of supply. Troops are going hungry.' }); }
  for (const k of ['supply','ammo','fuel','med']) b[k] = Math.max(0, b[k]);
  const flow = supplyFlow(s);
  const got = { supply:Math.round(12 * flow), ammo:Math.round(12 * flow), fuel:Math.round(9 * flow), med:Math.round(4 * flow) };
  for (const k in got) add(s, k, got[k]);
  const depots = Math.min(2, REGIONS.filter(r => { const rs = s.regions[r.id]; return rs.works && rs.works.depot && !rs.fallen; }).length);
  if (depots) { add(s,'supply',3 * depots); add(s,'fuel',2 * depots); rep.items.push({ k:'info', t:`Supply depot${depots > 1 ? 's' : ''}: +${3 * depots} Supply, +${2 * depots} Fuel.` }); }
  b.air = clamp((b.air == null ? 100 : b.air) + AIR_REGEN + (b.en.maint ? 4 : 0) + (hasD(s, 'rotary') ? 4 : 0), 0, 100);
  rep.items.push({ k:'info', t:`Resupply arrived: +${got.supply} Supply, +${got.ammo} Ammo, +${got.fuel} Fuel, +${got.med} Med.` });
  if (b.fortT > 0) { b.fortT--; if (b.fortT <= 0) b.fort = 0; } else b.fort = 0;
  b.uas = clamp(b.uas + .05, 0, b.u.avn);

  // 4. research (after the cure, labs make doses instead)
  let rr = 0;
  if (!RP) {
  for (const l of activeLabs(s)) { const rs = s.regions[l.region]; if (rs.fallen) continue; let v = .65 * Math.sqrt(rs.order / 100) * Math.max(0, 1 - rs.z * 2.5); if (l.region === b.loc) v += .25; else if (b.tf && l.region === b.tf.loc) v += .15; rr += v; }
  rr *= s.know * D.res * (hasD(s, 'science') ? 1.12 : 1);
  s.research += rr; }
  rep.research = rr;

  // 4b. containment fades, regions stabilize or slip
  settleControl(s, rep);

  // 5. directives
  if (s.directive) checkDirective(s, rep, s.turn >= s.directive.deadline);

  // 6. cleanup
  s.deck.discard.push(...s.deck.hand); s.deck.hand = [];
  rep.after = { h:survivors(s), z:infected(s), research:s.research, pers:personnel(s) };
  rep.restoredAfter = restoredCount(s); rep.vaxAfter = avgVax(s);
  s.turn++;
  const seasonAfter = seasonOf('N', monthOf(s.turn));
  if (seasonAfter !== seasonBefore) rep.items.push({ k:'info', t: seasonAfter === 'winter' ? 'Winter sets in across the north. The infected slow down in cold regions.' : seasonAfter === 'summer' ? 'Summer heat in the north. The infected spread a little faster.' : `It is ${seasonAfter} in the northern hemisphere.` });
  s.history.push(snapshot(s));
  checkOver(s);
  if (s.cureChoice) s.needStart = true;
  if (!s.over && !s.cureChoice) {
    if (s.turn % 4 === 1 && !s.pendingReward) s.pendingReward = { reason:'Requisition window', options:rewardOptions(s) };
    startTurn(s);
  }
  s.lastReport = rep;
  return rep;
}

function checkOver(s) {
  if (s.over) return s.over;
  if (s.cureChoice) return null;
  const sf = survivors(s) / START_POP;
  if (s.phase === 'restore') {
    const n = restoredCount(s), N = REGIONS.length;
    let t = null;
    if (n >= N) t = ['The World Restored', `Every region on Earth is restored. ${s.path.name} is history.`];
    else if (s.turn > s.restoreEnd) t = ['Restoration Complete', `${RESTORE_WEEKS} weeks after the cure, ${n} of ${N} regions are restored. Higher command takes it from here.`];
    else if (personnel(s) < NOMINAL_TOTAL * .2 || allMan(s) < .08) t = ['Brigade Spent', `The cure was found, but the ECB is worn out with ${n} of ${N} regions restored.`];
    else if (s.b.morale <= 0) t = ['The Brigade Goes Home', `The troops have had enough. ${n} of ${N} regions were restored before they left.`];
    else if (s.b.trust <= 0) t = ['Relieved After the Cure', `Higher command relieved you with ${n} of ${N} regions restored.`];
    if (t) { s.over = { win:true, title:t[0], text:t[1] }; s.over.score = score(s); }
    return s.over;
  }
  if (s.research >= 100) { if (!s.cureFound) s.cureFound = s.turn; s.cureChoice = true; s.crisis = null; return null; }
  else if (sf < .2) s.over = { win:false, title:'Humanity Has Fallen', text:'Fewer than one in five people remain. There is no one left to cure.' };
  else if (personnel(s) < NOMINAL_TOTAL * .2 || allMan(s) < .08) s.over = { win:false, title:'Brigade Combat Ineffective', text:'The Expeditionary Combat Brigade can no longer field a fighting force.' };
  else if (s.b.morale <= 0) s.over = { win:false, title:'Mutiny', text:'The brigade has stopped following orders. Soldiers are walking home.' };
  else if (s.b.trust <= 0) s.over = { win:false, title:'Relieved of Command', text:'Higher command has relieved you. A new commander arrives at dawn.' };
  else if (!activeLabs(s).length) s.over = { win:false, title:'The Last Lab Is Gone', text:'Every research facility has been overrun. There will be no cure.' };
  if (s.over) s.over.score = score(s);
  return s.over;
}
function score(s) {
  const sf = survivors(s) / START_POP;
  const n = restoredCount(s);
  let v = sf * 5000 + s.stats.saved * 8 + personnel(s) / NOMINAL_TOTAL * 1500 + activeLabs(s).length * 200 + Math.min(100, s.research) * 15 + (s.cureFound ? 2500 : 0) + Math.min(s.turn, s.cureFound || s.turn) * 20 + REGIONS.filter(r => s.regions[r.id].stabbed).length * 100
    + (s.phase === 'restore' ? n * 250 + (s.stats.cured || 0) * 4 + (n >= REGIONS.length ? 2000 : 0) : 0);
  return Math.round(v * DIFFS[s.diff].mult);
}

return { REGIONS, RD, LINKS, ADJ, UNITS, ENABLERS, NOMINAL, NOMINAL_TOTAL, START_POP, DIFFS, COMMANDERS, CMD, CARDS, EVENTS, POSTURES, MUTATIONS,
  RESTORE_WEEKS, RESTORE_REQ, restoreReady, restoredCount, avgVax, beginRestoration, endAtCure,
  STAB, canStabilize, presentIn, MIN_DECK, burnValue, canBurn, burnCard, SORTIES, WORKS, canSortie, flySortie, canBuild, buildWork, worksIn, engCrew, airWorst,
  DOCTRINES, RANKS, TRAITS, CHOKE, CHOKE_LOSS, HEMI, BNS, TF_RANGE, hasD, takeDoctrine, mainBns, allMan, rankIdx, vetOf, vetKillOne, vetCas,
  tfCandidate, tfCost, canSendTF, sendTF, recallCost, canRecallTF, recallTF, monthOf, seasonOf, seasonMult, chokesLost, caps,
  baseId, isUp, def, costOf, canUpgrade, cardName, migrate,
  newGame, endTurn, playCard, canPlay, deploy, canDeploy, deployCost, setPosture, crisisOptions, resolveCrisis, takeReward, deckList,
  survivors, infected, dead, personnel, fallenCount, status, hops, neighbors, activeLabs, labIn, supplyFlow, worldFactor, man, eff, scale, cpMax, M, pc, score, checkOver, rnd };
})();
if (typeof module !== 'undefined') module.exports = ECB;
