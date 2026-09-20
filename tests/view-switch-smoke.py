"""Offline DOM regression for the shared shell and both real renderers.
Navigation is simulated between inline fixtures; no remote site is contacted.
Storage is emulated because about:blank has no storage origin.
"""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def inline(name):
    h=(ROOT/name).read_text()
    h=re.sub(r'<link rel="stylesheet" href="([^"?]+)[^"]*"\s*/?>',lambda m:'<style>'+(ROOT/m[1]).read_text()+'</style>',h)
    def script(m):
        path=m[1]
        if path.endswith('launch-three-level.js'): path='assets/js/explorer.js'
        content=(ROOT/path).read_text().replace('</script','<\\/script')
        if path=='data/model.js': content+='\nwindow.TREE_GOV_ARCHITECTURE='+ (ROOT/'data/architecture.json').read_text()+';'
        return '<script>'+content+'</script>'
    return re.sub(r'<script src="([^"?]+)[^"]*"></script>',script,h)
with sync_playwright() as p:
    opts={'headless':True}
    if os.environ.get('CHROMIUM_PATH'):opts['executable_path']=os.environ['CHROMIUM_PATH']
    browser=p.chromium.launch(**opts)
    context=browser.new_context(viewport={'width':1440,'height':950},accept_downloads=True)
    storage={'session':{},'local':{}}
    errors=[]
    def load(name,fragment=''):
        page=context.new_page(); page.on('pageerror',lambda e:errors.append(str(e)))
        page.route('**/*',lambda r:r.abort())
        page.evaluate('''stores=>{
          for(const [key,name] of [['sessionStorage','session'],['localStorage','local']]){
            const s=stores[name];
            Object.defineProperty(window,key,{value:{getItem:k=>s[k]??null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]},configurable:true});
          }
          window.testStorage=stores;
        }''',storage)
        if fragment:page.evaluate('(h)=>history.replaceState(null,"", "#"+h)',fragment)
        page.set_content(inline(name))
        if name=='index.html':page.wait_for_function('window.TreeGovernance?.network && document.querySelectorAll("#nodes .node").length>0')
        else:page.wait_for_selector('#levels .level-button')
        page.evaluate('''()=>{
          document.querySelector('.view-switch').addEventListener('click',event=>{
            const a=event.target.closest('a[data-mode]');
            if(a){event.preventDefault();window.testTarget=a.getAttribute('href');}
          });
        }''')
        return page
    def switch(page,mode):
        global storage
        page.locator(f'.view-switch [data-mode="{mode}"]').click()
        target=urlsplit(page.evaluate('testTarget'))
        storage=page.evaluate('testStorage')
        page.close()
        return load(target.path.strip('/'),target.fragment)
    page=load('index.html')
    assert page.locator('.view-switch [aria-current]').inner_text()=='Network graph'
    assert page.locator('#nodes .node').count()==44
    model=page.evaluate('JSON.stringify(TreeGovernance.model)')
    brand=page.locator('.brand').inner_text()
    style=page.locator('.brand strong').evaluate('(e)=>[getComputedStyle(e).fontSize,getComputedStyle(e).fontWeight,getComputedStyle(e).fontFamily]')
    for lens in page.locator('#lens option').evaluate_all('(els)=>els.map(e=>e.value)'):
        page.locator('#lens').select_option(lens)
        assert not page.evaluate('''()=>{
          const ns=[...document.querySelectorAll('#nodes .node')].map(n=>n.dataset.id);
          const ids=new Set([...document.querySelectorAll('#edges .edge')].map(e=>e.dataset.id));
          const es=TreeGovernance.model.edges.filter(e=>ids.has(e.id));
          return ns.filter(id=>!es.some(e=>e.source===id||e.target===id));
        }'''),lens
    page.locator('#lens').select_option('ecology')
    node=page.locator('#nodes .node[data-id="r_puccini"]');node.click()
    assert 'Puccini' in page.locator('#sideBody h2').inner_text()
    before=node.get_attribute('transform');box=node.bounding_box();x,y=box['x']+box['width']/2,box['y']+box['height']/2
    page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+32,y+20,steps=7);page.mouse.up()
    dragged=node.get_attribute('transform');assert before!=dragged
    assert page.evaluate('getSelection().toString()')==''
    page=switch(page,'three-level')
    page.wait_for_function('document.querySelector("[data-key=center]")?.dataset.node==="r_puccini"')
    assert page.locator('.brand').inner_text()==brand
    assert page.locator('.brand strong').evaluate('(e)=>[getComputedStyle(e).fontSize,getComputedStyle(e).fontWeight,getComputedStyle(e).fontFamily]')==style
    assert page.evaluate('JSON.stringify(TreeGovernance.model)')==model
    page=switch(page,'network')
    assert page.locator('#lens').input_value()=='ecology'
    assert page.locator('#nodes .node[data-id="r_puccini"]').get_attribute('transform')==dragged
    page=switch(page,'three-level')
    page.locator('#search').fill('herplantfonds');page.locator('#searchResults [data-id="res_fund"]').click()
    page.wait_for_function('document.querySelector("[data-key=center]")?.dataset.node==="res_fund"')
    page=switch(page,'network')
    assert page.locator('#nodes .node.selected').get_attribute('data-id')=='res_fund'
    page.locator('#nodeNote').fill('PRIVATE_TEST_NOTE')
    with page.expect_download() as evt:page.locator('#exportBtn').click()
    assert 'PRIVATE_TEST_NOTE' not in Path(evt.value.path()).read_text()
    page.close();page=load('index.html');assert page.locator('#lens').input_value()=='all';page.close()
    for width in [390,768,1024,1440,1920]:
        for name in ['index.html','three-level.html']:
            page=load(name);page.set_viewport_size({'width':width,'height':900})
            assert page.locator('.brand strong').inner_text()=='Amsterdam'
            for link in page.locator('.view-switch a').all():
                b=link.bounding_box();assert link.is_visible() and b['x']>=0 and b['x']+b['width']<=width+1 and b['height']>=44,(width,name,b)
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,name)
            if os.environ.get('QA_SHOTS') and width in [390,1440]:
                d=Path(os.environ['QA_SHOTS']);d.mkdir(exist_ok=True,parents=True);page.screenshot(path=str(d/f'{name}-{width}.png'))
            page.close()
    assert not errors,errors
    print('PASS: network default, identical brand and model, all lenses, selected-node round trip, dragged layout restoration, resource navigation, private export, 5 widths. Offline DOM/navigation fixtures only.')
    browser.close()
