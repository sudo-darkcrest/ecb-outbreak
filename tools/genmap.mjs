import fs from 'fs';
import * as topo from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import pc from 'polygon-clipping';

const w = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const fc = topo.feature(w, w.objects.countries);

const R = {
 CAN:['Canada','Greenland'],
 USW:[], USE:[],
 MEX:['Mexico','Guatemala','Belize','Honduras','El Salvador','Nicaragua','Costa Rica','Panama'],
 CAR:['Cuba','Haiti','Dominican Rep.','Jamaica','Bahamas','Puerto Rico','Trinidad and Tobago'],
 SAN:['Colombia','Venezuela','Ecuador','Peru','Bolivia','Guyana','Suriname'],
 BRA:['Brazil'],
 SCO:['Argentina','Chile','Uruguay','Paraguay','Falkland Is.'],
 WEU:['United Kingdom','Ireland','Spain','Portugal','Belgium','Netherlands','Luxembourg','Switzerland','Iceland'],
 CEU:['Germany','Poland','Czechia','Austria','Slovakia','Hungary','Slovenia','Croatia'],
 SEU:['Italy','Greece','Serbia','Bosnia and Herz.','Montenegro','Albania','Macedonia','Kosovo','Bulgaria','Romania'],
 NOR:['Norway','Sweden','Finland','Denmark','Estonia','Latvia','Lithuania'],
 EEU:['Ukraine','Belarus','Moldova'],
 RUS:[], SIB:[],
 MDE:['Turkey','Syria','Iraq','Iran','Israel','Palestine','Jordan','Lebanon','Saudi Arabia','Yemen','Oman','United Arab Emirates','Qatar','Kuwait','Georgia','Armenia','Azerbaijan','Cyprus','N. Cyprus'],
 NAF:['Morocco','W. Sahara','Algeria','Tunisia','Libya','Egypt'],
 WAF:['Mauritania','Mali','Niger','Senegal','Gambia','Guinea-Bissau','Guinea','Sierra Leone','Liberia',"Côte d'Ivoire",'Burkina Faso','Ghana','Togo','Benin','Nigeria'],
 CAF:['Chad','Cameroon','Central African Rep.','Eq. Guinea','Gabon','Congo','Dem. Rep. Congo'],
 EAF:['Sudan','S. Sudan','Ethiopia','Eritrea','Djibouti','Somalia','Somaliland','Kenya','Uganda','Rwanda','Burundi','Tanzania'],
 SAF:['Angola','Zambia','Malawi','Mozambique','Zimbabwe','Botswana','Namibia','South Africa','Lesotho','eSwatini','Madagascar'],
 CAS:['Kazakhstan','Uzbekistan','Turkmenistan','Kyrgyzstan','Tajikistan','Afghanistan','Mongolia'],
 SAS:['India','Pakistan','Bangladesh','Nepal','Bhutan','Sri Lanka'],
 CHN:['China','Taiwan'],
 EAS:['Japan','South Korea','North Korea'],
 SEA:['Myanmar','Thailand','Laos','Cambodia','Vietnam','Malaysia','Brunei'],
 IDN:['Indonesia','Philippines','Timor-Leste'],
 AUS:['Australia','New Zealand','Papua New Guinea','Fiji','Solomon Is.','Vanuatu','New Caledonia'],
};
const byName = {}; for (const [k,arr] of Object.entries(R)) for (const n of arr) byName[n]=k;
const geoms = {}; for (const k in R) geoms[k]=[];
const unwrapRing = r => { const o=[]; let off=0; for(let i=0;i<r.length;i++){ let [x,y]=r[i]; if(i){ const px=r[i-1][0]; if(x-px>180) off-=360; else if(x-px<-180) off+=360; } o.push([x+off,y]); } return o; };
const shift = (mp,dx)=>mp.map(p=>p.map(r=>r.map(([x,y])=>[x+dx,y])));
const toMP0 = g => g.type==='Polygon' ? [g.coordinates] : g.coordinates;
const toMP = g => { const mp = toMP0(g).map(p=>p.map(unwrapRing)); const A=pc.intersection(mp,[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]); const B=shift(pc.intersection(mp,[[[180,-90],[540,-90],[540,90],[180,90],[180,-90]]]),-360); const C=shift(pc.intersection(mp,[[[-540,-90],[-180,-90],[-180,90],[-540,90],[-540,-90]]]),360); return [...A,...B,...C]; };
const box = (x0,x1)=>[[[x0,-90],[x1,-90],[x1,90],[x0,90],[x0,-90]]];
const unassigned=[];
for (const f of fc.features) {
  const n = f.properties.name; const mp = toMP(f.geometry);
  if (n==='Antarctica' || n==='Fr. S. Antarctic Lands') continue;
  if (n==='United States of America') { geoms.USW.push(pc.intersection(mp, box(-180,-100))); geoms.USE.push(pc.intersection(mp, box(-100,0))); continue; }
  if (n==='Russia') { geoms.RUS.push(pc.intersection(mp, box(20,60))); geoms.SIB.push(pc.difference(mp, box(20,60))); continue; }
  if (n==='France') { geoms.WEU.push(pc.intersection(mp, box(-20,40))); geoms.SAN.push(pc.intersection(mp, box(-60,-40))); continue; }
  const k = byName[n]; if (!k) { unassigned.push(n); continue; }
  geoms[k].push(mp);
}
console.error('unassigned', unassigned);

const W=1000;
const proj = geoNaturalEarth1();
// fit to land minus antarctica
const fitFC = {type:'FeatureCollection',features:fc.features.filter(f=>f.properties.name!=='Antarctica')};
proj.fitWidth(W, fitFC);
const [[bx0,by0],[bx1,by1]] = geoPath(proj).bounds(fitFC);
const H = Math.ceil(by1-by0)+8; proj.translate([proj.translate()[0], proj.translate()[1]-by0+4]);
const P = ([lon,lat]) => proj([lon,lat]);
const fmt = v => Math.round(v*10)/10;
const out = {W, H, regions:{}};
for (const k in geoms) {
  let u = geoms[k].length>1 ? pc.union(...geoms[k]) : geoms[k][0];
  let d=''; let best=null, bestA=0;
  for (const poly of u) {
    let pd='';
    poly.forEach((ring,ri)=>{
      const pts = ring.map(P); let s='';
      let last=null;
      pts.forEach((p,i)=>{ const q=[fmt(p[0]),fmt(p[1])]; if(last && q[0]===last[0]&&q[1]===last[1]) return; s+=(i?'L':'M')+q[0]+','+q[1]; last=q;});
      pd+=s+'Z';
      if (ri===0) { // area & centroid of outer ring
        let A=0,cx=0,cy=0; for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1];const c=x0*y1-x1*y0;A+=c;cx+=(x0+x1)*c;cy+=(y0+y1)*c;}
        A/=2; if (Math.abs(A)>bestA){bestA=Math.abs(A); best=[cx/(6*A),cy/(6*A)];}
      }
    });
    d+=pd;
  }
  out.regions[k]={d, c:[fmt(best[0]),fmt(best[1])]};
}
// graticule
out.grat = geoPath(proj)(geoGraticule10()).replace(/(\d+\.\d)\d+/g,'$1');
out.outline = geoPath(proj)({type:'Sphere'}).replace(/(\d+\.\d)\d+/g,'$1');
// project helper anchor points for lat/lon to place things
fs.writeFileSync('../src/mapdata.js', 'const MAPDATA='+JSON.stringify(out)+';\n');
console.error('H',H,'size',fs.statSync('../src/mapdata.js').size);
for (const k in out.regions) console.error(k, out.regions[k].c);
