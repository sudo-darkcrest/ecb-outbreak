# Checks for the 5 Nov PM fix batch: How to Play on the title screen, region outline layer,
# Taiwan in Japan/Korea, stabilized regions on the card and map, one-time tips.
import sys
from playwright.sync_api import sync_playwright
SRC = 'file:///home/claude/ecb/dist/ECB_Outbreak.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':1280,'height':800})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','skip')}catch(e){}")
    pg.goto(SRC); pg.wait_for_timeout(500)
    pg.click('#t-how'); pg.wait_for_timeout(300)
    top = pg.evaluate("(()=>{const e=document.elementFromPoint(innerWidth/2,innerHeight/2);return !!(e&&e.closest('#modal'))})()")
    print('how-to visible on title:', top)
    pg.click('#modal #b-x'); pg.wait_for_timeout(200)
    pg.click('#t-start'); pg.wait_for_timeout(1200)
    if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(600)
    print('Taiwan region:', pg.evaluate("__ECB.E.RD.EAS.name"), '| China pop', pg.evaluate("__ECB.E.RD.CHN.pop"))
    pg.click('#g-reg path[data-id="EEU"]', force=True); pg.wait_for_timeout(1300)
    print('outline layer paths:', pg.evaluate("document.querySelectorAll('#g-sel path').length"), '| outline on top:', pg.evaluate("(()=>{const m=document.getElementById('map');const k=[...m.children].map(c=>c.id);return k.indexOf('g-sel')>k.indexOf('g-reg')})()"))
    # force a stabilized region and check the card, map and list
    pg.evaluate("(()=>{const S=__ECB.S;S.regions[S.b.loc].stab=6;S.regions['SEA'].stab=3;S.regions['SEA'].z=.01;__ECB.clearSel();__ECB.render()})()")
    pg.wait_for_timeout(300)
    print('stable chip:', pg.locator('#reg .st-Stable').count(), '| shields on map:', pg.locator('#g-mk .stabmk').count(), '| checklist hidden when stable:', pg.locator('#reg .check.stab').count() == 0)
    pg.screenshot(path=OUT + 'p6_stable.png')
    pg.evaluate("(()=>{const S=__ECB.S;S.regions[S.b.loc].stab=0;S.regions[S.b.loc].z=.004;S.regions[S.b.loc].contain=.3;__ECB.render()})()")
    pg.wait_for_timeout(300)
    print('checklist rows:', pg.locator('#reg .check.stab li').count())
    pg.screenshot(path=OUT + 'p6_check.png')
    b.close()
    # one-time tips with the tutorial finished
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1280,'height':800}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','done');localStorage.removeItem('ecb_tips')}catch(e){}")
    pg.goto(SRC); pg.wait_for_timeout(400); pg.click('#t-start'); pg.wait_for_timeout(1200)
    if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(600)
    pg.evaluate("(()=>{const S=__ECB.S;S.pendingReward={reason:'Directive complete',options:['qrf','convoy','uas_recon']};__ECB.flow()})()"); pg.wait_for_timeout(500)
    print('reward tip:', pg.evaluate("(()=>{const t=document.getElementById('tut');return t&&t.style.display!=='none'?t.querySelector('.tut-t').textContent:null})()"))
    pg.screenshot(path=OUT + 'p6_reward.png')
    pg.click('#tut-next'); pg.wait_for_timeout(200); pg.click('#b-up'); pg.wait_for_timeout(500)
    print('upgrade tip:', pg.evaluate("(()=>{const t=document.getElementById('tut');return t&&t.style.display!=='none'?t.querySelector('.tut-t').textContent:null})()"))
    pg.click('#tut-next'); pg.wait_for_timeout(200); pg.click('#modal #b-x'); pg.wait_for_timeout(300); pg.click('#b-rm'); pg.wait_for_timeout(500)
    print('remove tip:', pg.evaluate("(()=>{const t=document.getElementById('tut');return t&&t.style.display!=='none'?t.querySelector('.tut-t').textContent:null})()"))
    print('seen:', pg.evaluate("localStorage.getItem('ecb_tips')"))
    b.close()
print('ERRORS:', errs or 'none')
