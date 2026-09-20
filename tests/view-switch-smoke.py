"""Offline DOM/interaction QA for both view-mode controls.
Requires Python Playwright and Chromium. All assets are inlined from this repo;
no HTTP access is required. Link targets are checked, not live deployment.
Run: CHROMIUM_PATH=/usr/bin/chromium python tests/view-switch-smoke.py
"""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://spoonforks.github.io/TreeGovernance/'

def fixture(name):
    text = (ROOT/name).read_text()
    text = text.replace('<head>', '<head><base href="'+BASE+'">', 1)
    def css(m):
        file = m.group(1).split('?')[0]
        return '<style>'+(ROOT/file).read_text()+'</style>'
    def js(m):
        file = m.group(1).split('?')[0]
        content = (ROOT/file).read_text().replace('</script', '<\\/script')
        if file.endswith('model.js'):
            content += '\nwindow.TREE_GOV_ARCHITECTURE='+ (ROOT/'data/architecture.json').read_text()+';'
        return '<script>'+content+'</script>'
    text = re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>', css, text)
    text = re.sub(r'<script src="([^"]+)"></script>', js, text)
    return text

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width':1440, 'height':1000})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))

    def load(name):
        page.goto('about:blank')
        page.set_content(fixture(name))
        page.wait_for_selector('.system-graph .card' if name == 'index.html' else '#nodes .node', state='attached')
        page.evaluate('''() => {
          window.lastModeTarget = null;
          document.querySelector('.view-switch').addEventListener('click', event => {
            const link = event.target.closest('a');
            if (link) { event.preventDefault(); window.lastModeTarget = link.href; }
          });
        }''')

    load('index.html')
    switch = page.get_by_role('navigation', name='View mode', exact=True)
    assert switch.locator('[aria-current="page"]').inner_text() == 'Three-level'
    switch.get_by_role('link', name='Network graph', exact=True).click()
    assert page.evaluate('lastModeTarget') == BASE+'legacy.html'
    load('legacy.html')
    assert page.locator('#nodes .node').count() == 41
    assert switch.locator('[aria-current="page"]').inner_text() == 'Network graph'
    page.locator('#lens').select_option('ecology')
    assert page.locator('#nodes .node').count() == 12
    page.locator('#layout').select_option('flow')
    page.locator('#fit').click()
    page.locator('#nodes .node[data-id="r_puccini"]').click()
    assert 'Puccini' in page.locator('#sideBody h2').inner_text()
    node = page.locator('#nodes .node[data-id="r_puccini"]')
    before = node.get_attribute('transform')
    b = node.bounding_box()
    x, y = b['x'] + b['width']/2, b['y'] + b['height']/2
    page.mouse.move(x, y); page.mouse.down()
    page.mouse.move(x + 25, y + 20, steps=8); page.mouse.up()
    assert node.get_attribute('transform') != before
    assert page.evaluate('getSelection().toString()') == ''
    switch.get_by_role('link', name='Three-level', exact=True).focus()
    page.keyboard.press('Enter')
    assert page.evaluate('lastModeTarget') == BASE+'index.html'
    for width in [390, 768, 1024, 1440, 1920]:
        page.set_viewport_size({'width':width, 'height':900})
        for name in ['index.html', 'legacy.html']:
            load(name)
            for a in page.locator('.view-switch a').all():
                assert a.is_visible(), (width,name)
                b = a.bounding_box()
                assert b['x'] >= 0 and b['x']+b['width'] <= width + 1, (width,name,b)
                assert b['height'] >= 44, (width,name,b)
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), (width,name)
            if os.environ.get('QA_SHOTS') and width in [390, 1440]:
                dest=Path(os.environ['QA_SHOTS']);dest.mkdir(parents=True,exist_ok=True)
                page.screenshot(path=str(dest/f'{name}-{width}.png'))
    assert errors == [], errors
    print('PASS: both link targets and active states, keyboard activation, original lens and click/drag controls, 5 responsive widths; no JavaScript errors. Offline DOM fixtures only.')
    browser.close()
