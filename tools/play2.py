from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1440,'height':900})
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0')}catch(e){}")
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); pg.wait_for_timeout(400)
    pg.click('.cmd[data-c="avn"]'); pg.click('#t-diff button[data-d="veteran"]'); pg.fill('#t-seed','LONG7')
    pg.click('#t-start'); pg.wait_for_timeout(300)
    shot15=False
    for step in range(400):
        m = pg.query_selector('#modal')
        if m:
            if pg.query_selector('#b-new'): break
            if pg.query_selector('#b-cont'): pg.click('#b-cont'); pg.wait_for_timeout(1350)
            elif pg.query_selector('.rewards'): pg.click('.rewards .card')
            elif pg.query_selector('.opt:not([disabled])'): pg.click('.opt:not([disabled])')
            else: pg.keyboard.press('Escape')
            pg.wait_for_timeout(60); continue
        cards = pg.query_selector_all('#hand .card:not(.no)')
        if cards: cards[0].click(); pg.wait_for_timeout(260); continue
        t = pg.evaluate('__ECB.S.turn')
        if t==15 and not shot15: pg.screenshot(path='/tmp/claude-0/shots/20_week15.png'); shot15=True
        # occasionally deploy to worst lab region
        if t % 5 == 0:
            pg.evaluate("""(()=>{const S=__ECB.S,E=__ECB.E; const t=E.REGIONS.filter(r=>!S.regions[r.id].fallen && S.regions[r.id].z>0.003 && E.hops(S.b.loc,r.id)<=2).sort((a,b)=>S.regions[b.id].z-S.regions[a.id].z)[0]; if(t) E.deploy(S,t.id);})()""")
        pg.click('#b-end'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/claude-0/shots/21_gameover.png')
    print(pg.evaluate('({turn:__ECB.S.turn, over:__ECB.S.over && __ECB.S.over.title})'))
    pg.click('#b-look'); pg.wait_for_timeout(300); pg.screenshot(path='/tmp/claude-0/shots/22_finalmap.png')
    # phone layout check
    ph=b.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
    ph.add_init_script("try{localStorage.setItem('ecb_intro','0')}catch(e){}")
    ph.on('pageerror', lambda e: errs.append('PHONE PAGEERROR: '+str(e)))
    ph.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); ph.wait_for_timeout(400)
    ph.click('#t-start'); ph.wait_for_timeout(300); ph.click('.opt[data-i="1"]'); ph.wait_for_timeout(300)
    ph.screenshot(path='/tmp/claude-0/shots/23_phone.png')
    ph.evaluate('window.scrollTo(0, 560)'); ph.wait_for_timeout(200); ph.screenshot(path='/tmp/claude-0/shots/24_phone_scroll.png')
    print('phone scrollWidth', ph.evaluate('document.documentElement.scrollWidth'))
    b.close()
print('\n'.join(errs) or 'no page errors')
