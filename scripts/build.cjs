const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
const publicFiles=['index.html','version.json'];
for(const file of fs.readdirSync(output)) {
  if(!publicFiles.includes(file))throw new Error(`Unexpected file in dist: ${file}. Build stopped to avoid publishing private files.`);
}
for (const file of publicFiles) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
console.log(`Built Print Studio ${require('../version.json').version}: index.html and version.json.`);
