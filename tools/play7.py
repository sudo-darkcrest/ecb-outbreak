# Ending films: force each kind of ending and grab frames.
import sys
from playwright.sync_api import sync_playwright
SRC = 'file:///home/claude/ecb/dist/ECB_Outbreak.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/'
KINDS = sys.argv[2].split(',') if len(sys.argv) > 2 else ['Cure Synthesized', 'Humanity Has Fallen']
TIMES = [3500, 13000, 17000, 26500, 33500, 38000]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for ki, kind in enumerate(KINDS):
        pg = b.new_page(viewport={'width':1280,'height':720}); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script("try{localStorage.setItem('ecb_intro','1');localStorage.setItem('ecb_tut','skip');localStorage.setItem('ecb_film',JSON.stringify({seed:'x',o:0}))}catch(e){}")
        pg.goto(SRC); pg.wait_for_timeout(400)
        pg.evaluate("localStorage.setItem('ecb_intro','0')"); pg.click('#t-start'); pg.wait_for_timeout(900)
        if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(400)
        pg.evaluate("localStorage.setItem('ecb_intro','1')")
        pg.evaluate("""(k=>{const S=__ECB.S,E=__ECB.E; S.turn=24; S.stats.kia=812; S.stats.kills=420; S.stats.hnKills=1310; S.stats.fallenCdrs=[{name:'Lt. Col. Ray Dalton',unit:'2nd Maneuver Bn',week:9},{name:'Lt. Col. Mike Ferris',unit:'1st Maneuver Bn',week:17}];
          S.regions.WAF.fallen=true; S.regions.CAF.z=.2; S.regions.EAF.z=.05; S.regions.MDE.stab=3; S.regions.MDE.stabbed=true;
          S.over={win:k==='Cure Synthesized'||k==='The World Restored',title:k,text:''}; S.over.score=E.score(S); __ECB.flow();})""", kind)
        print(kind, 'film running:', pg.evaluate("!!document.getElementById('cine')"))
        last = 0
        for i, t in enumerate(TIMES):
            pg.wait_for_timeout(t - last); last = t
            pg.screenshot(path=f'{OUT}end{ki}_{i}.png')
        pg.wait_for_timeout(3500)
        print(kind, 'game over shown after film:', pg.locator('#modal #b-endfilm').count() == 1)
        pg.close()
    b.close()
print('ERRORS:', errs or 'none')
