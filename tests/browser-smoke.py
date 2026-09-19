"""Optional offline browser QA. Requires Python Playwright and Chromium.
No external network is used: tests exercise the generated standalone page.
"""
import json
import os
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as tmp:
    standalone = Path(tmp) / 'explorer.html'
    subprocess.run(['node', str(ROOT/'scripts/build-standalone.js'), str(standalone)], check=True)
    with sync_playwright() as p:
        opts = {'headless': True}
        if os.environ.get('CHROMIUM_PATH'):
            opts['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = p.chromium.launch(**opts)
        page = browser.new_page(viewport={'width':1440,'height':1000}, accept_downloads=True)
        failures = []
        page.on('pageerror', lambda error: failures.append(str(error)))
        page.set_content(standalone.read_text())
        page.wait_for_function('window.TreeGovernance && window.TreeGovernance.model.nodes.length === 44')
        model = page.evaluate('window.TreeGovernance.model')
        assert page.locator('.system-graph .card').count() == 6
        overlaps = page.evaluate('''() => {
          const cards=[...document.querySelectorAll('.system-graph .card')].map(x=>x.getBoundingClientRect());
          const overlap=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
          return [...document.querySelectorAll('.system-graph .edge-label')].filter(x=>cards.some(c=>overlap(x.getBoundingClientRect(),c))).map(x=>x.textContent);
        }''')
        assert overlaps == [], f'Overview labels overlap cards: {overlaps}'
        for arena in model['actionSituations']:
            for tab in ['activities','participants','information','constraints','evidence']:
                page.evaluate('(h)=>location.hash=h', f"view=situation&arena={arena['id']}&tab={tab}")
                page.wait_for_function('(x)=>document.querySelector(".tab.active")?.dataset.id===x', arg=tab)
                assert page.locator('.activity').count() <= 5
        for node in model['nodes']:
            page.evaluate('(h)=>location.hash=h', f"view=element&node={node['id']}")
            page.wait_for_function('(id)=>document.querySelector("[data-key=center]")?.dataset.node===id', arg=node['id'])
            assert page.locator('.element-graph .card').count() <= 9
            assert node['label'] in page.locator('#inspector').inner_text()
        page.evaluate("location.hash='view=element&node=p_permit&arena=permits'")
        page.wait_for_function('document.querySelector("[data-key=center]")?.dataset.node === "p_permit"')
        card = page.locator('.element-graph [data-node="r_bomenverord"]')
        card.click()
        page.wait_for_function('document.querySelector("[data-key=center]")?.dataset.node === "r_bomenverord"')
        center=page.locator('.element-graph [data-key="center"]')
        before=center.get_attribute('transform'); b=center.bounding_box()
        page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2)
        page.mouse.down();page.mouse.move(b['x']+b['width']/2+30,b['y']+b['height']/2+15,steps=8);page.mouse.up()
        assert center.get_attribute('transform') != before
        assert page.evaluate('getSelection().toString()') == ''
        assert center.get_attribute('data-node') == 'r_bomenverord'
        page.locator('#levels button[data-action="level"][data-id="system"]').click()
        page.locator('button[data-action="question"][data-id="2"]').click()
        assert '1 synthesis' in page.locator('#routeResult').inner_text()
        page.locator('#routeDocumented').check();page.locator('[data-action="run-route"]').click()
        assert 'No directed path' in page.locator('#routeResult').inner_text()
        page.locator('[data-action="close-dialog"]').click()
        page.locator('#search').fill('herplantfonds')
        page.locator('#searchResults [data-id="res_fund"]').click()
        page.wait_for_function('document.querySelector("[data-key=center]")?.dataset.node === "res_fund"')
        page.locator('#inspector textarea').fill('PRIVATE_QA_NOTE_DO_NOT_EXPORT')
        with page.expect_download() as event:
            page.locator('.nav-bar [data-action="export"]').click()
        downloaded = Path(event.value.path()).read_text()
        assert 'PRIVATE_QA_NOTE_DO_NOT_EXPORT' not in downloaded
        assert json.loads(downloaded)['metadata']['version'] == '0.4.0'
        for width in [390,768,1440,1920]:
            page.set_viewport_size({'width':width,'height':900})
            page.evaluate("location.hash='view=system'")
            page.wait_for_selector('.system-graph', state='attached')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
            if width == 390:
                assert page.locator('.mobile-system').is_visible()
                assert not page.locator('.system-canvas').is_visible()
        assert failures == [], failures
        print('PASS: 30 arena/tab views, 44 elements, overview-label layout, click/drag, evidence filtering, source search, export privacy, 4 responsive widths; no JavaScript errors.')
        browser.close()
