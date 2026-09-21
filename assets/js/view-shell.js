/* Shared navigation. View state is local to this tab, never part of model exports.
   HGS has its own model and URL state: never translate its IDs into the other views. */
(function () {
  'use strict';
  const mode = document.body.dataset.viewMode;
  const pages = {network:'index.html', 'three-level':'three-level.html', hgs:'hoofdgroenstructuur.html'};
  if (!Object.prototype.hasOwnProperty.call(pages, mode)) return;
  let context = {}, snapshot = null;
  function load(key) { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } }
  function save(key,value) { try { sessionStorage.setItem(key,JSON.stringify(value)); } catch {} }
  function remember() { save('treegov.location.'+mode, location.search+location.hash); }
  function rememberedHref(target) {
    const saved=load('treegov.location.'+target);
    const suffix=typeof saved==='string' && /^[?#]/.test(saved) ? saved : '';
    if(target!=='network') return pages[target]+suffix;
    const hashAt=suffix.indexOf('#');
    const search=hashAt<0?suffix:suffix.slice(0,hashAt);
    const p=new URLSearchParams(hashAt<0?'':suffix.slice(hashAt+1));
    p.set('resume','1');p.set('view','network');
    return pages[target]+search+'#'+p;
  }
  function threeContext() {
    const p = new URLSearchParams(location.hash.slice(1));
    return {node:p.get('node'), arena:p.get('arena'), basis:p.get('basis')==='documented'?'documented':'all'};
  }
  function href(target) {
    if (target===mode) return location.pathname+location.search+location.hash;
    if (target==='hgs' || mode==='hgs') return rememberedHref(target);
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
    return pages[target]+'#'+p;
  }
  function refresh() {
    document.querySelectorAll('.view-switch a[data-mode]').forEach(a => {
      if(Object.prototype.hasOwnProperty.call(pages,a.dataset.mode))a.href=href(a.dataset.mode);
    });
  }
  function persist() {
    remember();
    if(mode==='network'&&snapshot)save('treegov.network.snapshot',snapshot());
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
    if(!a || !Object.prototype.hasOwnProperty.call(pages,a.dataset.mode))return;
    if(a.dataset.mode===mode) { if(!ev.ctrlKey&&!ev.metaKey&&!ev.shiftKey)ev.preventDefault(); return; }
    persist();
    a.href=href(a.dataset.mode);
  });
  window.addEventListener('pagehide',persist);
  window.addEventListener('hashchange',refresh);
  refresh();
  // Old shared three-level permalinks at the root remain meaningful.
  const p=new URLSearchParams(location.hash.slice(1));
  if(mode==='network'&&['system','situation','element'].includes(p.get('view'))) {
    location.replace('three-level.html'+location.search+location.hash);
  }
})();
