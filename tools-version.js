// Stamps every stylesheet and script a page loads with a hash of its contents.
//
//   node tools-version.js           rewrite the ?v= stamps in the pages
//   node tools-version.js --check   only report stale stamps (exit code 1)
//
// GitHub Pages lets browsers keep a file for ten minutes, and phones often
// longer. A stamp that is not changed with the file means a visitor can get
// the new page with the old stylesheet or script: half a feature, broken. A
// stamp taken from the contents changes exactly when the file does.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PAGES = ['index.html', 'nivo.html', '404.html'];
const ASSET = /(href|src)="([\w.-]+\.(?:css|js))\?v=([\w]+)"/g;

const hashOf = file => crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(ROOT, file)))
  .digest('hex')
  .slice(0, 8);

const check = process.argv.includes('--check');
const stale = [];

for (const page of PAGES) {
  const pagePath = path.join(ROOT, page);
  if (!fs.existsSync(pagePath)) continue;
  const html = fs.readFileSync(pagePath, 'utf8');
  const out = html.replace(ASSET, (whole, attr, file, version) => {
    const fresh = hashOf(file);
    if (fresh !== version) stale.push(`${page}: ${file}?v=${version} (current ${fresh})`);
    return `${attr}="${file}?v=${fresh}"`;
  });
  if (!check && out !== html) fs.writeFileSync(pagePath, out);
}

if (check) {
  if (stale.length) {
    console.log('Stale asset stamps. Run: node tools-version.js\n  ' + stale.join('\n  '));
    process.exit(1);
  }
  console.log('Asset stamps are current.');
} else {
  console.log(stale.length ? 'Updated:\n  ' + stale.join('\n  ') : 'Asset stamps were already current.');
}
