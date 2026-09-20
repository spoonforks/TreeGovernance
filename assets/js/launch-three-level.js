/* Wait for the common model, then start the existing three-level renderer. */
window.TREE_GOV_READY.then(() => {
  const script=document.createElement('script');
  script.src='assets/js/explorer.js?v=0.4';
  script.onerror=()=>{document.getElementById('main').textContent='The three-level view could not be loaded. Please reload.';};
  document.body.appendChild(script);
}).catch(err => {
  document.getElementById('modelStatus').textContent='The shared model could not be loaded.';
  document.getElementById('main').textContent=err.message;
});
