const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const safe = x => x.replace(/<\/script/gi, '<\\/script');
let html = read('three-level.html');
for (const file of ['explorer.css', 'view-switch.css']) {
  const link = new RegExp('<link rel="stylesheet" href="assets/css/' + file.replace('.', '\\.') + '[^>]+>');
  html = html.replace(link, () => '<style>' + read('assets/css/' + file) + '</style>');
}
// A downloaded standalone cannot navigate to a sibling file.
html = html.replaceAll('href="index.html"', 'href="https://spoonforks.github.io/TreeGovernance/"');
html = html.replaceAll('href="three-level.html"', 'href="#view=system"');
html = html.replace(/<script src="assets\/js\/view-shell.js[^<]+<\/script>/, '');
html = html.replace(/<script src="data\/model.js[^<]+<\/script>/, () => '<script>'+safe(read('data/model.js'))+'</script>\n<script>window.TREE_GOV_ARCHITECTURE='+safe(read('data/architecture.json'))+';</script>');
for (const file of ['model-core.js','shared-model.js']) {
  html = html.replace(new RegExp('<script src="assets/js/'+file.replace('.', '\\.')+'[^<]+<\\/script>'), () => '<script>'+safe(read('assets/js/'+file))+'</script>');
}
html = html.replace(/<script src="assets\/js\/launch-three-level.js[^<]+<\/script>/, () => '<script>'+safe(read('assets/js/explorer.js'))+'</script>');
const out = process.argv[2] || path.join(root,'tree-governance-standalone.html');
fs.writeFileSync(out, html);
console.log('Wrote '+out);
