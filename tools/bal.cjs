const ECB = require('../src/engine.js'); const { runGreedy } = require('./sim.cjs');
const N = +(process.argv[2] || 150); const tasks = process.argv[3] !== 'off'; const diffs = (process.argv[4] || 'recruit,veteran,nightmare').split(',');
for (const d of diffs) { let w = 0, wk = 0, works = 0, helo = 0;
  for (let i = 0; i < N; i++) { const s = runGreedy('B' + i, d, ['mech','avn','civ','cbrn'][i % 4], false, false, tasks); if (s.over && s.over.win) w++; wk += s.turn; works += (s.stats.works || 0); helo += s.b.heloMax.attack - s.b.helo.attack; }
  console.log(`${d.padEnd(9)} tasks=${tasks ? 'on ' : 'off'} win ${(w / N * 100).toFixed(0)}%  avg weeks ${(wk / N).toFixed(1)}  works/run ${(works / N).toFixed(1)}  attack helos lost/run ${(helo / N).toFixed(2)}`); }
