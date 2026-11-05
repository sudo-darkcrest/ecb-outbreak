import fs from 'fs';
import * as topo from 'topojson-client';
const w = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const fc = topo.feature(w, w.objects.countries);
console.log(fc.features.map(f=>`${f.id}|${f.properties.name}`).join('\n'));
