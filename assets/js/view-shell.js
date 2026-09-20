/* Shared navigation. State is local to this tab, never part of the model export. */
(function () {
  'use strict';
  const mode = document.body.dataset.viewMode;
  let context = {}, snapshot = null;
  function load(key) { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } }
  function save(key,value) { try { sessionStorage.setItem(key,JSON.stringify(value)); } catch {} }
  function threeContext() {
    const p = new URLSearchParams(location.hash.slice(1));
    return {node:p.get('node'), arena:p.get('arena'), basis:p.get('basis')==='documented'?'documented':'all'};
  }
  function href(target) {
    if (target===mode) return location.pathname+location.search+location.hash;
    const c = mode==='three-level' ? threeContext() : context;
    const p = new URLSearchParams();
    p.set('resume','1');
    if (target==='network') p.set('view','network');
    else if(c.node) p.set('view','element');
    else if(c.arena) p.set('view','situation');
    else p.set('view','system');
    if(c.node)p.set('node',c.node);
    if(c.arena)p.set('arena',c.arena);
    if(c.edge&&target==='network')p.set('edge',c.edge);
    if(c.basis==='documented')p.set('basis','documented');
    return (target==='network'?'index.html':'three-level.html')+'#'+p;
  }
  function refresh() {
    document.querySelectorAll('.view-switch a[data-mode]').forEach(a => {
      a.href=href(a.dataset.mode);
    });
  }
  window.TreeGovShell = {
    register(fn) { snapshot=fn; },
    publish(value) { context={...context,...value}; refresh(); },
    restore() {
      return new URLSearchParams(location.hash.slice(1)).get('resume')==='1' ? load('treegov.network.snapshot') : null;
    }
  };
  document.querySelector('.view-switch')?.addEventListener('click',ev => {
    const a=ev.target.closest('a[data-mode]');
    if(!a)return;
    if(a.dataset.mode===mode) { if(!ev.ctrlKey&&!ev.metaKey&&!ev.shiftKey)ev.preventDefault(); return; }
    if(mode==='network' && snapshot)save('treegov.network.snapshot',snapshot());
    a.href=href(a.dataset.mode);
  });
  window.addEventListener('pagehide',() => {
    if(mode==='network'&&snapshot)save('treegov.network.snapshot',snapshot());
  });
  window.addEventListener('hashchange',refresh);
  refresh();
  // Old shared three-level permalinks at the root remain meaningful.
  const p=new URLSearchParams(location.hash.slice(1));
  if(mode==='network'&&['system','situation','element'].includes(p.get('view'))) {
    location.replace('three-level.html'+location.search+location.hash);
  }
})();
