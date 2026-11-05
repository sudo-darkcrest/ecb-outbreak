import pathlib
R = pathlib.Path(__file__).resolve().parent.parent
(R/'dist').mkdir(exist_ok=True)
css = (R/'src/style.css').read_text(); md = (R/'src/mapdata.js').read_text(); eng = (R/'src/engine.js').read_text(); art = (R/'src/art.js').read_text(); cine = (R/'src/cinema.js').read_text(); ui = (R/'src/ui.js').read_text()
eng = eng.replace("if (typeof module !== 'undefined') module.exports = ECB;", "")
head = '''<title>ECB: Outbreak</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Roguelike zombie plague card game. Command the Expeditionary Combat Brigade and hold the world together until a cure is found.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Saira+Semi+Condensed:wght@400;500;600;700&family=Saira+Stencil+One&display=swap">
'''
body = f'''<style>
{css}
</style>
<div id="root"></div>
<script>
{md}
{eng}
{art}
{cine}
</script>
<script>
{ui}
</script>
'''
(R/'dist/artifact.html').write_text(head + body)
full = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + '</head>\n<body>\n' + body + '</body>\n</html>\n'
(R/'dist/ECB_Outbreak.html').write_text(full)
(R/'index.html').write_text(full)  # the page Render serves
print('built', len(full)//1024, 'KB')
