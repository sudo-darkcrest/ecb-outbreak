# Campaign mode end to end: start a 3-operation campaign, win op 1, refit, check carry-over, lose ops 2 and 3, see the results.
import sys
from playwright.sync_api import sync_playwright
SRC = 'file:///home/claude/ecb/dist/ECB_Outbreak.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/'
errs = []
def endop(pg, win, title):
    pg.evaluate("""([w,t])=>{const S=__ECB.S,E=__ECB.E; S.b.u.bn2=.42; S.b.vet.bn1.xp=95; if(!S.doct.includes('drill'))S.doct.push('drill');
      S.stats.fallenCdrs=[{name:'Lt. Col. Test '+S.camp.op,unit:'2nd Maneuver Bn',week:7}]; S.over={win:w,title:t,text:'test'}; S.over.score=E.score(S); __ECB.flow();}""", [win, title])
    pg.wait_for_timeout(700)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1280,'height':800}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','skip')}catch(e){}")
    pg.goto(SRC); pg.wait_for_timeout(400)
    pg.evaluate("localStorage.removeItem('ecb_campaign_v1')"); pg.reload(); pg.wait_for_timeout(400)
    pg.click('#t-camp'); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'c0_start.png')
    pg.click('.opt[data-n="3"]'); pg.wait_for_timeout(1000)
    print('op1 header:', pg.inner_text('#h-season'))
    cdr1 = pg.evaluate("__ECB.S.b.vet.bn1.cdr.name")
    if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(400)
    endop(pg, True, 'Cure Synthesized')
    print('game over campaign button:', pg.inner_text('#modal #b-camp'))
    pg.click('#modal #b-camp'); pg.wait_for_timeout(500); pg.screenshot(path=OUT + 'c1_debrief.png', full_page=True)
    print('refit options:', pg.locator('#modal .opt[data-r]').count())
    pg.locator('#modal .opt[data-r]').first.click(); pg.wait_for_timeout(1000)
    st = pg.evaluate("(()=>{const S=__ECB.S;return {op:S.camp.op, cdr:S.b.vet.bn1.cdr.name, xp:S.b.vet.bn1.xp, bn2:S.b.u.bn2, doct:S.doct, inf:S.path.inf}})()")
    print('op2:', st['op'], '| same bn1 commander:', st['cdr'] == cdr1, '| bn1 xp', st['xp'], '| bn2 strength', round(st['bn2'], 2), '| doctrines', st['doct'])
    print('op2 header:', pg.inner_text('#h-season'))
    # reload mid-op: title should offer to continue the campaign
    pg.evaluate("__ECB.flow()"); pg.wait_for_timeout(300); pg.reload(); pg.wait_for_selector('#t-camp-cont', timeout=8000)
    print('title button:', pg.inner_text('#t-camp-cont'))
    pg.click('#t-camp-cont'); pg.wait_for_timeout(800)
    if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(400)
    endop(pg, False, 'Humanity Has Fallen')
    pg.click('#modal #b-camp'); pg.wait_for_timeout(500)
    print('after a loss, debrief warns:', pg.locator('#modal :text("One more failed operation")').count() == 1)
    pg.locator('#modal .opt[data-r]').nth(1).click(); pg.wait_for_timeout(1000)
    if pg.locator('#modal .opt').count(): pg.locator('#modal .opt').nth(1).click(); pg.wait_for_timeout(400)
    endop(pg, False, 'The Last Lab Is Gone')
    print('last op button:', pg.inner_text('#modal #b-camp'))
    pg.click('#modal #b-camp'); pg.wait_for_timeout(500); pg.screenshot(path=OUT + 'c2_end.png', full_page=True)
    print('end title:', pg.inner_text('#modal h2'))
    pg.click('#b-ctitle'); pg.wait_for_timeout(400)
    print('title records:', pg.inner_text('.records'))
    print('start campaign button back:', pg.locator('#t-camp').count() == 1)
    b.close()
print('ERRORS:', errs or 'none')
