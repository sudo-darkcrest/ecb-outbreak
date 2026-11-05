# tests the weekly tasking (air + engineers), new art in the hand, and phone layout
import sys
from playwright.sync_api import sync_playwright
errs=[]
def clear_modals(pg):
    for k in range(8):
        if not pg.query_selector('#modal'): return
        if pg.query_selector('#c-go'): return 'cure'
        if pg.query_selector('#b-new'): return 'over'
        if pg.query_selector('#b-cont'): pg.click('#b-cont'); pg.wait_for_timeout(1350)
        elif pg.query_selector('.rewards'): pg.click('.rewards .card')
        elif pg.query_selector('.opt:not([disabled])'): pg.click('.opt:not([disabled])')
        pg.wait_for_timeout(80)
def play_cards(pg):
    for k in range(6):
        c = pg.query_selector_all('#hand .card:not(.no)')
        if not c or pg.query_selector('#modal'): break
        c[0].click(); pg.wait_for_timeout(240)
def tasks(pg, shot=None):
    pg.click('#b-ato'); pg.wait_for_timeout(250)
    if shot: pg.screenshot(path=shot+'_air.png')
    o = pg.query_selector('#modal .opt.task:not([disabled])')
    if o: o.click(); pg.wait_for_timeout(200)
    else: pg.click('#b-x')
    pg.click('#b-eng'); pg.wait_for_timeout(250)
    if shot: pg.screenshot(path=shot+'_eng.png')
    o = pg.query_selector('#modal .opt.task:not([disabled])')
    if o: o.click(); pg.wait_for_timeout(200)
    else: pg.click('#b-x')
for vp,name in [((1440,900),'desk'),((390,844),'phone')]:
  with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':vp[0],'height':vp[1]}); pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','done')}catch(e){}")
    pg.on('pageerror', lambda e: errs.append(name+' PAGEERROR: '+str(e)))
    pg.on('console', lambda m: m.type=='error' and 'fonts' not in m.text and errs.append(name+' CONSOLE: '+m.text))
    pg.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); pg.wait_for_timeout(300)
    if name=='desk': pg.screenshot(path='/tmp/claude-0/shots/t_title.png')
    pg.fill('#t-seed','TASKS1'); pg.click('#t-start'); pg.wait_for_timeout(300)
    for t in range(10):
        clear_modals(pg)
        tasks(pg, f'/tmp/claude-0/shots/{name}_w{t}' if t in (0,3) else None)
        clear_modals(pg); play_cards(pg); clear_modals(pg)
        if t==3: pg.screenshot(path=f'/tmp/claude-0/shots/{name}_game.png', full_page=(name=='phone'))
        if not pg.query_selector('#modal'):
            if pg.evaluate("document.querySelector('#b-end').disabled"): print('DISABLED'); break
            pg.click('#b-end'); pg.wait_for_timeout(150)
    clear_modals(pg)
    print(name, pg.evaluate("(()=>{const S=__ECB.S,E=__ECB.E; return {turn:S.turn, air:S.b.air, eng:S.b.eng, works:E.REGIONS.filter(r=>E.worksIn(S,r.id).length).map(r=>r.id+':'+E.worksIn(S,r.id).join('+')), helo:S.b.helo, over:S.over&&S.over.title}})()"))
    t0=pg.evaluate("performance.now()"); pg.click('#b-deck'); pg.wait_for_timeout(100); t1=pg.evaluate("performance.now()"); print(name,'deck view ms', round(t1-t0)); pg.screenshot(path=f'/tmp/claude-0/shots/{name}_deck.png'); pg.click('#b-x')
    b.close()
print('ERRORS:', errs if errs else 'none')
