const fs=require('fs'); const vm=require('vm');
const ctx={}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/art.js','utf8')+';this.ART=ART;',ctx);
const {ART}=ctx;
const sp=ART.sprite();
const ids=[...sp.matchAll(/<g id="s-([a-z0-9]+)"/g)].map(m=>m[1]).filter(i=>!/^(sky|ru|gtex)/.test(i));
const want=(process.argv[2]||'').split(',').filter(Boolean);
const list=want.length?ids.filter(i=>want.includes(i)):ids;
const big=+(process.argv[3]||1);
let h=`<html><body style="margin:0;background:#222;font:12px sans-serif;color:#ccc">${sp}<div style="display:grid;grid-template-columns:repeat(${big>1?2:5},${320*big}px);gap:6px;padding:6px">`;
for(const id of list){
  h+=`<div><svg width="${320*big}" height="${172*big}" viewBox="0 0 160 86" style="--acc:#ff8a4c;display:block"><rect width="160" height="86" fill="url(#sky-COMBAT)"/><rect y="72" width="160" height="14" fill="#05080a"/>`;
  // auto-fit: measure later in browser
  h+=`<g class="fit" data-id="${id}"><use href="#s-${id}" transform="translate(80 72)" fill="#05080a" color="#05080a"/></g></svg>${id}</div>`;
}
h+=`</div><script>
for(const g of document.querySelectorAll('g.fit')){const u=g.firstElementChild;const b=u.getBBox();const s=Math.min(140/b.width,62/b.height,4);
const cx=b.x+b.width/2; const by=b.y+b.height; const rimV='fill:var(--acc);color:var(--acc);'+${JSON.stringify("--d0:var(--acc);--d2:var(--acc);--d3:var(--acc);--d4:var(--acc);--d5:var(--acc);--z1:var(--acc);--z2:var(--acc);--lt:var(--acc);--rl:var(--acc);--wm:var(--acc)")};
const tr='translate('+(80-cx*s)+' '+(72-Math.max(0,by)*s - (by<0? 0:0))+') scale('+s+')';
const rim=u.cloneNode();rim.setAttribute('style',rimV);rim.setAttribute('opacity','.55');rim.setAttribute('transform','translate('+(80-cx*s-.5)+' '+(72-Math.max(0,by)*s-.6)+') scale('+s+')');
u.setAttribute('transform',tr); g.insertBefore(rim,u);}
</script></body></html>`;
fs.writeFileSync('/tmp/claude-0/symsheet.html',h); console.log(list.length+' symbols');
