const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const safe = x => x.replace(/<\/script/gi, '<\\/script');
let html = read('index.html');
for (const file of ['explorer.css', 'view-switch.css']) {
  const link = new RegExp('<link rel="stylesheet" href="assets/css/' + file.replace('.', '\\.') + '[^>]+>');
  html = html.replace(link, '<style>' + read('assets/css/' + file) + '</style>');
}
// A single-file download cannot navigate to a sibling page. Use the hosted
// network explorer; the active Three-level link stays inside this file.
html = html.replaceAll('href="legacy.html"', 'href="https://spoonforks.github.io/TreeGovernance/legacy.html"');
html = html.replaceAll('href="index.html"', 'href="#view=system"');
html = html.replace(/<script src="data\/model.js[^<]+<\/script>/, '<script>'+safe(read('data/model.js'))+'</script>\n<script>window.TREE_GOV_ARCHITECTURE='+safe(read('data/architecture.json'))+';</script>');
for (const file of ['model-core.js','explorer.js']) html = html.replace(new RegExp('<script src="assets/js/'+file.replace('.', '\\.')+'[^<]+<\\/script>'), '<script>'+safe(read('assets/js/'+file))+'</script>');
const out = process.argv[2] || path.join(root,'tree-governance-standalone.html');
fs.writeFileSync(out, html);
console.log('Wrote '+out);
