const ECB = require('../src/engine.js');
function runIdle(seed, diff='veteran') {
  const s = ECB.newGame({ seed, diff, cmd:'mech' });
  ECB.resolveCrisis(s, 1);
  let guard = 0;
  while (!s.over && guard++ < 120) {
    if (s.pendingReward) ECB.takeReward(s, 'supply');
    if (s.pendingDoctrine) { ECB.takeDoctrine(s, s.pendingDoctrine.options[0]); continue; }
    if (s.crisis) { const o = ECB.crisisOptions(s).filter(x=>x.ok); ECB.resolveCrisis(s, o[o.length-1].i); continue; }
    ECB.endTurn(s);
  }
  return s;
}
const PRI = { RESEARCH:0, CURE:0, COMBAT:1, FIRES:1, AIR:2, CIVIL:3, MEDICAL:4, LOGISTICS:5, INTEL:0, COMMAND:6 };
function runGreedy(seed, diff='veteran', cmd='mech', verbose=false, restore=false, tasks=true) {
  const s = ECB.newGame({ seed, diff, cmd });
  ECB.resolveCrisis(s, 0);
  let guard = 0;
  while (!s.over && guard++ < 150) {
    if (s.pendingDoctrine) { ECB.takeDoctrine(s, s.pendingDoctrine.options[Math.floor(ECB.rnd(s)*3)]); continue; }
    if (s.cureChoice) { if (restore) ECB.beginRestoration(s); else ECB.endAtCure(s); continue; }
    if (s.pendingReward) { const o = s.pendingReward.options; const pref = o.find(id=>['samples','mech_sweep','combined_arms','safe_zone','fst','airbridge','specimen'].includes(id)) || o[0]; ECB.takeReward(s, pref); }
    if (s.crisis) { const o = ECB.crisisOptions(s).filter(x=>x.ok); ECB.resolveCrisis(s, o[Math.floor(ECB.rnd(s)*o.length)].i); continue; }
    // deployment: if theater fallen or very hot, or a lab region is threatened, move
    const b = s.b; const here = s.regions[b.loc];
    let best = null, bv = -1;
    if (s.phase === 'restore') {
      // go where restoration is closest but not yet done (or reclaim the nearest fallen region)
      for (const r of ECB.REGIONS) { const rs = s.regions[r.id]; if (rs.restored) continue; const h = ECB.hops(b.loc, r.id); if (h > 3) continue; const v = (rs.fallen ? 1.2 : 2) - Math.min(rs.z, .5) * 2 + (rs.vax||0) - h * .5 + (r.id === b.loc ? 1 : 0); if (v > bv) { bv = v; best = r.id; } }
      if (best && best !== b.loc && (here.restored || bv > 2.2)) ECB.deploy(s, best);
    } else {
    for (const r of ECB.REGIONS) { const rs = s.regions[r.id]; if (rs.fallen) continue; const lab = ECB.labIn(s, r.id) ? 1 : 0; const h = ECB.hops(b.loc, r.id); if (h > 3) continue;
      const v = (lab ? 2 : 0) + Math.min(rs.z, .2) * 20 * (lab ? 2 : 1) - h * .4 + (r.id === b.loc ? .8 : 0); if (v > bv) { bv = v; best = r.id; } }
    if (best && best !== b.loc && (here.fallen || here.z > .25 || bv > 2.5)) ECB.deploy(s, best);
    }
    b.posture = here.z > .05 ? 'hold' : here.z > .005 ? 'assault' : 'relief';
    if (tasks) botTasks(s);
    // play cards
    let progress = true;
    while (progress) { progress = false;
      const idxs = s.deck.hand.map((id,i)=>i).filter(i => ECB.canPlay(s,i) === true);
      idxs.sort((a,c)=> PRI[ECB.CARDS[s.deck.hand[a]].type] - PRI[ECB.CARDS[s.deck.hand[c]].type]);
      for (const i of idxs) { const c = ECB.CARDS[s.deck.hand[i]];
        if (c.type==='LOGISTICS' && b.supply > 50 && b.ammo > 50 && b.fuel > 40) continue;
        if (c.type==='MEDICAL' && c.id!=='decon' && ECB.man(s) > .9) continue;
        if (c.id==='decon' && b.exposure < 30) continue;
        if (c.id==='rally' && b.morale > 75) continue;
        const r = ECB.playCard(s, i); if (r.ok) { progress = true; break; } }
    }
    // burn what we won't use: keep cards that only lacked Command Points (up to 2), burn the rest
    { let kept = 0; for (let i = s.deck.hand.length - 1; i >= 0; i--) { const why = ECB.canPlay(s, i);
        if (why === 'Not enough Command Points' && kept < 2) { kept++; continue; } ECB.burnCard(s, i); } }
    const rep = ECB.endTurn(s);
    if (verbose && rep && s.phase === 'restore') console.log(`R W${rep.turn} loc=${b.loc} restored=${ECB.restoredCount(s)} vax=${(ECB.avgVax(s)*100).toFixed(0)}% fallen=${ECB.fallenCount(s)} inf=${ECB.M(ECB.infected(s))} mor=${b.morale.toFixed(0)} tr=${b.trust.toFixed(0)} thZ=${(s.regions[b.loc].z*100).toFixed(1)} thVax=${((s.regions[b.loc].vax||0)*100).toFixed(0)}`);
    else if (verbose && rep) console.log(`W${rep.turn} loc=${b.loc} surv=${(ECB.survivors(s)/ECB.START_POP*100).toFixed(1)}% res=${s.research.toFixed(1)} labs=${ECB.activeLabs(s).length} fallen=${ECB.fallenCount(s)} pers=${ECB.personnel(s)} mor=${b.morale.toFixed(0)} exp=${b.exposure.toFixed(0)} tr=${b.trust.toFixed(0)} sup=${b.supply} am=${b.ammo} fu=${b.fuel} thZ=${(s.regions[b.loc].z*100).toFixed(2)}`);
  }
  return s;
}
function botTasks(s) {
  const b = s.b, th = s.regions[b.loc], E = ECB;
  const weak = Math.min(...E.mainBns(s).map(k => b.u[k]));
  const order = b.air < 45 ? ['rest'] : [];
  if (th.z > .004 && b.ammo > 18) order.push('strike');
  if (weak < .75 && b.med > 8) order.push('medevac');
  if (b.supply < 35) order.push('lift');
  order.push('isr', 'rest');
  for (const id of order) if (E.canSortie(s, id) === true) { E.flySortie(s, id); break; }
  if (b.supply > 22) {
    const cur = b.eng && b.eng.loc === b.loc ? [b.eng.id] : [];
    for (const id of [...cur, 'barrier', 'firebase', 'hospital', 'depot']) if (E.canBuild(s, id) === true) { E.buildWork(s, id); break; }
  }
}
module.exports = { runIdle, runGreedy };
if (require.main === module) {
  const mode = process.argv[2] || 'both'; const N = +process.argv[3] || 200; const diff = process.argv[4] || 'veteran';
  const summarize = (name, fn) => { const res = {}; let turns = 0, wins = 0, research = 0, surv = 0;
    for (let i = 0; i < N; i++) { const s = fn('T' + i, diff); res[s.over ? s.over.title : 'timeout'] = (res[s.over ? s.over.title : 'timeout'] || 0) + 1; turns += s.turn; research += Math.min(100,s.research); surv += ECB.survivors(s)/ECB.START_POP; if (s.over && s.over.win) wins++; }
    console.log(name, diff, 'avgTurn', (turns/N).toFixed(1), 'win%', (wins/N*100).toFixed(0), 'avgRes', (research/N).toFixed(0), 'avgSurv', (surv/N*100).toFixed(0)+'%', JSON.stringify(res)); };
  if (mode === 'one') { runGreedy(process.argv[3] || 'T1', diff, 'mech', true); }
  else if (mode === 'both') { summarize('idle', runIdle); summarize('greedy', (seed,d)=>runGreedy(seed,d)); }
}
if (process.argv[2]==='timeline') {
  const N=100; const marks=[5,10,15,20,25,30,35,40]; const agg={};
  for (let i=0;i<N;i++){ const s=ECB.newGame({seed:'T'+i}); ECB.resolveCrisis(s,1);
    let g=0; while(!s.over&&g++<60){ if(s.pendingReward)ECB.takeReward(s,'supply'); if(s.crisis){const o=ECB.crisisOptions(s).filter(x=>x.ok);ECB.resolveCrisis(s,o[o.length-1].i);continue;} ECB.endTurn(s);
      if(marks.includes(s.turn)){ const inf=ECB.REGIONS.filter(r=>s.regions[r.id].z>0).length; const a=agg[s.turn]||(agg[s.turn]={n:0,inf:0,fall:0,surv:0,res:0}); a.n++; a.inf+=inf; a.fall+=ECB.fallenCount(s); a.surv+=ECB.survivors(s)/ECB.START_POP; a.res+=s.research; } } }
  for (const t of marks) { const a=agg[t]; if(!a) continue; console.log(`W${t} n=${a.n} infectedRegions=${(a.inf/a.n).toFixed(1)} fallen=${(a.fall/a.n).toFixed(1)} surv=${(a.surv/a.n*100).toFixed(0)}% res=${(a.res/a.n).toFixed(0)}`); }
}

if (process.argv[2]==='restore') {
  const diff = process.argv[3] || 'veteran'; const N = +process.argv[4] || 100; const out = {}; let rs=0, n=0, sc=0, hist=[];
  for (let i=0;i<N;i++){ const s=runGreedy('R'+i,diff,'mech',false,true); if(!s.cureFound) continue; n++; const k=s.over?s.over.title:'none'; out[k]=(out[k]||0)+1; const r=ECB.restoredCount(s); rs+=r; hist.push(r); sc+=s.over?s.over.score:0; }
  hist.sort((a,b)=>a-b); console.log(diff,'cure runs',n,'avg restored',(rs/n).toFixed(1),'median',hist[Math.floor(n/2)],'min',hist[0],'max',hist[n-1],'avg score',Math.round(sc/n),JSON.stringify(out));
}
if (process.argv[2]==='restore1') { for (let i=0;i<40;i++){ const seed='R'+i; const t=runGreedy(seed,'recruit','mech',false,true); if (t.cureFound) { console.log('seed',seed); runGreedy(seed,'recruit','mech',true,true); break; } } }
