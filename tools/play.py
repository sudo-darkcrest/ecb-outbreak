from playwright.sync_api import sync_playwright
import sys
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1440,'height':900})
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0')}catch(e){}")
    pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html')
    pg.wait_for_timeout(600)
    pg.screenshot(path='/tmp/claude-0/shots/01_title.png')
    pg.fill('#t-seed','DEMO1')
    pg.click('#t-start'); pg.wait_for_timeout(500)
    pg.screenshot(path='/tmp/claude-0/shots/02_warno.png')
    pg.click('.opt[data-i="0"]'); pg.wait_for_timeout(400)
    pg.screenshot(path='/tmp/claude-0/shots/03_game.png')
    # play a few turns
    for t in range(9):
        for k in range(6):
            cards = pg.query_selector_all('#hand .card:not(.no)')
            if not cards: break
            cards[0].click(); pg.wait_for_timeout(300)
            if pg.query_selector('#modal'): break
        pg.click('#b-end'); pg.wait_for_timeout(400)
        for k in range(4):
            m = pg.query_selector('#modal')
            if not m: break
            if pg.query_selector('#b-cont'):
                if t==3 and k==0: pg.screenshot(path='/tmp/claude-0/shots/04_sitrep.png')
                pg.click('#b-cont')
            elif pg.query_selector('.rewards'):
                pg.screenshot(path='/tmp/claude-0/shots/05_reward.png'); pg.click('.rewards .card')
            elif pg.query_selector('.opt:not([disabled])'):
                if t==2: pg.screenshot(path='/tmp/claude-0/shots/06_crisis.png')
                pg.click('.opt:not([disabled])')
            pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/claude-0/shots/07_midgame.png')
    # select a region & tabs
    pg.click('.tabs button[data-tab="regions"]'); pg.wait_for_timeout(200)
    pg.click('.rrow:nth-child(3)'); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/claude-0/shots/08_regions.png')
    pg.click('.tabs button[data-tab="threat"]'); pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/claude-0/shots/09_threat.png')
    st = pg.evaluate('({turn:__ECB.S.turn, res:__ECB.S.research, loc:__ECB.S.b.loc})'); print(st)
    # phone
    ph=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    ph.add_init_script("try{localStorage.setItem('ecb_intro','0')}catch(e){}")
    ph.on('pageerror', lambda e: errs.append('PHONE PAGEERROR: '+str(e)))
    ph.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); ph.wait_for_timeout(500)
    ph.screenshot(path='/tmp/claude-0/shots/10_phone_title.png', full_page=False)
    ph.click('#t-start'); ph.wait_for_timeout(400); ph.click('.opt[data-i="1"]'); ph.wait_for_timeout(400)
    ph.screenshot(path='/tmp/claude-0/shots/11_phone_game.png')
    ph.screenshot(path='/tmp/claude-0/shots/12_phone_full.png', full_page=True)
    sw = ph.evaluate('document.documentElement.scrollWidth'); print('phone scrollWidth', sw)
    b.close()
print('\n'.join(errs) or 'no errors')
