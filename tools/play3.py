from playwright.sync_api import sync_playwright
errs=[]
def clear_modals(pg, shots=None):
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
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':900}); pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','skip')}catch(e){}")
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); pg.wait_for_timeout(300)
    pg.fill('#t-seed','PHASE2'); pg.click('#t-start'); pg.wait_for_timeout(300)
    # play ~12 weeks normally so the world is a mess, then hand the labs the cure
    for t in range(12):
        clear_modals(pg); play_cards(pg); clear_modals(pg)
        if not pg.query_selector('#modal'):
            if not pg.query_selector('#b-end'): print('NO APP:', pg.evaluate("document.body.innerText.slice(0,400)")); __import__('sys').exit(1)
            if pg.evaluate("document.querySelector('#b-end').disabled"): print('DISABLED', pg.evaluate("(()=>{const S=__ECB.S; return JSON.stringify({turn:S.turn, crisis:S.crisis&&S.crisis.id, pr:!!S.pendingReward, pd:S.pendingDoctrine, cure:!!S.cureChoice, over:!!S.over})})()")); __import__('sys').exit(1)
            pg.click('#b-end'); pg.wait_for_timeout(150)
    clear_modals(pg)
    pg.evaluate("__ECB.S.research = 99.9")
    play_cards(pg); clear_modals(pg)
    if not pg.query_selector('#c-go'):
        pg.click('#b-end'); pg.wait_for_timeout(300)
        r = clear_modals(pg)
    pg.wait_for_timeout(300); pg.screenshot(path='/tmp/claude-0/shots/p2_cure.png')
    print('cure modal shown:', bool(pg.query_selector('#c-go')))
    pg.click('#c-go'); pg.wait_for_timeout(400); clear_modals(pg)
    pg.screenshot(path='/tmp/claude-0/shots/p2_start.png')
    for t in range(8):
        clear_modals(pg); play_cards(pg); clear_modals(pg)
        if not pg.query_selector('#modal'):
            if not pg.query_selector('#b-end'): print('NO APP:', pg.evaluate("document.body.innerText.slice(0,400)")); __import__('sys').exit(1)
            if pg.evaluate("document.querySelector('#b-end').disabled"): print('DISABLED', pg.evaluate("(()=>{const S=__ECB.S; return JSON.stringify({turn:S.turn, crisis:S.crisis&&S.crisis.id, pr:!!S.pendingReward, pd:S.pendingDoctrine, cure:!!S.cureChoice, over:!!S.over})})()")); __import__('sys').exit(1)
            pg.click('#b-end'); pg.wait_for_timeout(150)
    clear_modals(pg)
    # select a fallen or unrestored region to show the checklist
    pg.evaluate("""(()=>{const S=__ECB.S,E=__ECB.E; const t=E.REGIONS.find(r=>S.regions[r.id].fallen)||E.REGIONS.find(r=>!S.regions[r.id].restored && r.id!==S.b.loc); if(t){ document.querySelector(`#g-reg .rg[data-id="${t.id}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true})); }})()""")
    pg.wait_for_timeout(300); pg.screenshot(path='/tmp/claude-0/shots/p2_mid.png')
    print(pg.evaluate("({turn:__ECB.S.turn, end:__ECB.S.restoreEnd, restored:__ECB.E.restoredCount(__ECB.S), phase:__ECB.S.phase})"))
    for t in range(20):
        r = clear_modals(pg)
        if r == 'over': break
        play_cards(pg); r = clear_modals(pg)
        if r == 'over': break
        if not pg.query_selector('#modal'): pg.click('#b-end'); pg.wait_for_timeout(120)
    clear_modals(pg); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/claude-0/shots/p2_over.png')
    print(pg.evaluate("({turn:__ECB.S.turn, over:__ECB.S.over && __ECB.S.over.title, score:__ECB.S.over && __ECB.S.over.score, restored:__ECB.E.restoredCount(__ECB.S)})"))
    # the other branch: end at the cure
    p2=b.new_page(viewport={'width':1440,'height':900}); p2.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','skip')}catch(e){}"); p2.on('pageerror', lambda e: errs.append('P2 PAGEERROR: '+str(e)))
    p2.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.setItem('ecb_tut','skip')}catch(e){}")
    p2.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); p2.wait_for_timeout(300); p2.click('#t-start'); p2.wait_for_timeout(300)
    clear_modals(p2); p2.evaluate("__ECB.S.research = 99.99"); p2.click('#b-end'); p2.wait_for_timeout(300); clear_modals(p2)
    if p2.query_selector('#c-end'): p2.click('#c-end'); p2.wait_for_timeout(300)
    print('end-at-cure:', p2.evaluate("__ECB.S.over && __ECB.S.over.title"))
    b.close()
print('\n'.join(errs) or 'no page errors')
