const fs=require('fs'); const vm=require('vm');
const ctx={}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/engine.js','utf8').replace("if (typeof module !== 'undefined') module.exports = ECB;","")+';this.ECB=ECB;',ctx);
vm.runInContext(fs.readFileSync('src/art.js','utf8')+';this.ART=ART;',ctx);
const {ECB,ART}=ctx;
const which=process.argv[2]||'cards';
const keys = which==='cards' ? Object.keys(ECB.CARDS) : Object.keys(ECB.EVENTS);
let h=`<html><body style="margin:0;background:#111;font:11px sans-serif;color:#ccc">${ART.sprite()}<div style="display:grid;grid-template-columns:repeat(6,250px);gap:8px;padding:8px">`;
for(const k of keys){ const kind = which==='cards'?ECB.CARDS[k].type:ECB.EVENTS[k].kind; h+=`<div><div style="width:250px;height:134px">${ART.svg(k,kind).replace('<svg ','<svg width="250" height="134" ')}</div>${k}${ART.has(k)?'':' (FALLBACK)'}</div>`; }
h+='</div></body></html>'; fs.writeFileSync('/tmp/claude-0/sheet_'+which+'.html',h); console.log(keys.length);
