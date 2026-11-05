// Campaign balance: how often bots finish 3- and 5-operation campaigns, and per-operation win rates.
const { runCampaign } = require('./sim.cjs');
const N = +(process.argv[2] || 60);
for (const diff of (process.argv[3] || 'recruit,veteran').split(',')) for (const len of [3, 5]) {
  let done = 0, perOp = Array(len).fill(0), played = Array(len).fill(0), clean = 0;
  for (let i = 0; i < N; i++) { const r = runCampaign('K' + i, diff, ['mech','avn','civ','cbrn'][i % 4], len);
    r.ops.forEach((x, j) => { played[j]++; if (x === 'W') perOp[j]++; }); if (r.done) done++; if (r.done && !r.losses) clean++; }
  console.log(`${diff.padEnd(9)} ${len} ops: finished ${(done / N * 100).toFixed(0)}% (no losses ${(clean / N * 100).toFixed(0)}%) · win rate by op ${perOp.map((w, j) => played[j] ? Math.round(w / played[j] * 100) + '%' : '-').join(' / ')}`);
}
