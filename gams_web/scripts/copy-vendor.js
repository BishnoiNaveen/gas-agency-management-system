const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vendor = path.join(root, 'assets', 'vendor');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.mkdirSync(vendor, { recursive: true });
copyDir(
  path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free'),
  path.join(vendor, 'fontawesome')
);
copyDir(
  path.join(root, 'node_modules', '@fontsource', 'dm-sans', 'files'),
  path.join(vendor, 'dm-sans', 'files')
);
fs.copyFileSync(
  path.join(root, 'node_modules', '@fontsource', 'dm-sans', '400.css'),
  path.join(vendor, 'dm-sans', '400.css')
);
fs.copyFileSync(
  path.join(root, 'node_modules', '@fontsource', 'dm-sans', '600.css'),
  path.join(vendor, 'dm-sans', '600.css')
);
fs.copyFileSync(
  path.join(root, 'node_modules', '@fontsource', 'dm-sans', '700.css'),
  path.join(vendor, 'dm-sans', '700.css')
);
console.log('Vendor assets copied to assets/vendor/');
