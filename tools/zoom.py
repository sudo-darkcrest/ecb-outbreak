import sys
from playwright.sync_api import sync_playwright
which=sys.argv[1]; names=sys.argv[2].split(','); out=sys.argv[3]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1560,'height':900}); pg.goto(f'file:///tmp/claude-0/sheet_{which}.html')
    pg.evaluate("""(names)=>{ const keep=new Set(names); for(const d of document.querySelectorAll('body>div>div')){ const t=d.textContent.trim().split(' ')[0]; if(!keep.has(t)) d.remove(); else { const s=d.querySelector('svg'); s.setAttribute('width','480'); s.setAttribute('height','258'); d.firstElementChild.style.width='480px'; d.firstElementChild.style.height='258px'; } } document.querySelector('body>div').style.gridTemplateColumns='repeat(3,480px)'; }""", names)
    pg.wait_for_timeout(200); pg.screenshot(path=out, full_page=True); b.close()
