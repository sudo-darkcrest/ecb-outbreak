# tutorial walk-through, sounds (no errors), and map animations on desktop + phone
import sys
from playwright.sync_api import sync_playwright
errs = []
def tip(pg):
    return pg.evaluate("(()=>{const t=document.querySelector('#tut'); if(!t||t.style.display==='none') return null; return t.querySelector('.tut-t').textContent;})()")
def shot(pg, name): pg.screenshot(path=f'/tmp/claude-0/shots/{name}.png')
for vp, tag in [((1440, 900), 'd'), ((390, 844), 'p')]:
  with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': vp[0], 'height': vp[1]})
    pg.add_init_script("try{localStorage.setItem('ecb_intro','0');localStorage.removeItem('ecb_tut');localStorage.setItem('ecb_mute','0')}catch(e){}")
    pg.on('pageerror', lambda e: errs.append(tag + ' PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'ERR_TUNNEL' not in m.text and errs.append(tag + ' CONSOLE: ' + m.text))
    pg.goto('file:///home/claude/ecb/dist/ECB_Outbreak.html'); pg.wait_for_timeout(300)
    pg.fill('#t-seed', 'TUTOR1'); pg.click('#t-start'); pg.wait_for_timeout(500)
    seen = []
    print(tag, 'tip1:', tip(pg)); shot(pg, tag + '_t1_crisis'); seen.append(tip(pg))
    pg.click('#modal .opt:not([disabled])'); pg.wait_for_timeout(450)
    print(tag, 'tip2:', tip(pg)); shot(pg, tag + '_t2_map'); seen.append(tip(pg))
    pg.click('#tut-next'); pg.wait_for_timeout(500)
    print(tag, 'tip3:', tip(pg)); shot(pg, tag + '_t3_hand'); seen.append(tip(pg))
    c = pg.query_selector_all('#hand .card:not(.no)'); c[0].click(); pg.wait_for_timeout(700)
    print(tag, 'tip4:', tip(pg)); shot(pg, tag + '_t4_ato'); seen.append(tip(pg))
    pg.click('#b-ato'); pg.wait_for_timeout(300)
    o = pg.query_selector('#modal .opt.task:not([disabled])'); o.click(); pg.wait_for_timeout(500)
    shot(pg, tag + '_fx_helo')
    print(tag, 'tip5:', tip(pg)); seen.append(tip(pg))
    pg.click('#b-eng'); pg.wait_for_timeout(300)
    o = pg.query_selector('#modal .opt.task:not([disabled])'); o.click(); pg.wait_for_timeout(500)
    print(tag, 'tip6:', tip(pg)); shot(pg, tag + '_t6_end'); seen.append(tip(pg))
    pg.click('#b-end'); pg.wait_for_timeout(500)
    print(tag, 'tip7:', tip(pg)); shot(pg, tag + '_t7_sitrep'); seen.append(tip(pg))
    pg.click('#b-cont'); pg.wait_for_timeout(500); shot(pg, tag + '_fx_week')
    pg.wait_for_timeout(1400)
    for k in range(6):
        if pg.query_selector('#modal .opts') and not tip(pg):
            pg.click('#modal .opt:not([disabled])'); pg.wait_for_timeout(350)
        elif pg.query_selector('#modal .rewards'):
            pg.click('#modal .rewards .card'); pg.wait_for_timeout(350)
    for n in range(5):
        t = tip(pg); print(tag, 'tip', 8 + n, ':', t); seen.append(t)
        if n == 1: shot(pg, tag + '_t9_posture')
        if not t or not pg.query_selector('#tut #tut-next'): break
        pg.click('#tut-next'); pg.wait_for_timeout(450)
    print(tag, 'tut state:', pg.evaluate("localStorage.getItem('ecb_tut')"), '| bubble visible:', tip(pg))
    # deploy convoy animation
    ok = pg.evaluate("""(()=>{const S=__ECB.S,E=__ECB.E; const n=E.neighbors(S.b.loc).find(x=>E.canDeploy(S,x)===true); if(!n) return false; document.querySelector(`#g-reg .rg[data-id="${n}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true})); return n;})()""")
    pg.wait_for_timeout(300)
    if ok and pg.query_selector('#b-deploy:not([disabled])'):
        pg.click('#b-deploy'); pg.wait_for_timeout(700); shot(pg, tag + '_fx_convoy'); print(tag, 'deployed to', ok)
    print(tag, 'sound button:', pg.evaluate("document.querySelector('#b-snd').getAttribute('aria-pressed')"))
    pg.click('#b-snd'); print(tag, 'after toggle muted =', pg.evaluate("localStorage.getItem('ecb_mute')"))
    b.close()
print('ERRORS:', errs if errs else 'none')
