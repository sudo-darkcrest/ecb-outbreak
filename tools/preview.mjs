import fs from 'fs';
const src = fs.readFileSync('../src/mapdata.js','utf8'); const MAPDATA = eval(src.replace('const MAPDATA=','(').replace(/;\s*$/,')'));
const cols=['#7a9','#a97','#79a','#9a7','#a79','#97a','#8a8','#a88','#88a'];
let i=0; let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAPDATA.W} ${MAPDATA.H}" width="2000"><rect width="100%" height="100%" fill="#123"/><path d="${MAPDATA.outline}" fill="#1a2a3a"/><path d="${MAPDATA.grat}" stroke="#2a3a4a" fill="none" stroke-width=".5"/>`;
for (const [k,r] of Object.entries(MAPDATA.regions)) { s+=`<path d="${r.d}" fill="${cols[i++%cols.length]}" stroke="#123" stroke-width=".6"/><text x="${r.c[0]}" y="${r.c[1]}" font-size="9" fill="#000" text-anchor="middle">${k}</text>`; }
s+='</svg>'; fs.writeFileSync('/tmp/claude-0/map.svg', s);
