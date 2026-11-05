import sys
from playwright.sync_api import sync_playwright
src=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1680
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':w,'height':900}); pg.goto('file://'+src); pg.wait_for_timeout(300); pg.screenshot(path=out, full_page=True); b.close()
